import { describe, it, expect } from 'vitest';
import { defaultFormData, presetFormData, countChangedFields, scenarioDisplayName } from './data/defaults';
import { scenarioPresets } from './data/scenarios';
import { buildSummaryText } from './summaryReport';
import { calculateMetrics } from './calculations';

describe('preset change tracking', () => {
  it('reports no changes for a preset as loaded', () => {
    expect(countChangedFields(presetFormData('standard'), 'standard')).toBe(0);
    expect(scenarioDisplayName('standard', presetFormData('standard'))).toBe(scenarioPresets.standard.name);
  });

  it('treats the stored preset data (without defaults) as unchanged', () => {
    expect(countChangedFields(scenarioPresets.refinance.data, 'refinance')).toBe(0);
  });

  it('counts each changed field and marks the name as edited', () => {
    const edited = { ...presetFormData('standard'), homePurchasePrice: 500000, saleYear: 10 };
    expect(countChangedFields(edited, 'standard')).toBe(2);
    expect(scenarioDisplayName('standard', edited)).toBe(`${scenarioPresets.standard.name} (edited)`);
  });

  it('compares nested event types by value', () => {
    const edited = { ...presetFormData('standard'), eventTypes: { ...defaultFormData.eventTypes, sale: false } };
    expect(countChangedFields(edited, 'standard')).toBe(1);
  });

  it('names a scenario without a preset "Custom scenario"', () => {
    expect(countChangedFields(defaultFormData, null)).toBe(0);
    expect(scenarioDisplayName(null, defaultFormData)).toBe('Custom scenario');
  });
});

describe('summary report', () => {
  it('uses the same figures as calculateMetrics', () => {
    const data = scenarioPresets.standard.data;
    const m = calculateMetrics(data);
    const text = buildSummaryText(data, 'Standard Home Purchase');
    const usd = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
    expect(text).toContain('SCENARIO: Standard Home Purchase');
    expect(text).toContain(`Total Homeowner Equity: ${usd(m.homeownerEquity)}`);
    expect(text).toContain(`Final Property Value: ${usd(m.futureValue)}`);
  });
});
