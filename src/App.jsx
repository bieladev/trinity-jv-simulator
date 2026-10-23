import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Container, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Link } from '@mui/material';
import { DownloadOutlined as DownloadOutlinedIcon } from '@mui/icons-material';
import { createAppTheme } from './theme';
import { getInitialColorMode, getStoredColorMode, storeColorMode } from './utils/colorMode';
import HeaderNavigation from './components/HeaderNavigation';
import WelcomeSection from './components/WelcomeSection';
import InputPanel from './components/InputPanel';
import SimulationResults from './components/SimulationResults';
import AssumptionsUsed from './components/AssumptionsUsed';
import ChartsPanel from './components/ChartsPanel';
import ScenarioComparison from './components/ScenarioComparison';
import { scenarioPresets } from './utils/data/scenarios';
import { loadState, saveState, clearState, DEFAULT_STATE } from './utils/persistence';
import { scenarioDisplayName, countChangedFields } from './utils/data/defaults';
import { useReducedMotion, scrollToId, motion } from './utils/motion';

// Thin wrapper that only forwards `theme`. MUI's ThemeProvider rejects any
// extra prop in development, and the preview tooling tags JSX elements with a
// data attribute, so the provider itself is created without JSX.
// The hosted site also serves the standalone single-file build (added by the
// Dockerfile). Hide the link in local development, where that file is not
// built, and inside the standalone file itself.
const OFFLINE_DOWNLOAD_AVAILABLE =
  !import.meta.env.DEV && typeof window !== 'undefined' && window.location.protocol !== 'file:';

function AppThemeProvider({ theme, children }) {
  return React.createElement(ThemeProvider, { theme }, children);
}

