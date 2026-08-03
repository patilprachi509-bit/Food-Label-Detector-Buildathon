import React from 'react';
import type { ExtractionResult } from '../context/AppContext';
import type { Flag } from '../utils/ruleEngine';
import { getDailyLimitInfo } from '../utils/dailyLimits';
import { Citation } from './Citation';

interface Props {
  flags: Flag[];
  extractionResult: ExtractionResult;
  isEn: boolean;
  userGender: 'standard' | 'male' | 'female';
}

export const ConsolidatedRecommendation: React.FC<Props> = ({ flags, extractionResult, isEn, userGender }) => {
  // G4 (trans fat) is explicitly excluded from this card
  const gFlags = flags.filter(f => f.type === 'general_health' && f.ruleId !== 'G4');
  if (gFlags.length === 0) return null;

  const packWeight = extractionResult.front_of_pack?.net_weight_g;
  const format = extractionResult.front_of_pack?.consumption_format || 'other';
  const servingStr = extractionResult.nutrition.serving_size;

  let refWeight = 100;
  if (format === 'solid_snack' && packWeight) {
    refWeight = packWeight;
  } else if (format === 'beverage') {
    refWeight = 200;
  } else if (servingStr) {
    const parsedMatch = servingStr.match(/(\d+(?:\.\d+)?)\s*(?:g|ml)/i);
    if (parsedMatch && parsedMatch[1]) {
      refWeight = parseFloat(parsedMatch[1]);
    }
  }

  // STEP 1 - COMPUTATION
  let minTargetGrams = Infinity;
  let limitingNutrientEn = '';
  let limitingNutrientHi = '';

  gFlags.forEach(f => {
    // getDailyLimitInfo handles the sodium-to-salt conversion internally
    const limitInfo = getDailyLimitInfo(f, extractionResult, userGender);
    if (limitInfo && limitInfo.dailyLimitGrams > 0 && limitInfo.nutrientPer100g > 0) {
      // safe_amount_g = (0.25 * daily_limit_g) / nutrient_value_per_100g * 100
      const targetGrams = (limitInfo.dailyLimitGrams * 0.25 / limitInfo.nutrientPer100g) * 100;
      
      if (targetGrams < minTargetGrams) {
        minTargetGrams = targetGrams;
        if (f.ruleId === 'G1') { limitingNutrientEn = 'sugar'; limitingNutrientHi = 'चीनी'; }
        else if (f.ruleId === 'G2') { limitingNutrientEn = 'fat/oil'; limitingNutrientHi = 'वसा/तेल'; }
        else if (f.ruleId === 'G3') { limitingNutrientEn = 'salt'; limitingNutrientHi = 'नमक'; }
      }
    }
  });

  if (minTargetGrams === Infinity) return null;

  // STEP 2 - OUT-OF-RANGE CASE
  if (minTargetGrams >= refWeight) {
    const isPack = format === 'solid_snack' && packWeight && refWeight === packWeight;
    const isGlass = format === 'beverage' && refWeight === 200;
    
    let containerEn = 'serving';
    let containerHi = 'सर्विंग';
    if (isPack) { containerEn = 'pack'; containerHi = 'पैक'; }
    else if (isGlass) { containerEn = 'glass'; containerHi = 'गिलास'; }
    
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', borderRadius: '24px', padding: '2rem', marginBottom: '2rem', border: '1px solid var(--color-fail)', boxShadow: '0 8px 24px rgba(233,116,81,0.1)' }}>
        <h4 style={{ textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '0.75rem', fontWeight: 'bold', color: 'var(--color-fail)' }}>
          {isEn ? 'Suggested Portion' : 'सुझाया गया हिस्सा'}
        </h4>
        <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-text)', margin: '0 0 0.75rem 0', lineHeight: 1.3 }}>
          {isEn 
            ? `The full ${containerEn} fits within your daily ${limitingNutrientEn} limit.`
            : `पूरा ${containerHi} आपकी रोज़ की ${limitingNutrientHi} सीमा में फिट बैठता है।`}
        </p>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-fail)', fontWeight: 'bold', margin: '0 0 1rem 0' }}>
          {isEn 
            ? `This product is still flagged as high in ${limitingNutrientEn}.`
            : `यह उत्पाद अब भी ${limitingNutrientHi} में अधिक के रूप में चिह्नित है।`}
        </p>
        <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: '0.25rem' }}>
          <Citation 
            shortLabel="ICMR-NIN"
            textEn={`Based on ${limitingNutrientEn} (Adult reference, ICMR-NIN)`}
            textHi={`आधार: ${limitingNutrientHi} (वयस्क संदर्भ, ICMR-NIN)`}
            isEn={isEn}
          />
        </div>
      </div>
    );
  }

  // STEP 3 - ROUNDING AND FORMATTING
  let amountStrEn = "";
  let amountStrHi = "";

  if (format === 'spoonable') {
    // Snap to nearest 5g or 15g
    const dist5 = Math.abs(minTargetGrams - Math.round(minTargetGrams / 5) * 5);
    const dist15 = Math.abs(minTargetGrams - Math.round(minTargetGrams / 15) * 15);
    
    if (dist15 <= dist5) {
      const snapped = Math.max(15, Math.round(minTargetGrams / 15) * 15);
      const tbsps = snapped / 15;
      amountStrEn = `${tbsps} tablespoon${tbsps > 1 ? 's' : ''} (${snapped}g)`;
      amountStrHi = `${tbsps} बड़ा चम्मच (${snapped}g)`;
    } else {
      const snapped = Math.max(5, Math.round(minTargetGrams / 5) * 5);
      const tsps = snapped / 5;
      amountStrEn = `${tsps} teaspoon${tsps > 1 ? 's' : ''} (${snapped}g)`;
      amountStrHi = `${tsps} चम्मच (${snapped}g)`;
    }
  } else if (format === 'solid_snack' && packWeight) {
    const snapped = Math.max(10, Math.round(minTargetGrams / 10) * 10);
    const fraction = minTargetGrams / packWeight;
    
    // Check ±10% tolerance for fractions
    if (Math.abs(fraction - 0.5) <= 0.1) {
      amountStrEn = `${snapped}g (about half a pack)`;
      amountStrHi = `${snapped}g (लगभग आधा पैक)`;
    } else if (Math.abs(fraction - 0.33) <= 0.1) {
      amountStrEn = `${snapped}g (about a third of a pack)`;
      amountStrHi = `${snapped}g (लगभग पैक का एक तिहाई)`;
    } else if (Math.abs(fraction - 0.25) <= 0.1) {
      amountStrEn = `${snapped}g (about a quarter pack)`;
      amountStrHi = `${snapped}g (लगभग पैक का एक चौथाई)`;
    } else {
      amountStrEn = `${snapped}g`;
      amountStrHi = `${snapped}g`;
    }
  } else if (format === 'beverage') {
    const snapped = Math.max(25, Math.round(minTargetGrams / 25) * 25);
    const fraction = minTargetGrams / 200;
    
    if (Math.abs(fraction - 0.5) <= 0.1) {
      amountStrEn = `${snapped}ml (about half a glass)`;
      amountStrHi = `${snapped}ml (लगभग आधा गिलास)`;
    } else if (Math.abs(fraction - 0.25) <= 0.1) {
      amountStrEn = `${snapped}ml (about a quarter glass)`;
      amountStrHi = `${snapped}ml (लगभग एक चौथाई गिलास)`;
    } else {
      amountStrEn = `${snapped}ml`;
      amountStrHi = `${snapped}ml`;
    }
  } else {
    // fallback
    const snapped = Math.round(minTargetGrams);
    amountStrEn = `${snapped}g`;
    amountStrHi = `${snapped}g`;
  }

  // STEP 4 - COPY (Present tense, computed fact)
  return (
    <div style={{ backgroundColor: 'var(--color-bg)', borderRadius: '24px', padding: '2rem', marginBottom: '2rem', border: '1px solid var(--color-fail)', boxShadow: '0 8px 24px rgba(233,116,81,0.1)' }}>
      <h4 style={{ textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '0.75rem', fontWeight: 'bold', color: 'var(--color-fail)' }}>
        {isEn ? 'Suggested Portion' : 'सुझाया गया हिस्सा'}
      </h4>
      <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-text)', margin: '0 0 0.75rem 0', lineHeight: 1.3 }}>
        {isEn 
          ? `${amountStrEn} fits your daily ${limitingNutrientEn} limit.`
          : `${amountStrHi} आपकी रोज़ की ${limitingNutrientHi} सीमा में फिट बैठता है।`}
      </p>
      
      {/* DECOUPLING LINE - Mandatory */}
      <p style={{ fontSize: '0.9rem', color: 'var(--color-fail)', fontWeight: 'bold', margin: '0 0 1rem 0' }}>
        {isEn 
          ? `This product is still flagged as high in ${limitingNutrientEn}.`
          : `यह उत्पाद अब भी ${limitingNutrientHi} में अधिक के रूप में चिह्नित है।`}
      </p>
      
      <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: '0.25rem' }}>
        <Citation 
          shortLabel="ICMR-NIN"
          textEn={`Based on ${limitingNutrientEn} (Adult reference, ICMR-NIN)`}
          textHi={`आधार: ${limitingNutrientHi} (वयस्क संदर्भ, ICMR-NIN)`}
          isEn={isEn}
        />
      </div>
    </div>
  );
};
