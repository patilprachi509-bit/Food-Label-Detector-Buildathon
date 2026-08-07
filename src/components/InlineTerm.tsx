import React, { useState } from 'react';

interface InlineTermProps {
  term: string;
  explanationEn: string;
  explanationHi: string;
  isEn: boolean;
  color?: string;
  bgColor?: string;
}

export const InlineTerm: React.FC<InlineTermProps> = ({ 
  term, 
  explanationEn, 
  explanationHi, 
  isEn,
  color = 'var(--color-text)',
  bgColor = 'rgba(0,0,0,0.05)'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const textToShow = isEn ? explanationEn : explanationHi;

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span 
        onClick={(e) => { 
          e.preventDefault();
          e.stopPropagation(); 
          setIsOpen(!isOpen); 
        }}
        style={{ 
          borderBottom: '1.5px dashed currentColor', 
          cursor: 'pointer',
          fontWeight: 'bold',
          color: color,
          paddingBottom: '1px'
        }}
      >
        {term}
      </span>
      {isOpen && (
        <span style={{ 
          display: 'block',
          fontSize: '0.75rem', 
          opacity: 0.95, 
          marginTop: '0.4rem', 
          marginBottom: '0.4rem',
          padding: '0.5rem 0.75rem', 
          backgroundColor: bgColor,
          borderLeft: `3px solid ${color}`,
          borderRadius: '0 4px 4px 0',
          color: color,
          lineHeight: 1.4,
          fontWeight: 'normal',
          textDecoration: 'none',
          fontStyle: 'normal'
        }}>
          {textToShow}
        </span>
      )}
    </span>
  );
};
