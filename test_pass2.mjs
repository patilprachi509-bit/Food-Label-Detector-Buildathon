import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

const rawTranscription = `7.1.1 Bread and Rolls, 100% whole wheat bread
Ingredients: Whole Wheat Flour (Atta) (57.3%)**, Sugar, Gluten, Yeast, Edible Vegetable Oil (Refined Soyabean
Oil), Iodized Salt, Milk Solids, Oat Flour, Soya Flour, Preservatives (282, 200), Malt Product, Acidity Regulators
(341(i), 260, 297), Emulsifier (471), Flour Treatment Agent (510) and Antioxidant (300).
**(Wheat Flour used is 100% Whole Wheat Flour (Atta) as per International Numbering System
Contains Wheat, Barley, Oats, Milk and Soy
OLD PACK`;

const promptText = `
        Extract the product information and nutrition panel data from the following raw text transcription of a food package.
        
        RAW PACKAGE TEXT:
        """
        ${rawTranscription}
        """

        CRITICAL INSTRUCTIONS:
        1. You MUST normalize all nutrition values to a strict per-100g basis. Do not output per-serving values. If the panel only lists per-serving, calculate the per-100g equivalent.
        2. To prevent floating point anomalies and non-deterministic behavior across executions:
           - You MUST aggressively round all kcal and mg values to the nearest whole number (e.g., 23.4 -> 23).
           - You MUST round all gram (g) values to exactly 1 decimal place (e.g., 3.46 -> 3.5).
           - Do not attempt to reverse-engineer sub-decimal precision from percentages. Stick strictly to the printed values with these rounding rules applied.
        3. The field 'trans_fat_g' is nullable. If trans fat is not printed on the panel, you MUST return null, do NOT default to 0.
        4. For 'claims' and 'raw_list' items, output an object with 'normalized_english' (always English) and 'localized_display' (always translate to Hindi).
        5. For every ingredient in 'raw_list', you MUST populate 'plain_name' alongside the raw name using this logic:
           - First, check this static dictionary of common terms: sodium -> salt, ascorbic acid -> Vitamin C, tocopherol -> Vitamin E. Also decode INS/E-numbers (e.g. INS 211).
           - If it is not in the dictionary but is a highly scientific or chemical term, generate a strictly definitional, categorical name for what it is (e.g., "Preservative", "Emulsifier", "Sweetener", "Colorant", "Antioxidant").
           - If the term is already plain language (e.g., "Sugar", "Milk", "Wheat Flour"), set plain_name to exactly equal the raw name unchanged.
           - HARD CONSTRAINT: The generated plain_name MUST be strictly categorical. It must NEVER be evaluative or imply health impacts (e.g., output "Preservative", never "Harmful Preservative").
        6. AI INSIGHT FOR UNVERIFIED CLAIMS: For any claim in front_of_pack.claims that does NOT clearly map to standard deterministic rules (like sugar limits, whole wheat definitions, cholesterol/trans fat limits), you must reason over the ingredients.raw_list and nutrition data to assess if the claim appears plausible or potentially contradicted.
           - Return these insights in the 'unverified_claim_notes' array.
           - Set 'concern' to a short note ONLY IF something looks inconsistent. If the claim is plausible or you have no evidence against it, set 'concern' to null.
           - The language in 'concern' MUST be strictly provisional and non-evaluative (e.g., "This claim may not be fully supported by the visible ingredients — worth checking further"). Never use "FAILS", "VIOLATION", or absolute language.
        7. ANTI-HALLUCINATION INSTRUCTION FOR INGREDIENTS: You MUST ONLY extract ingredients that are literally present in the RAW PACKAGE TEXT. DO NOT infer, guess, or fill in typical/plausible ingredients for the product category under any circumstance. Never fabricate additional items to complete the list.
        8. HINDI TRANSLATION QUALITY: For 'localized_display' and any other Hindi text, you MUST use simple, everyday spoken Hindi (the register used in normal conversation). DO NOT use formal, Sanskrit-derived vocabulary if a common alternative exists. The tone should be human, conversational, and accessible.
        
        Output strictly in the provided JSON schema.
    `;

    const translatableStringSchema = {
      type: "OBJECT",
      properties: {
        normalized_english: { type: "STRING" },
        localized_display: { type: "STRING" },
        plain_name: { type: "STRING" }
      }
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
            front_of_pack: {
              type: "OBJECT",
              properties: {
                claims: { type: "ARRAY", items: translatableStringSchema },
                unverified_claim_notes: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      claim: { type: "STRING" },
                      concern: { type: "STRING", nullable: true }
                    }
                  }
                },
                brand_name: { type: "STRING" },
                product_name: { type: "STRING" },
                net_weight_g: { type: "NUMBER", nullable: true },
                consumption_format: { 
                  type: "STRING", 
                  enum: ["solid_snack", "spoonable", "beverage", "other"]
                }
              }
            },
            ingredients: {
              type: "OBJECT",
              properties: {
                raw_list: { type: "ARRAY", items: translatableStringSchema },
                order_index: { type: "BOOLEAN" },
                detected_language: { type: "STRING" }
              }
            },
            nutrition: {
              type: "OBJECT",
              properties: {
                serving_size: { type: "STRING" },
                energy_kcal: { type: "NUMBER" },
                total_fat_g: { type: "NUMBER" },
                saturated_fat_g: { type: "NUMBER" },
                trans_fat_g: { type: "NUMBER", nullable: true },
                sugar_g: { type: "NUMBER" },
                sodium_mg: { type: "NUMBER" },
                protein_g: { type: "NUMBER" }
              }
            },
            extraction_confidence: {
              type: "STRING",
              enum: ["high", "medium", "low"]
            }
          }
        }
      }
    };

async function run() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!res.ok) {
    console.error(await res.text());
    process.exit(1);
  }
  
  const data = await res.json();
  console.log(data.candidates[0].content.parts[0].text);
}

run();
