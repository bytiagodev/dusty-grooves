const INSTANCES = [
  'https://inv.zoomerville.com/api/v1/search?q=test&type=video'
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/health') {
      return new Response(JSON.stringify({ status: 'ok', instances: INSTANCES.length }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

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

    const videoMatch = path.match(/^\/videos\/([a-zA-Z0-9_-]{11})$/);
    if (videoMatch) {
      return tryInstances(`/videos/${videoMatch[1]}`);
    }

    return new Response('Not found', { status: 404, headers: CORS_HEADERS });
  },
};
