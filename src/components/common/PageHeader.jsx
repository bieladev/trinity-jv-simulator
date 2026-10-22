import React from 'react';
import { Box, Typography } from '@mui/material';

// The one page header used at the top of every view: eyebrow, title, a
// single line of description and optional actions. Replaces the old
// gradient banners.
function PageHeader({ eyebrow, title, description, actions, meta, component = 'h1', size = 'page' }) {
  const isHero = size === 'hero';
  return (
    <Box
      component="header"
      sx={{
        pt: { xs: 5, md: isHero ? 10 : 7 },
        pb: { xs: 4, md: isHero ? 7 : 5 },
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'flex-start', md: 'flex-end' },
        justifyContent: 'space-between',
        gap: { xs: 3, md: 6 },
      }}
    >
      <Box sx={{ minWidth: 0, maxWidth: isHero ? 820 : 760 }}>
        {eyebrow && (
          <Typography variant="overline" component="p" color="text.secondary" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1.5, '&::before': { content: '""', width: 20, height: 2, mt: 'calc(0.8em - 1px)', bgcolor: 'brand.accent', flexShrink: 0 } }}>
            {eyebrow}
          </Typography>
        )}
        <Typography variant={isHero ? 'h1' : 'h2'} component={component} sx={{ textWrap: 'balance' }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 2, maxWidth: 680, textWrap: 'pretty' }}>
            {description}
          </Typography>
        )}
        {meta && <Box sx={{ mt: 2.5 }}>{meta}</Box>}
      </Box>
      {actions && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, flexShrink: 0 }}>
          {actions}
        </Box>
      )}
    </Box>
  );
}

export default PageHeader;
