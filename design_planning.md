# Trinity JV Simulator: visual refresh plan

Classification: DASHBOARD-style financial tool (numbers first). The editorial-marketing devices in the platform playbook (cinematic entrance, video hero, WebGL backgrounds, stock imagery) do not apply: the brief asks for a quiet, credible finance product with no imagery, and the hero must be visible on first paint.

## Scope
Visual, markup and copy only. Calculation logic (`src/utils/calculations.js`), data flow, persistence (`src/utils/persistence.js`) and every number shown are unchanged.

## Brand (Lotline kit, memory/branding/profile.md)
- Colours: all from the kit's light/dark token tables, exposed through the MUI theme (`src/theme.js`). One UI accent: Survey Blue `#1f5fa8` (dark mode uses `#65b0ff` wherever primary is text or a thin control, because `#1f5fa8` is 2.8:1 on the dark surface). Clay Brick appears only as the 20px eyebrow rule.
- Type: Space Grotesk (headings, big numbers, tabular figures), Inter (body 16px, secondary 15px, captions 13px). Uppercase tracked `overline` eyebrows.
- Shape: 2px chips, 4px buttons and fields, 6px cards; hairline borders; the kit's three soft shadows.
- Voice: sentence case, verb-first buttons ("Run full simulation", "Edit assumptions"), no emoji, no banned words ("revolutionary" removed).
- Logo: none. The header shows the text "Trinity JV Simulator" only (by request); brand favicon.

## Charts
Fixed entity colours from the kit's chart tokens: Homeowner = chart-1, DR Horton = chart-2, Berkshire = chart-3; totals and balances use the text colour. Checked with the dataviz validator (light passes; contrast WARN is covered by legends and tables). Year axis: integer ticks every 1, 2 or 5 years depending on hold length, always including 0 and the exit year; dashed "Exit · Year N" tag above the plot. Shared tooltip, legend and axis styling live in `src/components/charts/chartKit.jsx`.

