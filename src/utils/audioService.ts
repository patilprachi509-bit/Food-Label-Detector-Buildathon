import type { Flag } from './ruleEngine';
import type { TranslatableString } from '../context/AppContext';

function createWavHeader(dataLength: number, sampleRate = 24000, numChannels = 1, bitDepth = 16) {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);
  
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  return new Uint8Array(buffer);
}

const audioCache = new Map<string, string>();

export const playVerdictAudio = async (
  flags: Flag[],
  relevantIngredients: TranslatableString[],
  language: 'en' | 'hi'
) => {
  const isEn = language === 'en';
  
  // Construct synthesis text
  // NOTE: We explicitly omit 'unverified_claim_notes' (AI Insights) from audio 
  // to prevent reading provisional/low-confidence LLM notes aloud.
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

  if (audioCache.has(synthesisText)) {
    console.log('Audio served from cache');
    console.time('tts_generation (cached)');
    const wavBase64 = audioCache.get(synthesisText)!;
    const audio = new Audio(`data:audio/wav;base64,${wavBase64}`);
    audio.play();
    console.timeEnd('tts_generation (cached)');
    return;
  }

  console.time('tts_generation (network)');
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ synthesisText })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const audioBase64 = data.audioBase64;
    
    if (audioBase64) {
      const binaryString = atob(audioBase64);
      const pcmData = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        pcmData[i] = binaryString.charCodeAt(i);
      }
      
      const header = createWavHeader(pcmData.length);
      const wavData = new Uint8Array(header.length + pcmData.length);
      wavData.set(header);
      wavData.set(pcmData, header.length);
      
      let wavBase64 = '';
      for (let i = 0; i < wavData.length; i += 8192) {
        wavBase64 += String.fromCharCode.apply(null, Array.from(wavData.subarray(i, i + 8192)));
      }
      wavBase64 = btoa(wavBase64);
      
      // Store in cache
      audioCache.set(synthesisText, wavBase64);

      const audio = new Audio(`data:audio/wav;base64,${wavBase64}`);
      audio.play();
    }
    console.timeEnd('tts_generation (network)');
  } catch (e) {
    console.error("Audio Synthesis failed:", e);
    console.timeEnd('tts_generation (network)');
  }
};
