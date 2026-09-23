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

  var BLOCKS = [
    {
      id: 'numeros', label: 'Números', icon: '123', color: 'green',
      title: 'Números e sequências',
      rules: [
        { id: 'par-impar', name: 'Par e ímpar', formula: 'Par: [[2n]] &nbsp;·&nbsp; Ímpar: [[2n + 1]]', note: 'Aqui [[n]] é um número inteiro. Par divide por 2 sem sobrar; ímpar sobra 1.', example: '[[2 * 7 = 14]] é par · [[2 * 7 + 1 = 15]] é ímpar' },
        { id: 'consecutivos', name: 'Números consecutivos', formula: '[[x, &nbsp;x + 1, &nbsp;x + 2]]', note: 'Consecutivos vêm um depois do outro: aumentam de <b>1 em 1</b>. Dois consecutivos: [[x, &nbsp;x + 1]].', example: '4, 5 e 6 → [[x = 4]]. Somando: [[x + (x + 1) + (x + 2) = 3x + 3]]' },
        { id: 'impares-consecutivos', name: 'Ímpares consecutivos', formula: '[[x, &nbsp;x + 2, &nbsp;x + 4]] &nbsp;<small>(com [[x]] ímpar)</small>', note: 'Ímpares seguidos aumentam de <b>2 em 2</b> (pulam o par do meio). Pares seguidos também: [[x, &nbsp;x + 2, &nbsp;x + 4]] com [[x]] par.', example: '7, 9 e 11 → [[x = 7]]. Somando: [[3x + 6]]' },
        { id: 'traducoes', name: 'Traduzindo o texto', formula: 'Dobro: [[2x]] &nbsp;·&nbsp; Triplo: [[3x]] &nbsp;·&nbsp; "é igual a": [[=]]', note: 'Para descobrir o número, desfaça as contas de trás para frente: o "+" vira "−" e o "×" vira "÷".', example: '"O triplo de um número mais 5 é 20" → [[3x + 5 = 20]] → [[3x = 15]] → [[x = 5]]' }
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
        { id: 'modulo', name: 'Módulo', formula: '[[|a|]] = distância de [[a]] até o zero', note: 'O módulo é sempre positivo (ou zero). Resolva primeiro a conta de dentro das barras. Sinal que está <b>fora</b> das barras continua valendo.', example: '[[|-8| = 8]] &nbsp;·&nbsp; [[|4 - 7| = |-3| = 3]] &nbsp;·&nbsp; atenção: [[-|5| = -5]]' }
      ],
      tip: 'Índice par → resultado positivo (módulo). Índice ímpar → mantém o sinal.',
      related: ['p1-2', 'p2-1']
    },
    {
      id: 'porcentagem', label: 'Porcentagem', icon: '%', color: 'blue',
      title: 'Porcentagem',
      rules: [
        { id: 'pct-parte', name: 'Parte de um total', formula: 'Parte = Total × [[frac{porcentagem}{100}]]', note: 'Porcentagem é "de cada 100". 30% = [[frac{30}{100} = 0,3]].', example: '30% de 80 → [[80 * frac{30}{100}]]. Macete: 10% é dividir por 10.' },
        { id: 'pct-porcentagem', name: 'Quanto por cento?', formula: 'Porcentagem = [[frac{Parte}{Total}]] × 100', note: 'A <b>parte</b> vai em cima, o <b>total</b> embaixo. Depois, multiplique por 100.', example: '15 de 60 → [[frac{15}{60} = 0,25]] → 25%' },
        { id: 'pct-desconto', name: 'Preço depois do desconto', formula: 'Preço final = Preço inicial × [[(1 - frac{desconto}{100})]]', note: 'Primeiro veja com quantos por cento o preço fica. Depois calcule essa porcentagem do preço inicial.', example: 'R$ 200 com 10% de desconto → paga 90% → [[200 * 0,9 = 180]]' }
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
        { id: 'conversao', name: 'Conversão de unidades', formula: '1 m = 100 cm &nbsp;·&nbsp; 1 cm = 10 mm', note: 'm → cm: multiplica por 100. mm → cm: divide por 10. Deixe tudo na <b>mesma unidade</b> antes de calcular.', example: '1,5 m = 150 cm · 250 mm = 25 cm' },
        { id: 'lajotas', name: 'Quantidade de peças', formula: 'Quantidade = [[frac{Área total}{Área de uma peça}]]', note: 'Se o resultado precisa ser inteiro, arredonde <b>para cima</b>. Quando há cortes, veja se os recortes podem ser <b>reaproveitados</b> (uma peça cortada ao meio cobre dois pedaços).', example: 'Região 40 × 20 cm, peça 10 × 10 → [[frac{800}{100} = 8]] peças' },
        { id: 'custo', name: 'Custo total', formula: 'Custo = Quantidade × Preço de cada um', note: '', example: '8 peças de R$ 3,50 → [[8 * 3,50 = 28]] reais' }
      ],
      tip: 'Primeiro converta, depois calcule área, quantidade e preço.',
      related: ['p2-10']
    },
    {
      id: 'divisores', label: 'Divisores', icon: '÷', color: 'green',
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
        { id: 'distributiva', name: 'Distributiva', formula: '[[a(b + c) = ab + ac]]', note: 'Com dois parênteses, cada termo do primeiro multiplica cada termo do segundo.', example: '[[(x + 2)(x + 3) = x^2 + 3x + 2x + 6 = x^2 + 5x + 6]]' },
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
        { id: 'soma-produto', name: 'Soma e produto das raízes', formula: '[[x^2 + bx + c = 0]]<br>Soma = [[-b]] &nbsp;·&nbsp; Produto = [[c]]', note: 'Procure dois números com essa soma e esse produto. Se o número na frente do [[x^2]] não for 1, <b>divida a equação toda por ele</b> antes.', example: '[[x^2 - 5x + 6 = 0]] → soma 5, produto 6 → raízes 2 e 3' },
        { id: 'reflexao', name: 'Reflexão em uma reta', formula: 'Mesma distância, do outro lado, em linha perpendicular', note: 'Cada ponto refletido fica à <b>mesma distância</b> da reta (o eixo), do outro lado, andando em linha reta que forma 90° com ela. Tamanho e forma não mudam; a figura fica espelhada.', example: '', fig: reflexaoMini }
      ],
      tip: 'Soma e produto: primeiro deixe o [[x^2]] sozinho (número 1 na frente).',
      related: ['p2-8', 'p1-10']
    }
  ];

  var RULES = {};
  BLOCKS.forEach(function (b) {
    b.rules.forEach(function (r) { r.block = b.id; RULES[r.id] = r; });
  });

  window.GM_FORMULAS = { blocks: BLOCKS, rules: RULES };
})();
