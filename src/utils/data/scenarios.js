export const scenarioPresets = {
  standard: {
    name: "Standard Home Purchase",
    data: {
      homePurchasePrice: 400000,
      landValuePercent: 20,
      totalBuilderCostsPercent: 70,
      interestRate: 5.00,
      loanTerm: 30,
      mortgageType: 'Principal + Interest (Standard)',
      annualAppreciationRate: 3.00,
      saleYear: 30,
      drHortonAppreciationShare: 12.5,
      berkshireAppreciationShare: 12.5,
      enableInterestIncome: true,
      interestSplitBerkshire: 50,
      interestSplitDrHorton: 50,
      enableCashOutRefi: false,
      enableEarlyAction: false,
      enableRecurringRevenue: false,
    }
  },
  refinance: {
    name: "Refinance at Year 10",
    data: {
      homePurchasePrice: 400000,
      landValuePercent: 20,
      totalBuilderCostsPercent: 70,
      interestRate: 5.00,
      loanTerm: 30,
      mortgageType: 'Principal + Interest (Standard)',
      annualAppreciationRate: 3.00,
      saleYear: 10,
      drHortonAppreciationShare: 12.5,
      berkshireAppreciationShare: 12.5,
      enableInterestIncome: true,
      interestSplitBerkshire: 50,
      interestSplitDrHorton: 50,
      enableCashOutRefi: true,
      refiYear: 10,
      equityExtractionPercent: 100,
      newInterestRate: 6.5,
      newLoanTerm: 30,
      enableEarlyAction: false,
      enableRecurringRevenue: false,
    }
  },
  earlySale: {
    name: "Early Sale at Year 7",
    data: {
      homePurchasePrice: 400000,
      landValuePercent: 20,
      totalBuilderCostsPercent: 70,
      interestRate: 5.00,
      loanTerm: 30,
      mortgageType: 'Principal + Interest (Standard)',
      annualAppreciationRate: 3.00,
      saleYear: 7,
      drHortonAppreciationShare: 12.5,
      berkshireAppreciationShare: 12.5,
      enableInterestIncome: true,
      interestSplitBerkshire: 50,
      interestSplitDrHorton: 50,
      enableEarlyAction: true,
      earlyActionYear: 7,
      earlyActionType: 'sale',
      enableCashOutRefi: false,
      enableRecurringRevenue: false,
    }
  },
  interestOnly: {
    name: "Interest-Only Mortgage",
    data: {
      homePurchasePrice: 400000,
      landValuePercent: 20,
      totalBuilderCostsPercent: 70,
      interestRate: 5.00,
      loanTerm: 30,
      mortgageType: 'Interest-Only (Balloon Payment)',
      annualAppreciationRate: 3.00,
      saleYear: 30,
      drHortonAppreciationShare: 12.5,
      berkshireAppreciationShare: 12.5,
      enableInterestIncome: true,
      interestSplitBerkshire: 50,
      interestSplitDrHorton: 50,
      enableCashOutRefi: false,
      enableEarlyAction: false,
      enableRecurringRevenue: false,
    }
  },
  highAppreciation: {
    name: "High Appreciation Market",
    data: {
      homePurchasePrice: 400000,
      landValuePercent: 20,
      totalBuilderCostsPercent: 70,
      interestRate: 5.00,
      loanTerm: 30,
      mortgageType: 'Principal + Interest (Standard)',
      annualAppreciationRate: 6.00,
      saleYear: 30,
      drHortonAppreciationShare: 12.5,
      berkshireAppreciationShare: 12.5,
      enableInterestIncome: true,
      interestSplitBerkshire: 50,
      interestSplitDrHorton: 50,
      enableCashOutRefi: false,
      enableEarlyAction: false,
      enableRecurringRevenue: false,
    }
  },
  flatMarket: {
    name: "Flat Market (0% Appreciation)",
    data: {
      homePurchasePrice: 400000,
      landValuePercent: 20,
      totalBuilderCostsPercent: 70,
      interestRate: 5.00,
      loanTerm: 30,
      mortgageType: 'Principal + Interest (Standard)',
      annualAppreciationRate: 0.00,
      saleYear: 30,
      drHortonAppreciationShare: 12.5,
      berkshireAppreciationShare: 12.5,
      enableInterestIncome: true,
      interestSplitBerkshire: 50,
      interestSplitDrHorton: 50,
      enableCashOutRefi: false,
      enableEarlyAction: false,
      enableRecurringRevenue: false,
    }
  },
  foreclosure: {
    name: "Foreclosure at Year 5",
    data: {
      homePurchasePrice: 400000,
      landValuePercent: 20,
      totalBuilderCostsPercent: 70,
      interestRate: 6.50,
      loanTerm: 30,
      mortgageType: 'Interest-Only (Balloon Payment)',
      annualAppreciationRate: 0.00,
      saleYear: 5,
      drHortonAppreciationShare: 12.5,
      berkshireAppreciationShare: 12.5,
      enableInterestIncome: true,
      interestSplitBerkshire: 50,
      interestSplitDrHorton: 50,
      enableEarlyAction: true,
      earlyActionYear: 5,
      earlyActionType: 'sale',
      enableCashOutRefi: false,
      enableRecurringRevenue: false,
    }
  },
  subsidized: {
    name: "Low-Income Subsidized Model",
    data: {
      homePurchasePrice: 350000,
      landValuePercent: 20,
      totalBuilderCostsPercent: 67,
      interestRate: 4.50,
      loanTerm: 30,
      mortgageType: 'Principal + Interest (Standard)',
      annualAppreciationRate: 3.00,
      saleYear: 30,
      drHortonAppreciationShare: 12.5,
      berkshireAppreciationShare: 12.5,
      enableInterestIncome: true,
      interestSplitBerkshire: 50,
      interestSplitDrHorton: 50,
      enableCashOutRefi: false,
      enableEarlyAction: false,
      enableRecurringRevenue: false,
    }
  },
  marketDecline: {
    name: "Market Value Decline",
    data: {
      homePurchasePrice: 400000,
      landValuePercent: 20,
      totalBuilderCostsPercent: 70,
      interestRate: 6.00,
      loanTerm: 30,
      mortgageType: 'Principal + Interest (Standard)',
      annualAppreciationRate: -2.00,
      saleYear: 30,
      drHortonAppreciationShare: 12.5,
      berkshireAppreciationShare: 12.5,
      enableInterestIncome: true,
      interestSplitBerkshire: 50,
      interestSplitDrHorton: 50,
      enableCashOutRefi: false,
      enableEarlyAction: false,
      enableRecurringRevenue: false,
    }
  },
};

