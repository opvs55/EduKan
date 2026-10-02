// Bloco 1 · Porcentagem e dinheiro.

import { arred, fator, meses, num, pct, reais, vezes } from '../formato.js';
import { tentar } from '../questao.js';

const inteiroPositivo = (v) => Number.isInteger(v) && v > 0;
const positivo = (v) => Number.isFinite(v) && v > 0;
const centavosExatos = (v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6;

const PRODUTOS = [
  { um: 'Uma', em: 'numa', nome: 'camiseta', precos: [40, 50, 60, 80, 100, 120] },
  { um: 'Um', em: 'num', nome: 'tênis', precos: [120, 150, 200, 240, 250, 300, 400] },
  { um: 'Uma', em: 'numa', nome: 'mochila', precos: [80, 100, 120, 150, 180, 200] },
  { um: 'Um', em: 'num', nome: 'fone de ouvido', precos: [60, 80, 100, 120, 150, 200] },
  { um: 'Uma', em: 'numa', nome: 'bicicleta', precos: [500, 600, 800, 1000, 1200] },
  { um: 'Um', em: 'num', nome: 'celular', precos: [800, 1000, 1200, 1500, 2000] },
  { um: 'Uma', em: 'numa', nome: 'jaqueta', precos: [120, 150, 200, 240, 250] },
];

// ── Porcentagem ─────────────────────────────────────────────────────────

const GRUPOS = [
  { inicio: 'Numa escola com {t} alunos', parte: 'usam ônibus', pergunta: 'Quantos alunos usam ônibus?', un: ['aluno', 'alunos'] },
  { inicio: 'Num estádio com {t} torcedores', parte: 'são do time visitante', pergunta: 'Quantos torcedores são do time visitante?', un: ['torcedor', 'torcedores'] },
  { inicio: 'Numa pesquisa com {t} pessoas', parte: 'disseram usar transporte público', pergunta: 'Quantas pessoas disseram isso?', un: ['pessoa', 'pessoas'] },
  { inicio: 'Numa empresa com {t} funcionários', parte: 'trabalham de casa', pergunta: 'Quantos funcionários trabalham de casa?', un: ['funcionário', 'funcionários'] },
];

const CONTAGENS = [
  (A, B) => `Num simulado de ${num(B)} questões, ${num(A)} foram respondidas corretamente. Que porcentagem das questões foi acertada?`,
  (A, B) => `Um time jogou ${num(B)} partidas no ano e venceu ${num(A)}. Em que porcentagem das partidas o time venceu?`,
  (A, B) => `De ${num(B)} mudas plantadas, ${num(A)} pegaram. Que porcentagem das mudas pegou?`,
  (A, B) => `Uma fábrica produziu ${num(B)} peças e ${num(A)} passaram no controle de qualidade. Que porcentagem passou?`,
];

const TAXAS = ['de desemprego de uma cidade', 'de inadimplência de uma loja', 'de evasão de um curso', 'de juros de um financiamento'];

export function porcentagem(rng) {
  const tipo = rng.pick(['pessoas', 'desconto', 'quanto', 'pontos']);

  if (tipo === 'pessoas') {
    const { p, t } = tentar(rng, (r) => {
      const p = r.pick([5, 10, 12, 15, 20, 25, 30, 35, 40, 45, 60, 75, 80]);
      const t = 20 * r.int(2, 60);
      return Number.isInteger((p * t) / 100) ? { p, t } : null;
    });
    const g = rng.pick(GRUPOS);
    const r = (p * t) / 100;
    const f = fator(p / 100);
    return {
      tipo,
      enunciado: `${g.inicio.replace('{t}', num(t))}, ${p}% ${g.parte}. ${g.pergunta}`,
      resumo: `${p}% de ${num(t)}`,
      correta: r,
      formatar: (v) => vezes(v, ...g.un),
      valido: inteiroPositivo,
      distratores: [
        { valor: t - r, erro: `Esse é o restante, os outros ${100 - p}%.` },
        { valor: t - p, erro: `Subtrair a porcentagem do total não funciona: ${p}% de ${num(t)} é ${f} × ${num(t)}.` },
        { valor: r * 10, erro: `Confira a vírgula: ${p}% é o fator ${f}.` },
        { valor: r / 10, erro: `Confira a vírgula: ${p}% é o fator ${f}.` },
        { valor: p, erro: 'Esse é o próprio número da porcentagem, não a parte do total.' },
      ],
      passos: [
        { texto: `${p}% é o fator ${f}`, conta: null },
        { texto: 'Multiplique o fator pelo total', conta: `${f} × ${num(t)} = ${num(r)}` },
      ],
      explicacao: `${p}% de ${num(t)} é ${f} × ${num(t)} = ${num(r)}.`,
    };
  }

  if (tipo === 'desconto') {
    const prod = rng.pick(PRODUTOS);
    const P = rng.pick(prod.precos);
    const p = rng.pick([5, 10, 15, 20, 25, 30, 35, 40]);
    const r = arred((p * P) / 100, 2);
    const f = fator(p / 100);
    return {
      tipo,
      enunciado: `Uma loja dá ${p}% de desconto ${prod.em} ${prod.nome} de ${reais(P)}. De quanto é o desconto, em reais?`,
      resumo: `Desconto de ${p}% sobre ${reais(P)}`,
      correta: r,
      formatar: reais,
      valido: positivo,
      distratores: [
        { valor: P - r, erro: 'Esse é o preço com desconto. A pergunta pede o valor do desconto.' },
        { valor: r * 10, erro: `Confira a vírgula: ${p}% é o fator ${f}.` },
        { valor: r / 10, erro: `Confira a vírgula: ${p}% é o fator ${f}.` },
        { valor: P - p, erro: `Subtrair ${p} do preço não é tirar ${p}%.` },
      ],
      passos: [
        { texto: `${p}% é o fator ${f}`, conta: null },
        { texto: 'Desconto', conta: `${f} × ${num(P)} = ${num(r)}` },
      ],
      explicacao: `O desconto é ${f} × ${num(P)} = ${num(r)} reais. O preço final seria ${reais(P - r)}.`,
    };
  }

  if (tipo === 'quanto') {
    const { p, B } = tentar(rng, (r) => {
      const B = r.pick([20, 25, 40, 50, 80, 120, 150, 200, 250, 300, 400, 500, 800]);
      const p = r.pick([5, 10, 15, 20, 25, 30, 40, 45, 60, 75, 80, 90]);
      return Number.isInteger((p * B) / 100) ? { p, B } : null;
    });
    const A = (p * B) / 100;
    const q = A / B;
    return {
      tipo,
      enunciado: rng.pick(CONTAGENS)(A, B),
      resumo: `Que porcentagem ${num(A)} é de ${num(B)}`,
      correta: p,
      formatar: (v) => pct(v, 1),
      valido: positivo,
      distratores: [
        { valor: 100 - p, erro: 'Essa é a porcentagem que falta para 100%, a parte que não entrou.' },
        { valor: A, erro: 'Esse é o número de casos, não a porcentagem. Divida pelo total.' },
        { valor: (B / A) * 100, erro: 'A divisão foi feita ao contrário: é a parte ÷ o total.' },
        { valor: p / 10, erro: 'Depois de dividir, multiplique por 100.' },
      ],
      passos: [
        { texto: 'Divida a parte pelo total', conta: `${num(A)} ÷ ${num(B)} = ${num(q, 4)}` },
        { texto: 'Multiplique por 100', conta: `${num(q, 4)} × 100 = ${num(p)}` },
      ],
      explicacao: `${num(A)} ÷ ${num(B)} = ${num(q, 4)}, ou seja, ${p}%.`,
    };
  }

  // pontos percentuais × variação percentual
  const { T1, d } = tentar(rng, (r) => {
    const T1 = r.pick([4, 5, 8, 10, 12, 16, 20, 25]);
    const d = r.int(1, 10);
    return Number.isInteger((d * 100) / T1) && T1 + d <= 40 ? { T1, d } : null;
  });
  const T2 = T1 + d;
  const v = (d * 100) / T1;
  const q = d / T1;
  return {
    tipo,
    enunciado: `A taxa ${rng.pick(TAXAS)} passou de ${T1}% para ${T2}%. Em relação à taxa inicial, de quantos por cento foi o aumento?`,
    resumo: `Taxa de ${T1}% para ${T2}%`,
    correta: v,
    formatar: (x) => pct(x, 1),
    valido: positivo,
    distratores: [
      { valor: d, erro: `${d} é a diferença em pontos percentuais. Comparada com a taxa inicial, ela vale ${num(v)}%.` },
      { valor: T2, erro: 'Esse é o novo valor da taxa, não o aumento.' },
      { valor: (T2 / T1) * 100, erro: 'Esse é o novo valor em relação ao antigo. O aumento é o que passa de 100%.' },
      { valor: d * 10, erro: 'Divida a diferença pela taxa inicial.' },
    ],
    passos: [
      { texto: 'Diferença em pontos percentuais', conta: `${T2} − ${T1} = ${d}` },
      { texto: 'Compare com a taxa inicial', conta: `${d} ÷ ${T1} = ${num(q, 4)}` },
      { texto: 'Em porcentagem', conta: `${num(q, 4)} × 100 = ${num(v)}` },
    ],
    explicacao: `A taxa subiu ${d} pontos percentuais. Em relação aos ${T1}% iniciais, isso é ${d} ÷ ${T1} = ${num(q, 4)}, um aumento de ${num(v)}%.`,
  };
}

// ── Aumentos e descontos sucessivos ─────────────────────────────────────

export function aumentosEDescontos(rng) {
  const tipo = rng.pick(['preco', 'preco', 'dois-descontos', 'desfazer', 'tres-aumentos']);

  if (tipo === 'preco') {
    const { prod, P, a, b, final } = tentar(rng, (r) => {
      const prod = r.pick(PRODUTOS);
      const P = r.pick(prod.precos);
      const a = r.pick([10, 20, 25, 30, 40, 50]);
      const b = r.pick([10, 20, 25, 30, 40, 50]);
      const final = arred((P * (100 + a) * (100 - b)) / 10000, 6);
      return centavosExatos(final) ? { prod, P, a, b, final } : null;
    });
    const fa = 1 + a / 100;
    const fb = 1 - b / 100;
    const anulam = Math.abs(fa * fb - 1) < 1e-9;
    const soma = a - b;
    return {
      tipo,
      enunciado: `${prod.um} ${prod.nome} custava ${reais(P)}. Teve aumento de ${a}% e, um mês depois, desconto de ${b}%. Quanto custa agora?`,
      resumo: `Aumento de ${a}% seguido de desconto de ${b}%`,
      correta: final,
      formatar: reais,
      valido: positivo,
      distratores: [
        {
          valor: (P * (100 + soma)) / 100,
          erro:
            soma === 0
              ? `Somar +${a}% e −${b}% dá zero, mas porcentagens em sequência se multiplicam.`
              : `Somar +${a}% e −${b}% dá ${soma > 0 ? '+' : '−'}${Math.abs(soma)}%, mas porcentagens em sequência se multiplicam.`,
        },
        { valor: P, erro: `O preço não volta ao original: ${fator(fa)} × ${fator(fb)} = ${fator(fa * fb)}.` },
        { valor: P * fa, erro: 'Esse é o preço depois do aumento. Falta aplicar o desconto sobre ele.' },
        { valor: P * fb, erro: 'Faltou o aumento: o desconto vale sobre o preço já aumentado.' },
      ],
      passos: [
        { texto: `Aumento de ${a}%: fator ${fator(fa)}. Desconto de ${b}%: fator ${fator(fb)}`, conta: null },
        { texto: 'Aplique os dois fatores em sequência', conta: `${num(P)} × ${fator(fa)} × ${fator(fb)} = ${num(final)}` },
      ],
      explicacao:
        `${num(P)} × ${fator(fa)} × ${fator(fb)} = ${num(final)}. ` +
        (anulam ? `Os fatores se anulam porque ${fator(fa)} × ${fator(fb)} = 1.` : `O fator total é ${fator(fa)} × ${fator(fb)} = ${fator(fa * fb)}.`),
    };
  }

  if (tipo === 'dois-descontos') {
    const prod = rng.pick(PRODUTOS);
    const a = rng.pick([10, 15, 20, 25, 30, 40, 50]);
    const b = rng.pick([10, 15, 20, 25, 30, 40, 50]);
    const fa = 1 - a / 100;
    const fb = 1 - b / 100;
    const f = arred(fa * fb, 6);
    const total = arred(100 - f * 100, 4);
    return {
      tipo,
      enunciado: `Uma loja dá ${a}% de desconto ${prod.em} ${prod.nome} e, no caixa, mais ${b}% sobre o novo preço. Qual o desconto total em relação ao preço original?`,
      resumo: `Desconto de ${a}% e depois mais ${b}%`,
      correta: total,
      formatar: (v) => pct(v, 2),
      valido: (v) => v > 0 && v < 100,
      distratores: [
        { valor: a + b, erro: 'Somar os descontos. O segundo desconto incide sobre um valor menor.' },
        { valor: f * 100, erro: `Esse é quanto sobra do preço (fator ${fator(f)}). O desconto é o que falta para 100%.` },
        { valor: (a * b) / 100, erro: 'Multiplique os fatores (1 − desconto), não as porcentagens.' },
        { valor: (a + b) / 2, erro: 'Descontos sucessivos não se resolvem com média.' },
      ],
      passos: [
        { texto: `Fatores: ${fator(fa)} e ${fator(fb)}`, conta: `${fator(fa)} × ${fator(fb)} = ${fator(f)}` },
        { texto: 'O desconto é o que falta para 1', conta: `(1 − ${fator(f)}) × 100 = ${num(total)}` },
      ],
      explicacao: `O fator total é ${fator(fa)} × ${fator(fb)} = ${fator(f)}: o produto passa a custar ${num(f * 100)}% do preço, um desconto de ${num(total)}%.`,
    };
  }

  if (tipo === 'desfazer') {
    const a = rng.pick([25, 60, 100, 150, 300, 400]);
    const fa = 1 + a / 100;
    const inv = arred(1 / fa, 6);
    const d = arred((1 - inv) * 100, 4);
    return {
      tipo,
      enunciado: `O preço de um produto subiu ${a}%. Que desconto, sobre o novo preço, faz ele voltar ao valor original?`,
      resumo: `O desconto que desfaz um aumento de ${a}%`,
      correta: d,
      formatar: (v) => pct(v, 1),
      valido: (v) => v > 0 && v < 100,
      distratores: [
        { valor: a, erro: `Um desconto de ${a}% sobre o preço maior tira mais do que o aumento colocou.` },
        { valor: a / 2, erro: 'O desconto precisa levar o fator total de volta a 1.' },
        { valor: 100 - a, erro: 'O desconto precisa levar o fator total de volta a 1.' },
        { valor: d + 5 },
        { valor: d - 5 },
      ],
      passos: [
        { texto: `Fator do aumento: ${fator(fa)}`, conta: null },
        { texto: 'O fator do desconto precisa desfazer o aumento', conta: `1 ÷ ${fator(fa)} = ${fator(inv)}` },
        { texto: 'Desconto', conta: `(1 − ${fator(inv)}) × 100 = ${num(d, 1)}` },
      ],
      explicacao: `Para voltar ao preço original, ${fator(fa)} × ${fator(inv)} = 1. O fator ${fator(inv)} é um desconto de ${num(d, 1)}%.`,
    };
  }

  // três aumentos seguidos
  const { P, a, valores } = tentar(rng, (r) => {
    const P = r.pick([1000, 2000, 2500, 4000, 5000, 10000]);
    const a = r.pick([5, 10, 20]);
    const fa = 1 + a / 100;
    const valores = [1, 2, 3].map((k) => arred(P * fa ** k, 6));
    return valores.every(centavosExatos) ? { P, a, valores } : null;
  });
  const fa = 1 + a / 100;
  const final = valores[2];
  return {
    tipo,
    enunciado: `O aluguel de uma loja era ${reais(P)} e teve três aumentos anuais seguidos de ${a}%. Qual o valor depois do terceiro aumento?`,
    resumo: `Três aumentos de ${a}% sobre ${reais(P)}`,
    correta: final,
    formatar: reais,
    valido: positivo,
    distratores: [
      { valor: P * (1 + (3 * a) / 100), erro: `Somar os três aumentos (${3 * a}%) ignora que cada um incide sobre o valor já aumentado.` },
      { valor: valores[1], erro: 'Esse é o valor depois de dois aumentos.' },
      { valor: arred(P * fa ** 4, 2), erro: 'Foram três aumentos, não quatro.' },
      { valor: valores[0], erro: 'Esse é o valor depois do primeiro aumento.' },
    ],
    passos: [
      { texto: '1º aumento', conta: `${num(P)} × ${fator(fa)} = ${num(valores[0])}` },
      { texto: '2º aumento', conta: `${num(valores[0])} × ${fator(fa)} = ${num(valores[1])}` },
      { texto: '3º aumento', conta: `${num(valores[1])} × ${fator(fa)} = ${num(final)}` },
    ],
    explicacao: `Cada aumento multiplica por ${fator(fa)}: ${num(P)} × ${fator(fa)}³ = ${num(final)}.`,
  };
}

// ── Juros simples ───────────────────────────────────────────────────────

export function jurosSimples(rng) {
  const tipo = rng.pick(['montante', 'juros', 'tempo', 'unidade']);
  const C = rng.pick([400, 500, 600, 800, 1000, 1200, 1500, 2000, 2400, 2500, 3000, 4000, 5000]);

  if (tipo === 'unidade') {
    const ia = rng.pick([12, 18, 24, 30, 36, 48, 60]);
    const t = rng.int(2, 10);
    const im = ia / 12;
    const J = arred((C * im * t) / 100, 4);
    return {
      tipo,
      enunciado: `Quanto rende de juro simples um capital de ${reais(C)} a ${ia}% ao ano, durante ${meses(t)}?`,
      resumo: `${ia}% ao ano durante ${meses(t)}`,
      correta: J,
      formatar: reais,
      valido: positivo,
      distratores: [
        { valor: (C * ia * t) / 100, erro: 'A taxa está ao ano e o tempo em meses. Converta para a mesma unidade antes.' },
        { valor: (C * ia) / 100, erro: 'Esse é o juro de um ano inteiro.' },
        { valor: C + J, erro: 'Esse é o montante (capital + juro). A pergunta pede só o juro.' },
        { valor: (C * im) / 100, erro: 'Esse é o juro de um mês só.' },
      ],
      passos: [
        { texto: 'Taxa mensal equivalente (juro simples)', conta: `${ia} ÷ 12 = ${num(im)}` },
        { texto: `Juro: C × i × t, com i = ${num(im)}%`, conta: `${num(C)} × ${fator(im / 100)} × ${t} = ${num(J)}` },
      ],
      explicacao: `${ia}% ao ano são ${num(im)}% ao mês. Juro: ${num(C)} × ${fator(im / 100)} × ${t} = ${num(J)}.`,
    };
  }

  const i = rng.pick([1, 1.5, 2, 2.5, 3, 4, 5]);
  const t = rng.int(2, 12);
  const jm = arred((C * i) / 100, 4);
  const J = arred(jm * t, 4);
  const M = C + J;
  const composto = arred(C * (1 + i / 100) ** t, 2);
  const passosBase = [
    { texto: 'Juro de um mês', conta: `${num(C)} × ${fator(i / 100)} = ${num(jm)}` },
    { texto: `Juro de ${meses(t)}`, conta: `${num(jm)} × ${t} = ${num(J)}` },
  ];

  if (tipo === 'montante') {
    return {
      tipo,
      enunciado: `Um empréstimo de ${reais(C)} foi feito a juro simples de ${num(i)}% ao mês, por ${meses(t)}. Qual o montante a pagar?`,
      resumo: `Montante de ${reais(C)} a ${num(i)}% ao mês`,
      correta: M,
      formatar: reais,
      valido: positivo,
      distratores: [
        { valor: J, erro: 'Esse é só o juro. O montante é capital + juro.' },
        { valor: composto, erro: 'Esse seria o montante com juro composto. No simples, o juro de cada mês é sobre o capital inicial.' },
        { valor: C + jm, erro: 'Esse é o montante depois de um mês só.' },
        { valor: C + jm * (t + 1), erro: `Conte ${meses(t)}, nem mais nem menos.` },
      ],
      passos: [...passosBase, { texto: 'Montante: capital + juro', conta: `${num(C)} + ${num(J)} = ${num(M)}` }],
      explicacao: `O juro é ${num(C)} × ${fator(i / 100)} × ${t} = ${num(J)}, e o montante é ${num(C)} + ${num(J)} = ${num(M)}.`,
    };
  }

  if (tipo === 'juros') {
    return {
      tipo,
      enunciado: `Quanto de juro rendem ${reais(C)} aplicados a ${num(i)}% ao mês, juro simples, durante ${meses(t)}?`,
      resumo: `Juro de ${reais(C)} em ${meses(t)}`,
      correta: J,
      formatar: reais,
      valido: positivo,
      distratores: [
        { valor: M, erro: 'Esse é o montante (capital + juro). A pergunta pede só o juro.' },
        { valor: composto - C, erro: 'Esse seria o juro composto.' },
        { valor: jm, erro: 'Esse é o juro de um mês só.' },
        { valor: C * i * t, erro: `Use a taxa como fator: ${num(i)}% = ${fator(i / 100)}.` },
      ],
      passos: passosBase,
      explicacao: `J = C × i × t = ${num(C)} × ${fator(i / 100)} × ${t} = ${num(J)}.`,
    };
  }

  // tempo
  return {
    tipo,
    enunciado: `Um capital de ${reais(C)} aplicado a juro simples de ${num(i)}% ao mês rendeu ${reais(J)} de juro. Por quantos meses ficou aplicado?`,
    resumo: `Tempo para ${reais(C)} render ${reais(J)}`,
    correta: t,
    formatar: meses,
    valido: inteiroPositivo,
    distratores: [
      { valor: t + 1, erro: 'Divida o juro total pelo juro de um mês.' },
      { valor: t - 1, erro: 'Divida o juro total pelo juro de um mês.' },
      { valor: 2 * t },
      { valor: t + 2 },
    ],
    passos: [
      { texto: 'Juro de um mês', conta: `${num(C)} × ${fator(i / 100)} = ${num(jm)}` },
      { texto: 'Quantos meses cabem no juro total', conta: `${num(J)} ÷ ${num(jm)} = ${t}` },
    ],
    explicacao: `Por mês o capital rende ${num(jm)}. Para chegar a ${num(J)}: ${num(J)} ÷ ${num(jm)} = ${t}.`,
  };
}

// ── Juros compostos ─────────────────────────────────────────────────────

export function jurosCompostos(rng) {
  const tipo = rng.pick(['montante', 'juros', 'comparar', 'divida']);
  const { C, i, t, valores } = tentar(rng, (r) => {
    const divida = tipo === 'divida';
    const C = r.pick(divida ? [500, 800, 1000, 2000, 4000] : [1000, 2000, 2500, 4000, 5000, 10000, 20000]);
    const i = r.pick(divida ? [5, 10, 12, 15] : [2, 5, 10, 20]);
    const t = r.int(2, divida ? 3 : 4);
    const valores = [];
    let v = C;
    for (let k = 0; k < t; k++) {
      v = arred((v * (100 + i)) / 100, 6);
      valores.push(v);
    }
    return valores.every(centavosExatos) ? { C, i, t, valores } : null;
  });
  const f = 1 + i / 100;
  const M = valores[t - 1];
  const J = arred(M - C, 2);
  const simples = C * (1 + (i * t) / 100);
  const passos = valores.map((v, k) => ({
    texto: k === 0 ? '1º mês' : `${k + 1}º mês: o juro incide sobre ${num(valores[k - 1])}`,
    conta: `${num(k === 0 ? C : valores[k - 1])} × ${fator(f)} = ${num(v)}`,
  }));

  if (tipo === 'montante' || tipo === 'divida') {
    const enunciado =
      tipo === 'divida'
        ? `Uma dívida de ${reais(C)} no cartão cresce ${i}% ao mês, juro composto. Quanto ela vale depois de ${meses(t)} sem pagamento?`
        : `${reais(C)} foram aplicados a ${i}% ao mês, juro composto, por ${meses(t)}. Qual o montante?`;
    return {
      tipo,
      enunciado,
      resumo: tipo === 'divida' ? `Dívida de ${reais(C)} a ${i}% ao mês` : `${reais(C)} a ${i}% ao mês por ${meses(t)}`,
      correta: M,
      formatar: reais,
      valido: positivo,
      distratores: [
        { valor: simples, erro: 'Esse seria o montante a juro simples. No composto, o juro de cada mês entra no capital.' },
        { valor: J, erro: 'Esse é só o juro. O montante é capital + juro.' },
        { valor: t > 1 ? valores[t - 2] : null, erro: `Foram ${meses(t)}: aplique o fator ${t} vezes.` },
        { valor: arred(M * f, 2), erro: `Foram ${meses(t)}: aplique o fator ${t} vezes.` },
      ],
      passos,
      explicacao: `${num(C)} × ${fator(f)}${t === 2 ? '²' : t === 3 ? '³' : '⁴'} = ${num(M)}. A juro simples seriam ${num(simples)}.`,
    };
  }

  if (tipo === 'juros') {
    return {
      tipo,
      enunciado: `Quanto de juro rendem ${reais(C)} aplicados a ${i}% ao mês, juro composto, durante ${meses(t)}?`,
      resumo: `Juro composto de ${reais(C)} em ${meses(t)}`,
      correta: J,
      formatar: reais,
      valido: positivo,
      distratores: [
        { valor: M, erro: 'Esse é o montante. O juro é montante − capital.' },
        { valor: simples - C, erro: 'Esse seria o juro simples.' },
        { valor: (C * i) / 100, erro: 'Esse é o juro do primeiro mês só.' },
        { valor: arred(M * f - C, 2), erro: `Foram ${meses(t)}: aplique o fator ${t} vezes.` },
      ],
      passos: [...passos, { texto: 'Juro: montante − capital', conta: `${num(M)} − ${num(C)} = ${num(J)}` }],
      explicacao: `O montante é ${num(M)}, então o juro é ${num(M)} − ${num(C)} = ${num(J)}.`,
    };
  }

  // comparar composto × simples
  const dif = arred(M - simples, 2);
  return {
    tipo,
    enunciado: `${reais(C)} ficam aplicados por ${meses(t)} a ${i}% ao mês. Quanto o juro composto rende a mais que o juro simples?`,
    resumo: `Composto × simples: ${reais(C)} a ${i}% ao mês`,
    correta: dif,
    formatar: reais,
    valido: positivo,
    distratores: [
      { valor: J, erro: 'Esse é o juro composto inteiro. A pergunta pede a diferença para o simples.' },
      { valor: simples - C, erro: 'Esse é o juro simples inteiro.' },
      { valor: dif * 2 },
      { valor: arred(M * f - simples - (C * i) / 100, 2) },
    ],
    passos: [
      ...passos,
      { texto: 'Montante a juro simples', conta: `${num(C)} × (1 + ${fator(i / 100)} × ${t}) = ${num(simples)}` },
      { texto: 'Diferença', conta: `${num(M)} − ${num(simples)} = ${num(dif)}` },
    ],
    explicacao: `Composto: ${num(M)}. Simples: ${num(simples)}. A diferença é ${num(M)} − ${num(simples)} = ${num(dif)}.`,
  };
}
