import React from 'react';
import type { ExtractionResult } from '../context/AppContext';

interface Props {
  extractionResult: ExtractionResult;
  isEn: boolean;
}

export const AlsoOnThisLabel: React.FC<Props> = ({ extractionResult, isEn }) => {
  const nutrition = extractionResult.nutrition;
  if (!nutrition) return null;

  const nutrients = [
    { 
      id: 'sugar', 
      labelEn: 'Sugar', 
      labelHi: 'चीनी', 
      value: nutrition.total_sugar_g, 
      color: 'var(--color-fail)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16v16H4z"/>
          <path d="M4 12h16"/>
          <path d="M12 4v16"/>
        </svg>
      )
    },
    { 
      id: 'fat', 
      labelEn: 'Fat', 
      labelHi: 'वसा', 
      value: nutrition.total_fat_g, 
      color: 'var(--color-fail)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>
      )
    },
    { 
      id: 'protein', 
      labelEn: 'Protein', 
      labelHi: 'प्रोटीन', 
      value: nutrition.protein_g, 
      color: 'var(--color-pass)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 18h12"/>
          <path d="M6 14h12"/>
          <path d="M6 10h12"/>
          <path d="M6 6h12"/>
        </svg>
      )
    },
    { 
      id: 'fiber', 
      labelEn: 'Fiber', 
      labelHi: 'फाइबर', 
      value: (nutrition as any).fiber_g, 
      color: 'var(--color-pass)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 22 22 2"/>
          <path d="M14 2 2 14"/>
          <path d="M22 10 10 22"/>
        </svg>
      )
    }
  ];

  const presentNutrients = nutrients.filter(n => n.value !== null && n.value !== undefined);
  if (presentNutrients.length === 0) return null;

  const maxVal = Math.max(...presentNutrients.map(n => n.value as number));
  const scale = maxVal > 0 ? maxVal : 1; // Prevent division by zero

  return (
    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-divider)' }}>
      <h4 style={{ 
        letterSpacing: '1px', 
        fontSize: '0.85rem', 
        marginBottom: '1.25rem', 
        textTransform: 'uppercase',
        opacity: 0.8
      }}>
        {isEn ? 'ALSO ON THIS LABEL' : 'इस लेबल पर भी'}
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {presentNutrients.map(n => {
          const widthPct = Math.max(2, ((n.value as number) / scale) * 100);
          
          return (
            <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ color: n.color, opacity: 0.85, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {n.icon}
              </div>
              <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.05)', height: '12px', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ 
                  width: `${widthPct}%`, 
                  backgroundColor: n.color,
                  opacity: 0.7, // Slightly softer than solid flag colors
                  height: '100%',
                  borderRadius: '6px'
                }}></div>
              </div>
              <div style={{ minWidth: '80px', fontSize: '0.85rem', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>
                {isEn ? n.labelEn : n.labelHi} — {n.value}g
              </div>
            </div>
          );
        })}
      </div>

      <p className={isEn ? 'body-en' : 'body-hi'} style={{ 
        fontSize: '0.75rem', 
        opacity: 0.6, 
        fontStyle: 'italic', 
        marginTop: '1.25rem', 
        lineHeight: 1.4 
      }}>
        {isEn 
          ? "Nutrition scientists compare foods this way — weighing helpful nutrients like protein and fiber against ones to limit, like added sugar and fat."
          : "पोषण वैज्ञानिक इस तरह से खाद्य पदार्थों की तुलना करते हैं — प्रोटीन और फाइबर जैसे उपयोगी पोषक तत्वों को अतिरिक्त चीनी और वसा जैसे सीमित करने वाले पोषक तत्वों के मुकाबले तौलते हैं।"}
      </p>
    </div>
  );
};
