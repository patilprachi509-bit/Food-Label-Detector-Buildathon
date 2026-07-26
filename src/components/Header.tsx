import React from 'react';

interface HeaderProps {
  onAudioClick?: () => void;
  isAudioLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onAudioClick, isAudioLoading }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '1rem', borderBottom: '1px solid var(--color-charcoal)' }}>
      {/* Back Button (Static) */}
      <button style={{ background: 'none', border: '1px solid var(--color-charcoal)', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }} onClick={() => window.location.reload()}>
        &larr;
      </button>
      
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h3 className="headline-en" style={{ letterSpacing: '2px', fontSize: '1rem', margin: 0 }}>SCAN RESULT</h3>
        <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-charcoal)', margin: '4px auto 0' }}></div>
      </div>
      
      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {/* Audio Button */}
        <button 
          id="audio-btn" 
          onClick={onAudioClick}
          disabled={isAudioLoading}
          style={{ background: 'none', border: '1px solid var(--color-charcoal)', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', opacity: isAudioLoading ? 0.5 : 1 }}
        >
          {isAudioLoading ? '...' : '\uD83D\uDD0A'}
        </button>
        {/* Share Button (Static) */}
        <button style={{ background: 'none', border: '1px solid var(--color-charcoal)', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}>
          &#8611;
        </button>
      </div>
    </div>
  );
};
