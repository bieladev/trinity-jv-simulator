import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ArrowBackOutlined as ArrowBackIcon,
  NorthEastOutlined as NorthEastIcon,
  SouthEastOutlined as SouthEastIcon,
  EastOutlined as EastIcon,
  InfoOutlined as InfoOutlinedIcon,
} from '@mui/icons-material';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { calculateMetrics, generateYearlySeries, ANNUALIZED_RETURN_HELP, HOMEOWNER_RETURN_BASIS_NOTE, PARTNER_LOAN_CAPITAL_NOTE } from '../utils/calculations';
import PageHeader from './common/PageHeader';
import SectionHeading from './common/SectionHeading';
import StakeholderLabel from './common/StakeholderLabel';

// Tiny trend line for a stakeholder tile. Decorative: the figures beside it
// carry the information, so it is hidden from assistive technology.
function Sparkline({ data, dataKey, color }) {
  return (
    <Box aria-hidden sx={{ height: 44 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 2, bottom: 2, left: 2 }}>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={color} fillOpacity={0.12} isAnimationActive={false} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

function SimulationResults({ simulationData, scenarioName, onNavigateToInput }) {
  if (!simulationData) {
    return null;
  }

  const formatCurrency = (value) => {
    if (isNaN(value) || value === null) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value) => {
    if (isNaN(value) || value === null) return '0.0%';
    return `${value.toFixed(1)}%`;
  };

  const metrics = calculateMetrics(simulationData);

  const getDisplayTitle = () => {
    if (scenarioName) return scenarioName;
    if (simulationData.enableCashOutRefi) return "Cash-Out Refinance Scenario";
    if (simulationData.enableEarlyAction) return `Early ${simulationData.earlyActionType} at Year ${simulationData.earlyActionYear}`;
    if (simulationData.enableRecurringRevenue) return "Recurring Revenue Model";
    return "Custom Simulation Results";
  };

  const exitYear = metrics.effectiveSaleYear;
  const yearlyData = generateYearlySeries(simulationData);
  const sparkCaptionYears = `years 0–${Number.isInteger(exitYear) ? exitYear : exitYear.toFixed(1)}`;
  // Partner capital includes their share of the loan when they are the lender.
  const partnerHelp = simulationData.enableInterestIncome ? PARTNER_LOAN_CAPITAL_NOTE : ANNUALIZED_RETURN_HELP;
  const partnerCapitalLabel = simulationData.enableInterestIncome ? 'Capital (cost share + loan funded)' : 'Cost share';
  const partnerSparkCaption = metrics.refiOccurred
    ? `Appreciation share plus refi cash-out by year, ${sparkCaptionYears}`
    : `Appreciation share by year, ${sparkCaptionYears}`;

  const outcomes = [
    { label: 'Final home value', value: formatCurrency(metrics.futureValue), sub: `At year ${exitYear}` },
    { label: 'Total appreciation', value: formatCurrency(metrics.totalAppreciation), sub: `Over ${exitYear} years` },
    { label: 'Homeowner equity', value: formatCurrency(metrics.homeownerEquity), sub: `Return multiple ${metrics.returnMultiple.toFixed(1)}x` },
  ];

  const dealTerms = [
    { label: 'Total project cost', value: formatCurrency(metrics.totalProjectCost) },
    { label: 'DR Horton cost share', value: formatCurrency(metrics.drHortonCostShare) },
    { label: 'Berkshire cost share', value: formatCurrency(metrics.berkshireCostShare) },
    {
      label: 'Appreciation split',
      hint: 'Homeowner / DR Horton / Berkshire',
      value: `${metrics.homeownerAppreciationShare.toFixed(1)}% / ${metrics.drHortonAppreciationShare.toFixed(1)}% / ${metrics.berkshireAppreciationShare.toFixed(1)}%`,
    },
    simulationData.enableInterestIncome && {
      label: 'Interest income split',
      hint: 'Berkshire / DR Horton',
      value: `${simulationData.interestSplitBerkshire}% / ${simulationData.interestSplitDrHorton}%`,
    },
  ].filter(Boolean);

  const stakeholders = [
    {
      key: 'homeowner',
      name: 'Homeowner',
      role: 'Resident owner',
      totalLabel: 'Total equity at exit',
      total: metrics.homeownerEquity,
      irr: metrics.homeownerIRR,
      testId: 'homeowner-annualized-return',
      help: `${ANNUALIZED_RETURN_HELP} ${HOMEOWNER_RETURN_BASIS_NOTE}`,
      capitalLabel: 'Initial investment',
      capital: metrics.downPayment,
      sparkKey: 'homeownerEquity',
      sparkCaption: `Equity by year, ${sparkCaptionYears}`,
      breakdown: [
        { label: 'Principal paid', value: metrics.principalPaidDown },
        { label: 'Appreciation share', value: metrics.homeownerAppreciation },
        metrics.refiOccurred && { label: `Refi cash-out received (year ${metrics.refiYear})`, value: metrics.homeownerCashOut },
        metrics.refiOccurred && { label: 'Refi debt added', value: -metrics.cashOut },
      ].filter(Boolean),
    },
    {
      key: 'drHorton',
      name: 'DR Horton',
      role: '50% partner',
      totalLabel: 'Total return',
      total: metrics.drHortonTotalReturn,
      irr: metrics.drHortonIRR,
      testId: 'drhorton-annualized-return',
      help: partnerHelp,
      capitalLabel: partnerCapitalLabel,
      capital: metrics.drHortonCapitalBase,
      sparkKey: 'drHortonShare',
      sparkCaption: partnerSparkCaption,
      breakdown: [
        { label: 'Appreciation share', value: metrics.drHortonAppreciation },
        simulationData.enableInterestIncome && { label: 'Interest income', value: metrics.drHortonInterestIncome },
        metrics.refiOccurred && { label: 'Refi cash-out', value: metrics.drHortonCashOut },
        simulationData.enableRecurringRevenue && { label: 'Recurring resale profit', value: metrics.drHortonRecurringProfit },
      ].filter(Boolean),
    },
    {
      key: 'berkshire',
      name: 'Berkshire Hathaway',
      role: '50% partner',
      totalLabel: 'Total return',
      total: metrics.berkshireTotalReturn,
      irr: metrics.berkshireIRR,
      testId: 'berkshire-annualized-return',
      help: partnerHelp,
      capitalLabel: partnerCapitalLabel,
      capital: metrics.berkshireCapitalBase,
      sparkKey: 'berkshireShare',
      sparkCaption: partnerSparkCaption,
      breakdown: [
        { label: 'Appreciation share', value: metrics.berkshireAppreciation },
        simulationData.enableInterestIncome && { label: 'Interest income', value: metrics.berkshireInterestIncome },
        metrics.refiOccurred && { label: 'Refi cash-out', value: metrics.berkshireCashOut },
        simulationData.enableRecurringRevenue && { label: 'Recurring resale profit', value: metrics.berkshireRecurringProfit },
      ].filter(Boolean),
    },
  ];

  return (
    <Container>
      <PageHeader
        eyebrow={`Step 3 · Results · ${getDisplayTitle()}`}
        title="Simulation results"
        description={`Each party's position at exit in year ${exitYear}, under the 50/50 partnership model.`}
        actions={
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onNavigateToInput}>
            Edit assumptions
          </Button>
        }
      />

      <Box component="section" aria-labelledby="stakeholder-returns-title">
        <SectionHeading
          title={<span id="stakeholder-returns-title">Stakeholder returns</span>}
          description={
            <span data-testid="annualized-return-help">
              {simulationData.enableInterestIncome
                ? <>Annualized return. Homeowner: {ANNUALIZED_RETURN_HELP} {HOMEOWNER_RETURN_BASIS_NOTE} Partners: {PARTNER_LOAN_CAPITAL_NOTE}</>
                : <>Annualized return: {ANNUALIZED_RETURN_HELP} {HOMEOWNER_RETURN_BASIS_NOTE}</>}
            </span>
          }
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: { xs: 2, md: 3 } }}>
          {stakeholders.map((s) => (
            <StakeholderTile key={s.key} stakeholder={s} yearlyData={yearlyData} formatCurrency={formatCurrency} formatPercentage={formatPercentage} />
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: { xs: 2, md: 3 }, mt: 7, alignItems: 'stretch' }}>
        <Box component="section" aria-labelledby="key-outcomes-title" sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Typography variant="h4" component="h2" id="key-outcomes-title" sx={{ mb: 2 }}>Key outcomes</Typography>
          <Paper variant="outlined" sx={{ flex: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)', lg: '1fr' }, alignContent: 'stretch' }}>
            {outcomes.map((o, i) => (
              <Box
                key={o.label}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderStyle: 'solid', borderWidth: { xs: i === 0 ? 0 : '1px 0 0 0', sm: i === 0 ? 0 : '0 0 0 1px', lg: i === 0 ? 0 : '1px 0 0 0' },
                  borderColor: 'divider',
                  minWidth: 0,
                  // lg: stacked rows that share the Deal structure column's height
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                }}
              >
                <Typography variant="overline" component="p" color="text.secondary">{o.label}</Typography>
                <Typography variant="metricSm" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>{o.value}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{o.sub}</Typography>
              </Box>
            ))}
          </Paper>
        </Box>

        <Box component="section" aria-labelledby="deal-structure-title" sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Typography variant="h4" component="h2" id="deal-structure-title" sx={{ mb: 2 }}>Deal structure</Typography>
          <Paper variant="outlined" component="dl" sx={{ m: 0, flex: 1, px: { xs: 2.5, md: 3 }, py: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
            {dealTerms.map((row, i) => (
              <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2, py: 1.25, borderTop: i === 0 ? 'none' : '1px solid', borderColor: 'divider' }}>
                <Box component="dt" sx={{ minWidth: 0 }}>
                  <Typography variant="body2" color="text.secondary" component="span">{row.label}</Typography>
                  {row.hint && <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block' }}>{row.hint}</Typography>}
                </Box>
                <Typography component="dd" variant="body2" sx={{ m: 0, fontWeight: 600, fontVariantNumeric: 'tabular-nums', textAlign: 'right', whiteSpace: 'nowrap' }}>{row.value}</Typography>
              </Box>
            ))}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}

// "Big number + small delta" tile for one stakeholder.
function StakeholderTile({ stakeholder: s, yearlyData, formatCurrency, formatPercentage }) {
  const theme = useTheme();
  const color = theme.palette.chart[s.key];
  const irr = Number(s.irr);
  const TrendIcon = irr > 0.05 ? NorthEastIcon : irr < -0.05 ? SouthEastIcon : EastIcon;
  const trendColor = irr > 0.05 ? 'success.main' : irr < -0.05 ? 'error.main' : 'text.secondary';

  return (
    <Paper variant="outlined" component="article" aria-label={s.name} sx={{ p: { xs: 2.5, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <Typography variant="subtitle2" component="h3">
          <StakeholderLabel stakeholder={s.key}>{s.name}</StakeholderLabel>
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>{s.role}</Typography>
      </Box>

      <Typography variant="body2" color="text.secondary">{s.totalLabel}</Typography>
      <Typography variant="metric" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>{formatCurrency(s.total)}</Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.25 }}>
        <TrendIcon sx={{ fontSize: 18, color: trendColor }} aria-hidden />
        <Typography variant="body1" data-testid={s.testId} sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          Annualized return: {formatPercentage(s.irr)}
        </Typography>
        <Tooltip title={s.help}>
          <Box component="span" tabIndex={0} aria-label="How annualized return is calculated" sx={{ display: 'inline-flex', color: 'text.secondary', cursor: 'help', borderRadius: '2px' }}>
            <InfoOutlinedIcon sx={{ fontSize: 16 }} />
          </Box>
        </Tooltip>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontVariantNumeric: 'tabular-nums' }}>
        {s.capitalLabel} {formatCurrency(s.capital)}
      </Typography>

      <Box sx={{ mt: 2.5 }}>
        <Sparkline data={yearlyData} dataKey={s.sparkKey} color={color} />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>{s.sparkCaption}</Typography>
      </Box>

      <Box component="dl" sx={{ m: 0, mt: 'auto', pt: 2 }}>
        {s.breakdown.map((row) => (
          <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography component="dt" variant="body2" color="text.secondary">{row.label}</Typography>
            <Typography component="dd" variant="body2" sx={{ m: 0, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(row.value)}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

export default SimulationResults;