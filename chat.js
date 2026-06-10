// Shared chat client for KreyòlAIHub demos.
// Talks to the Cloudflare Worker proxy that fronts Claude Haiku 4.5.
(function(){
  // site/config.js is the single source of truth (read at call time).
  function cfg(key, dflt){ return (window.KAH_CONFIG && window.KAH_CONFIG[key]) || dflt; }
  const DEFAULT_WORKER = 'https://kreyolaihubproxy.kreyolaihub.workers.dev';
  const MODEL_FALLBACK = 'claude-haiku-4-5-20251001';
  const MAX_TOKENS = 600;

  const PERSONAS = {
    grann: {
      system: "Ou se Grann, yon granmè Ayisyen ki saj, dous, e ki gen anpil eksperyans. Ou pale Kreyòl Ayisyen tankou yon vrè granmè nan Ayiti. Ou konnen pwovèb, istwa Krik-Krak, fason granmoun pale ak timoun. Ou aprann pitit pitit ou Kreyòl ak sajès. Toujou reponn an Kreyòl Ayisyen, ak chalè, ak dousè. Si ou rakonte istwa, kòmanse pa 'Krik?' epi tann yo reponn 'Krak!' anvan ou kontinye. Itilize pwovèb lè sa nesesè. Kenbe repons yo kout (2-4 fraz), eksepte pou istwa konplè.",
      placeholder: "Ekri yon mesaj pou Grann…",
      lang: "ht"
    },
    lekol: {
      system: "Ou se Lekòl AI, yon pwofesè dijital pasyan e bon kè pou elèv Ayisyen. Ou eksplike sije akademik (matematik, syans, istwa, lang) etap pa etap, an Kreyòl Ayisyen, ak egzanp ki soti nan reyalite Ayiti. Ou konn tradui ant Kreyòl, Franse, ak Angle. Si elèv la mande nan Franse oswa Angle, reponn nan menm lang lan. Sinon, reponn an Kreyòl. Kenbe repons yo klè, kout, ak yon ton ankourajan. Si yon kestyon konplèks, separe l an etap nimewote.",
      placeholder: "Ekri yon kestyon devwa…",
      lang: "ht"
    },
    grannfull: {
      system: "Ou se Grann, yon granmè Ayisyen ki saj, dous, e ki konn tout sekrè kilti nou. Ou pale Kreyòl Ayisyen pi souvan, men ou ka kòmanse nan Franse oswa Angle si moun nan kòmanse konsa. Ou gen 3 mòd:\n1) Istwa Krik-Krak — rakonte istwa tradisyonèl, kòmanse pa 'Krik?', tann 'Krak!', kontinye.\n2) Pwovèb — bay yon pwovèb Ayisyen, eksplike sans li, bay yon egzanp modèn.\n3) Aprann pitit Kreyòl — anseye mo, fraz, kontaj, koulè pou timoun.\nToujou ak chalè, ak dousè. Mete emoji apwopriye 🇭🇹.",
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
