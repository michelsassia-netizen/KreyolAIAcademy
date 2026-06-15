// KreyòlAIHub site-wide welcome assistant — a friendly guide that greets every
// visitor and answers questions about the platform (real AI via the worker).
(function(){
  if (window.__kahAssistant) return; window.__kahAssistant = true;

  function lang(){ return (window.kahLang && window.kahLang()) || 'kw'; }
  function cfg(k,d){ return (window.KAH_CONFIG && window.KAH_CONFIG[k]) || d; }
  var WORKER = cfg('WORKER_URL', 'https://kreyolaihub2.kreyolaihub.workers.dev');
  var MODEL  = cfg('MODEL', 'claude-haiku-4-5-20251001');
  var LOGO   = 'assets/logo-mark.webp';   // brand logo shown in the chatbot

  var SYSTEM =
    "Ou se Asistan KreyòlAIHub — yon gid cho, zanmitay e itil ki akeyi vizitè sou sitwèb KreyòlAIHub. " +
    "Misyon ou: fè moun santi yo byen resevwa epi ede yo konprann sa platfòm nan ofri ak kijan pou yo kòmanse. " +
    "Reponn KOUT (1 a 3 fraz), nan MENM lang vizitè a itilize (Kreyòl Ayisyen pa defo; Franse oswa Angle si yo ekri konsa). Mete ti emoji 🇭🇹.\n\n" +
    "SA KREYÒLAIHUB YE: yon platfòm pou aprann Entèlijans Atifisyèl (AI) an Kreyòl Ayisyen — premye nan kalite l. Tout bagay gratis pou kòmanse.\n" +
    "AKADEMI (paj 'Akademi' / academy.html): 4 kou gratis ak sètifika —\n" +
    "  1) 30 Leson AI (fondasyon AI + chemen pou fè lajan),\n" +
    "  2) Apran Itilize ChatGPT,\n" +
    "  3) Apran Itilize Claude,\n" +
    "  4) Apran Ekri Bon Prompt.\n" +
    "  Chak kou gen leson, quiz, ak yon sètifika ofisyèl. Ou konekte ak non + imèl epi ou kòmanse.\n" +
    "ZOUTI AI (paj 'Zouti' / tools.html, ak paj Grann): \n" +
    "  • Grann AI — yon granmè Ayisyen ki bay sajès, pwovèb, istwa Krik-Krak (paj grann.html).\n" +
    "  • Lekòl AI — èd ak devwa, eksplikasyon an Kreyòl.\n" +
    "  • AI Playground sou paj dakèy la — eseye AI dirèkteman (tradui, ekri imèl, rezime).\n" +
    "KOMINOTE (paj 'Kominote' / community.html): rantre nan Discord oswa gwoup WhatsApp pou aprann ak lòt Ayisyen.\n" +
    "KONSILTASYON (paj 'Konsiltasyon' / consulting.html): fòmasyon ak sèvis AI pou biznis ak òganizasyon.\n\n" +
    "KIJAN POU KÒMANSE: di yo klike sou 'Akademi' anwo a (oswa bouton 'Kòmanse Gratis'), kreye yon kont gratis, epi chwazi yon kou. " +
    "Toujou dirije moun nan bay bon paj la. Pa envante bagay ki pa la; si ou pa konnen, di yo kontakte kreyolaihub@gmail.com. " +
    "Rete pozitif, ankourajan, e fyè pou Ayiti.";

  var T = {
    title:  { kw:'Asistan KreyòlAIHub', fr:'Assistant KreyòlAIHub', en:'KreyòlAIHub Assistant' },
    sub:    { kw:'An liy · reponn an Kreyòl', fr:'En ligne · répond en créole', en:'Online · replies in Kreyòl' },
    greet:  { kw:'Bonjou! 👋 Mwen se asistan KreyòlAIHub. Mande m nenpòt bagay sou Akademi an, zouti AI yo, oswa kijan pou kòmanse — tout bagay gratis! 🇭🇹',
              fr:"Bonjour ! 👋 Je suis l'assistant KreyòlAIHub. Demandez-moi tout sur l'Académie, les outils IA, ou comment commencer — c'est gratuit ! 🇭🇹",
              en:"Hello! 👋 I'm the KreyòlAIHub assistant. Ask me anything about the Academy, the AI tools, or how to get started — it's free! 🇭🇹" },
    ph:     { kw:'Ekri yon kesyon…', fr:'Posez une question…', en:'Ask a question…' },
    teaser: { kw:'Bezwen èd? Mande m! 👋', fr:"Besoin d'aide ? 👋", en:'Need help? Ask me! 👋' },
    send:   { kw:'Voye', fr:'Envoyer', en:'Send' },
    err:    { kw:'⚠️ Pa ka konekte kounye a. Eseye ankò nan yon ti moman.', fr:'⚠️ Connexion impossible. Réessayez bientôt.', en:'⚠️ Can\'t connect right now. Please try again soon.' },
    chips:  { kw:['Kijan pou m kòmanse?','Ki kou ki genyen?','Èske li gratis?'],
              fr:['Comment commencer ?','Quels cours ?','C\'est gratuit ?'],
              en:['How do I start?','What courses?','Is it free?'] }
  };
  function t(o){ return o[lang()] || o.kw; }

  // ---- styles ----
  var css =
    '.kah-as-launch{position:fixed;bottom:22px;right:22px;z-index:80;display:flex;align-items:center;gap:10px;cursor:pointer;' +
    'background:linear-gradient(135deg,#ffc62e,#d8870f);color:#0b1322;border:0;border-radius:999px;padding:12px 18px 12px 14px;' +
    'font-family:Poppins,system-ui,sans-serif;font-weight:800;font-size:14px;box-shadow:0 14px 40px rgba(255,198,46,.45);transition:transform .15s;}' +
    '.kah-as-launch:hover{transform:translateY(-2px);}' +
    '.kah-as-launch .ic{width:30px;height:30px;border-radius:50%;background:#0b1322;color:#ffc62e;display:grid;place-items:center;font-size:16px;}' +
    '.kah-as-teaser{position:fixed;bottom:78px;right:22px;z-index:80;max-width:230px;background:#0b1322;color:#eaf1fd;border:1px solid rgba(208,224,255,.14);' +
    'border-radius:14px 14px 4px 14px;padding:12px 14px;font:500 13.5px/1.5 "Noto Sans",system-ui,sans-serif;box-shadow:0 16px 40px rgba(0,0,0,.45);' +
    'opacity:0;transform:translateY(8px);transition:.25s;pointer-events:none;}' +
    '.kah-as-teaser.show{opacity:1;transform:none;pointer-events:auto;cursor:pointer;}' +
    '.kah-as-panel{position:fixed;bottom:22px;right:22px;z-index:90;width:min(380px,calc(100vw - 32px));height:min(560px,calc(100vh - 110px));' +
    'background:#070b15;border:1px solid rgba(208,224,255,.14);border-radius:20px;box-shadow:0 30px 80px rgba(0,0,0,.6);display:none;flex-direction:column;overflow:hidden;}' +
    '.kah-as-panel.open{display:flex;}' +
    '.kah-as-head{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid rgba(208,224,255,.1);background:linear-gradient(135deg,rgba(255,198,46,.12),transparent);}' +
    '.kah-as-head .av{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#ffc62e,#d8870f);display:grid;place-items:center;font-size:20px;}' +
    '.kah-as-head .nm{font-family:Poppins,sans-serif;font-weight:800;font-size:15px;color:#eaf1fd;}' +
    '.kah-as-head .st{font-size:11.5px;color:rgba(234,241,253,.5);display:flex;align-items:center;gap:6px;}' +
    '.kah-as-head .dot{width:7px;height:7px;border-radius:50%;background:#2fd98a;box-shadow:0 0 8px #2fd98a;}' +
    '.kah-as-head .x{margin-left:auto;background:none;border:0;color:rgba(234,241,253,.5);font-size:20px;cursor:pointer;line-height:1;}' +
    '.kah-as-body{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:12px;}' +
    '.kah-as-msg{display:flex;gap:8px;align-items:flex-start;max-width:90%;}' +
    '.kah-as-msg.u{align-self:flex-end;flex-direction:row-reverse;}' +
    '.kah-as-msg .b{padding:10px 13px;border-radius:14px;font:400 14px/1.55 "Noto Sans",system-ui,sans-serif;}' +
    '.kah-as-msg.a .b{background:rgba(208,224,255,.06);border:1px solid rgba(208,224,255,.1);color:#eaf1fd;border-bottom-left-radius:4px;}' +
    '.kah-as-msg.u .b{background:#ffc62e;color:#0b1322;font-weight:500;border-bottom-right-radius:4px;}' +
    '.kah-as-av{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:14px;flex-shrink:0;background:rgba(255,198,46,.18);}' +
    '.kah-as-chips{display:flex;flex-wrap:wrap;gap:7px;padding:0 18px 8px;}' +
    '.kah-as-chips button{background:rgba(208,224,255,.06);border:1px solid rgba(208,224,255,.12);color:#cfe;border-radius:999px;padding:7px 12px;font:600 12px Poppins,sans-serif;cursor:pointer;color:rgba(234,241,253,.8);}' +
    '.kah-as-chips button:hover{background:#ffc62e;color:#0b1322;border-color:#ffc62e;}' +
    '.kah-as-foot{display:flex;gap:8px;padding:12px;border-top:1px solid rgba(208,224,255,.1);background:#0b1322;}' +
    '.kah-as-foot input{flex:1;background:rgba(208,224,255,.06);border:1px solid rgba(208,224,255,.12);border-radius:999px;padding:11px 16px;color:#eaf1fd;font:400 14px "Noto Sans",sans-serif;outline:none;}' +
    '.kah-as-foot input:focus{border-color:#ffc62e;}' +
    '.kah-as-foot button{background:#ffc62e;color:#0b1322;border:0;border-radius:999px;padding:0 18px;font:800 13px Poppins,sans-serif;cursor:pointer;}' +
    '.kah-as-typing .b{display:inline-flex;gap:4px;}.kah-as-typing .d{width:6px;height:6px;border-radius:50%;background:#ffc62e;animation:kahdot 1.2s infinite;}' +
    '.kah-as-typing .d:nth-child(2){animation-delay:.15s;}.kah-as-typing .d:nth-child(3){animation-delay:.3s;}' +
    '@keyframes kahdot{0%,60%,100%{opacity:.4;transform:translateY(0);}30%{opacity:1;transform:translateY(-4px);}}' +
    '.kah-as-launch .ic img,.kah-as-head .av img,.kah-as-av img{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;}' +
    '.kah-as-launch .ic,.kah-as-head .av,.kah-as-av{overflow:hidden;padding:0;}' +
    '/* keep WhatsApp float clear of the assistant */ .wa-float{left:22px;right:auto !important;}' +
    '@media(max-width:520px){.kah-as-launch span{display:none;}.kah-as-launch{padding:14px;}}';

  function el(html){ var d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstChild; }

  function init(){
    var style=document.createElement('style'); style.textContent=css; document.head.appendChild(style);

    var launch=el('<button class="kah-as-launch" aria-label="'+t(T.title)+'"><span class="ic"><img src="'+LOGO+'" alt=""></span><span>'+t(T.title).split(' ')[0]+'</span></button>');
    var teaser=el('<div class="kah-as-teaser">'+t(T.teaser)+'</div>');
    var panel=el(
      '<div class="kah-as-panel" role="dialog" aria-label="'+t(T.title)+'">'+
        '<div class="kah-as-head"><span class="av"><img src="'+LOGO+'" alt=""></span><div><div class="nm">'+t(T.title)+'</div>'+
          '<div class="st"><span class="dot"></span>'+t(T.sub)+'</div></div><button class="x" aria-label="Close">✕</button></div>'+
        '<div class="kah-as-body"></div>'+
        '<div class="kah-as-chips"></div>'+
        '<form class="kah-as-foot"><input type="text" placeholder="'+t(T.ph)+'" autocomplete="off"><button type="submit">'+t(T.send)+'</button></form>'+
      '</div>');
    document.body.appendChild(launch); document.body.appendChild(teaser); document.body.appendChild(panel);

    var body=panel.querySelector('.kah-as-body');
    var chipsWrap=panel.querySelector('.kah-as-chips');
    var form=panel.querySelector('.kah-as-foot');
    var input=form.querySelector('input');
    var history=[];
    var greeted=false;

    function add(role,text,opts){
      opts=opts||{};
      var m=el('<div class="kah-as-msg '+(role==='u'?'u':'a')+(opts.typing?' kah-as-typing':'')+'"></div>');
      var av=el('<span class="kah-as-av">'+(role==='u'?'🧑🏾':'<img src="'+LOGO+'" alt="">')+'</span>');
      var b=document.createElement('div'); b.className='b';
      if(opts.typing){ b.innerHTML='<span class="d"></span><span class="d"></span><span class="d"></span>'; }
      else { b.textContent=text; }
      m.appendChild(av); m.appendChild(b); body.appendChild(m); body.scrollTop=body.scrollHeight; return m;
    }
    function renderChips(){
      chipsWrap.innerHTML='';
      t(T.chips).forEach(function(q){ var btn=el('<button>'+q+'</button>'); btn.onclick=function(){ sendMsg(q); }; chipsWrap.appendChild(btn); });
    }
    function open(){
      panel.classList.add('open'); teaser.classList.remove('show'); launch.style.display='none';
      if(!greeted){ greeted=true; add('a', t(T.greet)); renderChips(); }
      setTimeout(function(){ input.focus(); },50);
    }
    function close(){ panel.classList.remove('open'); launch.style.display=''; }

    function langName(){ var l=lang(); return l==='fr' ? 'French (français)' : (l==='en' ? 'English' : 'Haitian Creole (Kreyòl Ayisyen)'); }

    async function sendMsg(text){
      if(!text || !text.trim()) return;
      add('u',text); history.push({role:'user',content:text});
      input.value=''; chipsWrap.innerHTML='';
      var typing=add('a','',{typing:true});
      var reply='';
      // Match the page language: the site is showing KW / FR / EN — reply in that language.
      var sys = "IMPORTANT: The website is currently displayed in " + langName() +
        ". Greet and reply in " + langName() + " unless the visitor clearly writes in another language.\n\n" + SYSTEM;
      try{
        var res=await fetch(WORKER,{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({model:MODEL,max_tokens:500,system:sys,messages:history})});
        if(!res.ok) throw new Error('w'+res.status);
        var data=await res.json();
        if(Array.isArray(data.content)) reply=data.content.map(function(c){return c.text||'';}).join('').trim();
        else if(data.error) reply='⚠️ '+(data.error.message||'');
        if(!reply) reply=t(T.err);
      }catch(e){ reply=t(T.err); }
      typing.remove(); add('a',reply); history.push({role:'assistant',content:reply});
    }

    launch.onclick=open; teaser.onclick=open;
    panel.querySelector('.x').onclick=close;
    form.addEventListener('submit',function(e){ e.preventDefault(); sendMsg(input.value); });

    // auto teaser once per browser session
    try{
      if(!sessionStorage.getItem('kah_as_seen')){
        setTimeout(function(){ if(!panel.classList.contains('open')){ teaser.textContent=t(T.teaser); teaser.classList.add('show'); } }, 2200);
        setTimeout(function(){ teaser.classList.remove('show'); }, 12000);
        sessionStorage.setItem('kah_as_seen','1');
      }
    }catch(e){}

    document.addEventListener('langchange',function(){
      panel.querySelector('.nm').textContent=t(T.title);
      panel.querySelector('.st').lastChild.textContent=t(T.sub);
      input.placeholder=t(T.ph);
      form.querySelector('button').textContent=t(T.send);
      if(panel.classList.contains('open')&&greeted) renderChips();
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
