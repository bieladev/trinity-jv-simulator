import { describe, it, expect } from 'vitest';
import {
  amortizeLoan,
  computeIRR,
  computeCashFlowIRR,
  solveBalancedShares,
  partnerCashFlows,
  normalizeScenarioInputs,
  calculateMetrics,
  generateYearlySeries,
  INTEREST_ONLY_MORTGAGE,
} from './calculations';
import { scenarioPresets } from './data/scenarios';

const STANDARD = 'Principal + Interest (Standard)';
const presetEntries = Object.entries(scenarioPresets);
const standard = scenarioPresets.standard.data;

describe('amortizeLoan', () => {
  it('standard P&I: matches the closed-form balance and fully repays at term', () => {
    const loan = { loanAmount: 360000, interestRate: 5, loanTerm: 30, mortgageType: STANDARD };
    const r = 0.05 / 12;
    const n = 360;
    const payment = 360000 * (r * (1 + r) ** n) / ((1 + r) ** n - 1);
    const after10 = amortizeLoan({ ...loan, years: 10 });
    const expectedBalance = 360000 * (1 + r) ** 120 - payment * ((1 + r) ** 120 - 1) / r;
    expect(after10.remainingBalance).toBeCloseTo(expectedBalance, 4);
    expect(after10.principalPaidDown + after10.remainingBalance).toBeCloseTo(360000, 6);
    expect(after10.totalInterestPaid).toBeCloseTo(payment * 120 - after10.principalPaidDown, 4);

    const atTerm = amortizeLoan({ ...loan, years: 30 });
    expect(atTerm.remainingBalance).toBe(0);
    expect(atTerm.principalPaidDown).toBeCloseTo(360000, 6);
    expect(atTerm.totalInterestPaid).toBeCloseTo(payment * n - 360000, 4);
  });

  it('interest-only: no principal, interest = balance x rate x years', () => {
    const r = amortizeLoan({ loanAmount: 360000, interestRate: 5, loanTerm: 30, mortgageType: INTEREST_ONLY_MORTGAGE, years: 10 });
    expect(r.principalPaidDown).toBe(0);
    expect(r.remainingBalance).toBe(360000);
    expect(r.totalInterestPaid).toBeCloseTo(360000 * 0.05 * 10, 6);
  });

  it('0% rate: straight-line principal, no interest', () => {
    const r = amortizeLoan({ loanAmount: 300000, interestRate: 0, loanTerm: 30, mortgageType: STANDARD, years: 10 });
    expect(r.totalInterestPaid).toBe(0);
    expect(r.principalPaidDown).toBeCloseTo(100000, 6);
    expect(r.remainingBalance).toBeCloseTo(200000, 6);
  });

  it('holding beyond the term stops at the term', () => {
    const loan = { loanAmount: 360000, interestRate: 5, loanTerm: 15, mortgageType: STANDARD };
    const atTerm = amortizeLoan({ ...loan, years: 15 });
    const beyond = amortizeLoan({ ...loan, years: 40 });
    expect(beyond).toEqual(atTerm);
    expect(beyond.remainingBalance).toBe(0);

    const ioAtTerm = amortizeLoan({ ...loan, mortgageType: INTEREST_ONLY_MORTGAGE, years: 15 });
    const ioBeyond = amortizeLoan({ ...loan, mortgageType: INTEREST_ONLY_MORTGAGE, years: 40 });
    expect(ioBeyond.totalInterestPaid).toBeCloseTo(ioAtTerm.totalInterestPaid, 6);
  });

  it('zero loan or zero years produces zeros', () => {
    expect(amortizeLoan({ loanAmount: 0, interestRate: 5, loanTerm: 30, mortgageType: STANDARD, years: 10 }))
      .toEqual({ principalPaidDown: 0, totalInterestPaid: 0, remainingBalance: 0 });
    const r = amortizeLoan({ loanAmount: 1000, interestRate: 5, loanTerm: 30, mortgageType: STANDARD, years: 0 });
    expect(r.principalPaidDown).toBeCloseTo(0, 9);
    expect(r.totalInterestPaid).toBeCloseTo(0, 9);
    expect(r.remainingBalance).toBeCloseTo(1000, 9);
  });
});

