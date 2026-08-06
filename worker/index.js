// ── Dusty Grooves API Worker ──────────────────────────────────
// Cloudflare Worker that proxies YouTube Data API v3 requests.
// Keeps the API key server-side, handles CORS.
//
// Routes:
//   GET /search?q={query}&type=video  → YouTube search
//   GET /health                       → Health check
//
// Deploy: npx wrangler deploy
// Set secret: npx wrangler secret put YOUTUBE_API_KEY

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function searchYouTube(query, apiKey) {
  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: 15,
    key: apiKey,
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`YouTube API returned ${res.status}: ${body}`);
  }

  const data = await res.json();

  // Transform to match the Invidious response shape usePiped.js expects
  const items = (data.items || []).map(item => ({
    type: 'video',
    title: item.snippet.title,
    videoId: item.id.videoId,
    author: item.snippet.channelTitle,
    authorId: item.snippet.channelId,
    authorVerified: false,
    description: item.snippet.description,
    videoThumbnails: [
      {
        quality: 'high',
        url: item.snippet.thumbnails?.high?.url || '',
        width: 480,
        height: 360,
      },
    ],
    viewCount: 0,
    lengthSeconds: 0,
    liveNow: false,
  }));

  return items;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
    }

    const apiKey = env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'YOUTUBE_API_KEY not configured' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/health') {
      return new Response(
        JSON.stringify({ status: 'ok', backend: 'youtube-data-api-v3' }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/search') {
      const q = url.searchParams.get('q');
      if (!q) {
        return new Response(
          JSON.stringify({ error: 'Missing q parameter' }),
          { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }

      try {
        const items = await searchYouTube(q, apiKey);
        return new Response(JSON.stringify(items), {
          headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300',
          },
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message }),
          { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response('Not found', { status: 404, headers: CORS_HEADERS });
  },
};