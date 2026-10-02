// Bloco 2 · Proporção.

import { arred, dias, horas, num, reais, vezes } from '../formato.js';
import { tentar } from '../questao.js';

const inteiroPositivo = (v) => Number.isInteger(v) && v > 0;
const positivo = (v) => Number.isFinite(v) && v > 0;
const mdc = (a, b) => (b ? mdc(b, a % b) : a);

// ── Razão e proporção ───────────────────────────────────────────────────

const RECEITAS = [
  { a: ['xícara de farinha', 'xícaras de farinha'], b: ['ovo', 'ovos'], frase: 'Uma receita de bolo usa', pergunta: 'quantos ovos são necessários?' },
  { a: ['colher de café', 'colheres de café'], b: ['xícara de água', 'xícaras de água'], frase: 'Um café coado usa', pergunta: 'quantas xícaras de água são necessárias?' },
  { a: ['saco de cimento', 'sacos de cimento'], b: ['lata de areia', 'latas de areia'], frase: 'Uma massa de concreto usa', pergunta: 'quantas latas de areia são necessárias?' },
];

export function razaoEProporcao(rng) {
  const tipo = rng.pick(['dividir', 'dividir', 'quarta', 'mistura']);

  if (tipo === 'dividir') {
    const { a, b } = tentar(rng, (r) => {
      const a = r.int(1, 6);
      const b = r.int(a + 1, 9);
      return mdc(a, b) === 1 ? { a, b } : null;
    });
    const emDinheiro = rng.proximo() < 0.67;
    const k = emDinheiro ? rng.pick([100, 120, 150, 200, 250, 300, 400, 500, 600, 1000]) : rng.pick([10, 20, 25, 30, 40, 50, 60]);
    const T = (a + b) * k;
    const menor = a * k;
    const maior = b * k;
    const pedeMaior = rng.proximo() < 0.5;
    const contextos = [
      {
        e: `Dois sócios investiram em um negócio na razão ${a} : ${b} e vão dividir um lucro de ${reais(T)} nessa mesma razão. Quanto recebe o sócio que investiu ${pedeMaior ? 'mais' : 'menos'}?`,
        f: reais,
      },
      {
        e: `Uma herança de ${reais(T)} será dividida entre dois irmãos na razão ${a} : ${b}. Quanto recebe quem fica com a ${pedeMaior ? 'maior' : 'menor'} parte?`,
        f: reais,
      },
      {
        e: `Uma escola tem ${num(T)} alunos, e a razão entre alunos do turno da manhã e da tarde é ${a} : ${b}. Quantos alunos estudam ${pedeMaior ? 'à tarde' : 'de manhã'}?`,
        f: (v) => vezes(v, 'aluno', 'alunos'),
      },
    ];
    const ctx = emDinheiro ? rng.pick(contextos.slice(0, 2)) : contextos[2];
    const certa = pedeMaior ? maior : menor;
    const outra = pedeMaior ? menor : maior;
    return {
      tipo,
      enunciado: ctx.e,
      resumo: `Dividir ${num(T)} na razão ${a} : ${b}`,
      correta: certa,
      formatar: ctx.f,
      valido: inteiroPositivo,
      distratores: [
        { valor: outra, erro: 'Essa é a outra parte da divisão.' },
        { valor: T / (pedeMaior ? b : a), erro: `Dividir o total pelos números da razão não funciona: são ${a} + ${b} = ${a + b} partes iguais.` },
        { valor: T / 2, erro: 'Metade para cada só vale na razão 1 : 1.' },
        { valor: (T * a) / b, erro: `São ${a + b} partes no total: divida ${num(T)} por ${a + b}.` },
      ],
      passos: [
        { texto: 'Total de partes', conta: `${a} + ${b} = ${a + b}` },
        { texto: 'Valor de cada parte', conta: `${num(T)} ÷ ${a + b} = ${num(k)}` },
        { texto: `A parte pedida tem ${pedeMaior ? b : a} partes`, conta: `${pedeMaior ? b : a} × ${num(k)} = ${num(certa)}` },
      ],
      explicacao: `São ${a + b} partes de ${num(T)} ÷ ${a + b} = ${num(k)}. A parte pedida é ${pedeMaior ? b : a} × ${num(k)} = ${num(certa)}.`,
    };
  }

  if (tipo === 'quarta') {
    const rec = rng.pick(RECEITAS);
    const { a, b, m } = tentar(rng, (r) => {
      const a = r.int(2, 5);
      const b = r.int(1, 6);
      const m = r.int(2, 5);
      return a !== b && mdc(a, b) === 1 ? { a, b, m } : null;
    });
    const c = a * m;
    const x = b * m;
    return {
      tipo,
      enunciado: `${rec.frase} ${vezes(a, ...rec.a)} para ${vezes(b, ...rec.b)}. Mantendo a proporção, com ${vezes(c, ...rec.a)}, ${rec.pergunta}`,
      resumo: `${a} está para ${b} assim como ${c} está para x`,
      correta: x,
      formatar: (v) => vezes(v, ...rec.b),
      valido: inteiroPositivo,
      distratores: [
        { valor: c + (b - a), erro: 'Manter a diferença não mantém a proporção. O que se mantém é a razão.' },
        { valor: (c * a) / b, erro: `A proporção foi montada ao contrário: ${a}/${b} = ${c}/x.` },
        { valor: c * b, erro: `Depois de multiplicar em cruz, divida por ${a}.` },
        { valor: m, erro: `Esse é quantas vezes a receita aumentou. Multiplique ${b} por ele.` },
      ],
      passos: [
        { texto: `Proporção: ${a}/${b} = ${c}/x, então ${a} × x = ${b} × ${c}`, conta: `${b} × ${c} = ${b * c}` },
        { texto: 'Divida pelo número que acompanha x', conta: `${b * c} ÷ ${a} = ${x}` },
      ],
      explicacao: `Multiplicando em cruz, ${a} × x = ${b} × ${c} = ${b * c}, e x = ${b * c} ÷ ${a} = ${x}. A receita foi multiplicada por ${m}.`,
    };
  }

  // mistura concentrado : água
  const { n, V } = tentar(rng, (r) => {
    const n = r.int(2, 9);
    const V = r.pick([1, 1.5, 2, 2.5, 3, 4, 5]);
    return Number.isInteger((V * 1000) / (n + 1)) ? { n, V } : null;
  });
  const ml = (V * 1000) / (n + 1);
  const mL = (v) => `${num(v)} mL`;
  return {
    tipo,
    enunciado: `Um suco é feito com concentrado e água na razão 1 : ${n}. Quanto concentrado vai em ${num(V)} ${V === 1 ? 'litro' : 'litros'} de suco pronto?`,
    resumo: `Concentrado na razão 1 : ${n} em ${num(V)} L`,
    correta: ml,
    formatar: mL,
    valido: inteiroPositivo,
    distratores: [
      { valor: (V * 1000) / n, erro: `O suco tem 1 + ${n} = ${n + 1} partes, não ${n}.` },
      { valor: ml * n, erro: 'Essa é a quantidade de água.' },
      { valor: (V * 1000) / (n + 2), erro: `O suco tem 1 + ${n} = ${n + 1} partes.` },
      { valor: ml * 10, erro: 'Confira a conversão: 1 litro = 1.000 mL.' },
    ],
    passos: [
      { texto: 'Total de partes', conta: `1 + ${n} = ${n + 1}` },
      { texto: 'Cada parte, em mL', conta: `${num(V * 1000)} ÷ ${n + 1} = ${num(ml)}` },
    ],
    explicacao: `São 1 + ${n} = ${n + 1} partes iguais em ${num(V * 1000)} mL: cada parte tem ${num(ml)} mL, e o concentrado é 1 parte.`,
  };
}

