/* =====================================================================
   GAITERO MATH — Banco central de fórmulas
   Usado pelo Papel de Cola (página inteira) e pelas dicas 💡 das questões.
   Cada regra tem um id; as questões apontam para esses ids em item.hint.rules.
   Referências de questão: 'p1-3' = P1, questão 3.
   ===================================================================== */
(function () {
  'use strict';

  var reflexaoMini = (function () {
    // Mini ilustração: ponto a 3 quadradinhos da reta, imagem a 3 do outro lado.
    var s = '', U = 14, W = 12 * U, H = 5 * U;
    for (var x = 0; x <= 12; x++) s += '<line x1="' + x * U + '" y1="0" x2="' + x * U + '" y2="' + H + '"/>';
    for (var y = 0; y <= 5; y++) s += '<line x1="0" y1="' + y * U + '" x2="' + W + '" y2="' + y * U + '"/>';
    return '<svg class="fig fig-mini" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Ponto A a 3 quadradinhos da reta e; a imagem A linha fica a 3 quadradinhos do outro lado">' +
      '<g class="fg-grid">' + s + '</g>' +
      '<line class="fg-axis" x1="' + 6 * U + '" y1="2" x2="' + 6 * U + '" y2="' + (H - 2) + '"/>' +
      '<text class="fg-lbl fg-e" x="' + (6 * U + 7) + '" y="12">e</text>' +
      '<line class="fg-dash" x1="' + 3 * U + '" y1="' + 2.5 * U + '" x2="' + 9 * U + '" y2="' + 2.5 * U + '"/>' +
      '<text class="fg-dist" x="' + 4.5 * U + '" y="' + (2.5 * U - 4) + '">3</text>' +
      '<text class="fg-dist" x="' + 7.5 * U + '" y="' + (2.5 * U - 4) + '">3</text>' +
      '<path class="fg-right" d="M' + (6 * U - 4) + ' ' + 2.5 * U + ' v-4 h4"/>' +
      '<g class="fg-tri-orig"><circle cx="' + 3 * U + '" cy="' + 2.5 * U + '" r="3"/><text class="fg-lbl" x="' + (3 * U - 9) + '" y="' + (2.5 * U + 4) + '">A</text></g>' +
      '<g class="fg-tri-ok"><circle cx="' + 9 * U + '" cy="' + 2.5 * U + '" r="3"/><text class="fg-lbl" x="' + (9 * U + 10) + '" y="' + (2.5 * U + 4) + '">A′</text></g>' +
      '</svg>';
  })();

  var bx = window.GM_LOGIC.boxes;

  var BLOCKS = [
    {
      id: 'numeros', label: 'Números', icon: '123', color: 'green',
      title: 'Números e sequências',
      rules: [
        { id: 'par-impar', name: 'Par e ímpar', formula: 'Par: [[2n]] &nbsp;·&nbsp; Ímpar: [[2n + 1]]', note: 'Aqui [[n]] é um número inteiro. Par divide por 2 sem sobrar; ímpar sobra 1.', example: '[[2 * 7 = 14]] é par · [[2 * 7 + 1 = 15]] é ímpar' },
        { id: 'consecutivos', name: 'Números consecutivos', formula: bx(['[[x]]', '[[x + 1]]', '[[x + 2]]']), note: 'Consecutivos vêm um depois do outro: aumentam de <b>1 em 1</b>. Dois consecutivos:' + bx(['[[x]]', '[[x + 1]]']), example: bx([4, 5, 6]) + '→ [[x = 4]]. Somando: [[x + x + 1 + x + 2 = 3x + 3]]' },
        { id: 'impares-consecutivos', name: 'Ímpares consecutivos', formula: bx(['[[x]]', '[[x + 2]]', '[[x + 4]]']), note: 'Com [[x]] ímpar. Ímpares seguidos aumentam de <b>2 em 2</b> (pulam o par do meio). Pares seguidos também, com [[x]] par.', example: bx([7, 9, 11]) + '→ [[x = 7]]. Somando: [[x + x + 2 + x + 4 = 3x + 6]]' },
        { id: 'traducoes', name: 'Traduzindo o texto', formula: 'Dobro: [[2x]] &nbsp;·&nbsp; Triplo: [[3x]] &nbsp;·&nbsp; "é igual a": [[=]]', note: 'Para descobrir o número, desfaça as contas de trás para frente: o "+" vira "−" e a multiplicação vira divisão.', example: '"O triplo de um número mais 5 é 20" → [[3x + 5 = 20]] → [[3x = 15]] → [[x = 5]]' }
      ],
      tip: 'Consecutivos aumentam de 1 em 1. Ímpares (ou pares) consecutivos, de 2 em 2.',
      related: ['p1-1', 'p1-3', 'p1-4']
    },
    {
      id: 'raizes', label: 'Raízes', icon: '√', color: 'yellow',
      title: 'Raízes e módulo',
      rules: [
        { id: 'raiz-potencia', name: 'Raiz de uma potência', formula: 'Índice ímpar: [[R{n}{a^n} = a]]<br>Índice par: [[R{n}{a^n} = |a|]]', note: 'Com índice <b>par</b> o resultado nunca é negativo: por isso vira módulo. Com índice <b>ímpar</b>, o sinal continua o mesmo.', example: '[[R{3}{(-2)^3} = -2]] &nbsp;·&nbsp; [[R{4}{(-2)^4} = |-2| = 2]]' },
        { id: 'raiz-par-negativo', name: 'Raiz par de número negativo', formula: '[[R{par}{negativo}]] → não existe em [[ℝ]]', note: 'Nenhum número real elevado a expoente par dá negativo. Já a raiz de índice ímpar de negativo existe.', example: '[[R{4}{-16}]] não existe · [[R{3}{-8} = -2]]' },
        { id: 'modulo', name: 'Módulo', formula: '[[|a|]] = distância de [[a]] até o zero', note: '<b>1.</b> Resolva o que está <b>dentro</b> das barras. <b>2.</b> Torne positivo: se era negativo, vira positivo; se era positivo, continua. <b>3.</b> Resolva o resto da conta. Sinal que está <b>fora</b> das barras continua valendo.', example: '[[|-8| = 8]] &nbsp;·&nbsp; [[|4 - 7| = |-3| = 3]] &nbsp;·&nbsp; atenção: [[-|5| = -5]]' }
      ],
      tip: 'Índice par → resultado positivo (módulo). Índice ímpar → mantém o sinal.',
      related: ['p1-2', 'p2-1']
    },
    {
      id: 'porcentagem', label: 'Porcentagem', icon: '%', color: 'blue',
      title: 'Porcentagem',
      rules: [
        { id: 'pct-parte', name: 'Parte de um total', formula: '30% de 80 → [[0,3 * 80 = 24]]', note: '<b>100% é o todo.</b> Para a porcentagem virar número, a <b>vírgula pula 2 casas para a esquerda</b>: 30% = 0,3 · 70% = 0,7 · 150% = 1,5. Depois é só multiplicar.', example: '45% de 200 → [[0,45 * 200 = 90]]' },
        { id: 'pct-porcentagem', name: 'Quanto por cento?', formula: '[[frac{Parte}{Total}]] e depois × 100', note: 'A <b>parte</b> vai em cima, o <b>total</b> embaixo: faça a divisão na <b>chave</b>. Depois multiplique por 100: a <b>vírgula pula 2 casas para a direita</b>.', example: '15 de 60 → [[frac{15}{60} = 0,25]] → 25%' },
        { id: 'pct-desconto', name: 'Preço depois do desconto', formula: 'Desconto de 40% → sobra 60% → calcule 60% do preço', note: 'O preço inicial é 100%. Tirando o desconto, veja quanto <b>sobrou</b> ([[100% - 40% = 60%]]). A conta é da <b>sobra</b>, e não do desconto!', example: 'R$ 200 com 10% de desconto → sobra 90% → [[0,9 * 200 = 180]]' }
      ],
      tip: 'Desconto de 40% significa pagar os 60% restantes.',
      related: ['p1-6', 'p1-7']
    },
    {
      id: 'medias', label: 'Média', icon: 'x̄', color: 'green',
      title: 'Médias',
      rules: [
        { id: 'media-simples', name: 'Média simples', formula: 'Média = [[frac{Soma dos valores}{Quantidade de valores}]]', note: 'Junte tudo e divida igualmente.', example: 'Notas 6, 8 e 10 → [[frac{6 + 8 + 10}{3} = frac{24}{3} = 8]]' },
        { id: 'media-grupos', name: 'Média com grupos (ponderada)', formula: 'Média = [[frac{Soma de (valor × quantidade)}{Quantidade total}]]', note: 'Quando um valor aparece várias vezes, multiplique pela quantidade antes de somar.', example: '3 alunos com 10 anos e 1 com 14 → [[frac{3 * 10 + 1 * 14}{4} = frac{44}{4} = 11]]' }
      ],
      tip: 'Se um valor aparece várias vezes, multiplique pela quantidade antes de somar.',
      related: ['p1-8', 'p1-9']
    },
    {
      id: 'geometria', label: 'Geometria', icon: '▱', color: 'yellow',
      title: 'Volume e área',
      rules: [
        { id: 'volume', name: 'Volume do paralelepípedo', formula: '[[V]] = comprimento × largura × altura', note: 'Formato de caixa. Volume em cm³ quando as medidas estão em cm.', example: 'Caixa 5 × 4 × 2 → [[V = 40]] cm³' },
        { id: 'area-quadrado', name: 'Área do quadrado', formula: '[[A = lado^2]] &nbsp;(lado × lado)', note: 'Área em cm² quando o lado está em cm.', example: 'Lado 30 cm → [[A = 30 * 30 = 900]] cm²' },
        { id: 'area-retangulo', name: 'Área do retângulo', formula: '[[A]] = comprimento × largura', note: '', example: '' },
        { id: 'area-composta', name: 'Figura composta', formula: 'Área total = soma das áreas das partes', note: 'Divida a figura em pedaços conhecidos (quadrados, retângulos) que não se sobrepõem.', example: '' }
      ],
      tip: 'Área é lado × lado (não lado + lado).',
      related: ['p1-5', 'p2-9']
    },
    {
      id: 'medidas', label: 'Medidas', icon: '📏', color: 'blue',
      title: 'Medidas e custo',
      rules: [
        { id: 'conversao', name: 'Conversão de unidades', formula: '1 m = 100 cm &nbsp;·&nbsp; 1 cm = 10 mm', note: 'm → cm: multiplica por 100 (a <b>vírgula pula 2 casas para a direita</b>). mm → cm: divide por 10 (a <b>vírgula pula 1 casa para a esquerda</b>). Deixe tudo na <b>mesma unidade</b> antes de calcular.', example: '1,5 m = 150 cm · 250 mm = 25 cm' },
        { id: 'lajotas', name: 'Quantidade de peças', formula: 'Quantidade = [[frac{Área total}{Área de uma peça}]]', note: 'Faça a divisão na <b>chave</b>. Se o resultado precisa ser inteiro, arredonde <b>para cima</b>. Quando há cortes, veja se os recortes podem ser <b>reaproveitados</b> (uma peça cortada ao meio cobre dois pedaços).', example: 'Região 40 × 20 cm, peça 10 × 10 → [[frac{800}{100} = 8]] peças' },
        { id: 'custo', name: 'Custo total', formula: 'Custo = Quantidade × Preço de cada um', note: 'Na <b>conta armada</b>, faça a conta sem a vírgula e, no fim, conte as casas depois da vírgula.', example: '8 peças de R$ 3,50 → [[8 * 3,50 = 28]] reais' }
      ],
      tip: 'Primeiro converta, depois calcule área, quantidade e preço.',
      related: ['p2-10']
    },
    {
      id: 'divisores', label: 'Divisores', icon: 'D', color: 'green',
      title: 'Divisibilidade e divisores',
      rules: [
        { id: 'div2', name: 'Divisível por 2', formula: 'Último algarismo: 0, 2, 4, 6 ou 8', note: 'Ou seja: o número é par.', example: '1.358 termina em 8 → divisível por 2' },
        { id: 'div3', name: 'Divisível por 3', formula: 'Soma dos algarismos é múltipla de 3', note: 'Some os algarismos e veja se o resultado está na tabuada do 3.', example: '417 → [[4 + 1 + 7 = 12]] → divisível por 3' },
        { id: 'divisores', name: 'Achar os divisores', formula: 'Divisor = divide sem deixar resto', note: 'Teste 1, 2, 3, 4... Os divisores vêm em <b>pares</b> que multiplicados dão o número. Quando um par se repete, pare.', example: '12 → 1 × 12, 2 × 6, 3 × 4 → divisores: 1, 2, 3, 4, 6, 12' },
        { id: 'qtd-divisores', name: 'Contar os divisores', formula: 'Se [[N = p^a * q^b]], quantidade = [[(a + 1)(b + 1)]]', note: 'Fatore [[N]] em números primos. Some 1 a cada expoente e multiplique. Vale para quantos primos diferentes aparecerem: [[(a + 1)(b + 1)(c + 1)...]]', example: '[[12 = 2^2 * 3^1]] → [[(2 + 1)(1 + 1) = 6]] divisores' }
      ],
      tip: 'Não esqueça o 1 e o próprio número: eles sempre são divisores.',
      related: ['p2-2', 'p2-3', 'p2-4']
    },
    {
      id: 'polinomios', label: 'Álgebra', icon: 'x²', color: 'yellow',
      title: 'Polinômios',
      rules: [
        { id: 'semelhantes', name: 'Termos semelhantes', formula: '[[5x + 2x = 7x]]', note: 'Só junta termo com a <b>mesma letra e o mesmo expoente</b>. Soma os números da frente; a parte com letra não muda.', example: '[[3x^2 - 5x^2 = -2x^2]] · [[x^2 + x]] não junta' },
        { id: 'distributiva', name: 'Distributiva (chuveirinho)', formula: '[[a(b + c) = ab + ac]]', note: 'Com dois parênteses, faça o <b>chuveirinho</b>: cada termo do primeiro multiplica cada termo do segundo, um de cada vez.', example: '[[(x + 2)(x + 3) = x^2 + 3x + 2x + 6 = x^2 + 5x + 6]]' },
        { id: 'potencias', name: 'Potências de mesma base', formula: '[[x^a * x^b = x^{a + b}]]', note: 'Na <b>multiplicação</b>, somam-se os expoentes. Na soma de termos semelhantes, o expoente não muda.', example: '[[x^2 * x = x^3]] · [[x^3 * x^4 = x^7]]' },
        { id: 'grau', name: 'Grau do polinômio', formula: 'Maior expoente de [[x]] depois de simplificar', note: 'Primeiro junte os semelhantes. Alguns termos podem se anular!', example: '[[x^5 + 2x - x^5]] → sobra [[2x]] → grau 1' }
      ],
      tip: 'Alguns termos podem se anular na simplificação.',
      related: ['p2-5', 'p2-6', 'p2-7']
    },
    {
      id: 'equacoes', label: 'Equações', icon: '=', color: 'blue',
      title: 'Equações e reflexão',
      rules: [
        { id: 'soma-produto', name: 'Soma e produto das raízes', formula: '[[ax^2 + bx + c = 0]]<br>Soma = [[frac{-b}{a}]] &nbsp;·&nbsp; Produto = [[frac{c}{a}]]', note: '[[a]] é o número que acompanha o [[x^2]] (se for [[-x^2]], [[a = -1]]); [[b]] acompanha o [[x]]; [[c]] é o número sozinho. <b>Comece pelo produto:</b> liste os pares que dão o produto e veja qual deles também dá a soma.', example: '[[x^2 - 5x + 6 = 0]]: [[a = 1]], [[b = -5]], [[c = 6]] → soma [[frac{5}{1} = 5]], produto [[frac{6}{1} = 6]] → raízes 2 e 3' },
        { id: 'reflexao', name: 'Reflexão em uma reta', formula: 'Mesma distância, do outro lado, em linha perpendicular', note: 'Cada ponto refletido fica à <b>mesma distância</b> da reta (o eixo), do outro lado, andando em linha reta que forma 90° com ela. Tamanho e forma não mudam; a figura fica espelhada.', example: '', fig: reflexaoMini }
      ],
      tip: 'Soma e produto: ache [[a]], [[b]] e [[c]], calcule [[frac{-b}{a}]] e [[frac{c}{a}]] e comece testando pelo produto.',
      related: ['p2-8', 'p1-10']
    }
  ];
  BLOCKS.forEach(function (b) { b.bim = 3; });

  /* ======================= 4º BIMESTRE ======================= */
  // Referências 'alg-130-2' = Álgebra, aula 130, questão 2.
  var B4 = [
    {
      id: 'b4-divis', bim: 4, label: 'Divisibilidade', icon: 'D', color: 'green',
      title: 'Divisibilidade e MMC',
      rules: [
        { id: 'div-regras', name: 'Regras de divisibilidade', formula: '2, 5, 10: último algarismo<br>3, 9: soma dos algarismos<br>4, 8: últimos 2 ou 3 algarismos',
          note: 'Divisível = a divisão dá <b>exata</b> (sem resto).<br><b>2:</b> termina em 0, 2, 4, 6 ou 8 · <b>5:</b> termina em 0 ou 5 · <b>10:</b> termina em 0<br><b>3 / 9:</b> a soma dos algarismos é da tabuada do 3 / do 9<br><b>4 / 8:</b> os 2 / os 3 últimos algarismos formam número divisível por 4 / por 8<br><b>6</b> = por 2 <b>e</b> por 3 · <b>12</b> = por 3 <b>e</b> por 4', example: '2 520: termina em 0 (2, 5, 10 ✓) · [[2 + 5 + 2 + 0 = 9]] (3 e 9 ✓) · 20 é da tabuada do 4 (4 ✓) · 520 = 8 · 65 (8 ✓)' },
        { id: 'div-7-11', name: 'Regras do 7 e do 11', formula: '7: tira o último, subtrai o dobro<br>11: ordens ímpares − ordens pares',
          note: '<b>7:</b> tire o último algarismo e subtraia o dobro dele do número que sobrou; repita até ficar pequeno e veja se está na tabuada do 7.<br><b>11:</b> some os algarismos das ordens ímpares e das pares (contando da <b>direita</b>: a unidade é a 1ª ordem). A diferença precisa dar 0 ou um múltiplo de 11.', example: '7: 434 → [[43 - 2 * 4 = 35]] = 7 · 5 ✓ · 11: 2 761 → ímpares [[1 + 7 = 8]], pares [[6 + 2 = 8]], [[8 - 8 = 0]] ✓' },
        { id: 'mmc', name: 'MMC (menor múltiplo comum)', formula: 'Fatore em primos e pegue cada primo com o <b>maior expoente</b>',
          note: 'O menor número divisível por todos de uma lista é o MMC deles.', example: '[[4 = 2^2]], [[6 = 2 * 3]], [[9 = 3^2]] → [[MMC = 2^2 * 3^2 = 36]]' }
      ],
      tip: 'Para o 6 e o 12, junte duas regras: 6 = 2 e 3; 12 = 3 e 4.',
      related: ['alg-126-1', 'alg-126-2']
    },
    {
      id: 'b4-prop', bim: 4, label: 'Proporções', icon: '∷', color: 'blue',
      title: 'Proporções',
      rules: [
        { id: 'proporcao', name: 'O que é proporção', formula: '[[frac{a}{b} = frac{c}{d}]] · extremos: [[a]] e [[d]] · meios: [[b]] e [[c]]',
          note: 'Duas frações que valem a <b>mesma coisa</b>. Lê-se "a está para b assim como c está para d".', example: '[[frac{1}{2} = frac{2}{4}]]: metade é o mesmo que 2 de 4 pedaços.' },
        { id: 'prop-1', name: 'Propriedade 1 (multiplicação em cruz)', formula: '[[frac{a}{b} = frac{c}{d}]] ⇔ [[a * d = b * c]]',
          note: 'Produto dos extremos = produto dos meios. Serve para <b>testar</b> se é proporção e para achar um <b>termo que falta</b>: o número que multiplica a letra passa para o outro lado dividindo.', example: '[[frac{x}{4} = frac{6}{8}]] → [[8x = 24]] → [[x = frac{24}{8} = 3]]' },
        { id: 'prop-2', name: 'Propriedade 2 (soma)', formula: '[[frac{a}{b} = frac{c}{d} = frac{a + c}{b + d}]]',
          note: 'Somando os de cima e os de baixo, a fração continua valendo o mesmo.', example: '[[frac{1}{2} = frac{3}{6} = frac{1 + 3}{2 + 6} = frac{4}{8}]]' },
        { id: 'prop-345', name: 'Propriedades 3, 4 e 5 (pedaços)', formula: '[[frac{a}{b} = frac{c}{d}]] ⇒ [[frac{a + b}{b} = frac{c + d}{d}]] e [[frac{a - b}{b} = frac{c - d}{d}]]',
          note: 'Jeito prático: se [[frac{x}{y} = frac{6}{4}]], então [[x = 6k]] e [[y = 4k]] (6 e 4 pedaços de tamanho [[k]]). Use a soma ou a diferença para achar o [[k]].', example: '[[x + y = 70]] → [[6k + 4k = 70]] → [[k = 7]] → [[x = 42]], [[y = 28]]' },
        { id: 'tales', name: 'Teorema de Tales', formula: 'BC ∥ DE ⇒ [[frac{AB}{BD} = frac{AC}{CE}]] e também [[frac{AB}{AC} = frac{BD}{CE}]]',
          note: 'Uma reta paralela a um lado do triângulo divide os outros dois lados na mesma proporção. Numa proporção, dá para trocar os meios de lugar.', example: '' },
        { id: 'media-geo', name: 'Média geométrica', formula: 'Média geométrica de [[a]] e [[b]] = [[√{a * b}]]',
          note: 'Multiplique e tire a raiz quadrada. Se não der exato, simplifique: [[√{125} = √{25 * 5} = 5√5]].', example: '4 e 16 → [[√{64} = 8]] (e [[8 * 8 = 64 = 4 * 16]])' }
      ],
      tip: 'Na dúvida, multiplique em cruz: produto dos extremos = produto dos meios.',
      related: ['alg-129-1', 'alg-129-2', 'alg-130-1', 'alg-131-1', 'alg-131-2', 'alg-131-5']
    },
    {
      id: 'b4-partes', bim: 4, label: 'Partes proporcionais', icon: '▥', color: 'yellow',
      title: 'Divisão em partes proporcionais',
      rules: [
        { id: 'partes-prop', name: 'Dividir em partes proporcionais', formula: 'Uma parte = [[frac{total}{soma dos números}]]',
          note: '<b>1)</b> Some os números da proporção (quantas partes iguais). <b>2)</b> Divida o total por essa soma: é o valor de <b>uma parte</b>. <b>3)</b> Multiplique por cada número. Quem tem o número maior recebe mais; no fim, as partes somadas dão o total.', example: '100 em partes proporcionais a 2 e 3 → [[2 + 3 = 5]] partes → [[frac{100}{5} = 20]] → [[2 * 20 = 40]] e [[3 * 20 = 60]]' },
        { id: 'dizima', name: 'Dízima periódica vira fração', formula: '[[0,111... = frac{1}{9}]] · [[0,222... = frac{2}{9}]] · [[0,333... = frac{3}{9} = frac{1}{3}]]',
          note: 'Um algarismo que se repete depois da vírgula: ele vai em cima e o 9 embaixo.', example: '[[frac{a}{b} = 0,111... = frac{1}{9}]] → a tem 1 parte e b tem 9 partes.' },
        { id: 'soma-angulos', name: 'Ângulos do triângulo', formula: 'Soma dos ângulos internos = 180°', note: 'Vale para <b>todo</b> triângulo.', example: 'Proporcionais a 1, 2 e 3 → [[frac{180}{6} = 30]] → 30°, 60° e 90°' }
      ],
      tip: 'Some os números da proporção primeiro: é o número de partes iguais.',
      related: ['alg-130-2', 'alg-130-3', 'alg-130-4', 'alg-130-5', 'alg-132-1', 'alg-132-2', 'alg-132-3']
    },
    {
      id: 'b4-poli', bim: 4, label: 'Polinômios', icon: 'x²', color: 'green',
      title: 'Polinômios',
      rules: [
        { id: 'semelhantes4', name: 'Termos semelhantes', formula: '[[3x^2 + 5x^2 = 8x^2]] · [[x^2 + x]] não junta',
          note: 'Mesma letra com o <b>mesmo expoente</b>. Some só os coeficientes (números da frente); o expoente não muda na soma.', example: '[[4x - 7x = -3x]]' },
        { id: 'poli-soma', name: 'Soma de polinômios', formula: '[[(3x^2 - x) + (x + 1) = 3x^2 + 1]]', note: 'Tire os parênteses (o + não muda nada) e junte os semelhantes.', example: '' },
        { id: 'poli-sub', name: 'Subtração de polinômios', formula: '[[-(a - b + c) = -a + b - c]]',
          note: 'O sinal de menos na frente do parêntese <b>troca o sinal de todos</b> os termos de dentro. Depois junte os semelhantes.', example: '[[(2x + 5) - (x - 3) = 2x + 5 - x + 3 = x + 8]]' },
        { id: 'distributiva4', name: 'Distributiva e chuveirinho', formula: '[[k(a + b) = ka + kb]] · [[(a + b)(c + d) = ac + ad + bc + bd]]',
          note: 'Cada termo de um parêntese multiplica <b>cada</b> termo do outro.', example: '[[3(x - 2) = 3x - 6]]' },
        { id: 'potencias4', name: 'Multiplicando potências', formula: '[[x^a * x^b = x^{a + b}]]', note: 'Na multiplicação, os expoentes <b>somam</b>. O [[x]] sozinho é [[x^1]].', example: '[[x * x^3 = x^4]] · [[-x^3 * x = -x^4]]' },
        { id: 'grau4', name: 'Grau', formula: 'Maior expoente do [[x]] (depois de juntar os semelhantes)', note: '', example: '[[x^5 - 3x + 1]] → grau 5' },
        { id: 'grau-produto', name: 'Grau da soma e do produto', formula: 'Produto: os graus <b>somam</b> · Soma (graus diferentes): fica o <b>maior</b>',
          note: 'Se [[f]] tem grau 2 e [[g + h]] tem grau 5, então [[f * (g + h)]] tem grau [[2 + 5 = 7]].', example: '' }
      ],
      tip: 'Menos na frente do parêntese troca todos os sinais de dentro.',
      related: ['alg-134-1', 'alg-134-2']
    },
    {
      id: 'b4-rad', bim: 4, label: 'Racionalização', icon: '√', color: 'blue',
      title: 'Radicais e racionalização',
      rules: [
        { id: 'racionalizar', name: 'Racionalizar √a e ∛a', formula: '[[frac{k}{√a} = frac{k√a}{a}]] · [[frac{k}{R{3}{a}} = frac{kR{3}{a^2}}{a}]]',
          note: '<b>Racionalizar</b> = tirar a raiz do denominador. Multiplique <b>em cima e embaixo</b> pelo mesmo número (é multiplicar por 1, o valor não muda). Escolha o número que faz a raiz "sumir": [[√a * √a = a]] e [[R{3}{a} * R{3}{a^2} = R{3}{a^3} = a]].', example: '[[frac{3}{√2} * frac{√2}{√2} = frac{3√2}{2}]]' },
        { id: 'racionalizar-n', name: 'Racionalizar com índice n', formula: '[[frac{k}{R{n}{a^m}} * frac{R{n}{a^{n - m}}}{R{n}{a^{n - m}}} = frac{kR{n}{a^{n - m}}}{a}]]',
          note: 'O expoente dentro da raiz precisa chegar ao <b>índice</b>. Pergunte: quanto falta? Multiplique por isso.', example: '[[frac{1}{R{5}{2^3}}]]: falta [[2^2]] → [[frac{R{5}{4}}{2}]]' },
        { id: 'conjugado', name: 'Conjugado (soma e diferença)', formula: '[[(√a + √b)(√a - √b) = a - b]]',
          note: 'Quando o denominador tem dois termos, multiplique em cima e embaixo pelo <b>conjugado</b>: os mesmos termos com o <b>sinal do meio trocado</b>. Os termos do meio se cancelam e as raízes somem.', example: '[[frac{1}{√5 - √3} * frac{√5 + √3}{√5 + √3} = frac{√5 + √3}{5 - 3} = frac{√5 + √3}{2}]]' }
      ],
      tip: 'Multiplicar em cima e embaixo pelo mesmo número é multiplicar por 1: o valor não muda.',
      related: ['alg-135-1', 'alg-136-1', 'alg-137-1']
    },
    {
      id: 'b4-areas', bim: 4, label: 'Áreas', icon: '◺', color: 'yellow',
      title: 'Áreas e triângulos',
      rules: [
        { id: 'area-contar', name: 'Área no quadriculado', formula: 'Área = quantidade de quadradinhos de 1 cm²', note: 'Conte linha por linha. Se for retângulo: linhas × colunas.', example: '' },
        { id: 'area-retangulo4', name: 'Retângulo e quadrado', formula: 'Retângulo: [[A = a * b]] · Quadrado: [[A = a^2]]', note: 'Cubo: [[A_T = 6a^2]] · Paralelepípedo: [[A_T = 2(ab + ac + bc)]] (área total das faces).', example: '' },
        { id: 'area-composta4', name: 'Figura composta', formula: 'Divida em retângulos e some as áreas', note: 'As medidas que faltam saem por soma ou subtração das que aparecem.', example: '' },
        { id: 'conv-area', name: 'Conversão de áreas', formula: '[[1 m^2 = 10.000 cm^2]]',
          note: 'km² → hm² → dam² → m² → dm² → cm² → mm²: cada degrau multiplica por <b>100</b> (com comprimento, é por 10). [[1 m^2 = 100 cm * 100 cm = 10.000 cm^2]].', example: '[[41 m^2 = 41 * 10.000 = 410.000 cm^2]]' },
        { id: 'area-triangulo', name: 'Área do triângulo', formula: '[[A = frac{base * altura}{2}]]',
          note: 'O triângulo é a <b>metade</b> do retângulo de mesma base e mesma altura. A altura forma 90° com a base.', example: 'Base 12 e altura 6 → [[frac{12 * 6}{2} = 36]]' },
        { id: 'pitagoras', name: 'Teorema de Pitágoras', formula: '[[hipotenusa^2 = cateto^2 + cateto^2]]',
          note: 'Só em triângulo retângulo. A <b>hipotenusa</b> é o lado oposto ao ângulo de 90° (o maior). Os <b>catetos</b> formam o ângulo de 90°.', example: 'Catetos 3 e h, hipotenusa 5 → [[h^2 = 25 - 9 = 16]] → [[h = 4]]' },
        { id: 'triangulo-equilatero', name: 'Triângulo equilátero', formula: 'Altura [[h = frac{ℓ√3}{2}]] · Área [[A = frac{ℓ^2√3}{4}]]',
          note: 'Três lados iguais. A altura cai no meio da base (vem de Pitágoras).', example: 'Lado 12 → [[A = frac{144√3}{4} = 36√3]]' }
      ],
      tip: 'Triângulo: base vezes altura, dividido por 2. Se faltar a altura, procure um triângulo retângulo e use Pitágoras.',
      related: ['geo-142-1', 'geo-142-2', 'geo-145-1', 'geo-145-2', 'geo-145-3', 'geo-145-4', 'geo-145-5']
    },
    {
      id: 'b4-medias', bim: 4, label: 'Médias', icon: 'x̄', color: 'green',
      title: 'Médias',
      rules: [
        { id: 'media-simples4', name: 'Média aritmética', formula: 'Média = [[frac{soma dos valores}{quantidade de valores}]]', note: 'Juntar tudo e repartir igualmente. A média fica entre o menor e o maior valor.', example: '7, 12 e 14 → [[frac{33}{3} = 11]]' },
        { id: 'media-ponderada', name: 'Média ponderada', formula: 'Média = [[frac{valor_1 * peso_1 + valor_2 * peso_2 + ...}{peso_1 + peso_2 + ...}]]',
          note: 'O <b>peso</b> diz quantas vezes o valor conta (quantidade de produtos, de alunos, peso da prova...). Divida pela <b>soma dos pesos</b>.', example: '3 livros de R$ 34 e 5 de R$ 23 → [[frac{3 * 34 + 5 * 23}{8} = frac{217}{8} ≈ 27,13]]' },
        { id: 'ponto-medio', name: 'Média de dados agrupados', formula: 'Ponto médio [[m_i = frac{início + fim}{2}]] · Média ≈ [[frac{soma de (m_i * f_i)}{total}]]',
          note: 'Fazemos de conta que todos da classe estão no ponto médio: por isso a média é aproximada.', example: '[[0 ⊢ 6]] → ponto médio 3' }
      ],
      tip: 'Será que todos os valores aparecem a mesma quantidade de vezes? Se não, use a média ponderada.',
      related: ['est-139-1', 'est-139-2', 'est-139-3', 'est-141-1', 'est-141-2', 'est-141-3']
    },
    {
      id: 'b4-tabelas', bim: 4, label: 'Tabelas', icon: '▤', color: 'blue',
      title: 'Tabelas de frequência',
      rules: [
        { id: 'freq-tabela', name: 'Tabela de frequência', formula: '[[140 ⊢ 142]]: inclui 140 e 141, <b>não</b> inclui 142',
          note: '<b>Frequência</b> = quantos dados caem em cada intervalo. Ordene os dados (ou risque cada um ao contar). A tabela facilita contas, mas perde o valor exato de cada dado.', example: '' },
        { id: 'porcentagem-freq', name: 'Porcentagem na tabela', formula: '% = [[frac{frequência}{total}]] × 100',
          note: 'Se não souber o total, use uma linha completa: se 3 alunos são 6%, então 1% é 0,5 aluno e 100% são 50 alunos.', example: '22 de 50 → [[frac{22}{50} * 100 = 44]]%' }
      ],
      tip: 'A soma das frequências é o total; a soma das porcentagens é 100%.',
      related: ['est-140-1', 'est-140-2', 'est-140-3', 'est-140-4', 'est-141-3']
    }
  ];
  B4.forEach(function (b) { BLOCKS.push(b); });

  var RULES = {};
  BLOCKS.forEach(function (b) {
    b.rules.forEach(function (r) { r.block = b.id; RULES[r.id] = r; });
  });

  window.GM_FORMULAS = { blocks: BLOCKS, rules: RULES };
})();
