import React from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Card,
  FormControlLabel,
  Switch,
  Collapse,
  InputAdornment,
} from '@mui/material';
import Note from '../../common/Note';
import { CASH_OUT_REFI_NOTE } from '../../../utils/calculations';

function CashOutRefiToggle({ formData, handleSwitchChange, handleInputChange }) {
  return (
    <Card sx={{ p: { xs: 2, md: 2.5 }, boxShadow: 'none', bgcolor: formData.enableCashOutRefi ? 'background.paper' : 'brand.surfaceMuted', transition: 'background-color 150ms ease-out' }}>
      <FormControlLabel
        sx={{ alignItems: 'flex-start', m: 0, gap: 1.5, '& .MuiSwitch-root': { mt: -0.5, flexShrink: 0 } }}
        control={
          <Switch
            checked={formData.enableCashOutRefi}
            onChange={handleSwitchChange('enableCashOutRefi')}
            color="primary"
          />
        }
        label={
          <Box>
            <Typography variant="subtitle2" component="h3">
              Cash-out refinance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Model a refinance scenario where homeowner extracts equity
            </Typography>
          </Box>
        }
      />

      <Collapse in={formData.enableCashOutRefi}>
        <Box mt={3} pt={3} sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Refinance year"
                type="number"
                value={formData.refiYear}
                onChange={handleInputChange('refiYear')}
                inputProps={{ min: 1, max: 29 }}
                helperText="Year when refinance occurs"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Equity extraction"
                type="number"
                value={formData.equityExtractionPercent}
                onChange={handleInputChange('equityExtractionPercent')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                inputProps={{ min: 0, max: 100 }}
                helperText="Percentage of equity to extract"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="New interest rate"
                type="number"
                value={formData.newInterestRate}
                onChange={handleInputChange('newInterestRate')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                inputProps={{ step: 0.01, min: 0 }}
                helperText="New mortgage rate after refi"
              />
            </Grid>
            <Grid item xs={12}>
              <Note data-testid="cash-out-refi-note">{CASH_OUT_REFI_NOTE}</Note>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Card>
  );
}

export default CashOutRefiToggle;