// ── Regra de três ───────────────────────────────────────────────────────

const ITENS = [
  { un: ['caderno', 'cadernos'], precos: [6, 7.5, 8, 9, 12, 15] },
  { un: ['litro de gasolina', 'litros de gasolina'], precos: [5.5, 5.8, 6, 6.2, 6.5] },
  { un: ['quilo de arroz', 'quilos de arroz'], precos: [4, 4.5, 5, 6] },
  { un: ['ingresso', 'ingressos'], precos: [20, 25, 30, 40, 45] },
];

const EQUIPES = [
  { quem: ['pedreiro', 'pedreiros'], obra: 'um muro' },
  { quem: ['pintor', 'pintores'], obra: 'uma casa' },
  { quem: ['máquina', 'máquinas'], obra: 'uma encomenda' },
];

export function regraDeTres(rng) {
  const tipo = rng.pick(['direta', 'inversa', 'velocidade', 'composta']);

  if (tipo === 'direta') {
    const it = rng.pick(ITENS);
    const u = rng.pick(it.precos);
    const q1 = rng.int(2, 6);
    const q2 = tentar(rng, (r) => {
      const q = r.int(3, 15);
      return q !== q1 ? q : null;
    });
    const v1 = arred(u * q1, 2);
    const v2 = arred(u * q2, 2);
    return {
      tipo,
      enunciado: `${vezes(q1, ...it.un)} custam ${reais(v1)}. Quanto custam ${vezes(q2, ...it.un)}?`,
      resumo: `${q1} custam ${reais(v1)}; quanto custam ${q2}?`,
      correta: v2,
      formatar: reais,
      valido: positivo,
      distratores: [
        { valor: (v1 * q1) / q2, erro: 'Mais itens custam mais: as grandezas são diretamente proporcionais.' },
        { valor: v1 + (q2 - q1), erro: 'Somar a diferença de quantidade não mantém a proporção.' },
        { valor: v1 * q2, erro: `Primeiro ache o preço de uma unidade: ${num(v1)} ÷ ${q1}.` },
        { valor: u, erro: 'Esse é o preço de uma unidade só.' },
      ],
      passos: [
        { texto: 'Mais itens, mais dinheiro: direta. Preço de uma unidade', conta: `${num(v1)} ÷ ${q1} = ${num(u)}` },
        { texto: `Preço de ${q2}`, conta: `${num(u)} × ${q2} = ${num(v2)}` },
      ],
      explicacao: `Uma unidade custa ${num(v1)} ÷ ${q1} = ${num(u)}, então ${q2} custam ${num(u)} × ${q2} = ${num(v2)}.`,
    };
  }

  if (tipo === 'inversa') {
    const eq = rng.pick(EQUIPES);
    const { w1, d1, w2 } = tentar(rng, (r) => {
      const w1 = r.int(2, 12);
      const d1 = r.int(3, 20);
      const w2 = r.int(2, 12);
      return w1 !== w2 && Number.isInteger((w1 * d1) / w2) ? { w1, d1, w2 } : null;
    });
    const d2 = (w1 * d1) / w2;
    return {
      tipo,
      enunciado: `${w1} ${eq.quem[1]} fazem ${eq.obra} em ${dias(d1)}. Em quantos dias ${w2} ${eq.quem[1]}, no mesmo ritmo, fazem o mesmo serviço?`,
      resumo: `${w1} ${eq.quem[1]} em ${dias(d1)}; e ${w2}?`,
      correta: d2,
      formatar: dias,
      valido: inteiroPositivo,
      distratores: [
        { valor: (d1 * w2) / w1, erro: `${w2 < w1 ? 'Menos' : 'Mais'} ${eq.quem[1]} levam ${w2 < w1 ? 'mais' : 'menos'} dias: as grandezas são inversamente proporcionais.` },
        { valor: d1 + (w1 - w2), erro: 'Somar a diferença não mantém a proporção.' },
        { valor: w1 * d1, erro: `Esse é o trabalho total. Divida por ${w2}.` },
        { valor: d2 + 1 },
      ],
      passos: [
        { texto: `${w2 < w1 ? 'Menos' : 'Mais'} ${eq.quem[1]}, ${w2 < w1 ? 'mais' : 'menos'} dias: inversa. Trabalho total`, conta: `${w1} × ${d1} = ${w1 * d1}` },
        { texto: `Dividido entre ${w2}`, conta: `${w1 * d1} ÷ ${w2} = ${d2}` },
      ],
      explicacao: `O produto se mantém: ${w1} × ${d1} = ${w2} × x, então x = ${w1 * d1} ÷ ${w2} = ${d2}.`,
    };
  }

  if (tipo === 'velocidade') {
    const { v1, t1, v2 } = tentar(rng, (r) => {
      const v1 = r.pick([40, 50, 60, 72, 80, 90, 100, 120]);
      const t1 = r.int(2, 6);
      const v2 = r.pick([40, 48, 50, 60, 75, 80, 90, 100, 120]);
      return v1 !== v2 && Number.isInteger((v1 * t1) / v2) ? { v1, t1, v2 } : null;
    });
    const t2 = (v1 * t1) / v2;
    return {
      tipo,
      enunciado: `Um ônibus a ${v1} km/h faz uma viagem em ${horas(t1)}. A ${v2} km/h, quanto tempo leva a mesma viagem?`,
      resumo: `${v1} km/h em ${horas(t1)}; e a ${v2} km/h?`,
      correta: t2,
      formatar: horas,
      valido: inteiroPositivo,
      distratores: [
        { valor: (t1 * v2) / v1, erro: 'Mais rápido, menos tempo: velocidade e tempo são inversamente proporcionais.' },
        { valor: v1 * t1, erro: 'Essa é a distância em km. Divida pela nova velocidade.' },
        { valor: t1 + (v1 > v2 ? 1 : -1) },
        { valor: t2 + 1 },
      ],
      passos: [
        { texto: 'Distância da viagem', conta: `${v1} × ${t1} = ${v1 * t1}` },
        { texto: 'Tempo na nova velocidade', conta: `${v1 * t1} ÷ ${v2} = ${t2}` },
      ],
      explicacao: `A viagem tem ${v1} × ${t1} = ${v1 * t1} km. A ${v2} km/h: ${v1 * t1} ÷ ${v2} = ${t2}.`,
    };
  }

  // composta: máquinas × horas → peças
  const { m1, h1, p1, m2, h2 } = tentar(rng, (r) => {
    const m1 = r.int(2, 8);
    const h1 = r.int(2, 8);
    const p1 = 10 * r.int(6, 40);
    const m2 = r.int(2, 10);
    const h2 = r.int(2, 10);
    const p2 = (p1 * m2 * h2) / (m1 * h1);
    const porMaqHora = p1 / (m1 * h1);
    return m1 !== m2 && h1 !== h2 && Number.isInteger(p2) && Math.abs(porMaqHora * 100 - Math.round(porMaqHora * 100)) < 1e-9 ? { m1, h1, p1, m2, h2 } : null;
  });
  const p2 = (p1 * m2 * h2) / (m1 * h1);
  const porMaqHora = p1 / (m1 * h1);
  return {
    tipo,
    enunciado: `${m1} máquinas iguais produzem ${num(p1)} peças em ${horas(h1)}. Quantas peças ${m2} dessas máquinas produzem em ${horas(h2)}?`,
    resumo: `${m1} máquinas, ${horas(h1)}, ${num(p1)} peças; e ${m2} máquinas em ${horas(h2)}?`,
    correta: p2,
    formatar: (v) => vezes(v, 'peça', 'peças'),
    valido: inteiroPositivo,
    distratores: [
      { valor: (p1 * m2) / m1, erro: 'Faltou considerar a mudança nas horas.' },
      { valor: (p1 * h2) / h1, erro: 'Faltou considerar a mudança no número de máquinas.' },
      { valor: (p1 * m2 * h1) / (m1 * h2), erro: 'Mais horas, mais peças: horas e peças são diretamente proporcionais.' },
      { valor: p2 + 10 },
    ],
    passos: [
      { texto: 'Peças por máquina por hora', conta: `${num(p1)} ÷ (${m1} × ${h1}) = ${num(porMaqHora)}` },
      { texto: `${m2} máquinas por ${horas(h2)}`, conta: `${num(porMaqHora)} × ${m2} × ${h2} = ${num(p2)}` },
    ],
    explicacao: `Cada máquina faz ${num(porMaqHora)} peças por hora. Então ${m2} máquinas em ${horas(h2)} fazem ${num(porMaqHora)} × ${m2} × ${h2} = ${num(p2)}.`,
  };
}

