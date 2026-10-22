import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import FormSection from '../common/FormSection';

function FinancingConfig({ formData, handleInputChange }) {
  return (
    <FormSection id="section-financing" index="02" title="Financing" description="The homeowner's mortgage: rate, term and repayment type.">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Interest rate"
            type="number"
            value={formData.interestRate}
            onChange={handleInputChange('interestRate')}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            inputProps={{ step: 0.01, min: 0 }}
            helperText="Annual mortgage interest rate"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Loan term"
            type="number"
            value={formData.loanTerm}
            onChange={handleInputChange('loanTerm')}
            InputProps={{
              endAdornment: <InputAdornment position="end">years</InputAdornment>,
            }}
            inputProps={{ min: 1, max: 40, step: 1 }}
            helperText="Mortgage term in years"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="mortgage-type-label">Mortgage type</InputLabel>
            <Select
              value={formData.mortgageType}
              onChange={handleInputChange('mortgageType')}
              labelId="mortgage-type-label"
              label="Mortgage type"
            >
              <MenuItem value="Principal + Interest (Standard)">Principal + Interest (Standard)</MenuItem>
              <MenuItem value="Interest-Only (Balloon Payment)">Interest-Only (Balloon Payment)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </FormSection>
  );
}

export default FinancingConfig;