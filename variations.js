/* =====================================================================
   GAITERO MATH — Variações das questões (botão 🔀 VARIAR QUESTÃO)
   Cada questão tem um gerador G[id](params) que devolve { prompt, figure?, table?,
   note?, items[] } no mesmo formato das originais: gabarito, validador (answer),
   dica, erros comuns e resolução são recalculados a partir dos parâmetros.
   P[id] guarda as 3 variações predefinidas de cada questão.
   ===================================================================== */
(function () {
  'use strict';
  var L = window.GM_LOGIC, FIG = window.GM_FIG, BANK = window.GM_BANK;
  var br = L.brNum, money = L.brMoney;
  var G = {}, P = {};
  var abs = Math.abs;
  function sum(a) { return a.reduce(function (s, v) { return s + v; }, 0); }
  function gcd(a, b) { a = abs(a); b = abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }
  function sq(n) { return '[[' + n + ']]'; }

  /* =========================== P1 =========================== */

  // Q1 — três consecutivos
  G.p1q1 = function (p) {
    var S = p.S, m = S / 3, a = m - 1, c = m + 1;
    return {
      prompt: 'A soma de três números consecutivos é ' + S + '. Quais são os números?',
      items: [{
        key: 'u',
        answer: { type: 'numberList', values: [a, m, c], ordered: false, labels: ['1º número', '2º número', '3º número'], neg: true },
        hint: { rules: ['consecutivos'], tip: 'Chame o primeiro número de [[x]]. Escreva os três números e monte a soma igual a ' + S + '.' },
        hints: [
          { when: function (v) { return v[0] + v[1] + v[2] !== S; }, msg: 'Some os três números que você escreveu: precisa dar exatamente ' + S + '.' },
          { when: function () { return true; }, msg: 'A soma dá ' + S + ', mas os números precisam ser consecutivos: um logo depois do outro.' }
        ],
        final: a + ', ' + m + ' e ' + c,
        steps: window.GM_STEPS.consec({ S: S, step: 1, first: a, kind: 'consecutivos' })
      }]
    };
  };
  P.p1q1 = [{ S: 33 }, { S: 48 }, { S: 87 }];

  // Q2 — radicais
  function tStr(t) { return t.r === 1 ? String(t.c) : (t.c === 1 ? '' : t.c) + '√' + t.r; }
  function tVal(t) { return t.c * Math.sqrt(t.r); }
  function tExplain(t) {
    if (t.r === 1) return t.c + ' = √' + (t.c * t.c);
    if (t.c === 1) return null;
    return t.c + '√' + t.r + ' = √{' + (t.c * t.c) + ' * ' + t.r + '} = √' + (t.c * t.c * t.r);
  }
  function negRootItem(cfg, perm) {
    var n = cfg.idx, rad = cfg.rad, A = -rad, even = n % 2 === 0;
    var root = Math.round(Math.pow(A, 1 / n));
    var sqrtA = Math.sqrt(A);
    var alt = Number.isInteger(sqrtA) && n !== 2
      ? { id: 'alt', html: '[[-' + sqrtA + ']]', hint: 'Isso seria a raiz <b>quadrada</b> (índice 2). Aqui o índice é ' + n + '.' }
      : { id: 'alt', html: '[[' + br(rad / n) + ']]', hint: 'Cuidado: raiz não é divisão! [[' + A + ' ÷ ' + n + ']] é outra conta.' };
    var opts = {
      neg: { id: 'neg', html: '[[-' + root + ']]', hint: even ? 'Teste: [[(-' + root + ')^' + n + ']] dá positivo, porque o expoente é par. Não dá ' + br(rad) + '.' : null },
      pos: { id: 'pos', html: '[[' + root + ']]', hint: '[[' + root + '^' + n + ' = ' + A + ']], que é positivo. Precisa dar ' + br(rad) + '.' },
      nao: { id: 'nao', html: 'Não existe no conjunto dos números reais ([[ℝ]])', hint: even ? null : 'Com índice <b>ímpar</b>, raiz de número negativo existe! Procure um número negativo.' },
      alt: alt
    };
    var ord = n + 'ª';
    var steps = even ? {
      ask: 'Calcular [[R{' + n + '}{' + rad + '}]]: achar um número que, elevado à ' + ord + ' potência, dê ' + br(rad) + '.',
      concept: 'O numerozinho em cima da raiz é o <b>índice</b>. Procuramos um número que, elevado ao índice, dê o que está dentro da raiz.',
      data: 'Índice <b>' + n + '</b> (par) e, dentro da raiz, <b>' + br(rad) + '</b> (negativo).',
      s1: 'Testando os sinais:<div class="calc">[[' + root + '^' + n + ' = ' + A + ']] &nbsp;e&nbsp; [[(-' + root + ')^' + n + ' = ' + A + ']]</div>Os dois deram <b>positivo</b>!',
      s2: 'Com expoente par, o resultado nunca é negativo. Então <b>nenhum</b> número real elevado à ' + ord + ' potência dá ' + br(rad) + '.',
      final: '[[R{' + n + '}{' + rad + '}]] <b>não existe</b> no conjunto dos números reais.',
      check: 'Regra de ouro: <b>índice par + número negativo dentro = não existe em [[ℝ]]</b> ✓.'
    } : {
      ask: 'Calcular [[R{' + n + '}{' + rad + '}]]: achar um número que, elevado à ' + ord + ' potência, dê ' + br(rad) + '.',
      concept: 'Com índice <b>ímpar</b>, a raiz de um número negativo <b>existe</b> e dá negativo.',
      data: 'Índice <b>' + n + '</b> (ímpar) e, dentro da raiz, <b>' + br(rad) + '</b>.',
      s1: 'Testando: [[' + root + '^' + n + ' = ' + A + ']] (positivo, não serve).',
      s2: 'Com o sinal de menos: [[(-' + root + ')^' + n + ' = ' + rad + ']] — expoente ímpar mantém o sinal negativo ✓.',
      final: '[[R{' + n + '}{' + rad + '} = -' + root + ']]',
      check: '[[(-' + root + ')^' + n + ' = ' + rad + ']] ✓.'
    };
    return {
      key: 'a', label: 'a)', prompt: '[[R{' + n + '}{' + rad + '}]] =',
      answer: { type: 'choice', layout: 'list', correct: even ? 'nao' : 'neg', options: perm.map(function (id) { return opts[id]; }) },
      hint: { rules: ['raiz-par-negativo'], tip: 'Olhe o <b>índice</b> (par ou ímpar?) e o <b>sinal</b> do número de dentro.' },
      final: even ? 'Não existe no conjunto dos números reais.' : '[[-' + root + ']]',
      steps: steps
    };
  }
  function radPowItem(key, cfg) {
    var n = cfg.idx, even = n % 2 === 0, t1 = cfg.t1, t2 = cfg.t2;
    var inner = tStr(t1) + ' - ' + tStr(t2), swapped = tStr(t2) + ' - ' + tStr(t1);
    var v = tVal(t1) - tVal(t2), neg = v < 0;
    var ans = (even && neg) ? swapped : inner, ansVal = even ? abs(v) : v;
    var ex = [tExplain(t1), tExplain(t2)].filter(Boolean).map(function (s) { return '[[' + s + ']]'; }).join(' &nbsp;e&nbsp; ');
    var wrongMsg = even
      ? (neg ? 'Quase! Esse valor é negativo, mas raiz de índice par (' + n + ') nunca dá resultado negativo.' : 'Esse valor é negativo. Como [[' + inner + ']] já é positivo, o módulo não muda nada.')
      : 'Com índice ímpar (' + n + '), raiz e potência se cancelam sem trocar nada. Não precisa inverter a ordem.';
    var s2;
    if (even && neg) s2 = 'Índice par → o resultado é o módulo, que troca o sinal de um número negativo:<div class="calc">[[|' + inner + '| = ' + swapped + ']]</div>';
    else if (even) s2 = 'Índice par → o resultado é o módulo. Como [[' + inner + ']] já é <b>positivo</b>, o módulo não muda nada:<div class="calc">[[|' + inner + '| = ' + inner + ']]</div>';
    else s2 = 'Índice <b>ímpar</b> → raiz e potência se cancelam e o sinal fica como está' + (neg ? ' (mesmo sendo negativo)' : '') + ':<div class="calc">[[' + inner + ']]</div>';
    return {
      key: key, label: key + ')', prompt: '[[R{' + n + '}{(' + inner + ')^{' + n + '}}]] =',
      answer: { type: 'radical', value: ansVal, canonical: ans },
      hint: { rules: ['raiz-potencia'], tip: even ? 'O índice ' + n + ' é <b>par</b>. Antes de tudo, descubra se [[' + inner + ']] é positivo ou negativo.' : 'O índice ' + n + ' é <b>ímpar</b>. O que acontece com o que está dentro dos parênteses?' },
      hints: [{ when: -ansVal, msg: wrongMsg }],
      final: '[[' + ans + ']]',
      steps: {
        ask: 'Simplificar a raiz de índice <b>' + n + '</b> de [[(' + inner + ')^{' + n + '}]].',
        concept: even
          ? 'Com índice <b>PAR</b>, raiz e potência se desfazem, mas o resultado nunca pode ser negativo: vira <b>módulo</b>. [[R{n}{a^n} = |a|]].'
          : 'Com índice <b>ÍMPAR</b>, raiz e potência se desfazem <b>sem mudar nada</b>, nem o sinal: [[R{n}{a^n} = a]].',
        data: 'Índice <b>' + n + '</b> (' + (even ? 'par' : 'ímpar') + '), expoente <b>' + n + '</b>, e dentro dos parênteses: [[' + inner + ']].',
        s1: 'Qual é o sinal de [[' + inner + ']]?' + (ex ? '<div class="calc">' + ex + '</div>' : '') +
          '<div class="calc">[[' + tStr(t1) + ' ≈ ' + br(tVal(t1), 2) + ']] &nbsp;e&nbsp; [[' + tStr(t2) + ' ≈ ' + br(tVal(t2), 2) + ']] → [[' + inner + ' ≈ ' + br(v, 2) + ']]</div>' +
          'É <b>' + (neg ? 'negativo' : 'positivo') + '</b>.',
        s2: s2,
        final: '[[R{' + n + '}{(' + inner + ')^{' + n + '}} = ' + ans + ']]',
        check: even ? '[[' + ans + ' ≈ ' + br(ansVal, 2) + ']], positivo ✓ — raiz de índice par nunca dá negativo.' : 'Com índice ímpar o sinal se mantém: [[' + ans + ' ≈ ' + br(ansVal, 2) + ']] ✓.'
      }
    };
  }
  G.p1q2 = function (p) {
    return { prompt: 'Calcular:', items: [negRootItem(p.a, p.perm), radPowItem('b', p.b), radPowItem('c', p.c), radPowItem('d', p.d)] };
  };
  P.p1q2 = [
    { a: { idx: 6, rad: -64 }, b: { idx: 8, t1: { c: 1, r: 5 }, t2: { c: 1, r: 7 } }, c: { idx: 7, t1: { c: 1, r: 11 }, t2: { c: 1, r: 2 } }, d: { idx: 13, t1: { c: 1, r: 10 }, t2: { c: 4, r: 2 } }, perm: ['pos', 'nao', 'neg', 'alt'] },
    { a: { idx: 3, rad: -27 }, b: { idx: 10, t1: { c: 1, r: 19 }, t2: { c: 1, r: 17 } }, c: { idx: 9, t1: { c: 1, r: 6 }, t2: { c: 1, r: 3 } }, d: { idx: 5, t1: { c: 1, r: 15 }, t2: { c: 3, r: 3 } }, perm: ['nao', 'alt', 'pos', 'neg'] },
    { a: { idx: 4, rad: -81 }, b: { idx: 6, t1: { c: 2, r: 1 }, t2: { c: 1, r: 6 } }, c: { idx: 11, t1: { c: 1, r: 13 }, t2: { c: 1, r: 10 } }, d: { idx: 9, t1: { c: 1, r: 8 }, t2: { c: 2, r: 5 } }, perm: ['neg', 'alt', 'nao', 'pos'] }
  ];

  // Q3 — equação do 1º grau
  var MULT = { 2: 'dobro', 3: 'triplo', 4: 'quádruplo', 5: 'quíntuplo' };
  G.p1q3 = function (p) {
    var k = p.k, w = MULT[k], b = p.b, c = p.c, plus = p.op === '+';
    var kn = plus ? c - b : c + b, n = kn / k, wrongOp = plus ? (c + b) / k : (c - b) / k;
    return {
      prompt: 'O ' + w + ' de um número ímpar ' + (plus ? 'mais' : 'menos') + ' ' + b + ' é igual a ' + c + '. Qual é o número?',
      items: [{
        key: 'u',
        answer: { type: 'integer', value: n, placeholder: 'O número', neg: true },
        hint: { rules: ['traducoes'], tip: 'Chame o número de [[x]] e traduza a frase para uma equação. Depois desfaça as operações, de trás para frente.' },
        hints: [
          { when: wrongOp, msg: plus ? 'Para desfazer o "+' + b + '", a gente <b>subtrai</b> ' + b + '.' : 'Para desfazer o "−' + b + '", a gente <b>soma</b> ' + b + '.' },
          { when: kn, msg: 'Esse é o <b>' + w + '</b> do número! Falta dividir por ' + k + '.' }
        ],
        final: String(n),
        steps: (function () {
          // Mesmo roteiro da original: o que é dobro/triplo → chama de x → monta a equação → resolve linha por linha.
          var W = w[0].toUpperCase() + w.slice(1), maisMenos = plus ? 'mais' : 'menos';
          var eq = k + 'x ' + (plus ? '+' : '-') + ' ' + b + ' = ' + c;
          return {
            intro: { t: 'O que é ' + w + '?', b: '<b>' + W + '</b> é multiplicar por <b>' + k + '</b>. Por exemplo: o ' + w + ' de 5 é [[' + k + ' * 5 = ' + 5 * k + ']].' },
            ask: 'Nesse caso, não interessa se o número é ímpar ou par. O que interessa é que o <b>' + w + '</b> de um número <b>' + maisMenos + ' ' + b + '</b> é igual a <b>' + c + '</b>. Qual é esse número?',
            data: 'Vamos chamar esse número de [[x]], porque é o que a gente quer descobrir.',
            s1: 'O ' + w + ' de [[x]] é [[' + k + 'x]]. Então a frase "o ' + w + ' de um número ' + maisMenos + ' ' + b + ' é igual a ' + c + '" vira:<div class="calc">[[' + eq + ']]</div>',
            s2: 'Agora é só resolver, uma conta de cada vez:<div class="calc calc-lines">' +
              '<span>[[' + eq + ']]</span>' +
              '<span>[[' + k + 'x = ' + c + ' ' + (plus ? '-' : '+') + ' ' + b + ']] <small>← o ' + (plus ? '+' : '−') + b + ' muda de lado e vira ' + (plus ? '−' : '+') + b + '</small></span>' +
              '<span>[[' + k + 'x = ' + kn + ']]</span>' +
              '<span>[[x = ' + kn + ' ÷ ' + k + ']] <small>← o ' + k + ' que multiplica muda de lado e divide</small></span>' +
              '<span>[[x = ' + n + ']]</span></div>',
            final: 'O número é <b>' + n + '</b>.',
            check: 'O ' + w + ' de ' + n + ' é [[' + k + ' * ' + n + ' = ' + kn + ']], e [[' + kn + ' ' + (plus ? '+' : '-') + ' ' + b + ' = ' + c + ']] ✓. (E ' + n + ' é mesmo ímpar, como a questão falou ✓.)'
          };
        })()
      }]
    };
  };
  P.p1q3 = [{ k: 3, op: '+', b: 15, c: 72 }, { k: 4, op: '-', b: 7, c: 45 }, { k: 2, op: '+', b: 9, c: 55 }];

  // Q4 — ímpares (ou pares) consecutivos
  G.p1q4 = function (p) {
    var S = p.S, odd = p.kind === 'ímpares', m = S / 3, a = m - 2, c = m + 2;
    return {
      prompt: 'A soma de três números inteiros consecutivos ' + p.kind + ' é ' + S + '. Quais são os números?',
      items: [{
        key: 'u',
        answer: { type: 'numberList', values: [a, m, c], ordered: false, labels: ['1º número', '2º número', '3º número'], neg: true },
        hint: { rules: odd ? ['impares-consecutivos'] : ['impares-consecutivos', 'par-impar'], tip: 'Escreva os três ' + p.kind + ' seguidos usando [[x]] e monte a soma igual a ' + S + '.' },
        hints: [
          { when: function (v) { return v[0] + v[1] + v[2] !== S; }, msg: 'Some os três números que você escreveu: precisa dar exatamente ' + S + '.' },
          { when: function (v) { return v.some(function (q) { return abs(q % 2) !== (odd ? 1 : 0); }); }, msg: 'A soma dá ' + S + ', mas os três precisam ser <b>' + p.kind + '</b>.' },
          { when: function () { return true; }, msg: 'A soma está certa, mas precisam ser ' + p.kind + ' <b>seguidos</b> (pulando de 2 em 2).' }
        ],
        final: a + ', ' + m + ' e ' + c,
        steps: window.GM_STEPS.consec({ S: S, step: 2, first: a, kind: p.kind })
      }]
    };
  };
  P.p1q4 = [{ S: 57, kind: 'ímpares' }, { S: 105, kind: 'ímpares' }, { S: 78, kind: 'pares' }];

  // Q5 — volume do paralelepípedo
  G.p1q5 = function (p) {
    var h = p.h, k = p.k, V = p.V, L2 = V / (k * h), Lw = Math.sqrt(L2), C = k * Lw;
    return {
      prompt: 'Em um paralelepípedo de ' + h + ' cm de altura, o comprimento é ' + k + ' vezes a largura. Qual a medida do comprimento se o volume do paralelepípedo for ' + V + ' cm³?',
      items: [{
        key: 'u',
        answer: { type: 'integer', value: C, suffix: 'cm', placeholder: 'Comprimento' },
        hint: { rules: ['volume'], tip: 'Chame a largura de [[L]]. Então o comprimento é [[' + k + 'L]]. Monte o volume com as três medidas e iguale a ' + V + '.' },
        hints: [
          { when: Lw, msg: br(Lw) + ' cm é a <b>largura</b>! O comprimento é ' + k + ' vezes a largura.' },
          { when: L2, msg: br(L2) + ' é largura × largura. Qual número vezes ele mesmo dá ' + br(L2) + '?' },
          { when: V / h, msg: 'Você dividiu só pela altura. Lembre que o comprimento é ' + k + ' × a largura.' }
        ],
        final: C + ' cm',
        steps: window.GM_STEPS.volume(h, k, V)
      }]
    };
  };
  P.p1q5 = [{ h: 3, k: 4, V: 300 }, { h: 5, k: 2, V: 360 }, { h: 4, k: 9, V: 144 }];

  // Q6 — porcentagem (2 itens)
  G.p1q6 = function (p) {
    var pa = p.a.p, T = p.a.T, va = pa * T / 100;
    var part = p.b.part, tot = p.b.total, dec = part / tot, vb = dec * 100;
    return {
      prompt: 'Preencha as lacunas com valor correto.',
      items: [
        {
          key: 'a', label: 'a)', prompt: pa + '% de ' + T + ' é <span class="blank">____</span>',
          answer: { type: 'number', value: va, placeholder: 'Valor' },
          hint: { rules: ['pct-parte'], tip: 'Você conhece o <b>total</b> (' + T + ') e a <b>porcentagem</b> (' + pa + '%). Falta a parte.' },
          hints: [
            { when: va * 100, msg: 'Faltou dividir por 100: ' + pa + '% é ' + pa + ' de cada 100.' },
            { when: T - va, msg: 'Você tirou ' + pa + '% de ' + T + '. A pergunta é quanto <b>vale</b> ' + pa + '% de ' + T + '.' }
          ],
          final: br(va),
          steps: window.GM_STEPS.pctOf(pa, T)
        },
        {
          key: 'b', label: 'b)', prompt: part + ' representa <span class="blank">____</span> % de ' + tot,
          answer: { type: 'percent', value: vb, suffix: '%', placeholder: 'Porcentagem' },
          hint: { rules: ['pct-porcentagem'], tip: 'Qual número é a <b>parte</b> e qual é o <b>total</b> aqui?' },
          hints: [
            { when: dec, msg: 'Quase! ' + br(dec) + ' é a fração em decimal. Multiplique por 100 para virar porcentagem.' },
            { when: tot / part * 100, msg: 'Você fez ' + tot + ' ÷ ' + part + '. A parte (' + part + ') vai em cima.' }
          ],
          final: br(vb) + '%',
          steps: window.GM_STEPS.pctWhich(part, tot)
        }
      ]
    };
  };
  P.p1q6 = [
    { a: { p: 15, T: 60 }, b: { part: 12, total: 48 } },
    { a: { p: 45, T: 200 }, b: { part: 27, total: 36 } },
    { a: { p: 12, T: 150 }, b: { part: 15, total: 40 } }
  ];

  // Q7 — preço depois do desconto
  G.p1q7 = function (p) {
    var P0 = p.P, r = p.r, loss = P0 * r / 100, fin = P0 - loss;
    return {
      prompt: 'Após ' + p.tempo + ' de uso, o preço de ' + p.obj + ' reduziu ' + r + '%. Sabendo que seu valor inicial era ' + money(P0) + ', quanto ' + p.pron + ' custa agora?',
      items: [{
        key: 'u',
        answer: { type: 'currency', value: fin, prefix: 'R$', placeholder: '0,00' },
        hint: { rules: ['pct-desconto'], tip: 'Se o preço caiu ' + r + '%, com quantos por cento do valor ' + p.pron + ' ficou?' },
        hints: [
          { when: loss, msg: 'Esse é o valor que ' + p.pron + ' <b>perdeu</b>. Quanto vale agora?' },
          { when: P0 + loss, msg: 'O preço <b>reduziu</b>, então tem que ficar menor que ' + money(P0) + '.' }
        ],
        final: money(fin),
        steps: window.GM_STEPS.discount(P0, r)
      }]
    };
  };
  P.p1q7 = [
    { obj: 'uma moto', pron: 'ela', tempo: 'três anos', P: 60000, r: 25 },
    { obj: 'uma caminhonete', pron: 'ela', tempo: 'quatro anos', P: 120000, r: 35 },
    { obj: 'um celular', pron: 'ele', tempo: 'dois anos', P: 2400, r: 30 }
  ];

  // Q8 — média simples com tabela
  G.p1q8 = function (p) {
    var ns = p.notas, n = ns.length, S = sum(ns), mean = S / n;
    var mid = (Math.min.apply(null, ns) + Math.max.apply(null, ns)) / 2;
    var hints = [{ when: S, msg: 'Essa é a <b>soma</b> das notas. Agora divida pelo número de alunos.' }];
    if (abs(mid - mean) > 0.01) hints.push({ when: mid, msg: 'Essa é a média só da menor e da maior nota. Use as notas de todos.' });
    return {
      prompt: 'Um professor corrigiu as provas de seus alunos e colocou os dados conforme a tabela a seguir. Qual a média aritmética das notas dos alunos?',
      table: { head: ['Aluno', 'Nota'], rows: p.names.map(function (nm, j) { return [nm, String(ns[j])]; }) },
      items: [{
        key: 'u',
        answer: { type: 'number', value: mean, placeholder: 'Média' },
        hint: { rules: ['media-simples'], tip: 'Some todas as notas da tabela e conte quantos alunos são.' },
        hints: hints,
        final: br(mean),
        steps: window.GM_STEPS.media(ns)
      }]
    };
  };
  P.p1q8 = [
    { names: ['Bruno', 'Carla', 'Diego', 'Elisa', 'Fábio'], notas: [8, 6, 9, 7, 10] },
    { names: ['Gabi', 'Hugo', 'Iara', 'João', 'Kaio', 'Lara', 'Mateus', 'Nina'], notas: [4, 9, 7, 8, 6, 5, 10, 9] },
    { names: ['Otávio', 'Paula', 'Rafa', 'Sofia', 'Téo', 'Vitória'], notas: [9, 7, 10, 8, 6, 5] }
  ];

  // Q9 — média ponderada
  G.p1q9 = function (p) {
    var gs = p.groups, tot = sum(gs.map(function (g) { return g[0]; }));
    var S = sum(gs.map(function (g) { return g[0] * g[1]; })), mean = S / tot;
    var simple = sum(gs.map(function (g) { return g[1]; })) / gs.length;
    var exact = abs(Math.round(mean * 100) - mean * 100) < 1e-9;
    var txt = gs.map(function (g, i) { return g[0] + ' ' + p.noun + ' têm ' + g[1] + ' anos'; });
    return {
      prompt: p.ctx + ', ' + txt[0] + ', ' + txt[1] + ' e ' + txt[2] + '. Qual é a média das idades?',
      items: [{
        key: 'u',
        answer: { type: 'number', value: mean, tol: 0.049, suffix: 'anos', placeholder: 'Média', help: 'Pode responder com duas casas decimais (ex.: 10,25) ou como fração (ex.: 41/4).' },
        hint: { rules: ['media-grupos'], tip: 'Cada idade aparece várias vezes. Multiplique cada idade pela quantidade antes de somar — e divida pelo total de ' + p.noun + '.' },
        hints: [
          { when: simple, tol: 0.02, msg: 'Você fez a média só das idades. Mas cada idade aparece <b>várias vezes</b>!' },
          { when: S, msg: 'Essa é a soma de todas as idades. Divida pelo total de ' + p.noun + '.' }
        ],
        final: exact ? br(mean) + ' anos' : '[[frac{' + S + '}{' + tot + '} ≈ ' + br(mean, 2) + ']] anos',
        steps: window.GM_STEPS.mediaGrupos(gs, p.noun)
      }]
    };
  };
  P.p1q9 = [
    { ctx: 'Em um time de futebol', noun: 'jogadores', groups: [[12, 11], [8, 13], [6, 14]] },
    { ctx: 'Em uma turma de natação', noun: 'crianças', groups: [[10, 9], [6, 10], [4, 12]] },
    { ctx: 'Em um curso de robótica', noun: 'alunos', groups: [[5, 13], [15, 14], [10, 16]] }
  ];

  // Q10 — reflexão de triângulo, trapézio ou losango, com a reta em pé ou deitada.
  // Alternativas erradas possíveis (cada variação escolhe 5 que não fiquem iguais à certa):
  // transl/transl2 = só arrastou · subiu/desceu = espelhou mas saiu da altura · perto = distância errada
  // rot = girou meia volta · flip = virou para o lado errado. (Losango: girar ou virar coincidiria com a certa.)
  function reflOptions(p) {
    var V = p.axis === 'v', ax = V ? 0 : 1, par = V ? 1 : 0, k = p.k, nome = p.kind;
    var refl = function (q) { var r = q.slice(); r[ax] = 2 * k - q[ax]; return r; };
    var mean = function (arr, i) { return sum(arr.map(function (q) { return q[i]; })) / arr.length; };
    var shift = function (pts, i, d) { return pts.map(function (q) { var r = q.slice(); r[i] += d; return r; }); };
    var img = p.orig.map(refl);
    var dT = Math.round(mean(img, ax) - mean(p.orig, ax));
    var transl = shift(p.orig, ax, dT);
    var c = Math.round(mean(p.orig, par));
    var flipPar = function (pts) { return pts.map(function (q) { var r = q.slice(); r[par] = 2 * c - q[par]; return r; }); };
    var minD = Math.min.apply(null, img.map(function (q) { return abs(q[ax] - k); }));
    var side = Math.sign(img[0][ax] - k);
    var arrastou = 'Esse ' + nome + ' foi só <b>arrastado</b> (translação): não ficou espelhado. Na reflexão, o ponto mais perto da reta continua mais perto do outro lado.';
    return {
      certa: { pts: img },
      transl: { pts: transl, hint: arrastou },
      transl2: { pts: shift(transl, par, 3), hint: arrastou },
      subiu: { pts: shift(img, par, 2), hint: V ? 'O formato espelhado está certo, mas o ' + nome + ' <b>subiu</b> 2 quadradinhos. Cada ponto deve continuar na mesma altura.' : 'O formato espelhado está certo, mas o ' + nome + ' <b>andou para o lado</b> 2 quadradinhos. Na reflexão em reta deitada, cada ponto continua na mesma coluna.' },
      desceu: { pts: shift(img, par, -2), hint: V ? 'O formato espelhado está certo, mas o ' + nome + ' <b>desceu</b> 2 quadradinhos. Cada ponto deve continuar na mesma altura.' : 'O formato espelhado está certo, mas o ' + nome + ' <b>andou para o lado</b> 2 quadradinhos. Na reflexão em reta deitada, cada ponto continua na mesma coluna.' },
      rot: { pts: flipPar(img), hint: 'Esse foi <b>girado</b> meia volta (rotação). Na reflexão, cada ponto só atravessa a reta, sem ' + (V ? 'mudar de altura' : 'andar para o lado') + '.' },
      perto: { pts: shift(img, ax, minD >= 3 ? -2 * side : 2 * side), hint: 'Está espelhado, mas as <b>distâncias</b> até a reta <i>e</i> não batem. Conte os quadradinhos de cada ponto até a reta.' },
      flip: { pts: flipPar(transl), hint: V ? 'Esse foi virado de <b>cima para baixo</b>. O "espelho" aqui é a reta <i>e</i>, que está em pé.' : 'Esse foi virado de <b>lado</b>. O "espelho" aqui é a reta <i>e</i>, que está deitada.' }
    };
  }
  G.p1q10 = function (p) {
    var V = p.axis === 'v', k = p.k;
    var opts = reflOptions(p);
    var all = p.orig.slice();
    p.opts.forEach(function (id) { all = all.concat(opts[id].pts); });
    var xs = all.map(function (q) { return q[0]; }).concat(V ? [k] : []), ys = all.map(function (q) { return q[1]; }).concat(V ? [] : [k]);
    var cfg = { axis: p.axis, k: k, orig: p.orig, names: p.names, bounds: [Math.min.apply(null, xs) - 2, Math.max.apply(null, xs) + 2, Math.min.apply(null, ys) - 2, Math.max.apply(null, ys) + 2] };
    var letters = 'ABCDEF';
    var options = p.opts.map(function (id, i) {
      return { id: id, html: FIG.reflection(cfg, opts[id].pts, { aria: 'Opção ' + letters[i] }), hint: opts[id].hint, pts: opts[id].pts };
    });
    var right = letters[p.opts.indexOf('certa')];
    var shapeName = p.kind + ' ' + p.names.join('');
    return {
      prompt: 'Encontre a imagem do ' + shapeName + ' por uma reflexão em torno da reta <i>e</i>, ambos desenhados a seguir. (Use régua!)',
      figure: FIG.reflection(cfg, null),
      note: 'No app, a malha quadriculada faz o papel da régua: escolha o desenho que mostra a imagem ' + p.names.map(function (n) { return n + '′'; }).join('') + ' correta.',
      items: [{
        key: 'u',
        answer: { type: 'choice', layout: 'figs', correct: 'certa', options: options },
        hint: { rules: ['reflexao'], tip: 'Conte quantos quadradinhos cada ponto está da reta <i>e</i> e procure a opção em que essa distância se repete do outro lado.' },
        final: 'Alternativa ' + right,
        steps: window.GM_STEPS.reflection(cfg, opts.certa.pts, right, shapeName)
      }]
    };
  };
  P.p1q10 = [
    { kind: 'triângulo', names: ['P', 'Q', 'R'], axis: 'v', k: 8, orig: [[3, 8], [6, 4], [1, 1]], opts: ['rot', 'certa', 'transl', 'perto', 'flip', 'subiu'] },
    { kind: 'triângulo', names: ['P', 'Q', 'R'], axis: 'h', k: 6, orig: [[2, 9], [8, 11], [5, 8]], opts: ['transl', 'flip', 'subiu', 'certa', 'rot', 'perto'] },
    { kind: 'trapézio', names: ['A', 'B', 'C', 'D'], axis: 'v', k: 10, orig: [[1, 1], [7, 1], [7, 5], [3, 5]], opts: ['subiu', 'transl', 'certa', 'flip', 'perto', 'rot'] },
    { kind: 'losango', names: ['A', 'B', 'C', 'D'], axis: 'h', k: 5, orig: [[2, 7], [5, 8], [6, 11], [3, 10]], opts: ['transl', 'desceu', 'perto', 'subiu', 'certa', 'transl2'] }
  ];

  /* =========================== P2 =========================== */

  // Q1 — módulo (4 itens)
  function absItem(key, n) {
    var v = abs(n);
    return {
      key: key, label: key + ')', prompt: '[[|' + n + '|]] =',
      answer: { type: 'integer', value: v, neg: true },
      hint: { rules: ['modulo'], tip: 'Pense na distância do ' + br(n) + ' até o zero na reta numérica.' },
      hints: n !== 0 ? [{ when: -v, msg: 'O módulo é uma distância, e distância nunca é negativa.' }] : [],
      final: String(v),
      steps: window.GM_STEPS.modulo([{ sign: '', inner: [n] }])
    };
  }
  G.p2q1 = function (p) {
    var c = p.c, inner = c[1] === '-' ? c[0] - c[2] : c[0] + c[2], cv = abs(inner);
    var d = p.d, sg = function (s) { return s === '-' ? -1 : 1; };
    var dv = sg(d[0][0]) * abs(d[0][1]) + sg(d[1][0]) * abs(d[1][1]);
    var dTxt = (d[0][0] === '-' ? '-' : '') + '|' + d[0][1] + '| ' + d[1][0] + ' |' + d[1][1] + '|';
    var dHints = [];
    var noOuter = abs(d[0][1]) + abs(d[1][1]), keepIn = sg(d[0][0]) * d[0][1] + sg(d[1][0]) * d[1][1];
    if (noOuter !== dv) dHints.push({ when: noOuter, msg: 'Cuidado: o sinal que está <b>fora</b> das barras continua valendo.' });
    if (keepIn !== dv && keepIn !== noOuter) dHints.push({ when: keepIn, msg: 'Lembre: o módulo deixa <b>positivo</b> o que está dentro das barras.' });
    return {
      prompt: 'Calcule:',
      items: [
        absItem('a', p.a), absItem('b', p.b),
        {
          key: 'c', label: 'c)', prompt: '[[|' + c[0] + ' ' + c[1] + ' ' + c[2] + '|]] =',
          answer: { type: 'integer', value: cv, neg: true },
          hint: { rules: ['modulo'], tip: 'Primeiro resolva a conta que está <b>dentro</b> das barras. Só depois aplique o módulo.' },
          hints: inner < 0 ? [{ when: inner, msg: 'Você resolveu a conta de dentro certinho! Mas ainda falta aplicar o módulo.' }] : [],
          final: String(cv),
          steps: window.GM_STEPS.modulo([{ sign: '', inner: [c[0], c[1], c[2]] }])
        },
        {
          key: 'd', label: 'd)', prompt: '[[' + dTxt + ']] =',
          answer: { type: 'integer', value: dv, neg: true },
          hint: { rules: ['modulo'], tip: 'Calcule cada módulo separadamente. O sinal que está <b>fora</b> das barras continua valendo.' },
          hints: dHints,
          final: br(dv),
          steps: window.GM_STEPS.modulo([{ sign: d[0][0], inner: [d[0][1]] }, { sign: d[1][0], inner: [d[1][1]] }])
        }
      ]
    };
  };
  P.p2q1 = [
    { a: -15, b: 9, c: [2, '-', 11], d: [['-', 8], ['+', -3]] },
    { a: -21, b: 0, c: [10, '-', 4], d: [['-', -6], ['+', 4]] },
    { a: -100, b: 12, c: [-5, '-', 3], d: [['+', -7], ['-', -9]] }
  ];

  // Q2 — quantidade de divisores
  function factor(N) { var f = [], n = N, d = 2; while (n > 1) { while (n % d === 0) { f.push(d); n /= d; } d++; } return f; }
  function divisors(N) { var out = []; for (var d = 1; d <= N; d++) if (N % d === 0) out.push(d); return out; }
  G.p2q2 = function (p) {
    var N = p.N, f = factor(N), ex = {};
    f.forEach(function (q) { ex[q] = (ex[q] || 0) + 1; });
    var primes = Object.keys(ex).map(Number);
    var count = primes.reduce(function (s, q) { return s * (ex[q] + 1); }, 1);
    var rows = '', cur = N;
    f.forEach(function (q) { rows += '<tr><td>' + cur + '</td><td>' + q + '</td></tr>'; cur /= q; });
    rows += '<tr><td>1</td><td></td></tr>';
    var fact = primes.map(function (q) { return q + '^' + ex[q]; }).join(' * ');
    var prodExp = primes.reduce(function (s, q) { return s * ex[q]; }, 1), sumExp = primes.reduce(function (s, q) { return s + ex[q]; }, 0);
    var hints = [{ when: primes.length, msg: 'Esses são só os divisores primos. A pergunta é sobre <b>todos</b> os divisores.' }];
    if (prodExp !== count && prodExp !== primes.length) hints.unshift({ when: prodExp, msg: 'Quase! Antes de multiplicar, some <b>1</b> a cada expoente.' });
    if (sumExp !== count && sumExp !== prodExp && sumExp !== primes.length) hints.push({ when: sumExp, msg: 'Não é para somar os expoentes: some 1 a cada um e <b>multiplique</b>.' });
    var ds = divisors(N), pairs = [];
    for (var i = 0; i < ds.length && ds[i] * ds[i] <= N; i++) pairs.push(ds[i] + '·' + N / ds[i]);
    return {
      prompt: 'Calcule o número de divisores positivos do número ' + N + '.',
      items: [{
        key: 'u',
        answer: { type: 'integer', value: count, placeholder: 'Quantidade' },
        hint: { rules: ['qtd-divisores'], tip: 'Fatore ' + N + ' em números primos e olhe os <b>expoentes</b>.' },
        hints: hints,
        final: count + ' divisores',
        steps: {
          ask: 'Quantos números inteiros positivos dividem ' + N + ' <b>exatamente</b>.',
          concept: '<b>Truque dos expoentes:</b> fatore em primos, some 1 a cada expoente e multiplique.',
          data: 'O número é <b>' + N + '</b>.',
          s1: 'Fatorando ' + N + ':<table class="fatora">' + rows + '</table><div class="calc">[[' + N + ' = ' + fact + ']]</div>',
          s2: 'Expoentes: ' + primes.map(function (q) { return ex[q]; }).join(', ') + '. Somamos 1 em cada e multiplicamos:<div class="calc">[[' + primes.map(function (q) { return '(' + ex[q] + ' + 1)'; }).join(' * ') + ' = ' + primes.map(function (q) { return ex[q] + 1; }).join(' * ') + ' = ' + count + ']]</div>',
          final: N + ' tem <b>' + count + ' divisores positivos</b>.',
          check: 'Em pares que multiplicados dão ' + N + ': ' + pairs.join(', ') + '. ' + (ds.length === count ? 'Contando, são ' + ds.length + ' divisores ✓.' : '')
        }
      }]
    };
  };
  P.p2q2 = [{ N: 72 }, { N: 300 }, { N: 1000 }];

  // Q3 — lista de divisores
  G.p2q3 = function (p) {
    var N = p.N, ds = divisors(N), pairs = [], tested = [];
    for (var i = 0; i < ds.length && ds[i] * ds[i] <= N; i++) pairs.push('<b>' + ds[i] + ' × ' + N / ds[i] + '</b>');
    for (var t = 1; t * t <= N; t++) tested.push('[[' + N + ' ÷ ' + t + ']] ' + (N % t === 0 ? '= ' + N / t + ' ✓' : 'sobra ' + (N % t) + ' ✗'));
    var neg = ds.slice().reverse().map(function (v) { return -v; }).concat(ds);
    return {
      prompt: 'Apresente todos os divisores do número ' + N + '.',
      items: [{
        key: 'u',
        answer: { type: 'textList', values: ds, alsoAccept: [neg], placeholder: 'Ex.: 1, 2, ...', help: 'Digite os divisores separados por vírgula ou espaço.' },
        hint: { rules: ['divisores'], tip: 'Teste 1, 2, 3, 4... e procure os <b>pares</b> de números que, multiplicados, dão ' + N + '.' },
        hints: [
          { when: function (v) { return v.some(function (a) { return a === 0 || N % a !== 0; }); }, msg: 'Tem número na sua lista que <b>não divide</b> ' + N + ' exatamente. Confira cada um.' },
          { when: function (v) { return v.indexOf(1) < 0 || v.indexOf(N) < 0; }, msg: 'Não esqueça: o <b>1</b> e o próprio <b>' + N + '</b> também são divisores!' },
          { when: function () { return true; }, msg: 'Ainda falta divisor. Procure todos os pares que multiplicados dão ' + N + '.' }
        ],
        final: ds.slice(0, -1).join(', ') + ' e ' + ds[ds.length - 1],
        steps: {
          ask: 'Listar <b>todos</b> os números que dividem ' + N + ' sem sobrar resto.',
          concept: 'Divisores vêm em <b>pares</b> que, multiplicados, dão o número.',
          data: 'O número é <b>' + N + '</b>.',
          s1: 'Testamos de 1 em diante:<div class="calc">' + tested.join(' &nbsp; ') + '</div>',
          s2: 'Os pares são:' + L.boxes(pairs) + 'Quando o próximo teste passaria da metade do caminho (os pares começariam a se repetir), podemos parar.',
          final: 'Os divisores de ' + N + ' são:' + L.boxes(ds, 'nbox-answer'),
          check: 'São ' + ds.length + ' divisores, e cada par multiplicado dá ' + N + ' ✓.'
        }
      }]
    };
  };
  P.p2q3 = [{ N: 24 }, { N: 30 }, { N: 36 }];

  // Q4 — divisibilidade por 2 e 3
  var divOptions = [
    { id: 'd2', html: 'Divisível por 2' },
    { id: 'd3', html: 'Divisível por 3' },
    { id: 'none', html: 'Não é divisível nem por 2 nem por 3', exclusive: true }
  ];
  function divItem(key, n) {
    var digits = String(n).split('').map(Number), s = sum(digits), last = digits[digits.length - 1];
    var by2 = n % 2 === 0, by3 = s % 3 === 0;
    var correct = by2 && by3 ? ['d2', 'd3'] : by2 ? ['d2'] : by3 ? ['d3'] : ['none'];
    var label = by2 && by3 ? 'por 2 e por 3' : by2 ? 'somente por 2' : by3 ? 'somente por 3' : 'nem por 2, nem por 3';
    return {
      key: key, label: key + ')', prompt: String(n),
      answer: { type: 'multiSelect', options: divOptions, correct: correct },
      hint: { rules: ['div2', 'div3'], tip: 'Para ' + n + ': olhe o <b>último algarismo</b> e depois <b>some os algarismos</b>.' },
      hints: [
        { when: function (sel) { return sel.has('d2') !== by2; }, msg: 'Olhe o último algarismo: ele é par ou ímpar?' },
        { when: function (sel) { return sel.has('d3') !== by3; }, msg: 'Some os algarismos e veja se o resultado está na tabuada do 3.' },
        { when: function () { return true; }, msg: 'Confira as duas regras com calma, uma de cada vez.' }
      ],
      final: 'Divisível ' + label,
      steps: {
        ask: 'Descobrir se <b>' + n + '</b> é divisível por 2, por 3, pelos dois ou por nenhum.',
        concept: '<b>Regra do 2:</b> termina em 0, 2, 4, 6 ou 8.<br><b>Regra do 3:</b> a soma dos algarismos está na tabuada do 3.',
        data: 'O número é <b>' + n + '</b>.',
        s1: '<b>Por 2:</b> o último algarismo é <b>' + last + '</b>, que é ' + (by2 ? 'par → divisível por 2 ✓' : 'ímpar → não é divisível por 2 ✗') + '.',
        s2: '<b>Por 3:</b> [[' + digits.join(' + ') + ' = ' + s + ']]. ' + s + (by3 ? ' está' : ' não está') + ' na tabuada do 3 → ' + (by3 ? 'divisível por 3 ✓' : 'não é divisível por 3 ✗') + '.',
        final: n + ' é divisível <b>' + label + '</b>.',
        check: (by2 ? '[[' + n + ' ÷ 2 = ' + n / 2 + ']] ✓' : '[[' + n + ' ÷ 2]] sobra 1 ✗') + '; ' + (by3 ? '[[' + n + ' ÷ 3 = ' + n / 3 + ']] ✓' : '[[' + n + ' ÷ 3]] sobra ' + (n % 3) + ' ✗') + '.'
      }
    };
  }
  G.p2q4 = function (p) {
    return { prompt: 'Verificar quais dos números são divisíveis por 2 ou 3. (Use as regras de divisibilidade!)', items: ['a', 'b', 'c', 'd'].map(function (k, i) { return divItem(k, p.nums[i]); }) };
  };
  P.p2q4 = [{ nums: [246, 1001, 5010, 777] }, { nums: [135, 4418, 3726, 2023] }, { nums: [9990, 511, 1234, 8403] }];

  // Q5 — monômios semelhantes
  function termMath(c, e, first) {
    var s = first ? (c < 0 ? '-' : '') : (c < 0 ? ' - ' : ' + ');
    var a = abs(c);
    return s + (e > 0 && a === 1 ? '' : br(a)) + (e > 0 ? 'x' + (e > 1 ? '^' + e : '') : '');
  }
  function termsMath(terms) { return terms.map(function (t, i) { return termMath(t[0], t[1], i === 0); }).join(''); }
  function monoItem(key, e, cs) {
    var total = sum(cs), expr = termsMath(cs.map(function (c) { return [c, e]; }));
    var res = L.polyToMath(L.polyFromTerms([[total, e]]));
    var chain = [], acc = cs[0];
    for (var i = 1; i < cs.length; i++) { chain.push('[[' + acc + ' ' + (cs[i] < 0 ? '-' : '+') + ' ' + abs(cs[i]) + ' = ' + (acc + cs[i]) + ']]'); acc += cs[i]; }
    var absSum = sum(cs.map(abs));
    var hints = [{ when: function (p) { var ks = Object.keys(p); return ks.length === 1 && +ks[0] !== e; }, msg: 'Na soma o expoente <b>não muda</b>: continua [[x' + (e > 1 ? '^' + e : '') + ']].' }];
    if (absSum !== total) hints.push({ when: function (p) { return L.polyEqual(p, L.polyFromTerms([[absSum, e]])); }, msg: 'Olhe os <b>sinais</b> de menos: eles tiram.' });
    return {
      key: key, label: key + ')', prompt: '[[' + expr + ']]',
      answer: { type: 'polynomial', coeffs: L.polyFromTerms([[total, e]]), simplified: true },
      hint: { rules: ['semelhantes'], tip: 'Todos os termos têm a mesma parte com letra. Some os coeficientes, com os sinais. O expoente não muda.' },
      hints: hints,
      final: '[[' + res + ']]',
      steps: {
        ask: 'Juntar [[' + expr + ']] em um único monômio.',
        concept: '<b>Termos semelhantes</b>: some os números da frente; a parte com letra fica igual.',
        data: 'Todos os termos têm a parte com letra [[x' + (e > 1 ? '^' + e : '') + ']]. Coeficientes:' + L.boxes(cs.map(function (c) { return br(c); })),
        s1: 'Somamos os coeficientes, um de cada vez:<div class="calc">' + chain.join(' → ') + '</div>',
        s2: 'O coeficiente final é <b>' + br(total) + '</b>' + (abs(total) === 1 ? ' (o 1 não precisa ser escrito)' : '') + '. A parte com letra continua [[x' + (e > 1 ? '^' + e : '') + ']].',
        final: '[[' + expr + ' = ' + res + ']]',
        check: 'Testando com [[x = 1]]: [[' + cs.map(function (c, j) { return (j ? (c < 0 ? ' - ' : ' + ') : (c < 0 ? '-' : '')) + abs(c); }).join('') + ' = ' + total + ']] ✓.'
      }
    };
  }
  G.p2q5 = function (p) { return { prompt: 'Transforme em um único monômio.', items: [monoItem('a', p.a.e, p.a.cs), monoItem('b', p.b.e, p.b.cs), monoItem('c', p.c.e, p.c.cs)] }; };
  P.p2q5 = [
    { a: { e: 1, cs: [4, 9] }, b: { e: 2, cs: [-7, 2] }, c: { e: 3, cs: [3, -5, 1, 4] } },
    { a: { e: 1, cs: [12, -5] }, b: { e: 2, cs: [6, -6, 4] }, c: { e: 3, cs: [-1, 2, -4, 8, -3] } },
    { a: { e: 1, cs: [9, 1] }, b: { e: 2, cs: [-2, -8] }, c: { e: 3, cs: [5, -2, -2, -1, 7] } }
  ];

  // Q6 — grau do polinômio
  function grauItem(key, terms) {
    var poly = L.polyFromTerms(terms), deg = L.degree(poly);
    var rawMax = Math.max.apply(null, terms.map(function (t) { return t[1]; }));
    var byExp = {};
    terms.forEach(function (t) { (byExp[t[1]] = byExp[t[1]] || []).push(t[0]); });
    var combos = Object.keys(byExp).filter(function (e) { return byExp[e].length > 1; }).sort(function (a, b) { return b - a; }).map(function (e) {
      var cs = byExp[e], tot = sum(cs);
      return '<div class="calc">[[' + termsMath(cs.map(function (c) { return [c, +e]; })) + ' = ' + (tot === 0 ? '0' : L.polyToMath(L.polyFromTerms([[tot, +e]]))) + ']]' + (tot === 0 ? ' (somem!)' : '') + '</div>';
    });
    var hints = [];
    if (rawMax !== deg) hints.push({ when: rawMax, msg: 'Cuidado com a pegadinha! Antes de responder, junte os termos semelhantes: alguns se anulam.' });
    hints.push({ when: 0, msg: 'Nem tudo some: confira o que sobra depois de juntar os semelhantes.' });
    return {
      key: key, label: key + ')', prompt: '[[' + termsMath(terms) + ']]',
      answer: { type: 'integer', value: deg, placeholder: 'Grau' },
      hint: { rules: combos.length ? ['grau', 'semelhantes'] : ['grau'], tip: combos.length ? 'Cuidado: alguns termos podem <b>se anular</b>. Junte os semelhantes antes de olhar o maior expoente.' : 'Veja se há termos semelhantes para juntar. Depois procure o maior expoente.' },
      hints: deg === 0 ? [] : hints,
      final: String(deg),
      steps: {
        ask: 'O <b>grau</b> do polinômio.',
        concept: '<b>Grau</b> = o maior expoente do [[x]], depois de juntar os termos semelhantes.',
        data: 'Termos: ' + terms.map(function (t) { return '[[' + termMath(t[0], t[1], true) + ']]'; }).join(', ') + '.',
        s1: combos.length ? 'Juntamos os termos semelhantes:' + combos.join('') : 'Não há termos semelhantes para juntar: cada expoente aparece uma vez só.',
        s2: 'O que sobra é:<div class="calc">[[' + L.polyToMath(poly) + ']]</div>O maior expoente é <b>' + deg + '</b>.',
        final: 'O polinômio tem <b>grau ' + deg + '</b>.',
        check: combos.length && rawMax !== deg ? 'Sem simplificar, alguém diria ' + rawMax + '. Simplificando, o grau é ' + deg + ' ✓.' : 'O termo de maior expoente tem coeficiente diferente de zero ✓.'
      }
    };
  }
  G.p2q6 = function (p) { return { prompt: 'Qual o grau de cada um dos polinômios a seguir?', items: [grauItem('a', p.a), grauItem('b', p.b)] }; };
  P.p2q6 = [
    { a: [[3, 4], [-1, 2], [5, 1], [-2, 0]], b: [[2, 5], [1, 3], [-2, 5], [4, 1], [-1, 3], [1, 2]] },
    { a: [[7, 0], [-1, 1], [6, 3]], b: [[4, 5], [1, 1], [-4, 5], [3, 2], [-3, 2], [9, 0]] },
    { a: [[1, 2], [10, 8], [-3, 0]], b: [[2, 4], [-1, 6], [3, 3], [1, 6], [-2, 4], [1, 3]] }
  ];

  // Q7 — multiplicação de polinômios
  G.p2q7 = function (p) {
    var A = L.polyFromTerms(p.A), B = L.polyFromTerms(p.B), prod = L.pMul(A, B);
    var lines = [], raw = [];
    p.A.forEach(function (ta) {
      p.B.forEach(function (tb) {
        var c = ta[0] * tb[0], e = ta[1] + tb[1];
        raw.push([c, e]);
        lines.push('[[' + termMath(ta[0], ta[1], true) + ' * ' + (tb[0] < 0 ? '(' + termMath(tb[0], tb[1], true) + ')' : termMath(tb[0], tb[1], true)) + ' = ' + termMath(c, e, true) + ']]');
      });
    });
    var val1 = function (q) { return Object.keys(q).reduce(function (s, k) { return s + q[k]; }, 0); };
    var partial = L.pMul(A, L.polyFromTerms([p.B[0]]));
    return {
      prompt: 'Sendo [[A(x) = ' + termsMath(p.A) + ']] e [[B(x) = ' + termsMath(p.B) + ']], calcule [[A * B]].',
      items: [{
        key: 'u',
        answer: { type: 'polynomial', coeffs: prod, simplified: true },
        hint: { rules: ['distributiva', 'potencias'], tip: 'Multiplique <b>cada</b> termo de [[A]] por <b>cada</b> termo de [[B]] (são 4 multiplicações). Depois junte os semelhantes.' },
        hints: [
          { when: function (q) { return L.polyEqual(q, L.pAdd(A, B, 1)); }, msg: 'Isso é [[A + B]] (soma). A questão pede a <b>multiplicação</b>.' },
          { when: function (q) { return L.polyEqual(q, partial); }, msg: 'Faltou multiplicar pelo segundo termo de [[B(x)]]: são 4 multiplicações.' }
        ],
        final: '[[' + L.polyToMath(prod) + ']]',
        steps: {
          ask: '<b>Multiplicar</b> [[A(x)]] por [[B(x)]].',
          concept: '<b>Distributiva</b>: cada termo do primeiro multiplica cada termo do segundo. Na multiplicação de potências de mesma base, <b>somamos</b> os expoentes.',
          data: '[[A(x) = ' + termsMath(p.A) + ']] e [[B(x) = ' + termsMath(p.B) + ']].',
          s1: 'As 4 multiplicações:<div class="calc">' + lines.slice(0, 2).join(' &nbsp; ') + '</div><div class="calc">' + lines.slice(2).join(' &nbsp; ') + '</div>',
          s2: 'Juntando e somando os semelhantes:<div class="calc">[[' + termsMath(raw) + ' = ' + L.polyToMath(prod) + ']]</div>',
          final: '[[A * B = ' + L.polyToMath(prod) + ']]',
          check: 'Testando com [[x = 1]]: [[A(1) = ' + val1(A) + ']], [[B(1) = ' + val1(B) + ']] e [[' + val1(A) + ' * ' + (val1(B) < 0 ? '(' + val1(B) + ')' : val1(B)) + ' = ' + val1(prod) + ']]. Na resposta, com [[x = 1]], também dá ' + br(val1(prod)) + ' ✓.'
        }
      }]
    };
  };
  P.p2q7 = [
    { A: [[1, 2], [2, 1]], B: [[1, 1], [3, 0]] },
    { A: [[1, 2], [-1, 1]], B: [[1, 1], [4, 0]] },
    { A: [[2, 2], [1, 1]], B: [[1, 1], [-5, 0]] }
  ];

  // Q8 — soma e produto
  function eqItem(key, cfg) {
    var a = cfg.lead, r1 = cfg.r[0], r2 = cfg.r[1], S = r1 + r2, Pd = r1 * r2;
    var b = -a * S, c = a * Pd, full = L.polyFromTerms([[a, 2], [b, 1], [c, 0]]);
    var sw = [-r1, -r2];
    var hints = [];
    if ((-r1 !== r1 || -r2 !== r2) && (sw[0] + sw[1] !== S)) hints.push({ when: sw, msg: 'O produto está certo, mas a soma ficou com o sinal trocado. A soma precisa ser <b>' + br(S) + '</b>.' });
    hints.push({ when: function (v) { return v[0] * v[1] !== Pd; }, msg: 'Confira o <b>produto</b>: [[frac{c}{a} = frac{' + c + '}{' + a + '} = ' + Pd + ']]. As raízes multiplicadas precisam dar ' + br(Pd) + '.' });
    hints.push({ when: function () { return true; }, msg: 'Confira a <b>soma</b>: [[frac{-b}{a} = frac{' + (-b) + '}{' + a + '} = ' + S + ']].' });
    return {
      key: key, label: key + ')', prompt: '[[' + L.polyToMath(full) + ' = 0]]',
      answer: { type: 'numberList', values: [r1, r2], ordered: false, labels: ['[[x_1]] =', '[[x_2]] ='], neg: true },
      hint: { rules: ['soma-produto'], tip: 'Aqui [[a = ' + a + ']]' + (a === -1 ? ' (é [[-x^2]])' : a === 1 ? ' (é só [[x^2]])' : '') + ', [[b = ' + b + ']] e [[c = ' + c + ']]. Soma = [[frac{-b}{a}]] e produto = [[frac{c}{a}]]. Comece pelo produto!' },
      hints: hints,
      final: '[[x = ' + Math.min(r1, r2) + ']] e [[x = ' + Math.max(r1, r2) + ']]',
      steps: window.GM_STEPS.somaProduto(a, r1, r2)
    };
  }
  G.p2q8 = function (p) { return { prompt: 'Resolver as equações usando soma e produto ([[U = ℝ]]).', items: [eqItem('a', p.a), eqItem('b', p.b)] }; };
  P.p2q8 = [
    { a: { lead: -1, r: [-2, 5] }, b: { lead: 1, r: [3, 4] } },
    { a: { lead: -1, r: [1, 6] }, b: { lead: 1, r: [-5, 3] } },
    { a: { lead: 1, r: [-4, -1] }, b: { lead: -1, r: [-7, 2] } }
  ];

  // Q9 — área de três quadrados
  G.p2q9 = function (p) {
    var s = p.sides, ar = s.map(function (v) { return v * v; }), tot = sum(ar);
    return {
      prompt: 'Observe a figura a seguir. Considerando que o lado do quadrado ABCJ tem ' + s[0] + ' cm, o lado do quadrado DEIJ tem ' + s[1] + ' cm e que o lado do quadrado FGHI tem ' + s[2] + ' cm, qual é a área da figura, em cm²?',
      figure: FIG.squares(s, false),
      items: [{
        key: 'u',
        answer: { type: 'integer', value: tot, suffix: 'cm²', placeholder: 'Área' },
        hint: { rules: ['area-quadrado', 'area-composta'], tip: 'Calcule a área de <b>cada</b> quadrado separadamente e depois junte.' },
        hints: [
          { when: sum(s), msg: 'Você somou os lados. Área de quadrado é <b>lado × lado</b>!' },
          { when: ar[0], msg: 'Essa é a área do quadrado grande. Faltou somar os outros dois.' },
          { when: s[0] * s[1] * s[2], msg: 'Você multiplicou os lados entre si. Calcule a área de <b>cada</b> quadrado e some.' }
        ],
        final: br(tot) + ' cm²',
        steps: window.GM_STEPS.squaresArea(s)
      }]
    };
  };
  P.p2q9 = [{ sides: [60, 30, 10] }, { sides: [100, 50, 25] }, { sides: [50, 40, 20] }];

  // Q10 — lajotas
  G.p2q10 = function (p) {
    var Lc = Math.round(p.Lm * 100), Wc = p.Wmm / 10, t = p.t, area = Lc * Wc, ta = t * t, n = area / ta, cost = n * p.price;
    var noReuse = Math.ceil(Lc / t) * Math.ceil(Wc / t);
    var hints = [
      { when: n, msg: 'Esse é o <b>número de lajotas</b>! Falta calcular o preço total.' },
      { when: area, msg: 'Essa é a área da região em cm². Descubra quantas lajotas cabem e depois o preço.' }
    ];
    if (noReuse !== n) hints.unshift({ when: noReuse * p.price, msg: 'Com o <b>aproveitamento dos recortes</b>, uma lajota cortada ao meio cobre dois pedaços. Não precisa de ' + noReuse + ' lajotas.' });
    return {
      prompt: 'Uma região retangular de ' + br(p.Lm, 2) + ' m de comprimento por ' + p.Wmm + ' mm de largura será revestida de lajotas quadradas de ' + t + ' cm de lado. Se o preço de cada lajota é de ' + money(p.price) + ', determine o total a ser pago para revestir essa região.',
      items: [{
        key: 'u',
        answer: { type: 'currency', value: cost, prefix: 'R$', placeholder: '0,00' },
        hint: { rules: ['conversao', 'lajotas', 'custo'], tip: 'Primeiro passe todas as medidas para <b>centímetros</b>. Depois descubra quantas lajotas cobrem a região.' },
        hints: hints,
        final: money(cost),
        steps: window.GM_STEPS.tiles(p.Lm, p.Wmm, t, p.price)
      }]
    };
  };
  P.p2q10 = [
    { Lm: 1.2, Wmm: 600, t: 10, price: 3.2 },
    { Lm: 0.9, Wmm: 450, t: 15, price: 4.5 },
    { Lm: 0.44, Wmm: 320, t: 8, price: 2.5 }
  ];

  /* ---------- Liga as variações às questões ---------- */
  BANK.exams.forEach(function (exam) {
    exam.questions.forEach(function (q) {
      var id = exam.id + 'q' + q.n;
      if (!G[id]) return;
      q.variations = P[id].map(function (par, i) {
        var v = G[id](par);
        v.id = 'v' + (i + 1);
        v.params = par;
        return v;
      });
    });
  });
  window.GM_VARIATIONS = { generators: G, params: P };
})();
