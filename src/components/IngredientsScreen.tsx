import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { IngredientPill } from './IngredientPill';
import { COMMON_INGREDIENTS_HINDI } from '../utils/hindiDictionary';

const ICONS: Record<string, string> = {
  tomato: '🍅',
  sugar: '🧊',
  onion: '🧅',
  salt: '🧂',
  garlic: '🧄',
  chemical: '🧪',
  shield: '🛡️',
  spices: '🌶️',
  leaf: '🌿',
  grain: '🌾',
  default: '🥣'
};

export const IngredientsScreen: React.FC = () => {
  const { userLanguage, extractionResult, setHasChosenResultType, resetApp, saveScan, viewingSavedScanId } = useAppContext();
  const isEn = userLanguage === 'en';
  const [hasSaved, setHasSaved] = useState(!!viewingSavedScanId);

  if (!extractionResult) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'var(--color-text)', backgroundImage: `url('/background.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--color-divider)' }}>
        <button 
          onClick={resetApp}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', marginRight: '1rem', color: 'var(--color-text)' }}
          aria-label="Back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h2 className="headline-en" style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '1px', flex: 1 }}>
          {isEn ? 'INGREDIENTS' : 'सामग्री'}
        </h2>
        <button 
          onClick={() => setHasChosenResultType('full')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', fontSize: '0.85rem', fontWeight: 'bold', textDecoration: 'underline' }}
        >
          {isEn ? 'View full analysis' : 'पूरा विश्लेषण देखें'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {extractionResult.ingredients.raw_list.map((ing, idx) => {
            let rawName = ing.normalized_english;
            if (!isEn) {
              const strippedName = ing.normalized_english.replace(/\s*\d+(\.\d+)?%?\s*$/, '').trim().toLowerCase();
              rawName = ing.localized_display || COMMON_INGREDIENTS_HINDI[strippedName] || COMMON_INGREDIENTS_HINDI[ing.normalized_english.toLowerCase()] || ing.normalized_english;
            }
            
            const plainName = ing.plain_name || '';
            const rawClean = ing.normalized_english?.trim().toLowerCase() || '';
            const plainClean = plainName.trim().toLowerCase();
            const descStr = ing.description ? (isEn ? ing.description.normalized_english : (ing.description.localized_display || ing.description.normalized_english)) : '';
            const isExpandable = Boolean((plainClean && plainClean !== rawClean) || descStr);
            
            const iconStr = ICONS[ing.icon || 'default'] || ICONS['default'];

            return (
              <IngredientPill 
                key={idx} 
                rawName={rawName} 
                plainName={plainName} 
                isExpandable={isExpandable} 
                isFaded={false} 
                isEn={isEn}
                description={descStr}
                iconStr={iconStr}
                percentage={ing.percentage ?? undefined}
              />
            );
          })}
        </div>

      </div>

      {/* Sticky Bottom Action Bar */}
      <div style={{ 
        padding: '1.2rem 1.5rem', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: '1rem', 
        flexWrap: 'wrap',
        background: 'rgba(247, 242, 233, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(176, 141, 87, 0.2)',
        zIndex: 10
      }}>
        {/* Save Scan Button */}
        <button 
          className="effect-gradient-glow"
          onClick={() => {
            if (!hasSaved) {
              saveScan();
              setHasSaved(true);
            }
          }}
          disabled={hasSaved}
          style={{
            backgroundColor: hasSaved ? 'var(--color-pass)' : 'var(--color-text)',
            color: 'var(--color-bg)',
            border: 'none',
            borderRadius: '50px',
            padding: '0.85rem 1.25rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            cursor: hasSaved ? 'default' : 'pointer',
            opacity: hasSaved ? 0.8 : 1,
            transition: 'background-color 0.2s, transform 0.2s',
            flex: '1 1 auto',
            maxWidth: '200px'
          }}
        >
          {hasSaved ? (isEn ? 'Saved!' : 'सहेजा गया!') : (isEn ? 'Save Scan' : 'स्कैन सहेजें')}
        </button>

        {/* Feedback Link */}
        <a 
          className="effect-gradient-glow"
          href="https://forms.gle/QzGgJSZbhV4Sc62A6" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.05)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-divider)',
            borderRadius: '50px',
            padding: '0.85rem 1.25rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            textDecoration: 'none',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            transition: 'all 0.2s',
            flex: '1 1 auto',
            maxWidth: '200px',
            textAlign: 'center'
          }}
        >
          {isEn ? 'Give Feedback' : 'प्रतिक्रिया दें'}
        </a>
      </div>
    </div>
  );
};
