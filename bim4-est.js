/* =====================================================================
   GAITERO MATH — 4º Bimestre · ESTATÍSTICA
   Aula 139 (médias), 140 (tabelas de frequência) e 141 (tendências e dados
   agrupados). Dados da aula 140 conferidos na foto (42 alturas).
   ===================================================================== */
(function () {
  'use strict';
  var B4 = window.GM_B4, H = B4.H, CT = B4.CT;
  var br = H.br, m = H.m, calc = H.calc, lines = H.lines, small = H.small, aside = H.aside;
  var G = B4.G;
  var r6 = function (v) { return Math.round(v * 1e6) / 1e6; };
  var money = H.money;

  /* ---------- Média aritmética (passo a passo) ---------- */
  var meanConcept = { t: 'O que é a média aritmética?', cls: 'concept', b: 'A <b>média aritmética</b> é a <b>soma dos valores</b> dividida pela <b>quantidade de valores</b>. É como juntar tudo e repartir igualmente.<br>Exemplo com três valores, 1, 2 e 3: [[frac{1 + 2 + 3}{3} = frac{6}{3} = 2]].' };
  function meanSteps(vals, unit) {
    var n = vals.length, S = 0, chain = [];
    vals.forEach(function (v, i) { if (i) chain.push('[[' + br(S) + ' + ' + br(v) + ' = ' + br(r6(S + v)) + ']]'); S = r6(S + v); });
    var mean = r6(S / n), dv = H.divide(S, n, { maxDec: 3 });
    return {
      mean: mean, S: S,
      steps: [
        { t: 'Montando a conta', b: 'São <b>' + n + ' valores</b>:' + H.box(vals.map(H.br1)) + 'A média é:' + calc('Média = [[frac{' + vals.map(H.br1).join(' + ') + '}{' + n + '}]]') },
        { t: 'Somando os valores', b: 'Um de cada vez:' + lines(chain) + 'A soma é <b>' + br(S) + '</b>.' },
        { t: 'Dividindo pela quantidade', b: 'Agora dividimos a soma pelos ' + n + ' valores:' + calc(m('frac{' + br(S) + '}{' + n + '}')) + (dv.inline || 'Fazendo a divisão:') }
      ].concat(dv.steps),
      check: 'A média ficou entre o menor valor (' + br(Math.min.apply(null, vals)) + ') e o maior (' + br(Math.max.apply(null, vals)) + ') ✓. E [[' + br(mean) + ' * ' + n + ' = ' + br(r6(mean * n)) + ']], que é a soma ✓.'
    };
  }
  function meanItem(key, vals) {
    var R = meanSteps(vals);
    return {
      key: key, label: key + ')', prompt: vals.map(H.br1).join(', ').replace(/, ([^,]*)$/, ' e $1'),
      answer: { type: 'number', value: R.mean, placeholder: 'Média' },
      hint: { rules: ['media-simples4'], tip: 'Some todos os números e divida pela quantidade de números.',
        more: ['Quantos números são? Conte: ' + vals.length + '.', 'Depois divida a soma por ' + vals.length + ' (na chave, se precisar).'] },
      hints: [{ when: R.S, msg: 'Essa é a <b>soma</b>. Falta dividir pela quantidade de números (' + vals.length + ').' }, { when: r6((Math.min.apply(null, vals) + Math.max.apply(null, vals)) / 2), msg: 'Você fez a média só do menor e do maior. Use <b>todos</b> os números.' }].filter(function (h) { return Math.abs(h.when - R.mean) > 1e-9; }),
      final: br(R.mean),
      steps: { list: [meanConcept].concat(R.steps).concat([
        { t: 'Resposta final', cls: 'final', b: 'A média é <b>' + br(R.mean) + '</b>.' },
        { t: 'Conferindo se faz sentido', cls: 'check', b: R.check }
      ]) }
    };
  }
  G['139-1'] = function (p) { return { prompt: 'Calcule a média aritmética dos números:', items: p.items.map(function (v, i) { return meanItem('abcd'[i], v); }) }; };

  /* ---------- Média ponderada ---------- */
  var weightConcept = function (ex) {
    return { t: 'O que são os pesos?', cls: 'concept', b: 'Na <b>média ponderada</b>, cada valor tem um <b>peso</b>: um número que diz <b>quantas vezes</b> ele conta. Uma prova com peso 5 conta como se fossem 5 provas iguais!' +
      calc('Média ponderada = [[frac{valor_1 * peso_1 + valor_2 * peso_2 + ...}{peso_1 + peso_2 + ...}]]') + (ex || 'Exemplo: nota 10 com peso 3 e nota 6 com peso 1 → [[frac{10 * 3 + 6 * 1}{3 + 1} = frac{36}{4} = 9]]. A nota de peso maior "puxa" a média para perto dela.') };
  };
  var ORD = ['primeira', 'segunda', 'terceira', 'quarta', 'quinta'];
  G['139-2'] = function (p) {
    var w = p.w, g = p.g, n = w.length, W = H.sum(w), known = r6(H.sum(g.map(function (v, i) { return v * w[i]; }))), need = r6(p.target * W - known), x = r6(need / w[n - 1]);
    var desc = w.map(function (v, i) { return 'a ' + ORD[i] + ' tem peso ' + v; });
    var notes = g.map(function (v, i) { return br(v, 1) + ' na ' + ORD[i] + (i === 0 ? ' prova' : ''); });
    var dv = H.divide(need, w[n - 1], { maxDec: 2 });
    var plainMean = r6((p.target * n - H.sum(g)));
    return {
      prompt: 'A média bimestral em uma escola é composta por ' + n + ' provas. ' + desc.join(', ').replace(/^a/, 'A').replace(/, ([^,]*)$/, ' e $1') + '. Se um aluno tirou ' + H.listPT(notes) + ', qual deve ser sua nota na ' + ORD[n - 1] + ' prova para ser aprovado com uma média igual a ' + br(p.target) + '?',
      items: [{
        key: 'u',
        answer: { type: 'number', value: x, placeholder: 'Nota', help: 'Pode usar vírgula (ex.: 7,5).' },
        hint: { rules: ['media-ponderada'], tip: 'Será que todas as provas contam a mesma coisa? Olhe os <b>pesos</b>.',
          more: ['Chame a nota que falta de [[x]] e monte a média ponderada: cada nota vezes o seu peso, dividido pela soma dos pesos.', 'Iguale essa média a ' + br(p.target) + ' e resolva: primeiro o número que divide passa multiplicando.'] },
        hints: [{ when: plainMean, msg: 'Você fez como se todas as provas tivessem o mesmo peso. A ' + ORD[n - 1] + ' prova tem peso ' + w[n - 1] + '!' }, { when: need, msg: 'Esse é quanto a ' + ORD[n - 1] + ' prova precisa valer <b>já multiplicada pelo peso</b>. Falta dividir por ' + w[n - 1] + '.' }].filter(function (h) { return Math.abs(h.when - x) > 1e-6; }),
        final: br(x),
        steps: { list: [
          weightConcept(),
          { t: 'Montando a média ponderada', b: 'A nota que falta é o [[x]]. Cada nota vezes o seu peso, dividido pela soma dos pesos:' + calc(m('frac{' + g.map(function (v, i) { return br(v) + ' * ' + w[i]; }).join(' + ') + ' + x * ' + w[n - 1] + '}{' + w.join(' + ') + '} = ' + br(p.target))) },
          { t: 'O que já sabemos', b: lines(['Em cima: [[' + g.map(function (v, i) { return br(v) + ' * ' + w[i]; }).join(' + ') + ' = ' + g.map(function (v, i) { return br(r6(v * w[i])); }).join(' + ') + ' = ' + br(known) + ']]', 'Embaixo: [[' + w.join(' + ') + ' = ' + W + ']]']) + 'A conta fica:' + calc(m('frac{' + br(known) + ' + ' + w[n - 1] + 'x}{' + W + '} = ' + br(p.target))) },
          { t: 'Tirando a fração', b: 'O ' + W + ' está <b>dividindo</b>; ele passa para o outro lado <b>multiplicando</b>:' + lines(['[[' + br(known) + ' + ' + w[n - 1] + 'x = ' + br(p.target) + ' * ' + W + ']]', '[[' + br(known) + ' + ' + w[n - 1] + 'x = ' + br(r6(p.target * W)) + ']]']) + aside('Isso quer dizer: para ter média ' + br(p.target) + ' com pesos que somam ' + W + ', a soma "nota × peso" precisa dar ' + br(r6(p.target * W)) + '.') },
          { t: 'Deixando o x sozinho', b: lines(['[[' + w[n - 1] + 'x = ' + br(r6(p.target * W)) + ' - ' + br(known) + ']]' + small('o ' + br(known) + ' que soma passa subtraindo'), '[[' + w[n - 1] + 'x = ' + br(need) + ']]', '[[x = frac{' + br(need) + '}{' + w[n - 1] + '}]]' + small('o ' + w[n - 1] + ' que multiplica passa dividindo')]) + (dv.inline || 'Fazendo a divisão:') }
        ].concat(dv.steps).concat([
          { t: 'Resposta final', cls: 'final', b: 'Ele precisa tirar <b>' + br(x) + '</b> na ' + ORD[n - 1] + ' prova.' },
          { t: 'Conferindo se faz sentido', cls: 'check', b: 'Com ' + br(x) + ': [[frac{' + br(known) + ' + ' + br(x) + ' * ' + w[n - 1] + '}{' + W + '} = frac{' + br(known) + ' + ' + br(need) + '}{' + W + '} = frac{' + br(r6(p.target * W)) + '}{' + W + '} = ' + br(p.target) + ']] ✓.' }
        ]) }
      }]
    };
  };

  // Compras: grupos = [[quantidade, preço], ...]; noun = 'livros'
  function priceMean(groups, noun) {
    var qty = H.sum(groups.map(function (g) { return g[0]; })), tot = r6(H.sum(groups.map(function (g) { return g[0] * g[1]; }))), mean = r6(tot / qty);
    var dv = H.divide(tot, qty, { maxDec: 3 });
    var simple = r6(H.sum(groups.map(function (g) { return g[1]; })) / groups.length);
    var exact2 = Number.isInteger(r6(mean * 100));
    return {
      mean: mean, tot: tot, qty: qty, simple: simple, exact2: exact2,
      steps: [
        weightConcept('Aqui o "peso" de cada preço é a <b>quantidade</b> de ' + noun + ' comprados por aquele preço.'),
        { t: 'Por que não fazer só a média dos preços?', b: 'Se fizéssemos [[frac{' + groups.map(function (g) { return br(g[1]); }).join(' + ') + '}{' + groups.length + '}]], cada preço contaria uma vez só. Mas os ' + noun + ' não foram comprados na mesma quantidade: cada preço precisa contar <b>tantas vezes quantos ' + noun + '</b> foram comprados por ele.' },
        { t: 'Quanto gastou ao todo?', b: lines(groups.map(function (g) { return '[[' + g[0] + ' * ' + br(g[1]) + ' = ' + br(r6(g[0] * g[1])) + ']]' + small(g[0] + ' ' + noun + ' de ' + money(g[1])); }).concat(['Total: [[' + groups.map(function (g) { return br(r6(g[0] * g[1])); }).join(' + ') + ' = ' + br(tot) + ']] reais'])) },
        { t: 'Quantos ' + noun + '?', b: calc(m(groups.map(function (g) { return g[0]; }).join(' + ') + ' = ' + qty)) },
        { t: 'Dividindo', b: 'Preço médio = total gasto dividido pela quantidade:' + calc(m('frac{' + br(tot) + '}{' + qty + '}')) + (dv.inline || 'Fazendo a divisão:') }
      ].concat(dv.steps)
    };
  }
  G['139-3'] = function (p) {
    var R = priceMean(p.groups, p.noun);
    var mtxt = R.exact2 ? money(R.mean) : 'R$ ' + br(R.mean) + ' (≈ ' + money(R.mean) + ')';
    return {
      prompt: p.who + ' comprou ' + p.groups.map(function (g) { return g[0] + ' ' + p.noun + ' por ' + br(g[1]) + ' reais cada'; }).join(' e ') + '. Qual é o preço médio dos ' + p.noun + ' que ' + p.pron + ' comprou?',
      items: [{
        key: 'u',
        answer: { type: 'currency', value: R.mean, tol: R.exact2 ? 1e-6 : 0.006, prefix: 'R$', placeholder: '0,00', help: R.exact2 ? '' : 'Pode responder com duas casas (centavos).' },
        hint: { rules: ['media-ponderada'], tip: 'Será que os dois preços aparecem a mesma quantidade de vezes?',
          more: ['Multiplique cada preço pela quantidade de ' + p.noun + ' e some: é o total gasto.', 'Depois de somar, divida pela quantidade total de ' + p.noun + '.'] },
        hints: [{ when: R.simple, msg: 'Você fez a média só dos dois preços. Mas foram comprados mais ' + p.noun + ' de um preço que do outro!' }, { when: R.tot, msg: 'Esse é o <b>total gasto</b>. Falta dividir pela quantidade de ' + p.noun + '.' }].filter(function (h) { return Math.abs(h.when - R.mean) > 0.01; }),
        final: mtxt,
        steps: { list: R.steps.concat([
          { t: 'Resposta final', cls: 'final', b: 'O preço médio dos ' + p.noun + ' é <b>' + mtxt + '</b>.' },
          { t: 'Conferindo se faz sentido', cls: 'check', b: 'O preço médio ficou entre ' + money(Math.min(p.groups[0][1], p.groups[1][1])) + ' e ' + money(Math.max(p.groups[0][1], p.groups[1][1])) + ' ✓, mais perto do preço que teve <b>mais</b> ' + p.noun + ' ✓. Se todos custassem ' + mtxt.replace(/ \(.*/, '') + ', o total seria quase o mesmo gasto (' + money(R.tot) + ') ✓.' }
        ]) }
      }]
    };
  };
  G['139-4'] = function (p) {
    var R = priceMean(p.groups, p.noun);
    var mtxt = R.exact2 ? money(R.mean) : 'R$ ' + br(R.mean);
    return {
      prompt: 'Com base no exercício anterior, faça um exercício sobre média ponderada e resolva-o.',
      note: '<b>Exercício criado pelo Gaitero:</b> ' + p.who + ' comprou ' + p.groups.map(function (g) { return g[0] + ' ' + p.noun + ' por ' + money(g[1]) + ' cada'; }).join(' e ') + '. Qual é o preço médio dos ' + p.noun + '? (No caderno, invente o seu também!)',
      items: [{
        key: 'u',
        answer: { type: 'currency', value: R.mean, tol: R.exact2 ? 1e-6 : 0.006, prefix: 'R$', placeholder: '0,00' },
        hint: { rules: ['media-ponderada'], tip: 'É igual ao exercício 3: cada preço conta tantas vezes quantos ' + p.noun + ' foram comprados.',
          more: ['Total gasto = soma de (quantidade × preço).', 'Preço médio = total gasto dividido pela quantidade total.'] },
        hints: [{ when: R.simple, msg: 'Essa é a média só dos preços. Use as quantidades como pesos.' }, { when: R.tot, msg: 'Esse é o total gasto. Falta dividir pela quantidade.' }].filter(function (h) { return Math.abs(h.when - R.mean) > 0.01; }),
        final: mtxt,
        steps: { list: [{ t: 'Criando um exercício', cls: 'concept', b: 'Para criar um exercício de média ponderada, basta ter <b>valores que se repetem quantidades diferentes de vezes</b>: preços de produtos comprados em quantidades diferentes, notas com pesos, idades de grupos de pessoas... O Gaitero criou este: ' + p.who + ' comprou ' + p.groups.map(function (g) { return g[0] + ' ' + p.noun + ' por ' + money(g[1]); }).join(' e ') + '.' }].concat(R.steps.slice(1)).concat([
          { t: 'Resposta final', cls: 'final', b: 'O preço médio é <b>' + mtxt + '</b>.' },
          { t: 'Conferindo se faz sentido', cls: 'check', b: 'Ficou entre os dois preços ✓, mais perto do preço com mais ' + p.noun + ' ✓.' }
        ]) }
      }]
    };
  };

  /* ================= Aula 140 — tabelas de frequência ================= */
  var ivConcept = { t: 'Como ler um intervalo', cls: 'concept', b: 'Numa tabela de frequência, os dados ficam agrupados em <b>intervalos</b> (classes). O símbolo [[⊢]] quer dizer: <b>inclui</b> o número da esquerda e <b>não inclui</b> o da direita.' +
    lines(['[[140 ⊢ 142]]: entram 140 e 141' + small('o 142 não entra aqui'), '[[142 ⊢ 144]]: entram 142 e 143']) + 'Assim, cada altura cai em <b>um único</b> intervalo. A <b>frequência</b> é quantos dados caem em cada intervalo.' };
  function rawFig(data) {
    var rows = [];
    for (var i = 0; i < data.length; i += 6) rows.push(data.slice(i, i + 6));
    return '<table class="raw-table">' + rows.map(function (r) { return '<tr>' + r.map(function (v) { return '<td>' + v + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
  }
  var IV = []; for (var a = 140; a < 170; a += 2) IV.push(a);
  var ivTxt = function (a) { return a + ' ⊢ ' + (a + 2); };
  var countIn = function (data, a) { return data.filter(function (v) { return v >= a && v < a + 2; }).length; };
  function freqPart(key, data, part) {
    var ivs = IV.slice(part * 5, part * 5 + 5), counts = ivs.map(function (a) { return countIn(data, a); });
    var sorted = data.slice().sort(function (x, y) { return x - y; });
    var tot = H.sum(counts), lo = ivs[0], hi = ivs[4] + 2;
    return {
      key: key, label: 'Parte ' + (part + 1) + ':', prompt: 'alturas de ' + lo + ' até ' + hi + ' cm (sem o ' + hi + ')',
      answer: { type: 'numberList', values: counts, ordered: true, labels: ivs.map(ivTxt) },
      hint: { rules: ['freq-tabela'], tip: '[[' + ivTxt(lo) + ']] inclui ' + lo + ' e ' + (lo + 1) + ', mas <b>não</b> inclui ' + (lo + 2) + '.',
        more: ['Fica mais fácil se você riscar cada dado da tabela quando contar (como na apostila).', 'Intervalo sem nenhum dado tem frequência <b>0</b>.'] },
      hints: [{ when: function (v) { return H.sum(v) !== tot; }, msg: 'Nesta parte (de ' + lo + ' a ' + (hi - 1) + ' cm) há <b>' + tot + '</b> alturas no total. Some as suas frequências e confira.' }, { when: function () { return true; }, msg: 'O total está certo, mas algum dado foi para o intervalo vizinho. Lembre: ' + (lo + 2) + ' vai para [[' + ivTxt(lo + 2) + ']], não para [[' + ivTxt(lo) + ']].' }],
      final: ivs.map(function (a, i) { return ivTxt(a) + ': ' + counts[i]; }).join(' · '),
      steps: { list: [
        ivConcept,
        { t: 'Organizando os dados', b: 'Para contar sem errar, colocamos as ' + data.length + ' alturas em <b>ordem crescente</b>:' + H.box(sorted.map(function (v) { return v >= lo && v < hi ? '<b>' + v + '</b>' : '<span class="muted">' + v + '</span>'; }), 'nbox-sm') + 'As de ' + lo + ' a ' + (hi - 1) + ' (em negrito) são as desta parte.' },
        { t: 'Contando cada intervalo', b: lines(ivs.map(function (a, i) {
            var vs = sorted.filter(function (v) { return v >= a && v < a + 2; });
            return '[[' + ivTxt(a) + ']]: ' + (vs.length ? vs.join(', ') : 'nenhuma') + ' → frequência <b>' + counts[i] + '</b>';
          })) },
        { t: 'A tabela desta parte', b: H.table(['Altura (cm)', 'Frequência'], ivs.map(function (a, i) { return [ivTxt(a), String(counts[i])]; })) },
        { t: 'Resposta final', cls: 'final', b: ivs.map(function (a, i) { return '[[' + ivTxt(a) + ']]: <b>' + counts[i] + '</b>'; }).join(' · ') },
        { t: 'Conferindo se faz sentido', cls: 'check', b: 'Somando as frequências desta parte: [[' + counts.join(' + ') + ' = ' + tot + ']], que é a quantidade de alturas de ' + lo + ' a ' + (hi - 1) + ' na lista ordenada ✓. Somando as 3 partes, tem que dar ' + data.length + ' (o total de alunos).' }
      ] }
    };
  }
  var dataNote = function (data) { return 'A seguir, estão os resultados de uma pesquisa sobre a altura, em cm, dos ' + data.length + ' alunos do 7º ano.'; };
  G['140-1'] = function (p) {
    return {
      prompt: dataNote(p.data) + ' Faça uma tabela de frequência com os dados anteriores. Divida em intervalos de tamanho 2 cm.',
      figure: rawFig(p.data),
      note: 'No app, a tabela foi dividida em 3 partes (cada uma com 5 intervalos). Preencha as frequências.',
      items: [0, 1, 2].map(function (k) { return freqPart(String(k + 1), p.data, k); })
    };
  };
  function fullTable(data, hlFrom, hlOnly) {
    return H.table(['Altura (cm)', 'Frequência'], IV.map(function (a) { return [ivTxt(a), String(countIn(data, a))]; }),
      IV.map(function (a, i) { return (hlOnly != null ? a === hlOnly : hlFrom != null && a >= hlFrom) ? i : -1; }).filter(function (i) { return i >= 0; }), 'st-table-sm');
  }
  G['140-2'] = function (p) {
    var h = p.h, a = h - h % 2, inIv = countIn(p.data, a), exact = p.data.filter(function (v) { return v === h; }).length;
    var other = a === h ? h + 1 : a;
    return {
      prompt: 'Usando a tabela de frequência, você conseguiria calcular a quantidade de alunos que têm ' + br(h / 100, 2) + ' m de altura? E a partir dos dados brutos? Justifique.',
      figure: rawFig(p.data),
      items: [
        { key: 'a', label: 'a)', prompt: 'Usando a <b>tabela de frequência</b>, dá para saber?',
          answer: { type: 'choice', layout: 'rows', correct: 'nao', options: [
            { id: 'sim', html: 'Sim: é a frequência do intervalo [[' + ivTxt(a) + ']] (' + inIv + ' alunos).', hint: 'Esse intervalo junta quem tem ' + a + ' cm <b>e</b> quem tem ' + (a + 1) + ' cm. A tabela não separa os dois.' },
            { id: 'nao', html: 'Não: o intervalo [[' + ivTxt(a) + ']] junta as alturas ' + a + ' e ' + (a + 1) + ' cm, e a tabela não mostra quantos têm exatamente ' + h + ' cm.' },
            { id: 'meio', html: 'Sim: é a metade da frequência do intervalo.', hint: 'Não dá para saber se metade tem ' + a + ' e metade ' + (a + 1) + '. Pode ser qualquer divisão!' }
          ] },
          hint: { rules: ['freq-tabela'], tip: 'Converta: ' + br(h / 100, 2) + ' m = ' + h + ' cm. Em qual intervalo ele fica?', more: ['Quais outras alturas também caem nesse intervalo?', 'A tabela só diz o <b>total</b> do intervalo, não quantos têm cada altura.'] },
          final: 'Não dá: o intervalo junta ' + a + ' e ' + (a + 1) + ' cm.',
          steps: { list: [
            { t: 'Convertendo', b: br(h / 100, 2) + ' m = ' + h + ' cm (1 m = 100 cm: a vírgula anda 2 casas para a direita).' },
            ivConcept,
            { t: 'Olhando a tabela', b: h + ' cm fica no intervalo [[' + ivTxt(a) + ']], que tem frequência <b>' + inIv + '</b>. Mas esse intervalo inclui <b>duas</b> alturas: ' + a + ' e ' + (a + 1) + ' cm.' + fullTable(p.data, null, a) },
            { t: 'Dá ou não dá?', b: 'A tabela diz que ' + inIv + ' alunos têm ' + a + ' ou ' + (a + 1) + ' cm, mas <b>não</b> diz quantos têm cada uma. Agrupar facilita a visão geral, mas <b>perde detalhes</b>.' },
            { t: 'Resposta final', cls: 'final', b: '<b>Não</b> dá para saber pela tabela: o intervalo [[' + ivTxt(a) + ']] mistura quem tem ' + a + ' cm com quem tem ' + (a + 1) + ' cm.' },
            { t: 'Conferindo se faz sentido', cls: 'check', b: 'Nos dados brutos, ' + exact + ' ' + (exact === 1 ? 'aluno tem' : 'alunos têm') + ' ' + h + ' cm e ' + (inIv - exact) + ' ' + (inIv - exact === 1 ? 'tem' : 'têm') + ' ' + other + ' cm. A tabela só mostra o total, ' + inIv + ' ✓.' }
          ] } },
        { key: 'b', label: 'b)', prompt: 'E nos <b>dados brutos</b> (a lista com as ' + p.data.length + ' alturas)? Quantos alunos têm ' + br(h / 100, 2) + ' m?',
          answer: { type: 'integer', value: exact, placeholder: 'Alunos' },
          hint: { rules: ['freq-tabela'], tip: 'Procure o número ' + h + ' na lista de alturas.', more: ['Passe o dedo linha por linha para não pular nenhum.', 'Cuidado para não contar o ' + other + ' junto.'] },
          hints: [{ when: inIv, msg: 'Esse é o total do intervalo [[' + ivTxt(a) + ']], que inclui também ' + other + ' cm. Conte só o ' + h + '.' }].filter(function (x) { return x.when !== exact; }),
          final: exact + (exact === 1 ? ' aluno' : ' alunos'),
          steps: { list: [
            { t: 'Convertendo', b: br(h / 100, 2) + ' m = ' + h + ' cm (1 m = 100 cm: a vírgula anda 2 casas para a direita).' },
            { t: 'Dados brutos', b: '<b>Dados brutos</b> são os dados do jeito que foram coletados, um por um, sem agrupar. Com eles dá para ver cada altura exata.' },
            { t: 'Procurando ' + h + ' cm', b: 'Ordenando as alturas fica fácil:' + H.box(p.data.slice().sort(function (x, y) { return x - y; }).map(function (v) { return v === h ? '<b class="hl hl-a">' + v + '</b>' : '<span class="muted">' + v + '</span>'; }), 'nbox-sm') + 'O ' + h + ' aparece <b>' + exact + '</b> ' + (exact === 1 ? 'vez' : 'vezes') + '.' },
            { t: 'Resposta final', cls: 'final', b: 'Pelos dados brutos, <b>' + exact + '</b> ' + (exact === 1 ? 'aluno tem' : 'alunos têm') + ' ' + br(h / 100, 2) + ' m. Dá para saber porque os dados brutos não foram agrupados.' },
            { t: 'Conferindo se faz sentido', cls: 'check', b: 'O número é menor ou igual à frequência do intervalo [[' + ivTxt(a) + ']] (' + inIv + ') ✓, porque ' + h + ' cm é só uma das alturas desse intervalo.' }
          ] } }
      ]
    };
  };
  G['140-3'] = function (p) {
    var th = p.t, data = p.data, ivs = IV.filter(function (a) { return a >= th; }), fr = ivs.map(function (a) { return countIn(data, a); }), n = H.sum(fr);
    return {
      prompt: 'Usando a tabela de frequência, calcule a quantidade de alunos que têm ' + br(th / 100, 2) + ' m de altura ou mais. Isso é mais fácil de fazer a partir dos dados originais ou a partir da tabela?',
      figure: rawFig(data),
      items: [
        { key: 'a', label: 'a)', prompt: 'Quantos alunos têm ' + br(th / 100, 2) + ' m ou mais?',
          answer: { type: 'integer', value: n, placeholder: 'Alunos' },
          hint: { rules: ['freq-tabela'], tip: br(th / 100, 2) + ' m = ' + th + ' cm. Quais intervalos começam em ' + th + ' ou depois?', more: ['Como ' + th + ' é o começo de um intervalo, nenhum intervalo fica "pela metade".', 'Some as frequências desses intervalos.'] },
          hints: [{ when: fr[0], msg: 'Essa é só a frequência do intervalo [[' + ivTxt(th) + ']]. "Ou mais" inclui todos os intervalos depois dele.' }, { when: data.length - n, msg: 'Esses são os alunos <b>abaixo</b> de ' + th + ' cm. A pergunta é ' + th + ' cm <b>ou mais</b>.' }].filter(function (x) { return x.when !== n; }),
          final: n + ' alunos',
          steps: { list: [
            { t: 'Convertendo', b: br(th / 100, 2) + ' m = ' + th + ' cm. "' + br(th / 100, 2) + ' m ou mais" quer dizer ' + th + ' cm, ' + (th + 1) + ' cm, ' + (th + 2) + ' cm... até o mais alto.' },
            { t: 'Os intervalos certos', b: 'Os intervalos que começam em ' + th + ' cm ou depois (destacados):' + fullTable(data, th) },
            { t: 'Somando as frequências', b: calc(m(fr.join(' + ') + ' = ' + n)) },
            { t: 'Resposta final', cls: 'final', b: '<b>' + n + ' alunos</b> têm ' + br(th / 100, 2) + ' m ou mais.' },
            { t: 'Conferindo se faz sentido', cls: 'check', b: 'Contando nos dados brutos todas as alturas de ' + th + ' cm para cima, também dá ' + data.filter(function (v) { return v >= th; }).length + ' ✓.' }
          ] } },
        { key: 'b', label: 'b)', prompt: 'É mais fácil a partir dos dados originais ou da tabela?',
          answer: { type: 'choice', layout: 'rows', correct: 'tab', options: [
            { id: 'tab', html: 'A partir da tabela: basta somar as frequências de poucos intervalos.' },
            { id: 'raw', html: 'A partir dos dados originais: dá para ver cada altura.', hint: 'Dá para fazer pelos dados originais, mas teria que olhar as ' + data.length + ' alturas, uma por uma. Qual jeito dá menos trabalho?' },
            { id: 'igual', html: 'Tanto faz: dá o mesmo trabalho.', hint: 'Compare: somar ' + fr.length + ' números da tabela ou conferir ' + data.length + ' alturas?' }
          ] },
          hint: { rules: ['freq-tabela'], tip: 'Compare o trabalho: quantos números você precisa olhar em cada caso?', more: ['Na tabela, as alturas já estão agrupadas e contadas.', 'Como ' + th + ' é o início de um intervalo, a tabela dá a resposta exata.'] },
          final: 'Mais fácil pela tabela.',
          steps: { list: [
            { t: 'O que já sabemos', b: 'No item a, encontramos ' + n + ' alunos com ' + br(th / 100, 2) + ' m ou mais, somando as frequências da tabela. Agora a pergunta é: qual caminho dá <b>menos trabalho</b>?' },
            { t: 'Pelos dados originais', b: 'Teríamos que olhar as <b>' + data.length + ' alturas</b>, uma por uma, e contar as que são ' + th + ' ou mais. Dá certo, mas é trabalhoso e fácil de errar.' },
            { t: 'Pela tabela', b: 'As alturas já estão contadas por intervalo. Basta somar <b>' + fr.length + ' números</b>: [[' + fr.join(' + ') + ' = ' + n + ']].' + aside('Aqui a tabela dá a resposta exata porque ' + th + ' cm é o começo de um intervalo. Se fosse, por exemplo, ' + (th + 1) + ' cm, a tabela não bastaria (veja a questão 2).') },
            { t: 'Resposta final', cls: 'final', b: 'É <b>mais fácil pela tabela</b> de frequência.' },
            { t: 'Conferindo se faz sentido', cls: 'check', b: 'Os dois jeitos dão ' + n + ' ✓; a tabela só deu muito menos trabalho.' }
          ] } }
      ]
    };
  };
  // 140 Q4: x (% da linha 3), y (frequência da linha 4), z (frequência da linha 7), w (% da linha 8)
  G['140-4'] = function (p) {
    var f = p.f, ages = p.ages, T = H.sum(f), pct = f.map(function (v) { return r6(v / T * 100); });
    var x = pct[2], y = f[3], z = f[6], w = pct[7];
    var rows = ages.map(function (a, i) { return [String(a), i === 3 ? 'y' : i === 6 ? 'z' : String(f[i]), i === 2 ? 'x' : i === 7 ? 'w' : br(pct[i])]; });
    var k0 = 0, onePct = r6(f[k0] / pct[k0]);
    return {
      prompt: 'Uma tabela de frequência foi feita com as idades de alunos de um curso extracurricular de uma escola. Complete a tabela de frequência abaixo, determinando x, y, w e z.',
      table: { head: ['Idade', 'Frequência', '%'], rows: rows },
      items: [{
        key: 'u',
        answer: { type: 'numberList', values: [x, y, w, z], ordered: true, labels: ['x (%)', 'y (alunos)', 'w (%)', 'z (alunos)'] },
        hint: { rules: ['porcentagem-freq'], tip: 'Primeiro descubra o <b>total de alunos</b> usando uma linha completa (por exemplo, a dos ' + ages[0] + ' anos).',
          more: [f[0] + ' alunos são ' + br(pct[0]) + '% do total. Quanto é 1%? E 100%?', 'Com o total: % = [[frac{frequência}{total}]] × 100, e frequência = % do total.'] },
        hints: [{ when: function (v) { return Math.abs(v[0] - x) > 1e-6 || Math.abs(v[2] - w) > 1e-6; }, msg: 'Confira as porcentagens (x e w): divida a frequência pelo <b>total</b> de alunos e multiplique por 100.' }, { when: function () { return true; }, msg: 'Confira as frequências (y e z): é a porcentagem <b>do total</b> de alunos.' }],
        final: 'x = ' + br(x) + '%, y = ' + y + ', w = ' + br(w) + '% e z = ' + z,
        steps: { list: [
          { t: 'Frequência e porcentagem', cls: 'concept', b: 'A <b>frequência</b> é quantos alunos têm aquela idade. A <b>porcentagem</b> mostra que parte do total isso representa:' + calc('% = [[frac{frequência}{total}]] × 100') + 'Para usar isso, precisamos do <b>total</b> de alunos.' },
          { t: 'Descobrindo o total', b: 'Na linha dos ' + ages[k0] + ' anos sabemos as duas coisas: <b>' + f[k0] + ' alunos</b> são <b>' + br(pct[k0]) + '%</b>.' +
              lines(['[[' + br(pct[k0]) + '% → ' + f[k0] + ']] alunos', '[[1% → frac{' + f[k0] + '}{' + br(pct[k0]) + '} = ' + br(onePct) + ']] aluno' + small('dividimos os dois lados por ' + br(pct[k0])), '[[100% → 100 * ' + br(onePct) + ' = ' + T + ']] alunos']) + 'O curso tem <b>' + T + ' alunos</b>.' },
          { t: 'Calculando x (porcentagem dos ' + ages[2] + ' anos)', b: calc(m('x = frac{' + f[2] + '}{' + T + '} * 100 = ' + br(x)) + '%') + aside('Dividir por ' + T + ' e multiplicar por 100 é o mesmo que multiplicar por [[frac{100}{' + T + '}]] = ' + br(r6(100 / T)) + ': [[' + f[2] + ' * ' + br(r6(100 / T)) + ' = ' + br(x) + ']].') },
          { t: 'Calculando y (alunos de ' + ages[3] + ' anos)', b: 'y é ' + br(pct[3]) + '% de ' + T + ':' + calc(m('y = ' + br(pct[3]) + ' * ' + br(onePct) + ' = ' + y)) + aside('Cada 1% vale ' + br(onePct) + ' aluno, então ' + br(pct[3]) + '% valem ' + br(pct[3]) + ' vezes isso.') },
          { t: 'Calculando w (porcentagem dos ' + ages[7] + ' anos)', b: calc(m('w = frac{' + f[7] + '}{' + T + '} * 100 = ' + br(w)) + '%') },
          { t: 'Calculando z (alunos de ' + ages[6] + ' anos)', b: calc(m('z = ' + br(pct[6]) + ' * ' + br(onePct) + ' = ' + z)) },
          { t: 'Resposta final', cls: 'final', b: '<b>x = ' + br(x) + '%</b>, <b>y = ' + y + '</b>, <b>w = ' + br(w) + '%</b> e <b>z = ' + z + '</b>.' + H.table(['Idade', 'Frequência', '%'], ages.map(function (a, i) { return [String(a), String(f[i]), br(pct[i])]; }), [2, 3, 6, 7], 'st-table-sm') },
          { t: 'Conferindo se faz sentido', cls: 'check', b: 'Frequências: [[' + f.join(' + ') + ' = ' + T + ']] ✓ (o total). Porcentagens: [[' + pct.map(H.br1).join(' + ') + ' = ' + br(r6(H.sum(pct))) + ']] ✓ (tem que dar 100%).' }
        ] }
      }]
    };
  };

  /* ================= Aula 141 ================= */
  G['141-1'] = function (p) {
    var it = meanItem('u', p.v);
    it.label = ''; it.prompt = '';
    return { prompt: 'Ache a média aritmética dos números ' + H.listPT(p.v.map(String)) + '.', items: [it] };
  };
  G['141-2'] = function (p) {
    var gs = p.groups, tot = H.sum(gs.map(function (g) { return g[0]; })), S = H.sum(gs.map(function (g) { return g[0] * g[1]; }));
    var dv = H.divide(S, tot, { maxDec: 2 }), mean = r6(S / tot), ok = mean < p.lim;
    var meanTxt = dv.approx ? '≈ ' + dv.text : dv.text;
    var simple = r6(H.sum(gs.map(function (g) { return g[1]; })) / gs.length);
    var stepsMean = [
      weightConcept('Aqui o "peso" de cada idade é a <b>quantidade de estudantes</b> com aquela idade.'),
      { t: 'A soma de todas as idades', b: 'Cada idade conta tantas vezes quantos estudantes a têm:' + lines(gs.map(function (g) { return '[[' + g[0] + ' * ' + g[1] + ' = ' + g[0] * g[1] + ']]' + small(g[0] + ' estudantes de ' + g[1] + ' anos'); })) + calc(m(gs.map(function (g) { return g[0] * g[1]; }).join(' + ') + ' = ' + S)) },
      { t: 'Quantos estudantes?', b: calc(m(gs.map(function (g) { return g[0]; }).join(' + ') + ' = ' + tot)) + aside('Os ' + p.prof + ' professores não entram: a questão não diz a idade deles. A média é das idades dos estudantes.') },
      { t: 'Dividindo', b: calc(m('Média = frac{' + S + '}{' + tot + '}')) + (dv.inline || 'Fazendo a divisão:') }
    ].concat(dv.steps);
    return {
      prompt: 'Um grupo de estudantes fará uma viagem de ' + p.days + ' dias com ' + p.prof + ' professores. Por ser um grupo grande, a companhia de turismo ofereceu um desconto de ' + p.disc + '%, caso a média das idades fosse menor do que ' + p.lim + ' anos. Sabe-se que havia: ' + H.listPT(gs.map(function (g) { return g[0] + ' estudantes com ' + g[1] + ' anos'; })) + '. Calcule a média e responda: o grupo conseguiu o desconto?',
      items: [
        { key: 'a', label: 'a)', prompt: 'Média das idades',
          answer: { type: 'number', value: mean, tol: dv.approx ? 0.006 : 1e-6, suffix: 'anos', placeholder: 'Média' },
          hint: { rules: ['media-ponderada'], tip: 'Será que todas as idades aparecem a mesma quantidade de vezes?',
            more: ['Multiplique cada idade pela quantidade de estudantes e some.', 'Depois de somar, divida pelo número total de estudantes.'] },
          hints: [{ when: simple, msg: 'Você fez a média só das idades diferentes. Mas tem muito mais estudantes de umas idades que de outras!' }, { when: S, msg: 'Essa é a soma de todas as idades. Falta dividir pelo número de estudantes.' }].filter(function (h) { return Math.abs(h.when - mean) > 0.01; }),
          final: meanTxt + ' anos',
          steps: { list: stepsMean.concat([
            { t: 'Resposta final', cls: 'final', b: 'A média das idades é <b>' + meanTxt + ' anos</b>.' },
            { t: 'Conferindo se faz sentido', cls: 'check', b: 'A média ficou entre a menor idade (' + gs[0][1] + ') e a maior (' + gs[gs.length - 1][1] + ') ✓.' }
          ]) } },
        { key: 'b', label: 'b)', prompt: 'O grupo conseguiu o desconto?',
          answer: { type: 'choice', layout: 'rows', correct: ok ? 'sim' : 'nao', options: [
            { id: 'sim', html: 'Sim: a média ficou menor que ' + p.lim + ' anos.', hint: ok ? undefined : 'Compare a média (' + meanTxt + ') com ' + p.lim + ': ela é menor?' },
            { id: 'nao', html: 'Não: a média não ficou menor que ' + p.lim + ' anos.', hint: ok ? 'Compare a média (' + meanTxt + ') com ' + p.lim + ' com calma: qual é maior?' : undefined }
          ] },
          hint: { rules: ['media-ponderada'], tip: 'Calcule a média (item a) e compare com ' + p.lim + ' anos.', more: ['A regra era: desconto se a média for <b>menor</b> que ' + p.lim + '.', 'Compare os números com vírgula: olhe primeiro a parte inteira.'] },
          final: ok ? 'Sim, conseguiu.' : 'Não conseguiu.',
          steps: { list: [
            { t: 'A regra do desconto', b: 'O desconto vale se a média das idades for <b>menor que ' + p.lim + '</b> anos.' },
            { t: 'A média', b: 'No item a, a média deu <b>' + meanTxt + ' anos</b> (soma das idades ' + S + ', dividida pelos ' + tot + ' estudantes).' },
            { t: 'Comparando', b: calc(m(dv.text + (ok ? ' &lt; ' : ' ≥ ') + p.lim)) + (ok ? dv.text + ' é menor que ' + p.lim + ' (a parte inteira é ' + Math.floor(mean) + ').' : dv.text + ' não é menor que ' + p.lim + '.') },
            { t: 'Resposta final', cls: 'final', b: ok ? '<b>Sim</b>, o grupo conseguiu o desconto de ' + p.disc + '%.' : '<b>Não</b>, o grupo não conseguiu o desconto.' },
            { t: 'Conferindo se faz sentido', cls: 'check', b: 'Mais da metade dos estudantes tem ' + (ok ? 'menos' : 'mais') + ' que ' + p.lim + ' anos? Estudantes com menos de ' + p.lim + ': ' + H.sum(gs.filter(function (g) { return g[1] < p.lim; }).map(function (g) { return g[0]; })) + ' de ' + tot + '. Combina com o resultado ✓.' }
          ] } }
      ]
    };
  };
  // 141 Q3: dados agrupados. p = { cls: [[a, b], ...], f: [...] }
  G['141-3'] = function (p) {
    var cl = p.cls, f = p.f, T = H.sum(f), mid = cl.map(function (c) { return r6((c[0] + c[1]) / 2); }), pct = f.map(function (v) { return r6(v / T * 100); });
    var fm = mid.map(function (v, i) { return r6(v * f[i]); }), S = r6(H.sum(fm)), mean = r6(S / T), dv = H.divide(S, T, { maxDec: 2 });
    var cTxt = function (c) { return c[0] + ' ⊢ ' + c[1]; };
    var table = { head: ['Horas de TV por semana', 'Frequência'], rows: cl.map(function (c, i) { return [cTxt(c), String(f[i])]; }) };
    var midConcept = { t: 'Ponto médio de uma classe', cls: 'concept', b: 'O <b>ponto médio</b> é o número que fica bem no <b>meio</b> do intervalo: somamos as duas pontas e dividimos por 2. Exemplo: em [[0 ⊢ 6]], o meio é [[frac{0 + 6}{2} = 3]].<br>Quando os dados estão agrupados, não sabemos o valor exato de cada pessoa. Então fazemos de conta que <b>todo mundo da classe está no ponto médio</b>. Por isso a média que sai é <b>aproximada</b>.' };
    return {
      prompt: 'A tabela de frequência abaixo apresenta os resultados de uma pesquisa feita com ' + T + ' pessoas sobre o número de horas por semana assistindo televisão:',
      table: table,
      items: [
        { key: 'a1', label: 'a)', prompt: 'Complete com os <b>pontos médios</b> ([[m_i]]) das classes.',
          answer: { type: 'numberList', values: mid, ordered: true, labels: cl.map(cTxt) },
          hint: { rules: ['ponto-medio'], tip: 'Ponto médio = [[frac{início + fim}{2}]].', more: ['Para [[' + cTxt(cl[0]) + ']]: [[frac{' + cl[0][0] + ' + ' + cl[0][1] + '}{2}]].', 'As classes têm o mesmo tamanho: os pontos médios vão aumentando sempre do mesmo jeito.'] },
          hints: [{ when: function (v) { return v.every(function (x, i) { return Math.abs(x - cl[i][1]) < 1e-9; }); }, msg: 'Esses são os <b>fins</b> das classes. O ponto médio é o <b>meio</b>.' }, { when: function () { return true; }, msg: 'Para cada classe, some o início com o fim e divida por 2.' }],
          final: mid.map(H.br1).join(', '),
          steps: { list: [midConcept,
            { t: 'As classes da tabela', b: 'São ' + cl.length + ' classes, todas com o mesmo tamanho: ' + H.box(cl.map(function (c) { return m(cTxt(c)); })) + 'Cada uma vai ganhar o seu ponto médio.' },
            { t: 'Calculando cada ponto médio', b: lines(cl.map(function (c, i) { return '[[' + cTxt(c) + ']]: [[frac{' + c[0] + ' + ' + c[1] + '}{2} = frac{' + (c[0] + c[1]) + '}{2} = ' + br(mid[i]) + ']]'; })) },
            { t: 'Resposta final', cls: 'final', b: 'Pontos médios: ' + H.box(mid.map(H.br1), 'nbox-answer') },
            { t: 'Conferindo se faz sentido', cls: 'check', b: 'Cada ponto médio está no meio da sua classe, e eles vão de ' + br(r6(cl[0][1] - cl[0][0])) + ' em ' + br(r6(cl[0][1] - cl[0][0])) + ' (o tamanho das classes) ✓.' }
          ] } },
        { key: 'a2', label: 'a)', prompt: 'Complete com as <b>porcentagens</b> (%).',
          answer: { type: 'numberList', values: pct, ordered: true, labels: cl.map(function (c) { return cTxt(c) + ' (%)'; }) },
          hint: { rules: ['porcentagem-freq'], tip: '% = [[frac{frequência}{total}]] × 100. O total é ' + T + ' pessoas.', more: ['Com ' + T + ' pessoas, cada pessoa vale [[frac{100}{' + T + '} = ' + br(r6(100 / T)) + ']]%.', 'Multiplique cada frequência por ' + br(r6(100 / T)) + '. A soma tem que dar 100%.'] },
          hints: [{ when: function (v) { return Math.abs(H.sum(v) - 100) > 0.01; }, msg: 'Some as suas porcentagens: o total tem que dar <b>100%</b>.' }, { when: function () { return true; }, msg: 'A soma deu 100%, mas alguma está trocada. Confira linha por linha: frequência dividida por ' + T + ', vezes 100.' }],
          final: pct.map(function (v) { return br(v) + '%'; }).join(', '),
          steps: { list: [
            { t: 'Porcentagem de cada classe', cls: 'concept', b: 'A porcentagem diz que parte do total cada classe representa:' + calc('% = [[frac{frequência}{total}]] × 100') + 'O total é <b>' + T + ' pessoas</b>.' + (100 % T === 0 ? ' Truque: [[frac{100}{' + T + '} = ' + 100 / T + ']], então cada pessoa vale ' + 100 / T + '%.' : '') },
            { t: 'O total de pessoas', b: 'Somando as frequências:' + calc(m(f.join(' + ') + ' = ' + T)) + 'É o mesmo total que o enunciado diz: ' + T + ' pessoas ✓.' },
            { t: 'Calculando', b: lines(f.map(function (v, i) { return '[[' + cTxt(cl[i]) + ']]: [[frac{' + v + '}{' + T + '} * 100 = ' + br(pct[i]) + ']]%' + (100 % T === 0 ? small(v + ' · ' + 100 / T + ' = ' + br(pct[i])) : ''); })) },
            { t: 'Resposta final', cls: 'final', b: H.table(['Horas', 'Frequência', '%'], cl.map(function (c, i) { return [cTxt(c), String(f[i]), br(pct[i])]; }), [], 'st-table-sm') },
            { t: 'Conferindo se faz sentido', cls: 'check', b: '[[' + pct.map(H.br1).join(' + ') + ' = ' + br(r6(H.sum(pct))) + ']]% ✓ — todas as pessoas juntas são 100%.' }
          ] } },
        { key: 'b', label: 'b)', prompt: 'Calcule a média aritmética dessa distribuição de dados.',
          answer: { type: 'number', value: mean, tol: dv.approx ? 0.006 : 1e-6, suffix: 'horas', placeholder: 'Média' },
          hint: { rules: ['ponto-medio', 'media-ponderada'], tip: 'Use os <b>pontos médios</b> como valores e as <b>frequências</b> como pesos.',
            more: ['Multiplique cada ponto médio pela sua frequência e some tudo.', 'Divida essa soma pelo total de pessoas (' + T + '), e não pela soma das porcentagens.'] },
          hints: [{ when: r6(H.sum(mid) / mid.length), msg: 'Você fez a média só dos pontos médios. Cada classe tem uma quantidade diferente de pessoas: use as frequências como pesos.' }, { when: S, msg: 'Essa é a soma (ponto médio × frequência). Falta dividir pelo total de pessoas.' }, { when: r6(S / 100), msg: 'Divida pelo total de <b>pessoas</b> (' + T + '), não por 100.' }].filter(function (h) { return Math.abs(h.when - mean) > 0.01; }),
          final: br(mean) + ' horas',
          steps: { list: [midConcept,
            { t: 'Montando a tabela da conta', b: 'Para cada classe: ponto médio × frequência (quantas pessoas "assistem" aquele tanto de horas).' + H.table(['Classe', '[[m_i]]', 'Frequência', '[[m_i * f_i]]'].map(function (s) { return window.GM_LOGIC.fmt(s); }), cl.map(function (c, i) { return [cTxt(c), br(mid[i]), String(f[i]), br(fm[i])]; }), [], 'st-table-sm') +
                lines(mid.map(function (v, i) { return '[[' + br(v) + ' * ' + f[i] + ' = ' + br(fm[i]) + ']]'; })) },
            { t: 'Somando', b: calc(m(fm.map(H.br1).join(' + ') + ' = ' + br(S))) },
            { t: 'Dividindo pelo total', b: 'A média é a soma dividida pelo total de pessoas:' + calc(m('frac{' + br(S) + '}{' + T + '}')) + (dv.inline || 'Fazendo a divisão:') }
          ].concat(dv.steps).concat([
            { t: 'Resposta final', cls: 'final', b: 'A média é de aproximadamente <b>' + br(mean) + ' horas</b> por semana.' },
            { t: 'Conferindo se faz sentido', cls: 'check', b: 'A maioria das pessoas está nas primeiras classes (até 12 horas), então a média tinha que ficar mais para o começo: ' + br(mean) + ' horas fica na classe [[' + cTxt(cl.filter(function (c) { return mean >= c[0] && mean < c[1]; })[0] || cl[0]) + ']] ✓. É uma média <b>aproximada</b>, porque usamos os pontos médios.' }
          ]) } }
      ]
    };
  };

  /* ================= Montagem: Estatística ================= */
  var D42 = [156, 140, 161, 155, 168, 153, 162, 163, 147, 146, 141, 152, 160, 150, 149, 142, 163, 148, 143, 149, 157, 156, 155, 149, 140, 155, 153, 149, 152, 155, 165, 167, 151, 143, 166, 160, 159, 148, 149, 149, 150, 149];
  var DV1 = [147, 158, 157, 144, 151, 169, 159, 155, 160, 158, 142, 159, 140, 169, 166, 155, 148, 157, 147, 146, 162, 155, 157, 166, 157, 155, 152, 160, 167, 144];
  var DV2 = [150, 144, 152, 160, 141, 142, 166, 157, 143, 151, 158, 141, 169, 156, 146, 141, 142, 153, 153, 142, 147, 142, 157, 153, 141, 166, 158, 143, 147, 160];
  var DV3 = [154, 167, 157, 167, 169, 164, 154, 154, 156, 167, 158, 146, 145, 165, 156, 155, 160, 159, 165, 145, 143, 154, 149, 144, 142, 157, 165, 168, 162, 160];
  var Q = B4.question;
  var ages9 = [10, 11, 12, 13, 14, 15, 16, 17, 18];
  B4.exam({
    id: 'est', title: 'Estatística', badge: 'EST', icon: '📊', name: 'Estatística', color: 'yellow',
    meta: '4º Bimestre · Aulas 139 a 141',
    content: 'Médias, tabelas de frequência e dados agrupados',
    aulas: { 139: 'Revisão: médias', 140: 'Construindo tabelas de frequência', 141: 'Estudo de tendências' },
    questions: [
      Q({ aula: 139, n: 1, skill: 'Média aritmética', gen: G['139-1'], params: [
        { items: [[7, 12, 14], [4, 5, 9, 10], [27, 34, 45, 51], [109, 112, 121, 136, 145]] },
        { items: [[5, 9, 10], [2, 6, 7, 9], [12, 15, 20, 21], [100, 104, 110, 118, 123]] },
        { items: [[3, 8, 13], [6, 7, 10, 13], [21, 30, 44, 49], [205, 210, 215, 230, 240]] },
        { items: [[4, 11, 15], [3, 5, 8, 12], [18, 25, 33, 40], [91, 95, 104, 110, 120]] }
      ] }),
      Q({ aula: 139, n: 2, skill: 'Média ponderada (nota que falta)', gen: G['139-2'], params: [
        { w: [1, 2, 2, 5], g: [5, 7, 4], target: 6 }, { w: [2, 3, 5], g: [7, 5], target: 6 }, { w: [1, 2, 3, 4], g: [8, 6, 5], target: 7 }, { w: [1, 1, 2, 2], g: [4, 6, 5], target: 6 }] }),
      Q({ aula: 139, n: 3, skill: 'Preço médio', gen: G['139-3'], params: [
        { who: 'André', pron: 'ele', noun: 'livros', groups: [[3, 34], [5, 23]] }, { who: 'Bia', pron: 'ela', noun: 'cadernos', groups: [[2, 30], [4, 18]] },
        { who: 'Caio', pron: 'ele', noun: 'jogos', groups: [[4, 25], [6, 40]] }, { who: 'Duda', pron: 'ela', noun: 'livros', groups: [[3, 12], [2, 27]] }] }),
      Q({ aula: 139, n: 4, skill: 'Criando um exercício', gen: G['139-4'], params: [
        { who: 'Marina', noun: 'cadernos', groups: [[4, 15], [6, 20]] }, { who: 'Léo', noun: 'sorvetes', groups: [[2, 8], [3, 12]] },
        { who: 'Rafa', noun: 'camisetas', groups: [[1, 50], [4, 35]] }, { who: 'Nina', noun: 'canetas', groups: [[5, 3], [5, 4.5]] }] }),
      Q({ aula: 140, n: 1, skill: 'Tabela de frequência', gen: G['140-1'], params: [{ data: D42 }, { data: DV1 }, { data: DV2 }, { data: DV3 }] }),
      Q({ aula: 140, n: 2, skill: 'Tabela x dados brutos', gen: G['140-2'], params: [{ data: D42, h: 163 }, { data: D42, h: 149 }, { data: D42, h: 160 }, { data: D42, h: 152 }] }),
      Q({ aula: 140, n: 3, skill: 'Usando a tabela', gen: G['140-3'], params: [{ data: D42, t: 160 }, { data: D42, t: 150 }, { data: D42, t: 156 }, { data: D42, t: 146 }] }),
      Q({ aula: 140, n: 4, skill: 'Completando a tabela', gen: G['140-4'], params: [
        { ages: ages9, f: [3, 9, 22, 7, 4, 0, 2, 1, 2] }, { ages: ages9, f: [2, 3, 8, 5, 4, 0, 1, 1, 1] }, { ages: ages9, f: [1, 3, 6, 4, 2, 1, 1, 1, 1] }, { ages: ages9, f: [5, 8, 15, 10, 6, 2, 1, 2, 1] }] }),
      Q({ aula: 141, n: 1, skill: 'Média aritmética', gen: G['141-1'], params: [{ v: [3, 4, 5, 6, 7, 8] }, { v: [2, 4, 6, 8, 10, 12] }, { v: [5, 6, 7, 8, 9] }, { v: [10, 11, 12, 13, 14, 15] }] }),
      Q({ aula: 141, n: 2, skill: 'Média e decisão', gen: G['141-2'], params: [
        { days: 15, prof: 2, disc: 15, lim: 14, groups: [[9, 12], [8, 13], [8, 14], [10, 15], [5, 16]] },
        { days: 10, prof: 3, disc: 10, lim: 13, groups: [[6, 11], [10, 12], [8, 13], [6, 14]] },
        { days: 7, prof: 2, disc: 20, lim: 15, groups: [[4, 13], [6, 14], [12, 15], [8, 16]] },
        { days: 12, prof: 4, disc: 12, lim: 14, groups: [[10, 12], [12, 13], [5, 15], [3, 16]] }
      ] }),
      Q({ aula: 141, n: 3, skill: 'Dados agrupados', gen: G['141-3'], params: [
        { cls: [[0, 6], [6, 12], [12, 18], [18, 24], [24, 30]], f: [14, 17, 11, 4, 4] },
        { cls: [[0, 4], [4, 8], [8, 12], [12, 16], [16, 20]], f: [5, 8, 4, 2, 1] },
        { cls: [[0, 10], [10, 20], [20, 30], [30, 40]], f: [6, 9, 3, 2] },
        { cls: [[0, 6], [6, 12], [12, 18], [18, 24], [24, 30]], f: [10, 12, 15, 9, 4] }
      ] })
    ]
  });
})();
