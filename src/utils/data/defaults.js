import { scenarioPresets } from './scenarios';

// Every field the assumptions form holds, with its starting value. A preset
// only lists the fields it sets; the form fills the rest from here.
export const defaultFormData = Object.freeze({
  homePurchasePrice: 400000,
  interestRate: 5.00,
  loanTerm: 30,
  mortgageType: 'Principal + Interest (Standard)',
  landValuePercent: 20,
  totalBuilderCostsPercent: 70,
  annualAppreciationRate: 3.00,
  saleYear: 30,
  drHortonAppreciationShare: 12.5,
  berkshireAppreciationShare: 12.5,
  enableInterestIncome: true,
  interestSplitBerkshire: 50,
  interestSplitDrHorton: 50,
  enableCashOutRefi: false,
  refiYear: 10,
  equityExtractionPercent: 50,
  newInterestRate: 6.50,
  newLoanTerm: 30,
  enableEarlyAction: false,
  earlyActionYear: 7,
  earlyActionType: 'sale',
  lumpSumPayment: 0,
  enableRecurringRevenue: false,
  ownershipDuration: 7,
  eventTypes: { sale: true, refinance: true, earlyPayoff: true },
  startingMortgageRate: 5.00,
  appreciationRatePerCycle: 3.00,
  drHortonProfitShare: 30,
  berkshireProfitShare: 20,
  profitTreatment: 'reinvest',
  marketBenchmarkIRR: 7.0,
  partnershipMode: 'realistic',
});

// The full form a preset loads into.
export const presetFormData = (presetId) => {
  const preset = presetId ? scenarioPresets[presetId] : null;
  return preset ? { ...defaultFormData, ...preset.data } : null;
};

const same = (a, b) => (a !== null && typeof a === 'object' ? JSON.stringify(a) === JSON.stringify(b) : a === b);

// Number of form fields that differ from the preset as loaded (0 when the
// form matches it, or when there is no preset to compare against).
export const countChangedFields = (formData, presetId) => {
  const base = presetFormData(presetId);
  if (!base || !formData) return 0;
  const form = { ...defaultFormData, ...formData };
  return Object.keys(form).filter((key) => !same(form[key], base[key])).length;
};

// Display name for the scenario on screen: the preset name, marked as edited
// once any value differs from the preset.
export const scenarioDisplayName = (presetId, formData) => {
  const preset = presetId ? scenarioPresets[presetId] : null;
  if (!preset) return 'Custom scenario';
  return countChangedFields(formData, presetId) > 0 ? `${preset.name} (edited)` : preset.name;
};
