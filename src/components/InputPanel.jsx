import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Button,
  Chip,
  GlobalStyles,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ArrowForwardOutlined as ArrowForwardIcon, UndoOutlined as UndoIcon } from '@mui/icons-material';
import PageHeader from './common/PageHeader';
import Note from './common/Note';
import JumpNav from './common/JumpNav';
import { solveBalancedShares } from '../utils/calculations';
import { defaultFormData, presetFormData, countChangedFields } from '../utils/data/defaults';
import PropertyConfig from './input/PropertyConfig';
import FinancingConfig from './input/FinancingConfig';
import MarketConfig from './input/MarketConfig';
import AppreciationShareConfig from './input/AppreciationShareConfig';
import OptionalFeatures from './input/OptionalFeatures';
import LivePreview from './input/LivePreview';

const SECTIONS = [
  { id: 'section-property', index: '01', label: 'Property' },
  { id: 'section-financing', index: '02', label: 'Financing' },
  { id: 'section-market', index: '03', label: 'Market and timeline' },
  { id: 'section-appreciation', index: '04', label: 'Appreciation share' },
  { id: 'section-optional', index: '05', label: 'Optional features' },
];

function InputPanel({ onRunSimulation, onFormChange, scenarioData, scenarioName, presetId = null }) {
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

  const isPreset = Boolean(presetFormData(presetId));
  const changedCount = isPreset ? countChangedFields(formData, presetId) : 0;
  const handleRestorePreset = () => {
    const base = presetFormData(presetId);
    if (base) setFormData(base);
    // The button removes itself once nothing differs; keep keyboard focus
    // on the page (the screen title) instead of losing it to <body>.
    const h1 = document.querySelector('main h1');
    if (h1) {
      h1.setAttribute('tabindex', '-1');
      h1.focus({ preventScroll: true });
    }
  };

  const getDisplayDescription = () => isPreset
    ? `Review the ${scenarioName} assumptions below. Every value can be changed, and the preview at the bottom of the screen updates as you edit.`
    : 'Set the assumptions for your own Trinity JV scenario. The preview at the bottom of the screen updates as you edit.';

  return (
    <Container>
      {/* Keyboard focus never lands under the sticky action bar: fields
          scrolled into view stop above it (phones: full-width bar, md+:
          floating card). Bottom only, so section jumps are unaffected. */}
      <GlobalStyles styles={{ html: { scrollPaddingBottom: 200, '@media (min-width: 900px)': { scrollPaddingBottom: 170 } } }} />
      <PageHeader
        eyebrow="Step 2 · Assumptions"
        title="Define your assumptions"
        description={getDisplayDescription()}
        meta={
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
            <Chip label={scenarioName || 'Custom scenario'} variant="outlined" data-testid="input-scenario-name" />
            {changedCount > 0 && (
              <>
                <Chip
                  label={`${changedCount} ${changedCount === 1 ? 'value' : 'values'} changed from the preset`}
                  size="small"
                  data-testid="input-changed-count"
                  sx={{ bgcolor: 'brand.surfaceMuted', color: 'text.primary' }}
                />
                <Button size="small" variant="text" startIcon={<UndoIcon />} onClick={handleRestorePreset} data-testid="restore-preset-button" sx={{ minHeight: { xs: 44, sm: 32 } }}>
                  Restore preset values
                </Button>
              </>
            )}
          </Box>
        }
      />

      <JumpNav label="Assumption sections" items={SECTIONS} />

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

      {/* Sticky action bar: the live answer on the left, one main action on the right. */}
      <Box
        sx={(theme) => ({
          position: 'sticky',
          zIndex: 10,
          mt: 4,
          mx: { xs: -2, sm: -3, md: 0 },
          px: { xs: 2, sm: 3, md: 3 },
          py: { xs: 1.5, md: 2 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          gap: { xs: 1.5, md: 4 },
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: alpha(theme.palette.background.default, 0.94),
          backdropFilter: 'blur(8px)',
          // Floating card from md up. Responsive values (not a second
          // breakpoint key) so the row layout above is not overridden.
          // Colour inside the shorthand: a bare '1px solid' resets it to
          // currentColor (a text-coloured outline instead of the hairline).
          border: { md: `1px solid ${theme.palette.divider}` },
          borderRadius: { md: '6px' },
          bottom: { xs: 0, md: 16 },
          boxShadow: { md: theme.shadows[8] },
        })}
      >
        <LivePreview formData={formData} />
        <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />} onClick={() => onRunSimulation(formData)} data-testid="run-simulation-button" sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
          View full results
        </Button>
      </Box>
    </Container>
  );
}

export default InputPanel;
