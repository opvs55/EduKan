// Fichário de Matemática — Temporada 1 (ENEM): a matemática do dia a dia.
//
// Regra de qualidade 1: a IA só pode citar fatos daqui. Fórmulas, regras e
// exemplos são escritos e revisados à mão. Toda `conta` dos passos é
// recalculada pelos testes (test/fichario.test.js) com o verificador.
//
// No `conceito`, o trecho entre **asteriscos** aparece em destaque.

export const BLOCOS = [
  { numero: 1, titulo: 'Porcentagem e dinheiro' },
  { numero: 2, titulo: 'Proporção' },
  { numero: 3, titulo: 'Funções e sequências' },
  { numero: 4, titulo: 'Dados e chance' },
];

export const TEMAS = {
  porcentagem: {
    bloco: 1,
    titulo: 'Porcentagem',
    resumo: 'O que é x% de um valor, como achar a porcentagem que um número representa de outro e a diferença entre porcentagem e ponto percentual.',
    gancho: 'Quanto é 8% de 25? Dá para fazer de cabeça.',
    conceito: 'Porcentagem é uma fração de denominador 100. Calcular x% de um valor é **multiplicar** o valor por x/100.',
    fatos: [
      'x% = x/100 (25% = 0,25 e 8% = 0,08)',
      '10% de um valor: basta deslocar a vírgula uma casa para a esquerda',
      'x% de y é igual a y% de x (8% de 25 = 25% de 8 = 2)',
      'Para saber que porcentagem A é de B, calcule A ÷ B e multiplique por 100',
      'Ponto percentual é a diferença entre duas porcentagens; variação percentual compara essa diferença com o valor inicial',
    ],
    exemplos: [
      {
        enunciado: 'Numa turma de 40 alunos, 30% foram aprovados direto. Quantos alunos são?',
        passos: [
          { texto: '30% é o fator 0,30', conta: null },
          { texto: 'Multiplique o fator pelo total', conta: '0,30 × 40 = 12' },
        ],
        resposta: '12 alunos',
      },
      {
        enunciado: 'Uma conta de R$ 80 teve R$ 12 de gorjeta. Que porcentagem da conta é a gorjeta?',
        passos: [
          { texto: 'Divida a parte pelo total', conta: '12 ÷ 80 = 0,15' },
          { texto: 'Multiplique por 100', conta: '0,15 × 100 = 15' },
        ],
        resposta: '15%',
      },
    ],
    erro_comum: {
      errado: 'De 10% para 12% = aumento de 2%',
      explicacao: 'A taxa subiu 2 pontos percentuais. Em relação ao valor inicial, o aumento foi de 20%, porque 2 ÷ 10 = 0,20.',
    },
    desafio: {
      pergunta: 'Quanto é 8% de 25? Sem calculadora.',
      resposta: '2',
      explicacao: '8% de 25 é o mesmo que 25% de 8, e 25% é um quarto: 8 ÷ 4 = 2.',
    },
    juntos: null,
    pista: 'E se o desconto viesse duas vezes seguidas?',
    gerador: 'porcentagem',
    pre_requisitos: [],
  },

  'aumentos-e-descontos-sucessivos': {
    bloco: 1,
    titulo: 'Aumentos e descontos sucessivos',
    resumo: 'Por que porcentagens aplicadas em sequência se multiplicam, e não se somam.',
    gancho: '10% de desconto. Depois, mais 10%. Deu 20%?',
    conceito: 'Porcentagens aplicadas em sequência se **multiplicam**. Cada aumento vira um fator maior que 1 e cada desconto, um fator menor que 1.',
    fatos: [
      'Aumento de x%: fator 1 + x/100 (aumento de 25% → 1,25)',
      'Desconto de x%: fator 1 − x/100 (desconto de 20% → 0,80)',
      'O fator total é o produto dos fatores',
      'Fator total maior que 1 é aumento de (fator − 1) × 100%; menor que 1 é desconto de (1 − fator) × 100%',
      'Um aumento de x% seguido de um desconto de x% sempre deixa o valor menor que o original',
    ],
    exemplos: [
      {
        enunciado: 'Um tênis de R$ 200 tem 10% de desconto e, na semana seguinte, mais 10%. Qual o desconto total?',
        passos: [
          { texto: 'Desconto de 10% é o fator 0,90', conta: '200 × 0,90 = 180' },
          { texto: 'O segundo desconto vale sobre o novo preço', conta: '180 × 0,90 = 162' },
          { texto: 'Fator total: 0,90 × 0,90', conta: '0,90 × 0,90 = 0,81' },
          { texto: 'Desconto total: 1 − 0,81', conta: '(1 − 0,81) × 100 = 19' },
        ],
        resposta: 'Desconto total de 19%',
      },
    ],
    erro_comum: {
      errado: '10% + 10% = 20%',
      explicacao: 'Somar as porcentagens. O segundo desconto incide sobre um valor menor.',
    },
    desafio: {
      pergunta: 'Um produto sobe 20% e depois cai 20%. Ficou mais caro ou mais barato?',
      resposta: 'Mais barato: 4% abaixo do preço original.',
      explicacao: 'O fator total é 1,20 × 0,80 = 0,96, ou seja, o produto passa a valer 96% do preço inicial.',
    },
    juntos: {
      com: 'porcentagem',
      texto: 'No episódio 1 você viu que x% é multiplicar por x/100. Aqui o mesmo fator volta, agora encadeado.',
    },
    pista: 'E se o dinheiro emprestado cobrasse um aluguel por mês?',
    gerador: 'aumentosEDescontos',
    pre_requisitos: ['porcentagem'],
  },

  'juros-simples': {
    bloco: 1,
    titulo: 'Juros simples',
    resumo: 'Como calcular juro e montante quando o juro de cada período é sempre sobre o capital inicial.',
    gancho: 'Emprestar R$ 1.500 a 2% ao mês. Quanto volta em 5 meses?',
    conceito: 'No juro simples, o juro de cada período é sempre calculado sobre o **capital inicial**: J = C × i × t.',
    fatos: [
      'J = C × i × t (capital × taxa × tempo)',
      'Montante: M = C + J = C × (1 + i × t)',
      'Taxa e tempo precisam estar na mesma unidade: taxa ao mês com tempo em meses',
      'No juro simples, 24% ao ano equivalem a 2% ao mês',
      'O montante cresce em linha reta: o mesmo juro a cada período',
    ],
    exemplos: [
      {
        enunciado: 'Um empréstimo de R$ 1.500 a juro simples de 2% ao mês por 5 meses. Qual o montante?',
        passos: [
          { texto: 'Juro de um mês', conta: '1.500 × 0,02 = 30' },
          { texto: 'Juro de 5 meses', conta: '30 × 5 = 150' },
          { texto: 'Montante: capital + juro', conta: '1.500 + 150 = 1.650' },
        ],
        resposta: 'R$ 1.650',
      },
    ],
    erro_comum: {
      errado: '24% ao ano por 6 meses → J = C × 0,24 × 6',
      explicacao: 'Misturar unidades. 24% ao ano é 2% ao mês no juro simples: use 0,02 × 6 (ou 0,24 × 0,5 ano).',
    },
    desafio: {
      pergunta: 'R$ 1.000 a 3% ao mês, juro simples. Em quantos meses o juro chega a R$ 300?',
      resposta: '10 meses',
      explicacao: 'O juro de cada mês é 1.000 × 0,03 = 30. Para juntar 300: 300 ÷ 30 = 10 meses.',
    },
    juntos: {
      com: 'aumentos-e-descontos-sucessivos',
      texto: 'No episódio 2 os fatores se multiplicavam. No juro simples, não: o juro de cada mês é sempre o mesmo, porque é calculado sobre o capital inicial.',
    },
    pista: 'E se o juro de hoje também passasse a render juro?',
    gerador: 'jurosSimples',
    pre_requisitos: ['porcentagem'],
  },

  'juros-compostos': {
    bloco: 1,
    titulo: 'Juros compostos',
    resumo: 'Juro sobre juro: por que uma dívida ou um investimento cresce cada vez mais rápido.',
    gancho: 'Por que a dívida do cartão cresce tão rápido?',
    conceito: 'No juro composto, o juro de cada período entra no capital e passa a render também: **M = C × (1 + i)ᵗ**.',
    fatos: [
      'M = C × (1 + i)ᵗ',
      'É um aumento sucessivo de i% repetido t vezes',
      'Em um único período, juro simples e composto dão o mesmo montante',
      'Para mais de um período (e a mesma taxa), o montante composto é maior que o simples',
      'Juro = M − C',
    ],
    exemplos: [
      {
        enunciado: 'R$ 1.000 aplicados a 10% ao mês, juro composto, por 3 meses. Qual o montante?',
        passos: [
          { texto: '1º mês', conta: '1.000 × 1,10 = 1.100' },
          { texto: '2º mês: o juro incide sobre 1.100', conta: '1.100 × 1,10 = 1.210' },
          { texto: '3º mês', conta: '1.210 × 1,10 = 1.331' },
          { texto: 'O mesmo, de uma vez: fator 1,10³', conta: '1.000 × 1,10³ = 1.331' },
        ],
        resposta: 'R$ 1.331 (juro de R$ 331; no simples seriam R$ 300)',
      },
    ],
    erro_comum: {
      errado: '10% ao mês por 3 meses = 30%',
      explicacao: 'Isso é juro simples. No composto, o fator é 1,10³ = 1,331, ou seja, 33,1%.',
    },
    desafio: {
      pergunta: 'Uma dívida de R$ 2.000 cresce 10% ao mês (juro composto). Quanto vale depois de 2 meses?',
      resposta: 'R$ 2.420',
      explicacao: '2.000 × 1,10 = 2.200 e 2.200 × 1,10 = 2.420.',
    },
    juntos: {
      com: 'juros-simples',
      texto: 'Juro simples soma o mesmo juro todo mês; o composto multiplica pelo mesmo fator. Em um único mês, os dois dão o mesmo valor.',
    },
    pista: 'Como saber se uma receita dobrada continua com o mesmo gosto?',
    gerador: 'jurosCompostos',
    pre_requisitos: ['aumentos-e-descontos-sucessivos', 'juros-simples'],
  },

  'razao-e-proporcao': {
    bloco: 2,
    titulo: 'Razão e proporção',
    resumo: 'Comparar grandezas por divisão e dividir um total em partes proporcionais.',
    gancho: 'Dividir R$ 600 na razão 2 para 3. Cada um leva quanto?',
    conceito: 'Razão é a comparação de duas grandezas por **divisão** (a/b). Proporção é a igualdade entre duas razões: a/b = c/d.',
    fatos: [
      'A razão de a para b é a ÷ b (lê-se "a está para b")',
      'Propriedade fundamental: se a/b = c/d, então a × d = b × c',
      'Dividir um total na razão a : b é dividir em a + b partes iguais',
      'Porcentagem, velocidade média, densidade e escala são razões',
    ],
    exemplos: [
      {
        enunciado: 'Dividir R$ 600 entre duas pessoas na razão 2 : 3.',
        passos: [
          { texto: 'Total de partes', conta: '2 + 3 = 5' },
          { texto: 'Valor de cada parte', conta: '600 ÷ 5 = 120' },
          { texto: 'Quem tem 2 partes', conta: '2 × 120 = 240' },
          { texto: 'Quem tem 3 partes', conta: '3 × 120 = 360' },
        ],
        resposta: 'R$ 240 e R$ 360',
      },
    ],
    erro_comum: {
      errado: 'Razão 2 : 3 de R$ 600 → 600 ÷ 2 e 600 ÷ 3',
      explicacao: 'Dividir o total pelos números da razão. A razão diz quantas partes cada um recebe de um total de 2 + 3 = 5 partes.',
    },
    desafio: {
      pergunta: 'Num suco, a razão de concentrado para água é 1 : 4. Quanto concentrado vai em 2 litros de suco?',
      resposta: '400 mL',
      explicacao: 'São 1 + 4 = 5 partes; cada parte tem 2.000 ÷ 5 = 400 mL, e o concentrado é 1 parte.',
    },
    juntos: {
      com: 'juros-compostos',
      texto: 'Porcentagem é uma razão com denominador 100: a taxa de 10% ao mês dos juros compostos é a razão 10/100.',
    },
    pista: 'Se você conhece três números, como acha o quarto?',
    gerador: 'razaoEProporcao',
    pre_requisitos: ['porcentagem'],
  },

  'regra-de-tres': {
    bloco: 2,
    titulo: 'Regra de três',
    resumo: 'Regra de três simples e composta, com grandezas diretamente e inversamente proporcionais.',
    gancho: '4 pedreiros levam 6 dias. E 3 pedreiros?',
    conceito: 'Regra de três acha o valor desconhecido de uma proporção. Antes de montar a conta, decida se as grandezas são **diretamente** ou **inversamente** proporcionais.',
    fatos: [
      'Diretamente proporcionais: uma dobra, a outra dobra (a razão entre elas é constante)',
      'Inversamente proporcionais: uma dobra, a outra cai pela metade (o produto entre elas é constante)',
      'Na direta, multiplique em cruz; na inversa, inverta uma das razões antes',
      'Na regra de três composta, compare cada grandeza com a desconhecida, uma de cada vez',
    ],
    exemplos: [
      {
        enunciado: '3 cadernos custam R$ 18. Quanto custam 7 cadernos?',
        passos: [
          { texto: 'Mais cadernos, mais dinheiro: direta. Preço de um caderno', conta: '18 ÷ 3 = 6' },
          { texto: 'Preço de 7 cadernos', conta: '6 × 7 = 42' },
        ],
        resposta: 'R$ 42',
      },
      {
        enunciado: '4 pedreiros fazem um muro em 6 dias. Em quantos dias 3 pedreiros fazem o mesmo muro?',
        passos: [
          { texto: 'Menos pedreiros, mais dias: inversa. Trabalho total em pedreiro-dias', conta: '4 × 6 = 24' },
          { texto: 'Dividido entre 3 pedreiros', conta: '24 ÷ 3 = 8' },
        ],
        resposta: '8 dias',
      },
    ],
    erro_comum: {
      errado: '4 pedreiros → 6 dias, então 3 pedreiros → 4,5 dias',
      explicacao: 'Usar regra de três direta em grandezas inversas. Menos pedreiros levam mais dias: 4 × 6 = 3 × x, e x = 8.',
    },
    desafio: {
      pergunta: 'Um carro a 80 km/h faz uma viagem em 3 horas. A 120 km/h, quanto tempo leva?',
      resposta: '2 horas',
      explicacao: 'Velocidade e tempo são inversamente proporcionais: 80 × 3 = 240 km, e 240 ÷ 120 = 2.',
    },
    juntos: {
      com: 'razao-e-proporcao',
      texto: 'A regra de três é a propriedade fundamental da proporção do episódio 5 (a × d = b × c) usada para achar um número escondido.',
    },
    pista: 'Como uma cidade inteira cabe numa folha de papel?',
    gerador: 'regraDeTres',
    pre_requisitos: ['razao-e-proporcao'],
  },

  escala: {
    bloco: 2,
    titulo: 'Escala',
    resumo: 'Ler mapas e plantas: converter medidas do desenho em medidas reais, inclusive áreas.',
    gancho: '7 centímetros no mapa. Quantos quilômetros na estrada?',
    conceito: 'Escala é a razão entre uma medida no **desenho** e a medida **real**, na mesma unidade: E = d/D.',
    fatos: [
      'Escala 1 : 50.000 significa que 1 cm no mapa vale 50.000 cm (500 m) no real',
      'Converta para a mesma unidade antes de calcular: 1 m = 100 cm e 1 km = 100.000 cm',
      'A escala vale para comprimentos; para áreas, a razão é o quadrado da escala',
      'Quanto maior o denominador, menor a escala e menos detalhes o mapa mostra',
    ],
    exemplos: [
      {
        enunciado: 'Num mapa de escala 1 : 200.000, duas cidades estão a 7 cm uma da outra. Qual a distância real em km?',
        passos: [
          { texto: 'Distância real em centímetros', conta: '7 × 200.000 = 1.400.000' },
          { texto: 'Em quilômetros (1 km = 100.000 cm)', conta: '1.400.000 ÷ 100.000 = 14' },
        ],
        resposta: '14 km',
      },
    ],
    erro_comum: {
      errado: 'Planta 1 : 100 → 1 cm² no desenho = 100 cm² no real',
      explicacao: 'Aplicar a escala direto na área. Cada lado é multiplicado por 100, então a área é multiplicada por 100 × 100 = 10.000: 1 cm² vira 10.000 cm² (1 m²).',
    },
    desafio: {
      pergunta: 'Uma planta na escala 1 : 50 mostra uma sala de 8 cm por 6 cm. Qual a área real da sala?',
      resposta: '12 m²',
      explicacao: 'Os lados reais são 8 × 50 = 400 cm (4 m) e 6 × 50 = 300 cm (3 m). Área: 4 × 3 = 12 m².',
    },
    juntos: {
      com: 'regra-de-tres',
      texto: 'Escala é uma regra de três direta: se 1 cm vale 2 km, 7 cm valem 14 km.',
    },
    pista: 'E se o preço da corrida crescesse em linha reta?',
    gerador: 'escala',
    pre_requisitos: ['razao-e-proporcao'],
  },

  'funcao-afim': {
    bloco: 3,
    titulo: 'Função afim',
    resumo: 'f(x) = ax + b: valor fixo mais uma taxa por unidade, e por que o gráfico é uma reta.',
    gancho: 'Se 10 km de táxi custam R$ 30, 20 km custam R$ 60?',
    conceito: 'Função afim tem a forma **f(x) = ax + b**: um valor fixo b mais uma parte que cresce a cada unidade de x. O gráfico é uma reta.',
    fatos: [
      'a é a taxa de variação: quanto f(x) muda quando x aumenta 1',
      'b é o valor inicial: f(0) = b, onde a reta corta o eixo y',
      'a > 0: função crescente; a < 0: decrescente',
      'A raiz (onde f(x) = 0) é x = −b/a',
      'Com dois pontos da reta, a = (y₂ − y₁) ÷ (x₂ − x₁)',
    ],
    exemplos: [
      {
        enunciado: 'Uma corrida de táxi custa R$ 5 de bandeirada mais R$ 2,50 por km. Quanto custa uma corrida de 12 km?',
        passos: [
          { texto: 'A função é f(x) = 2,50x + 5. Parte que varia', conta: '2,50 × 12 = 30' },
          { texto: 'Somando a bandeirada', conta: '30 + 5 = 35' },
        ],
        resposta: 'R$ 35',
      },
    ],
    erro_comum: {
      errado: 'Se 10 km custam R$ 30, 20 km custam R$ 60',
      explicacao: 'Tratar função afim como proporção. A bandeirada não dobra: com f(x) = 2,50x + 5, f(20) = 55.',
    },
    desafio: {
      pergunta: 'Um plano de celular custa R$ 30 por mês mais R$ 0,50 por minuto além da franquia. Uma conta de R$ 45 teve quantos minutos extras?',
      resposta: '30 minutos',
      explicacao: 'Tire a parte fixa: 45 − 30 = 15. Depois divida pela taxa: 15 ÷ 0,50 = 30.',
    },
    juntos: {
      com: 'escala',
      texto: 'Na escala, a reta passa pela origem (f(x) = ax, sem parte fixa). Na função afim aparece o b: o valor que existe mesmo com x = 0.',
    },
    pista: 'E se o gráfico, em vez de reta, fizesse uma curva?',
    gerador: 'funcaoAfim',
    pre_requisitos: ['regra-de-tres'],
  },

  'funcao-quadratica': {
    bloco: 3,
    titulo: 'Função quadrática',
    resumo: 'Parábola, raízes e vértice: como achar o máximo ou o mínimo de uma função de 2º grau.',
    gancho: 'Uma bola é chutada para cima. Qual a altura máxima?',
    conceito: 'Função quadrática tem a forma **f(x) = ax² + bx + c**, com a ≠ 0. O gráfico é uma parábola, e o vértice é o ponto de máximo ou de mínimo.',
    fatos: [
      'a > 0: concavidade para cima (a função tem mínimo); a < 0: para baixo (tem máximo)',
      'Vértice: xᵥ = −b/(2a) e yᵥ = f(xᵥ)',
      'Raízes pela fórmula de Bhaskara: x = (−b ± √Δ)/(2a), com Δ = b² − 4ac',
      'Δ > 0: duas raízes reais; Δ = 0: uma; Δ < 0: nenhuma',
      'Soma das raízes = −b/a e produto = c/a',
      'c é onde a parábola corta o eixo y',
    ],
    exemplos: [
      {
        enunciado: 'A altura de uma bola, em metros, é h(t) = −5t² + 20t, com t em segundos. Qual a altura máxima?',
        passos: [
          { texto: 'Instante do vértice: tᵥ = −b/(2a)', conta: '−20 ÷ (2 × (−5)) = 2' },
          { texto: 'Altura nesse instante: h(2)', conta: '−5 × 2² + 20 × 2 = 20' },
        ],
        resposta: '20 m, aos 2 segundos',
      },
    ],
    erro_comum: {
      errado: 'Altura máxima = tᵥ = 2',
      explicacao: 'Confundir onde o máximo acontece (tᵥ = 2 s) com o valor máximo (h(2) = 20 m). A pergunta pede o yᵥ.',
    },
    desafio: {
      pergunta: 'Um retângulo tem perímetro de 20 m. Qual a maior área possível?',
      resposta: '25 m²',
      explicacao: 'Com lados x e 10 − x, a área é A(x) = x(10 − x) = −x² + 10x. O vértice está em x = 5, e A(5) = 25.',
    },
    juntos: {
      com: 'funcao-afim',
      texto: 'Na função afim, a taxa de variação é constante. Na quadrática ela muda a cada passo, e por isso a reta vira curva.',
    },
    pista: 'E se uma fila de números crescesse sempre do mesmo tanto?',
    gerador: 'funcaoQuadratica',
    pre_requisitos: ['funcao-afim'],
  },

  'progressao-aritmetica': {
    bloco: 3,
    titulo: 'Progressão aritmética',
    resumo: 'Sequências que crescem somando sempre o mesmo valor: termo geral e soma dos termos.',
    gancho: 'Quanto dá 1 + 2 + 3 + … + 100?',
    conceito: 'Progressão aritmética (PA) é uma sequência em que cada termo é o anterior **mais** um valor fixo, a razão r.',
    fatos: [
      'Termo geral: aₙ = a₁ + (n − 1) × r',
      'Soma dos n primeiros termos: Sₙ = (a₁ + aₙ) × n ÷ 2',
      'Uma PA é uma função afim definida nos números naturais',
      'r > 0: crescente; r < 0: decrescente; r = 0: constante',
    ],
    exemplos: [
      {
        enunciado: 'Uma pessoa guarda R$ 10 na 1ª semana, R$ 15 na 2ª, R$ 20 na 3ª, e assim por diante. Quanto guarda na 12ª semana? E no total das 12?',
        passos: [
          { texto: 'Razão', conta: '15 − 10 = 5' },
          { texto: '12º termo: a₁ + 11 × r', conta: '10 + 11 × 5 = 65' },
          { texto: 'Soma: (a₁ + a₁₂) × 12 ÷ 2', conta: '(10 + 65) × 12 ÷ 2 = 450' },
        ],
        resposta: 'R$ 65 na 12ª semana e R$ 450 no total',
      },
    ],
    erro_comum: {
      errado: 'a₁₂ = a₁ + 12 × r',
      explicacao: 'Contar uma razão a mais. Do 1º ao 12º termo são 11 saltos: aₙ = a₁ + (n − 1) × r.',
    },
    desafio: {
      pergunta: 'Quanto dá 1 + 2 + 3 + … + 100?',
      resposta: '5.050',
      explicacao: 'É uma PA com a₁ = 1, a₁₀₀ = 100 e 100 termos: (1 + 100) × 100 ÷ 2 = 5.050.',
    },
    juntos: {
      com: 'funcao-quadratica',
      texto: 'A soma de uma PA cresce como uma função quadrática: na fórmula de Sₙ aparece n².',
    },
    pista: 'E se, em vez de somar, cada termo multiplicasse?',
    gerador: 'progressaoAritmetica',
    pre_requisitos: ['funcao-afim'],
  },

  'progressao-geometrica': {
    bloco: 3,
    titulo: 'Progressão geométrica',
    resumo: 'Sequências que crescem multiplicando sempre pelo mesmo valor: termo geral, soma e crescimento exponencial.',
    gancho: 'Uma bactéria vira 2 a cada 20 minutos. Quantas em 2 horas?',
    conceito: 'Progressão geométrica (PG) é uma sequência em que cada termo é o anterior **vezes** um valor fixo, a razão q.',
    fatos: [
      'Termo geral: aₙ = a₁ × qⁿ⁻¹',
      'Soma dos n primeiros termos (q ≠ 1): Sₙ = a₁ × (qⁿ − 1) ÷ (q − 1)',
      'Juro composto é uma PG de razão (1 + i)',
      'Com q > 1 e a₁ > 0, a PG cresce cada vez mais rápido',
    ],
    exemplos: [
      {
        enunciado: 'Na 1ª hora, 3 pessoas recebem uma mensagem. A cada hora, cada uma repassa para 3 pessoas novas. Quantas recebem na 5ª hora? E no total das 5 horas?',
        passos: [
          { texto: 'PG com a₁ = 3 e q = 3. 5º termo: a₁ × q⁴', conta: '3 × 3⁴ = 243' },
          { texto: 'Soma: a₁ × (q⁵ − 1) ÷ (q − 1)', conta: '3 × (3⁵ − 1) ÷ (3 − 1) = 363' },
        ],
        resposta: '243 pessoas na 5ª hora e 363 no total',
      },
    ],
    erro_comum: {
      errado: 'a₅ = a₁ × q⁵',
      explicacao: 'Usar o expoente n em vez de n − 1. Do 1º ao 5º termo são 4 multiplicações: a₅ = a₁ × q⁴.',
    },
    desafio: {
      pergunta: 'Uma bactéria se divide em 2 a cada 20 minutos. Começando com 1, quantas existem depois de 2 horas?',
      resposta: '64',
      explicacao: 'Em 2 horas há 120 ÷ 20 = 6 divisões, então 1 × 2⁶ = 64.',
    },
    juntos: {
      com: 'progressao-aritmetica',
      texto: 'A PA soma a razão; a PG multiplica. É a mesma diferença entre juro simples (episódio 3) e juro composto (episódio 4).',
    },
    pista: 'Um número só consegue resumir uma turma inteira?',
    gerador: 'progressaoGeometrica',
    pre_requisitos: ['progressao-aritmetica', 'juros-compostos'],
  },

  'media-mediana-e-moda': {
    bloco: 4,
    titulo: 'Média, mediana e moda',
    resumo: 'As três medidas de tendência central, quando cada uma representa melhor os dados, e média ponderada.',
    gancho: 'O salário médio da empresa é R$ 6 mil. Quase ninguém ganha isso.',
    conceito: 'Medidas de tendência central resumem um conjunto em um número: a **média** (soma ÷ quantidade), a **mediana** (o valor do meio, com os dados em ordem) e a **moda** (o valor mais frequente).',
    fatos: [
      'Média aritmética = soma dos valores ÷ quantidade de valores',
      'Mediana: ordene os dados; com quantidade par, é a média dos dois valores centrais',
      'Moda: o valor que mais aparece (pode haver mais de uma ou nenhuma)',
      'A média é sensível a valores extremos; a mediana, não',
      'Média ponderada = soma de (valor × peso) ÷ soma dos pesos',
    ],
    exemplos: [
      {
        enunciado: 'Salários de uma pequena empresa, em R$ mil: 2, 2, 3, 3, 3, 4 e 25. Qual medida representa melhor o salário típico?',
        passos: [
          { texto: 'Média', conta: '(2 + 2 + 3 + 3 + 3 + 4 + 25) ÷ 7 = 6' },
          { texto: 'Mediana: com os 7 valores em ordem, o 4º é 3', conta: null },
          { texto: 'Moda: o 3 aparece três vezes', conta: null },
        ],
        resposta: 'A mediana (R$ 3 mil): a média de R$ 6 mil é puxada pelo salário de R$ 25 mil.',
      },
    ],
    erro_comum: {
      errado: 'Mediana de 7, 2, 9, 4, 5 = 9',
      explicacao: 'Pegar o valor do meio sem ordenar. Em ordem (2, 4, 5, 7, 9), a mediana é 5.',
    },
    desafio: {
      pergunta: 'As notas de um aluno foram 5, 7 e 8, com pesos 1, 1 e 2. Qual a média ponderada?',
      resposta: '7',
      explicacao: '(5 × 1 + 7 × 1 + 8 × 2) ÷ (1 + 1 + 2) = 28 ÷ 4 = 7.',
    },
    juntos: {
      com: 'progressao-aritmetica',
      texto: 'Numa PA, a média dos termos é a média do primeiro com o último. É por isso que a soma da PA é (a₁ + aₙ) × n ÷ 2.',
    },
    pista: 'Dá para enganar alguém só mudando o eixo de um gráfico?',
    gerador: 'mediaMedianaModa',
    pre_requisitos: [],
  },

  'leitura-de-graficos': {
    bloco: 4,
    titulo: 'Leitura de gráficos',
    resumo: 'Barras, linhas e setores: ler eixos com cuidado, calcular variações e não cair em gráficos enganosos.',
    gancho: 'Essa barra parece o dobro da outra. Mas é?',
    conceito: 'Ler um gráfico é conferir **o que** cada eixo mede, **em que unidade** e **a partir de onde** começa, antes de comparar alturas ou inclinações.',
    fatos: [
      'Barras comparam quantidades; linhas mostram evolução no tempo; setores mostram partes de um todo',
      'Um eixo que não começa em zero exagera as diferenças visuais',
      'Variação percentual entre dois valores = (final − inicial) ÷ inicial × 100',
      'No gráfico de setores, o círculo todo (360°) é 100%; cada 1% corresponde a 3,6°',
    ],
    exemplos: [
      {
        enunciado: 'Um gráfico de linha mostra que uma loja vendeu 200 unidades em janeiro e 260 em junho. Qual a variação percentual?',
        passos: [
          { texto: 'Diferença', conta: '260 − 200 = 60' },
          { texto: 'Em relação ao valor inicial', conta: '60 ÷ 200 = 0,30' },
          { texto: 'Em porcentagem', conta: '0,30 × 100 = 30' },
        ],
        resposta: 'Aumento de 30%',
      },
      {
        enunciado: 'Num gráfico de setores, uma fatia representa 25% do total. Qual o ângulo dessa fatia?',
        passos: [{ texto: 'Cada 1% vale 3,6°', conta: '25 × 3,6 = 90' }],
        resposta: '90°',
      },
    ],
    erro_comum: {
      errado: 'A barra B tem o dobro da altura da A, então B vale o dobro',
      explicacao: 'Comparar alturas sem olhar onde o eixo começa. Se o eixo começa em 80, barras de 90 e 100 parecem uma o dobro da outra, mas 100 é só cerca de 11% maior que 90.',
    },
    desafio: {
      pergunta: 'Num gráfico de setores, uma fatia tem 54°. Que porcentagem do total ela representa?',
      resposta: '15%',
      explicacao: 'Cada 1% vale 3,6°, então 54 ÷ 3,6 = 15.',
    },
    juntos: {
      com: 'media-mediana-e-moda',
      texto: 'A média do episódio 12 aparece num gráfico de barras como uma linha horizontal: o que passa acima dela compensa exatamente o que falta abaixo.',
    },
    pista: 'De quantas formas dá para montar um lanche com 3 pães e 4 recheios?',
    gerador: 'leituraDeGraficos',
    pre_requisitos: ['porcentagem'],
  },

  'principio-da-contagem': {
    bloco: 4,
    titulo: 'Princípio da contagem',
    resumo: 'Contar possibilidades sem listar todas: princípio multiplicativo, permutação e combinação.',
    gancho: 'Quantas senhas de 4 dígitos existem?',
    conceito: 'Se uma escolha tem m opções e outra, independente, tem n opções, as duas juntas têm **m × n** possibilidades. Com várias etapas, multiplique as opções de cada uma.',
    fatos: [
      'Princípio multiplicativo: etapas que acontecem juntas (uma e outra) → multiplique',
      'Escolhas que se excluem (uma ou outra) → some',
      'Permutação de n elementos distintos: n! = n × (n − 1) × … × 1',
      'Quando a ordem não importa (duplas, comissões), divida pelas repetições: C(n, k) = n! ÷ (k! × (n − k)!)',
    ],
    exemplos: [
      {
        enunciado: 'Uma senha tem 2 letras (de 26) seguidas de 3 algarismos (de 0 a 9), podendo repetir. Quantas senhas existem?',
        passos: [
          { texto: 'Parte das letras', conta: '26 × 26 = 676' },
          { texto: 'Parte dos algarismos', conta: '10 × 10 × 10 = 1.000' },
          { texto: 'As duas partes juntas', conta: '676 × 1.000 = 676.000' },
        ],
        resposta: '676.000 senhas',
      },
    ],
    erro_comum: {
      errado: 'Duplas entre 5 pessoas: 5 × 4 = 20',
      explicacao: 'Contar a ordem quando ela não importa. Ana e Beto é a mesma dupla que Beto e Ana: 20 ÷ 2 = 10 duplas.',
    },
    desafio: {
      pergunta: 'De quantas formas 4 amigos podem se sentar em 4 cadeiras enfileiradas?',
      resposta: '24',
      explicacao: '4 opções para a 1ª cadeira, 3 para a 2ª, 2 para a 3ª e 1 para a última: 4 × 3 × 2 × 1 = 24.',
    },
    juntos: {
      com: 'progressao-geometrica',
      texto: 'Senhas de 1, 2, 3… algarismos: 10, 100, 1.000… É a PG do episódio 11 com razão 10.',
    },
    pista: 'Qual a chance de acertar?',
    gerador: 'principioDaContagem',
    pre_requisitos: [],
  },

  probabilidade: {
    bloco: 4,
    titulo: 'Probabilidade',
    resumo: 'Casos favoráveis sobre casos possíveis, evento complementar e eventos independentes.',
    gancho: 'Dois dados. Qual soma sai mais: 7 ou 12?',
    conceito: 'Quando todos os resultados são igualmente prováveis, a probabilidade de um evento é **casos favoráveis ÷ casos possíveis**, um número entre 0 e 1.',
    fatos: [
      'P(A) = favoráveis ÷ possíveis, com 0 ≤ P(A) ≤ 1',
      'P(não A) = 1 − P(A)',
      'Eventos independentes, um e depois o outro: multiplique as probabilidades',
      'Eventos que não acontecem juntos, um ou o outro: some as probabilidades',
      'Probabilidade pode ser escrita como fração, decimal ou porcentagem',
    ],
    exemplos: [
      {
        enunciado: 'Lançando dois dados comuns, qual a probabilidade de a soma ser 7?',
        passos: [
          { texto: 'Casos possíveis', conta: '6 × 6 = 36' },
          { texto: 'Casos favoráveis: (1,6), (2,5), (3,4), (4,3), (5,2) e (6,1), seis pares', conta: null },
          { texto: 'Probabilidade', conta: '6 ÷ 36 = 1/6' },
        ],
        resposta: '1/6 (cerca de 16,7%)',
      },
    ],
    erro_comum: {
      errado: 'As somas vão de 2 a 12, são 11 resultados, então P(soma 7) = 1/11',
      explicacao: 'Tratar resultados como igualmente prováveis quando não são. Há 6 formas de somar 7 e só 1 de somar 12.',
    },
    desafio: {
      pergunta: 'Uma moeda é lançada 3 vezes. Qual a probabilidade de sair cara nas três?',
      resposta: '1/8',
      explicacao: 'Os lançamentos são independentes: 1/2 × 1/2 × 1/2 = 1/8.',
    },
    juntos: {
      com: 'principio-da-contagem',
      texto: 'Os casos possíveis vêm do princípio da contagem do episódio 14: dois dados dão 6 × 6 = 36 resultados.',
    },
    pista: null,
    gerador: 'probabilidade',
    pre_requisitos: ['principio-da-contagem'],
  },
};

// A ordem dos temas é a ordem dos episódios da temporada.
export const ORDEM_T1 = [
  'porcentagem',
  'aumentos-e-descontos-sucessivos',
  'juros-simples',
  'juros-compostos',
  'razao-e-proporcao',
  'regra-de-tres',
  'escala',
  'funcao-afim',
  'funcao-quadratica',
  'progressao-aritmetica',
  'progressao-geometrica',
  'media-mediana-e-moda',
  'leitura-de-graficos',
  'principio-da-contagem',
  'probabilidade',
];