function App() {
  // Colour mode: stored choice, else the OS preference (followed live until
  // the user picks one explicitly).
  const [colorMode, setColorMode] = useState(getInitialColorMode);
  const reducedMotion = useReducedMotion();
  const theme = useMemo(() => createAppTheme(colorMode, { reducedMotion }), [colorMode, reducedMotion]);
  useEffect(() => {
    document.documentElement.dataset.theme = colorMode;
    document.documentElement.style.backgroundColor = theme.palette.background.default;
  }, [colorMode, theme]);
  useEffect(() => {
    if (getStoredColorMode() || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => {
      if (!getStoredColorMode()) setColorMode(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  const handleToggleColorMode = useCallback(() => {
    setColorMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      storeColorMode(next);
      return next;
    });
  }, []);

  // Restored once from localStorage (validated; defaults if missing/corrupt).
  const [restored] = useState(loadState);
  // The former Summary step now lives on Results; a session saved on it
  // resumes on Assumptions.
  const [currentView, setCurrentView] = useState(restored.currentView === 'summary' ? 'input' : restored.currentView);
  const [selectedScenarioId, setSelectedScenarioId] = useState(restored.selectedScenarioId);
  const [formData, setFormData] = useState(restored.formData);
  const [simulationData, setSimulationData] = useState(restored.simulationData);
  const [comparisonIds, setComparisonIds] = useState(restored.comparisonIds);
  // Live, uncommitted edits from the input panel. Persisted so a refresh
  // mid-edit keeps them, but never fed back into InputPanel (that would
  // reset its state on every keystroke).
  const [draftFormData, setDraftFormData] = useState(null);
  const handleFormChange = useCallback((data) => setDraftFormData(data), []);

  useEffect(() => {
    saveState({
      currentView,
      selectedScenarioId,
      formData: currentView === 'input' ? (draftFormData ?? formData) : formData,
      simulationData,
      comparisonIds,
    });
  }, [currentView, selectedScenarioId, formData, simulationData, comparisonIds, draftFormData]);

  // Every screen change starts at the top. The jump happens in the same task
  // as the state change (before the next paint), so the incoming screen's
  // fade-in plays from the top of the page instead of racing a smooth scroll.
  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  // The first screen paints immediately; later screens fade + rise in.
  const lastViewRef = useRef(currentView);
  const screenAnimatedRef = useRef(false);
  if (lastViewRef.current !== currentView) {
    lastViewRef.current = currentView;
    screenAnimatedRef.current = true;
  }

  // After a screen change, move focus to the new screen's heading so keyboard
  // and screen-reader users start at the top of it (not on a removed button).
  const focusViewRef = useRef(currentView);
  useEffect(() => {
    if (focusViewRef.current === currentView) return;
    focusViewRef.current = currentView;
    const h1 = document.querySelector('main h1');
    if (h1) {
      h1.setAttribute('tabindex', '-1');
      h1.style.outline = 'none';
      h1.focus({ preventScroll: true });
    }
  }, [currentView]);

  // The assumptions as they stand right now (in-progress edits included).
  const currentForm = currentView === 'input' && draftFormData ? draftFormData : formData;
  const canOpenInput = Boolean(currentForm);
  const canOpenResults = Boolean(currentForm);
  const hasSavedWork = Boolean(currentForm || simulationData || comparisonIds.length);

  // One way to change screens. Leaving Assumptions keeps the edits; opening
  // Results always shows the current assumptions (never stale figures).
  // `push` adds a browser-history entry so the Back button steps back
  // through the screens instead of leaving the tool.
  const navigate = (view, { push = true } = {}) => {
    let target = view;
    if ((target === 'input' || target === 'results') && !currentForm) target = 'welcome';
    if (currentView === 'input' && draftFormData) {
      setFormData(draftFormData);
      setDraftFormData(null);
    }
    if (target === 'results') setSimulationData(currentForm);
    setCurrentView(target);
    if (push && target !== currentView) {
      try { window.history.pushState({ trinityView: target }, ''); } catch { /* history unavailable */ }
    }
    scrollToTop();
    return target;
  };

  // Browser Back / Forward: move between screens without adding entries.
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  useEffect(() => {
    try { window.history.replaceState({ trinityView: currentView }, ''); } catch { /* ignore */ }
    const onPop = (e) => navigateRef.current(e.state?.trinityView || 'welcome', { push: false });
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAndOpenInput = (id, data) => {
    setSelectedScenarioId(id);
    setFormData(data);
    setDraftFormData(null);
    setSimulationData(null); // Clear previous results
    setCurrentView('input');
    if (currentView !== 'input') {
      try { window.history.pushState({ trinityView: 'input' }, ''); } catch { /* ignore */ }
    }
    scrollToTop();
  };

  // Opening another starting point replaces the saved assumptions. When they
  // were edited, ask first: Start over stays the only control that discards
  // work without a question. (A custom scenario starts from Standard.)
  const [confirmReplace, setConfirmReplace] = useState(null); // { id, data }
  const hasEdits = Boolean(currentForm) && countChangedFields(currentForm, selectedScenarioId || 'standard') > 0;
  const requestLoad = (id, data) => {
    if (hasEdits) setConfirmReplace({ id, data });
    else loadAndOpenInput(id, data);
  };

  const handleLoadScenario = (data, name, id) => requestLoad(id, data);

  const handleSkipToAssumptions = () => requestLoad(null, scenarioPresets.standard.data); // custom, from the default data

  const handleRunSimulation = (data) => {
    setFormData(data);
    setDraftFormData(null); // committed
    setSimulationData(data);
    setCurrentView('results');
    try { window.history.pushState({ trinityView: 'results' }, ''); } catch { /* ignore */ }
    scrollToTop();
  };

  const handleNavigateToInput = () => navigate('input');

  // Start over: the only control that clears saved work, so it asks first.
  const [confirmStartOver, setConfirmStartOver] = useState(false);
  // Confirmation dialogs open with focus on the safe action. Done once the
  // dialog has entered: `autoFocus` alone is undone when focus returns to
  // the header trigger and the focus trap falls back to the dialog itself.
  const focusSafeAction = (node) => node?.querySelector?.('[data-safe-action]')?.focus();
  const handleStartOver = () => {
    setConfirmStartOver(false);
    clearState();
    setCurrentView(DEFAULT_STATE.currentView);
    setSelectedScenarioId(DEFAULT_STATE.selectedScenarioId);
    setFormData(DEFAULT_STATE.formData);
    setDraftFormData(null);
    setSimulationData(DEFAULT_STATE.simulationData);
    setComparisonIds(DEFAULT_STATE.comparisonIds);
    if (currentView !== 'welcome') {
      try { window.history.pushState({ trinityView: 'welcome' }, ''); } catch { /* ignore */ }
    }
    scrollToTop();
  };

  // Header "Guide": back to the overview (inputs and results are kept) and
  // down to "How the program works". From another screen the overview
  // mounts first, then the scroll runs once its entrance has settled.
  const [pendingSection, setPendingSection] = useState(null);
  const handleOpenGuide = () => {
    if (currentView === 'welcome') {
      scrollToId('how-it-works');
      return;
    }
    navigate('welcome');
    setPendingSection('how-it-works');
  };
  useEffect(() => {
    if (!pendingSection || currentView !== 'welcome') return undefined;
    // Wait for the incoming screen's rise to settle so the target position
    // is measured without the transition's offset.
    const timer = setTimeout(() => {
      scrollToId(pendingSection);
      setPendingSection(null);
    }, reducedMotion ? 0 : motion.duration.screen);
    return () => clearTimeout(timer);
  }, [pendingSection, currentView, reducedMotion]);

  // Names shown on screen: the preset name, marked "(edited)" once changed.
  const inputName = scenarioDisplayName(selectedScenarioId, formData);
  const resultsName = scenarioDisplayName(selectedScenarioId, simulationData);
  // An edited preset is no longer the preset, so it can be compared with it.
  const resultsBaseId = selectedScenarioId && countChangedFields(simulationData, selectedScenarioId) === 0 ? selectedScenarioId : null;

  // Returning to the overview with work saved: offer a way straight back.
  const resume = currentForm
    ? {
        name: scenarioDisplayName(selectedScenarioId, currentForm),
        onOpenAssumptions: () => navigate('input'),
        onOpenResults: () => navigate('results'),
      }
    : null;

  const renderContent = () => {
    switch (currentView) {
      case 'welcome':
        return (
          <WelcomeSection 
            onLoadScenario={handleLoadScenario}
            onSkipToAssumptions={handleSkipToAssumptions}
            resume={resume}
          />
        );
      case 'input':
        return (
          <InputPanel 
            key={selectedScenarioId || 'custom'}
            onRunSimulation={handleRunSimulation}
            onFormChange={handleFormChange}
            scenarioData={formData}
            scenarioName={selectedScenarioId ? scenarioPresets[selectedScenarioId].name : 'Custom scenario'}
            presetId={selectedScenarioId}
          />
        );
      case 'results':
        return (
          <>
            <SimulationResults 
              simulationData={simulationData}
              scenarioName={resultsName}
              onNavigateToInput={handleNavigateToInput}
            />
            <ChartsPanel 
              simulationData={simulationData} 
              scenarioName={resultsName}
              onNavigateToInput={handleNavigateToInput}
            />
            <ScenarioComparison
              baseSimulationData={simulationData}
              baseScenarioId={resultsBaseId}
              comparisonIds={comparisonIds}
              onComparisonIdsChange={setComparisonIds}
            />
            <AssumptionsUsed simulationData={simulationData} onNavigateToInput={handleNavigateToInput} />
          </>
        );
      default:
        return <WelcomeSection onLoadScenario={handleLoadScenario} onSkipToAssumptions={handleSkipToAssumptions} />;
    }
  };

  return (
    <AppThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', overflowX: 'clip' }}>
        <HeaderNavigation 
          currentView={currentView}
          onNavigate={(view) => navigate(view)}
          canOpenInput={canOpenInput}
          canOpenResults={canOpenResults}
          onOpenGuide={handleOpenGuide}
          onStartOver={() => setConfirmStartOver(true)}
          hasSavedWork={hasSavedWork}
          colorMode={colorMode}
          onToggleColorMode={handleToggleColorMode}
        />
        <Box component="main" sx={{ flex: 1, pb: currentView === 'welcome' ? 0 : { xs: 7, md: 10 } }}>
          <div key={currentView} className={screenAnimatedRef.current && !reducedMotion ? 'motion-screen' : undefined}>
            {renderContent()}
          </div>
        </Box>
        <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', py: 4 }}>
          <Container>
            <Typography variant="caption" component="p" color="text.secondary" sx={{ maxWidth: 760 }}>
              Illustrative model only. Projections depend entirely on the assumptions entered and are not financial advice; actual results may vary significantly.
            </Typography>
            {OFFLINE_DOWNLOAD_AVAILABLE && (
              <Link
                href="trinity-jv-simulator.html"
                download="trinity-jv-simulator.html"
                variant="body2"
                underline="hover"
                data-testid="offline-download-link"
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, mt: 1.5, minHeight: 44 }}
              >
                <DownloadOutlinedIcon sx={{ fontSize: 18 }} aria-hidden />
                Download offline version (one HTML file, opens in any browser)
              </Link>
            )}
          </Container>
        </Box>
      </Box>
      <Dialog open={confirmStartOver} onClose={() => setConfirmStartOver(false)} aria-labelledby="start-over-title" aria-describedby="start-over-text" maxWidth="xs" fullWidth TransitionProps={{ onEntered: focusSafeAction }}>
        <DialogTitle id="start-over-title" component="h2" sx={{ typography: 'h4' }}>Start over?</DialogTitle>
        <DialogContent>
          <DialogContentText id="start-over-text">
            This clears the assumptions, results and comparisons saved in this browser. Presets are not affected.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={() => setConfirmStartOver(false)} data-safe-action>
            Keep my work
          </Button>
          <Button variant="contained" color="error" onClick={handleStartOver} data-testid="confirm-start-over-button">
            Clear and start over
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(confirmReplace)} onClose={() => setConfirmReplace(null)} aria-labelledby="replace-title" aria-describedby="replace-text" maxWidth="xs" fullWidth TransitionProps={{ onEntered: focusSafeAction }}>
        <DialogTitle id="replace-title" component="h2" sx={{ typography: 'h4' }}>Replace your edited scenario?</DialogTitle>
        <DialogContent>
          <DialogContentText id="replace-text">
            {`Your changes to ${selectedScenarioId ? scenarioPresets[selectedScenarioId].name : 'the custom scenario'} are saved in this browser. Opening ${confirmReplace?.id ? scenarioPresets[confirmReplace.id].name : 'a new custom scenario'} replaces these assumptions and their results. Comparisons are kept.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={() => setConfirmReplace(null)} data-safe-action data-testid="keep-scenario-button">
            Keep my changes
          </Button>
          <Button
            variant="contained"
            color="error"
            data-testid="confirm-replace-button"
            onClick={() => {
              const next = confirmReplace;
              setConfirmReplace(null);
              if (next) loadAndOpenInput(next.id, next.data);
            }}
          >
            Replace scenario
          </Button>
        </DialogActions>
      </Dialog>
    </AppThemeProvider>
  );
}

export default App;