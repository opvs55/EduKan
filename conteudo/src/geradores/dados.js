// Bloco 4 · Dados e chance.

import { arred, expoente, fracao, lista, num, pct, simplificar } from '../formato.js';
import { tentar } from '../questao.js';

const inteiroPositivo = (v) => Number.isInteger(v) && v > 0;
const positivo = (v) => Number.isFinite(v) && v > 0;
const soma = (xs) => xs.reduce((a, b) => a + b, 0);
const ordenar = (xs) => [...xs].sort((a, b) => a - b);

const NOMES = ['Júlia', 'Pedro', 'Ana', 'Rafael', 'Bia', 'Caio', 'Lara', 'Davi'];

function mediana(xs) {
  const o = ordenar(xs);
  const m = Math.floor(o.length / 2);
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
}

// ── Média, mediana e moda ───────────────────────────────────────────────

export function mediaMedianaModa(rng) {
  const tipo = rng.pick(['media', 'mediana', 'mediana', 'moda', 'ponderada']);

  if (tipo === 'media') {
    const nome = rng.pick(NOMES);
    const n = rng.int(4, 6);
    const notas = tentar(rng, (r) => {
      const xs = Array.from({ length: n }, () => r.int(3, 10));
      return soma(xs) % n === 0 && new Set(xs).size > 2 ? xs : null;
    });
    const m = soma(notas) / n;
    const max = Math.max(...notas);
    const min = Math.min(...notas);
    return {
      tipo,
      enunciado: `As notas de ${nome} em ${n} provas foram ${lista(notas.map(String))}. Qual a média aritmética?`,
      resumo: `Média de ${lista(notas.map(String))}`,
      correta: m,
      formatar: (v) => num(v, 2),
      valido: positivo,
      distratores: [
        { valor: soma(notas), erro: `Essa é a soma. Divida pela quantidade de notas (${n}).` },
        { valor: arred(soma(notas) / (n - 1), 2), erro: `São ${n} notas: divida por ${n}.` },
        { valor: (max + min) / 2, erro: 'A média usa todas as notas, não só a maior e a menor.' },
        { valor: mediana(notas), erro: 'Essa é a mediana (o valor do meio em ordem), não a média.' },
      ],
      passos: [{ texto: 'Some as notas e divida pela quantidade', conta: `(${notas.join(' + ')}) ÷ ${n} = ${num(m)}` }],
      explicacao: `A soma é ${soma(notas)}, e ${soma(notas)} ÷ ${n} = ${num(m)}.`,
    };
  }

  if (tipo === 'mediana') {
    const par = rng.proximo() < 0.35;
    const n = par ? 6 : rng.pick([5, 7]);
    const xs = tentar(rng, (r) => {
      const v = Array.from({ length: n }, () => r.int(12, 40));
      const o = ordenar(v);
      const meio = Math.floor(n / 2);
      if (new Set(v).size !== n) return null;
      if (par && (o[meio - 1] + o[meio]) % 2 !== 0) return null;
      // o valor do meio "sem ordenar" precisa ser diferente da mediana
      if (!par && v[meio] === o[meio]) return null;
      return v;
    });
    const o = ordenar(xs);
    const med = mediana(xs);
    const meio = Math.floor(n / 2);
    const contexto = rng.pick([
      ['As temperaturas máximas de uma semana, em °C, foram', '°C'],
      ['As idades dos jogadores de um time de futsal são', ' anos'],
      ['Os tempos, em minutos, que um ônibus levou para chegar ao ponto foram', ' min'],
    ]);
    const enunciadoN = par && contexto[1] === '°C' ? ['As temperaturas máximas de seis dias, em °C, foram', '°C'] : contexto;
    const fmt = (v) => `${num(v, 1)}${enunciadoN[1]}`;
    return {
      tipo,
      enunciado: `${enunciadoN[0]} ${lista(xs.map(String))}. Qual a mediana?`,
      resumo: `Mediana de ${n} valores`,
      correta: med,
      formatar: fmt,
      valido: positivo,
      distratores: [
        { valor: par ? (xs[meio - 1] + xs[meio]) / 2 : xs[meio], erro: 'Ordene os valores antes de pegar o do meio.' },
        { valor: arred(soma(xs) / n, 1), erro: 'Essa é a média. A mediana é o valor do meio, com os dados em ordem.' },
        { valor: o[n - 1], erro: 'Esse é o maior valor.' },
        { valor: o[0], erro: 'Esse é o menor valor.' },
        { valor: par ? o[meio] : o[meio + 1] },
      ],
      passos: par
        ? [
            { texto: `Em ordem: ${o.join(', ')}. Com 6 valores, a mediana é a média dos dois centrais`, conta: null },
            { texto: 'Média dos centrais', conta: `(${o[meio - 1]} + ${o[meio]}) ÷ 2 = ${num(med, 1)}` },
          ]
        : [{ texto: `Em ordem: ${o.join(', ')}. O valor do meio é o ${meio + 1}º: ${o[meio]}`, conta: null }],
      explicacao: par
        ? `Em ordem, os dois valores centrais são ${o[meio - 1]} e ${o[meio]}, e (${o[meio - 1]} + ${o[meio]}) ÷ 2 = ${num(med, 1)}.`
        : `Em ordem (${o.join(', ')}), o valor do meio é ${o[meio]}.`,
    };
  }

  if (tipo === 'moda') {
    const valores = tentar(rng, (r) => {
      const moda = r.int(35, 42);
      const outros = Array.from({ length: r.int(4, 6) }, () => r.int(34, 43));
      const xs = [moda, moda, moda, ...outros];
      const cont = {};
      xs.forEach((x) => (cont[x] = (cont[x] || 0) + 1));
      const max = Math.max(...Object.values(cont));
      const modas = Object.keys(cont).filter((k) => cont[k] === max);
      return modas.length === 1 && Number(modas[0]) === moda && max === 3 ? r.embaralhar(xs) : null;
    });
    const cont = {};
    valores.forEach((x) => (cont[x] = (cont[x] || 0) + 1));
    const moda = Number(Object.keys(cont).find((k) => cont[k] === 3));
    const segunda = Number(Object.keys(cont).find((k) => cont[k] === 2) ?? Math.max(...valores));
    return {
      tipo,
      enunciado: `Os números de calçado de ${valores.length} alunos de uma turma são ${lista(valores.map(String))}. Qual a moda?`,
      resumo: `Moda de ${valores.length} números de calçado`,
      correta: moda,
      formatar: (v) => num(v, 1),
      valido: positivo,
      distratores: [
        { valor: 3, erro: 'Esse é quantas vezes a moda aparece. A moda é o valor que mais se repete.' },
        { valor: mediana(valores), erro: 'Essa é a mediana. A moda é o valor que mais se repete.' },
        { valor: Math.max(...valores), erro: 'Esse é o maior valor. A moda é o que mais se repete.' },
        { valor: segunda, erro: `O ${segunda} se repete, mas o ${moda} aparece mais vezes.` },
      ],
      passos: [{ texto: `O ${moda} aparece 3 vezes; nenhum outro número aparece tantas vezes`, conta: null }],
      explicacao: `O ${moda} aparece 3 vezes, mais do que qualquer outro número.`,
    };
  }

  // média ponderada
  const { notas, pesos } = tentar(rng, (r) => {
    const notas = [r.int(4, 10), r.int(4, 10), r.int(4, 10)];
    const pesos = [r.int(1, 4), r.int(1, 4), r.int(1, 4)];
    const res = soma(notas.map((x, i) => x * pesos[i])) / soma(pesos);
    return Number.isInteger(res * 10) && new Set(pesos).size > 1 && arred(soma(notas) / 3, 1) !== res ? { notas, pesos } : null;
  });
  const prod = notas.map((x, i) => x * pesos[i]);
  const sp = soma(pesos);
  const res = soma(prod) / sp;
  const nome = rng.pick(NOMES);
  return {
    tipo,
    enunciado: `${nome} tirou ${notas[0]}, ${notas[1]} e ${notas[2]} em três provas com pesos ${pesos[0]}, ${pesos[1]} e ${pesos[2]}, respectivamente. Qual a média ponderada?`,
    resumo: `Média ponderada de ${notas.join(', ')} com pesos ${pesos.join(', ')}`,
    correta: res,
    formatar: (v) => num(v, 2),
    valido: positivo,
    distratores: [
      { valor: arred(soma(notas) / 3, 2), erro: 'Essa é a média simples, que ignora os pesos.' },
      { valor: soma(prod), erro: `Faltou dividir pela soma dos pesos (${sp}).` },
      { valor: arred(soma(prod) / 3, 2), erro: `Divida pela soma dos pesos (${sp}), não pela quantidade de notas.` },
      { valor: res + 0.5 },
    ],
    passos: [
      { texto: 'Soma de nota × peso', conta: `${notas[0]} × ${pesos[0]} + ${notas[1]} × ${pesos[1]} + ${notas[2]} × ${pesos[2]} = ${soma(prod)}` },
      { texto: 'Divida pela soma dos pesos', conta: `${soma(prod)} ÷ ${sp} = ${num(res)}` },
    ],
    explicacao: `(${notas[0]} × ${pesos[0]} + ${notas[1]} × ${pesos[1]} + ${notas[2]} × ${pesos[2]}) ÷ ${sp} = ${num(res)}.`,
  };
}

