// Single source of truth for the Trinity JV return model. Headline metrics
// (calculateMetrics) and the year-by-year chart series (generateYearlySeries)
// are both built from the same normalization, deal-structure and
// amortization helpers below, so the two can never disagree.

export const INTEREST_ONLY_MORTGAGE = 'Interest-Only (Balloon Payment)';

// User-facing explanation of the "Annualized return" figure (internally
// still called IRR). Kept here so every screen shows the same wording.
export const ANNUALIZED_RETURN_HELP =
  'Annualized from total gain over the hold period, counted at exit; monthly cash timing is not modelled.';
export const HOMEOWNER_RETURN_BASIS_NOTE =
  'Homeowner return counts the down payment as invested capital (mortgage payments are treated as housing cost).';
// Shown wherever partner annualized returns appear while interest income is on.
export const PARTNER_LOAN_CAPITAL_NOTE =
  'With interest income on, DR Horton and Berkshire fund the mortgage in their interest-split proportions, and their return is a cash-flow IRR: the loan counts as invested only while it is outstanding, interest and principal count in the year they are received, and the cost share and appreciation share come back at exit.';
// One-line assumption notes shown under the optional-feature toggles.
export const RECURRING_REVENUE_NOTE =
  'Assumption: the home resells to a new Trinity buyer every ownership period until the exit year. At each resale the partners realise their appreciation share to date; the reinvested part (all, half or none, per profit treatment) grows at the appreciation rate until exit. That extra growth is split 50/50. Homeowner figures are unchanged.';
export const CASH_OUT_REFI_NOTE =
  'Assumption: at the refinance year the homeowner borrows the extracted share of equity (home value less loan balance) from a new lender on the same mortgage type at the new rate (new 30-year term by default). The cash-out is paid to the homeowner, DR Horton and Berkshire in their appreciation shares; the homeowner carries the new debt, and partner interest income stops when the original loan is repaid. The refinance does not end the hold.';

