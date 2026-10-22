import { createTheme, alpha } from '@mui/material/styles';
import { motion, motionGlobalStyles } from './utils/motion';

// Lotline brand tokens (memory/branding/profile.md). Every colour in the app
// comes from here — components read them through the MUI theme, never as hex.
const tokens = {
  light: {
    background: '#f3f7fc',
    surface: '#fbfeff', // cards and panels (brand "surface" for the interface style)
    surfaceMuted: '#e8edf4',
    surfaceElevated: '#fbfeff',
    surfaceInverse: '#11161d',
    border: '#c9ced6',
    borderStrong: '#7e8792',
    text: '#0f1b2d',
    textMuted: '#48566b',
    textInverse: '#d5dfeb',
    focusRing: '#005ecd',
    primary: '#1f5fa8',
    primaryHover: '#0e529a',
    primaryPressed: '#004990',
    primaryText: '#1f5fa8', // primary used as text / thin UI on the page surface
    secondary: '#5b5a80',
    accent: '#d9822b',
    success: '#05893e',
    warning: '#996600',
    error: '#b9463f',
    errorForeground: '#fceae7',
    info: '#0077c2',
    disabled: '#dadee3',
    disabledText: '#7c8186',
    chart: ['#007cc3', '#899de6', '#ab5a4a', '#5ca3fd', '#00849d', '#afa44c'],
    shadowInk: '15, 27, 45',
  },
  dark: {
    background: '#0b0d11',
    surface: '#15191d',
    surfaceMuted: '#1b1f24',
    surfaceElevated: '#222427',
    surfaceInverse: '#e5ecf5',
    border: '#34383e',
    borderStrong: '#616a75',
    text: '#d5dfeb',
    textMuted: '#a6afbb',
    textInverse: '#1b222b',
    focusRing: '#65b0ff',
    primary: '#1f5fa8',
    primaryHover: '#0e529a',
    primaryPressed: '#004990',
    // #1f5fa8 is only 2.8:1 on the dark surface, so text-coloured primary
    // (links, outlined buttons, selected tabs, sliders) uses the dark focus tone.
    primaryText: '#65b0ff',
    secondary: '#5b5a80',
    accent: '#d9822b',
    success: '#3aa85b',
    warning: '#be8200',
    error: '#dc665b',
    errorForeground: '#2b1e1c',
    info: '#2696e4',
    disabled: '#26292d',
    disabledText: '#6e7277',
    // DR Horton lavender (#cbaaff, chart-2) measured against the dark
    // surfaces: 9.9:1 on background #0b0d11, 9.0:1 on card #15191d, 8.5:1 on
    // surfaceMuted #1b1f24 -- above WCAG AA (4.5:1 text, 3:1 graphics).
    chart: ['#3f93f7', '#cbaaff', '#c96fa4', '#ff9a88', '#c0851f', '#b3ca65'],
    shadowInk: '0, 0, 0',
  },
};

const DISPLAY_FONT = '"Space Grotesk", ui-sans-serif, system-ui, sans-serif';
const BODY_FONT = 'Inter, ui-sans-serif, system-ui, sans-serif';

const buildShadows = (ink, mode) => {
  const k = mode === 'dark' ? 4 : 1; // shadows need more weight to read on dark
  const sm = `0 1px 2px rgba(${ink}, ${0.06 * k})`;
  const md = `0 1px 3px rgba(${ink}, ${0.08 * k}), 0 1px 2px rgba(${ink}, ${0.05 * k})`;
  const lg = `0 8px 24px rgba(${ink}, ${0.08 * k}), 0 2px 6px rgba(${ink}, ${0.05 * k})`;
  return ['none', sm, md, md, md, md, md, md, ...Array(17).fill(lg)];
};

