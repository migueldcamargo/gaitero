/* =====================================================================
   GAITERO MATH — 4º Bimestre · ÁLGEBRA (parte 1)
   Aulas 126 (divisibilidade), 129 (propriedade 1), 130 (média geométrica e
   propriedade 2), 131 (propriedades 3, 4 e 5) e 132 (partes proporcionais).
   Geradores G['126-1'](params) etc. — a montagem da prova fica em bim4-alg2.js.
   ===================================================================== */
(function () {
  'use strict';
  var B4 = window.GM_B4, H = B4.H, F = B4.F, CT = B4.CT, L = B4.L;
  var br = H.br, m = H.m, calc = H.calc, lines = H.lines, small = H.small, aside = H.aside, hl = H.hl, par = H.par;
  var G = B4.G = B4.G || {};
  var r6 = function (v) { return Math.round(v * 1e6) / 1e6; };
  var thousands = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0'); };   // "6 468" sem quebrar a linha

  /* ================= Aula 126 · Q1 — regras de divisibilidade ================= */
  var DIVS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  function divInfo(N) {
    var dg = String(N).split('').map(Number), last = dg[dg.length - 1], sum = H.sum(dg);
    var sumTxt = dg.join(' + ') + ' = ' + sum;
    var l2 = N % 100, l3 = N % 1000;
    // regra do 7: tira o último algarismo e subtrai o dobro dele
    var seven = [], n = N;
    while (n >= 100) {
      var rest = Math.floor(n / 10), u = n % 10, nx = Math.abs(rest - 2 * u);
      seven.push('[[' + rest + ' - 2 * ' + u + ' = ' + rest + ' - ' + 2 * u + ' = ' + (rest - 2 * u) + ']]' + (rest - 2 * u < 0 ? ' → em módulo, ' + nx : ''));
      n = nx;
    }
    // regra do 11: ordens contadas da direita (unidade = 1ª ordem, ímpar)
    var odd = [], even = [];
    dg.slice().reverse().forEach(function (d, i) { (i % 2 === 0 ? odd : even).push(d); });
    var so = H.sum(odd), se = H.sum(even);
    return {
      N: N, last: last, sum: sum, sumTxt: sumTxt, l2: l2, l3: l3, seven: seven, n7: n, odd: odd, even: even, so: so, se: se,
      ok: function (d) { return N % d === 0; }
    };
  }
  function tab(d, v) { // "v está na tabuada do d?" explicado
    if (v === 0) return '0 é divisível por qualquer número (0 = ' + d + ' · 0)';
    var q = Math.floor(v / d);
    return v % d === 0 ? '[[' + d + ' * ' + q + ' = ' + v + ']]: está na tabuada do ' + d
      : '[[' + d + ' * ' + q + ' = ' + d * q + ']] e [[' + d + ' * ' + (q + 1) + ' = ' + d * (q + 1) + ']]: o ' + v + ' fica no meio, não está na tabuada do ' + d;
  }
  var yes = function (ok) { return ok ? ' → <b>é divisível ✓</b>' : ' → <b>não é divisível ✗</b>'; };
  G['126-1'] = function (p) {
    var I = divInfo(p.N), Nt = thousands(p.N), good = DIVS.filter(I.ok);
    var opts = DIVS.map(function (d) { return { id: 'd' + d, html: 'Por ' + d }; }).concat([{ id: 'none', html: 'Por nenhum deles', exclusive: true }]);
    var ruleShort = {
      2: 'o último algarismo é par?', 3: 'a soma dos algarismos está na tabuada do 3?', 4: 'os dois últimos algarismos formam um número da tabuada do 4?',
      5: 'termina em 0 ou 5?', 6: 'é divisível por 2 E por 3 ao mesmo tempo?', 7: 'tire o último algarismo e subtraia o dobro dele do que sobrou.',
      8: 'os três últimos algarismos formam um número divisível por 8?', 9: 'a soma dos algarismos está na tabuada do 9?', 10: 'termina em 0?',
      11: 'some os algarismos das ordens ímpares e das pares e veja a diferença.', 12: 'é divisível por 3 E por 4 ao mesmo tempo?'
    };
    var hints = DIVS.map(function (d) {
      return { when: function (sel) { return sel.has('d' + d) !== I.ok(d); }, msg: 'Confira a regra do <b>' + d + '</b>: ' + ruleShort[d] };
    });
    hints.unshift({ when: function (sel) { return sel.has('none') !== (good.length === 0); }, msg: good.length ? 'Tem número na lista que divide ' + Nt + ', sim! Comece pela regra do 2: olhe o último algarismo.' : 'Confira com calma: será que algum deles divide mesmo?' });
    var r2 = 'O último algarismo é <b>' + I.last + '</b>' + (I.last % 2 === 0 ? ', que é par (0, 2, 4, 6 ou 8)' : ', que é ímpar') + yes(I.ok(2));
    var r5 = 'Termina em <b>' + I.last + '</b>' + (I.last === 0 || I.last === 5 ? '' : ', e não em 0 nem em 5') + yes(I.ok(5));
    var r10 = 'Termina em <b>' + I.last + '</b>' + (I.last === 0 ? '' : ', e não em 0') + yes(I.ok(10));
    var steps = [
      { t: 'O que é ser divisível?', cls: 'concept', b: 'Um número é <b>divisível</b> por outro quando a divisão dá <b>exata</b>, sem sobrar resto. Exemplo: 12 é divisível por 3 ([[12 = 3 * 4]]), mas 13 não é (sobra 1).<br>Fazer 11 divisões de ' + Nt + ' daria muito trabalho. Por isso existem as <b>regras de divisibilidade</b>: olhando só para alguns algarismos, a gente descobre se a divisão vai ser exata.' },
      { t: 'Olhando o último algarismo: 2, 5 e 10', b: '<b>Regra do 2:</b> ' + r2 + '.<br><b>Regra do 5:</b> ' + r5 + '.<br><b>Regra do 10:</b> ' + r10 + '.' },
      { t: 'Somando os algarismos: 3 e 9', b: 'Somamos todos os algarismos de ' + Nt + ':' + calc(m(I.sumTxt)) +
          '<b>Regra do 3:</b> ' + tab(3, I.sum) + yes(I.ok(3)) + '.<br><b>Regra do 9:</b> ' + tab(9, I.sum) + yes(I.ok(9)) + '.' },
      { t: 'Os últimos algarismos: 4 e 8', b: '<b>Regra do 4:</b> olhamos os <b>dois últimos</b> algarismos: ' + I.l2 + '. ' + tab(4, I.l2) + yes(I.ok(4)) + '.<br>' +
          '<b>Regra do 8:</b> olhamos os <b>três últimos</b> algarismos: ' + I.l3 + '. ' + (I.l3 % 8 === 0 ? '[[' + I.l3 + ' = 8 * ' + I.l3 / 8 + ']]' : 'Dividindo ' + I.l3 + ' por 8: [[8 * ' + Math.floor(I.l3 / 8) + ' = ' + 8 * Math.floor(I.l3 / 8) + ']] e sobra ' + I.l3 % 8) + yes(I.ok(8)) + '.' },
      { t: 'Juntando duas regras: 6 e 12', b: '<b>Regra do 6:</b> precisa ser divisível por 2 <b>e</b> por 3 ao mesmo tempo (porque [[6 = 2 * 3]]). Por 2: ' + (I.ok(2) ? 'sim' : 'não') + '. Por 3: ' + (I.ok(3) ? 'sim' : 'não') + yes(I.ok(6)) + '.<br>' +
          '<b>Regra do 12:</b> precisa ser divisível por 3 <b>e</b> por 4 ao mesmo tempo (porque [[12 = 3 * 4]]). Por 3: ' + (I.ok(3) ? 'sim' : 'não') + '. Por 4: ' + (I.ok(4) ? 'sim' : 'não') + yes(I.ok(12)) + '.' +
          aside('Por que não vale "2 e 6" para o 12? Porque 2 e 6 já têm o 2 em comum: o 18 é divisível por 2 e por 6, mas não por 12.') },
      { t: 'Regra do 7', b: 'A regra do 7 é diferente: <b>tiramos o último algarismo</b> e, do número que sobrou, <b>subtraímos o dobro</b> desse algarismo. Repetimos até o número ficar pequeno:' + lines(I.seven) +
          'Chegamos em <b>' + I.n7 + '</b>. ' + tab(7, I.n7) + yes(I.ok(7)) + '.' },
      { t: 'Regra do 11', b: 'Contamos as <b>ordens</b> da direita para a esquerda: a unidade é a 1ª ordem, a dezena é a 2ª, e assim vai. Somamos os algarismos das ordens <b>ímpares</b> (1ª, 3ª…) e das ordens <b>pares</b> (2ª, 4ª…):' +
          lines(['Ordens ímpares: [[' + I.odd.join(' + ') + ' = ' + I.so + ']]', 'Ordens pares: [[' + I.even.join(' + ') + ' = ' + I.se + ']]', 'Diferença: [[' + Math.max(I.so, I.se) + ' - ' + Math.min(I.so, I.se) + ' = ' + Math.abs(I.so - I.se) + ']]']) +
          (Math.abs(I.so - I.se) === 0 ? 'A diferença é <b>0</b>, e 0 é divisível por 11' : tab(11, Math.abs(I.so - I.se))) + yes(I.ok(11)) + '.' },
      { t: 'Resposta final', cls: 'final', b: good.length ? Nt + ' é divisível por <b>' + H.listPT(good) + '</b>.<br>Não é divisível por ' + H.listPT(DIVS.filter(function (d) { return !I.ok(d); })) + '.' : Nt + ' não é divisível por nenhum desses números.' },
      { t: 'Conferindo se faz sentido', cls: 'check', b: good.length ? 'Fazendo as divisões de verdade, todas as que deram "sim" são exatas:' + lines(good.map(function (d) { return '[[' + Nt.replace(/\s/g, '') + ' = ' + d + ' * ' + p.N / d + ']]'; })) : 'Nenhuma divisão foi exata ✓.' }
    ];
    return {
      prompt: 'Dizer se o número ' + Nt + ' é divisível por 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ou 12. Justificar.',
      note: 'No app: marque <b>todos</b> os números que dividem ' + Nt + '. A justificativa, regra por regra, está na ❔ resolução.',
      items: [{
        key: 'u',
        answer: { type: 'multiSelect', options: opts, correct: good.length ? good.map(function (d) { return 'd' + d; }) : ['none'] },
        hint: { rules: ['div-regras', 'div-7-11'], tip: 'Não precisa fazer 11 divisões! Comece pelo mais fácil: olhe o <b>último algarismo</b> (regras do 2, do 5 e do 10).',
          more: ['Agora <b>some os algarismos</b>: essa soma serve para as regras do 3 e do 9.', 'Para o 6 e o 12, junte duas regras: 6 → por 2 <b>e</b> por 3; 12 → por 3 <b>e</b> por 4. O 7 e o 11 têm regras especiais: veja no Papel de Cola.'] },
        hints: hints,
        final: good.length ? 'Divisível por ' + H.listPT(good) : 'Por nenhum',
        steps: { list: steps }
      }]
    };
  };

  /* ================= Aula 126 · Q2 — o menor divisível por todos (MMC) ================= */
  G['126-2'] = function (p) {
    var nums = p.nums, M = nums.reduce(H.lcm, 1);
    var fac = nums.map(function (n) { return H.factor(n); });
    var primes = {};
    fac.forEach(function (f, i) { Object.keys(f).forEach(function (q) { if (!primes[q] || f[q] > primes[q].e) primes[q] = { e: f[q], from: nums[i] }; }); });
    var pk = Object.keys(primes).map(Number).sort(function (a, b) { return a - b; });
    var fTxt = function (f) { var ks = Object.keys(f); return ks.length ? ks.map(function (q) { return q + (f[q] > 1 ? '^' + f[q] : ''); }).join(' * ') : '1'; };
    var powers = pk.map(function (q) { return Math.pow(q, primes[q].e); });
    var chain = [], acc = powers[0], timesHtml = '';
    for (var i = 1; i < powers.length; i++) {
      chain.push('[[' + acc + ' * ' + powers[i] + ' = ' + acc * powers[i] + ']]');
      if (CT.needsArmada(acc, powers[i])) timesHtml += CT.howTimes(acc, powers[i]);
      acc *= powers[i];
    }
    var list = H.listPT(nums.map(String));
    var prod = nums.reduce(function (a, b) { return a * b; }, 1);
    var hints = [
      { when: function (v) { return v > M && nums.every(function (n) { return v % n === 0; }); }, msg: 'Esse número é mesmo divisível por todos, mas <b>não é o menor</b>. Use só o maior expoente de cada fator primo.' },
      { when: function (v) { return Number.isInteger(v) && v > 0 && nums.some(function (n) { return v % n !== 0; }); }, msg: 'Teste a divisão: esse número <b>não</b> é divisível por todos da lista. Confira se pegou o <b>maior expoente</b> de cada fator primo.' }
    ];
    return {
      prompt: 'Qual é o menor inteiro positivo divisível por ' + list + '?',
      items: [{
        key: 'u',
        answer: { type: 'integer', value: M, placeholder: 'O número' },
        hint: { rules: ['mmc'], tip: 'Esse número é o <b>MMC</b> (mínimo múltiplo comum) de todos eles.',
          more: ['Decomponha cada número em <b>fatores primos</b> (ex.: [[12 = 2^2 * 3]]).', 'Pegue cada primo uma vez só, com o <b>maior expoente</b> que aparecer, e multiplique.'] },
        hints: hints,
        final: br(M),
        steps: { list: [
          { t: 'O que a questão pede?', cls: 'concept', b: 'Um número que seja divisível por <b>todos</b> esses números ao mesmo tempo é um <b>múltiplo comum</b> deles. O <b>menor</b> deles se chama <b>MMC</b> (mínimo múltiplo comum).<br>Exemplo pequeno, com 4 e 6:' +
              lines(['Múltiplos de 4: 4, 8, <b>12</b>, 16, 20, <b>24</b>…', 'Múltiplos de 6: 6, <b>12</b>, 18, <b>24</b>…']) + 'Os comuns são 12, 24…: o menor é <b>12</b>. Então [[MMC(4, 6) = 12]].' },
          { t: 'Por que não multiplicar tudo?', b: 'Multiplicando todos os números ([[' + nums.join(' * ') + ']]) dá ' + br(prod) + ': ele é divisível por todos, mas é <b>grande demais</b>. Muitos fatores se repetem: por exemplo, ' + (nums.indexOf(8) >= 0 && nums.indexOf(4) >= 0 ? 'quem é divisível por 8 já é divisível por 4 e por 2.' : 'o mesmo primo aparece em vários números.') + '<br>O jeito certo é usar os <b>fatores primos</b>.' },
          { t: 'Decompondo em fatores primos', b: 'Escrevemos cada número como multiplicação de números primos (2, 3, 5, 7, 11…):' +
              lines(nums.map(function (n, i) { return '[[' + n + ' = ' + fTxt(fac[i]) + ']]' + (Object.keys(fac[i]).length === 1 && fac[i][n] === 1 ? small(n + ' já é primo') : ''); })) },
          { t: 'O maior expoente de cada primo', b: 'Para ser divisível por todos, o número precisa ter <b>cada primo</b> com o <b>maior expoente</b> que apareceu:' +
              lines(pk.map(function (q) { var e = primes[q].e; return '[[' + q + (e > 1 ? '^' + e + ' = ' + Math.pow(q, e) : '') + ']]' + small(e > 1 ? 'por causa do ' + primes[q].from : 'aparece no ' + primes[q].from); })) +
              aside('Se usássemos um expoente menor, o número deixaria de ser divisível por algum deles. Por exemplo: sem um dos fatores do ' + primes[pk[0]].from + ', o número não seria divisível por ' + primes[pk[0]].from + '.') },
          { t: 'Multiplicando', b: 'Agora multiplicamos esses fatores, um de cada vez:' + calc(m(powers.join(' * '))) + lines(chain) + timesHtml },
          { t: 'Resposta final', cls: 'final', b: 'O menor inteiro positivo divisível por ' + list + ' é <b>' + br(M) + '</b>.' },
          { t: 'Conferindo se faz sentido', cls: 'check', b: 'Todas as divisões dão exatas:' + lines(nums.map(function (n) { return '[[' + M + ' = ' + n + ' * ' + M / n + ']]'; })) }
        ] }
      }]
    };
  };

  /* ================= Aula 129 · Q1 — a proporção é válida? ================= */
  // spec numérico: { a, b, c, d } (números, podem ser decimais/negativos)
  // spec com raiz: { rad: true, p, q, r, s } → √p/√q = r/s
  function propCheckItem(key, sp) {
    var R = sp.rad, txt, ad, bc, adV, bcV, ok, adHow, bcHow, extra = '', checkTxt;
    if (R) {
      txt = 'frac{√' + sp.p + '}{√' + sp.q + '} = frac{' + sp.r + '}{' + sp.s + '}';
      ad = '√' + sp.p + ' * ' + sp.s + ' = ' + sp.s + '√' + sp.p; bc = '√' + sp.q + ' * ' + sp.r + ' = ' + sp.r + '√' + sp.q;
      adV = sp.s * sp.s * sp.p; bcV = sp.r * sp.r * sp.q; ok = adV === bcV;
      extra = 'Os dois produtos têm raiz. Para comparar, elevamos cada um ao <b>quadrado</b> (multiplicamos ele por ele mesmo). Se os quadrados forem iguais, os números também são:' +
        lines(['[[(' + sp.s + '√' + sp.p + ')^2 = ' + sp.s + '^2 * (√' + sp.p + ')^2 = ' + sp.s * sp.s + ' * ' + sp.p + ' = ' + adV + ']]', '[[(' + sp.r + '√' + sp.q + ')^2 = ' + sp.r + '^2 * (√' + sp.q + ')^2 = ' + sp.r * sp.r + ' * ' + sp.q + ' = ' + bcV + ']]']) +
        aside('Lembre: [[(√5)^2 = √5 * √5 = 5]]. A raiz quadrada e o "ao quadrado" se desfazem.');
      checkTxt = 'Com a calculadora: [[frac{√' + sp.p + '}{√' + sp.q + '} ≈ ' + br(Math.sqrt(sp.p / sp.q), 3) + ']] e [[frac{' + sp.r + '}{' + sp.s + '} ≈ ' + br(sp.r / sp.s, 3) + ']] — ' + (ok ? 'iguais ✓' : 'diferentes ✓') + '.';
    } else {
      var a = sp.a, b = sp.b, c = sp.c, d = sp.d;
      txt = 'frac{' + br(a) + '}{' + br(b) + '} = frac{' + br(c) + '}{' + br(d) + '}';
      adV = r6(a * d); bcV = r6(b * c); ok = Math.abs(adV - bcV) < 1e-9;
      ad = par(a) + ' * ' + par(d) + ' = ' + br(adV); bc = par(b) + ' * ' + par(c) + ' = ' + br(bcV);
      var signNote = function (x, y) {
        var n = [];
        if (x < 0 && y < 0) n.push('menos com menos dá <b>mais</b>');
        else if (x < 0 || y < 0) n.push('mais com menos dá <b>menos</b>');
        [x, y].forEach(function (v) { if (Math.abs(v) === 0.5) n.push('0,5 é a <b>metade</b>: multiplicar por 0,5 é pegar a metade'); });
        return n.length ? small(n.join('; ')) : '';
      };
      adHow = signNote(a, d); bcHow = signNote(b, c);
      checkTxt = 'Fazendo as divisões: [[frac{' + br(a) + '}{' + br(b) + '} = ' + br(r6(a / b), 3) + ']] e [[frac{' + br(c) + '}{' + br(d) + '} = ' + br(r6(c / d), 3) + ']] — ' + (ok ? 'o mesmo valor ✓' : 'valores diferentes ✓') + '.';
    }
    var A = R ? '√' + sp.p : br(sp.a), Bv = R ? '√' + sp.q : br(sp.b), C = R ? String(sp.r) : br(sp.c), D = R ? String(sp.s) : br(sp.d);
    return {
      key: key, label: key + ')', prompt: m(txt),
      answer: { type: 'choice', layout: 'list', correct: ok ? 'sim' : 'nao', options: [
        { id: 'sim', html: 'Sim, é uma proporção válida', hint: 'Multiplique em cruz com calma: o produto dos <b>extremos</b> deu mesmo igual ao produto dos <b>meios</b>?' },
        { id: 'nao', html: 'Não é uma proporção válida', hint: 'Multiplique em cruz com calma: compare o produto dos <b>extremos</b> com o produto dos <b>meios</b>.' }
      ] },
      hint: { rules: ['proporcao', 'prop-1'], tip: 'Uma proporção é válida quando o <b>produto dos extremos</b> é igual ao <b>produto dos meios</b>.',
        more: ['Os extremos são o número de cima da 1ª fração e o de baixo da 2ª. Os meios são os outros dois.', 'Multiplique os extremos, depois os meios, e compare os dois resultados.'] },
      final: ok ? 'É válida' : 'Não é válida',
      steps: { list: [
        { t: 'O que é uma proporção?', cls: 'concept', b: 'Uma <b>proporção</b> é uma igualdade entre duas frações (razões) que valem a <b>mesma coisa</b>. Exemplo: [[frac{1}{2} = frac{2}{4}]] — metade de uma pizza é o mesmo que 2 pedaços de uma pizza cortada em 4.<br>' +
            'Na proporção [[frac{a}{b} = frac{c}{d}]], os números ' + hl('a', 'a') + ' e ' + hl('d', 'a') + ' são os <b>extremos</b> (as pontas) e ' + hl('b', 'b') + ' e ' + hl('c', 'b') + ' são os <b>meios</b>.<br><b>Propriedade 1:</b> a proporção é válida quando [[a * d = b * c]] (produto dos extremos = produto dos meios). No exemplo: [[1 * 4 = 4]] e [[2 * 2 = 4]] ✓.' },
        { t: 'Quem são os extremos e os meios?', b: 'Em [[' + txt + ']]:<br>Extremos: ' + hl(m(A), 'a') + ' e ' + hl(m(D), 'a') + '<br>Meios: ' + hl(m(Bv), 'b') + ' e ' + hl(m(C), 'b') },
        { t: 'Produto dos extremos', b: lines(['[[' + ad + ']]' + (adHow || '')]) },
        { t: 'Produto dos meios', b: lines(['[[' + bc + ']]' + (bcHow || '')]) },
        { t: 'Comparando os dois produtos', b: (extra || '') + (R
            ? 'Os quadrados deram <b>' + adV + '</b> e <b>' + bcV + '</b>: ' + (ok ? 'iguais. Então os produtos são iguais.' : 'diferentes. Então os produtos são diferentes.')
            : 'Produto dos extremos: <b>' + br(adV) + '</b>. Produto dos meios: <b>' + br(bcV) + '</b>. ' + (ok ? 'São <b>iguais</b>!' : 'São <b>diferentes</b>!')) },
        { t: 'Resposta final', cls: 'final', b: ok ? 'Como os produtos são iguais, a proporção <b>é válida</b>.' : 'Como os produtos são diferentes, a proporção <b>não é válida</b>.' },
        { t: 'Conferindo se faz sentido', cls: 'check', b: checkTxt }
      ] }
    };
  }
  G['129-1'] = function (p) {
    return { prompt: 'Verifique se são válidas as proporções a seguir:', items: p.items.map(function (sp, i) { return propCheckItem('abcd'[i], sp); }) };
  };

  /* ================= Aula 129 · Q2 — o termo que falta ================= */
  // sp = { v: [a, b, c, d] com null no termo desconhecido, letter }
  function findTermItem(key, sp) {
    var v = sp.v, k = v.indexOf(null), X = sp.letter;
    var shown = v.map(function (x) { return x === null ? X : br(x); });
    var txt = 'frac{' + shown[0] + '}{' + shown[1] + '} = frac{' + shown[2] + '}{' + shown[3] + '}';
    // extremos: 0 e 3; meios: 1 e 2
    var xPair = k === 0 || k === 3, partner = xPair ? (k === 0 ? 3 : 0) : (k === 1 ? 2 : 1);
    var others = xPair ? [1, 2] : [0, 3];
    var prod = v[others[0]] * v[others[1]], coef = v[partner];
    var val = prod / coef, g = H.gcd(prod, coef), sn = prod / g, sd = coef / g, exact = Number.isInteger(val);
    var leftSide = xPair ? 'extremos' : 'meios', rightSide = xPair ? 'meios' : 'extremos';
    var dv = H.divide(prod, coef, { maxDec: 2 });
    var nice = Number.isInteger(r6(val * 100));
    var finalTxt = exact ? br(val) : (nice ? m(H.fracTxt(prod, coef)) + ' = ' + br(val) : m(H.fracTxt(prod, coef)) + ' ≈ ' + br(Math.round(val * 100) / 100, 2));
    var steps = [
      { t: 'Lembrete: a propriedade 1', cls: 'concept', b: 'Em toda proporção, o <b>produto dos extremos</b> é igual ao <b>produto dos meios</b>. É a famosa "multiplicação em cruz" (em X):' + calc('[[frac{a}{b} = frac{c}{d}]] → [[a * d = b * c]]') + 'Assim, uma proporção com uma letra vira uma conta que a gente sabe resolver.' },
      { t: 'Multiplicando em cruz', b: 'Em [[' + txt + ']], a letra ' + m(X) + ' está nos <b>' + leftSide + '</b>. Igualamos os dois produtos:' +
          lines(['[[' + (xPair ? shown[0] + ' * ' + shown[3] : shown[1] + ' * ' + shown[2]) + ' = ' + (xPair ? shown[1] + ' * ' + shown[2] : shown[0] + ' * ' + shown[3]) + ']]' + small('produto dos ' + leftSide + ' = produto dos ' + rightSide)]) },
      { t: 'Fazendo a multiplicação que já dá', b: 'Do lado sem letra, multiplicamos:' + calc(m(br(v[others[0]]) + ' * ' + br(v[others[1]]) + ' = ' + br(prod))) + CT.howTimes(v[others[0]], v[others[1]]) +
          'A conta fica:' + calc(m(br(coef) + X + ' = ' + br(prod))) + aside(m(br(coef) + X) + ' quer dizer "' + br(coef) + ' vezes ' + X + '".') },
      { t: 'Deixando a letra sozinha', b: 'O ' + br(coef) + ' está <b>multiplicando</b> o ' + m(X) + '. Para desfazer, ele passa para o outro lado <b>dividindo</b>:' + calc(m(X + ' = frac{' + br(prod) + '}{' + br(coef) + '}')) + (dv.inline || 'Vamos fazer essa divisão:') }
    ].concat(dv.steps);
    if (!exact) {
      steps.push({ t: 'Simplificando a fração', b: (g > 1 ? 'Os dois números da fração são divisíveis por <b>' + g + '</b>. Dividindo em cima e embaixo por ' + g + ', a fração continua valendo o mesmo:' + calc(m(X + ' = frac{' + prod + '}{' + coef + '} = frac{' + sn + '}{' + sd + '}')) : 'A fração [[frac{' + prod + '}{' + coef + '}]] já não dá para simplificar.') +
        (nice ? 'Em decimal, ' + m(H.fracTxt(prod, coef)) + ' = ' + br(val) + '.' : 'Ela não dá um decimal exato: [[' + H.fracTxt(prod, coef) + ' ≈ ' + br(Math.round(val * 100) / 100, 2) + ']]. Pode responder com a fração mesmo.') });
    }
    steps.push({ t: 'Resposta final', cls: 'final', b: m(X) + ' = <b>' + finalTxt + '</b>' });
    var w = v.slice(); w[k] = val;
    steps.push({ t: 'Conferindo se faz sentido', cls: 'check', b: 'Colocando ' + m(X + ' = ' + (exact || nice ? br(val) : H.fracTxt(prod, coef))) + ' de volta e multiplicando em cruz:' +
      lines(['Extremos: [[' + br(r6(w[0] * w[3])) + ']]', 'Meios: [[' + br(r6(w[1] * w[2])) + ']]']) + 'Deram iguais ✓.' });
    var wrong = [];
    var alt1 = v[partner] * v[others[0]] / v[others[1]], alt2 = v[partner] * v[others[1]] / v[others[0]];
    [alt1, alt2].forEach(function (a) { if (Math.abs(a - val) > 0.02) wrong.push({ when: a, tol: 0.01, msg: 'Cuidado com o cruzamento: multiplique em <b>X</b>, o número de <b>cima</b> de uma fração com o de <b>baixo</b> da outra.' }); });
    return {
      key: key, label: key + ')', prompt: m(txt),
      answer: { type: 'number', value: val, tol: exact || nice ? 1e-6 : 0.01, placeholder: X + ' =', neg: true, help: exact ? '' : 'Pode responder como fração (ex.: 7/4) ou decimal' + (nice ? '.' : ' com duas casas.') },
      hint: { rules: ['prop-1'], tip: 'Use a <b>multiplicação em cruz</b>: produto dos extremos = produto dos meios.',
        more: ['Do lado que não tem letra, faça a multiplicação. Fica algo como "número vezes ' + X + ' = número".', 'O número que multiplica a letra passa para o outro lado <b>dividindo</b>.'] },
      hints: wrong,
      final: finalTxt,
      steps: { list: steps }
    };
  }
  G['129-2'] = function (p) {
    return { prompt: 'Determine o valor do termo representado nas proporções a seguir:', items: p.items.map(function (sp, i) { return findTermItem('abcd'[i], sp); }) };
  };

  /* ================= Aula 130 · Q1 — média geométrica ================= */
  function sqrtExplain(P) {   // √P: inteiro (com explicação) ou simplificado s√k
    var r = Math.round(Math.sqrt(P));
    if (r * r === P) {
      var how = P <= 144 ? 'Pela tabuada: [[' + r + ' * ' + r + ' = ' + P + ']].'
        : 'Estimando: [[' + Math.floor(r / 10) * 10 + ' * ' + Math.floor(r / 10) * 10 + ' = ' + Math.pow(Math.floor(r / 10) * 10, 2) + ']] e [[' + (Math.floor(r / 10) + 1) * 10 + ' * ' + (Math.floor(r / 10) + 1) * 10 + ' = ' + Math.pow((Math.floor(r / 10) + 1) * 10, 2) + ']]: a raiz está entre ' + Math.floor(r / 10) * 10 + ' e ' + (Math.floor(r / 10) + 1) * 10 + '. Como ' + P + ' termina em ' + (P % 10) + ', testamos [[' + r + ' * ' + r + ' = ' + P + ']] ✓.' + CT.howTimes(r, r);
      return { exact: true, val: r, txt: String(r), how: how };
    }
    var s = 1;
    for (var t = 2; t * t <= P; t++) if (P % (t * t) === 0) s = t;
    var k = P / (s * s);
    return { exact: false, val: Math.sqrt(P), s: s, k: k, txt: (s > 1 ? s : '') + '√' + k,
      how: s > 1 ? P + ' não é quadrado perfeito (nenhum número inteiro vezes ele mesmo dá ' + P + '). Mas dá para <b>simplificar</b>: procuramos um quadrado perfeito que divide ' + P + ': [[' + P + ' = ' + s * s + ' * ' + k + ']]. Então:' + calc(m('√' + P + ' = √{' + s * s + ' * ' + k + '} = √' + (s * s) + ' * √' + k + ' = ' + s + '√' + k)) + aside('Usamos a propriedade [[√{a * b} = √a * √b]] e que [[√' + s * s + ' = ' + s + ']].')
        : P + ' não é quadrado perfeito e não dá para simplificar: a resposta fica [[√' + P + ']].' };
  }
  function geoItem(key, sp) {
    var R = sp.ra != null, a = R ? sp.ra : sp.a, b = R ? sp.rb : sp.b;
    var P = a * b, steps = [], res;
    var title = R ? m('√' + a) + ' e ' + m('√' + b) : a + ' e ' + b;
    steps.push({ t: 'O que é média geométrica?', cls: 'concept', b: 'A <b>média geométrica</b> de dois números positivos [[a]] e [[b]] é [[√{a * b}]]: multiplicamos os dois e tiramos a raiz quadrada.<br>Ela é o número que, <b>multiplicado por ele mesmo</b>, dá o mesmo que [[a * b]]. Exemplo com 2 e 8: [[2 * 8 = 16]] e [[√16 = 4]]. De fato, [[4 * 4 = 16 = 2 * 8]].' +
      aside('Não confunda com a média aritmética (somar e dividir por 2): a de 2 e 8 seria 5.') });
    if (R) {
      var r0 = Math.round(Math.sqrt(P));
      steps.push({ t: 'Multiplicando os dois números', b: 'Os números já são raízes. Raízes quadradas se multiplicam juntando o que está dentro:' + calc(m('√' + a + ' * √' + b + ' = √{' + a + ' * ' + b + '} = √' + P + ' = ' + r0)) + aside('[[' + r0 + ' * ' + r0 + ' = ' + P + ']], por isso [[√' + P + ' = ' + r0 + ']].') });
      P = r0;
      var e2 = sqrtExplain(P);
      steps.push({ t: 'Tirando a raiz quadrada', b: 'A média geométrica é a raiz do produto:' + calc(m('√{√' + a + ' * √' + b + '} = √' + P)) + e2.how });
      res = e2;
    } else {
      steps.push({ t: 'Multiplicando os dois números', b: calc(m(a + ' * ' + b + ' = ' + P)) + CT.howTimes(a, b) });
      res = sqrtExplain(P);
      steps.push({ t: 'Tirando a raiz quadrada', b: 'A média geométrica é a raiz quadrada do produto:' + calc(m('√{' + a + ' * ' + b + '} = √' + P)) + res.how });
    }
    steps.push({ t: 'Resposta final', cls: 'final', b: 'A média geométrica de ' + title + ' é <b>' + m(res.txt) + '</b>.' });
    steps.push({ t: 'Conferindo se faz sentido', cls: 'check', b: res.exact ? '[[' + res.val + ' * ' + res.val + ' = ' + P + ']] ✓. ' + (R ? '' : 'E a média ficou entre ' + Math.min(a, b) + ' e ' + Math.max(a, b) + ' ✓.')
      : '[[(' + res.txt + ')^2 = ' + res.s + '^2 * ' + res.k + ' = ' + res.s * res.s + ' * ' + res.k + ' = ' + P + ']] ✓. Aproximando: [[' + res.txt + ' ≈ ' + br(res.val, 2) + ']], entre ' + Math.min(a, b) + ' e ' + Math.max(a, b) + ' ✓.' });
    var answer = res.exact ? { type: 'number', value: res.val, placeholder: 'Média geométrica' }
      : { type: 'radical', value: res.val, canonical: res.txt };
    var wrongs = [];
    if (!R && Math.abs((a + b) / 2 - res.val) > 1e-9) wrongs.push({ when: (a + b) / 2, msg: 'Essa é a média <b>aritmética</b> (soma dividida por 2). A geométrica é [[√{a * b}]].' });
    if (Math.abs(P - res.val) > 1e-9) wrongs.push({ when: P, msg: 'Esse é o <b>produto</b>. Falta tirar a <b>raiz quadrada</b>.' });
    return {
      key: key, label: key + ')', prompt: title,
      answer: answer,
      hint: { rules: ['media-geo'], tip: 'Média geométrica = [[√{a * b}]]: multiplique os dois números e tire a raiz quadrada.',
        more: [R ? 'Raízes se multiplicam juntando o de dentro: [[√a * √b = √{a * b}]].' : 'Primeiro faça [[' + a + ' * ' + b + ']].', 'Qual número vezes ele mesmo dá o produto? Se não for exato, simplifique a raiz.'] },
      hints: wrongs,
      final: m(res.txt),
      steps: { list: steps }
    };
  }
  G['130-1'] = function (p) {
    return { prompt: 'Calcule a média geométrica dos números:', items: p.items.map(function (sp, i) { return geoItem('abcdef'[i], sp); }) };
  };

  /* ================= Divisão em partes proporcionais (130, 131, 132) ================= */
  // o = { total, weights, names (ex.: ['do 2', 'do 3']), unit ('' | ' cm' | '°'...), intro, totalTxt }
  function partsSteps(o) {
    var w = o.weights, S = H.sum(w), T = o.total, part = r6(T / S), vals = w.map(function (x) { return r6(x * part); });
    var u = o.unit || '', labs = o.names.map(function (n) { return 'Parte ' + n; });
    var bar = function (withVals) { return F.partsBar({ weights: w, labels: labs, total: br(T) + u, unit: withVals ? br(part) + u : null, values: withVals ? vals.map(function (v) { return br(v); }) : null }); };
    var dv = H.divide(T, S, { maxDec: 4 });
    var steps = [
      { t: 'Entenda o problema', b: o.intro || ('Precisamos dividir <b>' + br(T) + u + '</b> em ' + w.length + ' partes. Elas <b>não</b> serão iguais: a divisão é proporcional a ' + H.listPT(w.map(String)) + '. É como se, para cada ' + w[0] + (w[0] === 1 ? ' pedaço' : ' pedaços') + ' do primeiro, o segundo recebesse ' + w[1] + (w[1] === 1 ? ' pedaço' : ' pedaços') + (w.length > 2 ? ' e o terceiro ' + w[2] : '') + '.') },
      { t: 'Quantas partes existem?', b: 'Somamos os números da proporção:' + calc(m(w.join(' + ') + ' = ' + S)) + 'Isso significa que vamos dividir o total em <b>' + S + ' partes iguais</b>.', fig: bar(false) },
      { t: 'Quanto vale cada parte?', b: 'Dividimos o total pelo número de partes:' + calc(m('frac{' + br(T) + '}{' + S + '}')) + (dv.inline || 'Vamos fazer a divisão:') }
    ].concat(dv.steps).concat([
      { t: 'Cada parte vale ' + br(part) + u, b: 'Então cada uma das ' + S + ' partes vale <b>' + br(part) + u + '</b>.' }
    ]);
    w.forEach(function (x, i) {
      steps.push({ t: 'A parte ' + o.names[i], b: 'A parte ' + o.names[i] + ' recebe <b>' + x + (x === 1 ? ' parte' : ' partes') + '</b>:' + CT.timesBlock(x, part).replace('</div>', u ? ' ' + u.trim() + '</div>' : '</div>'), fig: i === w.length - 1 ? bar(true) : undefined });
    });
    var check = 'Somando as partes: [[' + vals.map(function (v) { return br(v); }).join(' + ') + ' = ' + br(r6(H.sum(vals))) + ']]' + u + ', o total ✓.<br>E a proporção se mantém: [[frac{' + br(vals[0]) + '}{' + br(vals[1]) + '} = frac{' + w[0] + '}{' + w[1] + '}]] ✓ (dividindo em cima e embaixo por ' + br(part) + ').';
    return { steps: steps, vals: vals, part: part, S: S, check: check };
  }
  B4.partsSteps = partsSteps;
  function partsHints(T, w, vals) {
    var S = H.sum(w), out = [];
    out.push({ when: function (v) { return v.every(function (x) { return Math.abs(x - T / w.length) < 1e-6; }); }, msg: 'Você dividiu em partes <b>iguais</b>. A divisão é <b>proporcional</b>: quem tem peso maior recebe mais.' });
    out.push({ when: function (v) { return Math.abs(H.sum(v) - T) > 1e-6; }, msg: 'Some as suas respostas: precisam dar o total, ' + br(T) + '.' });
    out.push({ when: function (v) { return v.every(function (x, i) { return Math.abs(x - vals[vals.length - 1 - i]) < 1e-6; }); }, msg: 'Os valores estão certos, mas trocados de lugar: quem tem o número maior na proporção recebe mais.' });
    out.push({ when: function () { return true; }, msg: 'Confira: some os números da proporção (' + w.join(' + ') + '), divida o total por esse resultado e multiplique por cada número.' });
    return out;
  }
  // 130 Q2: dividir um total em partes proporcionais (itens a–d)
  function partsItem(key, T, w) {
    var R = partsSteps({ total: T, weights: w, names: w.map(function (x) { return 'do ' + x; }) });
    return {
      key: key, label: key + ')', prompt: w.join(' e '),
      answer: { type: 'numberList', values: R.vals, ordered: true, labels: w.map(function (x) { return 'Parte do ' + x; }) },
      hint: { rules: ['partes-prop'], tip: 'Some os números da proporção: é o número de <b>partes iguais</b>.',
        more: ['Divida ' + br(T) + ' por essa soma: é quanto vale <b>cada parte</b>.', 'Multiplique o valor de cada parte por ' + w[0] + ' e por ' + w[1] + '.'] },
      hints: partsHints(T, w, R.vals),
      final: R.vals.map(function (v) { return br(v); }).join(' e '),
      steps: { list: R.steps.concat([
        { t: 'Resposta final', cls: 'final', b: 'As partes são <b>' + br(R.vals[0]) + '</b> (proporcional a ' + w[0] + ') e <b>' + br(R.vals[1]) + '</b> (proporcional a ' + w[1] + ').' },
        { t: 'Conferindo se faz sentido', cls: 'check', b: R.check }
      ]) }
    };
  }
  G['130-2'] = function (p) {
    return { prompt: 'Dividir ' + thousands(p.total) + ' em partes proporcionais a:', items: p.items.map(function (w, i) { return partsItem('abcd'[i], p.total, w); }) };
  };

  // 130 Q3: ponto M no segmento AB
  G['130-3'] = function (p) {
    var T = p.len, w = p.w, R = partsSteps({ total: T, weights: w, unit: ' cm', names: ['AM', 'MB'],
      intro: 'O segmento AB mede ' + br(T) + ' cm. O ponto M divide AB em dois pedaços, AM e MB, <b>proporcionais a ' + w[0] + ' e ' + w[1] + '</b>, nessa ordem: AM tem ' + w[0] + ' partes e MB tem ' + w[1] + ' partes do mesmo tamanho.' });
    R.steps[0].fig = F.segment({ a: w[0], b: w[1], la: 'AM = ?', lb: 'MB = ?', total: br(T) + ' cm' });
    return {
      prompt: 'Escolha um ponto M no segmento [[AB]], de ' + br(T) + ' cm, A à esquerda de B, de maneira que o segmento fique dividido em partes proporcionais a ' + w[0] + ' e ' + w[1] + ', nessa ordem. Quanto medem os segmentos [[AM]] e [[MB]]?',
      figure: F.segment({ a: w[0], b: w[1], la: 'AM', lb: 'MB', total: br(T) + ' cm' }),
      items: [{
        key: 'u',
        answer: { type: 'numberList', values: R.vals, ordered: true, labels: ['[[AM]] (cm)', '[[MB]] (cm)'] },
        hint: { rules: ['partes-prop'], tip: 'O segmento inteiro (' + br(T) + ' cm) é dividido em [[' + w[0] + ' + ' + w[1] + ']] partes iguais.',
          more: ['Quanto mede cada parte? Divida ' + br(T) + ' pela quantidade de partes (pode dar número com vírgula).', 'AM tem ' + w[0] + ' partes e MB tem ' + w[1] + ' partes.'] },
        hints: partsHints(T, w, R.vals),
        final: 'AM = ' + br(R.vals[0]) + ' cm e MB = ' + br(R.vals[1]) + ' cm',
        steps: { list: R.steps.concat([
          { t: 'Resposta final', cls: 'final', b: '[[AM]] mede <b>' + br(R.vals[0]) + ' cm</b> e [[MB]] mede <b>' + br(R.vals[1]) + ' cm</b>.', fig: F.segment({ a: w[0], b: w[1], la: br(R.vals[0]) + ' cm', lb: br(R.vals[1]) + ' cm', total: br(T) + ' cm' }) },
          { t: 'Conferindo se faz sentido', cls: 'check', b: R.check }
        ]) }
      }]
    };
  };

  // 130 Q4: número dividido em duas partes numa razão
  G['130-4'] = function (p) {
    var T = p.total, w = p.w, R = partsSteps({ total: T, weights: w, names: ['do ' + w[0], 'do ' + w[1]],
      intro: '"Duas partes na razão de ' + w[0] + ' para ' + w[1] + '" quer dizer que [[frac{1ª parte}{2ª parte} = frac{' + w[0] + '}{' + w[1] + '}]]: a primeira tem ' + w[0] + ' pedaços iguais e a segunda tem ' + w[1] + ' pedaços do mesmo tamanho. Juntas, elas formam ' + T + '.' });
    return {
      prompt: 'O número ' + T + ' foi dividido em duas partes, que estão na razão de ' + w[0] + ' para ' + w[1] + '. Calcule essas partes.',
      items: [{
        key: 'u',
        answer: { type: 'numberList', values: R.vals, ordered: true, labels: ['Parte do ' + w[0], 'Parte do ' + w[1]] },
        hint: { rules: ['partes-prop', 'prop-2'], tip: 'Razão de ' + w[0] + ' para ' + w[1] + ': uma parte tem ' + w[0] + ' pedaços e a outra ' + w[1] + ' pedaços iguais.',
          more: ['Quantos pedaços ao todo? [[' + w[0] + ' + ' + w[1] + ']].', 'Divida ' + T + ' por esse total de pedaços e multiplique por ' + w[0] + ' e por ' + w[1] + '.'] },
        hints: partsHints(T, w, R.vals),
        final: br(R.vals[0]) + ' e ' + br(R.vals[1]),
        steps: { list: R.steps.concat([
          { t: 'Resposta final', cls: 'final', b: 'As partes são <b>' + br(R.vals[0]) + '</b> e <b>' + br(R.vals[1]) + '</b>.' },
          { t: 'Conferindo se faz sentido', cls: 'check', b: R.check }
        ]) }
      }]
    };
  };

  // 130 Q5: a/b = dízima periódica 0,ddd...
  G['130-5'] = function (p) {
    var d = p.d, T = p.total, g = H.gcd(d, 9), num = d / g, den = 9 / g, w = [num, den];
    var dec = '0,' + d + d + d + d + '...';
    var R = partsSteps({ total: T, weights: w, names: ['a', 'b'],
      intro: 'Agora a razão virou [[frac{a}{b} = frac{' + num + '}{' + den + '}]]: o <b>a</b> tem ' + num + (num === 1 ? ' parte' : ' partes') + ' e o <b>b</b> tem ' + den + ' partes do mesmo tamanho. Juntos, [[a + b = ' + T + ']].' });
    var conv = [
      { t: 'Primeiro: quem é ' + dec + '?', cls: 'concept', b: 'O número ' + dec + ' é uma <b>dízima periódica</b>: o ' + d + ' se repete para sempre. Toda dízima assim vem de uma fração. Vamos descobrir qual.<br>Chamamos o número de [[n]]:' +
          lines(['[[n = ' + dec + ']]', '[[10n = ' + d + ',' + d + d + d + '...]]' + small('multiplicar por 10: a vírgula anda uma casa'), '[[10n - n = ' + d + ']]' + small('subtraindo, a parte que se repete some'), '[[9n = ' + d + ']] → [[n = frac{' + d + '}{9}]]']) +
          (g > 1 ? 'Simplificando por ' + g + ': [[frac{' + d + '}{9} = frac{' + num + '}{' + den + '}]].' : '') + aside('Truque: 0,111... = [[frac{1}{9}]], 0,222... = [[frac{2}{9}]], 0,333... = [[frac{3}{9} = frac{1}{3}]], e assim vai.') }
    ];
    return {
      prompt: 'Dividir o número ' + T + ' nas partes a e b, tais que [[frac{a}{b} = ' + dec + ']].',
      items: [{
        key: 'u',
        answer: { type: 'numberList', values: R.vals, ordered: true, labels: ['a', 'b'] },
        hint: { rules: ['dizima', 'partes-prop'], tip: 'Primeiro transforme ' + dec + ' em <b>fração</b>.',
          more: ['0,111... é [[frac{1}{9}]] (faça 1 dividido por 9 na chave e veja!).', 'Com a fração, é divisão em partes proporcionais: a tem o número de cima de partes e b o de baixo.'] },
        hints: partsHints(T, w, R.vals),
        final: 'a = ' + br(R.vals[0]) + ' e b = ' + br(R.vals[1]),
        steps: { list: conv.concat(R.steps).concat([
          { t: 'Resposta final', cls: 'final', b: '<b>a = ' + br(R.vals[0]) + '</b> e <b>b = ' + br(R.vals[1]) + '</b>.' },
          { t: 'Conferindo se faz sentido', cls: 'check', b: '[[' + br(R.vals[0]) + ' + ' + br(R.vals[1]) + ' = ' + T + ']] ✓ e [[frac{' + br(R.vals[0]) + '}{' + br(R.vals[1]) + '} = frac{' + num + '}{' + den + '} = ' + dec + ']] ✓.' }
        ]) }
      }]
    };
  };

  /* ================= Aula 131 · Q1 — Tales ================= */
  G['131-1'] = function (p) {
    var a = p.r[0], b = p.r[1];
    return {
      prompt: 'Na figura a seguir, BC ∥ DE (BC é paralelo a DE). Sendo [[frac{AB}{AC} = frac{' + a + '}{' + b + '}]], calcule a razão [[frac{BD}{CE}]].',
      figure: F.thales(),
      items: [{
        key: 'u',
        answer: { type: 'number', value: a / b, tol: Number.isInteger(r6(a / b * 100)) ? 1e-6 : 0.006, placeholder: 'BD/CE', help: 'Responda como fração (ex.: 3/2) ou decimal.' },
        hint: { rules: ['tales', 'prop-345'], tip: 'Como BC é paralelo a DE, vale o <b>Teorema de Tales</b>: [[frac{AB}{BD} = frac{AC}{CE}]].',
          more: ['Numa proporção, dá para <b>trocar os meios de lugar</b>: a multiplicação em cruz continua a mesma.', 'Trocando os meios em [[frac{AB}{BD} = frac{AC}{CE}]], aparece [[frac{AB}{AC}]] de um lado. E do outro?'] },
        hints: [{ when: b / a, msg: 'Você inverteu a fração. Confira quem fica em cima: BD ou CE?' }],
        final: m('frac{' + a + '}{' + b + '}'),
        steps: { list: [
          { t: 'O que a figura mostra', b: 'O triângulo ADE é cortado pelo segmento BC, que é <b>paralelo</b> a DE (as setinhas iguais indicam isso). O lado AD fica dividido em AB e BD; o lado AE, em AC e CE.', fig: F.thales({}, '') },
          { t: 'Teorema de Tales', cls: 'concept', b: 'Quando uma reta <b>paralela</b> a um lado corta o triângulo, ela divide os outros dois lados na <b>mesma proporção</b>:' + calc(m('frac{AB}{BD} = frac{AC}{CE}')) + 'Pense numa rampa: se você subiu metade do caminho num lado, também subiu metade do caminho no outro.', fig: F.thales({}, 'top bot') },
          { t: 'Trocando os meios de lugar', b: 'Em [[frac{AB}{BD} = frac{AC}{CE}]], os <b>meios</b> são BD e AC. Pela multiplicação em cruz:' + calc(m('AB * CE = BD * AC')) +
              'Se trocarmos BD e AC de lugar, a multiplicação em cruz continua <b>a mesma</b>. Então também vale:' + calc(m('frac{AB}{AC} = frac{BD}{CE}')) + aside('É uma das propriedades da aula: numa proporção, podemos trocar os meios (ou os extremos) de lugar.') },
          { t: 'Usando o que a questão deu', b: 'A questão disse que [[frac{AB}{AC} = frac{' + a + '}{' + b + '}]]. Como [[frac{BD}{CE}]] é igual a [[frac{AB}{AC}]]:' + calc(m('frac{BD}{CE} = frac{' + a + '}{' + b + '}')) },
          { t: 'Resposta final', cls: 'final', b: m('frac{BD}{CE} = frac{' + a + '}{' + b + '}') + (Number.isInteger(r6(a / b * 100)) ? ' (ou ' + br(r6(a / b)) + ')' : '') },
          { t: 'Conferindo com números', cls: 'check', b: 'Imagine AB = ' + a + ', BD = ' + 2 * a + ', AC = ' + b + ' e CE = ' + 2 * b + ' (cada lado de baixo é o dobro do de cima — assim vale Tales: [[frac{' + a + '}{' + 2 * a + '} = frac{' + b + '}{' + 2 * b + '} = frac{1}{2}]]).<br>Então [[frac{BD}{CE} = frac{' + 2 * a + '}{' + 2 * b + '} = frac{' + a + '}{' + b + '}]] ✓.', fig: F.thales({ AB: a, BD: 2 * a, AC: b, CE: 2 * b }, '') }
        ] }
      }]
    };
  };

  /* ================= Aula 131 · Q2–Q6 — soma/diferença e razão ================= */
  // p = { n: ['x', 'y'], r: [p, q] (n0/n1 = p/q, p pode ser negativo), rel: 'sum' | 'diff', val, order: [i, j] (diff = n_i − n_j), ask: 'min' | 'both' | 0 }
  function kParts(p) {
    var A = p.n[0], Bn = p.n[1], pr = p.r[0], qr = p.r[1];
    var coef = p.rel === 'sum' ? pr + qr : (p.order[0] === 0 ? pr - qr : qr - pr);
    var k = p.val / coef, vA = pr * k, vB = qr * k;
    var relTxt = p.rel === 'sum' ? A + ' + ' + Bn + ' = ' + br(p.val) : p.n[p.order[0]] + ' - ' + p.n[p.order[1]] + ' = ' + br(p.val);
    var ratioTxt = 'frac{' + A + '}{' + Bn + '} = ' + (pr < 0 ? '-frac{' + (-pr) + '}{' + qr + '}' : 'frac{' + pr + '}{' + qr + '}');
    var tA = (pr < 0 ? '-' + (-pr) : pr) + 'k', tB = qr + 'k';
    var sub = p.rel === 'sum' ? tA + ' + ' + tB : (p.order[0] === 0 ? tA + ' - ' + tB : tB + ' - ' + (pr < 0 ? '(' + tA + ')' : tA));
    var dv = H.divide(Math.abs(p.val), Math.abs(coef), { maxDec: 4 });
    var sgn = (p.val < 0) !== (coef < 0);
    var vals = { 0: vA, 1: vB };
    var steps = [
      { t: 'A ideia: pedaços do mesmo tamanho', cls: 'concept', b: 'Se [[' + ratioTxt.replace('-frac', 'frac') + ']], podemos pensar que ' + m(A) + ' tem <b>' + Math.abs(pr) + ' pedaços</b> e ' + m(Bn) + ' tem <b>' + qr + ' pedaços</b>, todos do mesmo tamanho. Vamos chamar o tamanho de cada pedaço de [[k]]:' +
          lines(['[[' + A + ' = ' + tA + ']]', '[[' + Bn + ' = ' + tB + ']]']) + (pr < 0 ? 'O sinal de menos da razão fica com o ' + m(A) + ': assim [[frac{' + A + '}{' + Bn + '} = frac{' + tA + '}{' + tB + '} = -frac{' + (-pr) + '}{' + qr + '}]] (os [[k]] se cancelam).' : 'Confira: [[frac{' + tA + '}{' + tB + '} = frac{' + pr + '}{' + qr + '}]], porque os [[k]] se cancelam.') +
          aside('Esse é o mesmo raciocínio das propriedades da aula, por exemplo ' + (p.rel === 'sum' ? '[[frac{a + b}{b} = frac{c + d}{d}]]' : '[[frac{a - b}{b} = frac{c - d}{d}]]') + ': somar (ou subtrair) os pedaços.') },
      { t: 'Usando a outra informação', b: 'A questão também diz que [[' + relTxt + ']]. Trocando ' + m(A) + ' e ' + m(Bn) + ' pelos pedaços:' +
          lines(['[[' + sub + ' = ' + br(p.val) + ']]', '[[' + coef + 'k = ' + br(p.val) + ']]' + small(p.rel === 'sum' ? 'juntamos os k: ' + (pr < 0 ? '(' + pr + ')' : pr) + ' + ' + qr + ' = ' + coef : 'juntamos os k: ' + (p.order[0] === 0 ? pr + ' − ' + qr : qr + ' − ' + par(pr)) + ' = ' + coef)]) },
      { t: 'Descobrindo o tamanho do pedaço (k)', b: 'O ' + coef + ' multiplica o [[k]]; ele passa para o outro lado dividindo:' + calc(m('k = frac{' + br(p.val) + '}{' + coef + '}')) +
          (sgn ? 'Os sinais são diferentes (um é positivo e o outro negativo), então o resultado é <b>negativo</b>. ' : (p.val < 0 ? 'Os dois são negativos: menos dividido por menos dá <b>mais</b>. ' : '')) + (dv.inline || 'Fazendo a divisão:') }
    ].concat(dv.steps).concat([
      { t: 'Achamos o k', b: calc(m('k = ' + br(k))) },
      { t: 'Calculando os dois números', b: lines(['[[' + A + ' = ' + (pr < 0 ? '-' + (-pr) : pr) + ' * ' + par(k) + ' = ' + br(vA) + ']]', '[[' + Bn + ' = ' + qr + ' * ' + par(k) + ' = ' + br(vB) + ']]']) + (k < 0 ? aside('k é negativo: mais vezes menos dá menos' + (pr < 0 ? ', e menos vezes menos dá mais' : '') + '.') : '') }
    ]);
    var ans, finalTxt;
    if (p.ask === 'min') {
      var mn = Math.min(vA, vB), who = vA < vB ? A : Bn;
      steps.push({ t: 'Qual é o menor?', b: 'Os números são ' + br(vA) + ' e ' + br(vB) + '. ' + (mn < 0 ? 'Com números negativos, cuidado: o menor é o que está <b>mais à esquerda</b> na reta numérica, ou seja, o mais negativo. [[' + br(Math.min(vA, vB)) + ' &lt; ' + br(Math.max(vA, vB)) + ']].' : 'O menor é ' + br(mn) + '.') });
      ans = { type: 'integer', value: mn, neg: true, placeholder: 'O menor' };
      finalTxt = br(mn);
      steps.push({ t: 'Resposta final', cls: 'final', b: 'O menor número é <b>' + br(mn) + '</b> (é o ' + m(who) + ').' });
    } else if (p.ask === 'both') {
      ans = { type: 'numberList', values: [vA, vB], ordered: true, labels: [A, Bn], neg: true };
      finalTxt = A + ' = ' + br(vA) + ' e ' + Bn + ' = ' + br(vB);
      steps.push({ t: 'Resposta final', cls: 'final', b: '<b>' + A + ' = ' + br(vA) + '</b> e <b>' + Bn + ' = ' + br(vB) + '</b>.' });
    } else {
      var v0 = vals[p.ask];
      ans = { type: 'integer', value: v0, neg: true, placeholder: p.n[p.ask] + ' =' };
      finalTxt = p.n[p.ask] + ' = ' + br(v0);
      steps.push({ t: 'Resposta final', cls: 'final', b: '<b>' + p.n[p.ask] + ' = ' + br(v0) + '</b>.' });
    }
    var relCheck = p.rel === 'sum' ? br(vA) + ' + ' + par(vB) + ' = ' + br(vA + vB) : br(vals[p.order[0]]) + ' - ' + par(vals[p.order[1]]) + ' = ' + br(vals[p.order[0]] - vals[p.order[1]]);
    steps.push({ t: 'Conferindo se faz sentido', cls: 'check', b: lines(['[[' + relCheck + ']] ✓', '[[frac{' + br(vA) + '}{' + br(vB) + '} = ' + (pr < 0 ? '-' : '') + 'frac{' + Math.abs(pr) + '}{' + qr + '}]] ✓' + small('dividindo em cima e embaixo por ' + br(Math.abs(k)))]) });
    var wrong = [];
    if (p.ask === 'min') wrong.push({ when: Math.max(vA, vB), msg: Math.max(vA, vB) < 0 ? 'Com negativos, o <b>menor</b> é o mais distante do zero para a esquerda.' : 'Esse é o <b>maior</b> dos dois. A questão pede o menor.' });
    if (p.ask === 'both') wrong.push({ when: [vB, vA], msg: 'Os valores estão certos, mas trocados de lugar.' });
    if (p.ask !== 'both') wrong.push({ when: k, msg: 'Esse é o tamanho de cada pedaço ([[k]]). Falta multiplicar.' });
    if (p.ask === 'both') wrong.push({ when: function (v) { return Math.abs(v[0] + v[1] - (vA + vB)) > 1e-9 && p.rel === 'sum'; }, msg: 'Some os dois: precisam dar ' + br(p.val) + '.' });
    return {
      answer: ans, final: finalTxt, hints: wrong, steps: { list: steps },
      hint: { rules: ['prop-345'], tip: 'Escreva os números como pedaços: ' + m(A + ' = ' + tA) + ' e ' + m(Bn + ' = ' + tB) + '.',
        more: ['Troque na outra informação ([[' + relTxt + ']]) e junte os [[k]].', 'Descubra o [[k]] e multiplique. Cuidado com os sinais!'] }
    };
  }
  B4.kParts = kParts;
  function kQuestion(promptFn, ask) {
    return function (p) {
      var r = kParts(Object.assign({ ask: ask }, p));
      return { prompt: promptFn(p), note: p.note, items: [Object.assign({ key: 'u' }, r)] };
    };
  }
  var fr = function (a, b) { return a < 0 ? '-frac{' + (-a) + '}{' + b + '}' : 'frac{' + a + '}{' + b + '}'; };
  G['131-2'] = kQuestion(function (p) { return 'Calcule o menor dos dois números x e y, sendo [[x + y = ' + p.val + ']] e [[frac{x}{y} = ' + fr(p.r[0], p.r[1]) + ']].'; }, 'min');
  G['131-3'] = kQuestion(function (p) { return 'Sendo [[a + b = ' + br(p.val) + ']] e [[frac{a}{b} = ' + fr(p.r[0], p.r[1]) + ']], calcule a.'; }, 0);
  G['131-4'] = kQuestion(function (p) { return 'A soma de dois números é ' + br(p.val) + ' e a razão entre eles é [[' + fr(p.r[0], p.r[1]) + ']]. Calcule o menor deles.'; }, 'min');
  G['131-5'] = kQuestion(function (p) { return 'Sendo [[p - q = ' + p.val + ']] e [[frac{p}{q} = ' + fr(p.r[0], p.r[1]) + ']], obtenha p e q.'; }, 'both');
  G['131-6'] = kQuestion(function (p) { return 'Sendo [[frac{x}{y} = ' + fr(p.r[0], p.r[1]) + ']] e [[y - x = ' + p.val + ']], calcule x e y.'; }, 'both');

  /* ================= Aula 132 — divisão em partes proporcionais ================= */
  G['132-1'] = function (p) {
    var T = p.total, w = p.w, R = partsSteps({ total: T, weights: w, names: w.map(function (x) { return 'do ' + x; }) });
    return {
      prompt: 'Dividir o número ' + T + ' em partes proporcionais a ' + H.listPT(w.map(String)) + '.',
      items: [{
        key: 'u',
        answer: { type: 'numberList', values: R.vals, ordered: true, labels: w.map(function (x) { return 'Parte do ' + x; }) },
        hint: { rules: ['partes-prop'], tip: 'Some ' + H.listPT(w.map(String)) + ': esse é o número de partes iguais.',
          more: ['Divida ' + T + ' por essa soma (faça na chave).', 'Multiplique o valor de uma parte por cada número da proporção.'] },
        hints: partsHints(T, w, R.vals),
        final: R.vals.map(function (v) { return br(v); }).join(', '),
        steps: { list: R.steps.concat([
          { t: 'Resposta final', cls: 'final', b: 'As partes são ' + R.vals.map(function (v, i) { return '<b>' + br(v) + '</b> (do ' + w[i] + ')'; }).join(', ') + '.' },
          { t: 'Conferindo se faz sentido', cls: 'check', b: R.check }
        ]) }
      }]
    };
  };
  G['132-2'] = function (p) {
    var w = p.w, R = partsSteps({ total: 180, weights: w, unit: '°', names: ['do ' + w[0], 'do ' + w[1], 'do ' + w[2]],
      intro: 'Em <b>todo</b> triângulo, a soma dos três ângulos internos é <b>180°</b>. Então vamos dividir 180° em partes proporcionais a ' + H.listPT(w.map(String)) + '.' });
    R.steps[0].fig = F.angles(['?', '?', '?']);
    R.steps[0].cls = 'concept';
    return {
      prompt: 'Os ângulos internos de um triângulo são proporcionais aos números ' + H.listPT(w.map(String)) + '. Calcule as medidas dos ângulos.',
      items: [{
        key: 'u',
        answer: { type: 'numberList', values: R.vals, ordered: true, labels: w.map(function (x) { return 'Ângulo do ' + x + ' (°)'; }) },
        hint: { rules: ['partes-prop', 'soma-angulos'], tip: 'Qual é a soma dos ângulos internos de qualquer triângulo?',
          more: ['É 180°. Agora divida 180° em partes proporcionais a ' + H.listPT(w.map(String)) + '.', 'Some ' + w.join(' + ') + ', divida 180 por isso e multiplique.'] },
        hints: [{ when: function (v) { return Math.abs(H.sum(v) - 180) > 1e-6; }, msg: 'Some os seus três ângulos: em todo triângulo a soma precisa dar <b>180°</b>.' }].concat(partsHints(180, w, R.vals).slice(2)),
        final: R.vals.map(function (v) { return br(v) + '°'; }).join(', '),
        steps: { list: R.steps.concat([
          { t: 'Resposta final', cls: 'final', b: 'Os ângulos medem ' + H.listPT(R.vals.map(function (v) { return '<b>' + br(v) + '°</b>'; })) + '.', fig: F.angles(R.vals.map(function (v) { return br(v) + '°'; })) },
          { t: 'Conferindo se faz sentido', cls: 'check', b: '[[' + R.vals.map(H.br1).join(' + ') + ' = 180]]° ✓, como em todo triângulo. E cada ângulo é o seu número da proporção vezes ' + br(R.part) + '° ✓.' }
        ]) }
      }]
    };
  };
  G['132-3'] = function (p) {
    var T = p.total, w = p.ages, R = partsSteps({ total: T, weights: w, names: ['do filho de ' + w[0] + ' anos', 'do filho de ' + w[1] + ' anos', 'do filho de ' + w[2] + ' anos'],
      intro: 'O pai vai dividir ' + thousands(T) + ' dólares em partes <b>proporcionais às idades</b> (' + H.listPT(w.map(String)) + '): quem é mais velho recebe mais. Depois, a questão quer saber <b>quanto o caçula recebe a menos</b> que o mais velho.' });
    var lo = R.vals[0], hi = R.vals[2], diff = r6(hi - lo);
    return {
      prompt: 'Um pai resolve distribuir ' + thousands(T) + ' dólares aos seus três filhos, em partes proporcionais às suas idades: ' + H.listPT(w.map(String)) + ' anos. Quantos dólares a menos o irmão caçula irá receber em relação ao mais velho?',
      items: [{
        key: 'u',
        answer: { type: 'integer', value: diff, suffix: 'dólares', placeholder: 'Diferença' },
        hint: { rules: ['partes-prop'], tip: 'Primeiro divida ' + thousands(T) + ' em partes proporcionais a ' + H.listPT(w.map(String)) + '.',
          more: ['Some as idades e divida o total por essa soma: é o valor de cada parte.', 'Calcule quanto recebem o caçula (' + w[0] + ' anos) e o mais velho (' + w[2] + ' anos) e faça a <b>diferença</b>.'] },
        hints: [{ when: lo, msg: 'Esse é quanto o <b>caçula</b> recebe. A pergunta é quanto ele recebe <b>a menos</b> que o mais velho.' }, { when: hi, msg: 'Esse é quanto o <b>mais velho</b> recebe. Falta a diferença.' }, { when: R.vals[1], msg: 'Esse é o filho do meio. A pergunta é a <b>diferença</b> entre o mais velho e o caçula.' }].filter(function (h) { return Math.abs(h.when - diff) > 1e-6; }),
        final: br(diff) + ' dólares',
        steps: { list: R.steps.concat([
          { t: 'Opa! Ainda não acabou', cls: 'concept', b: 'A questão não pergunta quanto cada um recebe, e sim <b>quanto o caçula recebe a menos</b> que o mais velho. "A menos" é uma <b>subtração</b>:' + calc(m(br(hi) + ' - ' + br(lo) + ' = ' + br(diff))) },
          { t: 'Resposta final', cls: 'final', b: 'O caçula vai receber <b>' + br(diff) + ' dólares a menos</b> que o irmão mais velho.' },
          { t: 'Conferindo se faz sentido', cls: 'check', b: R.check + '<br>E [[' + br(lo) + ' + ' + br(diff) + ' = ' + br(hi) + ']] ✓.' }
        ]) }
      }]
    };
  };
})();