export const normalizeScenarioInputs = (scenarioData) => {
  const {
    homePurchasePrice: rawHomePurchasePrice = 0,
    landValuePercent: rawLandValuePercent = 20,
    totalBuilderCostsPercent: rawTotalBuilderCostsPercent = 70,
    annualAppreciationRate: rawAnnualAppreciationRate = 3,
    interestRate: rawInterestRate = 5,
    loanTerm: rawLoanTerm = 30,
    saleYear = 30,
    mortgageType = 'Principal + Interest (Standard)',
    drHortonAppreciationShare: rawDrHortonAppreciationShare = 12.5,
    berkshireAppreciationShare: rawBerkshireAppreciationShare = 12.5,
    enableInterestIncome = true,
    interestSplitBerkshire = 50,
    interestSplitDrHorton = 50,
    enableEarlyAction = false,
    earlyActionYear = 7,
    enableCashOutRefi = false,
    refiYear: rawRefiYear = 10,
    equityExtractionPercent: rawEquityExtractionPercent = 50,
    newInterestRate: rawNewInterestRate,
    newLoanTerm: rawNewLoanTerm = 30,
    enableRecurringRevenue = false,
    ownershipDuration: rawOwnershipDuration = 7,
    profitTreatment = 'reinvest',
    eventTypes,
  } = scenarioData || {};

  // --- Defensive normalization -------------------------------------------
  // Inputs can arrive as strings (raw <input type="number"> values), be
  // left blank, or be edge-case/invalid (negative, zero, absurdly large).
  // Coerce and clamp everything here so the math below can never produce
  // NaN/Infinity or physically nonsensical output, regardless of what the
  // UI (or a preset) hands in.
  const homePurchasePrice = Math.max(0, Number(rawHomePurchasePrice) || 0);
  const interestRate = Math.max(0, Number(rawInterestRate) || 0);
  const loanTerm = Math.max(1, Number(rawLoanTerm) || 30);
  // Floor appreciation at -99.99% so (1 + rate/100) never goes to zero or
  // negative -- otherwise Math.pow() with a non-integer exponent (fractional
  // hold years) returns NaN.
  const annualAppreciationRate = Math.max(-99.99, Number(rawAnnualAppreciationRate) || 0);

  let landValuePercent = Math.max(0, Number(rawLandValuePercent) || 0);
  let totalBuilderCostsPercent = Math.max(0, Number(rawTotalBuilderCostsPercent) || 0);
  if (landValuePercent + totalBuilderCostsPercent > 100) {
    // Total project cost should never exceed the home's own purchase price.
    const scale = 100 / (landValuePercent + totalBuilderCostsPercent);
    landValuePercent *= scale;
    totalBuilderCostsPercent *= scale;
  }

  let drHortonAppreciationShare = Math.max(0, Number(rawDrHortonAppreciationShare) || 0);
  let berkshireAppreciationShare = Math.max(0, Number(rawBerkshireAppreciationShare) || 0);
  if (drHortonAppreciationShare + berkshireAppreciationShare > 100) {
    // Never let the institutional shares push the homeowner's share negative.
    const scale = 100 / (drHortonAppreciationShare + berkshireAppreciationShare);
    drHortonAppreciationShare *= scale;
    berkshireAppreciationShare *= scale;
  }

  const clampPercent = (v) => Math.min(100, Math.max(0, Number(v) || 0));

  // Clamp the effective hold period to a sane, non-negative range so stray
  // inputs (e.g. a typed "0" or an absurdly large early-action year) can't
  // blow up the amortization/appreciation math below.
  // A cash-out refinance is a liquidity event, not an exit, so it no longer
  // moves the exit year (only an early sale/payoff does).
  const effectiveSaleYear = Math.min(100, Math.max(0, Number(
    enableEarlyAction ? earlyActionYear : saleYear
  ) || 0));

  // --- Cash-out refinance inputs -------------------------------------------
  const refiYear = Math.min(100, Math.max(0, Number(rawRefiYear) || 0));
  // The refi only happens if it falls inside the hold (a refi in the exit
  // year itself still counts -- the "Refinance at Year 10" preset relies on it).
  const refiOccurs = Boolean(enableCashOutRefi) && refiYear > 0 && refiYear <= effectiveSaleYear;
  const equityExtractionPercent = clampPercent(rawEquityExtractionPercent);
  const newInterestRate = rawNewInterestRate === undefined || rawNewInterestRate === ''
    ? interestRate
    : Math.max(0, Number(rawNewInterestRate) || 0);
  const newLoanTerm = Math.max(1, Number(rawNewLoanTerm) || 30);

  // --- Recurring revenue inputs ---------------------------------------------
  const ownershipDuration = Math.max(1, Number(rawOwnershipDuration) || 7);
  const reinvestFraction = profitTreatment === 'takeProfit' ? 0 : profitTreatment === 'hybrid' ? 0.5 : 1;
  const triggers = eventTypes && typeof eventTypes === 'object' ? eventTypes : {};
  const recurrenceOnSale = triggers.sale !== false; // default on
  const recurrenceOnRefinance = triggers.refinance !== false; // default on

  return {
    homePurchasePrice, interestRate, loanTerm, annualAppreciationRate, mortgageType,
    landValuePercent, totalBuilderCostsPercent,
    drHortonAppreciationShare, berkshireAppreciationShare,
    enableInterestIncome: Boolean(enableInterestIncome),
    interestSplitBerkshire: clampPercent(interestSplitBerkshire),
    interestSplitDrHorton: clampPercent(interestSplitDrHorton),
    effectiveSaleYear,
    refiOccurs, refiYear, equityExtractionPercent, newInterestRate, newLoanTerm,
    enableRecurringRevenue: Boolean(enableRecurringRevenue),
    ownershipDuration, reinvestFraction, recurrenceOnSale, recurrenceOnRefinance,
  };
};

