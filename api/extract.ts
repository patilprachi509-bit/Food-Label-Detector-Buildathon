import { GoogleAuth } from 'google-auth-library';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: Request) {

  try {
    const t0 = performance.now();
    const apiKey = process.env.GEMINI_API_KEY || '';
    const serviceAccountBase64 = process.env.VISION_SERVICE_ACCOUNT_BASE64;
    console.log('DEBUG_API_KEY_START:', apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4));

    const { frontBase64, ingredientsBase64, thirdBase64 } = (await req.json()) as any;

    if (!apiKey) {
      return new Response('Server configuration error: missing API key', { status: 500 });
    }
    
    if (!serviceAccountBase64) {
      console.error("VISION_SERVICE_ACCOUNT_BASE64 is missing");
      return new Response('Server configuration error: missing Vision API credentials', { status: 500 });
    }

    let rawTranscription = "";

    try {
      const credentialsJSON = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');
      const credentials = JSON.parse(credentialsJSON);

      const auth = new GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });

      const client = await auth.getClient();
      const accessToken = await client.getAccessToken();

      if (!accessToken.token) {
        throw new Error("Failed to retrieve access token");
      }

      // Build Cloud Vision request payload
      const requests = [];
      if (frontBase64) {
        requests.push({
          image: { content: frontBase64 },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
        });
      }
      if (ingredientsBase64) {
        requests.push({
          image: { content: ingredientsBase64 },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
        });
      }
      if (thirdBase64) {
        requests.push({
          image: { content: thirdBase64 },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
        });
      }

      const visionResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests })
      });

      if (!visionResponse.ok) {
        const errorText = await visionResponse.text();
        console.error(`Vision API Error [Status: ${visionResponse.status}]:`, errorText);
        return new Response(`Vision API Error: ${errorText}`, { status: visionResponse.status });
      }

      const visionData = (await visionResponse.json()) as any;
      
      // Parse Cloud Vision blocks dynamically based on spatial geometry
      const allTextPages: string[] = [];
      
      for (const res of visionData.responses) {
        if (!res.fullTextAnnotation) continue;
        
        const words: any[] = [];
        res.fullTextAnnotation.pages.forEach((page: any) => {
          page.blocks?.forEach((block: any) => {
            block.paragraphs?.forEach((para: any) => {
              para.words?.forEach((word: any) => {
                const text = word.symbols.map((s: any) => s.text).join('');
                const xs = word.boundingBox.vertices.map((v: any) => v.x || 0);
                const ys = word.boundingBox.vertices.map((v: any) => v.y || 0);
                const minX = Math.min(...xs);
                const maxX = Math.max(...xs);
                const minY = Math.min(...ys);
                const maxY = Math.max(...ys);
                words.push({
                  text,
                  minX, maxX, minY, maxY,
                  centerY: (minY + maxY) / 2,
                  height: maxY - minY,
                  width: maxX - minX
                });
              });
            });
          });
        });

        if (words.length === 0) continue;

        // Dynamic thresholds
        // 1. Calculate median word height to define row tolerance
        words.sort((a, b) => a.height - b.height);
        const medianHeight = words[Math.floor(words.length / 2)].height;
        const rowTolerance = medianHeight * 0.5; // Words within half a letter's height are on the same line

        // 2. Calculate average character width to define column gaps
        let totalChars = 0;
        let totalWidth = 0;
        words.forEach(w => {
          totalChars += w.text.length;
          totalWidth += w.width;
        });
        const avgCharWidth = totalChars > 0 ? (totalWidth / totalChars) : 10;
        const colGapTolerance = avgCharWidth * 2.5; // Gap larger than 2.5 chars is a table column separator

        // Group into rows
        words.sort((a, b) => a.centerY - b.centerY);
        const lines: any[][] = [];
        let currentLine: any[] = [];
        let currentY = -1;

        words.forEach(w => {
          if (currentLine.length === 0) {
            currentLine.push(w);
            currentY = w.centerY;
          } else {
            if (Math.abs(w.centerY - currentY) <= rowTolerance) {
              currentLine.push(w);
              // Update running average Y of the line
              currentY = currentLine.reduce((sum, cw) => sum + cw.centerY, 0) / currentLine.length;
            } else {
              lines.push(currentLine);
              currentLine = [w];
              currentY = w.centerY;
            }
          }
        });
        if (currentLine.length > 0) lines.push(currentLine);

        // Sort each row by X and insert gaps
        const pageText = lines.map(line => {
          line.sort((a, b) => a.minX - b.minX);
          let lineStr = '';
          for (let i = 0; i < line.length; i++) {
            lineStr += line[i].text;
            if (i < line.length - 1) {
              const gap = line[i + 1].minX - line[i].maxX;
              if (gap > colGapTolerance) {
                lineStr += ' | '; // Use a pipe symbol to clearly denote a table column separator to the LLM
              } else {
                lineStr += ' ';
              }
            }
          }
          return lineStr;
        }).join('\n');

        allTextPages.push(pageText);
      }
      
      rawTranscription = allTextPages.join('\n\n--- IMAGE SEPARATOR ---\n\n');
      
    } catch (err: any) {
      console.error("Cloud Vision execution failed:", err);
      return new Response(`Cloud Vision execution failed: ${err.message}`, { status: 500 });
    }
    
    const t1 = performance.now();
    console.log(`Cloud Vision Pass 1 took ${Math.round(t1 - t0)}ms`);

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
        5. For 'claims' and 'raw_list' items, output an object with 'normalized_english' (always English) and 'localized_display' (always translate to Hindi).
        6. For every ingredient in 'raw_list', you MUST populate 'plain_name' alongside the raw name using this logic:
           - First, check this static dictionary of common terms: sodium -> salt, ascorbic acid -> Vitamin C, tocopherol -> Vitamin E. Also decode INS/E-numbers (e.g. INS 211).
           - If it is not in the dictionary but is a highly scientific or chemical term, generate a strictly definitional, categorical name for what it is (e.g., "Preservative", "Emulsifier", "Sweetener", "Colorant", "Antioxidant").
           - If the term is already plain language (e.g., "Sugar", "Milk", "Wheat Flour"), set plain_name to exactly equal the raw name unchanged.
           - HARD CONSTRAINT: The generated plain_name MUST be strictly categorical. It must NEVER be evaluative or imply health impacts (e.g., output "Preservative", never "Harmful Preservative").
           - You MUST also provide a 'description' object for every ingredient. This description must be a simple, 1-sentence explanation of what the ingredient is and its common purpose, in simple, everyday language (provided in both English and Hindi).
        7. AI INSIGHT FOR UNVERIFIED CLAIMS: For any claim in front_of_pack.claims that does NOT clearly map to standard deterministic rules (like sugar limits, whole wheat definitions, cholesterol/trans fat limits), you must reason over the ingredients.raw_list and nutrition data to assess if the claim appears plausible or potentially contradicted.
           - Return these insights in the 'unverified_claim_notes' array.
           - Set 'concern' to a short note ONLY IF something looks inconsistent. If the claim is plausible or you have no evidence against it, set 'concern' to null.
           - The language in 'concern' MUST be strictly provisional and non-evaluative (e.g., "This claim may not be fully supported by the visible ingredients — worth checking further"). Never use "FAILS", "VIOLATION", or absolute language.
        8. ANTI-HALLUCINATION INSTRUCTION FOR INGREDIENTS: You MUST ONLY extract ingredients that are literally present in the RAW PACKAGE TEXT. DO NOT infer, guess, or fill in typical/plausible ingredients for the product category under any circumstance. Never fabricate additional items to complete the list.
        9. HINDI TRANSLATION QUALITY: For 'localized_display' and any other Hindi text, you MUST use simple, everyday spoken Hindi (the register used in normal conversation). DO NOT use formal, Sanskrit-derived vocabulary if a common alternative exists. The tone should be human, conversational, and accessible.
        10. ANTI-HALLUCINATION INSTRUCTION FOR NUMBERS: You must be extremely precise when reading INS or E-numbers. DO NOT transpose or flip digits under any circumstances. In particular, pay very close attention to "510" (which is often mistaken for 150). If the raw text says 510, output 510. If the raw text says 150, output 150. DO NOT swap values between different nutrients (e.g., do not put Total Sugar into added_sugar_g).
        11. SALT VS SODIUM STRICT RULE: If the label lists 'Salt', DO NOT extract it directly as 'sodium_mg'. 'sodium_mg' MUST strictly be the Sodium value. If Sodium is not listed, but Salt is listed in grams, calculate sodium as (Salt in grams * 1000) / 2.5. But if Sodium is explicitly printed, extract exactly that printed Sodium value.
        12. MANUFACTURER PORTION INFO: If the package prints a 'Know Your Portion' or similar reference section with an explicit manufacturer serving size, servings per pack, and %RDA/GDA values, extract them into 'manufacturer_serving_size_g', 'manufacturer_servings_per_pack', and 'manufacturer_per_serve_rda'. For 'manufacturer_per_serve_rda', strictly use only these keys if they appear: 'energy', 'sugar', 'added_sugar', 'fat', 'sodium'. Set these fields to null if not printed.
        13. EXTREME ANTI-HALLUCINATION FOR NUTRITION: NEVER use prior knowledge, standard reference databases (like USDA), or generic nutritional profiles for the recognized product category to fill in the nutrition values. You MUST act strictly as a dumb parser of the literal RAW PACKAGE TEXT. If a number is not explicitly printed on the package, you MUST NOT output it.
        
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
                      claim: translatableStringSchema,
                      concern: {
                        type: "OBJECT",
                        nullable: true,
                        properties: translatableStringSchema.properties
                      }
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
                raw_list: { 
                  type: "ARRAY", 
                  items: {
                    type: "OBJECT",
                    properties: {
                      normalized_english: { type: "STRING" },
                      localized_display: { type: "STRING" },
                      plain_name: { type: "STRING" },
                      description: translatableStringSchema
                    }
                  }
                },
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
                total_sugar_g: { type: "NUMBER" },
                added_sugar_g: { type: "NUMBER", nullable: true },
                sodium_mg: { type: "NUMBER" },
                protein_g: { type: "NUMBER" },
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
                  }
                }
              }
            },
            extraction_confidence: {
              type: "STRING",
              enum: ["high", "medium", "low"]
            },
            raw_transcription: { type: "STRING" }
          }
        }
      }
    };
    let pass2Response: Response | null = null;
    let attempt = 0;
    const delays = [2000, 5000]; // 2s for first retry, 5s for second

    for (attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        console.log(`Retrying Gemini API (Pass 2) due to ${pass2Response?.status}... waiting ${delays[attempt - 1]}ms (Attempt ${attempt + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, delays[attempt - 1]));
      }

      pass2Response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (pass2Response.ok) {
        break; // Success
      }

      if (pass2Response.status !== 429 && pass2Response.status !== 504) {
        break; // Don't retry other errors (e.g. 400, 403)
      }
    }

    if (!pass2Response || !pass2Response.ok) {
      const errorText = pass2Response ? await pass2Response.text() : 'Unknown error';
      console.error(`Gemini API Error (Pass 2) [Status: ${pass2Response?.status}]:`, errorText);
      return new Response(`Gemini API Error (Pass 2): ${errorText}`, { status: pass2Response?.status || 500 });
    }

    const pass2Data = (await pass2Response.json()) as any;
    let rawResultStr = pass2Data.candidates[0].content.parts[0].text;
    
    // Safely strip standard markdown code block formatting if Gemini includes it
    rawResultStr = rawResultStr.trim();
    if (rawResultStr.startsWith('```json')) {
      rawResultStr = rawResultStr.substring(7);
    } else if (rawResultStr.startsWith('```')) {
      rawResultStr = rawResultStr.substring(3);
    }
    if (rawResultStr.endsWith('```')) {
      rawResultStr = rawResultStr.substring(0, rawResultStr.length - 3);
    }
    rawResultStr = rawResultStr.trim();

    // Inject raw_transcription manually so we can debug Pass 1 output
    try {
      const parsed = JSON.parse(rawResultStr);
      parsed.raw_transcription = rawTranscription;
      const t3 = performance.now();
      parsed.timing = {
        cloud_vision_ms: Math.round(t1 - t0),
        gemini_pass2_ms: Math.round(t3 - t1),
        total_ms: Math.round(t3 - t0)
      };
      rawResultStr = JSON.stringify(parsed);
      console.log(`Gemini Pass 2 took ${Math.round(t3 - t1)}ms. Total: ${Math.round(t3 - t0)}ms`);
    } catch (e) {
      console.error("Pass 2 JSON Parse Failed on string:", rawResultStr);
    }

    return new Response(rawResultStr, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('RAW_ERROR_CATCH_BLOCK:', err.message, err.status, err.response?.data, err.stack);
    const statusCode = err.status || err.response?.status || (err.message?.includes('429') ? 429 : 500);
    return new Response(err.message || 'Unknown internal error', { status: statusCode });
  }
}
