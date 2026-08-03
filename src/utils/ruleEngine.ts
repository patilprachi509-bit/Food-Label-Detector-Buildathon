import type { ExtractionResult, TranslatableString } from '../context/AppContext';

export type FlagType = 'claim_contradiction' | 'general_health' | 'needs_verification' | 'informational';

export interface Flag {
  type: FlagType;
  ruleId: string;
  claim?: TranslatableString;
  message_en: string;
  message_hi: string;
  source: string;
  nutrientFocus?: 'sugar' | 'fat' | 'salt' | 'protein';
  relevantIngredients: TranslatableString[];
  headline_en?: string;
  headline_hi?: string;
  actualValue?: number;
  thresholdValue?: number;
  unit?: string;
  isMax?: boolean;
  evalDirection?: 'above' | 'below';
  actualGrams?: number;
  thresholdGrams?: number;
}

// Fuzzy match for ingredients
const checkSynonyms = (ingredients: TranslatableString[], synonyms: string[]): TranslatableString[] => {
  return ingredients.filter(ing => {
    const norm = ing.normalized_english.toLowerCase().replace(/[^a-z0-9]/g, '');
    return synonyms.some(syn => {
      const synNorm = syn.toLowerCase().replace(/[^a-z0-9]/g, '');
      return norm.includes(synNorm);
    });
  });
};

const SUGAR_SYNONYMS = ["sugar", "dextrose", "fructose", "glucose", "raw cane sugar", "brown sugar", "lactose", "jaggery", "gur", "honey", "molasses", "treacle", "sweetener"];
const FAT_SYNONYMS = ["palm oil", "palmolein", "vanaspati", "vegetable oil", "hydrogenated oil", "margarine", "shortening", "interesterified fat", "fat", "oil", "butter", "ghee", "sunflower oil"];
const SALT_SYNONYMS = ["salt", "sodium", "msg", "monosodium glutamate"];

