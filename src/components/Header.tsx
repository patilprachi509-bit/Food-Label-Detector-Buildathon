import React from 'react';
import { useAppContext } from '../context/AppContext';

interface HeaderProps {
  onAudioClick?: () => void;
  isAudioLoading?: boolean;
  onShareClick?: () => void;
  isSharingLoading?: boolean;
  onCompareClick?: () => void;
  onCombineClick?: () => void;
  onIngredientsClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShareClick, isSharingLoading, onCompareClick, onCombineClick, onIngredientsClick }) => {
  const { viewingSavedScanId, setViewingSavedScanId, setIsHistoryOpen, userLanguage, resetApp, viewingBatchResultId, setViewingBatchResultId, setExtractionResult } = useAppContext();
  const isEn = userLanguage === 'en';
  
  const isSavedView = !!viewingSavedScanId;
  const isBatchView = !!viewingBatchResultId;

  const handleBack = () => {
    if (isSavedView) {
      setViewingSavedScanId(null);
      setIsHistoryOpen(true);
    } else if (isBatchView) {
      setViewingBatchResultId(null);
      setExtractionResult(null);
    } else {
      resetApp();
    }
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr auto 1fr', 
      alignItems: 'center', 
      width: '100%', 
      padding: '1.5rem 1.5rem 1rem 1.5rem', 
      zIndex: 50, 
      position: 'relative' 
    }}>
      {/* Back Button & Ingredients (Left) */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '1rem' }}>
        <button 
          className="effect-neumorphic"
          style={{ 
            border: 'none', 
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer', 
            color: 'var(--color-text)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
          }} 
          onClick={handleBack}
          aria-label="Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        {onIngredientsClick && (
          <button 
            className="effect-neumorphic"
            onClick={onIngredientsClick} 
            style={{ border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            aria-label="Ingredients"
            title={isEn ? "View Details" : "विवरण देखें"}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      {/* Title (Center) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 className="headline-en" style={{ fontSize: '1rem', letterSpacing: '2px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>
          {isEn ? 'SCAN RESULT' : 'स्कैन परिणाम'}
        </h1>
        <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-text)', marginTop: '0.4rem' }}></div>
      </div>
      
      {/* Actions (Right) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
        {!isSavedView && onCompareClick && (
          <button 
            className="effect-neumorphic"
            onClick={onCompareClick} 
            style={{ border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            aria-label="Compare"
            title={isEn ? "Compare" : "तुलना करें"}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8"></polyline>
              <line x1="4" y1="14" x2="21" y2="3"></line>
              <polyline points="8 21 3 21 3 16"></polyline>
              <line x1="20" y1="10" x2="3" y2="21"></line>
            </svg>
          </button>
        )}

        {!isSavedView && onCombineClick && (
          <button 
            className="effect-neumorphic"
            onClick={onCombineClick} 
            style={{ border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            aria-label="Combine"
            title={isEn ? "Combine" : "मिलाएं"}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        )}
        
        {/* FEATURE FLAG: Audio disabled due to caching bug */}
        {/* <button 
          className="effect-neumorphic"
          onClick={handleAudio}
          disabled={isAudioLoading}
          style={{ border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', opacity: (isAudioLoading || isSavedView) ? 0.5 : 1, color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
          aria-label="Listen"
        >
          {isAudioLoading ? (
            <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>...</span>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
          )}
        </button> */}
        
        {onShareClick && (
          <button 
            className="effect-neumorphic"
            onClick={onShareClick} 
            disabled={isSharingLoading}
            style={{ border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: isSharingLoading ? 'wait' : 'pointer', color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, opacity: isSharingLoading ? 0.5 : 1 }}
            aria-label="Share"
          >
            {isSharingLoading ? (
              <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>...</span>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
