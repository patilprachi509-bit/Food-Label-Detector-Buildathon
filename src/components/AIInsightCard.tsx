import React from 'react';
import { IconSparkle } from './Icons';

import type { TranslatableString } from '../context/AppContext';

interface AIInsightCardProps {
  insight: {
    claim: TranslatableString;
    concern: TranslatableString | null;
  };
  isEn: boolean;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ insight, isEn }) => {
  if (!insight.concern) return null;

  return (
    <div 
      style={{
        backgroundColor: 'rgba(0,0,0,0.02)',
        border: '1.5px dashed var(--color-text)',
        opacity: 0.8,
        borderRadius: '24px',
        padding: '2rem',
        marginBottom: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', opacity: 0.7 }}>
        <IconSparkle size={14} color="var(--color-text)" />
        <span style={{ fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          {isEn ? 'UNVERIFIED CLAIM' : 'असत्यापित दावा'}
        </span>
      </div>
      
      <h2 className="headline-en" style={{ 
        fontSize: '2rem', 
        lineHeight: 1.1, 
        margin: 0,
        wordBreak: 'break-word',
        color: 'var(--color-text)'
      }}>
        "{isEn ? insight.claim.normalized_english : insight.claim.localized_display}"
      </h2>

      <div style={{ marginTop: '1.5rem', opacity: 0.9 }}>
        <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.4, fontStyle: 'italic' }}>
          {isEn ? insight.concern.normalized_english : insight.concern.localized_display}
        </p>
      </div>
    </div>
  );
};
