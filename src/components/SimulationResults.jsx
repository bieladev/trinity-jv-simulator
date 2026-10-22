import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Tooltip,
  Collapse,
  Snackbar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ArrowBackOutlined as ArrowBackIcon,
  NorthEastOutlined as NorthEastIcon,
  SouthEastOutlined as SouthEastIcon,
  EastOutlined as EastIcon,
  InfoOutlined as InfoOutlinedIcon,
  ExpandMoreOutlined as ExpandMoreIcon,
  FileDownloadOutlined as FileDownloadOutlinedIcon,
} from '@mui/icons-material';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { calculateMetrics, generateYearlySeries, ANNUALIZED_RETURN_HELP, HOMEOWNER_RETURN_BASIS_NOTE, PARTNER_LOAN_CAPITAL_NOTE } from '../utils/calculations';
import PageHeader from './common/PageHeader';
import SectionHeading from './common/SectionHeading';
import StakeholderLabel from './common/StakeholderLabel';
import AnimatedNumber from './common/AnimatedNumber';
import Reveal from './common/Reveal';
import JumpNav, { HEADER_OFFSET } from './common/JumpNav';
import { downloadSummary } from '../utils/summaryReport';
import { motion, useReveal, revealStyle, useReducedMotion, useEnterReplay, chartAnimation } from '../utils/motion';

