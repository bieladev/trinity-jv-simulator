import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  FormControlLabel,
  Switch,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  Checkbox,
} from '@mui/material';
import Note from '../../common/Note';
import { RECURRING_REVENUE_NOTE } from '../../../utils/calculations';

function RecurringRevenueToggle({ formData, handleSwitchChange, handleInputChange, handleEventTypeChange }) {
  return (
    <Card sx={{ p: { xs: 2, md: 2.5 }, boxShadow: 'none', bgcolor: formData.enableRecurringRevenue ? 'background.paper' : 'brand.surfaceMuted', transition: 'background-color 150ms ease-out' }}>
      <FormControlLabel
        sx={{ alignItems: 'flex-start', m: 0, gap: 1.5, '& .MuiSwitch-root': { mt: -0.5, flexShrink: 0 } }}
        control={
          <Switch
            checked={formData.enableRecurringRevenue}
            onChange={handleSwitchChange('enableRecurringRevenue')}
            color="primary"
          />
        }
        label={
          <Box>
            <Typography variant="subtitle2" component="h3">
              Recurring revenue model (50/50 profits)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Model recurring profits through repeat property sales over 30 years with 50/50 profit sharing
            </Typography>
          </Box>
        }
      />

      <Collapse in={formData.enableRecurringRevenue}>
        <Box mt={3} pt={3} sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Average ownership duration</InputLabel>
                <Select
                  value={formData.ownershipDuration}
                  onChange={handleInputChange('ownershipDuration')}
                  label="Average ownership duration"
                >
                  <MenuItem value={3}>3 years</MenuItem>
                  <MenuItem value={5}>5 years</MenuItem>
                  <MenuItem value={7}>7 years</MenuItem>
                  <MenuItem value={10}>10 years</MenuItem>
                  <MenuItem value={15}>15 years</MenuItem>
                  <MenuItem value={30}>30 years</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Profit treatment at exit</InputLabel>
                <Select
                  value={formData.profitTreatment}
                  onChange={handleInputChange('profitTreatment')}
                  label="Profit treatment at exit"
                >
                  <MenuItem value="reinvest">Reinvest proceeds in a new buyer</MenuItem>
                  <MenuItem value="takeProfit">Take profits and do not reinvest</MenuItem>
                  <MenuItem value="hybrid">Hybrid: reinvest half, take half as profit</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" component="h4" sx={{ mb: 0.5 }}>
                Events that trigger recurrence
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.eventTypes.sale}
                      onChange={handleEventTypeChange('sale')}
                    />
                  }
                  label="Sale"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.eventTypes.refinance}
                      onChange={handleEventTypeChange('refinance')}
                    />
                  }
                  label="Refinance"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.eventTypes.earlyPayoff}
                      onChange={handleEventTypeChange('earlyPayoff')}
                    />
                  }
                  label="Early payoff"
                />
              </FormGroup>
            </Grid>
            <Grid item xs={12}>
              <Note data-testid="recurring-revenue-note">{RECURRING_REVENUE_NOTE}</Note>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Card>
  );
}

export default RecurringRevenueToggle;