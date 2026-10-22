import React from 'react';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import { EditOutlined as EditOutlinedIcon } from '@mui/icons-material';
import { calculateMetrics } from '../utils/calculations';
import SectionHeading from './common/SectionHeading';
import Note from './common/Note';
import Reveal from './common/Reveal';

const formatCurrency = (value) => {
  if (isNaN(value)) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};
const formatPercentage = (value) => `${value}%`;

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

// "Assumptions used": the inputs behind the results on screen, so a reader
// can check them without leaving Results (this replaces the former Summary
// step). Figures and notes are the ones the Summary screen showed.
function AssumptionsUsed({ simulationData, onNavigateToInput }) {
  if (!simulationData) return null;
  const data = simulationData;
  const metrics = calculateMetrics(data);

  const features = [
    data.enableInterestIncome && 'Interest income sharing',
    data.enableCashOutRefi && 'Cash-out refinance',
    data.enableEarlyAction && (data.earlyActionType === 'payoff' ? `Early mortgage payoff, year ${data.earlyActionYear}` : `Early sale, year ${data.earlyActionYear}`),
    data.enableRecurringRevenue && 'Recurring revenue model',
  ].filter(Boolean);

  const panel = { p: { xs: 2.5, md: 3 }, height: '100%', minWidth: 0 };

  return (
    <Container component="section" id="results-assumptions" aria-labelledby="assumptions-used-title" sx={{ mt: 7, scrollMarginTop: { xs: 88, md: 136 } }}>
      <SectionHeading
        eyebrow="Inputs"
        title={<span id="assumptions-used-title">Assumptions used</span>}
        description="The values behind these results. The appreciation split and cost shares are under Deal structure above."
        action={
          <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={onNavigateToInput}>
            Edit assumptions
          </Button>
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2, md: 3 } }}>
        <Reveal index={0} sx={{ minWidth: 0 }}>
          <Paper variant="outlined" component="section" aria-labelledby="assumptions-property-title" sx={panel}>
            <Typography variant="h5" component="h3" id="assumptions-property-title" sx={{ mb: 1 }}>Property and financing</Typography>
            <DefinitionList rows={[
              { label: 'Purchase price', value: formatCurrency(data.homePurchasePrice) },
              { label: 'Land value', value: `${formatPercentage(data.landValuePercent)} (${formatCurrency(metrics.landValue)})` },
              { label: 'Builder costs', value: `${formatPercentage(data.totalBuilderCostsPercent)} (${formatCurrency(metrics.totalBuilderCost)})` },
              { label: 'Mortgage type', value: data.mortgageType },
              { label: 'Interest rate', value: formatPercentage(data.interestRate) },
              { label: 'Loan term', value: `${data.loanTerm} years` },
            ]} />
          </Paper>
        </Reveal>
        <Reveal index={1} sx={{ minWidth: 0 }}>
          <Paper variant="outlined" component="section" aria-labelledby="assumptions-market-title" sx={panel}>
            <Typography variant="h5" component="h3" id="assumptions-market-title" sx={{ mb: 1 }}>Market, timeline and features</Typography>
            <DefinitionList rows={[
              { label: 'Appreciation rate', value: `${formatPercentage(data.annualAppreciationRate)} annually` },
              { label: 'Exit year', value: `Year ${metrics.effectiveSaleYear}` },
              { label: 'Optional features', value: features.length ? features.join(', ') : 'None' },
            ]} />
          </Paper>
        </Reveal>
      </Box>

      {data.enableInterestIncome && (
        <Note title="Interest income enabled." sx={{ mt: 3 }} data-testid="summary-interest-note">
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
    </Container>
  );
}

export default AssumptionsUsed;
