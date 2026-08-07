import { JARGON_DICTIONARY } from './src/utils/jargon';

const text = "This product has a high GI and contains an Emulsifier. The FSSAI does not recommend this. Also ICMR-NIN says something. What about Adult reference?";

const allPatterns = JARGON_DICTIONARY.map(d => d.pattern.source).join('|');
const combinedRegex = new RegExp(`(${allPatterns})`, 'gi');

const parts = text.split(combinedRegex);

console.log("Original text:", text);
console.log("Split parts:");
parts.forEach((part, i) => {
  if (!part) return;
  const isMatch = JARGON_DICTIONARY.some(d => new RegExp(`^${d.pattern.source}$`, 'i').test(part));
  console.log(`[${i}] ${isMatch ? 'MATCHED' : 'PLAIN'}: "${part}"`);
});
