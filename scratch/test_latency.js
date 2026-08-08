require('dotenv').config();

const rawTranscription = `NUTRITION INFORMATION (Approx. Values)
Per 100g
Energy 442 kcal
Protein 18.1 g
Carbohydrate 60.5 g
Total Sugars 1.5 g
Added Sugars 0 g
Total Fat 14.1 g
Saturated Fat 2.2 g
Trans Fat 0 g
Sodium 350 mg

INGREDIENTS: Roasted Bengal Gram (88%), Edible Vegetable Oil (Palmolein), Edible Common Salt (1.5%), Spices & Condiments (Red Chilli Powder, Cumin Powder, Black Pepper Powder), Mango Powder, Acidity Regulator (INS 330), Antioxidant (INS 319).`;

const promptText = `
        Extract the product information and nutrition panel data from the following raw text transcription of a food package.
        
        RAW PACKAGE TEXT:
        """
        ${rawTranscription}
        """

        CRITICAL INSTRUCTIONS:
        1. HIERARCHY OF TRUTH: The provided RAW PACKAGE TEXT is the absolute authoritative source for all literal values (numbers, ingredient names, claims). You MUST NEVER override, supplement, or "correct" any value based on outside knowledge. If the text says 45%, you output 45%. You are parsing the text exactly as provided.
        2. You MUST normalize all nutrition values to a strict per-100g basis. If the nutrition table has multiple columns (e.g., 'Per 100g' and 'Per Serve'), you MUST strictly extract the numerical values from the 'Per 100g' column and completely ignore the 'Per Serve' column values. If the panel ONLY lists per-serving, calculate the per-100g equivalent.
        3. Do NOT arbitrarily round numbers. Extract the exact numbers printed on the label, including decimals (e.g., if it says 442.3mg, output 442.3).
        4. 'trans_fat_g' and 'added_sugar_g' are nullable. If they are not explicitly printed on the panel, you MUST return null, do NOT default to 0 and do not assume added sugar equals total sugar. Only extract 'added_sugar_g' if the label separately declares "Added Sugars".
        5. For 'claims' and 'raw_list' items, output an object with 'normalized_english' (always English) and 'localized_display' (Hindi).
        6. For every ingredient in 'raw_list', you MUST populate 'plain_name' alongside the raw name using this logic:
           - First, check this static dictionary of common terms: sodium -> salt, ascorbic acid -> Vitamin C, tocopherol -> Vitamin E.
           - For INS/E-numbers, you MUST decode them and format 'plain_name' exactly as '[Number] — [Chemical Name] ([Category])' (e.g., "INS 202 — Potassium Sorbate (Preservative)"). Use official Codex/FSSAI chemical names and categories.
           - If it is not in the dictionary and not an INS number, but is a highly scientific or chemical term, generate a strictly definitional, categorical name (e.g., "Preservative").
           - If the term is already plain language (e.g., "Sugar", "Milk", "Wheat Flour", "Water"), set plain_name to exactly equal the raw name unchanged.
           - HARD CONSTRAINT: The generated plain_name MUST be strictly categorical or structural. It must NEVER be evaluative or imply health impacts (e.g., output "Preservative", never "Harmful Preservative").
           - DICTIONARY OFFLOAD RULE: If the ingredient is a common/plain language term (i.e. plain_name equals the raw name) AND it is a simple whole-food ingredient (like "Sugar", "Salt", "Water", "Milk"), you MUST set BOTH 'localized_display' and 'description' to null.
           - HOWEVER, for ANY additive category (e.g., "Acidity Regulator", "Emulsifier", "Preservative"), compound phrase, processed ingredient, complex chemical, INS number, or unfamiliar term, you MUST ALWAYS provide the 'localized_display' Hindi translation AND a 1-sentence 'description'. Do NOT set localized_display to null for functional categories, even if plain_name equals the raw name.
           - ADDITIVE DESCRIPTION CONSTRAINT: For additives and INS numbers, the 1-sentence 'description' MUST be framed strictly around its technical function in the food (e.g. "used to prevent mold and yeast growth in acidic foods"). It MUST NOT imply a benefit or risk to the person eating it, and it MUST NOT include usage limits or health consequences.
        7. SEQUENCE PRESERVATION: You MUST extract the ingredients in the EXACT sequence they appear on the physical packet. Do not reorder them. Do not group them.
        8. AI INSIGHT FOR UNVERIFIED CLAIMS: For any claim in front_of_pack.claims that does NOT clearly map to standard deterministic rules (like sugar limits, whole wheat definitions, cholesterol/trans fat limits), you must reason over the ingredients.raw_list and nutrition data to assess if the claim appears plausible or potentially contradicted.
           - Return these insights in the 'unverified_claim_notes' array.
           - Set 'concern' to a short note ONLY IF something looks inconsistent. If the claim is plausible or you have no evidence against it, set 'concern' to null.
           - The language in 'concern' MUST be strictly provisional and non-evaluative (e.g., "This claim may not be fully supported by the visible ingredients — worth checking further"). Never use "FAILS", "VIOLATION", or absolute language.
        9. ANTI-HALLUCINATION INSTRUCTION FOR INGREDIENTS: You MUST ONLY extract ingredients that are literally present in the RAW PACKAGE TEXT. DO NOT infer, guess, or fill in typical/plausible ingredients for the product category under any circumstance. Never fabricate additional items to complete the list.
        10. For each ingredient, identify its category icon from: tomato, sugar, onion, salt, garlic, chemical, shield, spices, leaf, grain, or default. Extract the numeric percentage if stated on the pack (e.g. Tomato Paste 45% -> 45). List 2-3 reasons why it is added to this product (e.g., "Adds sweetness").
        11. HINDI TRANSLATION QUALITY & COVERAGE: For 'localized_display', you MUST translate EVERY ingredient to Hindi, UNLESS it is a single basic word that perfectly matches a generic term (like 'Sugar', 'Water', 'Salt'). For compound phrases (like 'Refined Wheat Flour (Maida)'), you MUST provide the translation in 'localized_display'. Use simple, everyday spoken Hindi (the register used in normal conversation). DO NOT use formal, Sanskrit-derived vocabulary if a common alternative exists. The tone should be human, conversational, and accessible.
        10. ANTI-HALLUCINATION INSTRUCTION FOR NUMBERS: You must be extremely precise when reading INS or E-numbers. DO NOT transpose or flip digits under any circumstances. In particular, pay very close attention to "510" (which is often mistaken for 150). If the raw text says 510, output 510. If the raw text says 150, output 150. DO NOT swap values between different nutrients (e.g., do not put Total Sugar into added_sugar_g).
        11. SALT VS SODIUM STRICT RULE: If the label lists 'Salt', DO NOT extract it directly as 'sodium_mg'. 'sodium_mg' MUST strictly be the Sodium value. If Sodium is not listed, but Salt is listed in grams, calculate sodium as (Salt in grams * 1000) / 2.5. But if Sodium is explicitly printed, extract exactly that printed Sodium value.
        12. MANUFACTURER PORTION INFO: If the package prints a 'Know Your Portion' or similar reference section with an explicit manufacturer serving size, servings per pack, and %RDA/GDA values, extract them into 'manufacturer_serving_size_g', 'manufacturer_servings_per_pack', and 'manufacturer_per_serve_rda'. For 'manufacturer_per_serve_rda', strictly use only these keys if they appear: 'energy', 'sugar', 'added_sugar', 'fat', 'sodium'. Set these fields to null if not printed.
        13. EXTREME ANTI-HALLUCINATION FOR NUTRITION: NEVER use prior knowledge, standard reference databases (like USDA), or generic nutritional profiles for the recognized product category to fill in the nutrition values. You MUST act strictly as a dumb parser of the literal RAW PACKAGE TEXT. If a number is not explicitly printed on the package, you MUST NOT output it.
        14. MANUFACTURER ADVISORY TEXT: Look for explicit advisory or warning text printed by the manufacturer (e.g., 'Not recommended for children', 'Consult a physician before use', 'Do not exceed [X] per day', 'High caffeine content'). Extract these exactly as printed into the 'manufacturer_advisories' array (in English and translated to Hindi). Do NOT include marketing claims or general usage instructions here.
        15. CELEBRITY ENDORSEMENT DETECTION: Evaluate the raw text to determine if it indicates a celebrity/influencer endorsement (e.g., the text explicitly names a well-known personality, or uses phrases like "Brand Ambassador"). Set 'has_celebrity_endorsement' to true if such text is present. If the imagery might have a face but there is no explicit identifying text, you MUST set it to false (you only process text). HARD CONSTRAINT: You must NEVER output or extract the actual name of the celebrity anywhere in the JSON response for this feature.
        16. OVERLAPPING FRAMES DEDUPLICATION: If you see the exact same ingredient or nutrition value repeating across different segments of the raw text (which is likely due to overlapping camera captures of a curved bottle), you MUST treat it as the same item. Do NOT create duplicate entries in the 'ingredients.raw_list' or sum duplicate nutrition values. Merge them intelligently.

        Output strictly in the provided JSON schema.
    `;

