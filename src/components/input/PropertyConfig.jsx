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

const formatPercent = (v) => `${v}%`;

function PropertyConfig({ formData, handleInputChange, handleSliderChange }) {
  return (
    <FormSection id="section-property" index="01" title="Property" description="Purchase price and how it divides between land and the builder's costs.">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Home purchase price"
            type="number"
            value={formData.homePurchasePrice}
            onChange={handleInputChange('homePurchasePrice')}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            inputProps={{ min: 0, step: 1000 }}
            helperText="Total purchase price of the home"
          />
        </Grid>
        
        <Grid item xs={12}>
          <SliderLabel id="land-value-label" label="Land value, % of home" value={formData.landValuePercent} format={formatPercent} />
          <Slider
            aria-labelledby="land-value-label"
            value={formData.landValuePercent}
            onChange={handleSliderChange('landValuePercent')}
            min={10}
            max={100}
            step={1}
            marks={[{ value: 10, label: '10%' }, { value: 25, label: '25%' }, { value: 50, label: '50%' }, { value: 75, label: '75%' }, { value: 100, label: '100%' }]}
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12}>
          <SliderLabel id="builder-costs-label" label="Total builder costs, % of home" value={formData.totalBuilderCostsPercent} format={formatPercent} />
          <Slider
            aria-labelledby="builder-costs-label"
            value={formData.totalBuilderCostsPercent}
            onChange={handleSliderChange('totalBuilderCostsPercent')}
            min={10}
            max={100}
            step={1}
            marks={[{ value: 10, label: '10%' }, { value: 50, label: '50%' }, { value: 75, label: '75%' }, { value: 100, label: '100%' }]}
            sx={{ mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            Total amount paid to DR Horton for construction, including both costs and profit margin. In the 50/50 model, both partners share these costs equally.
          </Typography>
        </Grid>
      </Grid>
    </FormSection>
  );
}

export default PropertyConfig;