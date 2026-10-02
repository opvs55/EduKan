// Bloco 3 · Funções e sequências.

import { arred, expoente, horas, num, reais, vezes } from '../formato.js';
import { tentar } from '../questao.js';

const inteiroPositivo = (v) => Number.isInteger(v) && v > 0;
const positivo = (v) => Number.isFinite(v) && v > 0;

// "−5t² + 20t + 2" (com o sinal de menos tipográfico).
export function polinomio(termos, v = 'x') {
  const partes = [];
  termos.forEach(([coef, grau]) => {
    if (coef === 0) return;
    const abs = Math.abs(coef);
    const corpo = grau === 0 ? num(abs) : `${abs === 1 ? '' : num(abs)}${v}${grau === 2 ? '²' : ''}`;
    if (partes.length === 0) partes.push(coef < 0 ? `−${corpo}` : corpo);
    else partes.push(coef < 0 ? `− ${corpo}` : `+ ${corpo}`);
  });
  return partes.join(' ') || '0';
}

// ── Função afim ─────────────────────────────────────────────────────────

const AFINS = [
  {
    fixos: [4, 4.5, 5, 5.5, 6],
    taxas: [2, 2.5, 3, 3.5],
    xs: [4, 5, 6, 8, 10, 12, 14, 15, 18, 20, 25],
    frase: (b, a) => `Uma corrida de táxi custa ${reais(b)} de bandeirada mais ${reais(a)} por km rodado.`,
    valor: (x) => `Quanto custa uma corrida de ${num(x)} km?`,
    inversa: (f) => `Uma corrida custou ${reais(f)}. Quantos km foram rodados?`,
    fmtX: (v) => `${num(v, 2)} km`,
    fixo: 'a bandeirada',
  },
  {
    fixos: [50, 60, 80, 100],
    taxas: [40, 45, 50, 60, 70],
    xs: [2, 3, 4, 5, 6, 8],
    frase: (b, a) => `Um encanador cobra ${reais(b)} pela visita mais ${reais(a)} por hora de trabalho.`,
    valor: (x) => `Quanto custa um serviço de ${horas(x)}?`,
    inversa: (f) => `Um serviço custou ${reais(f)}. Quantas horas durou?`,
    fmtX: (v) => horas(arred(v, 2)),
    fixo: 'a visita',
  },
  {
    fixos: [20, 25, 30, 40, 50],
    taxas: [0.5, 0.25, 0.4, 1],
    xs: [10, 20, 30, 40, 50, 60, 80, 100],
    frase: (b, a) => `Um plano de celular custa ${reais(b)} por mês mais ${reais(a)} por minuto além da franquia.`,
    valor: (x) => `Quanto custa uma conta com ${num(x)} minutos extras?`,
    inversa: (f) => `Uma conta veio de ${reais(f)}. Quantos minutos extras foram usados?`,
    fmtX: (v) => `${num(v, 2)} minutos`,
    fixo: 'a mensalidade',
  },
];

