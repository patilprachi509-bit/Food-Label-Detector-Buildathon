import React from 'react';
import { useAppContext } from '../context/AppContext';

export const ThirdImageInterstitial: React.FC = () => {
  const { userLanguage, setThirdImageStatus } = useAppContext();
  const isEn = userLanguage === 'en';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-text)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{ marginBottom: '3rem', width: '100%', maxWidth: '400px' }}>
        <h2 className={isEn ? 'headline-en' : 'headline-hi'} style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.2 }}>
          {isEn ? "Did we get everything?" : "क्या हमने सब कुछ ले लिया?"}
        </h2>
        <p className={isEn ? 'body-en' : 'body-hi'} style={{ opacity: 0.8, fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.5 }}>
          {isEn 
            ? "If the ingredients and nutrition facts are on different sides of the pack, you can add one more photo." 
            : "यदि सामग्री और पोषण तथ्य पैक के अलग-अलग किनारों पर हैं, तो आप एक और फोटो जोड़ सकते हैं।"}
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            className="btn-primary" 
            onClick={() => {
              console.log('ThirdImageInterstitial: Tapped That is Everything');
              setThirdImageStatus('skipped');
            }}
            style={{ padding: '1rem', fontSize: '1.1rem' }}
          >
            {isEn ? "That's Everything" : "बस इतना ही"}
          </button>
          
          <button 
            className="btn-secondary" 
            onClick={() => {
              console.log('ThirdImageInterstitial: Tapped Add Another Photo');
              setThirdImageStatus('pending');
            }}
            style={{ padding: '1rem', fontSize: '1.1rem', backgroundColor: 'transparent', border: '2px solid var(--color-primary)', color: 'var(--color-primary)' }}
          >
            {isEn ? "Add Another Photo" : "एक और फोटो जोड़ें"}
          </button>
        </div>
      </div>
    </div>
  );
};