describe('computeIRR', () => {
  it('annualizes total gain', () => {
    expect(computeIRR(100, 100, 1)).toBeCloseTo(100, 9);
    expect(computeIRR(100, 21, 2)).toBeCloseTo(10, 9);
    expect(computeIRR(100, 0, 5)).toBeCloseTo(0, 9);
  });

  it('returns 0 for non-positive capital or years', () => {
    expect(computeIRR(0, 100, 5)).toBe(0);
    expect(computeIRR(-10, 100, 5)).toBe(0);
    expect(computeIRR(100, 100, 0)).toBe(0);
    expect(computeIRR(100, 100, -1)).toBe(0);
    expect(computeIRR(NaN, 100, 5)).toBe(0);
  });

  it('total loss is -100%, losses beyond capital are capped at -100%', () => {
    expect(computeIRR(100, -100, 5)).toBeCloseTo(-100, 9);
    expect(computeIRR(100, -250, 5)).toBe(-100);
  });

  it('handles fractional years', () => {
    expect(computeIRR(100, 50, 2.5)).toBeCloseTo((1.5 ** (1 / 2.5) - 1) * 100, 9);
  });
});

describe('computeCashFlowIRR', () => {
  it('solves known cash-flow series', () => {
    expect(computeCashFlowIRR([{ t: 0, amount: -100 }, { t: 1, amount: 110 }])).toBeCloseTo(10, 8);
    // Level annuity: 1000 now, 5 x 263.797480 back at 10%.
    const annuity = [{ t: 0, amount: -1000 }, ...[1, 2, 3, 4, 5].map((t) => ({ t, amount: 263.797480 }))];
    expect(computeCashFlowIRR(annuity)).toBeCloseTo(10, 4);
    // 5% coupon bond bought at par yields 5%.
    const bond = [{ t: 0, amount: -1000 }, { t: 1, amount: 50 }, { t: 2, amount: 50 }, { t: 3, amount: 1050 }];
    expect(computeCashFlowIRR(bond)).toBeCloseTo(5, 6);
    // Fractional timing: doubling in 2.5 years.
    expect(computeCashFlowIRR([{ t: 0, amount: -1 }, { t: 2.5, amount: 2 }])).toBeCloseTo((2 ** (1 / 2.5) - 1) * 100, 6);
  });

  it('agrees with computeIRR for a single end-of-period payoff', () => {
    expect(computeCashFlowIRR([{ t: 0, amount: -180000 }, { t: 30, amount: 419224 }]))
      .toBeCloseTo(computeIRR(180000, 239224, 30), 6);
  });

  it('handles losses and degenerate series without NaN', () => {
    expect(computeCashFlowIRR([{ t: 0, amount: -100 }, { t: 2, amount: 81 }])).toBeCloseTo(-10, 6);
    expect(computeCashFlowIRR([{ t: 0, amount: -100 }, { t: 3, amount: 0 }])).toBe(-100); // nothing back
    expect(computeCashFlowIRR([{ t: 1, amount: 100 }])).toBe(0); // nothing invested
    expect(computeCashFlowIRR([])).toBe(0);
    expect(computeCashFlowIRR(null)).toBe(0);
    expect(computeCashFlowIRR([{ t: 0, amount: -100 }, { t: 1, amount: NaN }, { t: 1, amount: 120 }])).toBeCloseTo(20, 6);
    const extreme = computeCashFlowIRR([{ t: 0, amount: -1 }, { t: 100, amount: 1e-9 }]);
    expect(Number.isFinite(extreme)).toBe(true);
    expect(extreme).toBeLessThan(-15);
  });
});

