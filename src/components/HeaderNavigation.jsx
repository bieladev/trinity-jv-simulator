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

function HeaderNavigation({ currentView, onNavigateHome, onNavigateToInput, onOpenGuide, onReset, colorMode = 'light', onToggleColorMode }) {
  const theme = useTheme();
  const isDark = colorMode === 'dark';

  const getBreadcrumbs = () => {
    const breadcrumbs = [{ label: 'Overview', onClick: onNavigateHome, isClickable: true }];
    if (currentView === 'input') {
      breadcrumbs.push({ label: 'Assumptions', isClickable: false });
    } else if (currentView === 'summary') {
      breadcrumbs.push(
        { label: 'Assumptions', onClick: onNavigateToInput, isClickable: true },
        { label: 'Summary', isClickable: false }
      );
    } else if (currentView === 'results') {
      breadcrumbs.push(
        { label: 'Assumptions', onClick: onNavigateToInput, isClickable: true },
        { label: 'Results', isClickable: false }
      );
    }
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

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
              onClick={onNavigateHome}
              aria-label="Trinity JV Simulator, back to overview"
              sx={{ display: 'flex', alignItems: 'center', p: 0, border: 0, background: 'none', color: 'text.primary', cursor: 'pointer', borderRadius: '2px', flexShrink: 0 }}
            >
              <Typography variant="h6" component="span" sx={{ whiteSpace: 'nowrap', fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                Trinity JV Simulator
              </Typography>
            </Box>
            <Breadcrumbs
              separator={<NavigateNextIcon sx={{ fontSize: 16 }} />}
              aria-label="breadcrumb"
              sx={{ display: { xs: 'none', md: 'flex' }, ml: 1, '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' } }}
            >
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                if (crumb.isClickable && !isLast) {
                  return (
                    <Link
                      key={crumb.label}
                      component="button"
                      type="button"
                      onClick={crumb.onClick}
                      variant="body2"
                      underline="hover"
                      sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
                    >
                      {crumb.label}
                    </Link>
                  );
                }
                return (
                  <Typography
                    key={crumb.label}
                    variant="body2"
                    aria-current={isLast ? 'page' : undefined}
                    sx={{ color: isLast ? 'text.primary' : 'text.secondary', fontWeight: isLast ? 600 : 400, whiteSpace: 'nowrap' }}
                  >
                    {crumb.label}
                  </Typography>
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
                sx={{ color: 'text.secondary', minWidth: 0, '&:hover': { color: 'text.primary' }, '& .MuiButton-startIcon': { display: { xs: 'none', sm: 'inherit' } } }}
              >
                Guide
              </Button>
            )}
            {currentView !== 'welcome' && (
              <Button variant="outlined" size="small" onClick={onNavigateHome} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                Start over
              </Button>
            )}
            {onReset && (
              <Tooltip title="Clear saved inputs, results and comparisons">
                <Button
                  variant="text"
                  size="small"
                  onClick={onReset}
                  startIcon={<RestartAltOutlinedIcon sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />}
                  data-testid="reset-button"
                  sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
                >
                  Reset
                </Button>
              </Tooltip>
            )}
            {onToggleColorMode && (
              <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
                <IconButton onClick={onToggleColorMode} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} data-testid="color-mode-toggle" sx={{ width: 40, height: 40 }}>
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