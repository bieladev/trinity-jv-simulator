import React from 'react';
import { Box, Typography } from '@mui/material';

// In-page section heading: optional eyebrow, title, short description and an
// action slot on the right (wraps under the text on narrow screens).
function SectionHeading({ eyebrow, title, description, action, component = 'h2', sx }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'flex-end' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3,
        ...sx,
      }}
    >
      <Box sx={{ minWidth: 0, maxWidth: 720 }}>
        {eyebrow && (
          <Typography variant="overline" component="p" color="text.secondary" sx={{ mb: 0.75 }}>
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h3" component={component}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {description}
          </Typography>
        )}
      </Box>
      {action && <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', flexShrink: 0 }}>{action}</Box>}
    </Box>
  );
}

export default SectionHeading;
