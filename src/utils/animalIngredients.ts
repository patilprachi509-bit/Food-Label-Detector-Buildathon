// Sourced list of ingredients derived from animals, or with ambiguous origin.

export const DEFINITIVE_ANIMAL_INGREDIENTS = new Set([
  "gelatin", "gelatine",
  "rennet", "pepsin", "chymosin",
  "tallow", "lard", "suet",
  "carmine", "cochineal", "carminic acid", "e120", "ins 120",
  "shellac", "e904", "ins 904",
  "isinglass",
  "bone char",
  "egg", "eggs", "egg white", "egg whites", "egg yolk", "egg powder", "whole egg powder",
  "albumin", "albumen",
  "lysozyme", "e1105", "ins 1105"
]);

export const AMBIGUOUS_ANIMAL_INGREDIENTS = new Set([
  "glycerin", "glycerol", "e422", "ins 422",
  "stearic acid", "stearate",
  "mono and diglycerides", "mono- and diglycerides", "e471", "ins 471",
  "lipase",
  "vitamin d3", "cholecalciferol",
  "lecithin" // Note: Often plant-derived (soy/sunflower) but can be egg. Kept in ambiguous list, but may cause many false-ambiguous flags.
]);

/**
 * Checks if an ingredient matches an animal-derived source.
 * Returns 'definitive', 'ambiguous', or 'none'.
 */
export const checkAnimalOrigin = (rawName: string, plainName: string): 'definitive' | 'ambiguous' | 'none' => {
  const lowerRaw = rawName.toLowerCase();
  const lowerPlain = plainName.toLowerCase();

  const cleanStr = (s: string) => s.replace(/\s*\(.*?\)\s*/g, '').replace(/[^a-z0-9\s-]/gi, '').trim();
  
  const rawClean = cleanStr(lowerRaw);
  const plainClean = cleanStr(lowerPlain);

  // 1. Check Definitive
  if (DEFINITIVE_ANIMAL_INGREDIENTS.has(plainClean) || DEFINITIVE_ANIMAL_INGREDIENTS.has(rawClean)) {
    return 'definitive';
  }
  for (const additive of DEFINITIVE_ANIMAL_INGREDIENTS) {
    const regex = new RegExp(`\\b${additive}\\b`, 'i');
    if (regex.test(lowerRaw) || regex.test(lowerPlain)) {
        return 'definitive';
    }
  }

  // 2. Check Ambiguous
  // For lecithin, if it explicitly says "soy lecithin" or "sunflower lecithin", it's safe.
  if (lowerRaw.includes('soy lecithin') || lowerRaw.includes('sunflower lecithin') || 
      lowerPlain.includes('soy lecithin') || lowerPlain.includes('sunflower lecithin')) {
      // safe from lecithin ambiguity
  } else {
    if (AMBIGUOUS_ANIMAL_INGREDIENTS.has(plainClean) || AMBIGUOUS_ANIMAL_INGREDIENTS.has(rawClean)) {
      return 'ambiguous';
    }
    for (const additive of AMBIGUOUS_ANIMAL_INGREDIENTS) {
      const regex = new RegExp(`\\b${additive}\\b`, 'i');
      if (regex.test(lowerRaw) || regex.test(lowerPlain)) {
          return 'ambiguous';
      }
    }
  }

  return 'none';
};
