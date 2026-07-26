import { ExtractionResult, TranslatableString } from '../context/AppContext';
import { decodeINS } from './insDictionary';

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
}

// Fuzzy match for ingredients
const checkSynonyms = (ingredients: TranslatableString[], synonyms: string[]): TranslatableString[] => {
  return ingredients.filter(ing => {
    const norm = ing.normalized_english.toLowerCase().replace(/[^a-z0-9]/g, '');
    return synonyms.some(syn => {
      const synNorm = syn.toLowerCase().replace(/[^a-z0-9]/g, '');
      return norm.includes(synNorm);
    });
  }).map(ing => ({
    ...ing,
    localized_display: decodeINS(ing.localized_display)
  }));
};

const SUGAR_SYNONYMS = ["sugar", "dextrose", "fructose", "glucose", "raw cane sugar", "brown sugar", "lactose", "jaggery", "gur", "honey", "molasses", "treacle", "sweetener"];
const FAT_SYNONYMS = ["palm oil", "palmolein", "vanaspati", "vegetable oil", "hydrogenated oil", "margarine", "shortening", "interesterified fat", "fat", "oil", "butter", "ghee"];
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
        flags.push({ type: 'claim_contradiction', ruleId: 'R1', claim: claimObj, message_en: 'Fails low-fat threshold', message_hi: 'लो-फैट सीमा में विफल', source: 'FSSAI Schedule I', nutrientFocus: 'fat', relevantIngredients: checkSynonyms(ingredients.raw_list, FAT_SYNONYMS) });
      }
      if (claimMatches(c, ['fat free', 'zero fat']) && nutrition.total_fat_g > 0.5) {
        flags.push({ type: 'claim_contradiction', ruleId: 'R2', claim: claimObj, message_en: 'Fails fat-free threshold', message_hi: 'फैट-फ्री सीमा में विफल', source: 'FSSAI Schedule I', nutrientFocus: 'fat', relevantIngredients: checkSynonyms(ingredients.raw_list, FAT_SYNONYMS) });
      }
      if (claimMatches(c, ['low sugar']) && nutrition.sugar_g > 6) {
        flags.push({ type: 'claim_contradiction', ruleId: 'R3', claim: claimObj, message_en: 'Fails low-sugar threshold', message_hi: 'लो-शुगर सीमा में विफल', source: 'FSSAI Schedule I', nutrientFocus: 'sugar', relevantIngredients: checkSynonyms(ingredients.raw_list, SUGAR_SYNONYMS) });
      }
      if (claimMatches(c, ['sugar free', 'zero sugar', 'no added sugar']) && nutrition.sugar_g > 0.5) {
        flags.push({ type: 'claim_contradiction', ruleId: 'R4', claim: claimObj, message_en: 'Fails sugar-free threshold', message_hi: 'शुगर-फ्री सीमा में विफल', source: 'FSSAI Schedule I', nutrientFocus: 'sugar', relevantIngredients: checkSynonyms(ingredients.raw_list, SUGAR_SYNONYMS) });
      }
      if (claimMatches(c, ['source of protein']) && nutrition.protein_g < 5) {
        flags.push({ type: 'claim_contradiction', ruleId: 'R5', claim: claimObj, message_en: 'Fails protein-source threshold', message_hi: 'प्रोटीन-स्रोत सीमा में विफल', source: 'FSSAI Schedule I', nutrientFocus: 'protein', relevantIngredients: [] });
      }
      if (claimMatches(c, ['high protein', 'rich in protein']) && nutrition.protein_g < 10) {
        flags.push({ type: 'claim_contradiction', ruleId: 'R6', claim: claimObj, message_en: 'Fails high-protein threshold', message_hi: 'हाई-प्रोटीन सीमा में विफल', source: 'FSSAI Schedule I', nutrientFocus: 'protein', relevantIngredients: [] });
      }
      if (claimMatches(c, ['immunity', 'health', 'boosts', 'defends', 'protects'])) {
        flags.push({ type: 'needs_verification', ruleId: 'R10', claim: claimObj, message_en: 'Needs Verification', message_hi: 'सत्यापन की आवश्यकता है', source: 'FSSAI Regulation 7', relevantIngredients: [] });
      }
      if (claimMatches(c, ['100%']) && ingredients.raw_list.length > 1) {
        flags.push({ type: 'claim_contradiction', ruleId: 'R11', claim: claimObj, message_en: 'Unsubstantiated 100% claim', message_hi: 'अप्रमाणित 100% दावा', source: 'FSSAI May 2025 advisory', relevantIngredients: [] });
      }
    });
  }

  // G1 - G4
  if (nutrition.energy_kcal > 0) {
    if ((nutrition.sugar_g * 4) / nutrition.energy_kcal > 0.10) {
      flags.push({ type: 'general_health', ruleId: 'G1', message_en: 'High in added sugar', message_hi: 'अतिरिक्त चीनी में उच्च', source: 'ICMR-NIN Dietary Guidelines 2024', nutrientFocus: 'sugar', relevantIngredients: checkSynonyms(ingredients.raw_list, SUGAR_SYNONYMS) });
    }
    if ((nutrition.total_fat_g * 9) / nutrition.energy_kcal > 0.15) {
      flags.push({ type: 'general_health', ruleId: 'G2', message_en: 'High in fat', message_hi: 'वसा में उच्च', source: 'ICMR-NIN Dietary Guidelines 2024', nutrientFocus: 'fat', relevantIngredients: checkSynonyms(ingredients.raw_list, FAT_SYNONYMS) });
    }
  }
  
  if (nutrition.sodium_mg > 250) {
    flags.push({ type: 'general_health', ruleId: 'G3', message_en: 'High in salt', message_hi: 'नमक में उच्च', source: 'ICMR-NIN Dietary Guidelines 2024', nutrientFocus: 'salt', relevantIngredients: checkSynonyms(ingredients.raw_list, SALT_SYNONYMS) });
  }

  if (nutrition.trans_fat_g !== null && nutrition.total_fat_g > 0) {
    if (nutrition.trans_fat_g > 0.02 * nutrition.total_fat_g) {
      flags.push({ type: 'general_health', ruleId: 'G4', message_en: 'Exceeds trans fat limit', message_hi: 'ट्रांस फैट सीमा से अधिक', source: 'FSSAI Prohibition and Restriction on Sales, 2nd Amendment Regs, 2021', nutrientFocus: 'fat', relevantIngredients: checkSynonyms(ingredients.raw_list, FAT_SYNONYMS) });
    }
  }

  // Informational (Maida)
  if (ingredients.raw_list.some(ing => ing.normalized_english.toLowerCase().includes('maida') || ing.normalized_english.toLowerCase().includes('refined wheat flour'))) {
    flags.push({ type: 'informational', ruleId: 'INFO1', message_en: 'Contains Refined Wheat Flour (Maida). Low in fiber and high GI.', message_hi: 'मैदा शामिल है। फाइबर कम और GI उच्च।', source: 'General Nutrition Context', relevantIngredients: checkSynonyms(ingredients.raw_list, ['maida', 'refined wheat flour']) });
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
