import { Flag } from './ruleEngine';
import { TranslatableString } from '../context/AppContext';

export const playVerdictAudio = async (
  apiKey: string,
  flags: Flag[],
  relevantIngredients: TranslatableString[],
  language: 'en' | 'hi'
) => {
  const isEn = language === 'en';
  
  // Construct synthesis text
  let synthesisText = '';

  if (flags.length === 0) {
    synthesisText = isEn ? "Checked against 12 sourced rules, nothing flagged. Grade A." : "12 नियमों के विरुद्ध जाँच की गई, कुछ भी फ्लैग नहीं किया गया। ग्रेड ए।";
  } else {
    flags.forEach(flag => {
      if (flag.claim) {
        synthesisText += (isEn ? flag.claim.normalized_english : flag.claim.localized_display) + ". ";
      }
      synthesisText += (isEn ? flag.message_en : flag.message_hi) + ". ";
    });

    if (relevantIngredients.length > 0) {
      synthesisText += (isEn ? "Relevant ingredients are: " : "प्रासंगिक सामग्री हैं: ");
      synthesisText += relevantIngredients.map(ing => isEn ? ing.normalized_english : ing.localized_display).join(", ") + ". ";
    }

    flags.forEach(flag => {
      synthesisText += (isEn ? `Source: ${flag.source}. ` : `स्रोत: ${flag.source}. `);
    });
  }

  // Check cache (session storage or memory could be used, but since this might be long, memory is safer)
  // For simplicity in this buildathon prototype, we will just call it and play it.
  
  const payload = {
    contents: [
      {
        parts: [
          { text: `Please read the following text aloud clearly: "${synthesisText}"` }
        ]
      }
    ],
    generationConfig: {
      responseModalities: ["AUDIO"]
    }
  };

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const audioBase64 = data.candidates[0].content.parts.find((p: any) => p.inlineData && p.inlineData.mimeType.startsWith('audio')).inlineData.data;
    
    if (audioBase64) {
      const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
      audio.play();
    }
  } catch (e) {
    console.error("Audio Synthesis failed:", e);
  }
};