export const evaluateRules = (result: ExtractionResult, userFocus: string | null): Flag[] => {
  const flags: Flag[] = [];
  const { nutrition, front_of_pack, ingredients } = result;

  // Helpers
  const claimMatches = (claimStr: string, patterns: string[]) => patterns.some(p => claimStr.toLowerCase().includes(p));

  // R1 - R6, R10, R11
  if (front_of_pack.claims && front_of_pack.claims.length > 0) {
    front_of_pack.claims.forEach(claimObj => {
      const c = claimObj.normalized_english;

      if (claimMatches(c, ['low fat']) && nutrition.total_fat_g > 3) {
        flags.push({ type: 'claim_contradiction', ruleId: 'R1', claim: claimObj, message_en: 'Fails low-fat threshold', message_hi: 'लो-फैट सीमा में विफल', source: 'FSSAI Schedule I', nutrientFocus: 'fat', relevantIngredients: checkSynonyms(ingredients.raw_list, FAT_SYNONYMS), headline_en: `${nutrition.total_fat_g}g fat per 100g`, headline_hi: `${nutrition.total_fat_g}g फैट प्रति 100g`, actualValue: nutrition.total_fat_g, thresholdValue: 3, unit: 'g', isMax: true, evalDirection: 'above' });
      }
      if (claimMatches(c, ['fat free', 'zero fat']) && nutrition.total_fat_g > 0.5) {
        flags.push({ type: 'claim_contradiction', ruleId: 'R2', claim: claimObj, message_en: 'Fails fat-free threshold', message_hi: 'फैट-फ्री सीमा में विफल', source: 'FSSAI Schedule I', nutrientFocus: 'fat', relevantIngredients: checkSynonyms(ingredients.raw_list, FAT_SYNONYMS), headline_en: `${nutrition.total_fat_g}g fat per 100g`, headline_hi: `${nutrition.total_fat_g}g फैट प्रति 100g`, actualValue: nutrition.total_fat_g, thresholdValue: 0.5, unit: 'g', isMax: true, evalDirection: 'above' });
      }
      if (claimMatches(c, ['low sugar']) && nutrition.total_sugar_g > 6) {
        flags.push({ type: 'claim_contradiction', ruleId: 'R3', claim: claimObj, message_en: 'Fails low-sugar threshold', message_hi: 'लो-शुगर सीमा में विफल', source: 'FSSAI Schedule I', nutrientFocus: 'sugar', relevantIngredients: checkSynonyms(ingredients.raw_list, SUGAR_SYNONYMS), headline_en: `${nutrition.total_sugar_g}g sugar per 100g`, headline_hi: `${nutrition.total_sugar_g}g चीनी प्रति 100g`, actualValue: nutrition.total_sugar_g, thresholdValue: 6, unit: 'g', isMax: true, evalDirection: 'above' });
      }
      if (claimMatches(c, ['sugar free', 'zero sugar', 'no added sugar']) && nutrition.total_sugar_g > 0.5) {
        flags.push({ type: 'claim_contradiction', ruleId: 'R4', claim: claimObj, message_en: 'Fails sugar-free threshold', message_hi: 'शुगर-फ्री सीमा में विफल', source: 'FSSAI Schedule I', nutrientFocus: 'sugar', relevantIngredients: checkSynonyms(ingredients.raw_list, SUGAR_SYNONYMS), headline_en: `${nutrition.total_sugar_g}g sugar per 100g`, headline_hi: `${nutrition.total_sugar_g}g चीनी प्रति 100g`, actualValue: nutrition.total_sugar_g, thresholdValue: 0.5, unit: 'g', isMax: true, evalDirection: 'above' });
      }
      if (claimMatches(c, ['source of protein']) && nutrition.protein_g < 5) {
        flags.push({ type: 'claim_contradiction', ruleId: 'R5', claim: claimObj, message_en: 'Fails protein-source threshold', message_hi: 'प्रोटीन-स्रोत सीमा में विफल', source: 'FSSAI Schedule I', nutrientFocus: 'protein', relevantIngredients: [], headline_en: `${nutrition.protein_g}g protein per 100g`, headline_hi: `${nutrition.protein_g}g प्रोटीन प्रति 100g`, actualValue: nutrition.protein_g, thresholdValue: 5, unit: 'g', isMax: false, evalDirection: 'below' });
      }
      if (claimMatches(c, ['high protein', 'rich in protein']) && nutrition.protein_g < 10) {
        flags.push({ type: 'claim_contradiction', ruleId: 'R6', claim: claimObj, message_en: 'Fails high-protein threshold', message_hi: 'हाई-प्रोटीन सीमा में विफल', source: 'FSSAI Schedule I', nutrientFocus: 'protein', relevantIngredients: [], headline_en: `${nutrition.protein_g}g protein per 100g`, headline_hi: `${nutrition.protein_g}g प्रोटीन प्रति 100g`, actualValue: nutrition.protein_g, thresholdValue: 10, unit: 'g', isMax: false, evalDirection: 'below' });
      }
      if (claimMatches(c, ['immunity', 'health', 'boosts', 'defends', 'protects'])) {
        flags.push({ type: 'needs_verification', ruleId: 'R10', claim: claimObj, message_en: 'Needs Verification', message_hi: 'सत्यापन की आवश्यकता है', source: 'FSSAI Regulation 7', relevantIngredients: [] });
      }
      if (claimMatches(c, ['100% whole wheat', '100% atta'])) {
        const hasMaida = ingredients.raw_list.some(ing => ing.normalized_english.toLowerCase().includes('maida') || ing.normalized_english.toLowerCase().includes('refined wheat flour'));
        if (hasMaida) {
          flags.push({ type: 'claim_contradiction', ruleId: 'R11', claim: claimObj, message_en: 'Contains refined flour despite 100% whole wheat claim', message_hi: '100% साबुत गेहूं के दावे के बावजूद रिफाइंड आटा है', source: 'FSSAI May 2025 advisory', relevantIngredients: checkSynonyms(ingredients.raw_list, ['maida', 'refined wheat flour']) });
        }
      }

      // R12 - No [Ingredient] Claims
      let forbiddenIngredient = "";
      const lowerC = c.toLowerCase();
      if (lowerC.startsWith('no ')) forbiddenIngredient = lowerC.replace('no ', '').trim();
      else if (lowerC.includes('contains no ')) forbiddenIngredient = lowerC.split('contains no ')[1].trim();
      
      if (forbiddenIngredient) {
        let searchTerms = [forbiddenIngredient];
        if (forbiddenIngredient === 'maida') searchTerms.push('refined wheat flour');
        if (forbiddenIngredient === 'palm oil') searchTerms.push('palmolein');

        const found = checkSynonyms(ingredients.raw_list, searchTerms);
        if (found.length > 0) {
          flags.push({
            type: 'claim_contradiction',
            ruleId: 'R12',
            claim: claimObj,
            message_en: `Contains ${forbiddenIngredient} despite claim`,
            message_hi: `दावे के बावजूद ${forbiddenIngredient} है`,
            source: 'Deterministic Verification',
            relevantIngredients: found
          });
        }
      }
    });
  }

  // G1 - G4
  if (nutrition.energy_kcal > 0) {
    if (nutrition.added_sugar_g !== null) {
      const addedSugarPct = Math.round(((nutrition.added_sugar_g * 4) / nutrition.energy_kcal) * 100);
      if (addedSugarPct > 10) {
        const addedSugarThresholdGrams = Number(((0.10 * nutrition.energy_kcal) / 4).toFixed(1));
        flags.push({ type: 'general_health', ruleId: 'G1', message_en: 'High in added sugar', message_hi: 'अतिरिक्त चीनी में उच्च', source: 'Adult reference, ICMR-NIN Dietary Guidelines 2024', nutrientFocus: 'sugar', relevantIngredients: checkSynonyms(ingredients.raw_list, SUGAR_SYNONYMS), headline_en: `${addedSugarPct}% CALORIES FROM ADDED SUGAR (${nutrition.added_sugar_g}g per 100g)`, headline_hi: `${addedSugarPct}% कैलोरी अतिरिक्त चीनी से (${nutrition.added_sugar_g}g प्रति 100g)`, actualValue: addedSugarPct, thresholdValue: 10, unit: '%', isMax: true, evalDirection: 'above', actualGrams: nutrition.added_sugar_g, thresholdGrams: addedSugarThresholdGrams });
      }
    } else {
      const totalSugarPct = Math.round(((nutrition.total_sugar_g * 4) / nutrition.energy_kcal) * 100);
      if (totalSugarPct > 10) {
        const totalSugarThresholdGrams = Number(((0.10 * nutrition.energy_kcal) / 4).toFixed(1));
        flags.push({ type: 'needs_verification', ruleId: 'G1', message_en: "Total sugar is high, but this panel doesn't separately declare added sugar — the ICMR-NIN threshold applies specifically to added sugar, so this can't be confirmed.", message_hi: 'कुल चीनी अधिक है, लेकिन यह पैनल अतिरिक्त चीनी की अलग से घोषणा नहीं करता है — ICMR-NIN सीमा विशेष रूप से अतिरिक्त चीनी पर लागू होती है, इसलिए इसकी पुष्टि नहीं की जा सकती है।', source: 'Adult reference, ICMR-NIN Dietary Guidelines 2024', nutrientFocus: 'sugar', relevantIngredients: checkSynonyms(ingredients.raw_list, SUGAR_SYNONYMS), headline_en: `${totalSugarPct}% CALORIES FROM TOTAL SUGAR (${nutrition.total_sugar_g}g per 100g)`, headline_hi: `${totalSugarPct}% कैलोरी कुल चीनी से (${nutrition.total_sugar_g}g प्रति 100g)`, actualValue: totalSugarPct, thresholdValue: 10, unit: '%', isMax: true, evalDirection: 'above', actualGrams: nutrition.total_sugar_g, thresholdGrams: totalSugarThresholdGrams });
      }
    }

    const fatPct = Math.round(((nutrition.total_fat_g * 9) / nutrition.energy_kcal) * 100);
    if (fatPct > 15) {
      const fatThresholdGrams = Number(((0.15 * nutrition.energy_kcal) / 9).toFixed(1));
      flags.push({ type: 'general_health', ruleId: 'G2', message_en: 'High in fat', message_hi: 'वसा में उच्च', source: 'Adult reference, ICMR-NIN Dietary Guidelines 2024', nutrientFocus: 'fat', relevantIngredients: checkSynonyms(ingredients.raw_list, FAT_SYNONYMS), headline_en: `${fatPct}% CALORIES FROM TOTAL FAT (${nutrition.total_fat_g}g per 100g)`, headline_hi: `${fatPct}% कैलोरी कुल फैट से (${nutrition.total_fat_g}g प्रति 100g)`, actualValue: fatPct, thresholdValue: 15, unit: '%', isMax: true, evalDirection: 'above', actualGrams: nutrition.total_fat_g, thresholdGrams: fatThresholdGrams });
    }
  }
  
  if (nutrition.sodium_mg > 250) {
    // Convert to Salt in grams for UI
    const saltGrams = Number(((nutrition.sodium_mg * 2.5) / 1000).toFixed(2));
    const thresholdSaltGrams = 0.625;
    flags.push({ type: 'general_health', ruleId: 'G3', message_en: 'High in salt', message_hi: 'नमक में उच्च', source: 'Adult reference, ICMR-NIN Dietary Guidelines 2024', nutrientFocus: 'salt', relevantIngredients: checkSynonyms(ingredients.raw_list, SALT_SYNONYMS), headline_en: `HIGH IN SALT (${saltGrams}g salt per 100g, converted from ${nutrition.sodium_mg}mg sodium)`, headline_hi: `नमक में उच्च (${saltGrams}g नमक प्रति 100g, ${nutrition.sodium_mg}mg सोडियम से परिवर्तित)`, actualValue: saltGrams, thresholdValue: thresholdSaltGrams, unit: 'g', isMax: true, evalDirection: 'above' });
  }

  if (nutrition.trans_fat_g !== null && nutrition.total_fat_g > 0) {
    const transPct = Math.round((nutrition.trans_fat_g / nutrition.total_fat_g) * 100);
    if (transPct > 2) {
      const transThresholdGrams = Number((0.02 * nutrition.total_fat_g).toFixed(2));
      flags.push({ type: 'general_health', ruleId: 'G4', message_en: 'Exceeds trans fat limit', message_hi: 'ट्रांस फैट सीमा से अधिक', source: 'FSSAI Prohibition and Restriction on Sales, 2nd Amendment Regs, 2021', nutrientFocus: 'fat', relevantIngredients: checkSynonyms(ingredients.raw_list, FAT_SYNONYMS), headline_en: `${transPct}% OF FAT IS TRANS FAT`, headline_hi: `कुल फैट का ${transPct}% ट्रांस फैट है`, actualValue: transPct, thresholdValue: 2, unit: '%', isMax: true, evalDirection: 'above', actualGrams: nutrition.trans_fat_g, thresholdGrams: transThresholdGrams });
    }
  }

  // Informational (Maida)
  if (ingredients.raw_list.some(ing => ing.normalized_english.toLowerCase().includes('maida') || ing.normalized_english.toLowerCase().includes('refined wheat flour'))) {
    flags.push({ type: 'informational', ruleId: 'INFO1', message_en: 'Contains Refined Wheat Flour (Maida). Low in fiber and high GI.', message_hi: 'मैदा शामिल है। फाइबर कम और GI उच्च।', source: 'General Nutrition Context', relevantIngredients: checkSynonyms(ingredients.raw_list, ['maida', 'refined wheat flour']) });
  }

  // Provisional Guardrails
  const foundOils = checkSynonyms(ingredients.raw_list, FAT_SYNONYMS.filter(s => s.includes('oil') || s.includes('fat') || s === 'vanaspati' || s === 'palmolein' || s === 'margarine' || s === 'shortening' || s === 'butter' || s === 'ghee'));
  if (foundOils.length > 0) {
    flags.push({ 
      type: 'needs_verification', 
      ruleId: 'PROV_OIL', 
      message_en: 'Cooking oil type needs manual verification (frequently hallucinated by AI)', 
      message_hi: 'खाना पकाने के तेल के प्रकार को मैन्युअल सत्यापन की आवश्यकता है (AI द्वारा अक्सर गलत समझा जाता है)', 
      source: 'AI Confidence Guardrail', 
      relevantIngredients: foundOils,
      headline_en: 'VERIFY OIL INGREDIENT',
      headline_hi: 'तेल सामग्री की पुष्टि करें'
    });
  }

  const has150 = ingredients.raw_list.some(ing => {
    const raw = ing.normalized_english;
    const plain = ing.plain_name || '';
    return /(?:ins|e)\s*150/i.test(raw) || /(?:ins|e)\s*150/i.test(plain) || /\(150\)/.test(raw) || /\(150\)/.test(plain);
  });
  if (has150 || /(?:ins|e)\s*150/i.test(result.raw_transcription || '') || /\(150\)/.test(result.raw_transcription || '')) {
    flags.push({ 
      type: 'needs_verification', 
      ruleId: 'PROV_150', 
      message_en: 'Double check INS 150 (Often a misread of INS 510 Flour Treatment Agent)', 
      message_hi: 'INS 150 की दोबारा जांच करें (अक्सर INS 510 को गलत पढ़ा जाता है)', 
      source: 'AI Confidence Guardrail', 
      relevantIngredients: [],
      headline_en: 'VERIFY INS 150 / 510',
      headline_hi: 'INS 150 / 510 की पुष्टि करें'
    });
  }

  // PROV_NUMBERS: Anti-hallucination backstop
  if (result.raw_transcription) {
    const rawNumbers = (result.raw_transcription.match(/\d+(?:\.\d+)?/g) || []).map(Number);
    const checkVals = [
      { name: 'Energy', val: nutrition.energy_kcal },
      { name: 'Total Sugar', val: nutrition.total_sugar_g },
      { name: 'Added Sugar', val: nutrition.added_sugar_g },
      { name: 'Total Fat', val: nutrition.total_fat_g },
      { name: 'Saturated Fat', val: nutrition.saturated_fat_g },
      { name: 'Sodium', val: nutrition.sodium_mg },
      { name: 'Protein', val: nutrition.protein_g }
    ];

    const hallucinated: string[] = [];
    checkVals.forEach(c => {
      const val = c.val;
      if (val !== null && val > 0) {
        // Find if any number in the raw OCR is within a tolerance of 2.0 (to account for minor rounding)
        // e.g. OCR has 442.3, AI outputs 442 -> diff is 0.3 < 2.0 (Pass)
        // AI outputs 1103 -> diff is 660.7 > 2.0 (Fail)
        const isFound = rawNumbers.some(n => Math.abs(n - val) < 2.0);
        if (!isFound) {
          hallucinated.push(c.name);
        }
      }
    });

    if (hallucinated.length > 0) {
      flags.push({
        type: 'needs_verification',
        ruleId: 'PROV_NUMBERS',
        message_en: `AI Confidence Guardrail: Extracted numbers for ${hallucinated.join(', ')} do not perfectly match the scanned text. The AI may have substituted generic product data instead of reading the label. Please manually verify the nutrition panel.`,
        message_hi: `AI सुरक्षा सीमा: ${hallucinated.join(', ')} के लिए निकाले गए नंबर स्कैन किए गए टेक्स्ट से पूरी तरह मेल नहीं खाते हैं। कृपया पोषण पैनल को मैन्युअल रूप से सत्यापित करें।`,
        source: 'Anti-Hallucination Guardrail',
        relevantIngredients: [],
        headline_en: 'VERIFY NUTRITION NUMBERS',
        headline_hi: 'पोषण नंबरों की पुष्टि करें'
      });
    }
  }

  // Sort: Personalization > Claim Contradiction > General Health > Needs Verification > Informational
  flags.sort((a, b) => {
    // 1. Personalization check
    if (userFocus && a.nutrientFocus === userFocus && b.nutrientFocus !== userFocus && a.type === 'general_health') return -1;
    if (userFocus && b.nutrientFocus === userFocus && a.nutrientFocus !== userFocus && b.type === 'general_health') return 1;

    // 2. Type ordering
    const order = { 'claim_contradiction': 1, 'general_health': 2, 'needs_verification': 3, 'informational': 4 };
    return order[a.type] - order[b.type];
  });

  return flags;
};
