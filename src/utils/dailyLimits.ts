import type { ExtractionResult } from '../context/AppContext';
import type { Flag } from './ruleEngine';

export interface DailyLimitInfo {
  dailyLimitGrams: number;
  nutrientPer100g: number;
  limitStrEn: string;
  limitStrHi: string;
  householdMeasureEn: string;
  householdMeasureHi: string;
  healthEn: string;
  healthHi: string;
  healthShortEn: string;
  healthShortHi: string;
  spoonCount: number;
}

export const getDailyLimitInfo = (
  flag: Flag, 
  extractionResult: ExtractionResult | null, 
  userGender: 'standard' | 'male' | 'female'
): DailyLimitInfo | null => {
  const nutrition = extractionResult?.nutrition;
  if (!nutrition || flag.type !== 'general_health') return null;

  const info: DailyLimitInfo = {
    dailyLimitGrams: 0,
    nutrientPer100g: 0,
    limitStrEn: "",
    limitStrHi: "",
    householdMeasureEn: "",
    householdMeasureHi: "",
    healthEn: "",
    healthHi: "",
    healthShortEn: "",
    healthShortHi: "",
    spoonCount: 0
  };

  if (flag.ruleId === 'G1') {
    info.nutrientPer100g = nutrition.sugar_g;
    info.householdMeasureEn = "(About 6-7 teaspoons)";
    info.householdMeasureHi = "(लगभग 6-7 चम्मच)";
    info.healthEn = "Association with weight gain and type 2 diabetes risk with regular excess intake.";
    info.healthHi = "नियमित अतिरिक्त सेवन के साथ वजन बढ़ने और टाइप 2 मधुमेह के जोखिम से संबंध।";
    info.spoonCount = 6;
    info.healthShortEn = "Weight & Diabetes Risk";
    info.healthShortHi = "वजन और मधुमेह का खतरा";
    
    if (userGender === 'male') {
      info.dailyLimitGrams = 26.4;
      info.limitStrEn = "~26.4g/day limit (Adult Male reference, ICMR-NIN 2024)";
      info.limitStrHi = "~26.4 ग्राम/दिन सीमा (वयस्क पुरुष संदर्भ, ICMR-NIN 2024)";
    } else if (userGender === 'female') {
      info.dailyLimitGrams = 23.8;
      info.limitStrEn = "~23.8g/day limit (Adult Female reference, ICMR-NIN 2024)";
      info.limitStrHi = "~23.8 ग्राम/दिन सीमा (वयस्क महिला संदर्भ, ICMR-NIN 2024)";
    } else {
      info.dailyLimitGrams = 25;
      info.limitStrEn = "25-30g/day limit (Adult reference, ICMR-NIN Dietary Guidelines 2024)";
      info.limitStrHi = "25-30 ग्राम/दिन सीमा (वयस्क संदर्भ, ICMR-NIN आहार संबंधी दिशानिर्देश 2024)";
    }
  } else if (flag.ruleId === 'G2') {
    info.nutrientPer100g = nutrition.total_fat_g;
    info.householdMeasureEn = "(About 2 tablespoons)";
    info.householdMeasureHi = "(लगभग 2 बड़े चम्मच)";
    info.healthEn = "Association with increased LDL cholesterol and cardiovascular disease risk.";
    info.healthHi = "बढ़े हुए एलडीएल कोलेस्ट्रॉल और हृदय रोग के जोखिम से संबंध।";
    info.spoonCount = 2;
    info.healthShortEn = "Heart & Cholesterol Risk";
    info.healthShortHi = "हृदय और कोलेस्ट्रॉल का खतरा";
    
    if (userGender === 'male') {
      info.dailyLimitGrams = 25;
      info.limitStrEn = "25g/day limit (Adult Male sedentary, ICMR-NIN 2024)";
      info.limitStrHi = "25 ग्राम/दिन सीमा (वयस्क पुरुष गतिहीन, ICMR-NIN 2024)";
    } else if (userGender === 'female') {
      info.dailyLimitGrams = 20;
      info.limitStrEn = "20g/day limit (Adult Female sedentary, ICMR-NIN 2024)";
      info.limitStrHi = "20 ग्राम/दिन सीमा (वयस्क महिला गतिहीन, ICMR-NIN 2024)";
    } else {
      info.dailyLimitGrams = 25;
      info.limitStrEn = "25-30g/day limit (Adult reference, ICMR-NIN Dietary Guidelines 2024)";
      info.limitStrHi = "25-30 ग्राम/दिन सीमा (वयस्क संदर्भ, ICMR-NIN आहार संबंधी दिशानिर्देश 2024)";
    }
  } else if (flag.ruleId === 'G3') {
    info.dailyLimitGrams = 5;
    info.nutrientPer100g = Number(((nutrition.sodium_mg * 2.5) / 1000).toFixed(2));
    info.limitStrEn = "Under 5g/day limit (Adult reference, ICMR-NIN Dietary Guidelines 2024)";
    info.limitStrHi = "5 ग्राम/दिन सीमा से कम (वयस्क संदर्भ, ICMR-NIN आहार संबंधी दिशानिर्देश 2024)";
    info.householdMeasureEn = "(About 1 teaspoon)";
    info.householdMeasureHi = "(लगभग 1 चम्मच)";
    info.healthEn = "Association with high blood pressure risk.";
    info.healthHi = "उच्च रक्तचाप के जोखिम से संबंध।";
    info.spoonCount = 1;
    info.healthShortEn = "Blood Pressure Risk";
    info.healthShortHi = "रक्तचाप का खतरा";
  } else if (flag.ruleId === 'G4') {
    info.dailyLimitGrams = 2.2;
    info.nutrientPer100g = nutrition.trans_fat_g || 0;
    info.limitStrEn = "Less than 1% of daily energy intake (~2.2g) (WHO)";
    info.limitStrHi = "हर दिन की ऊर्जा के 1% से कम (~2.2 ग्राम) (WHO)";
    info.healthEn = "Association with increased LDL cholesterol and cardiovascular disease risk.";
    info.healthHi = "बढ़े हुए एलडीएल कोलेस्ट्रॉल और हृदय रोग के जोखिम से संबंध।";
    info.spoonCount = 0;
    info.healthShortEn = "Heart & Cholesterol Risk";
    info.healthShortHi = "हृदय और कोलेस्ट्रॉल का खतरा";
  }

  return info;
};
