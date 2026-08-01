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
  const servingStr = extractionResult.nutrition.serving_size;

  let refWeight = 100;
  let isPack = false;
  let isSpoon = false;

  if (format === 'solid_snack' && packWeight) {
    refWeight = packWeight;
    isPack = true;
  } else if (format === 'spoonable' || format === 'beverage') { // Added beverage based on context
    // If spoonable or beverage and no serving size, default to a sensible ref or use the extracted one
    const parsedMatch = servingStr?.match(/(\d+(?:\.\d+)?)\s*(?:g|ml)/i);
    if (parsedMatch && parsedMatch[1]) {
      refWeight = parseFloat(parsedMatch[1]);
    } else {
      refWeight = format === 'spoonable' ? 15 : 200; // default tbsp or small glass
    }
    if (format === 'spoonable') isSpoon = true;
  } else {
    // Try to parse servingStr
    const parsedMatch = servingStr?.match(/(\d+(?:\.\d+)?)\s*g/i);
    if (parsedMatch && parsedMatch[1]) {
      refWeight = parseFloat(parsedMatch[1]);
    }
  }

  let minTargetGrams = Infinity;
  let limitingNutrientEn = '';
  let limitingNutrientHi = '';
  let limitingNutrientPer100g = 0;
  let limitingDailyLimitGrams = 0;

  gFlags.forEach(f => {
    const limitInfo = getDailyLimitInfo(f, extractionResult, userGender);
    if (limitInfo && limitInfo.dailyLimitGrams > 0 && limitInfo.nutrientPer100g > 0) {
      const targetGrams = (limitInfo.dailyLimitGrams * 0.25 / limitInfo.nutrientPer100g) * 100;
      
      if (targetGrams < minTargetGrams) {
        minTargetGrams = targetGrams;
        limitingNutrientPer100g = limitInfo.nutrientPer100g;
        limitingDailyLimitGrams = limitInfo.dailyLimitGrams;
        if (f.ruleId === 'G1') { limitingNutrientEn = 'sugar'; limitingNutrientHi = 'चीनी'; }
        else if (f.ruleId === 'G2') { limitingNutrientEn = 'fat/oil'; limitingNutrientHi = 'वसा/तेल'; }
        else if (f.ruleId === 'G3') { limitingNutrientEn = 'salt'; limitingNutrientHi = 'नमक'; }
      }
    }
  });

  if (minTargetGrams === Infinity) return null;

  const roundedTarget = Math.round(minTargetGrams);
  const fraction = minTargetGrams / refWeight;
  const percentage = (refWeight / 100 * limitingNutrientPer100g / limitingDailyLimitGrams) * 100;
  const roundedPct = Math.round(percentage);

  let primaryEn = "";
  let primaryHi = "";

  const getFractionTextEn = (frac: number) => {
    if (Math.abs(frac - 0.5) <= 0.05) return "roughly half";
    if (Math.abs(frac - 0.33) <= 0.05) return "roughly a third";
    if (Math.abs(frac - 0.25) <= 0.05) return "roughly a quarter";
    if (Math.abs(frac - 0.75) <= 0.05) return "roughly three-quarters";
    return "";
  };
  const getFractionTextHi = (frac: number) => {
    if (Math.abs(frac - 0.5) <= 0.05) return "लगभग आधा";
    if (Math.abs(frac - 0.33) <= 0.05) return "लगभग एक तिहाई";
    if (Math.abs(frac - 0.25) <= 0.05) return "लगभग एक चौथाई";
    if (Math.abs(frac - 0.75) <= 0.05) return "लगभग तीन-चौथाई";
    return "";
  };

  const isSmallTaste = roundedTarget < 15 && fraction < 0.2;
  
  if (fraction >= 1) {
    if (isPack && packWeight) {
      primaryEn = `Even the full pack (${packWeight}g) stays within a quarter of your daily ${limitingNutrientEn} budget — still worth pairing with lighter choices for your daily balance.`;
      primaryHi = `यहां तक कि पूरा पैक (${packWeight}g) आपके रोज़ के ${limitingNutrientHi} बजट के एक चौथाई के भीतर रहता है — फिर भी दिन के बाकी खान-पान को थोड़ा हल्का रखना बेहतर है।`;
    } else {
      primaryEn = `Even a full serving (${refWeight}g) stays within a quarter of your daily ${limitingNutrientEn} budget — still worth pairing with lighter choices for your daily balance.`;
      primaryHi = `यहां तक कि एक पूरी सर्विंग (${refWeight}g) आपके रोज़ के ${limitingNutrientHi} बजट के एक चौथाई के भीतर रहती है — फिर भी दिन के बाकी खान-पान को थोड़ा हल्का रखना बेहतर है।`;
    }
  } else if (isSmallTaste) {
    primaryEn = `To leave room for your daily balance, keep this to just a small taste (about ${roundedTarget}g).`;
    primaryHi = `बाकी दिन के खान-पान के लिए जगह बचाने के लिए, इसे बस एक छोटे से स्वाद (लगभग ${roundedTarget}g) तक ही रखें।`;
  } else {
    const fracTextEn = getFractionTextEn(fraction);
    const fracTextHi = getFractionTextHi(fraction);
    
    let consumeVerbHi = "लें";
    if (format === 'solid_snack') consumeVerbHi = "खाएं";
    else if (format === 'beverage') consumeVerbHi = "पिएं";

    if (isPack) {
      primaryEn = `To leave room for your daily balance, keep this to about ${roundedTarget}g of the pack${fracTextEn ? ` (${fracTextEn})` : ''}.`;
      primaryHi = `बाकी दिन के खान-पान के लिए जगह बचाने के लिए, इसे इस पैक के लगभग ${roundedTarget}g${fracTextHi ? ` (${fracTextHi})` : ''} तक ही ${consumeVerbHi}।`;
    } else if (isSpoon) {
      let spoonTextEn = `${roundedTarget}g`;
      let spoonTextHi = `${roundedTarget}g`;
      if (Math.abs(roundedTarget - 5) <= 1.5) { spoonTextEn = `1 teaspoon (${roundedTarget}g)`; spoonTextHi = `1 चम्मच (${roundedTarget}g)`; }
      else if (Math.abs(roundedTarget - 10) <= 2) { spoonTextEn = `2 teaspoons (${roundedTarget}g)`; spoonTextHi = `2 चम्मच (${roundedTarget}g)`; }
      else if (Math.abs(roundedTarget - 15) <= 2) { spoonTextEn = `1 tablespoon (${roundedTarget}g)`; spoonTextHi = `1 बड़ा चम्मच (${roundedTarget}g)`; }
      
      primaryEn = `To leave room for your daily balance, keep this to about ${spoonTextEn}.`;
      primaryHi = `बाकी दिन के खान-पान के लिए जगह बचाने के लिए, इसे लगभग ${spoonTextHi} तक ही ${consumeVerbHi}।`;
    } else {
      primaryEn = `To leave room for your daily balance, keep this to about ${roundedTarget}g of this product.`;
      primaryHi = `बाकी दिन के खान-पान के लिए जगह बचाने के लिए, इसे इस उत्पाद के लगभग ${roundedTarget}g तक ही ${consumeVerbHi}।`;
    }
  }

  let secondaryEn = "";
  let secondaryHi = "";
  if (isPack) {
    secondaryEn = `The full pack alone would use ${roundedPct}% of your daily ${limitingNutrientEn} limit.`;
    secondaryHi = `अकेले पूरा पैक आपकी हर दिन की ${limitingNutrientHi} सीमा का ${roundedPct}% ले लेगा।`;
  } else {
    secondaryEn = `A full serving alone would use ${roundedPct}% of your daily ${limitingNutrientEn} limit.`;
    secondaryHi = `अकेले एक पूरी सर्विंग आपकी हर दिन की ${limitingNutrientHi} सीमा का ${roundedPct}% ले लेगी।`;
  }

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
          textEn={`Daily limit: ICMR-NIN. Portion guidance: capped conservatively to leave room for other meals.`}
          textHi={`हर दिन की सीमा: ICMR-NIN। मात्रा की सलाह: बाकी खान-पान के लिए जगह बचाने के लिए इसे 25% पर रखा गया है।`}
          isEn={isEn}
        />
      </div>
    </div>
  );
};
