import React from 'react';
import { useAppContext } from '../context/AppContext';

export const LanguagePicker: React.FC = () => {
  const { setUserLanguage } = useAppContext();

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: 'var(--color-bg)',
      backgroundImage: `url('/screen1.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'var(--color-text)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 className="headline-en" style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 900 }}>Choose your language</h2>
        <h2 className="headline-hi" style={{ fontSize: '2rem', opacity: 0.8 }}>अपनी भाषा चुनें</h2>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px' }}>
        <button 
          className="headline-en"
          style={{
            backgroundColor: 'var(--color-pass)',
            color: 'white',
            border: 'none',
            padding: '1.25rem',
            borderRadius: '16px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            letterSpacing: '1px',
            cursor: 'pointer',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
          }}
          onClick={() => setUserLanguage('en')}
        >
          ENGLISH
        </button>
        
        <button 
          className="headline-hi"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--color-text)',
            border: '2px solid var(--color-pass)',
            padding: '1.25rem',
            borderRadius: '16px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          onClick={() => setUserLanguage('hi')}
        >
          हिन्दी
        </button>
      </div>
    </div>
  );
};