export function funcaoAfim(rng) {
  const tipo = rng.pick(['valor', 'inversa', 'taxa', 'proporcao']);

  if (tipo === 'valor' || tipo === 'inversa') {
    const c = rng.pick(AFINS);
    const b = rng.pick(c.fixos);
    const a = rng.pick(c.taxas);
    const x = rng.pick(c.xs);
    const ax = arred(a * x, 2);
    const f = arred(ax + b, 2);
    const lei = `f(x) = ${num(a)}x + ${num(b)}`;
    if (tipo === 'valor') {
      return {
        tipo,
        enunciado: `${c.frase(b, a)} ${c.valor(x)}`,
        resumo: `Calcular ${lei} para x = ${num(x)}`,
        correta: f,
        formatar: reais,
        valido: positivo,
        distratores: [
          { valor: ax, erro: `Faltou somar a parte fixa (${c.fixo}).` },
          { valor: (a + b) * x, erro: `A parte fixa (${c.fixo}) é cobrada uma vez só.` },
          { valor: a + b * x, erro: 'A taxa e a parte fixa trocaram de papel.' },
          { valor: f + a, erro: `Confira o valor de x: são ${num(x)} unidades.` },
        ],
        passos: [
          { texto: `A lei é ${lei}. Parte que varia`, conta: `${num(a)} × ${num(x)} = ${num(ax)}` },
          { texto: 'Somando a parte fixa', conta: `${num(ax)} + ${num(b)} = ${num(f)}` },
        ],
        explicacao: `Com ${lei}: ${num(a)} × ${num(x)} + ${num(b)} = ${num(f)}.`,
      };
    }
    return {
      tipo,
      enunciado: `${c.frase(b, a)} ${c.inversa(f)}`,
      resumo: `Achar x em ${lei} = ${num(f)}`,
      correta: x,
      formatar: c.fmtX,
      valido: positivo,
      distratores: [
        { valor: f / a, erro: `Antes de dividir pela taxa, tire a parte fixa (${c.fixo}).` },
        { valor: (f + b) / a, erro: 'A parte fixa deve ser subtraída, não somada.' },
        { valor: x + 1 },
        { valor: x - 1 },
      ],
      passos: [
        { texto: 'Tire a parte fixa', conta: `${num(f)} − ${num(b)} = ${num(ax)}` },
        { texto: 'Divida pela taxa', conta: `${num(ax)} ÷ ${num(a)} = ${num(x)}` },
      ],
      explicacao: `Tirando a parte fixa, sobram ${num(f)} − ${num(b)} = ${num(ax)}, e ${num(ax)} ÷ ${num(a)} = ${num(x)}.`,
    };
  }

  if (tipo === 'taxa') {
    const r = 5 * rng.int(2, 12);
    const h1 = rng.int(6, 10);
    const dh = rng.int(2, 6);
    const L2 = 10 * rng.int(10, 50);
    const L1 = L2 + r * dh;
    const h2 = h1 + dh;
    return {
      tipo,
      enunciado: `Um reservatório tinha ${num(L1)} litros às ${h1}h e ${num(L2)} litros às ${h2}h, esvaziando em ritmo constante. Quantos litros saem por hora?`,
      resumo: `Taxa de variação entre (${h1}, ${num(L1)}) e (${h2}, ${num(L2)})`,
      correta: r,
      formatar: (v) => `${num(v, 2)} litros por hora`,
      valido: positivo,
      distratores: [
        { valor: L1 - L2, erro: `Essa é a variação total. Divida pelas ${dh} horas.` },
        { valor: arred(L2 / h2, 2), erro: 'A taxa é a variação do volume dividida pela variação do tempo.' },
        { valor: r * 2 },
        { valor: arred((L1 - L2) / h2, 2), erro: `Divida pelo tempo que passou (${dh} horas), não pelo horário.` },
      ],
      passos: [
        { texto: 'Variação do volume', conta: `${num(L1)} − ${num(L2)} = ${num(L1 - L2)}` },
        { texto: 'Variação do tempo', conta: `${h2} − ${h1} = ${dh}` },
        { texto: 'Taxa: variação do volume ÷ variação do tempo', conta: `${num(L1 - L2)} ÷ ${dh} = ${r}` },
      ],
      explicacao: `Em ${dh} horas saíram ${num(L1)} − ${num(L2)} = ${num(L1 - L2)} litros, ou seja, ${num(L1 - L2)} ÷ ${dh} = ${r} por hora.`,
    };
  }

  // proporção × função afim (a pegadinha da parte fixa)
  const b = rng.pick([4, 5, 6]);
  const a = rng.pick([2, 2.5, 3]);
  const x1 = rng.pick([4, 6, 8, 10, 12]);
  const k = rng.pick([2, 3]);
  const f1 = arred(a * x1 + b, 2);
  const x2 = k * x1;
  const ax2 = arred(a * x2, 2);
  const f2 = arred(ax2 + b, 2);
  return {
    tipo,
    enunciado: `Uma corrida de táxi de ${x1} km custou ${reais(f1)}, dos quais ${reais(b)} são de bandeirada e o resto é cobrado por km. Quanto custa uma corrida de ${x2} km?`,
    resumo: `${x1} km por ${reais(f1)}; e ${x2} km?`,
    correta: f2,
    formatar: reais,
    valido: positivo,
    distratores: [
      { valor: k * f1, erro: `Multiplicar por ${k} multiplica também a bandeirada, que é cobrada uma vez só.` },
      { valor: ax2, erro: 'Faltou somar a bandeirada.' },
      { valor: k * f1 - b, erro: `Calcule o preço por km primeiro: (${num(f1)} − ${num(b)}) ÷ ${x1}.` },
      { valor: f2 + a },
    ],
    passos: [
      { texto: 'Preço por km', conta: `(${num(f1)} − ${num(b)}) ÷ ${x1} = ${num(a)}` },
      { texto: `Parte variável de ${x2} km`, conta: `${num(a)} × ${x2} = ${num(ax2)}` },
      { texto: 'Somando a bandeirada', conta: `${num(ax2)} + ${num(b)} = ${num(f2)}` },
    ],
    explicacao: `O km custa (${num(f1)} − ${num(b)}) ÷ ${x1} = ${num(a)}. Para ${x2} km: ${num(a)} × ${x2} + ${num(b)} = ${num(f2)}, e não ${k} × ${num(f1)}.`,
  };
}

