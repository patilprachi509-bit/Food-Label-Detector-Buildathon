import React from 'react';
import { Header } from './Header';

export const LowConfidenceScreen: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--color-cream)', color: 'var(--color-charcoal)' }}>
      <Header />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <div style={{ backgroundColor: '#D97706', color: '#FFF', padding: '0.5rem 1.5rem', borderRadius: '50px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '2rem' }}>
          COULDN'T READ THIS CLEARLY.
        </div>
        
        <h2 className="headline-en" style={{ fontSize: '4rem', lineHeight: 0.9, marginBottom: '2rem' }}>
          Let's try<br/>that scan again.
        </h2>
        
        <p style={{ opacity: 0.8, marginBottom: '3rem' }}>
          The photo was a little unclear —<br/>good lighting and a flat angle<br/>usually help.
        </p>
        
        <button 
          onClick={() => window.location.reload()}
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
          <span className="headline-en" style={{ fontSize: '1.5rem' }}>RETAKE PHOTO</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
};
