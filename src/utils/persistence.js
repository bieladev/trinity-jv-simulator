// Saves the simulator's flow state to localStorage so a refresh resumes where
// the user left off. Every read/write is wrapped in try/catch (private mode,
// blocked storage, quota) and everything restored is validated; anything
// unexpected falls back to the defaults instead of crashing the app.
import { scenarioPresets } from './data/scenarios';
import { INTEREST_ONLY_MORTGAGE } from './calculations';

export const STORAGE_KEY = 'trinity-sim-v1';
const VERSION = 1;
const MAX_COMPARISONS = 2;

export const VIEWS = ['welcome', 'input', 'summary', 'results'];

export const DEFAULT_STATE = Object.freeze({
  currentView: 'welcome',
  selectedScenarioId: null,
  formData: null,
  simulationData: null,
  comparisonIds: [],
});

const NUMBER_FIELDS = [
  'homePurchasePrice', 'interestRate', 'loanTerm', 'landValuePercent',
  'totalBuilderCostsPercent', 'annualAppreciationRate', 'saleYear',
  'drHortonAppreciationShare', 'berkshireAppreciationShare',
  'interestSplitBerkshire', 'interestSplitDrHorton', 'refiYear',
  'equityExtractionPercent', 'newInterestRate', 'newLoanTerm',
  'earlyActionYear', 'lumpSumPayment', 'ownershipDuration',
  'startingMortgageRate', 'appreciationRatePerCycle', 'drHortonProfitShare',
  'berkshireProfitShare', 'marketBenchmarkIRR',
];
const BOOLEAN_FIELDS = [
  'enableInterestIncome', 'enableCashOutRefi', 'enableEarlyAction', 'enableRecurringRevenue',
];
const STRING_FIELDS = ['earlyActionType', 'profitTreatment', 'partnershipMode'];
const MORTGAGE_TYPES = ['Principal + Interest (Standard)', INTEREST_ONLY_MORTGAGE];

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// Returns a sanitized copy of a persisted form, or null if it is corrupt.
// Number fields may be '' (the input panel keeps '' while a field is being
// edited); calculateMetrics already coerces those safely.
const sanitizeFormData = (raw) => {
  if (!isPlainObject(raw)) return null;
  const clean = {};
  for (const key of NUMBER_FIELDS) {
    if (!(key in raw)) continue;
    const v = raw[key];
    if (v !== '' && !(typeof v === 'number' && Number.isFinite(v))) return null;
    clean[key] = v;
  }
  for (const key of BOOLEAN_FIELDS) {
    if (!(key in raw)) continue;
    if (typeof raw[key] !== 'boolean') return null;
    clean[key] = raw[key];
  }
  for (const key of STRING_FIELDS) {
    if (!(key in raw)) continue;
    if (typeof raw[key] !== 'string') return null;
    clean[key] = raw[key];
  }
  if ('mortgageType' in raw) {
    if (!MORTGAGE_TYPES.includes(raw.mortgageType)) return null;
    clean.mortgageType = raw.mortgageType;
  }
  if ('eventTypes' in raw) {
    const et = raw.eventTypes;
    if (!isPlainObject(et) || !Object.values(et).every((b) => typeof b === 'boolean')) return null;
    clean.eventTypes = { ...et };
  }
  // A form without a purchase price is not something we saved.
  if (typeof clean.homePurchasePrice !== 'number' && clean.homePurchasePrice !== '') return null;
  return clean;
};

// Validates a parsed payload; returns a full state object or null.
export const validateState = (raw) => {
  if (!isPlainObject(raw) || raw.version !== VERSION) return null;
  if (!VIEWS.includes(raw.currentView)) return null;

  const selectedScenarioId = raw.selectedScenarioId ?? null;
  if (selectedScenarioId !== null && !Object.prototype.hasOwnProperty.call(scenarioPresets, selectedScenarioId)) {
    return null;
  }

  const formData = raw.formData == null ? null : sanitizeFormData(raw.formData);
  if (raw.formData != null && !formData) return null;
  const simulationData = raw.simulationData == null ? null : sanitizeFormData(raw.simulationData);
  if (raw.simulationData != null && !simulationData) return null;

  const ids = raw.comparisonIds ?? [];
  if (!Array.isArray(ids)) return null;
  const comparisonIds = [...new Set(ids)]
    .filter((id) => typeof id === 'string' && Object.prototype.hasOwnProperty.call(scenarioPresets, id))
    .slice(0, MAX_COMPARISONS);

  // Each step needs the data it renders.
  if (raw.currentView === 'summary' && !formData) return null;
  if (raw.currentView === 'results' && !simulationData) return null;

  return { currentView: raw.currentView, selectedScenarioId, formData, simulationData, comparisonIds };
};

const getStorage = () => {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null; // accessing localStorage itself can throw when blocked
  }
};

export const loadState = () => {
  try {
    const raw = getStorage()?.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const state = validateState(JSON.parse(raw));
    if (!state) {
      clearState(); // corrupt or from an incompatible version
      return { ...DEFAULT_STATE };
    }
    return state;
  } catch {
    return { ...DEFAULT_STATE };
  }
};

const isPristine = (s) =>
  s.currentView === 'welcome' && !s.formData && !s.simulationData && s.comparisonIds.length === 0;

export const saveState = (state) => {
  try {
    const storage = getStorage();
    if (!storage) return;
    if (isPristine(state)) {
      storage.removeItem(STORAGE_KEY); // nothing worth restoring
      return;
    }
    storage.setItem(STORAGE_KEY, JSON.stringify({
      version: VERSION,
      currentView: state.currentView,
      selectedScenarioId: state.selectedScenarioId,
      formData: state.formData,
      simulationData: state.simulationData,
      comparisonIds: state.comparisonIds,
    }));
  } catch {
    // Storage full or unavailable: persistence is a convenience, ignore.
  }
};

export function clearState() {
  try {
    getStorage()?.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
