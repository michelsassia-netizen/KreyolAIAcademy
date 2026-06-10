/**
 * KreyòlAIHub — Cloudflare Worker. Two routes:
 *
 *   POST  /            → Claude chat/completions (Anthropic Messages API)
 *   POST  /transcribe  → speech-to-text (Whisper) for the voice mic
 *
 * Both inject your secret API keys server-side and return CORS-enabled JSON.
 *
 * SECRETS (Worker → Settings → Variables and Secrets → add Encrypted):
 *   ANTHROPIC_API_KEY   sk-ant-...      (required for chat)
 *   OPENAI_API_KEY      sk-...          (required for /transcribe via OpenAI Whisper)
 *
 * Want a cheaper/faster Whisper? Groq is OpenAI-compatible — set
 *   STT_BASE = https://api.groq.com/openai/v1   and use a Groq key in OPENAI_API_KEY,
 * and STT_MODEL = whisper-large-v3.  (Both optional plain-text vars.)
 *
 * Wrangler:
 *   wrangler deploy worker/worker.js --name kreyolaihubproxy
 *   wrangler secret put ANTHROPIC_API_KEY
 *   wrangler secret put OPENAI_API_KEY
 */

// Lock to your domain(s) once live (use '*' only for testing).
const ALLOWED_ORIGINS = ['*']; // e.g. ['https://kreyolaihub.com']

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes('*')
    ? '*'
    : (ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request.headers.get('Origin') || '');
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return new Response('POST only', { status: 405, headers: cors });

    const path = new URL(request.url).pathname;
    if (path.endsWith('/transcribe')) return handleTranscribe(request, env, cors);
    return handleChat(request, env, cors);
  },
};

// ── Claude chat ──────────────────────────────────────────────────────────────
async function handleChat(request, env, cors) {
  if (!env.ANTHROPIC_API_KEY) return json({ error: { message: 'Server missing ANTHROPIC_API_KEY secret.' } }, 500, cors);

  let body;
  try { body = await request.json(); }
  catch { return json({ error: { message: 'Invalid JSON body.' } }, 400, cors); }

  const payload = {
    model: body.model || 'claude-haiku-4-5',
    max_tokens: Math.min(Number(body.max_tokens) || 600, 1024),
    messages: Array.isArray(body.messages) ? body.messages : [],
  };
  if (body.system) payload.system = body.system;

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });
    const text = await upstream.text();
    return new Response(text, { status: upstream.status, headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (e) {
    return json({ error: { message: 'Upstream error: ' + e.message } }, 502, cors);
  }
}

// ── Speech-to-text (Whisper) ─────────────────────────────────────────────────
async function handleTranscribe(request, env, cors) {
  if (!env.OPENAI_API_KEY) return json({ error: { message: 'Server missing OPENAI_API_KEY secret.' } }, 500, cors);

  const base  = (env.STT_BASE  || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = env.STT_MODEL || 'whisper-1';

  let inForm;
  try { inForm = await request.formData(); }
  catch { return json({ error: { message: 'Expected multipart/form-data with a "file".' } }, 400, cors); }

  const file = inForm.get('file');
  if (!file) return json({ error: { message: 'Missing audio "file".' } }, 400, cors);

  const out = new FormData();
  out.append('file', file, 'audio.webm');
  out.append('model', model);
  out.append('response_format', 'json');
  // Note: Whisper's Haitian-Creole support is partial; a language hint still helps.
  const lang = inForm.get('language');
  if (lang) out.append('language', String(lang));
  const prompt = inForm.get('prompt');
  if (prompt) out.append('prompt', String(prompt));

  try {
    const upstream = await fetch(base + '/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + env.OPENAI_API_KEY },
      body: out,
    });
    const text = await upstream.text();
    return new Response(text, { status: upstream.status, headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (e) {
    return json({ error: { message: 'STT upstream error: ' + e.message } }, 502, cors);
  }
}
