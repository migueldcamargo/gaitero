/* =====================================================================
   GAITERO MATH — Contas do jeito que se aprende na escola
   · divisão na chave (método longo), uma etapa por número do resultado;
   · conta armada de multiplicação (vírgula só no fim, contando as casas);
   · × e ÷ por 10, 100 e 1000: a vírgula pula casas;
   · chuveirinho (distributiva), um arco por multiplicação.
   Cada conta vira etapas da resolução (formato { t, b, fig }), com animação.
   Exporta window.GM_CONTAS; questions.js e variations.js usam.
   ===================================================================== */
(function () {
  'use strict';
  var L = window.GM_LOGIC, br = L.brNum;
  var C = {};
  var dl = function (t) { return ' style="animation-delay:' + t.toFixed(2) + 's"'; };
  var f1 = function (v) { return v.toFixed(1); };
  var pow10 = function (k) { return Math.pow(10, k); };
  var fig = function (svg) { return '<div class="st-fig">' + svg + '</div>'; };
  var CW = 17, RH = 29, ZOOM = 1.2;

  /* ================= Vírgula pulando casas ================= */
  // digits sem vírgula; from/to = quantos algarismos ficam antes da vírgula.
  // showLate: algarismos que aparecem no fim (zeros que completam); hideLate: somem no fim.
  // dropComma: a vírgula some no fim (quando depois dela só sobrou zero).
  C.commaFig = function (o) {
    var d = o.delay || 0, n = o.digits.length, SL = 24, Lf = 14, s = '';
    var X = function (i) { return Lf + i * SL + SL / 2; };
    var CX = function (pos) { return Lf + pos * SL + 1; };
    var st = function (delay) { return ' style="animation-delay:' + (d + delay) + 's"'; };
    o.digits.split('').forEach(function (ch, i) {
      var late = (o.showLate || []).indexOf(i) >= 0, gone = (o.hideLate || []).indexOf(i) >= 0;
      s += '<text class="fg-cm-dig' + (late ? ' anim-fade' : gone ? ' anim-fadeout' : '') + '" x="' + X(i) + '" y="42"' + (late || gone ? st(1.7) : '') + '>' + ch + '</text>';
    });
    var pctX = Lf + n * SL + 6;
    if (o.pctStart) s += '<text class="fg-cm-pct anim-fadeout" x="' + pctX + '" y="42"' + st(0.2) + '>%</text>';
    var comma = '<text class="fg-cm-comma comma-hop" x="' + CX(o.from) + '" y="42" style="--dx:' + ((o.to - o.from) * SL) + 'px;animation-delay:' + (d + 0.6) + 's">,</text>';
    if (o.from === n) comma = '<g class="anim-fade"' + st(0.3) + '>' + comma + '</g>';
    if (o.to === n || o.dropComma) comma = '<g class="anim-fadeout"' + st(1.7) + '>' + comma + '</g>';
    s += comma;
    if (o.pctEnd) s += '<text class="fg-cm-pct anim-fade" x="' + pctX + '" y="42"' + st(1.9) + '>%</text>';
    var W = pctX + 30;
    if (o.result) { s += '<text class="fg-cm-res anim-fade" x="' + (pctX + 30) + '" y="42"' + st(2.1) + '>' + o.result + '</text>'; W += o.result.length * 14 + 6; }
    return '<svg class="fig fig-comma" viewBox="0 0 ' + W + ' 56" role="img" aria-label="' + (o.aria || '') + '">' + s + '</svg>';
  };

  // value × 10^k (mul = true) ou value ÷ 10^k: a vírgula anda k casas.
  C.shiftFig = function (value, k, mul, delay) {
    var parts = br(value).replace(/\./g, '').split(','), ip = parts[0], dp = parts[1] || '';
    var digits = ip + dp, from = ip.length, to = mul ? from + k : from - k, late = [];
    while (to > digits.length) { late.push(digits.length); digits += '0'; }
    while (to < 1) { digits = '0' + digits; late = late.map(function (i) { return i + 1; }); late.unshift(0); from++; to++; }
    var hide = [];
    for (var i = 0; i < to - 1 && digits[i] === '0'; i++) hide.push(i);          // zero sobrando na frente
    var j = digits.length - 1;
    while (j >= to && digits[j] === '0') { hide.push(j); j--; }                  // zeros sobrando depois da vírgula
    var res = mul ? value * pow10(k) : value / pow10(k);
    return C.commaFig({
      digits: digits, from: from, to: to, showLate: late, hideLate: hide, dropComma: j < to, delay: delay,
      result: '= ' + br(Math.round(res * 1e6) / 1e6), aria: br(value) + (mul ? ' vezes ' : ' dividido por ') + pow10(k)
    });
  };
  // Texto + figura para × ou ÷ por 10, 100, 1000.
  C.shiftStep = function (value, k, mul) {
    var res = Math.round((mul ? value * pow10(k) : value / pow10(k)) * 1e6) / 1e6;
    var decs = (br(value).split(',')[1] || '').length;
    return {
      t: (mul ? 'Multiplicando' : 'Dividindo') + ' por ' + pow10(k),
      b: (mul ? 'Multiplicar' : 'Dividir') + ' por ' + pow10(k) + ' é fácil: a <b>vírgula pula ' + k + (k > 1 ? ' casas' : ' casa') + ' para a ' + (mul ? 'direita' : 'esquerda') + '</b> (uma casa para cada zero do ' + pow10(k) + ')' +
        (mul && decs < k ? '. Quando acabam os números, completamos com zero' : '') +
        (!mul && Number.isInteger(value) ? '. Num número inteiro, a vírgula fica escondida no fim' : '') + ':' + fig(C.shiftFig(value, k, mul, 0)),
      value: res
    };
  };
  var isPow10 = function (d) { return d === 10 || d === 100 || d === 1000; };

  /* ================= Divisão na chave ================= */
  function chavePlan(D, d, maxDec) {
    var ds = String(D).split('').map(Number), n = ds.length;
    var cyc = [], q = '', e, p, row = 0, rowStart = 0, dec = 0, comma = false, entry;
    if (D < d) { q = '0,'; comma = true; e = n; p = D * 10; entry = { kind: 'small' }; }
    else {
      var tried = [ds[0]];
      e = 0; p = ds[0];
      while (p < d) { e++; p = p * 10 + ds[e]; tried.push(p); }
      entry = { kind: 'start', tried: tried };
    }
    for (var guard = 0; guard < 40; guard++) {
      var qd = Math.floor(p / d), prod = qd * d, r = p - prod;
      var c = { entry: entry, p: p, qd: qd, prod: prod, r: r, e: e, row: row, rowStart: rowStart, qi: q.length };
      if (e >= n) dec++;
      q += qd;
      if (qd > 0) { c.prodRow = row + 1; c.remRow = row + 2; row += 2; rowStart = e - String(r).length + 1; }
      else c.remRow = row;
      cyc.push(c);
      if (e + 1 < n) { e++; p = r * 10 + ds[e]; entry = { kind: 'bring', digit: ds[e] }; }
      else if (r === 0 || dec >= maxDec) break;
      else { entry = { kind: 'zero', from: r, comma: !comma, qi: q.length }; if (!comma) { q += ','; comma = true; } e++; p = r * 10; }
    }
    var last = cyc[cyc.length - 1];
    return {
      D: D, d: d, n: n, cyc: cyc, q: q, rows: row, approx: last.r !== 0, maxDec: maxDec,
      next: last.r ? Math.floor(last.r * 10 / d) : 0,
      cols: Math.max.apply(null, cyc.map(function (c) { return c.e; })) + 1
    };
  }
  // Desenho da chave até a etapa k (0 = conta montada; i = depois do i-ésimo número do resultado).
  // Só a etapa k anima: o que desce, o número do resultado, a multiplicação que vai para baixo e a subtração.
  function chaveSVG(P, k) {
    var X = function (col) { return 6 + (col + 1) * CW + CW / 2; };
    var Y = function (r) { return 30 + r * RH; };
    var xBar = 6 + (P.cols + 1) * CW + 8, dStr = String(P.d);
    var qw = function (ch) { return ch === ',' ? 9 : CW; };
    var QX = function (i) { var x = xBar + 10; for (var j = 0; j < i; j++) x += qw(P.q[j]); return x + qw(P.q[i]) / 2; };
    var qTot = 0;
    for (var j = 0; j < P.q.length; j++) qTot += qw(P.q[j]);
    var W = xBar + 10 + Math.max(dStr.length * CW, qTot) + 12, H = Y(Math.max(P.rows, 1)) + 12;
    var bg = '', fg = '';
    var T = function (x, y, txt, cls, extra) { return '<text class="ch-t ' + cls + '" x="' + f1(x) + '" y="' + y + '"' + (extra || '') + '>' + txt + '</text>'; };
    var HL = function (x1, x2, r, t) { bg += '<rect class="ch-hl" x="' + f1(x1) + '" y="' + (Y(r) - 21) + '" width="' + f1(x2 - x1) + '" height="28" rx="6"' + dl(t) + '/>'; };
    var digits = function (str, endCol, r, cls) { var out = ''; for (var i = 0; i < str.length; i++) out += T(X(endCol - str.length + 1 + i), Y(r), str[i], cls); return out; };
    var a0 = k === 0;
    fg += '<g' + (a0 ? ' class="anim-fade"' + dl(0.2) : '') + '>' + digits(String(P.D), P.n - 1, 0, 'ch-D') + '</g>';
    fg += '<g' + (a0 ? ' class="anim-fade"' + dl(0.5) : '') + '>';
    for (var i = 0; i < dStr.length; i++) fg += T(xBar + 10 + i * CW + CW / 2, Y(0), dStr[i], 'ch-d');
    fg += '</g>';
    fg += '<path class="ch-bar' + (a0 ? ' anim-draw' : '') + '" pathLength="1"' + (a0 ? dl(0.8) : '') + ' d="M' + xBar + ' ' + (Y(0) - 22) + ' V' + (Y(0) + 8) + '"/>';
    fg += '<path class="ch-bar' + (a0 ? ' anim-draw' : '') + '" pathLength="1"' + (a0 ? dl(1.2) : '') + ' d="M' + xBar + ' ' + (Y(0) + 8) + ' H' + (xBar + Math.max(dStr.length * CW, qTot) + 14) + '"/>';
    P.cyc.forEach(function (c, ci) {
      if (ci >= k) return;
      var an = ci === k - 1, en = c.entry;
      if (en.kind === 'small') {
        fg += T(QX(0), Y(1), '0', 'ch-q' + (an ? ' anim-pop' : ''), an ? dl(0.2) : '');
        fg += T(QX(1), Y(1), ',', 'ch-q' + (an ? ' anim-pop' : ''), an ? dl(0.4) : '');
        fg += T(X(c.e), Y(0), '0', 'ch-new' + (an ? ' anim-pop' : ''), an ? dl(0.6) : '');
      } else if (en.kind === 'bring') {
        if (an) fg += '<path class="ch-down anim-draw" pathLength="1"' + dl(0.1) + ' d="M' + f1(X(c.e)) + ' ' + (Y(0) + 6) + ' V' + (Y(c.row) - 22) + '"/>';
        fg += T(X(c.e), Y(c.row), String(en.digit), 'ch-new' + (an ? ' anim-fly' : ''), an ? ' style="--dx:0px;--dy:' + (Y(0) - Y(c.row)) + 'px;animation-delay:.2s"' : '');
      } else if (en.kind === 'zero') {
        if (en.comma) fg += T(QX(en.qi), Y(1), ',', 'ch-q' + (an ? ' anim-pop' : ''), an ? dl(0.2) : '');
        fg += T(X(c.e), Y(c.row), '0', 'ch-new' + (an ? ' anim-pop' : ''), an ? dl(0.5) : '');
      }
      if (an) HL(X(c.rowStart) - CW / 2 + 1, X(c.e) + CW / 2 - 1, c.row, 1.1);
      fg += T(QX(c.qi), Y(1), String(c.qd), 'ch-q' + (an ? ' anim-pop' : ''), an ? dl(1.6) : '');
      if (c.qd > 0) {
        var ps = String(c.prod), pStart = c.e - ps.length + 1;
        if (an) { HL(QX(c.qi) - CW / 2, QX(c.qi) + CW / 2, 1, 2.3); HL(xBar + 6, xBar + 14 + dStr.length * CW, 0, 2.3); }
        var cx = (X(pStart) + X(c.e)) / 2;
        fg += '<g' + (an ? ' class="anim-fly" style="--dx:' + f1(QX(c.qi) - cx) + 'px;--dy:' + (Y(1) - Y(c.prodRow)) + 'px;animation-delay:2.8s"' : '') + '>' + digits(ps, c.e, c.prodRow, 'ch-p') + '</g>';
        fg += T(X(pStart - 1), Y(c.prodRow), '−', 'ch-p' + (an ? ' anim-fade' : ''), an ? dl(3.7) : '');
        fg += '<path class="ch-line' + (an ? ' anim-draw' : '') + '" pathLength="1"' + (an ? dl(4.2) : '') + ' d="M' + f1(X(pStart - 1) - CW / 2 + 2) + ' ' + (Y(c.prodRow) + 7) + ' H' + f1(X(c.e) + CW / 2) + '"/>';
        if (an) { HL(X(c.rowStart) - CW / 2 + 1, X(c.e) + CW / 2 - 1, c.row, 3.9); HL(X(pStart) - CW / 2 + 1, X(c.e) + CW / 2 - 1, c.prodRow, 3.9); }
        fg += '<g' + (an ? ' class="anim-fade"' + dl(4.7) : '') + '>' + digits(String(c.r), c.e, c.remRow, 'ch-r') + '</g>';
      }
    });
    return '<svg class="fig fig-chave" width="' + Math.round(W * ZOOM) + '" height="' + Math.round(H * ZOOM) + '" viewBox="0 0 ' + Math.round(W) + ' ' + H + '" role="img" aria-label="Divisão de ' + P.D + ' por ' + P.d + ' na chave">' + bg + fg + '</svg>';
  }
  function chaveEntry(P, c) {
    var en = c.entry, d = P.d;
    if (en.kind === 'start') {
      if (en.tried.length === 1) return 'Começamos pela esquerda, com o <b>' + c.p + '</b>.';
      var small = en.tried.slice(0, -1);
      return 'Começamos pela esquerda. ' + small.map(function (v, j) { return (j ? 'o ' : 'O ') + v; }).join(' e ') +
        (small.length > 1 ? ' são menores' : ' é menor') + ' que ' + d + ': não dá. Então pegamos o <b>' + c.p + '</b>.';
    }
    if (en.kind === 'small') return 'O ' + P.D + ' é menor que ' + d + ': o ' + d + ' não cabe nenhuma vez no ' + P.D + '. Então escrevemos <b>0</b> e uma <b>vírgula</b> no resultado, e colocamos um <b>zero</b> do lado do ' + P.D + ': fica <b>' + c.p + '</b>.';
    if (en.kind === 'bring') return 'Descemos o próximo número, o <b>' + en.digit + '</b>: fica <b>' + c.p + '</b>.';
    return 'Os números de cima acabaram, mas sobrou <b>' + en.from + '</b>. ' + (en.comma ? 'Colocamos uma <b>vírgula</b> no resultado e ' : 'Colocamos ') + 'um <b>zero</b> do lado do ' + en.from + ': fica <b>' + c.p + '</b>.';
  }
  function chaveCabe(P, c) {
    var d = P.d;
    if (c.qd === 0) return ' O ' + d + ' não cabe no ' + c.p + ' (' + c.p + ' é menor que ' + d + '): escrevemos <b>0</b> no resultado.';
    var lines = '<span>[[' + d + ' * ' + c.qd + ' = ' + c.prod + ']] ✓</span>' +
      (c.qd < 9 ? '<span>[[' + d + ' * ' + (c.qd + 1) + ' = ' + d * (c.qd + 1) + ']] <small>← passou do ' + c.p + '</small></span>' : '');
    return ' Quantas vezes o <b>' + d + '</b> cabe no <b>' + c.p + '</b>? ' + (d <= 10 ? 'Pela tabuada do ' + d : 'Testando') + ':<div class="calc calc-lines">' + lines + '</div>' +
      'Cabe <b>' + c.qd + '</b> ' + (c.qd === 1 ? 'vez' : 'vezes') + ': o ' + c.qd + ' vai para o resultado. Multiplicamos [[' + c.qd + ' * ' + d + ' = ' + c.prod + ']] e colocamos embaixo do ' + c.p + '. Depois subtraímos: [[' + c.p + ' - ' + c.prod + ' = ' + c.r + ']].';
  }
  // D ÷ d na chave. Devolve as etapas e o resultado (texto BR, valor, se é aproximado).
  C.chave = function (D, d, o) {
    o = o || {};
    var maxDec = o.maxDec == null ? 3 : o.maxDec, P = chavePlan(D, d, maxDec);
    var value = P.approx ? Math.round(D / d * pow10(maxDec)) / pow10(maxDec) : D / d;
    var text = P.approx ? br(value, maxDec) : P.q;
    var steps = [{
      t: 'Montando a conta na chave',
      b: 'Vamos fazer [[frac{' + D + '}{' + d + '}]] (' + D + ' dividido por ' + d + ') na <b>chave</b>. O <b>' + D + '</b> fica do lado de dentro e o <b>' + d + '</b> do lado de fora, em cima da linha. O resultado vai aparecendo embaixo da linha, um número de cada vez.',
      fig: chaveSVG(P, 0)
    }];
    P.cyc.forEach(function (c, i) {
      var last = i === P.cyc.length - 1, end = '';
      if (last) {
        end = P.approx
          ? ' Já temos ' + maxDec + (maxDec > 1 ? ' casas' : ' casa') + ' depois da vírgula: podemos parar.' + (P.next >= 5 ? ' A próxima casa seria ' + P.next + ' (5 ou mais), então arredondamos para cima.' : '') + '<div class="calc">[[frac{' + D + '}{' + d + '}]] ≈ ' + text + '</div>'
          : ' Sobrou <b>0</b>: a conta acabou!<div class="calc">[[frac{' + D + '}{' + d + '} = ' + text + ']]</div>';
      }
      steps.push({ t: 'Quantas vezes o ' + d + ' cabe no ' + c.p + '?', b: chaveEntry(P, c) + chaveCabe(P, c) + end, fig: chaveSVG(P, i + 1) });
    });
    return { steps: steps, text: text, value: value, approx: P.approx };
  };
  // Divisão: por 10, 100, 1000 → vírgula pulando; senão → chave.
  C.divide = function (D, d, o) {
    if (isPow10(d)) {
      var k = String(d).length - 1, st = C.shiftStep(D, k, false);
      return { steps: [{ t: st.t, b: st.b }], text: br(st.value), value: st.value, approx: false };
    }
    return C.chave(D, d, o);
  };

  /* ================= Conta armada (multiplicação) ================= */
  function numParts(x) {
    var p = br(x).replace(/\./g, '').split(',');
    var dig = (p[0] + (p[1] || '')).replace(/^0+(?=\d)/, ''), dec = (p[1] || '').length;
    while (dig.length <= dec) dig = '0' + dig;
    return { txt: br(x), dig: dig, dec: dec };
  }
  // Precisa de conta armada? Quando os dois números (sem vírgula e sem zeros no fim) têm 2 algarismos ou mais.
  C.needsArmada = function (a, b) {
    var core = function (x) { return +numParts(x).dig.replace(/0+$/, '') || 0; };
    return core(a) >= 10 && core(b) >= 10;
  };
  function armadaPlan(a, b) {
    var A = numParts(a), B = numParts(b), top = A, bot = B;
    if (B.dig.length > A.dig.length) { top = B; bot = A; }
    var td = top.dig.split('').reverse().map(Number);
    var rows = bot.dig.split('').reverse().map(function (dg, j) {
      dg = +dg;
      var carry = 0, ops = td.map(function (t) { var v = t * dg + carry, op = { t: t, cin: carry, v: v }; carry = Math.floor(v / 10); op.cout = carry; return op; });
      return { dg: dg, j: j, ops: ops, val: +top.dig * dg };
    });
    var totalInt = +top.dig * +bot.dig, dec = top.dec + bot.dec, totStr = String(totalInt);
    while (totStr.length <= dec) totStr = '0' + totStr;
    var stages = ['setup'].concat(rows.map(function (r, j) { return 'row' + j; }));
    if (rows.length > 1) stages.push('sum');
    if (dec) stages.push('comma');
    var dur = { setup: 1, sum: 0.9 + totStr.length * 0.35, comma: 2.2 };
    rows.forEach(function (r, j) { dur['row' + j] = 0.9 + r.ops.length * 0.8; });
    return {
      top: top, bot: bot, rows: rows, totalInt: totalInt, totStr: totStr, dec: dec, stages: stages, dur: dur,
      result: Math.round(totalInt / pow10(dec) * 1e6) / 1e6,
      nCols: Math.max(totStr.length, top.dig.length, bot.dig.length + rows.length - 1) + 1
    };
  }
  function armadaSVG(P, k, compact) {
    var nC = P.nCols, W = 10 + nC * CW + 12, nR = P.rows.length;
    var X = function (col) { return 10 + (nC - 1 - col) * CW + CW / 2; };
    var Y = function (r) { return 48 + (r - 1) * RH; };
    var totRow = nR > 1 ? 3 + nR : 3, H = Y(totRow) + 12;
    var off = {}, acc = 0;
    P.stages.forEach(function (st) { off[st] = acc; acc += P.dur[st]; });
    var at = function (st, t) { return compact ? off[st] + t : t; };
    var bg = '', fg = '';
    var T = function (x, y, txt, cls, extra) { return '<text class="ch-t ' + cls + '" x="' + f1(x) + '" y="' + y + '"' + (extra || '') + '>' + txt + '</text>'; };
    var HL = function (c1, c2, r, t) { bg += '<rect class="ch-hl" x="' + f1(X(c2) - CW / 2 + 1) + '" y="' + (Y(r) - 21) + '" width="' + f1((c2 - c1 + 1) * CW - 2) + '" height="28" rx="6"' + dl(t) + '/>'; };
    var number = function (dig, dec, r, cls) {
      var out = '';
      for (var i = 0; i < dig.length; i++) out += T(X(dig.length - 1 - i), Y(r), dig[i], cls);
      if (dec) out += T(X(dec - 1) - CW / 2 + 1, Y(r), ',', cls + ' ch-comma');
      return out;
    };
    P.stages.forEach(function (st, si) {
      if (si > k) return;
      var an = compact || si === k;
      if (st === 'setup') {
        fg += '<g' + (an ? ' class="anim-fade"' + dl(at(st, 0.1)) : '') + '>' + number(P.top.dig, P.top.dec, 1, 'ar-top') + '</g>';
        fg += '<g' + (an ? ' class="anim-fade"' + dl(at(st, 0.35)) : '') + '>' + number(P.bot.dig, P.bot.dec, 2, 'ar-bot') + T(X(nC - 1), Y(2), '×', 'ar-sign') + '</g>';
        fg += '<path class="ch-line' + (an ? ' anim-draw' : '') + '" pathLength="1"' + (an ? dl(at(st, 0.6)) : '') + ' d="M' + f1(X(nC - 1) - CW / 2) + ' ' + (Y(2) + 8) + ' H' + f1(X(0) + CW / 2) + '"/>';
      } else if (st.indexOf('row') === 0) {
        var j = +st.slice(3), rw = P.rows[j], vs = String(rw.val), last = rw.ops.length - 1;
        if (an) { HL(j, j, 2, at(st, 0.1)); HL(0, P.top.dig.length - 1, 1, at(st, 0.1)); }
        for (var p = 0; p < vs.length; p++) {
          fg += T(X(j + p), Y(3 + j), vs[vs.length - 1 - p], 'ar-row' + (an ? ' anim-pop' : ''), an ? dl(at(st, 0.6 + Math.min(p, last) * 0.8)) : '');
        }
        if (an) {
          var cs = '';
          rw.ops.forEach(function (op, i) {
            if (i < last && op.cout) cs += T(X(i + 1), Y(1) - 22, String(op.cout), 'ar-carry anim-pop', dl(at(st, 0.95 + i * 0.8)));
          });
          var nxt = P.stages[si + 1];
          fg += compact && nxt ? '<g class="anim-fadeout"' + dl(off[nxt]) + '>' + cs + '</g>' : cs;
        }
      } else if (st === 'sum') {
        fg += T(X(nC - 1), Y(2 + nR), '+', 'ar-sign' + (an ? ' anim-fade' : ''), an ? dl(at(st, 0.1)) : '');
        fg += '<path class="ch-line' + (an ? ' anim-draw' : '') + '" pathLength="1"' + (an ? dl(at(st, 0.3)) : '') + ' d="M' + f1(X(nC - 1) - CW / 2) + ' ' + (Y(2 + nR) + 8) + ' H' + f1(X(0) + CW / 2) + '"/>';
        for (var q = 0; q < P.totStr.length; q++) {
          fg += T(X(q), Y(totRow), P.totStr[P.totStr.length - 1 - q], 'ar-tot' + (an ? ' anim-pop' : ''), an ? dl(at(st, 0.7 + q * 0.35)) : '');
        }
      } else if (st === 'comma') {
        var cx = X(P.dec - 1) - CW / 2 + 1, sx = X(0) + CW / 2 - 1;
        if (an) {
          if (P.top.dec) HL(0, P.top.dec - 1, 1, at(st, 0.1));
          if (P.bot.dec) HL(0, P.bot.dec - 1, 2, at(st, 0.1));
          fg += '<g class="anim-fade"' + dl(at(st, 0.5)) + '>' + T(sx, Y(totRow), ',', 'ar-tot ch-comma comma-hop', ' style="--dx:' + f1(cx - sx) + 'px;animation-delay:' + at(st, 0.9).toFixed(2) + 's"') + '</g>';
        } else fg += T(cx, Y(totRow), ',', 'ar-tot ch-comma');
      }
    });
    return '<svg class="fig fig-armada" width="' + Math.round(W * ZOOM) + '" height="' + Math.round(H * ZOOM) + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Conta armada: ' + P.top.txt + ' vezes ' + P.bot.txt + '">' + bg + fg + '</svg>';
  }
  var casas = function (n) { return n + (n > 1 ? ' casas' : ' casa'); };
  var ordCasa = ['unidades', 'dezenas', 'centenas', 'milhares'];
  function armadaTexts(P) {
    var t = {};
    t.setup = 'Armamos a conta: o <b>' + P.top.txt + '</b> em cima e o <b>' + P.bot.txt + '</b> embaixo, um embaixo do outro, alinhados pela direita.' +
      (P.dec ? ' Fazemos a conta <b>como se não tivesse vírgula</b>; no fim a gente coloca a vírgula de volta.' : '');
    P.rows.forEach(function (rw, j) {
      var last = rw.ops.length - 1;
      t['row' + j] = 'Agora o <b>' + rw.dg + '</b> de baixo multiplica cada número de cima, da direita para a esquerda:<div class="calc calc-lines">' +
        rw.ops.map(function (op, i) {
          return '<span>[[' + rw.dg + ' * ' + op.t + (op.cin ? ' + ' + op.cin : '') + ' = ' + op.v + ']] <small>← ' +
            (i < last && op.v >= 10 ? 'escreve ' + op.v % 10 + ' e sobe ' + Math.floor(op.v / 10) : 'escreve ' + op.v) + (op.cin ? ' (o + ' + op.cin + ' é o que subiu)' : '') + '</small></span>';
        }).join('') + '</div>' +
        (j > 0 ? '<p class="aside">Esta linha começa <b>' + casas(j) + ' para a esquerda</b>, porque o ' + rw.dg + ' está na casa das ' + ordCasa[j] + ' (vale ' + rw.dg * pow10(j) + ').</p>' : '');
    });
    if (P.rows.length > 1) t.sum = 'Somamos as linhas, casa por casa, da direita para a esquerda:<div class="calc">[[' + P.rows.map(function (rw) { return rw.val * pow10(rw.j); }).join(' + ') + ' = ' + P.totalInt + ']]</div>';
    if (P.dec) {
      var who = [P.top, P.bot].filter(function (x) { return x.dec; }).map(function (x) { return 'o ' + x.txt + ' tem ' + casas(x.dec) + ' depois da vírgula'; });
      var withComma = P.totStr.slice(0, P.totStr.length - P.dec) + ',' + P.totStr.slice(-P.dec);
      t.comma = 'Agora a vírgula: ' + who.join(' e ') + (who.length > 1 ? ', ao todo ' + casas(P.dec) : '') + '. Então o resultado também tem <b>' + casas(P.dec) + '</b> depois da vírgula. Contando da direita para a esquerda: <b>' + withComma + '</b>' +
        (withComma !== br(P.result) ? ' = <b>' + br(P.result) + '</b>' : '') + '.';
    }
    return t;
  }
  // Conta armada em várias etapas (uma por linha). Devolve { steps, value, text }.
  C.armadaSteps = function (a, b, title) {
    var P = armadaPlan(a, b), tx = armadaTexts(P);
    var titles = { setup: title || 'Armando a conta', sum: 'Somando as linhas', comma: 'Colocando a vírgula' };
    var steps = P.stages.map(function (st, k) {
      var tt = titles[st] || ('Multiplicando pelo ' + P.rows[+st.slice(3)].dg);
      return { t: tt, b: tx[st], fig: armadaSVG(P, k, false) };
    });
    return { steps: steps, value: P.result, text: br(P.result) };
  };
  // Conta armada inteira numa figura só (tudo anima em sequência). Para contas de apoio.
  C.armadaBox = function (a, b) {
    var P = armadaPlan(a, b);
    return '<div class="armada-box"><div class="armada-cap">Na conta armada:</div>' + fig(armadaSVG(P, P.stages.length - 1, true)) + '</div>';
  };
  // Como fazer a × b na mão (inteiros): conta armada; se os dois juntos terminam com 2 zeros ou mais,
  // arma a conta sem os zeros e junta os zeros no fim. Devolve '' quando é conta de cabeça (tabuada).
  C.howTimes = function (a, b) {
    if (!C.needsArmada(a, b)) return '';
    var z = 0, ca = a, cb = b;
    if (Number.isInteger(a) && Number.isInteger(b)) {
      while (ca % 10 === 0 && ca > 0) { ca /= 10; z++; }
      while (cb % 10 === 0 && cb > 0) { cb /= 10; z++; }
    }
    if (z < 2) return C.armadaBox(a, b);
    return '<div class="armada-cap">Sem os zeros: [[' + ca + ' * ' + cb + ' = ' + ca * cb + ']]. Depois colocamos no fim os <b>' + z + ' zeros</b>: ' + br(a * b) + '.</div>' + C.armadaBox(ca, cb);
  };
  // Multiplicação explicada: a conta numa linha e, se precisar, a conta armada logo abaixo.
  C.timesBlock = function (a, b) {
    return '<div class="calc">[[' + br(a) + ' * ' + br(b) + ' = ' + br(Math.round(a * b * 1e6) / 1e6) + ']]</div>' + C.howTimes(a, b);
  };

  /* ================= Chuveirinho (distributiva) ================= */
  var SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  function tTxt(c, e, signed) {
    var a = Math.abs(c), body = (e > 0 && a === 1 ? '' : String(a)) + (e > 0 ? 'x' + (e > 1 ? SUP[e] : '') : '');
    return signed ? (c < 0 ? '− ' : '+ ') + body : (c < 0 ? '−' : '') + body;
  }
  function tMath(c, e) {
    var a = Math.abs(c);
    return (c < 0 ? '-' : '') + (e > 0 && a === 1 ? '' : a) + (e > 0 ? 'x' + (e > 1 ? '^' + e : '') : '');
  }
  var parM = function (t) { return t[0] < 0 ? '(' + tMath(t[0], t[1]) + ')' : tMath(t[0], t[1]); };
  var parT = function (t) { return t[0] < 0 ? '(' + tTxt(t[0], t[1]) + ')' : tTxt(t[0], t[1]); };
  var tw = function (s) { return s.replace(/ /g, '').length * 11 + 14; };
  // Figura: (A)·(B) com fichas; arco do termo i de A até o termo j de B; embaixo a multiplicação e a conta acumulando.
  // cur = [i, j] (ou null na visão geral, com todos os arcos); prods = resultados até agora (o último é o novo).
  function chuvFig(A, B, cur, prods) {
    var row = 84, s = '', bg = '';
    var items = [{ k: 'p', t: '(' }];
    A.forEach(function (t, i) { items.push({ k: 'a', i: i, t: tTxt(t[0], t[1], i > 0) }); });
    items.push({ k: 'p', t: ')' }, { k: 'dot', t: '·' }, { k: 'p', t: '(' });
    B.forEach(function (t, j) { items.push({ k: 'b', i: j, t: tTxt(t[0], t[1], j > 0) }); });
    items.push({ k: 'p', t: ')' });
    var wOf = function (it) { return it.k === 'p' ? 10 : it.k === 'dot' ? 18 : tw(it.t); };
    var total = items.reduce(function (acc, it) { return acc + wOf(it) + 3; }, 0);
    // largura do desenho do tamanho do conteúdo (assim ele aparece grande no celular)
    var sumW = tw('A · B =') + prods.reduce(function (acc, t, i) { return acc + tw(tTxt(t[0], t[1], i > 0)) + 2; }, 0);
    var W = Math.round(Math.max(230, total + 24, sumW + 24)), x = (W - total) / 2;
    var pos = { a: [], b: [] };
    items.forEach(function (it) {
      var w = wOf(it), cx = x + w / 2;
      if (it.k === 'a' || it.k === 'b') {
        var on = cur && ((it.k === 'a' && it.i === cur[0]) || (it.k === 'b' && it.i === cur[1]));
        s += '<g class="chv-chip chv-' + it.k + (on ? ' on' : '') + '"><rect x="' + f1(x) + '" y="' + (row - 21) + '" width="' + w + '" height="30" rx="9"/><text x="' + f1(cx) + '" y="' + row + '">' + it.t + '</text></g>';
        pos[it.k][it.i] = cx;
      } else s += '<text class="chv-op" x="' + f1(cx) + '" y="' + row + '">' + it.t + '</text>';
      x += w + 3;
    });
    var arc = function (i, j, delay, cls) {
      var x1 = pos.a[i], x2 = pos.b[j], y = row - 24, h = Math.min(58, 26 + Math.abs(x2 - x1) * 0.2), cxp = (x1 + x2) / 2, cyp = y - h;
      var ang = Math.atan2(y - cyp, x2 - cxp), hx = x2, hy = y;
      var p1 = [hx - 9 * Math.cos(ang - 0.45), hy - 9 * Math.sin(ang - 0.45)], p2 = [hx - 9 * Math.cos(ang + 0.45), hy - 9 * Math.sin(ang + 0.45)];
      return '<path class="chv-arc ' + cls + ' anim-draw" pathLength="1"' + dl(delay) + ' d="M' + f1(x1) + ' ' + y + ' Q' + f1(cxp) + ' ' + f1(cyp) + ' ' + f1(x2) + ' ' + y + '"/>' +
        '<path class="chv-head ' + cls + ' anim-fade"' + dl(delay + 0.7) + ' d="M' + f1(p1[0]) + ' ' + f1(p1[1]) + ' L' + f1(hx) + ' ' + hy + ' L' + f1(p2[0]) + ' ' + f1(p2[1]) + '"/>';
    };
    if (!cur) {
      var n = 0;
      A.forEach(function (ta, i) { B.forEach(function (tb, j) { s += arc(i, j, 0.3 + n * 0.7, 'chv-arc' + i); n++; }); });
      return '<svg class="fig fig-chuv" viewBox="0 0 ' + W + ' 100" role="img" aria-label="Chuveirinho: cada termo do primeiro parêntese multiplica cada termo do segundo">' + s + '</svg>';
    }
    var ta = A[cur[0]], tb = B[cur[1]], res = prods[prods.length - 1];
    s += arc(cur[0], cur[1], 0.2, 'chv-arc' + cur[0]);
    // meio: termo × termo = resultado
    var my = 138, sA = parT(ta), sB = parT(tb), sR = tTxt(res[0], res[1]);
    var wA = tw(sA), wB = tw(sB), wR = tw(sR), mw = wA + 18 + wB + 18 + wR, mx = (W - mw) / 2;
    var cA = mx + wA / 2, cD = mx + wA + 9, cB = mx + wA + 18 + wB / 2, cE = mx + wA + 18 + wB + 9, cR = mx + wA + 18 + wB + 18 + wR / 2;
    s += '<text class="chv-t chv-ta anim-fly" x="' + f1(cA) + '" y="' + my + '" style="--dx:' + f1(pos.a[cur[0]] - cA) + 'px;--dy:' + (row - my) + 'px;animation-delay:1s">' + sA + '</text>';
    s += '<text class="chv-t chv-tb anim-fly" x="' + f1(cB) + '" y="' + my + '" style="--dx:' + f1(pos.b[cur[1]] - cB) + 'px;--dy:' + (row - my) + 'px;animation-delay:1.3s">' + sB + '</text>';
    s += '<text class="chv-t anim-fade" x="' + f1(cD) + '" y="' + my + '"' + dl(2.1) + '>·</text>';
    s += '<text class="chv-t anim-fade" x="' + f1(cE) + '" y="' + my + '"' + dl(2.4) + '>=</text>';
    bg += '<rect class="chv-res-bg anim-pop" x="' + f1(cR - wR / 2 - 2) + '" y="' + (my - 22) + '" width="' + (wR + 4) + '" height="30" rx="9"' + dl(2.7) + '/>';
    s += '<text class="chv-t chv-res anim-pop" x="' + f1(cR) + '" y="' + my + '"' + dl(2.7) + '>' + sR + '</text>';
    // embaixo: a conta, com os resultados acumulando
    var by = 192, lbl = 'A · B =', parts = prods.map(function (t, i) { return tTxt(t[0], t[1], i > 0); });
    var bx = Math.max(6, (W - sumW) / 2);
    s += '<text class="chv-lbl" x="' + f1(bx + tw(lbl) / 2) + '" y="' + by + '">' + lbl + '</text>';
    var px = bx + tw(lbl);
    parts.forEach(function (p, i) {
      var w = tw(p), cxp = px + w / 2, isNew = i === parts.length - 1;
      s += '<text class="chv-t chv-sum' + (isNew ? ' chv-new anim-fly' : '') + '" x="' + f1(cxp) + '" y="' + by + '"' +
        (isNew ? ' style="--dx:' + f1(cR - cxp) + 'px;--dy:' + (my - by) + 'px;animation-delay:3.3s"' : '') + '>' + p + '</text>';
      px += w + 2;
    });
    return '<svg class="fig fig-chuv" viewBox="0 0 ' + W + ' 206" role="img" aria-label="Chuveirinho: ' + sA + ' vezes ' + sB + ' dá ' + sR + '">' + bg + s + '</svg>';
  }
  // Etapas de A · B pelo chuveirinho. A e B = [[coeficiente, expoente], ...].
  C.polyMulSteps = function (A, B) {
    var PA = L.polyFromTerms(A), PB = L.polyFromTerms(B), prod = L.pMul(PA, PB);
    var Am = A.map(function (t, i) { return (i && t[0] > 0 ? ' + ' : i ? ' ' : '') + tMath(t[0], t[1]).replace(/^-/, i ? '- ' : '-'); }).join('');
    var Bm = B.map(function (t, i) { return (i && t[0] > 0 ? ' + ' : i ? ' ' : '') + tMath(t[0], t[1]).replace(/^-/, i ? '- ' : '-'); }).join('');
    var N = A.length * B.length, steps = [], prods = [];
    steps.push({
      t: 'O que é o chuveirinho?', cls: 'concept',
      b: 'Para multiplicar [[(' + Am + ')(' + Bm + ')]], <b>cada termo</b> do primeiro parêntese multiplica <b>cada termo</b> do segundo. Os arcos parecem a água saindo de um chuveiro: por isso o nome <b>chuveirinho</b>. São [[' + A.length + ' * ' + B.length + ' = ' + N + ']] multiplicações, uma de cada vez.',
      fig: chuvFig(A, B, null, [])
    });
    var k = 0;
    A.forEach(function (ta, i) {
      B.forEach(function (tb, j) {
        k++;
        var c = ta[0] * tb[0], e = ta[1] + tb[1];
        prods.push([c, e]);
        var why = [];
        why.push('Os números: [[' + (ta[0] < 0 ? '(' + ta[0] + ')' : ta[0]) + ' * ' + (tb[0] < 0 ? '(' + tb[0] + ')' : tb[0]) + ' = ' + c + ']]' + (Math.abs(c) === 1 && e > 0 ? ' (o 1 não precisa ser escrito)' : '') + '.');
        if (ta[1] > 0 && tb[1] > 0) why.push('As letras: [[x^' + ta[1] + ' * x^' + tb[1] + ' = x^{' + ta[1] + ' + ' + tb[1] + '} = x^' + e + ']]. Na multiplicação, os expoentes <b>somam</b>' + (ta[1] === 1 || tb[1] === 1 ? ' (o [[x]] sozinho é [[x^1]])' : '') + '.');
        else if (e > 0) why.push('O [[' + tMath(1, e) + ']] continua igual.');
        steps.push({
          t: 'Chuveirinho ' + k + ' de ' + N + ': ' + parT(ta) + ' · ' + parT(tb),
          b: 'O <b>[[' + tMath(ta[0], ta[1]) + ']]</b> vai até o <b>[[' + tMath(tb[0], tb[1]) + ']]</b> e multiplica:<div class="calc">[[' + parM(ta) + ' * ' + parM(tb) + ' = ' + tMath(c, e) + ']]</div>' +
            why.join(' ') + ' O resultado desce para a conta lá embaixo.',
          fig: chuvFig(A, B, [i, j], prods.slice())
        });
      });
    });
    // juntar semelhantes
    var byE = {};
    prods.forEach(function (t) { (byE[t[1]] = byE[t[1]] || []).push(t[0]); });
    var rawM = prods.map(function (t, i) { return (i && t[0] > 0 ? ' + ' : i ? ' ' : '') + tMath(t[0], t[1]).replace(/^-/, i ? '- ' : '-'); }).join('');
    var combos = Object.keys(byE).filter(function (ex) { return byE[ex].length > 1; }).sort(function (a, b) { return b - a; }).map(function (ex) {
      var cs = byE[ex], tot = cs.reduce(function (s, v) { return s + v; }, 0);
      var lhs = cs.map(function (cc, i) { return (i && cc > 0 ? ' + ' : i ? ' ' : '') + tMath(cc, +ex).replace(/^-/, i ? '- ' : '-'); }).join('');
      return '<span>[[' + lhs + ' = ' + (tot === 0 ? '0' : tMath(tot, +ex)) + ']] <small>← ' + (tot === 0 ? 'um cancela o outro' : 'somamos os números da frente: [[' + cs.join(' + ').replace(/\+ -/g, '- ') + ' = ' + tot + ']]') + '</small></span>';
    });
    steps.push({
      t: 'Juntando os termos parecidos',
      b: 'A conta ficou assim:<div class="calc">[[' + rawM + ']]</div>' +
        (combos.length ? 'Termos com a <b>mesma letra e o mesmo expoente</b> se juntam:<div class="calc calc-lines">' + combos.join('') + '</div>' : 'Não tem termos parecidos para juntar.') +
        'Então:<div class="calc">[[A * B = ' + L.polyToMath(prod) + ']]</div>'
    });
    return { list: steps, prod: prod };
  };

  window.GM_CONTAS = C;
})();
