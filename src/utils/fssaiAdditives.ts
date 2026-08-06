// A practical, partial subset of common additives sourced directly from the 
// FSSAI Food Products Standards and Food Additives Regulations, 2011.
// This is not exhaustive, prioritizing avoiding false positives over capturing every rare additive.
const FSSAI_ADDITIVES = new Set([
  // Colors
  "tartrazine", "sunset yellow", "sunset yellow fcf", "erythrosine", 
  "ponceau 4r", "carmoisine", "brilliant blue", "brilliant blue fcf", 
  "fast green fcf", "indigo carmine", "allura red",
  "caramel", "annatto", "curcumin", "riboflavin", "beta-carotene", "titanium dioxide",

  // Sweeteners
  "aspartame", "sucralose", "saccharin", "acesulfame k", "acesulfame potassium", 
  "neotame", "stevia", "steviol glycoside", "sucralose", "maltitol", "sorbitol", 
  "xylitol", "erythritol", "mannitol", "isomalt",

  // Preservatives
  "sodium benzoate", "potassium benzoate", "benzoic acid",
  "potassium sorbate", "calcium propionate", "sodium propionate",
  "sodium nitrite", "sodium nitrate", "potassium nitrite", "potassium nitrate",
  "sulphur dioxide", "sodium metabisulphite", "potassium metabisulphite",
  "sorbic acid", "nisin", "natamycin",

  // Antioxidants
  "tbhq", "tertiary butylhydroquinone", "bha", "butylated hydroxyanisole", 
  "bht", "butylated hydroxytoluene", "ascorbic acid", "sodium ascorbate", 
  "calcium ascorbate", "tocopherol", "mixed tocopherols",

  // Flavor Enhancers
  "msg", "monosodium glutamate", "disodium guanylate", "disodium inosinate", 
  "disodium 5-ribonucleotides",

  // Emulsifiers, Stabilizers, Thickeners
  "lecithin", "soy lecithin", "guar gum", "xanthan gum", "carrageenan", 
  "pectin", "cellulose gum", "sodium carboxymethyl cellulose", "mono and diglycerides", 
  "sodium alginate", "potassium alginate", "agar", "gelatin", "maltodextrin",

  // Acidity Regulators
  "citric acid", "sodium citrate", "potassium citrate", "calcium citrate",
  "malic acid", "tartaric acid", "lactic acid", "phosphoric acid", 
  "sodium phosphate", "potassium phosphate", "calcium phosphate",
  "sodium bicarbonate", "potassium bicarbonate", "ammonium bicarbonate",

  // Generic Functional Categories (for robust matching)
  "acidity regulator", "emulsifier", "preservative", "antioxidant", 
  "colour", "color", "flavoring", "flavouring", "stabilizer", "thickener",
  "raising agent", "sweetener", "anti-caking agent", "glazing agent"
]);

// Regex for contextual additive numbers (e.g. "(322)") that directly follow a functional category word
const CATEGORY_PREFIX_REGEX = /\b(acidity regulator|emulsifier|preservative|antioxidant|colour|color|flavoring|flavouring|stabilizer|thickener|raising agent|sweetener|anti-caking agent|glazing agent)s?\s*[\(:\[]?\s*\d{3}[a-z]?\s*[\):\]]?\b/i;

export const isFSSAIAdditive = (rawName: string, plainName: string): boolean => {
  const lowerRaw = rawName.toLowerCase();
  const lowerPlain = plainName.toLowerCase();

  // 1. Explicit Regulatory Formatting (INS / E-Numbers)
  // If the manufacturer explicitly lists an INS or E number, it is inherently a regulated additive.
  if (/ins\s?-?\s?\d+/i.test(lowerRaw) || /\be\s?-?\s?\d+\b/i.test(lowerRaw)) {
    return true;
  }

  // 1b. Contextual Bare Numbers
  // Matches a 3-digit number in brackets ONLY if it directly follows a known functional category word
  if (CATEGORY_PREFIX_REGEX.test(lowerRaw)) {
    return true;
  }

  // 2. Exact Dictionary Match
  // Check if the normalized name exactly matches a known additive from the FSSAI subset.
  // We check plainName first, then rawName (stripped of non-alpha characters just in case, though plainName is usually clean).
  
  // Clean names to remove trailing brackets or percentages, e.g. "Tartrazine (Color)" -> "tartrazine"
  const cleanStr = (s: string) => s.replace(/\s*\(.*?\)\s*/g, '').replace(/[^a-z\s-]/gi, '').trim();
  
  const rawClean = cleanStr(lowerRaw);
  const plainClean = cleanStr(lowerPlain);

  if (FSSAI_ADDITIVES.has(plainClean) || FSSAI_ADDITIVES.has(rawClean)) {
    return true;
  }
  
  // Also check if any additive name is fully contained as a discrete word within the raw string 
  // (e.g. "Preservative (Sodium Benzoate)")
  for (const additive of FSSAI_ADDITIVES) {
    if (lowerRaw.includes(additive) || lowerPlain.includes(additive)) {
        // Double check it's bounded by non-words to avoid partial matches
        const regex = new RegExp(`\\b${additive}\\b`, 'i');
        if (regex.test(lowerRaw) || regex.test(lowerPlain)) {
            return true;
        }
    }
  }

  return false;
};
