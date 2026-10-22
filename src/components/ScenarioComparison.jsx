import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  AddOutlined as AddIcon,
  CloseOutlined as CloseIcon,
  DeleteOutlineOutlined as DeleteOutlineIcon,
  CompareArrowsOutlined as CompareArrowsOutlinedIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { scenarioPresets } from '../utils/data/scenarios';
import { calculateMetrics } from '../utils/calculations';
import SectionHeading from './common/SectionHeading';
import StakeholderLabel from './common/StakeholderLabel';
import { useChartStyles, ChartTooltip, formatAxisCurrency, WrappedCategoryTick } from './charts/chartKit';

// The comparison list is owned by App (persisted to localStorage) as a list
// of preset ids; names, data and metrics are derived here on every render so
// they always reflect the current model.
function ScenarioComparison({ baseSimulationData, baseScenarioId, comparisonIds = [], onComparisonIdsChange = () => {} }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const cs = useChartStyles();

  const availableScenarios = scenarioPresets;
  const comparisonScenarios = comparisonIds
    .filter((id) => id !== baseScenarioId && availableScenarios[id])
    .map((id) => ({
      id,
      name: availableScenarios[id].name,
      data: availableScenarios[id].data,
      metrics: calculateMetrics(availableScenarios[id].data),
    }));

  if (!baseSimulationData) {
    return (
      <Container component="section" sx={{ mt: 7 }}>
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 6 }, textAlign: 'center' }}>
          <CompareArrowsOutlinedIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 2 }} aria-hidden />
          <Typography variant="h4" component="h2">Scenario comparison</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 520, mx: 'auto' }}>
            Compare up to three scenarios side by side. Run a simulation first to enable comparison.
          </Typography>
        </Paper>
      </Container>
    );
  }

  const formatCurrency = (value) => {
    if (isNaN(value)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const baseMetrics = calculateMetrics(baseSimulationData);

  const handleAddScenario = () => {
    if (comparisonScenarios.length < 2) {
      setShowAddDialog(true);
    } else {
      alert("You can compare a maximum of 3 scenarios (your current one + 2 others).");
    }
  };

  const handleConfirmAddScenario = () => {
    if (selectedScenarioId && availableScenarios[selectedScenarioId]) {
      onComparisonIdsChange([...comparisonScenarios.map((sc) => sc.id), selectedScenarioId]);
      setShowAddDialog(false);
      setSelectedScenarioId('');
    }
  };

  const handleRemoveScenario = (scenarioId) => {
    onComparisonIdsChange(comparisonScenarios.map((sc) => sc.id).filter((id) => id !== scenarioId));
  };

  const handleClearScenarios = () => {
    onComparisonIdsChange([]);
  };

  const chartData = [
    {
      name: 'Current scenario',
      homeowner: baseMetrics.homeownerEquity,
      drHorton: baseMetrics.drHortonTotalReturn,
      berkshire: baseMetrics.berkshireTotalReturn,
      appreciation: baseMetrics.totalAppreciation,
      returnMultiple: baseMetrics.returnMultiple,
      exitYear: baseMetrics.effectiveSaleYear,
    },
    ...comparisonScenarios.map((scenario, index) => ({
      name: scenario.name,
      homeowner: scenario.metrics.homeownerEquity,
      drHorton: scenario.metrics.drHortonTotalReturn,
      berkshire: scenario.metrics.berkshireTotalReturn,
      appreciation: scenario.metrics.totalAppreciation,
      returnMultiple: scenario.metrics.returnMultiple,
      exitYear: scenario.metrics.effectiveSaleYear,
    }))
  ];

  const barMargin = { top: 8, right: 8, bottom: 0, left: 0 };

  return (
    <Container component="section" aria-labelledby="comparison-title" sx={{ mt: 7 }}>
      <SectionHeading
        eyebrow="Comparison"
        title={<span id="comparison-title">Scenario comparison</span>}
        description="Compare stakeholder returns and key metrics for your current scenario against up to two presets."
        action={
          <>
            <Button variant="outlined" data-testid="compare-add-button" startIcon={<AddIcon />} onClick={handleAddScenario} disabled={comparisonScenarios.length >= 2}>
              Add scenario
            </Button>
            <Button variant="text" data-testid="compare-clear-button" onClick={handleClearScenarios} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
              Clear all
            </Button>
          </>
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2, md: 3 }, mb: 3 }}>
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, minWidth: 0 }}>
          <Typography variant="h5" component="h3">Total appreciation</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>Property value gained by exit, per scenario.</Typography>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={barMargin}>
              <CartesianGrid {...cs.grid} />
              <XAxis dataKey="name" {...cs.xAxis} interval={0} height={48} tick={<WrappedCategoryTick />} />
              <YAxis tickFormatter={formatAxisCurrency} {...cs.yAxis} />
              <Tooltip content={<ChartTooltip labelFormatter={(l) => l} />} cursor={cs.barCursor} />
              <Bar dataKey="appreciation" name="Total appreciation" fill={cs.palette.total} fillOpacity={0.75} radius={[4, 4, 0, 0]} maxBarSize={56} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, minWidth: 0 }}>
          <Typography variant="h5" component="h3">Stakeholder returns</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>Homeowner equity and each partner's total return at exit.</Typography>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={barMargin} barGap={2}>
              <CartesianGrid {...cs.grid} />
              <XAxis dataKey="name" {...cs.xAxis} interval={0} height={48} tick={<WrappedCategoryTick />} />
              <YAxis tickFormatter={formatAxisCurrency} {...cs.yAxis} />
              <Tooltip content={<ChartTooltip labelFormatter={(l) => l} />} cursor={cs.barCursor} />
              <Legend {...cs.legend} />
              <Bar dataKey="homeowner" fill={cs.palette.homeowner} name="Homeowner" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
              <Bar dataKey="drHorton" fill={cs.palette.drHorton} name="DR Horton" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
              <Bar dataKey="berkshire" fill={cs.palette.berkshire} name="Berkshire" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      <Typography variant="h5" component="h3" sx={{ mb: 2 }}>Detailed comparison</Typography>
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small" sx={{ '& thead th': { whiteSpace: 'normal', verticalAlign: 'bottom', lineHeight: 1.4 }, '& tbody td': { whiteSpace: 'nowrap' } }}>
            <TableHead>
              <TableRow>
                <TableCell>Scenario</TableCell>
                <TableCell align="right">Home price</TableCell>
                <TableCell align="right">Total appreciation</TableCell>
                <TableCell align="right"><StakeholderLabel stakeholder="homeowner">Homeowner equity</StakeholderLabel></TableCell>
                <TableCell align="right"><StakeholderLabel stakeholder="drHorton">DR Horton return</StakeholderLabel></TableCell>
                <TableCell align="right"><StakeholderLabel stakeholder="berkshire">Berkshire return</StakeholderLabel></TableCell>
                <TableCell align="right">Return multiple</TableCell>
                <TableCell align="right">Exit year</TableCell>
                <TableCell align="right" sx={{ position: 'relative' }}><Box component="span" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>Actions</Box></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow sx={{ bgcolor: 'brand.surfaceMuted' }}>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    Current scenario
                    <Chip label="Base" size="small" color="primary" />
                  </Box>
                </TableCell>
                <TableCell align="right">{formatCurrency(baseSimulationData.homePurchasePrice)}</TableCell>
                <TableCell align="right">{formatCurrency(baseMetrics.totalAppreciation)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(baseMetrics.homeownerEquity)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(baseMetrics.drHortonTotalReturn)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(baseMetrics.berkshireTotalReturn)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{baseMetrics.returnMultiple.toFixed(1)}x</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Year {baseMetrics.effectiveSaleYear}</TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary' }}>—</TableCell>
              </TableRow>
              {comparisonScenarios.map((scenario) => (
                <TableRow key={scenario.id} data-testid="compare-row">
                  <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{scenario.name}</TableCell>
                  <TableCell align="right">{formatCurrency(scenario.data.homePurchasePrice)}</TableCell>
                  <TableCell align="right">{formatCurrency(scenario.metrics.totalAppreciation)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(scenario.metrics.homeownerEquity)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(scenario.metrics.drHortonTotalReturn)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(scenario.metrics.berkshireTotalReturn)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{scenario.metrics.returnMultiple.toFixed(1)}x</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Year {scenario.metrics.effectiveSaleYear}</TableCell>
                  <TableCell align="right">
                    <MuiTooltip title={`Remove ${scenario.name}`}>
                      <IconButton onClick={() => handleRemoveScenario(scenario.id)} size="small" aria-label={`Remove ${scenario.name}`} sx={{ '&:hover': { color: 'error.main' } }}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </MuiTooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {comparisonScenarios.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          No presets added yet. Use Add scenario to compare up to two.
        </Typography>
      )}

        <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle component="div">
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h4" component="h2">Add a scenario to compare</Typography>
              <IconButton onClick={() => setShowAddDialog(false)} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose a preset to compare with your current scenario. You can add up to two.
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="compare-select-label">Scenario</InputLabel>
              <Select
                data-testid="compare-select"
                value={selectedScenarioId}
                onChange={(e) => setSelectedScenarioId(e.target.value)}
                labelId="compare-select-label"
                label="Scenario"
              >
                {Object.entries(availableScenarios)
                  .filter(([id]) => id !== baseScenarioId && !comparisonScenarios.some(scenario => scenario.id === id))
                  .map(([id, scenario]) => (
                    <MenuItem key={id} value={id}>
                      {scenario.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button variant="outlined" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleConfirmAddScenario} 
              data-testid="compare-confirm-button"
              variant="contained" 
              disabled={!selectedScenarioId}
            >
              Add scenario
            </Button>
          </DialogActions>
        </Dialog>
    </Container>
  );
}

export default ScenarioComparison;