import React, { useState } from 'react';

interface CitationProps {
  shortLabel: string;
  textEn: string | React.ReactNode;
  textHi: string | React.ReactNode;
  isEn: boolean;
  color?: string;
  bgColor?: string;
}

export const Citation: React.FC<CitationProps> = ({ shortLabel, textEn, textHi, isEn, color = 'var(--color-text)', bgColor = 'rgba(0,0,0,0.05)' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const textToShow = isEn ? textEn : textHi;

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        style={{ 
          background: bgColor, 
          border: 'none', 
          cursor: 'pointer', 
          padding: '0.25rem 0.5rem', 
          borderRadius: '4px',
          color: color, 
          opacity: 0.9, 
          fontSize: '0.7rem', 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.3rem', 
          fontWeight: 'bold',
          letterSpacing: '0.5px'
        }}
      >
        <span>ⓘ</span> <span>{shortLabel}</span>
      </button>
      {isOpen && (
        <div style={{ 
          fontSize: '0.75rem', 
          opacity: 0.9, 
          marginTop: '0.4rem', 
          padding: '0.5rem 0.75rem', 
          backgroundColor: bgColor,
          borderLeft: `3px solid ${color}`,
          borderRadius: '0 4px 4px 0',
          color: color,
          lineHeight: 1.4
        }}>
          {textToShow}
        </div>
      )}
    </div>
  );
};
