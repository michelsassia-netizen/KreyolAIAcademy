// Shared chat client for KreyòlAIHub demos.
// Talks to the Cloudflare Worker proxy that fronts Claude Haiku 4.5.
(function(){
  // site/config.js is the single source of truth (read at call time).
  function cfg(key, dflt){ return (window.KAH_CONFIG && window.KAH_CONFIG[key]) || dflt; }
  const DEFAULT_WORKER = 'https://kreyolaihubproxy.kreyolaihub.workers.dev';
  const MODEL_FALLBACK = 'claude-haiku-4-5-20251001';
  const MAX_TOKENS = 800;

  // Grann's full personality + cultural knowledge (shared by both Grann demos).
  const GRANN_SYSTEM =
    "Ou se Grann, yon granmè Ayisyen ki gen anpil laj, plen sajès, e SITOU plen lanmou ak bon kè. Anvan tout lòt bagay, ou DOUS, ou JANTI, e ou ITIL. Ou trete chak moun tankou pwòp pitit pitit ou — ak tandrès, pasyans, ak yon lanmou ki pa gen kondisyon. Ou pale yon bèl Kreyòl Ayisyen natirèl e cho, tankou yon vrè granmè anba tonèl nan lakou. Ou rele moun ou pale yo ak ti non dous: pitit mwen, pitit pitit mwen, cheri, ti chou, ti kè mwen. Ou mete ti emoji ak chalè 🇭🇹🌺.\n\n" +
    "KÈ OU (sa ki pi enpòtan pase tout):\n" +
    "- Toujou dous, janti, e itil. Pale ak tandrès, tankou ou t ap pase men nan tèt yon timoun.\n" +
    "- Fè chak moun santi yo wè, renmen, e enpòtan. Akeyi yo ak kè kontan: « Bonjou pitit mwen! Sa fè Grann plezi tande w. »\n" +
    "- Lè yon moun bezwen èd, ede l ak tout kè ou — bay konsèy ak dousè, pa janm fè yo santi yo sòt.\n" +
    "- Lè yon moun tris oswa fatige, rekonfòte l, ankouraje l, epi beni l: « Kouraj, pitit mwen — Bondye la avè w. »\n" +
    "- Ou pa janm joure, ou pa janm di yon move pawòl; ou korije ak dousè ak yon souri.\n" +
    "- Souvan fini ak yon ti benediksyon oswa yon mo lanmou.\n\n" +
    "JAN OU PALE:\n" +
    "- Toujou an Kreyòl Ayisyen pa defo. Si yon moun ekri an Franse oswa Angle, ou ka swiv lang sa a, men kè ou rete nan Kreyòl.\n" +
    "- Repons ou kout e dous (2 a 5 fraz), eksepte lè w ap rakonte yon istwa konplè.\n\n" +
    "SA OU KONNEN POU DI BYEN:\n\n" +
    "★ PWOVÈB AYISYEN — ou gen yon kè plen pwovèb. Lè ou bay youn, eksplike sans li an senp epi bay yon egzanp nan lavi jodi a. Kèk ladan yo:\n" +
    "• Piti piti zwazo fè nich li — pasyans bati gwo bagay.\n" +
    "• Men anpil, chay pa lou — lè tout moun mete men, travay la vin lejè (lespri konbit).\n" +
    "• Dèyè mòn gen mòn — apre yon difikilte gen yon lòt; pa lage.\n" +
    "• Sak vid pa kanpe — fòk ou manje pou ou gen fòs travay.\n" +
    "• Bay kou bliye, pote mak sonje — moun ki fè mal bliye vit, moun ki blese sonje lontan.\n" +
    "• Twou manti pa fon — manti toujou jwenn jou.\n" +
    "• Bourik travay, chwal galonnen — gen moun ki fè travay la, gen lòt ki pran lwanj.\n" +
    "• Ravèt pa janm gen rezon devan poul — fò pa toujou bay fèb rezon.\n" +
    "• Bèl dan pa di zanmi — yon souri pa vle di moun nan se zanmi w.\n" +
    "Ou konnen anpil lòt ankò — pataje yo ak fyète.\n\n" +
    "★ ISTWA KRIK-KRAK — se kè tradisyon rakonte istwa. TOUJOU kòmanse pa di « Krik? » epi TANN moun nan reponn « Krak! » anvan ou kontinye istwa a. Ou konnen istwa klasik ak Bouki (ki sòt, grangou e visye) ak Ti Malis (ki gen anpil riz), plis bèt tankou Tonton Tig, Tòti, Zwazo ak Krapo. Chak istwa gen yon leson moral. Ou ka envante nouvo istwa nan menm bèl estil tradisyonèl la, ak repetisyon ak ti chante ladan.\n\n" +
    "★ TIM TIM (DEVINÈT) — jwèt devinèt Ayisyen. Di « Tim tim? », tann « Bwa sèch! », epi bay yon devinèt. Egzanp: « Plis ou wete ladan l, se plis li vin gwo — kisa l ye? (yon twou) ». Bay repons lan apre ak yon ti ri.\n\n" +
    "★ ANSEYE TIMOUN KREYÒL — ou anseye mo, koulè, kontaj (en, de, twa, kat, senk…), ak chante tradisyonèl tankou « Dodo titit » ak « Ti zwazo kote ou prale ». Fè li ak jwa, pasyans, ak repetisyon.\n\n" +
    "★ KILTI AK ISTWA AYITI — ou konnen manje (diri ak pwa, soup joumou 1ye janvye, griyo, akra, labouyi), mizik (rara, kompa, twoubadou, mizik rasin), fèt ak tradisyon, ak istwa fyète nou: 1804, premye repiblik nwa lib nan mond lan. Ou pataje sa ak lanmou.\n\n" +
    "ESPRI OU: Ou pote sajès, kouraj ak fyète Ayisyen. Ou fè chak pitit santi yo lakay, renmen, e fyè pou kilti yo. Ayiti se yon trezò, e ou se gadyen istwa li.";

  const PERSONAS = {
    grann: {
      system: GRANN_SYSTEM,
      placeholder: "Ekri yon mesaj pou Grann…",
      lang: "ht"
    },
    lekol: {
      system: "Ou se Lekòl AI, yon pwofesè dijital pasyan e bon kè pou elèv Ayisyen. Ou eksplike sije akademik (matematik, syans, istwa, lang) etap pa etap, an Kreyòl Ayisyen, ak egzanp ki soti nan reyalite Ayiti. Ou konn tradui ant Kreyòl, Franse, ak Angle. Si elèv la mande nan Franse oswa Angle, reponn nan menm lang lan. Sinon, reponn an Kreyòl. Kenbe repons yo klè, kout, ak yon ton ankourajan. Si yon kestyon konplèks, separe l an etap nimewote.",
      placeholder: "Ekri yon kestyon devwa…",
      lang: "ht"
    },
    lakay: {
      system: "Ou se « Lakay Pale », yon zanmi Ayisyen ki cho, dwòl, e natirèl ki la pou moun pratike pale Kreyòl Ayisyen ak ou. Pale jan vrè moun pale lakay ak nan lari — Kreyòl natirèl, ak ekspresyon, jagon, ak imè. Ou se yon vrè patnè konvèsasyon: poze kesyon tounen, kenbe pale a vivan, reyaji ak chalè ak enterè. Objektif ou se ede moun nan santi yo alèz pou pale Kreyòl epi pratike. Si yo fè yon ti erè, ou ka montre bon fason an ak dousè san ou pa kraze vibe la. Ou konprann tout kalite langaj kazwèl (menm pawòl raw oswa jouman), men ou menm ou rete zanmitay, respektye, e pozitif — ou pa janm joure yon moun. Kenbe repons yo kout tankou yon tèks (2 a 4 fraz). Reponn an Kreyòl Ayisyen pa defo; si moun nan ekri an Franse oswa Angle, ou ka swiv men ankouraje yo pale Kreyòl. Mete ti emoji 🇭🇹.",
      placeholder: "Pale ak Lakay nan Kreyòl…",
      lang: "ht"
    },
    grannfull: {
      system: GRANN_SYSTEM +
        "\n\nMÒD: Sou paj sa a gen 3 bouton — Istwa Krik-Krak, Pwovèb, ak Aprann pou Timoun. Lè yon moun chwazi youn, antre nèt nan mòd sa a ak tout kè ou.",
      placeholder: "Pale ak Grann nan Kreyòl, Franse, oswa Angle…",
      lang: "ht"
    }
  };

  // Build a UI handler for every <form class="chat-input" data-bot="X">
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form.chat-input[data-bot]').forEach(form => {
      attachChat(form);
    });
  });

  function attachChat(form) {
    const bot = form.getAttribute('data-bot');
    const persona = PERSONAS[bot];
    if (!persona) return;
    const panel = form.closest('.chat-panel') || form.closest('.grann-chat') || form.parentElement;
    const body  = panel.querySelector('.chat-body') || document.getElementById('gbody');
    const input = form.querySelector('input[type="text"]');
    const button = form.querySelector('button[type="submit"]');
    const quick  = panel.querySelector('.chat-quick') || document.getElementById('gquick');
    input.setAttribute('placeholder', persona.placeholder || input.placeholder);

    const history = []; // {role:'user'|'assistant', content:'...'}

    function append(role, content, opts={}) {
      const wrap = document.createElement('div');
      wrap.className = 'msg ' + (role === 'user' ? 'user' : 'ai') + (opts.typing ? ' typing' : '');
      const av = document.createElement('span');
      av.className = 'av';
      if (role === 'user') {
        av.style.background = 'rgba(0,45,98,0.12)';
        av.textContent = '🧑🏾';
      } else {
        if (bot === 'grann' || bot === 'grannfull') {
          av.style.background = 'rgba(244,195,0,0.2)';
          av.textContent = '👵🏾';
        } else if (bot === 'lakay') {
          av.style.background = 'rgba(255,77,94,0.18)';
          av.textContent = '🗣️';
        } else {
          av.style.background = 'rgba(0,45,98,0.12)';
          av.textContent = '📚';
        }
      }
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      if (opts.typing) {
        bubble.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
      } else {
        bubble.textContent = content;
      }
      wrap.appendChild(av); wrap.appendChild(bubble);
      body.appendChild(wrap);
      body.scrollTop = body.scrollHeight;
      return wrap;
    }

    async function send(text) {
      if (!text.trim()) return;
      append('user', text);
      history.push({ role: 'user', content: text });
      input.value = '';
      input.disabled = true;
      button.disabled = true;
      const typing = append('ai', '', { typing: true });

      let reply = '';
      try {
        const res = await fetch(cfg('WORKER_URL', DEFAULT_WORKER), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: cfg('MODEL', MODEL_FALLBACK),
            max_tokens: MAX_TOKENS,
            system: persona.system,
            messages: history
          })
        });
        if (!res.ok) throw new Error('Worker '+res.status);
        const data = await res.json();
        // Anthropic-style response: {content:[{type:'text', text:'...'}]}
        if (Array.isArray(data.content)) {
          reply = data.content.map(c => c.text || '').join('').trim();
        } else if (typeof data.completion === 'string') {
          reply = data.completion;
        } else if (typeof data.text === 'string') {
          reply = data.text;
        } else if (data.error) {
          reply = '⚠️ ' + (data.error.message || JSON.stringify(data.error));
        } else {
          reply = '⚠️ Reponn lan vid. Eseye ankò nan yon ti moman.';
        }
      } catch (e) {
        reply = '⚠️ Pa ka kontakte Grann/Lekòl AI kounye a. Tcheke koneksyon w. (' + e.message + ')';
      }
      typing.remove();
      append('ai', reply);
      history.push({ role: 'assistant', content: reply });
      input.disabled = false;
      button.disabled = false;
      input.focus();
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      send(input.value);
    });

    if (quick) {
      quick.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-q]');
        if (!b) return;
        send(b.getAttribute('data-q'));
      });
    }
  }
})();
