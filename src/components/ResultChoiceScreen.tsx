import React from 'react';
import { useAppContext } from '../context/AppContext';

export const ResultChoiceScreen: React.FC = () => {
  const { userLanguage, setHasChosenResultType, resetApp } = useAppContext();
  const isEn = userLanguage === 'en';

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: 'var(--color-bg)',
      backgroundImage: `url('/screen3.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'var(--color-text)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative'
    }}>
      <button 
        onClick={resetApp}
        style={{ position: 'absolute', top: '2.5rem', left: '1.5rem', background: 'none', border: 'none', color: 'var(--color-text)', fontSize: '1rem', fontWeight: 'bold', letterSpacing: '1px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        &larr; {isEn ? 'Cancel' : 'रद्द करें'}
      </button>
      
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', marginTop: '2rem' }}>
        <h2 className={isEn ? 'headline-en' : 'headline-hi'} style={{ fontSize: '2.5rem', lineHeight: 1.1, fontWeight: 900 }}>
          {isEn ? "What do you want to see?" : "आप क्या देखना चाहते हैं?"}
        </h2>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px', zIndex: 1 }}>
        <button 
          onClick={() => setHasChosenResultType('ingredients')} 
          style={{ 
            backgroundColor: 'transparent',
            color: 'var(--color-text)',
            border: '1px solid var(--color-divider)',
            padding: '1.25rem',
            borderRadius: '16px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
          }}
        >
          <span className={isEn ? 'headline-en' : 'headline-hi'}>{isEn ? 'Just the Ingredients' : 'सिर्फ सामग्री'}</span>
          <span style={{ opacity: 0.3 }}>&rarr;</span>
        </button>
        <button 
          onClick={() => setHasChosenResultType('full')} 
          style={{ 
            backgroundColor: 'var(--color-pass)', 
            color: 'white', 
            border: 'none', 
            padding: '1.25rem', 
            borderRadius: '16px', 
            fontSize: '1.2rem', 
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span className={isEn ? 'headline-en' : 'headline-hi'}>{isEn ? 'Full Analysis' : 'पूरा विश्लेषण'}</span>
          <span style={{ opacity: 0.3 }}>&rarr;</span>
        </button>
      </div>
    </div>
  );
};
