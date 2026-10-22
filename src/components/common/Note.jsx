import React from 'react';
import { Box, Typography } from '@mui/material';
import { InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material';

// Quiet explanatory note (replaces the tinted info Alerts): hairline rule on
// the left, muted text, optional bold lead-in.
function Note({ title, children, icon = true, sx, ...rest }) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        py: 1.5,
        pl: 2,
        pr: 1,
        borderLeft: '2px solid',
        borderColor: 'brand.borderStrong',
        bgcolor: 'brand.surfaceMuted',
        borderRadius: '0 4px 4px 0',
        ...sx,
      }}
      {...rest}
    >
      {icon && <InfoOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary', mt: '2px', flexShrink: 0 }} aria-hidden />}
      <Typography variant="body2" color="text.secondary" component="div" sx={{ minWidth: 0 }}>
        {title && (
          <Box component="strong" sx={{ color: 'text.primary', fontWeight: 600, mr: 0.75 }}>
            {title}
          </Box>
        )}
        {children}
      </Typography>
    </Box>
  );
}

export default Note;
