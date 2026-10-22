import React, { useMemo } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ReceiptLongOutlined as TaxIcon,
  SellOutlined as SellIcon,
  WarningAmberOutlined as DefaultIcon,
  PaymentsOutlined as FeesIcon,
  CalendarMonthOutlined as MonthlyIcon,
  ShowChartOutlined as RateIcon,
} from '@mui/icons-material';
import SectionHeading from '../common/SectionHeading';
import StakeholderLabel from '../common/StakeholderLabel';
import AnimatedNumber from '../common/AnimatedNumber';
import Reveal from '../common/Reveal';
import { motion } from '../../utils/motion';
import { scenarioPresets } from '../../utils/data/scenarios';
import { generateYearlySeries, ANNUALIZED_RETURN_HELP, HOMEOWNER_RETURN_BASIS_NOTE, PARTNER_LOAN_CAPITAL_NOTE } from '../../utils/calculations';
import { EXAMPLE_LABEL, exampleMetrics, formatCurrency, formatReturn } from './example';

// "How to read the results": what the annualized return means for each
// party (wording reused from calculations.js), what the "Exit · Year N"
// marker on the charts means, and what the model leaves out. Every
// statement here is true of src/utils/calculations.js.

const EXIT_PRESET_ID = 'earlySale';
const exitPreset = scenarioPresets[EXIT_PRESET_ID];

const NOT_INCLUDED = [
  { icon: <TaxIcon />, title: 'Taxes', body: 'No income, capital gains or property tax for any party.' },
  { icon: <SellIcon />, title: 'Transaction and selling costs', body: 'Sales and refinances happen at the full modeled home value, with no commissions or closing costs.' },
  { icon: <DefaultIcon />, title: 'Probability of default', body: 'Foreclosure is an exit you choose, not a likelihood. The foreclosure risk label in the benchmarks is a rule of thumb.' },
  { icon: <FeesIcon />, title: 'Fees', body: 'No origination, servicing, management or partnership fees.' },
  { icon: <MonthlyIcon />, title: 'Monthly cash timing for the homeowner', body: 'Mortgage payments count as housing cost, and the homeowner return is measured at exit.' },
  { icon: <RateIcon />, title: 'Year-to-year price swings', body: 'Appreciation compounds at one constant annual rate.' },
];

const W = 300;
const H = 100;

function ExitIllustration() {
  const { palette } = useTheme();
  const { paths, exitYear } = useMemo(() => {
    const series = generateYearlySeries(exitPreset.data);
    const last = series[series.length - 1];
    const max = Math.max(...series.map((p) => p.homeValue)) || 1;
    const x = (year) => (year / (last.year || 1)) * W;
    const y = (v) => H - (v / max) * (H - 8);
    const line = (k) => `M${series.map((p) => `${x(p.year).toFixed(2)},${y(p[k]).toFixed(2)}`).join('L')}`;
    return { paths: { value: line('homeValue'), equity: line('homeownerEquity') }, exitYear: last.year };
  }, []);
  const nonScaling = { vectorEffect: 'non-scaling-stroke' };

  return (
    <Box component="figure" sx={{ m: 0 }} aria-label={`Illustration: a chart from the ${exitPreset.name} preset ends at its exit year, marked Exit · Year ${exitYear}.`}>
      <Box sx={{ position: 'relative', height: 120, mt: 3 }}>
        <Box component="svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden sx={{ display: 'block', width: '100%', height: '100%', overflow: 'visible' }}>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} stroke={palette.chart.grid} strokeWidth={1} style={nonScaling} />
          ))}
          <line x1={0} x2={W} y1={H} y2={H} stroke={palette.chart.grid} strokeWidth={1} style={nonScaling} />
          <path d={paths.equity} fill="none" stroke={palette.chart.homeowner} strokeWidth={2} style={nonScaling} />
          <path d={paths.value} fill="none" stroke={palette.chart.total} strokeWidth={2} style={nonScaling} />
        </Box>
        <Reveal aria-hidden className="motion-uncover-io" sx={{ position: 'absolute', inset: '-2px -2px -2px -1px', bgcolor: 'background.paper', pointerEvents: 'none' }} />
        <Box aria-hidden sx={{ position: 'absolute', top: -12, bottom: 0, right: 0, borderRight: '1px dashed', borderColor: 'chart.marker' }} />
        <Reveal
          aria-hidden
          style={{ '--motion-delay': `${motion.duration.draw}ms` }}
          sx={{ position: 'absolute', top: -20, right: 8, px: 1, py: 0.25, bgcolor: 'brand.surfaceElevated', border: '1px solid', borderColor: 'chart.marker', borderRadius: '2px', typography: 'caption', fontWeight: 600, lineHeight: 1.5 }}
        >
          Exit · Year {exitYear}
        </Reveal>
      </Box>
      <Box aria-hidden sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
        <Typography variant="caption" color="text.secondary">Year 0 · purchase</Typography>
        <Typography variant="caption" color="text.secondary">Year {exitYear}</Typography>
      </Box>
      <Box component="figcaption" sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 2.5, rowGap: 0.5, mt: 1.5 }}>
        <Typography variant="caption" color="text.secondary">Example: {exitPreset.name} preset</Typography>
        <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          <Box component="span" aria-hidden sx={{ width: 14, height: 2, bgcolor: 'chart.total' }} /> Total home value
        </Typography>
        <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          <Box component="span" aria-hidden sx={{ width: 14, height: 2, bgcolor: 'chart.homeowner' }} /> Homeowner equity
        </Typography>
      </Box>
    </Box>
  );
}

