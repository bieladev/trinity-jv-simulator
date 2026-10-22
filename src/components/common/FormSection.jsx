import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import AnimatedNumber from './AnimatedNumber';
import { motion, useReveal, revealStyle } from '../../utils/motion';

// A numbered group of related inputs on the assumptions screen.
function FormSection({ index, title, description, children, id }) {
  const revealRef = useReveal();
  return (
    <Paper
      ref={revealRef}
      style={revealStyle(Number(index) - 1 || 0)}
      component="section"
      variant="outlined"
      aria-labelledby={id ? `${id}-title` : undefined}
      id={id}
      /* scroll margin clears the sticky header and, from md up, the sticky section nav */
      sx={{ p: { xs: 2.5, md: 4 }, scrollMarginTop: { xs: 88, md: 136 } }}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '240px 1fr' }, gap: { xs: 3, md: 5 } }}>
        <Box>
          {index && (
            <Typography variant="overline" component="p" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {index}
            </Typography>
          )}
          <Typography variant="h4" component="h2" id={id ? `${id}-title` : undefined}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {description}
            </Typography>
          )}
        </Box>
        <Box sx={{ minWidth: 0 }}>{children}</Box>
      </Box>
    </Paper>
  );
}

// Label + current value row shown above a slider. Pass `format` with a
// numeric `value` and the label follows the thumb with a short count
// (motion.duration.countFast); at rest it shows exactly format(value).
export function SliderLabel({ label, value, format, id }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2, mb: 0.5 }}>
      <Typography variant="body1" component="label" id={id} sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="body1" component="span" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {format ? <AnimatedNumber value={value} format={format} duration={motion.duration.countFast} animateOnMount={false} /> : value}
      </Typography>
    </Box>
  );
}

export default FormSection;