// Year-0 deal structure: everything that does not depend on the hold period.
const deriveDealStructure = (n) => {
  const landValue = n.homePurchasePrice * (n.landValuePercent / 100);
  const totalBuilderCost = n.homePurchasePrice * (n.totalBuilderCostsPercent / 100);
  const totalProjectCost = landValue + totalBuilderCost;

  const drHortonCostShare = totalProjectCost * 0.5;
  const berkshireCostShare = totalProjectCost * 0.5;
  const drHortonCashInflow = totalBuilderCost;

  const downPayment = n.homePurchasePrice * 0.1;
  const loanAmount = n.homePurchasePrice - downPayment;

  const homeownerAppreciationShare = 100 - n.drHortonAppreciationShare - n.berkshireAppreciationShare;

  // Interest income without capital fix: when the partners receive the
  // mortgage interest they are treated as the lender, funding the loan in
  // their interest-split proportions at year 0. The principal repaid to them
  // -- paid down during the hold plus the balance repaid at refinance/exit,
  // i.e. the whole loan -- is a return of that capital, so profit is
  // unchanged. The annualized return then uses the dated cash flows
  // (partnerCashFlows), so the loan only counts while it is outstanding.
  const drHortonLoanFunding = n.enableInterestIncome ? loanAmount * (n.interestSplitDrHorton / 100) : 0;
  const berkshireLoanFunding = n.enableInterestIncome ? loanAmount * (n.interestSplitBerkshire / 100) : 0;

  return {
    landValue, totalBuilderCost, totalProjectCost,
    drHortonCostShare, berkshireCostShare, drHortonCashInflow,
    downPayment, loanAmount, homeownerAppreciationShare,
    drHortonLoanFunding, berkshireLoanFunding,
    drHortonCapitalBase: drHortonCostShare + drHortonLoanFunding,
    berkshireCapitalBase: berkshireCostShare + berkshireLoanFunding,
  };
};

// Mortgage position after `years` of payments. The only amortization code in
// the app -- used for both headline metrics and chart series.
export const amortizeLoan = ({ loanAmount, interestRate, loanTerm, mortgageType, years }) => {
  let totalInterestPaid = 0;
  let principalPaidDown = 0;

  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  // The mortgage can never accrue interest or pay down principal past its
  // own term -- once it is fully amortized the balance is zero and stays
  // there, however much longer the homeowner holds the property.
  const paymentsToSale = Math.min(years * 12, numPayments);

  if (loanAmount > 0 && numPayments > 0) {
    if (mortgageType === INTEREST_ONLY_MORTGAGE) {
      const monthlyPayment = loanAmount * monthlyRate;
      totalInterestPaid = monthlyPayment * paymentsToSale;
      principalPaidDown = 0;
    } else if (monthlyRate > 0) {
      const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
      const remainingBalance = paymentsToSale >= numPayments
        ? 0
        : loanAmount * Math.pow(1 + monthlyRate, paymentsToSale) - monthlyPayment * (Math.pow(1 + monthlyRate, paymentsToSale) - 1) / monthlyRate;
      principalPaidDown = Math.min(loanAmount, Math.max(0, loanAmount - remainingBalance));
      totalInterestPaid = Math.max(0, (monthlyPayment * paymentsToSale) - principalPaidDown);
    } else {
      // 0% interest rate: every payment is principal, straight-line payoff.
      principalPaidDown = Math.min(loanAmount, loanAmount * (paymentsToSale / numPayments));
      totalInterestPaid = 0;
    }
  }

  return {
    principalPaidDown,
    totalInterestPaid,
    remainingBalance: Math.max(0, loanAmount - principalPaidDown),
  };
};

const homeValueAt = (n, year) => n.homePurchasePrice * Math.pow(1 + n.annualAppreciationRate / 100, year);

// Cash-out refinance at n.refiYear (see CASH_OUT_REFI_NOTE). Returns null when
// no refi happens. Equity available = home value - original loan balance at
// the refi year; the cash-out is that times the equity-extraction %. The new
// loan (old balance + cash-out) comes from an outside lender.
const refinanceEvent = (n, deal) => {
  if (!n.refiOccurs) return null;
  const valueAtRefi = homeValueAt(n, n.refiYear);
  const original = amortizeLoan({
    loanAmount: deal.loanAmount, interestRate: n.interestRate, loanTerm: n.loanTerm,
    mortgageType: n.mortgageType, years: n.refiYear,
  });
  const equityAvailable = Math.max(0, valueAtRefi - original.remainingBalance);
  const cashOut = equityAvailable * (n.equityExtractionPercent / 100);
  return {
    original,
    equityAvailable,
    cashOut,
    newLoanAmount: original.remainingBalance + cashOut,
    // Distributed in the appreciation shares.
    homeownerCashOut: cashOut * (deal.homeownerAppreciationShare / 100),
    drHortonCashOut: cashOut * (n.drHortonAppreciationShare / 100),
    berkshireCashOut: cashOut * (n.berkshireAppreciationShare / 100),
  };
};

