import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Button,
  Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PageHeader from './common/PageHeader';
import Note from './common/Note';
import { solveBalancedShares } from '../utils/calculations';
import PropertyConfig from './input/PropertyConfig';
import FinancingConfig from './input/FinancingConfig';
import MarketConfig from './input/MarketConfig';
import AppreciationShareConfig from './input/AppreciationShareConfig';
import OptionalFeatures from './input/OptionalFeatures';

const defaultFormData = {
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
};

function InputPanel({ onRunSimulation, onShowSummary, onFormChange, scenarioData, scenarioName }) {
  const [formData, setFormData] = useState(() => ({ ...defaultFormData, ...(scenarioData || {}) }));

  useEffect(() => {
    if (scenarioData) {
      setFormData(prev => ({ ...defaultFormData, ...scenarioData }));
    } else {
      setFormData({ ...defaultFormData });
    }
  }, [scenarioData]);

  // Report every edit upward so the app can persist in-progress changes.
  useEffect(() => {
    if (onFormChange) onFormChange(formData);
  }, [formData, onFormChange]);

  // In Balanced mode, keep the shares balanced as other assumptions change
  // (interest split, rates, hold period...). Only writes when the solved
  // shares actually differ, so it cannot loop.
  const { drHortonAppreciationShare: _dr, berkshireAppreciationShare: _brk, ...balanceInputs } = formData;
  const balanceKey = JSON.stringify(balanceInputs);
  useEffect(() => {
    if (formData.partnershipMode !== 'balanced') return;
    const { drHorton, berkshire } = solveBalancedShares(formData);
    if (drHorton !== formData.drHortonAppreciationShare || berkshire !== formData.berkshireAppreciationShare) {
      setFormData(prev => ({ ...prev, drHortonAppreciationShare: drHorton, berkshireAppreciationShare: berkshire }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balanceKey]);

  const handleInputChange = (field) => (event) => {
    let value;
    if (event.target.type === 'checkbox') {
      value = event.target.checked;
    } else if (event.target.type === 'number') {
      // Native number inputs always report event.target.value as a string;
      // coerce to an actual Number so downstream calculations never operate
      // on stringified form state. Keep '' while the user is mid-edit
      // (e.g. just cleared the field) instead of forcing it to 0.
      value = event.target.value === '' ? '' : Number(event.target.value);
    } else {
      value = event.target.value;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSliderChange = (field) => (event, newValue) => {
    setFormData(prev => ({ ...prev, [field]: newValue }));
  };

  const handlePartnershipModeChange = (event, newMode) => {
    if (newMode !== null) {
      let newDrHortonShare = formData.drHortonAppreciationShare;
      let newBerkshireShare = formData.berkshireAppreciationShare;

      if (newMode === 'realistic') {
        newDrHortonShare = 12.5;
        newBerkshireShare = 12.5;
      } else if (newMode === 'balanced') {
        const equalShares = solveBalancedShares(formData);
        newDrHortonShare = equalShares.drHorton;
        newBerkshireShare = equalShares.berkshire;
      }

      setFormData(prev => ({
        ...prev,
        partnershipMode: newMode,
        drHortonAppreciationShare: newDrHortonShare,
        berkshireAppreciationShare: newBerkshireShare
      }));
    }
  };

  const handleAppreciationShareChange = (field) => (event, newValue) => {
    setFormData(prev => {
      const maxShare = 25;
      let drHortonShare = prev.drHortonAppreciationShare;
      let berkshireShare = prev.berkshireAppreciationShare;
      
      if (field === 'drHortonAppreciationShare') {
        drHortonShare = newValue;
        berkshireShare = maxShare - newValue;
      } else if (field === 'berkshireAppreciationShare') {
        berkshireShare = newValue;
        drHortonShare = maxShare - newValue;
      }
      
      return { ...prev, drHortonAppreciationShare: drHortonShare, berkshireAppreciationShare: berkshireShare, partnershipMode: 'custom' };
    });
  };

  const handleSwitchChange = (field) => (event) => {
    setFormData(prev => ({ ...prev, [field]: event.target.checked }));
  };

  const handleEventTypeChange = (eventType) => (event) => {
    setFormData(prev => ({ ...prev, eventTypes: { ...prev.eventTypes, [eventType]: event.target.checked } }));
  };

  const getDisplayDescription = () => scenarioName && scenarioName !== 'Custom scenario'
    ? `Review the ${scenarioName} assumptions below. Every value can be changed before you run the simulation.`
    : "Set the assumptions for your own Trinity JV scenario. Every value can be changed before you run the simulation.";

  return (
    <Container>
      <PageHeader
        eyebrow="Step 2 · Assumptions"
        title="Define your assumptions"
        description={getDisplayDescription()}
        meta={<Chip label={scenarioName || 'Custom scenario'} variant="outlined" data-testid="input-scenario-name" />}
      />

      <Note title="50/50 partnership model." sx={{ mb: 4 }}>
        DR Horton and Berkshire Hathaway share all costs and profits equally by default. Land costs, construction costs, interest income and appreciation shares are split 50/50 unless you change them below.
      </Note>

      <Box sx={{ display: 'grid', gap: 3 }}>
        <PropertyConfig formData={formData} handleInputChange={handleInputChange} handleSliderChange={handleSliderChange} />
        <FinancingConfig formData={formData} handleInputChange={handleInputChange} />
        <MarketConfig formData={formData} handleInputChange={handleInputChange} handleSliderChange={handleSliderChange} />
        <AppreciationShareConfig formData={formData} handlePartnershipModeChange={handlePartnershipModeChange} handleAppreciationShareChange={handleAppreciationShareChange} />
        <OptionalFeatures formData={formData} setFormData={setFormData} handleSwitchChange={handleSwitchChange} handleInputChange={handleInputChange} handleEventTypeChange={handleEventTypeChange} />
      </Box>

      <Box
        sx={(theme) => ({
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          mt: 4,
          mx: { xs: -2, sm: -3, md: 0 },
          px: { xs: 2, sm: 3, md: 3 },
          py: 2,
          display: 'flex',
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          justifyContent: 'flex-end',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: alpha(theme.palette.background.default, 0.92),
          backdropFilter: 'blur(8px)',
          [theme.breakpoints.up('md')]: { border: '1px solid', borderColor: 'divider', borderRadius: '6px', bottom: 16, boxShadow: theme.shadows[8] },
        })}
      >
        <Button variant="outlined" size="large" onClick={() => onShowSummary(formData)} data-testid="show-summary-button">
          Review summary
        </Button>
        <Button variant="contained" size="large" onClick={() => onRunSimulation(formData)} data-testid="run-simulation-button">
          Run full simulation
        </Button>
      </Box>
    </Container>
  );
}

export default InputPanel;