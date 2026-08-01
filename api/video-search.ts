export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { brandName, productName } = (await req.json()) as any;
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      console.warn("Missing YOUTUBE_API_KEY. Silent fail.");
      return new Response(JSON.stringify({ videoId: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (!brandName && !productName) {
      return new Response(JSON.stringify({ videoId: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const query = [brandName, productName].filter(Boolean).join(' ');
    
    // Add timeout to the fetch call (2500ms max)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UCXmAKxh_qFL5703W9VPgpnA&maxResults=3&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("YouTube API failed:", response.status);
      return new Response(JSON.stringify({ videoId: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const data = (await response.json()) as any;
    
    // Conservative whole-word matching
    const searchTerms = [brandName, productName].filter(Boolean).map(term => term.toLowerCase());
    
    let matchedVideoId = null;

    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        const title = item.snippet?.title?.toLowerCase() || '';
        const description = item.snippet?.description?.toLowerCase() || '';
        
        // Use word boundaries for strict matching
        const isMatch = searchTerms.some(term => {
          const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${escapedTerm}\\b`, 'i');
          return regex.test(title) || regex.test(description);
        });

        if (isMatch) {
          matchedVideoId = item.id.videoId;
          break;
        }
      }
    }

    return new Response(JSON.stringify({ videoId: matchedVideoId }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err: any) {
    console.error("Video search error:", err.message);
    // Silent fail on timeout or error
    return new Response(JSON.stringify({ videoId: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}
