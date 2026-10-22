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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

function EarlyActionToggle({ formData, handleSwitchChange, handleInputChange }) {
  return (
    <Card sx={{ p: { xs: 2, md: 2.5 }, boxShadow: 'none', bgcolor: formData.enableEarlyAction ? 'background.paper' : 'brand.surfaceMuted', transition: 'background-color 150ms ease-out' }}>
      <FormControlLabel
        sx={{ alignItems: 'flex-start', m: 0, gap: 1.5, '& .MuiSwitch-root': { mt: -0.5, flexShrink: 0 } }}
        control={
          <Switch
            checked={formData.enableEarlyAction}
            onChange={handleSwitchChange('enableEarlyAction')}
            color="primary"
          />
        }
        label={
          <Box>
            <Typography variant="subtitle2" component="h3">
              Early sale or payoff
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Model early sale or mortgage payoff before the full term
            </Typography>
          </Box>
        }
      />

      <Collapse in={formData.enableEarlyAction}>
        <Box mt={3} pt={3} sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Early action year"
                type="number"
                value={formData.earlyActionYear}
                onChange={handleInputChange('earlyActionYear')}
                inputProps={{ min: 1, max: 29 }}
                helperText="Year when early action occurs"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Action type</InputLabel>
                <Select
                  value={formData.earlyActionType}
                  onChange={handleInputChange('earlyActionType')}
                  label="Action type"
                >
                  <MenuItem value="sale">Sale</MenuItem>
                  <MenuItem value="payoff">Mortgage payoff</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Card>
  );
}

export default EarlyActionToggle;