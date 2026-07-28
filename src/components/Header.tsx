import React, { useState, useRef, useEffect } from 'react';
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
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
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
    setIsMenuOpen(false);
    if (isSavedView) {
      alert(isEn ? "Audio isn't available for saved scans." : "सहेजे गए स्कैन के लिए ऑडियो उपलब्ध नहीं है।");
    } else if (onAudioClick) {
      onAudioClick();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '1rem 1.5rem', zIndex: 50, position: 'relative' }}>
      {/* Back Button */}
      <button 
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', letterSpacing: '1px' }} 
        onClick={handleBack}
      >
        &larr; {isEn ? 'BACK' : 'वापस'}
      </button>
      
      {/* Actions */}
      <div style={{ position: 'relative' }} ref={menuRef}>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          style={{ background: 'none', border: 'none', width: '40px', height: '40px', cursor: 'pointer', color: 'var(--color-text)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          •••
        </button>
        
        {isMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-divider)',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            minWidth: '150px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100
          }}>
            {!isSavedView && onCompareClick && (
              <button 
                onClick={() => { setIsMenuOpen(false); onCompareClick(); }} 
                style={{ padding: '1rem', background: 'none', border: 'none', borderBottom: '1px solid rgba(0,0,0,0.05)', textAlign: 'left', cursor: 'pointer', color: 'var(--color-text)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                ⇄ {isEn ? 'Compare' : 'तुलना करें'}
              </button>
            )}
            
            <button 
              onClick={handleAudio}
              disabled={isAudioLoading}
              style={{ padding: '1rem', background: 'none', border: 'none', borderBottom: '1px solid rgba(0,0,0,0.05)', textAlign: 'left', cursor: 'pointer', opacity: (isAudioLoading || isSavedView) ? 0.5 : 1, color: 'var(--color-text)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span style={{ fontSize: '1.2rem' }}>{isAudioLoading ? '...' : '\uD83D\uDD0A'}</span> {isEn ? 'Listen' : 'सुनें'}
            </button>
            
            <button 
              onClick={() => { setIsMenuOpen(false); if (onShareClick) onShareClick(); }} 
              style={{ padding: '1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--color-text)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span style={{ fontSize: '1.2rem' }}>&#8611;</span> {isEn ? 'Share' : 'साझा करें'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
