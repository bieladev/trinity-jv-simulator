import React, { useDeferredValue, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { calculateMetrics } from '../../utils/calculations';
import AnimatedNumber from '../common/AnimatedNumber';
import StakeholderLabel from '../common/StakeholderLabel';
import { motion } from '../../utils/motion';

// Same formatters as the Results screen, so the preview and the results
// always show identical strings for the same assumptions.
const formatCurrency = (value) => {
  if (isNaN(value) || value === null) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};
const formatPercentage = (value) => {
  if (isNaN(value) || value === null) return '0.0%';
  return `${Number(value).toFixed(1)}%`;
};

// Compact live answer for the assumptions screen: each party's total at exit
// and annualized return, recalculated as the inputs change. Lives in the
// sticky action bar so it is always in view while editing.
function LivePreview({ formData }) {
  // Deferred: typing and slider drags stay responsive; the figures follow.
  const deferred = useDeferredValue(formData);
  const m = useMemo(() => calculateMetrics(deferred), [deferred]);
  const exitYear = m.effectiveSaleYear;
  const yearLabel = Number.isFinite(exitYear) ? exitYear : '–';

  const parties = [
    { key: 'homeowner', name: 'Homeowner', total: m.homeownerEquity, irr: m.homeownerIRR },
    { key: 'drHorton', name: 'DR Horton', total: m.drHortonTotalReturn, irr: m.drHortonIRR },
    { key: 'berkshire', name: 'Berkshire', total: m.berkshireTotalReturn, irr: m.berkshireIRR },
  ];

  return (
    <Box role="group" aria-labelledby="live-preview-title" data-testid="live-preview" sx={{ flex: 1, minWidth: 0 }}>
      <Typography id="live-preview-title" variant="caption" component="p" color="text.secondary" sx={{ mb: 0.75 }}>
        <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>Updates as you edit: total at exit (year {yearLabel}) and annualized return</Box>
        <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>Total and annualized return at exit, year {yearLabel}</Box>
      </Typography>
      <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', columnGap: { xs: 1.5, md: 4 } }}>
        {parties.map((p) => (
          <Box key={p.key} sx={{ minWidth: 0 }}>
            <Typography component="dt" variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              <StakeholderLabel stakeholder={p.key}>{p.name}</StakeholderLabel>
            </Typography>
            <Box component="dd" sx={{ m: 0 }}>
              <Typography
                component="span"
                data-testid={`live-${p.key}-total`}
                sx={{ display: 'block', fontFamily: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif', fontWeight: 600, fontSize: { xs: '0.9375rem', md: '1.25rem' }, lineHeight: 1.3, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}
              >
                <AnimatedNumber value={p.total} format={formatCurrency} duration={motion.duration.countFast} animateOnMount={false} />
              </Typography>
              <Typography component="span" variant="body2" color="text.secondary" data-testid={`live-${p.key}-return`} sx={{ display: 'block', fontVariantNumeric: 'tabular-nums' }}>
                <AnimatedNumber value={p.irr} format={formatPercentage} duration={motion.duration.countFast} animateOnMount={false} />
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default LivePreview;
