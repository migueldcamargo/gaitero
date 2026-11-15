/* =====================================================================
   GAITERO MATH — 4º Bimestre: peças em comum
   Fonte: apostila Sistema Etapa, aulas 126 a 145 (fotos enviadas pelo responsável
   e o caderno digitado "gaitero_4_bimestre_14_aulas_digitalizadas.pdf").
   Quando a foto e o PDF digitado discordam, vale a FOTO (ver notas em cada questão).

   Cada questão do 4º bimestre é feita por um GERADOR: gen(params) devolve
   { prompt, figure?, table?, note?, items[] } no mesmo formato de questions.js.
   O 1º conjunto de parâmetros é a questão original da apostila; os outros três
   viram as variações (botão 🔀). Assim original e variações têm exatamente a
   mesma didática (dica, erros comuns e resolução recalculados).

   Diferenças para P1/P2:
     · question.uid = 'aula-número' (ex.: '130-2'): é a identidade salva no
       progresso (não muda se a ordem das questões mudar);
     · question.ref = { aula, n } para mostrar "Aula 130 · Questão 2";
     · item.hint.more = [dica 2, dica 3]: dicas progressivas.
   ===================================================================== */
(function () {
  'use strict';
  var L = window.GM_LOGIC, CT = window.GM_CONTAS;
  var br = L.brNum;
  var H = {};      // utilidades de texto
  var F4 = {};     // figuras

  /* ---------- Texto ---------- */
  H.br = br;
  H.br1 = function (v) { return br(v); };   // para .map (sem o índice virar casas decimais)
  H.money = L.brMoney;
  H.box = L.boxes;
  H.m = function (s) { return '[[' + s + ']]'; };
  H.calc = function (s) { return '<div class="calc">' + s + '</div>'; };
  H.lines = function (arr) { return '<div class="calc calc-lines">' + arr.map(function (l) { return '<span>' + l + '</span>'; }).join('') + '</div>'; };
  H.small = function (s) { return ' <small>← ' + s + '</small>'; };
  H.aside = function (s) { return '<p class="aside">' + s + '</p>'; };
  H.fig = function (svg) { return '<div class="st-fig">' + svg + '</div>'; };
  // número entre parênteses quando é negativo (para multiplicações)
  H.par = function (n) { return n < 0 ? '(' + br(n) + ')' : br(n); };
  // destaque colorido (funciona dentro e fora de [[ ]])
  H.hl = function (s, c) { return '<b class="hl hl-' + (c || 'a') + '">' + s + '</b>'; };
  H.sum = function (a) { return a.reduce(function (s, v) { return s + v; }, 0); };
  H.gcd = function (a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; };
  H.lcm = function (a, b) { return a / H.gcd(a, b) * b; };
  H.factor = function (N) { var f = {}, n = N, d = 2; while (n > 1) { while (n % d === 0) { f[d] = (f[d] || 0) + 1; n /= d; } d++; } return f; };
  H.listPT = function (arr) { return arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' e ' + arr[arr.length - 1]; };
  H.ordinal = ['primeiro', 'segundo', 'terceiro', 'quarto', 'quinto'];
  // fração "bonita": inteiro, ou a/b simplificada
  H.fracTxt = function (num, den) {
    if (den < 0) { num = -num; den = -den; }
    var g = H.gcd(num, den); num /= g; den /= g;
    return den === 1 ? String(num) : (num < 0 ? '-' : '') + 'frac{' + Math.abs(num) + '}{' + den + '}';
  };
  // divisão explicada: se é tabuada simples, uma linha; senão, na chave (contas.js)
  H.divide = function (D, d, opt) {
    opt = opt || {};
    var q = D / d;
    if (Number.isInteger(q) && Number.isInteger(D) && Number.isInteger(d) && d <= 10 && q <= 10) {
      return { steps: [], inline: 'Pela tabuada: [[' + d + ' * ' + q + ' = ' + D + ']], então [[frac{' + D + '}{' + d + '} = ' + q + ']].', value: q, text: br(q) };
    }
    var r = CT.divide(D, d, opt);
    return { steps: r.steps, inline: '', value: r.value, text: r.text, approx: r.approx };
  };
  // tabela HTML (mesmo visual da tabela do enunciado); hl = índices das linhas destacadas
  H.table = function (head, rows, hl, cls) {
    hl = hl || [];
    return '<div class="st-table-wrap"><table class="st-table ' + (cls || '') + '"><thead><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r, i) { return '<tr' + (hl.indexOf(i) >= 0 ? ' class="tr-hl"' : '') + '>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  };

  /* ---------- Figuras ---------- */
  var f1 = function (v) { return (Math.round(v * 10) / 10).toString(); };
  var T = function (x, y, txt, cls, extra) { return '<text class="' + (cls || 'fg-lbl') + '" x="' + f1(x) + '" y="' + f1(y) + '"' + (extra || '') + '>' + txt + '</text>'; };
  F4.T = T;
  F4.f1 = f1;

  // Barra dividida em partes iguais, coloridas por "dono".
  // o = { weights: [2, 3], labels: ['1ª parte', '2ª parte'], unit: valor de cada parte (ou null), values: [..] (ou null), total: '1000', reveal: true }
  F4.partsBar = function (o) {
    var S = H.sum(o.weights), W = 320, X0 = 10, BW = 300, Y = 40, BH = 30, s = '', x = X0, seg = BW / S;
    var showLines = S <= 60;
    o.weights.forEach(function (w, i) {
      var wd = seg * w;
      s += '<rect class="fg-part p' + (i % 3) + '" x="' + f1(x) + '" y="' + Y + '" width="' + f1(wd) + '" height="' + BH + '"/>';
      if (showLines) for (var k = 1; k < w; k++) s += '<line class="fg-part-line" x1="' + f1(x + k * seg) + '" y1="' + Y + '" x2="' + f1(x + k * seg) + '" y2="' + (Y + BH) + '"/>';
      s += '<line class="fg-part-sep" x1="' + f1(x + wd) + '" y1="' + (Y - 4) + '" x2="' + f1(x + wd) + '" y2="' + (Y + BH + 4) + '"/>';
      var cx = x + wd / 2;
      s += T(cx, Y + BH + 16, o.labels[i], 'fg-part-name p' + (i % 3));
      s += T(cx, Y + BH + 31, w + (w === 1 ? ' parte' : ' partes') + (o.values ? ' = ' + o.values[i] : ''), 'fg-part-val');
      x += wd;
    });
    s += '<rect class="fg-part-frame" x="' + X0 + '" y="' + Y + '" width="' + BW + '" height="' + BH + '" rx="3"/>';
    s += '<path class="fg-brace" d="M' + X0 + ' 30 v-6 h' + BW + ' v6"/>';
    s += T(X0 + BW / 2, 18, 'Total: ' + o.total + (o.unit != null ? ' · ' + S + ' partes de ' + o.unit : ' · ' + S + ' partes iguais'), 'fg-part-total');
    return '<svg class="fig fig-parts" viewBox="0 0 ' + W + ' 112" role="img" aria-label="Barra com ' + S + ' partes iguais">' + s + '</svg>';
  };

  // Segmento AB com o ponto M (aula 130, Q3)
  F4.segment = function (o) {
    var X0 = 20, X1 = 300, Y = 40, xm = X0 + (X1 - X0) * o.a / (o.a + o.b), s = '';
    s += '<line class="fg-seg-a" x1="' + X0 + '" y1="' + Y + '" x2="' + f1(xm) + '" y2="' + Y + '"/>';
    s += '<line class="fg-seg-b" x1="' + f1(xm) + '" y1="' + Y + '" x2="' + X1 + '" y2="' + Y + '"/>';
    [X0, xm, X1].forEach(function (x) { s += '<circle class="fg-pt" cx="' + f1(x) + '" cy="' + Y + '" r="3.5"/>'; });
    s += T(X0, Y - 10, 'A') + T(xm, Y - 10, 'M') + T(X1, Y - 10, 'B');
    s += T((X0 + xm) / 2, Y + 20, o.la, 'fg-dim fg-mid') + T((xm + X1) / 2, Y + 20, o.lb, 'fg-dim fg-mid');
    s += '<path class="fg-brace" d="M' + X0 + ' ' + (Y + 30) + ' v6 h' + (X1 - X0) + ' v-6"/>' + T((X0 + X1) / 2, Y + 50, o.total, 'fg-dim fg-mid');
    return '<svg class="fig fig-seg" viewBox="0 0 320 100" role="img" aria-label="Segmento AB com o ponto M">' + s + '</svg>';
  };

  // Triângulo ADE com BC paralelo a DE (aula 131, Q1). lbl = { AB, AC, BD, CE } (textos opcionais)
  F4.thales = function (lbl, hl) {
    lbl = lbl || {}; hl = hl || '';
    var A = [215, 18], D = [20, 150], E = [300, 150], t = 0.55;
    var B = [A[0] + (D[0] - A[0]) * t, A[1] + (D[1] - A[1]) * t], C = [A[0] + (E[0] - A[0]) * t, A[1] + (E[1] - A[1]) * t];
    var P = function (p) { return f1(p[0]) + ',' + f1(p[1]); };
    var s = '<polygon class="fg-tri-fill" points="' + [A, D, E].map(P).join(' ') + '"/>';
    var seg = function (p, q, name) { return '<line class="fg-side' + (hl.indexOf('top') >= 0 && /AB|AC/.test(name) ? ' fg-side-top' : '') + (hl.indexOf('bot') >= 0 && /BD|CE/.test(name) ? ' fg-side-bot' : '') + '" x1="' + f1(p[0]) + '" y1="' + f1(p[1]) + '" x2="' + f1(q[0]) + '" y2="' + f1(q[1]) + '"/>'; };
    s += seg(A, B, 'AB') + seg(B, D, 'BD') + seg(A, C, 'AC') + seg(C, E, 'CE') + seg(D, E, 'DE');
    s += '<line class="fg-par" x1="' + P(B).replace(',', '" y1="') + '" x2="' + P(C).replace(',', '" y2="') + '"/>';
    s += '<line class="fg-par" x1="' + f1(D[0]) + '" y1="' + f1(D[1]) + '" x2="' + f1(E[0]) + '" y2="' + f1(E[1]) + '"/>';
    // marquinhas de paralelas
    var mk = function (p, q) { var mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; return '<path class="fg-par-mk" d="M' + f1(mx - 4) + ' ' + f1(my - 5) + ' l6 5 l-6 5"/>'; };
    s += mk(B, C) + mk(D, E);
    s += T(A[0], A[1] - 6, 'A') + T(B[0] - 9, B[1] - 2, 'B') + T(C[0] + 9, C[1] - 2, 'C') + T(D[0] - 8, D[1] + 4, 'D') + T(E[0] + 8, E[1] + 4, 'E');
    var mid = function (p, q, dx, dy, txt) { return txt ? T((p[0] + q[0]) / 2 + dx, (p[1] + q[1]) / 2 + dy, txt, 'fg-dim fg-mid') : ''; };
    s += mid(A, B, -18, -4, lbl.AB) + mid(B, D, -18, -4, lbl.BD) + mid(A, C, 18, -2, lbl.AC) + mid(C, E, 18, -2, lbl.CE);
    return '<svg class="fig fig-thales" viewBox="0 0 330 168" role="img" aria-label="Triângulo ADE com BC paralelo a DE">' + s + '</svg>';
  };

  // Triângulo com os três ângulos (aula 132, Q2)
  F4.angles = function (vals) {
    var s = '<polygon class="fg-tri-fill" points="30,140 290,140 120,30"/>';
    s += '<polygon class="fg-tri-line" points="30,140 290,140 120,30"/>';
    var lab = function (x, y, t, c) { return T(x, y, t, 'fg-ang ' + c); };
    s += lab(62, 132, vals[0], 'p0') + lab(250, 132, vals[1], 'p1') + lab(122, 58, vals[2], 'p2');
    return '<svg class="fig fig-ang" viewBox="0 0 320 156" role="img" aria-label="Triângulo e seus três ângulos internos">' + s + '</svg>';
  };

  window.GM_B4 = { H: H, F: F4, L: L, CT: CT };

  /* ---------- Montador de questões ---------- */
  // o = { aula, n, skill, gen, params: [original, v1, v2, v3], note? }
  window.GM_B4.question = function (o) {
    var base = o.gen(o.params[0], true);
    return {
      uid: o.aula + '-' + o.n, ref: { aula: o.aula, n: o.n }, skill: o.skill,
      prompt: base.prompt, figure: base.figure, table: base.table, note: base.note, items: base.items,
      variations: o.params.slice(1).map(function (p, i) {
        var v = o.gen(p, false);
        v.id = 'v' + (i + 1);
        v.params = p;
        return v;
      })
    };
  };
  // exam = { id, title, badge, name, meta, content, color, aulas: { 126: 'título' }, questions }
  window.GM_B4.exam = function (e) {
    e.bim = 4;
    e.questions.forEach(function (q, i) { q.n = i + 1; });
    window.GM_BANK.exams.push(e);
    return e;
  };
})();
