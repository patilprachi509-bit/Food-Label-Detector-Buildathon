import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Header } from './Header';

export const ReviewScreen: React.FC = () => {
  const { pendingExtractionResult, setPendingExtractionResult, setExtractionResult, userLanguage } = useAppContext();
  const isEn = userLanguage === 'en';
  
  // We initialize the local state with the raw list from the pending extraction
  const [ingredientsList, setIngredientsList] = useState(
    pendingExtractionResult?.ingredients?.raw_list?.map(ing => ing.normalized_english) || []
  );

  if (!pendingExtractionResult) return null;

  const handleConfirm = () => {
    // Reconstruct the raw_list with potentially edited values
    const updatedResult = { ...pendingExtractionResult };
    
    // Create new raw_list, reusing original properties where possible, but updating text
    updatedResult.ingredients.raw_list = ingredientsList.map((text, i) => {
      const original = pendingExtractionResult.ingredients.raw_list[i] || {};
      return {
        ...original,
        normalized_english: text,
        // If they edit the English, we'll just fall back to using it as the plain_name if it wasn't already generated,
        // or just let the rule engine use the updated normalized_english.
        plain_name: text,
        localized_display: original.localized_display || text // ideally we'd re-translate, but for simple edits this is safe
      };
    });

    // Move from pending to final
    setExtractionResult(updatedResult);
    setPendingExtractionResult(null);
  };

  const handleEdit = (index: number, newText: string) => {
    const newList = [...ingredientsList];
    newList[index] = newText;
    setIngredientsList(newList);
  };

  const handleDelete = (index: number) => {
    const newList = [...ingredientsList];
    newList.splice(index, 1);
    setIngredientsList(newList);
  };

  const handleAdd = () => {
    setIngredientsList([...ingredientsList, ""]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'var(--color-text)', backgroundImage: `url('/background.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <Header />
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', zIndex: 1, position: 'relative' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 900 }}>
            {isEn ? 'Review Ingredients' : 'सामग्री की समीक्षा करें'}
          </h2>
          <p style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: '0.5rem' }}>
            {isEn 
              ? "Does this match what's printed on your pack? Tap any item to edit, or add missing ones before we analyze it."
              : "क्या यह आपके पैक पर छपे हुए से मेल खाता है? विश्लेषण से पहले किसी भी आइटम को संपादित करने के लिए टैप करें, या छूटे हुए को जोड़ें।"}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {ingredientsList.map((ing, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={ing}
                onChange={(e) => handleEdit(idx, e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-divider)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: '1rem'
                }}
              />
              <button
                onClick={() => handleDelete(idx)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(255, 59, 48, 0.1)',
                  color: '#FF3B30',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
          ))}
          
          <button
            onClick={handleAdd}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '2px dashed var(--color-divider)',
              background: 'transparent',
              color: 'var(--color-text)',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '0.5rem'
            }}
          >
            {isEn ? '+ Add Ingredient' : '+ सामग्री जोड़ें'}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '2rem' }}>
          <button
            onClick={handleConfirm}
            style={{
              background: 'var(--color-text)',
              color: 'var(--color-bg)',
              padding: '1rem 3rem',
              borderRadius: '50px',
              fontSize: '1.2rem',
              fontWeight: 900,
              border: 'none',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            {isEn ? 'Confirm & Analyze' : 'पुष्टि करें और विश्लेषण करें'}
          </button>
        </div>

      </div>
    </div>
  );
};
