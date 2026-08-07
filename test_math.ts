import { getDailyLimitInfo } from './src/utils/dailyLimits';

const mockFlag = { type: 'general_health', ruleId: 'G1' } as any;
const mockExtraction = { nutrition: { total_sugar_g: 40 } } as any;

const std = getDailyLimitInfo(mockFlag, mockExtraction, 'standard');
const male = getDailyLimitInfo(mockFlag, mockExtraction, 'male');
const female = getDailyLimitInfo(mockFlag, mockExtraction, 'female');

console.log(`STD: ${std?.dailyLimitGrams}g -> ${std?.limitStrEn}`);
console.log(`MALE: ${male?.dailyLimitGrams}g -> ${male?.limitStrEn}`);
console.log(`FEMALE: ${female?.dailyLimitGrams}g -> ${female?.limitStrEn}`);

// Portion math is in ConsolidatedRecommendation, but it relies on dailyLimitGrams
// targetGrams = (dailyLimitGrams * 0.25 / nutrientPer100g) * 100
const calcPortion = (limit: number, per100: number) => (limit * 0.25 / per100) * 100;

console.log(`STD Portion (sugar=40g/100g): ${calcPortion(std?.dailyLimitGrams || 0, 40)}g`);
console.log(`MALE Portion: ${calcPortion(male?.dailyLimitGrams || 0, 40)}g`);
console.log(`FEMALE Portion: ${calcPortion(female?.dailyLimitGrams || 0, 40)}g`);
