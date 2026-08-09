// KreyòlAIHub — live AI configuration (single source of truth).
//
// 1) Deploy the Cloudflare Worker in /worker (see DEPLOY.md), then
// 2) paste your Worker URL below. Until then, demos fall back to sample output.
//
// The Worker holds your ANTHROPIC_API_KEY server-side; the website never sees it.
window.KAH_CONFIG = {
  // Your deployed Cloudflare Worker (e.g. https://kreyolaihubproxy.YOURNAME.workers.dev)
  WORKER_URL: 'https://kreyolaihub2.kreyolaihub.workers.dev',
  // Claude model the demos use (fast + cheap for live demos)
  MODEL: 'claude-haiku-4-5-20251001',
  // Formspree endpoint that collects academy signups (name + email) for your newsletter.
  // Create a free form at formspree.io, then paste its URL here (e.g. https://formspree.io/f/xxxxxx).
  FORMSPREE_URL: 'https://formspree.io/f/xojnlklz',
  // Google Analytics 4 Measurement ID (looks like G-XXXXXXXXXX). Leave empty to disable.
  // Get it at analytics.google.com → Admin → Data Streams → your web stream.
  GA_ID: 'G-T9S2DKKHHR'
};
