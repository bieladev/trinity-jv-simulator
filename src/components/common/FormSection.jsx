import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

// A numbered group of related inputs on the assumptions screen.
function FormSection({ index, title, description, children, id }) {
  return (
    <Paper
      component="section"
      variant="outlined"
      aria-labelledby={id ? `${id}-title` : undefined}
      id={id}
      sx={{ p: { xs: 2.5, md: 4 }, scrollMarginTop: 96 }}
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

// Label + current value row shown above a slider.
export function SliderLabel({ label, value, id }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2, mb: 0.5 }}>
      <Typography variant="body1" component="label" id={id} sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="body1" component="span" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {value}
      </Typography>
    </Box>
  );
}

export default FormSection;
