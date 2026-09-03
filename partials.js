// Shared nav + footer + lang state for KreyòlAIHub site.
(function(){
  const WA = 'https://wa.me/447906520032';
  const PAGES = [
    { id: 'academy',    href: 'academy.html',              kw: 'Aprann',    fr: 'Apprendre',     en: 'Learn' },
    { id: 'evaluate',   href: 'index.html#evaluation',     kw: 'Evalye',    fr: 'Évaluer',       en: 'Evaluate' },
    { id: 'tools',      href: 'tools.html',                kw: 'Zouti',     fr: 'Outils',        en: 'Tools' },
    { id: 'jobs',       href: 'ai-in-haiti.html#jobs',     kw: 'Djòb',      fr: 'Emplois',       en: 'Jobs' },
    { id: 'research',   href: 'ai-in-haiti.html#articles', kw: 'Rechèch',   fr: 'Recherche',     en: 'Research' },
    { id: 'orgs',       href: 'consulting.html',           kw: 'Antrepriz', fr: 'Organisations', en: 'For Orgs' },
  ];
  const I18N = {
    cta_start:    { kw: 'Kòmanse',     fr: 'Commencer',  en: 'Get Started' },
  };
  const langs = ['kw','fr','en'];
  function curLang(){
    return localStorage.getItem('kah_lang') || 'kw';
  }
  function setLang(l){
    localStorage.setItem('kah_lang', l);
    applyLang();
  }
  function applyLang(){
    const l = curLang();
    document.documentElement.setAttribute('lang', l === 'kw' ? 'ht' : l);
    // any element with data-kw / data-fr / data-en attrs is translatable
    document.querySelectorAll('[data-kw], [data-fr], [data-en]').forEach(el=>{
      const tr = el.getAttribute('data-'+l);
      if (tr != null) el.innerHTML = tr;
    });
    document.querySelectorAll('.lang-switch button').forEach(b=>{
      b.classList.toggle('active', b.dataset.lang===l);
    });
    // Update input placeholders (data-kw-placeholder, etc.)
    document.querySelectorAll('input[data-kw-placeholder], input[data-fr-placeholder], input[data-en-placeholder]').forEach(el=>{
      const ph = el.getAttribute('data-'+l+'-placeholder');
      if (ph != null) el.placeholder = ph;
    });
    document.dispatchEvent(new Event('langchange'));
  }
  window.kahSetLang = setLang;
  window.kahLang = curLang;

  function activePage(){
    return document.body.getAttribute('data-page') || 'home';
  }

  function buildNav(){
    const active = activePage();
    const l = curLang();
    const links = PAGES.map(p=>{
      return `<a href="${p.href}" class="${p.id===active?'active':''}" data-kw="${p.kw}" data-fr="${p.fr}" data-en="${p.en}">${p[l]}</a>`;
    }).join('');
    const html = `
      <div class="flag-stripe"></div>
      <nav class="nav">
        <div class="nav-row">
          <a href="index.html" class="nav-brand" aria-label="KreyòlAIHub — AI an Kreyòl">
            <img src="assets/logo-mark.png" class="nav-logo" width="34" height="34" alt="KreyòlAIHub logo" />
            <span>Kreyòl<span style="color: var(--amber);">AI</span>Hub</span>
          </a>
          <div class="nav-links">${links}</div>
          <div class="nav-right">
            <div class="lang-switch" role="group" aria-label="Language">
              <button data-lang="kw" onclick="kahSetLang('kw')">KW</button>
              <button data-lang="fr" onclick="kahSetLang('fr')">FR</button>
              <button data-lang="en" onclick="kahSetLang('en')">EN</button>
            </div>
            <a href="index.html#demo" class="btn btn-primary" data-kw="Eseye AI Gratis" data-fr="Essayer l'IA — Gratuit" data-en="Test AI Free">Test AI Free</a>
            <button class="mobile-toggle" aria-label="Menu" onclick="kahToggleMenu()">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>
        <div id="mobile-menu" style="display:none; padding: 8px var(--pad-x) 18px; border-top: 1px solid var(--line-2);">
          ${PAGES.map(p=>`<a href="${p.href}" style="display:block; padding:10px 0; font-weight:600;" data-kw="${p.kw}" data-fr="${p.fr}" data-en="${p.en}">${p[l]}</a>`).join('')}
          <a href="index.html#demo" class="btn btn-primary" style="margin-top:10px;" data-kw="Eseye AI Gratis" data-fr="Essayer l'IA — Gratuit" data-en="Test AI Free">Test AI Free</a>
        </div>
      </nav>`;
    const mount = document.getElementById('nav-mount');
    if (mount) mount.innerHTML = html;
  }
  window.kahToggleMenu = function(){
    const m = document.getElementById('mobile-menu');
    if (!m) return;
    m.style.display = m.style.display==='none' ? 'block' : 'none';
  };

  function buildFooter(){
    const l = curLang();
    const tl = {
      kw: 'KreyòlAIHub ede Ayisyen aprann, bati, epi grandi ak AI.',
      fr: 'KreyòlAIHub aide les Haïtiens à apprendre, construire et grandir avec l\'IA.',
      en: 'KreyòlAIHub helps Haitians learn, build, and grow with AI.'
    };
    const cols = {
      learn:     { kw: 'Aprann', fr: 'Apprendre', en: 'Learn' },
      build:     { kw: 'Bati', fr: 'Construire', en: 'Build' },
      community: { kw: 'Kominote', fr: 'Communauté', en: 'Community' },
      company:   { kw: 'Konpayi', fr: 'Société', en: 'Company' },
    };
    const html = `
      <footer class="footer" id="community">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <a href="index.html" aria-label="KreyòlAIHub — AI an Kreyòl. San limit." style="display:inline-block; margin-bottom: 16px;">
                <img src="assets/logo-lockup.png" class="footer-logo" width="320" height="108" alt="KreyòlAIHub — AI an Kreyòl. San limit." />
              </a>
              <p data-kw="${tl.kw}" data-fr="${tl.fr}" data-en="${tl.en}">${tl[l]}</p>
              <div style="display:flex; gap:10px; margin-top: 18px;">
                <a href="${WA}" aria-label="WhatsApp" style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.1);display:inline-flex;align-items:center;justify-content:center;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3c1.5.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm5.4 14.2c-.2.6-1.2 1.2-1.7 1.3-.4.1-1 .1-1.6-.1-.4-.1-.8-.3-1.4-.5-2.5-1.1-4.1-3.6-4.2-3.8-.1-.2-1-1.3-1-2.5s.6-1.8.9-2.1c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.1.1.3 0 .5l-.3.4-.4.5c-.1.1-.3.3-.1.6.2.3.7 1.1 1.5 1.8 1 .9 1.9 1.2 2.2 1.3.3.1.4.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.3.1 1.6.8 1.9.9.3.1.5.2.6.3.1.2.1.7-.1 1.3z"/></svg>
                </a>
                <a href="#" aria-label="YouTube" style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.1);display:inline-flex;align-items:center;justify-content:center;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.6-.5-5.3c-.3-1-1-1.7-2-2C18.8 4.2 12 4.2 12 4.2s-6.8 0-8.5.5c-1 .3-1.7 1-2 2C1 8.4 1 12 1 12s0 3.6.5 5.3c.3 1 1 1.7 2 2 1.7.5 8.5.5 8.5.5s6.8 0 8.5-.5c1-.3 1.7-1 2-2 .5-1.7.5-5.3.5-5.3zM9.7 15.3V8.7L15.5 12l-5.8 3.3z"/></svg>
                </a>
                <a href="#" aria-label="TikTok" style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.1);display:inline-flex;align-items:center;justify-content:center;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.6 6.3c-1.3-.2-2.4-.9-3.2-1.9-.4-.6-.7-1.3-.7-2H12v11.1c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5c.3 0 .6 0 .8.1V7.5c-.3 0-.5-.1-.8-.1-3.4 0-6.2 2.8-6.2 6.2s2.8 6.2 6.2 6.2 6.2-2.8 6.2-6.2V9.3c1.3.9 2.9 1.5 4.6 1.5V7.3c-.2 0-.5 0-.7-.1z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 data-kw="${cols.learn.kw}" data-fr="${cols.learn.fr}" data-en="${cols.learn.en}">${cols.learn[l]}</h4>
              <a href="aprann-ai-an-kreyol.html" data-kw="Aprann AI an Kreyòl" data-fr="Apprendre l'IA en créole" data-en="Learn AI in Haitian Creole">Aprann AI an Kreyòl</a>
              <a href="ai-in-haiti.html" data-kw="AI an Ayiti" data-fr="IA en Haïti" data-en="AI in Haiti">AI an Ayiti</a>
              <a href="academy.html" data-kw="Akademi" data-fr="Académie" data-en="Academy">Academy</a>
              <a href="academy.html" data-kw="30 Jou pou Metrize AI" data-fr="30 jours pour maîtriser l'IA" data-en="30 Days to Master AI">30 Days to Master AI</a>
            </div>
            <div>
              <h4 data-kw="${cols.build.kw}" data-fr="${cols.build.fr}" data-en="${cols.build.en}">${cols.build[l]}</h4>
              <a href="tools.html" data-kw="Zouti AI" data-fr="Outils IA" data-en="AI Tools">AI Tools</a>
              <a href="grann.html" data-kw="Grann AI" data-fr="Grann AI" data-en="Grann AI">Grann AI</a>
              <a href="chatbot-ayiti.html" data-kw="Chatbot pou Ayiti" data-fr="Chatbot pour Haïti" data-en="Chatbot for Haiti">Chatbot pou Ayiti</a>
            </div>
            <div>
              <h4 data-kw="${cols.community.kw}" data-fr="${cols.community.fr}" data-en="${cols.community.en}">${cols.community[l]}</h4>
              <a href="community.html" data-kw="Antre" data-fr="Rejoindre" data-en="Join">Join</a>
              <a href="${WA}">WhatsApp</a>
              <a href="consulting.html" data-kw="Konsiltasyon" data-fr="Conseil" data-en="Consulting">Consulting</a>
            </div>
            <div>
              <h4 data-kw="${cols.company.kw}" data-fr="${cols.company.fr}" data-en="${cols.company.en}">${cols.company[l]}</h4>
              <a href="index.html#about" data-kw="Konsènan" data-fr="À propos" data-en="About">About</a>
              <a href="mailto:kreyolaihub@gmail.com" data-kw="Kontak" data-fr="Contact" data-en="Contact">Kontak</a>
              <a href="privacy.html" data-kw="Vi Prive" data-fr="Confidentialité" data-en="Privacy">Vi Prive</a>
              <a href="terms.html" data-kw="Kondisyon" data-fr="Conditions" data-en="Terms">Kondisyon</a>
              <a href="accessibility.html" data-kw="Aksesibilite" data-fr="Accessibilité" data-en="Accessibility">Aksesibilite</a>
            </div>
          </div>
          <div class="footer-bottom">
            <div data-kw="© 2026 KreyòlAIHub · Fèt ak <img src='assets/flag-ht.svg' alt='Ayiti' style='height:1em;width:auto;vertical-align:-0.15em;border-radius:2px;'> ann Ayiti &amp; nan Dyaspora" data-fr="© 2026 KreyòlAIHub · Fait avec <img src='assets/flag-ht.svg' alt='Ayiti' style='height:1em;width:auto;vertical-align:-0.15em;border-radius:2px;'> en Haïti &amp; la Diaspora" data-en="© 2026 KreyòlAIHub · Made with <img src='assets/flag-ht.svg' alt='Ayiti' style='height:1em;width:auto;vertical-align:-0.15em;border-radius:2px;'> in Haiti &amp; the Diaspora">© 2026 KreyòlAIHub · Fèt ak <img src='assets/flag-ht.svg' alt='Ayiti' style='height:1em;width:auto;vertical-align:-0.15em;border-radius:2px;'> ann Ayiti &amp; nan Dyaspora</div>
            <div>kreyolaihub.com</div>
          </div>
        </div>
      </footer>
      <a class="wa-float" href="${WA}" target="_blank" rel="noopener" aria-label="WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3c1.5.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm5.4 14.2c-.2.6-1.2 1.2-1.7 1.3-.4.1-1 .1-1.6-.1-.4-.1-.8-.3-1.4-.5-2.5-1.1-4.1-3.6-4.2-3.8-.1-.2-1-1.3-1-2.5s.6-1.8.9-2.1c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.1.1.3 0 .5l-.3.4-.4.5c-.1.1-.3.3-.1.6.2.3.7 1.1 1.5 1.8 1 .9 1.9 1.2 2.2 1.3.3.1.4.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.3.1 1.6.8 1.9.9.3.1.5.2.6.3.1.2.1.7-.1 1.3z"/></svg>
      </a>`;
    const mount = document.getElementById('footer-mount');
    if (mount) mount.innerHTML = html;
  }

  function initReveal(){
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;
    const root = document.documentElement;
    root.classList.add('reveal-ready');
    const sel = ['.who-card','.pillar','.week-card','.tool-card','.svc','.step','.stat-card',
      '.tm-card','.soon-card','.team-card','.haiti-slot','.demo-strip','.live-card',
      '.tool-row > *','.section-reveal'].join(',');
    const els = Array.from(document.querySelectorAll(sel));
    if (!els.length){ root.classList.remove('reveal-ready'); return; }
    els.forEach(el=>el.setAttribute('data-reveal',''));
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if (e.isIntersecting){
          const par = e.target.parentElement;
          const sibs = par ? Array.from(par.children).filter(c=>c.hasAttribute && c.hasAttribute('data-reveal')) : [e.target];
          const i = Math.max(0, sibs.indexOf(e.target));
          e.target.style.transitionDelay = Math.min(i,6)*55 + 'ms';
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    els.forEach(el=>io.observe(el));
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    buildNav();
    buildFooter();
    applyLang();
    initReveal();
    // Site-wide welcome assistant (loads once on every page)
    if (!document.getElementById('kah-assistant-js')) {
      var s = document.createElement('script');
      s.id = 'kah-assistant-js'; s.src = 'assistant.js'; s.defer = true;
      document.body.appendChild(s);
    }
    // Google Analytics (loads once on every page, only if a Measurement ID is set)
    initAnalytics();
  });

  // Google Analytics 4 — dormant until KAH_CONFIG.GA_ID is set (e.g. "G-XXXXXXXXXX").
  function initAnalytics(){
    var id = (window.KAH_CONFIG && window.KAH_CONFIG.GA_ID) || '';
    if (!id || id.indexOf('G-') !== 0) return;            // not configured yet
    if (document.getElementById('kah-ga-js')) return;      // already loaded
    var g = document.createElement('script');
    g.id = 'kah-ga-js'; g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', id, { anonymize_ip: true });
  }
})();
