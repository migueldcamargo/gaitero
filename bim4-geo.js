/* =====================================================================
   GAITERO MATH — 4º Bimestre · GEOMETRIA
   Aula 142 (áreas e conversão de unidades) e aula 145 (área de triângulos).
   As figuras foram conferidas nas FOTOS da apostila (o PDF digitado é só um
   esboço): o quadriculado da aula 142 e as medidas do terreno vêm da foto.
   ===================================================================== */
(function () {
  'use strict';
  var B4 = window.GM_B4, H = B4.H, F = B4.F, CT = B4.CT;
  var br = H.br, m = H.m, calc = H.calc, lines = H.lines, small = H.small, aside = H.aside;
  var T = F.T, f1 = F.f1;
  var G = B4.G;
  var r6 = function (v) { return Math.round(v * 1e6) / 1e6; };

  /* ---------- Figuras ---------- */
  // Quadriculado 8 × 10 com regiões. regions = { A: [[linha, coluna], ...] } (1 a 10, 1 a 8)
  var GRID_ORDER = ['A', 'B', 'C', 'D', 'E'];
  function gridFig(regions, focus, opt) {
    opt = opt || {};
    var U = 24, cols = 8, rows = 10, X0 = 6, Y0 = 6, s = '';
    var owner = {};
    GRID_ORDER.forEach(function (k) { (regions[k] || []).forEach(function (c) { owner[c[0] + ',' + c[1]] = k; }); });
    for (var r = 1; r <= rows; r++) {
      for (var c = 1; c <= cols; c++) {
        var k = owner[r + ',' + c], cls = 'fg-cell' + (k ? ' fg-reg' + (focus ? (k === focus ? ' fg-reg-on' : ' fg-reg-off') : '') : '');
        s += '<rect class="' + cls + '" x="' + (X0 + (c - 1) * U) + '" y="' + (Y0 + (r - 1) * U) + '" width="' + U + '" height="' + U + '"/>';
      }
    }
    GRID_ORDER.forEach(function (k) {
      var cells = regions[k]; if (!cells) return;
      var lab = cells[opt.labelAt && opt.labelAt[k] != null ? opt.labelAt[k] : Math.floor((cells.length - 1) / 2)];
      s += T(X0 + (lab[1] - 0.5) * U, Y0 + (lab[0] - 0.5) * U + 4, k, 'fg-reg-lbl' + (focus && k !== focus ? ' fg-reg-lbl-off' : ''));
    });
    // contagem por linha da região em foco
    if (focus && opt.rowCounts) {
      var byRow = {};
      regions[focus].forEach(function (c) { byRow[c[0]] = (byRow[c[0]] || 0) + 1; });
      Object.keys(byRow).forEach(function (r) { s += T(X0 + cols * U + 16, Y0 + (r - 0.5) * U + 4, byRow[r], 'fg-rowcount'); });
    }
    var W = X0 + cols * U + (opt.rowCounts ? 30 : 6);
    return '<svg class="fig fig-grid" viewBox="0 0 ' + W + ' ' + (Y0 + rows * U + 6) + '" role="img" aria-label="Quadriculado com as regiões sombreadas' + (focus ? ', destaque na região ' + focus : '') + '">' + s + '</svg>';
  }
  // Terreno em três retângulos. p = { total, wM, wR, hL, hUp, hR }; mode: 'q' (enunciado) | 'split' | 'full'
  function landFig(p, mode) {
    var wL = r6(p.total - p.wM - p.wR), hM = r6(p.hL + p.hUp);
    var maxH = Math.max(hM, p.hR, p.hL), k = Math.min(270 / p.total, 150 / maxH);
    var X0 = 40, base = 22 + maxH * k, s = '';
    var X = function (x) { return X0 + x * k; }, Y = function (y) { return base - y * k; };
    var rect = function (x, w, h, cls) { return '<rect class="' + cls + '" x="' + f1(X(x)) + '" y="' + f1(Y(h)) + '" width="' + f1(w * k) + '" height="' + f1(h * k) + '"/>'; };
    var split = mode !== 'q';
    s += rect(0, wL, p.hL, split ? 'fg-land fg-land1' : 'fg-land');
    s += rect(wL, p.wM, hM, split ? 'fg-land fg-land2' : 'fg-land');
    s += rect(wL + p.wM, p.wR, p.hR, split ? 'fg-land fg-land3' : 'fg-land');
    var pts = [[0, 0], [0, p.hL], [wL, p.hL], [wL, hM], [wL + p.wM, hM], [wL + p.wM, p.hR], [p.total, p.hR], [p.total, 0]];
    s += '<polygon class="fg-land-out" points="' + pts.map(function (q) { return f1(X(q[0])) + ',' + f1(Y(q[1])); }).join(' ') + '"/>';
    if (split) {
      s += '<line class="fg-dash" x1="' + f1(X(wL)) + '" y1="' + f1(Y(p.hL)) + '" x2="' + f1(X(wL)) + '" y2="' + f1(Y(0)) + '"/>';
      s += '<line class="fg-dash" x1="' + f1(X(wL + p.wM)) + '" y1="' + f1(Y(p.hR)) + '" x2="' + f1(X(wL + p.wM)) + '" y2="' + f1(Y(0)) + '"/>';
      var lbl = function (x, w, h, t) { return T(X(x + w / 2), Y(h / 2) + 4, t, 'fg-land-lbl'); };
      s += lbl(0, wL, p.hL, mode === 'full' ? br(r6(wL * p.hL)) + ' m²' : 'A₁') + lbl(wL, p.wM, hM, mode === 'full' ? br(r6(p.wM * hM)) + ' m²' : 'A₂') + lbl(wL + p.wM, p.wR, p.hR, mode === 'full' ? br(r6(p.wR * p.hR)) + ' m²' : 'A₃');
    }
    s += T(X(wL + p.wM / 2), Y(hM) - 6, br(p.wM) + ' m', 'fg-dim fg-mid');
    s += T(X(wL + p.wM + p.wR / 2), Y(p.hR) - 6, br(p.wR) + ' m', 'fg-dim fg-mid');
    s += T(X(0) - 18, Y(p.hL / 2) + 4, br(p.hL) + ' m', 'fg-dim fg-mid');
    s += T(X(wL) - 18, Y(p.hL + p.hUp / 2) + 4, br(p.hUp) + ' m', 'fg-dim fg-mid');
    s += T(X(p.total) + 18, Y(p.hR / 2) + 4, br(p.hR) + ' m', 'fg-dim fg-mid');
    s += T(X(p.total / 2), base + 16, br(p.total) + ' m', 'fg-dim fg-mid');
    if (split) {
      s += T(X(wL / 2), base + 16, mode === 'full' ? br(wL) + ' m' : '? m', 'fg-dim fg-mid fg-new');
    }
    return '<svg class="fig fig-land" viewBox="0 0 ' + Math.ceil(X(p.total) + 40) + ' ' + Math.ceil(base + 24) + '" role="img" aria-label="Terreno formado por três retângulos">' + s + '</svg>';
  }
  // Triângulo com base e altura; mode: 'plain' | 'rect' (dentro do retângulo, metades marcadas)
  function triFig(b, h, mode, apexFrac) {
    var t = apexFrac == null ? 0.35 : apexFrac, k = Math.min(260 / b, 130 / h), X0 = 30, base = 20 + h * k, s = '';
    var A = [X0, base], Bp = [X0 + b * k, base], C = [X0 + b * t * k, base - h * k], foot = [C[0], base];
    var P = function (q) { return f1(q[0]) + ',' + f1(q[1]); };
    if (mode === 'rect') {
      s += '<rect class="fg-ghost" x="' + X0 + '" y="' + f1(base - h * k) + '" width="' + f1(b * k) + '" height="' + f1(h * k) + '"/>';
      s += '<polygon class="fg-half1" points="' + [A, foot, C].map(P).join(' ') + '"/><polygon class="fg-half2" points="' + [foot, Bp, C].map(P).join(' ') + '"/>';
      s += '<polygon class="fg-half1 fg-faint" points="' + [A, C, [A[0], C[1]]].map(P).join(' ') + '"/><polygon class="fg-half2 fg-faint" points="' + [Bp, C, [Bp[0], C[1]]].map(P).join(' ') + '"/>';
    } else s += '<polygon class="fg-tri-fill" points="' + [A, Bp, C].map(P).join(' ') + '"/>';
    s += '<polygon class="fg-tri-line" points="' + [A, Bp, C].map(P).join(' ') + '"/>';
    s += '<line class="fg-height" x1="' + f1(C[0]) + '" y1="' + f1(C[1]) + '" x2="' + f1(foot[0]) + '" y2="' + f1(foot[1]) + '"/>';
    s += '<path class="fg-right" d="M' + f1(foot[0] + 6) + ' ' + f1(base) + ' v-6 h-6"/>';
    s += '<line class="fg-base" x1="' + f1(A[0]) + '" y1="' + f1(base) + '" x2="' + f1(Bp[0]) + '" y2="' + f1(base) + '"/>';
    s += T((A[0] + Bp[0]) / 2, base + 16, 'base = ' + br(b), 'fg-dim fg-mid fg-base-t');
    s += T(C[0] + 8, (C[1] + base) / 2 + 4, 'h = ' + br(h), 'fg-dim fg-height-t', ' text-anchor="start"');
    return '<svg class="fig fig-tri" viewBox="0 0 ' + Math.ceil(X0 + b * k + 30) + ' ' + Math.ceil(base + 24) + '" role="img" aria-label="Triângulo de base ' + br(b) + ' e altura ' + br(h) + '">' + s + '</svg>';
  }
  // Isósceles/equilátero: lados iguais L, base b, altura do vértice de cima. lbl = { h, half }
  function isoFig(L, b, lbl) {
    lbl = lbl || {};
    var h = Math.sqrt(L * L - b * b / 4), k = Math.min(240 / b, 140 / h), X0 = 40, base = 20 + h * k, s = '';
    var A = [X0, base], Bp = [X0 + b * k, base], C = [X0 + b * k / 2, base - h * k], M = [C[0], base];
    var P = function (q) { return f1(q[0]) + ',' + f1(q[1]); };
    s += '<polygon class="fg-half1" points="' + [A, M, C].map(P).join(' ') + '"/><polygon class="fg-half2" points="' + [M, Bp, C].map(P).join(' ') + '"/>';
    s += '<polygon class="fg-tri-line" points="' + [A, Bp, C].map(P).join(' ') + '"/>';
    s += '<line class="fg-height" x1="' + f1(C[0]) + '" y1="' + f1(C[1]) + '" x2="' + f1(M[0]) + '" y2="' + f1(M[1]) + '"/>';
    s += '<path class="fg-right" d="M' + f1(M[0] + 6) + ' ' + f1(base) + ' v-6 h-6"/>';
    s += T((A[0] + C[0]) / 2 - 14, (A[1] + C[1]) / 2, br(L), 'fg-dim fg-mid') + T((Bp[0] + C[0]) / 2 + 14, (Bp[1] + C[1]) / 2, br(L), 'fg-dim fg-mid');
    s += T((A[0] + M[0]) / 2, base + 16, lbl.half || '?', 'fg-dim fg-mid') + T((M[0] + Bp[0]) / 2, base + 16, lbl.half2 || lbl.half || '?', 'fg-dim fg-mid');
    s += T(C[0] + 6, (C[1] + base) / 2 + 4, lbl.h || 'h', 'fg-dim fg-height-t', ' text-anchor="start"');
    return '<svg class="fig fig-iso" viewBox="0 0 ' + Math.ceil(X0 * 2 + b * k) + ' ' + Math.ceil(base + 24) + '" role="img" aria-label="Triângulo com a altura dividindo a base">' + s + '</svg>';
  }
  // Muro: retângulo L × A; parte escura = triângulo com base embaixo e vértice em cima
  function wallFig(Lw, Hw, lbl) {
    lbl = lbl || {};
    var k = Math.min(280 / Lw, 110 / Hw), X0 = 20, Y0 = 14, W = Lw * k, Ht = Hw * k, ax = X0 + W * 0.73, s = '';
    s += '<rect class="fg-wall-light" x="' + X0 + '" y="' + Y0 + '" width="' + f1(W) + '" height="' + f1(Ht) + '"/>';
    s += '<polygon class="fg-wall-dark" points="' + X0 + ',' + f1(Y0 + Ht) + ' ' + f1(X0 + W) + ',' + f1(Y0 + Ht) + ' ' + f1(ax) + ',' + Y0 + '"/>';
    s += '<rect class="fg-wall-out" x="' + X0 + '" y="' + Y0 + '" width="' + f1(W) + '" height="' + f1(Ht) + '"/>';
    if (lbl.h) s += '<line class="fg-height" x1="' + f1(ax) + '" y1="' + Y0 + '" x2="' + f1(ax) + '" y2="' + f1(Y0 + Ht) + '"/>';
    s += T(X0 + W / 2, Y0 + Ht + 16, br(Lw) + ' m', 'fg-dim fg-mid') + T(X0 + W + 14, Y0 + Ht / 2 + 4, br(Hw) + ' m', 'fg-dim fg-mid');
    if (lbl.dark) s += T(X0 + W * 0.6, Y0 + Ht * 0.72, lbl.dark, 'fg-wall-t');
    if (lbl.light) s += T(X0 + W * 0.22, Y0 + Ht * 0.3, lbl.light, 'fg-wall-t2');
    return '<svg class="fig fig-wall" viewBox="0 0 ' + Math.ceil(X0 + W + 34) + ' ' + Math.ceil(Y0 + Ht + 24) + '" role="img" aria-label="Muro retangular com uma parte escura em forma de triângulo">' + s + '</svg>';
  }
  B4.F.tri = triFig; B4.F.iso = isoFig;

  /* ================= Aula 142 · Q1 — regiões no quadriculado ================= */
  var unitConcept = { t: 'O que é área?', cls: 'concept', b: '<b>Área</b> é a quantidade de quadradinhos de 1 unidade que cabem <b>dentro</b> da figura. Aqui cada quadradinho do quadriculado mede <b>1 cm por 1 cm</b>, então vale <b>1 cm²</b> (um centímetro quadrado). Para achar a área, é só <b>contar os quadradinhos</b> sombreados.' };
  function gridItem(key, regions, labelAt) {
    var cells = regions[key], byRow = {};
    cells.forEach(function (c) { byRow[c[0]] = (byRow[c[0]] || 0) + 1; });
    var rowsK = Object.keys(byRow).map(Number).sort(function (a, b) { return a - b; });
    var n = cells.length, byCol = {};
    cells.forEach(function (c) { byCol[c[1]] = (byCol[c[1]] || 0) + 1; });
    var colsK = Object.keys(byCol).map(Number).sort(function (a, b) { return a - b; });
    var isRect = rowsK.length * colsK.length === n;
    return {
      key: key, label: 'Região', prompt: key,
      answer: { type: 'integer', value: n, suffix: 'cm²', placeholder: 'Área' },
      hint: { rules: ['area-contar'], tip: 'Cada quadradinho vale <b>1 cm²</b>. Conte quantos quadradinhos a região ' + key + ' tem.',
        more: ['Conte <b>linha por linha</b> e anote quantos tem em cada uma.', 'Some os números das linhas. Se a região for um retângulo, dá para fazer linhas × colunas.'] },
      hints: [{ when: function (v) { return Math.abs(v - n) <= 2; }, msg: 'Está perto! Conte de novo, linha por linha, sem pular nem repetir quadradinho.' }],
      final: n + ' cm²',
      steps: { list: [
        unitConcept,
        { t: 'A região ' + key, b: 'Vamos olhar só para a região <b>' + key + '</b> (as outras ficam apagadas). Os números à direita mostram quantos quadradinhos ela tem em cada linha.', fig: gridFig(regions, key, { rowCounts: true, labelAt: labelAt }) },
        { t: 'Contando linha por linha', b: lines(rowsK.map(function (r, i) { return (i + 1) + 'ª linha da região: <b>' + byRow[r] + '</b> ' + (byRow[r] === 1 ? 'quadradinho' : 'quadradinhos'); })) +
            'Somando:' + calc(m(rowsK.map(function (r) { return byRow[r]; }).join(' + ') + ' = ' + n)) },
        isRect ? { t: 'Outro jeito: é um retângulo!', b: 'A região ' + key + ' é um retângulo de ' + rowsK.length + ' linhas por ' + colsK.length + ' colunas. Área do retângulo = comprimento × largura:' + calc(m(colsK.length + ' * ' + rowsK.length + ' = ' + n)) }
          : { t: 'Dica para contar sem errar', b: 'A região não é um retângulo, então contar por linhas é o jeito mais seguro. Outra opção é separá-la em retângulos menores e somar as áreas deles.' },
        { t: 'Resposta final', cls: 'final', b: 'A região ' + key + ' tem ' + n + ' quadradinhos: a área é <b>' + n + ' cm²</b>.' },
        { t: 'Conferindo se faz sentido', cls: 'check', b: 'Contando agora por <b>colunas</b>: [[' + colsK.map(function (c) { return byCol[c]; }).join(' + ') + ' = ' + n + ']] ✓. Deu o mesmo número.' }
      ] }
    };
  }
  G['142-1'] = function (p) {
    return {
      prompt: 'Calcule a área de cada uma das regiões sombreadas no quadriculado a seguir. A unidade de área é o cm².',
      figure: gridFig(p.regions, null, { labelAt: p.labelAt }),
      note: 'Cada quadradinho do quadriculado mede 1 cm × 1 cm.',
      items: GRID_ORDER.map(function (k) { var it = gridItem(k, p.regions, p.labelAt); it.label = ''; it.prompt = 'Região <b>' + k + '</b>'; return it; })
    };
  };
  var rng = function (r, c1, c2) { var o = []; for (var c = c1; c <= c2; c++) o.push([r, c]); return o; };
  var colR = function (c, r1, r2) { var o = []; for (var r = r1; r <= r2; r++) o.push([r, c]); return o; };
  var cat = function () { return [].concat.apply([], arguments); };
  var GRID_ORIG = {   // conferido na foto da aula 142
    A: cat(rng(1, 2, 4), rng(2, 2, 4)),
    B: cat([[1, 6], [1, 8]], rng(2, 6, 8), [[3, 6], [3, 8]]),
    C: colR(1, 4, 8),
    D: cat([[4, 4]], rng(5, 4, 8), [[6, 8]]),
    E: cat([[7, 5]], rng(8, 4, 6), rng(9, 3, 7), rng(10, 2, 8))
  };

  /* ================= Aula 142 · Q2 — terreno ================= */
  G['142-2'] = function (p) {
    var wL = r6(p.total - p.wM - p.wR), hM = r6(p.hL + p.hUp);
    var a1 = r6(wL * p.hL), a2 = r6(p.wM * hM), a3 = r6(p.wR * p.hR), A = r6(a1 + a2 + a3), Acm = r6(A * 10000);
    var bigR = r6(p.total * Math.max(hM, p.hR, p.hL));
    var times = function (a, b) { return CT.timesBlock(a, b); };
    var commonHint = { rules: ['area-composta4', 'area-retangulo4'], tip: 'Divida o terreno em <b>três retângulos</b> e calcule a área de cada um.',
      more: ['Algumas medidas não aparecem: a largura do retângulo da esquerda é [[' + br(p.total) + ' - ' + br(p.wM) + ' - ' + br(p.wR) + ']], e a altura do retângulo do meio é [[' + br(p.hL) + ' + ' + br(p.hUp) + ']].', 'Área de cada retângulo = comprimento × largura. Depois some as três.'] };
    var areaSteps = [
      { t: 'Dividindo em retângulos', b: 'O terreno não é um retângulo, mas dá para <b>dividir</b> em três retângulos (A₁, A₂ e A₃) que não se sobrepõem. A área total é a soma das três áreas.', fig: landFig(p, 'split') },
      { t: 'As medidas que não aparecem', b: '<b>Largura de A₁:</b> o terreno todo tem ' + br(p.total) + ' m embaixo. A₂ ocupa ' + br(p.wM) + ' m e A₃ ocupa ' + br(p.wR) + ' m. Sobra para A₁:' + calc(m(br(p.total) + ' - ' + br(p.wM) + ' - ' + br(p.wR) + ' = ' + br(wL)) + ' m') +
          '<b>Altura de A₂:</b> do lado esquerdo dele, a figura mostra ' + br(p.hL) + ' m (a altura de A₁) e mais ' + br(p.hUp) + ' m acima:' + calc(m(br(p.hL) + ' + ' + br(p.hUp) + ' = ' + br(hM)) + ' m') },
      { t: 'Área de A₁', b: 'Retângulo de ' + br(wL) + ' m por ' + br(p.hL) + ' m:' + times(wL, p.hL).replace('</div>', ' m²</div>') },
      { t: 'Área de A₂', b: 'Retângulo de ' + br(p.wM) + ' m por ' + br(hM) + ' m:' + times(p.wM, hM).replace('</div>', ' m²</div>') },
      { t: 'Área de A₃', b: 'Retângulo de ' + br(p.wR) + ' m por ' + br(p.hR) + ' m:' + times(p.wR, p.hR).replace('</div>', ' m²</div>') },
      { t: 'Somando as três áreas', b: calc(m(br(a1) + ' + ' + br(a2) + ' + ' + br(a3) + ' = ' + br(A)) + ' m²'), fig: landFig(p, 'full') }
    ];
    var m2cm = { t: 'De m² para cm²', cls: 'concept', b: 'Um <b>metro quadrado</b> é um quadrado de 1 m por 1 m. Como 1 m = 100 cm, ele é um quadrado de <b>100 cm por 100 cm</b>:' + calc(m('1 m^2 = 100 cm * 100 cm = 10.000 cm^2')) +
      'Na tabela de áreas, cada degrau (m² → dm² → cm²) multiplica por 100. São dois degraus: [[100 * 100 = 10.000]].' + aside('Cuidado: com comprimento, 1 m = 100 cm. Com área, 1 m² = 10.000 cm², porque são duas medidas (comprimento e largura) sendo convertidas.') };
    var sh = CT.shiftStep(A, 4, true);
    return {
      prompt: 'Dado o terreno a seguir, determine sua área em m² e em cm² e construa este terreno no Scratch (ou Snap!). Considerando 1 m = 10 passos.',
      figure: landFig(p, 'q'),
      note: 'A construção no Scratch (ou Snap!) é feita no computador. No app, responda as duas áreas. Dica para o Scratch: com 1 m = 10 passos, a base de ' + br(p.total) + ' m vira ' + br(p.total * 10) + ' passos.',
      items: [
        { key: 'a', label: 'a)', prompt: 'Área em m²',
          answer: { type: 'number', value: A, suffix: 'm²', placeholder: 'Área' },
          hint: commonHint,
          hints: [{ when: bigR, msg: 'Essa é a área do retângulo que cobre o terreno todo. Mas o terreno tem "degraus": divida em três retângulos.' }, { when: r6(p.total * p.hR + p.wM * p.hUp), msg: 'Confira as medidas de cada retângulo: a largura do da esquerda é o que sobra dos ' + br(p.total) + ' m.' }].filter(function (h) { return Math.abs(h.when - A) > 1e-6; }),
          final: br(A) + ' m²',
          steps: { list: areaSteps.concat([
            { t: 'Resposta final', cls: 'final', b: 'A área do terreno é <b>' + br(A) + ' m²</b>.' },
            { t: 'Conferindo de outro jeito', cls: 'check', b: 'O retângulo que cobre tudo tem [[' + br(p.total) + ' * ' + br(Math.max(hM, p.hR, p.hL)) + ' = ' + br(bigR) + ']] m². Tirando os dois "cantos vazios" de cima, [[' + br(wL) + ' * ' + br(r6(hM - p.hL)) + ' = ' + br(r6(wL * (hM - p.hL))) + ']] e [[' + br(p.wR) + ' * ' + br(r6(hM - p.hR)) + ' = ' + br(r6(p.wR * (hM - p.hR))) + ']], sobra [[' + br(bigR) + ' - ' + br(r6(wL * (hM - p.hL))) + ' - ' + br(r6(p.wR * (hM - p.hR))) + ' = ' + br(r6(bigR - wL * (hM - p.hL) - p.wR * (hM - p.hR))) + ']] m² ✓.' }
          ]) } },
        { key: 'b', label: 'b)', prompt: 'Área em cm²',
          answer: { type: 'number', value: Acm, suffix: 'cm²', placeholder: 'Área' },
          hint: { rules: ['conv-area'], tip: 'Primeiro ache a área em m² (item a). Depois converta: quantos cm² cabem em 1 m²?',
            more: ['1 m² é um quadrado de 100 cm por 100 cm.', 'Então 1 m² = 10.000 cm². Multiplique a área em m² por 10.000.'] },
          hints: [{ when: r6(A * 100), msg: 'Com área, não é × 100! 1 m² = 100 cm × 100 cm = <b>10.000 cm²</b>.' }],
          final: br(Acm) + ' cm²',
          steps: { list: [
            { t: 'A área em m²', b: 'No item a, a área do terreno deu <b>' + br(A) + ' m²</b> (três retângulos somados).', fig: landFig(p, 'full') },
            m2cm,
            { t: 'Convertendo', b: 'Multiplicamos por 10.000:' + calc(m(br(A) + ' * 10.000')) + sh.b },
            { t: 'Resposta final', cls: 'final', b: 'A área do terreno é <b>' + br(Acm) + ' cm²</b>.' },
            { t: 'Conferindo se faz sentido', cls: 'check', b: 'O número em cm² ficou bem maior, como esperado: o cm² é um quadradinho muito menor que o m², então cabem muitos mais ✓. Voltando: ' + br(Acm) + ' dividido por 10.000 (vírgula 4 casas para a esquerda) dá ' + br(A) + ' m² ✓.' }
          ] } }
      ]
    };
  };

  /* ================= Aula 145 ================= */
  var whyHalf = function (b, h) {
    return { t: 'Por que dividir por 2?', cls: 'concept', b: 'Desenhe um retângulo em volta do triângulo, com a mesma base e a mesma altura. A altura divide tudo em duas partes, e em cada parte o triângulo ocupa <b>exatamente a metade</b> (as partes de cor mais fraca são cópias iguais das partes do triângulo). Então:' +
      calc('área do triângulo = [[frac{base * altura}{2}]]') + 'A área do retângulo seria [[' + br(b) + ' * ' + br(h) + ']]; o triângulo é a metade disso.', fig: triFig(b, h, 'rect') };
  };
  var pitConcept = { t: 'Teorema de Pitágoras', cls: 'concept', b: 'Num <b>triângulo retângulo</b> (que tem um ângulo de 90°, o cantinho quadrado):<ul class="sp-rules"><li>a <b>hipotenusa</b> é o lado <b>oposto</b> ao ângulo reto — é sempre o <b>maior</b> lado;</li><li>os <b>catetos</b> são os dois lados que formam o ângulo reto.</li></ul>' +
    calc('[[hipotenusa^2 = cateto^2 + cateto^2]]') + 'Exemplo: catetos 3 e 4 → [[3^2 + 4^2 = 9 + 16 = 25 = 5^2]]: a hipotenusa é 5.' };
  // Q1
  G['145-1'] = function (p) {
    var A = r6(p.b * p.h / 2);
    return {
      prompt: 'Um triângulo tem base de ' + br(p.b) + ' metros e altura relativa a essa base de ' + br(p.h) + ' metros. Qual é a sua área?',
      items: [{
        key: 'u',
        answer: { type: 'number', value: A, suffix: 'm²', placeholder: 'Área' },
        hint: { rules: ['area-triangulo'], tip: 'Área do triângulo = [[frac{base * altura}{2}]].',
          more: ['O triângulo é a <b>metade</b> de um retângulo com a mesma base e a mesma altura.', 'Faça [[' + br(p.b) + ' * ' + br(p.h) + ']] e divida por 2.'] },
        hints: [{ when: r6(p.b * p.h), msg: 'Essa seria a área do <b>retângulo</b>. O triângulo é a metade dele: falta dividir por 2.' }, { when: r6(p.b + p.h), msg: 'Área é base <b>vezes</b> altura (dividido por 2), não base mais altura.' }],
        final: br(A) + ' m²',
        steps: { list: [
          { t: 'O que a questão dá', b: 'A <b>base</b> mede ' + br(p.b) + ' m e a <b>altura</b> (o segmento que sai do vértice de cima e cai na base formando 90°) mede ' + br(p.h) + ' m.', fig: triFig(p.b, p.h, 'plain') },
          whyHalf(p.b, p.h),
          { t: 'Fazendo a conta', b: lines(['[[A = frac{' + br(p.b) + ' * ' + br(p.h) + '}{2}]]', '[[A = frac{' + br(r6(p.b * p.h)) + '}{2} = ' + br(A) + ']]' + small('metade de ' + br(r6(p.b * p.h)) + ' é ' + br(A))]) },
          { t: 'Resposta final', cls: 'final', b: 'A área do triângulo é <b>' + br(A) + ' m²</b>.' },
          { t: 'Conferindo se faz sentido', cls: 'check', b: 'O retângulo de ' + br(p.b) + ' m por ' + br(p.h) + ' m teria ' + br(r6(p.b * p.h)) + ' m², e o triângulo ocupa a metade: ' + br(A) + ' m² ✓. A unidade é m² porque multiplicamos metro por metro ✓.' }
        ] }
      }]
    };
  };
  // Q2 — isósceles L, L, b
  G['145-2'] = function (p) {
    var L = p.L, b = p.b, hb = b / 2, h = Math.sqrt(L * L - hb * hb), A = r6(b * h / 2);
    var hTxt = br(r6(h));
    return {
      prompt: 'Esboce um desenho representando um triângulo isósceles cujos lados medem ' + L + ' cm, ' + L + ' cm e ' + b + ' cm.',
      figure: isoFig(L, b, { h: 'h', half: '' }),
      note: 'No app o desenho já está pronto: a altura (tracejada) sai do vértice de cima e cai na base.',
      items: [
        { key: 'a', label: 'a)', prompt: 'Mostre que o pé da altura é o ponto médio da base. Qual é a justificativa correta?',
          answer: { type: 'choice', layout: 'rows', correct: 'pit', options: [
            { id: 'sempre', html: 'A altura de qualquer triângulo sempre cai no meio da base.', hint: 'Não é verdade para todo triângulo: num triângulo com lados diferentes, a altura cai fora do meio. Aqui o motivo são os <b>dois lados iguais</b>.' },
            { id: 'pit', html: 'Os dois triângulos retângulos formados têm a mesma hipotenusa (' + L + ' cm) e o mesmo cateto (a altura h). Por Pitágoras, os outros catetos também são iguais: ' + br(hb) + ' cm cada.' },
            { id: 'par', html: 'Porque ' + b + ' é um número par, e dá para dividir por 2.', hint: 'Ser par não tem a ver: qualquer medida pode ser dividida por 2. O motivo está nos <b>lados iguais</b> do triângulo.' },
            { id: 'h', html: 'Porque a altura mede ' + br(hb) + ' cm.', hint: 'A altura não mede isso. Pense nos dois triângulos retângulos que a altura forma.' }
          ] },
          hint: { rules: ['pitagoras'], tip: 'A altura divide o triângulo isósceles em <b>dois triângulos retângulos</b>.',
            more: ['O que esses dois triângulos têm em comum? Compare as hipotenusas e um dos catetos.', 'Se dois lados são iguais nos dois triângulos, Pitágoras garante que o terceiro também é igual.'] },
          final: 'Os dois pedaços da base são iguais (' + br(hb) + ' cm cada).',
          steps: { list: [
            { t: 'O desenho', b: 'Triângulo <b>isósceles</b> tem dois lados iguais: aqui, ' + L + ' cm e ' + L + ' cm. A base é o lado de ' + b + ' cm. A altura sai do vértice de cima e cai na base formando 90°. Ela divide a base em dois pedaços (os "?" do desenho).', fig: isoFig(L, b, { h: 'h' }) },
            pitConcept,
            { t: 'Os dois triângulos retângulos', b: 'A altura forma dois triângulos retângulos (verde e azul). Em <b>cada um</b>:<ul class="sp-rules"><li>a hipotenusa é um dos lados iguais: <b>' + L + ' cm</b>;</li><li>um cateto é a altura <b>h</b> (a mesma nos dois!);</li><li>o outro cateto é um pedaço da base.</li></ul>' },
            { t: 'Usando Pitágoras nos dois', b: 'Chamando os pedaços de [[p_1]] e [[p_2]]:' + lines(['[[p_1^2 + h^2 = ' + L + '^2]]', '[[p_2^2 + h^2 = ' + L + '^2]]']) + 'As duas contas são iguais! Então [[p_1^2 = p_2^2]], e como medidas são positivas, [[p_1 = p_2]]. Os dois pedaços são iguais: a altura cai no <b>meio</b> da base.' },
            { t: 'Resposta final', cls: 'final', b: 'O pé da altura é o <b>ponto médio</b> da base: cada pedaço mede [[frac{' + b + '}{2} = ' + br(hb) + ']] cm. Justificativa: a dos triângulos retângulos com mesma hipotenusa e mesmo cateto.', fig: isoFig(L, b, { h: 'h', half: br(hb) }) },
            { t: 'Conferindo se faz sentido', cls: 'check', b: '[[' + br(hb) + ' + ' + br(hb) + ' = ' + b + ']] ✓. O triângulo isósceles é simétrico: dobrando o papel na altura, as duas metades se encaixam.' }
          ] } },
        { key: 'b', label: 'b)', prompt: 'Calcule a área do triângulo.',
          answer: { type: 'number', value: A, suffix: 'cm²', placeholder: 'Área' },
          hint: { rules: ['pitagoras', 'area-triangulo'], tip: 'Para a área falta a <b>altura</b>. Use Pitágoras num dos triângulos retângulos.',
            more: ['A hipotenusa é ' + L + ' e um cateto é a metade da base, ' + br(hb) + '. Ache o outro cateto (a altura).', 'Depois: área = [[frac{base * altura}{2}]], com base ' + b + '.'] },
          hints: [{ when: r6(b * h), msg: 'Faltou dividir por 2.' }, { when: r6(b * L / 2), msg: 'O lado de ' + L + ' cm é inclinado, não é a altura. A altura forma 90° com a base: use Pitágoras.' }].filter(function (x) { return Math.abs(x.when - A) > 1e-6; }),
          final: br(A) + ' cm²',
          steps: { list: [
            { t: 'O que falta', b: 'Área = [[frac{base * altura}{2}]]. A base é ' + b + ' cm, mas a <b>altura</b> não foi dada. Atenção: o lado de ' + L + ' cm <b>não</b> é a altura (ele é inclinado).', fig: isoFig(L, b, { h: 'h = ?', half: br(hb) }) },
            pitConcept,
            { t: 'Achando a altura', b: 'No triângulo retângulo da esquerda: hipotenusa ' + L + ', catetos ' + br(hb) + ' e h:' +
                lines(['[[h^2 + ' + br(hb) + '^2 = ' + L + '^2]]', '[[h^2 + ' + br(hb * hb) + ' = ' + L * L + ']]', '[[h^2 = ' + L * L + ' - ' + br(hb * hb) + ' = ' + br(r6(L * L - hb * hb)) + ']]' + small('o ' + br(hb * hb) + ' que soma passa para o outro lado subtraindo'), '[[h = √' + br(r6(L * L - hb * hb)) + ' = ' + hTxt + ']]' + small(hTxt + ' · ' + hTxt + ' = ' + br(r6(L * L - hb * hb)))]) },
            { t: 'Calculando a área', b: lines(['[[A = frac{' + b + ' * ' + hTxt + '}{2} = frac{' + br(r6(b * h)) + '}{2} = ' + br(A) + ']]']), fig: isoFig(L, b, { h: 'h = ' + hTxt, half: br(hb) }) },
            { t: 'Resposta final', cls: 'final', b: 'A área do triângulo é <b>' + br(A) + ' cm²</b>.' },
            { t: 'Conferindo se faz sentido', cls: 'check', b: 'Pitágoras: [[' + br(hb) + '^2 + ' + hTxt + '^2 = ' + br(hb * hb) + ' + ' + br(r6(h * h)) + ' = ' + L * L + ' = ' + L + '^2]] ✓. A altura (' + hTxt + ') é menor que o lado inclinado (' + L + '), como tem que ser ✓.' }
          ] } }
      ]
    };
  };
  // Q3 — equilátero pelo perímetro
  G['145-3'] = function (p) {
    var P = p.per, L = P / 3, hb = L / 2, h2 = L * L - hb * hb, s = Math.round(hb);   // h = (L/2)√3
    var A = L * L * Math.sqrt(3) / 4, Ac = L * L / 4;
    return {
      prompt: 'Um triângulo equilátero tem perímetro de ' + P + ' cm. Qual é a sua área?',
      items: [{
        key: 'u',
        answer: { type: 'radical', value: A, canonical: br(Ac) + '√3', keys: [['/', '/']] },
        hint: { rules: ['triangulo-equilatero', 'pitagoras'], tip: 'Equilátero tem os <b>3 lados iguais</b>: quanto mede cada lado?',
          more: ['A altura divide a base no meio. Use Pitágoras: hipotenusa = lado, um cateto = metade do lado.', 'Deixe a raiz na resposta (forma exata): [[√108 = √{36 * 3} = 6√3]]. Depois, área = [[frac{base * altura}{2}]].'] },
        hints: [{ when: L * hb / 1, msg: 'Parece que você usou a metade do lado como altura. A altura sai de Pitágoras.' }, { when: L * L / 2, msg: 'Você usou o lado como altura. A altura é menor que o lado: use Pitágoras.' }].filter(function (x) { return Math.abs(x.when - A) > 1e-6; }),
        final: m(br(Ac) + '√3') + ' cm²',
        steps: { list: [
          { t: 'O lado do triângulo', b: '<b>Equilátero</b> = três lados iguais. O perímetro é a soma dos 3 lados:' + calc(m('lado = frac{' + P + '}{3} = ' + br(L)) + ' cm') },
          { t: 'A altura divide a base no meio', b: 'Num equilátero (que também é isósceles), a altura cai no <b>meio</b> da base. Ela forma um triângulo retângulo com hipotenusa ' + br(L) + ' e um cateto ' + br(hb) + '.', fig: isoFig(L, L, { h: 'h', half: br(hb) }) },
          pitConcept,
          { t: 'Achando a altura', b: lines(['[[h^2 + ' + br(hb) + '^2 = ' + br(L) + '^2]]', '[[h^2 + ' + br(hb * hb) + ' = ' + br(L * L) + ']]', '[[h^2 = ' + br(L * L) + ' - ' + br(hb * hb) + ' = ' + br(h2) + ']]', '[[h = √' + br(h2) + ']]']) +
              br(h2) + ' não é quadrado perfeito, mas dá para simplificar: [[' + br(h2) + ' = ' + br(hb * hb) + ' * 3]] e [[√' + br(hb * hb) + ' = ' + br(hb) + ']]:' + calc(m('h = √' + br(h2) + ' = √{' + br(hb * hb) + ' * 3} = ' + br(hb) + '√3') + ' cm') + aside('Usamos [[√{a * b} = √a * √b]]. A resposta fica com raiz porque [[√3]] não é um número exato ([[√3 ≈ 1,73]]).') },
          { t: 'Calculando a área', b: lines(['[[A = frac{base * altura}{2} = frac{' + br(L) + ' * ' + br(hb) + '√3}{2}]]', '[[A = frac{' + br(L * hb) + '√3}{2} = ' + br(Ac) + '√3]]' + small(br(L) + ' · ' + br(hb) + ' = ' + br(L * hb) + ', e a metade de ' + br(L * hb) + ' é ' + br(Ac) + '; a raiz fica como está')]) },
          { t: 'Resposta final', cls: 'final', b: 'A área é <b>' + m(br(Ac) + '√3') + ' cm²</b> (aproximadamente ' + br(Math.round(A * 100) / 100, 2) + ' cm²).' },
          { t: 'Conferindo se faz sentido', cls: 'check', b: 'Pela fórmula do equilátero (questão 4): [[A = frac{ℓ^2√3}{4} = frac{' + br(L) + '^2√3}{4} = frac{' + br(L * L) + '√3}{4} = ' + br(Ac) + '√3]] ✓.' }
        ] }
      }]
    };
  };
  // Q4 — fórmula do equilátero (original) ou aplicação (variações)
  G['145-4'] = function (p) {
    var derive = [
      { t: 'Desenhando', b: 'Triângulo equilátero de lado [[ℓ]] (a letra "éle"). A altura cai no meio da base, que fica dividida em dois pedaços de [[frac{ℓ}{2}]].', fig: isoFig(4, 4, { h: 'h', half: 'ℓ/2' }).replace(/>4</g, '>ℓ<') },
      pitConcept,
      { t: 'A altura em função de ℓ', b: 'Triângulo retângulo: hipotenusa [[ℓ]], catetos [[frac{ℓ}{2}]] e [[h]]:' +
          lines(['[[h^2 + (frac{ℓ}{2})^2 = ℓ^2]]', '[[h^2 + frac{ℓ^2}{4} = ℓ^2]]' + small('(ℓ/2)² = ℓ²/2² = ℓ²/4'), '[[h^2 = ℓ^2 - frac{ℓ^2}{4} = frac{4ℓ^2}{4} - frac{ℓ^2}{4} = frac{3ℓ^2}{4}]]' + small('um inteiro é 4/4'), '[[h = √{frac{3ℓ^2}{4}} = frac{√3 * ℓ}{2} = frac{ℓ√3}{2}]]' + small('√3 fica; √(ℓ²) = ℓ; √4 = 2')]) },
      { t: 'A área em função de ℓ', b: lines(['[[A = frac{base * altura}{2} = frac{ℓ * frac{ℓ√3}{2}}{2}]]', '[[A = frac{ℓ^2√3}{2} * frac{1}{2} = frac{ℓ^2√3}{4}]]' + small('dividir por 2 de novo: o 2 de baixo vira 4')]) }
    ];
    if (p.side == null) {
      return {
        prompt: 'Um triângulo equilátero tem lado de medida [[ℓ]]. Qual é a fórmula que dá a área desse triângulo para qualquer valor de [[ℓ]]?',
        items: [{
          key: 'u',
          answer: { type: 'choice', layout: 'list', correct: 'f', options: [
            { id: 'h', html: '[[A = frac{ℓ√3}{2}]]', hint: 'Essa é a <b>altura</b> do equilátero, não a área. Falta multiplicar pela base e dividir por 2.' },
            { id: 'q', html: '[[A = frac{ℓ^2}{2}]]', hint: 'Isso seria usar o próprio lado como altura. A altura é menor que o lado: use Pitágoras.' },
            { id: 'f', html: '[[A = frac{ℓ^2√3}{4}]]' },
            { id: 'd', html: '[[A = frac{ℓ^2√3}{2}]]', hint: 'Quase! Faltou dividir por 2 a área (base × altura ÷ 2).'.replace(' ÷ 2', ' dividido por 2') },
            { id: 'p', html: '[[A = 3ℓ]]', hint: '[[3ℓ]] é o <b>perímetro</b> (soma dos 3 lados), não a área.' }
          ] },
          hint: { rules: ['triangulo-equilatero', 'pitagoras'], tip: 'Faça igual à questão 3, mas com a letra [[ℓ]] no lugar do número.',
            more: ['A altura vem de Pitágoras: [[h^2 + (frac{ℓ}{2})^2 = ℓ^2]].', 'Você vai achar [[h = frac{ℓ√3}{2}]]. Agora use [[A = frac{base * altura}{2}]].'] },
          final: m('A = frac{ℓ^2√3}{4}'),
          steps: { list: derive.concat([
            { t: 'Resposta final', cls: 'final', b: 'Para qualquer lado [[ℓ]]:' + calc(m('A = frac{ℓ^2√3}{4}')) },
            { t: 'Conferindo se faz sentido', cls: 'check', b: 'Na questão 3, o lado era 12: [[frac{12^2√3}{4} = frac{144√3}{4} = 36√3]], o mesmo resultado ✓.' }
          ]) }
        }]
      };
    }
    var L = p.side, Ac = r6(L * L / 4), A = L * L * Math.sqrt(3) / 4;
    return {
      prompt: 'Usando a fórmula da área do triângulo equilátero, [[A = frac{ℓ^2√3}{4}]], calcule a área de um triângulo equilátero de lado ' + br(L) + ' cm.',
      items: [{
        key: 'u',
        answer: { type: 'radical', value: A, canonical: br(Ac) + '√3', keys: [['/', '/']] },
        hint: { rules: ['triangulo-equilatero'], tip: 'Troque o [[ℓ]] por ' + br(L) + ' na fórmula.', more: ['[[ℓ^2 = ' + br(L) + ' * ' + br(L) + ']].', 'Divida o resultado por 4 e deixe o [[√3]] na resposta.'] },
        final: m(br(Ac) + '√3') + ' cm²',
        steps: { list: [
          { t: 'De onde vem a fórmula', cls: 'concept', b: 'A fórmula [[A = frac{ℓ^2√3}{4}]] vem de Pitágoras: a altura do equilátero é [[frac{ℓ√3}{2}]], e a área é [[frac{base * altura}{2}]] (veja a resolução da questão original, no botão ↺).' },
          { t: 'O que a questão dá', b: 'O triângulo é <b>equilátero</b> (3 lados iguais) e o lado mede [[ℓ = ' + br(L) + ']] cm. A fórmula pede [[ℓ^2]], que é [[ℓ * ℓ]] (e não [[2ℓ]]!).', fig: isoFig(L, L, { h: 'h', half: br(L / 2) }) },
          { t: 'Trocando ℓ por ' + br(L), b: lines(['[[A = frac{' + br(L) + '^2√3}{4} = frac{' + br(L * L) + '√3}{4}]]', '[[A = ' + br(Ac) + '√3]]' + small(br(L * L) + ' dividido por 4 dá ' + br(Ac))]) },
          { t: 'Resposta final', cls: 'final', b: 'A área é <b>' + m(br(Ac) + '√3') + ' cm²</b> (≈ ' + br(Math.round(A * 100) / 100, 2) + ' cm²).' },
          { t: 'Conferindo se faz sentido', cls: 'check', b: 'Um quadrado de lado ' + br(L) + ' teria ' + br(L * L) + ' cm². O triângulo equilátero tem bem menos que a metade disso (≈ ' + br(Math.round(A * 100) / 100, 2) + ' cm²) ✓.' }
        ] }
      }]
    };
  };
  // Q5 — muro
  G['145-5'] = function (p) {
    var Lw = p.L, Hw = p.H, tot = r6(Lw * Hw), dark = r6(Lw * Hw / 2), light = r6(tot - dark), cost = r6(light * p.pl + dark * p.pd);
    var money = H.money;
    return {
      prompt: 'O desenho a seguir representa um muro pintado em duas cores. O muro tem ' + br(Lw) + ' metros de comprimento por ' + br(Hw) + ' metros de altura. O custo da pintura da parte clara é de ' + money(p.pl) + ' por m², enquanto que a pintura da parte escura custa ' + money(p.pd) + ' o m². Qual foi o custo total da pintura?',
      figure: wallFig(Lw, Hw),
      items: [{
        key: 'u',
        answer: { type: 'currency', value: cost, prefix: 'R$', placeholder: '0,00' },
        hint: { rules: ['area-triangulo', 'area-retangulo4'], tip: 'A parte escura é um <b>triângulo</b>: qual é a base e qual é a altura dele?',
          more: ['A base do triângulo escuro é o comprimento do muro, e a altura é a altura do muro (o vértice de cima encosta no topo).', 'Parte clara = muro inteiro − parte escura. Depois multiplique cada área pelo seu preço e some.'] },
        hints: [{ when: r6(tot * p.pd), msg: 'Você pagou o muro todo pelo preço da parte escura. Cada parte tem seu preço.' }, { when: r6(tot * (p.pl + p.pd)), msg: 'Cada parte é só um pedaço do muro: calcule a área de cada uma separadamente.' }, { when: r6(dark * p.pd), msg: 'Esse é só o custo da parte escura. Falta a clara.' }].filter(function (x) { return Math.abs(x.when - cost) > 1e-6; }),
        final: money(cost),
        steps: { list: [
          { t: 'Olhando o desenho', b: 'O muro é um retângulo de ' + br(Lw) + ' m por ' + br(Hw) + ' m. A parte <b>escura</b> é um triângulo: a base dele é o chão do muro (' + br(Lw) + ' m) e o vértice de cima encosta no topo, então a altura do triângulo é a altura do muro (' + br(Hw) + ' m). O resto é a parte <b>clara</b>.', fig: wallFig(Lw, Hw, { h: true }) },
          { t: 'Área do muro inteiro', b: calc(m(br(Lw) + ' * ' + br(Hw) + ' = ' + br(tot)) + ' m²') },
          { t: 'Área da parte escura (triângulo)', b: lines(['[[A = frac{base * altura}{2} = frac{' + br(Lw) + ' * ' + br(Hw) + '}{2} = frac{' + br(tot) + '}{2} = ' + br(dark) + ']] m²']) + aside('Não importa onde o vértice de cima está: com a mesma base e a mesma altura, a área é sempre a metade do retângulo.') },
          { t: 'Área da parte clara', b: 'É o que sobra do muro:' + calc(m(br(tot) + ' - ' + br(dark) + ' = ' + br(light)) + ' m²'), fig: wallFig(Lw, Hw, { dark: br(dark) + ' m²', light: br(light) + ' m²' }) },
          { t: 'O custo de cada parte', b: lines(['Clara: [[' + br(light) + ' * ' + br(p.pl, 2) + ' = ' + br(r6(light * p.pl), 2) + ']] reais' + small(br(light) + ' m² a ' + money(p.pl) + ' cada'), 'Escura: [[' + br(dark) + ' * ' + br(p.pd, 2) + ' = ' + br(r6(dark * p.pd), 2) + ']] reais' + small(br(dark) + ' m² a ' + money(p.pd) + ' cada')]) },
          { t: 'Somando', b: calc(m(br(r6(light * p.pl), 2) + ' + ' + br(r6(dark * p.pd), 2) + ' = ' + br(cost, 2)) + ' reais') },
          { t: 'Resposta final', cls: 'final', b: 'O custo total da pintura foi <b>' + money(cost) + '</b>.' },
          { t: 'Conferindo se faz sentido', cls: 'check', b: 'Se o muro todo fosse pintado da cor mais barata, custaria [[' + br(tot) + ' * ' + br(Math.min(p.pl, p.pd), 2) + ' = ' + br(r6(tot * Math.min(p.pl, p.pd)), 2) + ']]; e da mais cara, [[' + br(r6(tot * Math.max(p.pl, p.pd)), 2) + ']]. O custo real (' + money(cost) + ') ficou no meio ✓.' }
        ] }
      }]
    };
  };

  /* ================= Montagem: Geometria ================= */
  var Q = B4.question;
  B4.exam({
    id: 'geo', title: 'Geometria', badge: 'GEO', icon: '◺', name: 'Geometria', color: 'blue',
    meta: '4º Bimestre · Aulas 142 e 145',
    content: 'Áreas de figuras, conversão de unidades e área de triângulos',
    aulas: { 142: 'Revisão: área de algumas figuras', 145: 'Área de um triângulo qualquer' },
    questions: [
      Q({ aula: 142, n: 1, skill: 'Área no quadriculado', gen: G['142-1'], params: [
        { regions: GRID_ORIG, labelAt: { A: 1, B: 3, C: 2, D: 3, E: 6 } },
        { regions: { A: cat(rng(1, 1, 4), [[2, 1]]), B: cat(rng(1, 6, 8), rng(2, 6, 8), [[3, 7]]), C: colR(2, 4, 7), D: cat([[4, 7]], rng(5, 4, 7), [[6, 4]]), E: cat(rng(9, 2, 7), rng(10, 1, 8)) } },
        { regions: { A: cat(rng(1, 1, 3), rng(2, 1, 3), rng(3, 1, 3)), B: cat(rng(1, 5, 8), [[2, 8]]), C: cat(colR(2, 5, 9), [[9, 3]]), D: cat(rng(5, 5, 7), rng(6, 5, 7)), E: cat(rng(8, 5, 7), rng(9, 5, 8), rng(10, 5, 8)) } },
        { regions: { A: cat(rng(1, 2, 5), rng(2, 3, 4)), B: cat([[2, 7]], [[3, 6]], [[3, 7]], [[3, 8]], [[4, 7]]), C: cat(colR(1, 5, 9), [[9, 2]]), D: cat(rng(6, 4, 7), rng(7, 5, 6)), E: cat(rng(9, 4, 8), rng(10, 3, 8)) } }
      ] }),
      Q({ aula: 142, n: 2, skill: 'Área de figura composta', gen: G['142-2'], params: [
        { total: 10, wM: 5, wR: 2, hL: 2.5, hUp: 3, hR: 3 }, { total: 12, wM: 4, wR: 3, hL: 2, hUp: 3, hR: 4 }, { total: 9, wM: 4, wR: 2, hL: 1.5, hUp: 2, hR: 2.5 }, { total: 11, wM: 5, wR: 3, hL: 3, hUp: 2, hR: 2 }] }),
      Q({ aula: 145, n: 1, skill: 'Área do triângulo', gen: G['145-1'], params: [{ b: 12, h: 6 }, { b: 10, h: 7 }, { b: 8, h: 5 }, { b: 15, h: 4 }] }),
      Q({ aula: 145, n: 2, skill: 'Triângulo isósceles', gen: G['145-2'], params: [{ L: 5, b: 6 }, { L: 13, b: 10 }, { L: 10, b: 12 }, { L: 17, b: 16 }] }),
      Q({ aula: 145, n: 3, skill: 'Triângulo equilátero', gen: G['145-3'], params: [{ per: 36 }, { per: 24 }, { per: 18 }, { per: 30 }] }),
      Q({ aula: 145, n: 4, skill: 'Fórmula do equilátero', gen: G['145-4'], params: [{ side: null }, { side: 2 }, { side: 6 }, { side: 10 }] }),
      Q({ aula: 145, n: 5, skill: 'Áreas e custo', gen: G['145-5'], params: [{ L: 10, H: 2, pl: 3, pd: 4 }, { L: 8, H: 3, pl: 5, pd: 7 }, { L: 12, H: 2, pl: 2.5, pd: 4 }, { L: 6, H: 4, pl: 3, pd: 5 }] })
    ]
  });
})();
