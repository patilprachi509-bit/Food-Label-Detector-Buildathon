import React from 'react';
import type { ExtractionResult } from '../context/AppContext';
import type { Flag } from '../utils/ruleEngine';
import { getDailyLimitInfo } from '../utils/dailyLimits';

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
  let refLabelEn = "100g serving";
  let refLabelHi = "100g सर्विंग";

  if (format === 'solid_snack' && packWeight) {
    refWeight = packWeight;
    refLabelEn = "pack";
    refLabelHi = "पैक";
  } else if (format === 'spoonable') {
    refWeight = 15;
    refLabelEn = "serving (1 tbsp)";
    refLabelHi = "सर्विंग (1 बड़ा चम्मच)";
  } else {
    // Try to parse servingStr
    const parsedMatch = servingStr?.match(/(\d+(?:\.\d+)?)\s*g/i);
    if (parsedMatch && parsedMatch[1]) {
      refWeight = parseFloat(parsedMatch[1]);
      refLabelEn = "serving";
      refLabelHi = "सर्विंग";
    }
  }

  let maxPercentage = -1;
  let limitingNutrientEn = '';
  let limitingNutrientHi = '';

  gFlags.forEach(f => {
    const limitInfo = getDailyLimitInfo(f, extractionResult, userGender);
    if (limitInfo && limitInfo.dailyLimitGrams > 0 && limitInfo.nutrientPer100g > 0) {
      const nutrientInRef = (limitInfo.nutrientPer100g / 100) * refWeight;
      const percentage = (nutrientInRef / limitInfo.dailyLimitGrams) * 100;
      
      if (percentage > maxPercentage) {
        maxPercentage = percentage;
        if (f.ruleId === 'G1') { limitingNutrientEn = 'sugar'; limitingNutrientHi = 'चीनी'; }
        else if (f.ruleId === 'G2') { limitingNutrientEn = 'fat/oil'; limitingNutrientHi = 'वसा/तेल'; }
        else if (f.ruleId === 'G3') { limitingNutrientEn = 'salt'; limitingNutrientHi = 'नमक'; }
      }
    }
  });

  if (maxPercentage <= 0) return null;

  const roundedPct = Math.round(maxPercentage);
  
  let primaryOutputEn = "";
  let primaryOutputHi = "";
  
  if (roundedPct > 100) {
    primaryOutputEn = `This ${refLabelEn} alone uses more than your entire daily ${limitingNutrientEn} limit.`;
    primaryOutputHi = `यह ${refLabelHi} अकेले आपके पूरे दैनिक ${limitingNutrientHi} सीमा से अधिक का उपयोग करता है।`;
  } else {
    primaryOutputEn = `This ${refLabelEn} already uses up ${roundedPct}% of your daily ${limitingNutrientEn} limit.`;
    primaryOutputHi = `यह ${refLabelHi} पहले से ही आपके दैनिक ${limitingNutrientHi} सीमा का ${roundedPct}% उपयोग करता है।`;
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', borderRadius: '24px', padding: '2rem', marginBottom: '2rem', border: '1px solid var(--color-fail)', boxShadow: '0 8px 24px rgba(233,116,81,0.1)' }}>
      <h4 style={{ textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '0.75rem', fontWeight: 'bold', color: 'var(--color-fail)' }}>
        {isEn ? 'Consumption Impact' : 'खपत प्रभाव'}
      </h4>
      <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-text)', margin: '0 0 1rem 0', lineHeight: 1.3 }}>
        {isEn ? primaryOutputEn : primaryOutputHi}
      </p>
      <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: 0, fontStyle: 'italic', borderTop: '1px solid var(--color-divider)', paddingTop: '1rem' }}>
        {isEn 
          ? `Based on ${limitingNutrientEn}, the most limiting nutrient in this product (ICMR-NIN adult reference).` 
          : `${limitingNutrientHi} के आधार पर, इस उत्पाद में सबसे सीमित पोषक तत्व (ICMR-NIN वयस्क संदर्भ)।`
        }
      </p>
    </div>
  );
};
