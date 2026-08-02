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

const pass1Payload = {
  contents: [
    {
      role: 'user',
      parts: [
        { text: "You are a highly precise OCR engine. Your only job is to transcribe the literal text visible in these images of a food package exactly as printed. Do not parse, interpret, or structure the data. Do not guess ingredients. Do not add anything that is not literally printed in the image. Transcribe the text line by line." },
        { inlineData: { mimeType: 'image/png', data: base64Image } }
      ]
    }
  ],
  generationConfig: {
    temperature: 0
  }
};

async function run() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pass1Payload)
  });
  
  if (!res.ok) {
    console.error(await res.text());
    process.exit(1);
  }
  
  const data = await res.json();
  console.log(data.candidates[0].content.parts[0].text);
}

run();
