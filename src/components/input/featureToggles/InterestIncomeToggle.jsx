import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Slider,
  Card,
  FormControlLabel,
  Switch,
  Collapse,
} from '@mui/material';
import { SliderLabel } from '../../common/FormSection';

function InterestIncomeToggle({ formData, handleSwitchChange, setFormData }) {
  return (
    <Card sx={{ p: { xs: 2, md: 2.5 }, boxShadow: 'none', bgcolor: formData.enableInterestIncome ? 'background.paper' : 'brand.surfaceMuted', transition: 'background-color 150ms ease-out' }}>
      <FormControlLabel
        sx={{ alignItems: 'flex-start', m: 0, gap: 1.5, '& .MuiSwitch-root': { mt: -0.5, flexShrink: 0 } }}
        control={
          <Switch
            checked={formData.enableInterestIncome}
            onChange={handleSwitchChange('enableInterestIncome')}
            color="primary"
          />
        }
        label={
          <Box>
            <Typography variant="subtitle2" component="h3">
              Interest income sharing (50/50 default)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              DR Horton and Berkshire receive equal shares of mortgage interest payments as part of the 50/50 partnership model
            </Typography>
          </Box>
        }
      />

      <Collapse in={formData.enableInterestIncome}>
        <Box mt={3} pt={3} sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <SliderLabel id="brk-interest-label" label="Berkshire interest share" value={`${formData.interestSplitBerkshire}%`} />
              <Slider
                aria-labelledby="brk-interest-label"
                value={formData.interestSplitBerkshire}
                onChange={(e, value) => {
                  setFormData(prev => ({
                    ...prev,
                    interestSplitBerkshire: value,
                    interestSplitDrHorton: 100 - value
                  }));
                }}
                min={0}
                max={100}
                step={5}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 50, label: '50%' },
                  { value: 100, label: '100%' }
                ]}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <SliderLabel id="drh-interest-label" label="DR Horton interest share" value={`${formData.interestSplitDrHorton}%`} />
              <Slider
                aria-labelledby="drh-interest-label"
                value={formData.interestSplitDrHorton}
                onChange={(e, value) => {
                  setFormData(prev => ({
                    ...prev,
                    interestSplitDrHorton: value,
                    interestSplitBerkshire: 100 - value
                  }));
                }}
                min={0}
                max={100}
                step={5}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 50, label: '50%' },
                  { value: 100, label: '100%' }
                ]}
              />
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Card>
  );
}

export default InterestIncomeToggle;