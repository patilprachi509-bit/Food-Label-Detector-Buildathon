import 'dotenv/config';

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

async function run() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Gemini API Error: ${errorText}`);
    return;
  }

  const data = await response.json();
  const audioPart = data.candidates[0].content.parts.find(p => p.inlineData && p.inlineData.mimeType.startsWith('audio'));
  if (audioPart) {
    console.log("Success! Audio mimeType: ", audioPart.inlineData.mimeType);
  }
}

run();
