import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { InsightsOutlined as InsightsOutlinedIcon } from '@mui/icons-material';
import {
  LineChart,
  Line,
  ComposedChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from 'recharts';
import { calculateMetrics, generateYearlySeries } from '../utils/calculations';
import SectionHeading from './common/SectionHeading';
import Note from './common/Note';
import {
  useChartStyles,
  yearAxisProps as buildYearAxisProps,
  ExitMarkerLabel,
  ChartTooltip,
  formatAxisCurrency,
  legendPayload,
} from './charts/chartKit';

function ChartCard({ title, subtitle, children, fill = false, ...rest }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, height: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }} {...rest}>
      <Typography variant="h5" component="h3">{title}</Typography>
      {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
      {/* fill: the plot grows to the card's height when a taller sibling sets the row */}
      <Box sx={{ mt: 3, ...(fill && { flex: 1, minHeight: 300 }) }}>{children}</Box>
    </Paper>
  );
}

function ChartsPanel({ simulationData, scenarioName, onNavigateToInput }) {
  const [chartView, setChartView] = useState('equity');
  const theme = useTheme();
  const cs = useChartStyles();

  if (!simulationData) {
    return (
      <Container component="section" sx={{ mt: 7 }}>
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 6 }, textAlign: 'center' }}>
          <InsightsOutlinedIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 2 }} aria-hidden />
          <Typography variant="h4" component="h2">No charts yet</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 520, mx: 'auto' }}>
            Run a simulation to see the year-by-year timeline to exit, home value and equity growth, each party's return and the loan balance.
          </Typography>
          <Button variant="contained" sx={{ mt: 3 }} onClick={() => onNavigateToInput && onNavigateToInput()}>
            Set assumptions
          </Button>
        </Paper>
      </Container>
    );
  }

  const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  const metrics = calculateMetrics(simulationData);

  // Same model as the headline metrics: the series ends at the scenario's
  // exit year and its final point equals calculateMetrics() exactly.
  const yearlyData = generateYearlySeries(simulationData);
  const exitYear = metrics.effectiveSaleYear;
  const exitLabel = `Exit · Year ${exitYear}`;
  const yearAxisProps = buildYearAxisProps(exitYear);
  const exitMarker = (
    <ReferenceLine
      x={exitYear}
      stroke={cs.palette.marker}
      strokeDasharray="4 4"
      ifOverflow="extendDomain"
      label={<ExitMarkerLabel value={exitLabel} />}
    />
  );
  const surface = theme.palette.background.paper;
  // With a cash-out refi the partner series also include the cash-out received.
  const drHortonSeriesName = metrics.refiOccurred ? 'DR Horton share (incl. refi cash-out)' : 'DR Horton appreciation';
  const berkshireSeriesName = metrics.refiOccurred ? 'Berkshire share (incl. refi cash-out)' : 'Berkshire appreciation';
  const plotMargin = { top: 40, right: 12, bottom: 0, left: 0 };
  const equityLegend = legendPayload([
    { key: 'homeownerEquity', name: 'Homeowner equity', color: cs.palette.homeowner },
    { key: 'drHortonShare', name: drHortonSeriesName, color: cs.palette.drHorton },
    { key: 'berkshireShare', name: berkshireSeriesName, color: cs.palette.berkshire },
    { key: 'homeValue', name: 'Total home value', color: cs.palette.total, type: 'line' },
  ]);
  const loanLegend = legendPayload([
    { key: 'principalPaid', name: 'Principal paid', color: cs.palette.homeowner, type: 'line' },
    { key: 'remainingBalance', name: 'Remaining balance', color: cs.palette.total, type: 'line' },
  ]);

  const stakeholderData = [
    { key: 'homeowner', name: 'Homeowner', share: metrics.homeownerAppreciationShare, value: metrics.homeownerEquity, color: cs.palette.homeowner },
    { key: 'drHorton', name: 'DR Horton', share: metrics.drHortonAppreciationShare, value: metrics.drHortonTotalReturn, color: cs.palette.drHorton },
    { key: 'berkshire', name: 'Berkshire', share: metrics.berkshireAppreciationShare, value: metrics.berkshireTotalReturn, color: cs.palette.berkshire },
  ];
  const stakeholderSum = stakeholderData.reduce((acc, d) => acc + d.value, 0);
  // Pie angles are meaningless when any party's return is negative — guard against it.
  const pieInvalid = stakeholderData.some((d) => d.value <= 0);

  const getTitle = () => scenarioName || "Custom Simulation";

  return (
    <Container component="section" aria-labelledby="charts-title" sx={{ mt: 7 }}>
      <SectionHeading
        eyebrow="Charts"
        title={<span id="charts-title">Growth, returns and loan balance to exit</span>}
        description={`${getTitle()}: a ${exitYear}-year view of equity growth, stakeholder returns and the mortgage under the 50/50 partnership model.`}
      />

      <Tabs
        value={chartView}
        onChange={(e, v) => v && setChartView(v)}
        variant="scrollable"
        scrollButtons={false}
        aria-label="Chart view"
        sx={{ mb: 3 }}
      >
        <Tab value="equity" label="Equity growth" />
        <Tab value="distribution" label="Return split" />
        <Tab value="cashflow" label="Loan balance" data-testid="chart-view-cashflow" />
      </Tabs>

      {chartView === 'equity' && (
        <ChartCard
          data-testid="chart-equity"
          title={`${exitYear}-year equity growth timeline`}
          subtitle="Homeowner equity and each partner's appreciation share, stacked, against total home value."
        >
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart data={yearlyData} margin={plotMargin}>
              <CartesianGrid {...cs.grid} />
              <XAxis {...yearAxisProps} {...cs.xAxis} />
              <YAxis tickFormatter={formatAxisCurrency} {...cs.yAxis} />
              <Tooltip content={<ChartTooltip colors={{ homeownerEquity: cs.palette.homeowner, drHortonShare: cs.palette.drHorton, berkshireShare: cs.palette.berkshire }} />} cursor={cs.cursor} />
              <Legend {...cs.legend} payload={equityLegend} />
              <Area type="monotone" dataKey="homeownerEquity" stackId="1" stroke={surface} strokeWidth={1.5} fill={cs.palette.homeowner} fillOpacity={0.9} name="Homeowner equity" />
              <Area type="monotone" dataKey="drHortonShare" stackId="1" stroke={surface} strokeWidth={1.5} fill={cs.palette.drHorton} fillOpacity={0.9} name={drHortonSeriesName} />
              <Area type="monotone" dataKey="berkshireShare" stackId="1" stroke={surface} strokeWidth={1.5} fill={cs.palette.berkshire} fillOpacity={0.9} name={berkshireSeriesName} />
              <Line type="monotone" dataKey="homeValue" stroke={cs.palette.total} strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: surface, strokeWidth: 2 }} name="Total home value" />
              {exitMarker}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {chartView === 'distribution' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2, md: 3 } }}>
          <ChartCard
            data-testid="chart-return-share"
            title="Share of total returns at exit"
            subtitle="Homeowner equity and each partner's total return, as a share of the three combined."
          >
            {pieInvalid ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center', fontStyle: 'italic' }}>
                Shares aren&apos;t meaningful when a party&apos;s return is negative — see the bar chart.
              </Typography>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={stakeholderData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="58%" outerRadius="88%" paddingAngle={1} stroke={surface} strokeWidth={2} isAnimationActive={false}>
                    {stakeholderData.map((entry) => (<Cell key={entry.key} fill={entry.color} />))}
                  </Pie>
                  <Tooltip content={<ChartTooltip labelFormatter={(l, payload) => payload?.[0]?.name || ''} />} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <Box component="ul" sx={{ listStyle: 'none', m: 0, mt: 2, p: 0 }}>
              {stakeholderData.map((d) => (
                <Box component="li" key={d.key} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: d.color, flexShrink: 0 }} aria-hidden />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{d.share.toFixed(1)}% appreciation share</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                      {pieInvalid ? '—' : (stakeholderSum ? `${((d.value / stakeholderSum) * 100).toFixed(0)}%` : '—')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(d.value)}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </ChartCard>

          <ChartCard fill title="Stakeholder returns" subtitle="Homeowner equity and each partner's total return at exit.">
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <BarChart data={stakeholderData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid {...cs.grid} />
                <XAxis dataKey="name" {...cs.xAxis} interval={0} />
                <YAxis tickFormatter={formatAxisCurrency} {...cs.yAxis} />
                <Tooltip content={<ChartTooltip labelFormatter={(l) => l} />} cursor={cs.barCursor} />
                <Bar dataKey="value" name="At exit" radius={[4, 4, 0, 0]} maxBarSize={64} isAnimationActive={false}>
                  {stakeholderData.map((entry) => (<Cell key={entry.key} fill={entry.color} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Box>
      )}

      {chartView === 'cashflow' && (
        <ChartCard
          data-testid="chart-cashflow"
          title="Principal paydown vs. remaining balance"
          subtitle="Cumulative principal the homeowner has repaid, and the mortgage balance still outstanding."
        >
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={yearlyData} margin={plotMargin}>
              <CartesianGrid {...cs.grid} />
              <XAxis {...yearAxisProps} {...cs.xAxis} />
              <YAxis tickFormatter={formatAxisCurrency} {...cs.yAxis} />
              <Tooltip content={<ChartTooltip />} cursor={cs.cursor} />
              <Legend {...cs.legend} payload={loanLegend} />
              <Line type="monotone" dataKey="principalPaid" stroke={cs.palette.homeowner} strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: surface, strokeWidth: 2 }} name="Principal paid" animationDuration={800} />
              <Line type="monotone" dataKey="remainingBalance" stroke={cs.palette.total} strokeWidth={2} strokeDasharray="6 4" dot={false} activeDot={{ r: 4, stroke: surface, strokeWidth: 2 }} name="Remaining balance" animationDuration={800} />
              {exitMarker}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      <Note title="50/50 partnership cash flow." sx={{ mt: 3 }}>
        DR Horton receives {formatCurrency(metrics.drHortonCashInflow)} immediately at Year 0 (home purchase) via the homeowner's mortgage for construction costs. Total project cost of {formatCurrency(metrics.totalProjectCost)} is shared equally: DR Horton {formatCurrency(metrics.drHortonCostShare)}, Berkshire {formatCurrency(metrics.berkshireCostShare)}.
      </Note>
    </Container>
  );
}

export default ChartsPanel;
