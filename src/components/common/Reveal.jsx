import React from 'react';
import { Box } from '@mui/material';
import { useReveal, revealStyle } from '../../utils/motion';

// Staggered entrance wrapper. Renders a Box (any `component`, e.g. "li"),
// so it can be a grid item itself without adding a wrapper element.
// `index` sets the stagger delay among siblings.
function Reveal({ index = 0, style, children, ...rest }) {
  const ref = useReveal();
  return (
    <Box ref={ref} style={{ ...revealStyle(index), ...style }} {...rest}>
      {children}
    </Box>
  );
}

export default Reveal;
