import React from 'react';
import { useAppContext } from '../context/AppContext';

interface HeaderProps {
  onAudioClick?: () => void;
  isAudioLoading?: boolean;
  onShareClick?: () => void;
  onCompareClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAudioClick, isAudioLoading, onShareClick, onCompareClick }) => {
  const { viewingSavedScanId, setViewingSavedScanId, setIsHistoryOpen, userLanguage, resetApp } = useAppContext();
  const isEn = userLanguage === 'en';
  
  const isSavedView = !!viewingSavedScanId;

  const handleBack = () => {
    if (isSavedView) {
      setViewingSavedScanId(null);
      setIsHistoryOpen(true);
    } else {
      resetApp();
    }
  };

  const handleAudio = () => {
    if (isSavedView) {
      alert(isEn ? "Audio isn't available for saved scans." : "सहेजे गए स्कैन के लिए ऑडियो उपलब्ध नहीं है।");
    } else if (onAudioClick) {
      onAudioClick();
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '1rem', borderBottom: '1px solid var(--color-divider)' }}>
      {/* Back Button */}
      <button style={{ background: 'none', border: '1px solid var(--color-divider)', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', color: 'var(--color-text)' }} onClick={handleBack}>
        &larr;
      </button>
      
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h3 className="headline-en" style={{ letterSpacing: '2px', fontSize: '1rem', margin: 0 }}>
          {isSavedView ? 'SAVED SCAN' : 'SCAN RESULT'}
        </h3>
        <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-text)', margin: '4px auto 0' }}></div>
      </div>
      
      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {/* Compare Button */}
        {!isSavedView && onCompareClick && (
          <button onClick={onCompareClick} style={{ background: 'none', border: '1px solid var(--color-divider)', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', color: 'var(--color-text)' }}>
            ⇄
          </button>
        )}
        {/* Audio Button */}
        <button 
          id="audio-btn" 
          onClick={handleAudio}
          disabled={isAudioLoading}
          style={{ background: 'none', border: '1px solid var(--color-divider)', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', opacity: (isAudioLoading || isSavedView) ? 0.5 : 1, color: 'var(--color-text)' }}
        >
          {isAudioLoading ? '...' : '\uD83D\uDD0A'}
        </button>
        {/* Share Button */}
        <button onClick={onShareClick} style={{ background: 'none', border: '1px solid var(--color-divider)', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', color: 'var(--color-text)' }}>
          &#8611;
        </button>
      </div>
    </div>
  );
};
