import { criarRng, sementeValida } from '../rng.js';
import { montarQuestao } from '../questao.js';
import { TEMAS } from '../catalogo.js';
import { aumentosEDescontos, jurosCompostos, jurosSimples, porcentagem } from './dinheiro.js';
import { escala, razaoEProporcao, regraDeTres } from './proporcao.js';
import { funcaoAfim, funcaoQuadratica, progressaoAritmetica, progressaoGeometrica } from './funcoes.js';
import { leituraDeGraficos, mediaMedianaModa, principioDaContagem, probabilidade } from './dados.js';

export const GERADORES = {
  porcentagem,
  aumentosEDescontos,
  jurosSimples,
  jurosCompostos,
  razaoEProporcao,
  regraDeTres,
  escala,
  funcaoAfim,
  funcaoQuadratica,
  progressaoAritmetica,
  progressaoGeometrica,
  mediaMedianaModa,
  leituraDeGraficos,
  principioDaContagem,
  probabilidade,
};

// Gera a questão `semente` do tema. Determinística: mesma entrada, mesma questão.
export function gerarQuestao(slug, semente) {
  const tema = TEMAS[slug];
  if (!tema) throw new Error(`tema desconhecido: ${slug}`);
  if (!sementeValida(semente)) throw new Error(`semente inválida: ${semente}`);
  const gerador = GERADORES[tema.gerador];
  const rng = criarRng(semente);
  const g = gerador(rng);
  const { alternativas, correta, erros } = montarQuestao(rng, g);
  return {
    id: `${slug}:${semente}`,
    tema: slug,
    semente,
    tipo: g.tipo,
    enunciado: g.enunciado,
    resumo: g.resumo,
    alternativas,
    correta,
    resposta: alternativas[correta],
    explicacao: g.explicacao,
    erros,
    passos: g.passos,
    grafico: g.grafico ?? null,
  };
}

// Versão sem gabarito, para mostrar antes da resposta.
export function semGabarito(q) {
  const { correta, resposta, explicacao, erros, passos, ...resto } = q;
  return resto;
}

export function corrigir(slug, semente, escolha) {
  const q = gerarQuestao(slug, semente);
  if (!Number.isInteger(escolha) || escolha < 0 || escolha >= q.alternativas.length) {
    throw new Error('alternativa inválida');
  }
  const acertou = escolha === q.correta;
  return {
    acertou,
    correta: q.correta,
    resposta: q.resposta,
    explicacao: q.explicacao,
    erro: acertou ? null : (q.erros[escolha] ?? null),
    passos: q.passos,
  };
}

// Três exercícios fixos por tema, listados na página de estudo.
export const SEMENTES_DA_PAGINA = [101, 202, 303];

export function exerciciosDaPagina(slug) {
  return SEMENTES_DA_PAGINA.map((s) => gerarQuestao(slug, s));
}
