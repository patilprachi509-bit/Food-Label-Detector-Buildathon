import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';

export const ProcessingScreen: React.FC = () => {
  const { apiKey, userLanguage, frontImage, ingredientsImage, setExtractionResult } = useAppContext();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const processImages = async () => {
      if (!apiKey || !frontImage || !ingredientsImage) return;

      try {
        // Strip data:image/jpeg;base64, prefix
        const frontBase64 = frontImage.split(',')[1];
        const ingredientsBase64 = ingredientsImage.split(',')[1];

        const promptText = \`
        Extract the product information and nutrition panel data from these two images of a food package.
        CRITICAL INSTRUCTIONS:
        1. You MUST normalize all nutrition values to a strict per-100g basis. Do not output per-serving values. If the panel only lists per-serving, calculate the per-100g equivalent using the serving size.
        2. The field 'trans_fat_g' is nullable. If trans fat is not printed on the panel, you MUST return null, do NOT default to 0.
        3. For 'claims' and 'raw_list' items, output an object with 'normalized_english' (always English, regardless of package language, for rule engine matching) AND 'localized_display' (translate to Hindi if \${userLanguage === 'hi'} is true, otherwise keep as English).
        4. If you encounter INS or E-numbers (e.g. INS 211, E330) in the ingredients list, attempt to decode them into the 'localized_display' field alongside the original number if possible (e.g., "Sodium Benzoate (INS 211)").
        
        Output strictly in the provided JSON schema.
        \`;

        const translatableStringSchema = {
          type: "OBJECT",
          properties: {
            normalized_english: { type: "STRING" },
            localized_display: { type: "STRING" }
          }
        };

        const payload = {
          contents: [
            {
              parts: [
                { text: promptText },
                { inlineData: { mimeType: 'image/jpeg', data: frontBase64 } },
                { inlineData: { mimeType: 'image/jpeg', data: ingredientsBase64 } }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                front_of_pack: {
                  type: "OBJECT",
                  properties: {
                    claims: { type: "ARRAY", items: translatableStringSchema },
                    brand_name: { type: "STRING" },
                    product_name: { type: "STRING" }
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

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (isMounted) {
          const rawResult = data.candidates[0].content.parts[0].text;
          setExtractionResult(JSON.parse(rawResult));
        }

      } catch (err: any) {
        if (isMounted) {
          console.error("Gemini Extraction Error:", err);
          setError(err.message || 'Failed to read label');
        }
      }
    };

    processImages();

    return () => { isMounted = false; };
  }, [apiKey, frontImage, ingredientsImage, setExtractionResult]);

  const isEn = userLanguage === 'en';

  if (error) {
    return (
      <div className="screen-container">
        <h2 className="text-terracotta" style={{ marginBottom: '1rem' }}>Error</h2>
        <p>{error}</p>
        <button className="btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '2rem' }}>Restart</button>
      </div>
    );
  }

  return (
    <div className="screen-container">
      <div className="loader"></div>
      <h2 className={`processing-text ${isEn ? 'headline-en' : 'headline-hi'}`}>
        {isEn ? 'READING THE LABEL' : 'लेबल पढ़ रहा है'}
      </h2>
    </div>
  );
};
