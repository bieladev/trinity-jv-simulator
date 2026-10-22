import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Container, Typography } from '@mui/material';
import { createAppTheme } from './theme';
import { getInitialColorMode, getStoredColorMode, storeColorMode } from './utils/colorMode';
import HeaderNavigation from './components/HeaderNavigation';
import WelcomeSection from './components/WelcomeSection';
import InputPanel from './components/InputPanel';
import SimulationSummary from './components/SimulationSummary';
import SimulationResults from './components/SimulationResults';
import ChartsPanel from './components/ChartsPanel';
import ScenarioComparison from './components/ScenarioComparison';
import { scenarioPresets } from './utils/data/scenarios';
import { loadState, saveState, clearState, DEFAULT_STATE } from './utils/persistence';
import { useReducedMotion } from './utils/motion';

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
  const [currentView, setCurrentView] = useState(restored.currentView);
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

  const inputPanelRef = useRef(null);
  const resultsRef = useRef(null);

  // Every screen change starts at the top. The jump happens in the same task
  // as the state change (before the next paint), so the incoming screen's
  // fade-in plays from the top of the page instead of racing a smooth scroll.
  const scrollToRef = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  // The first screen paints immediately; later screens fade + rise in.
  const lastViewRef = useRef(currentView);
  const screenAnimatedRef = useRef(false);
  if (lastViewRef.current !== currentView) {
    lastViewRef.current = currentView;
    screenAnimatedRef.current = true;
  }

  const handleLoadScenario = (data, name, id) => {
    setSelectedScenarioId(id);
    setFormData(data);
    setDraftFormData(null);
    setSimulationData(null); // Clear previous results
    setCurrentView('input');
    scrollToRef(inputPanelRef);
  };

  const handleSkipToAssumptions = () => {
    setSelectedScenarioId(null); // No scenario selected
    setFormData(scenarioPresets.standard.data); // Load default data
    setDraftFormData(null);
    setSimulationData(null);
    setCurrentView('input');
    scrollToRef(inputPanelRef);
  };

  const handleShowSummary = (data) => {
    setFormData(data);
    setDraftFormData(null); // committed
    setCurrentView('summary');
    scrollToRef(resultsRef);
  };

  const handleRunSimulation = (data) => {
    setFormData(data);
    setDraftFormData(null); // committed
    setSimulationData(data);
    setCurrentView('results');
    scrollToRef(resultsRef);
  };

  const handleEditAssumptions = () => {
    setCurrentView('input');
    scrollToRef(inputPanelRef);
  };

  const handleNavigateHome = () => {
    setCurrentView(DEFAULT_STATE.currentView);
    setSelectedScenarioId(DEFAULT_STATE.selectedScenarioId);
    setFormData(DEFAULT_STATE.formData);
    setDraftFormData(null);
    setSimulationData(DEFAULT_STATE.simulationData);
    setComparisonIds(DEFAULT_STATE.comparisonIds);
    scrollToRef();
  };

  // Clears the saved session and returns to a fresh welcome screen.
  const handleReset = () => {
    clearState();
    handleNavigateHome();
  };

  const handleNavigateToInput = () => {
    setCurrentView('input');
    scrollToRef(inputPanelRef);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'welcome':
        return (
          <WelcomeSection 
            onLoadScenario={handleLoadScenario}
            onSkipToAssumptions={handleSkipToAssumptions}
          />
        );
      case 'input':
        return (
          <div ref={inputPanelRef} style={{ scrollMarginTop: 64 }}>
            <InputPanel 
              key={selectedScenarioId || 'custom'}
              onRunSimulation={handleRunSimulation}
              onShowSummary={handleShowSummary}
              onFormChange={handleFormChange}
              scenarioData={formData}
              scenarioName={selectedScenarioId ? scenarioPresets[selectedScenarioId].name : 'Custom scenario'}
            />
          </div>
        );
      case 'summary':
        return (
          <div ref={resultsRef} style={{ scrollMarginTop: 64 }}>
            <SimulationSummary 
              formData={formData}
              scenarioName={selectedScenarioId ? scenarioPresets[selectedScenarioId].name : 'Custom scenario'}
              onEditAssumptions={handleEditAssumptions}
              onRunSimulation={() => handleRunSimulation(formData)}
            />
          </div>
        );
      case 'results':
        return (
          <div ref={resultsRef} style={{ scrollMarginTop: 64 }}>
            <SimulationResults 
              simulationData={simulationData}
              scenarioName={selectedScenarioId ? scenarioPresets[selectedScenarioId].name : 'Custom scenario'}
              onNavigateToInput={handleNavigateToInput}
            />
            <ChartsPanel 
              simulationData={simulationData} 
              scenarioName={selectedScenarioId ? scenarioPresets[selectedScenarioId].name : 'Custom scenario'}
              onNavigateToInput={handleNavigateToInput}
            />
            <ScenarioComparison
              baseSimulationData={simulationData}
              baseScenarioId={selectedScenarioId}
              comparisonIds={comparisonIds}
              onComparisonIdsChange={setComparisonIds}
            />
          </div>
        );
      default:
        return <WelcomeSection onLoadScenario={handleLoadScenario} onSkipToAssumptions={handleSkipToAssumptions} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', overflowX: 'clip' }}>
        <HeaderNavigation 
          currentView={currentView}
          onNavigateHome={handleNavigateHome}
          onNavigateToInput={handleNavigateToInput}
          onReset={handleReset}
          colorMode={colorMode}
          onToggleColorMode={handleToggleColorMode}
        />
        <Box component="main" sx={{ flex: 1, pb: currentView === 'welcome' ? 0 : { xs: 7, md: 10 } }}>
          <div key={currentView} className={screenAnimatedRef.current ? 'motion-screen' : undefined}>
            {renderContent()}
          </div>
        </Box>
        <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', py: 4 }}>
          <Container>
            <Typography variant="caption" component="p" color="text.secondary" sx={{ maxWidth: 760 }}>
              Illustrative model only. Projections depend entirely on the assumptions entered and are not financial advice; actual results may vary significantly.
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;