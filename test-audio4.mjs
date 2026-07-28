import 'dotenv/config';
import fs from 'fs';

const apiKey = process.env.GEMINI_API_KEY;

const payload = {
  contents: [
    {
      parts: [
        { text: `Please read the following text aloud clearly: "Hello world"` }
      ]
    }
  ],
  generationConfig: {
    responseModalities: ["AUDIO"]
  }
};

function createWavHeader(dataLength, sampleRate = 24000, numChannels = 1, bitDepth = 16) {
  const buffer = Buffer.alloc(44);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * (bitDepth / 8), 28);
  buffer.writeUInt16LE(numChannels * (bitDepth / 8), 32);
  buffer.writeUInt16LE(bitDepth, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);
  return buffer;
}

async function run() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  const audioPart = data.candidates[0].content.parts.find(p => p.inlineData && p.inlineData.mimeType.startsWith('audio'));
  if (audioPart) {
    const pcmBuffer = Buffer.from(audioPart.inlineData.data, 'base64');
    const wavHeader = createWavHeader(pcmBuffer.length);
    const wavBuffer = Buffer.concat([wavHeader, pcmBuffer]);
    fs.writeFileSync('test.wav', wavBuffer);
    console.log("Saved test.wav");
  }
}

run();