// ── Escala ──────────────────────────────────────────────────────────────

const escalaTexto = (N) => `1 : ${num(N)}`;

export function escala(rng) {
  const tipo = rng.pick(['mapa', 'mapa', 'inverso', 'area', 'achar']);

  if (tipo === 'mapa' || tipo === 'inverso') {
    const { N, d } = tentar(rng, (r) => {
      const N = r.pick([25000, 50000, 100000, 200000, 250000, 500000, 1000000, 2000000]);
      const d = r.pick([2, 2.5, 3, 4, 4.5, 5, 6, 7, 8, 9, 10, 12, 15]);
      const km = (d * N) / 100000;
      return km >= 1 && Number.isInteger(km * 10) ? { N, d } : null;
    });
    const cm = d * N;
    const km = arred(cm / 100000, 4);
    const fmtKm = (v) => `${num(v, 2)} km`;
    const fmtCm = (v) => `${num(v, 2)} cm`;
    if (tipo === 'mapa') {
      return {
        tipo,
        enunciado: `Num mapa de escala ${escalaTexto(N)}, duas cidades estão a ${num(d)} cm uma da outra. Qual a distância real entre elas, em km?`,
        resumo: `${num(d)} cm na escala ${escalaTexto(N)}`,
        correta: km,
        formatar: fmtKm,
        valido: positivo,
        distratores: [
          { valor: km * 10, erro: 'Confira a conversão: 1 km = 100.000 cm.' },
          { valor: km / 10, erro: 'Confira a conversão: 1 km = 100.000 cm.' },
          { valor: km * 100, erro: 'Isso está em metros, não em km. 1 km = 100.000 cm.' },
          { valor: km / 100, erro: 'Confira a conversão: 1 km = 100.000 cm.' },
        ],
        passos: [
          { texto: 'Distância real em cm', conta: `${num(d)} × ${num(N)} = ${num(cm)}` },
          { texto: 'Em km (1 km = 100.000 cm)', conta: `${num(cm)} ÷ 100.000 = ${num(km)}` },
        ],
        explicacao: `${num(d)} cm no mapa são ${num(d)} × ${num(N)} = ${num(cm)} cm reais, ou ${num(km)} km.`,
      };
    }
    return {
      tipo,
      enunciado: `Duas cidades estão a ${num(km)} km uma da outra. Num mapa de escala ${escalaTexto(N)}, qual a distância entre elas, em cm?`,
      resumo: `${num(km)} km na escala ${escalaTexto(N)}`,
      correta: d,
      formatar: fmtCm,
      valido: positivo,
      distratores: [
        { valor: d * 10, erro: 'Confira a conversão: 1 km = 100.000 cm.' },
        { valor: d / 10, erro: 'Confira a conversão: 1 km = 100.000 cm.' },
        { valor: d * 100, erro: 'Confira a conversão: 1 km = 100.000 cm.' },
        { valor: d + 1 },
      ],
      passos: [
        { texto: 'Distância real em cm', conta: `${num(km)} × 100.000 = ${num(cm)}` },
        { texto: 'No mapa, divida pela escala', conta: `${num(cm)} ÷ ${num(N)} = ${num(d)}` },
      ],
      explicacao: `${num(km)} km são ${num(cm)} cm. Na escala ${escalaTexto(N)}: ${num(cm)} ÷ ${num(N)} = ${num(d)} cm.`,
    };
  }

  if (tipo === 'area') {
    const { N, a, b } = tentar(rng, (r) => {
      const N = r.pick([50, 100, 200]);
      const a = r.int(3, 12);
      const b = r.int(2, a);
      return Number.isInteger((a * N) / 10) && Number.isInteger((b * N) / 10) ? { N, a, b } : null;
    });
    const ra = (a * N) / 100;
    const rb = (b * N) / 100;
    const area = arred(ra * rb, 4);
    const fmt = (v) => `${num(v, 2)} m²`;
    return {
      tipo,
      enunciado: `Uma planta na escala ${escalaTexto(N)} mostra um cômodo retangular de ${a} cm por ${b} cm. Qual a área real do cômodo?`,
      resumo: `Cômodo de ${a} cm × ${b} cm na escala ${escalaTexto(N)}`,
      correta: area,
      formatar: fmt,
      valido: positivo,
      distratores: [
        { valor: (a * b * N) / 10000, erro: 'A escala vale para comprimentos. Converta cada lado antes de calcular a área.' },
        { valor: ra + rb, erro: 'Área é lado × lado, não lado + lado.' },
        { valor: 2 * (ra + rb), erro: 'Esse é o perímetro, não a área.' },
        { valor: area * 100, erro: 'Confira a conversão de cm para m antes de multiplicar.' },
      ],
      passos: [
        { texto: 'Um lado real, em m', conta: `${a} × ${N} ÷ 100 = ${num(ra)}` },
        { texto: 'O outro lado real, em m', conta: `${b} × ${N} ÷ 100 = ${num(rb)}` },
        { texto: 'Área', conta: `${num(ra)} × ${num(rb)} = ${num(area)}` },
      ],
      explicacao: `Os lados reais são ${num(ra)} m e ${num(rb)} m, então a área é ${num(ra)} × ${num(rb)} = ${num(area)} m².`,
    };
  }

  // achar a escala
  const { N, d } = tentar(rng, (r) => {
    const N = r.pick([20000, 25000, 40000, 50000, 100000, 200000, 250000, 500000]);
    const d = r.int(2, 12);
    return Number.isInteger((d * N) / 100000 * 10) ? { N, d } : null;
  });
  const km = arred((d * N) / 100000, 4);
  return {
    tipo,
    enunciado: `Num mapa, uma estrada de ${num(km)} km aparece com ${d} cm. Qual a escala do mapa?`,
    resumo: `${num(km)} km representados por ${d} cm`,
    correta: N,
    formatar: escalaTexto,
    valido: inteiroPositivo,
    distratores: [
      { valor: N * 10, erro: 'Confira a conversão: 1 km = 100.000 cm.' },
      { valor: N / 10, erro: 'Confira a conversão: 1 km = 100.000 cm.' },
      { valor: N * 100, erro: 'Confira a conversão: 1 km = 100.000 cm.' },
      { valor: N / 100, erro: 'Confira a conversão: 1 km = 100.000 cm.' },
    ],
    passos: [
      { texto: 'Medida real em cm', conta: `${num(km)} × 100.000 = ${num(d * N)}` },
      { texto: 'Escala: desenho ÷ real, com o desenho valendo 1', conta: `${num(d * N)} ÷ ${d} = ${num(N)}` },
    ],
    explicacao: `${num(km)} km são ${num(d * N)} cm. Cada 1 cm do mapa vale ${num(d * N)} ÷ ${d} = ${num(N)} cm reais.`,
  };
}
