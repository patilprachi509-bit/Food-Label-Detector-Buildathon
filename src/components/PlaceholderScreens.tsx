import React, { useState } from 'react';
import { Header } from './Header';
import { useAppContext } from '../context/AppContext';

export const LowConfidenceScreen: React.FC = () => {
  const { userLanguage, saveScan, viewingSavedScanId, resetApp } = useAppContext();
  const isEn = userLanguage === 'en';
  const [hasSaved, setHasSaved] = useState(!!viewingSavedScanId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Header />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <div style={{ backgroundColor: '#D97706', color: '#FFF', padding: '0.5rem 1.5rem', borderRadius: '50px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '2rem' }}>
          {isEn ? "COULDN'T READ THIS CLEARLY." : "इसे स्पष्ट रूप से पढ़ नहीं सका।"}
        </div>
        
        <h2 className="headline-en" style={{ fontSize: '4rem', lineHeight: 0.9, marginBottom: '2rem' }}>
          {isEn ? (
            <>Let's try<br/>that scan again.</>
          ) : (
            <>आइए उस स्कैन का<br/>फिर से प्रयास करें।</>
          )}
        </h2>
        
        <p style={{ opacity: 0.8, marginBottom: '3rem' }}>
          {isEn ? (
            <>The photo was a little unclear —<br/>good lighting and a flat angle<br/>usually help.</>
          ) : (
            <>तस्वीर थोड़ी अस्पष्ट थी —<br/>अच्छी रोशनी और एक समतल कोण<br/>आमतौर पर मदद करते हैं।</>
          )}
        </p>
        
        <button 
          onClick={resetApp}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            padding: '1rem 2rem', 
            border: '1px solid #D97706', 
            color: '#D97706', 
            backgroundColor: 'transparent',
            borderRadius: '12px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          <span className="headline-en" style={{ fontSize: '1.5rem' }}>{isEn ? 'RETAKE PHOTO' : 'फ़ोटो दोबारा लें'}</span>
          <span>&rarr;</span>
        </button>

        <div style={{ marginTop: '2rem' }}>
          <button 
            onClick={() => {
              if (!hasSaved) {
                saveScan();
                setHasSaved(true);
              }
            }}
            disabled={hasSaved}
            style={{
              backgroundColor: 'transparent',
              color: hasSaved ? 'var(--color-pass)' : 'var(--color-text)',
              border: hasSaved ? 'none' : '1px solid var(--color-divider)',
              borderRadius: '50px',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: hasSaved ? 'default' : 'pointer',
              opacity: hasSaved ? 0.8 : 1,
              transition: 'all 0.2s'
            }}
          >
            {hasSaved ? (isEn ? 'Saved!' : 'सहेजा गया!') : (isEn ? 'Save Scan' : 'स्कैन सहेजें')}
          </button>
        </div>
      </div>
    </div>
  );
};
