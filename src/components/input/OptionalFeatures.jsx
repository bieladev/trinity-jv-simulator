import React from 'react';
import { Grid } from '@mui/material';
import FormSection from '../common/FormSection';
import InterestIncomeToggle from './featureToggles/InterestIncomeToggle';
import CashOutRefiToggle from './featureToggles/CashOutRefiToggle';
import EarlyActionToggle from './featureToggles/EarlyActionToggle';
import RecurringRevenueToggle from './featureToggles/RecurringRevenueToggle';

function OptionalFeatures({ formData, setFormData, handleSwitchChange, handleInputChange, handleEventTypeChange }) {
  return (
    <FormSection id="section-optional" index="05" title="Optional features" description="Switch on the deal features you want included in the model.">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <InterestIncomeToggle
            formData={formData}
            handleSwitchChange={handleSwitchChange}
            setFormData={setFormData}
          />
        </Grid>

        <Grid item xs={12}>
          <CashOutRefiToggle
            formData={formData}
            handleSwitchChange={handleSwitchChange}
            handleInputChange={handleInputChange}
          />
        </Grid>

        <Grid item xs={12}>
          <EarlyActionToggle
            formData={formData}
            handleSwitchChange={handleSwitchChange}
            handleInputChange={handleInputChange}
          />
        </Grid>

        <Grid item xs={12}>
          <RecurringRevenueToggle
            formData={formData}
            handleSwitchChange={handleSwitchChange}
            handleInputChange={handleInputChange}
            handleEventTypeChange={handleEventTypeChange}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
}

export default OptionalFeatures;