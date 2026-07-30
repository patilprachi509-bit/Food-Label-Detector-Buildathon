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
  const gFlags = flags.filter(f => f.type === 'general_health');
  if (gFlags.length === 0) return null;

  let minGrams = Infinity;
  let limitingNutrientEn = '';
  let limitingNutrientHi = '';

  gFlags.forEach(f => {
    const limitInfo = getDailyLimitInfo(f, extractionResult, userGender);
    if (limitInfo && limitInfo.dailyLimitGrams > 0 && limitInfo.nutrientPer100g > 0) {
      const gramsToReach = (limitInfo.dailyLimitGrams / limitInfo.nutrientPer100g) * 100;
      if (gramsToReach < minGrams) {
        minGrams = gramsToReach;
        if (f.ruleId === 'G1') { limitingNutrientEn = 'Sugar'; limitingNutrientHi = 'चीनी'; }
        else if (f.ruleId === 'G2') { limitingNutrientEn = 'Fat'; limitingNutrientHi = 'वसा'; }
        else if (f.ruleId === 'G3') { limitingNutrientEn = 'Salt'; limitingNutrientHi = 'नमक'; }
        else if (f.ruleId === 'G4') { limitingNutrientEn = 'Trans Fat'; limitingNutrientHi = 'ट्रांस फैट'; }
      }
    }
  });

  if (minGrams === Infinity) return null;

  const packWeight = extractionResult.front_of_pack?.net_weight_g;
  const format = extractionResult.front_of_pack?.consumption_format || 'other';

  let primaryOutputEn = "";
  let primaryOutputHi = "";
  const displayGrams = Math.round(minGrams);
  const smallCutoff = 15;

  if (displayGrams <= smallCutoff && packWeight && packWeight > smallCutoff) {
     const daysWorth = Math.round((packWeight / displayGrams) * 10) / 10;
     primaryOutputEn = `This pack uses about ${daysWorth >= 1 ? Math.round(daysWorth) : daysWorth} days' worth of your daily ${limitingNutrientEn.toLowerCase()} budget, in one sitting.`;
     primaryOutputHi = `यह पैक एक ही बार में आपके दैनिक ${limitingNutrientHi.toLowerCase()} बजट का लगभग ${daysWorth >= 1 ? Math.round(daysWorth) : daysWorth} दिन का हिस्सा उपयोग कर लेता है।`;
  } else if (displayGrams <= smallCutoff && format === 'spoonable') {
     const daysWorthSpoon = Math.round((15 / displayGrams) * 10) / 10;
     primaryOutputEn = `A typical serving (1 tbsp) uses about ${daysWorthSpoon >= 1 ? Math.round(daysWorthSpoon) : daysWorthSpoon} days' worth of your daily ${limitingNutrientEn.toLowerCase()} budget.`;
     primaryOutputHi = `एक सामान्य सर्विंग (1 बड़ा चम्मच) आपके दैनिक ${limitingNutrientHi.toLowerCase()} बजट का लगभग ${daysWorthSpoon >= 1 ? Math.round(daysWorthSpoon) : daysWorthSpoon} दिन का हिस्सा उपयोग कर लेती है।`;
  } else {
    if (format === 'spoonable') {
      const tbsp = Math.round(displayGrams / 15);
      primaryOutputEn = `About ${tbsp > 0 ? tbsp : 1} tablespoon${tbsp !== 1 ? 's' : ''} (${displayGrams}g) of this product hits your entire daily limit.`;
      primaryOutputHi = `इस उत्पाद का लगभग ${tbsp > 0 ? tbsp : 1} बड़ा चम्मच (${displayGrams}g) आपकी संपूर्ण दैनिक सीमा तक पहुँच जाता है।`;
    } else if (format === 'solid_snack' && packWeight) {
      const proportion = displayGrams / packWeight;
      let propTextEn = "";
      let propTextHi = "";
      if (proportion > 0.8 && proportion < 1.2) { propTextEn = "roughly the whole pack"; propTextHi = "लगभग पूरा पैक"; }
      else if (proportion > 0.4 && proportion < 0.6) { propTextEn = "roughly half the pack"; propTextHi = "लगभग आधा पैक"; }
      else if (proportion > 0.2 && proportion < 0.35) { propTextEn = "roughly a quarter of the pack"; propTextHi = "लगभग एक चौथाई पैक"; }
      else if (proportion >= 1.2 && proportion < 2.5) { propTextEn = "roughly two packs"; propTextHi = "लगभग दो पैक"; }
      else { propTextEn = `roughly ${(proportion * 100).toFixed(0)}% of the pack`; propTextHi = `पैक का लगभग ${(proportion * 100).toFixed(0)}%`; }
      
      primaryOutputEn = `About ${displayGrams}g — ${propTextEn} — hits your entire daily limit.`;
      primaryOutputHi = `लगभग ${displayGrams}g — ${propTextHi} — आपकी संपूर्ण दैनिक सीमा तक पहुँच जाता है।`;
    } else {
      primaryOutputEn = `About ${displayGrams}g of this product hits your entire daily limit.`;
      primaryOutputHi = `इस उत्पाद का लगभग ${displayGrams}g आपकी संपूर्ण दैनिक सीमा तक पहुँच जाता है।`;
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', borderRadius: '24px', padding: '2rem', marginBottom: '2rem', border: '1px solid var(--color-fail)', boxShadow: '0 8px 24px rgba(233,116,81,0.1)' }}>
      <h4 style={{ textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '0.75rem', fontWeight: 'bold', color: 'var(--color-fail)' }}>
        {isEn ? 'True Consumption Limit' : 'सही खपत सीमा'}
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