// Recurring revenue (see RECURRING_REVENUE_NOTE): the home resells every
// n.ownershipDuration years before the exit year. At each resale the two
// partners realise their combined appreciation share for that ownership
// cycle (losses are not reinvested); the reinvested fraction then grows at
// the appreciation rate until `year`. If "Refinance" is a trigger, the
// partners' refi cash-out is reinvested the same way. Only that extra growth
// is new profit -- the realised shares themselves are already counted in the
// appreciation share -- and it is split 50/50 per the toggle.
const recurringProfitAt = (n, refi, year) => {
  if (!n.enableRecurringRevenue || n.reinvestFraction === 0) return { profit: 0, resales: 0 };
  const growthTo = (fromYear) => Math.pow(1 + n.annualAppreciationRate / 100, year - fromYear) - 1;
  const partnerShare = (n.drHortonAppreciationShare + n.berkshireAppreciationShare) / 100;
  let profit = 0;
  let resales = 0;
  if (n.recurrenceOnSale) {
    let previous = 0;
    for (let resaleYear = n.ownershipDuration; resaleYear < n.effectiveSaleYear && resaleYear <= year; resaleYear += n.ownershipDuration) {
      const realised = Math.max(0, partnerShare * (homeValueAt(n, resaleYear) - homeValueAt(n, previous)));
      profit += n.reinvestFraction * realised * growthTo(resaleYear);
      previous = resaleYear;
      resales += 1;
    }
  }
  if (refi && n.recurrenceOnRefinance && n.refiYear <= year) {
    profit += n.reinvestFraction * (refi.drHortonCashOut + refi.berkshireCashOut) * growthTo(n.refiYear);
  }
  return { profit, resales };
};

// Every stakeholder's position at an arbitrary point in the hold period.
const positionAtYear = (n, deal, year) => {
  const futureValue = homeValueAt(n, year);
  const totalAppreciation = futureValue - n.homePurchasePrice;

  const homeownerAppreciation = totalAppreciation * (deal.homeownerAppreciationShare / 100);
  const drHortonAppreciation = totalAppreciation * (n.drHortonAppreciationShare / 100);
  const berkshireAppreciation = totalAppreciation * (n.berkshireAppreciationShare / 100);

  const refiEvent = refinanceEvent(n, deal);
  const refi = refiEvent && year >= n.refiYear ? refiEvent : null; // refi has happened by `year`

  let principalPaidDown;
  let totalInterestPaid;
  let remainingBalance;
  let jvLoanInterestPaid; // interest on the original (partner-funded) loan
  if (refi) {
    const newLoan = amortizeLoan({
      loanAmount: refi.newLoanAmount, interestRate: n.newInterestRate, loanTerm: n.newLoanTerm,
      mortgageType: n.mortgageType, years: year - n.refiYear,
    });
    // Principal the homeowner has repaid across both loans.
    principalPaidDown = refi.original.principalPaidDown + newLoan.principalPaidDown;
    totalInterestPaid = refi.original.totalInterestPaid + newLoan.totalInterestPaid;
    remainingBalance = newLoan.remainingBalance;
    jvLoanInterestPaid = refi.original.totalInterestPaid;
  } else {
    ({ principalPaidDown, totalInterestPaid, remainingBalance } = amortizeLoan({
      loanAmount: deal.loanAmount,
      interestRate: n.interestRate,
      loanTerm: n.loanTerm,
      mortgageType: n.mortgageType,
      years: year,
    }));
    jvLoanInterestPaid = totalInterestPaid;
  }

  let drHortonInterestIncome = 0;
  let berkshireInterestIncome = 0;
  if (n.enableInterestIncome) {
    drHortonInterestIncome = jvLoanInterestPaid * (n.interestSplitDrHorton / 100);
    berkshireInterestIncome = jvLoanInterestPaid * (n.interestSplitBerkshire / 100);
  }

  const cashOut = refi ? refi.cashOut : 0;
  const homeownerCashOut = refi ? refi.homeownerCashOut : 0;
  const drHortonCashOut = refi ? refi.drHortonCashOut : 0;
  const berkshireCashOut = refi ? refi.berkshireCashOut : 0;

  const recurring = recurringProfitAt(n, refiEvent, year);
  const drHortonRecurringProfit = recurring.profit / 2;
  const berkshireRecurringProfit = recurring.profit / 2;

  // Homeowner: down payment + principal repaid + appreciation share, plus the
  // cash they took out at refi, less the extra debt the cash-out added.
  const homeownerEquity = deal.downPayment + principalPaidDown + homeownerAppreciation + homeownerCashOut - cashOut;

  const drHortonProfit = drHortonAppreciation + drHortonInterestIncome + drHortonCashOut + drHortonRecurringProfit;
  const berkshireProfit = berkshireAppreciation + berkshireInterestIncome + berkshireCashOut + berkshireRecurringProfit;

  return {
    futureValue, totalAppreciation,
    homeownerAppreciation, drHortonAppreciation, berkshireAppreciation,
    principalPaidDown, totalInterestPaid, remainingBalance, jvLoanInterestPaid,
    drHortonInterestIncome, berkshireInterestIncome,
    cashOut, homeownerCashOut, drHortonCashOut, berkshireCashOut,
    recurringProfit: recurring.profit, recurringResales: recurring.resales,
    drHortonRecurringProfit, berkshireRecurringProfit,
    drHortonProfit, berkshireProfit,
    homeownerEquity,
  };
};

