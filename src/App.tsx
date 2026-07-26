import React, { useState } from 'react';
import './App.css';
import { AppProvider, useAppContext } from './context/AppContext';
import { APIKeyPrompt } from './components/APIKeyPrompt';
import { LanguagePicker } from './components/LanguagePicker';
import { CameraCapture } from './components/CameraCapture';
import { ProcessingScreen } from './components/ProcessingScreen';
import { LowConfidenceScreen } from './components/PlaceholderScreens';
import { VerdictScreen } from './components/VerdictScreen';
import { PersonalizationScreen } from './components/PersonalizationScreen';

const AppContent: React.FC = () => {
  const { apiKey, userLanguage, frontImage, ingredientsImage, extractionResult, userFocus } = useAppContext();
  const [step, setStep] = useState(1);

  if (!apiKey) {
    return <APIKeyPrompt />;
  }

  if (!userLanguage) {
    return <LanguagePicker />;
  }

  if (extractionResult) {
    if (extractionResult.extraction_confidence === 'low') {
      return <LowConfidenceScreen />;
    }
    
    // If extraction succeeded but user hasn't selected a focus, show Screen 3
    if (!userFocus) {
      return <PersonalizationScreen />;
    }

    // Branch 3: Verdict Screen
    return <VerdictScreen />;
  }

  if (frontImage && ingredientsImage) {
    return <ProcessingScreen />;
  }

  if (!frontImage) {
    return <CameraCapture step={1} onCapture={() => setStep(2)} />;
  }

  return <CameraCapture step={2} onCapture={() => setStep(3)} />;
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
