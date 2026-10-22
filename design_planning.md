# Trinity JV Simulator: visual refresh plan

Classification: DASHBOARD-style financial tool (numbers first). The editorial-marketing devices in the platform playbook (cinematic entrance, video hero, WebGL backgrounds, stock imagery) do not apply: the brief asks for a quiet, credible finance product with no imagery, and the hero must be visible on first paint.

## Scope
Visual, markup and copy only. Calculation logic (`src/utils/calculations.js`), data flow, persistence (`src/utils/persistence.js`) and every number shown are unchanged.

## Brand (Lotline kit, memory/branding/profile.md)
- Colours: all from the kit's light/dark token tables, exposed through the MUI theme (`src/theme.js`). One UI accent: Survey Blue `#1f5fa8` (dark mode uses `#65b0ff` wherever primary is text or a thin control, because `#1f5fa8` is 2.8:1 on the dark surface). Clay Brick appears only as the 20px eyebrow rule.
- Type: Space Grotesk (headings, big numbers, tabular figures), Inter (body 16px, secondary 15px, captions 13px). Uppercase tracked `overline` eyebrows.
- Shape: 2px chips, 4px buttons and fields, 6px cards; hairline borders; the kit's three soft shadows.
- Voice: sentence case, verb-first buttons ("Run full simulation", "Edit assumptions"), no emoji, no banned words ("revolutionary" removed).
- Logo: colour wordmark in light mode, white wordmark in dark mode; brand favicon.

## Charts
Fixed entity colours from the kit's chart tokens: Homeowner = chart-1, DR Horton = chart-2, Berkshire = chart-3; totals and balances use the text colour. Checked with the dataviz validator (light passes; contrast WARN is covered by legends and tables). Year axis: integer ticks every 1, 2 or 5 years depending on hold length, always including 0 and the exit year; dashed "Exit · Year N" tag above the plot. Shared tooltip, legend and axis styling live in `src/components/charts/chartKit.jsx`.

## Screens
- Header: logo, product name, breadcrumbs (md+), Start over, Reset, light/dark toggle (stored in localStorage under `lotline-color-mode`, OS preference by default).
- Overview: hero page header, feature strip, preset list plus custom card, benchmark table in an accordion ("Hold (years)" column, footnote for the risk rule), explainer and FAQ. Hero visible on first paint; groups below the fold get the staggered reveal (see Motion).
- Assumptions: page header, five numbered sections (Property, Financing, Market and timeline, Appreciation share, Optional features), sticky action bar.
- Summary: page header, definition lists, projection tiles.
- Results: stakeholder tiles (big total, annualized return delta, capital line, sparkline from `generateYearlySeries`, breakdown), key outcomes, deal structure, charts (tabs), comparison.

## Shared components
`common/PageHeader`, `common/SectionHeading`, `common/Note`, `common/FormSection` (+ `SliderLabel`), `common/StakeholderLabel`, `charts/chartKit`.

## Motion
Purposeful and quiet: motion shows that numbers changed or arrived, and it never bounces or loops. Tokens live in one place, `src/utils/motion.js` (`motion`), and feed the CSS keyframes (injected through CssBaseline), the MUI theme transitions, Recharts and the count-up hook. There is no motion library: CSS plus small React hooks only.

| Token | Value | Used for |
| --- | --- | --- |
| `duration.press` | 100ms | Button / icon button press (1px down) |
| `duration.fast` | 150ms | Colour, chevrons, toggle fills |
| `duration.base` | 200ms | Card hover lift (-2px + kit large shadow), accordion chevron |
| `duration.medium` | 250ms | Tab indicator slide, chart-tab fade, exit-marker fade |
| `duration.screen` | 280ms | Screen change: fade + 12px rise |
| `duration.collapse` | 280ms | Optional-feature panels, FAQ (MUI Collapse default) |
| `duration.reveal` | 420ms | Staggered entrance (fade + 12px rise; 8px rise without fade above the fold) |
| `duration.countFast` | 240ms | Slider value labels, homeowner share |
| `duration.count` | 800ms | Big-number count-up (ease-out cubic) |
| `duration.chart` | 800ms | Recharts draw-in (lines left to right, areas, bars, donut) |
| `easing.out` | cubic-bezier(0.2, 0, 0, 1) | Everything that enters or settles |
| `easing.inOut` | cubic-bezier(0.4, 0, 0.2, 1) | Collapse exit, MUI sharp/easeInOut |
| `stagger` | 60ms, capped at 6 steps | Siblings in grids and lists |

Rules
- First paint: page headers rise with CSS keyframes only (opacity stays 1, eyebrow rule draws in). Cards already on screen at mount do the same 8px rise. Only content below the fold starts hidden, and it is revealed by one shared IntersectionObserver the moment any pixel enters the viewport. With no JS, or in print, everything is visible.
- Numbers (`common/AnimatedNumber`): count from the previous value, or from 0 on first view, using the existing formatter. At rest the text is exactly `format(value)`. A hidden `::after` copy of the final string reserves its width, so nothing moves. Numbers off screen show their final value until they are seen. The annualized-return lines and breakdown rows stay static.
- Charts: draw in on mount and on every tab switch. Charts below the fold render complete (so print and PDF are never empty) and replay once they scroll into view. The exit-year marker fades in after the line has drawn.
- Screens: the first screen paints immediately. Later changes jump to the top before the next paint and the new screen fades and rises in. Fill mode is `backwards`, so no transform lingers to affect sticky or fixed elements.
- Reduced motion (`prefers-reduced-motion: reduce`): numbers show final values immediately, charts render without animation, reveals are skipped, MUI transitions are off (`transitions.create → 'none'`, Collapse timeout 0), and a global CSS rule zeroes any remaining animation or transition. Nothing is transformed.