// ── Função quadrática ───────────────────────────────────────────────────

export function funcaoQuadratica(rng) {
  const tipo = rng.pick(['altura', 'instante', 'raizes', 'area', 'lucro']);

  if (tipo === 'altura' || tipo === 'instante') {
    const a = rng.pick([1, 2, 4, 5]);
    const tv = rng.int(1, 6);
    const c = rng.pick([0, 0, 1, 2]);
    const b = 2 * a * tv;
    const yv = a * tv * tv + c;
    const lei = `h(t) = ${polinomio([[-a, 2], [b, 1], [c, 0]], 't')}`;
    const base = `A altura de uma bola, em metros, é dada por ${lei}, com t em segundos.`;
    const passos = [
      { texto: 'Instante do vértice: tᵥ = −b/(2a)', conta: `−${b} ÷ (2 × (−${a})) = ${tv}` },
      { texto: `Altura nesse instante: h(${tv})`, conta: `−${a} × ${tv}² + ${b} × ${tv}${c ? ` + ${c}` : ''} = ${yv}` },
    ];
    if (tipo === 'altura') {
      return {
        tipo,
        enunciado: `${base} Qual a altura máxima que a bola atinge?`,
        resumo: `Altura máxima de ${lei}`,
        correta: yv,
        formatar: (v) => `${num(v)} m`,
        valido: positivo,
        distratores: [
          { valor: tv, erro: `${tv} é o instante (tᵥ) em que a altura é máxima, não a altura.` },
          { valor: b, erro: 'Esse é o coeficiente b. Calcule h no instante do vértice.' },
          { valor: a * (tv + 1) * (tv + 1) + c, erro: 'Use o tᵥ = −b/(2a) na conta, não outro valor de t.' },
          { valor: 2 * yv, erro: 'Confira o sinal de a na conta de h(tᵥ).' },
        ],
        passos,
        explicacao: `O máximo acontece em tᵥ = ${tv} s. A altura máxima é h(${tv}) = ${yv} m.`,
      };
    }
    return {
      tipo,
      enunciado: `${base} Em que instante a bola atinge a altura máxima?`,
      resumo: `Instante do vértice de ${lei}`,
      correta: tv,
      formatar: (v) => `${num(v, 2)} s`,
      valido: positivo,
      distratores: [
        { valor: yv, erro: `${yv} é a altura máxima, não o instante.` },
        { valor: c === 0 ? 2 * tv : tv + 2, erro: c === 0 ? 'Esse é o instante em que a bola volta ao chão (a outra raiz).' : null },
        { valor: b / a, erro: 'Faltou o 2 do denominador: tᵥ = −b/(2a).' },
        { valor: tv + 1 },
      ],
      passos: [passos[0]],
      explicacao: `tᵥ = −b/(2a) = −${b} ÷ (2 × (−${a})) = ${tv}.`,
    };
  }

  if (tipo === 'raizes') {
    const r1 = rng.int(1, 6);
    const r2 = rng.int(r1 + 1, 9);
    const s = r1 + r2;
    const p = r1 * r2;
    const lei = `f(x) = ${polinomio([[1, 2], [-s, 1], [p, 0]])}`;
    const par = ([x, y]) => `${num(x)} e ${num(y)}`.replace(/-/g, '−');
    const delta = s * s - 4 * p;
    return {
      tipo,
      enunciado: `Quais são as raízes da função ${lei}?`,
      resumo: `Raízes de ${lei}`,
      correta: [r1, r2],
      formatar: par,
      valido: (v) => Array.isArray(v) && v[0] !== v[1],
      vizinho: (_, k) => [r1, r2 + k],
      distratores: [
        { valor: [-r2, -r1], erro: `Sinal trocado. Se a soma das raízes é −b/a = ${s}, elas são positivas.` },
        { valor: p === s ? [1, p + 1] : [1, p], erro: `O produto confere (${p}), mas a soma precisa ser ${s}.` },
        { valor: [r1, r2 + 1] },
        { valor: [r1 + 1, r2 + 1] },
      ],
      passos: [
        { texto: 'Δ = b² − 4ac', conta: `${s}² − 4 × 1 × ${p} = ${delta}` },
        { texto: 'Raiz maior: (−b + √Δ) ÷ 2a', conta: `(${s} + √${delta}) ÷ 2 = ${r2}` },
        { texto: 'Raiz menor: (−b − √Δ) ÷ 2a', conta: `(${s} − √${delta}) ÷ 2 = ${r1}` },
      ],
      explicacao: `As raízes somam −b/a = ${s} e multiplicam c/a = ${p}: são ${r1} e ${r2}. Confira: ${r1} + ${r2} = ${s} e ${r1} × ${r2} = ${p}.`,
    };
  }

  if (tipo === 'area') {
    const k = rng.int(3, 20);
    const P = 4 * k;
    return {
      tipo,
      enunciado: `Com ${num(P)} m de cerca, qual a maior área retangular que dá para cercar?`,
      resumo: `Maior área com perímetro ${num(P)} m`,
      correta: k * k,
      formatar: (v) => `${num(v)} m²`,
      valido: positivo,
      distratores: [
        { valor: k, erro: 'Esse é o lado do quadrado. A pergunta pede a área.' },
        { valor: (k - 1) * (k + 1), erro: 'Esse retângulo tem área menor: o máximo acontece no vértice, com lados iguais.' },
        { valor: P, erro: 'Esse é o perímetro, não a área.' },
        { valor: 2 * k * k, erro: `Com lados x e ${2 * k} − x, a área é x(${2 * k} − x). O vértice está em x = ${k}.` },
      ],
      passos: [
        { texto: `Lados x e ${2 * k} − x. Área: A(x) = x(${2 * k} − x) = −x² + ${2 * k}x`, conta: null },
        { texto: 'Vértice: xᵥ = −b/(2a)', conta: `−${2 * k} ÷ (2 × (−1)) = ${k}` },
        { texto: `Área máxima: A(${k})`, conta: `${k} × (${2 * k} − ${k}) = ${k * k}` },
      ],
      explicacao: `A área é A(x) = x(${2 * k} − x), uma parábola com máximo em x = ${k}. A área máxima é ${k} × ${k} = ${k * k} m², a de um quadrado.`,
    };
  }

  // lucro máximo
  const v = rng.pick([10, 15, 20, 25, 30, 40]);
  const custo = tentar(rng, (r) => {
    const cst = 25 * r.int(2, 40);
    return cst < v * v ? cst : null;
  });
  const lmax = v * v - custo;
  const lei = `L(x) = ${polinomio([[-1, 2], [2 * v, 1], [-custo, 0]])}`;
  return {
    tipo,
    enunciado: `O lucro mensal de uma pequena fábrica, em milhares de reais, é ${lei}, em que x é a quantidade de produtos vendidos, em centenas. Qual o lucro máximo?`,
    resumo: `Lucro máximo de ${lei}`,
    correta: lmax,
    formatar: (val) => `R$ ${num(val)} mil`,
    valido: positivo,
    distratores: [
      { valor: v, erro: `${v} é o xᵥ, a quantidade que dá o lucro máximo. Calcule L(${v}).` },
      { valor: v * v, erro: `Faltou subtrair o custo fixo de ${num(custo)}.` },
      { valor: v * v + custo, erro: 'Confira o sinal do termo independente.' },
      { valor: 2 * v, erro: 'Esse é o coeficiente b. Calcule L no vértice.' },
    ],
    passos: [
      { texto: 'Vértice: xᵥ = −b/(2a)', conta: `−${2 * v} ÷ (2 × (−1)) = ${v}` },
      { texto: `Lucro máximo: L(${v})`, conta: `−${v}² + ${2 * v} × ${v} − ${custo} = ${lmax}` },
    ],
    explicacao: `O vértice está em x = ${v}, e L(${v}) = ${lmax}, ou seja, R$ ${num(lmax)} mil.`,
  };
}

