// ── Dusty Grooves API Worker ──────────────────────────────────
// Cloudflare Worker that proxies Invidious API requests.
// Handles instance failover, CORS, and edge caching.
//
// Routes:
//   GET /search?q={query}&type=video  → Invidious search
//   GET /videos/{videoId}             → Video details + audio streams
//   GET /health                       → Health check
//
// Deploy: npx wrangler deploy

const INSTANCES = [
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
  'https://inv.thepixora.com',
  'https://yt.chocolatemoo53.com',
  'https://invidious.tiekoetter.com',
  'https://invidious.f5.si',
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Try each instance until one succeeds
async function tryInstances(path) {
  const errors = [];

  for (const instance of INSTANCES) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${instance}/api/v1${path}`, {
        headers: { 'User-Agent': 'DustyGrooves/1.0' },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (res.ok) {
        const data = await res.text();
        return new Response(data, {
          headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json',
            'X-Instance': instance,
            'Cache-Control': 'public, max-age=300',
          },
        });
      }

      errors.push(`${instance}: HTTP ${res.status}`);
    } catch (err) {
      errors.push(`${instance}: ${err.message}`);
    }
  }

  return new Response(
    JSON.stringify({ error: 'All instances failed', details: errors }),
    {
      status: 502,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    }
  );
}

export default {
  async fetch(request) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Health check
    if (path === '/health') {
      return new Response(JSON.stringify({ status: 'ok', instances: INSTANCES.length }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Search: /search?q=...&type=video
    if (path === '/search') {
      const q = url.searchParams.get('q');
      if (!q) {
        return new Response(JSON.stringify({ error: 'Missing q parameter' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
      return tryInstances(`/search${url.search}`);
    }

    // Video details: /videos/{videoId}
    const videoMatch = path.match(/^\/videos\/([a-zA-Z0-9_-]{11})$/);
    if (videoMatch) {
      return tryInstances(`/videos/${videoMatch[1]}`);
    }

    return new Response('Not found', { status: 404, headers: CORS_HEADERS });
  },
};