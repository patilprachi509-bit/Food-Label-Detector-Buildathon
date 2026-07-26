export const INSDictionary: Record<string, string> = {
  "INS 211": "Sodium Benzoate — a preservative",
  "E211": "Sodium Benzoate — a preservative",
  "INS 330": "Citric Acid — an acidity regulator",
  "E330": "Citric Acid — an acidity regulator",
  "INS 621": "Monosodium Glutamate (MSG) — a flavor enhancer",
  "E621": "Monosodium Glutamate (MSG) — a flavor enhancer",
  "INS 300": "Ascorbic Acid (Vitamin C) — an antioxidant",
  "E300": "Ascorbic Acid (Vitamin C) — an antioxidant",
  "INS 322": "Lecithin — an emulsifier",
  "E322": "Lecithin — an emulsifier",
  "INS 150d": "Sulphite Ammonia Caramel — a color",
  "E150d": "Sulphite Ammonia Caramel — a color",
  "INS 412": "Guar Gum — a thickener",
  "E412": "Guar Gum — a thickener",
  "INS 415": "Xanthan Gum — a thickener",
  "E415": "Xanthan Gum — a thickener",
  // Add more as needed. Gemini is instructed to decode any missing ones dynamically.
};

export const decodeINS = (ingredientString: string): string => {
  let decodedString = ingredientString;
  Object.keys(INSDictionary).forEach(key => {
    // Basic case-insensitive search for the key
    const regex = new RegExp(key.replace(/ /g, '\\s*'), 'gi');
    if (regex.test(ingredientString)) {
      // We append the decoded meaning if it's not already in the string (some basic protection)
      if (!ingredientString.includes(INSDictionary[key])) {
        decodedString = `${ingredientString} (${INSDictionary[key]})`;
      }
    }
  });
  return decodedString;
};
