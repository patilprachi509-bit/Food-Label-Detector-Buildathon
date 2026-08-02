import React, { useEffect, useState } from 'react';
import type { Flag } from '../utils/ruleEngine';

export interface MatchedClaim {
  flag: Flag;
  claimText: string;
  box: { x: number; y: number; width: number; height: number; image_index?: number };
}

interface Props {
  image: string;
  matchedClaims: MatchedClaim[];
  isEn: boolean;
}

export const AnnotatedPhotoReveal: React.FC<Props> = ({ image, matchedClaims, isEn }) => {
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    // Show panel shortly after the last animation starts
    const totalDelay = (matchedClaims.length - 1) * 300 + 400; 
    const timer = setTimeout(() => setShowPanel(true), totalDelay);
    return () => clearTimeout(timer);
  }, [matchedClaims.length]);

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      marginBottom: '2rem', 
      borderRadius: '16px', 
      overflow: 'hidden', 
      backgroundColor: '#000', 
      boxShadow: '0 8px 24px rgba(0,0,0,0.1)' 
    }}>
      {/* Underlying Photo */}
      <img src={image} alt="Captured product" style={{ width: '100%', display: 'block', objectFit: 'contain' }} />

      {/* SVG Overlay for bounding boxes & strikethroughs */}
      <svg 
        style={{ 
          position: 'absolute', 
          top: 0, left: 0, 
          width: '100%', height: '100%', 
          pointerEvents: 'none' 
        }}
      >
        <defs>
          <style>
            {`
              @keyframes drawLine {
                from { stroke-dashoffset: 100; }
                to { stroke-dashoffset: 0; }
              }
              .strikethrough {
                stroke-dasharray: 100;
                stroke-dashoffset: 100;
                animation: drawLine 0.5s ease-out forwards;
              }
            `}
          </style>
        </defs>

        {matchedClaims.map((match, idx) => {
          const { x, y, width, height } = match.box;
          const startX = `${x}%`;
          const endX = `${x + width}%`;
          const startY = `${y + height / 2}%`;
          
          return (
            <g key={idx}>
              <rect 
                x={`${x}%`} y={`${y}%`} width={`${width}%`} height={`${height}%`} 
                fill="none" stroke="var(--color-fail)" strokeWidth="2" strokeOpacity="0.8" rx="4" 
              />
              <line 
                x1={startX} y1={startY} x2={endX} y2={startY} 
                stroke="var(--color-fail)" 
                strokeWidth="6" 
                strokeLinecap="round"
                className="strikethrough"
                style={{ animationDelay: `${idx * 0.3}s` }}
                pathLength="100"
              />
            </g>
          );
        })}
      </svg>

      {/* Shared Callout Panel */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '3rem 1.5rem 1.5rem 1.5rem',
        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 60%, transparent 100%)',
        color: 'white',
        opacity: showPanel ? 1 : 0,
        transform: showPanel ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, fontWeight: 'bold', color: 'var(--color-fail)' }}>
          {isEn ? 'Misleading Claims Detected' : 'भ्रामक दावे पाए गए'}
        </div>
        {matchedClaims.map((match, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold', lineHeight: 1.3 }}>
            <span style={{ color: 'var(--color-fail)', marginTop: '2px', fontSize: '1.2rem' }}>×</span>
            <span>{isEn ? match.flag.headline_en : match.flag.headline_hi}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