// Tiny trend line for a stakeholder tile. Decorative: the figures beside it
// carry the information, so it is hidden from assistive technology.
// Draws in left to right, a beat after its tile, and replays when a tile
// below the fold (stacked tiles on mobile) scrolls into view.
function Sparkline({ data, dataKey, color, index = 0 }) {
  const reduced = useReducedMotion();
  const [replayRef, replayKey] = useEnterReplay();
  return (
    <Box ref={replayRef} aria-hidden sx={{ height: 44 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart key={replayKey} data={data} margin={{ top: 4, right: 2, bottom: 2, left: 2 }}>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={color} fillOpacity={0.12} dot={false} {...chartAnimation(reduced, motion.duration.medium + index * motion.stagger)} />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

// In-page sections of the results screen (charts, comparison and the
// assumptions list are rendered by sibling components with these ids).
const RESULT_SECTIONS = [
  { id: 'results-returns', label: 'Returns' },
  { id: 'results-charts', label: 'Charts' },
  { id: 'results-comparison', label: 'Compare scenarios' },
  { id: 'results-assumptions', label: 'Assumptions used' },
];

function SimulationResults({ simulationData, scenarioName, onNavigateToInput }) {
  const [showMethod, setShowMethod] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
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
    { label: 'Final home value', value: metrics.futureValue, sub: `At year ${exitYear}` },
    { label: 'Total appreciation', value: metrics.totalAppreciation, sub: `Over ${exitYear} years` },
    { label: 'Homeowner equity', value: metrics.homeownerEquity, sub: `Return multiple ${metrics.returnMultiple.toFixed(1)}x` },
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
    <>
    <Container>
      <PageHeader
        eyebrow={`Step 3 · Results · ${getDisplayTitle()}`}
        title="Simulation results"
        description={`Each party's position at exit in year ${exitYear}, under the 50/50 partnership model.`}
        actions={
          <>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onNavigateToInput} data-testid="results-edit-button">
              Edit assumptions
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadOutlinedIcon />}
              data-testid="download-summary-button"
              onClick={() => {
                downloadSummary(simulationData, getDisplayTitle());
                setDownloaded(true);
              }}
            >
              Download summary
            </Button>
          </>
        }
      />
    </Container>

    {/* The section nav sticks for the whole results screen (charts,
        comparison and assumptions are sibling components), so its sticky
        wrapper sits outside this component's own Container. */}
    <Box sx={{ position: { md: 'sticky' }, top: { md: HEADER_OFFSET }, zIndex: 20, mb: 3 }}>
      <Container>
        <JumpNav label="Results sections" items={RESULT_SECTIONS} sx={{ position: 'static', mb: 0 }} />
      </Container>
    </Box>

    <Container>
      <Box component="section" id="results-returns" aria-labelledby="stakeholder-returns-title" sx={{ scrollMarginTop: { xs: 88, md: 136 } }}>
        <SectionHeading
          title={<span id="stakeholder-returns-title">Stakeholder returns</span>}
          sx={{ mb: 1 }}
        />
        {/* The answer comes first: the method sits behind a toggle so the
            three tiles land on the first screen, on phones too. */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="text"
            size="small"
            onClick={() => setShowMethod((v) => !v)}
            aria-expanded={showMethod}
            aria-controls="annualized-return-method"
            data-testid="annualized-return-toggle"
            endIcon={<ExpandMoreIcon sx={{ transition: `transform ${motion.duration.base}ms ${motion.easing.out}`, transform: showMethod ? 'rotate(180deg)' : 'none' }} />}
            sx={{ ml: -1, minHeight: { xs: 44, sm: 32 }, color: 'brand.primaryText' }}
          >
            How annualized return is calculated
          </Button>
          <Collapse in={showMethod} id="annualized-return-method">
            <Typography variant="body2" color="text.secondary" data-testid="annualized-return-help" sx={{ mt: 1, maxWidth: 760 }}>
              {simulationData.enableInterestIncome
                ? <>Annualized return. Homeowner: {ANNUALIZED_RETURN_HELP} {HOMEOWNER_RETURN_BASIS_NOTE} Partners: {PARTNER_LOAN_CAPITAL_NOTE}</>
                : <>Annualized return: {ANNUALIZED_RETURN_HELP} {HOMEOWNER_RETURN_BASIS_NOTE}</>}
            </Typography>
          </Collapse>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: { xs: 2, md: 3 } }}>
          {stakeholders.map((s, i) => (
            <StakeholderTile key={s.key} index={i} stakeholder={s} yearlyData={yearlyData} formatCurrency={formatCurrency} formatPercentage={formatPercentage} />
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: { xs: 2, md: 3 }, mt: 7, alignItems: 'stretch' }}>
        <Reveal index={0} component="section" aria-labelledby="key-outcomes-title" sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
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
                <Typography variant="metricSm" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>
                  <AnimatedNumber value={o.value} format={formatCurrency} />
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{o.sub}</Typography>
              </Box>
            ))}
          </Paper>
        </Reveal>

        <Reveal index={1} component="section" aria-labelledby="deal-structure-title" sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
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
        </Reveal>
      </Box>

      <Snackbar
        open={downloaded}
        autoHideDuration={6000}
        onClose={() => setDownloaded(false)}
        message="Summary downloaded as an HTML file. Open it in your browser and print to PDF if you need a PDF copy."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
    </>
  );
}

// "Big number + small delta" tile for one stakeholder.
function StakeholderTile({ stakeholder: s, index, yearlyData, formatCurrency, formatPercentage }) {
  const theme = useTheme();
  const revealRef = useReveal();
  const color = theme.palette.chart[s.key];
  const irr = Number(s.irr);
  const TrendIcon = irr > 0.05 ? NorthEastIcon : irr < -0.05 ? SouthEastIcon : EastIcon;
  const trendColor = irr > 0.05 ? 'success.main' : irr < -0.05 ? 'error.main' : 'text.secondary';

  return (
    <Paper ref={revealRef} style={revealStyle(index)} className="motion-lift" variant="outlined" component="article" aria-label={s.name} sx={{ p: { xs: 2.5, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <Typography variant="subtitle2" component="h3">
          <StakeholderLabel stakeholder={s.key}>{s.name}</StakeholderLabel>
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>{s.role}</Typography>
      </Box>

      <Typography variant="body2" color="text.secondary">{s.totalLabel}</Typography>
      <Typography variant="metric" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>
        <AnimatedNumber value={s.total} format={formatCurrency} />
      </Typography>

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
        <Sparkline data={yearlyData} dataKey={s.sparkKey} color={color} index={index} />
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