// Annualized return on capital ("Annualized return" in the UI), shared by
// all three stakeholders so the formula is consistent and never divides by a
// negative/zero "net investment" (the previous DR Horton-specific formula
// netted its cost share against the builder-cost cash it receives at
// closing, which is negative under normal cost splits and produced a
// nonsensical "-100%" even when DR Horton's dollar profit was strongly
// positive). See ANNUALIZED_RETURN_HELP for the user-facing caveat.
export const computeIRR = (capitalBase, profit, years) => {
  if (!(capitalBase > 0) || !(years > 0)) return 0;
  const ratio = (capitalBase + profit) / capitalBase;
  if (ratio < 0) return -100; // genuine total loss of capital
  return (Math.pow(ratio, 1 / years) - 1) * 100;
};

// Annualized IRR (%) of dated cash flows [{ t: years from purchase, amount }],
// e.g. -100 at t=0 and +110 at t=1 gives 10. Solved by bisection on a
// bracketed rate, so it always returns a finite number:
// - nothing invested (no negative flow): 0, like computeIRR with no capital;
// - invested but nothing back (no positive flow): -100 (total loss);
// - with multiple sign changes it returns one valid root of the bracket.
export const computeCashFlowIRR = (flows) => {
  const cf = (flows || []).filter((f) => Number.isFinite(f.t) && f.t >= 0 && Number.isFinite(f.amount) && f.amount !== 0);
  if (!cf.some((f) => f.amount < 0)) return 0;
  if (!cf.some((f) => f.amount > 0)) return -100;
  const npv = (r) => cf.reduce((sum, f) => sum + f.amount / Math.pow(1 + r, f.t), 0);
  // -99.9% is the floor: below it (1 + r)^t underflows over a 100-year hold.
  let lo = -0.999;
  let hi = 1;
  let fLo = npv(lo);
  let fHi = npv(hi);
  while (fLo * fHi > 0 && hi < 1e6) { hi *= 4; fHi = npv(hi); }
  if (!Number.isFinite(fLo) || !Number.isFinite(fHi)) return 0;
  if (fLo * fHi > 0) return fLo < 0 ? -100 : hi * 100; // root outside [-99.9%, 1e8%]
  for (let i = 0; i < 200 && hi - lo > 1e-12; i++) {
    const mid = (lo + hi) / 2;
    const fMid = npv(mid);
    if (fMid === 0) return mid * 100;
    if (fMid * fLo < 0) { hi = mid; } else { lo = mid; fLo = fMid; }
  }
  return ((lo + hi) / 2) * 100;
};

