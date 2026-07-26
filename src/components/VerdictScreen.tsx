import React, { useMemo, useState } from 'react';
import { useAppContext, TranslatableString } from '../context/AppContext';
import { evaluateRules } from '../utils/ruleEngine';
import { playVerdictAudio } from '../utils/audioService';
import { Header } from './Header';
import { FlagCard } from './FlagCard';

export const VerdictScreen: React.FC = () => {
  const { apiKey, extractionResult, userFocus, userLanguage } = useAppContext();
  const isEn = userLanguage === 'en';
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const flags = useMemo(() => {
    if (!extractionResult) return [];
    return evaluateRules(extractionResult, userFocus);
  }, [extractionResult, userFocus]);

  // Aggregate relevant ingredients across all flags
  const relevantIngredients = useMemo(() => {
    const allIngredients: TranslatableString[] = [];
    flags.forEach(flag => {
      flag.relevantIngredients.forEach(ing => {
        // Prevent duplicates based on normalized english
        if (!allIngredients.find(i => i.normalized_english === ing.normalized_english)) {
          allIngredients.push(ing);
        }
      });
    });
    return allIngredients;
  }, [flags]);

  const handleAudioClick = async () => {
    if (!apiKey || !userLanguage) return;
    setIsAudioLoading(true);
    await playVerdictAudio(apiKey, flags, relevantIngredients, userLanguage);
    setIsAudioLoading(false);
  };

  if (flags.length === 0) {
    return (
      <div className="screen-container">
        <Header onAudioClick={handleAudioClick} isAudioLoading={isAudioLoading} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 className="headline-en" style={{ fontSize: '5rem', lineHeight: 1 }}>NO ISSUES FOUND</h1>
          <div style={{ backgroundColor: '#6b705c', color: '#fff', padding: '0.5rem 1.5rem', borderRadius: '50px', fontSize: '1.5rem', marginTop: '1rem', fontWeight: 'bold' }} className="headline-en">
            GRADE A
          </div>
          <p style={{ marginTop: '2rem', opacity: 0.8 }}>
            {isEn ? "Checked against sourced rules — nothing flagged." : "स्रोत नियमों के विरुद्ध जाँच की गई — कुछ भी फ्लैग नहीं किया गया।"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--color-cream)', color: 'var(--color-charcoal)' }}>
      <Header onAudioClick={handleAudioClick} isAudioLoading={isAudioLoading} />
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {flags.map((flag, idx) => (
          <FlagCard key={`${flag.ruleId}-${idx}`} flag={flag} />
        ))}

        {relevantIngredients.length > 0 && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(43,43,38,0.2)', paddingTop: '2rem' }}>
            <h4 style={{ letterSpacing: '1px', fontSize: '0.9rem', marginBottom: '1rem' }}>{isEn ? 'RELEVANT INGREDIENTS' : 'प्रासंगिक सामग्री'}</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {relevantIngredients.map((ing, idx) => (
                <div key={idx} style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-charcoal)', borderRadius: '50px', fontSize: '0.9rem' }}>
                  {isEn ? ing.normalized_english : ing.localized_display}
                </div>
              ))}
            </div>
            <a href="#" style={{ color: 'inherit', textDecoration: 'underline', fontSize: '0.9rem' }}>
              {isEn ? 'Show full ingredient list' : 'पूरी सामग्री सूची दिखाएं'}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
