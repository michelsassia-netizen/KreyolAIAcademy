// Course catalog for the KreyòlAIHub platform.
// Add a new course by appending an object here. Set status:'active' and point
// `dataset` at a global lessons array (like KAH_LESSONS) once its content is ready.
window.KAH_CATEGORIES = {
  ai:          { kw:'Entèlijans Atifisyèl', fr:'Intelligence Artificielle', en:'Artificial Intelligence' },
  zouti:       { kw:'Zouti AI & Prompt',    fr:'Outils IA & Prompt',         en:'AI Tools & Prompting' },
  biznis:      { kw:'Biznis & Lajan',       fr:'Business & Argent',          en:'Business & Money' },
  kreyativite: { kw:'Kreyativite Dijital',  fr:'Créativité Numérique',       en:'Digital Creativity' }
};

window.KAH_COURSES = [
  {
    id: 'ai-fondasyon',
    category: 'ai',
    title:    { kw:'30 Leson AI',            fr:'30 Leçons IA',            en:'30 AI Lessons' },
    subtitle: { kw:'Fondasyon AI an Kreyòl Ayisyen', fr:"Fondations de l'IA en créole haïtien", en:'AI foundations in Haitian Creole' },
    lessons:  30,
    cover:    'assets/ph/sec-1.svg',
    accent:   ['#4f7cff', '#8a5bff'],
    dataset:  'KAH_LESSONS',   // global array this course teaches
    devwa:    'KAH_DEVWA',     // optional per-lesson action tasks
    status:   'active'
  },
  {
    id: 'chatgpt',
    category: 'zouti',
    title:    { kw:'Apran Itilize ChatGPT', fr:'Apprendre à utiliser ChatGPT', en:'Learn to Use ChatGPT' },
    subtitle: { kw:'Soti zewo rive pwo ak ChatGPT', fr:'De zéro à pro avec ChatGPT', en:'From zero to pro with ChatGPT' },
    lessons:  6,
    cover:    'assets/ph/sec-2.svg',
    accent:   ['#10a37f', '#34e08c'],
    dataset:  'KAH_CHATGPT',
    status:   'active'
  },
  {
    id: 'claude',
    category: 'zouti',
    title:    { kw:'Apran Itilize Claude', fr:'Apprendre à utiliser Claude', en:'Learn to Use Claude' },
    subtitle: { kw:'Metrize Claude pou ekri ak analize', fr:'Maîtriser Claude pour écrire et analyser', en:'Master Claude for writing & analysis' },
    lessons:  6,
    cover:    'assets/ph/sec-5.svg',
    accent:   ['#d97757', '#ff9f43'],
    dataset:  'KAH_CLAUDE',
    status:   'active'
  },
  {
    id: 'prompt',
    category: 'zouti',
    title:    { kw:'Apran Ekri Bon Prompt', fr:'Apprendre à écrire de bons prompts', en:'Learn to Write Good Prompts' },
    subtitle: { kw:'Konpetans #1 pou metrize nenpòt AI', fr:'La compétence n°1 pour maîtriser toute IA', en:'The #1 skill to master any AI' },
    lessons:  6,
    cover:    'assets/ph/sec-4.svg',
    accent:   ['#a14dff', '#ff5bc0'],
    dataset:  'KAH_PROMPT',
    status:   'active'
  },
  {
    id: 'biznis-dijital',
    category: 'biznis',
    title:    { kw:'Biznis Dijital ak AI',   fr:'Business Numérique avec IA', en:'Digital Business with AI' },
    subtitle: { kw:'Lanse ak grandi yon biznis online', fr:'Lancez et développez un business en ligne', en:'Launch and grow an online business' },
    lessons:  20,
    cover:    'assets/ph/sec-3.svg',
    accent:   ['#ffb028', '#ff7a3d'],
    dataset:  null,
    status:   'soon'
  },
  {
    id: 'kontni-ai',
    category: 'kreyativite',
    title:    { kw:'Kreye Kontni ak AI',     fr:'Créer du Contenu avec IA',  en:'Create Content with AI' },
    subtitle: { kw:'Imaj, videyo, vwa ak mizik AI', fr:'Image, vidéo, voix et musique IA', en:'AI image, video, voice & music' },
    lessons:  15,
    cover:    'assets/ph/sec-4.svg',
    accent:   ['#a14dff', '#ff5bc0'],
    dataset:  null,
    status:   'soon'
  },
  {
    id: 'freelance-mondyal',
    category: 'biznis',
    title:    { kw:'Freelance Mondyal',      fr:'Freelance Mondial',        en:'Global Freelancing' },
    subtitle: { kw:'Jwenn kliyan entènasyonal ak AI', fr:'Trouvez des clients internationaux avec IA', en:'Find international clients with AI' },
    lessons:  18,
    cover:    'assets/ph/sec-2.svg',
    accent:   ['#12b5a0', '#34e08c'],
    dataset:  null,
    status:   'soon'
  }
];
