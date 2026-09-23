/* =====================================================================
   GAITERO MATH — Lógica pura (sem DOM): desenho de matemática, leitura de
   números e expressões (sem eval), validação das respostas.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- Desenho da matemática: "[[x^2 + √3]]" → HTML ---------- */

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  var RAD_SVG = '<svg class="m-rs" viewBox="0 0 10 20" preserveAspectRatio="none" aria-hidden="true"><path d="M0.4 11.6 L2.9 10.1 L5.7 19.3 L9.7 0.7 L10 0.7"/></svg>';
  function radical(body, idx) {
    return '<span class="m-rad' + (idx ? ' has-idx' : '') + '">' + (idx ? '<span class="m-idx">' + idx + '</span>' : '') + RAD_SVG + '<span class="m-bar">' + body + '</span></span>';
  }
  function frac(a, b) {
    return '<span class="m-frac"><span class="m-num">' + a + '</span><span class="m-den">' + b + '</span></span>';
  }
  function mathHTML(s) {
    var i = 0;
    function arg() {
      if (s[i] === '{') { i++; return seq('}'); }
      var m = /^[0-9]+([.,][0-9]+)?/.exec(s.slice(i));
      if (m) { i += m[0].length; return m[0]; }
      var c = s[i++];
      if (c === 'x') return '<i class="m-x">x</i>';
      if (c === '-') return '−';
      return esc(c);
    }
    function seq(stop) {
      var out = '';
      while (i < s.length) {
        var c = s[i];
        if (stop && c === stop) { i++; return out; }
        if (c === '^') { i++; out += '<sup>' + arg() + '</sup>'; continue; }
        if (c === '_') { i++; out += '<sub>' + arg() + '</sub>'; continue; }
        if (c === '√') { i++; out += radical(arg()); continue; }
        if (s.startsWith('R{', i)) { i += 2; var idx = seq('}'); out += radical(arg(), idx); continue; }
        if (s.startsWith('frac{', i)) { i += 5; var a = seq('}'); out += frac(a, arg()); continue; }
        if (c === '<') { var j = s.indexOf('>', i); out += s.slice(i, j + 1); i = j + 1; continue; }
        if (c === '&') { var ent = /^&[a-z#0-9]+;/i.exec(s.slice(i)); if (ent) { out += ent[0]; i += ent[0].length; continue; } }
        if (c === '-') { out += '−'; i++; continue; }
        if (c === '*') { out += '·'; i++; continue; }
        if (c === 'x') { out += '<i class="m-x">x</i>'; i++; continue; }
        out += esc(c); i++;
      }
      return out;
    }
    return '<span class="m">' + seq(null) + '</span>';
  }
  function fmt(text) {
    if (text == null) return '';
    return String(text).replace(/\[\[([\s\S]+?)\]\]/g, function (_, m) { return mathHTML(m); });
  }

  /* ---------- Números em português ---------- */

  // Formata no padrão brasileiro. Sem "dec": até 4 casas, sem zeros sobrando.
  function brNum(n, dec) {
    var auto = dec === undefined;
    if (auto) dec = Number.isInteger(n) ? 0 : 4;
    var s = Math.abs(n).toFixed(dec);
    var parts = s.split('.');
    var intp = parts[0].length > 4 ? parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') : parts[0];
    var d = parts[1] || '';
    if (auto) d = d.replace(/0+$/, '');
    var neg = n < 0 && (Number(intp.replace(/\./g, '')) > 0 || Number(d) > 0);
    return (neg ? '-' : '') + intp + (d ? ',' + d : '');
  }
  function brMoney(n) {
    var parts = Math.abs(n).toFixed(2).split('.');
    return 'R$ ' + (n < 0 ? '-' : '') + parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + parts[1];
  }

  // Lê "8.400", "62,5", "R$ 54.000,00", "54 mil", "335/29", "x = 3"...
  // Devolve uma lista de leituras possíveis (ex.: "8.400" pode ser 8400 ou 8,4) ou null.
  function numberCandidates(str) {
    var s = String(str == null ? '' : str).trim().toLowerCase();
    if (!s) return null;
    s = s.replace(/[−–—]/g, '-');
    s = s.replace(/^[a-z]\s*[₁₂12]?\s*=\s*/, '');
    s = s.replace(/r\$/g, '').replace(/reais|real/g, '').replace(/cm²|cm2|cm\^2|cm³|cm3|m²|cm|mm|anos|ano|%|lajotas?|divisores/g, '');
    s = s.replace(/\s+/g, '');
    if (s[0] === '+') s = s.slice(1);
    var mult = 1;
    if (/mil$/.test(s)) { mult = 1000; s = s.slice(0, -3); }
    if (!s) return null;
    var m = /^(-?\d+(?:[.,]\d+)?)\/(-?\d+(?:[.,]\d+)?)$/.exec(s);
    if (m) {
      var a = parseFloat(m[1].replace(',', '.')), b = parseFloat(m[2].replace(',', '.'));
      return b ? [a / b * mult] : null;
    }
    if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) {
      var out = [parseFloat(s.replace(/\./g, '').replace(',', '.')) * mult];
      if (/^-?\d{1,3}\.\d{3}$/.test(s)) out.push(parseFloat(s) * mult);
      return out;
    }
    if (/^-?\d{1,3}(,\d{3})+\.\d+$/.test(s)) return [parseFloat(s.replace(/,/g, '')) * mult];
    if (/^-?(\d+([.,]\d+)?|[.,]\d+)$/.test(s)) return [parseFloat(s.replace(',', '.')) * mult];
    return null;
  }
  function close(a, b, tol) { return Math.abs(a - b) <= (tol || 1e-6); }

  /* ---------- Expressões: leitura (sem eval) ---------- */

  function ParseError(msg) { this.message = msg; }
  var SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };

  function normalizeExpr(str) {
    var s = String(str).toLowerCase();
    s = s.replace(/[−–—]/g, '-').replace(/[×·⋅∙]/g, '*').replace(/÷/g, '/');
    s = s.replace(/raiz|sqrt|rq/g, '√');
    s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, function (m) { return '^' + m.split('').map(function (c) { return SUP[c]; }).join(''); });
    s = s.replace(/[\[{]/g, '(').replace(/[\]}]/g, ')');
    return s.replace(/\s+/g, '');
  }
  function tokenize(s) {
    var t = [], i = 0;
    while (i < s.length) {
      var c = s[i];
      if (/[0-9.,]/.test(c)) {
        var j = i;
        while (j < s.length && /[0-9.,]/.test(s[j])) j++;
        var raw = s.slice(i, j).replace(',', '.');
        if (!/^(\d+\.?\d*|\.\d+)$/.test(raw)) throw new ParseError('Número mal escrito: ' + s.slice(i, j));
        t.push({ k: 'num', v: parseFloat(raw) }); i = j; continue;
      }
      if (c === 'x') { t.push({ k: 'x' }); i++; continue; }
      if ('+-*/^()'.indexOf(c) >= 0) { t.push({ k: c }); i++; continue; }
      if (c === '√') { t.push({ k: 'sqrt' }); i++; continue; }
      throw new ParseError('Não reconheci o símbolo "' + c + '"');
    }
    return t;
  }
  function parseExpr(str) {
    var tokens = tokenize(normalizeExpr(str)), p = 0;
    if (!tokens.length) throw new ParseError('Vazio');
    function peek() { return tokens[p]; }
    function next() { return tokens[p++]; }
    function expr() {
      var n = term();
      while (peek() && (peek().k === '+' || peek().k === '-')) {
        var op = next().k; n = { t: op === '+' ? 'add' : 'sub', a: n, b: term() };
      }
      return n;
    }
    function term() {
      var n = unary();
      for (;;) {
        var tk = peek();
        if (!tk) break;
        if (tk.k === '*' || tk.k === '/') { next(); n = { t: tk.k === '*' ? 'mul' : 'div', a: n, b: unary() }; }
        else if (tk.k === 'num' || tk.k === 'x' || tk.k === 'sqrt' || tk.k === '(') { n = { t: 'mul', a: n, b: power(), imp: true }; }
        else break;
      }
      return n;
    }
    function unary() {
      var tk = peek();
      if (tk && (tk.k === '-' || tk.k === '+')) { next(); var a = unary(); return tk.k === '-' ? { t: 'neg', a: a } : a; }
      return power();
    }
    function power() {
      var b = atom();
      if (peek() && peek().k === '^') { next(); return { t: 'pow', a: b, b: unary() }; }
      return b;
    }
    function atom() {
      var tk = next();
      if (!tk) throw new ParseError('A expressão terminou no meio');
      if (tk.k === 'num') return { t: 'num', v: tk.v };
      if (tk.k === 'x') return { t: 'x' };
      if (tk.k === 'sqrt') return { t: 'sqrt', a: atom() };
      if (tk.k === '(') {
        var e = expr();
        if (!peek() || peek().k !== ')') throw new ParseError('Faltou fechar um parêntese');
        next(); return { t: 'grp', a: e };
      }
      throw new ParseError('Sobrou um "' + tk.k + '" fora do lugar');
    }
    var tree = expr();
    if (p < tokens.length) throw new ParseError('Sobrou algo no fim da expressão');
    return tree;
  }
  function hasNode(n, type) {
    if (!n || typeof n !== 'object') return false;
    if (n.t === type) return true;
    return hasNode(n.a, type) || hasNode(n.b, type);
  }
  function evalNum(n) {
    switch (n.t) {
      case 'num': return n.v;
      case 'x': return NaN;
      case 'add': return evalNum(n.a) + evalNum(n.b);
      case 'sub': return evalNum(n.a) - evalNum(n.b);
      case 'mul': return evalNum(n.a) * evalNum(n.b);
      case 'div': return evalNum(n.a) / evalNum(n.b);
      case 'neg': return -evalNum(n.a);
      case 'pow': return Math.pow(evalNum(n.a), evalNum(n.b));
      case 'sqrt': var v = evalNum(n.a); return v < 0 ? NaN : Math.sqrt(v);
      case 'grp': return evalNum(n.a);
    }
    return NaN;
  }

  /* ---------- Polinômios: { expoente: coeficiente } ---------- */

  function pClean(p) { var o = {}; Object.keys(p).forEach(function (k) { if (Math.abs(p[k]) > 1e-12) o[k] = p[k]; }); return o; }
  function pAdd(a, b, s) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in b) o[k] = (o[k] || 0) + s * b[k]; return pClean(o); }
  function pMul(a, b) { var o = {}; for (var i in a) for (var j in b) { var d = +i + +j; o[d] = (o[d] || 0) + a[i] * b[j]; } return pClean(o); }
  function pConst(p) { var ks = Object.keys(p); return ks.length === 0 ? 0 : (ks.length === 1 && ks[0] === '0' ? p[0] : null); }
  function evalPoly(n) {
    switch (n.t) {
      case 'num': return pClean({ 0: n.v });
      case 'x': return { 1: 1 };
      case 'add': return pAdd(evalPoly(n.a), evalPoly(n.b), 1);
      case 'sub': return pAdd(evalPoly(n.a), evalPoly(n.b), -1);
      case 'mul': return pMul(evalPoly(n.a), evalPoly(n.b));
      case 'neg': return pAdd({}, evalPoly(n.a), -1);
      case 'grp': return evalPoly(n.a);
      case 'div':
        var d = pConst(evalPoly(n.b));
        if (d === null || d === 0) throw new ParseError('Divisão que não dá para simplificar');
        return pMul(evalPoly(n.a), { 0: 1 / d });
      case 'pow':
        var e = pConst(evalPoly(n.b));
        if (e === null || e < 0 || e > 12 || !Number.isInteger(e)) throw new ParseError('Expoente precisa ser um número inteiro');
        var base = evalPoly(n.a), r = { 0: 1 };
        for (var i = 0; i < e; i++) r = pMul(r, base);
        return r;
      case 'sqrt':
        var c = pConst(evalPoly(n.a));
        if (c === null || c < 0) throw new ParseError('Raiz de expressão com x');
        return pClean({ 0: Math.sqrt(c) });
    }
    throw new ParseError('Expressão inválida');
  }
  function polyEqual(a, b) {
    var keys = {}, k;
    for (k in a) keys[k] = 1;
    for (k in b) keys[k] = 1;
    for (k in keys) if (Math.abs((a[k] || 0) - (b[k] || 0)) > 1e-9) return false;
    return true;
  }
  // Forma simplificada: soma de monômios (número · x^k), sem parênteses e sem expoentes repetidos.
  function isSimplified(ast) {
    var terms = [];
    (function flat(n) {
      if (n.t === 'add' || n.t === 'sub') { flat(n.a); flat(n.b); }
      else terms.push(n);
    })(ast);
    var seen = {};
    for (var i = 0; i < terms.length; i++) {
      var nums = 0, xs = 0, ok = true;
      (function walk(m) {
        if (m.t === 'neg') walk(m.a);
        else if (m.t === 'mul') { walk(m.a); walk(m.b); }
        else if (m.t === 'num') nums++;
        else if (m.t === 'x') xs++;
        else if (m.t === 'pow' && m.a.t === 'x' && m.b.t === 'num') xs++;
        else ok = false;
      })(terms[i]);
      if (!ok || nums > 1 || xs > 1) return false;
      var p = evalPoly(terms[i]), ks = Object.keys(p);
      if (ks.length === 0) { if (terms.length > 1) return false; continue; }
      if (seen[ks[0]]) return false;
      seen[ks[0]] = 1;
    }
    return true;
  }
  // Polinômio → texto para [[ ]] (ex.: "x^3 + 4x^2 - 3x")
  function polyToMath(p) {
    var ks = Object.keys(p).map(Number).sort(function (a, b) { return b - a; });
    if (!ks.length) return '0';
    return ks.map(function (e, i) {
      var c = p[e], abs = Math.abs(c), s = '';
      if (i === 0) s = c < 0 ? '-' : ''; else s = c < 0 ? ' - ' : ' + ';
      var cs = e === 0 ? brNum(abs) : (abs === 1 ? '' : brNum(abs));
      return s + cs + (e === 0 ? '' : 'x' + (e > 1 ? '^' + e : ''));
    }).join('');
  }
  function polyFromTerms(terms) { var o = {}; terms.forEach(function (t) { o[t[1]] = (o[t[1]] || 0) + t[0]; }); return pClean(o); }
  function degree(p) { var ks = Object.keys(p).map(Number); return ks.length ? Math.max.apply(null, ks) : 0; }

  // AST → HTML legível ("Entendi assim: ...")
  function astToHTML(n) {
    function w(m, parentPrec) {
      var prec = { add: 1, sub: 1, neg: 2, mul: 3, div: 3, pow: 4 }[m.t] || 5;
      var out;
      switch (m.t) {
        case 'num': out = brNum(m.v, Number.isInteger(m.v) ? 0 : undefined); break;
        case 'x': out = '<i class="m-x">x</i>'; break;
        case 'add': out = w(m.a, 1) + ' + ' + w(m.b, 1.5); break;
        case 'sub': out = w(m.a, 1) + ' − ' + w(m.b, 1.5); break;
        case 'neg': out = '−' + w(m.a, 2); break;
        case 'mul':
          var implicit = m.imp && m.b.t !== 'num';
          out = w(m.a, 3) + (implicit ? '' : ' · ') + w(m.b, 3.5); break;
        case 'div': out = w(m.a, 3) + ' ÷ ' + w(m.b, 3.5); break;
        case 'pow': out = w(m.a, 4.5) + '<sup>' + w(m.b, 0) + '</sup>'; break;
        case 'sqrt': out = radical(w(m.a, 5)); break;
        case 'grp': out = '(' + w(m.a, 0) + ')'; break;
      }
      return prec < parentPrec && m.t !== 'grp' ? '(' + out + ')' : out;
    }
    try { return '<span class="m">' + w(n, 0) + '</span>'; } catch (e) { return ''; }
  }

  /* ---------- Validação ---------- */
  // Resultado: { status: 'correct' | 'wrong' | 'empty' | 'invalid', message?, hint?, preview? }

  function numHint(item, cands) {
    var hs = item.hints || [];
    for (var i = 0; i < hs.length; i++) {
      var h = hs[i];
      if (typeof h.when === 'function') { if (h.when(cands[0])) return h.msg; continue; }
      if (typeof h.when === 'number' && cands.some(function (v) { return close(v, h.when, h.tol || 1e-6); })) return h.msg;
    }
    return null;
  }
  function listHint(item, vals) {
    var hs = item.hints || [];
    var sorted = vals.slice().sort(function (a, b) { return a - b; });
    for (var i = 0; i < hs.length; i++) {
      var h = hs[i];
      if (typeof h.when === 'function') { if (h.when(vals)) return h.msg; continue; }
      if (Array.isArray(h.when)) {
        var w = h.when.slice().sort(function (a, b) { return a - b; });
        if (w.length === sorted.length && w.every(function (v, j) { return close(v, sorted[j]); })) return h.msg;
      }
    }
    return null;
  }

  var V = {};
  function numeric(item, input) {
    var a = item.answer;
    var s = String(input == null ? '' : input).trim();
    if (!s) return { status: 'empty', message: 'Digite sua resposta antes de verificar 😉' };
    var c = numberCandidates(s);
    if (!c) return { status: 'invalid', message: 'Não entendi esse número. Use só algarismos, vírgula e o sinal de menos.' };
    var tol = a.tol || 1e-6;
    if (c.some(function (v) { return close(v, a.value, tol); })) return { status: 'correct' };
    return { status: 'wrong', hint: numHint(item, c) };
  }
  V.integer = V.number = V.percent = V.currency = numeric;

  V.numberList = function (item, input) {
    var a = item.answer, arr = input || [];
    if (arr.length < a.values.length || arr.some(function (s) { return !String(s == null ? '' : s).trim(); })) {
      return { status: 'empty', message: 'Preencha todos os ' + a.values.length + ' campos antes de verificar 😉' };
    }
    var vals = [];
    for (var i = 0; i < arr.length; i++) {
      var c = numberCandidates(arr[i]);
      if (!c) return { status: 'invalid', message: 'Não entendi o que está no campo ' + (i + 1) + '. Use só algarismos, vírgula e o sinal de menos.' };
      vals.push(c[0]);
    }
    var exp = a.values.slice(), got = vals.slice();
    if (!a.ordered) { exp.sort(function (x, y) { return x - y; }); got.sort(function (x, y) { return x - y; }); }
    var ok = exp.every(function (v, j) { return close(v, got[j]); });
    return ok ? { status: 'correct' } : { status: 'wrong', hint: listHint(item, vals) };
  };

  V.textList = function (item, input) {
    var a = item.answer, s = String(input == null ? '' : input).trim();
    if (!s) return { status: 'empty', message: 'Digite os números antes de verificar 😉' };
    var parts = s.replace(/[−–—]/g, '-').replace(/\se\s/gi, ',').split(/[;,\s]+/).filter(Boolean);
    var vals = [];
    for (var i = 0; i < parts.length; i++) {
      if (!/^-?\d+$/.test(parts[i])) return { status: 'invalid', message: 'Use só números inteiros, separados por vírgula ou espaço. "' + parts[i] + '" não deu para ler.' };
      var v = parseInt(parts[i], 10);
      if (vals.indexOf(v) < 0) vals.push(v);
    }
    vals.sort(function (x, y) { return x - y; });
    var sets = [a.values].concat(a.alsoAccept || []);
    var ok = sets.some(function (set) {
      var e = set.slice().sort(function (x, y) { return x - y; });
      return e.length === vals.length && e.every(function (v, j) { return v === vals[j]; });
    });
    return ok ? { status: 'correct' } : { status: 'wrong', hint: listHint(item, vals) };
  };

  V.polynomial = function (item, input) {
    var a = item.answer, s = String(input == null ? '' : input).trim();
    if (!s) return { status: 'empty', message: 'Digite a expressão antes de verificar 😉' };
    var ast, p;
    try { ast = parseExpr(s); p = evalPoly(ast); }
    catch (e) { return { status: 'invalid', message: 'Não consegui ler essa expressão (' + (e.message || 'formato') + '). Exemplo de formato: [[3x^2 - 2x + 1]]' }; }
    var want = pClean(a.coeffs);
    if (polyEqual(p, want)) {
      if (a.simplified && !isSimplified(ast)) return { status: 'invalid', message: 'A conta está equivalente, mas ainda dá para <b>simplificar</b>: junte os termos semelhantes e tire os parênteses.' };
      return { status: 'correct' };
    }
    var hs = item.hints || [], hint = null;
    for (var i = 0; i < hs.length && !hint; i++) {
      var h = hs[i];
      if (typeof h.when === 'function') { if (h.when(p)) hint = h.msg; }
      else if (typeof h.when === 'string') { try { if (polyEqual(p, evalPoly(parseExpr(h.when)))) hint = h.msg; } catch (e) { /* dica mal escrita */ } }
    }
    return { status: 'wrong', hint: hint };
  };

  V.radical = function (item, input) {
    var a = item.answer, s = String(input == null ? '' : input).trim();
    if (!s) return { status: 'empty', message: 'Digite a expressão antes de verificar 😉' };
    var ast;
    try { ast = parseExpr(s); } catch (e) { return { status: 'invalid', message: 'Não consegui ler essa expressão (' + (e.message || 'formato') + '). Exemplo de formato: [[√7 - √5]]' }; }
    if (hasNode(ast, 'x')) return { status: 'invalid', message: 'A resposta não tem [[x]]. Use números e o símbolo √. Exemplo: [[√7 - √5]]' };
    var v = evalNum(ast);
    if (!isFinite(v)) return { status: 'invalid', message: 'Essa expressão não dá um número real. Confira os sinais dentro das raízes.' };
    var ok = Math.abs(v - a.value) <= 1e-9 * Math.max(1, Math.abs(a.value));
    if (!hasNode(ast, 'sqrt')) {
      if (Math.abs(v - a.value) < 0.06) return { status: 'invalid', message: 'Esse é um valor <b>aproximado</b>. Escreva a resposta exata usando o símbolo √.' };
      if (!a.integerOk) return { status: 'wrong', hint: null };
    }
    if (ok) return { status: 'correct' };
    var hs = item.hints || [], hint = null;
    for (var i = 0; i < hs.length && !hint; i++) if (typeof hs[i].when === 'number' && Math.abs(v - hs[i].when) < 1e-9) hint = hs[i].msg;
    return { status: 'wrong', hint: hint };
  };

  V.choice = function (item, input) {
    if (!input) return { status: 'empty', message: 'Escolha uma das opções antes de verificar 😉' };
    if (input === item.answer.correct) return { status: 'correct' };
    var opt = item.answer.options.filter(function (o) { return o.id === input; })[0];
    return { status: 'wrong', hint: opt && opt.hint };
  };

  V.multiSelect = function (item, input) {
    var sel = new Set(input || []);
    if (!sel.size) return { status: 'empty', message: 'Marque pelo menos uma opção antes de verificar 😉' };
    var want = item.answer.correct;
    var ok = want.length === sel.size && want.every(function (id) { return sel.has(id); });
    if (ok) return { status: 'correct' };
    var hs = item.hints || [], hint = null;
    for (var i = 0; i < hs.length && !hint; i++) if (hs[i].when(sel)) hint = hs[i].msg;
    return { status: 'wrong', hint: hint };
  };

  function validate(item, input) {
    var fn = V[item.answer.type];
    if (!fn) return { status: 'invalid', message: 'Tipo de resposta desconhecido.' };
    return fn(item, input);
  }

  // Leitura amigável da expressão digitada (para mostrar "Entendi assim: ...")
  function previewExpr(input) {
    var s = String(input == null ? '' : input).trim();
    if (!s) return '';
    try { return astToHTML(parseExpr(s)); } catch (e) { return null; }
  }

  // Resposta "de gabarito" em texto, usada pelos testes automáticos.
  function canonicalInput(item) {
    var a = item.answer;
    switch (a.type) {
      case 'integer': case 'number': case 'percent': case 'currency': return brNum(a.value, Number.isInteger(a.value) ? 0 : 4);
      case 'numberList': return a.values.map(function (v) { return brNum(v); }).reverse();
      case 'textList': return a.values.join(', ');
      case 'polynomial': return polyToMath(a.coeffs).replace(/\s+/g, '');
      case 'radical': return a.canonical;
      case 'choice': return a.correct;
      case 'multiSelect': return a.correct.slice();
    }
    return null;
  }

  window.GM_LOGIC = {
    fmt: fmt, mathHTML: mathHTML, esc: esc, brNum: brNum, brMoney: brMoney,
    numberCandidates: numberCandidates, parseExpr: parseExpr, evalNum: evalNum, evalPoly: evalPoly,
    polyEqual: polyEqual, isSimplified: isSimplified, polyToMath: polyToMath, polyFromTerms: polyFromTerms,
    degree: degree, pMul: pMul, pAdd: pAdd, validate: validate, previewExpr: previewExpr, canonicalInput: canonicalInput
  };
})();
