// The worked example used across the overview: the Standard Home Purchase
// preset, run through the same model as the simulator. Nothing here is
// hand-typed; every figure on the overview comes from calculations.js.
import { scenarioPresets } from '../../utils/data/scenarios';
import { calculateMetrics, generateYearlySeries } from '../../utils/calculations';

export const EXAMPLE_PRESET_ID = 'standard';
export const examplePreset = scenarioPresets[EXAMPLE_PRESET_ID];
export const exampleInputs = examplePreset.data;
export const exampleMetrics = calculateMetrics(exampleInputs);
export const exampleSeries = generateYearlySeries(exampleInputs);
export const EXAMPLE_LABEL = `Example: ${examplePreset.name} preset`;

export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(value));

export const formatPercent = (value) => `${Number(value).toFixed(1).replace(/\.0$/, '')}%`;
export const formatReturn = (value) => `${Number(value).toFixed(1)}%`;
