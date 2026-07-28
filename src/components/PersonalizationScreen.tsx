import React from 'react';
import { useAppContext } from '../context/AppContext';

export const PersonalizationScreen: React.FC = () => {
  const { userLanguage, setUserFocus, resetApp } = useAppContext();
  const isEn = userLanguage === 'en';

  const handleSelect = (focus: 'sugar' | 'salt' | 'fat' | 'none') => {
    setUserFocus(focus);
  };

  return (
    <div className="screen-container" style={{ position: 'relative' }}>
      <button 
        onClick={resetApp}
        style={{ position: 'absolute', top: '1.5rem', left: '1rem', background: 'none', border: 'none', color: 'var(--color-text)', fontSize: '1rem', fontWeight: 'bold', letterSpacing: '1px', cursor: 'pointer', zIndex: 10 }}
      >
        {isEn ? 'Cancel' : 'रद्द करें'}
      </button>
      <div className="botanical-bg"></div>
      
      <h2 className={`lang-title ${isEn ? 'headline-en' : 'headline-hi'}`} style={{ marginBottom: '2rem' }}>
        {isEn ? "Anything specific you're watching?" : "क्या आप किसी खास चीज़ पर ध्यान दे रहे हैं?"}
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px', zIndex: 1 }}>
        <button className="btn-outline" onClick={() => handleSelect('sugar')}>
          <span className={isEn ? 'headline-en' : 'headline-hi'}>{isEn ? 'Sugar' : 'चीनी'}</span>
        </button>
        <button className="btn-outline" onClick={() => handleSelect('salt')}>
          <span className={isEn ? 'headline-en' : 'headline-hi'}>{isEn ? 'Salt' : 'नमक'}</span>
        </button>
        <button className="btn-outline" onClick={() => handleSelect('fat')}>
          <span className={isEn ? 'headline-en' : 'headline-hi'}>{isEn ? 'Fat' : 'वसा'}</span>
        </button>
        <button className="btn-outline" onClick={() => handleSelect('none')} style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', borderColor: 'var(--color-text)' }}>
          <span className={isEn ? 'headline-en' : 'headline-hi'}>{isEn ? 'Nothing specific' : 'कुछ खास नहीं'}</span>
        </button>
      </div>
    </div>
  );
};
