import React from 'react';
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
  const { userLanguage, extractionResult, setHasChosenResultType, resetApp } = useAppContext();
  const isEn = userLanguage === 'en';

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
              rawName = ing.localized_display || COMMON_INGREDIENTS_HINDI[ing.normalized_english.toLowerCase()] || ing.normalized_english;
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
    </div>
  );
};
