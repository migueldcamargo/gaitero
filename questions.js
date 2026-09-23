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

  // Reflexão construída ponto a ponto (resolução da P1 Q10). cur = índice do ponto que está sendo
  // refletido agora (animado); os anteriores já aparecem prontos. complete = liga os pontos da imagem.
  FIG.reflectionStep = function (cfg, img, cur, complete) {
    var b = cfg.bounds, U = 10, x0 = b[0], x1 = b[1], y0 = b[2], y1 = b[3], k = cfg.k, V = cfg.axis === 'v';
    var gx = function (x) { return (x - x0) * U; }, gy = function (y) { return (y1 - y) * U; };
    var W = (x1 - x0) * U, H = (y1 - y0) * U, s = '', x, y;
    var names = cfg.names || ['P', 'Q', 'R'];
    for (x = x0; x <= x1; x++) s += '<line x1="' + gx(x) + '" y1="0" x2="' + gx(x) + '" y2="' + H + '"/>';
    for (y = y0; y <= y1; y++) s += '<line x1="0" y1="' + gy(y) + '" x2="' + W + '" y2="' + gy(y) + '"/>';
    var out = '<g class="fg-grid">' + s + '</g>';
    out += V
      ? '<line class="fg-axis" x1="' + gx(k) + '" y1="' + gy(y1 - 0.3) + '" x2="' + gx(k) + '" y2="' + gy(y0 + 0.3) + '"/><text class="fg-lbl fg-e" x="' + (gx(k) + 6) + '" y="' + (gy(y1 - 0.6) + 3) + '">e</text>'
      : '<line class="fg-axis" x1="' + gx(x0 + 0.3) + '" y1="' + gy(k) + '" x2="' + gx(x1 - 0.3) + '" y2="' + gy(k) + '"/><text class="fg-lbl fg-e" x="' + gx(x1 - 0.7) + '" y="' + (gy(k) - 5) + '">e</text>';
    var cx = 0, cy = 0;
    cfg.orig.forEach(function (p) { cx += p[0] / cfg.orig.length; cy += p[1] / cfg.orig.length; });
    var icx = 0, icy = 0;
    img.forEach(function (p) { icx += p[0] / img.length; icy += p[1] / img.length; });
    var lbl = function (p, c0, c1, text, cls) {
      var dx = p[0] - c0, dy = p[1] - c1, len = Math.hypot(dx, dy) || 1;
      return '<text class="fg-lbl ' + (cls || '') + '" x="' + (gx(p[0]) + dx / len * 8).toFixed(1) + '" y="' + (gy(p[1]) - dy / len * 8 + 3.2).toFixed(1) + '">' + text + '</text>';
    };
    // figura original
    out += '<g class="fg-tri-orig"><polygon points="' + cfg.orig.map(function (p) { return gx(p[0]) + ',' + gy(p[1]); }).join(' ') + '"/>' +
      cfg.orig.map(function (p, i) { return '<circle cx="' + gx(p[0]) + '" cy="' + gy(p[1]) + '" r="1.9"/>' + lbl(p, cx, cy, names[i]); }).join('') + '</g>';
    if (complete) out += '<polygon class="fg-img-fill anim-fade" points="' + img.map(function (p) { return gx(p[0]) + ',' + gy(p[1]); }).join(' ') + '"/>';
    var last = complete ? img.length - 1 : cur;
    for (var i = 0; i <= last && i < img.length; i++) {
      var p = cfg.orig[i], q = img[i], d = Math.abs(V ? k - p[0] : k - p[1]);
      var foot = V ? [k, p[1]] : [p[0], k];
      var anim = !complete && i === cur;
      var A = function (cls, delay) { return anim ? ' class="' + cls + '" style="animation-delay:' + delay + 's"' : ' class="' + cls.replace(/ anim-\w+/g, '') + '"'; };
      out += '<path' + A('fg-measure anim-draw', 0) + ' pathLength="1" d="M' + gx(p[0]) + ' ' + gy(p[1]) + ' L' + gx(foot[0]) + ' ' + gy(foot[1]) + '"/>';
      out += '<path' + A('fg-measure fg-measure-2 anim-draw', 0.9) + ' pathLength="1" d="M' + gx(foot[0]) + ' ' + gy(foot[1]) + ' L' + gx(q[0]) + ' ' + gy(q[1]) + '"/>';
      if (V) {
        out += '<text' + A('fg-dist anim-fade', 0.7) + ' x="' + gx((p[0] + k) / 2) + '" y="' + (gy(p[1]) - 3) + '">' + d + '</text>';
        out += '<text' + A('fg-dist anim-fade', 1.6) + ' x="' + gx((q[0] + k) / 2) + '" y="' + (gy(q[1]) - 3) + '">' + d + '</text>';
        out += '<path' + A('fg-right anim-fade', 0.7) + ' d="M' + (gx(k) + (p[0] < k ? -3 : 3)) + ' ' + gy(p[1]) + ' v-3 h' + (p[0] < k ? 3 : -3) + '"/>';
      } else {
        out += '<text' + A('fg-dist fg-dist-side anim-fade', 0.7) + ' x="' + (gx(p[0]) + 3) + '" y="' + (gy((p[1] + k) / 2) + 3) + '">' + d + '</text>';
        out += '<text' + A('fg-dist fg-dist-side anim-fade', 1.6) + ' x="' + (gx(q[0]) + 3) + '" y="' + (gy((q[1] + k) / 2) + 3) + '">' + d + '</text>';
        out += '<path' + A('fg-right anim-fade', 0.7) + ' d="M' + (gx(p[0]) + 3) + ' ' + (gy(k) + (p[1] > k ? -3 : 3)) + ' h-3"/>';
      }
      out += '<circle' + A('fg-img-pt anim-pop', 1.7) + ' cx="' + gx(q[0]) + '" cy="' + gy(q[1]) + '" r="2.6"/>';
      out += lbl(q, icx, icy, names[i] + '′', 'fg-img-lbl' + (anim ? ' anim-fade" style="animation-delay:1.9s' : ''));
    }
    return '<svg class="fig fig-refl" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Reflexão construída ponto a ponto">' + out + '</svg>';
  };

  // Barra de porcentagem (P1 Q6 e Q7). Em cima: 0 … número completo. Embaixo: 0% … 100%.
  // o = { total, p (onde a barra termina, em %), from (de onde ela encolhe, em %; sem animação se igual),
  //       value (texto no marcador), pctLabel, cut (% cortado da ponta direita, em vermelho) }
  var barSeq = 0;
  FIG.pctBar = function (o) {
    var id = 'pbar' + (++barSeq), X0 = 30, W = 260, Y = 40, H = 22;
    var t = o.p / 100, f = (o.from != null ? o.from : o.p) / 100, anim = f !== t;
    var xm = X0 + W * Math.min(t, 1), s = '';
    s += '<defs><clipPath id="' + id + '"><rect x="' + X0 + '" y="' + Y + '" width="' + W + '" height="' + H + '" rx="11"/></clipPath></defs>';
    s += '<rect class="fg-bar-track" x="' + X0 + '" y="' + Y + '" width="' + W + '" height="' + H + '" rx="11"/>';
    s += '<g clip-path="url(#' + id + ')">';
    if (o.cut) s += '<rect class="fg-bar-cut" x="' + (X0 + W * (1 - o.cut / 100)) + '" y="' + Y + '" width="' + (W * o.cut / 100) + '" height="' + H + '"/>';
    s += '<rect class="fg-bar-fill' + (anim ? ' anim-bar' : '') + '" x="' + X0 + '" y="' + Y + '" width="' + W + '" height="' + H + '" style="' +
      (anim ? '--from:' + f + ';--to:' + t : 'transform:scaleX(' + t + ')') + '"/></g>';
    var full = t >= 1;
    s += '<text class="fg-bar-num" x="' + X0 + '" y="30">0</text>';
    s += '<text class="fg-bar-num' + (full ? ' fg-bar-hl' : '') + '" x="' + (X0 + W) + '" y="30">' + o.total + '</text>';
    s += '<text class="fg-bar-pct" x="' + X0 + '" y="80">0%</text>';
    s += '<text class="fg-bar-pct' + (full ? ' fg-bar-hl' : '') + '" x="' + (X0 + W) + '" y="80">100%</text>';
    var late = function (delay) { return anim ? ' anim-fade" style="animation-delay:' + delay + 's' : ''; };
    if (o.cut) {
      s += '<text class="fg-bar-in' + late(1.4) + '" x="' + (X0 + W * (1 - o.cut / 200)) + '" y="' + (Y + 16) + '">−' + o.cut + '%</text>';
      s += '<text class="fg-bar-in' + late(1.7) + '" x="' + (X0 + W * t / 2) + '" y="' + (Y + 16) + '">sobrou ' + (100 - o.cut) + '%</text>';
    }
    if (o.value != null && !full) {
      var vw = String(o.value).length * 10 + 14;
      s += '<line class="fg-bar-mark' + late(1.5) + '" x1="' + xm + '" y1="32" x2="' + xm + '" y2="70"/>';
      s += '<g' + (anim ? ' class="anim-fade" style="animation-delay:1.6s"' : '') + '><rect class="fg-new-bg" x="' + (xm - vw / 2) + '" y="3" width="' + vw + '" height="23" rx="7"/>' +
        '<text class="fg-bar-val" x="' + xm + '" y="20">' + o.value + '</text>' +
        '<text class="fg-bar-valpct" x="' + xm + '" y="98">' + (o.pctLabel || o.p + '%') + '</text></g>';
    }
    return '<svg class="fig fig-bar" viewBox="0 0 320 104" role="img" aria-label="Barra: 100% é ' + o.total + '; ' + (o.pctLabel || o.p + '%') + (o.value != null ? ' é ' + o.value : '') + '">' + s + '</svg>';
  };

  // Vírgula pulando de casa em casa. digits sem vírgula; from/to = quantos algarismos ficam antes da vírgula.
  // showLate: algarismos que aparecem no fim (zeros que completam); hideLate: somem no fim (zero da frente).
  FIG.comma = function (o) {
    var d = o.delay || 0, n = o.digits.length, SL = 24, L = 14, s = '';
    var X = function (i) { return L + i * SL + SL / 2; };
    var CX = function (pos) { return L + pos * SL + 1; };
    var st = function (delay) { return ' style="animation-delay:' + (d + delay) + 's"'; };
    o.digits.split('').forEach(function (ch, i) {
      var late = (o.showLate || []).indexOf(i) >= 0, gone = (o.hideLate || []).indexOf(i) >= 0;
      s += '<text class="fg-cm-dig' + (late ? ' anim-fade' : gone ? ' anim-fadeout' : '') + '" x="' + X(i) + '" y="42"' + (late || gone ? st(1.7) : '') + '>' + ch + '</text>';
    });
    var pctX = L + n * SL + 6;
    if (o.pctStart) s += '<text class="fg-cm-pct anim-fadeout" x="' + pctX + '" y="42"' + st(0.2) + '>%</text>';
    var comma = '<text class="fg-cm-comma comma-hop" x="' + CX(o.from) + '" y="42" style="--dx:' + ((o.to - o.from) * SL) + 'px;animation-delay:' + (d + 0.6) + 's">,</text>';
    if (o.from === n) comma = '<g class="anim-fade"' + st(0.3) + '>' + comma + '</g>';
    if (o.to === n) comma = '<g class="anim-fadeout"' + st(1.7) + '>' + comma + '</g>';
    s += comma;
    if (o.pctEnd) s += '<text class="fg-cm-pct anim-fade" x="' + pctX + '" y="42"' + st(1.9) + '>%</text>';
    var W = pctX + 30;
    if (o.result) { s += '<text class="fg-cm-res anim-fade" x="' + (pctX + 30) + '" y="42"' + st(2.1) + '>' + o.result + '</text>'; W += o.result.length * 14 + 6; }
    return '<svg class="fig fig-comma" viewBox="0 0 ' + W + ' 56" role="img" aria-label="' + (o.aria || '') + '">' + s + '</svg>';
  };
  // 30% → 0,3: a vírgula sai do fim do número e anda duas casas para a esquerda.
  FIG.pctToDec = function (p, delay) {
    var digits = String(p), late = [];
    while (digits.length < 3) { digits = '0' + digits; late = late.map(function (i) { return i + 1; }); late.unshift(0); }
    var n = digits.length;
    return FIG.comma({ digits: digits, from: n, to: n - 2, showLate: late, pctStart: true, result: '= ' + window.GM_LOGIC.brNum(p / 100), delay: delay, aria: p + '% vira ' + window.GM_LOGIC.brNum(p / 100) });
  };
  // 0,625 → 62,5%: o caminho de volta, a vírgula anda duas casas para a direita.
  FIG.decToPct = function (decStr, delay) {
    var from = decStr.indexOf(','), digits = decStr.replace(',', ''), late = [];
    while (digits.length < from + 2) { late.push(digits.length); digits += '0'; }
    // zeros à esquerda da parte inteira nova somem (0,625 → 062,5 → 62,5)
    var hide = [];
    for (var i = 0; i < from + 1 && digits[i] === '0'; i++) hide.push(i);
    return FIG.comma({ digits: digits, from: from, to: from + 2, showLate: late, hideLate: hide, pctEnd: true, delay: delay, aria: decStr + ' vira porcentagem' });
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

  // P2 Q9 na resolução: os 3 quadrados se separam, cada um ganha sua área e no fim se juntam de novo.
  // stage: 'split' (separando) · 1, 2, 3 (área de cada quadrado) · 'join' (juntando, com o total)
  FIG.squaresStage = function (sides, stage) {
    var G = 22, sc = Math.min(250 / (sides[0] + sides[1] + sides[2]), 150 / sides[0]);
    var base = 44 + sides[0] * sc, split = stage === 'split', join = stage === 'join';
    var done = join ? 3 : typeof stage === 'number' ? stage : 0;
    var xs = [40, 40 + sides[0] * sc, 40 + (sides[0] + sides[1]) * sc], out = '';
    var f = function (v) { return v.toFixed(1); };
    for (var i = 0; i < 3; i++) {
      var x = xs[i], s = sides[i] * sc, y = base - s, cx = x + s / 2, dx = i * G, hl = stage === i + 1;
      var move = i === 0 ? '' : split ? ' class="sq-split" style="--dx:' + dx + 'px"' : join ? ' class="sq-join" style="--dx:' + dx + 'px"' : ' transform="translate(' + dx + ' 0)"';
      var g = '<rect class="fg-sq' + (i + 1) + (hl ? ' fg-sq-hl' : '') + '" x="' + f(x) + '" y="' + f(y) + '" width="' + f(s) + '" height="' + f(s) + '"/>';
      // marquinhas nos 4 lados: lados iguais
      g += '<path class="fg-tick" d="M' + f(cx) + ' ' + f(y - 4) + ' v8 M' + f(cx) + ' ' + f(base - 4) + ' v8 M' + f(x - 4) + ' ' + f(y + s / 2) + ' h8 M' + f(x + s - 4) + ' ' + f(y + s / 2) + ' h8"/>';
      if (s >= 30) g += '<circle class="fg-sq-badge" cx="' + f(x + 10) + '" cy="' + f(y + 10) + '" r="7"/><text class="fg-sq-badge-t" x="' + f(x + 10) + '" y="' + f(y + 13.5) + '">' + (i + 1) + '</text>';
      if (!join) g += '<text class="fg-dim fg-lbl" x="' + f(cx) + '" y="' + f(base + 16) + '">' + sides[i] + ' cm</text>';
      if (i < done) {
        var ar = sides[i] * sides[i], fade = hl ? ' anim-fade" style="animation-delay:.3s' : '';
        if (join) g += '<text class="fg-area-d" x="' + f(cx) + '" y="' + f(y + s / 2 + 4) + '">' + ar + '</text>';
        else if (s >= 60) g += '<text class="fg-area-d fg-in' + fade + '" x="' + f(cx) + '" y="' + f(y + s / 2 - 2) + '">' + sides[i] + ' × ' + sides[i] + '</text><text class="fg-area-d fg-in' + fade + '" x="' + f(cx) + '" y="' + f(y + s / 2 + 13) + '">= ' + ar + ' cm²</text>';
        else g += '<text class="fg-area-d' + fade + '" x="' + f(cx) + '" y="' + f(y - 20) + '">' + sides[i] + ' × ' + sides[i] + '</text><text class="fg-area-d' + fade + '" x="' + f(cx) + '" y="' + f(y - 8) + '">= ' + ar + ' cm²</text>';
      }
      out += '<g' + move + '><g class="sq-i' + (hl ? ' is-hl' : '') + '">' + g + '</g></g>';
    }
    if (join) {
      var tot = sides[0] * sides[0] + sides[1] * sides[1] + sides[2] * sides[2];
      out += '<text class="fg-total anim-fade" style="animation-delay:1.5s" x="' + f(xs[1] + (sides[1] + sides[2]) * sc / 2 + 8) + '" y="' + f(base - sides[1] * sc - 16) + '">Total: ' + tot + ' cm²</text>';
    }
    var W = Math.ceil(40 + (sides[0] + sides[1] + sides[2]) * sc + 2 * G + 36);
    return '<svg class="fig fig-sq-steps" viewBox="0 0 ' + W + ' ' + Math.ceil(base + 24) + '" role="img" aria-label="Os três quadrados ' + (join ? 'juntos de novo' : 'separados') + '">' + out + '</svg>';
  };

  // P2 Q10 na resolução: o retângulo em etapas. o = { L, W, t (cm), stage, lblL, lblW, prevL, prevW, center }
  // stage: 'draw' (desenha o retângulo) · 'relabel' (troca o rótulo pela medida em cm) · 'tiles' (lajotas
  // aparecendo uma a uma) · 'area' (retângulo pintado com a área) · 'count' (lajotas + quantidade)
  FIG.tilesStage = function (o) {
    var L = o.L, Wd = o.W, t = o.t, k = Math.min(250 / L, 150 / Wd), ox = 46, oy = 34, s = '';
    var w = L * k, h = Wd * k, f = function (v) { return v.toFixed(1); };
    var cols = Math.ceil(L / t - 1e-9), rows = Math.ceil(Wd / t - 1e-9);
    if (o.stage === 'area') s += '<rect class="fg-area-fill" x="' + ox + '" y="' + oy + '" width="' + f(w) + '" height="' + f(h) + '"/>';
    if (o.stage === 'tiles' || o.stage === 'count') {
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var tw = Math.min(t, L - c * t), th = Math.min(t, Wd - r * t), halfTile = tw < t - 1e-9 || th < t - 1e-9;
          var anim = o.stage === 'tiles' ? ' anim-fade" style="animation-delay:' + (0.3 + (r * cols + c) * 0.035).toFixed(2) + 's' : '';
          s += '<rect class="' + (halfTile ? 'fg-tile-half' : 'fg-tile') + anim + '" x="' + f(ox + c * t * k) + '" y="' + f(oy + r * t * k) + '" width="' + f(tw * k) + '" height="' + f(th * k) + '"/>';
        }
      }
    }
    if (o.stage === 'draw') {
      s += '<rect class="fg-area-fill anim-fade" style="animation-delay:.9s" x="' + ox + '" y="' + oy + '" width="' + f(w) + '" height="' + f(h) + '"/>';
      s += '<path class="fg-rect-draw anim-draw" pathLength="1" d="M' + ox + ' ' + oy + ' h' + f(w) + ' v' + f(h) + ' h' + f(-w) + ' Z"/>';
    } else s += '<rect class="fg-outline-rect" x="' + ox + '" y="' + oy + '" width="' + f(w) + '" height="' + f(h) + '"/>';
    // rótulos: comprimento em cima, largura na esquerda (em pé)
    var lx = ox + w / 2, ly = oy - 12, wx = ox - 14, wy = oy + h / 2;
    var late = function (cls, delay) { return ' class="' + cls + ' anim-fade" style="animation-delay:' + delay + 's"'; };
    var top = function (txt, attrs) { return '<text' + attrs + ' x="' + f(lx) + '" y="' + ly + '">' + txt + '</text>'; };
    var left = function (txt, attrs) { return '<text' + attrs + ' transform="translate(' + wx + ' ' + f(wy) + ') rotate(-90)" x="0" y="0">' + txt + '</text>'; };
    var d0 = o.stage === 'draw' ? 1.0 : 0;
    if (o.prevL) s += top(o.prevL, ' class="fg-lbl fg-dim anim-fadeout" style="animation-delay:.4s"') + top(o.lblL, late('fg-lbl fg-dim fg-new-txt', 0.8));
    else s += top(o.lblL, d0 ? late('fg-lbl fg-dim', d0) : ' class="fg-lbl fg-dim"');
    if (o.prevW) s += left(o.prevW, ' class="fg-lbl fg-dim anim-fadeout" style="animation-delay:.4s"') + left(o.lblW, late('fg-lbl fg-dim fg-new-txt', 0.8));
    else s += left(o.lblW, d0 ? late('fg-lbl fg-dim', d0) : ' class="fg-lbl fg-dim"');
    if (o.center) {
      var cw = o.center.length * 8.5 + 18, delay = o.stage === 'tiles' ? 2.4 : 0.3;
      s += '<g class="anim-fade" style="animation-delay:' + delay + 's"><rect class="fg-new-bg" x="' + f(lx - cw / 2) + '" y="' + f(wy - 13) + '" width="' + f(cw) + '" height="24" rx="8"/>' +
        '<text class="fg-center-lbl" x="' + f(lx) + '" y="' + f(wy + 4) + '">' + o.center + '</text></g>';
    }
    return '<svg class="fig fig-tiles" viewBox="0 0 ' + Math.ceil(ox + w + 16) + ' ' + Math.ceil(oy + h + 12) + '" role="img" aria-label="Região retangular: ' + o.lblL + ' por ' + o.lblW + '">' + s + '</svg>';
  };
  // Zoom numa lajota: o retângulo pequeno com uma lajota destacada e ela ampliada ao lado.
  FIG.tileZoom = function (L, Wd, t) {
    var km = Math.min(120 / L, 76 / Wd), ox = 16, oy = 40, s = '', f = function (v) { return v.toFixed(1); };
    var cols = Math.ceil(L / t - 1e-9), rows = Math.ceil(Wd / t - 1e-9);
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var tw = Math.min(t, L - c * t), th = Math.min(t, Wd - r * t);
      s += '<rect class="' + (r === 0 && c === 0 ? 'fg-tile-zoom' : 'fg-tile fg-tile-faint') + '" x="' + f(ox + c * t * km) + '" y="' + f(oy + r * t * km) + '" width="' + f(tw * km) + '" height="' + f(th * km) + '"/>';
    }
    s += '<rect class="fg-outline-rect" x="' + ox + '" y="' + oy + '" width="' + f(L * km) + '" height="' + f(Wd * km) + '"/>';
    var bx = 190, by = 22, B = 110, tk = t * km;
    s += '<path class="fg-dash" d="M' + f(ox + tk) + ' ' + oy + ' L' + bx + ' ' + by + ' M' + f(ox + tk) + ' ' + f(oy + tk) + ' L' + bx + ' ' + (by + B) + '"/>';
    s += '<rect class="fg-tile-zoom fg-tile-big anim-pop" x="' + bx + '" y="' + by + '" width="' + B + '" height="' + B + '"/>';
    s += '<text class="fg-lbl fg-dim" x="' + (bx + B / 2) + '" y="' + (by - 6) + '">' + t + ' cm</text>';
    s += '<text class="fg-lbl fg-dim" transform="translate(' + (bx + B + 14) + ' ' + (by + B / 2) + ') rotate(90)" x="0" y="0">' + t + ' cm</text>';
    s += '<text class="fg-center-lbl anim-fade" style="animation-delay:.9s" x="' + (bx + B / 2) + '" y="' + (by + B / 2 - 4) + '">' + t + ' × ' + t + '</text>';
    s += '<text class="fg-center-lbl anim-fade" style="animation-delay:1.2s" x="' + (bx + B / 2) + '" y="' + (by + B / 2 + 16) + '">= ' + t * t + ' cm²</text>';
    return '<svg class="fig fig-tilezoom" viewBox="0 0 330 150" role="img" aria-label="Uma lajota ampliada: ' + t + ' cm por ' + t + ' cm">' + s + '</svg>';
  };

  // Paralelepípedo em 3D (P1 Q5). Vai sendo "construído" na resolução: cada etapa mostra o que já se sabe.
  // o = { h, w, c: textos das medidas; v: texto do volume (opcional); hl: medidas novas nesta etapa }
  FIG.box3d = function (o) {
    var hl = o.hl || [], s = '';
    // frente 70..250 × 78..125; fundo deslocado (+60, −38)
    s += '<polygon class="fg-box-top" points="70,78 250,78 310,40 130,40"/>';
    s += '<polygon class="fg-box-side" points="250,125 250,78 310,40 310,87"/>';
    s += '<rect class="fg-box-front' + (o.v ? ' fg-box-full' : '') + '" x="70" y="78" width="180" height="47"/>';
    s += '<path class="fg-dimline" d="M54 78 h8 M58 78 V125 M54 125 h8"/>';
    s += '<path class="fg-dimline" d="M70 133 v8 M70 137 H250 M250 133 v8"/>';
    s += '<path class="fg-dimline" d="M256 132 l6 -4 M259 130 L319 92 M316 94 l6 -4"/>';
    var tag = function (x, y, anchor, title, value, key) {
      var on = hl.indexOf(key) >= 0, out = '';
      if (on) {
        var w = value.length * 10 + 12, rx = anchor === 'end' ? x - w + 6 : anchor === 'middle' ? x - w / 2 : x - 6;
        out += '<rect class="fg-new-bg" x="' + rx + '" y="' + (y + 3) + '" width="' + w + '" height="22" rx="7"/>';
      }
      out += '<text class="fg-dim3-t" x="' + x + '" y="' + y + '" text-anchor="' + anchor + '">' + title + '</text>';
      out += '<text class="fg-dim3-v' + (on ? ' fg-new' : '') + '" x="' + x + '" y="' + (y + 19) + '" text-anchor="' + anchor + '">' + value + '</text>';
      return out;
    };
    s += tag(50, 92, 'end', 'altura', o.h, 'h');
    s += tag(160, 154, 'middle', 'comprimento', o.c, 'c');
    s += tag(294, 126, 'start', 'largura', o.w, 'w');
    if (o.v) {
      var vOn = hl.indexOf('v') >= 0, vw = o.v.length * 9 + 14;
      if (vOn) s += '<rect class="fg-new-bg" x="' + (160 - vw / 2) + '" y="90" width="' + vw + '" height="24" rx="7"/>';
      s += '<text class="fg-vol' + (vOn ? ' fg-new' : '') + '" x="160" y="108" text-anchor="middle">' + o.v + '</text>';
    }
    return '<svg class="fig fig-box3d" viewBox="0 0 360 182" role="img" aria-label="Paralelepípedo: altura ' + o.h + ', largura ' + o.w + ', comprimento ' + o.c + (o.v ? ', ' + o.v : '') + '">' + s + '</svg>';
  };

  // Reta numérica: −3 e 3 estão, os dois, a 3 passos do zero (o que é módulo, P2-1).
  FIG.absLine = function () {
    var U = 26, ox = 160, y = 62, s = '';
    s += '<line class="fg-axis" x1="' + (ox - 5.6 * U) + '" y1="' + y + '" x2="' + (ox + 5.6 * U) + '" y2="' + y + '"/>';
    for (var k = -5; k <= 5; k++) {
      var x = ox + k * U;
      s += '<line class="fg-tick" x1="' + x + '" y1="' + (y - 5) + '" x2="' + x + '" y2="' + (y + 5) + '"/>' +
        '<text class="fg-nl-n' + (k === 0 ? ' fg-nl-0' : '') + '" x="' + x + '" y="' + (y + 21) + '">' + (k < 0 ? '−' + (-k) : k) + '</text>';
    }
    var arc = function (x1, x2, cls, delay) {
      var mid = (x1 + x2) / 2;
      return '<path class="fg-arc ' + cls + ' anim-draw" pathLength="1" style="animation-delay:' + delay + 's" d="M' + x1 + ' ' + (y - 8) + ' Q' + mid + ' ' + (y - 50) + ' ' + x2 + ' ' + (y - 8) + '"/>' +
        '<text class="fg-arc-t ' + cls + ' anim-fade" style="animation-delay:' + (delay + 0.6) + 's" x="' + mid + '" y="' + (y - 34) + '">3 passos</text>';
    };
    s += arc(ox - 3 * U, ox, 'fg-arc-neg', 0.3) + arc(ox, ox + 3 * U, 'fg-arc-pos', 1.3);
    s += '<circle class="fg-nl-pt fg-arc-neg" cx="' + (ox - 3 * U) + '" cy="' + y + '" r="5"/><circle class="fg-nl-pt fg-arc-pos" cx="' + (ox + 3 * U) + '" cy="' + y + '" r="5"/>';
    return '<svg class="fig fig-nl" viewBox="0 0 320 92" role="img" aria-label="Reta numérica: o −3 e o 3 estão, os dois, a 3 passos do zero">' + s + '</svg>';
  };

  // Soma e produto (P2-8). Números com o sinal de menos tipográfico.
  var spNum = function (n) { return n < 0 ? '−' + (-n) : String(n); };
  var SP_ROW = { a: 0, b: 1, c: 2 }, SP_VX = 84;
  // Equação em "fichas" coloridas; os valores de a, b e c saem de cada ficha e voam para o quadro da esquerda.
  FIG.abcPull = function (a, b, c) {
    var terms = [
      { k: 'a', txt: (a === 1 ? '' : a === -1 ? '−' : spNum(a)) + 'x²', v: a },
      { k: 'b', txt: (b < 0 ? '− ' : '+ ') + (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'x', v: b },
      { k: 'c', txt: (c < 0 ? '− ' : '+ ') + Math.abs(c), v: c },
      { k: 'z', txt: '= 0' }
    ];
    var W = 300, gap = 6, cw = function (t) { return Math.max(46, t.length * 12 + 16); };
    var x = (W - terms.reduce(function (s, t) { return s + cw(t.txt); }, 0) - gap * 3) / 2, s = '';
    var D = { a: 0.4, b: 1.6, c: 2.8 }, what = { a: 'acompanha o x²', b: 'acompanha o x', c: 'número sozinho' };
    s += '<rect class="sp-box" x="8" y="66" width="104" height="102" rx="12"/>';
    terms.forEach(function (t) {
      var w = cw(t.txt), cx = x + w / 2;
      s += '<g class="sp-chip sp-' + t.k + '"><rect x="' + x + '" y="8" width="' + w + '" height="42" rx="10"/><text x="' + cx + '" y="36">' + t.txt + '</text></g>';
      if (t.k !== 'z') {
        var ry = 94 + SP_ROW[t.k] * 30;
        s += '<text class="sp-lbl" x="20" y="' + ry + '">' + t.k + ' =</text>' +
          '<text class="sp-val sp-' + t.k + ' sp-fly" x="' + SP_VX + '" y="' + ry + '" style="--dx:' + (cx - SP_VX) + 'px;--dy:' + (36 - ry) + 'px;animation-delay:' + D[t.k] + 's">' + spNum(t.v) + '</text>' +
          '<text class="sp-why anim-fade" x="120" y="' + (ry - 2) + '" style="animation-delay:' + (D[t.k] + 1) + 's">← ' + what[t.k] + '</text>';
      }
      x += w + gap;
    });
    return '<svg class="fig fig-sp" viewBox="0 0 ' + W + ' 176" role="img" aria-label="Da equação saem a = ' + spNum(a) + ', b = ' + spNum(b) + ' e c = ' + spNum(c) + '">' + s + '</svg>';
  };
  // Fórmula da soma (−b/a) ou do produto (c/a): os valores saem do quadro e entram no lugar das letras.
  FIG.spFormula = function (kind, a, b, c) {
    var soma = kind === 'soma', topK = soma ? 'b' : 'c', val = { a: a, b: b, c: c }, s = '';
    var res = soma ? -b / a : c / a;
    var topTxt = soma && b < 0 ? '(' + spNum(b) + ')' : spNum(val[topK]), den = spNum(a);
    s += '<rect class="sp-box" x="8" y="8" width="104" height="104" rx="12"/>';
    ['a', 'b', 'c'].forEach(function (k) {
      var ry = 36 + SP_ROW[k] * 30;
      if (k === 'a' || k === topK) s += '<rect class="sp-hl-' + k + ' anim-fade" x="13" y="' + (ry - 20) + '" width="94" height="28" rx="8" style="animation-delay:.2s"/>';
      s += '<text class="sp-lbl" x="20" y="' + ry + '">' + k + ' =</text><text class="sp-val sp-' + k + '" x="' + SP_VX + '" y="' + ry + '">' + spNum(val[k]) + '</text>';
    });
    var chw = 12, lw = soma ? 60 : 84, numY = 56, denY = 92, barY = 66;
    var topW = topTxt.length * chw, numW = (soma ? chw : 0) + topW;
    var half = Math.max(numW, den.length * chw, 24) / 2 + 8, fc = 122 + lw + 8 + half;
    var nx = fc - numW / 2, slotX = nx + (soma ? chw : 0) + topW / 2;
    var fly = function (k, x, y, txt, delay) {
      return '<text class="sp-f-t sp-' + k + ' sp-fly" x="' + x + '" y="' + y + '" style="--dx:' + (SP_VX - x) + 'px;--dy:' + (36 + SP_ROW[k] * 30 - y) + 'px;animation-delay:' + delay + 's">' + txt + '</text>';
    };
    s += '<text class="sp-f-lbl" x="122" y="' + (barY + 7) + '">' + (soma ? 'Soma =' : 'Produto =') + '</text>';
    s += '<line class="sp-f-bar" x1="' + (fc - half) + '" y1="' + barY + '" x2="' + (fc + half) + '" y2="' + barY + '"/>';
    if (soma) s += '<text class="sp-f-t" x="' + (nx + chw / 2) + '" y="' + numY + '">−</text>';
    s += '<text class="sp-f-t sp-' + topK + ' anim-fadeout" x="' + slotX + '" y="' + numY + '" style="animation-delay:1.3s">' + topK + '</text>';
    s += '<text class="sp-f-t sp-a anim-fadeout" x="' + fc + '" y="' + denY + '" style="animation-delay:2.5s">a</text>';
    s += fly(topK, slotX, numY, topTxt, 0.6) + fly('a', fc, denY, den, 1.8);
    s += '<text class="sp-f-res anim-pop" x="' + (fc + half + 8) + '" y="' + (barY + 8) + '" style="animation-delay:3s">= ' + spNum(res) + '</text>';
    return '<svg class="fig fig-sp" viewBox="0 0 340 120" role="img" aria-label="' + (soma ? 'Soma = −b sobre a' : 'Produto = c sobre a') + ', com os valores do quadro: resultado ' + spNum(res) + '">' + s + '</svg>';
  };

  /* ---------- Resoluções montadas por função (usadas pela original e pelas variações) ---------- */
  var STEPS = {};
  // Volume do paralelepípedo: altura h, comprimento = k × largura, volume V. Resolução em etapas pequenas,
  // com a caixa em 3D sendo preenchida a cada passo.
  STEPS.volume = function (h, k, V) {
    var kh = k * h, L2 = V / kh, Lw = Math.sqrt(L2), C = k * Lw;
    var box = function (o) {
      return FIG.box3d({ h: o.h || h + ' cm', w: o.w || 'L', c: o.c || 'C', v: o.v, hl: o.hl });
    };
    var vol = 'V = ' + V + ' cm³';
    return {
      list: [
        { t: 'O paralelepípedo', b: 'Paralelepípedo tem formato de <b>caixa</b>. Esse tem <b>' + h + ' cm de altura</b>. A largura a gente ainda não sabe: vamos chamar de <b>L</b>. O comprimento também não: vamos chamar de <b>C</b>.', fig: box({ hl: ['h', 'w', 'c'] }) },
        { t: 'O volume', b: 'A questão diz que o volume é ' + V + ' cm³:<div class="calc">[[V = ' + V + ']]</div>', fig: box({ v: vol, hl: ['v'] }) },
        { t: 'A conta do volume', b: 'O volume é a altura vezes a largura vezes o comprimento:<div class="calc">[[V]] = altura · largura · comprimento</div>Como [[V = ' + V + ']], a largura é [[L]] e o comprimento é [[C]]:<div class="calc">[[' + V + ']] = altura · [[L]] · [[C]]</div>', fig: box({ v: vol, hl: ['h', 'w', 'c'] }) },
        { t: 'Trocando a altura por ' + h, b: 'A altura é ' + h + ' cm. No lugar de "altura", colocamos ' + h + ':<div class="calc">[[' + V + ' = ' + h + ' * L * C]]</div>', fig: box({ v: vol, hl: ['h'] }) },
        { t: 'O comprimento é ' + k + ' vezes a largura', b: 'A questão diz que o comprimento é ' + k + ' vezes a largura. Então:<div class="calc">[[C = ' + k + 'L]]</div>', fig: box({ v: vol, c: k + 'L', hl: ['c'] }) },
        { t: 'Trocando C por ' + k + 'L', b: 'No lugar do [[C]] colocamos [[' + k + 'L]], e o [[L]] fica como está:<div class="calc">[[' + V + ' = ' + h + ' * L * ' + k + 'L]]</div>Na multiplicação a ordem não muda o resultado, então dá para escrever assim:<div class="calc">[[' + h + ' * ' + k + 'L * L = ' + V + ']]</div>' },
        { t: 'Descobrindo a largura L', b: 'Agora é só resolver, uma conta de cada vez:<div class="calc calc-lines">' +
            '<span>[[' + h + ' * ' + k + 'L * L = ' + V + ']]</span>' +
            '<span>[[' + kh + ' * L * L = ' + V + ']] <small>← ' + h + ' vezes ' + k + ' dá ' + kh + '</small></span>' +
            '<span>[[L * L = ' + V + ' ÷ ' + kh + ']] <small>← o ' + kh + ' que multiplica muda de lado e divide</small></span>' +
            '<span>[[L * L = ' + L2 + ']]</span>' +
            '<span>[[L = ' + Lw + ']] <small>← qual número vezes ele mesmo dá ' + L2 + '? [[' + Lw + ' * ' + Lw + ' = ' + L2 + ']]</small></span>' +
            '</div>A largura é <b>' + Lw + ' cm</b>.', fig: box({ v: vol, c: k + 'L', w: Lw + ' cm', hl: ['w'] }) },
        { t: 'Atenção: ele pediu o comprimento!', cls: 'concept', b: 'Perceba que a questão pediu o <b>comprimento</b>, e não a largura. A gente sabe que o comprimento é ' + k + ' vezes a largura. Então é só fazer ' + k + ' vezes o [[L]]:<div class="calc calc-lines"><span>[[C = ' + k + 'L]]</span><span>[[C = ' + k + ' * ' + Lw + ']]</span><span>[[C = ' + C + ']]</span></div>', fig: box({ v: vol, w: Lw + ' cm', c: C + ' cm', hl: ['c'] }) },
        { t: 'Resposta final', cls: 'final', b: 'Pronto! O comprimento mede <b>' + C + ' cm</b>.', fig: box({ v: vol, w: Lw + ' cm', c: C + ' cm' }) },
        { t: 'Conferindo se faz sentido', cls: 'check', b: 'Volume = altura · largura · comprimento:<div class="calc">[[' + h + ' * ' + Lw + ' * ' + C + ' = ' + V + ']] cm³ ✓</div>E ' + C + ' é mesmo ' + k + ' vezes ' + Lw + ' ✓.' }
      ]
    };
  };

  // Consecutivos, ímpares ou pares consecutivos (P1 Q1 e Q4): explica a forma x, x + 1, x + 2
  // (ou x, x + 2, x + 4) em caixinhas e resolve a equação linha por linha.
  // o = { S: soma, step: 1 ou 2, first: menor número, kind: 'consecutivos' | 'ímpares' | 'pares' }
  STEPS.consec = function (o) {
    var bx = window.GM_LOGIC.boxes, d = o.step, S = o.S, a = o.first, k = 3 * d;   // números sem o x: 0 + d + 2d
    var answer = [a, a + d, a + 2 * d];
    var base = { consecutivos: [[1, 2, 3], [2, 3, 4], [10, 11, 12]], 'ímpares': [[1, 3, 5], [7, 9, 11], [13, 15, 17]], pares: [[2, 4, 6], [8, 10, 12], [14, 16, 18]] }[o.kind];
    var spare = { consecutivos: [20, 21, 22], 'ímpares': [41, 43, 45], pares: [40, 42, 44] }[o.kind];
    var examples = base.map(function (t) { return t.join() === answer.join() ? spare : t; });
    var names = d === 1 ? ['x', 'x + 1', 'x + 2'] : ['x', 'x + 2', 'x + 4'];
    var forms = bx(names.map(function (n) { return '[[' + n + ']]'; }));
    var cons = o.kind === 'consecutivos';
    var intro = cons
      ? 'Três números <b>consecutivos</b> são números que vêm um atrás do outro. Por exemplo:'
      : 'Três números <b>' + o.kind + ' consecutivos</b> são ' + o.kind + ' que vêm um atrás do outro, pulando de <b>2 em 2</b> (no meio sempre fica um número ' + (o.kind === 'ímpares' ? 'par' : 'ímpar') + '). Por exemplo:';
    var who = cons ? 'dos três números consecutivos' : 'de três números inteiros consecutivos ' + o.kind;
    return {
      intro: {
        t: cons ? 'Números consecutivos' : 'Números ' + o.kind + ' consecutivos',
        b: intro + '<div class="nbox-groups">' + examples.map(function (t) { return bx(t); }).join('') + '</div>E assim vai. Então eles podem ser escritos assim:' + forms +
          (cons ? '' : '<small class="nbox-note">(com [[x]] ' + (o.kind === 'ímpares' ? 'ímpar' : 'par') + ')</small>') + '<br>Todos os ' + (cons ? 'números consecutivos' : o.kind + ' consecutivos') + ' podem ser escritos dessa forma.'
      },
      ask: 'A questão nos fala que a <b>soma</b> ' + who + ' é igual a <b>' + S + '</b>. Quais são esses números?',
      data: 'Os números são:' + forms + '<br>Somados, eles dão <b>' + S + '</b>.',
      s1: 'Montamos a conta da soma:<div class="calc">[[x + x + ' + d + ' + x + ' + 2 * d + ' = ' + S + ']]</div>Juntamos os [[x]] ([[x + x + x = 3x]]) e juntamos os números ([[' + d + ' + ' + 2 * d + ' = ' + k + ']]):<div class="calc">[[3x + ' + k + ' = ' + S + ']]</div>',
      s2: 'Agora deixamos o [[x]] sozinho, uma conta de cada vez:<div class="calc calc-lines">' +
        '<span>[[3x = ' + S + ' - ' + k + ']] <small>← o +' + k + ' muda de lado e vira −' + k + '</small></span>' +
        '<span>[[3x = ' + (S - k) + ']]</span>' +
        '<span>[[x = ' + (S - k) + ' ÷ 3]] <small>← o 3 que multiplica muda de lado e divide</small></span>' +
        '<span>[[x = ' + a + ']]</span></div>',
      final: 'Os três números eram:' + forms + '<br>Trocando o [[x]] por ' + a + ':' + bx(['[[' + a + ']]', '[[' + a + ' + ' + d + ']]', '[[' + a + ' + ' + 2 * d + ']]']) + '<br>Ou seja:' + bx(answer, 'nbox-answer'),
      check: '[[' + answer.join(' + ') + ' = ' + S + ']] ✓' + (cons ? ' — e eles vêm um atrás do outro ✓.' : ', todos são ' + o.kind + ' ✓ e vão de 2 em 2 ✓.')
    };
  };

  // Média simples (P1 Q8): o que é média → valores = notas → quantidade = alunos → conta passo a passo.
  STEPS.media = function (notas) {
    var br = window.GM_LOGIC.brNum, n = notas.length, S = 0, chain = [];
    notas.forEach(function (v, i) { if (i) chain.push('<span>[[' + S + ' + ' + v + ' = ' + (S + v) + ']]</span>'); S += v; });
    var mean = S / n, exact = Number.isInteger(mean);
    return {
      list: [
        { t: 'O que é a média?', cls: 'concept', b: 'A <b>média</b> é a <b>soma dos valores</b> dividida pela <b>quantidade de valores</b>.<br>Por exemplo, estes são <b>três</b> valores:' + window.GM_LOGIC.boxes([1, 2, 3]) + '<br>A soma deles é [[1 + 2 + 3]]. Então a média é essa soma dividida por 3, porque são três valores:<div class="calc">[[frac{1 + 2 + 3}{3} = frac{6}{3} = 2]]</div>' },
        { t: 'O que a questão quer saber?', b: 'A questão quer saber a <b>média das notas</b> dos alunos.<br>Quais são os <b>valores</b>? São as <b>notas</b>:' + window.GM_LOGIC.boxes(notas) + '<br>E qual é a <b>quantidade de valores</b>? É o <b>número de alunos</b>: ' + n + '.' },
        { t: 'Montando a conta', b: 'Então a média é a soma das notas dividida pela quantidade de alunos:<div class="calc">Média = [[frac{' + notas.join(' + ') + '}{' + n + '}]]</div>' },
        { t: 'Somando as notas', b: 'Somamos uma nota de cada vez:<div class="calc calc-lines">' + chain.join('') + '</div>A soma das notas é <b>' + S + '</b>.' },
        { t: 'Dividindo pela quantidade de alunos', b: 'Agora dividimos a soma pelos ' + n + ' alunos:<div class="calc calc-lines"><span>Média = [[frac{' + S + '}{' + n + '}]]</span><span>[[' + S + ' ÷ ' + n + ' = ' + br(mean) + ']]</span></div>' },
        { t: 'Resposta final', cls: 'final', b: 'A média das notas dos alunos é <b>' + br(mean) + '</b>.' },
        { t: 'Conferindo se faz sentido', cls: 'check', b: 'A média tem que ficar entre a menor nota (' + Math.min.apply(null, notas) + ') e a maior (' + Math.max.apply(null, notas) + '): ' + br(mean) + ' fica ✓.' + (exact ? ' E [[' + br(mean) + ' * ' + n + ' = ' + S + ']], que é a soma das notas ✓.' : '') }
      ]
    };
  };

  // Média com grupos (P1 Q9): cada idade entra na soma tantas vezes quantos alunos têm aquela idade.
  STEPS.mediaGrupos = function (groups, noun) {
    var br = window.GM_LOGIC.brNum;
    var tot = 0, S = 0;
    groups.forEach(function (g) { tot += g[0]; S += g[0] * g[1]; });
    var mean = S / tot, exact = Math.abs(Math.round(mean * 100) - mean * 100) < 1e-9;
    var meanTxt = exact ? br(mean) : br(mean, 2), approx = exact ? '=' : '≈';
    var prods = groups.map(function (g) { return g[0] + ' * ' + g[1]; }).join(' + ');
    var qtys = groups.map(function (g) { return g[0]; }).join(' + ');
    var ages = groups.map(function (g) { return g[1]; }).join(' + ');
    return {
      list: [
        { t: 'Lembrando: o que é a média?', cls: 'concept', b: 'Já vimos no exercício 8 que a <b>média</b> é a <b>soma dos valores</b> dividida pela <b>quantidade de valores</b>.' },
        { t: 'Qual é a soma dos valores?', b: 'Aqui os valores são as <b>idades</b>. ' + groups.map(function (g, i) {
            return 'Tem <b>' + g[0] + ' ' + noun + '</b> com <b>' + g[1] + ' anos</b>: ' + (i === 0 ? 'a idade de cada um entra na soma, então são' : 'são') + ' [[' + g[0] + ' * ' + g[1] + ']]';
          }).join('. ') + '.<br>Então a soma dos valores é:<div class="calc">[[' + prods + ']]</div>' +
          '<p class="aside">A gente não pode só somar [[' + ages + ']]: isso contaria só uma pessoa de cada idade, e não a idade de todo mundo. Não seria a soma dos valores.</p>' },
        { t: 'Qual é a quantidade de valores?', b: 'É a quantidade de <b>' + noun + '</b>:<div class="calc">[[' + qtys + ']]</div>' },
        { t: 'Montando a conta', b: 'A média é a soma dos valores dividida pela quantidade de valores:<div class="calc">Média = [[frac{' + prods + '}{' + qtys + '}]]</div>' },
        { t: 'Fazendo as contas, passo a passo', b: 'Primeiro, a soma das idades (em cima):<div class="calc calc-lines">' +
            groups.map(function (g) { return '<span>[[' + g[0] + ' * ' + g[1] + ' = ' + g[0] * g[1] + ']]</span>'; }).join('') +
            '<span>[[' + groups.map(function (g) { return g[0] * g[1]; }).join(' + ') + ' = ' + S + ']]</span></div>' +
            'Depois, a quantidade de ' + noun + ' (embaixo):<div class="calc">[[' + qtys + ' = ' + tot + ']]</div>' +
            'Por último, a divisão:<div class="calc calc-lines"><span>Média = [[frac{' + S + '}{' + tot + '}]]</span><span>[[' + S + ' ÷ ' + tot + ' ' + approx + ' ' + meanTxt + ']]</span></div>' },
        { t: 'Resposta final', cls: 'final', b: 'A média das idades é ' + (exact ? '<b>' + meanTxt + ' anos</b>' : '[[frac{' + S + '}{' + tot + '}]], aproximadamente <b>' + meanTxt + ' anos</b>') + '.' },
        { t: 'Conferindo se faz sentido', cls: 'check', b: 'A média ficou entre a menor idade (' + Math.min.apply(null, groups.map(function (g) { return g[1]; })) + ') e a maior (' + Math.max.apply(null, groups.map(function (g) { return g[1]; })) + ') ✓, mais perto da idade do grupo que tem mais ' + noun + ' ✓.' }
      ]
    };
  };

  // Reflexão (P1 Q10): um passo para cada ponto, com a animação da medida atravessando a reta.
  STEPS.reflection = function (cfg, img, letter, shape) {
    var V = cfg.axis === 'v', k = cfg.k, names = cfg.names || ['P', 'Q', 'R'];
    var primes = names.map(function (n) { return n + '′'; });
    var list = function (arr) { return arr.slice(0, -1).join(', ') + ' e ' + arr[arr.length - 1]; };
    var steps = [
      { t: 'O que é reflexão?', cls: 'concept', b: '<b>Reflexão</b> é a imagem no espelho. Cada ponto vai para o <b>outro lado</b> da reta, na <b>mesma distância</b>, andando em linha reta que forma 90° com a reta (perpendicular).' },
      { t: 'O espelho', b: 'A reta <i>e</i> é o nosso espelho. Ela está ' + (V ? 'em pé (vertical)' : 'deitada (horizontal)') + '. Vamos refletir <b>um ponto de cada vez</b>: ' + list(names) + '.', fig: FIG.reflectionStep(cfg, img, -1) }
    ];
    cfg.orig.forEach(function (p, i) {
      var d = Math.abs(V ? k - p[0] : k - p[1]);
      var dir = V ? (p[0] < k ? 'para a direita' : 'para a esquerda') : (p[1] > k ? 'para baixo' : 'para cima');
      steps.push({
        t: 'Refletindo o ponto ' + names[i],
        b: 'O ponto <b>' + names[i] + '</b> está a <b>' + d + ' ' + (d === 1 ? 'quadradinho' : 'quadradinhos') + '</b> da reta <i>e</i>. Andamos ' + dir + ' em linha reta: ' + d + ' até a reta, e mais <b>' + d + '</b> do outro lado. Ali fica o <b>' + primes[i] + '</b>.',
        fig: FIG.reflectionStep(cfg, img, i)
      });
    });
    steps.push({ t: 'Ligando os pontos', b: 'Com ' + list(primes) + ' prontos, é só ligar os pontos: essa é a imagem refletida. Ela ficou <b>espelhada</b>, com o mesmo tamanho e a mesma forma.', fig: FIG.reflectionStep(cfg, img, img.length, true) });
    steps.push({ t: 'Resposta final', cls: 'final', b: 'A imagem correta é a da <b>alternativa ' + letter + '</b>.' });
    steps.push({ t: 'Conferindo se faz sentido', cls: 'check', b: 'Cada ponto ficou à mesma distância da reta, do outro lado ✓. ' + (V ? 'A altura' : 'A posição para o lado') + ' de cada ponto não mudou ✓. Só arrastar (translação), girar ou virar de cabeça para baixo não é reflexão nessa reta.' });
    return { list: steps };
  };

  // Número com ponto de milhar sempre (2.400, 16.800), para as contas com dinheiro e porcentagem.
  function grp(n, dec) {
    var parts = window.GM_LOGIC.brNum(n, dec).split(',');
    parts[0] = parts[0].replace(/\./g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join(',');
  }
  // Porcentagem: "0,3 · 80" explicado (3 · 80 = 240 e depois as casas depois da vírgula).
  function pctTimes(p, T) {
    var br = grp, decStr = window.GM_LOGIC.brNum(p / 100), places = (decStr.split(',')[1] || '').length;
    var intP = Math.round(p / 100 * Math.pow(10, places)), prod = intP * T, res = p * T / 100;
    return {
      calc: '[[' + decStr + ' * ' + br(T) + ' = ' + br(res) + ']]',
      aside: places ? '<p class="aside">Como fazer: [[' + intP + ' * ' + br(T) + ' = ' + br(prod) + ']]. O ' + decStr + ' tem ' + places + (places > 1 ? ' casas' : ' casa') +
        ' depois da vírgula, então a resposta também tem: [[' + br(prod / Math.pow(10, places), places) + ' = ' + br(res) + ']].</p>' : ''
    };
  }
  var pctFig = function (svg) { return '<div class="st-fig">' + svg + '</div>'; };
  var pctRule = '<b>100%</b> é [[100 ÷ 100 = 1]]: o todo é 1 inteiro. Toda porcentagem é um número <b>dividido por 100</b>. E para dividir por 100 é só andar com a <b>vírgula duas casas para a esquerda</b>:';

  // "p% de T" (P1 Q6a): exemplos com 10 na barra → a barra da questão → vírgula → conta.
  STEPS.pctOf = function (p, T) {
    var br = window.GM_LOGIC.brNum, val = p * T / 100, m = pctTimes(p, T);
    var comp = p < 50 ? 'Já dá para ver que a resposta é <b>menos que a metade</b> de ' + br(T) + ' (que é ' + br(T / 2) + ').'
      : p > 50 ? 'Já dá para ver que a resposta é <b>mais que a metade</b> de ' + br(T) + ' (que é ' + br(T / 2) + ').' : 'É exatamente a metade.';
    return {
      list: [
        { t: '100% é o todo', cls: 'concept', b: 'Porcentagem fala de <b>partes de um todo</b>. <b>100% é o todo</b>, o completo.<br>Vamos usar uma barra: em cima ela vai do 0 até o número completo; embaixo, de 0% até 100%. Por exemplo, <b>100% de 10</b> é o 10 inteiro:', fig: FIG.pctBar({ total: '10', p: 100 }) },
        { t: '50% de 10', b: '<b>50%</b> é a <b>metade</b> do todo. A barra diminui até a metade, e o 10 continua lá em cima como o todo: <b>50% de 10 é 5</b>.', fig: FIG.pctBar({ total: '10', p: 50, from: 100, value: '5' }) },
        { t: '30% de 10', b: '<b>30%</b> é menos que a metade. A barra diminui até 30%: <b>30% de 10 é 3</b>.', fig: FIG.pctBar({ total: '10', p: 30, from: 100, value: '3' }) },
        { t: 'Agora a questão: ' + p + '% de ' + br(T), b: 'Aqui o todo (100%) é <b>' + br(T) + '</b>. A questão pede <b>' + p + '%</b>, então a barra diminui de 100% até ' + p + '%. ' + comp, fig: FIG.pctBar({ total: br(T), p: p, from: 100, value: '?' }) },
        { t: 'Porcentagem vira número', b: pctRule + pctFig(FIG.pctToDec(30, 0)) + pctFig(FIG.pctToDec(70, 2.6)) + pctFig(FIG.pctToDec(150, 5.2)) + 'E assim vai: 30% = 0,3 · 70% = 0,7 · 150% = 1,5.' },
        { t: 'Fazendo a conta', b: 'Primeiro, o ' + p + '% vira número:' + pctFig(FIG.pctToDec(p, 0)) + 'Então:<div class="calc calc-lines"><span>' + p + '% de ' + br(T) + ' = [[' + br(p / 100) + ' * ' + br(T) + ']]</span><span>' + m.calc + '</span></div>' + m.aside },
        { t: 'Resposta final', cls: 'final', b: p + '% de ' + br(T) + ' é <b>' + br(val) + '</b>.', fig: FIG.pctBar({ total: br(T), p: p, value: br(val) }) },
        { t: 'Conferindo se faz sentido', cls: 'check', b: p === 50 ? br(val) + ' é a metade de ' + br(T) + ' ✓.' : 'A barra mostrou que a resposta é ' + (p < 50 ? 'menos' : 'mais') + ' que a metade de ' + br(T) + ' (' + br(T / 2) + '), e ' + br(val) + ' é mesmo ✓.' }
      ]
    };
  };

  // "parte representa ?% do total" (P1 Q6b): onde a parte fica na barra → parte ÷ todo → vírgula para a direita.
  STEPS.pctWhich = function (part, total) {
    var br = window.GM_LOGIC.brNum, dec = part / total, pct = dec * 100;
    var g = (function gcd(a, b) { return b ? gcd(b, a % b) : a; })(part, total);
    var half = total / 2;
    var where = part > half ? 'Ele passa da metade (' + br(half) + '), então vai dar <b>mais que 50%</b>.' : part < half ? 'Ele não chega na metade (' + br(half) + '), então vai dar <b>menos que 50%</b>.' : 'Ele é exatamente a metade: 50%.';
    return {
      list: [
        { t: 'Lembrando: 100% é o todo', cls: 'concept', b: '<b>100% é o todo</b>, o completo. Aqui o todo é <b>' + total + '</b>: em cima da barra vai do 0 ao ' + total + ', embaixo de 0% a 100%.', fig: FIG.pctBar({ total: String(total), p: 100 }) },
        { t: 'Onde fica o ' + part + '?', b: 'O <b>' + part + '</b> é uma parte do ' + total + '. Na barra, ele fica aqui. ' + where, fig: FIG.pctBar({ total: String(total), p: pct, from: 100, value: String(part), pctLabel: '?%' }) },
        { t: 'Que parte do todo?', b: 'Dividimos a <b>parte</b> pelo <b>todo</b>:<div class="calc calc-lines"><span>[[frac{' + part + '}{' + total + '}' + (g > 1 ? ' = frac{' + part / g + '}{' + total / g + '}' : '') + ']]</span><span>[[' + part / g + ' ÷ ' + total / g + ' = ' + br(dec) + ']]</span></div>' },
        { t: 'Número vira porcentagem', b: 'Porcentagem é dividir por 100 (a vírgula anda duas casas para a esquerda). Agora é o <b>caminho de volta</b>: multiplicamos por 100, e a <b>vírgula anda duas casas para a direita</b>:' + pctFig(FIG.decToPct(br(dec), 0)) + '<div class="calc">[[' + br(dec) + ' * 100 = ' + br(pct) + ']]%</div>' },
        { t: 'Resposta final', cls: 'final', b: part + ' representa <b>' + br(pct) + '%</b> de ' + total + '.', fig: FIG.pctBar({ total: String(total), p: pct, value: String(part), pctLabel: br(pct) + '%' }) },
        { t: 'Conferindo se faz sentido', cls: 'check', b: br(pct) + '% de ' + total + ' = [[' + br(dec) + ' * ' + total + ' = ' + part + ']] ✓.' }
      ]
    };
  };

  // Preço depois do desconto (P1 Q7): a barra perde r% e sobra (100 − r)% → a conta é dessa sobra.
  STEPS.discount = function (P0, r) {
    // valores em reais sempre com ponto de milhar (2.400, 90.000)
    var br = function (n) { return grp(n); }, num = window.GM_LOGIC.brNum;
    var keep = 100 - r, val = P0 * keep / 100, loss = P0 * r / 100, m = pctTimes(keep, P0);
    return {
      list: [
        { t: 'O todo é o preço inicial', cls: 'concept', b: 'O preço era <b>R$ ' + br(P0) + '</b>. Então a barra completa, <b>100%</b>, é ' + br(P0) + '.', fig: FIG.pctBar({ total: br(P0), p: 100 }) },
        { t: 'Reduziu ' + r + '%', b: 'A barra completa é 100%, e o preço <b>reduziu ' + r + '%</b>. Então tiramos ' + r + '% da barra:', fig: FIG.pctBar({ total: br(P0), p: keep, from: 100, cut: r }) },
        { t: 'Quanto sobrou?', b: 'Tinha 100% e diminuiu ' + r + '%:<div class="calc">[[100% - ' + r + '% = ' + keep + '%]]</div>O preço agora é <b>' + keep + '%</b> do preço inicial. Então a conta que a gente vai fazer é <b>' + keep + '% de ' + br(P0) + '</b>, e não ' + r + '%!', fig: FIG.pctBar({ total: br(P0), p: keep, cut: r, value: '?', pctLabel: keep + '%' }) },
        { t: keep + '% vira número', b: pctRule + pctFig(FIG.pctToDec(keep, 0)) },
        { t: 'Fazendo a conta', b: '<div class="calc calc-lines"><span>' + keep + '% de ' + br(P0) + ' = [[' + num(keep / 100) + ' * ' + br(P0) + ']]</span><span>' + m.calc + '</span></div>' + m.aside },
        { t: 'Resposta final', cls: 'final', b: 'Agora custa <b>' + window.GM_LOGIC.brMoney(val) + '</b>.', fig: FIG.pctBar({ total: br(P0), p: keep, cut: r, value: br(val), pctLabel: keep + '%' }) },
        { t: 'Conferindo se faz sentido', cls: 'check', b: 'O preço caiu [[' + br(P0) + ' - ' + br(val) + ' = ' + br(loss) + ']]. E ' + r + '% de ' + br(P0) + ' é [[' + num(r / 100) + ' * ' + br(P0) + ' = ' + br(loss) + ']] ✓. O que perdeu mais o que sobrou dá o preço inicial ✓.' }
      ]
    };
  };

  // Área da figura de 3 quadrados (P2 Q9): separa → área de cada um (lado × lado) → junta e soma.
  STEPS.squaresArea = function (s) {
    var br = window.GM_LOGIC.brNum, ar = s.map(function (v) { return v * v; }), tot = ar[0] + ar[1] + ar[2];
    var names = ['ABCJ', 'DEIJ', 'FGHI'];
    var one = function (i) {
      return {
        t: 'Área do quadrado ' + (i + 1),
        b: 'O quadrado ' + (i + 1) + ' (' + names[i] + ') tem lado <b>' + s[i] + ' cm</b>. Como é um <b>quadrado</b>, os 4 lados são <b>iguais</b> (as marquinhas mostram isso). Por isso a área é lado × lado:<div class="calc">[[' + s[i] + ' * ' + s[i] + ' = ' + ar[i] + ']] cm²</div>',
        fig: FIG.squaresStage(s, i + 1)
      };
    };
    return {
      list: [
        { t: 'Separando a figura', b: 'A figura é feita de <b>3 quadrados</b> encostados. Vamos separar: o quadrado 1 (ABCJ), o 2 (DEIJ) e o 3 (FGHI).', fig: FIG.squaresStage(s, 'split') },
        { t: 'A área total', cls: 'concept', b: 'Os quadrados não ficam um em cima do outro. Então a <b>área total é a soma das 3 áreas</b>:<div class="calc">área total = área 1 + área 2 + área 3</div>' },
        one(0), one(1), one(2),
        { t: 'Juntando e somando tudo', b: 'Agora os quadrados voltam para o lugar, formando a figura de novo. A área da figura é a soma das três áreas:<div class="calc">[[' + ar.join(' + ') + ' = ' + tot + ']] cm²</div>', fig: FIG.squaresStage(s, 'join') },
        { t: 'Resposta final', cls: 'final', b: 'A área da figura é <b>' + br(tot) + ' cm²</b>.' },
        { t: 'Conferindo se faz sentido', cls: 'check', b: 'A área total é maior que a do quadrado grande (' + ar[0] + ' cm²), porque ainda tem os outros dois ✓. E menor que a de um retângulo que cobre a figura toda ([[' + (s[0] + s[1] + s[2]) + ' * ' + s[0] + ' = ' + (s[0] + s[1] + s[2]) * s[0] + ']] cm²) ✓.' }
      ]
    };
  };

  // Revestimento com lajotas (P2 Q10): desenha a região → converte para cm (o rótulo troca na figura) →
  // lajotas aparecendo → zoom numa lajota → área total ÷ área de uma → "ainda não acabou!" → preço.
  STEPS.tiles = function (Lm, Wmm, t, price) {
    var br = window.GM_LOGIC.brNum, money = window.GM_LOGIC.brMoney;
    var Lc = Math.round(Lm * 100), Wc = Wmm / 10, area = Lc * Wc, ta = t * t, n = area / ta, cost = n * price;
    var cols = Lc / t, rows = Wc / t, half = !Number.isInteger(cols);
    var noReuse = Math.ceil(cols) * Math.ceil(rows);
    var mS = br(Lm, 2) + ' m', mmS = Wmm + ' mm', LS = Lc + ' cm', WS = Wc + ' cm';
    var fig = function (o) { var b = { L: Lc, W: Wc, t: t }; for (var key in o) b[key] = o[key]; return FIG.tilesStage(b); };
    var ip = Math.floor(price), fp = Math.round((price - ip) * 100) / 100;
    var mult = '<div class="calc calc-lines"><span>[[' + n + ' * ' + br(price, 2) + ']]</span>' +
      (fp ? '<span>[[' + n + ' * ' + ip + ' = ' + grp(n * ip) + ']] <small>← primeiro os reais inteiros</small></span>' +
        '<span>[[' + n + ' * ' + br(fp, 2) + ' = ' + grp(n * fp, 2) + ']] <small>← depois os centavos</small></span>' +
        '<span>[[' + grp(n * ip) + ' + ' + grp(n * fp, 2) + ' = ' + grp(cost, 2) + ']]</span>'
        : '<span>[[' + n + ' * ' + ip + ' = ' + grp(cost) + ']]</span>') + '</div>';
    return {
      list: [
        { t: 'A região retangular', b: 'A região é um retângulo de <b>' + mS + '</b> de comprimento por <b>' + mmS + '</b> de largura.', fig: fig({ stage: 'draw', lblL: mS, lblW: mmS }) },
        { t: 'Opa! Unidades diferentes', cls: 'concept', b: 'O comprimento está em <b>metros</b>, a largura em <b>milímetros</b> e a lajota em <b>centímetros</b>. Não dá para fazer conta misturando unidades! Vamos converter tudo para <b>centímetros</b>.' },
        { t: br(Lm, 2) + ' m são quantos centímetros?', b: 'De metro para centímetro, <b>multiplicamos por 100</b> (1 m = 100 cm):<div class="calc">[[' + br(Lm, 2) + ' * 100 = ' + Lc + ']] cm</div>', fig: fig({ stage: 'relabel', prevL: mS, lblL: LS, lblW: mmS }) },
        { t: Wmm + ' mm são quantos centímetros?', b: 'De milímetro para centímetro, <b>dividimos por 10</b> (10 mm = 1 cm):<div class="calc">[[' + Wmm + ' ÷ 10 = ' + Wc + ']] cm</div>', fig: fig({ stage: 'relabel', lblL: LS, prevW: mmS, lblW: WS }) },
        { t: 'As lajotas', b: 'Pronto: a região agora está em centímetros, <b>' + Lc + ' cm por ' + Wc + ' cm</b>. Ela vai ser revestida por lajotas quadradas de <b>' + t + ' cm</b> de lado:', fig: fig({ stage: 'tiles', lblL: LS, lblW: WS }) },
        { t: 'Área de uma lajota', b: 'Olhando uma lajota de perto: ela tem ' + t + ' cm por ' + t + ' cm. Como agora <b>todas as medidas estão em centímetros</b>, podemos fazer as contas:<div class="calc">área de uma lajota = [[' + t + ' * ' + t + ' = ' + ta + ']] cm²</div>', fig: FIG.tileZoom(Lc, Wc, t) },
        { t: 'Área da região inteira', b: 'A área do retângulo inteiro é comprimento × largura:<div class="calc">[[' + Lc + ' * ' + Wc + ' = ' + area + ']] cm²</div>', fig: fig({ stage: 'area', lblL: LS, lblW: WS, center: area + ' cm²' }) },
        { t: 'Quantas lajotas cabem?', b: 'Para descobrir quantas lajotas são necessárias para preencher tudo, <b>dividimos a área total pela área de uma lajota</b>:<div class="calc">[[' + area + ' ÷ ' + ta + ' = ' + n + ']] lajotas</div>' +
            (half ? '<p class="aside">No comprimento cabem [[' + Lc + ' ÷ ' + t + ' = ' + br(cols) + ']] lajotas: a última coluna é de <b>meias lajotas</b> (em azul). Uma lajota cortada ao meio cobre dois pedaços: os recortes são <b>reaproveitados</b>. Por isso a conta da área dá certinho ' + n + '.</p>'
              : '<p class="aside">As lajotas cabem certinho: ' + cols + ' no comprimento × ' + rows + ' na largura = ' + n + '.</p>'),
          fig: fig({ stage: 'count', lblL: LS, lblW: WS, center: n + ' lajotas' }) },
        { t: 'Opa! Ainda não acabou', cls: 'concept', b: 'Isso ainda <b>não é a resposta final</b>: a questão quer o <b>preço total</b>. Cada lajota custa <b>' + money(price) + '</b>. Se vamos precisar de ' + n + ' lajotas, o preço é ' + n + ' vezes ' + money(price) + ':<div class="calc">preço total = [[' + n + ' * ' + br(price, 2) + ']]</div>' },
        { t: 'Fazendo a conta', b: 'Uma parte de cada vez:' + mult },
        { t: 'Resposta final', cls: 'final', b: 'O total a pagar é <b>' + money(cost) + '</b>.' },
        { t: 'Conferindo se faz sentido', cls: 'check', b: '[[' + n + ' * ' + ta + ' = ' + area + ']] cm², exatamente a área da região ✓.' + (half ? ' (Sem reaproveitar os recortes, seriam ' + noReuse + ' lajotas.)' : '') }
      ]
    };
  };

  // Módulo (P2 Q1): o que é módulo → os 3 passos → 1) resolve o que está dentro → 2) torna positivo
  // (o sinal de fora continua) → 3) resolve a conta.
  // terms = [{ sign: '' | '+' | '-', inner: [n] ou [n, '+' | '-', m] }]
  STEPS.modulo = function (terms) {
    var br = window.GM_LOGIC.brNum, abs = Math.abs;
    var inTxt = function (t) { return t.inner.length === 1 ? String(t.inner[0]) : t.inner[0] + ' ' + t.inner[1] + ' ' + t.inner[2]; };
    var inVal = function (t) { return t.inner.length === 1 ? t.inner[0] : t.inner[1] === '-' ? t.inner[0] - t.inner[2] : t.inner[0] + t.inner[2]; };
    var join = function (f) {
      return terms.map(function (t, i) { var neg = t.sign === '-'; return (i ? (neg ? ' - ' : ' + ') : (neg ? '-' : '')) + f(t); }).join('');
    };
    var e0 = join(function (t) { return '|' + inTxt(t) + '|'; });
    var e1 = join(function (t) { return '|' + inVal(t) + '|'; });
    var e2 = join(function (t) { return String(abs(inVal(t))); });
    var vals = terms.map(function (t) { return (t.sign === '-' ? -1 : 1) * abs(inVal(t)); });
    var result = vals.reduce(function (s, v) { return s + v; }, 0);
    var one = terms.length === 1, ord = ['primeiro', 'segundo', 'terceiro'];
    var outerMinus = terms.some(function (t) { return t.sign === '-'; });

    var p1 = terms.map(function (t, i) {
      var head = one ? 'Dentro do módulo' : 'No ' + ord[i] + ' módulo, [[|' + inTxt(t) + '|]], dentro';
      return '<li>' + (t.inner.length === 1
        ? head + ' está só o [[' + t.inner[0] + ']]. Não tem conta para fazer: <b>já está resolvido</b>.'
        : head + ' tem uma conta. Resolvendo:<div class="calc">[[' + inTxt(t) + ' = ' + inVal(t) + ']]</div>') + '</li>';
    });
    var p2 = terms.map(function (t, i) {
      var v = inVal(t), av = abs(v);
      var demo = '<div class="mod-demo" style="--d:' + (0.3 + i * 1.8) + 's"><span class="mod-bar">|</span>' + (v < 0 ? '<span class="mod-neg">−</span>' : '') +
        '<span class="mod-num">' + av + '</span><span class="mod-bar">|</span><span class="mod-arrow">→</span><span class="mod-res">' + av + '</span></div>';
      var why = v < 0 ? '[[' + v + ']] é <b>negativo</b>, então vira <b>positivo</b>: [[|' + v + '| = ' + av + ']].'
        : v === 0 ? 'O zero continua zero: [[|0| = 0]].'
        : '[[' + v + ']] já é <b>positivo</b>, então continua igual: [[|' + v + '| = ' + av + ']].';
      return '<li>' + (one ? '' : 'No ' + ord[i] + ' módulo: ') + why + demo + '</li>';
    });
    var story = '';
    if (vals.length === 2) {
      var x = vals[0], y = vals[1], ax = abs(x), ay = abs(y);
      if (x < 0 && y > 0) story = 'você deve ' + ax + ' e ganha ' + ay + (ax > ay ? ': ainda deve ' + (ax - ay) : ax < ay ? ': fica com ' + (ay - ax) : ': fica zerado');
      else if (x > 0 && y < 0) story = 'você tem ' + ax + ' e gasta ' + ay + (ay > ax ? ': fica devendo ' + (ay - ax) : ay < ax ? ': sobram ' + (ax - ay) : ': fica zerado');
      else if (x < 0 && y < 0) story = 'você deve ' + ax + ' e passa a dever mais ' + ay + ': deve ' + (ax + ay);
    }
    return {
      list: [
        { t: 'O que é módulo?', cls: 'concept', b: 'O <b>módulo</b> de um número é a <b>distância</b> dele até o zero na reta numérica. Ele é escrito entre duas barras: [[|-3|]] se lê "módulo de menos 3".' + FIG.absLine() +
            'O −3 e o 3 estão, os dois, a <b>3 passos</b> do zero. Por isso [[|-3| = 3]] e [[|3| = 3]]. Distância nunca é negativa: <b>o módulo sempre dá positivo</b> (ou zero).' },
        { t: 'Como resolver qualquer módulo', cls: 'concept', b: 'Sempre nesta ordem:<ol class="mod-rule"><li><b>Resolva o que está dentro</b> das barras.</li><li><b>Torne positivo:</b> se era negativo, fica positivo. Se era positivo, continua positivo.</li><li><b>Resolva a conta</b> que sobrou.</li></ol>' },
        { t: 'Passo 1: resolva o que está dentro', b: 'Vamos resolver [[' + e0 + ']].<ul class="mod-list">' + p1.join('') + '</ul>' + (e0 === e1 ? 'Nada mudou:' : 'Então fica:') + '<div class="calc">[[' + (e0 === e1 ? e1 : e0 + ' = ' + e1) + ']]</div>' },
        { t: 'Passo 2: torne positivo', b: '<ul class="mod-list">' + p2.join('') + '</ul>' +
            (outerMinus ? '<p class="aside">Atenção: o sinal de menos que está <b>fora</b> das barras não faz parte do módulo. Ele continua lá!</p>' : '') +
            'Tirando as barras, fica:<div class="calc">[[' + e1 + ' = ' + e2 + ']]</div>' },
        { t: 'Passo 3: resolva a conta', b: one && !outerMinus
            ? 'Não sobrou nenhuma conta para fazer. O resultado é <b>' + br(result) + '</b>.'
            : 'Agora é só fazer a conta que sobrou:<div class="calc">[[' + e2 + ' = ' + result + ']]</div>' + (story ? 'Pense assim: ' + story + '.' : '') },
        { t: 'Resposta final', cls: 'final', b: '[[' + e0 + ' = ' + result + ']]' },
        { t: 'Conferindo se faz sentido', cls: 'check', b: one
            ? 'O resultado não é negativo, como todo módulo ✓. Na reta numérica, o ' + br(inVal(terms[0])) + ' está a ' + abs(inVal(terms[0])) + ' passos do zero ✓.'
            : 'Cada módulo deu positivo (' + terms.map(function (t) { return abs(inVal(t)); }).join(' e ') + ') ✓. ' + (result < 0 ? 'O resultado final deu negativo por causa do sinal de menos que está <b>fora</b> das barras ✓.' : 'Os sinais de fora das barras continuaram valendo ✓.') }
      ]
    };
  };

  // Soma e produto (P2 Q8): identifica a, b e c (quadro fixo à esquerda) → soma = −b/a → produto = c/a →
  // "comece pelo produto": pares que dão o produto → qual par dá a soma → resposta e conferência.
  STEPS.somaProduto = function (a, r1, r2) {
    var L = window.GM_LOGIC, abs = Math.abs;
    var S = r1 + r2, P = r1 * r2, b = -a * S, c = a * P, lo = Math.min(r1, r2), hi = Math.max(r1, r2);
    var eq = L.polyToMath(L.polyFromTerms([[a, 2], [b, 1], [c, 0]])) + ' = 0';
    var par = function (n) { return n < 0 ? '(' + n + ')' : String(n); };
    var row = function (cls, k, v, small) { return '<div class="sp-prow ' + cls + '">' + (small ? '<small>' + k + '</small>[[' + v + ']]' : '<b>' + k + '</b> = [[' + v + ']]') + '</div>'; };
    var panel = function (more) {
      return '<div class="sp-panel">' + row('sp-a', 'a', a) + row('sp-b', 'b', b) + row('sp-c', 'c', c) + (more ? row('sp-s', 'Soma', S, true) + row('sp-p', 'Produto', P, true) : '') + '</div>';
    };
    var wrap = function (more, html) { return '<div class="sp-wrap">' + panel(more) + '<div class="sp-main">' + html + '</div></div>'; };
    var fig = function (svg) { return '<div class="st-fig">' + svg + '</div>'; };
    var divNote = a === 1 ? 'dividir por 1 não muda nada' : a === -1 ? 'dividir por −1 troca o sinal' : 'fazendo a divisão';
    var bTerm = (b < 0 ? '- ' : '+ ') + (abs(b) === 1 ? '' : abs(b)) + 'x', cTerm = (c < 0 ? '- ' : '+ ') + abs(c);

    // pares de inteiros com o produto P (sem repetir a ordem)
    var pairs = [], seen = {};
    for (var d = 1; d * d <= abs(P); d++) {
      if (P % d !== 0) continue;
      [[d, P / d], [-d, -P / d]].forEach(function (pr) {
        var key = Math.min(pr[0], pr[1]) + '|' + Math.max(pr[0], pr[1]);
        if (!seen[key]) { seen[key] = 1; pairs.push(pr); }
      });
    }
    if (!seen[lo + '|' + hi]) pairs.push([lo, hi]);
    var nb = function (n) { return '<span class="nbox">[[' + n + ']]</span>'; };
    var prodRows = pairs.map(function (pr, i) {
      return '<div class="sp-try anim-fade" style="animation-delay:' + (0.2 + i * 0.35).toFixed(2) + 's">' + nb(pr[0]) + '<span class="sp-op">×</span>' + nb(pr[1]) + '<span class="sp-eq">= [[' + P + ']]</span></div>';
    }).join('');
    var sumRows = pairs.map(function (pr, i) {
      var ok = pr[0] + pr[1] === S;
      return '<div class="sp-try anim-fade ' + (ok ? 'sp-ok' : 'sp-no') + '" style="animation-delay:' + (0.2 + i * 0.5).toFixed(2) + 's">' + nb(pr[0]) + '<span class="sp-op">+</span>' + nb(pr[1]) +
        '<span class="sp-eq">= [[' + (pr[0] + pr[1]) + ']] ' + (ok ? '✓' : '✗') + '</span></div>';
    }).join('');
    var plug = function (r) {
      var t2 = a * r * r, t1 = b * r;
      return '<span>[[x = ' + r + ']]: [[' + t2 + (t1 < 0 ? ' - ' : ' + ') + abs(t1) + (c < 0 ? ' - ' : ' + ') + abs(c) + ' = 0]] ✓</span>';
    };

    return {
      list: [
        { t: 'Quem são a, b e c?', b: 'A equação [[' + eq + ']] é do tipo [[ax^2 + bx + c = 0]]:<ul class="sp-rules"><li><b class="sp-a">a</b> é o número que acompanha o [[x^2]];</li><li><b class="sp-b">b</b> é o número que acompanha o [[x]];</li><li><b class="sp-c">c</b> é o número sozinho.</li></ul>Vamos tirar esses valores da equação e guardar no quadro da esquerda:' +
            fig(FIG.abcPull(a, b, c)) +
            (a === -1 ? '<p class="aside">Repare: na frente do [[x^2]] não aparece número, só o sinal de menos. Quando é [[-x^2]], o <b>a é −1</b>.</p>'
              : a === 1 ? '<p class="aside">Repare: na frente do [[x^2]] não aparece número nenhum. Quando é só [[x^2]], o <b>a é 1</b>.</p>' : '') +
            'O sinal vai junto com o número: [[' + bTerm + ']] dá [[b = ' + b + ']] e [[' + cTerm + ']] dá [[c = ' + c + ']].' },
        { t: 'A soma das raízes', b: 'A fórmula da <b>soma</b> é o <b>contrário do b</b>, dividido pelo <b>a</b>:<div class="calc">Soma = [[frac{-b}{a}]]</div>Puxamos o [[b]] e o [[a]] do quadro:' + fig(FIG.spFormula('soma', a, b, c)) +
            '<div class="calc calc-lines"><span>Soma = [[frac{' + (b < 0 ? '-(' + b + ')' : '-' + b) + '}{' + a + '}]] <small>← no lugar do b vai ' + spNum(b) + ' e no lugar do a vai ' + spNum(a) + '</small></span>' +
            (b < 0 ? '<span>Soma = [[frac{' + (-b) + '}{' + a + '}]] <small>← menos com menos dá mais</small></span>' : '') +
            '<span>Soma = [[' + S + ']] <small>← ' + divNote + '</small></span></div>' },
        { t: 'O produto das raízes', b: 'A fórmula do <b>produto</b> é o <b>c</b> dividido pelo <b>a</b>:<div class="calc">Produto = [[frac{c}{a}]]</div>Puxamos o [[c]] e o [[a]] do quadro:' + fig(FIG.spFormula('produto', a, b, c)) +
            '<div class="calc calc-lines"><span>Produto = [[frac{' + c + '}{' + a + '}]] <small>← no lugar do c vai ' + spNum(c) + ' e no lugar do a vai ' + spNum(a) + '</small></span>' +
            '<span>Produto = [[' + P + ']] <small>← ' + divNote + '</small></span></div>' },
        { t: 'Dica: comece sempre pelo produto!', cls: 'concept', b: wrap(true, 'Agora sabemos que as duas raízes:<ul class="sp-rules"><li>somadas dão <b>' + spNum(S) + '</b>;</li><li>multiplicadas dão <b>' + spNum(P) + '</b>.</li></ul><b>Comece sempre pelo produto</b>: são poucos os pares de números inteiros que multiplicados dão ' + spNum(P) + '. Depois é só ver qual desses pares também dá a soma.') },
        { t: 'Os pares que dão o produto', b: wrap(true, 'Quais números multiplicados dão <b>' + spNum(P) + '</b>? ' +
            (P < 0 ? 'Como o produto é <b>negativo</b>, um número é positivo e o outro é negativo.' : 'Como o produto é <b>positivo</b>, os dois números têm o <b>mesmo sinal</b>.') + prodRows) },
        { t: 'Qual par dá a soma?', b: wrap(true, 'Agora testamos a <b>soma</b> de cada par. Ela precisa dar <b>' + spNum(S) + '</b>:' + sumRows +
            'O par que dá produto ' + spNum(P) + ' <b>e</b> soma ' + spNum(S) + ' é:' + L.boxes(['[[' + lo + ']]', '[[' + hi + ']]'], 'nbox-answer')) },
        { t: 'Resposta final', cls: 'final', b: wrap(true, 'As raízes da equação são:' + L.boxes(['[[x_1 = ' + lo + ']]', '[[x_2 = ' + hi + ']]'], 'nbox-answer') + 'S = {' + spNum(lo) + ', ' + spNum(hi) + '}') },
        { t: 'Conferindo se faz sentido', cls: 'check', b: wrap(true, 'Colocando cada raiz na equação, tem que dar zero:<div class="calc calc-lines">' + plug(lo) + plug(hi) + '</div>E [[' + lo + ' + ' + par(hi) + ' = ' + S + ']], [[' + lo + ' * ' + par(hi) + ' = ' + P + ']] ✓.') }
      ]
    };
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
          steps: STEPS.consec({ S: 21, step: 1, first: 6, kind: 'consecutivos' })
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
            intro: { t: 'O que é triplo?', b: '<b>Triplo</b> é multiplicar por <b>3</b>. Por exemplo: o triplo de 5 é [[3 * 5 = 15]].' },
            ask: 'Nesse caso, não interessa se o número é ímpar ou par. O que interessa é que o <b>triplo</b> de um número <b>mais 12</b> é igual a <b>93</b>. Qual é esse número?',
            data: 'Vamos chamar esse número de [[x]], porque é o que a gente quer descobrir.',
            s1: 'O triplo de [[x]] é [[3x]]. Então a frase "o triplo de um número mais 12 é igual a 93" vira:<div class="calc">[[3x + 12 = 93]]</div>',
            s2: 'Agora é só resolver, uma conta de cada vez:<div class="calc calc-lines"><span>[[3x + 12 = 93]]</span><span>[[3x = 93 - 12]] <small>← o +12 muda de lado e vira −12</small></span><span>[[3x = 81]]</span><span>[[x = 81 ÷ 3]] <small>← o 3 que multiplica muda de lado e divide</small></span><span>[[x = 27]]</span></div>',
            final: 'O número é <b>27</b>.',
            check: 'O triplo de 27 é [[3 * 27 = 81]], e [[81 + 12 = 93]] ✓. (E 27 é mesmo ímpar, como a questão falou ✓.)'
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
          steps: STEPS.consec({ S: 81, step: 2, first: 25, kind: 'ímpares' })
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
          steps: STEPS.volume(2, 8, 400)
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
            steps: STEPS.pctOf(30, 80)
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
            steps: STEPS.pctWhich(20, 32)
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
          steps: STEPS.discount(90000, 40)
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
          steps: STEPS.media([5, 10, 7, 6, 9, 5, 7])
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
          steps: STEPS.mediaGrupos([[14, 10], [10, 12], [5, 15]], 'alunos')
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
          steps: STEPS.reflection(REF, REF_OK, 'C', 'triângulo PQR')
        }],
        variations: []
      }
    ]
  };

  /* ---------- P2 ---------- */

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
            steps: STEPS.modulo([{ sign: '', inner: [-8] }])
          },
          {
            key: 'b', label: 'b)', prompt: '[[|3|]] =',
            answer: { type: 'integer', value: 3, neg: true },
            hint: { rules: ['modulo'], tip: 'Qual é a distância do 3 até o zero?' },
            hints: [{ when: -3, msg: 'O módulo é uma distância, e distância nunca é negativa.' }],
            final: '3',
            steps: STEPS.modulo([{ sign: '', inner: [3] }])
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
            steps: STEPS.modulo([{ sign: '', inner: [4, '-', 7] }])
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
            steps: STEPS.modulo([{ sign: '-', inner: [5] }, { sign: '+', inner: [-2] }])
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
            final: 'Os divisores de 18 são:' + window.GM_LOGIC.boxes([1, 2, 3, 6, 9, 18], 'nbox-answer'),
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
            hint: { rules: ['soma-produto'], tip: 'Aqui [[a = -1]] (é [[-x^2]]), [[b = 2]] e [[c = 3]]. Soma = [[frac{-b}{a}]] e produto = [[frac{c}{a}]]. Comece pelo produto!' },
            hints: [
              { when: [1, -3], msg: 'O produto está certo (−3), mas a soma deu −2. A soma precisa ser <b>2</b>: confira os sinais.' },
              { when: function (v) { return v[0] * v[1] !== -3; }, msg: 'Confira o <b>produto</b>: [[frac{c}{a} = frac{3}{-1} = -3]]. As raízes multiplicadas precisam dar −3.' },
              { when: function () { return true; }, msg: 'Confira a <b>soma</b>: [[frac{-b}{a} = frac{-2}{-1} = 2]].' }
            ],
            final: '[[x = -1]] e [[x = 3]]',
            steps: STEPS.somaProduto(-1, -1, 3)
          },
          {
            key: 'b', label: 'b)', prompt: '[[x^2 + 6x - 16 = 0]]',
            answer: { type: 'numberList', values: [-8, 2], ordered: false, labels: ['[[x_1]] =', '[[x_2]] ='], neg: true },
            hint: { rules: ['soma-produto'], tip: 'Aqui [[a = 1]] (é só [[x^2]]), [[b = 6]] e [[c = -16]]. Soma = [[frac{-b}{a}]] e produto = [[frac{c}{a}]]. Comece pelo produto!' },
            hints: [
              { when: [8, -2], msg: 'Quase! A soma deu +6, mas precisa ser <b>−6</b>. Troque os sinais.' },
              { when: function (v) { return v[0] * v[1] !== -16; }, msg: 'Confira o <b>produto</b>: [[frac{c}{a} = frac{-16}{1} = -16]]. As raízes multiplicadas precisam dar −16.' },
              { when: function () { return true; }, msg: 'Confira a <b>soma</b>: [[frac{-b}{a} = frac{-6}{1} = -6]].' }
            ],
            final: '[[x = -8]] e [[x = 2]]',
            steps: STEPS.somaProduto(1, -8, 2)
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
          steps: STEPS.squaresArea([80, 40, 20])
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
          steps: STEPS.tiles(0.76, 480, 8, 2.75)
        }],
        variations: []
      }
    ]
  };

  window.GM_FIG = FIG;
  window.GM_STEPS = STEPS;
  window.GM_BANK = { version: 2, exams: [P1, P2] };
})();
