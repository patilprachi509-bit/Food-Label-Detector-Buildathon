import React from 'react';
import { useAppContext } from '../context/AppContext';

export const HomeScreen: React.FC = () => {
  const { userLanguage, setUserLanguage, setIsHistoryOpen, setIsScanning } = useAppContext();
  const isEn = userLanguage === 'en';

  const toggleLanguage = () => {
    setUserLanguage(isEn ? 'hi' : 'en');
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: 'var(--color-bg)',
      backgroundImage: `url('/screen0.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'var(--color-text)' 
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 1.5rem', marginTop: '2rem' }}>
        <h1 className="headline-en" style={{ fontSize: '1.2rem', margin: 0, letterSpacing: '2px', fontWeight: 'bold' }}>LABEL TRUTH</h1>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={toggleLanguage}
            style={{ background: 'none', border: '1px solid var(--color-divider)', borderRadius: '50px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {isEn ? 'HI' : 'EN'}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          
          <button 
            onClick={() => setIsHistoryOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'var(--color-text)' }}
            aria-label="History"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8v4l3 3M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hero Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        
        <h2 className={isEn ? 'headline-en' : 'headline-hi'} style={{ fontSize: '3.5rem', lineHeight: 1, marginBottom: '1.5rem', fontWeight: 900, textTransform: 'uppercase' }}>
          {isEn ? "Know what's really in it" : "जानें कि इसमें वास्तव में क्या है"}
        </h2>
        
        {/* Leaf separator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', opacity: 0.6 }}>
          <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--color-text)' }}></div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
          <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--color-text)' }}></div>
        </div>
        
        <p className={isEn ? 'body-en' : 'body-hi'} style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '280px', margin: '0 auto', lineHeight: 1.4 }}>
          {isEn ? "Scan any pack.\nWe check the claim against the real numbers." : "किसी भी पैक को स्कैन करें।\nहम वास्तविक संख्याओं के विरुद्ध दावों की जाँच करते हैं।"}
        </p>
      </div>

      {/* CTA Footer */}
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <button 
          onClick={() => setIsScanning(true)}
          style={{ 
            width: '100%', 
            backgroundColor: 'var(--color-pass)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '16px', 
            padding: '1.25rem', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.3)' }}></div>
            <span className="headline-en" style={{ fontSize: '1.2rem', letterSpacing: '1px', fontWeight: 'bold' }}>
              {isEn ? 'SCAN A PRODUCT' : 'उत्पाद स्कैन करें'}
            </span>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
        
        <a 
          href="https://forms.gle/QzGgJSZbhV4Sc62A6" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            color: 'var(--color-text)',
            opacity: 0.7,
            fontSize: '0.9rem',
            textDecoration: 'underline',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}
        >
          {isEn ? 'Give Feedback' : 'प्रतिक्रिया दें'}
        </a>
      </div>
    </div>
  );
};