// ── Progressão aritmética ───────────────────────────────────────────────

const PAS = [
  {
    termo: (a1, r, n) => `A 1ª fileira de um teatro tem ${a1} cadeiras, e cada fileira tem ${r} cadeiras a mais que a anterior. Quantas cadeiras há na ${n}ª fileira?`,
    soma: (a1, r, n) => `A 1ª fileira de um teatro tem ${a1} cadeiras, e cada fileira tem ${r} cadeiras a mais que a anterior. Quantas cadeiras há nas ${n} fileiras juntas?`,
    fmt: (v) => vezes(v, 'cadeira', 'cadeiras'),
  },
  {
    termo: (a1, r, n) => `Uma pessoa guarda R$ ${a1} na 1ª semana e, a cada semana, R$ ${r} a mais que na anterior. Quanto ela guarda na ${n}ª semana?`,
    soma: (a1, r, n) => `Uma pessoa guarda R$ ${a1} na 1ª semana e, a cada semana, R$ ${r} a mais que na anterior. Quanto ela juntou ao fim de ${n} semanas?`,
    fmt: reais,
  },
  {
    termo: (a1, r, n) => `Um atleta treina ${a1} minutos no 1º dia e aumenta ${r} minutos a cada dia. Quantos minutos ele treina no ${n}º dia?`,
    soma: (a1, r, n) => `Um atleta treina ${a1} minutos no 1º dia e aumenta ${r} minutos a cada dia. Quantos minutos ele treina, somando os ${n} primeiros dias?`,
    fmt: (v) => vezes(v, 'minuto', 'minutos'),
  },
];

