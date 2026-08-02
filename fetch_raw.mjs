import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error("No API key found in .env");
  process.exit(1);
}

const imagePath = 'C:/Users/Prachi/.gemini/antigravity/brain/d593696e-348d-492a-b19d-950170f83182/uploaded_media_1785649548702.png';
const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });

const translatableStringSchema = {
  type: "OBJECT",
  properties: {
    original_language: { type: "STRING" },
    normalized_english: { type: "STRING" },
    bounding_box: {
      type: "OBJECT",
      nullable: true,
      properties: {
        x: { type: "NUMBER" },
        y: { type: "NUMBER" },
        width: { type: "NUMBER" },
        height: { type: "NUMBER" },
        image_index: { type: "NUMBER" }
      }
    }
  }
};

const payload = {
  contents: [
    {
      role: 'user',
      parts: [
        { 
          text: `
        Extract the product information and nutrition panel data from these two images of a food package.
        
        CRITICAL INSTRUCTIONS:
        1. You MUST normalize all nutrition values to a strict per-100g basis. Do not output per-serving values. If the panel only lists per-serving, calculate the per-100g equivalent.
        2. To prevent floating point anomalies and non-deterministic behavior across executions:
           - You MUST aggressively round all kcal and mg values to the nearest whole number (e.g., 23.4 -> 23).
           - You MUST round all gram (g) values to exactly 1 decimal place (e.g., 3.46 -> 3.5).
        3. Ingredients array MUST be in the exact order printed on the pack.
        4. Provide bounding box coordinates [y_min, x_min, y_max, x_max] mapped to {y, x, height, width} for all ingredients and claims. The coordinates MUST be normalized between 0.0 and 1.0 relative to the image dimensions.
        5. You MUST include an \`image_index\` field (0, 1, or 2) in every \`bounding_box\` object to explicitly specify which image the text was found in (0 = first image, 1 = second image, 2 = third image).
          `
        },
        { inlineData: { mimeType: 'image/png', data: base64Image } }
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
  console.log("Sending request to Gemini...");
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    console.error("Error from API:", await response.text());
    return;
  }

  const data = await response.json();
  const rawResult = data.candidates[0].content.parts[0].text;
  
  // Write the raw result to an artifact file for easy reading
  const resultJson = JSON.parse(rawResult);
  fs.writeFileSync('C:/Users/Prachi/.gemini/antigravity/brain/d593696e-348d-492a-b19d-950170f83182/scratch/raw_extraction.json', JSON.stringify(resultJson, null, 2));
  
  console.log("Extraction complete! See artifacts scratch/raw_extraction.json");
}

run();
