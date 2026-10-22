import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  NavigateNextOutlined as NavigateNextIcon,
  DarkModeOutlined as DarkModeOutlinedIcon,
  LightModeOutlined as LightModeOutlinedIcon,
  RestartAltOutlined as RestartAltOutlinedIcon,
  MenuBookOutlined as MenuBookOutlinedIcon,
} from '@mui/icons-material';

// No logo by request: the header shows the product name as text only.
//
// Navigation model (one meaning per control):
// - Product name and the step indicator move between screens. They never
//   clear anything.
// - Guide opens the overview at "How the program works".
// - Start over is the only control that clears saved work, and it asks first.

const STEPS = [
  { view: 'welcome', label: 'Overview' },
  { view: 'input', label: 'Assumptions' },
  { view: 'results', label: 'Results' },
];

function HeaderNavigation({ currentView, onNavigate, canOpenInput = false, canOpenResults = false, onOpenGuide, onStartOver, hasSavedWork = false, colorMode = 'light', onToggleColorMode }) {
  const theme = useTheme();
  const isDark = colorMode === 'dark';
  const reachable = { welcome: true, input: canOpenInput, results: canOpenResults };

  return (
    <Box
      component="nav"
      aria-label="Primary"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: alpha(theme.palette.background.default, 0.88),
        backdropFilter: 'saturate(140%) blur(10px)',
      }}
    >
      <Container>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} sx={{ minHeight: 64 }}>
          <Box display="flex" alignItems="center" gap={{ xs: 1.5, sm: 2 }} sx={{ minWidth: 0 }}>
            <Box
              component="button"
              type="button"
              onClick={() => onNavigate('welcome')}
              aria-label="Trinity JV Simulator, go to overview"
              sx={{ display: 'flex', alignItems: 'center', p: 0, border: 0, background: 'none', color: 'text.primary', cursor: 'pointer', borderRadius: '2px', flexShrink: 0 }}
            >
              <Typography variant="h6" component="span" sx={{ whiteSpace: 'nowrap', fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                Trinity JV Simulator
              </Typography>
            </Box>
            <Breadcrumbs
              separator={<NavigateNextIcon sx={{ fontSize: 16 }} />}
              aria-label="Steps"
              sx={{ display: { xs: 'none', md: 'flex' }, ml: 1, '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' } }}
            >
              {STEPS.map((step, index) => {
                const isCurrent = step.view === currentView;
                const label = `${index + 1}. ${step.label}`;
                if (isCurrent) {
                  return (
                    <Typography key={step.view} variant="body2" aria-current="step" sx={{ color: 'text.primary', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {label}
                    </Typography>
                  );
                }
                if (!reachable[step.view]) {
                  return (
                    <Typography key={step.view} variant="body2" sx={{ color: 'text.disabled', whiteSpace: 'nowrap' }} title="Choose a starting point first">
                      {label}
                    </Typography>
                  );
                }
                return (
                  <Link
                    key={step.view}
                    component="button"
                    type="button"
                    onClick={() => onNavigate(step.view)}
                    variant="body2"
                    underline="hover"
                    data-testid={`step-${step.view}`}
                    sx={{ color: 'text.secondary', whiteSpace: 'nowrap', '&:hover': { color: 'text.primary' } }}
                  >
                    {label}
                  </Link>
                );
              })}
            </Breadcrumbs>
          </Box>

          <Box display="flex" alignItems="center" gap={{ xs: 0.5, sm: 1 }} sx={{ flexShrink: 0 }}>
            {onOpenGuide && (
              <Button
                variant="text"
                size="small"
                onClick={onOpenGuide}
                startIcon={<MenuBookOutlinedIcon sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />}
                data-testid="guide-link"
                aria-label="Guide: how the program works"
                sx={{ color: 'text.secondary', minWidth: 0, minHeight: { xs: 44, sm: 36 }, '&:hover': { color: 'text.primary' }, '& .MuiButton-startIcon': { display: { xs: 'none', sm: 'inherit' } } }}
              >
                Guide
              </Button>
            )}
            {onStartOver && hasSavedWork && (
              <Tooltip title="Clear saved assumptions, results and comparisons">
                <Button
                  variant="text"
                  size="small"
                  onClick={onStartOver}
                  startIcon={<RestartAltOutlinedIcon />}
                  data-testid="reset-button"
                  aria-label="Start over: clear saved work"
                  sx={{
                    color: 'text.secondary',
                    minWidth: { xs: 44, sm: 0 },
                    minHeight: { xs: 44, sm: 36 },
                    '&:hover': { color: 'text.primary' },
                    // Phones: icon only, so the header fits at 375px.
                    '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 }, ml: { xs: 0, sm: -0.5 } },
                  }}
                >
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Start over</Box>
                </Button>
              </Tooltip>
            )}
            {onToggleColorMode && (
              <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
                <IconButton onClick={onToggleColorMode} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} data-testid="color-mode-toggle" sx={{ width: { xs: 44, sm: 40 }, height: { xs: 44, sm: 40 } }}>
                  {isDark ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default HeaderNavigation;