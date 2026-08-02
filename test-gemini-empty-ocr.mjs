import fs from 'fs';
import sharp from 'sharp';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not found in process.env");
    return;
  }
  
  // Generate a dummy front image
  console.log("Generating dummy front image...");
  const dummyFrontBuffer = await sharp({
    create: { width: 800, height: 800, channels: 3, background: { r: 255, g: 0, b: 0 } }
  }).jpeg().toBuffer();
  const frontBase64 = dummyFrontBuffer.toString('base64');
  
  // This exactly matches the prompt structure in extract.ts
  const promptText = `
    You are an expert food label analyzer. Your task is to extract exact information from food packaging.
    
    1. Extract all ingredients and sub-ingredients.
    2. Extract nutritional information per 100g.
    3. Identify front-of-pack claims.
    4. Provide the exact language code (e.g. 'en', 'hi', 'bilingual').
    5. Evaluate overall healthiness strictly based on standard thresholds (e.g., FSSAI).
    6. UNVERIFIED CLAIM DETECTION: Compare the front-of-pack claims against the ingredient list.
       - If a claim says "Made with Real Fruit" but the ingredients only list "Artificial Flavor", this is inconsistent.
       - Return these insights in the 'unverified_claim_notes' array.
       - Set 'concern' to a short note ONLY IF something looks inconsistent. If the claim is plausible or you have no evidence against it, set 'concern' to null.
       - The language in 'concern' MUST be strictly provisional and non-evaluative.
    7. BOUNDING BOXES FOR LOCALIZATION: For each entry in front_of_pack.claims, you MUST include a 'bounding_box' object { x, y, width, height } indicating exactly where that text appears on the front-of-pack photo.
       - These values MUST be expressed as percentages of the full image dimensions (0 to 100).
       - If you cannot confidently localize a claim on the image, you MUST set 'bounding_box' to null. Do not guess or hallucinate a bounding box.
    8. ANTI-HALLUCINATION INSTRUCTION FOR INGREDIENTS: You MUST ONLY extract ingredient text that is literally present in the OCR text provided. DO NOT infer, guess, or fill in typical/plausible ingredients for the product category under any circumstance. If the provided OCR text is garbled, empty, or unreadable, lower 'extraction_confidence' to 'low' and return what you can. Never fabricate additional items to complete the list.
    
    Output strictly in JSON.
  `;

  const ocrText = ""; 
  
  const payload = {
    contents: [
      {
        parts: [
          { text: promptText },
          { inlineData: { mimeType: 'image/jpeg', data: frontBase64 } },
          { text: `[START RAW OCR TEXT OF INGREDIENTS PANEL]\n${ocrText || "(No legible text detected)"}\n[END RAW OCR TEXT]` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0,
      responseMimeType: 'application/json',
    }
  };

  console.log("\nCalling Gemini with EMPTY OCR text (simulating timeout/fallback)...");
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      console.error("Gemini HTTP Error:", await res.text());
      return;
    }
    
    const result = await res.json();
    const textOutput = result.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(textOutput);
    
    console.log("\n--- GEMINI OUTPUT ---");
    console.log("Extraction Confidence:", parsed.extraction_confidence);
    console.log("Ingredients Raw List:", parsed.ingredients?.raw_list);
    console.log("----------------------");
    
    if (parsed.extraction_confidence === 'low' && (!parsed.ingredients?.raw_list || parsed.ingredients.raw_list.length === 0)) {
       console.log("✅ TEST PASSED: Gemini correctly returned low confidence and hallucinated 0 ingredients.");
    } else {
       console.log("❌ TEST FAILED: Gemini did not strictly obey the fallback instructions.");
    }
  } catch(e) {
    console.error("Gemini API Error:", e);
  }
}

testGemini();