// ── Leitura de gráficos ─────────────────────────────────────────────────

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho'];
const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun'];

const variacaoTexto = (v) => (v > 0 ? `aumento de ${pct(v, 1)}` : v < 0 ? `queda de ${pct(-v, 1)}` : 'sem variação');

export function leituraDeGraficos(rng) {
  const tipo = rng.pick(['variacao', 'variacao', 'eixo', 'setor-angulo', 'setor-pct', 'media']);

  if (tipo === 'variacao') {
    const { vi, p, vj } = tentar(rng, (r) => {
      const vi = r.pick([100, 120, 150, 200, 240, 250, 300, 400, 500]);
      const p = 5 * r.int(-10, 16);
      const vj = (vi * (100 + p)) / 100;
      return p !== 0 && Number.isInteger(vj) && vj % 10 === 0 ? { vi, p, vj } : null;
    });
    const i = rng.int(0, 2);
    const j = rng.int(i + 2, 5);
    const valores = MESES.map((_, k) => {
      if (k === i) return vi;
      if (k === j) return vj;
      const base = Math.min(vi, vj) + rng.proximo() * Math.abs(vj - vi);
      return Math.max(10, Math.round((base * (0.85 + rng.proximo() * 0.3)) / 10) * 10);
    });
    const d = vj - vi;
    const q = d / vi;
    return {
      tipo,
      enunciado: `O gráfico mostra as vendas mensais de uma loja, em unidades. Qual foi a variação percentual das vendas de ${MESES[i]} para ${MESES[j]}?`,
      resumo: `Variação de ${MESES[i]} para ${MESES[j]}`,
      grafico: { tipo: 'barras', titulo: 'Vendas por mês (unidades)', rotulos: MESES_CURTOS, valores, eixoMin: 0 },
      correta: p,
      formatar: variacaoTexto,
      valido: (v) => Number.isFinite(v) && v !== 0,
      distratores: [
        { valor: d, erro: `A diferença de ${num(Math.abs(d))} unidades não é a variação percentual. Divida pelo valor de ${MESES[i]}.` },
        { valor: arred((d / vj) * 100, 1), erro: `A variação é calculada sobre o valor inicial (${MESES[i]}), não sobre o final.` },
        { valor: -p, erro: `Confira o sentido: as vendas ${p > 0 ? 'subiram' : 'caíram'}.` },
        { valor: arred((vj / vi) * 100, 1), erro: 'Esse é o valor final em relação ao inicial. A variação é o que passa de 100% (ou falta).' },
      ],
      passos: [
        { texto: `Leia as barras: ${MESES[i]} = ${vi} e ${MESES[j]} = ${vj}. Diferença`, conta: `${vj} − ${vi} = ${num(d)}` },
        { texto: 'Em relação ao valor inicial', conta: `${num(d)} ÷ ${vi} = ${num(q, 4)}` },
        { texto: 'Em porcentagem', conta: `${num(q, 4)} × 100 = ${num(p)}` },
      ],
      explicacao: `De ${vi} para ${vj}, a diferença é ${num(d)} unidades. Em relação a ${vi}: ${num(d)} ÷ ${vi} = ${num(q, 4)}, ${variacaoTexto(p)}.`,
    };
  }

  if (tipo === 'eixo') {
    const [m, dd] = rng.pick([
      [80, 20],
      [60, 20],
      [100, 25],
      [150, 50],
      [300, 100],
      [40, 10],
      [200, 50],
    ]);
    const A = m + dd;
    const B = m + 2 * dd;
    const p = (dd / A) * 100;
    return {
      tipo,
      enunciado: `No gráfico, o eixo vertical começa em ${m}, e a barra da loja B parece ter o dobro da altura da barra da loja A. Quanto, em porcentagem, a loja B vendeu a mais que a loja A?`,
      resumo: `Eixo que começa em ${m}`,
      grafico: { tipo: 'barras', titulo: 'Vendas no mês (unidades)', rotulos: ['Loja A', 'Loja B'], valores: [A, B], eixoMin: m },
      correta: p,
      formatar: (v) => pct(v, 1),
      valido: positivo,
      distratores: [
        { valor: 100, erro: `A barra parece o dobro porque o eixo começa em ${m}, não em zero. Compare os valores: ${A} e ${B}.` },
        { valor: dd, erro: `${dd} é a diferença em unidades. Divida pelo valor da loja A (${A}).` },
        { valor: arred((dd / B) * 100, 1), erro: `Compare com o valor da loja A (${A}), que é a referência.` },
        { valor: 50, erro: `Compare os valores (${A} e ${B}), não as alturas das barras.` },
      ],
      passos: [
        { texto: `Valores lidos no eixo: A = ${A} e B = ${B}. Diferença`, conta: `${B} − ${A} = ${dd}` },
        { texto: 'Em relação a A', conta: `${dd} ÷ ${A} × 100 = ${num(p, 1)}` },
      ],
      explicacao: `A loja A vendeu ${A} e a B, ${B}. A diferença de ${dd} sobre ${A} dá ${dd} ÷ ${A} × 100 = ${num(p, 1)}%, não 100%.`,
    };
  }

  if (tipo === 'setor-angulo') {
    const p = 5 * rng.int(1, 15);
    const ang = arred(p * 3.6, 2);
    const resto = 100 - p;
    const a = 5 * rng.int(1, Math.max(1, Math.floor(resto / 10)));
    const b = resto - a;
    return {
      tipo,
      enunciado: `Num gráfico de setores sobre como os alunos de uma escola chegam às aulas, a fatia "bicicleta" representa ${p}% do total. Qual o ângulo dessa fatia?`,
      resumo: `Ângulo de uma fatia de ${p}%`,
      grafico: { tipo: 'setores', titulo: 'Como os alunos chegam à escola', rotulos: ['Bicicleta', 'Ônibus', 'A pé'], valores: [p, b, a] },
      correta: ang,
      formatar: (v) => `${num(v, 1)}°`,
      valido: (v) => v > 0 && v < 360,
      distratores: [
        { valor: p, erro: 'Graus e porcentagem não são a mesma coisa: cada 1% vale 3,6°.' },
        { valor: arred(360 - ang, 2), erro: 'Esse é o ângulo do resto do gráfico.' },
        { valor: arred(p * 1.8, 2), erro: 'O círculo todo tem 360°, não 180°.' },
        { valor: arred(ang / 2, 2), erro: 'Cada 1% vale 3,6°.' },
      ],
      passos: [{ texto: 'Cada 1% vale 360 ÷ 100 = 3,6°', conta: `${p} × 3,6 = ${num(ang, 1)}` }],
      explicacao: `O círculo tem 360°, então cada 1% vale 3,6°: ${p} × 3,6 = ${num(ang, 1)}°.`,
    };
  }

  if (tipo === 'setor-pct') {
    const ang = 18 * rng.int(1, 15);
    const p = ang / 3.6;
    return {
      tipo,
      enunciado: `Num gráfico de setores sobre os gastos de uma família, a fatia "alimentação" tem ${ang}°. Que porcentagem dos gastos ela representa?`,
      resumo: `Porcentagem de uma fatia de ${ang}°`,
      correta: arred(p, 4),
      formatar: (v) => pct(v, 2),
      valido: (v) => v > 0 && v < 100,
      distratores: [
        { valor: ang <= 99 ? ang : null, erro: 'Graus não são porcentagem: divida por 3,6.' },
        { valor: arred(ang / 360, 4), erro: 'Faltou multiplicar por 100.' },
        { valor: arred(100 - p, 4), erro: 'Essa é a porcentagem do resto do gráfico.' },
        { valor: arred(ang / 1.8, 4), erro: 'O círculo todo tem 360°, não 180°.' },
        { valor: arred(p + 5, 4) },
      ],
      passos: [{ texto: 'Cada 1% vale 3,6°', conta: `${ang} ÷ 3,6 = ${num(p, 2)}` }],
      explicacao: `Como 360° são 100%, cada 1% vale 3,6°: ${ang} ÷ 3,6 = ${num(p, 2)}%.`,
    };
  }

  // média lida no gráfico
  const valores = tentar(rng, (r) => {
    const xs = Array.from({ length: 5 }, () => 10 * r.int(8, 30));
    return soma(xs) % 5 === 0 && (soma(xs) / 5) % 10 === 0 ? xs : null;
  });
  const media = soma(valores) / 5;
  const dias = ['seg', 'ter', 'qua', 'qui', 'sex'];
  return {
    tipo,
    enunciado: 'O gráfico mostra quantos pães uma padaria vendeu em cada dia útil da semana. Qual foi a média diária de vendas?',
    resumo: 'Média lida num gráfico de barras',
    grafico: { tipo: 'barras', titulo: 'Pães vendidos por dia', rotulos: dias, valores, eixoMin: 0 },
    correta: media,
    formatar: (v) => `${num(v, 1)} pães`,
    valido: positivo,
    distratores: [
      { valor: soma(valores), erro: 'Essa é a soma da semana. Divida pelos 5 dias.' },
      { valor: mediana(valores), erro: 'Essa é a mediana. A média é a soma dividida pela quantidade.' },
      { valor: (Math.max(...valores) + Math.min(...valores)) / 2, erro: 'A média usa todos os dias, não só o maior e o menor.' },
      { valor: media + 10 },
    ],
    passos: [
      { texto: `Leia as barras: ${lista(valores.map(String))}`, conta: null },
      { texto: 'Some e divida por 5', conta: `(${valores.join(' + ')}) ÷ 5 = ${media}` },
    ],
    explicacao: `A soma é ${soma(valores)}, e ${soma(valores)} ÷ 5 = ${media} pães por dia.`,
  };
}