## Screens
- Header: the text "Trinity JV Simulator" (no logo; goes to the overview and keeps all work), a numbered step indicator "1. Overview > 2. Assumptions > 3. Results" (md+; current step `aria-current="step"`, steps that need a starting point first are shown disabled), Guide (overview, scrolled to "How the program works"; work is kept), Start over (only when something is saved; the only control that clears saved work, behind a confirmation dialog; icon-only on phones; `data-testid="reset-button"`), light/dark toggle (stored in localStorage under `lotline-color-mode`, OS preference by default). Phone tap targets 44px. Fits 375px without overflow.
- Overview (one page, the guide and the tool's front door; components in `src/components/overview/`, worked example in `overview/example.js` = `calculateMetrics` / `generateYearlySeries` of the Standard preset, never hand-typed):
  1. Hero: one-line purpose, "Build custom scenario" + "Browse presets", and `HeroValueVisual` on the right (md+; below the actions on mobile): Standard preset home value from year 0 to "Exit · Year 30" with appreciation stacked by party in the chart entity colours, count-up value and legend. First paint only (CSS keyframes).
  2. How the program works (`ProgramFlow`, id `how-it-works`): swimlanes, one row per party and one column per phase (At purchase / During the hold / At exit) with real Standard figures; phase timeline and lane connectors draw in, phases reveal in sequence, amounts count up. Mobile stacks by phase. Note on interest income off and which terms are fixed (50/50 cost share, 10% down) versus editable (appreciation and interest splits).
  3. What the tool is for (`ToolPurpose`): four cards.
  4. How to use it (`HowToUse`): three numbered steps on a progress line that draws in (horizontal md+, vertical on mobile), then the final CTA.
  5. Presets list + custom card + benchmarks accordion (unchanged behaviour and test ids, "Coming soon" chips kept).
  6. How to read the results (`ReadingResults`): homeowner vs partner annualized return using the exported note constants from calculations.js, an "Exit · Year N" illustration (Early Sale at Year 7 preset), and "What the model does not include" (taxes, transaction and selling costs, probability of default, fees, monthly cash timing for the homeowner, year-to-year price swings).
  7. FAQ (content from `utils/data/faq.js`, unchanged).
- Assumptions: page header (scenario chip; for a preset, "N values changed from the preset" + "Restore preset values" once anything differs), section jump nav (`common/JumpNav`, sticky under the header from md up, current section marked), five numbered sections (Property, Financing, Market and timeline, Appreciation share, Optional features), sticky action bar holding the live preview (`input/LivePreview`: each party's total at exit and annualized return from `calculateMetrics`, same formatters as Results, `AnimatedNumber` at `countFast`, deferred with `useDeferredValue`) and the one main action "View full results".
- Results: page header (Edit assumptions, Download summary), jump nav (Returns, Charts, Compare scenarios, Assumptions used), stakeholder tiles (big total, annualized return delta, capital line, sparkline from `generateYearlySeries`, breakdown) directly under a "How annualized return is calculated" toggle (the method text is collapsed so the answer is on the first screen, on phones too), key outcomes, deal structure, charts (tabs), comparison, "Assumptions used" (`AssumptionsUsed`: the inputs and the interest / refinance / recurring notes from the former Summary screen).

## Flow
Overview > Assumptions > Results. The former Summary step was removed: everything it showed is on Results (key outcomes, deal structure, assumptions used, notes) and its "Download summary" (`utils/summaryReport.js`, unchanged report text, HTML file) is a Results header action with a confirmation snackbar instead of a blocking alert. A session saved on the old Summary view resumes on Assumptions (persistence key and format unchanged).
- One `navigate(view)` in `App.jsx`: leaving Assumptions keeps in-progress edits; opening Results always runs the current assumptions, so results are never stale.
- Browser Back / Forward move between the three screens (`history.pushState` per screen change, `popstate` handled), instead of leaving the tool.
- Returning to the overview with saved work shows "Continue where you left off: <scenario>" with Edit assumptions / View results.
- A preset whose values were changed is labelled "<name> (edited)" on Results, and can be compared against the original preset.
- Opening another preset or a new custom scenario while the saved assumptions are edited asks first ("Replace your edited scenario?", focus on "Keep my changes"); unedited work is replaced without a question. Confirmation dialogs open with focus on the safe action.

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
| `duration.draw` | 900ms | Overview lines drawing in (scaleX/scaleY) and the hero / exit-illustration curtain |
| `easing.out` | cubic-bezier(0.2, 0, 0, 1) | Everything that enters or settles |
| `easing.inOut` | cubic-bezier(0.4, 0, 0.2, 1) | Collapse exit, MUI sharp/easeInOut |
| `stagger` | 60ms, capped at 6 steps | Siblings in grids and lists |
| `sequence` | 200ms | Steps of a sequence: program phases, how-to steps (x1.5) |

Rules
- First paint: page headers rise with CSS keyframes only (opacity stays 1, eyebrow rule draws in). Cards already on screen at mount do the same 8px rise. Only content below the fold starts hidden, and it is revealed by one shared IntersectionObserver the moment any pixel enters the viewport. With no JS, or in print, everything is visible.
- Numbers (`common/AnimatedNumber`): count from the previous value, or from 0 on first view, using the existing formatter. At rest the text is exactly `format(value)`. A hidden `::after` copy of the final string reserves its width, so nothing moves. Numbers off screen show their final value until they are seen. The annualized-return lines and breakdown rows stay static.
- Charts: draw in on mount and on every tab switch. Charts below the fold render complete (so print and PDF are never empty) and replay once they scroll into view. The exit-year marker fades in after the line has drawn.
- Screens: the first screen paints immediately. Later changes jump to the top before the next paint and the new screen fades and rises in. Fill mode is `backwards`, so no transform lingers to affect sticky or fixed elements.
- Lines (overview): `.motion-draw-x` / `.motion-draw-y` scale in from 0 (transform only); with `.motion-now` on first paint, otherwise when `Reveal` marks them in view. Curves are revealed by a curtain in the card colour that scales away to the right (`.motion-uncover` on first paint, `.motion-uncover-io` below the fold), so no SVG stroke animation is needed. `AnimatedNumber` takes an optional `delay` so counts start after their card has entered. In print the curtains are hidden.
- Reduced motion (`prefers-reduced-motion: reduce`): numbers show final values immediately, charts render without animation, reveals are skipped, MUI transitions are off (`transitions.create → 'none'`, Collapse timeout 0), and a global CSS rule zeroes any remaining animation or transition. Nothing is transformed.