describe('normalizeScenarioInputs', () => {
  it('coerces strings and blanks', () => {
    const n = normalizeScenarioInputs({ homePurchasePrice: '250000', interestRate: '', loanTerm: '', saleYear: '12' });
    expect(n.homePurchasePrice).toBe(250000);
    expect(n.interestRate).toBe(0);
    expect(n.loanTerm).toBe(30);
    expect(n.effectiveSaleYear).toBe(12);
  });

  it('clamps negative price and rate to zero', () => {
    const n = normalizeScenarioInputs({ homePurchasePrice: -5, interestRate: -3 });
    expect(n.homePurchasePrice).toBe(0);
    expect(n.interestRate).toBe(0);
  });

  it('caps loan term floor, appreciation floor and hold years', () => {
    const n = normalizeScenarioInputs({ loanTerm: -1, annualAppreciationRate: -500, saleYear: 500 });
    expect(n.loanTerm).toBe(1);
    expect(n.annualAppreciationRate).toBe(-99.99);
    expect(n.effectiveSaleYear).toBe(100);
    expect(normalizeScenarioInputs({ saleYear: -4 }).effectiveSaleYear).toBe(0);
  });

  it('scales cost and appreciation-share percentages down to 100%', () => {
    const n = normalizeScenarioInputs({ landValuePercent: 60, totalBuilderCostsPercent: 90, drHortonAppreciationShare: 80, berkshireAppreciationShare: 80 });
    expect(n.landValuePercent + n.totalBuilderCostsPercent).toBeCloseTo(100, 9);
    expect(n.landValuePercent / n.totalBuilderCostsPercent).toBeCloseTo(60 / 90, 9);
    expect(n.drHortonAppreciationShare + n.berkshireAppreciationShare).toBeCloseTo(100, 9);
  });

  it('exit year: early action wins; a cash-out refi no longer moves the exit', () => {
    expect(normalizeScenarioInputs({ saleYear: 30, enableEarlyAction: true, earlyActionYear: 7 }).effectiveSaleYear).toBe(7);
    const refi = normalizeScenarioInputs({ saleYear: 30, enableCashOutRefi: true, refiYear: 10 });
    expect(refi.effectiveSaleYear).toBe(30);
    expect(refi.refiOccurs).toBe(true);
    // A refi after the exit never happens.
    expect(normalizeScenarioInputs({ saleYear: 8, enableCashOutRefi: true, refiYear: 10 }).refiOccurs).toBe(false);
  });

  it('clamps the new refi, split and recurring inputs', () => {
    const n = normalizeScenarioInputs({
      interestRate: 4, interestSplitDrHorton: 150, interestSplitBerkshire: -20,
      equityExtractionPercent: 180, newInterestRate: -2, newLoanTerm: 0,
      ownershipDuration: 0, profitTreatment: 'hybrid',
    });
    expect(n.interestSplitDrHorton).toBe(100);
    expect(n.interestSplitBerkshire).toBe(0);
    expect(n.equityExtractionPercent).toBe(100);
    expect(n.newInterestRate).toBe(0);
    expect(n.newLoanTerm).toBe(30);
    expect(n.ownershipDuration).toBe(7);
    expect(n.reinvestFraction).toBe(0.5);
    // Missing new rate falls back to the original rate.
    expect(normalizeScenarioInputs({ interestRate: 4 }).newInterestRate).toBe(4);
    expect(normalizeScenarioInputs({ profitTreatment: 'takeProfit' }).reinvestFraction).toBe(0);
  });

  it('survives null / empty input', () => {
    expect(() => normalizeScenarioInputs(null)).not.toThrow();
    expect(() => calculateMetrics({})).not.toThrow();
  });
});

