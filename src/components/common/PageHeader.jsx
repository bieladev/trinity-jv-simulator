import React from 'react';
import { Box, Typography } from '@mui/material';
import { revealStyle } from '../../utils/motion';

// The one page header used at the top of every view: eyebrow, title, a
// single line of description and optional actions. Replaces the old
// gradient banners. Always above the fold, so its entrance is pure CSS
// (motion-rise: a short staggered rise, opacity 1 from the first paint).
// `aside` (hero only) puts a visual on the right from md up; the actions then
// sit under the description instead of on the right.
function PageHeader({ eyebrow, title, description, actions, meta, aside, component = 'h1', size = 'page' }) {
  const isHero = size === 'hero';
  const hasAside = Boolean(aside);
  return (
    <Box
      component="header"
      sx={{
        pt: { xs: 5, md: isHero ? 10 : 7 },
        pb: { xs: 4, md: isHero ? 7 : 5 },
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: hasAside ? 'stretch' : 'flex-start', md: hasAside ? 'center' : 'flex-end' },
        justifyContent: 'space-between',
        gap: { xs: hasAside ? 5 : 3, md: 6 },
      }}
    >
      <Box sx={{ minWidth: 0, maxWidth: isHero ? 820 : 760, flex: hasAside ? { md: '1 1 0' } : undefined }}>
        {eyebrow && (
          <Typography variant="overline" component="p" color="text.secondary" className="motion-rise motion-rule" style={revealStyle(0)} sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1.5, '&::before': { content: '""', width: 20, height: 2, mt: 'calc(0.8em - 1px)', bgcolor: 'brand.accent', flexShrink: 0 } }}>
            {eyebrow}
          </Typography>
        )}
        <Typography variant={isHero ? 'h1' : 'h2'} component={component} className="motion-rise" style={revealStyle(1)} sx={{ textWrap: 'balance' }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="subtitle1" color="text.secondary" className="motion-rise" style={revealStyle(2)} sx={{ mt: 2, maxWidth: 680, textWrap: 'pretty' }}>
            {description}
          </Typography>
        )}
        {meta && <Box className="motion-rise" style={revealStyle(3)} sx={{ mt: 2.5 }}>{meta}</Box>}
        {hasAside && actions && (
          <Box className="motion-rise" style={revealStyle(3)} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 4 }}>
            {actions}
          </Box>
        )}
      </Box>
      {hasAside && (
        <Box sx={{ width: { xs: '100%', md: 420 }, flexShrink: 0, minWidth: 0 }}>
          {aside}
        </Box>
      )}
      {!hasAside && actions && (
        <Box className="motion-rise" style={revealStyle(3)} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, flexShrink: 0 }}>
          {actions}
        </Box>
      )}
    </Box>
  );
}

export default PageHeader;
