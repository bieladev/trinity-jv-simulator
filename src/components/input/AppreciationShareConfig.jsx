import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import FormSection, { SliderLabel } from '../common/FormSection';
import Note from '../common/Note';
import { solveBalancedShares } from '../../utils/calculations';

function AppreciationShareConfig({ formData, handlePartnershipModeChange, handleAppreciationShareChange }) {
  const balance = formData.partnershipMode === 'balanced' ? solveBalancedShares(formData) : null;
  return (
    <FormSection id="section-appreciation" index="04" title="Appreciation share" description="How future appreciation divides between the homeowner and the two institutional partners.">
      <Note title="Appreciation sharing." sx={{ mb: 3 }}>
        DR Horton and Berkshire equally split a 25% share of property appreciation. The homeowner retains 75%. Adjust the sliders below to change the institutional split.
      </Note>

      <Box mb={4}>
        <Typography variant="subtitle2" component="h3" id="partnership-mode-label" sx={{ mb: 1.5 }}>
          Partnership mode
        </Typography>
        <ToggleButtonGroup
          value={formData.partnershipMode}
          exclusive
          fullWidth
          onChange={handlePartnershipModeChange}
          aria-labelledby="partnership-mode-label"
          sx={{ maxWidth: 640 }}
        >
          <ToggleButton value="realistic">Realistic · 12.5% each</ToggleButton>
          <ToggleButton value="balanced">Balanced return</ToggleButton>
          <ToggleButton value="custom">Custom</ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
          Balanced return mode sets the appreciation shares so DR Horton and Berkshire earn the same annualized return, and updates them as other assumptions change.
        </Typography>
        {balance && !balance.exact && (
          <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mt: 1 }} data-testid="balanced-not-exact">
            No split of the 25% share can fully equalize returns with these assumptions. The closest split leaves a {Math.abs(balance.gap).toFixed(2)}-point gap.
          </Typography>
        )}
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <SliderLabel id="drh-share-label" label="DR Horton share" value={`${formData.drHortonAppreciationShare}%`} />
          <Slider
            aria-labelledby="drh-share-label"
            value={formData.drHortonAppreciationShare}
            onChange={handleAppreciationShareChange('drHortonAppreciationShare')}
            min={0}
            max={25}
            step={0.1}
            marks={[
              { value: 0, label: '0%' },
              { value: 12.5, label: '12.5%' },
              { value: 25, label: '25%' }
            ]}
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <SliderLabel id="brk-share-label" label="Berkshire share" value={`${formData.berkshireAppreciationShare}%`} />
          <Slider
            aria-labelledby="brk-share-label"
            value={formData.berkshireAppreciationShare}
            onChange={handleAppreciationShareChange('berkshireAppreciationShare')}
            min={0}
            max={25}
            step={0.1}
            marks={[
              { value: 0, label: '0%' },
              { value: 12.5, label: '12.5%' },
              { value: 25, label: '25%' }
            ]}
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body1" color="text.secondary">Homeowner share</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {(100 - formData.drHortonAppreciationShare - formData.berkshireAppreciationShare).toFixed(1)}%
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </FormSection>
  );
}

export default AppreciationShareConfig;