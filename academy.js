// Academy LMS — renders sidebar, lesson body, quiz, progress, certificate.
(function(){
  const STORAGE = 'kah_progress_v1';
  const NAME_KEY = 'kah_name_v1';
  const USER_KEY = 'kah_user_v1';
  const ACTIVE_FIRST = 'ai-fondasyon'; // keeps existing progress under STORAGE
  const COURSES = window.KAH_COURSES || [];
  const CATS = window.KAH_CATEGORIES || {};
  let LESSONS = [];          // lessons of the currently open course
  let course = null;         // current course object
  let view = 'catalog';      // 'catalog' | 'home' (course dashboard) | 'lesson'

  function loadUser(){ try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch(e){ return null; } }
  function saveUser(u){ localStorage.setItem(USER_KEY, JSON.stringify(u)); }
  function clearUser(){ localStorage.removeItem(USER_KEY); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  // Per-course progress (the first course keeps the original key for back-compat)
  function progKey(cid){ return (cid && cid !== ACTIVE_FIRST) ? STORAGE + '__' + cid : STORAGE; }
  function loadProgressFor(cid){
    try { return JSON.parse(localStorage.getItem(progKey(cid))) || { done: [], current: 1 }; }
    catch(e){ return { done: [], current: 1 }; }
  }
  function loadProgress(){ return loadProgressFor(course && course.id); }
  function saveProgress(p){ localStorage.setItem(progKey(course && course.id), JSON.stringify(p)); }
  function lessonsOf(c){ return (c && c.dataset && window[c.dataset]) ? window[c.dataset] : []; }

  function lang(){ return (window.kahLang && window.kahLang()) || 'kw'; }
  function T(o){ const l = lang(); return o[l] || o.kw || o.en; }

  // Section names live in the lesson data as Kreyòl strings; translate for display.
  const SEC_I18N = {
    'Fondasyon AI':          { fr:'Fondations IA',            en:'AI Foundations' },
    'Zouti & Premye Lajan':  { fr:'Outils & Premiers revenus', en:'Tools & First Income' },
    'Lajan ak AI':           { fr:"Gagner avec l'IA",          en:'Money with AI' },
    'Zouti Konkrè':          { fr:'Outils concrets',           en:'Concrete Tools' },
    'Dominasyon Mache':      { fr:'Domination du marché',      en:'Market Domination' },
    'Kòmanse ak ChatGPT':    { fr:'Démarrer avec ChatGPT',     en:'Getting Started with ChatGPT' },
    'Itilize ak Fè Lajan':   { fr:'Utiliser & Gagner',         en:'Use & Earn' },
    'Kòmanse ak Claude':     { fr:'Démarrer avec Claude',      en:'Getting Started with Claude' },
    'Pwofesyonèl ak Claude': { fr:'Professionnel avec Claude', en:'Professional with Claude' },
    'Baz Prompt':            { fr:'Bases du prompt',           en:'Prompt Basics' },
    'Prompt Avanse ak Lajan':{ fr:'Prompt avancé & Argent',    en:'Advanced Prompts & Money' }
  };
  function secLabel(s){ const l = lang(); if (l === 'kw') return s; const m = SEC_I18N[s]; return (m && m[l]) || s; }

  function isUnlocked(id, p){
    if (id === 1) return true;
    return p.done.includes(id-1);
  }

  function renderSidebar(p){
    const list = document.getElementById('lesson-list');
    // Reflect the open course in the sidebar header
    const head = document.querySelector('.lms-side .head .name');
    const sub = document.querySelector('.lms-side .head .sub');
    if (head && course) head.textContent = T(course.title);
    if (sub && course) sub.textContent = T(course.subtitle);
    // Group by section (works for any course)
    const order = [], groups = {};
    LESSONS.forEach(L => { const k = L.sec || '·'; if(!groups[k]){ groups[k]=[]; order.push(k); } groups[k].push(L); });
    list.innerHTML = '';
    order.forEach((sec, si) => {
      const block = document.createElement('div');
      block.className = 'week-block';
      block.innerHTML = `<div class="w-title"><span>${({kw:'Seksyon',fr:'Section',en:'Section'})[lang()]} ${si+1} · ${secLabel(sec)}</span><span class="accent">${groups[sec].length}</span></div>`;
      groups[sec].forEach(L => {
        const unlocked = isUnlocked(L.id, p);
        const done = p.done.includes(L.id);
        const active = p.current === L.id;
        const btn = document.createElement('button');
        btn.className = 'lesson-btn' + (!unlocked?' locked':'') + (done?' done':'') + (active?' active':'');
        btn.disabled = !unlocked;
        btn.innerHTML = `
          <span class="num">${done?'✓':L.id}</span>
          <span class="ico">${L.icon}</span>
          <span class="title">${T(L.title)}</span>`;
        btn.onclick = () => { if (unlocked) { p.current = L.id; saveProgress(p); view = 'lesson'; render(); window.scrollTo({top:0,behavior:'smooth'}); } };
        block.appendChild(btn);
      });
      list.appendChild(block);
    });

    // progress bar
    const total = LESSONS.length || 30;
    const n = p.done.length;
    document.getElementById('prog-count').textContent = n;
    document.getElementById('prog-pct').textContent = Math.round(n*100/total) + '%';
    document.getElementById('prog-bar').style.width = (n*100/total) + '%';
    const pc = document.querySelector('.prog-mini'); // "/N" denominator
    if (pc){ const denom = pc.querySelector('.denom'); if (denom) denom.textContent = '/'+total; }

    // Certificate
    const certBtn = document.getElementById('cert-btn');
    if (n >= total) {
      certBtn.classList.add('unlocked');
      certBtn.disabled = false;
      certBtn.onclick = () => openCert();
    } else {
      certBtn.classList.remove('unlocked');
      certBtn.disabled = true;
    }
  }

  function renderHome(p){
    const main = document.getElementById('lesson-main');
    const l = lang();
    const user = loadUser() || { name:'' };
    const total = LESSONS.length || 30;
    const n = p.done.length;
    const pct = Math.round(n*100/total);
    const cur = LESSONS.find(x => x.id === p.current) || LESSONS[0];
    const t = {
      back:  {kw:'← Kou yo',fr:'← Les cours',en:'← Courses'},
      done:  {kw:'fini',fr:'faits',en:'done'},
      heroT: {kw:'Pwogrè ou',fr:'Votre progression',en:'Your progress'},
      heroP: {kw: n>=total?'Ou fini tout leson yo! 🎉':(n===0?'Kòmanse premye leson ou jodi a.':'Ou konplete '+n+' sou '+total+' leson. Kontinye!'),
              fr: n>=total?'Vous avez terminé toutes les leçons ! 🎉':(n===0?'Commencez votre première leçon.':'Vous avez complété '+n+'/'+total+' leçons. Continuez !'),
              en: n>=total?'You finished all the lessons! 🎉':(n===0?'Start your first lesson today.':"You've completed "+n+' of '+total+' lessons. Keep going!')},
      cont:  {kw: n>=total?'Revize leson yo':(n===0?'Kòmanse Leson 1':'Kontinye'),fr: n>=total?'Revoir les leçons':(n===0?'Commencer Leçon 1':'Continuer'),en: n>=total?'Review lessons':(n===0?'Start Lesson 1':'Continue')},
      logout:{kw:'Dekonekte',fr:'Déconnexion',en:'Log out'},
      day:   {kw:'Leson',fr:'Leçon',en:'Lesson'},
      section:{kw:'Seksyon',fr:'Section',en:'Section'},
      cert:  {kw:'🏆 Sètifika ou pare — louvri li',fr:'🏆 Votre certificat est prêt — ouvrir',en:'🏆 Your certificate is ready — open it'}
    };
    const order=[], groups={};
    LESSONS.forEach(L=>{ if(!groups[L.sec]){ groups[L.sec]=[]; order.push(L.sec); } groups[L.sec].push(L); });
    // Microsoft-Learn-style per-section color themes (matches assets/ph/sec-N.svg)
    const THEMES = [
      {g1:'#4f7cff',g2:'#8a5bff'}, {g1:'#12b5a0',g2:'#34e08c'}, {g1:'#ffb028',g2:'#ff7a3d'},
      {g1:'#a14dff',g2:'#ff5bc0'}, {g1:'#ff5b6e',g2:'#ff9f43'}
    ];
    const stateOf = (L) => {
      if (p.done.includes(L.id)) return {cls:'done', txt:({kw:'✓ Fini',fr:'✓ Terminé',en:'✓ Done'})[l]};
      if (isUnlocked(L.id,p)) return p.current===L.id
        ? {cls:'active', txt:({kw:'▶ Kounye a',fr:'▶ En cours',en:'▶ Current'})[l]}
        : {cls:'',       txt:({kw:'Kòmanse',fr:'Commencer',en:'Start'})[l]};
      return {cls:'locked', txt:'🔒 '+({kw:'Vewouye',fr:'Verrouillé',en:'Locked'})[l]};
    };
    const secsHtml = order.map((sec,si)=>{
      const th = THEMES[si % THEMES.length];
      const cover = 'assets/ph/sec-'+((si%5)+1)+'.svg';
      const dn = groups[sec].filter(L=>p.done.includes(L.id)).length;
      const total = groups[sec].length;
      const spct = Math.round(dn*100/total);
      const days = groups[sec].map(L=>{
        const s = stateOf(L);
        return `<button class="day-card ${s.cls}" data-id="${L.id}" ${s.cls==='locked'?'disabled':''} style="--g1:${th.g1};--g2:${th.g2}">
            <span class="dc-cover" style="background-image:url('${cover}')">
              <span class="dc-badge">${L.icon}</span>
              <span class="dc-tag">${t.day[l]} ${L.id}</span>
              ${s.cls==='done'?'<span class="dc-check">✓</span>':''}
            </span>
            <span class="dc-body">
              <span class="dtitle">${T(L.title)}</span>
              <span class="dstate ${s.cls}">${s.txt}</span>
            </span>
          </button>`;
      }).join('');
      return `<div class="dash-sec" style="--g1:${th.g1};--g2:${th.g2}">
          <div class="sec-banner" style="background-image:linear-gradient(90deg, rgba(8,12,22,0.0), rgba(8,12,22,0.55)), url('${cover}')">
            <div class="sb-left">
              <div class="sb-eyebrow">${t.section[l]} ${si+1}</div>
              <div class="sb-title">${secLabel(sec)}</div>
            </div>
            <div class="sb-right">
              <div class="sb-count">${dn}/${total}</div>
              <div class="sb-bar"><div style="width:${spct}%"></div></div>
            </div>
          </div>
          <div class="day-grid">${days}</div>
        </div>`;
    }).join('');

    main.innerHTML = `
      <div class="dash">
        <div class="dash-top">
          <div>
            <button class="to-catalog" id="to-catalog">${t.back[l]}</button>
            <div class="dash-hi">${course?T(course.title):''}</div>
            <div class="dash-sub">${course?T(course.subtitle):''}</div>
          </div>
          <div class="dash-actions">
            <div class="lang-mini" role="group">
              <button data-lang="kw" onclick="kahSetLang('kw')">KW</button>
              <button data-lang="fr" onclick="kahSetLang('fr')">FR</button>
              <button data-lang="en" onclick="kahSetLang('en')">EN</button>
            </div>
            <button class="dash-logout" id="dash-logout">${t.logout[l]}</button>
          </div>
        </div>

        <div class="dash-hero">
          <div class="ring" style="--p:${pct}"><div class="ring-c"><span>${pct}%</span><small>${n}/${total} ${t.done[l]}</small></div></div>
          <div class="hero-info">
            <h3>${t.heroT[l]}</h3>
            <p>${t.heroP[l]}</p>
            <button class="hero-cta" id="hero-cont">▶ ${t.cont[l]}${(n>0&&n<30)?' — '+t.day[l]+' '+cur.id:''}</button>
          </div>
          <img class="hero-art" src="assets/ph/ai-hero-figure.svg" alt="" aria-hidden="true">
        </div>

        ${n>=total?`<button class="dash-cert" id="dash-cert">${t.cert[l]}</button>`:''}
        ${secsHtml}
      </div>`;

    main.querySelector('#hero-cont').onclick = () => { view='lesson'; render(); window.scrollTo({top:0,behavior:'smooth'}); };
    main.querySelectorAll('.day-card:not(.locked)').forEach(b=>{
      b.onclick = () => { const pp=loadProgress(); pp.current=parseInt(b.dataset.id,10); saveProgress(pp); view='lesson'; render(); window.scrollTo({top:0,behavior:'smooth'}); };
    });
    main.querySelector('#to-catalog').onclick = () => { view='catalog'; render(); window.scrollTo({top:0,behavior:'smooth'}); };
    main.querySelector('#dash-logout').onclick = () => {
      if(!confirm(({kw:'Dekonekte? Pwogrè ou ap rete sou aparèy sa a.',fr:'Se déconnecter ? Votre progression reste sur cet appareil.',en:'Log out? Your progress stays on this device.'})[l])) return;
      clearUser(); showGate();
    };
    const dc = main.querySelector('#dash-cert'); if (dc) dc.onclick = () => openCert();
    main.querySelectorAll('.lang-mini button').forEach(b=>b.classList.toggle('active', b.dataset.lang===l));
  }

  function renderLesson(p){
    const L = LESSONS.find(x => x.id === p.current) || LESSONS[0];
    const main = document.getElementById('lesson-main');
    const labels = {
      lesson:   { kw:'Leson',         fr:'Leçon',           en:'Lesson',         icon:'📘' },
      analogy:  { kw:'Analoji',       fr:'Analogie',        en:'Analogy',        icon:'💡' },
      example:  { kw:'Egzanp reyèl',  fr:'Exemple réel',    en:'Real example',   icon:'🌍' },
      money:    { kw:'Fè lajan',      fr:'Gagner',          en:'Make money',     icon:'💰' },
      quiz:     { kw:'Quiz',          fr:'Quiz',            en:'Quiz',           icon:'🎯' },
      devwa:    { kw:'Devwa Jodi a',  fr:'Mission du jour', en:"Today's mission", icon:'📝' },
    };
    const l = lang();
    const moneyList = (L.money[l]||L.money.kw).map(m=>`<li>${m}</li>`).join('');
    const q = L.quiz[l] || L.quiz.kw;
    const letters = ['A','B','C','D'];
    const optsHtml = q.a.map((opt,i)=>`<button class="quiz-opt" data-i="${i}"><span class="letter">${letters[i]}</span><span>${opt}</span></button>`).join('');
    const done = p.done.includes(L.id);
    const isLast = L.id === 30;

    main.innerHTML = `
      <div class="l-topbar">
        <button class="to-dash" id="to-dash">⌂ ${({kw:'Tablo',fr:'Tableau de bord',en:'Dashboard'})[l]}</button>
      </div>
      <div class="l-head">
        <div>
          <div class="crumb">${labels.lesson[l]} ${L.id} / ${LESSONS.length||30} · ${secLabel(L.sec)}</div>
          <h1>${L.icon} ${T(L.title)}</h1>
        </div>
        <div class="lang-mini" role="group">
          <button data-lang="kw" onclick="kahSetLang('kw')">KW</button>
          <button data-lang="fr" onclick="kahSetLang('fr')">FR</button>
          <button data-lang="en" onclick="kahSetLang('en')">EN</button>
        </div>
      </div>
      <div class="l-meta">
        <span>${labels.lesson[l]} ${L.id}</span>
        <span>${secLabel(L.sec)}</span>
        <span>${LESSONS.length} ${({kw:'leson',fr:'leçons',en:'lessons'})[l]}</span>
        <span>~6 min</span>
      </div>

      <div class="l-section lesson">
        <div class="s-head"><span class="s-icon">${labels.lesson.icon}</span><span class="s-title">${labels.lesson[l]}</span></div>
        <div class="s-body"><p>${T(L.lesson)}</p></div>
      </div>

      <div class="l-section analogy">
        <div class="s-head"><span class="s-icon">${labels.analogy.icon}</span><span class="s-title">${labels.analogy[l]}</span></div>
        <div class="s-body"><p>${T(L.analogy)}</p></div>
      </div>

      <div class="l-section example">
        <div class="s-head"><span class="s-icon">${labels.example.icon}</span><span class="s-title">${labels.example[l]}</span></div>
        <div class="s-body story"><p>${T(L.example)}</p></div>
      </div>

      <div class="l-section money">
        <div class="s-head"><span class="s-icon">${labels.money.icon}</span><span class="s-title">${labels.money[l]}</span></div>
        <div class="s-body">
          <ul>${moneyList}</ul>
        </div>
      </div>

      <div class="l-section quiz">
        <div class="s-head"><span class="s-icon">${labels.quiz.icon}</span><span class="s-title">${labels.quiz[l]}</span></div>
        <div class="quiz-q">${q.q}</div>
        <div class="quiz-opts" id="quiz-opts">${optsHtml}</div>
        <div class="quiz-feedback" id="quiz-feedback"></div>
      </div>

      ${(function(){
        var DV = (course && course.devwa && window[course.devwa]) ? window[course.devwa] : null;
        var D = (DV && DV[L.id]) ? (DV[L.id][l] || DV[L.id].kw) : null;
        if (!D || !D.length) return '';
        return `<div class="l-section devwa">
          <div class="s-head"><span class="s-icon">${labels.devwa.icon}</span><span class="s-title">${labels.devwa[l]}</span></div>
          <ol class="devwa-list">${D.map(function(step){ return '<li>'+step+'</li>'; }).join('')}</ol>
        </div>`;
      })()}

      <div class="complete-banner ${done?'show':''}" id="complete-banner">
        <span>✓</span>
        <span>${({kw:'Bravo! Leson sa konplete.',fr:'Bravo ! Leçon terminée.',en:'Done! Lesson complete.'})[l]}</span>
      </div>

      <div class="lesson-nav">
        <button class="btn btn-prev" id="btn-prev" ${L.id===1?'disabled':''}>← ${({kw:'Anvan',fr:'Précédent',en:'Previous'})[l]}</button>
        <button class="btn btn-next ${done?'active':''}" id="btn-next" ${(!done && !isLast)?'disabled':''}>
          ${isLast ? ({kw:'Wè sètifika 🏆',fr:'Voir certificat 🏆',en:'View certificate 🏆'})[l] : ({kw:'Pwochen leson →',fr:'Leçon suivante →',en:'Next lesson →'})[l]}
        </button>
      </div>
    `;

    // Wire quiz
    const opts = main.querySelectorAll('.quiz-opt');
    const fb = main.querySelector('#quiz-feedback');
    opts.forEach(b => {
      b.onclick = () => {
        const i = parseInt(b.dataset.i, 10);
        opts.forEach(x=>x.classList.remove('correct','wrong'));
        if (i === q.c) {
          b.classList.add('correct');
          fb.className = 'quiz-feedback show';
          fb.textContent = ({kw:'✓ Kòrèk! Repons ou bon. Pase nan leson sa a konplete.',fr:'✓ Correct ! Leçon validée.',en:'✓ Correct! Lesson marked complete.'})[l];
          // mark done
          if (!p.done.includes(L.id)) p.done.push(L.id);
          saveProgress(p);
          render(false);
        } else {
          b.classList.add('wrong');
          fb.className = 'quiz-feedback wrong show';
          fb.textContent = ({kw:'⚠ Pa kòrèk. Eseye ankò!',fr:'⚠ Pas correct. Réessayez !',en:'⚠ Not quite — try again!'})[l];
        }
      };
    });

    // Back to dashboard
    main.querySelector('#to-dash').onclick = () => { view = 'home'; render(); window.scrollTo({top:0,behavior:'smooth'}); };
    // Prev / Next
    main.querySelector('#btn-prev').onclick = () => { if (L.id>1){ p.current = L.id-1; saveProgress(p); render(); window.scrollTo({top:0,behavior:'smooth'}); } };
    main.querySelector('#btn-next').onclick = () => {
      if (isLast) { openCert(); return; }
      if (!p.done.includes(L.id)) return;
      p.current = L.id+1;
      saveProgress(p);
      render();
      window.scrollTo({top:0,behavior:'smooth'});
    };
    // Lang mini active state
    main.querySelectorAll('.lang-mini button').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === l);
    });
  }

  function openCert(){
    const modal = document.getElementById('cert-modal');
    modal.classList.add('show');
    // Date
    const d = new Date();
    const months = {kw:['Janvye','Fevriye','Mas','Avril','Me','Jen','Jiyè','Out','Sept','Okt','Nov','Des'],
                    fr:['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
                    en:['January','February','March','April','May','June','July','August','September','October','November','December']};
    const l = lang();
    document.getElementById('cert-date').textContent = `${d.getDate()} ${months[l][d.getMonth()]} ${d.getFullYear()}`;
    // Course-specific title + body (trilingual via data-* so language switching keeps it correct)
    const cTitle = course ? course.title : {kw:'30 Leson AI',fr:'30 Leçons IA',en:'30 AI Lessons'};
    const total = (LESSONS && LESSONS.length) || 30;
    const eye = document.getElementById('cert-eyebrow');
    if (eye){ ['kw','fr','en'].forEach(k=>eye.setAttribute('data-'+k, 'KreyòlAIHub Academy · '+(cTitle[k]||cTitle.kw))); eye.textContent = 'KreyòlAIHub Academy · '+(cTitle[l]||cTitle.kw); }
    const body = document.getElementById('cert-body');
    if (body){
      const txt = {
        kw:'a konplete tout '+total+' leson nan kou « '+(cTitle.kw)+' » an Kreyòl Ayisyen — ak konpetans pratik pou itilize AI epi fè lajan.',
        fr:'a complété les '+total+' leçons du cours « '+(cTitle.fr)+' » en créole haïtien — avec des compétences pratiques pour utiliser l\'IA et générer des revenus.',
        en:'has completed all '+total+' lessons of the “'+(cTitle.en)+'” course in Haitian Creole — with practical skills to use AI and earn income.'
      };
      ['kw','fr','en'].forEach(k=>body.setAttribute('data-'+k, txt[k]));
      body.textContent = txt[l];
    }
    // Name field
    const nameEl = document.getElementById('cert-name');
    const saved = localStorage.getItem(NAME_KEY);
    if (saved) nameEl.textContent = saved;
    nameEl.addEventListener('blur', () => localStorage.setItem(NAME_KEY, nameEl.textContent.trim()), {once:false});
    // WhatsApp share
    const text = encodeURIComponent('Mwen fin konplete kou « '+(cTitle.kw)+' » nan Kreyòl ak @KreyolAIHub 🇭🇹🏆 — kreyolaihub.com');
    document.getElementById('cert-share').href = `https://wa.me/?text=${text}`;
  }

  function openCourse(cid){
    const c = COURSES.find(x => x.id === cid);
    if (!c || c.status !== 'active') return;
    course = c;
    LESSONS = lessonsOf(c);
    view = 'home';
    render();
    window.scrollTo({top:0, behavior:'smooth'});
  }

  function render(){
    document.body.classList.toggle('view-catalog', view === 'catalog');
    document.body.classList.toggle('view-home', view === 'home');
    if (view === 'catalog'){ renderCatalog(); return; }
    const p = loadProgress();
    renderSidebar(p);
    if (view === 'home') renderHome(p); else renderLesson(p);
  }

  // ---- Course catalog (platform home) ----
  function renderCatalog(){
    const main = document.getElementById('lesson-main');
    const l = lang();
    const user = loadUser() || { name:'' };
    const t = {
      hi:    {kw:'Byenvini',fr:'Bienvenue',en:'Welcome'},
      title: {kw:'Platfòm Kou KreyòlAIHub',fr:'Plateforme de cours KreyòlAIHub',en:'KreyòlAIHub Course Platform'},
      sub:   {kw:'Chwazi yon kou pou kòmanse aprann.',fr:'Choisissez un cours pour commencer.',en:'Pick a course to start learning.'},
      logout:{kw:'Dekonekte',fr:'Déconnexion',en:'Log out'},
      lessons:{kw:'leson',fr:'leçons',en:'lessons'},
      start: {kw:'Kòmanse',fr:'Commencer',en:'Start'},
      cont:  {kw:'Kontinye',fr:'Continuer',en:'Continue'},
      soon:  {kw:'Talè konsa',fr:'Bientôt',en:'Coming soon'},
      done:  {kw:'fini',fr:'faits',en:'done'}
    };
    // group courses by category, preserving category declaration order
    const order = Object.keys(CATS);
    const seen = {}; COURSES.forEach(c=>{ if(order.indexOf(c.category)<0 && !seen[c.category]){ order.push(c.category); seen[c.category]=1; } });
    const cardFor = (c) => {
      const active = c.status === 'active';
      const p = active ? loadProgressFor(c.id) : {done:[]};
      const n = p.done.length, total = c.lessons || (lessonsOf(c).length) || 0;
      const pct = total ? Math.round(n*100/total) : 0;
      const a = c.accent || ['#4f7cff','#8a5bff'];
      const cta = !active ? t.soon[l] : (n>0 ? t.cont[l] : t.start[l]);
      return `<button class="course-card ${active?'':'soon'}" data-course="${c.id}" ${active?'':'disabled'} style="--g1:${a[0]};--g2:${a[1]}">
          <span class="cc-cover" style="background-image:url('${c.cover}')">
            ${active?'':`<span class="cc-soon">${t.soon[l]}</span>`}
            <span class="cc-lessons">${total} ${t.lessons[l]}</span>
          </span>
          <span class="cc-body">
            <span class="cc-title">${T(c.title)}</span>
            <span class="cc-sub">${T(c.subtitle)}</span>
            ${active ? `<span class="cc-prog"><span class="cc-bar"><span style="width:${pct}%"></span></span><span class="cc-pct">${n}/${total} ${t.done[l]}</span></span>` : ''}
            <span class="cc-cta ${active?'':'soon'}">${active?'▶ ':''}${cta}</span>
          </span>
        </button>`;
    };
    const catsHtml = order.map(cat=>{
      const list = COURSES.filter(c=>c.category===cat);
      if(!list.length) return '';
      const label = CATS[cat] ? T(CATS[cat]) : cat;
      return `<div class="cat-block">
          <h4 class="cat-title">${label}<span class="cat-count">${list.length}</span></h4>
          <div class="course-grid">${list.map(cardFor).join('')}</div>
        </div>`;
    }).join('');

    main.innerHTML = `
      <div class="dash catalog">
        <div class="dash-top">
          <div class="plat-brand">
            <img class="plat-logo" src="assets/logo-mark.webp" alt="KreyòlAIHub" width="48" height="48">
            <div>
              <div class="dash-hi">${t.hi[l]}, ${esc(user.name)||'👋'} 👋</div>
              <div class="dash-sub">${t.title[l]} — ${t.sub[l]}</div>
            </div>
          </div>
          <div class="dash-actions">
            <div class="lang-mini" role="group">
              <button data-lang="kw" onclick="kahSetLang('kw')">KW</button>
              <button data-lang="fr" onclick="kahSetLang('fr')">FR</button>
              <button data-lang="en" onclick="kahSetLang('en')">EN</button>
            </div>
            <button class="dash-logout" id="dash-logout">${t.logout[l]}</button>
          </div>
        </div>
        ${catsHtml}
      </div>`;

    main.querySelectorAll('.course-card:not(.soon)').forEach(b=>{
      b.onclick = () => openCourse(b.dataset.course);
    });
    main.querySelector('#dash-logout').onclick = () => {
      if(!confirm(({kw:'Dekonekte? Pwogrè ou ap rete sou aparèy sa a.',fr:'Se déconnecter ? Votre progression reste sur cet appareil.',en:'Log out? Your progress stays on this device.'})[l])) return;
      clearUser(); showGate();
    };
    main.querySelectorAll('.lang-mini button').forEach(b=>b.classList.toggle('active', b.dataset.lang===l));
  }

  // ---- Login gate (name + email, stored on device) ----
  function gateMsg(which){
    const l = lang();
    const m = {
      name:  {kw:'Tanpri antre non ou.',fr:'Veuillez entrer votre nom.',en:'Please enter your name.'},
      email: {kw:'Antre yon imèl valab.',fr:'Entrez un e-mail valide.',en:'Enter a valid email.'}
    };
    return m[which][l] || m[which].kw;
  }
  function setGatePlaceholders(){
    const l = lang();
    ['gate-name','gate-email'].forEach(id=>{
      const el = document.getElementById(id);
      if (el) el.placeholder = el.getAttribute('data-ph-'+l) || el.getAttribute('data-ph-kw') || '';
    });
  }
  function showGate(){
    const gate = document.getElementById('kah-gate');
    gate.classList.add('show');
    document.body.classList.add('gated');
    setGatePlaceholders();
    const form = document.getElementById('gate-form');
    form.onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('gate-name').value.trim();
      const email = document.getElementById('gate-email').value.trim();
      const err = document.getElementById('gate-err');
      if (name.length < 2){ err.textContent = gateMsg('name'); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ err.textContent = gateMsg('email'); return; }
      err.textContent = '';
      saveUser({ name, email, ts: Date.now() });
      localStorage.setItem(NAME_KEY, name);
      // Count this learner once per device (feeds the live community counter)
      try {
        if (!localStorage.getItem('kah_enrolled_v1')) {
          fetch('https://abacus.jasoncameron.dev/hit/kreyolaihub/learners', { cache:'no-store' }).catch(function(){});
          localStorage.setItem('kah_enrolled_v1', '1');
        }
      } catch(e){}
      // Save the signup (name + email) to Formspree for the newsletter list.
      try {
        var FS = (window.KAH_CONFIG && window.KAH_CONFIG.FORMSPREE_URL) || '';
        var sentKey = 'kah_signup_sent_' + email;
        if (FS && !localStorage.getItem(sentKey)) {
          fetch(FS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ name: name, email: email, source: 'KreyòlAIHub Academy', _subject: 'Nouvo enskripsyon Akademi' })
          }).then(function(){ localStorage.setItem(sentKey, '1'); }).catch(function(){});
        }
      } catch(e){}
      gate.classList.remove('show');
      document.body.classList.remove('gated');
      view = 'catalog';
      render();
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!COURSES.length) {
      document.getElementById('lesson-main').innerHTML = '<p>Courses could not load. Please refresh.</p>';
      return;
    }
    if (!loadUser()) showGate();
    else { view = 'catalog'; render(); }

    // Keep everything in sync with the KW/FR/EN toggle.
    document.addEventListener('langchange', () => {
      if (document.getElementById('kah-gate').classList.contains('show')) setGatePlaceholders();
      if (loadUser()) render();
    });
  });
})();
