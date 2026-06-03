// ── API Client ────────────────────────────────────────────────
// Talks to the Dusty Grooves Cloudflare Worker, which proxies
// Invidious API requests with failover across multiple instances.
//
// The Worker handles CORS, instance selection, and failover.
// This module just needs to know the Worker URL.

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.warn(
    'VITE_API_URL is not set. Add your Cloudflare Worker URL to .env:\n' +
    'VITE_API_URL=https://dusty-grooves-api.<your-subdomain>.workers.dev'
  );
}

const REQUEST_TIMEOUT_MS = 10000;

async function fetchWithTimeout(url, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`, { cause: err });
    }
    throw err;
  }
}

async function pipedFetch(path) {
  if (!API_URL) {
    throw new Error('VITE_API_URL not configured — see .env.example');
  }

  const res = await fetchWithTimeout(`${API_URL}${path}`);

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API returned ${res.status}: ${body}`);
  }

  const data = await res.json();
  return { data, instance: API_URL };
}

export { pipedFetch, REQUEST_TIMEOUT_MS };