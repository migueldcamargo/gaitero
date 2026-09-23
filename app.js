/* =====================================================================
   GAITERO MATH — Interface, progresso e gamificação
   Depende de: logic.js, formulas.js, questions.js, variations.js
   ===================================================================== */
(function () {
  'use strict';
  const L = window.GM_LOGIC, BANK = window.GM_BANK, FORM = window.GM_FORMULAS;
  const fmt = L.fmt;
  const STORE_KEY = 'gaiteroMath';
  // Imagens: versões leves geradas por ferramentas/gerar-icones.ps1; os originais ficam de reserva.
  const SPLASH_SRC = 'assets/splash.jpg';
  const SPLASH_PNG = 'assets/splash_educativo_gaitero_math.png';
  const AVATAR_SRCS = ['assets/avatar.jpg', 'assets/gustavo-avatar.png'];

  // XP por item certo, uma única vez. Com ou sem dica/resolução vale o mesmo (pedido do usuário:
  // ajuda não pode desanimar). Variações valem menos (são treino).
  const XP = { orig: 10, var: 5 };
  const reduceMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const pad = n => String(n).padStart(2, '0');
  const plural = (n, one, many) => (n === 1 ? one : many);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  /* ============ Progresso salvo (localStorage) ============ */
  function blank() {
    return {
      v: 2, items: {}, xp: 0, streak: 0, best: 0, days: [], today: { date: '', ids: [] },
      drafts: {}, ver: {}, lastItem: {}, sound: true, created: Date.now()
    };
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) { const o = JSON.parse(raw); if (o && o.v === 2) return Object.assign(blank(), o); }
    } catch (e) { /* sem armazenamento: segue com progresso em memória */ }
    return blank();
  }
  let S = load();
  let saveTimer = 0;
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* ignora */ } }
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 200); }
  window.addEventListener('pagehide', save);

  /* ============ Datas e indicadores ============ */
  function dayStr(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function markStudy(id) {
    const t = dayStr();
    if (S.today.date !== t) S.today = { date: t, ids: [] };
    if (S.today.ids.indexOf(id) < 0) S.today.ids.push(id);
    if (S.days.indexOf(t) < 0) S.days.push(t);
  }
  function studiedToday() { return S.today.date === dayStr() ? S.today.ids.length : 0; }
  function dayStreak() {
    const set = new Set(S.days), d = new Date();
    if (!set.has(dayStr(d))) { d.setDate(d.getDate() - 1); if (!set.has(dayStr(d))) return 0; }
    let n = 0;
    while (set.has(dayStr(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  // Taxa de acerto: 1ª tentativa certa ÷ itens tentados (não conta quem já tinha visto a resolução).
  function accuracy() {
    let total = 0, ok = 0;
    Object.keys(S.items).forEach(id => {
      const r = S.items[id];
      if (r.first && r.firstHelp !== 'solution') { total++; if (r.first === 'correct') ok++; }
    });
    return { total, ok, rate: total ? ok / total : 0 };
  }

  /* ============ Banco de questões ============ */
  const examById = id => BANK.exams.filter(e => e.id === id)[0];
  const qid = (exam, q) => exam.id + '-q' + q.n;
  const iid = (exam, q, ver, item) => exam.id + '.q' + q.n + '.' + ver + '.' + item.key;
  function version(q, verId) {
    if (verId && verId !== 'orig') {
      const v = (q.variations || []).filter(x => x.id === verId)[0];
      if (v) return v;
    }
    return { id: 'orig', prompt: q.prompt, figure: q.figure, table: q.table, note: q.note, items: q.items };
  }
  const peek = id => S.items[id] || null;
  function rec(id) {
    if (!S.items[id]) S.items[id] = { attempts: 0, errors: 0, first: null, firstHelp: null, hint: 0, sol: 0, done: false, outcome: null, xp: 0, last: null, lastWrong: false, at: null, reviews: 0 };
    return S.items[id];
  }
  const helpLevel = r => (r.sol > 0 ? 'solution' : r.hint > 0 ? 'hint' : 'none');

  function registerCheck(id, status, answer, isVar) {
    const r = rec(id);
    if (r.done) { r.reviews++; r.last = answer; saveSoon(); return { review: true }; }
    markStudy(id);
    r.attempts++;
    r.last = answer;
    const help = helpLevel(r);
    if (r.first === null) { r.first = status === 'correct' ? 'correct' : 'wrong'; r.firstHelp = help; }
    let gained = 0, streakUp = false;
    if (status === 'correct') {
      r.done = true; r.at = Date.now(); r.lastWrong = false;
      r.outcome = help === 'solution' ? 'solution' : help === 'hint' ? 'hint' : (r.errors === 0 ? 'solo1' : 'solo');
      gained = XP[isVar ? 'var' : 'orig'];
      r.xp = gained; S.xp += gained;
      S.streak++; streakUp = true; if (S.streak > S.best) S.best = S.streak;
    } else {
      r.errors++; r.lastWrong = true; S.streak = 0;
    }
    save();
    return { gained, streakUp, outcome: r.outcome };
  }
  function registerHelp(id, kind) {
    const r = rec(id);
    if (r.done) return;
    if (kind === 'hint') r.hint++; else r.sol++;
    markStudy(id);
    save();
  }

  // Só três estados: não feita, em andamento e feita (acertou). Não importa se usou dica ou resolução.
  function qStatus(exam, q) {
    const recs = q.items.map(it => peek(iid(exam, q, 'orig', it)));
    if (recs.every(r => r && r.done)) return { key: 'correct' };
    if (recs.some(r => r && (r.attempts || r.hint || r.sol || r.done))) return { key: 'progress' };
    return { key: 'new' };
  }
  const ST = {
    new: { icon: '', label: 'Não feita' },
    progress: { icon: '◐', label: 'Em andamento' },
    correct: { icon: '✓', label: 'Feita' }
  };
  function examProgress(exam) {
    let doneQ = 0, doneItems = 0, totalItems = 0, touched = false;
    exam.questions.forEach(q => {
      let d = 0;
      q.items.forEach(it => {
        const r = peek(iid(exam, q, 'orig', it));
        totalItems++;
        if (r && r.done) { d++; doneItems++; }
        if (r && (r.attempts || r.hint || r.sol)) touched = true;
      });
      if (d === q.items.length) doneQ++;
    });
    return { doneQ, doneItems, totalItems, touched };
  }
  // Nota estimada: cada questão vale 1 ponto, dividido igualmente entre seus itens.
  function estimate(exam) {
    let grade = 0, evaluated = 0;
    exam.questions.forEach(q => {
      let s = 0, touched = false;
      q.items.forEach(it => {
        const r = peek(iid(exam, q, 'orig', it));
        if (r && r.first !== null) touched = true;
        if (r && r.done) s += 1;
      });
      grade += s / q.items.length;
      if (touched) evaluated++;
    });
    return { grade, evaluated };
  }

  /* ============ Avatar e arte de abertura ============ */
  const ART = { splash: null, avatar: null };   // caminho da imagem que carregou (ou null)
  function probe(src) {
    return new Promise(res => {
      const im = new Image();
      im.onload = () => res(im.naturalWidth > 0 ? im : null);
      im.onerror = () => res(null);
      im.src = src;
    });
  }
  const PLACEHOLDER = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="32" fill="#58CC02"/><text x="32" y="44" text-anchor="middle" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="34" fill="#fff">G</text><text x="13" y="20" font-size="11" font-weight="800" fill="#FFE27A" font-family="Nunito, sans-serif">+</text><text x="46" y="22" font-size="10" font-weight="800" fill="#D7FFB8" font-family="Nunito, sans-serif">×</text></svg>';
  function avatarHTML(size) {
    const cls = 'avatar avatar-' + (size || 'md');
    if (ART.avatar) return '<span class="' + cls + '"><img src="' + ART.avatar + '" alt="Gaitero"></span>';
    // sem avatar: recorte do rosto na arte de abertura (posição no CSS .avatar-art)
    if (ART.splash) return '<span class="' + cls + ' avatar-art" role="img" aria-label="Gaitero" style="background-image:url(\'' + ART.splash + '\')"></span>';
    return '<span class="' + cls + ' avatar-ph" role="img" aria-label="Gaitero">' + PLACEHOLDER + '</span>';
  }
  function paintAvatars() { $$('[data-avatar]').forEach(el => { el.innerHTML = avatarHTML(el.dataset.avatar); }); }

  /* ============ Rotas ============ */
  let current = (location.hash || '').replace(/^#/, '');
  let returnTo = null;       // questão para onde voltar depois do Papel de Cola
  let colaFocus = null;      // regra para destacar no Papel de Cola
  let hintOpenId = null;     // dica aberta (continua aberta ao voltar do Papel de Cola)
  let simBack = false;       // questão aberta pelo "Tentar fazer novamente" do simulado: o ← volta para o resultado
  function route() {
    const h = current, m1 = /^(p[12])-q(\d+)$/.exec(h), m2 = /^cola(?:-(\w+))?$/.exec(h);
    if (h === 'p1' || h === 'p2') return { name: 'exam', exam: h };
    if (h === 'simulado') return { name: 'sim' };
    if (h === 'simulado-q') return { name: 'simq' };
    if (h === 'simulado-fim') return { name: 'simend' };
    if (m1) return { name: 'question', exam: m1[1], n: +m1[2] };
    if (m2) return { name: 'cola', block: m2[1] || null };
    return { name: 'home' };
  }
  function go(hash) {
    hash = hash || '';
    if (hash === current) { render(); return; }
    current = hash;
    try { if (location.hash.replace(/^#/, '') !== hash) location.hash = hash; } catch (e) { /* sem hash: segue só em memória */ }
    render();
  }
  window.addEventListener('hashchange', () => {
    const h = (location.hash || '').replace(/^#/, '');
    if (h !== current) { current = h; render(); }
  });

  const view = () => $('#view');
  function render() {
    const r = route();
    document.body.classList.toggle('immersive', r.name === 'question' || r.name === 'simq');
    if (r.name !== 'question') simBack = false;
    $$('#mainnav [data-nav]').forEach(a => {
      const on = (r.name === 'home' && a.dataset.nav === 'home') || (a.dataset.nav === r.exam && r.name === 'exam') || (r.name === 'cola' && a.dataset.nav === 'cola');
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    if (r.name !== 'cola') { returnTo = r.name === 'question' ? returnTo : null; }
    if (r.name === 'home') renderHome();
    else if (r.name === 'exam') renderExam(r.exam);
    else if (r.name === 'cola') renderCola(r.block);
    else if (r.name === 'sim') renderSimSetup();
    else if (r.name === 'simq') renderSimQuestion();
    else if (r.name === 'simend') renderSimEnd();
    else renderQuestion(r.exam, r.n);
    updateTop();
    paintAvatars();
    if (r.name !== 'cola' || !r.block) window.scrollTo(0, 0);
  }
  function updateTop() {
    $$('.js-streak').forEach(el => { el.textContent = S.streak; });
    $$('.js-days').forEach(el => { el.textContent = dayStreak(); });
  }

  /* ============ Início (minimalista: três botões grandes) ============ */
  function stat(icon, value, label) {
    return '<div class="stat" role="listitem"><span aria-hidden="true">' + icon + '</span><b>' + value + '</b><span>' + label + '</span></div>';
  }
  function examTile(exam) {
    const p = examProgress(exam);
    return '<a class="tile tile-' + exam.id + '" href="#' + exam.id + '" data-go="' + exam.id + '" aria-label="' + exam.name + ': ' + p.doneQ + ' de 10 questões concluídas">' +
      '<span class="tile-big" aria-hidden="true">' + exam.title + '</span>' +
      '<span class="tile-prog" aria-hidden="true"><i style="width:' + (p.doneItems / p.totalItems * 100).toFixed(1) + '%"></i></span>' +
      '<span class="tile-sub" aria-hidden="true">' + p.doneQ + '/10</span></a>';
  }
  function colaTile() {
    return '<a class="tile tile-cola" href="#cola" data-go="cola" aria-label="Papel de Cola: fórmulas e macetes">' +
      '<span class="tile-big" aria-hidden="true">📄</span>' +
      '<span class="tile-sub" aria-hidden="true">Cola</span></a>';
  }
  function simTile() {
    const last = S.sim && S.sim.done ? simGrade(S.sim) : null;
    return '<a class="tile tile-sim" href="#simulado" data-go="simulado" aria-label="Simulado: 5 questões sorteadas' + (last != null ? ', última nota ' + last : '') + '">' +
      '<span class="tile-sim-ico" aria-hidden="true">📝</span>' +
      '<span class="tile-sim-txt" aria-hidden="true"><b>Simulado</b><span>' + (S.sim && !S.sim.done ? 'Continuar: questão ' + (S.sim.i + 1) + ' de ' + SIM_N : last != null ? 'Última nota: ' + last : '5 questões sorteadas') + '</span></span></a>';
  }
  function gradeCell(exam) {
    const e = estimate(exam), txt = L.brNum(Math.round(e.grade * 10) / 10, 1);
    return '<div class="gcell gcell-' + exam.id + '" aria-label="' + exam.title + ': nota estimada ' + (e.evaluated ? txt : 'ainda sem dados') + ', ' + e.evaluated + ' de 10 questões feitas">' +
      '<span class="exam-badge" aria-hidden="true">' + exam.title + '</span>' +
      '<b aria-hidden="true">' + (e.evaluated ? txt : '—') + '</b>' +
      '<span class="gcell-cov" aria-hidden="true">' + e.evaluated + '/10 feitas</span></div>';
  }
  const HOW_HTML = '<ul class="how-list">' +
    '<li>É só uma estimativa para orientar o estudo — <b>não é a nota oficial</b>.</li>' +
    '<li>Cada questão vale 1 ponto (10 questões = nota 10). Questões com itens a, b, c… dividem o ponto igualmente.</li>' +
    '<li>Item certo vale o item inteiro, com ou sem 💡 dica ou ❔ resolução. Pedir ajuda faz parte de aprender!</li>' +
    '<li>Item não respondido ou ainda errado vale zero: as questões que faltam contam zero até você responder.</li>' +
    '<li>Só as questões originais das provas contam. As 🔀 variações são treino extra.</li></ul>';
  function renderHome() {
    const today = studiedToday(), acc = accuracy();
    view().innerHTML =
      '<section class="home">' +
      '<div class="hello"><span data-avatar="md"></span><div class="hello-text"><h1>Fala, Gaitero! 🚀</h1><p>Bora aprender hoje?</p></div></div>' +
      '<div class="stats" role="list">' +
      stat('📚', today, 'hoje') +
      stat('🎯', acc.total ? Math.round(acc.rate * 100) + '%' : '—', 'acerto') +
      stat('⭐', S.xp, 'XP') +
      '</div>' +
      '<nav class="tiles" aria-label="Estudar">' + BANK.exams.map(examTile).join('') + colaTile() + simTile() + '</nav>' +
      '<section class="grade" aria-labelledby="grade-title">' +
      '<div class="grade-head"><h2 id="grade-title">Nota estimada</h2>' +
      '<button class="info-btn" data-act="how" aria-label="Como a nota estimada é calculada">?</button></div>' +
      '<div class="grade-row">' + BANK.exams.map(gradeCell).join('') + '</div>' +
      '</section>' +
      '</section>';
  }

  /* ============ Prova (seleção de questões) ============ */
  // Começo do enunciado, como está no PDF, só as primeiras palavras (letra maior, menos texto).
  // "Calcule:" sozinho diz pouco, então junta o 1º item.
  const QSTART_WORDS = 6;
  function qStart(q) {
    let s = q.prompt;
    const plain = s.replace(/<[^>]+>|\[\[|\]\]/g, '');
    if (plain.length < 20 && q.items[0] && q.items[0].prompt) return fmt(s + ' ' + (q.items[0].label ? q.items[0].label + ' ' : '') + q.items[0].prompt + ' …');
    // conta palavras sem partir uma conta [[...]] no meio
    const toks = s.split(/\s+/), out = [];
    let depth = 0, words = 0;
    for (const t of toks) {
      out.push(t);
      depth += (t.split('[[').length - 1) - (t.split(']]').length - 1);
      if (depth <= 0 && ++words >= QSTART_WORDS) break;
    }
    if (out.length === toks.length) return fmt(s);
    return fmt(out.join(' ').replace(/[,.:;]$/, '') + '…');
  }
  function renderExam(id) {
    const exam = examById(id), p = examProgress(exam);
    const cards = exam.questions.map(q => {
      const st = qStatus(exam, q);
      return '<a class="qcard st-' + st.key + '" href="#' + qid(exam, q) + '" data-go="' + qid(exam, q) + '" aria-label="Questão ' + q.n + ' (' + q.skill + '): ' + ST[st.key].label + '">' +
        '<span class="qc-side" aria-hidden="true"><span class="qc-num">' + pad(q.n) + (ST[st.key].icon ? '<span class="qc-icon">' + ST[st.key].icon + '</span>' : '') + '</span></span>' +
        '<span class="qc-text" aria-hidden="true">' + qStart(q) + '</span>' +
        '</a>';
    }).join('');
    view().innerHTML =
      '<section class="exam exam-' + exam.id + '">' +
      '<div class="exam-head"><div class="eh-top"><span class="exam-badge big">' + exam.title + '</span>' +
      '<div class="eh-text"><h1>' + exam.name + '</h1><p class="exam-meta">' + exam.meta + '</p></div></div>' +
      '<div class="exam-prog"><span class="bar" aria-hidden="true"><i style="width:' + (p.doneItems / p.totalItems * 100).toFixed(1) + '%"></i></span>' +
      '<span>' + p.doneQ + ' de 10 questões</span></div></div>' +
      '<h2 class="sr-only">Escolha uma questão</h2>' +
      '<div class="qcards">' + cards + '</div>' +
      '</section>';
  }

  /* ============ Simulado ============ */
  // 5 questões sorteadas (de preferência variações), sem dica e sem resolução. Só no fim ele vê o que
  // acertou e a nota (0 a 10). Tocar num número abre a resolução; "Tentar fazer novamente" traz outra
  // variação da mesma questão, no modo treino. Questão com itens (a, b, c…): sorteia um item só.
  const SIM_N = 5;
  const SIM_SCOPES = { p1: 'P1', p2: 'P2', both: 'P1 + P2' };
  const simGrade = sim => Math.round(sim.ok.filter(Boolean).length / SIM_N * 100) / 10;
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function simEntry(sim, i) {
    const s = sim.list[i], exam = examById(s.exam), q = exam.questions[s.n - 1], ver = version(q, s.ver);
    return { s, exam, q, ver, idx: Math.max(0, ver.items.findIndex(it => it.key === s.key)) };
  }
  function startSim(scope) {
    const pool = [];
    (scope === 'both' ? BANK.exams : [examById(scope)]).forEach(e => e.questions.forEach(q => pool.push({ e, q })));
    const list = shuffle(pool).slice(0, SIM_N).map(({ e, q }) => {
      const vars = q.variations || [], ver = vars.length ? pick(vars).id : 'orig';
      return { exam: e.id, n: q.n, ver, key: pick(version(q, ver).items).key };
    });
    Object.keys(S.drafts).forEach(k => { if (k.indexOf('sim.') === 0) delete S.drafts[k]; });
    S.sim = { scope, list, i: 0, ans: [], ok: [], done: false, at: Date.now() };
    save();
    go('simulado-q');
  }
  function renderSimSetup() {
    const sim = S.sim, going = sim && !sim.done, lastG = sim && sim.done ? simGrade(sim) : null;
    view().innerHTML = '<section class="sim-setup">' +
      '<h1><span aria-hidden="true">📝</span> Simulado</h1>' +
      '<p class="sim-lead">' + SIM_N + ' questões sorteadas, <b>sem dica e sem resolução</b>. Só no final você descobre o que acertou e a sua nota.</p>' +
      (going ? '<button class="btn btn-primary btn-block" data-act="sim-continue">CONTINUAR SIMULADO (' + (sim.i + 1) + '/' + SIM_N + ')</button>' : '') +
      '<h2 class="sim-h2">' + (going ? 'Ou comece outro. ' : '') + 'Sortear questões de qual prova?</h2>' +
      '<div class="sim-scopes">' + Object.keys(SIM_SCOPES).map(k => '<button class="sim-scope sim-' + k + '" data-act="sim-start" data-scope="' + k + '">' + SIM_SCOPES[k] + '</button>').join('') + '</div>' +
      (lastG != null ? '<button class="link-btn sim-last" data-go="simulado-fim">Ver o último resultado (nota ' + L.brNum(lastG) + ')</button>' : '') +
      '</section>';
  }
  function renderSimQuestion() {
    const sim = S.sim;
    if (!sim || sim.done) { go(sim && sim.done ? 'simulado-fim' : 'simulado'); return; }
    const E = simEntry(sim, sim.i);
    QS = { exam: E.exam, q: E.q, key: qid(E.exam, E.q), ver: E.ver, idx: E.idx, sim: true, feedback: null, sel: null, multi: null, solStep: 0 };
    const item = curItem(), id = curId(), lastQ = sim.i === SIM_N - 1;
    view().innerHTML = '<section class="qscreen sim-q">' +
      '<header class="qhead">' +
      '<a class="icon-btn" href="#simulado" data-go="simulado" aria-label="Sair do simulado (dá para continuar depois)">✕</a>' +
      '<div class="qhead-mid"><div class="qhead-title">Simulado · ' + SIM_SCOPES[sim.scope] + '</div>' +
      '<div class="bar bar-sm" role="progressbar" aria-label="Progresso do simulado" aria-valuemin="0" aria-valuemax="' + SIM_N + '" aria-valuenow="' + sim.i + '"><i style="width:' + (sim.i / SIM_N * 100) + '%"></i></div></div>' +
      '<span class="chip sim-count" aria-label="Questão ' + (sim.i + 1) + ' de ' + SIM_N + '"><b>' + (sim.i + 1) + '</b>/' + SIM_N + '</span>' +
      '</header>' +
      '<div class="qbody">' +
      '<article class="statement">' +
      '<div class="st-top"><div class="st-skill">Questão ' + (sim.i + 1) + ' de ' + SIM_N + (lastQ ? ' · <b>a última!</b>' : '') + '</div></div>' +
      '<p class="st-prompt">' + fmt(E.ver.prompt) + '</p>' +
      (E.ver.table ? tableHTML(E.ver.table) : '') +
      (E.ver.figure ? '<div class="st-fig">' + E.ver.figure + '</div>' : '') +
      (E.ver.note ? '<p class="st-note">' + E.ver.note + '</p>' : '') +
      (item.prompt ? '<div class="st-item"><span class="st-expr">' + fmt(item.prompt) + '</span></div>' : '') +
      '</article>' +
      '<div class="answer" id="answer">' + fieldsHTML(item, id) + '</div>' +
      '<div class="msg" id="msg" role="status" aria-live="polite"></div>' +
      '</div>' +
      '<footer class="qfoot" id="qfoot"><button class="btn btn-primary btn-block" data-act="sim-next">' + (lastQ ? 'FINALIZAR SIMULADO' : 'PRÓXIMA QUESTÃO →') + '</button></footer>' +
      '</section>';
    const a = item.answer, d = draftOf(id);
    QS.sel = a.type === 'choice' ? d : null;
    QS.multi = a.type === 'multiSelect' ? new Set(d || []) : null;
    updatePreview();
  }
  // Guarda a resposta sem dizer se está certa: o resultado só aparece no fim.
  function simNext() {
    const sim = S.sim;
    if (!sim || sim.done || !QS || !QS.sim) return;
    const item = curItem(), ans = collect(), res = L.validate(item, ans);
    if (res.status === 'empty' || res.status === 'invalid') {
      showMsg(res.status === 'empty' ? 'Responda antes de ir para a próxima 😉' : fmt(res.message), res.status === 'empty' ? 'info' : 'warn');
      const f = $('#answer .field'); if (f && res.status === 'empty' && !f.value) f.focus();
      return;
    }
    S.drafts[curId()] = ans;
    markStudy(curId());
    sim.ans[sim.i] = ans;
    sim.ok[sim.i] = res.status === 'correct';
    sim.i++;
    if (sim.i >= SIM_N) {
      sim.done = true; save();
      go('simulado-fim');
      if (simGrade(sim) >= 8) { beep('ok'); confetti(); }
      return;
    }
    save();
    renderSimQuestion();
    window.scrollTo(0, 0);
  }
  function renderSimEnd() {
    const sim = S.sim;
    if (!sim || !sim.done) { go('simulado'); return; }
    const n = sim.ok.filter(Boolean).length, gt = L.brNum(simGrade(sim));
    view().innerHTML = '<section class="sim-end">' +
      '<p class="sim-if">Se a prova fosse hoje, você tiraria</p>' +
      '<div class="sim-grade ' + (simGrade(sim) >= 6 ? 'g-ok' : 'g-low') + '">' + gt + '</div>' +
      '<p class="sim-why">Você acertou <b>' + n + ' de ' + SIM_N + '</b> questões, então sua nota seria <b>' + gt + '</b>.</p>' +
      '<div class="sim-dots">' + sim.list.map((s, i) => '<button class="sim-dot ' + (sim.ok[i] ? 'ok' : 'bad') + '" data-act="sim-open" data-i="' + i + '" aria-label="Questão ' + (i + 1) + ': ' + (sim.ok[i] ? 'acertou' : 'errou') + '. Ver a resolução">' + (i + 1) + '</button>').join('') + '</div>' +
      '<p class="sim-tap">Toque num número para ver a resolução.</p>' +
      '<div class="sim-actions"><button class="btn btn-primary btn-block" data-go="simulado">FAZER OUTRO SIMULADO</button>' +
      '<button class="btn btn-ghost btn-block" data-go="">VOLTAR AO INÍCIO</button></div>' +
      '</section>';
  }
  // Resposta que ele deu, em texto (para o quadro da resolução).
  function ansText(item, ans) {
    const a = item.answer;
    if (ans == null || ans === '') return '—';
    if (a.type === 'choice') { const k = a.options.findIndex(o => o.id === ans); return k < 0 ? '—' : 'alternativa ' + 'ABCDEF'[k] + (a.layout === 'figs' ? '' : ': ' + fmt(a.options[k].html)); }
    if (a.type === 'multiSelect') { const opts = a.options.filter(o => ans.indexOf(o.id) >= 0); return opts.length ? opts.map(o => o.html).join(' + ') : '—'; }
    if (Array.isArray(ans)) return ans.map(v => L.esc(String(v))).join(' · ');
    return L.esc(String(ans));
  }
  function simOpen(i) {
    const sim = S.sim, E = simEntry(sim, i), item = E.ver.items[E.idx], ok = sim.ok[i];
    QS = { exam: E.exam, q: E.q, key: qid(E.exam, E.q), ver: E.ver, idx: E.idx, sim: true, simI: i, feedback: null, sel: null, multi: null, solStep: 0 };
    const banner = '<div class="sim-banner ' + (ok ? 'ok' : 'bad') + '">' + (ok ? '✓ Você acertou! Sua resposta: ' : '✗ Sua resposta: ') + '<b>' + ansText(item, sim.ans[i]) + '</b>' +
      (ok ? '' : '<br>Resposta certa: <b>' + fmt(item.final) + '</b>') +
      '<button class="link-btn sim-retry-link" data-act="sim-retry">🔀 Tentar fazer novamente</button></div>';
    openSolution({ where: 'Simulado · Questão ' + (i + 1) + ' (' + E.exam.title + ' · Questão ' + E.q.n + ')', banner });
  }
  // Outra variação da mesma questão (nunca a que caiu no simulado), no modo treino.
  function simRetry() {
    const s = S.sim.list[QS.simI], exam = examById(s.exam), q = exam.questions[s.n - 1], key = qid(exam, q);
    const others = (q.variations || []).filter(v => v.id !== s.ver);
    const next = others.length ? pick(others).id : 'orig';
    S.ver[key] = next;
    S.lastItem[key + '.' + next] = s.key;
    save();
    closeSheets();
    simBack = true;
    go(key);
    toast('🔀 Uma variação nova dessa questão. Agora com 💡 dica e ❔ resolução!');
  }

  /* ============ Papel de Cola ============ */
  function relChip(ref) {
    const parts = ref.split('-');
    return '<a class="rel-chip" href="#' + parts[0] + '-q' + parts[1] + '" data-go="' + parts[0] + '-q' + parts[1] + '">' + parts[0].toUpperCase() + ' · Questão ' + parts[1] + '</a>';
  }
  function renderCola(blockId) {
    const blocks = FORM.blocks.map(b =>
      '<section class="cola-block tone-' + b.color + '" id="cola-' + b.id + '" tabindex="-1" aria-labelledby="h-' + b.id + '">' +
      '<h2 id="h-' + b.id + '"><span class="cola-ico" aria-hidden="true">' + b.icon + '</span>' + b.title + '</h2>' +
      '<div class="rules">' + b.rules.map(r =>
        '<div class="rule" id="rule-' + r.id + '"><div class="rule-name">' + r.name + '</div>' +
        '<div class="rule-formula">' + fmt(r.formula) + '</div>' +
        (r.note ? '<p class="rule-note">' + fmt(r.note) + '</p>' : '') +
        (r.fig ? '<div class="rule-fig">' + r.fig + '</div>' : '') +
        (r.example ? '<details class="rule-ex"><summary>Ver exemplo</summary><div>' + fmt(r.example) + '</div></details>' : '') +
        '</div>').join('') + '</div>' +
      '<p class="macete"><span class="macete-arrow" aria-hidden="true">➜</span> <b>Macete:</b> ' + fmt(b.tip) + '</p>' +
      '<div class="related"><span>Usado em:</span>' + b.related.map(relChip).join('') + '</div>' +
      '</section>').join('');
    view().innerHTML =
      '<section class="cola">' +
      '<div class="cola-paper">' +
      '<header class="cola-head"><h1>📄 Papel de Cola do Gaitero</h1><p class="cola-lead">Esqueceu uma fórmula? Tá tudo aqui!</p>' +
      '<p class="cola-sub">Todas as fórmulas que você precisa para mandar bem nas duas provas.</p></header>' +
      '<nav class="cola-index" aria-label="Assuntos">' + FORM.blocks.map(b => '<button class="cola-chip tone-' + b.color + '" data-act="cola-jump" data-block="' + b.id + '">' + b.label + '</button>').join('') + '</nav>' +
      blocks + '</div>' +
      (returnTo ? '<button class="return-fab" data-act="return"><span aria-hidden="true">↩</span> Voltar ao exercício</button>' : '') +
      '</section>';
    if (blockId) {
      const target = (colaFocus && $('#rule-' + colaFocus)) || $('#cola-' + blockId);
      if (target) {
        requestAnimationFrame(() => {
          target.scrollIntoView({ block: 'start', behavior: 'auto' });
          target.classList.add('flash');
          setTimeout(() => target.classList.remove('flash'), 1800);
        });
      }
      colaFocus = null;
    }
  }

  /* ============ Questão ============ */
  let QS = null;
  const curItem = () => QS.ver.items[QS.idx];
  // No simulado as respostas ficam separadas do treino (prefixo "sim."): nada vem preenchido.
  const curId = () => (QS.sim ? 'sim.' : '') + iid(QS.exam, QS.q, QS.ver.id, curItem());

  function renderQuestion(examId, n) {
    const exam = examById(examId), q = exam && exam.questions[n - 1];
    if (!q) { go(examId || ''); return; }
    const key = qid(exam, q), verId = S.ver[key] || 'orig', ver = version(q, verId);
    const lastKey = S.lastItem[key + '.' + ver.id];
    let idx = ver.items.findIndex(it => it.key === lastKey);
    if (idx < 0) { idx = ver.items.findIndex(it => !(peek(iid(exam, q, ver.id, it)) || {}).done); if (idx < 0) idx = 0; }
    QS = { exam, q, key, ver, idx, feedback: null, sel: null, multi: null, solStep: 0 };
    paintQuestion();
  }

  function draftOf(id) {
    if (S.drafts[id] !== undefined) return S.drafts[id];
    const r = peek(id);
    return r && r.last != null ? r.last : null;
  }
  // Tabela comprida vira duas lado a lado, para caber na tela sem rolar.
  function tableHTML(t) {
    const one = rows => '<table class="st-table"><thead><tr>' + t.head.map(h => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' +
      rows.map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
    if (t.rows.length <= 5) return '<div class="st-table-wrap">' + one(t.rows) + '</div>';
    const half = Math.ceil(t.rows.length / 2);
    return '<div class="st-table-wrap st-table-split">' + one(t.rows.slice(0, half)) + one(t.rows.slice(half)) + '</div>';
  }
  function input(id, value, a, label, extra) {
    return '<input id="' + id + '" class="field" type="text" inputmode="decimal" enterkeyhint="done" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"' +
      ' aria-label="' + (label || 'Sua resposta') + '" placeholder="' + (a.placeholder || '') + '" value="' + L.esc(value == null ? '' : value) + '"' + (extra || '') + '>';
  }
  const KEYS = {
    polynomial: [['x', 'x'], ['x²', 'x²'], ['x³', 'x³'], ['^', '^'], ['+', '+'], ['−', '-'], ['(', '('], [')', ')']],
    radical: [['√', '√'], ['(', '('], [')', ')'], ['+', '+'], ['−', '-']]
  };
  function fieldsHTML(item, id) {
    const a = item.answer, d = draftOf(id);
    const pm = f => '<button type="button" class="pm" data-act="pm" data-for="' + f + '" aria-label="Trocar o sinal (mais ou menos)">±</button>';
    switch (a.type) {
      case 'integer': case 'number': case 'percent': case 'currency':
        return '<label class="sr-only" for="f0">Sua resposta</label>' +
          '<div class="field-row">' + (a.prefix ? '<span class="affix">' + a.prefix + '</span>' : '') + input('f0', d, a) +
          (a.suffix ? '<span class="affix">' + a.suffix + '</span>' : '') + (a.neg ? pm('f0') : '') + '</div>' +
          (a.help ? '<p class="field-help">' + fmt(a.help) + '</p>' : '');
      case 'numberList':
        return '<div class="field-label">Sua resposta' + (a.ordered ? '' : ' <span class="field-label-note">(em qualquer ordem)</span>') + '</div><div class="multi-fields">' + a.values.map((_, i) =>
          '<div class="mf"><label class="mf-label" for="f' + i + '">' + fmt(a.labels[i]) + '</label><div class="field-row">' +
          input('f' + i, d && d[i], a, a.labels[i].replace(/\[\[|\]\]|_/g, '')) + (a.neg ? pm('f' + i) : '') + '</div></div>').join('') + '</div>';
      case 'textList':
        return '<label class="sr-only" for="f0">Sua resposta</label><div class="field-row">' + input('f0', d, a) + '</div>' +
          (a.help ? '<p class="field-help">' + fmt(a.help) + '</p>' : '');
      case 'polynomial': case 'radical':
        return '<label class="sr-only" for="f0">Sua resposta</label><div class="field-row">' +
          input('f0', d, { placeholder: a.type === 'radical' ? 'Ex.: √7 − √5' : 'Ex.: 3x² − 2x' }, 'Sua resposta', ' data-expr="1" inputmode="text"') + '</div>' +
          '<div class="keypad" role="group" aria-label="Símbolos matemáticos">' + KEYS[a.type].map(k => '<button type="button" class="key" data-act="key" data-ins="' + k[1] + '" aria-label="Inserir ' + k[0] + '">' + k[0] + '</button>').join('') +
          '<button type="button" class="key key-del" data-act="key" data-del="1" aria-label="Apagar">⌫</button></div>' +
          '<p class="preview" id="preview" aria-live="polite" data-help="' + (a.type === 'radical' ? 'Resposta &lt;b&gt;exata&lt;/b&gt;, com √ (sem arredondar).' : 'Escreva já &lt;b&gt;simplificado&lt;/b&gt;. Potência: ^ ou ² ³.') + '"></p>';
      case 'choice': {
        const sel = d;
        const letters = 'ABCDEF';
        return '<div class="field-label" id="ch-l">Escolha uma opção</div><div class="choices ' + (a.layout === 'figs' ? 'choices-figs' : 'choices-2') + '" role="radiogroup" aria-labelledby="ch-l">' +
          a.options.map((o, i) => '<button type="button" class="choice' + (sel === o.id ? ' on' : '') + '" role="radio" aria-checked="' + (sel === o.id) + '" data-act="choose" data-id="' + o.id + '">' +
            '<span class="choice-letter">' + letters[i] + '</span><span class="choice-body">' + fmt(o.html) + '</span></button>').join('') + '</div>';
      }
      case 'multiSelect': {
        const set = new Set(d || []);
        return '<div class="field-label" id="ms-l">Marque tudo o que vale para o número</div><div class="checks" role="group" aria-labelledby="ms-l">' +
          a.options.map(o => '<button type="button" class="check' + (set.has(o.id) ? ' on' : '') + '" role="checkbox" aria-checked="' + set.has(o.id) + '" data-act="toggle" data-id="' + o.id + '">' +
            '<span class="check-box" aria-hidden="true"></span><span>' + o.html + '</span></button>').join('') + '</div>';
      }
    }
    return '';
  }
  function collect() {
    const a = curItem().answer, root = $('#answer');
    if (a.type === 'numberList') return $$('input.field', root).map(i => i.value);
    if (a.type === 'choice') return QS.sel;
    if (a.type === 'multiSelect') return QS.multi ? Array.from(QS.multi) : [];
    const f = $('#f0', root);
    return f ? f.value : '';
  }
  function persistDraft() { S.drafts[curId()] = collect(); saveSoon(); }
  function updatePreview() {
    const p = $('#preview'), f = $('#f0');
    if (!p || !f) return;
    const v = f.value.trim();
    if (!v) { p.innerHTML = '<span class="muted">' + (p.dataset.help || '') + '</span>'; return; }
    const html = L.previewExpr(v);
    p.innerHTML = html ? 'Entendi assim: ' + html : '<span class="muted">Ainda não consegui ler a expressão…</span>';
  }

  function verChip() {
    const v = QS.ver, n = QS.q.variations ? QS.q.variations.length : 0;
    if (v.id === 'orig') return '<span class="ver-chip" title="Questão original da prova">📝 Original</span>';
    const i = QS.q.variations.findIndex(x => x.id === v.id) + 1;
    return '<span class="ver-chip ver-var" title="Variação para treino: não muda a nota estimada">🔀 Variação ' + i + '/' + n + '</span><button class="link-btn link-sm" data-act="orig">↺ Original</button>';
  }
  function itemTab(it, i) {
    const r = peek(iid(QS.exam, QS.q, QS.ver.id, it));
    const st = r && r.done ? 'done' : r && r.lastWrong ? 'wrong' : r && (r.attempts || r.hint || r.sol) ? 'prog' : 'new';
    const icon = { done: '✓', wrong: '✗', prog: '◐', new: '' }[st];
    const lab = { done: 'concluído', wrong: 'errado, tente de novo', prog: 'em andamento', new: 'não iniciado' }[st];
    return '<button class="itab it-' + st + (i === QS.idx ? ' on' : '') + '" role="tab" aria-selected="' + (i === QS.idx) + '" data-act="item" data-i="' + i + '" aria-label="Item ' + it.key + ': ' + lab + '">' +
      it.key + (icon ? '<span aria-hidden="true">' + icon + '</span>' : '') + '</button>';
  }
  function reviewBanner(r) {
    return '<div class="banner banner-ok"><span aria-hidden="true">✓</span> Já acertou' + (r.xp ? ' (+' + r.xp + ' XP)' : '') + '. Refazer é treino: não vale XP.</div>';
  }
  function hintPanel(item) {
    const rules = item.hint.rules.map(id => FORM.rules[id]).filter(Boolean);
    return '<div class="hint-panel" id="hint-panel" role="region" aria-label="Dica do Gaitero" tabindex="-1">' +
      '<div class="hint-title">💡 Dica do Gaitero</div>' +
      rules.map(r => '<div class="hint-rule"><div class="hint-rule-name">' + r.name + '</div><div class="hint-formula">' + fmt(r.formula) + '</div></div>').join('') +
      '<p class="hint-tip">' + fmt(item.hint.tip) + '</p>' +
      '<p class="hint-go">Agora tente montar a conta! 💪</p>' +
      '<div class="hint-actions"><button class="btn btn-yellow" data-act="hint-close">ENTENDI!</button>' +
      '<button class="link-btn" data-act="to-cola" data-block="' + rules[0].block + '" data-rule="' + rules[0].id + '">📄 Ver no Papel de Cola</button></div></div>';
  }
  function examItemsProgress() {
    const p = examProgress(QS.exam);
    return p.doneItems / p.totalItems;
  }
  function paintQuestion() {
    const { exam, q, ver } = QS, item = curItem(), id = curId(), r = peek(id);
    S.lastItem[QS.key + '.' + ver.id] = item.key; saveSoon();
    const multi = ver.items.length > 1;
    const hintOpen = hintOpenId === id;
    view().innerHTML =
      '<section class="qscreen">' +
      '<header class="qhead">' +
      (simBack ? '<a class="icon-btn" href="#simulado-fim" data-go="simulado-fim" aria-label="Voltar para o resultado do simulado">←</a>'
        : '<a class="icon-btn" href="#' + exam.id + '" data-go="' + exam.id + '" aria-label="Voltar para a ' + exam.title + '">←</a>') +
      '<div class="qhead-mid"><div class="qhead-title">' + exam.title + ' · Questão ' + q.n + (multi ? ' · item ' + item.key : '') + '</div>' +
      '<div class="bar bar-sm" role="progressbar" aria-label="Progresso na ' + exam.title + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(examItemsProgress() * 100) + '"><i id="qprog" style="width:' + (examItemsProgress() * 100).toFixed(1) + '%"></i></div></div>' +
      '<span class="chip chip-streak" title="Sequência de acertos" aria-label="Sequência de acertos"><span aria-hidden="true">🔥</span> <b class="js-streak">' + S.streak + '</b></span>' +
      '</header>' +
      '<div class="qbody">' +
      (multi ? '<div class="item-tabs" role="tablist" aria-label="Itens da questão">' + ver.items.map(itemTab).join('') + '</div>' : '') +
      (r && r.done ? reviewBanner(r) : '') +
      '<article class="statement">' +
      '<div class="st-top"><div class="st-skill">Questão ' + q.n + ' · ' + q.skill + '</div><div class="ver-row">' + verChip() + '</div></div>' +
      '<p class="st-prompt">' + fmt(ver.prompt) + '</p>' +
      (ver.table ? tableHTML(ver.table) : '') +
      (ver.figure ? '<div class="st-fig">' + ver.figure + '</div>' : '') +
      (ver.note ? '<p class="st-note">' + ver.note + '</p>' : '') +
      (item.prompt ? '<div class="st-item">' + (item.label ? '<span class="st-label">' + item.label + '</span>' : '') + '<span class="st-expr">' + fmt(item.prompt) + '</span></div>' : '') +
      '</article>' +
      '<div class="help-row">' +
      '<button class="help-btn help-hint" data-act="hint" aria-expanded="' + hintOpen + '" aria-controls="hint-slot"><span aria-hidden="true">💡</span> DICA</button>' +
      '<button class="help-btn help-sol" data-act="solution"><span aria-hidden="true">❔</span> RESOLUÇÃO</button>' +
      '</div>' +
      '<div id="hint-slot">' + (hintOpen ? hintPanel(item) : '') + '</div>' +
      '<div class="answer" id="answer">' + fieldsHTML(item, id) + '</div>' +
      '<div class="msg" id="msg" role="status" aria-live="polite"></div>' +
      '<div class="qnav">' +
      '<button class="btn btn-ghost btn-sm" data-act="prevq"' + (q.n === 1 ? ' disabled' : '') + ' aria-label="Questão anterior"><span aria-hidden="true">←</span> Anterior</button>' +
      '<button class="btn btn-ghost btn-sm btn-vary" data-act="vary"><span aria-hidden="true">🔀</span> Variar questão</button>' +
      '<button class="btn btn-ghost btn-sm" data-act="nextq" aria-label="' + (q.n === 10 ? 'Voltar à prova' : 'Próxima questão') + '">' + (q.n === 10 ? 'Fim da prova' : 'Próxima') + ' <span aria-hidden="true">→</span></button>' +
      '</div>' +
      '</div>' +
      '<footer class="qfoot" id="qfoot">' + checkBar() + '</footer>' +
      '</section>';
    const a = item.answer, d = draftOf(id);
    QS.sel = a.type === 'choice' ? d : null;
    QS.multi = a.type === 'multiSelect' ? new Set(d || []) : null;
    updatePreview();
  }
  const checkBar = () => '<button class="btn btn-primary btn-block btn-check" id="btn-check" data-act="check">VERIFICAR RESPOSTA</button>';

  function showMsg(html, tone) {
    const m = $('#msg');
    if (!m) return;
    m.className = 'msg show ' + (tone || '');
    m.innerHTML = html;
  }
  function lockAnswer(on) {
    const root = $('#answer');
    if (!root) return;
    root.classList.toggle('locked', on);
    $$('input, button', root).forEach(el => { if (el.tagName === 'INPUT') el.readOnly = on; else el.disabled = on; });
  }
  function doCheck() {
    if (!QS || QS.feedback) return;
    const item = curItem(), id = curId(), ans = collect();
    const res = L.validate(item, ans);
    if (res.status === 'empty' || res.status === 'invalid') {
      showMsg(fmt(res.message), res.status === 'empty' ? 'info' : 'warn');
      const f = $('#answer .field'); if (f && res.status === 'empty' && !f.value) f.focus();
      return;
    }
    S.drafts[id] = ans;
    const out = registerCheck(id, res.status, ans, QS.ver.id !== 'orig');
    QS.feedback = { ok: res.status === 'correct', hint: res.hint, review: !!out.review, gained: out.gained || 0, streakUp: out.streakUp, outcome: out.outcome };
    showMsg('', '');
    lockAnswer(true);
    const root = $('#answer');
    root.classList.remove('is-right', 'is-wrong');
    void root.offsetWidth;
    root.classList.add(QS.feedback.ok ? 'is-right' : 'is-wrong');
    $('#qfoot').innerHTML = feedbackHTML(QS.feedback);
    $('#qfoot').classList.add('has-fb');
    const b = $('#qfoot .btn'); if (b) b.focus({ preventScroll: true });
    if (QS.feedback.ok) { beep('ok'); if (!QS.feedback.review) confetti(); if (QS.feedback.gained) floatXP(QS.feedback.gained); }
    else { beep('bad'); if (navigator.vibrate) { try { navigator.vibrate(60); } catch (e) { /* ignora */ } } }
    updateTop();
    const tabs = $('.item-tabs');
    if (tabs) tabs.innerHTML = QS.ver.items.map(itemTab).join('');
    const bar = $('#qprog'); if (bar) bar.style.width = (examItemsProgress() * 100).toFixed(1) + '%';
  }
  function feedbackHTML(fb) {
    if (fb.ok) {
      const subs = {
        solo1: 'Mandou muito bem! Acertou de primeira.',
        solo: 'Isso aí! Errar faz parte de aprender.',
        hint: 'Boa! Usou a dica e chegou lá.',
        solution: 'Boa! Estudou a resolução e acertou. Que tal uma 🔀 variação agora?'
      };
      const title = fb.review ? 'Certinho de novo! ✓' : pick(['BOA, GAITERO! 🎉', 'MANDOU BEM, GAITERO! 🎉', 'É ISSO AÍ, GAITERO! 🎉']);
      const sub = fb.review ? 'Modo revisão: este item já estava concluído, então não vale XP de novo.' : subs[fb.outcome] + (fb.streakUp && S.streak > 1 ? ' 🔥 ' + S.streak + ' acertos seguidos!' : '');
      return '<div class="fb fb-ok" role="alert"><div class="fb-head"><span class="fb-ico" aria-hidden="true">✓</span><div class="fb-text"><div class="fb-title">' + title + '</div><div class="fb-sub">' + sub + '</div></div>' +
        (fb.gained ? '<span class="fb-xp">+' + fb.gained + ' XP</span>' : '') + '</div>' +
        '<div class="fb-actions"><button class="btn btn-primary btn-block" data-act="continue">CONTINUAR</button></div></div>';
    }
    return '<div class="fb fb-bad" role="alert"><div class="fb-head"><span class="fb-ico" aria-hidden="true">✗</span><div class="fb-text"><div class="fb-title">' + (fb.review ? 'Ops, não foi dessa vez.' : 'Quase lá! 💪 Vamos tentar de novo?') + '</div>' +
      '<div class="fb-sub">' + (fb.hint ? fmt(fb.hint) : 'Confira sua conta com calma, passo a passo.') + '</div></div></div>' +
      '<div class="fb-actions two"><button class="btn btn-danger" data-act="retry">TENTAR NOVAMENTE</button><button class="btn btn-ghost" data-act="solution-now">VER RESOLUÇÃO</button></div></div>';
  }
  function retry() {
    QS.feedback = null;
    lockAnswer(false);
    const root = $('#answer'); root.classList.remove('is-right', 'is-wrong');
    const foot = $('#qfoot'); foot.innerHTML = checkBar(); foot.classList.remove('has-fb');
    const f = $('#answer .field'); if (f) { f.focus(); f.select && f.select(); }
  }
  function doContinue() {
    const { exam, q, ver, idx } = QS;
    for (let k = 1; k < ver.items.length; k++) {
      const j = (idx + k) % ver.items.length;
      if (!(peek(iid(exam, q, ver.id, ver.items[j])) || {}).done) { selectItem(j); return; }
    }
    nextQuestion();
  }
  function selectItem(i) {
    QS.idx = i; QS.feedback = null;
    paintQuestion(); paintAvatars(); window.scrollTo(0, 0);
  }
  function nextQuestion() {
    const { exam, q } = QS;
    if (q.n < exam.questions.length) go(exam.id + '-q' + (q.n + 1));
    else { go(exam.id); toast('🏁 Você chegou ao fim da ' + exam.title + '!'); }
  }
  function vary() {
    const q = QS.q, ids = (q.variations || []).map(v => v.id), n = ids.length;
    if (!n) return;
    // original → 1ª variação → 2ª … → última → volta para a 1ª
    const next = ids[(ids.indexOf(QS.ver.id) + 1) % n];
    S.ver[QS.key] = next; save();
    renderQuestion(QS.exam.id, q.n);
    paintAvatars();
    toast('🔀 Variação ' + (ids.indexOf(next) + 1) + ' de ' + n + ' — treino extra, não muda sua nota estimada.');
  }

  /* ---------- Resolução passo a passo ---------- */
  function buildSteps(item) {
    const s = item.steps;
    const figHTML = f => (f ? '<div class="st-fig">' + f + '</div>' : '');
    // Resolução com etapas próprias (ex.: paralelepípedo sendo montado em 3D).
    if (s.list) return s.list.map(st => ({ t: st.t, b: st.b + figHTML(st.fig), cls: st.cls }));
    return [
      s.intro && { t: s.intro.t, b: s.intro.b, cls: 'concept' },   // explicação que abre a resolução
      { t: 'O que o exercício pede?', b: s.ask },
      s.concept && { t: 'Lembrete', b: s.concept, cls: 'concept' },
      { t: 'O que o enunciado nos dá?', b: s.data },
      { t: 'Primeiro passo', b: s.s1 },
      { t: 'Continuando o raciocínio', b: s.s2 + figHTML(s.fig) },
      { t: 'Resposta final', b: s.final, cls: 'final' },
      { t: 'Conferindo se faz sentido', b: s.check, cls: 'check' }
    ].filter(Boolean);
  }
  // extra (simulado): { where, banner } — de onde veio a questão e o quadro "sua resposta / resposta certa".
  function openSolution(extra) {
    extra = extra && extra.where ? extra : null;
    if (!QS.sim) registerHelp(curId(), 'sol');
    QS.solStep = 0;
    const item = curItem(), { exam, q, ver } = QS;
    const sheet = document.createElement('div');
    sheet.className = 'sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-labelledby', 'sol-title');
    sheet.innerHTML = '<div class="sheet-card">' +
      '<header class="sheet-head"><div><h2 id="sol-title">❔ Resolução</h2><span class="sheet-where">' + (extra ? extra.where : exam.title + ' · Questão ' + q.n + (item.label ? ' · item ' + item.key : '') + (ver.id !== 'orig' ? ' · variação' : '')) + '</span></div>' +
      '<button class="icon-btn" data-act="sheet-close" aria-label="Fechar resolução">✕</button></header>' +
      '<div class="sheet-body" id="sol-body">' + (extra ? extra.banner : '') + '<div class="sol-q">' + fmt(ver.prompt) + (item.prompt ? ' <span class="sol-item">' + (item.label || '') + ' ' + fmt(item.prompt) + '</span>' : '') + '</div><ol class="steps" id="sol-steps"></ol></div>' +
      '<footer class="sheet-foot" id="sol-foot"></footer></div>';
    $('#sheet-root').appendChild(sheet);
    document.body.classList.add('no-scroll');
    paintSteps();
    $('.sheet-head .icon-btn', sheet).focus({ preventScroll: true });
  }
  // Só acrescenta os passos novos: os que já estão na tela não são redesenhados,
  // então as animações (ex.: reflexão ponto a ponto) rodam uma vez, no passo que acabou de aparecer.
  function paintSteps(showAll) {
    const item = curItem(), steps = buildSteps(item);
    if (showAll) QS.solStep = steps.length - 1;
    const ol = $('#sol-steps'), from = ol.children.length;
    $$('.step.new', ol).forEach(li => li.classList.remove('new'));
    for (let i = from; i <= QS.solStep && i < steps.length; i++) {
      const st = steps[i];
      ol.insertAdjacentHTML('beforeend', '<li class="step ' + (st.cls || '') + ' new"><div class="step-n" aria-hidden="true">' + (i + 1) + '</div><div class="step-body"><div class="step-t">' + st.t + '</div><div class="step-b">' + fmt(st.b) + '</div></div></li>');
    }
    const last = QS.solStep >= steps.length - 1;
    const done = (peek(curId()) || {}).done;
    $('#sol-foot').innerHTML = last
      ? (QS.sim ? '<button class="btn btn-ghost" data-act="sheet-close">FECHAR</button><button class="btn btn-primary" data-act="sim-retry">TENTAR FAZER NOVAMENTE</button>'
        : '<button class="btn btn-primary btn-block" data-act="' + (done ? 'sheet-close' : 'sheet-try') + '">' + (done ? 'FECHAR' : 'TENTAR AGORA') + '</button>')
      : '<button class="link-btn" data-act="steps-all">Mostrar todos os passos</button><button class="btn btn-blue" data-act="step-next">PRÓXIMO PASSO</button>';
    const firstNew = ol.children[from];
    if (firstNew && from > 0) firstNew.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  function closeSheets() {
    $$('#sheet-root > *').forEach(el => el.remove());
    document.body.classList.remove('no-scroll');
  }
  // Abre direto: ver a resolução não tira ponto, então não precisa perguntar.
  function askSolution() { openSolution(); }

  /* ---------- Modal genérico ---------- */
  function modal(o) {
    const el = document.createElement('div');
    el.className = 'modal';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'modal-title');
    el.innerHTML = '<div class="modal-card"><h2 id="modal-title">' + o.title + '</h2><p>' + o.text + '</p><div class="modal-actions">' +
      '<button class="btn ' + (o.danger ? 'btn-danger' : 'btn-primary') + '" data-m="p">' + o.primary + '</button>' +
      '<button class="btn btn-ghost" data-m="s">' + o.secondary + '</button></div></div>';
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-m]');
      if (!b && e.target !== el) return;
      el.remove();
      document.body.classList.remove('no-scroll');
      if (b && b.dataset.m === 'p' && o.onPrimary) o.onPrimary();
      if (b && b.dataset.m === 's' && o.onSecondary) o.onSecondary();
    });
    $('#sheet-root').appendChild(el);
    document.body.classList.add('no-scroll');
    $('.btn', el).focus({ preventScroll: true });
  }

  /* ---------- Efeitos ---------- */
  let actx = null;
  function beep(kind) {
    if (!S.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const now = actx.currentTime;
      const notes = kind === 'ok' ? [[660, 0], [990, 0.1]] : [[240, 0], [190, 0.12]];
      notes.forEach(n => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = kind === 'ok' ? 'sine' : 'triangle';
        o.frequency.value = n[0];
        g.gain.setValueAtTime(0.0001, now + n[1]);
        g.gain.exponentialRampToValueAtTime(0.16, now + n[1] + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + n[1] + 0.2);
        o.connect(g); g.connect(actx.destination);
        o.start(now + n[1]); o.stop(now + n[1] + 0.22);
      });
    } catch (e) { /* sem áudio */ }
  }
  function confetti() {
    if (reduceMotion) return;
    const box = document.createElement('div');
    box.className = 'confetti';
    box.setAttribute('aria-hidden', 'true');
    const colors = ['#58CC02', '#FFC800', '#1CB0F6', '#FF4B4B', '#CE82FF', '#FF9600'];
    for (let i = 0; i < 40; i++) {
      const s = document.createElement('i');
      s.style.setProperty('--x', (Math.random() * 100) + 'vw');
      s.style.setProperty('--dx', (Math.random() * 30 - 15) + 'vw');
      s.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      s.style.setProperty('--d', (0.9 + Math.random() * 0.8) + 's');
      s.style.background = colors[i % colors.length];
      box.appendChild(s);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 1900);
  }
  function floatXP(n) {
    if (reduceMotion) return;
    const el = document.createElement('div');
    el.className = 'xp-float';
    el.setAttribute('aria-hidden', 'true');
    el.textContent = '+' + n + ' XP';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
  function toast(html) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.innerHTML = html;
    $('#toast-root').appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 350); }, 2800);
  }

  /* ============ Ações ============ */
  const ACTIONS = {
    check: doCheck,
    retry,
    continue: doContinue,
    item: el => selectItem(+el.dataset.i),
    prevq: () => { if (QS.q.n > 1) go(QS.exam.id + '-q' + (QS.q.n - 1)); },
    nextq: nextQuestion,
    vary,
    orig: () => { S.ver[QS.key] = 'orig'; save(); renderQuestion(QS.exam.id, QS.q.n); paintAvatars(); toast('📝 De volta à questão original da prova.'); },
    hint: () => {
      const id = curId();
      if (hintOpenId === id) { hintOpenId = null; $('#hint-slot').innerHTML = ''; $('.help-hint').setAttribute('aria-expanded', 'false'); return; }
      registerHelp(id, 'hint');
      hintOpenId = id;
      $('#hint-slot').innerHTML = hintPanel(curItem());
      $('.help-hint').setAttribute('aria-expanded', 'true');
      const p = $('#hint-panel'); if (p) { p.focus({ preventScroll: true }); p.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' }); }
    },
    'hint-close': () => { hintOpenId = null; $('#hint-slot').innerHTML = ''; $('.help-hint').setAttribute('aria-expanded', 'false'); const f = $('#answer .field'); if (f) f.focus({ preventScroll: true }); },
    'to-cola': el => { persistDraft(); returnTo = current; colaFocus = el.dataset.rule; go('cola-' + el.dataset.block); },
    return: () => { const r = returnTo; returnTo = null; go(r); },
    solution: askSolution,
    'solution-now': openSolution,
    'sheet-close': closeSheets,
    'sheet-try': () => { closeSheets(); if (QS.feedback) retry(); else { const f = $('#answer .field'); if (f) f.focus(); } },
    'step-next': () => { QS.solStep++; paintSteps(); },
    'steps-all': () => paintSteps(true),
    'cola-jump': el => {
      const t = $('#cola-' + el.dataset.block);
      if (t) { t.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' }); t.focus({ preventScroll: true }); }
    },
    choose: el => {
      QS.sel = el.dataset.id;
      $$('.choice').forEach(c => { const on = c === el; c.classList.toggle('on', on); c.setAttribute('aria-checked', on); });
      persistDraft(); showMsg('', '');
    },
    toggle: el => {
      const id = el.dataset.id, opt = curItem().answer.options.filter(o => o.id === id)[0];
      if (QS.multi.has(id)) QS.multi.delete(id);
      else {
        if (opt.exclusive) QS.multi.clear();
        else curItem().answer.options.forEach(o => { if (o.exclusive) QS.multi.delete(o.id); });
        QS.multi.add(id);
      }
      $$('.check').forEach(c => { const on = QS.multi.has(c.dataset.id); c.classList.toggle('on', on); c.setAttribute('aria-checked', on); });
      persistDraft(); showMsg('', '');
    },
    pm: el => {
      const f = $('#' + el.dataset.for);
      if (!f) return;
      const v = f.value.trim();
      f.value = v.startsWith('-') || v.startsWith('−') ? v.slice(1) : '-' + v;
      persistDraft();
      f.focus({ preventScroll: true });
    },
    key: el => {
      const f = $('#f0');
      if (!f) return;
      const s = f.selectionStart != null ? f.selectionStart : f.value.length, e = f.selectionEnd != null ? f.selectionEnd : s;
      if (el.dataset.del) {
        const from = s === e ? Math.max(0, s - 1) : s;
        f.value = f.value.slice(0, from) + f.value.slice(e);
        f.setSelectionRange(from, from);
      } else {
        const ins = el.dataset.ins;
        f.value = f.value.slice(0, s) + ins + f.value.slice(e);
        f.setSelectionRange(s + ins.length, s + ins.length);
      }
      updatePreview(); persistDraft();
    },
    reset: () => modal({
      title: 'Zerar todo o progresso?',
      text: 'Isso apaga XP, sequências, respostas e a nota estimada salvas neste aparelho. Não dá para desfazer.',
      primary: 'CANCELAR', secondary: 'ZERAR TUDO',
      onSecondary: () => { S = blank(); save(); hintOpenId = null; render(); toast('Progresso zerado. Bora começar de novo! 🚀'); }
    }),
    settings: () => openSettings(),
    how: () => showHow(),
    'sim-start': el => {
      const sc = el.dataset.scope;
      if (S.sim && !S.sim.done && S.sim.i > 0) modal({ title: 'Começar outro simulado?', text: 'O simulado que você começou vai ser descartado.', primary: 'CANCELAR', secondary: 'COMEÇAR OUTRO', onSecondary: () => startSim(sc) });
      else startSim(sc);
    },
    'sim-continue': () => go('simulado-q'),
    'sim-next': simNext,
    'sim-open': el => simOpen(+el.dataset.i),
    'sim-retry': simRetry
  };

  /* ---------- Opções (⚙ no topo) ---------- */
  function panel(html, onAction) {
    const el = document.createElement('div');
    el.className = 'modal';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.innerHTML = '<div class="modal-card">' + html + '</div>';
    const close = () => { el.remove(); if (!$('#sheet-root').children.length) document.body.classList.remove('no-scroll'); };
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-o]');
      if (e.target === el || (b && b.dataset.o === 'close')) { close(); return; }
      if (b) { close(); if (onAction) onAction(b.dataset.o); }
    });
    $('#sheet-root').appendChild(el);
    document.body.classList.add('no-scroll');
    const f = $('button', el); if (f) f.focus({ preventScroll: true });
  }
  function openSettings() {
    const canInstall = isMobileDevice() && !isStandalone();
    panel('<h2>Opções</h2><div class="opt-list">' +
      '<button class="opt" data-o="sound"><span aria-hidden="true">' + (S.sound ? '🔊' : '🔇') + '</span> Som dos acertos: <b>' + (S.sound ? 'ligado' : 'desligado') + '</b></button>' +
      (canInstall ? '<button class="opt" data-o="install"><span aria-hidden="true">📲</span> Colocar na tela inicial</button>' : '') +
      '<button class="opt" data-o="how"><span aria-hidden="true">ℹ️</span> Como a nota estimada é calculada</button>' +
      '<button class="opt opt-danger" data-o="reset"><span aria-hidden="true">🗑️</span> Zerar progresso</button></div>' +
      '<p class="opt-note">Seu progresso fica salvo neste aparelho, neste navegador.</p>' +
      '<button class="btn btn-primary btn-block" data-o="close">FECHAR</button>',
    o => {
      if (o === 'sound') { S.sound = !S.sound; save(); openSettings(); }
      else if (o === 'install') openInstallGuide(false);
      else if (o === 'how') showHow();
      else if (o === 'reset') ACTIONS.reset();
    });
  }
  function showHow() {
    panel('<h2>Como a nota estimada é calculada</h2>' + HOW_HTML + '<button class="btn btn-primary btn-block" data-o="close">ENTENDI</button>');
  }

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-go], [data-act]');
    if (!el || el.disabled) return;
    if (el.closest('.modal')) return;
    if (el.hasAttribute('data-go')) { e.preventDefault(); go(el.getAttribute('data-go')); return; }
    const fn = ACTIONS[el.dataset.act];
    if (fn) { e.preventDefault(); fn(el, e); }
  });
  // Teclado virtual de símbolos: não tirar o foco do campo.
  document.addEventListener('pointerdown', e => { if (e.target.closest('.key, .pm')) e.preventDefault(); });
  document.addEventListener('input', e => {
    if (!QS || !e.target.closest('#answer')) return;
    if (e.target.dataset.expr) updatePreview();
    persistDraft();
    if ($('#msg') && $('#msg').classList.contains('show')) showMsg('', '');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('#sheet-root').children.length) {
      const m = $('#sheet-root .modal');
      if (m && m.classList.contains('install-modal')) { const c = $('[data-i="close"]', m); if (!m.dataset.locked && c) c.click(); return; }
      if (m) { m.remove(); if (!$('#sheet-root').children.length) document.body.classList.remove('no-scroll'); } else closeSheets();
      return;
    }
    if (e.key === 'Enter' && route().name === 'simq' && !$('#sheet-root').children.length && e.target.matches && e.target.matches('#answer .field')) { e.preventDefault(); simNext(); return; }
    if (e.key !== 'Enter' || !QS || route().name !== 'question') return;
    if ($('#sheet-root').children.length) return;
    if (e.target.matches && e.target.matches('#answer .field')) { e.preventDefault(); if (!QS.feedback) doCheck(); else if (QS.feedback.ok) doContinue(); else retry(); }
  });

  /* ============ Instalar na tela inicial ============ */
  const INSTALL_KEY = 'gaiteroMath.installHintSeen';
  const INSTALL_LOCK_SECONDS = 10;   // no primeiro uso, o guia só pode ser fechado depois disso
  let deferredInstall = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; });
  window.addEventListener('appinstalled', () => { deferredInstall = null; try { localStorage.setItem(INSTALL_KEY, '1'); } catch (e) { /* ignora */ } });
  function isStandalone() {
    return (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches)) || window.navigator.standalone === true;
  }
  function detectBrowser() {
    const ua = navigator.userAgent || '';
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const android = /Android/i.test(ua);
    const inApp = /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Line\/|Snapchat|TikTok|musical_ly|BytedanceWebview|Twitter|LinkedInApp|GSA\/|WhatsApp/i.test(ua);
    if (ios) {
      if (inApp) return 'ios-inapp';
      if (/CriOS/i.test(ua)) return 'ios-chrome';
      if (/FxiOS|EdgiOS|OPiOS|YaBrowser/i.test(ua)) return 'ios-other';
      return 'ios-safari';
    }
    if (android) {
      if (inApp || /; wv\)/.test(ua)) return 'android-inapp';
      if (/SamsungBrowser/i.test(ua)) return 'android-samsung';
      if (/Firefox/i.test(ua)) return 'android-firefox';
      if (/EdgA|OPR|Opera|YaBrowser|MiuiBrowser/i.test(ua)) return 'android-other';
      if (/Chrome/i.test(ua)) return 'android-chrome';
      return 'android-other';
    }
    if (/Edg\//.test(ua)) return 'desktop-edge';
    if (/Chrome\//.test(ua) && !/OPR\//.test(ua)) return 'desktop-chrome';
    if (/Safari\//.test(ua) && /Macintosh/.test(ua)) return 'desktop-safari';
    return 'desktop-other';
  }
  const chipUI = label => '<span class="chip-ui">' + label + '</span>';
  const SHARE_CHIP = '<span class="chip-ui"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 14V3M7.5 7.5 12 3l4.5 4.5"/><path d="M8 10H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-2"/></svg>Compartilhar</span>';
  // Passo a passo por navegador (texto fixo do app).
  const INSTALL_GUIDES = {
    'ios-safari': { browser: 'Safari no iPhone', steps: [
      'Toque em ' + SHARE_CHIP + ' na barra do Safari (no iOS mais novo ele fica dentro do ' + chipUI('•••') + ').',
      'Role as opções e toque em ' + chipUI('Adicionar à Tela de Início') + '.',
      'Confirme em ' + chipUI('Adicionar') + ' e abra o GAITERO MATH pelo ícone.'] },
    'ios-chrome': { browser: 'Chrome no iPhone', steps: [
      'Toque em ' + SHARE_CHIP + ' ao lado da barra de endereço.',
      'Toque em ' + chipUI('Adicionar à Tela de Início') + ' (se não aparecer, toque em ' + chipUI('Mais') + ').',
      'Confirme em ' + chipUI('Adicionar') + '.'], note: 'Não achou a opção? Abra o link no Safari e siga os mesmos passos.' },
    'ios-other': { browser: 'navegador do iPhone', steps: [
      'Abra o menu do navegador (' + chipUI('•••') + ' ou ' + chipUI('≡') + ') e toque em ' + SHARE_CHIP + '.',
      'Toque em ' + chipUI('Adicionar à Tela de Início') + '.',
      'Confirme em ' + chipUI('Adicionar') + '.'], note: 'Se a opção não existir, copie o link e abra no Safari.' },
    'ios-inapp': { browser: 'navegador de dentro de um app', steps: [
      'Toque em ' + chipUI('•••') + ' e escolha ' + chipUI('Abrir no Safari') + '.',
      'No Safari, toque em ' + SHARE_CHIP + '.',
      'Toque em ' + chipUI('Adicionar à Tela de Início') + ' e depois em ' + chipUI('Adicionar') + '.'], note: 'Dentro do WhatsApp ou do Instagram não dá para instalar: precisa abrir no Safari.' },
    'android-chrome': { browser: 'Chrome no Android', canPrompt: true, steps: [
      'Toque em ' + chipUI('⋮') + ' no canto superior direito.',
      'Toque em ' + chipUI('Instalar app') + ' ou ' + chipUI('Adicionar à tela inicial') + '.',
      'Confirme em ' + chipUI('Instalar') + ' e abra o GAITERO MATH pelo ícone.'] },
    'android-samsung': { browser: 'Samsung Internet', canPrompt: true, steps: [
      'Toque em ' + chipUI('≡') + ' na barra de baixo.',
      'Toque em ' + chipUI('Adicionar página a') + ' e escolha ' + chipUI('Tela inicial') + '.',
      'Confirme em ' + chipUI('Adicionar') + '.'] },
    'android-firefox': { browser: 'Firefox no Android', steps: [
      'Toque em ' + chipUI('⋮') + '.',
      'Toque em ' + chipUI('Instalar') + ' ou ' + chipUI('Adicionar à tela inicial') + '.',
      'Confirme em ' + chipUI('Adicionar') + '.'] },
    'android-inapp': { browser: 'navegador de dentro de um app', steps: [
      'Toque em ' + chipUI('⋮') + ' e escolha ' + chipUI('Abrir no Chrome') + ' (ou "Abrir no navegador").',
      'No Chrome, toque em ' + chipUI('⋮') + ' e depois em ' + chipUI('Instalar app') + '.',
      'Confirme em ' + chipUI('Instalar') + '.'] },
    'android-other': { browser: 'navegador do Android', canPrompt: true, steps: [
      'Abra o menu do navegador (' + chipUI('⋮') + ' ou ' + chipUI('≡') + ').',
      'Toque em ' + chipUI('Adicionar à tela inicial') + ' ou ' + chipUI('Instalar app') + '.',
      'Confirme e abra o GAITERO MATH pelo ícone.'], note: 'Não achou? Abra o link no Chrome.' },
  };
  // O guia de "colocar na tela inicial" só existe no celular (iPhone/iPad e Android).
  function isMobileDevice() { return /^(ios|android)-/.test(detectBrowser()); }
  function openInstallGuide(auto) {
    if (!isMobileDevice()) return;
    const guide = INSTALL_GUIDES[detectBrowser()] || INSTALL_GUIDES['android-other'];
    const lockMs = auto ? INSTALL_LOCK_SECONDS * 1000 : 0;
    const el = document.createElement('div');
    el.className = 'modal install-modal';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'install-title');
    if (lockMs) el.dataset.locked = '1';
    el.innerHTML = '<div class="modal-card install-card">' +
      '<div class="install-top"><span data-avatar="md"></span><div><h2 id="install-title">📲 Coloca na tela inicial!</h2>' +
      '<p class="install-lead">Assim o GAITERO MATH abre em tela cheia, como um app, direto pelo ícone.</p></div></div>' +
      '<p class="install-browser">Você abriu pelo <b>' + guide.browser + '</b></p>' +
      '<ol class="install-steps">' + guide.steps.map(s => '<li><span>' + s + '</span></li>').join('') + '</ol>' +
      (guide.note ? '<p class="install-note">' + guide.note + '</p>' : '') +
      (guide.canPrompt && deferredInstall ? '<button class="btn btn-blue btn-block" data-i="now">📲 INSTALAR AGORA</button>' : '') +
      '<button class="btn btn-primary btn-block" data-i="close">ENTENDI</button>' +
      (lockMs ? '<div class="install-timer" aria-hidden="true"><i style="animation-duration:' + lockMs + 'ms"></i></div>' : '') +
      '</div>';
    const close = () => {
      if (el.dataset.locked) return;
      el.remove();
      if (!$('#sheet-root').children.length) document.body.classList.remove('no-scroll');
      if (auto) { try { localStorage.setItem(INSTALL_KEY, '1'); } catch (e) { /* ignora */ } }
    };
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-i]');
      if (b && b.dataset.i === 'now' && deferredInstall) {
        const p = deferredInstall; deferredInstall = null;
        p.prompt();
        Promise.resolve(p.userChoice).then(c => { if (c && c.outcome === 'accepted') { delete el.dataset.locked; close(); } }).catch(() => {});
        b.remove();
        return;
      }
      if ((b && b.dataset.i === 'close') || e.target === el) close();
    });
    $('#sheet-root').appendChild(el);
    document.body.classList.add('no-scroll');
    paintAvatars();
    const btn = $('[data-i="close"]', el);
    if (lockMs) {
      btn.disabled = true;
      const endsAt = Date.now() + lockMs;
      const tick = () => {
        const left = Math.ceil((endsAt - Date.now()) / 1000);
        if (left > 0) { btn.textContent = 'PODE FECHAR EM ' + left + 's'; return; }
        clearInterval(timer);
        delete el.dataset.locked;
        btn.disabled = false;
        btn.textContent = 'ENTENDI';
        const bar = $('.install-timer', el); if (bar) bar.remove();
        btn.focus({ preventScroll: true });
      };
      const timer = setInterval(tick, 200);
      tick();
    } else btn.focus({ preventScroll: true });
  }

  /* ============ Celular: sem zoom e só na vertical ============ */
  function lockZoom() {
    const content = 'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content';
    $$('meta[name="viewport"]').forEach(m => m.setAttribute('content', content));
    const block = e => e.preventDefault();
    // O iPhone ignora user-scalable=no: a pinça é bloqueada pelos eventos de gesto.
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(t => document.addEventListener(t, block, { passive: false }));
    document.addEventListener('touchmove', e => { if (e.touches && e.touches.length > 1) e.preventDefault(); }, { passive: false });
    document.addEventListener('dblclick', block, { passive: false });
    let lastTouchEnd = 0;
    document.addEventListener('touchend', e => {
      const now = Date.now();
      const onControl = e.target.closest && e.target.closest('button, input, label, a, summary, [role="button"], [data-act], [data-go]');
      if (now - lastTouchEnd < 320 && !onControl) e.preventDefault(); // duplo toque fora de botões
      lastTouchEnd = now;
    }, { passive: false });
    document.addEventListener('wheel', e => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].indexOf(e.key) >= 0 && isPhone()) e.preventDefault();
    });
  }
  function isPhone() { return Math.min(screen.width, screen.height) <= 520 && (navigator.maxTouchPoints > 0 || 'ontouchstart' in window); }
  // Deitado = o aparelho diz que está na horizontal E a página está mais larga que alta, em tela de celular.
  // Não usa media query de orientação: no Android o teclado encolhe a página e ela "vira" paisagem.
  function watchOrientation() {
    const update = () => {
      const type = screen.orientation && screen.orientation.type;
      const byDevice = type ? type.indexOf('landscape') === 0 : (typeof window.orientation === 'number' ? Math.abs(window.orientation) === 90 : null);
      const typing = document.activeElement && /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
      const wide = window.innerWidth > window.innerHeight;
      const landscape = isPhone() && (byDevice === null ? wide && !typing : byDevice && (wide || typing));
      document.documentElement.classList.toggle('is-landscape', !!landscape);
    };
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    if (screen.orientation && screen.orientation.addEventListener) screen.orientation.addEventListener('change', update);
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', () => setTimeout(update, 300));
    update();
    try {
      const p = screen.orientation && screen.orientation.lock && screen.orientation.lock('portrait');
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* navegador não deixa travar: fica o aviso */ }
  }

  /* ============ Abertura ============ */
  // Mostra a arte ~1,5 s. Em internet lenta espera um pouco por ela antes de usar a abertura provisória.
  let splashDone = null;
  const splashFinished = new Promise(res => { splashDone = res; });
  function runSplash() {
    const sp = $('#splash');
    if (!sp) { splashDone(); return; }
    let seen = false;
    try { seen = sessionStorage.getItem('gm-splash') === '1'; sessionStorage.setItem('gm-splash', '1'); } catch (e) { /* ignora */ }
    if (seen) { sp.remove(); splashDone(); return; }
    const img = $('#splash-img'), t0 = Date.now();
    let shownAt = 0;
    const decide = ok => {
      if (sp.classList.contains('has-art') || sp.classList.contains('no-art')) return;
      sp.classList.add(ok ? 'has-art' : 'no-art');
      shownAt = Date.now();
    };
    const finish = () => {
      const wait = Math.max(0, 1500 - (Date.now() - t0), shownAt ? 900 - (Date.now() - shownAt) : 0);
      setTimeout(() => { sp.classList.add('out'); setTimeout(() => { sp.remove(); splashDone(); }, 500); }, wait);
    };
    if (img.complete && img.naturalWidth) decide(true);
    img.addEventListener('load', () => decide(true));
    img.addEventListener('error', () => {
      // sem a cópia leve, tenta a arte original
      if (!img.dataset.retry) { img.dataset.retry = '1'; img.src = SPLASH_PNG; } else decide(false);
    });
    setTimeout(() => { decide(false); }, 1300);
    setTimeout(finish, 1500);
  }

  function init() {
    lockZoom();
    watchOrientation();
    runSplash();
    const firstOk = list => list.reduce((p, src) => p.then(found => found || probe(src).then(ok => (ok ? src : null))), Promise.resolve(null));
    Promise.all([firstOk([SPLASH_SRC, SPLASH_PNG]), firstOk(AVATAR_SRCS)]).then(res => {
      ART.splash = res[0]; ART.avatar = res[1];
      paintAvatars();
    });
    render();
    let seen = false;
    try { seen = localStorage.getItem(INSTALL_KEY) === '1'; } catch (e) { seen = true; }
    if (!seen && !isStandalone() && isMobileDevice()) splashFinished.then(() => setTimeout(() => openInstallGuide(true), 250));
    // Offline depois de instalado (só em site hospedado; arquivo local e artifact não aceitam).
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && location.hostname !== 'localhost') {
      try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) { /* ignora */ }
    }
  }
  window.GM_APP = { state: () => S, go, render, reset: () => { S = blank(); save(); render(); } };
  init();
})();
