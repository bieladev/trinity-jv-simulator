import React, { useState, useMemo, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ButtonBase,
} from '@mui/material';
import {
  ExpandMoreOutlined as ExpandMoreIcon,
  LockOutlined as LockOutlinedIcon,
  ChevronRightOutlined as ChevronRightIcon,
  TuneOutlined as TuneOutlinedIcon,
} from '@mui/icons-material';
import { features } from '../utils/data/features';
import { 
  scenarioPresets, 
  comingSoonScenarios, 
  primaryScenarios, 
  additionalScenarios, 
} from '../utils/data/scenarios';
import { calculateMetrics, PARTNER_LOAN_CAPITAL_NOTE } from '../utils/calculations';
import { motion } from '../utils/motion';
import TrinityModelExplainer from './TrinityModelExplainer';
import PageHeader from './common/PageHeader';
import SectionHeading from './common/SectionHeading';
import Reveal from './common/Reveal';

const formatCurrency = (value) => {
  if (isNaN(value)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

function WelcomeSection({ onLoadScenario, onSkipToAssumptions }) {
  const [showBenchmarks, setShowBenchmarks] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const presetsRef = useRef(null);

  const benchmarkData = useMemo(() => {
    const allScenarios = [];
    Object.keys(scenarioPresets).forEach(scenarioId => {
      const scenario = scenarioPresets[scenarioId];
      const metrics = calculateMetrics(scenario.data);
      allScenarios.push({
        id: scenarioId,
        name: scenario.name,
        isActive: true,
        loanTerm: metrics.effectiveSaleYear,
        appreciationRate: scenario.data.annualAppreciationRate,
        homeownerReturn: `${metrics.homeownerIRR.toFixed(1)}%`,
        drHortonProfit: `${((metrics.drHortonTotalReturn) / 1000).toFixed(0)}K`,
        berkshireReturn: `${metrics.berkshireIRR.toFixed(1)}%`,
        foreclosureRisk: metrics.foreclosureRisk,
      });
    });
    Object.keys(comingSoonScenarios).forEach(scenarioId => {
      const scenario = comingSoonScenarios[scenarioId];
      allScenarios.push({
        id: scenarioId,
        name: scenario.name,
        isActive: false,
        ...scenario.benchmarkData
      });
    });
    return allScenarios;
  }, []);

  const displayedBenchmarks = showActiveOnly 
    ? benchmarkData.filter(scenario => scenario.isActive)
    : benchmarkData;

  const handleToggleBenchmarks = () => {
    setShowBenchmarks(!showBenchmarks);
  };

  const scrollToPresets = () => {
    presetsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const loadPreset = (scenario) => onLoadScenario(scenarioPresets[scenario.id].data, scenario.title, scenario.id);

  const renderPresetList = (label, list) => (
    <Box>
      <Typography variant="overline" component="h3" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        {label}
      </Typography>
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, borderTop: '1px solid', borderColor: 'divider' }}>
        {list.map((scenario, index) => (
          <Reveal component="li" index={index} key={scenario.id} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
            <ButtonBase
              onClick={() => loadPreset(scenario)}
              data-testid={`preset-${scenario.id}`}
              sx={{
                width: '100%',
                textAlign: 'left',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 2,
                py: 1.75,
                borderRadius: '2px',
                '& .preset-title': { transition: `color ${motion.duration.fast}ms ${motion.easing.out}` },
                '& .preset-chevron': { transition: `transform ${motion.duration.fast}ms ${motion.easing.out}, color ${motion.duration.fast}ms ${motion.easing.out}` },
                '&:hover .preset-title': { color: 'brand.primaryText' },
                '&:hover .preset-chevron': { transform: 'translateX(3px)', color: 'brand.primaryText' },
                // Press: the chevron pushes a little further.
                '&:active .preset-chevron': { transform: 'translateX(5px)' },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography className="preset-title" variant="subtitle2" component="span" sx={{ display: 'block' }}>
                  {scenario.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block', mt: 0.25 }}>
                  {scenario.tooltip}
                </Typography>
              </Box>
              <ChevronRightIcon className="preset-chevron" sx={{ color: 'text.secondary', flexShrink: 0 }} aria-hidden />
            </ButtonBase>
          </Reveal>
        ))}
      </Box>
    </Box>
  );

  const dash = '—';

  return (
    <Box>
      <Container>
        <PageHeader
          size="hero"
          eyebrow="Trinity joint venture model"
          title="Model the return for every party in the Trinity JV"
          description="Choose a preset or set your own assumptions to see each party's capital, appreciation share and annualized return through to exit."
          actions={
            <>
              <Button variant="contained" size="large" onClick={onSkipToAssumptions} data-testid="hero-custom-button">
                Build custom scenario
              </Button>
              <Button variant="outlined" size="large" onClick={scrollToPresets}>
                Browse presets
              </Button>
            </>
          }
        />

        <Box
          component="ul"
          sx={{
            listStyle: 'none',
            m: 0,
            p: 0,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          {features.map((feature, index) => (
            <Reveal
              component="li"
              index={index}
              key={feature.title}
              sx={{
                py: 3,
                pr: { md: 3 },
                borderStyle: 'solid',
                borderWidth: { xs: '0 0 1px 0', sm: index < 2 ? '0 0 1px 0' : 0, md: index === 0 ? 0 : '0 0 0 1px' },
                pl: { sm: index % 2 === 1 ? 3 : 0, md: index === 0 ? 0 : 3 },
                borderColor: 'divider',
              }}
            >
              <Box sx={{ color: 'brand.primaryText', display: 'flex', mb: 1.5, '& svg': { fontSize: 22 } }} aria-hidden>
                {feature.icon}
              </Box>
              <Typography variant="subtitle2" component="h2">{feature.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{feature.description}</Typography>
            </Reveal>
          ))}
        </Box>

        <Box ref={presetsRef} component="section" aria-labelledby="starting-point-title" sx={{ pt: 7, scrollMarginTop: 80 }}>
          <SectionHeading
            eyebrow="Step 1"
            title={<span id="starting-point-title">Choose your starting point</span>}
            description="Load a preset to see how the model performs under a specific condition, or set every assumption yourself."
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3, alignItems: 'start' }}>
            <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 4 } }}>
              <Box sx={{ display: 'grid', gap: 4 }}>
                {renderPresetList('Primary scenarios', primaryScenarios)}
                {renderPresetList('Additional scenarios', additionalScenarios)}
              </Box>
            </Paper>

            <Reveal index={1} sx={{ position: { md: 'sticky' }, top: { md: 96 } }}>
              <Paper variant="outlined" className="motion-lift" sx={{ p: { xs: 2.5, md: 4 }, bgcolor: 'brand.surfaceMuted' }}>
                <TuneOutlinedIcon sx={{ color: 'brand.primaryText', fontSize: 24, mb: 2 }} aria-hidden />
                <Typography variant="h4" component="h3">Custom simulation</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                  Define every assumption to model a specific deal: home price, cost split, financing, appreciation and how it is shared.
                </Typography>
                <Button variant="outlined" fullWidth onClick={onSkipToAssumptions} endIcon={<ChevronRightIcon />}>
                  Set assumptions
                </Button>
              </Paper>
            </Reveal>
          </Box>
        </Box>

        <Reveal component="section" sx={{ pt: 7 }}>
          <Accordion expanded={showBenchmarks} onChange={handleToggleBenchmarks} TransitionProps={{ unmountOnExit: true }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="benchmarks-content" id="benchmarks-header">
              <Box>
                <Typography variant="h4" component="h2">Compare scenario benchmarks</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Headline outcomes for every preset, each at its own exit year.
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pr: 0 }}>
              <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 600 }}>
                  <Table stickyHeader size="small" sx={{ '& thead th': { whiteSpace: 'normal', verticalAlign: 'bottom', lineHeight: 1.4 }, '& tbody td:not(:first-of-type)': { whiteSpace: 'nowrap' } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Scenario</TableCell>
                        <TableCell align="right">Hold (years)</TableCell>
                        <TableCell align="right">Appreciation</TableCell>
                        <TableCell align="right">Homeowner return (annualized)</TableCell>
                        <TableCell align="right">DR Horton profit</TableCell>
                        <TableCell align="right">Berkshire return (annualized)</TableCell>
                        <TableCell align="right">Foreclosure risk*</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayedBenchmarks.map((scenario) => (
                        <TableRow key={scenario.id} sx={{ color: scenario.isActive ? 'text.primary' : 'text.secondary', '& td': { color: 'inherit' } }}>
                          <TableCell sx={{ fontWeight: 600, minWidth: 180 }}>
                            <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
                              {!scenario.isActive && <LockOutlinedIcon sx={{ fontSize: 16 }} aria-hidden />}
                              {scenario.name}
                              {!scenario.isActive && <Chip label="Coming soon" size="small" variant="outlined" />}
                            </Box>
                          </TableCell>
                          <TableCell align="right">{!scenario.isActive ? dash : scenario.loanTerm}</TableCell>
                          <TableCell align="right">{!scenario.isActive ? dash : `${scenario.appreciationRate}%`}</TableCell>
                          <TableCell align="right">{!scenario.isActive ? dash : scenario.homeownerReturn}</TableCell>
                          <TableCell align="right">{!scenario.isActive ? dash : `$${scenario.drHortonProfit}`}</TableCell>
                          <TableCell align="right">{!scenario.isActive ? dash : scenario.berkshireReturn}</TableCell>
                          <TableCell align="right">
                            {!scenario.isActive ? dash : (
                              <Chip
                                label={scenario.foreclosureRisk}
                                size="small"
                                variant="outlined"
                                color={scenario.foreclosureRisk === 'Low' ? 'success' : scenario.foreclosureRisk === 'Medium' ? 'warning' : 'error'}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.5, mt: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 640 }}>
                  *Indicative only. High when appreciation is 0% or below or the loan is interest-only; Medium when appreciation is under 2% or the rate is above 6%. {PARTNER_LOAN_CAPITAL_NOTE}
                </Typography>
                <FormControlLabel
                  control={<Switch size="small" checked={showActiveOnly} onChange={(e) => setShowActiveOnly(e.target.checked)} />}
                  label={<Typography variant="body2">Active scenarios only</Typography>}
                  sx={{ mr: 0, flexShrink: 0 }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        </Reveal>
      </Container>

      <TrinityModelExplainer />
    </Box>
  );
}

export default WelcomeSection;