describe('presets', () => {
  it.each(presetEntries)('%s: every metric and series value is finite', (_id, preset) => {
    const m = calculateMetrics(preset.data);
    for (const [key, value] of Object.entries(m)) {
      if (typeof value === 'number') expect(Number.isFinite(value), key).toBe(true);
    }
    for (const point of generateYearlySeries(preset.data)) {
      for (const [key, value] of Object.entries(point)) expect(Number.isFinite(value), `${key}@${point.year}`).toBe(true);
    }
  });

  it.each(presetEntries)('%s: last series point equals calculateMetrics', (_id, preset) => {
    const m = calculateMetrics(preset.data);
    const series = generateYearlySeries(preset.data);
    const last = series[series.length - 1];
    expect(last.year).toBe(m.effectiveSaleYear);
    expect(last.homeValue).toBeCloseTo(m.futureValue, 6);
    expect(last.homeownerEquity).toBeCloseTo(m.homeownerEquity, 6);
    expect(last.drHortonShare).toBeCloseTo(m.drHortonAppreciation + m.drHortonCashOut, 6);
    expect(last.berkshireShare).toBeCloseTo(m.berkshireAppreciation + m.berkshireCashOut, 6);
    expect(last.totalAppreciation).toBeCloseTo(m.totalAppreciation, 6);
    expect(last.principalPaid).toBeCloseTo(m.principalPaidDown, 6);
    expect(last.remainingBalance).toBeCloseTo(m.remainingBalance, 6);
    expect(last.interestPaid).toBeCloseTo(m.totalInterestPaid, 6);
    expect(last.cashOut).toBeCloseTo(m.cashOut, 6);
    expect(last.recurringProfit).toBeCloseTo(m.recurringProfit, 6);
    expect(last.drHortonTotalReturn).toBeCloseTo(m.drHortonTotalReturn, 6);
    expect(last.berkshireTotalReturn).toBeCloseTo(m.berkshireTotalReturn, 6);
  });

  it('last series point also matches with every optional feature on', () => {
    const data = {
      ...standard, saleYear: 30, enableCashOutRefi: true, refiYear: 10, equityExtractionPercent: 50,
      newInterestRate: 6.5, enableRecurringRevenue: true, ownershipDuration: 7, profitTreatment: 'hybrid',
      eventTypes: { sale: true, refinance: true, earlyPayoff: false },
    };
    const m = calculateMetrics(data);
    const last = generateYearlySeries(data).at(-1);
    expect(last.homeownerEquity).toBeCloseTo(m.homeownerEquity, 6);
    expect(last.drHortonTotalReturn).toBeCloseTo(m.drHortonTotalReturn, 6);
    expect(last.remainingBalance).toBeCloseTo(m.remainingBalance, 6);
  });

  it('homeowner equity still decomposes into its parts', () => {
    for (const [, preset] of presetEntries) {
      const m = calculateMetrics(preset.data);
      expect(m.homeownerEquity).toBeCloseTo(
        m.downPayment + m.principalPaidDown + m.homeownerAppreciation + m.homeownerCashOut - m.cashOut, 6,
      );
    }
  });
});

describe('interest income: partner-funded loan, cash-flow IRR', () => {
  it('year-0 outlay is cost share + loan share; profit unchanged; IRR solved on the flows', () => {
    const m = calculateMetrics(standard);
    expect(m.drHortonLoanFunding).toBeCloseTo(m.loanAmount * 0.5, 6);
    expect(m.drHortonCapitalBase).toBeCloseTo(m.drHortonCostShare + m.loanAmount * 0.5, 6);
    expect(m.drHortonTotalReturn).toBeCloseTo(m.drHortonAppreciation + m.drHortonInterestIncome, 6);
    const flows = partnerCashFlows(standard, 'drHorton');
    expect(flows[0]).toEqual({ t: 0, amount: -m.drHortonCapitalBase });
    expect(flows.at(-1).t).toBe(30);
    expect(flows).toHaveLength(31); // year 0 plus years 1..30
    expect(m.drHortonIRR).toBeCloseTo(computeCashFlowIRR(flows), 9);
  });

  it.each(presetEntries)('%s: partner flows sum to profit, and IRR >= the full-hold-loan figure', (_id, preset) => {
    const m = calculateMetrics(preset.data);
    for (const who of ['drHorton', 'berkshire']) {
      const flows = partnerCashFlows(preset.data, who);
      const sum = flows.reduce((acc, f) => acc + f.amount, 0);
      expect(sum).toBeCloseTo(m[`${who}TotalReturn`], 4);
      const understated = computeIRR(m[`${who}CapitalBase`], m[`${who}TotalReturn`], m.effectiveSaleYear);
      expect(m[`${who}IRR`]).toBeGreaterThanOrEqual(understated - 1e-9);
      expect(Number.isFinite(m[`${who}IRR`])).toBe(true);
    }
  });

  it('refi: the outside lender repays the partners\' loan share and pays cash-out in the refi year; no loan flows after', () => {
    const data = { ...standard, saleYear: 30, enableCashOutRefi: true, refiYear: 10, equityExtractionPercent: 50, newInterestRate: 6.5 };
    const m = calculateMetrics(data);
    const flows = partnerCashFlows(data, 'drHorton');
    const year = (t) => flows.find((f) => f.t === t).amount;
    expect(year(10)).toBeGreaterThan(m.drHortonCashOut + 0.5 * 280000); // balance share (~$147K) + cash-out
    expect(year(11)).toBe(0);
    expect(year(29)).toBe(0);
    expect(flows.reduce((a, f) => a + f.amount, 0)).toBeCloseTo(m.drHortonTotalReturn, 4);
  });

  it('balanced mode equalizes returns at a 50/50 interest split', () => {
    const b = solveBalancedShares(standard);
    expect(b.exact).toBe(true);
    expect(b.drHorton).toBeCloseTo(12.5, 6);
    expect(b.berkshire).toBeCloseTo(12.5, 6);
    expect(Math.abs(b.gap)).toBeLessThan(1e-6);
  });

  it('balanced mode equalizes returns with an uneven interest split', () => {
    const data = { ...standard, interestSplitDrHorton: 70, interestSplitBerkshire: 30 };
    const b = solveBalancedShares(data);
    expect(b.exact).toBe(true);
    expect(b.drHorton + b.berkshire).toBeCloseTo(25, 6);
    expect(Math.abs(b.gap)).toBeLessThan(0.05); // only the 0.1-point slider step remains
  });

  it('follows the interest split', () => {
    const m = calculateMetrics({ ...standard, interestSplitDrHorton: 70, interestSplitBerkshire: 30 });
    expect(m.drHortonLoanFunding).toBeCloseTo(m.loanAmount * 0.7, 6);
    expect(m.berkshireLoanFunding).toBeCloseTo(m.loanAmount * 0.3, 6);
  });

  it('with interest income off, the endpoint return on cost share is kept', () => {
    const m = calculateMetrics({ ...standard, enableInterestIncome: false });
    expect(m.drHortonLoanFunding).toBe(0);
    expect(m.drHortonCapitalBase).toBe(m.drHortonCostShare);
    expect(m.drHortonInterestIncome).toBe(0);
    expect(m.drHortonIRR).toBeCloseTo(computeIRR(m.drHortonCostShare, m.drHortonTotalReturn, 30), 9);
  });

  it('homeowner return still uses the endpoint formula', () => {
    const m = calculateMetrics(standard);
    expect(m.homeownerIRR).toBeCloseTo(computeIRR(m.downPayment, m.homeownerEquity - m.downPayment, 30), 9);
  });
});

