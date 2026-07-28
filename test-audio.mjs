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

async function runModel(modelName) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Gemini API Error for ${modelName}: ${errorText}`);
    return;
  }

  const data = await response.json();
  console.log(`Success for ${modelName}!`);
}

async function run() {
  await runModel('gemini-2.5-flash-exp');
  await runModel('gemini-2.0-flash-exp');
  await runModel('gemini-2.0-flash');
}

run();
