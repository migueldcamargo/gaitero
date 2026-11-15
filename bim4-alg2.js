/* =====================================================================
   GAITERO MATH — 4º Bimestre · ÁLGEBRA (parte 2) e montagem da prova
   Aulas 134 (polinômios), 135, 136 e 137 (racionalização de denominadores).
   ===================================================================== */
(function () {
  'use strict';
  var B4 = window.GM_B4, H = B4.H, CT = B4.CT, L = B4.L;
  var br = H.br, m = H.m, calc = H.calc, lines = H.lines, small = H.small, aside = H.aside, hl = H.hl;
  var G = B4.G;
  var SUPS = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  var sup = function (n) { return String(n).split('').map(function (d) { return SUPS[+d]; }).join(''); };

  /* ================= Aula 134 — polinômios ================= */
  // polinômio = lista de termos [coef, expoente], na ordem em que aparecem
  var P2poly = function (A) { return L.polyFromTerms(A); };
  var toTerms = function (P) { return Object.keys(P).map(Number).sort(function (a, b) { return b - a; }).map(function (e) { return [P[e], e]; }); };
  function tm(c, e) { var a = Math.abs(c); return (e > 0 && a === 1 ? '' : br(a)) + (e > 0 ? 'x' + (e > 1 ? '^' + e : '') : ''); }
  // texto [[ ]] de uma lista de termos; color = pinta cada termo pela cor do expoente
  function pTxt(A, color) {
    if (!A.length) return '0';
    return A.map(function (t, i) {
      var s = i === 0 ? (t[0] < 0 ? '-' : '') : (t[0] < 0 ? ' - ' : ' + ');
      var body = tm(t[0], t[1]);
      return s + (color ? '<b class="dg dg' + Math.min(t[1], 4) + '">' + body + '</b>' : body);
    }).join('');
  }
  var DEG_NAME = ['número sozinho', 'termo em x', 'termo em x²', 'termo em x³', 'termo em x⁴'];
  // juntar semelhantes, uma linha por expoente
  function combineLines(A) {
    var by = {};
    A.forEach(function (t) { (by[t[1]] = by[t[1]] || []).push(t[0]); });
    return Object.keys(by).map(Number).sort(function (a, b) { return b - a; }).map(function (e) {
      var cs = by[e], tot = H.sum(cs);
      var lhs = cs.map(function (c, i) { return (i === 0 ? (c < 0 ? '-' : '') : (c < 0 ? ' - ' : ' + ')) + tm(c, e); }).join('');
      var res = tot === 0 ? '0' : (tot < 0 ? '-' : '') + tm(tot, e);
      return '<span>[[<b class="dg dg' + Math.min(e, 4) + '">' + lhs + '</b> = ' + res + ']]' + (cs.length > 1 ? small(tot === 0 ? 'um cancela o outro' : 'somamos os números da frente: ' + cs.map(function (c, i) { return i ? (c < 0 ? ' − ' : ' + ') + Math.abs(c) : (c < 0 ? '−' + Math.abs(c) : String(c)); }).join('') + ' = ' + (tot < 0 ? '−' + Math.abs(tot) : tot)) : small('não tem par: fica igual')) + '</span>';
    });
  }
  var evalAt = function (P, x) { return Object.keys(P).reduce(function (s, e) { return s + P[e] * Math.pow(x, +e); }, 0); };
  var likeConcept = { t: 'Lembrete: termos semelhantes', cls: 'concept', b: 'Um polinômio é uma soma de <b>termos</b>. Em [[3x^2]], o <b>3</b> é o coeficiente (o número da frente), o [[x]] é a letra e o <b>2</b> é o expoente.<br><b>Termos semelhantes</b> têm a <b>mesma letra com o mesmo expoente</b>. Só eles podem ser juntados: somamos os coeficientes e a parte com letra fica igual. Pense em frutas: 3 maçãs + 2 maçãs = 5 maçãs, mas maçã com banana não junta.<br>Nas contas abaixo, cada <b>cor</b> é um tipo de termo: ' +
    '<b class="dg dg3">x³</b> <b class="dg dg2">x²</b> <b class="dg dg1">x</b> <b class="dg dg0">número</b>. Mesma cor = semelhantes.' };
  function checkX(exprName, value, parts) {
    return 'Testando com [[x = 2]]: ' + parts + ' E na nossa resposta, com [[x = 2]], também dá ' + br(value) + ' ✓.';
  }
  // P, Q, R: listas de termos. names: { P: 'P(x)' ... }
  function polyItems(p) {
    var P = p.P, Q = p.Q, R = p.R, PP = P2poly(P), PQ = P2poly(Q), PR = P2poly(R);
    var nm = function (k) { return k + '(x)'; };
    var def = { P: P, Q: Q, R: R }, poly = { P: PP, Q: PQ, R: PR };
    var at2 = function (k) { return evalAt(poly[k], 2); };
    var items = [];
    // a) P + Q
    var sumT = P.concat(Q), S = L.pAdd(PP, PQ, 1);
    items.push({ key: 'a', op: 'P + Q', res: S, rules: ['semelhantes4', 'poli-soma'],
      tip: 'Escreva tudo junto, sem os parênteses (o sinal de + não muda nada), e junte os <b>termos semelhantes</b>.',
      more: ['Termos semelhantes têm a mesma letra com o mesmo expoente: [[x^2]] com [[x^2]], [[x]] com [[x]], número com número.', 'Some só os coeficientes. O expoente <b>não muda</b> na soma!'],
      hints: [{ when: L.polyToMath(L.pMul(PP, PQ)), msg: 'Isso é a <b>multiplicação</b>. Aqui é uma soma: junte os termos semelhantes.' }],
      steps: [likeConcept,
        { t: 'Montando a soma', b: lines(['[[' + nm('P') + ' + ' + nm('Q') + ' = (' + pTxt(P) + ') + (' + pTxt(Q) + ')]]']) + 'Com o sinal de <b>+</b> na frente do parêntese, podemos tirar os parênteses sem mudar nada:' + calc(m(pTxt(sumT, true))) },
        { t: 'Juntando os semelhantes (mesma cor)', b: lines(combineLines(sumT)) },
        { t: 'Resposta final', cls: 'final', b: m(nm('P') + ' + ' + nm('Q') + ' = ' + L.polyToMath(S)) },
        { t: 'Conferindo se faz sentido', cls: 'check', b: checkX('', evalAt(S, 2), '[[P(2) = ' + at2('P') + ']] e [[Q(2) = ' + at2('Q') + ']]; somando, [[' + at2('P') + ' + ' + H.par(at2('Q')) + ' = ' + (at2('P') + at2('Q')) + ']].') }
      ] });
    // b) Q − R
    var negR = R.map(function (t) { return [-t[0], t[1]]; }), D = L.pAdd(PQ, PR, -1);
    var flipOne = Q.concat([negR[0]]).concat(R.slice(1));
    items.push({ key: 'b', op: 'Q - R', res: D, rules: ['poli-sub', 'semelhantes4'],
      tip: 'Cuidado com o sinal de <b>menos</b> na frente do parêntese do [[R(x)]]: ele troca o sinal de <b>todos</b> os termos de dentro.',
      more: ['Escreva [[R(x)]] com todos os sinais trocados.', 'Depois junte os termos semelhantes, um tipo de cada vez.'],
      hints: [
        { when: L.polyToMath(L.pAdd(PQ, PR, 1)), msg: 'Você <b>somou</b> os polinômios. É uma <b>subtração</b>: o menos troca o sinal de todos os termos do [[R(x)]].' },
        { when: L.polyToMath(P2poly(flipOne)), msg: 'O sinal de menos vale para <b>todos</b> os termos do [[R(x)]], não só para o primeiro.' }
      ],
      steps: [likeConcept,
        { t: 'O menos na frente do parêntese', cls: 'concept', b: 'Subtrair um polinômio é somar o <b>oposto</b> de cada termo. O sinal de menos na frente do parêntese <b>troca o sinal de todos os termos</b> de dentro:' +
            lines(R.map(function (t, i) { return '[[' + (i ? '' : '') + '-(' + (t[0] < 0 ? '-' : '+') + tm(t[0], t[1]) + ') = ' + (t[0] < 0 ? '+' : '-') + tm(t[0], t[1]) + ']]' + small(t[0] < 0 ? 'menos com menos dá mais' : 'menos com mais dá menos'); })) },
        { t: 'Montando a subtração', b: lines(['[[' + nm('Q') + ' - ' + nm('R') + ' = (' + pTxt(Q) + ') - (' + pTxt(R) + ')]]', '[[= ' + pTxt(Q.concat(negR), true) + ']]' + small('o ' + nm('Q') + ' fica igual; o ' + nm('R') + ' troca todos os sinais')]) },
        { t: 'Juntando os semelhantes (mesma cor)', b: lines(combineLines(Q.concat(negR))) },
        { t: 'Resposta final', cls: 'final', b: m(nm('Q') + ' - ' + nm('R') + ' = ' + L.polyToMath(D)) },
        { t: 'Conferindo se faz sentido', cls: 'check', b: checkX('', evalAt(D, 2), '[[Q(2) = ' + at2('Q') + ']] e [[R(2) = ' + at2('R') + ']]; subtraindo, [[' + at2('Q') + ' - ' + H.par(at2('R')) + ' = ' + (at2('Q') - at2('R')) + ']].') }
      ] });
    // c) k·P
    var k = p.k, KP = L.pMul({ 0: k }, PP);
    items.push({ key: 'c', op: k + 'P', res: KP, rules: ['distributiva4'],
      tip: 'O ' + k + ' multiplica <b>cada termo</b> de dentro do parêntese (distributiva).',
      more: ['Faça uma multiplicação para cada termo de [[P(x)]].', 'Na multiplicação por um número, a parte com letra não muda.'],
      hints: [{ when: L.polyToMath(L.pAdd(L.pMul({ 0: k }, P2poly([P[0]])), P2poly(P.slice(1)), 1)), msg: 'O ' + k + ' tem que multiplicar <b>todos</b> os termos, não só o primeiro.' }],
      steps: [
        { t: 'Propriedade distributiva', cls: 'concept', b: 'Quando um número multiplica um parêntese, ele multiplica <b>cada termo</b> de dentro: [[a(b + c) = ab + ac]]. Exemplo: [[2(x + 5) = 2x + 10]].' },
        { t: 'Multiplicando cada termo', b: lines(['[[' + k + nm('P') + ' = ' + k + '(' + pTxt(P) + ')]]'].concat(P.map(function (t) { return '[[' + k + ' * ' + (t[0] < 0 ? '(' + '-' + tm(t[0], t[1]) + ')' : tm(t[0], t[1])) + ' = ' + (k * t[0] < 0 ? '-' : '') + tm(k * t[0], t[1]) + ']]'; }))) },
        { t: 'Tem termos para juntar?', b: 'Depois da distributiva, cada termo continua com um expoente diferente (' + P.map(function (t) { return t[1] === 0 ? 'número' : 'x' + (t[1] > 1 ? sup(t[1]) : ''); }).join(', ') + '). Não há termos semelhantes: a resposta já está simplificada.' + aside('A multiplicação por um número muda só os coeficientes; a parte com letra fica igual.') },
        { t: 'Resposta final', cls: 'final', b: m(k + nm('P') + ' = ' + L.polyToMath(KP)) },
        { t: 'Conferindo se faz sentido', cls: 'check', b: checkX('', evalAt(KP, 2), '[[P(2) = ' + at2('P') + ']] e [[' + k + ' * ' + H.par(at2('P')) + ' = ' + k * at2('P') + ']].') }
      ] });
    // d) a·Q + b·P
    var a1 = p.lin[0], b1 = p.lin[1], AQ = L.pMul({ 0: a1 }, PQ), BP = L.pMul({ 0: b1 }, PP), LIN = L.pAdd(AQ, BP, 1);
    var aqT = Q.map(function (t) { return [a1 * t[0], t[1]]; }), bpT = P.map(function (t) { return [b1 * t[0], t[1]]; });
    items.push({ key: 'd', op: a1 + 'Q + ' + b1 + 'P', res: LIN, rules: ['distributiva4', 'semelhantes4'],
      tip: 'Faça por partes: primeiro [[' + a1 + 'Q(x)]], depois [[' + b1 + 'P(x)]] e, no fim, some.',
      more: ['Cada número multiplica <b>todos</b> os termos do seu parêntese.', 'Depois junte os termos semelhantes (mesma letra, mesmo expoente).'],
      hints: [{ when: L.polyToMath(L.pAdd(PQ, PP, 1)), msg: 'Faltou multiplicar: [[' + a1 + 'Q(x)]] é ' + a1 + ' vezes o [[Q(x)]], e [[' + b1 + 'P(x)]] é ' + b1 + ' vezes o [[P(x)]].' }],
      steps: [
        { t: 'Por partes', cls: 'concept', b: 'Vamos fazer em três etapas: calcular [[' + a1 + 'Q(x)]], calcular [[' + b1 + 'P(x)]] e somar os dois. Em cada multiplicação, o número multiplica <b>cada termo</b> do parêntese (distributiva).' },
        { t: a1 + 'Q(x)', b: lines(['[[' + a1 + '(' + pTxt(Q) + ') = ' + pTxt(aqT) + ']]']) + aside(Q.map(function (t) { return '[[' + a1 + ' * ' + (t[0] < 0 ? '(-' + tm(t[0], t[1]) + ')' : tm(t[0], t[1])) + ' = ' + (a1 * t[0] < 0 ? '-' : '') + tm(a1 * t[0], t[1]) + ']]'; }).join(' · ')) },
        { t: b1 + 'P(x)', b: lines(['[[' + b1 + '(' + pTxt(P) + ') = ' + pTxt(bpT) + ']]']) + aside(P.map(function (t) { return '[[' + b1 + ' * ' + (t[0] < 0 ? '(-' + tm(t[0], t[1]) + ')' : tm(t[0], t[1])) + ' = ' + (b1 * t[0] < 0 ? '-' : '') + tm(b1 * t[0], t[1]) + ']]'; }).join(' · ')) },
        { t: 'Somando e juntando os semelhantes', b: calc(m(pTxt(aqT.concat(bpT), true))) + lines(combineLines(aqT.concat(bpT))) },
        { t: 'Resposta final', cls: 'final', b: m(a1 + 'Q(x) + ' + b1 + 'P(x) = ' + L.polyToMath(LIN)) },
        { t: 'Conferindo se faz sentido', cls: 'check', b: checkX('', evalAt(LIN, 2), '[[' + a1 + ' * Q(2) + ' + b1 + ' * P(2) = ' + a1 + ' * ' + H.par(at2('Q')) + ' + ' + b1 + ' * ' + H.par(at2('P')) + ' = ' + (a1 * at2('Q') + b1 * at2('P')) + ']].') }
      ] });
    // e) P · R (chuveirinho)
    var ch = CT.polyMulSteps(P, R), PRp = ch.prod;
    var last = ch.list[ch.list.length - 1];
    last.b = last.b.replace('[[A * B = ', '[[P(x) * R(x) = ');
    items.push({ key: 'e', op: 'P * R', res: PRp, rules: ['distributiva4', 'potencias4'], keys: [['x⁴', 'x⁴']],
      tip: 'Use o <b>chuveirinho</b>: cada termo de [[P(x)]] multiplica cada termo de [[R(x)]].',
      more: ['São [[' + P.length + ' * ' + R.length + ' = ' + P.length * R.length + ']] multiplicações. Na multiplicação de letras, os expoentes <b>somam</b>: [[x * x^3 = x^4]].', 'No fim, junte os termos semelhantes. Cuidado com os sinais!'],
      hints: [
        { when: L.polyToMath(L.pAdd(PP, PR, 1)), msg: 'Isso é a soma. Aqui é <b>multiplicação</b>: faça o chuveirinho.' },
        { when: L.polyToMath(L.pMul(P2poly([P[0]]), PR)), msg: 'Faltou multiplicar o <b>segundo termo</b> de [[P(x)]] por todos os termos de [[R(x)]].' }
      ],
      steps: ch.list.concat([
        { t: 'Resposta final', cls: 'final', b: m('P(x) * R(x) = ' + L.polyToMath(PRp)) },
        { t: 'Conferindo se faz sentido', cls: 'check', b: checkX('', evalAt(PRp, 2), '[[P(2) = ' + at2('P') + ']] e [[R(2) = ' + at2('R') + ']]; multiplicando, [[' + at2('P') + ' * ' + H.par(at2('R')) + ' = ' + at2('P') * at2('R') + ']].') }
      ]) });
    return items.map(function (it) {
      var lbl = { 'P + Q': 'P(x) + Q(x)', 'Q - R': 'Q(x) - R(x)', 'P * R': 'P(x) * R(x)' }[it.op] || (it.key === 'c' ? k + 'P(x)' : a1 + 'Q(x) + ' + b1 + 'P(x)');
      return {
        key: it.key, label: it.key + ')', prompt: m(lbl),
        answer: { type: 'polynomial', coeffs: it.res, simplified: true, keys: it.keys },
        hint: { rules: it.rules, tip: it.tip, more: it.more },
        hints: it.hints.filter(function (h) { try { return !L.polyEqual(L.evalPoly(L.parseExpr(h.when)), it.res); } catch (e) { return false; } }),
        final: m(L.polyToMath(it.res)),
        steps: { list: it.steps }
      };
    });
  }
  G['134-1'] = function (p) {
    return {
      prompt: 'Sendo [[P(x) = ' + pTxt(p.P) + ']], [[Q(x) = ' + pTxt(p.Q) + ']] e [[R(x) = ' + pTxt(p.R) + ']], obtenha:',
      items: polyItems(p)
    };
  };
  // 134 Q2 — grau de f·(g + h)
  G['134-2'] = function (p) {
    var f = p.g[0], g = p.g[1], h = p.g[2], mx = Math.max(g, h), ans = f + mx;
    var cands = [mx, f + Math.min(g, h), ans, f + g + h];
    var uniq = []; cands.forEach(function (c) { if (uniq.indexOf(c) < 0) uniq.push(c); });
    uniq.sort(function (a, b) { return a - b; });
    var why = function (c) {
      if (c === mx) return 'Esse é o grau de [[g + h]]. Ainda falta multiplicar por [[f]].';
      if (c === f + g + h) return 'Não se somam os três graus: [[g]] e [[h]] estão sendo <b>somados</b>, não multiplicados.';
      return 'Na soma [[g + h]], o grau é o <b>maior</b> dos dois, e não o menor.';
    };
    var opts = uniq.map(function (c) { return { id: 'g' + c, html: String(c), hint: c === ans ? undefined : why(c) }; });
    opts.push({ id: 'outra', html: 'Outra alternativa', hint: 'A resposta está entre os números das alternativas. Calcule primeiro o grau de [[g + h]].' });
    return {
      prompt: 'Os polinômios [[f]], [[g]] e [[h]] têm graus ' + f + ', ' + g + ' e ' + h + ', respectivamente. O grau do polinômio [[f * (g + h)]] é:',
      items: [{
        key: 'u',
        answer: { type: 'choice', layout: 'list', correct: 'g' + ans, options: opts },
        hint: { rules: ['grau4', 'grau-produto'], tip: 'Resolva por partes: primeiro o grau de [[g + h]].',
          more: ['Na <b>soma</b> de polinômios de graus diferentes, o grau é o <b>maior</b> deles.', 'Na <b>multiplicação</b>, os graus se <b>somam</b> (porque os expoentes somam: [[x^2 * x^5 = x^7]]).'] },
        final: String(ans),
        steps: { list: [
          { t: 'Lembrete: grau', cls: 'concept', b: 'O <b>grau</b> de um polinômio é o <b>maior expoente</b> do [[x]]. Exemplo: [[x^5 - 3x + 1]] tem grau 5.' },
          { t: 'Grau de g + h', b: 'O [[g]] tem grau ' + g + ' e o [[h]] tem grau ' + h + '. Na soma, o termo [[x^' + mx + ']] do ' + (h > g ? '[[h]]' : '[[g]]') + ' não tem ninguém para se juntar (o outro polinômio não tem [[x^' + mx + ']]). Então ele continua lá:' + calc('grau de [[(g + h)]] = ' + mx) + aside('Exemplo: [[(x^' + g + ' + 1) + (x^' + h + ' + 2) = x^' + h + ' + x^' + g + ' + 3]] → grau ' + mx + '.') },
          { t: 'Grau da multiplicação', b: 'Quando multiplicamos polinômios, o termo de maior expoente de um multiplica o de maior expoente do outro, e os <b>expoentes somam</b>:' + calc(m('x^' + f + ' * x^' + mx + ' = x^{' + f + ' + ' + mx + '} = x^' + ans)) + 'Então o grau de [[f * (g + h)]] é [[' + f + ' + ' + mx + ' = ' + ans + ']].' },
          { t: 'Resposta final', cls: 'final', b: 'O grau é <b>' + ans + '</b>: alternativa <b>' + 'ABCDE'[uniq.indexOf(ans)] + '</b>.' },
          { t: 'Conferindo se faz sentido', cls: 'check', b: 'Testando com exemplos: [[f = x^' + f + ']], [[g = x^' + g + ']], [[h = x^' + h + ']]. Então [[f * (g + h) = x^' + f + ' * (x^' + g + ' + x^' + h + ') = x^' + (f + g) + ' + x^' + (f + h) + ']]: o maior expoente é ' + ans + ' ✓.' }
        ] }
      }]
    };
  };

  /* ================= Racionalização: textos comuns ================= */
  var RAD_INTRO = { t: 'Lembrete: radicais e racionalizar', cls: 'concept', b: 'Em [[R{3}{5}]], o <b>√</b> é o <b>radical</b>, o 3 pequeno é o <b>índice</b> (raiz cúbica) e o 5 é o <b>radicando</b>. Quando não aparece índice, ele é 2: [[√5]] é a raiz quadrada.<br>' +
      'Uma raiz desfaz uma potência de mesmo índice: [[√{5^2} = 5]], [[R{3}{5^3} = 5]]. E raízes de mesmo índice se multiplicam juntando o de dentro: [[√2 * √3 = √6]].<br>' +
      '<b>Racionalizar</b> o denominador é reescrever a fração para que <b>não sobre raiz embaixo</b>. O valor da fração não pode mudar!' };
  var ONE_IDEA = function (f) { return 'O truque: multiplicar <b>em cima e embaixo</b> pelo mesmo número. Isso é o mesmo que multiplicar por [[' + 'frac{' + f + '}{' + f + '} = 1' + ']], e multiplicar por 1 não muda o valor. Só muda a "cara" da fração.'; };
  var approx = function (v) { return br(Math.round(v * 1000) / 1000, 3); };

  /* ================= Aula 135 — raiz quadrada e cúbica ================= */
  // sp = { k, a, n (2 ou 3), negDen (−√a no denominador) }
  function rat135(key, sp) {
    var k = sp.k, a = sp.a, n = sp.n, steps = [RAD_INTRO];
    var rad = function (x) { return n === 2 ? '√' + x : 'R{3}{' + x + '}'; };
    var denTxt = sp.negDen ? '-' + rad(a) : (a < 0 ? 'R{3}{-' + (-a) + '}' : rad(a));
    var promptTxt = 'frac{' + k + '}{' + denTxt + '}';
    var value = k / ((sp.negDen ? -1 : 1) * (n === 2 ? Math.sqrt(a) : Math.cbrt(a)));
    var kk = k, aa = a;
    if (a < 0) {   // ∛(−a) = −∛a
      steps.push({ t: 'Primeiro: a raiz de um número negativo', b: 'O índice é 3 (<b>ímpar</b>), então a raiz de um negativo existe e é negativa: [[R{3}{-' + (-a) + '} = -R{3}{' + (-a) + '}]] (porque [[(-1)^3 = -1]]).' + calc(m(promptTxt + ' = frac{' + k + '}{-R{3}{' + (-a) + '}} = -frac{' + k + '}{R{3}{' + (-a) + '}}')) + 'O sinal de menos pode ir para a frente da fração. Agora racionalizamos [[frac{' + k + '}{R{3}{' + (-a) + '}}]] e, no fim, colocamos o menos de volta.' });
      kk = -k; aa = -a;
    } else if (sp.negDen) {
      steps.push({ t: 'Primeiro: o sinal de menos', b: 'O denominador é negativo. Mais dividido por menos dá menos, então o sinal pode ir para a frente da fração:' + calc(m(promptTxt + ' = -frac{' + k + '}{' + rad(a) + '}')) + 'Agora racionalizamos [[frac{' + k + '}{' + rad(a) + '}]] e, no fim, colocamos o menos de volta.' });
      kk = -k;
    }
    var K = Math.abs(kk), sgn = kk < 0 ? '-' : '';
    var fac = n === 2 ? '√' + aa : 'R{3}{' + aa + '^2}', facV = n === 2 ? '√' + aa : 'R{3}{' + aa * aa + '}';
    var radNum = n === 2 ? aa : aa * aa;   // o que fica dentro da raiz em cima
    var g = H.gcd(K, aa), cn = K / g, dn = aa / g;
    var numTxt = (cn === 1 ? '' : cn) + (n === 2 ? '√' + radNum : 'R{3}{' + radNum + '}');
    var finalTxt = sgn + (dn === 1 ? numTxt : 'frac{' + numTxt + '}{' + dn + '}');
    var canon = sgn + (dn === 1 ? (cn === 1 ? '' : cn) + (n === 2 ? '√' : '³√') + radNum : (cn === 1 ? '' : cn) + (n === 2 ? '√' : '³√') + radNum + '/' + dn);
    steps.push({ t: 'Por qual número multiplicar?', b: n === 2
        ? 'Queremos que o [[√' + aa + ']] de baixo vire um número sem raiz. Basta multiplicar ele por <b>ele mesmo</b>:' + calc(m('√' + aa + ' * √' + aa + ' = √{' + aa + ' * ' + aa + '} = √{' + aa + '^2} = ' + aa)) + 'Então vamos multiplicar em cima e embaixo por ' + hl(m('√' + aa), 'a') + '.'
        : 'Com raiz <b>cúbica</b>, multiplicar por ela mesma não basta: [[R{3}{' + aa + '} * R{3}{' + aa + '} = R{3}{' + aa + '^2}]], que ainda tem raiz. Precisamos chegar em [[' + aa + '^3]] dentro da raiz, porque [[R{3}{' + aa + '^3} = ' + aa + ']].<br>Dentro da raiz já tem [[' + aa + '^1]]; falta [[' + aa + '^2]] (expoentes somam: [[1 + 2 = 3]]):' + calc(m('R{3}{' + aa + '} * R{3}{' + aa + '^2} = R{3}{' + aa + '^3} = ' + aa)) + 'Então vamos multiplicar em cima e embaixo por ' + hl(m('R{3}{' + aa + '^2} = R{3}{' + aa * aa + '}'), 'a') + '.' });
    steps.push({ t: 'Multiplicando em cima e embaixo', b: ONE_IDEA(facV) + calc(m('frac{' + K + '}{' + (n === 2 ? '√' + aa : 'R{3}{' + aa + '}') + '} * frac{<b class="hl hl-a">' + facV + '</b>}{<b class="hl hl-a">' + facV + '</b>}')) +
        lines(['Em cima: [[' + K + ' * ' + facV + ' = ' + (K === 1 ? '' : K) + facV + ']]', 'Embaixo: [[' + (n === 2 ? '√' + aa + ' * √' + aa + ' = ' + aa : 'R{3}{' + aa + '} * R{3}{' + aa * aa + '} = R{3}{' + aa * aa * aa + '} = ' + aa) + ']]' + small(n === 2 ? 'a raiz quadrada desfaz o quadrado' : aa * aa * aa + ' = ' + aa + '³, e a raiz cúbica desfaz o cubo')]) +
        'A fração ficou:' + calc(m('frac{' + (K === 1 ? '' : K) + facV + '}{' + aa + '}')) });
    if (g > 1) steps.push({ t: 'Simplificando', b: 'O ' + K + ' de cima e o ' + aa + ' de baixo podem ser divididos por ' + g + ' (a raiz fica como está):' + calc(m('frac{' + K + facV + '}{' + aa + '} = ' + (dn === 1 ? numTxt : 'frac{' + numTxt + '}{' + dn + '}'))) + (dn === 1 ? 'Dividir por 1 não muda nada: a fração sumiu!' : '') });
    if (sgn) steps.push({ t: 'Devolvendo o sinal de menos', b: 'Agora colocamos de volta o sinal de menos que tiramos no começo:' + calc(m(finalTxt)) });
    steps.push({ t: 'Resposta final', cls: 'final', b: m(promptTxt + ' = ' + finalTxt) + '<br>Não sobrou raiz no denominador ✓.' });
    steps.push({ t: 'Conferindo se faz sentido', cls: 'check', b: 'Com a calculadora, as duas formas dão o mesmo valor: [[' + promptTxt + ' ≈ ' + approx(value) + ']] e [[' + finalTxt + ' ≈ ' + approx(value) + ']] ✓. O valor não mudou, só a forma.' });
    var wrongs = [];
    if (Math.abs(-value) > 1e-9 && (sp.negDen || a < 0 || k < 0)) wrongs.push({ when: -value, msg: 'O valor está quase certo, mas o <b>sinal</b> está trocado. Confira os sinais de menos.' });
    if (n === 3) wrongs.push({ when: K * Math.cbrt(aa) / aa * (kk < 0 ? -1 : 1), msg: 'Com raiz cúbica, multiplicar por [[R{3}{' + aa + '}]] não basta: [[R{3}{' + aa + '} * R{3}{' + aa + '}]] ainda não é ' + aa + '. Confira o denominador.' });
    return {
      key: key, label: key + ')', prompt: m(promptTxt),
      answer: { type: 'radical', value: value, canonical: canon, rationalized: true, keys: n === 3 ? [['³√', '³√'], ['/', '/']] : [['/', '/']] },
      hint: { rules: ['racionalizar'], tip: n === 2 ? 'Multiplique em cima e embaixo por [[√' + aa + ']]: [[√' + aa + ' * √' + aa + ' = ' + aa + ']].' : 'Com raiz cúbica, o radicando precisa chegar a [[' + aa + '^3]]. Por quanto multiplicar [[R{3}{' + aa + '}]]?',
        more: [n === 2 ? 'Multiplicar em cima e embaixo pelo mesmo número não muda o valor (é multiplicar por 1).' : 'Já tem [[' + aa + '^1]] dentro da raiz. Falta [[' + aa + '^2]]: multiplique em cima e embaixo por [[R{3}{' + aa + '^2}]].', 'No fim, veja se dá para simplificar o número de fora com o de baixo.' + (sgn ? ' E não esqueça o sinal de menos!' : '')] },
      hints: wrongs.filter(function (w) { return Math.abs(w.when - value) > 1e-9; }),
      final: m(finalTxt),
      steps: { list: steps }
    };
  }
  G['135-1'] = function (p) { return { prompt: 'Racionalizar os denominadores das frações:', note: 'Para digitar: os símbolos √ e ³√ estão nos botões. Fração: use a barra, por exemplo 3√2/2.', items: p.items.map(function (sp, i) { return rat135('abcdefghij'[i], sp); }) }; };

  /* ================= Aula 136 — índice n ================= */
  // sp = { k, b (base), m (expoente no radicando), n (índice), show: 'num' (mostra b^m calculado) | 'pow' }
  function rat136(key, sp) {
    var k = sp.k, b = sp.b, e = sp.m, n = sp.n, miss = n - e;
    var bm = Math.pow(b, e), bmiss = Math.pow(b, miss);
    var R = function (x) { return 'R{' + n + '}{' + x + '}'; };
    var denTxt = sp.show === 'pow' ? R(b + '^' + e) : R(e === 1 ? b : bm);
    var promptTxt = 'frac{' + k + '}{' + denTxt + '}';
    var value = k / Math.pow(bm, 1 / n);
    var K = Math.abs(k), sgn = k < 0 ? '-' : '', g = H.gcd(K, b), cn = K / g, dn = b / g;
    var numTxt = (cn === 1 ? '' : cn) + R(bmiss);
    var finalTxt = sgn + (dn === 1 ? numTxt : 'frac{' + numTxt + '}{' + dn + '}');
    var canon = sgn + (cn === 1 ? '' : cn) + sup(n) + '√' + bmiss + (dn === 1 ? '' : '/' + dn);
    var steps = [RAD_INTRO];
    steps.push({ t: 'A regra para qualquer índice', cls: 'concept', b: 'Para o radicando ficar "livre" da raiz de índice ' + n + ', o expoente dentro dela precisa chegar a <b>' + n + '</b>, porque [[' + R(b + '^' + n) + ' = ' + b + ']].<br>Quando multiplicamos raízes de mesmo índice, juntamos o de dentro, e na multiplicação de potências de mesma base os <b>expoentes somam</b>: [[' + b + '^' + e + ' * ' + b + '^' + miss + ' = ' + b + '^{' + e + ' + ' + miss + '} = ' + b + '^' + n + ']].<br>Então a pergunta é sempre: <b>quanto falta no expoente para chegar no índice?</b>' });
    if (sp.show === 'num' && e > 1) steps.push({ t: 'Escrevendo ' + bm + ' como potência', b: 'Para ver o expoente, escrevemos ' + bm + ' como potência de ' + b + ':' + calc(m(bm + ' = ' + Array(e + 1).join(b + ' * ').slice(0, -3) + ' = ' + b + '^' + e)) + 'Então [[' + R(bm) + ' = ' + R(b + '^' + e) + ']].' });
    steps.push({ t: 'Quanto falta no expoente?', b: 'O índice é <b>' + n + '</b> e dentro da raiz tem [[' + b + '^' + e + ']]' + (e === 1 ? ' (o ' + b + ' sozinho tem expoente 1)' : '') + '. Falta:' + calc(m(n + ' - ' + e + ' = ' + miss)) + 'Vamos multiplicar em cima e embaixo por ' + hl(m(R(b + '^' + miss)), 'a') + (miss > 1 ? ' (que é [[' + R(bmiss) + ']], porque [[' + b + '^' + miss + ' = ' + bmiss + ']])' : '') + '.' });
    steps.push({ t: 'Multiplicando em cima e embaixo', b: ONE_IDEA(R(b + '^' + miss)) +
        lines(['Em cima: [[' + K + ' * ' + R(b + '^' + miss) + ' = ' + (K === 1 ? '' : K) + R(bmiss) + ']]',
          'Embaixo: [[' + R(b + '^' + e) + ' * ' + R(b + '^' + miss) + ' = ' + R(b + '^{' + e + ' + ' + miss + '}') + ' = ' + R(b + '^' + n) + ' = ' + b + ']]' + small('o expoente chegou no índice: a raiz some')]) +
        'A fração ficou:' + calc(m('frac{' + (K === 1 ? '' : K) + R(bmiss) + '}{' + b + '}')) });
    if (g > 1) steps.push({ t: 'Simplificando', b: 'O ' + K + ' de fora e o ' + b + ' de baixo se dividem por ' + g + ':' + calc(m('frac{' + K + R(bmiss) + '}{' + b + '} = ' + (dn === 1 ? numTxt : 'frac{' + numTxt + '}{' + dn + '}'))) });
    if (sgn) steps.push({ t: 'O sinal de menos', b: 'O numerador era negativo ([[' + k + ']]), então o resultado continua negativo:' + calc(m(finalTxt)) });
    steps.push({ t: 'Resposta final', cls: 'final', b: m(promptTxt + ' = ' + finalTxt) });
    steps.push({ t: 'Conferindo se faz sentido', cls: 'check', b: 'Com a calculadora: [[' + promptTxt + ' ≈ ' + approx(value) + ']] e [[' + finalTxt + ' ≈ ' + approx(value) + ']] ✓.' });
    var wrong = k < 0 ? [{ when: -value, msg: 'O valor está certo, mas falta o <b>sinal de menos</b>: o numerador é negativo.' }] : [];
    return {
      key: key, label: key + ')', prompt: m(promptTxt),
      answer: { type: 'radical', value: value, canonical: canon, rationalized: true, keys: [[sup(n) + '√', sup(n) + '√'], ['^', '^'], ['/', '/']] },
      hint: { rules: ['racionalizar-n'], tip: 'O expoente dentro da raiz precisa chegar ao <b>índice</b> (' + n + ').',
        more: ['Dentro da raiz tem [[' + b + '^' + e + ']]. Quanto falta para [[' + b + '^' + n + ']]?', 'Multiplique em cima e embaixo por [[' + R(b + '^' + miss) + ']]. Embaixo vai sobrar só o ' + b + '.'] },
      hints: wrong.filter(function (w) { return isFinite(w.when) && Math.abs(w.when - value) > 1e-6; }),
      final: m(finalTxt),
      steps: { list: steps }
    };
  }
  G['136-1'] = function (p) { return { prompt: 'Racionalizar os denominadores das frações:', note: 'Para digitar a raiz de índice n, use o botão com o numerozinho (ex.: ⁴√). Potência: ^ (ex.: ⁴√2^3). Fração: barra /.', items: p.items.map(function (sp, i) { return rat136('abcdefghij'[i], sp); }) }; };

  /* ================= Aula 137 — conjugado ================= */
  // termo = [coef, radicando] (radicando 1 = número inteiro)
  function sqTerm(c, r) {   // c·√r simplificado → [coef, radicando]
    var s = 1;
    for (var t = 2; t * t <= r; t++) while (r % (t * t) === 0) { r /= t * t; s *= t; }
    return [c * s, r];
  }
  function tTx(t, first) {
    var c = t[0], r = t[1], a = Math.abs(c);
    var body = r === 1 ? String(a) : (a === 1 ? '' : a) + '√' + r;
    return first ? (c < 0 ? '-' : '') + body : (c < 0 ? ' - ' : ' + ') + body;
  }
  var tList = function (arr) { return arr.map(function (t, i) { return tTx(t, i === 0); }).join(''); };
  var tVal = function (t) { return t[0] * Math.sqrt(t[1]); };
  // sp = { num: [c, r], den: [[c1, r1], [c2, r2]] }
  function rat137(key, sp) {
    var N = sp.num, A = sp.den[0], Bt = sp.den[1];
    var conj = [A, [-Bt[0], Bt[1]]];
    var denTxt = tList(sp.den), conjTxt = tList(conj), numTxt0 = tList([N]);
    var promptTxt = 'frac{' + numTxt0 + '}{' + denTxt + '}';
    var value = tVal(N) / (tVal(A) + tVal(Bt));
    var A2 = A[0] * A[0] * A[1], B2 = Bt[0] * Bt[0] * Bt[1], D = A2 - B2;
    var sq = function (t) { return t[1] === 1 ? H.par(t[0]) + '^2' : (Math.abs(t[0]) === 1 ? '' : Math.abs(t[0])) + '(√' + t[1] + ')^2'; };
    // numerador: N·A + N·(−B)
    var nA = sqTerm(N[0] * A[0], N[1] * A[1]), nB = sqTerm(N[0] * -Bt[0], N[1] * Bt[1]);
    var numTerms = [nA, nB];
    // simplificar: mdc dos coeficientes e de D
    var gg = Math.abs(D);
    numTerms.forEach(function (t) { gg = H.gcd(gg, t[0]); });
    var D2 = D / gg, T2 = numTerms.map(function (t) { return [t[0] / gg, t[1]]; });
    if (D2 < 0) { D2 = -D2; T2 = T2.map(function (t) { return [-t[0], t[1]]; }); }
    // mostrar termo positivo primeiro
    if (T2[0][0] < 0 && T2[1][0] > 0) T2 = [T2[1], T2[0]];
    var common = H.gcd(Math.abs(T2[0][0]), Math.abs(T2[1][0]));
    var finalNum = tList(T2);
    var finalTxt = D2 === 1 ? finalNum : (common > 1 ? 'frac{' + common + '(' + tList(T2.map(function (t) { return [t[0] / common, t[1]]; })) + ')}{' + D2 + '}' : 'frac{' + finalNum + '}{' + D2 + '}');
    var canonOf = function (arr) { return tList(arr).replace(/ /g, ''); };
    var canon = D2 === 1 ? canonOf(T2) : '(' + canonOf(T2) + ')/' + D2;
    var Am = tList([A]), Bm = tList([[Math.abs(Bt[0]), Bt[1]]]);
    var steps = [RAD_INTRO,
      { t: 'O produto que faz a raiz sumir', cls: 'concept', b: 'Aqui o denominador tem <b>dois termos</b>. Multiplicar por [[' + denTxt + ']] não adianta. O truque é usar o <b>conjugado</b>: os mesmos dois termos, com o <b>sinal do meio trocado</b>.<br>' +
          'Pelo chuveirinho, [[(a + b)(a - b) = a^2 - ab + ab - b^2 = a^2 - b^2]]: os termos do meio se cancelam! E o quadrado de uma raiz quadrada não tem mais raiz: [[(√5)^2 = 5]].' + aside('Exemplo: [[(√7 + √3)(√7 - √3) = 7 - 3 = 4]].') },
      { t: 'Quem é o conjugado?', b: 'O denominador é [[' + denTxt + ']]. Trocando só o sinal do meio, o conjugado é ' + hl(m(conjTxt), 'a') + '.<br>Vamos multiplicar em cima e embaixo por ele. ' + ONE_IDEA('(' + conjTxt + ')') },
      { t: 'Multiplicando embaixo', b: 'Pela regra [[(a + b)(a - b) = a^2 - b^2]]:' +
          lines(['[[(' + denTxt + ')(' + conjTxt + ') = ' + sq(A) + ' - ' + sq([Bt[0], Bt[1]]) + ']]', '[[= ' + A2 + ' - ' + B2 + ' = ' + D + ']]' + small(A[1] === 1 ? H.par(A[0]) + '² = ' + A2 + ' e (√' + Bt[1] + ')² = ' + Bt[1] : 'cada raiz ao quadrado perde a raiz')]) + (D < 0 ? aside('Deu negativo, sem problema: o sinal vai ser cuidado no fim.') : '') },
      { t: 'Multiplicando em cima', b: 'Distributiva: o [[' + numTxt0 + ']] multiplica cada termo do conjugado:' +
          lines(['[[' + numTxt0 + ' * (' + conjTxt + ')]]',
            '[[' + numTxt0 + ' * ' + Am + ' = ' + tTx(nA, true) + ']]' + (N[1] > 1 && A[1] > 1 ? small('√' + N[1] + ' · √' + A[1] + ' = √' + N[1] * A[1] + (nA[1] !== N[1] * A[1] ? ' = ' + tTx(nA, true) : '')) : ''),
            '[[' + numTxt0 + ' * (' + (Bt[0] > 0 ? '-' : '+') + Bm + ') = ' + tTx(nB, true) + ']]' + (N[1] > 1 && Bt[1] > 1 ? small('√' + N[1] + ' · √' + Bt[1] + ' = √' + N[1] * Bt[1] + (nB[1] !== N[1] * Bt[1] ? ' = ' + tTx(nB, true) : '')) : '')]) +
          'Em cima ficou [[' + tList(numTerms) + ']].' },
      { t: 'Juntando a fração', b: calc(m('frac{' + tList(numTerms) + '}{' + D + '}')) +
          (gg > 1 || D < 0 ? (gg > 1 ? 'Todos os números (' + H.listPT(numTerms.map(function (t) { return String(Math.abs(t[0])); }).concat([String(Math.abs(D))])) + ') se dividem por ' + gg + '. ' : '') + (D < 0 ? 'O denominador é negativo: dividir por um número negativo <b>troca o sinal</b> de todos os termos de cima. ' : '') + 'Fica:' + calc(m(finalTxt)) : 'Não dá para simplificar mais.') }
    ];
    steps.push({ t: 'Resposta final', cls: 'final', b: m(promptTxt + ' = ' + finalTxt) + '<br>Não sobrou raiz no denominador ✓.' });
    steps.push({ t: 'Conferindo se faz sentido', cls: 'check', b: 'Com a calculadora: [[' + promptTxt + ' ≈ ' + approx(value) + ']] e [[' + finalTxt + ' ≈ ' + approx(value) + ']] ✓.' });
    var wrongs = [{ when: -value, msg: 'O valor está certo em tamanho, mas o <b>sinal</b> está trocado. Confira a conta do denominador ([[a^2 - b^2]]).' }];
    var sameDen = tVal(N) * (tVal(A) + tVal(Bt)) / D;   // multiplicou pelo próprio denominador em cima
    wrongs.push({ when: sameDen, msg: 'Em cima, multiplique pelo <b>conjugado</b> (sinal do meio trocado), não pelo próprio denominador.' });
    return {
      key: key, label: key + ')', prompt: m(promptTxt),
      answer: { type: 'radical', value: value, canonical: canon, rationalized: true, keys: [['/', '/']] },
      hint: { rules: ['conjugado', 'racionalizar'], tip: 'Multiplique em cima e embaixo pelo <b>conjugado</b> do denominador: os mesmos termos com o sinal do meio trocado.',
        more: ['O conjugado de [[' + denTxt + ']] é [[' + conjTxt + ']]. Embaixo use [[(a + b)(a - b) = a^2 - b^2]].', 'Em cima, faça a distributiva. No fim, simplifique e cuide dos sinais.'] },
      hints: wrongs.filter(function (w) { return Math.abs(w.when - value) > 1e-6; }),
      final: m(finalTxt),
      steps: { list: steps }
    };
  }
  G['137-1'] = function (p) { return { prompt: 'Racionalizar os denominadores das frações:', note: 'Para digitar uma fração com dois termos em cima, use parênteses: (√5 + √3)/2.', items: p.items.map(function (sp, i) { return rat137('abcdefghi'[i], sp); }) }; };

  /* ================= Montagem da prova de Álgebra ================= */
  var Q = B4.question;
  var r = function (c, x) { return [c, x]; };
  B4.exam({
    id: 'alg', title: 'Álgebra', badge: 'ÁLG', icon: 'x²', name: 'Álgebra', color: 'green',
    meta: '4º Bimestre · Aulas 126 a 137',
    content: 'Divisibilidade, proporções, polinômios e racionalização',
    aulas: { 126: 'Revisão: regras de divisibilidade', 129: 'Propriedade 1', 130: 'Média geométrica e propriedade 2', 131: 'Propriedades 3, 4 e 5', 132: 'Divisão em partes proporcionais', 134: 'Revisão: polinômios', 135: 'Racionalização: √a e ∛a', 136: 'Racionalização: ⁿ√a e ⁿ√aᵐ', 137: 'Racionalização: √a + √b e √a − √b' },
    questions: [
      Q({ aula: 126, n: 1, skill: 'Regras de divisibilidade', gen: G['126-1'], params: [{ N: 6468 }, { N: 5940 }, { N: 3003 }, { N: 1320 }] }),
      Q({ aula: 126, n: 2, skill: 'MMC', gen: G['126-2'], params: [{ nums: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }, { nums: [2, 3, 4, 5, 6] }, { nums: [2, 3, 4, 5, 6, 7, 8] }, { nums: [4, 6, 9, 10] }] }),
      Q({ aula: 129, n: 1, skill: 'Proporção válida?', gen: G['129-1'], params: [
        { items: [{ a: 2, b: 5, c: 5, d: 2 }, { a: 3, b: 2, c: 18, d: 12 }, { rad: true, p: 5, q: 3, r: 5, s: 3 }, { a: -3, b: 0.5, c: 6, d: -1 }] },
        { items: [{ a: 3, b: 4, c: 6, d: 8 }, { a: 2, b: 3, c: 3, d: 2 }, { rad: true, p: 2, q: 8, r: 1, s: 2 }, { a: -2, b: 0.5, c: 8, d: -2 }] },
        { items: [{ a: 5, b: 6, c: 15, d: 18 }, { a: 4, b: 9, c: 9, d: 4 }, { rad: true, p: 3, q: 2, r: 3, s: 2 }, { a: -4, b: 0.5, c: 16, d: -2 }] },
        { items: [{ a: 7, b: 3, c: 21, d: 6 }, { a: 1, b: 4, c: 3, d: 12 }, { rad: true, p: 12, q: 3, r: 2, s: 1 }, { a: 6, b: -0.5, c: -12, d: 1 }] }
      ] }),
      Q({ aula: 129, n: 2, skill: 'Termo desconhecido', gen: G['129-2'], params: [
        { items: [{ v: [null, 3, 7, 12], letter: 'x' }, { v: [8, null, 6, 36], letter: 'y' }, { v: [5, 8, null, 32], letter: 'z' }, { v: [12, 37, 20, null], letter: 'x' }] },
        { items: [{ v: [null, 4, 9, 12], letter: 'x' }, { v: [6, null, 9, 30], letter: 'y' }, { v: [3, 5, null, 45], letter: 'z' }, { v: [8, 15, 12, null], letter: 'x' }] },
        { items: [{ v: [null, 6, 5, 15], letter: 'x' }, { v: [10, null, 4, 18], letter: 'y' }, { v: [7, 9, null, 36], letter: 'z' }, { v: [9, 14, 6, null], letter: 'x' }] },
        { items: [{ v: [null, 5, 6, 8], letter: 'x' }, { v: [12, null, 3, 7], letter: 'y' }, { v: [4, 11, null, 33], letter: 'z' }, { v: [16, 27, 24, null], letter: 'x' }] }
      ] }),
      Q({ aula: 130, n: 1, skill: 'Média geométrica', gen: G['130-1'], params: [
        { items: [{ a: 9, b: 1 }, { a: 4, b: 16 }, { a: 12, b: 108 }, { a: 5, b: 25 }, { a: 11, b: 11 }, { ra: 3, rb: 27 }] },
        { items: [{ a: 4, b: 9 }, { a: 2, b: 18 }, { a: 8, b: 50 }, { a: 3, b: 6 }, { a: 7, b: 7 }, { ra: 2, rb: 8 }] },
        { items: [{ a: 1, b: 16 }, { a: 3, b: 27 }, { a: 20, b: 45 }, { a: 2, b: 10 }, { a: 13, b: 13 }, { ra: 5, rb: 125 }] },
        { items: [{ a: 25, b: 1 }, { a: 6, b: 24 }, { a: 16, b: 81 }, { a: 6, b: 12 }, { a: 9, b: 9 }, { ra: 6, rb: 54 }] }
      ] }),
      Q({ aula: 130, n: 2, skill: 'Partes proporcionais', gen: G['130-2'], params: [
        { total: 1000, items: [[2, 3], [1, 4], [4, 16], [7, 33]] },
        { total: 600, items: [[1, 2], [1, 5], [3, 7], [5, 7]] },
        { total: 900, items: [[1, 2], [4, 5], [2, 7], [11, 7]] },
        { total: 1200, items: [[1, 3], [5, 7], [7, 13], [9, 11]] }
      ] }),
      Q({ aula: 130, n: 3, skill: 'Segmento dividido', gen: G['130-3'], params: [{ len: 7, w: [2, 3] }, { len: 10, w: [2, 3] }, { len: 12, w: [1, 3] }, { len: 9, w: [4, 5] }] }),
      Q({ aula: 130, n: 4, skill: 'Partes numa razão', gen: G['130-4'], params: [{ total: 82, w: [12, 29] }, { total: 60, w: [7, 13] }, { total: 45, w: [4, 11] }, { total: 110, w: [3, 8] }] }),
      Q({ aula: 130, n: 5, skill: 'Razão com dízima', gen: G['130-5'], params: [{ total: 90, d: 1 }, { total: 80, d: 3 }, { total: 66, d: 2 }, { total: 65, d: 4 }] }),
      Q({ aula: 131, n: 1, skill: 'Teorema de Tales', gen: G['131-1'], params: [{ r: [7, 5] }, { r: [3, 4] }, { r: [5, 2] }, { r: [8, 3] }] }),
      Q({ aula: 131, n: 2, skill: 'Soma e razão', gen: G['131-2'], params: [
        { n: ['x', 'y'], r: [6, 4], rel: 'sum', val: 70 }, { n: ['x', 'y'], r: [7, 5], rel: 'sum', val: 60 }, { n: ['x', 'y'], r: [5, 2], rel: 'sum', val: 84 }, { n: ['x', 'y'], r: [2, 7], rel: 'sum', val: 45 }] }),
      Q({ aula: 131, n: 3, skill: 'Soma e razão negativa', gen: G['131-3'], params: [
        { n: ['a', 'b'], r: [-8, 17], rel: 'sum', val: 18, note: 'Na foto da apostila a razão tem sinal de menos ([[-frac{8}{17}]]); no caderno digitado esse sinal se perdeu. Aqui vale a foto.' },
        { n: ['a', 'b'], r: [-3, 5], rel: 'sum', val: 10 }, { n: ['a', 'b'], r: [-2, 9], rel: 'sum', val: 14 }, { n: ['a', 'b'], r: [-5, 3], rel: 'sum', val: -6 }] }),
      Q({ aula: 131, n: 4, skill: 'Soma negativa', gen: G['131-4'], params: [
        { n: ['1º número', '2º número'], r: [3, 4], rel: 'sum', val: -28 }, { n: ['1º número', '2º número'], r: [2, 5], rel: 'sum', val: -35 }, { n: ['1º número', '2º número'], r: [1, 2], rel: 'sum', val: -24 }, { n: ['1º número', '2º número'], r: [4, 5], rel: 'sum', val: -45 }] }),
      Q({ aula: 131, n: 5, skill: 'Diferença e razão', gen: G['131-5'], params: [
        { n: ['p', 'q'], r: [3, 2], rel: 'diff', order: [0, 1], val: 18 }, { n: ['p', 'q'], r: [5, 3], rel: 'diff', order: [0, 1], val: 12 }, { n: ['p', 'q'], r: [7, 3], rel: 'diff', order: [0, 1], val: 20 }, { n: ['p', 'q'], r: [4, 1], rel: 'diff', order: [0, 1], val: 9 }] }),
      Q({ aula: 131, n: 6, skill: 'Diferença e razão', gen: G['131-6'], params: [
        { n: ['x', 'y'], r: [19, 14], rel: 'diff', order: [1, 0], val: 10 }, { n: ['x', 'y'], r: [7, 4], rel: 'diff', order: [1, 0], val: 9 }, { n: ['x', 'y'], r: [2, 5], rel: 'diff', order: [1, 0], val: 12 }, { n: ['x', 'y'], r: [11, 8], rel: 'diff', order: [1, 0], val: 6 }] }),
      Q({ aula: 132, n: 1, skill: 'Partes proporcionais', gen: G['132-1'], params: [{ total: 722, w: [9, 11, 18] }, { total: 600, w: [2, 3, 7] }, { total: 960, w: [3, 5, 8] }, { total: 1150, w: [4, 6, 13] }] }),
      Q({ aula: 132, n: 2, skill: 'Ângulos proporcionais', gen: G['132-2'], params: [{ w: [1, 3, 5] }, { w: [2, 3, 4] }, { w: [1, 2, 3] }, { w: [1, 1, 4] }] }),
      Q({ aula: 132, n: 3, skill: 'Partes proporcionais', gen: G['132-3'], params: [{ total: 3500, ages: [6, 12, 17] }, { total: 2400, ages: [5, 7, 12] }, { total: 4500, ages: [4, 10, 16] }, { total: 3000, ages: [8, 10, 12] }] }),
      Q({ aula: 134, n: 1, skill: 'Operações com polinômios', gen: G['134-1'], params: [
        { P: [r(1, 1), r(1, 0)], Q: [r(3, 2), r(-1, 1)], R: [r(-1, 3), r(2, 2), r(-1, 1), r(4, 0)], k: 4, lin: [2, 3] },
        { P: [r(1, 1), r(-2, 0)], Q: [r(2, 2), r(1, 1)], R: [r(1, 3), r(-1, 2), r(3, 1), r(-1, 0)], k: 3, lin: [2, 5] },
        { P: [r(1, 1), r(3, 0)], Q: [r(1, 2), r(-4, 1)], R: [r(-2, 3), r(1, 2), r(1, 1), r(-2, 0)], k: 5, lin: [3, 2] },
        { P: [r(2, 1), r(-1, 0)], Q: [r(-1, 2), r(5, 1)], R: [r(1, 3), r(3, 2), r(-2, 1), r(1, 0)], k: 2, lin: [4, 3] }
      ] }),
      Q({ aula: 134, n: 2, skill: 'Grau do produto', gen: G['134-2'], params: [{ g: [2, 4, 5] }, { g: [3, 2, 4] }, { g: [1, 3, 6] }, { g: [4, 5, 2] }] }),
      Q({ aula: 135, n: 1, skill: 'Racionalização: √ e ∛', gen: G['135-1'], params: [
        { items: [{ k: 3, a: 2, n: 2 }, { k: 4, a: 7, n: 2 }, { k: -3, a: 3, n: 2 }, { k: 5, a: 5, n: 2 }, { k: 7, a: 3, n: 2 }, { k: 4, a: 2, n: 2, negDen: true }, { k: 1, a: 5, n: 3 }, { k: 2, a: 3, n: 3 }, { k: 11, a: 11, n: 3 }, { k: 2, a: -2, n: 3 }] },
        { items: [{ k: 5, a: 3, n: 2 }, { k: 6, a: 6, n: 2 }, { k: -2, a: 5, n: 2 }, { k: 9, a: 3, n: 2, negDen: true }, { k: 1, a: 2, n: 3 }, { k: 3, a: 3, n: 3 }, { k: 4, a: -2, n: 3 }] },
        { items: [{ k: 2, a: 7, n: 2 }, { k: 10, a: 5, n: 2 }, { k: -6, a: 2, n: 2 }, { k: 1, a: 11, n: 2, negDen: true }, { k: 1, a: 7, n: 3 }, { k: 5, a: 5, n: 3 }, { k: 6, a: -3, n: 3 }] },
        { items: [{ k: 1, a: 6, n: 2 }, { k: 14, a: 7, n: 2 }, { k: -4, a: 2, n: 2 }, { k: 6, a: 3, n: 2, negDen: true }, { k: 2, a: 4, n: 3 }, { k: 7, a: 7, n: 3 }, { k: 3, a: -3, n: 3 }] }
      ] }),
      Q({ aula: 136, n: 1, skill: 'Racionalização: índice n', gen: G['136-1'], params: [
        { items: [{ k: 2, b: 2, m: 1, n: 4 }, { k: 5, b: 5, m: 1, n: 4 }, { k: 1, b: 2, m: 1, n: 5 }, { k: 1, b: 3, m: 1, n: 6 }, { k: -2, b: 2, m: 1, n: 10 }, { k: 1, b: 2, m: 3, n: 5, show: 'num' }, { k: 1, b: 5, m: 9, n: 12, show: 'pow' }, { k: 1, b: 3, m: 3, n: 4, show: 'num' }, { k: 3, b: 3, m: 5, n: 8, show: 'pow' }, { k: 7, b: 7, m: 6, n: 7, show: 'pow' }] },
        { items: [{ k: 3, b: 3, m: 1, n: 4 }, { k: 1, b: 2, m: 1, n: 6 }, { k: -5, b: 5, m: 1, n: 5 }, { k: 1, b: 3, m: 2, n: 4, show: 'num' }, { k: 2, b: 2, m: 4, n: 7, show: 'pow' }] },
        { items: [{ k: 6, b: 3, m: 1, n: 5 }, { k: 1, b: 7, m: 1, n: 4 }, { k: -4, b: 2, m: 1, n: 8 }, { k: 1, b: 2, m: 2, n: 5, show: 'num' }, { k: 5, b: 5, m: 3, n: 6, show: 'pow' }] },
        { items: [{ k: 10, b: 5, m: 1, n: 4 }, { k: 1, b: 3, m: 1, n: 7 }, { k: -3, b: 3, m: 1, n: 5 }, { k: 1, b: 2, m: 4, n: 6, show: 'num' }, { k: 2, b: 2, m: 7, n: 9, show: 'pow' }] }
      ] }),
      Q({ aula: 137, n: 1, skill: 'Racionalização: conjugado', gen: G['137-1'], params: [
        { items: [
          { num: [1, 1], den: [[1, 5], [-1, 3]] }, { num: [4, 1], den: [[1, 7], [1, 3]] }, { num: [1, 2], den: [[1, 13], [-1, 5]] },
          { num: [2, 1], den: [[1, 5], [1, 3]] }, { num: [3, 1], den: [[1, 7], [1, 5]] }, { num: [1, 3], den: [[1, 2], [1, 3]] },
          { num: [10, 1], den: [[5, 1], [-1, 5]] }, { num: [4, 1], den: [[1, 3], [-1, 7]] }, { num: [12, 1], den: [[1, 17], [-1, 11]] }] },
        { items: [{ num: [1, 1], den: [[1, 3], [-1, 2]] }, { num: [6, 1], den: [[1, 5], [1, 2]] }, { num: [1, 5], den: [[1, 7], [-1, 5]] }, { num: [9, 1], den: [[4, 1], [-1, 7]] }, { num: [2, 1], den: [[1, 2], [-1, 6]] }] },
        { items: [{ num: [2, 1], den: [[1, 7], [-1, 5]] }, { num: [5, 1], den: [[1, 6], [1, 1]] }, { num: [1, 2], den: [[1, 3], [1, 2]] }, { num: [4, 1], den: [[3, 1], [-1, 5]] }, { num: [8, 1], den: [[1, 3], [-1, 11]] }] },
        { items: [{ num: [1, 1], den: [[1, 6], [-1, 2]] }, { num: [3, 1], den: [[1, 5], [1, 2]] }, { num: [1, 7], den: [[1, 7], [1, 3]] }, { num: [6, 1], den: [[3, 1], [1, 3]] }, { num: [2, 1], den: [[1, 5], [-1, 7]] }] }
      ] })
    ]
  });
})();
