import React from 'react';
import './App.css';
import { AppProvider, useAppContext } from './context/AppContext';
import { LanguagePicker } from './components/LanguagePicker';
import { CameraCapture } from './components/CameraCapture';
import { ProcessingScreen } from './components/ProcessingScreen';
import { LowConfidenceScreen } from './components/PlaceholderScreens';
import { VerdictScreen } from './components/VerdictScreen';
import { PersonalizationScreen } from './components/PersonalizationScreen';
import { SavedScansScreen } from './components/SavedScansScreen';
import { HomeScreen } from './components/HomeScreen';
import { HowItWorksScreen } from './components/HowItWorksScreen';
import { IngredientsScreen } from './components/IngredientsScreen';
import { ResultChoiceScreen } from './components/ResultChoiceScreen';

const AppContent: React.FC = () => {
  const { userLanguage, frontImage, ingredientsImage, extractionResult, userFocus, isHistoryOpen, isHowItWorksOpen, viewingSavedScanId, isScanning, hasChosenResultType } = useAppContext();

  if (!userLanguage) {
    return <LanguagePicker />;
  }

  if (isHowItWorksOpen) {
    return <HowItWorksScreen />;
  }

  if (!isScanning && !isHistoryOpen && !viewingSavedScanId && !extractionResult && !frontImage) {
    return <HomeScreen />;
  }

  if (isHistoryOpen) {
    return <SavedScansScreen />;
  }

  if (viewingSavedScanId || extractionResult) {
    if (extractionResult?.extraction_confidence === 'low') {
      return <LowConfidenceScreen />;
    }

    const currentView = hasChosenResultType || (viewingSavedScanId ? 'full' : null);

    if (currentView === null) {
      return <ResultChoiceScreen />;
    }

    if (currentView === 'ingredients') {
      return <IngredientsScreen />;
    }
    
    if (!userFocus && !viewingSavedScanId) {
      return <PersonalizationScreen />;
    }

    return <VerdictScreen />;
  }

  if (frontImage && ingredientsImage) {
    return <ProcessingScreen />;
  }

  if (!frontImage) {
    return <CameraCapture step={1} onCapture={() => {}} />;
  }

  return <CameraCapture step={2} onCapture={() => {}} />;
};

function App() {
  return (
    <div className="app-container">
      <AppProvider>
        <AppContent />
      </AppProvider>
    </div>
  );
}

export default App;
