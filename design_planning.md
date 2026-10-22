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
- Overview: hero page header, feature strip, preset list plus custom card, benchmark table in an accordion ("Hold (years)" column, footnote for the risk rule), explainer and FAQ. No reveal-on-scroll.
- Assumptions: page header, five numbered sections (Property, Financing, Market and timeline, Appreciation share, Optional features), sticky action bar.
- Summary: page header, definition lists, projection tiles.
- Results: stakeholder tiles (big total, annualized return delta, capital line, sparkline from `generateYearlySeries`, breakdown), key outcomes, deal structure, charts (tabs), comparison.

## Shared components
`common/PageHeader`, `common/SectionHeading`, `common/Note`, `common/FormSection` (+ `SliderLabel`), `common/StakeholderLabel`, `charts/chartKit`.