// Year-by-year cash flows of one partner ('drHorton' | 'berkshire') when the
// partners fund the loan (interest income on). Points: year 0, every whole
// year before exit, the refi year and the exit year (either may be
// fractional). Their sum equals the partner's profit.
//   year 0      -(cost share) - (loan share)
//   each year   + loan share x (interest + principal paid that year), only
//               while the partner-funded loan is outstanding
//   loan end    + loan share x balance still owed (repaid by the outside
//               lender at the refi year, or from the sale at exit)
//   refi year   + their refi cash-out
//   exit        + cost share back + appreciation share + recurring profit
export const partnerCashFlows = (scenarioData, who) => {
  const n = normalizeScenarioInputs(scenarioData);
  const deal = deriveDealStructure(n);
  const exit = n.effectiveSaleYear;
  const position = positionAtYear(n, deal, exit);
  const refi = refinanceEvent(n, deal);
  const loanShare = (who === 'drHorton' ? n.interestSplitDrHorton : n.interestSplitBerkshire) / 100;
  const costShare = deal[`${who}CostShare`];
  const loanEnd = refi ? n.refiYear : exit;

  const times = new Set([exit]);
  for (let y = 1; y < exit; y++) times.add(y);
  if (refi) times.add(n.refiYear);
  const points = [...times].filter((t) => t > 0).sort((a, b) => a - b);

  const flows = [{ t: 0, amount: -(costShare + loanShare * deal.loanAmount) }];
  let prev = { principalPaidDown: 0, totalInterestPaid: 0 };
  for (const t of points) {
    let amount = 0;
    if (t <= loanEnd) {
      const loan = amortizeLoan({
        loanAmount: deal.loanAmount, interestRate: n.interestRate, loanTerm: n.loanTerm,
        mortgageType: n.mortgageType, years: t,
      });
      amount += loanShare * (loan.totalInterestPaid - prev.totalInterestPaid + loan.principalPaidDown - prev.principalPaidDown);
      if (t === loanEnd) amount += loanShare * loan.remainingBalance;
      prev = loan;
    }
    if (refi && t === n.refiYear) amount += refi[`${who}CashOut`];
    if (t === exit) amount += costShare + position[`${who}Appreciation`] + position[`${who}RecurringProfit`];
    flows.push({ t, amount });
  }
  return flows;
};

export const calculateMetrics = (scenarioData) => {
  const n = normalizeScenarioInputs(scenarioData);
  const {
    homePurchasePrice, interestRate, annualAppreciationRate, mortgageType,
    drHortonAppreciationShare, berkshireAppreciationShare, effectiveSaleYear,
  } = n;

  const deal = deriveDealStructure(n);
  const {
    landValue, totalBuilderCost, totalProjectCost,
    drHortonCostShare, berkshireCostShare, drHortonCashInflow,
    downPayment, loanAmount, homeownerAppreciationShare,
    drHortonLoanFunding, berkshireLoanFunding, drHortonCapitalBase, berkshireCapitalBase,
  } = deal;

  const position = positionAtYear(n, deal, effectiveSaleYear);
  const {
    futureValue, totalAppreciation,
    homeownerAppreciation, drHortonAppreciation, berkshireAppreciation,
    principalPaidDown, totalInterestPaid, remainingBalance, jvLoanInterestPaid,
    drHortonInterestIncome, berkshireInterestIncome,
    cashOut, homeownerCashOut, drHortonCashOut, berkshireCashOut,
    recurringProfit, recurringResales, drHortonRecurringProfit, berkshireRecurringProfit,
    drHortonProfit, berkshireProfit,
    homeownerEquity,
  } = position;
  const drHortonTotalReturn = drHortonProfit;

  // Partner annualized return. Interest income off: endpoint return on the
  // cost share (unchanged). Interest income on: the partners also lend the
  // mortgage, so use a true IRR on their yearly cash flows -- the loan only
  // counts as invested while it is outstanding (see partnerCashFlows).
  const partnerIRR = (who, capitalBase, profit) => {
    if (!n.enableInterestIncome || !(effectiveSaleYear > 0)) return computeIRR(capitalBase, profit, effectiveSaleYear);
    return computeCashFlowIRR(partnerCashFlows(scenarioData, who));
  };
  const drHortonIRR = partnerIRR('drHorton', drHortonCapitalBase, drHortonProfit);
  const berkshireIRR = partnerIRR('berkshire', berkshireCapitalBase, berkshireProfit);
  const refi = refinanceEvent(n, deal);

  const homeownerIRR = computeIRR(downPayment, homeownerEquity - downPayment, effectiveSaleYear);

  let foreclosureRisk = "Low";
  if (annualAppreciationRate <= 0 || mortgageType.includes("Interest-Only")) {
    foreclosureRisk = "High";
  } else if (annualAppreciationRate < 2 || interestRate > 6) {
    foreclosureRisk = "Medium";
  }

  return {
    homePurchasePrice, landValue, totalBuilderCost, totalProjectCost, downPayment, loanAmount,
    futureValue, totalAppreciation, homeownerAppreciation, drHortonAppreciation, berkshireAppreciation,
    homeownerAppreciationShare, drHortonAppreciationShare, berkshireAppreciationShare,
    totalInterestPaid, principalPaidDown, homeownerEquity,
    drHortonCostShare, berkshireCostShare, drHortonCashInflow,
    drHortonInterestIncome, berkshireInterestIncome,
    drHortonTotalReturn,
    berkshireTotalReturn: berkshireProfit, // Corrected to show profit, not profit + principal
    homeownerIRR, drHortonIRR, berkshireIRR,
    effectiveSaleYear, foreclosureRisk,
    returnMultiple: homeownerEquity / (downPayment || 1),
    // Capital base used for the partner annualized returns.
    drHortonLoanFunding, berkshireLoanFunding, drHortonCapitalBase, berkshireCapitalBase,
    remainingBalance, jvLoanInterestPaid,
    // Cash-out refinance (zeros / null year when it does not happen).
    refiOccurred: Boolean(refi),
    refiYear: refi ? n.refiYear : null,
    equityExtractionPercent: n.equityExtractionPercent, // normalized (0-100)
    refiEquityAvailable: refi ? refi.equityAvailable : 0,
    refiNewLoanAmount: refi ? refi.newLoanAmount : 0,
    cashOut, homeownerCashOut, drHortonCashOut, berkshireCashOut,
    // Recurring revenue overlay.
    recurringProfit, recurringResales, drHortonRecurringProfit, berkshireRecurringProfit,
  };
};

