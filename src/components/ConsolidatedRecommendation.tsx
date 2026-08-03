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
  const gFlags = flags.filter(f => f.type === 'general_health' && f.ruleId !== 'G4');
  if (gFlags.length === 0) return null;

  const packWeight = extractionResult.front_of_pack?.net_weight_g;
  const format = extractionResult.front_of_pack?.consumption_format || 'other';
  const extractedServingStr = extractionResult.nutrition.serving_size;

  let refWeight = 100;
  let isPack = false;
  let containerEn = 'serving';
  let containerHi = 'सर्विंग';
  let verbEn = 'eat';
  let verbHi = 'खाएं';
  let weightUnit = 'g';

  if (format === 'solid_snack' && packWeight) {
    refWeight = packWeight;
    isPack = true;
    containerEn = 'pack';
    containerHi = 'पैक';
  } else if (format === 'beverage') {
    refWeight = 200;
    containerEn = 'glass';
    containerHi = 'गिलास';
    verbEn = 'drink';
    verbHi = 'पिएं';
    weightUnit = 'ml';
  } else if (format === 'spoonable') {
    refWeight = 15;
    containerEn = 'tablespoon';
    containerHi = 'बड़ा चम्मच';
  } else if (extractedServingStr) {
    const match = extractedServingStr.match(/(\d+(?:\.\d+)?)\s*(g|ml)/i);
    if (match && match[1]) {
      refWeight = parseFloat(match[1]);
      if (match[2].toLowerCase() === 'ml') weightUnit = 'ml';
    }
  }

  const containerWithWeightEn = `${containerEn} (${refWeight}${weightUnit})`;
  const containerWithWeightHi = `${containerHi} (${refWeight}${weightUnit})`;

  let minTargetGrams = Infinity;
  let limitingNutrientEn = '';
  let limitingNutrientHi = '';
  let limitingDailyLimitGrams = 0;
  let limitingNutrientPer100g = 0;

  gFlags.forEach(f => {
    const limitInfo = getDailyLimitInfo(f, extractionResult, userGender);
    if (limitInfo && limitInfo.dailyLimitGrams > 0 && limitInfo.nutrientPer100g > 0) {
      const targetGrams = (limitInfo.dailyLimitGrams * 0.25 / limitInfo.nutrientPer100g) * 100;
      if (targetGrams < minTargetGrams) {
        minTargetGrams = targetGrams;
        limitingDailyLimitGrams = limitInfo.dailyLimitGrams;
        limitingNutrientPer100g = limitInfo.nutrientPer100g;
        if (f.ruleId === 'G1') { limitingNutrientEn = 'sugar'; limitingNutrientHi = 'चीनी'; }
        else if (f.ruleId === 'G2') { limitingNutrientEn = 'fat/oil'; limitingNutrientHi = 'फैट/तेल'; }
        else if (f.ruleId === 'G3') { limitingNutrientEn = 'salt'; limitingNutrientHi = 'नमक'; }
      }
    }
  });

  if (minTargetGrams === Infinity) return null;

  const fraction = minTargetGrams / refWeight;
  const targetRounded = Math.round(minTargetGrams);
  const truePercentage = Math.round(((limitingNutrientPer100g / 100 * refWeight) / limitingDailyLimitGrams) * 100);

  let primaryEn = "";
  let primaryHi = "";

  if (fraction < 1) {
    const isNaturalFraction = Math.abs(fraction - 0.5) <= 0.05 || Math.abs(fraction - 0.33) <= 0.05 || Math.abs(fraction - 0.25) <= 0.05;
    let fractionStrEn = "";
    let fractionStrHi = "";
    
    if (isNaturalFraction) {
      if (Math.abs(fraction - 0.5) <= 0.05) { fractionStrEn = "roughly half"; fractionStrHi = "लगभग आधा"; }
      else if (Math.abs(fraction - 0.33) <= 0.05) { fractionStrEn = "roughly a third"; fractionStrHi = "लगभग एक तिहाई"; }
      else if (Math.abs(fraction - 0.25) <= 0.05) { fractionStrEn = "roughly a quarter"; fractionStrHi = "लगभग एक चौथाई"; }
    }
    
    if (fraction <= 0.1) {
      const daysWorth = (truePercentage / 100).toFixed(1);
      primaryEn = `A full ${containerWithWeightEn} contains about ${daysWorth} days' worth of your daily ${limitingNutrientEn} limit, all in one sitting!`;
      primaryHi = `सिर्फ एक पूरे ${containerWithWeightHi} में आपके ${daysWorth} दिनों के बराबर ${limitingNutrientHi} है, वह भी एक ही बार में!`;
    } else {
      const containerWordEn = isPack ? 'pack' : 'product';
      const containerWordHi = isPack ? 'पैक' : 'उत्पाद';
      
      let enText = `To stay balanced, ${verbEn} only about ${targetRounded}${weightUnit} of this ${containerWordEn}`;
      if (fractionStrEn) enText += ` (${fractionStrEn})`;
      enText += ".";
      
      let hiText = `संतुलन बनाए रखने के लिए, इस ${containerWordHi} का सिर्फ ${targetRounded}${weightUnit}`;
      if (fractionStrHi) hiText += ` (${fractionStrHi})`;
      hiText += ` ही ${verbHi}।`;
      
      primaryEn = enText;
      primaryHi = hiText;
    }
  } else {
    primaryEn = `Even a full ${containerWithWeightEn} stays safely under a quarter (25%) of your daily ${limitingNutrientEn} limit.`;
    primaryHi = `एक पूरा ${containerWithWeightHi} आपकी हर दिन की ${limitingNutrientHi} सीमा के एक चौथाई के भीतर रहता है।`;
  }

  const secondaryEn = `A full ${containerWithWeightEn} alone takes up ${truePercentage}% of your daily ${limitingNutrientEn} limit.`;
  const secondaryHi = `अकेले एक पूरा ${containerWithWeightHi} आपकी दिन भर की ${limitingNutrientHi} लिमिट का ${truePercentage}% हिस्सा ले लेगा।`;

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', borderRadius: '24px', padding: '2rem', marginBottom: '2rem', border: '1px solid var(--color-fail)', boxShadow: '0 8px 24px rgba(233,116,81,0.1)' }}>
      <h4 style={{ textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '0.75rem', fontWeight: 'bold', color: 'var(--color-fail)' }}>
        {isEn ? 'Suggested Portion' : 'सुझाया गया हिस्सा'}
      </h4>
      <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-text)', margin: '0 0 0.75rem 0', lineHeight: 1.3 }}>
        {isEn ? primaryEn : primaryHi}
      </p>
      <p style={{ fontSize: '0.9rem', color: 'var(--color-fail)', fontWeight: 'bold', margin: '0 0 1rem 0' }}>
        {isEn ? secondaryEn : secondaryHi}
      </p>
      <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: '0.25rem' }}>
        <Citation 
          shortLabel="ICMR-NIN"
          textEn="Adult reference, ICMR-NIN"
          textHi="वयस्क संदर्भ, ICMR-NIN"
          isEn={isEn}
        />
      </div>
    </div>
  );
};
