// Monta uma questão de 5 alternativas a partir da resposta calculada e dos
// distratores (respostas que saem de erros comuns). Cada distrator pode
// trazer a explicação do erro, mostrada quando o aluno escolhe essa opção.

import { arred } from './formato.js';

const LETRAS = 'ABCDE';

function normalizar(d) {
  return d !== null && typeof d === 'object' && !Array.isArray(d) && 'valor' in d ? d : { valor: d };
}

function numeroValido(v) {
  return typeof v === 'number' && Number.isFinite(v) && v > 0;
}

// Vizinhos numéricos para completar as 5 opções quando os erros comuns
// não bastam (ou coincidem entre si).
function vizinhoPadrao(correta, k) {
  const sinal = k % 2 === 1 ? 1 : -1;
  const passo = Math.ceil(k / 2);
  if (Number.isInteger(correta)) {
    const delta = Math.max(1, Math.round(Math.abs(correta) * 0.1));
    return correta + sinal * passo * delta;
  }
  return arred(correta * (1 + sinal * passo * 0.1), 2);
}

export function montarQuestao(rng, { correta, distratores = [], formatar = String, valido = numeroValido, vizinho = vizinhoPadrao }) {
  const certa = formatar(correta);
  const vistos = new Set([certa]);
  const erradas = [];
  const adicionar = ({ valor, erro }) => {
    if (erradas.length >= 4 || !valido(valor)) return;
    const texto = formatar(valor);
    if (vistos.has(texto)) return;
    vistos.add(texto);
    erradas.push({ texto, erro: erro ?? null });
  };
  distratores.map(normalizar).forEach(adicionar);
  for (let k = 1; erradas.length < 4 && k <= 60; k++) adicionar({ valor: vizinho(correta, k, rng) });
  if (erradas.length < 4) throw new Error(`não foi possível completar as alternativas de ${certa}`);

  const opcoes = rng.embaralhar([{ texto: certa, erro: null, certa: true }, ...erradas]);
  const erros = {};
  opcoes.forEach((o, i) => {
    if (o.erro) erros[i] = o.erro;
  });
  return {
    alternativas: opcoes.map((o) => o.texto),
    correta: opcoes.findIndex((o) => o.certa),
    erros,
  };
}

export function letra(indice) {
  return LETRAS[indice];
}

// Tenta montar um cenário até as condições baterem (ex.: resultado inteiro).
export function tentar(rng, fabrica, limite = 200) {
  for (let i = 0; i < limite; i++) {
    const r = fabrica(rng);
    if (r) return r;
  }
  throw new Error('gerador não encontrou um cenário válido');
}
