export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { synthesisText } = (await req.json()) as any;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response('Server configuration error: missing API key', { status: 500 });
    }

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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(`Gemini API Error: ${errorText}`, { status: response.status });
    }

    const data = (await response.json()) as any;
    const audioBase64 = data.candidates[0].content.parts.find((p: any) => p.inlineData && p.inlineData.mimeType.startsWith('audio')).inlineData.data;
    
    return new Response(JSON.stringify({ audioBase64 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
}
