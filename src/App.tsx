import React from 'react';
import './App.css';
import { AppProvider, useAppContext } from './context/AppContext';
import { LanguagePicker } from './components/LanguagePicker';
import { CameraCapture } from './components/CameraCapture';
import { ThirdImageInterstitial } from './components/ThirdImageInterstitial';
import { ProcessingScreen } from './components/ProcessingScreen';
import { LowConfidenceScreen } from './components/PlaceholderScreens';
import { VerdictScreen } from './components/VerdictScreen';
import { PersonalizationScreen } from './components/PersonalizationScreen';
import { SavedScansScreen } from './components/SavedScansScreen';
import { HomeScreen } from './components/HomeScreen';
import { HowItWorksScreen } from './components/HowItWorksScreen';
import { IngredientsScreen } from './components/IngredientsScreen';
import { ResultChoiceScreen } from './components/ResultChoiceScreen';

import { BatchQueueScreen } from './components/BatchQueueScreen';
import { BatchProcessingScreen } from './components/BatchProcessingScreen';
import { BatchResultsScreen } from './components/BatchResultsScreen';

const BatchCaptureManager: React.FC = () => {
  const { frontImage, ingredientsImage, thirdImage, thirdImageStatus, setBatchItems, setFrontImage, setIngredientsImage, setThirdImage, setThirdImageStatus, setIsCapturingBatchItem } = useAppContext();
  
  React.useEffect(() => {
    if (frontImage && ingredientsImage && (thirdImageStatus === 'skipped' || thirdImageStatus === 'done')) {
      setBatchItems(prev => [...prev, {
        id: Date.now().toString(),
        frontImage,
        ingredientsImage,
        thirdImage,
        status: 'pending'
      }]);
      setFrontImage(null);
      setIngredientsImage(null);
      setThirdImage(null);
      setThirdImageStatus(null);
      setIsCapturingBatchItem(false);
    }
  }, [frontImage, ingredientsImage, thirdImage, thirdImageStatus, setBatchItems, setFrontImage, setIngredientsImage, setThirdImage, setThirdImageStatus, setIsCapturingBatchItem]);

  if (thirdImageStatus === 'pending') {
    return <CameraCapture step={3} onCapture={() => {}} />;
  }

  if (frontImage && ingredientsImage && thirdImageStatus === null) {
    return <ThirdImageInterstitial />;
  }

  if (!frontImage) return <CameraCapture step={1} onCapture={() => {}} />;
  return <CameraCapture step={2} onCapture={() => {}} />;
};

const AppContent: React.FC = () => {
  const { 
    userLanguage, frontImage, ingredientsImage, thirdImageStatus, extractionResult, userFocus, 
    isHistoryOpen, isHowItWorksOpen, viewingSavedScanId, isScanning, hasChosenResultType,
    isBatchMode, isCapturingBatchItem, isBatchProcessing, isBatchFinished, viewingBatchResultId
  } = useAppContext();

  if (!userLanguage) {
    return <LanguagePicker />;
  }

  if (isHowItWorksOpen) {
    return <HowItWorksScreen />;
  }

  if (isBatchMode) {
    if (viewingBatchResultId || extractionResult) {
      if (extractionResult?.extraction_confidence === 'low') {
        return <LowConfidenceScreen />;
      }
      const currentView = hasChosenResultType || (viewingBatchResultId ? 'full' : null);
      if (currentView === null) return <ResultChoiceScreen />;
      if (currentView === 'ingredients') return <IngredientsScreen />;
      if (!userFocus && !viewingBatchResultId) return <PersonalizationScreen />;
      return <VerdictScreen />;
    }

    if (isBatchFinished) {
      return <BatchResultsScreen />;
    }
    if (isBatchProcessing) {
      return <BatchProcessingScreen />;
    }
    if (isCapturingBatchItem) {
      return <BatchCaptureManager />;
    }
    return <BatchQueueScreen />;
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
    if (thirdImageStatus === 'pending') {
      return <CameraCapture step={3} onCapture={() => {}} />;
    }
    if (thirdImageStatus === null) {
      return <ThirdImageInterstitial />;
    }
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
