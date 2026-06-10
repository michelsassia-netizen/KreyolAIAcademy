// KreyòlAIHub — live AI configuration (single source of truth).
//
// 1) Deploy the Cloudflare Worker in /worker (see DEPLOY.md), then
// 2) paste your Worker URL below. Until then, demos fall back to sample output.
//
// The Worker holds your ANTHROPIC_API_KEY server-side; the website never sees it.
window.KAH_CONFIG = {
  // Your deployed Cloudflare Worker (e.g. https://kreyolaihubproxy.YOURNAME.workers.dev)
  WORKER_URL: 'https://kreyolaihubproxy.kreyolaihub.workers.dev',
  // Claude model the demos use (fast + cheap for live demos)
  MODEL: 'claude-haiku-4-5-20251001'
};
