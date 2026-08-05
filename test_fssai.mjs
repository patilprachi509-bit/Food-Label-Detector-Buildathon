import { isFSSAIAdditive } from './src/utils/fssaiAdditives.js';

console.log('Case 1: Color (INS 102) ->', isFSSAIAdditive('Color (INS 102)', 'Colorant'));
console.log('Case 2: Tartrazine ->', isFSSAIAdditive('Tartrazine', 'Tartrazine'));
console.log('Case 3: Natural Spices Extract ->', isFSSAIAdditive('Natural Spices Extract', 'Flavoring'));
console.log('Case 4: Turmeric ->', isFSSAIAdditive('Turmeric', 'Turmeric'));
console.log('Case 5: Onion Powder ->', isFSSAIAdditive('Onion Powder', 'Onion Powder'));
