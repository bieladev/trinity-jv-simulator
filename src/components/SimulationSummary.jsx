import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import {
  ArrowBackOutlined as ArrowBackIcon,
  FileDownloadOutlined as FileDownloadOutlinedIcon,
} from '@mui/icons-material';
import { calculateMetrics } from '../utils/calculations';
import PageHeader from './common/PageHeader';
import Note from './common/Note';
import StakeholderLabel from './common/StakeholderLabel';
import AnimatedNumber from './common/AnimatedNumber';
import Reveal from './common/Reveal';

// Label / value list used for the assumption groups.
function DefinitionList({ rows }) {
  return (
    <Box component="dl" sx={{ m: 0 }}>
      {rows.map((row, i) => (
        <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2, py: 1.25, borderTop: i === 0 ? 'none' : '1px solid', borderColor: 'divider' }}>
          <Typography component="dt" variant="body2" color="text.secondary">{row.label}</Typography>
          <Typography component="dd" variant="body2" sx={{ m: 0, fontWeight: 600, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{row.value}</Typography>
        </Box>
      ))}
    </Box>
  );
}

function SimulationSummary({ 
  formData, 
  scenarioName = "Custom scenario",
  onEditAssumptions,
  onRunSimulation 
}) {
  const data = formData || {};

  const formatCurrency = (value) => {
    if (isNaN(value)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value}%`;
  };

  const metrics = calculateMetrics(data);

  const handleRunSimulation = () => {
    if (onRunSimulation) {
      onRunSimulation(data);
    }
  };

  const generatePDFContent = () => {
    const currentDate = new Date().toLocaleDateString();
    
    return `
Trinity Joint Venture Housing Simulation Report (50/50 Partnership Model)
Generated: ${currentDate}

SCENARIO: ${scenarioName}

ASSUMPTIONS SUMMARY:
• Home Purchase Price: ${formatCurrency(data.homePurchasePrice)}
• Annual Appreciation Rate: ${formatPercentage(data.annualAppreciationRate)}
• Loan Type: ${data.mortgageType}
• Interest Rate: ${formatPercentage(data.interestRate)}
• Loan Term: ${data.loanTerm} years
• Sale Year: ${metrics.effectiveSaleYear}
• Total Builder Costs: ${formatPercentage(data.totalBuilderCostsPercent)}
• Land Value: ${formatPercentage(data.landValuePercent)}

50/50 PARTNERSHIP STRUCTURE:
• Total Project Cost: ${formatCurrency(metrics.totalProjectCost)}
• DR Horton Cost Share (50%): ${formatCurrency(metrics.drHortonCostShare)}
• Berkshire Cost Share (50%): ${formatCurrency(metrics.berkshireCostShare)}

APPRECIATION SHARING:
• DR Horton Share: ${formatPercentage(metrics.drHortonAppreciationShare)}
• Berkshire Share: ${formatPercentage(metrics.berkshireAppreciationShare)}
• Homeowner Share: ${formatPercentage(metrics.homeownerAppreciationShare)}

KEY PROJECTIONS:
• Estimated Total Appreciation: ${formatCurrency(metrics.totalAppreciation)}
• Final Property Value: ${formatCurrency(metrics.futureValue)}
• Total Homeowner Equity: ${formatCurrency(metrics.homeownerEquity)}
• Homeowner Return Multiple: ${metrics.returnMultiple.toFixed(2)}x

STAKEHOLDER RETURNS (50/50 PARTNERSHIP):
• DR Horton Cost Share: ${formatCurrency(metrics.drHortonCostShare)}
• DR Horton Appreciation Share: ${formatCurrency(metrics.drHortonAppreciation)}
• Berkshire Cost Share: ${formatCurrency(metrics.berkshireCostShare)}
• Berkshire Appreciation Share: ${formatCurrency(metrics.berkshireAppreciation)}

${data.enableInterestIncome ? `
INTEREST INCOME (50/50 SPLIT):
• ${metrics.refiOccurred ? `Interest on the Original Loan (to Year ${metrics.refiYear})` : `Total Interest Over ${metrics.effectiveSaleYear} Years`}: ${formatCurrency(metrics.jvLoanInterestPaid)}
• Berkshire Interest Share (${data.interestSplitBerkshire}%): ${formatCurrency(metrics.berkshireInterestIncome)}
• DR Horton Interest Share (${data.interestSplitDrHorton}%): ${formatCurrency(metrics.drHortonInterestIncome)}
` : ''}
${metrics.refiOccurred ? `
CASH-OUT REFINANCE (YEAR ${metrics.refiYear}):
• Cash-Out: ${formatCurrency(metrics.cashOut)} (${metrics.equityExtractionPercent}% of ${formatCurrency(metrics.refiEquityAvailable)} equity)
• Homeowner: ${formatCurrency(metrics.homeownerCashOut)} · DR Horton: ${formatCurrency(metrics.drHortonCashOut)} · Berkshire: ${formatCurrency(metrics.berkshireCashOut)}
` : ''}${data.enableRecurringRevenue ? `
RECURRING REVENUE:
• Resales Before Exit: ${metrics.recurringResales}
• Recurring Profit: ${formatCurrency(metrics.recurringProfit)} (DR Horton ${formatCurrency(metrics.drHortonRecurringProfit)}, Berkshire ${formatCurrency(metrics.berkshireRecurringProfit)})
` : ''}
DISCLAIMER:
This simulation tool is for illustrative purposes only and does not constitute 
financial advice or guarantees. All projections are based on the assumptions 
provided and actual results may vary significantly.

Generated by Trinity Joint Venture Simulator
    `;
  };

  const downloadPDF = (content, filename) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Trinity JV Summary Report</title>
        <style>
          body { font-family: Inter, system-ui, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #1f5fa8; border-bottom: 2px solid #1f5fa8; padding-bottom: 10px; }
          h2 { color: #0f1b2d; margin-top: 30px; }
          .metric { margin: 8px 0; }
          .disclaimer { margin-top: 40px; padding: 20px; background-color: #e8edf4; border-left: 4px solid #d9822b; }
          pre { white-space: pre-wrap; font-family: Inter, system-ui, sans-serif; }
        </style>
      </head>
      <body>
        <pre>${content}</pre>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.replace('.pdf', '.html');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    alert("Summary downloaded as an HTML file. Open it in your browser and print to PDF if you need a PDF copy.");
  };

  const handleDownloadSummary = () => {
    const pdfContent = generatePDFContent();
    downloadPDF(pdfContent, `Trinity-JV-Summary-${scenarioName.replace(/\s+/g, '-')}.pdf`);
  };

  const getDisplayTitle = () => {
    if (scenarioName) return scenarioName;
    if (data.enableCashOutRefi) return "Cash-Out Refinance Scenario";
    if (data.enableEarlyAction) return `Early ${data.earlyActionType} at Year ${data.earlyActionYear}`;
    if (data.enableRecurringRevenue) return "Recurring Revenue Model";
    return "Custom scenario";
  };

  const panel = { p: { xs: 2.5, md: 3 }, height: '100%', minWidth: 0 };

  return (
    <Container>
      <PageHeader
        eyebrow={`Summary · ${getDisplayTitle()}`}
        title="Review the simulation summary"
        description="Check your assumptions and key projections before you run the full simulation."
        actions={
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onEditAssumptions}>
            Edit assumptions
          </Button>
        }
      />

      <Note title="50/50 partnership model." sx={{ mb: 4 }}>
        Total project cost: {formatCurrency(metrics.totalProjectCost)}. DR Horton and Berkshire each contribute {formatCurrency(metrics.drHortonCostShare)} (50% each) and share profits equally.
      </Note>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2, md: 3 } }}>
        <Reveal index={0} sx={{ minWidth: 0 }}>
          <Paper variant="outlined" component="section" className="motion-lift" sx={panel}>
            <Typography variant="h5" component="h2" sx={{ mb: 1 }}>Property details</Typography>
            <DefinitionList rows={[
              { label: 'Purchase price', value: formatCurrency(data.homePurchasePrice) },
              { label: 'Land value', value: `${formatPercentage(data.landValuePercent)} (${formatCurrency(metrics.landValue)})` },
              { label: 'Builder costs', value: `${formatPercentage(data.totalBuilderCostsPercent)} (${formatCurrency(metrics.totalBuilderCost)})` },
              { label: 'Mortgage type', value: data.mortgageType },
            ]} />
          </Paper>
        </Reveal>
        <Reveal index={1} sx={{ minWidth: 0 }}>
          <Paper variant="outlined" component="section" className="motion-lift" sx={panel}>
            <Typography variant="h5" component="h2" sx={{ mb: 1 }}>Market assumptions</Typography>
            <DefinitionList rows={[
              { label: 'Interest rate', value: formatPercentage(data.interestRate) },
              { label: 'Loan term', value: `${data.loanTerm} years` },
              { label: 'Appreciation rate', value: `${formatPercentage(data.annualAppreciationRate)} annually` },
              { label: 'Exit year', value: `Year ${metrics.effectiveSaleYear}` },
            ]} />
          </Paper>
        </Reveal>
      </Box>

      <Box component="section" sx={{ mt: 7 }}>
        <Typography variant="h3" component="h2" sx={{ mb: 3 }}>Key projections</Typography>
        <Paper variant="outlined" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' } }}>
          {[
            { label: 'Total appreciation', value: metrics.totalAppreciation, sub: `Over ${metrics.effectiveSaleYear} years` },
            { label: 'Final property value', value: metrics.futureValue, sub: `At year ${metrics.effectiveSaleYear}` },
            { label: 'Homeowner equity', value: metrics.homeownerEquity, sub: 'Total at exit' },
          ].map((o, i) => (
            <Reveal index={i} key={o.label} sx={{ p: { xs: 2.5, md: 3 }, borderStyle: 'solid', borderWidth: { xs: i === 0 ? 0 : '1px 0 0 0', sm: i === 0 ? 0 : '0 0 0 1px' }, borderColor: 'divider', minWidth: 0 }}>
              <Typography variant="overline" component="p" color="text.secondary">{o.label}</Typography>
              <Typography variant="metric" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>
                <AnimatedNumber value={o.value} format={formatCurrency} />
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{o.sub}</Typography>
            </Reveal>
          ))}
        </Paper>
      </Box>

      <Box component="section" sx={{ mt: 7 }}>
        <Typography variant="h3" component="h2">Appreciation sharing</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          Distribution: Homeowner {formatPercentage(metrics.homeownerAppreciationShare)}, DR Horton {formatPercentage(metrics.drHortonAppreciationShare)}, Berkshire {formatPercentage(metrics.berkshireAppreciationShare)}.
        </Typography>
        <Paper variant="outlined" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' } }}>
          {[
            { key: 'homeowner', label: 'Homeowner share', value: metrics.homeownerAppreciation },
            { key: 'drHorton', label: 'DR Horton share', value: metrics.drHortonAppreciation },
            { key: 'berkshire', label: 'Berkshire share', value: metrics.berkshireAppreciation },
          ].map((o, i) => (
            <Reveal index={i} key={o.key} sx={{ p: { xs: 2.5, md: 3 }, borderStyle: 'solid', borderWidth: { xs: i === 0 ? 0 : '1px 0 0 0', sm: i === 0 ? 0 : '0 0 0 1px' }, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary"><StakeholderLabel stakeholder={o.key}>{o.label}</StakeholderLabel></Typography>
              <Typography variant="metricSm" sx={{ mt: 0.75 }}>
                <AnimatedNumber value={o.value} format={formatCurrency} />
              </Typography>
            </Reveal>
          ))}
        </Paper>

        {data.enableInterestIncome && (
          <Note title="Interest income enabled (50/50 split)." sx={{ mt: 3 }}>
            {metrics.refiOccurred
              ? `Interest on the original loan to year ${metrics.refiYear}: ${formatCurrency(metrics.jvLoanInterestPaid)}.`
              : `Total interest over ${metrics.effectiveSaleYear} years: ${formatCurrency(metrics.totalInterestPaid)}.`}{' '}
            DR Horton receives {formatCurrency(metrics.drHortonInterestIncome)}; Berkshire receives {formatCurrency(metrics.berkshireInterestIncome)}.
          </Note>
        )}

        {metrics.refiOccurred && (
          <Note title={`Cash-out refinance in year ${metrics.refiYear}.`} sx={{ mt: 2 }} data-testid="summary-refi-note">
            {formatCurrency(metrics.cashOut)} extracted ({metrics.equityExtractionPercent}% of {formatCurrency(metrics.refiEquityAvailable)} equity). Homeowner receives {formatCurrency(metrics.homeownerCashOut)}; DR Horton {formatCurrency(metrics.drHortonCashOut)}; Berkshire {formatCurrency(metrics.berkshireCashOut)}.
          </Note>
        )}

        {data.enableCashOutRefi && !metrics.refiOccurred && (
          <Note title="Cash-out refinance not applied." sx={{ mt: 2 }} data-testid="summary-refi-skipped-note">
            The refinance year falls after the exit in year {metrics.effectiveSaleYear}, so no refinance is modelled.
          </Note>
        )}

        {data.enableRecurringRevenue && (
          <Note title="Recurring revenue enabled." sx={{ mt: 2 }} data-testid="summary-recurring-note">
            {metrics.recurringResales} resale{metrics.recurringResales === 1 ? '' : 's'} before exit. Recurring profit: {formatCurrency(metrics.recurringProfit)}, split 50/50: DR Horton {formatCurrency(metrics.drHortonRecurringProfit)}; Berkshire {formatCurrency(metrics.berkshireRecurringProfit)}.
          </Note>
        )}
      </Box>

      <Box sx={{ mt: 7, pt: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, justifyContent: 'flex-end', gap: 1.5 }}>
        <Button variant="outlined" size="large" startIcon={<FileDownloadOutlinedIcon />} onClick={handleDownloadSummary}>
          Download summary
        </Button>
        <Button variant="contained" size="large" onClick={handleRunSimulation}>
          Run full simulation
        </Button>
      </Box>
    </Container>
  );
}

export default SimulationSummary;