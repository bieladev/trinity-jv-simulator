import React, { useEffect, useState } from 'react';
import { Box, ButtonBase } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion, scrollToId } from '../../utils/motion';

// Height of the sticky header (64px + 1px hairline). The jump nav sticks
// directly under it from md up; on phones it scrolls with the page so the
// screen keeps its height for content and the bottom action bar.
export const HEADER_OFFSET = 65;

// In-page section links with the current section marked (aria-current).
// `items`: [{ id, label, index? }] where id is the target element's id.
function JumpNav({ label, items, sx }) {
  const [active, setActive] = useState(items[0]?.id);

  // Scroll spy: the section crossing the band just below the sticky bars is
  // the current one.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const els = items.map((it) => document.getElementById(it.id)).filter(Boolean);
    if (!els.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-140px 0px -55% 0px', threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((it) => it.id).join('|')]);

  return (
    <Box
      component="nav"
      aria-label={label}
      sx={[(theme) => ({
        position: { md: 'sticky' },
        top: { md: HEADER_OFFSET },
        zIndex: 20,
        mb: 3,
        py: 1,
        mx: { xs: -2, sm: -3, md: 0 },
        px: { xs: 2, sm: 3, md: 0 },
        backgroundColor: alpha(theme.palette.background.default, 0.92),
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }), ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
    >
      <Box
        component="ul"
        sx={{
          listStyle: 'none', m: 0, p: 0, display: 'flex', gap: 0.5, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
          // Phones: fade the right edge so the row reads as scrollable.
          maskImage: { xs: 'linear-gradient(to right, #000 85%, transparent)', md: 'none' },
          WebkitMaskImage: { xs: 'linear-gradient(to right, #000 85%, transparent)', md: 'none' },
        }}
      >
        {items.map((it) => {
          const isActive = it.id === active;
          return (
            <Box component="li" key={it.id} sx={{ flexShrink: 0 }}>
              <ButtonBase
                onClick={() => {
                  setActive(it.id);
                  scrollToId(it.id);
                }}
                aria-current={isActive ? 'location' : undefined}
                sx={{
                  minHeight: { xs: 44, md: 36 },
                  px: 1.5,
                  gap: 0.75,
                  borderRadius: '4px',
                  typography: 'body2',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'text.primary' : 'text.secondary',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                  transition: `color ${motion.duration.fast}ms ${motion.easing.out}, background-color ${motion.duration.fast}ms ${motion.easing.out}`,
                  '&:hover': { color: 'text.primary', bgcolor: 'brand.surfaceMuted' },
                  // Current section: a 2px rule under the label.
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 12,
                    right: 12,
                    bottom: 4,
                    height: 2,
                    bgcolor: 'brand.primaryText',
                    transformOrigin: 'left center',
                    transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                    transition: `transform ${motion.duration.medium}ms ${motion.easing.out}`,
                  },
                }}
              >
                {it.index && (
                  <Box component="span" aria-hidden sx={{ fontVariantNumeric: 'tabular-nums', color: 'text.secondary', fontWeight: 500 }}>
                    {it.index}
                  </Box>
                )}
                {it.label}
              </ButtonBase>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default JumpNav;
