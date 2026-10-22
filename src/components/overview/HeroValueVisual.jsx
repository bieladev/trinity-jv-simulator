import React, { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AnimatedNumber from '../common/AnimatedNumber';
import StakeholderLabel from '../common/StakeholderLabel';
import { motion, revealStyle } from '../../utils/motion';
import { EXAMPLE_LABEL, exampleInputs, exampleMetrics, exampleSeries, formatCurrency, formatPercent } from './example';

// Hero visual: the Standard preset's home value from purchase to exit, with
// the appreciation stacked by party (same entity colours as the results
// charts). Above the fold, so every movement is a CSS keyframe that plays on
// first paint: the plot is uncovered left to right (a transform-only
// curtain), the value counts up and the legend rises in.
const W = 300;
const H = 100;

const buildBands = (series) => {
  const maxValue = series[series.length - 1].homeValue || 1;
  const exitYear = series[series.length - 1].year || 1;
  const x = (year) => (year / exitYear) * W;
  const y = (v) => H - (v / maxValue) * (H - 6);
  // Cumulative levels: purchase price, + homeowner, + DR Horton, + Berkshire.
  const levels = series.map((p) => {
    const price = p.homeValue - p.totalAppreciation;
    const homeowner = p.totalAppreciation - p.drHortonShare - p.berkshireShare;
    return [0, price, price + homeowner, price + homeowner + p.drHortonShare, p.homeValue];
  });
  const area = (lo, hi) => {
    const top = series.map((p, i) => `${x(p.year).toFixed(2)},${y(levels[i][hi]).toFixed(2)}`);
    const bottom = series.map((p, i) => `${x(p.year).toFixed(2)},${y(levels[i][lo]).toFixed(2)}`).reverse();
    return `M${top.join('L')}L${bottom.join('L')}Z`;
  };
  const line = (k) => `M${series.map((p, i) => `${x(p.year).toFixed(2)},${y(levels[i][k]).toFixed(2)}`).join('L')}`;
  return { price: area(0, 1), homeowner: area(1, 2), drHorton: area(2, 3), berkshire: area(3, 4), top: line(4), priceLine: line(1) };
};

function HeroValueVisual() {
  const { palette } = useTheme();
  const bands = useMemo(() => buildBands(exampleSeries), []);
  const m = exampleMetrics;
  const exitYear = m.effectiveSaleYear;
  const nonScaling = { vectorEffect: 'non-scaling-stroke' };

  const legend = [
    { key: 'homeowner', name: 'Homeowner', share: m.homeownerAppreciationShare, amount: m.homeownerAppreciation },
    { key: 'drHorton', name: 'DR Horton', share: m.drHortonAppreciationShare, amount: m.drHortonAppreciation },
    { key: 'berkshire', name: 'Berkshire', share: m.berkshireAppreciationShare, amount: m.berkshireAppreciation },
  ];

  return (
    <Paper
      component="figure"
      variant="outlined"
      className="motion-rise"
      style={revealStyle(2)}
      aria-label={`${EXAMPLE_LABEL}. Home value grows from ${formatCurrency(m.homePurchasePrice)} at purchase to ${formatCurrency(m.futureValue)} at exit in year ${exitYear}.`}
      sx={{ m: 0, p: { xs: 2, md: 3 }, boxShadow: 2 }}
    >
      <Typography variant="overline" component="p" color="text.secondary">
        {EXAMPLE_LABEL}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">Home value at exit</Typography>
          <Typography variant="metricSm" component="p" sx={{ mt: 0.25 }}>
            <AnimatedNumber value={m.futureValue} from={m.homePurchasePrice} format={formatCurrency} duration={motion.duration.draw} delay={motion.stagger * 3} />
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
          {formatCurrency(m.homePurchasePrice)} at purchase
          <br />
          {formatPercent(exampleInputs.annualAppreciationRate)} a year for {exitYear} years
        </Typography>
      </Box>

      {/* Plot */}
      <Box sx={{ position: 'relative', height: { xs: 120, md: 150 }, mt: 2.5 }}>
        <Box component="svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden sx={{ display: 'block', width: '100%', height: '100%', overflow: 'visible' }}>
          <path d={bands.price} fill={palette.brand.surfaceMuted} />
          <path d={bands.homeowner} fill={palette.chart.homeowner} stroke={palette.background.paper} strokeWidth={1} style={nonScaling} />
          <path d={bands.drHorton} fill={palette.chart.drHorton} stroke={palette.background.paper} strokeWidth={1} style={nonScaling} />
          <path d={bands.berkshire} fill={palette.chart.berkshire} stroke={palette.background.paper} strokeWidth={1} style={nonScaling} />
          <path d={bands.priceLine} fill="none" stroke={palette.chart.marker} strokeWidth={1} strokeDasharray="3 3" style={nonScaling} />
          <path d={bands.top} fill="none" stroke={palette.chart.total} strokeWidth={1.5} style={nonScaling} />
        </Box>
        {/* Curtain in the card colour that slides off to the right. */}
        <Box className="motion-uncover" style={revealStyle(3)} aria-hidden sx={{ position: 'absolute', inset: '-2px -2px -2px -1px', bgcolor: 'background.paper', pointerEvents: 'none' }} />
        {/* Exit marker, the same convention as the results charts. */}
        <Box aria-hidden sx={{ position: 'absolute', top: -8, bottom: 0, right: 0, borderRight: '1px dashed', borderColor: 'chart.marker' }} />
        <Box
          aria-hidden
          className="motion-chart-marker"
          sx={{ position: 'absolute', top: -14, right: 8, px: 1, py: 0.25, bgcolor: 'brand.surfaceElevated', border: '1px solid', borderColor: 'chart.marker', borderRadius: '2px', typography: 'caption', fontWeight: 600, lineHeight: 1.5 }}
        >
          Exit · Year {exitYear}
        </Box>
        <Typography
          aria-hidden
          variant="caption"
          color="text.secondary"
          sx={{ position: 'absolute', left: 8, bottom: 6, lineHeight: 1.2 }}
        >
          Purchase price
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }} aria-hidden>
        <Typography variant="caption" color="text.secondary">Year 0</Typography>
        <Typography variant="caption" color="text.secondary">Year {exitYear}</Typography>
      </Box>

      {/* Legend: appreciation share at exit */}
      <Box component="figcaption" sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" component="p" color="text.secondary" sx={{ mb: 1 }}>
          Appreciation of {formatCurrency(m.totalAppreciation)}, split at exit
        </Typography>
        <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto auto', columnGap: 2, rowGap: 0.75, alignItems: 'baseline' }}>
          {legend.map((row, i) => (
            <React.Fragment key={row.key}>
              <Box component="dt" className="motion-rise" style={revealStyle(4 + i)} sx={{ typography: 'body2', minWidth: 0 }}>
                <StakeholderLabel stakeholder={row.key}>{row.name}</StakeholderLabel>
              </Box>
              <Box component="dd" className="motion-rise" style={revealStyle(4 + i)} sx={{ m: 0, typography: 'body2', color: 'text.secondary', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {formatPercent(row.share)}
              </Box>
              <Box component="dd" className="motion-rise" style={revealStyle(4 + i)} sx={{ m: 0, typography: 'body2', fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                <AnimatedNumber value={row.amount} format={formatCurrency} duration={motion.duration.draw} delay={motion.stagger * 3} />
              </Box>
            </React.Fragment>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

export default HeroValueVisual;
