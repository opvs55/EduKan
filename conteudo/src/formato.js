// Números no formato brasileiro: 1.234,56 · R$ 80 · 19% · 1/6.

const formatadores = new Map();
function nf(min, max) {
  const chave = `${min}:${max}`;
  if (!formatadores.has(chave)) {
    formatadores.set(
      chave,
      new Intl.NumberFormat('pt-BR', { minimumFractionDigits: min, maximumFractionDigits: max }),
    );
  }
  return formatadores.get(chave);
}

// Tira o ruído de ponto flutuante (0,1 + 0,2 = 0,30000000000000004).
export function arred(x, casas = 9) {
  const f = 10 ** casas;
  return Math.round(x * f) / f;
}

export function num(x, casas = 2) {
  const v = arred(x, casas);
  // Sinal de menos tipográfico (−), como nos livros.
  return nf(0, casas).format(Object.is(v, -0) ? 0 : v).replace('-', '−');
}

// Fator de multiplicação com pelo menos 2 casas: 0,90 · 1,25 · 1,331.
export function fator(x) {
  return nf(2, 4).format(arred(x, 4));
}

export function reais(x) {
  const v = arred(x, 2);
  return 'R$ ' + (Number.isInteger(v) ? nf(0, 0).format(v) : nf(2, 2).format(v));
}

export function pct(x, casas = 1) {
  return `${num(x, casas)}%`;
}

export function mdc(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function simplificar([n, d]) {
  const g = mdc(n, d) || 1;
  return [n / g, d / g];
}

export function fracao(n, d) {
  const [a, b] = simplificar([n, d]);
  return b === 1 ? `${a}` : `${a}/${b}`;
}

export function meses(t) {
  return t === 1 ? '1 mês' : `${num(t)} meses`;
}

export function dias(t) {
  return t === 1 ? '1 dia' : `${num(t)} dias`;
}

export function horas(t) {
  return t === 1 ? '1 hora' : `${num(t)} horas`;
}

export function vezes(t, singular, plural) {
  return `${num(t)} ${t === 1 ? singular : plural}`;
}

const SOBRESCRITOS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
export function expoente(n) {
  return String(n)
    .split('')
    .map((c) => SOBRESCRITOS[Number(c)])
    .join('');
}

// Lista em português: "6, 8 e 5".
export function lista(itens) {
  if (itens.length <= 1) return itens.join('');
  return `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`;
}