describe('cash-out refinance', () => {
  const base = { ...standard, saleYear: 10, newInterestRate: 5, equityExtractionPercent: 50, refiYear: 10 };

  it('pays out extracted equity in the appreciation shares at the refi year', () => {
    const off = calculateMetrics({ ...base, enableCashOutRefi: false });
    const on = calculateMetrics({ ...base, enableCashOutRefi: true });
    expect(on.effectiveSaleYear).toBe(off.effectiveSaleYear);
    expect(on.refiOccurred).toBe(true);
    const expectedEquity = off.futureValue - off.remainingBalance;
    expect(on.refiEquityAvailable).toBeCloseTo(expectedEquity, 6);
    expect(on.cashOut).toBeCloseTo(expectedEquity * 0.5, 6);
    expect(on.drHortonCashOut).toBeCloseTo(on.cashOut * 0.125, 6);
    expect(on.berkshireCashOut).toBeCloseTo(on.cashOut * 0.125, 6);
    expect(on.homeownerCashOut).toBeCloseTo(on.cashOut * 0.75, 6);
    // Partners gain their cash-out share; the homeowner carries the new debt.
    expect(on.drHortonTotalReturn).toBeCloseTo(off.drHortonTotalReturn + on.drHortonCashOut, 6);
    expect(on.drHortonIRR).toBeGreaterThan(off.drHortonIRR);
    expect(on.homeownerEquity).toBeCloseTo(off.homeownerEquity - on.cashOut * 0.25, 6);
    expect(on.remainingBalance).toBeCloseTo(off.remainingBalance + on.cashOut, 6);
  });

  it('a refi before the exit adds new debt, then stops partner interest income', () => {
    const data = { ...standard, saleYear: 30, enableCashOutRefi: true, refiYear: 10, equityExtractionPercent: 50, newInterestRate: 6.5 };
    const on = calculateMetrics(data);
    const off = calculateMetrics({ ...data, enableCashOutRefi: false });
    expect(on.effectiveSaleYear).toBe(30);
    expect(on.drHortonCashOut).toBeGreaterThan(0);
    expect(on.drHortonInterestIncome).toBeLessThan(off.drHortonInterestIncome);
    expect(on.totalInterestPaid).toBeGreaterThan(on.jvLoanInterestPaid);
    const series = generateYearlySeries(data);
    // Balance jumps up by the cash-out at the refi year.
    expect(series[10].remainingBalance).toBeGreaterThan(series[9].remainingBalance);
    expect(series[10].cashOut).toBeCloseTo(on.cashOut, 6);
    expect(series[9].cashOut).toBe(0);
  });

  it('the refinance preset keeps its year-10 exit and now pays a cash-out', () => {
    const m = calculateMetrics(scenarioPresets.refinance.data);
    expect(m.effectiveSaleYear).toBe(10);
    expect(m.refiOccurred).toBe(true);
    expect(m.cashOut).toBeGreaterThan(0);
  });

  it('0% extraction changes nothing at exit', () => {
    const off = calculateMetrics({ ...base, enableCashOutRefi: false });
    const zero = calculateMetrics({ ...base, enableCashOutRefi: true, equityExtractionPercent: 0 });
    expect(zero.homeownerEquity).toBeCloseTo(off.homeownerEquity, 6);
    expect(zero.drHortonTotalReturn).toBeCloseTo(off.drHortonTotalReturn, 6);
  });
});