// Year-by-year series for the charts. Runs from year 0 to the scenario's
// effective exit year (early sale / foreclosure / refi presets stop early),
// with an extra point at the exact exit year when it is fractional. Every
// point comes from the same positionAtYear() used by calculateMetrics, so the
// final point equals the headline metrics exactly (values are left
// unrounded; format at display time).
export const generateYearlySeries = (scenarioData) => {
  const n = normalizeScenarioInputs(scenarioData);
  const deal = deriveDealStructure(n);
  const exitYear = n.effectiveSaleYear;

  const years = [];
  for (let year = 0; year < exitYear; year++) years.push(year);
  years.push(exitYear);

  return years.map((year) => {
    const p = positionAtYear(n, deal, year);
    return {
      year,
      homeValue: p.futureValue,
      homeownerEquity: p.homeownerEquity,
      // Each partner's stake from the property: appreciation share plus any
      // refi cash-out already received (the cash-out moves value from the
      // homeowner's equity to the partners in the year it happens).
      drHortonShare: p.drHortonAppreciation + p.drHortonCashOut,
      berkshireShare: p.berkshireAppreciation + p.berkshireCashOut,
      totalAppreciation: p.totalAppreciation,
      principalPaid: p.principalPaidDown,
      remainingBalance: p.remainingBalance,
      interestPaid: p.totalInterestPaid,
      cashOut: p.cashOut,
      recurringProfit: p.recurringProfit,
      // Same totals as calculateMetrics' drHortonTotalReturn / berkshireTotalReturn.
      drHortonTotalReturn: p.drHortonProfit,
      berkshireTotalReturn: p.berkshireProfit,
    };
  });
};

// "Balanced return" partnership mode: split a fixed pool of appreciation
// share between DR Horton and Berkshire so their annualized returns match.
// DR Horton's return rises and Berkshire's falls as DR Horton's share grows,
// so the difference is monotonic and bisection over the whole pool finds the
// crossing. When no split within the pool can equalize them (e.g. a very
// lopsided interest split), the closest end of the range is returned and
// `exact` is false so the UI can say so.
export const solveBalancedShares = (scenarioData, pool = 25) => {
  const gapAt = (dr) => {
    const m = calculateMetrics({ ...scenarioData, drHortonAppreciationShare: dr, berkshireAppreciationShare: pool - dr });
    return m.drHortonIRR - m.berkshireIRR;
  };
  const round = (v) => Math.round(v * 10) / 10; // slider step
  const result = (dr) => {
    const drHorton = round(dr);
    return { drHorton, berkshire: round(pool - drHorton), gap: gapAt(drHorton) };
  };

  let lo = 0;
  let hi = pool;
  const gLo = gapAt(lo);
  const gHi = gapAt(hi);
  if (gLo > 0) return { ...result(lo), exact: false };
  if (gHi < 0) return { ...result(hi), exact: false };

  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (gapAt(mid) < 0) lo = mid; else hi = mid;
  }
  // Pick whichever 0.1 step around the root gives the smaller gap.
  const a = result(Math.floor(lo * 10) / 10);
  const b = result(Math.ceil(hi * 10) / 10);
  return { ...(Math.abs(a.gap) <= Math.abs(b.gap) ? a : b), exact: true };
};
