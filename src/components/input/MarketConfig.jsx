import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Slider,
  InputAdornment,
} from '@mui/material';
import FormSection, { SliderLabel } from '../common/FormSection';

function MarketConfig({ formData, handleInputChange, handleSliderChange }) {
  return (
    <FormSection id="section-market" index="03" title="Market and timeline" description="Expected appreciation and the year the position is exited.">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Annual appreciation rate"
            type="number"
            value={formData.annualAppreciationRate}
            onChange={handleInputChange('annualAppreciationRate')}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            inputProps={{ step: 0.01 }}
            helperText="Expected annual property value growth"
          />
        </Grid>

        <Grid item xs={12}>
          <SliderLabel id="sale-year-label" label="Sale year" value={`Year ${formData.saleYear}`} />
          <Slider
            aria-labelledby="sale-year-label"
            value={formData.saleYear}
            onChange={handleSliderChange('saleYear')}
            min={5}
            max={30}
            step={1}
            marks={[
              { value: 5, label: '5' },
              { value: 10, label: '10' },
              { value: 15, label: '15' },
              { value: 20, label: '20' },
              { value: 25, label: '25' },
              { value: 30, label: '30' }
            ]}
            sx={{ mb: 1 }}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
}

export default MarketConfig;