// ── Princípio da contagem ───────────────────────────────────────────────

const PALAVRAS = ['AMOR', 'LIVRO', 'PRATO', 'CINEMA', 'BRASIL', 'ESCOLA', 'FUTEBOL'];

function fat(n) {
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

function expandir(n, k = n) {
  return Array.from({ length: k }, (_, i) => n - i).join(' × ');
}

export function principioDaContagem(rng) {
  const tipo = rng.pick(['multiplicativo', 'senha', 'permutacao', 'combinacao', 'ou']);
  const fmt = (v) => num(v);

  if (tipo === 'multiplicativo') {
    const p = rng.int(2, 5);
    const r = rng.int(3, 6);
    const b = rng.int(2, 4);
    const total = p * r * b;
    return {
      tipo,
      enunciado: `Uma lanchonete oferece ${p} tipos de pão, ${r} recheios e ${b} bebidas. De quantas formas dá para montar um combo com 1 pão, 1 recheio e 1 bebida?`,
      resumo: `${p} pães, ${r} recheios e ${b} bebidas`,
      correta: total,
      formatar: fmt,
      valido: inteiroPositivo,
      distratores: [
        { valor: p + r + b, erro: 'As escolhas acontecem juntas (um pão e um recheio e uma bebida): multiplique.' },
        { valor: p * r, erro: 'Faltou a escolha da bebida.' },
        { valor: (p + r) * b, erro: 'Pão e recheio também se combinam: multiplique os três.' },
        { valor: total * 2 },
      ],
      passos: [{ texto: 'Multiplique as opções de cada etapa', conta: `${p} × ${r} × ${b} = ${total}` }],
      explicacao: `Cada pão combina com cada recheio e cada bebida: ${p} × ${r} × ${b} = ${total}.`,
    };
  }

  if (tipo === 'senha') {
    const k = rng.int(3, 5);
    const rep = rng.proximo() < 0.5;
    const com = 10 ** k;
    const sem = fat(10) / fat(10 - k);
    return {
      tipo,
      enunciado: `Uma senha tem ${k} algarismos (de 0 a 9)${rep ? ', que podem se repetir' : ', todos diferentes entre si'}. Quantas senhas são possíveis?`,
      resumo: `Senhas de ${k} algarismos ${rep ? 'com' : 'sem'} repetição`,
      correta: rep ? com : sem,
      formatar: fmt,
      valido: inteiroPositivo,
      distratores: [
        { valor: rep ? sem : com, erro: rep ? 'Os algarismos podem se repetir: são 10 opções em cada posição.' : 'Os algarismos não se repetem: as opções diminuem a cada posição.' },
        { valor: 10 * k, erro: 'As posições se combinam: multiplique as opções de cada uma.' },
        { valor: 9 ** k, erro: 'De 0 a 9 são 10 algarismos.' },
        { valor: rep ? 10 ** (k - 1) : sem / k },
      ],
      passos: rep
        ? [{ texto: `10 opções em cada uma das ${k} posições`, conta: `${Array(k).fill(10).join(' × ')} = ${num(com)}` }]
        : [{ texto: 'Sem repetir, as opções diminuem a cada posição', conta: `${expandir(10, k)} = ${num(sem)}` }],
      explicacao: rep
        ? `São 10 opções em cada posição: 10${expoente(k)} = ${num(com)}.`
        : `As opções diminuem a cada posição: ${expandir(10, k)} = ${num(sem)}.`,
    };
  }

  if (tipo === 'permutacao') {
    const palavra = rng.proximo() < 0.6;
    const W = rng.pick(PALAVRAS);
    const n = palavra ? W.length : rng.int(3, 7);
    const total = fat(n);
    return {
      tipo,
      enunciado: palavra
        ? `Quantos anagramas tem a palavra ${W}? (Anagrama é qualquer ordem das letras, com ou sem sentido.)`
        : `De quantas formas diferentes ${n} pessoas podem formar uma fila?`,
      resumo: palavra ? `Anagramas de ${W}` : `Filas com ${n} pessoas`,
      correta: total,
      formatar: fmt,
      valido: inteiroPositivo,
      distratores: [
        { valor: n * n, erro: `As opções diminuem a cada posição: ${n}, depois ${n - 1}, e assim por diante.` },
        { valor: n * (n - 1), erro: 'Continue multiplicando até chegar a 1.' },
        { valor: fat(n - 1), erro: `Comece por ${n}: são ${n} opções para a 1ª posição.` },
        { valor: 2 ** n },
      ],
      passos: [{ texto: `Permutação de ${n} elementos distintos: ${n}!`, conta: `${n}! = ${expandir(n)} = ${num(total)}` }],
      explicacao: `São ${n} opções para a 1ª posição, ${n - 1} para a 2ª, e assim por diante: ${expandir(n)} = ${num(total)}.`,
    };
  }

  if (tipo === 'combinacao') {
    const k = rng.pick([2, 2, 3]);
    const n = rng.int(k + 3, k === 2 ? 12 : 9);
    const arranjo = fat(n) / fat(n - k);
    const c = arranjo / fat(k);
    const aperto = k === 2 && rng.proximo() < 0.5;
    return {
      tipo,
      enunciado: aperto
        ? `Numa reunião com ${n} pessoas, cada uma cumprimenta todas as outras com um aperto de mão, uma única vez. Quantos apertos de mão acontecem?`
        : `Num grupo de ${n} pessoas, quantas ${k === 2 ? 'duplas' : 'comissões de 3 pessoas'} diferentes podem ser formadas?`,
      resumo: aperto ? `Apertos de mão entre ${n} pessoas` : `${k === 2 ? 'Duplas' : 'Trios'} entre ${n} pessoas`,
      correta: c,
      formatar: fmt,
      valido: inteiroPositivo,
      distratores: [
        { valor: arranjo, erro: `A ordem não importa: divida pelas ${fat(k)} formas de ordenar cada ${k === 2 ? 'par' : 'trio'}.` },
        { valor: n * k, erro: 'Use a combinação: escolha sem ordem.' },
        { valor: n, erro: 'Use a combinação: escolha sem ordem.' },
        { valor: c + n },
      ],
      passos: [
        { texto: 'Contando com ordem', conta: `${expandir(n, k)} = ${arranjo}` },
        { texto: `A ordem não importa: divida por ${k}!`, conta: `${arranjo} ÷ ${k}! = ${c}` },
      ],
      explicacao: `Com ordem seriam ${expandir(n, k)} = ${arranjo}. Como a ordem não importa, divida por ${k}! = ${fat(k)}: ${c}.`,
    };
  }

  // "ou": soma
  const a = rng.int(3, 9);
  const b = rng.int(3, 9);
  return {
    tipo,
    enunciado: `Num restaurante, o cliente escolhe 1 prato: ou uma das ${a} massas, ou uma das ${b} carnes. Quantas escolhas de prato são possíveis?`,
    resumo: `${a} massas ou ${b} carnes`,
    correta: a + b,
    formatar: fmt,
    valido: inteiroPositivo,
    distratores: [
      { valor: a * b, erro: 'É uma escolha ou outra (um prato só): some as opções.' },
      { valor: Math.max(a, b), erro: 'Some as opções dos dois cardápios.' },
      { valor: 2 * (a + b) },
      { valor: a + b + 1 },
    ],
    passos: [{ texto: 'Escolhas que se excluem: some', conta: `${a} + ${b} = ${a + b}` }],
    explicacao: `O cliente escolhe um prato só, de um cardápio ou de outro: ${a} + ${b} = ${a + b}.`,
  };
}

// ── Probabilidade ───────────────────────────────────────────────────────

const fracaoValida = (v) => Array.isArray(v) && v[1] > 0 && v[0] > 0 && v[0] <= v[1];
const fmtFracao = ([n, d]) => fracao(n, d);
const vizinhoFracao = (c, k) => [c[0], c[1] + k];

export function probabilidade(rng) {
  const tipo = rng.pick(['urna', 'dados', 'moedas', 'complementar', 'independentes']);
  const base = { formatar: fmtFracao, valido: fracaoValida, vizinho: vizinhoFracao };

  if (tipo === 'urna') {
    const cores = [
      ['vermelhas', rng.int(2, 9)],
      ['azuis', rng.int(2, 9)],
      ['verdes', rng.int(1, 9)],
    ];
    const t = soma(cores.map((c) => c[1]));
    const [cor, c] = rng.pick(cores);
    const [sn, sd] = simplificar([c, t]);
    return {
      tipo,
      ...base,
      enunciado: `Uma urna tem ${cores[0][1]} bolas vermelhas, ${cores[1][1]} azuis e ${cores[2][1]} ${cores[2][1] === 1 ? 'verde' : 'verdes'}. Sorteando uma bola ao acaso, qual a probabilidade de ela ser ${cor === 'vermelhas' ? 'vermelha' : cor === 'azuis' ? 'azul' : 'verde'}?`,
      resumo: `Bola ${cor.slice(0, -1)} numa urna de ${t}`,
      correta: [c, t],
      distratores: [
        { valor: [c, t - c], erro: 'Isso compara favoráveis com desfavoráveis. Divida pelo total de bolas.' },
        { valor: [1, 3], erro: 'As cores não têm a mesma quantidade de bolas.' },
        { valor: [t - c, t], erro: 'Essa é a probabilidade de não sair essa cor.' },
        { valor: [1, c], erro: `Divida os casos favoráveis (${c}) pelo total de bolas (${t}).` },
      ],
      passos: [
        { texto: 'Total de bolas', conta: `${cores.map((x) => x[1]).join(' + ')} = ${t}` },
        { texto: 'Favoráveis ÷ possíveis', conta: `${c} ÷ ${t} = ${fracao(sn, sd)}` },
      ],
      explicacao: `São ${c} bolas favoráveis num total de ${t}: ${c} ÷ ${t} = ${fracao(sn, sd)}.`,
    };
  }

  if (tipo === 'dados') {
    const s = rng.pick([3, 4, 5, 6, 7, 7, 8, 9, 10, 11]);
    const fav = 6 - Math.abs(s - 7);
    const pares = [];
    for (let a = 1; a <= 6; a++) if (s - a >= 1 && s - a <= 6) pares.push(`(${a},${s - a})`);
    return {
      tipo,
      ...base,
      enunciado: `Dois dados comuns são lançados. Qual a probabilidade de a soma dos resultados ser ${s}?`,
      resumo: `Soma ${s} com dois dados`,
      correta: [fav, 36],
      distratores: [
        { valor: [1, 11], erro: 'As somas de 2 a 12 não são igualmente prováveis: há 36 resultados possíveis.' },
        { valor: [1, 36], erro: `Há ${fav} pares que somam ${s}, não 1.` },
        { valor: [fav, 11], erro: 'Os casos possíveis são os 36 pares, não as 11 somas.' },
        { valor: [1, 6] },
        { valor: [fav, 12], erro: 'Os casos possíveis são 6 × 6 = 36.' },
      ],
      passos: [
        { texto: 'Casos possíveis', conta: '6 × 6 = 36' },
        { texto: `Pares que somam ${s}: ${lista(pares)}`, conta: null },
        { texto: 'Favoráveis ÷ possíveis', conta: `${fav} ÷ 36 = ${fracao(fav, 36)}` },
      ],
      explicacao: `Dos 36 pares possíveis, ${fav} somam ${s}: ${fav} ÷ 36 = ${fracao(fav, 36)}.`,
    };
  }

  if (tipo === 'moedas') {
    const n = rng.int(2, 5);
    const total = 2 ** n;
    const peloMenos = rng.proximo() < 0.4;
    const correta = peloMenos ? [total - 1, total] : [1, total];
    return {
      tipo,
      ...base,
      enunciado: peloMenos
        ? `Uma moeda é lançada ${n} vezes. Qual a probabilidade de sair coroa pelo menos uma vez?`
        : `Uma moeda é lançada ${n} vezes. Qual a probabilidade de sair cara em todas?`,
      resumo: peloMenos ? `Pelo menos uma coroa em ${n} lançamentos` : `${n} caras seguidas`,
      correta,
      distratores: peloMenos
        ? [
            { valor: [1, total], erro: 'Essa é a chance de sair cara em todos, o caso contrário.' },
            { valor: [n, total], erro: 'Use o complementar: 1 − P(nenhuma coroa).' },
            { valor: [1, 2], erro: 'Use o complementar: 1 − P(nenhuma coroa).' },
            { valor: [n - 1, n] },
          ]
        : [
            { valor: [1, 2 * n], erro: `Lançamentos independentes se multiplicam: 1/2 × 1/2 … (${n} vezes).` },
            { valor: [1, n], erro: `Lançamentos independentes se multiplicam: 1/2 × 1/2 … (${n} vezes).` },
            { valor: [1, 2], erro: 'Essa é a chance de um lançamento só.' },
            { valor: [n, total] },
          ],
      passos: peloMenos
        ? [
            { texto: 'Chance de não sair nenhuma coroa (só caras)', conta: `(1/2)${expoente(n)} = 1/${total}` },
            { texto: 'Complementar', conta: `1 − 1/${total} = ${total - 1}/${total}` },
          ]
        : [{ texto: 'Independentes: multiplique', conta: `(1/2)${expoente(n)} = 1/${total}` }],
      explicacao: peloMenos
        ? `A chance de só sair cara é (1/2)${expoente(n)} = 1/${total}. O contrário disso é sair pelo menos uma coroa: 1 − 1/${total} = ${total - 1}/${total}.`
        : `Os lançamentos são independentes: (1/2)${expoente(n)} = 1/${total}.`,
    };
  }

  if (tipo === 'complementar') {
    const d = rng.pick([5, 8, 10, 20]);
    const a = tentar(rng, (r) => {
      const v = r.int(1, d - 1);
      return v * 2 !== d ? v : null;
    });
    const evento = rng.pick([
      ['chover amanhã', 'não chover'],
      ['um voo atrasar', 'o voo não atrasar'],
      ['uma peça sair com defeito', 'a peça sair sem defeito'],
    ]);
    return {
      tipo,
      ...base,
      enunciado: `A probabilidade de ${evento[0]} é ${fracao(a, d)}. Qual a probabilidade de ${evento[1]}?`,
      resumo: `Complementar de ${fracao(a, d)}`,
      correta: [d - a, d],
      distratores: [
        { valor: [a, d], erro: 'Essa é a probabilidade do próprio evento. O complementar é 1 − P.' },
        { valor: [a, d - a], erro: 'O complementar é 1 − P, não a razão entre os casos.' },
        { valor: [1, d], erro: 'O complementar é 1 − P.' },
        { valor: [d - a, 2 * d] },
      ],
      passos: [{ texto: 'P(não A) = 1 − P(A)', conta: `1 − ${fracao(a, d)} = ${fracao(d - a, d)}` }],
      explicacao: `Os dois casos somam 1: 1 − ${fracao(a, d)} = ${fracao(d - a, d)}.`,
    };
  }

  // independentes, com reposição
  const c = rng.int(2, 6);
  const outras = rng.int(2, 8);
  const t = c + outras;
  return {
    tipo,
    ...base,
    enunciado: `Uma urna tem ${c} bolas vermelhas e ${outras} azuis. Sorteia-se uma bola, ela é devolvida, e sorteia-se outra. Qual a probabilidade de as duas serem vermelhas?`,
    resumo: `Duas vermelhas com reposição (${c} de ${t})`,
    correta: [c * c, t * t],
    distratores: [
      { valor: [2 * c, t], erro: 'Para um evento e depois o outro, multiplique as probabilidades.' },
      { valor: [c, t], erro: 'Essa é a chance de um sorteio só.' },
      { valor: [c, 2 * t], erro: 'Multiplique as probabilidades dos dois sorteios.' },
      { valor: [c * c, t], erro: `O denominador também se multiplica: ${t} × ${t}.` },
    ],
    passos: [
      { texto: 'Cada sorteio: favoráveis ÷ possíveis', conta: `${c} ÷ ${t} = ${fracao(c, t)}` },
      { texto: 'Independentes (houve reposição): multiplique', conta: `(${c}/${t}) × (${c}/${t}) = ${fracao(c * c, t * t)}` },
    ],
    explicacao: `Com reposição, os sorteios são independentes: (${c}/${t}) × (${c}/${t}) = ${fracao(c * c, t * t)}.`,
  };
}