const translatableStringSchema = {
    type: "OBJECT",
    properties: {
    normalized_english: { type: "STRING" },
    localized_display: { type: "STRING" },
    plain_name: { type: "STRING" }
    },
    required: ["normalized_english", "localized_display", "plain_name"]
};

const payload = {
    contents: [
    {
        role: 'user',
        parts: [
        { text: promptText }
        ]
    }
    ],
    generationConfig: {
    temperature: 0,
    responseMimeType: "application/json",
    responseSchema: {
        type: "OBJECT",
        properties: {
        manufacturer_advisories: {
            type: "ARRAY",
            nullable: true,
            items: {
            type: "OBJECT",
            properties: {
                normalized_english: { type: "STRING" },
                localized_display: { type: "STRING" }
            },
            required: ["normalized_english", "localized_display"]
            }
        },
        front_of_pack: {
            type: "OBJECT",
            properties: {
            has_celebrity_endorsement: { type: "BOOLEAN" },
            claims: { type: "ARRAY", items: translatableStringSchema },
            unverified_claim_notes: {
                type: "ARRAY",
                items: {
                type: "OBJECT",
                properties: {
                    claim: translatableStringSchema,
                    concern: {
                    type: "OBJECT",
                    nullable: true,
                    properties: translatableStringSchema.properties,
                    required: ["normalized_english", "localized_display", "plain_name"]
                    }
                },
                required: ["claim", "concern"]
                }
            },
            brand_name: { type: "STRING" },
            product_name: { type: "STRING" },
            net_weight_g: { type: "NUMBER", nullable: true },
            consumption_format: { 
                type: "STRING", 
                enum: ["solid_snack", "spoonable", "beverage", "other"]
            },
            declared_dietary_type: {
                type: "STRING",
                enum: ["vegetarian", "non-vegetarian"],
                nullable: true
            }
            },
            required: ["has_celebrity_endorsement", "claims", "unverified_claim_notes", "brand_name", "product_name", "net_weight_g", "consumption_format", "declared_dietary_type"]
        },
        ingredients: {
            type: "OBJECT",
            properties: {
            raw_list: { 
                type: "ARRAY", 
                items: {
                type: "OBJECT",
                properties: {
                    normalized_english: { type: "STRING" },
                    localized_display: { type: "STRING", nullable: true },
                    plain_name: { type: "STRING" },
                    description: {
                    type: "OBJECT",
                    nullable: true,
                    properties: {
                        normalized_english: { type: "STRING" },
                        localized_display: { type: "STRING", nullable: true }
                    },
                    required: ["normalized_english", "localized_display"]
                    },
                    percentage: { type: "NUMBER", nullable: true },
                    reasons_added: {
                    type: "ARRAY",
                    nullable: true,
                    items: {
                        type: "OBJECT",
                        properties: {
                        normalized_english: { type: "STRING" },
                        localized_display: { type: "STRING", nullable: true }
                        },
                        required: ["normalized_english", "localized_display"]
                    }
                    },
                    icon: { 
                    type: "STRING", 
                    enum: ['tomato', 'sugar', 'onion', 'salt', 'garlic', 'chemical', 'shield', 'spices', 'leaf', 'grain', 'default'],
                    nullable: true
                    }
                },
                required: ["normalized_english", "localized_display", "plain_name", "description", "percentage", "reasons_added", "icon"]
                }
            },
            order_index: { type: "BOOLEAN" },
            detected_language: { type: "STRING" }
            },
            required: ["raw_list", "order_index", "detected_language"]
        },
        nutrition: {
            type: "OBJECT",
            properties: {
            serving_size: { type: "STRING" },
            energy_kcal: { type: "NUMBER" },
            total_fat_g: { type: "NUMBER" },
            saturated_fat_g: { type: "NUMBER" },
            trans_fat_g: { type: "NUMBER", nullable: true },
            total_sugar_g: { type: "NUMBER" },
            added_sugar_g: { type: "NUMBER", nullable: true },
            sodium_mg: { type: "NUMBER" },
            protein_g: { type: "NUMBER" },
            fiber_g: { type: "NUMBER", nullable: true },
            manufacturer_serving_size_g: { type: "NUMBER", nullable: true },
            manufacturer_servings_per_pack: { type: "NUMBER", nullable: true },
            manufacturer_per_serve_rda: {
                type: "OBJECT",
                nullable: true,
                properties: {
                energy: { type: "NUMBER", nullable: true },
                sugar: { type: "NUMBER", nullable: true },
                added_sugar: { type: "NUMBER", nullable: true },
                fat: { type: "NUMBER", nullable: true },
                sodium: { type: "NUMBER", nullable: true }
                },
                required: ["energy", "sugar", "added_sugar", "fat", "sodium"]
            }
            },
            required: ["serving_size", "energy_kcal", "total_fat_g", "saturated_fat_g", "trans_fat_g", "total_sugar_g", "added_sugar_g", "sodium_mg", "protein_g", "fiber_g", "manufacturer_serving_size_g", "manufacturer_servings_per_pack", "manufacturer_per_serve_rda"]
        },
        extraction_confidence: {
            type: "STRING",
            enum: ["high", "medium", "low"]
        },
        raw_transcription: { type: "STRING" }
        },
        required: ["manufacturer_advisories", "front_of_pack", "ingredients", "nutrition", "extraction_confidence", "raw_transcription"]
    }
    }
};

const apiKey = process.env.GEMINI_API_KEY;
const modelUrl = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=\${apiKey}\`;

async function testLatency() {
    console.log("Starting Pass 2 fetch...");
    const t0 = performance.now();
    const res = await fetch(modelUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const t1 = performance.now();
    
    if (!res.ok) {
        console.error("Failed:", res.status, await res.text());
        return;
    }
    const data = await res.json();
    console.log(\`Pass 2 completed in \${Math.round(t1 - t0)} ms.\`);
}

testLatency();
