import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export const DemoPreviewCard: React.FC = () => {
  const { userLanguage, isDemoDismissed, setIsDemoDismissed, savedScans } = useAppContext();
  const isEn = userLanguage === 'en';
  
  // States: 0 = Headline, 1 = Face/Circles, 2 = Key Flag
  const [step, setStep] = useState(0);

  // Auto-dismiss if they have completed a real scan or manually dismissed
  if (isDemoDismissed || savedScans.length > 0) {
    return null;
  }

  // Realistic mock data for the demo
  const mockDemoData = {
    brandName: 'Demo Brand',
    productName: 'Energy Drink',
    verdictEn: 'NOT RECOMMENDED',
    verdictHi: 'अनुशंसित नहीं',
    flagTitleEn: 'Maltodextrin',
    flagTitleHi: 'माल्टोडेक्सट्रिन',
    flagDescEn: 'Causes spike in blood sugar',
    flagDescHi: 'रक्त शर्करा में वृद्धि का कारण बनता है',
  };

  // Malformed data check (though hardcoded, adhering to instructions)
  if (!mockDemoData.brandName || !mockDemoData.verdictEn || !mockDemoData.flagTitleEn) {
    return null;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 2500); // 2.5 seconds per step
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      position: 'relative',
      backgroundColor: 'var(--color-surface)',
      margin: '0 1.5rem 1rem 1.5rem',
      borderRadius: '16px',
      padding: '1.25rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '120px',
      overflow: 'hidden',
      border: '1px solid var(--color-divider)'
    }}>
      {/* Dismiss Button */}
      <button 
        onClick={() => setIsDemoDismissed(true)}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(0,0,0,0.05)',
          border: 'none',
          borderRadius: '50%',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--color-text)',
          opacity: 0.6,
          zIndex: 10
        }}
        aria-label="Dismiss"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      {/* Label */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        fontSize: '0.65rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontWeight: 'bold',
        color: 'var(--color-text)',
        opacity: 0.4
      }}>
        {isEn ? 'Example scan' : 'उदाहरण स्कैन'}
      </div>

      {/* Animated Content Wrapper */}
      <div style={{
        width: '100%',
        height: '60px', // Fixed height to prevent layout jumps
        marginTop: '1.5rem',
        position: 'relative'
      }}>
        
        {/* Step 0: Headline */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: step === 0 ? 1 : 0,
          transform: step === 0 ? 'translateY(0)' : (step === 1 ? 'translateY(-10px)' : 'translateY(10px)'),
          transition: 'all 0.5s ease-in-out',
          pointerEvents: step === 0 ? 'auto' : 'none'
        }}>
          <h2 className="headline-en" style={{ 
            fontSize: '1.25rem', 
            color: 'var(--color-fail)', 
            lineHeight: 1.1, 
            fontWeight: 900, 
            margin: 0, 
            textAlign: 'center' 
          }}>
            {isEn ? mockDemoData.verdictEn : mockDemoData.verdictHi}
          </h2>
        </div>

        {/* Step 1: Face/Circles Summary */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: step === 1 ? 1 : 0,
          transform: step === 1 ? 'translateY(0)' : (step === 2 ? 'translateY(-10px)' : 'translateY(10px)'),
          transition: 'all 0.5s ease-in-out',
          pointerEvents: step === 1 ? 'auto' : 'none'
        }}>
          <svg width="48" height="48" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="45" fill="var(--color-fail)" />
             <path d="M35 40 Q40 35 45 40" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
             <path d="M55 40 Q60 35 65 40" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
             <path d="M35 65 Q50 60 65 65" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* Step 2: Key Flag */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: step === 2 ? 1 : 0,
          transform: step === 2 ? 'translateY(0)' : (step === 0 ? 'translateY(-10px)' : 'translateY(10px)'),
          transition: 'all 0.5s ease-in-out',
          pointerEvents: step === 2 ? 'auto' : 'none'
        }}>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', color: 'var(--color-fail)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            {isEn ? mockDemoData.flagTitleEn : mockDemoData.flagTitleHi}
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8, textAlign: 'center' }}>
            {isEn ? mockDemoData.flagDescEn : mockDemoData.flagDescHi}
          </p>
        </div>

      </div>
    </div>
  );
};