export const createAppTheme = (mode = 'light', { reducedMotion = false } = {}) => {
  const t = tokens[mode] || tokens.light;
  const [c1, c2, c3, c4] = t.chart;
  const { duration: md, easing: me, distance: mx } = motion;
  // Transition string from motion tokens; 'none' when the user asks for
  // reduced motion.
  const tr = (...parts) => (reducedMotion ? 'none' : parts.map(([prop, ms, ease = me.out]) => `${prop} ${ms}ms ${ease}`).join(', '));

  const base = createTheme({
    palette: {
      mode,
      primary: { main: t.primary, dark: t.primaryPressed, light: t.primaryText, contrastText: '#ffffff' },
      secondary: { main: t.secondary, contrastText: '#ffffff' },
      success: { main: t.success },
      warning: { main: t.warning },
      error: { main: t.error, contrastText: t.errorForeground },
      info: { main: t.info },
      background: { default: t.background, paper: t.surface },
      text: { primary: t.text, secondary: t.textMuted, disabled: t.disabledText },
      divider: t.border,
      action: { disabledBackground: t.disabled, disabled: t.disabledText },
      // Brand extensions
      brand: {
        accent: t.accent,
        primaryText: t.primaryText,
        primaryHover: t.primaryHover,
        primaryPressed: t.primaryPressed,
        surfaceMuted: t.surfaceMuted,
        surfaceElevated: t.surfaceElevated,
        surfaceInverse: t.surfaceInverse,
        textInverse: t.textInverse,
        borderStrong: t.borderStrong,
        focusRing: t.focusRing,
      },
      // Chart roles — fixed order, the same entity always gets the same hue.
      chart: {
        homeowner: c1,
        drHorton: c2,
        berkshire: c3,
        series4: c4,
        total: t.text,
        grid: t.border,
        axis: t.textMuted,
        marker: t.borderStrong,
      },
    },
    shape: { borderRadius: 4 },
    shadows: buildShadows(t.shadowInk, mode),
    // MUI's own transitions (menus, dialogs, switches, accordions) use the
    // motion tokens too, and switch off entirely for reduced motion.
    transitions: reducedMotion
      ? { create: () => 'none' }
      : {
          easing: { easeOut: me.out, easeInOut: me.inOut, sharp: me.inOut },
          duration: { shortest: md.fast, shorter: md.base, short: md.medium, standard: md.collapse, complex: md.reveal, enteringScreen: md.medium, leavingScreen: md.base },
        },
    typography: {
      fontFamily: BODY_FONT,
      htmlFontSize: 16,
      h1: { fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: '2.25rem', lineHeight: 1.1, letterSpacing: '-0.02em' },
      h2: { fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: '1.75rem', lineHeight: 1.2, letterSpacing: '-0.015em' },
      h3: { fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.25, letterSpacing: '-0.01em' },
      h4: { fontFamily: DISPLAY_FONT, fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.3 },
      h5: { fontFamily: DISPLAY_FONT, fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.35 },
      h6: { fontFamily: DISPLAY_FONT, fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 },
      subtitle1: { fontSize: '1.125rem', lineHeight: 1.55, fontWeight: 400 },
      subtitle2: { fontSize: '1rem', lineHeight: 1.5, fontWeight: 600 },
      body1: { fontSize: '1rem', lineHeight: 1.6 },
      body2: { fontSize: '0.9375rem', lineHeight: 1.55 },
      caption: { fontSize: '0.8125rem', lineHeight: 1.5 },
      overline: { fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', lineHeight: 1.6, textTransform: 'uppercase' },
      button: { fontSize: '0.9375rem', fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
      // Big-number styles for metric tiles
      metric: { fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: '2.25rem', lineHeight: 1.1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' },
      metricSm: { fontFamily: DISPLAY_FONT, fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.2, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' },
    },
  });

  const { breakpoints: bp } = base;
  const hairline = `1px solid ${t.border}`;

  return createTheme(base, {
    typography: {
      h1: { [bp.up('md')]: { fontSize: '3rem' } },
      h2: { [bp.up('md')]: { fontSize: '2rem' } },
      subtitle1: { [bp.up('md')]: { fontSize: '1.25rem' } },
      metric: { [bp.up('md')]: { fontSize: '2.5rem' } },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ...motionGlobalStyles(base.shadows),
          html: { colorScheme: mode, WebkitTextSizeAdjust: '100%' },
          body: { backgroundColor: t.background, overflowX: 'hidden' },
          '::selection': { backgroundColor: alpha(t.primary, 0.25) },
          ':focus-visible': { outline: `2px solid ${t.focusRing}`, outlineOffset: 2 },
        },
      },
      MuiTypography: {
        defaultProps: { variantMapping: { metric: 'p', metricSm: 'p' } },
      },
      MuiContainer: {
        defaultProps: { maxWidth: 'lg' },
        styleOverrides: { root: { paddingLeft: 16, paddingRight: 16, [bp.up('sm')]: { paddingLeft: 24, paddingRight: 24 }, [bp.up('md')]: { paddingLeft: 32, paddingRight: 32 } } },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: 'none' },
          rounded: { borderRadius: 6 },
          outlined: { border: hairline },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: { root: { borderRadius: 6, border: hairline, boxShadow: base.shadows[2] } },
      },
      MuiCardContent: {
        styleOverrides: { root: { padding: 20, '&:last-child': { paddingBottom: 20 }, [bp.up('md')]: { padding: 24, '&:last-child': { paddingBottom: 24 } } } },
      },
      MuiButtonBase: { defaultProps: { disableRipple: true } },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 4, minHeight: 36, paddingLeft: 14, paddingRight: 14,
            transition: tr(['background-color', md.fast], ['border-color', md.fast], ['color', md.fast], ['box-shadow', md.fast], ['transform', md.press]),
            // Press: the button travels 1px into the surface.
            '&:active': { transform: reducedMotion ? 'none' : `translateY(${mx.press}px)` },
          },
          sizeLarge: { minHeight: 44, paddingLeft: 20, paddingRight: 20, fontSize: '1rem' },
          sizeSmall: { minHeight: 32, paddingLeft: 10, paddingRight: 10, fontSize: '0.875rem' },
          containedPrimary: {
            backgroundColor: t.primary,
            color: '#ffffff',
            '&:hover': { backgroundColor: t.primaryHover, boxShadow: base.shadows[1] },
            '&:active': { backgroundColor: t.primaryPressed, boxShadow: 'none' },
          },
          outlined: {
            borderColor: t.border,
            color: t.text,
            '&:hover': { borderColor: t.borderStrong, backgroundColor: alpha(t.text, 0.04) },
          },
          outlinedPrimary: {
            borderColor: t.border,
            color: t.text,
            '&:hover': { borderColor: t.borderStrong, backgroundColor: alpha(t.text, 0.04) },
          },
          textPrimary: { color: t.primaryText, '&:hover': { backgroundColor: alpha(t.primaryText, 0.08) } },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 4, color: t.textMuted,
            transition: tr(['background-color', md.fast], ['color', md.fast], ['transform', md.press]),
            '&:hover': { color: t.text, backgroundColor: alpha(t.text, 0.06) },
            '&:active': { transform: reducedMotion ? 'none' : `translateY(${mx.press}px)` },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 2, fontWeight: 600, fontSize: '0.8125rem', height: 26 },
          outlined: { borderColor: t.border },
          sizeSmall: { height: 22, fontSize: '0.75rem' },
          colorPrimary: { '&.MuiChip-filled': { backgroundColor: alpha(t.primaryText, 0.14), color: t.text } },
          // Status colours carry meaning on the border/fill; the label stays in
          // the text token (success green is only 4.45:1 as text on the card).
          colorSuccess: { '&.MuiChip-filled': { backgroundColor: alpha(t.success, 0.14), color: t.text }, '&.MuiChip-outlined': { borderColor: t.success, color: t.text } },
          colorWarning: { '&.MuiChip-filled': { backgroundColor: alpha(t.warning, 0.16), color: t.text }, '&.MuiChip-outlined': { borderColor: t.warning, color: t.text } },
          colorError: { '&.MuiChip-filled': { backgroundColor: alpha(t.error, 0.14), color: t.text }, '&.MuiChip-outlined': { borderColor: t.error, color: t.text } },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 44, borderBottom: hairline },
          // The indicator slides between tabs.
          indicator: { height: 2, backgroundColor: t.primaryText, transition: tr(['left', md.medium], ['width', md.medium]) },
          flexContainer: { gap: 24 },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 44, minWidth: 0, padding: '10px 0', textTransform: 'none', fontWeight: 600, fontSize: '0.9375rem', color: t.textMuted,
            transition: tr(['color', md.fast]),
            '&.Mui-selected': { color: t.text },
            '&:hover': { color: t.text },
          },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: { root: { backgroundColor: t.surface } },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: 'none', fontWeight: 600, fontSize: '0.9375rem', color: t.textMuted, borderColor: t.border, borderRadius: 4, padding: '8px 14px', lineHeight: 1.3,
            transition: tr(['background-color', md.fast], ['color', md.fast]),
            '&.Mui-selected': { color: t.text, backgroundColor: alpha(t.primaryText, 0.12), '&:hover': { backgroundColor: alpha(t.primaryText, 0.18) } },
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          // Inset so the first and last mark labels stay inside the field column.
          root: { color: t.primaryText, height: 4, padding: '14px 0', width: 'calc(100% - 24px)', marginLeft: 12, marginRight: 12 },
          rail: { backgroundColor: t.border, opacity: 1 },
          thumb: {
            width: 16, height: 16, backgroundColor: t.surface, border: `2px solid ${t.primaryText}`, boxShadow: base.shadows[1],
            transition: tr(['box-shadow', md.fast], ['transform', md.fast], ['left', md.fast], ['bottom', md.fast]),
            '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 6px ${alpha(t.primaryText, 0.16)}` },
            '&.Mui-active': { transform: reducedMotion ? 'translate(-50%, -50%)' : 'translate(-50%, -50%) scale(1.15)' },
          },
          mark: { backgroundColor: t.borderStrong, width: 2, height: 2, borderRadius: 1 },
          markActive: { backgroundColor: t.surface },
          markLabel: { fontSize: '0.8125rem', color: t.textMuted, fontVariantNumeric: 'tabular-nums' },
          valueLabel: { backgroundColor: t.surfaceInverse, color: t.textInverse, borderRadius: 4, fontSize: '0.8125rem' },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: { '&.Mui-checked': { color: t.primaryText, '& + .MuiSwitch-track': { backgroundColor: t.primaryText, opacity: 0.5 } } },
        },
      },
      MuiCheckbox: {
        styleOverrides: { root: { color: t.borderStrong, '&.Mui-checked': { color: t.primaryText } } },
      },
      MuiTextField: { defaultProps: { variant: 'outlined' } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 4, backgroundColor: t.surface, fontVariantNumeric: 'tabular-nums',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: t.border },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: t.borderStrong },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: t.focusRing, borderWidth: 2 },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: { root: { color: t.textMuted, '&.Mui-focused': { color: t.primaryText } } },
      },
      MuiFormHelperText: {
        styleOverrides: { root: { fontSize: '0.8125rem', marginLeft: 0, color: t.textMuted } },
      },
      MuiMenu: {
        styleOverrides: { paper: { backgroundColor: t.surfaceElevated, border: hairline, boxShadow: base.shadows[8] } },
      },
      MuiDialog: {
        styleOverrides: { paper: { backgroundColor: t.surfaceElevated, border: hairline, borderRadius: 6, boxShadow: base.shadows[8] } },
      },
      MuiTooltip: {
        defaultProps: { arrow: true },
        styleOverrides: {
          tooltip: { backgroundColor: t.surfaceInverse, color: t.textInverse, fontSize: '0.8125rem', lineHeight: 1.5, padding: '8px 12px', borderRadius: 4, maxWidth: 320 },
          arrow: { color: t.surfaceInverse },
        },
      },
      MuiAccordion: {
        defaultProps: { elevation: 0, disableGutters: true },
        styleOverrides: {
          root: {
            backgroundColor: 'transparent', borderBottom: hairline, borderRadius: 0,
            '&:before': { display: 'none' },
            '&:first-of-type': { borderTop: hairline },
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: { padding: 0, minHeight: 56, '&:hover .MuiTypography-root': { color: t.primaryText } },
          content: { margin: '16px 0', paddingRight: 16 },
          // Chevron rotates on open/close.
          expandIconWrapper: { color: t.textMuted, transition: tr(['transform', md.base], ['color', md.fast]) },
        },
      },
      MuiCollapse: {
        defaultProps: {
          timeout: reducedMotion ? 0 : md.collapse,
          easing: { enter: me.out, exit: me.inOut },
        },
      },
      MuiAccordionDetails: {
        styleOverrides: { root: { padding: '0 40px 20px 0' } },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderBottom: hairline, fontSize: '0.9375rem', fontVariantNumeric: 'tabular-nums', padding: '12px 16px' },
          head: { fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.textMuted, backgroundColor: t.surfaceMuted, whiteSpace: 'nowrap' },
        },
      },
      MuiDivider: { styleOverrides: { root: { borderColor: t.border } } },
      MuiAlert: {
        styleOverrides: { root: { borderRadius: 4, border: hairline } },
      },
      MuiLink: {
        styleOverrides: { root: { color: t.primaryText } },
      },
      MuiBreadcrumbs: {
        styleOverrides: { separator: { color: t.borderStrong, marginLeft: 6, marginRight: 6 } },
      },
    },
  });
};

const theme = createAppTheme('light');
export default theme;