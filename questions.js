/* =====================================================================
   GAITERO MATH — Banco de questões originais
   Fonte: "Prova 1 - P1 Matemática 7º ano.pdf" e "Prova 2 - P2 Matemática 7º ano.pdf"
   (3º bimestre de 2026, Profª Milene). Enunciados transcritos e conferidos no PDF.

   exam     → { id, title, name, meta, content, questions[] }
   question → { n, skill, prompt, figure?, table?, note?, items[], variations[] }
   item     → {
     key, label?, prompt?,   'a', 'a)', texto do subitem ('u' = questão sem letras)
     answer,                 tipo + gabarito + configuração dos campos (validado em logic.js)
     hint,                   { rules: [ids do formulas.js], tip: orientação sem a resposta }
     hints?,                 erros comuns → mensagem específica (não revela a resposta)
     final,                  resposta final por extenso
     steps                   resolução: ask, concept?, data, s1, s2, fig?, final, check
   }
   As variações (botão 🔀) são geradas em variations.js com o mesmo formato.

   Matemática no texto: tudo entre [[ ]] é desenhado pelo app.
     x^2, x^{22} potências · √11, √{23} raiz quadrada · R{4}{-28} raiz de índice 4
     frac{a}{b} fração · x_1 índice · "-" vira "−" e "*" vira "·"
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- Figuras (SVG), reaproveitadas pelas variações ---------- */
  var FIG = {};

  // Reflexão numa malha (1 quadradinho = 1 unidade).
  // cfg = { axis: 'v' (reta em pé, x = k) | 'h' (reta deitada, y = k), k, orig: [P, Q, R], bounds: [x0, x1, y0, y1] }
  FIG.reflection = function (cfg, imagePts, opts) {
    opts = opts || {};
    var b = cfg.bounds, U = 10, x0 = b[0], x1 = b[1], y0 = b[2], y1 = b[3], k = cfg.k;
    var gx = function (x) { return (x - x0) * U; };
    var gy = function (y) { return (y1 - y) * U; };
    var W = (x1 - x0) * U, H = (y1 - y0) * U, s = '', x, y;
    for (x = x0; x <= x1; x++) s += '<line x1="' + gx(x) + '" y1="0" x2="' + gx(x) + '" y2="' + H + '"/>';
    for (y = y0; y <= y1; y++) s += '<line x1="0" y1="' + gy(y) + '" x2="' + W + '" y2="' + gy(y) + '"/>';
    var out = '<g class="fg-grid">' + s + '</g>';
    if (cfg.axis === 'v') {
      out += '<line class="fg-axis" x1="' + gx(k) + '" y1="' + gy(y1 - 0.3) + '" x2="' + gx(k) + '" y2="' + gy(y0 + 0.3) + '"/>' +
        '<text class="fg-lbl fg-e" x="' + (gx(k) + 6) + '" y="' + (gy(y1 - 0.6) + 3) + '">e</text>';
    } else {
      out += '<line class="fg-axis" x1="' + gx(x0 + 0.3) + '" y1="' + gy(k) + '" x2="' + gx(x1 - 0.3) + '" y2="' + gy(k) + '"/>' +
        '<text class="fg-lbl fg-e" x="' + (gx(x1 - 0.7)) + '" y="' + (gy(k) - 5) + '">e</text>';
    }
    var names = cfg.names || ['P', 'Q', 'R'];
    var tri = function (pts, cls, prime) {
      var cx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3, cy = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
      var poly = pts.map(function (p) { return gx(p[0]) + ',' + gy(p[1]); }).join(' ');
      var extra = '';
      pts.forEach(function (p, i) {
        var dx = p[0] - cx, dy = p[1] - cy, len = Math.hypot(dx, dy) || 1;
        var lx = gx(p[0]) + dx / len * 8, ly = gy(p[1]) - dy / len * 8 + 3.2;
        extra += '<circle cx="' + gx(p[0]) + '" cy="' + gy(p[1]) + '" r="1.9"/>';
        extra += '<text class="fg-lbl" x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '">' + names[i] + (prime ? '′' : '') + '</text>';
      });
      return '<g class="' + cls + '"><polygon points="' + poly + '"/>' + extra + '</g>';
    };
    out += tri(cfg.orig, 'fg-tri-orig', false);
    if (opts.connectors && imagePts) {
      cfg.orig.forEach(function (p, i) {
        var q = imagePts[i];
        out += '<line class="fg-dash" x1="' + gx(p[0]) + '" y1="' + gy(p[1]) + '" x2="' + gx(q[0]) + '" y2="' + gy(q[1]) + '"/>';
        if (cfg.axis === 'v') {
          var d = Math.abs(k - p[0]);
          out += '<text class="fg-dist" x="' + gx((p[0] + k) / 2) + '" y="' + (gy(p[1]) - 2.5) + '">' + d + '</text>';
          out += '<text class="fg-dist" x="' + gx((q[0] + k) / 2) + '" y="' + (gy(q[1]) - 2.5) + '">' + d + '</text>';
          out += '<path class="fg-right" d="M' + (gx(k) + (p[0] < k ? -3 : 3)) + ' ' + gy(p[1]) + ' v-3 h' + (p[0] < k ? 3 : -3) + '"/>';
        } else {
          var e = Math.abs(k - p[1]);
          out += '<text class="fg-dist fg-dist-side" x="' + (gx(p[0]) + 3) + '" y="' + (gy((p[1] + k) / 2) + 3) + '">' + e + '</text>';
          out += '<text class="fg-dist fg-dist-side" x="' + (gx(q[0]) + 3) + '" y="' + (gy((q[1] + k) / 2) + 3) + '">' + e + '</text>';
          out += '<path class="fg-right" d="M' + (gx(p[0]) + 3) + ' ' + (gy(k) + (p[1] > k ? -3 : 3)) + ' h-3"/>';
        }
      });
    }
    if (imagePts) out += tri(imagePts, opts.correct ? 'fg-tri-ok' : 'fg-tri-img', true);
    return '<svg class="fig fig-refl" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (opts.aria || 'Triângulo PQR e a reta e na malha quadriculada') + '">' + out + '</svg>';
  };

  // Três quadrados apoiados na mesma base (P2 Q9). sides = [lado ABCJ, lado DEIJ, lado FGHI] em cm.
  FIG.squares = function (sides, showAreas) {
    var a = sides[0], b = sides[1], c = sides[2];
    var sc = Math.min(280 / (a + b + c), 160 / a);
    var X = function (x) { return 50 + sc * x; }, Y = function (y) { return 30 + sc * a - sc * y; };
    var P = function (x, y) { return X(x).toFixed(1) + ',' + Y(y).toFixed(1); };
    var s = '';
    s += '<polygon class="fg-sq1" points="' + [P(0, 0), P(0, a), P(a, a), P(a, 0)].join(' ') + '"/>';
    s += '<polygon class="fg-sq2" points="' + [P(a, 0), P(a, b), P(a + b, b), P(a + b, 0)].join(' ') + '"/>';
    s += '<polygon class="fg-sq3" points="' + [P(a + b, 0), P(a + b, c), P(a + b + c, c), P(a + b + c, 0)].join(' ') + '"/>';
    s += '<polyline class="fg-outline" points="' + [P(0, 0), P(0, a), P(a, a), P(a, b), P(a + b, b), P(a + b, c), P(a + b + c, c), P(a + b + c, 0), P(0, 0)].join(' ') + '"/>';
    s += '<line class="fg-dash" x1="' + X(a) + '" y1="' + Y(b) + '" x2="' + X(a) + '" y2="' + Y(0) + '"/>';
    s += '<line class="fg-dash" x1="' + X(a + b) + '" y1="' + Y(c) + '" x2="' + X(a + b) + '" y2="' + Y(0) + '"/>';
    var rm = function (x, y, sx, sy) { return '<path class="fg-right" d="M' + (X(x) + 5 * sx).toFixed(1) + ' ' + Y(y).toFixed(1) + ' v' + (-5 * sy) + ' h' + (-5 * sx) + '"/>'; };
    s += rm(0, 0, 1, 1) + rm(0, a, 1, -1) + rm(a, a, -1, -1) + rm(a + b, b, -1, -1) + rm(a + b + c, c, -1, -1) + rm(a + b + c, 0, -1, 1);
    var t = function (x, y, txt, cls) { return '<text class="fg-lbl ' + (cls || '') + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '">' + txt + '</text>'; };
    s += t(X(0) - 7, Y(0) + 12, 'A') + t(X(0) - 7, Y(a) - 4, 'B') + t(X(a) + 6, Y(a) - 4, 'C') +
      t(X(a) - 7, Y(b) - 3, 'D') + t(X(a + b) + 7, Y(b) - 3, 'E') + t(X(a + b) - 7, Y(c) - 3, 'F') +
      t(X(a + b + c) + 7, Y(c) - 3, 'G') + t(X(a + b + c) + 7, Y(0) + 12, 'H') + t(X(a + b), Y(0) + 12, 'I') + t(X(a), Y(0) + 12, 'J');
    s += t(X(0) - 26, Y(a / 2) + 4, a + ' cm', 'fg-dim') + t(X(a + b / 2), Y(b) - 8, b + ' cm', 'fg-dim') + t(X(a + b + c) + 22, Y(c / 2) + 4, c + ' cm', 'fg-dim');
    if (showAreas) {
      s += t(X(a / 2), Y(a / 2) + 5, (a * a) + ' cm²', 'fg-area') +
        t(X(a + b / 2), Y(b / 2) + 4, String(b * b), 'fg-area fg-area-s') +
        t(X(a + b + c / 2), Y(c / 2) + 3.5, String(c * c), 'fg-area fg-area-xs');
    }
    var H = Math.ceil(30 + sc * a + 22);
    return '<svg class="fig fig-squares" viewBox="0 0 382 ' + H + '" role="img" aria-label="Figura formada pelos quadrados ABCJ, DEIJ e FGHI">' + s + '</svg>';
  };

  // Região retangular coberta por lajotas quadradas (P2 Q10). Medidas em cm.
  FIG.tiles = function (L, W, t, labelL, labelW) {
    var k = Math.min(228 / L, 140 / W), ox = 34, oy = 26, s = '';
    var cols = Math.ceil(L / t - 1e-9), rows = Math.ceil(W / t - 1e-9);
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var w = Math.min(t, L - c * t), h = Math.min(t, W - r * t);
        var half = w < t - 1e-9 || h < t - 1e-9;
        s += '<rect class="' + (half ? 'fg-tile-half' : 'fg-tile') + '" x="' + (ox + c * t * k).toFixed(1) + '" y="' + (oy + r * t * k).toFixed(1) + '" width="' + (w * k).toFixed(1) + '" height="' + (h * k).toFixed(1) + '"/>';
      }
    }
    s += '<rect class="fg-outline-rect" x="' + ox + '" y="' + oy + '" width="' + (L * k).toFixed(1) + '" height="' + (W * k).toFixed(1) + '"/>';
    s += '<text class="fg-lbl fg-dim" x="' + (ox + L * k / 2).toFixed(1) + '" y="' + (oy - 9) + '">' + labelL + '</text>';
    s += '<text class="fg-lbl fg-dim" transform="translate(' + (ox - 10) + ' ' + (oy + W * k / 2).toFixed(1) + ') rotate(-90)" x="0" y="0">' + labelW + '</text>';
    var H = Math.ceil(oy + W * k + 14);
    return '<svg class="fig fig-tiles" viewBox="0 0 300 ' + H + '" role="img" aria-label="Região retangular coberta por lajotas">' + s + '</svg>';
  };

  // Esboço de paralelepípedo (P1 Q5).
  FIG.box = function (k, h) {
    var s = '';
    s += '<polygon class="fg-box-top" points="40,60 200,60 236,34 76,34"/>';
    s += '<polygon class="fg-box-side" points="200,60 236,34 236,74 200,100"/>';
    s += '<rect class="fg-box-front" x="40" y="60" width="160" height="40"/>';
    s += '<text class="fg-lbl fg-dim" x="120" y="118">comprimento = ' + k + ' · L</text>';
    s += '<text class="fg-lbl fg-dim" x="244" y="98" text-anchor="start">altura = ' + h + ' cm</text>';
    s += '<text class="fg-lbl fg-dim" x="236" y="26" text-anchor="start">largura = L</text>';
    return '<svg class="fig fig-box" viewBox="0 0 330 130" role="img" aria-label="Paralelepípedo com altura ' + h + ' cm, largura L e comprimento ' + k + 'L">' + s + '</svg>';
  };

  /* ---------- P1 ---------- */

  // P1 Q10: triângulo medido no PDF (P, Q, R e a reta e) e ajustado à malha.
  var REF = { axis: 'v', k: 10, orig: [[5, 9], [1, 8], [0, 0]], bounds: [-2, 22, -2, 13] };
  var REF_OK = [[15, 9], [19, 8], [20, 0]];

  var P1 = {
    id: 'p1', title: 'P1', name: 'Primeira Prova',
    meta: '3º Bimestre · Profª Milene · 11/08/2026',
    content: 'Números reais, volume, probabilidade e estatística e transformações geométricas',
    questions: [
      {
        n: 1, skill: 'Números consecutivos',
        prompt: 'A soma de três números consecutivos é 21. Quais são os números?',
        items: [{
          key: 'u',
          answer: { type: 'numberList', values: [6, 7, 8], ordered: false, labels: ['1º número', '2º número', '3º número'], neg: true },
          hint: { rules: ['consecutivos'], tip: 'Chame o primeiro número de [[x]]. Escreva os três números e monte a soma igual a 21.' },
          hints: [
            { when: function (v) { return v[0] + v[1] + v[2] !== 21; }, msg: 'Some os três números que você escreveu: precisa dar exatamente 21.' },
            { when: function () { return true; }, msg: 'A soma dá 21, mas os números precisam ser consecutivos: um logo depois do outro, tipo 4, 5 e 6.' }
          ],
          final: '6, 7 e 8',
          steps: {
            ask: 'Descobrir <b>três números</b> que vêm um depois do outro e que, somados, dão <b>21</b>.',
            concept: 'Gaitero, <b>números consecutivos</b> são números que vêm um depois do outro, como 4, 5 e 6. Cada um é o anterior <b>mais 1</b>.',
            data: 'São <b>3 números</b> seguidos e a <b>soma</b> deles é <b>21</b>.',
            s1: 'Como temos três números e a soma é 21, dá para achar primeiro o <b>número do meio</b>: é só dividir a soma igualmente entre os três.<div class="calc">[[21 ÷ 3 = 7]]</div>O número do meio é <b>7</b>.',
            s2: 'Agora pegamos o número <b>anterior</b> e o <b>próximo</b>:<div class="calc">[[7 - 1 = 6]] &nbsp;e&nbsp; [[7 + 1 = 8]]</div><p class="aside">Outro jeito (com equação): os números são [[x]], [[x + 1]] e [[x + 2]]. Então [[3x + 3 = 21]], [[3x = 18]] e [[x = 6]].</p>',
            final: 'Os números são <b>6, 7 e 8</b>.',
            check: 'Vamos conferir? [[6 + 7 + 8 = 21]] ✓ — e eles são consecutivos ✓.'
          }
        }],
        variations: []
      },
      {
        n: 2, skill: 'Radicais (raízes)',
        prompt: 'Calcular:',
        items: [
          {
            key: 'a', label: 'a)', prompt: '[[R{4}{-28}]] =',
            answer: {
              type: 'choice', layout: 'list', correct: 'nao',
              options: [
                { id: 'negrad', html: '[[-R{4}{28}]]', hint: 'Teste o sinal: [[(-R{4}{28})^4]] dá positivo ou negativo? Um número elevado à 4ª potência nunca fica negativo.' },
                { id: 'm7', html: '[[-7]]', hint: 'Cuidado: raiz não é divisão! [[28 ÷ 4 = 7]], mas raiz quarta é outra coisa.' },
                { id: 'nao', html: 'Não existe no conjunto dos números reais ([[ℝ]])' },
                { id: 'rad', html: '[[R{4}{28}]]', hint: '[[R{4}{28}]] elevado à 4ª potência dá +28, e não −28.' }
              ]
            },
            hint: { rules: ['raiz-par-negativo'], tip: 'Olhe o <b>índice</b> (o numerozinho da raiz) e o <b>sinal</b> do número de dentro.' },
            final: 'Não existe no conjunto dos números reais.',
            steps: {
              ask: 'Calcular a <b>raiz quarta de −28</b>: achar um número que, multiplicado por ele mesmo <b>4 vezes</b>, dê −28.',
              concept: 'O numerozinho pequeno em cima da raiz é o <b>índice</b>. Índice 4 = raiz quarta: procuramos um número que, elevado à 4ª potência, dê o que está dentro da raiz.',
              data: 'Índice <b>4</b> (número <b>par</b>) e, dentro da raiz, <b>−28</b> (número <b>negativo</b>).',
              s1: 'Vamos testar os sinais.<div class="calc">[[(+2)^4 = 2 * 2 * 2 * 2 = +16]]</div><div class="calc">[[(-2)^4 = (-2) * (-2) * (-2) * (-2) = +16]]</div>Menos com menos dá mais — e isso acontece duas vezes. Os dois deram <b>positivo</b>!',
              s2: 'Qualquer número real elevado a um expoente <b>par</b> dá resultado positivo (ou zero). Então <b>nenhum</b> número real elevado à 4ª potência dá −28.',
              final: '[[R{4}{-28}]] <b>não existe</b> no conjunto dos números reais ([[ℝ]]).',
              check: 'Regra de ouro para a prova: <b>índice par + número negativo dentro = não existe em [[ℝ]]</b>. Já com índice ímpar pode: [[R{3}{-8} = -2]], porque [[(-2)^3 = -8]].'
            }
          },
          {
            key: 'b', label: 'b)', prompt: '[[R{22}{(√11 - √13)^{22}}]] =',
            answer: { type: 'radical', value: Math.sqrt(13) - Math.sqrt(11), canonical: '√13 - √11' },
            hint: { rules: ['raiz-potencia'], tip: 'O índice 22 é <b>par</b>. Antes de tudo, descubra se [[√11 - √13]] é positivo ou negativo.' },
            hints: [{ when: Math.sqrt(11) - Math.sqrt(13), msg: 'Quase! Esse valor é negativo ([[√11]] é menor que [[√13]]), mas raiz de índice par (22) nunca dá resultado negativo.' }],
            final: '[[√13 - √11]]',
            steps: {
              ask: 'Simplificar a raiz de índice <b>22</b> de [[(√11 - √13)]] elevado a <b>22</b>.',
              concept: 'Raiz e potência com o mesmo número se "desfazem", mas com um cuidado: quando o índice é <b>PAR</b>, o resultado nunca pode ser negativo. Por isso, com índice par, o resultado é o <b>módulo</b> (a distância até o zero, sempre positiva).<div class="calc">[[√{(-3)^2} = √9 = 3]] &nbsp;(e não −3)</div>',
              data: 'Índice <b>22</b> (par), expoente <b>22</b>, e dentro dos parênteses: [[√11 - √13]].',
              s1: 'Descobrir o sinal de [[√11 - √13]]. Como 11 é menor que 13, [[√11]] é menor que [[√13]]:<div class="calc">[[√11 ≈ 3,32]] &nbsp;e&nbsp; [[√13 ≈ 3,61]]</div><div class="calc">[[√11 - √13 ≈ -0,29]] → é <b>negativo</b>!</div>',
              s2: 'Índice par → o resultado é o módulo: [[|√11 - √13|]]. O módulo de um número negativo troca o sinal dele:<div class="calc">[[|√11 - √13| = -(√11 - √13) = √13 - √11]]</div>',
              final: '[[R{22}{(√11 - √13)^{22}} = √13 - √11]]',
              check: '[[√13 - √11 ≈ 3,61 - 3,32 = 0,29]], que é <b>positivo</b> ✓ — como tem que ser em uma raiz de índice par.'
            }
          },
          {
            key: 'c', label: 'c)', prompt: '[[R{15}{(√3 - √2)^{15}}]] =',
            answer: { type: 'radical', value: Math.sqrt(3) - Math.sqrt(2), canonical: '√3 - √2' },
            hint: { rules: ['raiz-potencia'], tip: 'O índice 15 é <b>ímpar</b>. O que acontece com o que está dentro dos parênteses?' },
            hints: [{ when: Math.sqrt(2) - Math.sqrt(3), msg: 'Com índice ímpar (15), raiz e potência se cancelam sem trocar nada. Não precisa inverter a ordem.' }],
            final: '[[√3 - √2]]',
            steps: {
              ask: 'Simplificar a raiz de índice <b>15</b> de [[(√3 - √2)^{15}]].',
              concept: 'Com índice <b>ÍMPAR</b>, raiz e potência de mesmo número se desfazem <b>sem mudar nada</b>, nem o sinal:<div class="calc">[[R{3}{(-2)^3} = R{3}{-8} = -2]]</div>',
              data: 'Índice <b>15</b> (ímpar) e expoente <b>15</b> — os dois são iguais.',
              s1: 'Índice e expoente são iguais (15 e 15), então eles se <b>cancelam</b>.',
              s2: 'Como 15 é ímpar, não precisamos mexer no sinal. Sobra só o que estava dentro dos parênteses: [[√3 - √2]].<p class="aside">Curiosidade: [[√3 - √2 ≈ 1,73 - 1,41 = 0,32]], que já é positivo.</p>',
              final: '[[R{15}{(√3 - √2)^{15}} = √3 - √2]]',
              check: 'Se elevarmos [[√3 - √2]] à 15ª potência e tirarmos a raiz 15ª, voltamos ao mesmo número ✓.'
            }
          },
          {
            key: 'd', label: 'd)', prompt: '[[R{15}{(√23 - 5√2)^{15}}]] =',
            answer: { type: 'radical', value: Math.sqrt(23) - 5 * Math.sqrt(2), canonical: '√23 - 5√2' },
            hint: { rules: ['raiz-potencia'], tip: 'O índice 15 é <b>ímpar</b>: não faz diferença se o número de dentro é negativo.' },
            hints: [{ when: 5 * Math.sqrt(2) - Math.sqrt(23), msg: 'O índice 15 é ímpar: o resultado mantém o sinal, mesmo sendo negativo. Não precisa trocar a ordem.' }],
            final: '[[√23 - 5√2]]',
            steps: {
              ask: 'Simplificar a raiz de índice <b>15</b> de [[(√23 - 5√2)^{15}]].',
              concept: 'Com índice <b>ímpar</b>, a raiz de um número negativo <b>existe</b> e dá negativo. Exemplo: [[R{3}{-8} = -2]].',
              data: 'Índice <b>15</b> (ímpar), expoente <b>15</b>, e dentro dos parênteses: [[√23 - 5√2]].',
              s1: 'Índice ímpar igual ao expoente → raiz e potência se cancelam e o sinal fica como está.',
              s2: 'Olha que curioso: [[5√2 = √{25 * 2} = √50 ≈ 7,07]] e [[√23 ≈ 4,80]]. Então [[√23 - 5√2 ≈ -2,27]] é <b>negativo</b>. Mas tudo bem: como o índice é ímpar, a resposta pode ser negativa.',
              final: '[[R{15}{(√23 - 5√2)^{15}} = √23 - 5√2]] &nbsp;(≈ −2,27)',
              check: 'Diferente do item b, aqui <b>não</b> trocamos o sinal, porque 15 é ímpar ✓.'
            }
          }
        ],
        variations: []
      },
      {
        n: 3, skill: 'Equação do 1º grau',
        prompt: 'O triplo de um número ímpar mais 12 é igual a 93. Qual é o número?',
        items: [{
          key: 'u',
          answer: { type: 'integer', value: 27, placeholder: 'O número', neg: true },
          hint: { rules: ['traducoes'], tip: 'Chame o número de [[x]] e traduza a frase: "o triplo de [[x]], mais 12, é igual a 93". Depois desfaça as operações, de trás para frente.' },
          hints: [
            { when: 35, msg: 'Você somou o 12. Para desfazer o "+12", a gente <b>subtrai</b> 12.' },
            { when: 81, msg: 'Esse é o <b>triplo</b> do número! Falta desfazer o "vezes 3".' },
            { when: 31, msg: 'Você dividiu antes de tirar o 12. Primeiro desfaça o "+12", depois o "×3".' }
          ],
          final: '27',
          steps: {
            ask: 'Descobrir um número escondido (que é <b>ímpar</b>).',
            concept: '<b>Triplo</b> = 3 vezes. <b>Número ímpar</b> = não dá para dividir por 2 sem sobrar: 1, 3, 5, 7, 9...',
            data: '3 vezes o número, mais 12, dá 93. Chamando o número de [[x]]:<div class="calc">[[3x + 12 = 93]]</div>',
            s1: 'Desfazer o "<b>+12</b>": tiramos 12 dos dois lados.<div class="calc">[[3x = 93 - 12]] &nbsp;→&nbsp; [[3x = 81]]</div>',
            s2: 'Desfazer o "<b>vezes 3</b>": dividimos por 3.<div class="calc">[[x = 81 ÷ 3 = 27]]</div>',
            final: 'O número é <b>27</b>.',
            check: '[[3 * 27 = 81]] e [[81 + 12 = 93]] ✓. E 27 é ímpar ✓.'
          }
        }],
        variations: []
      },
      {
        n: 4, skill: 'Ímpares consecutivos',
        prompt: 'A soma de três números inteiros consecutivos ímpares é 81. Quais são os números?',
        items: [{
          key: 'u',
          answer: { type: 'numberList', values: [25, 27, 29], ordered: false, labels: ['1º número', '2º número', '3º número'], neg: true },
          hint: { rules: ['impares-consecutivos'], tip: 'Escreva os três ímpares seguidos usando [[x]] e monte a soma igual a 81.' },
          hints: [
            { when: function (v) { return v[0] + v[1] + v[2] !== 81; }, msg: 'Some os três números que você escreveu: precisa dar exatamente 81.' },
            { when: function (v) { return v.some(function (a) { return Math.abs(a % 2) !== 1; }); }, msg: 'A soma dá 81, mas os três precisam ser <b>ímpares</b>.' },
            { when: function () { return true; }, msg: 'A soma está certa, mas precisam ser ímpares <b>seguidos</b> (pulando de 2 em 2).' }
          ],
          final: '25, 27 e 29',
          steps: {
            ask: 'Achar <b>três números ímpares seguidos</b> cuja soma é <b>81</b>.',
            concept: 'Ímpares consecutivos pulam de <b>2 em 2</b>: 5, 7, 9... Entre um ímpar e o próximo sempre tem um par no meio.',
            data: 'São 3 números, a soma é 81, e eles são ímpares seguidos.',
            s1: 'O do meio fica no centro: dividimos a soma por 3.<div class="calc">[[81 ÷ 3 = 27]]</div>27 é ímpar ✓.',
            s2: 'Agora pulamos <b>2 para trás</b> e <b>2 para frente</b>:<div class="calc">[[27 - 2 = 25]] &nbsp;e&nbsp; [[27 + 2 = 29]]</div><p class="aside">Com equação: [[x + (x + 2) + (x + 4) = 81]] → [[3x + 6 = 81]] → [[3x = 75]] → [[x = 25]].</p>',
            final: 'Os números são <b>25, 27 e 29</b>.',
            check: '[[25 + 27 + 29 = 81]] ✓, todos são ímpares ✓ e vão de 2 em 2 ✓.'
          }
        }],
        variations: []
      },
      {
        n: 5, skill: 'Volume do paralelepípedo',
        prompt: 'Em um paralelepípedo de 2 cm de altura, o comprimento é 8 vezes a largura. Qual a medida do comprimento se o volume do paralelepípedo for 400 cm³?',
        items: [{
          key: 'u',
          answer: { type: 'integer', value: 40, suffix: 'cm', placeholder: 'Comprimento' },
          hint: { rules: ['volume'], tip: 'Chame a largura de [[L]]. Então o comprimento é [[8L]]. Monte o volume com as três medidas e iguale a 400.' },
          hints: [
            { when: 5, msg: '5 cm é a <b>largura</b>! O comprimento é 8 vezes a largura.' },
            { when: 25, msg: '25 é largura × largura. Qual número vezes ele mesmo dá 25?' },
            { when: 200, msg: 'Você dividiu só pela altura. Lembre que o comprimento é 8 × a largura.' },
            { when: 50, msg: 'Você dividiu 400 por 8. Monte a conta do volume: comprimento × largura × altura.' }
          ],
          final: '40 cm',
          steps: {
            ask: 'A medida do <b>comprimento</b> do paralelepípedo, em cm.',
            concept: 'Paralelepípedo tem formato de <b>caixa</b>. O volume é:<div class="calc">volume = comprimento × largura × altura</div>',
            data: 'Altura = <b>2 cm</b>. Comprimento = <b>8 vezes</b> a largura. Volume = <b>400 cm³</b>. Vamos chamar a largura de [[L]]; então o comprimento é [[8L]].',
            fig: FIG.box(8, 2),
            s1: 'Montamos o volume:<div class="calc">[[8L * L * 2 = 400]]</div><div class="calc">[[16 * L * L = 400]] &nbsp;→&nbsp; [[L * L = 400 ÷ 16 = 25]]</div>',
            s2: 'Qual número vezes ele mesmo dá 25? [[5 * 5 = 25]], então a largura é [[L = 5]] cm.<div class="calc">comprimento = [[8 * 5 = 40]] cm</div>',
            final: 'O comprimento mede <b>40 cm</b>.',
            check: '[[40 * 5 * 2 = 400]] cm³ ✓. E 40 é mesmo 8 vezes 5 ✓.'
          }
        }],
        variations: []
      },
      {
        n: 6, skill: 'Porcentagem',
        prompt: 'Preencha as lacunas com valor correto.',
        items: [
          {
            key: 'a', label: 'a)', prompt: '30% de 80 é <span class="blank">____</span>',
            answer: { type: 'number', value: 24, placeholder: 'Valor' },
            hint: { rules: ['pct-parte'], tip: 'Aqui você conhece o <b>total</b> (80) e a <b>porcentagem</b> (30%). Falta a parte.' },
            hints: [
              { when: 2400, msg: 'Faltou dividir por 100: 30% é 30 de cada 100.' },
              { when: 56, msg: 'Você tirou 30% de 80. A pergunta é quanto <b>vale</b> 30% de 80.' }
            ],
            final: '24',
            steps: {
              ask: 'Quanto é <b>30% de 80</b>.',
              concept: '<b>Porcentagem</b> = partes de 100. 30% quer dizer 30 de cada 100, ou seja, [[frac{30}{100} = 0,3]].',
              data: 'A porcentagem é <b>30%</b> e o total é <b>80</b>.',
              s1: 'Primeiro, 10% de 80 (dividir por 10):<div class="calc">[[80 ÷ 10 = 8]]</div>',
              s2: '30% é 3 vezes 10%:<div class="calc">[[3 * 8 = 24]]</div><p class="aside">Ou direto: [[0,3 * 80 = 24]].</p>',
              final: '30% de 80 é <b>24</b>.',
              check: '24 é um pouco menos que a metade de 80 (que é 40). Faz sentido, porque 30% é menos que 50% ✓.'
            }
          },
          {
            key: 'b', label: 'b)', prompt: '20 representa <span class="blank">____</span> % de 32',
            answer: { type: 'percent', value: 62.5, suffix: '%', placeholder: 'Porcentagem' },
            hint: { rules: ['pct-porcentagem'], tip: 'Qual número é a <b>parte</b> e qual é o <b>total</b> aqui?' },
            hints: [
              { when: 0.625, msg: 'Quase! 0,625 é a fração em decimal. Multiplique por 100 para virar porcentagem.' },
              { when: 160, msg: 'Você fez 32 ÷ 20. A parte (20) vai em cima: 20 ÷ 32.' },
              { when: 6.4, msg: 'Isso é 20% de 32. A pergunta é: 20 é quantos por cento de 32?' }
            ],
            final: '62,5%',
            steps: {
              ask: 'Que <b>porcentagem de 32</b> o número <b>20</b> representa.',
              concept: 'Para saber "quanto por cento" uma parte é do total: <b>parte ÷ total</b>, e depois <b>× 100</b>.',
              data: 'Parte = <b>20</b>. Total = <b>32</b>.',
              s1: 'Montamos a fração parte/total e simplificamos por 4:<div class="calc">[[frac{20}{32} = frac{5}{8}]]</div>',
              s2: 'Dividimos e multiplicamos por 100:<div class="calc">[[5 ÷ 8 = 0,625]] &nbsp;→&nbsp; [[0,625 * 100 = 62,5]]</div>',
              final: '20 representa <b>62,5%</b> de 32.',
              check: '62,5% de 32 = [[0,625 * 32 = 20]] ✓.'
            }
          }
        ],
        variations: []
      },
      {
        n: 7, skill: 'Desconto em porcentagem',
        prompt: 'Após cinco anos de uso, o preço de um carro popular reduziu 40%. Sabendo que seu valor de fábrica era 90 mil reais, quanto ele custa agora?',
        items: [{
          key: 'u',
          answer: { type: 'currency', value: 54000, prefix: 'R$', placeholder: '0,00' },
          hint: { rules: ['pct-desconto'], tip: 'Se o carro perdeu 40% do valor, com quantos por cento ele ficou?' },
          hints: [
            { when: 36000, msg: 'Esse é o valor que o carro <b>perdeu</b>. Quanto ele vale agora?' },
            { when: 126000, msg: 'O preço <b>reduziu</b>, então tem que ficar menor que 90 mil.' },
            { when: 50000, msg: 'Você tirou 40 mil, mas 40% de 90 mil não é 40 mil.' },
            { when: 54, msg: 'O número está certo, mas em reais! 54 é "54 mil". Escreva 54000 ou "54 mil".' }
          ],
          final: 'R$ 54.000,00',
          steps: {
            ask: 'O <b>preço atual</b> do carro depois de perder 40% do valor.',
            data: 'Preço de fábrica: <b>R$ 90.000</b>. Redução: <b>40%</b>.',
            s1: 'Quanto o carro perdeu? Começamos com 10% de 90.000:<div class="calc">[[90.000 ÷ 10 = 9.000]]</div>40% é 4 vezes isso:<div class="calc">[[4 * 9.000 = 36.000]]</div>',
            s2: 'Tiramos a perda do preço original:<div class="calc">[[90.000 - 36.000 = 54.000]]</div><p class="aside">Atalho: se perdeu 40%, sobraram 60%. [[0,6 * 90.000 = 54.000]].</p>',
            final: 'O carro custa agora <b>R$ 54.000,00</b> (54 mil reais).',
            check: '[[54.000 + 36.000 = 90.000]] ✓. E o preço ficou menor, como deveria ✓.'
          }
        }],
        variations: []
      },
      {
        n: 8, skill: 'Média aritmética',
        prompt: 'Um professor corrigiu as provas de seus alunos e colocou os dados conforme a tabela a seguir. Qual a média aritmética das notas dos alunos?',
        table: { head: ['Aluno', 'Nota'], rows: [['Carlos', '5'], ['Maria', '10'], ['Roberto', '7'], ['Letícia', '6'], ['Anderson', '9'], ['Ana', '5'], ['Pedro', '7']] },
        items: [{
          key: 'u',
          answer: { type: 'number', value: 7, placeholder: 'Média' },
          hint: { rules: ['media-simples'], tip: 'Some todas as notas da tabela e conte quantos alunos são.' },
          hints: [
            { when: 49, msg: 'Essa é a <b>soma</b> das notas. Agora divida pelo número de alunos.' },
            { when: 7.5, msg: 'Essa é a média só da menor e da maior nota. Use as notas de todos.' },
            { when: 6.125, msg: 'Conte de novo quantos alunos tem na tabela.' }
          ],
          final: '7',
          steps: {
            ask: 'A <b>média aritmética</b> das notas.',
            concept: '<b>Média aritmética</b> = soma de todos os valores ÷ quantidade de valores. É como juntar tudo e dividir igualmente.',
            data: 'São <b>7 alunos</b>, com notas 5, 10, 7, 6, 9, 5 e 7.',
            s1: 'Somamos as notas, uma de cada vez:<div class="calc">[[5 + 10 = 15]] → [[15 + 7 = 22]] → [[22 + 6 = 28]] → [[28 + 9 = 37]] → [[37 + 5 = 42]] → [[42 + 7 = 49]]</div>',
            s2: 'Dividimos pela quantidade de alunos:<div class="calc">[[49 ÷ 7 = 7]]</div>',
            final: 'A média é <b>7</b>.',
            check: 'A média fica entre a menor nota (5) e a maior (10) ✓.'
          }
        }],
        variations: []
      },
      {
        n: 9, skill: 'Média ponderada',
        prompt: 'Em uma escola de inglês, 14 alunos têm 10 anos, 10 alunos têm 12 anos e 5 alunos têm 15 anos. Qual é a média das idades desses alunos?',
        items: [{
          key: 'u',
          answer: { type: 'number', value: 335 / 29, tol: 0.049, suffix: 'anos', placeholder: 'Média', help: 'Pode responder com duas casas decimais (ex.: 10,25) ou como fração (ex.: 41/4).' },
          hint: { rules: ['media-grupos'], tip: 'Cada idade aparece várias vezes. Multiplique cada idade pela quantidade de alunos antes de somar — e divida pelo total de alunos.' },
          hints: [
            { when: 37 / 3, tol: 0.02, msg: 'Você fez (10 + 12 + 15) ÷ 3. Mas cada idade aparece <b>várias vezes</b>: são 14 alunos de 10 anos!' },
            { when: 335, msg: 'Essa é a soma de todas as idades. Divida pelo número de alunos.' },
            { when: 11.5, msg: 'Arredondou demais. Use duas casas decimais.' },
            { when: 11, msg: 'Arredondou demais. Use duas casas decimais.' },
            { when: 12, msg: 'Arredondou demais. Use duas casas decimais.' }
          ],
          final: '[[frac{335}{29} ≈ 11,55]] anos',
          steps: {
            ask: 'A <b>média das idades</b> de todos os alunos.',
            concept: 'Quando um valor se repete várias vezes, multiplicamos o valor pela quantidade de vezes que ele aparece. Isso se chama <b>média ponderada</b>.',
            data: '14 alunos com 10 anos, 10 alunos com 12 anos e 5 alunos com 15 anos.<div class="calc">Total de alunos: [[14 + 10 + 5 = 29]]</div>',
            s1: 'Somamos as idades de <b>todos</b> os alunos:<div class="calc">[[14 * 10 = 140]] &nbsp; [[10 * 12 = 120]] &nbsp; [[5 * 15 = 75]]</div><div class="calc">[[140 + 120 + 75 = 335]]</div>',
            s2: 'Dividimos pelo total de alunos:<div class="calc">[[335 ÷ 29 ≈ 11,55]]</div>',
            final: 'A média é [[frac{335}{29}]], aproximadamente <b>11,55 anos</b>.',
            check: 'A média ficou mais perto de 10 do que de 15, porque tem muita gente com 10 anos ✓. E [[29 * 11,55 ≈ 335]] ✓.'
          }
        }],
        variations: []
      },
      {
        n: 10, skill: 'Reflexão (simetria)',
        prompt: 'Encontre a imagem do triângulo PQR por uma reflexão em torno da reta <i>e</i>, ambos desenhados a seguir. (Use régua!)',
        figure: FIG.reflection(REF, null),
        note: 'No app, a malha quadriculada faz o papel da régua: escolha o desenho que mostra a imagem P′Q′R′ correta.',
        items: [{
          key: 'u',
          answer: {
            type: 'choice', layout: 'figs', correct: 'certa',
            options: [
              { id: 'transl', html: FIG.reflection(REF, [[20, 9], [16, 8], [15, 0]], { aria: 'Opção A' }), hint: 'Esse triângulo foi só <b>arrastado</b> (translação): não ficou espelhado. Na reflexão, o ponto mais perto da reta continua mais perto do outro lado.' },
              { id: 'subiu', html: FIG.reflection(REF, [[15, 11], [19, 10], [20, 2]], { aria: 'Opção B' }), hint: 'O formato espelhado está certo, mas o triângulo <b>subiu</b> 2 quadradinhos. Na reflexão em uma reta em pé, cada ponto continua na mesma altura.' },
              { id: 'certa', html: FIG.reflection(REF, REF_OK, { aria: 'Opção C' }) },
              { id: 'rot', html: FIG.reflection(REF, [[15, 0], [19, 1], [20, 9]], { aria: 'Opção D' }), hint: 'Esse ficou de <b>cabeça para baixo</b> — é um giro (rotação). Na reflexão em reta vertical, a altura dos pontos não muda.' },
              { id: 'perto', html: FIG.reflection(REF, [[12, 9], [16, 8], [17, 0]], { aria: 'Opção E' }), hint: 'Está espelhado, mas as <b>distâncias</b> até a reta <i>e</i> não batem. Conte os quadradinhos de cada ponto até a reta.' },
              { id: 'vflip', html: FIG.reflection(REF, [[20, 0], [16, 1], [15, 9]], { aria: 'Opção F' }), hint: 'Esse foi virado de <b>cima para baixo</b>. O "espelho" aqui é a reta <i>e</i>, que está em pé.' }
            ]
          },
          hint: { rules: ['reflexao'], tip: 'Conte quantos quadradinhos cada ponto está da reta <i>e</i> e procure a opção em que essa distância se repete do outro lado.' },
          final: 'Alternativa C',
          steps: {
            ask: 'Encontrar a <b>imagem</b> do triângulo PQR <b>refletido</b> na reta <i>e</i> — como se a reta fosse um espelho.',
            concept: '<b>Reflexão</b> = imagem no espelho. Cada ponto vai para o <b>outro lado</b> da reta, na <b>mesma distância</b>, andando em linha reta <b>perpendicular</b> à reta (formando ângulo de 90° com ela).',
            data: 'A reta <i>e</i> está em pé (vertical). Contando os quadradinhos até ela:<div class="calc">P está a <b>5</b> · Q está a <b>9</b> · R está a <b>10</b></div>',
            s1: 'Para cada ponto, trace uma linha <b>deitada</b> (perpendicular à reta <i>e</i>) atravessando para o outro lado.',
            s2: 'Do outro lado, marque a <b>mesma distância</b>: P′ a 5, Q′ a 9 e R′ a 10 quadradinhos da reta. A <b>altura</b> de cada ponto não muda!',
            fig: FIG.reflection(REF, REF_OK, { connectors: true, correct: true, aria: 'Reflexão correta com as distâncias marcadas' }),
            final: 'A imagem correta é a da <b>alternativa C</b>: o triângulo P′Q′R′ espelhado, com P′ mais perto da reta e R′ mais longe.',
            check: 'A figura ficou "virada" (como a mão direita que vira esquerda no espelho), com o <b>mesmo tamanho</b> e a <b>mesma altura</b> ✓. Arrastar (translação), girar (rotação) ou virar de cabeça para baixo não é reflexão nessa reta.'
          }
        }],
        variations: []
      }
    ]
  };

  /* ---------- P2 ---------- */

  var moduloConcept = '<b>Módulo</b> (ou valor absoluto) é a <b>distância</b> do número até o zero na reta numérica. Distância nunca é negativa: [[|-8| = 8]] e [[|8| = 8]].';
  var divConcept = '<b>Regra do 2:</b> o número é par (termina em 0, 2, 4, 6 ou 8).<br><b>Regra do 3:</b> a soma dos algarismos dá um número da tabuada do 3.';
  var divOptions = [
    { id: 'd2', html: 'Divisível por 2' },
    { id: 'd3', html: 'Divisível por 3' },
    { id: 'none', html: 'Não é divisível nem por 2 nem por 3', exclusive: true }
  ];
  function divHints(n) {
    var even = n % 2 === 0, sum = String(n).split('').reduce(function (a, d) { return a + Number(d); }, 0), by3 = sum % 3 === 0;
    return [
      { when: function (sel) { return sel.has('d2') !== even; }, msg: 'Olhe o último algarismo: ele é par ou ímpar?' },
      { when: function (sel) { return sel.has('d3') !== by3; }, msg: 'Some os algarismos e veja se o resultado está na tabuada do 3.' },
      { when: function () { return true; }, msg: 'Confira as duas regras com calma, uma de cada vez.' }
    ];
  }
  var divHint = function (n) { return { rules: ['div2', 'div3'], tip: 'Para ' + n + ': olhe o <b>último algarismo</b> e depois <b>some os algarismos</b>.' }; };
  var monoConcept = '<b>Termos semelhantes</b> têm a mesma parte com letra (mesma letra e mesmo expoente). Para juntar, some ou subtraia só os números da frente (os <b>coeficientes</b>); a parte com letra fica igual.';
  var grauConcept = '<b>Grau</b> de um polinômio = o <b>maior expoente</b> do [[x]], depois de juntar os termos semelhantes.';
  var somaProdConcept = 'Numa equação do tipo [[x^2 + bx + c = 0]], as duas raízes obedecem:<div class="calc">Soma = [[-b]] &nbsp;&nbsp; Produto = [[c]]</div>Se o número na frente do [[x^2]] não for 1, divida a equação toda por ele antes. Depois, procure dois números com essa soma e esse produto.';

  var P2 = {
    id: 'p2', title: 'P2', name: 'Segunda Prova',
    meta: '3º Bimestre · Profª Milene · 15/09/2026',
    content: 'Módulo, divisores de um número, polinômio, soma e produto e geometria',
    questions: [
      {
        n: 1, skill: 'Módulo',
        prompt: 'Calcule:',
        items: [
          {
            key: 'a', label: 'a)', prompt: '[[|-8|]] =',
            answer: { type: 'integer', value: 8, neg: true },
            hint: { rules: ['modulo'], tip: 'Pense na distância do −8 até o zero na reta numérica.' },
            hints: [{ when: -8, msg: 'O módulo é uma distância, e distância nunca é negativa.' }],
            final: '8',
            steps: {
              ask: 'O <b>módulo de −8</b>.', concept: moduloConcept,
              data: 'O número é <b>−8</b>.',
              s1: 'Na reta numérica, do −8 até o 0 são <b>8 passos</b>.',
              s2: 'Então o módulo "tira" o sinal de menos: o resultado é positivo.',
              final: '[[|-8| = 8]]', check: 'Distância não pode ser negativa, e 8 é positivo ✓.'
            }
          },
          {
            key: 'b', label: 'b)', prompt: '[[|3|]] =',
            answer: { type: 'integer', value: 3, neg: true },
            hint: { rules: ['modulo'], tip: 'Qual é a distância do 3 até o zero?' },
            hints: [{ when: -3, msg: 'O módulo é uma distância, e distância nunca é negativa.' }],
            final: '3',
            steps: {
              ask: 'O <b>módulo de 3</b>.', concept: moduloConcept,
              data: 'O número é <b>3</b>, que já é positivo.',
              s1: 'Na reta numérica, do 3 até o 0 são <b>3 passos</b>.',
              s2: 'Número positivo continua igual dentro do módulo.',
              final: '[[|3| = 3]]', check: 'O 3 já estava a 3 passos do zero ✓.'
            }
          },
          {
            key: 'c', label: 'c)', prompt: '[[|4 - 7|]] =',
            answer: { type: 'integer', value: 3, neg: true },
            hint: { rules: ['modulo'], tip: 'Primeiro resolva a conta que está <b>dentro</b> das barras. Só depois aplique o módulo.' },
            hints: [
              { when: -3, msg: 'Você fez [[4 - 7 = -3]] certinho! Mas ainda falta aplicar o módulo.' },
              { when: 11, msg: 'Dentro do módulo é uma subtração: [[4 - 7]].' }
            ],
            final: '3',
            steps: {
              ask: 'O módulo de <b>4 − 7</b>.', concept: moduloConcept,
              data: 'Dentro das barras tem uma conta: [[4 - 7]].',
              s1: 'Primeiro resolvemos o que está <b>dentro</b> das barras:<div class="calc">[[4 - 7 = -3]]</div>',
              s2: 'Depois aplicamos o módulo:<div class="calc">[[|-3| = 3]]</div>',
              final: '[[|4 - 7| = 3]]', check: 'De 4 até 7 a distância é 3 ✓.'
            }
          },
          {
            key: 'd', label: 'd)', prompt: '[[-|5| + |-2|]] =',
            answer: { type: 'integer', value: -3, neg: true },
            hint: { rules: ['modulo'], tip: 'Calcule cada módulo separadamente. O sinal que está <b>fora</b> das barras continua valendo.' },
            hints: [
              { when: 3, msg: 'Cuidado: o sinal de menos que está <b>fora</b> do [[|5|]] continua valendo.' },
              { when: 7, msg: 'Cuidado: o sinal de menos que está <b>fora</b> do [[|5|]] continua valendo.' },
              { when: -7, msg: 'Lembre que [[|-2|]] é +2.' }
            ],
            final: '−3',
            steps: {
              ask: 'Calcular [[-|5| + |-2|]].', concept: moduloConcept,
              data: 'Temos dois módulos: [[|5|]] e [[|-2|]], e um sinal de menos <b>fora</b> do primeiro.',
              s1: 'Calculamos cada módulo:<div class="calc">[[|5| = 5]] &nbsp;e&nbsp; [[|-2| = 2]]</div>',
              s2: 'O sinal de menos que estava <b>fora</b> do módulo continua lá:<div class="calc">[[-5 + 2 = -3]]</div>Pense assim: se você deve 5 e ganha 2, ainda deve 3.',
              final: '[[-|5| + |-2| = -3]]',
              check: 'O módulo nunca é negativo, mas aqui o menos estava <b>fora</b> dele, então o resultado final pode ser negativo ✓.'
            }
          }
        ],
        variations: []
      },
      {
        n: 2, skill: 'Número de divisores',
        prompt: 'Calcule o número de divisores positivos do número 540.',
        items: [{
          key: 'u',
          answer: { type: 'integer', value: 24, placeholder: 'Quantidade' },
          hint: { rules: ['qtd-divisores'], tip: 'Fatore 540 em números primos e olhe os <b>expoentes</b>.' },
          hints: [
            { when: 6, msg: 'Quase! Antes de multiplicar, some <b>1</b> a cada expoente.' },
            { when: 3, msg: 'Esses são só os divisores primos (2, 3 e 5). A pergunta é sobre <b>todos</b> os divisores.' },
            { when: 12, msg: 'Parece que faltou metade. Os divisores vêm em pares: 1 × 540, 2 × 270...' }
          ],
          final: '24 divisores',
          steps: {
            ask: 'Quantos números inteiros positivos dividem 540 <b>exatamente</b> (sem sobrar resto).',
            concept: '<b>Truque dos expoentes:</b> fatore o número em primos, some 1 a cada expoente e multiplique os resultados.',
            data: 'O número é <b>540</b>.',
            s1: 'Fatoramos 540 (dividindo pelos primos):<table class="fatora"><tr><td>540</td><td>2</td></tr><tr><td>270</td><td>2</td></tr><tr><td>135</td><td>3</td></tr><tr><td>45</td><td>3</td></tr><tr><td>15</td><td>3</td></tr><tr><td>5</td><td>5</td></tr><tr><td>1</td><td></td></tr></table><div class="calc">[[540 = 2^2 * 3^3 * 5^1]]</div>',
            s2: 'Os expoentes são 2, 3 e 1. Somamos 1 em cada um e multiplicamos:<div class="calc">[[(2 + 1) * (3 + 1) * (1 + 1) = 3 * 4 * 2 = 24]]</div><p class="aside">Por que +1? Num divisor, o 2 pode aparecer 0, 1 ou 2 vezes (3 opções); o 3 pode aparecer 0, 1, 2 ou 3 vezes (4 opções); o 5, 0 ou 1 vez (2 opções).</p>',
            final: '540 tem <b>24 divisores positivos</b>.',
            check: 'Listando em pares que multiplicados dão 540: 1·540, 2·270, 3·180, 4·135, 5·108, 6·90, 9·60, 10·54, 12·45, 15·36, 18·30, 20·27. São 12 pares = <b>24</b> divisores ✓.'
          }
        }],
        variations: []
      },
      {
        n: 3, skill: 'Divisores de um número',
        prompt: 'Apresente todos os divisores do número 18.',
        items: [{
          key: 'u',
          answer: { type: 'textList', values: [1, 2, 3, 6, 9, 18], alsoAccept: [[-18, -9, -6, -3, -2, -1, 1, 2, 3, 6, 9, 18]], placeholder: 'Ex.: 1, 2, ...', help: 'Digite os divisores separados por vírgula ou espaço.' },
          hint: { rules: ['divisores'], tip: 'Teste 1, 2, 3, 4... e procure os <b>pares</b> de números que, multiplicados, dão 18.' },
          hints: [
            { when: function (v) { return v.some(function (a) { return a === 0 || 18 % a !== 0; }); }, msg: 'Tem número na sua lista que <b>não divide</b> 18 exatamente. Confira cada um.' },
            { when: function (v) { return v.indexOf(1) < 0 || v.indexOf(18) < 0; }, msg: 'Não esqueça: o <b>1</b> e o próprio <b>18</b> também são divisores de 18!' },
            { when: function () { return true; }, msg: 'Ainda falta divisor. Lembre dos pares que multiplicados dão 18: 1 × 18, 2 × ?, 3 × ?' }
          ],
          final: '1, 2, 3, 6, 9 e 18',
          steps: {
            ask: 'Listar <b>todos</b> os números que dividem 18 sem sobrar resto.',
            concept: '<b>Divisor</b> de 18 = número que divide 18 com resto zero. Truque: os divisores vêm em <b>pares</b> que, multiplicados, dão 18.',
            data: 'O número é <b>18</b>.',
            s1: 'Testamos um por um:<div class="calc">[[18 ÷ 1 = 18]] ✓ &nbsp; [[18 ÷ 2 = 9]] ✓ &nbsp; [[18 ÷ 3 = 6]] ✓</div><div class="calc">[[18 ÷ 4]] = 4 e sobra 2 ✗ &nbsp; [[18 ÷ 5]] = 3 e sobra 3 ✗</div>',
            s2: 'Montamos os pares: <b>1 × 18</b>, <b>2 × 9</b>, <b>3 × 6</b>. Depois do 5 vem o 6, que já apareceu num par — podemos parar.',
            final: 'Os divisores de 18 são <b>1, 2, 3, 6, 9 e 18</b>.',
            check: 'São 6 divisores. Pelo truque dos expoentes: [[18 = 2^1 * 3^2]] → [[(1 + 1) * (2 + 1) = 6]] ✓.'
          }
        }],
        variations: []
      },
      {
        n: 4, skill: 'Regras de divisibilidade',
        prompt: 'Verificar quais dos números são divisíveis por 2 ou 3. (Use as regras de divisibilidade!)',
        items: [
          {
            key: 'a', label: 'a)', prompt: '192',
            answer: { type: 'multiSelect', options: divOptions, correct: ['d2', 'd3'] },
            hint: divHint(192), hints: divHints(192), final: 'Divisível por 2 e por 3',
            steps: {
              ask: 'Descobrir se <b>192</b> é divisível por 2, por 3, pelos dois ou por nenhum.', concept: divConcept,
              data: 'O número é <b>192</b>.',
              s1: '<b>Por 2:</b> o último algarismo é <b>2</b>, que é par → divisível por 2 ✓.',
              s2: '<b>Por 3:</b> somamos os algarismos: [[1 + 9 + 2 = 12]]. 12 está na tabuada do 3 ([[3 * 4 = 12]]) → divisível por 3 ✓.',
              final: '192 é divisível <b>por 2 e por 3</b>.',
              check: '[[192 ÷ 2 = 96]] e [[192 ÷ 3 = 64]], sem resto ✓.'
            }
          },
          {
            key: 'b', label: 'b)', prompt: '3005',
            answer: { type: 'multiSelect', options: divOptions, correct: ['none'] },
            hint: divHint(3005), hints: divHints(3005), final: 'Nem por 2, nem por 3',
            steps: {
              ask: 'Descobrir se <b>3005</b> é divisível por 2, por 3, pelos dois ou por nenhum.', concept: divConcept,
              data: 'O número é <b>3005</b>.',
              s1: '<b>Por 2:</b> termina em <b>5</b>, que é ímpar → não é divisível por 2 ✗.',
              s2: '<b>Por 3:</b> [[3 + 0 + 0 + 5 = 8]]. 8 não está na tabuada do 3 → não é divisível por 3 ✗.',
              final: '3005 <b>não é divisível nem por 2 nem por 3</b>.',
              check: '[[3005 ÷ 3]] dá 1001 e sobra 2 ✓ (sobrou resto, então não divide).'
            }
          },
          {
            key: 'c', label: 'c)', prompt: '20920',
            answer: { type: 'multiSelect', options: divOptions, correct: ['d2'] },
            hint: divHint(20920), hints: divHints(20920), final: 'Somente por 2',
            steps: {
              ask: 'Descobrir se <b>20920</b> é divisível por 2, por 3, pelos dois ou por nenhum.', concept: divConcept,
              data: 'O número é <b>20920</b>.',
              s1: '<b>Por 2:</b> termina em <b>0</b>, que é par → divisível por 2 ✓.',
              s2: '<b>Por 3:</b> [[2 + 0 + 9 + 2 + 0 = 13]]. 13 não está na tabuada do 3 → não é divisível por 3 ✗.',
              final: '20920 é divisível <b>somente por 2</b>.',
              check: '[[20920 ÷ 2 = 10460]] ✓; [[20920 ÷ 3]] dá 6973 e sobra 1 ✗.'
            }
          },
          {
            key: 'd', label: 'd)', prompt: '708',
            answer: { type: 'multiSelect', options: divOptions, correct: ['d2', 'd3'] },
            hint: divHint(708), hints: divHints(708), final: 'Divisível por 2 e por 3',
            steps: {
              ask: 'Descobrir se <b>708</b> é divisível por 2, por 3, pelos dois ou por nenhum.', concept: divConcept,
              data: 'O número é <b>708</b>.',
              s1: '<b>Por 2:</b> termina em <b>8</b>, que é par → divisível por 2 ✓.',
              s2: '<b>Por 3:</b> [[7 + 0 + 8 = 15]]. 15 está na tabuada do 3 ([[3 * 5 = 15]]) → divisível por 3 ✓.',
              final: '708 é divisível <b>por 2 e por 3</b>.',
              check: '[[708 ÷ 2 = 354]] e [[708 ÷ 3 = 236]], sem resto ✓.'
            }
          }
        ],
        variations: []
      },
      {
        n: 5, skill: 'Monômios semelhantes',
        prompt: 'Transforme em um único monômio.',
        items: [
          {
            key: 'a', label: 'a)', prompt: '[[5x + 2x]]',
            answer: { type: 'polynomial', coeffs: { 1: 7 }, simplified: true },
            hint: { rules: ['semelhantes'], tip: 'Os dois termos têm a mesma parte com letra. Some só os números da frente.' },
            hints: [{ when: '7x^2', msg: 'Na soma o expoente <b>não muda</b>! [[x + x]] não vira [[x^2]].' }, { when: '10x^2', msg: 'Isso seria multiplicar. Aqui é uma soma.' }],
            final: '[[7x]]',
            steps: {
              ask: 'Juntar [[5x + 2x]] em <b>um único termo</b>.', concept: monoConcept,
              data: 'Os termos [[5x]] e [[2x]] têm a mesma parte com letra: [[x]].',
              s1: 'Somamos os coeficientes:<div class="calc">[[5 + 2 = 7]]</div>',
              s2: 'A parte com letra continua [[x]]. Pense em frutas: 5 laranjas + 2 laranjas = 7 laranjas.',
              final: '[[5x + 2x = 7x]]',
              check: 'Testando com [[x = 1]]: [[5 + 2 = 7]] e [[7 * 1 = 7]] ✓.'
            }
          },
          {
            key: 'b', label: 'b)', prompt: '[[-3x^2 + 5x^2]]',
            answer: { type: 'polynomial', coeffs: { 2: 2 }, simplified: true },
            hint: { rules: ['semelhantes'], tip: 'Some os coeficientes prestando atenção nos <b>sinais</b>. O expoente não muda.' },
            hints: [{ when: '2x^4', msg: 'Na soma o expoente <b>não muda</b>: continua [[x^2]].' }, { when: '8x^2', msg: 'Olhe o sinal do −3.' }, { when: '-8x^2', msg: 'Olhe os sinais: é −3 <b>mais</b> 5.' }, { when: '-2x^2', msg: 'Olhe os sinais: −3 + 5 dá positivo ou negativo?' }],
            final: '[[2x^2]]',
            steps: {
              ask: 'Juntar [[-3x^2 + 5x^2]] em um único termo.', concept: monoConcept,
              data: 'Os dois termos têm a mesma parte com letra: [[x^2]].',
              s1: 'Somamos os coeficientes, com os sinais:<div class="calc">[[-3 + 5 = 2]]</div>',
              s2: 'A parte com letra continua [[x^2]] (o expoente não muda na soma).',
              final: '[[-3x^2 + 5x^2 = 2x^2]]',
              check: 'Testando com [[x = 2]]: [[-3 * 4 + 5 * 4 = -12 + 20 = 8]] e [[2 * 4 = 8]] ✓.'
            }
          },
          {
            key: 'c', label: 'c)', prompt: '[[-2x^3 + 3x^3 + 6x^3 + 2x^3 - 8x^3]]',
            answer: { type: 'polynomial', coeffs: { 3: 1 }, simplified: true },
            hint: { rules: ['semelhantes'], tip: 'Todos os termos são semelhantes. Some os coeficientes <b>um de cada vez</b>, com os sinais.' },
            hints: [{ when: '21x^3', msg: 'Olhe os sinais de menos: o −2 e o −8 tiram.' }, { when: '-1x^3', msg: 'Confira os sinais, somando um termo por vez.' }, { when: '5x^3', msg: 'Confira a conta, somando um termo por vez.' }],
            final: '[[x^3]]',
            steps: {
              ask: 'Juntar os cinco termos em um único monômio.', concept: monoConcept,
              data: 'Todos os termos têm a mesma parte com letra: [[x^3]]. Os coeficientes são −2, +3, +6, +2 e −8.',
              s1: 'Somamos os coeficientes, um de cada vez:<div class="calc">[[-2 + 3 = 1]] → [[1 + 6 = 7]] → [[7 + 2 = 9]] → [[9 - 8 = 1]]</div>',
              s2: 'O coeficiente é <b>1</b>. Quando o número da frente é 1, não precisamos escrever: [[1x^3 = x^3]].',
              final: '[[-2x^3 + 3x^3 + 6x^3 + 2x^3 - 8x^3 = x^3]]',
              check: 'Positivos: [[3 + 6 + 2 = 11]]. Negativos: [[-2 - 8 = -10]]. [[11 - 10 = 1]] ✓.'
            }
          }
        ],
        variations: []
      },
      {
        n: 6, skill: 'Grau do polinômio',
        prompt: 'Qual o grau de cada um dos polinômios a seguir?',
        items: [
          {
            key: 'a', label: 'a)', prompt: '[[8 - 5x^3 - 2x^2 + x^7]]',
            answer: { type: 'integer', value: 7, placeholder: 'Grau' },
            hint: { rules: ['grau'], tip: 'Primeiro veja se há termos semelhantes para juntar. Depois procure o maior expoente.' },
            hints: [{ when: 3, msg: 'Procure o <b>maior</b> expoente do [[x]] em todo o polinômio.' }, { when: 8, msg: 'O 8 é um número sozinho (sem [[x]]). O grau é o maior <b>expoente</b> do [[x]].' }],
            final: '7',
            steps: {
              ask: 'O <b>grau</b> do polinômio.', concept: grauConcept,
              data: 'Termos: [[8]] (grau 0), [[-5x^3]] (grau 3), [[-2x^2]] (grau 2) e [[x^7]] (grau 7).',
              s1: 'Procuramos termos semelhantes para juntar: não tem nenhum (cada expoente aparece uma vez só).',
              s2: 'O maior expoente do [[x]] é o do termo [[x^7]].',
              final: 'O polinômio tem <b>grau 7</b>.',
              check: 'O termo [[x^7]] tem coeficiente 1 (não é zero), então ele vale ✓.'
            }
          },
          {
            key: 'b', label: 'b)', prompt: '[[8 - 5x^3 - 2x^3 + x^7 - x^7 - x^2 + 7x^3]]',
            answer: { type: 'integer', value: 2, placeholder: 'Grau' },
            hint: { rules: ['grau', 'semelhantes'], tip: 'Cuidado: alguns termos podem <b>se anular</b>. Junte os semelhantes antes de olhar o maior expoente.' },
            hints: [{ when: 7, msg: 'Cuidado com a pegadinha! Antes de responder, junte os termos semelhantes: veja o que acontece com [[x^7 - x^7]].' }, { when: 3, msg: 'Some [[-5 - 2 + 7]]: quanto sobra de [[x^3]]?' }, { when: 0, msg: 'Nem tudo some: sobra o termo [[-x^2]].' }],
            final: '2',
            steps: {
              ask: 'O <b>grau</b> do polinômio — mas atenção: tem termos que se cancelam!', concept: grauConcept,
              data: 'Termos: [[8]], [[-5x^3]], [[-2x^3]], [[x^7]], [[-x^7]], [[-x^2]] e [[7x^3]].',
              s1: 'Juntamos os termos semelhantes:<div class="calc">[[x^7 - x^7 = 0]] (somem!)</div><div class="calc">[[-5x^3 - 2x^3 + 7x^3 = (-5 - 2 + 7)x^3 = 0x^3]] (somem também!)</div>',
              s2: 'O que sobra é:<div class="calc">[[8 - x^2]]</div>O maior expoente agora é <b>2</b>.',
              final: 'Depois de simplificar, o polinômio tem <b>grau 2</b>.',
              check: 'Essa era a pegadinha: quem olha sem simplificar diz 7. Simplificando, fica [[8 - x^2]] ✓.'
            }
          }
        ],
        variations: []
      },
      {
        n: 7, skill: 'Multiplicação de polinômios',
        prompt: 'Sendo [[A(x) = x^2 + 3x]] e [[B(x) = x + 1]], calcule [[A * B]].',
        items: [{
          key: 'u',
          answer: { type: 'polynomial', coeffs: { 3: 1, 2: 4, 1: 3 }, simplified: true },
          hint: { rules: ['distributiva', 'potencias'], tip: 'Multiplique <b>cada</b> termo de [[A]] por <b>cada</b> termo de [[B]] (são 4 multiplicações). Depois junte os semelhantes.' },
          hints: [
            { when: 'x^2 + 4x + 1', msg: 'Isso é [[A + B]] (soma). A questão pede a <b>multiplicação</b>.' },
            { when: 'x^3 + 3x', msg: 'Faltou multiplicar alguns termos: cada termo do primeiro vezes <b>cada</b> termo do segundo (são 4 multiplicações).' },
            { when: 'x^3 + 3x^2', msg: 'Faltou multiplicar pelo <b>+1</b> do [[B(x)]]: são 4 multiplicações.' },
            { when: '5x^2 + 3x', msg: 'Lembre: [[x^2 * x = x^3]] (somamos os expoentes na multiplicação).' },
            { when: 'x^3 + 3x^2 + 3x', msg: 'Faltou o termo [[x^2 * 1 = x^2]]. Depois junte com os outros [[x^2]].' }
          ],
          final: '[[x^3 + 4x^2 + 3x]]',
          steps: {
            ask: '<b>Multiplicar</b> [[A(x)]] por [[B(x)]].',
            concept: '<b>Distributiva</b> (o "chuveirinho"): cada termo do primeiro multiplica cada termo do segundo. E na multiplicação de potências de mesma base, <b>somamos</b> os expoentes: [[x^2 * x = x^3]].',
            data: '[[A(x) = x^2 + 3x]] e [[B(x) = x + 1]].',
            s1: 'Fazemos as 4 multiplicações de [[(x^2 + 3x)(x + 1)]]:<div class="calc">[[x^2 * x = x^3]] &nbsp; [[x^2 * 1 = x^2]]</div><div class="calc">[[3x * x = 3x^2]] &nbsp; [[3x * 1 = 3x]]</div>',
            s2: 'Juntamos tudo e somamos os termos semelhantes ([[x^2 + 3x^2 = 4x^2]]):<div class="calc">[[x^3 + x^2 + 3x^2 + 3x = x^3 + 4x^2 + 3x]]</div>',
            final: '[[A * B = x^3 + 4x^2 + 3x]]',
            check: 'Testando com [[x = 1]]: [[A(1) = 4]], [[B(1) = 2]] e [[4 * 2 = 8]]. Na resposta: [[1 + 4 + 3 = 8]] ✓.'
          }
        }],
        variations: []
      },
      {
        n: 8, skill: 'Soma e produto',
        prompt: 'Resolver as equações usando soma e produto ([[U = ℝ]]).',
        items: [
          {
            key: 'a', label: 'a)', prompt: '[[-x^2 + 2x + 3 = 0]]',
            answer: { type: 'numberList', values: [-1, 3], ordered: false, labels: ['[[x_1]] =', '[[x_2]] ='], neg: true },
            hint: { rules: ['soma-produto'], tip: 'O número na frente do [[x^2]] é −1. Divida a equação toda por −1 primeiro.' },
            hints: [
              { when: [1, -3], msg: 'O produto está certo (−3), mas a soma deu −2. A soma precisa ser <b>2</b>: confira os sinais.' },
              { when: function (v) { return v[0] * v[1] !== -3; }, msg: 'Confira o <b>produto</b>: depois de dividir por −1, a equação fica [[x^2 - 2x - 3 = 0]].' },
              { when: function () { return true; }, msg: 'Confira a <b>soma</b> das duas raízes.' }
            ],
            final: '[[x = -1]] e [[x = 3]]',
            steps: {
              ask: 'Os valores de [[x]] que fazem a equação dar zero (as <b>raízes</b>).', concept: somaProdConcept,
              data: 'Em [[-x^2 + 2x + 3 = 0]], o número na frente do [[x^2]] é <b>−1</b>.',
              s1: 'Dividimos a equação toda por −1 (troca todos os sinais):<div class="calc">[[x^2 - 2x - 3 = 0]]</div>Agora [[b = -2]] e [[c = -3]]:<div class="calc">Soma = [[-b = 2]] &nbsp;&nbsp; Produto = [[c = -3]]</div>',
              s2: 'Dois números com produto <b>−3</b> e soma <b>2</b>:<div class="calc">1 e −3 → soma −2 ✗ &nbsp;&nbsp; −1 e 3 → soma 2 ✓</div>',
              final: '[[x = -1]] e [[x = 3]] &nbsp;→&nbsp; S = {−1, 3}',
              check: '[[x = 3]]: [[-9 + 6 + 3 = 0]] ✓. [[x = -1]]: [[-1 - 2 + 3 = 0]] ✓.'
            }
          },
          {
            key: 'b', label: 'b)', prompt: '[[x^2 + 6x - 16 = 0]]',
            answer: { type: 'numberList', values: [-8, 2], ordered: false, labels: ['[[x_1]] =', '[[x_2]] ='], neg: true },
            hint: { rules: ['soma-produto'], tip: 'Aqui o número na frente do [[x^2]] já é 1. Descubra a soma e o produto e procure os dois números.' },
            hints: [
              { when: [8, -2], msg: 'Quase! A soma deu +6, mas precisa ser <b>−6</b>. Troque os sinais.' },
              { when: function (v) { return v[0] * v[1] !== -16; }, msg: 'Confira o <b>produto</b>: as raízes multiplicadas precisam dar [[c]].' },
              { when: function () { return true; }, msg: 'Confira a <b>soma</b>: ela é [[-b]].' }
            ],
            final: '[[x = -8]] e [[x = 2]]',
            steps: {
              ask: 'As <b>raízes</b> da equação.', concept: somaProdConcept,
              data: 'Em [[x^2 + 6x - 16 = 0]]: o número na frente do [[x^2]] é 1, [[b = 6]] e [[c = -16]].',
              s1: 'Soma e produto:<div class="calc">Soma = [[-b = -6]] &nbsp;&nbsp; Produto = [[c = -16]]</div>',
              s2: 'Pares de números com produto <b>−16</b>:<div class="calc">1 e −16 → soma −15 ✗ &nbsp; 2 e −8 → soma −6 ✓ &nbsp; 4 e −4 → soma 0 ✗</div>',
              final: '[[x = -8]] e [[x = 2]] &nbsp;→&nbsp; S = {−8, 2}',
              check: '[[x = 2]]: [[4 + 12 - 16 = 0]] ✓. [[x = -8]]: [[64 - 48 - 16 = 0]] ✓.'
            }
          }
        ],
        variations: []
      },
      {
        n: 9, skill: 'Área de figuras',
        prompt: 'Observe a figura a seguir. Considerando que o lado do quadrado ABCJ tem 80 cm, o lado do quadrado DEIJ tem 40 cm e que o lado do quadrado FGHI tem 20 cm, qual é a área da figura, em cm²?',
        figure: FIG.squares([80, 40, 20], false),
        items: [{
          key: 'u',
          answer: { type: 'integer', value: 8400, suffix: 'cm²', placeholder: 'Área' },
          hint: { rules: ['area-quadrado', 'area-composta'], tip: 'Calcule a área de <b>cada</b> quadrado separadamente e depois junte.' },
          hints: [
            { when: 140, msg: 'Você somou os lados. Área de quadrado é <b>lado × lado</b>!' },
            { when: 6400, msg: 'Essa é a área do quadrado grande. Faltou somar os outros dois.' },
            { when: 8000, msg: 'Confira a área de cada quadrado: lado × lado.' },
            { when: 64000, msg: 'Você multiplicou os lados entre si. Calcule a área de <b>cada</b> quadrado e some.' }
          ],
          final: '8.400 cm²',
          steps: {
            ask: 'A <b>área total</b> da figura, em cm².',
            concept: 'Área do quadrado = <b>lado × lado</b>. E a área de uma figura formada por pedaços que não se sobrepõem é a <b>soma</b> das áreas dos pedaços.',
            data: 'Quadrado ABCJ: lado 80 cm. Quadrado DEIJ: lado 40 cm. Quadrado FGHI: lado 20 cm. Eles ficam lado a lado, sem um cobrir o outro (as linhas tracejadas só mostram onde um encosta no outro).',
            s1: 'Área de cada quadrado:<div class="calc">[[80 * 80 = 6400]] cm² &nbsp; [[40 * 40 = 1600]] cm² &nbsp; [[20 * 20 = 400]] cm²</div>',
            s2: 'Somamos as três áreas:<div class="calc">[[6400 + 1600 + 400 = 8400]] cm²</div>',
            fig: FIG.squares([80, 40, 20], true),
            final: 'A área da figura é <b>8.400 cm²</b>.',
            check: 'Cada quadrado tem o lado pela metade do anterior, então a área fica 4 vezes menor: [[6400 ÷ 4 = 1600]] e [[1600 ÷ 4 = 400]] ✓.'
          }
        }],
        variations: []
      },
      {
        n: 10, skill: 'Revestimento com lajotas',
        prompt: 'Uma região retangular de 0,76 m de comprimento por 480 mm de largura será revestida de lajotas quadradas de 8 cm de lado. Se o preço de cada lajota é de R$ 2,75, determine o total a ser pago para revestir essa região.',
        items: [{
          key: 'u',
          answer: { type: 'currency', value: 156.75, prefix: 'R$', placeholder: '0,00' },
          hint: { rules: ['conversao', 'lajotas', 'custo'], tip: 'Primeiro passe todas as medidas para <b>centímetros</b>. Depois descubra quantas lajotas cobrem a região.' },
          hints: [
            { when: 165, msg: 'Com o <b>aproveitamento dos recortes</b>, uma lajota cortada ao meio cobre dois pedaços da última faixa. Não precisa de 60 lajotas.' },
            { when: 57, msg: 'Esse é o <b>número de lajotas</b>! Falta calcular o preço total.' },
            { when: 3648, msg: 'Essa é a área da região em cm². Descubra quantas lajotas cabem e depois o preço.' },
            { when: 148.5, msg: 'Faltou cobrir a última faixa, de meia lajota.' },
            { when: 1.5675, msg: 'Confira as unidades: tudo precisa estar em centímetros.' }
          ],
          final: 'R$ 156,75',
          steps: {
            ask: 'O <b>total a pagar</b> pelas lajotas que cobrem a região.',
            concept: 'Antes de fazer contas, todas as medidas precisam estar na <b>mesma unidade</b>. Lembre: 1 m = 100 cm e 1 cm = 10 mm.',
            data: 'Comprimento: <b>0,76 m</b>. Largura: <b>480 mm</b>. Lajota quadrada de <b>8 cm</b> de lado. Preço: <b>R$ 2,75</b> cada.',
            s1: 'Convertemos tudo para centímetros:<div class="calc">[[0,76 * 100 = 76]] cm &nbsp;&nbsp; [[480 ÷ 10 = 48]] cm</div>Área da região: [[76 * 48 = 3648]] cm². Área de uma lajota: [[8 * 8 = 64]] cm².',
            s2: 'Quantas lajotas? [[3648 ÷ 64 = 57]].<p class="aside">Olhando a figura: no comprimento cabem [[76 ÷ 8 = 9,5]] lajotas e na largura [[48 ÷ 8 = 6]] fileiras. São [[9 * 6 = 54]] inteiras + 6 metades. As 6 metades saem de 3 lajotas cortadas ao meio (aproveitando os recortes): [[54 + 3 = 57]].</p>Preço total:<div class="calc">[[57 * 2,75 = 156,75]]</div><p class="aside">[[57 * 2 = 114]] e [[57 * 0,75 = 42,75]]; [[114 + 42,75 = 156,75]].</p>',
            fig: FIG.tiles(76, 48, 8, '76 cm (0,76 m)', '48 cm (480 mm)'),
            final: 'O total a pagar é <b>R$ 156,75</b> (57 lajotas).',
            check: '57 lajotas × 64 cm² = 3648 cm², exatamente a área da região ✓. Estamos considerando que os recortes são <b>reaproveitados</b>: cada lajota cortada ao meio cobre dois pedaços. (Sem reaproveitar, seriam 10 × 6 = 60 lajotas = R$ 165,00.)'
          }
        }],
        variations: []
      }
    ]
  };

  window.GM_FIG = FIG;
  window.GM_BANK = { version: 2, exams: [P1, P2] };
})();