export function progressaoAritmetica(rng) {
  const tipo = rng.pick(['termo', 'termo', 'soma', 'gauss', 'razao']);

  if (tipo === 'gauss') {
    const n = rng.pick([20, 30, 40, 50, 60, 80, 100, 120, 150, 200]);
    const S = (n * (n + 1)) / 2;
    return {
      tipo,
      enunciado: `Quanto dá a soma 1 + 2 + 3 + … + ${n}?`,
      resumo: `Soma de 1 a ${n}`,
      correta: S,
      formatar: (v) => num(v),
      valido: inteiroPositivo,
      distratores: [
        { valor: n * (n + 1), erro: 'Faltou dividir por 2.' },
        { valor: (n * (n - 1)) / 2, erro: `São ${n} termos, de 1 até ${n}.` },
        { valor: (n * n) / 2, erro: `Use (a₁ + aₙ) × n ÷ 2 = (1 + ${n}) × ${n} ÷ 2.` },
        { valor: n * n, erro: `Use (a₁ + aₙ) × n ÷ 2 = (1 + ${n}) × ${n} ÷ 2.` },
      ],
      passos: [{ texto: `PA com a₁ = 1, aₙ = ${n} e ${n} termos: (a₁ + aₙ) × n ÷ 2`, conta: `(1 + ${n}) × ${n} ÷ 2 = ${S}` }],
      explicacao: `Somando o primeiro com o último, o segundo com o penúltimo, e assim por diante, cada par dá ${n + 1}. São ${n / 2} pares: (1 + ${n}) × ${n} ÷ 2 = ${num(S)}.`,
    };
  }

  if (tipo === 'razao') {
    const a1 = rng.int(2, 30);
    const r = rng.int(2, 12);
    const n = rng.int(6, 20);
    const an = a1 + (n - 1) * r;
    return {
      tipo,
      enunciado: `Numa progressão aritmética, o 1º termo é ${a1} e o ${n}º termo é ${an}. Qual a razão?`,
      resumo: `Razão da PA de ${a1} a ${an} em ${n} termos`,
      correta: r,
      formatar: (v) => num(v, 2),
      valido: positivo,
      distratores: [
        { valor: arred((an - a1) / n, 2), erro: `Do 1º ao ${n}º termo são ${n - 1} saltos, não ${n}.` },
        { valor: an - a1, erro: `Essa é a variação total. Divida pelos ${n - 1} saltos.` },
        { valor: arred(an / n, 2), erro: `Use aₙ = a₁ + (n − 1) × r e isole r.` },
        { valor: r + 1 },
      ],
      passos: [
        { texto: 'Variação total', conta: `${an} − ${a1} = ${an - a1}` },
        { texto: `Número de saltos: ${n} − 1`, conta: `${an - a1} ÷ ${n - 1} = ${r}` },
      ],
      explicacao: `De a₁ até o ${n}º termo são ${n - 1} saltos: (${an} − ${a1}) ÷ ${n - 1} = ${r}.`,
    };
  }

  const c = rng.pick(PAS);
  const { a1, r, n } = tentar(rng, (g) => {
    const a1 = g.int(5, 30);
    const r = g.int(2, 10);
    const n = g.int(8, 30);
    const an = a1 + (n - 1) * r;
    return Number.isInteger(((a1 + an) * n) / 2) ? { a1, r, n } : null;
  });
  const an = a1 + (n - 1) * r;
  const S = ((a1 + an) * n) / 2;

  if (tipo === 'termo') {
    return {
      tipo,
      enunciado: c.termo(a1, r, n),
      resumo: `Termo ${n} da PA com a₁ = ${a1} e r = ${r}`,
      correta: an,
      formatar: c.fmt,
      valido: inteiroPositivo,
      distratores: [
        { valor: a1 + n * r, erro: `Do 1º ao ${n}º termo são ${n - 1} saltos: aₙ = a₁ + (n − 1) × r.` },
        { valor: n * r, erro: 'Faltou o primeiro termo.' },
        { valor: S, erro: 'Essa é a soma de todos os termos, não o último.' },
        { valor: a1 + (n - 2) * r, erro: `Do 1º ao ${n}º termo são ${n - 1} saltos.` },
      ],
      passos: [{ texto: `aₙ = a₁ + (n − 1) × r`, conta: `${a1} + ${n - 1} × ${r} = ${an}` }],
      explicacao: `São ${n - 1} saltos de ${r} a partir de ${a1}: ${a1} + ${n - 1} × ${r} = ${an}.`,
    };
  }

  return {
    tipo,
    enunciado: c.soma(a1, r, n),
    resumo: `Soma de ${n} termos da PA com a₁ = ${a1} e r = ${r}`,
    correta: S,
    formatar: c.fmt,
    valido: inteiroPositivo,
    distratores: [
      { valor: (a1 + an) * n, erro: 'Faltou dividir por 2.' },
      { valor: an, erro: 'Esse é só o último termo. A pergunta pede a soma.' },
      { valor: ((a1 + a1 + n * r) * n) / 2, erro: `O último termo é a₁ + (n − 1) × r = ${an}.` },
      { valor: n * a1, erro: 'Os termos crescem; não são todos iguais ao primeiro.' },
    ],
    passos: [
      { texto: 'Último termo', conta: `${a1} + ${n - 1} × ${r} = ${an}` },
      { texto: 'Soma: (a₁ + aₙ) × n ÷ 2', conta: `(${a1} + ${an}) × ${n} ÷ 2 = ${S}` },
    ],
    explicacao: `O último termo é ${a1} + ${n - 1} × ${r} = ${an}, e a soma é (${a1} + ${an}) × ${n} ÷ 2 = ${num(S)}.`,
  };
}