describe('recurring revenue', () => {
  const recurring = { ...standard, enableRecurringRevenue: true, ownershipDuration: 7, profitTreatment: 'reinvest', eventTypes: { sale: true, refinance: true, earlyPayoff: true } };

  it('adds positive profit split 50/50 when appreciation is positive', () => {
    const off = calculateMetrics(standard);
    const on = calculateMetrics(recurring);
    expect(on.recurringResales).toBe(4); // years 7, 14, 21, 28
    expect(on.recurringProfit).toBeGreaterThan(0);
    expect(on.drHortonRecurringProfit).toBeCloseTo(on.recurringProfit / 2, 9);
    expect(on.berkshireRecurringProfit).toBeCloseTo(on.recurringProfit / 2, 9);
    expect(on.drHortonTotalReturn).toBeCloseTo(off.drHortonTotalReturn + on.drHortonRecurringProfit, 6);
    expect(on.drHortonIRR).toBeGreaterThan(off.drHortonIRR);
    // Homeowner untouched.
    expect(on.homeownerEquity).toBeCloseTo(off.homeownerEquity, 6);
  });

  it('matches the hand calculation for one resale', () => {
    const m = calculateMetrics({ ...recurring, saleYear: 10, ownershipDuration: 5 });
    const v = (y) => 400000 * 1.03 ** y;
    const expected = 0.25 * (v(5) - v(0)) * (1.03 ** 5 - 1);
    expect(m.recurringResales).toBe(1);
    expect(m.recurringProfit).toBeCloseTo(expected, 6);
  });

  it('hybrid is half of reinvest; take-profit and unticked "Sale" add nothing', () => {
    const full = calculateMetrics(recurring).recurringProfit;
    expect(calculateMetrics({ ...recurring, profitTreatment: 'hybrid' }).recurringProfit).toBeCloseTo(full / 2, 6);
    expect(calculateMetrics({ ...recurring, profitTreatment: 'takeProfit' }).recurringProfit).toBe(0);
    expect(calculateMetrics({ ...recurring, eventTypes: { sale: false, refinance: true, earlyPayoff: true } }).recurringProfit).toBe(0);
  });

  it('adds nothing in a flat or falling market, or when no resale fits before exit', () => {
    expect(calculateMetrics({ ...recurring, annualAppreciationRate: 0 }).recurringProfit).toBe(0);
    expect(calculateMetrics({ ...recurring, annualAppreciationRate: -2 }).recurringProfit).toBe(0);
    expect(calculateMetrics({ ...recurring, ownershipDuration: 30 }).recurringResales).toBe(0);
  });

  it('reinvests partner refi cash-out when "Refinance" is a trigger', () => {
    const data = { ...recurring, ownershipDuration: 30, enableCashOutRefi: true, refiYear: 10, equityExtractionPercent: 50 };
    const withRefiTrigger = calculateMetrics(data);
    const withoutRefiTrigger = calculateMetrics({ ...data, eventTypes: { sale: true, refinance: false, earlyPayoff: true } });
    expect(withoutRefiTrigger.recurringProfit).toBe(0);
    expect(withRefiTrigger.recurringProfit).toBeCloseTo(
      (withRefiTrigger.drHortonCashOut + withRefiTrigger.berkshireCashOut) * (1.03 ** 20 - 1), 6,
    );
  });
});