export const comingSoonScenarios = {
  cashOutRefi: {
    name: "Cash-Out Refi",
    benchmarkData: { loanTerm: "—", appreciationRate: "—", homeownerReturn: "—", drHortonProfit: "—", berkshireReturn: "—", foreclosureRisk: "—" }
  },
  interestOnlyVsPi: {
    name: "Interest-Only vs P&I",
    benchmarkData: { loanTerm: "—", appreciationRate: "—", homeownerReturn: "—", drHortonProfit: "—", berkshireReturn: "—", foreclosureRisk: "—" }
  },
  earlyPayoff: {
    name: "Early Payoff or Sale",
    benchmarkData: { loanTerm: "—", appreciationRate: "—", homeownerReturn: "—", drHortonProfit: "—", berkshireReturn: "—", foreclosureRisk: "—" }
  },
  defaultRecovery: {
    name: "Temporary Default & Recovery",
    benchmarkData: { loanTerm: "—", appreciationRate: "—", homeownerReturn: "—", drHortonProfit: "—", berkshireReturn: "—", foreclosureRisk: "—" }
  },
  equityTransfer: {
    name: "Shared Equity Transfer",
    benchmarkData: { loanTerm: "—", appreciationRate: "—", homeownerReturn: "—", drHortonProfit: "—", berkshireReturn: "—", foreclosureRisk: "—" }
  }
};

export const primaryScenarios = [
  { id: "standard", title: "Standard Home Purchase", tooltip: "Baseline configuration with 30-year hold and 3% annual appreciation." },
  { id: "highAppreciation", title: "High Appreciation Market", tooltip: "Models a market with 6% average annual appreciation." },
  { id: "interestOnly", title: "Interest-Only Mortgage", tooltip: "Lower monthly payments with homeowner equity building only through appreciation." },
  { id: "refinance", title: "Refinance at Year 10", tooltip: "Homeowner refinances in Year 10 to buy out institutional partners." },
];

export const additionalScenarios = [
  { id: "earlySale", title: "Early Sale at Year 7", tooltip: "Homeowner sells the property in Year 7 with appreciation applied to 7 years." },
  { id: "flatMarket", title: "Flat Market (0% Appreciation)", tooltip: "Simulates a stagnant housing market with no value growth." },
  { id: "marketDecline", title: "Market Value Decline", tooltip: "Simulate the impact of a declining market on home equity and stakeholder returns." },
  { id: "foreclosure", title: "Foreclosure at Year 5", tooltip: "Homeowner defaults and the property is foreclosed with proceeds split per agreement." },
  { id: "subsidized", title: "Low-Income Subsidized Model", tooltip: "Reduced sale price with institutional subsidy and lower builder margin." },
];