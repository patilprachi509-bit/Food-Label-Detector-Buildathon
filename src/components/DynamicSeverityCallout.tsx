import React from 'react';
import type { ExtractionResult } from '../context/AppContext';
import type { Flag } from '../utils/ruleEngine';

interface Props {
  flags: Flag[];
  extractionResult: ExtractionResult;
  isEn: boolean;
  overallState: string;
}

export const DynamicSeverityCallout: React.FC<Props> = ({ flags, extractionResult, isEn, overallState }) => {
  const severityFlags = flags.filter(f => ['G1', 'G2', 'G3', 'G4'].includes(f.ruleId));
  if (severityFlags.length === 0) return null;

  // Find most severe flag
  let mostSevere = severityFlags[0];
  let maxRatio = 0;

  severityFlags.forEach(f => {
    if (f.actualValue !== undefined && f.thresholdValue !== undefined && f.thresholdValue > 0) {
      const ratio = f.actualValue / f.thresholdValue;
      if (ratio > maxRatio) {
        maxRatio = ratio;
        mostSevere = f;
      }
    }
  });

  const { nutrition } = extractionResult;
  const protein = nutrition.protein_g || 0;
  const fiber = nutrition.fiber_g;
  const hasFiber = fiber !== null && fiber !== undefined;
  const combined = protein + (hasFiber ? fiber : 0);

  let nutrientEn = '';
  let nutrientHi = '';
  let actualGrams = mostSevere.actualGrams || 0;

  if (mostSevere.ruleId === 'G1') {
    nutrientEn = 'added sugar';
    nutrientHi = 'अतिरिक्त चीनी';
    // fallback if added sugar grams not parsed perfectly
    if (!actualGrams) actualGrams = nutrition.added_sugar_g || nutrition.total_sugar_g;
    if (mostSevere.message_en.includes('Total sugar')) {
      nutrientEn = 'sugar';
      nutrientHi = 'चीनी';
      actualGrams = nutrition.total_sugar_g;
    }
  } else if (mostSevere.ruleId === 'G2') {
    nutrientEn = 'fat';
    nutrientHi = 'फैट';
    if (!actualGrams) actualGrams = nutrition.total_fat_g;
  } else if (mostSevere.ruleId === 'G4') {
    nutrientEn = 'trans fat';
    nutrientHi = 'ट्रांस फैट';
    if (!actualGrams) actualGrams = nutrition.trans_fat_g || 0;
  }

  const getTierTextEn = (state: string, nEn: string) => {
    if (state === 'NOT RECOMMENDED') return "not recommended";
    if (state === 'MOSTLY FINE') return `flagged as mostly fine — watch ${nEn}`;
    if (state === 'VERIFICATION NEEDED') return "flagged for verification";
    if (state === 'MINOR ISSUES') return "flagged for minor issues";
    return state.toLowerCase();
  };

  const getTierTextHi = (state: string, nHi: string) => {
    if (state === 'NOT RECOMMENDED') return "अनुशंसित नहीं है";
    if (state === 'MOSTLY FINE') return `ज़्यादातर ठीक के रूप में फ़्लैग किया गया — ${nHi} पर नज़र रखें`;
    if (state === 'VERIFICATION NEEDED') return "सत्यापन के लिए फ़्लैग किया गया";
    if (state === 'MINOR ISSUES') return "मामूली समस्याओं के लिए फ़्लैग किया गया";
    return state.toLowerCase();
  };

  const tierTextEn = getTierTextEn(overallState, nutrientEn || 'salt');
  const tierTextHi = getTierTextHi(overallState, nutrientHi || 'नमक');

  let textEn = '';
  let textHi = '';

  if ((mostSevere.ruleId === 'G1' || mostSevere.ruleId === 'G2') && actualGrams > combined) {
    if (hasFiber) {
      textEn = `This product has more ${nutrientEn} (${actualGrams}g) than protein and fiber combined (${combined}g) — that's why this is ${tierTextEn}.`;
      textHi = `इस उत्पाद में प्रोटीन और फाइबर दोनों मिलाकर (${combined}g) से अधिक ${nutrientHi} (${actualGrams}g) है — इसीलिए यह ${tierTextHi}।`;
    } else {
      textEn = `This product has more ${nutrientEn} (${actualGrams}g) than protein (${protein}g) — that's why this is ${tierTextEn}.`;
      textHi = `इस उत्पाद में प्रोटीन (${protein}g) से अधिक ${nutrientHi} (${actualGrams}g) है — इसीलिए यह ${tierTextHi}।`;
    }
  } else {
    // Fallback for salt, trans fat, or if it doesn't strictly have more than protein+fiber
    const nEn = mostSevere.ruleId === 'G3' ? 'salt' : nutrientEn;
    const nHi = mostSevere.ruleId === 'G3' ? 'नमक' : nutrientHi;
    textEn = `This product's ${nEn} is well above the recommended limit — that's why this is ${tierTextEn}.`;
    textHi = `इस उत्पाद में ${nHi} अनुशंसित सीमा से काफी ऊपर है — इसीलिए यह ${tierTextHi}।`;
  }

  return (
    <div style={{
      backgroundColor: 'var(--color-bg)',
      border: '1px solid var(--color-fail)',
      borderRadius: '16px',
      padding: '1.25rem',
      marginBottom: '2rem',
      boxShadow: '0 4px 12px rgba(233, 116, 81, 0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <svg style={{ flexShrink: 0, color: 'var(--color-fail)', marginTop: '2px' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p style={{
          margin: 0,
          color: 'var(--color-text)',
          fontSize: '1.1rem',
          fontWeight: 700,
          lineHeight: 1.4
        }}>
          {isEn ? textEn : textHi}
        </p>
      </div>
    </div>
  );
};