// ── Progressão geométrica ───────────────────────────────────────────────

export function progressaoGeometrica(rng) {
  const tipo = rng.pick(['termo', 'soma', 'dobra', 'razao']);

  if (tipo === 'dobra') {
    const p = rng.pick([10, 15, 20, 30]);
    const T = rng.int(1, 3);
    const k = (T * 60) / p;
    const N0 = rng.pick([1, 2, 5, 10, 100]);
    if (k > 12) return progressaoGeometrica(rng);
    const N = N0 * 2 ** k;
    return {
      tipo,
      enunciado: `Uma colônia começa com ${vezes(N0, 'bactéria', 'bactérias')}, e cada bactéria se divide em 2 a cada ${p} minutos. Quantas bactérias existem depois de ${horas(T)}?`,
      resumo: `${N0} bactéria(s) dobrando a cada ${p} min por ${horas(T)}`,
      correta: N,
      formatar: (v) => num(v),
      valido: inteiroPositivo,
      distratores: [
        { valor: N0 * 2 * k, erro: 'Dobrar repetidamente é multiplicar por 2 a cada vez, não somar.' },
        { valor: N0 * 2 ** (k - 1), erro: `Em ${T * 60} minutos há ${k} divisões.` },
        { valor: N0 * 2 ** (k + 1), erro: `Em ${T * 60} minutos há ${k} divisões.` },
        { valor: N0 * k * k },
      ],
      passos: [
        { texto: 'Número de divisões', conta: `${T * 60} ÷ ${p} = ${k}` },
        { texto: 'Cada divisão multiplica por 2', conta: `${N0} × 2${expoente(k)} = ${N}` },
      ],
      explicacao: `Em ${T * 60} minutos há ${k} divisões, então ${num(N0)} × 2${expoente(k)} = ${num(N)}.`,
    };
  }

  if (tipo === 'razao') {
    const a1 = rng.pick([1, 2, 3, 4, 5]);
    const q = rng.pick([2, 3, 4, 5]);
    const n = rng.pick([3, 4]);
    const an = a1 * q ** (n - 1);
    const salto = n - 1;
    return {
      tipo,
      enunciado: `Numa progressão geométrica de termos positivos, o 1º termo é ${a1} e o ${n}º termo é ${num(an)}. Qual a razão?`,
      resumo: `Razão da PG de ${a1} a ${num(an)} em ${n} termos`,
      correta: q,
      formatar: (v) => num(v, 2),
      valido: positivo,
      distratores: [
        { valor: arred((an - a1) / salto, 2), erro: 'Isso seria a razão de uma PA. Na PG, cada termo é o anterior vezes q.' },
        { valor: an / a1, erro: `Esse é q${expoente(salto)}. Tire a raiz de índice ${salto}.` },
        { valor: q + 1 },
        { valor: q * q },
      ],
      passos: [
        { texto: `a${n === 3 ? '₃' : '₄'} = a₁ × q${expoente(salto)}, então q${expoente(salto)} = a${n === 3 ? '₃' : '₄'} ÷ a₁`, conta: `${num(an)} ÷ ${a1} = ${an / a1}` },
        { texto: `Qual número elevado a ${salto} dá ${an / a1}?`, conta: `${q}${expoente(salto)} = ${an / a1}` },
      ],
      explicacao: `q${expoente(salto)} = ${num(an)} ÷ ${a1} = ${an / a1}, e ${q}${expoente(salto)} = ${an / a1}. A razão é ${q}.`,
    };
  }

  const { a1, q, n } = tentar(rng, (g) => {
    const a1 = g.pick([1, 2, 3, 4, 5]);
    const q = g.pick([2, 2, 3, 3, 4]);
    const n = g.int(4, 8);
    return a1 * q ** n <= 200000 ? { a1, q, n } : null;
  });
  const an = a1 * q ** (n - 1);
  const S = (a1 * (q ** n - 1)) / (q - 1);
  const contexto = `Na 1ª hora, ${a1} ${a1 === 1 ? 'pessoa recebe' : 'pessoas recebem'} uma mensagem. A cada hora, quem recebeu na hora anterior repassa para ${q} pessoas novas.`;

  if (tipo === 'termo') {
    return {
      tipo,
      enunciado: `${contexto} Quantas pessoas recebem a mensagem na ${n}ª hora?`,
      resumo: `Termo ${n} da PG com a₁ = ${a1} e q = ${q}`,
      correta: an,
      formatar: (v) => vezes(v, 'pessoa', 'pessoas'),
      valido: inteiroPositivo,
      distratores: [
        { valor: a1 * q ** n, erro: `Do 1º ao ${n}º termo são ${n - 1} multiplicações: aₙ = a₁ × qⁿ⁻¹.` },
        { valor: a1 + (n - 1) * q, erro: 'Isso é uma PA, que soma a razão. Na PG, cada termo é multiplicado por q.' },
        { valor: S, erro: 'Essa é a soma de todas as horas, não só a última.' },
        { valor: a1 * q ** (n - 2), erro: `Do 1º ao ${n}º termo são ${n - 1} multiplicações.` },
      ],
      passos: [{ texto: `aₙ = a₁ × qⁿ⁻¹`, conta: `${a1} × ${q}${expoente(n - 1)} = ${an}` }],
      explicacao: `São ${n - 1} multiplicações por ${q}: ${a1} × ${q}${expoente(n - 1)} = ${num(an)}.`,
    };
  }

  return {
    tipo,
    enunciado: `${contexto} Quantas pessoas receberam a mensagem ao todo, nas ${n} primeiras horas?`,
    resumo: `Soma de ${n} termos da PG com a₁ = ${a1} e q = ${q}`,
    correta: S,
    formatar: (v) => vezes(v, 'pessoa', 'pessoas'),
    valido: inteiroPositivo,
    distratores: [
      { valor: an, erro: 'Esse é só o último termo. A pergunta pede o total.' },
      { valor: a1 * q ** n, erro: 'Use Sₙ = a₁ × (qⁿ − 1) ÷ (q − 1).' },
      { valor: S - a1, erro: 'Faltou contar quem recebeu na 1ª hora.' },
      { valor: ((a1 + an) * n) / 2, erro: 'Essa é a fórmula da soma da PA.' },
    ],
    passos: [{ texto: 'Sₙ = a₁ × (qⁿ − 1) ÷ (q − 1)', conta: `${a1} × (${q}${expoente(n)} − 1) ÷ (${q} − 1) = ${S}` }],
    explicacao: `Sₙ = ${a1} × (${q}${expoente(n)} − 1) ÷ (${q} − 1) = ${num(S)}.`,
  };
}
