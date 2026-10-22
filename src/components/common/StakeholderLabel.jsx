import React from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Identity marker for a stakeholder: a small swatch in the stakeholder's
// chart colour beside the name. Text stays in text tokens.
export const useStakeholderColors = () => {
  const { palette } = useTheme();
  return {
    homeowner: palette.chart.homeowner,
    drHorton: palette.chart.drHorton,
    berkshire: palette.chart.berkshire,
  };
};

function StakeholderLabel({ stakeholder, children, sx }) {
  const colors = useStakeholderColors();
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, ...sx }}>
      <Box component="span" aria-hidden sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: colors[stakeholder], flexShrink: 0 }} />
      {children}
    </Box>
  );
}

export default StakeholderLabel;