const cardSx = { bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '6px', boxShadow: 2, p: { xs: 2.5, md: 3 } };

function ReturnCard({ index, labels, title, rate, rateLabel, example, children }) {
  return (
    <Reveal index={index} className="motion-lift" sx={{ ...cardSx, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1.5 }}>
        {labels.map((l) => (
          <Typography key={l.key} variant="subtitle2" component="p">
            <StakeholderLabel stakeholder={l.key}>{l.name}</StakeholderLabel>
          </Typography>
        ))}
      </Box>
      <Typography variant="h4" component="h3">{title}</Typography>
      <Box sx={{ mt: 1.5, display: 'grid', gap: 1.25 }}>{children}</Box>
      <Box sx={{ mt: 'auto', pt: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, pt: 2, borderTop: '1px solid', borderColor: 'divider', flexWrap: 'wrap' }}>
          <Typography variant="metricSm" component="p">
            <AnimatedNumber value={rate} format={formatReturn} />
          </Typography>
          <Typography variant="body2" color="text.secondary">{rateLabel}</Typography>
        </Box>
        <Typography variant="caption" component="p" color="text.secondary" sx={{ mt: 0.5 }}>{example}</Typography>
      </Box>
    </Reveal>
  );
}

function ReadingResults() {
  const m = exampleMetrics;
  const exit = m.effectiveSaleYear;
  return (
    <Box component="section" aria-labelledby="reading-results-title" sx={{ mt: 7, py: 7, bgcolor: 'brand.surfaceMuted', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', scrollMarginTop: 64 }}>
      <Container>
        <SectionHeading
          eyebrow="How to read the results"
          title={<span id="reading-results-title">What the annualized return means for each party</span>}
          description="Every results screen shows each party's profit and an annualized return. The homeowner and the partners are measured on different bases, so read each rate against that party's own capital."
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
          <ReturnCard
            index={0}
            labels={[{ key: 'homeowner', name: 'Homeowner' }]}
            title="Endpoint return on the down payment"
            rate={m.homeownerIRR}
            rateLabel="a year, homeowner"
            example={`${EXAMPLE_LABEL}: a ${formatCurrency(m.downPayment)} down payment grows to ${formatCurrency(m.homeownerEquity)} of equity by year ${exit}.`}
          >
            <Typography variant="body2" color="text.secondary">{ANNUALIZED_RETURN_HELP}</Typography>
            <Typography variant="body2" color="text.secondary">{HOMEOWNER_RETURN_BASIS_NOTE}</Typography>
          </ReturnCard>
          <ReturnCard
            index={1}
            labels={[{ key: 'drHorton', name: 'DR Horton' }, { key: 'berkshire', name: 'Berkshire' }]}
            title="Cash-flow IRR on the cost share and the loan"
            rate={m.berkshireIRR}
            rateLabel="a year, each partner"
            example={`${EXAMPLE_LABEL}: each partner puts in ${formatCurrency(m.berkshireCostShare)} of cost share, funds ${formatCurrency(m.berkshireLoanFunding)} of the mortgage and makes ${formatCurrency(m.berkshireTotalReturn)} of profit.`}
          >
            <Typography variant="body2" color="text.secondary">{PARTNER_LOAN_CAPITAL_NOTE}</Typography>
            <Typography variant="body2" color="text.secondary">
              With interest income off, it is an endpoint return on the cost share. {ANNUALIZED_RETURN_HELP}
            </Typography>
          </ReturnCard>
        </Box>

        <Box sx={{ mt: 1.5, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' }, gap: 1.5, alignItems: 'stretch' }}>
          <Reveal className="motion-lift" sx={cardSx}>
            <Typography variant="h4" component="h3">“Exit · Year N” on the charts</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Charts run from year 0, the purchase, to the exit year: the sale year you set, or the early sale or mortgage payoff year when that option is on. The dashed line marks that year, and the last point on each chart equals the headline figures. A cash-out refinance does not end the hold.
            </Typography>
            <ExitIllustration />
          </Reveal>

          <Reveal index={1} component="aside" aria-labelledby="not-included-title" sx={{ ...cardSx, borderTop: '3px solid', borderTopColor: 'brand.accent' }}>
            <Typography variant="h4" component="h3" id="not-included-title">What the model does not include</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Treat the results as a comparison of deal structures, not a forecast of cash in hand.
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', m: 0, mt: 2.5, p: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, columnGap: 3, rowGap: 2 }}>
              {NOT_INCLUDED.map((item, i) => (
                <Reveal component="li" index={i} key={item.title} sx={{ display: 'grid', gridTemplateColumns: '24px minmax(0, 1fr)', columnGap: 1.25 }}>
                  <Box aria-hidden sx={{ color: 'text.secondary', display: 'flex', pt: '2px', '& svg': { fontSize: 20 } }}>{item.icon}</Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" component="p">{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{item.body}</Typography>
                  </Box>
                </Reveal>
              ))}
            </Box>
          </Reveal>
        </Box>
      </Container>
    </Box>
  );
}

export default ReadingResults;
