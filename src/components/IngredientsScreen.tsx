import React from 'react';
import { useAppContext } from '../context/AppContext';
import { IngredientPill } from './IngredientPill';

export const IngredientsScreen: React.FC = () => {
  const { userLanguage, extractionResult, setIsIngredientsOpen } = useAppContext();
  const isEn = userLanguage === 'en';

  if (!extractionResult) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'var(--color-text)', backgroundImage: `url('/background.png')`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--color-divider)' }}>
        <button 
          onClick={() => setIsIngredientsOpen(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', marginRight: '1rem', color: 'var(--color-text)' }}
          aria-label="Back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h2 className="headline-en" style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '1px' }}>
          {isEn ? 'INGREDIENTS' : 'सामग्री'}
        </h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {extractionResult.ingredients.raw_list.map((ing, idx) => {
            const rawName = isEn ? ing.normalized_english : (ing.localized_display || ing.normalized_english);
            const rawClean = ing.normalized_english?.trim().toLowerCase() || '';
            const plainClean = ing.plain_name?.trim().toLowerCase() || '';
            const isExpandable = Boolean(plainClean && plainClean !== rawClean);

            return (
              <IngredientPill 
                key={idx} 
                rawName={rawName} 
                plainName={ing.plain_name || ''} 
                isExpandable={isExpandable} 
                isFaded={false} 
                isEn={isEn}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
