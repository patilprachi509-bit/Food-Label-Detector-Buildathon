import React from 'react';
import { useAppContext } from '../context/AppContext';

export const LanguagePicker: React.FC = () => {
  const { setUserLanguage } = useAppContext();

  return (
    <div className="screen-container">
      <div className="botanical-bg"></div>
      
      <h2 className="headline-en lang-title">Choose your language</h2>
      <h2 className="headline-hi lang-title hindi">अपनी भाषा चुनें</h2>
      
      <button 
        className="btn-outline headline-en" 
        onClick={() => setUserLanguage('en')}
      >
        English
      </button>
      
      <button 
        className="btn-outline headline-hi" 
        onClick={() => setUserLanguage('hi')}
      >
        हिन्दी
      </button>
    </div>
  );
};
