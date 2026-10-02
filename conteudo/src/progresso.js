// Progresso do aluno como funções puras sobre um estado simples. O site
// usa no navegador (sem conta) e a API usa com os dados do banco: a regra
// é uma só.
//
// estado = {
//   tentativas: [{ tema, semente, escolha, acertou, modo, em }],
//   revisoes: { [tema]: { base, etapa, venceEm, concluida } },
// }

import { TEMAS } from './catalogo.js';
import { diaDaSemana, diaEmBrasilia, diferencaEmDias, somarDias } from './datas.js';

// Revisão espaçada: o tema volta 1, 3, 7 e 21 dias depois de ser estudado.
export const INTERVALOS = [1, 3, 7, 21];
// Um tema conta como "feito" depois de 3 acertos.
export const ACERTOS_PARA_FEITO = 3;
// Questões por sessão.
export const QUESTOES_PRATICA = 5;
export const QUESTOES_REVISAO = 3;
// Para passar na revisão: 2 de 3.
export const APROVACAO_REVISAO = 2 / 3;

export function estadoVazio() {
  return { tentativas: [], revisoes: {} };
}

export function novoCiclo(agora) {
  const base = diaEmBrasilia(agora);
  return { base, etapa: 0, venceEm: somarDias(base, INTERVALOS[0]), concluida: false };
}

export function aplicarRevisao(ciclo, { acertos, total }, agora) {
  if (total <= 0) return ciclo;
  if (acertos / total + 1e-9 < APROVACAO_REVISAO) return novoCiclo(agora);
  const etapa = ciclo.etapa + 1;
  if (etapa >= INTERVALOS.length) return { ...ciclo, etapa, venceEm: null, concluida: true };
  return { ...ciclo, etapa, venceEm: somarDias(ciclo.base, INTERVALOS[etapa]) };
}

export function revisaoVencida(ciclo, agora) {
  return !!ciclo && !ciclo.concluida && !!ciclo.venceEm && ciclo.venceEm <= diaEmBrasilia(agora);
}

function acertosDoTema(tentativas, tema) {
  return tentativas.filter((t) => t.tema === tema && t.acertou).length;
}

export function registrarTentativa(estado, tentativa, agora) {
  const t = { modo: 'pratica', ...tentativa, em: tentativa.em ?? new Date(agora).toISOString() };
  const tentativas = [...estado.tentativas, t];
  let revisoes = estado.revisoes;
  if (!revisoes[t.tema] && acertosDoTema(tentativas, t.tema) >= ACERTOS_PARA_FEITO) {
    revisoes = { ...revisoes, [t.tema]: novoCiclo(agora) };
  }
  return { tentativas, revisoes };
}

export function concluirRevisao(estado, tema, resultado, agora) {
  const ciclo = estado.revisoes[tema];
  if (!ciclo) return estado;
  return { ...estado, revisoes: { ...estado.revisoes, [tema]: aplicarRevisao(ciclo, resultado, agora) } };
}

// Dias seguidos com pelo menos um exercício. Se hoje ainda não teve, a
// sequência de ontem continua valendo até o fim do dia.
export function sequencia(tentativas, agora) {
  const dias = new Set(tentativas.map((t) => diaEmBrasilia(t.em)));
  let dia = diaEmBrasilia(agora);
  if (!dias.has(dia)) dia = somarDias(dia, -1);
  let n = 0;
  while (dias.has(dia)) {
    n++;
    dia = somarDias(dia, -1);
  }
  return n;
}

export function resumo(estado, agora) {
  const { tentativas, revisoes } = estado;
  const hoje = diaEmBrasilia(agora);
  const porTema = {};
  for (const t of tentativas) {
    porTema[t.tema] ??= { tentativas: 0, acertos: 0, sementesCertas: [] };
    porTema[t.tema].tentativas++;
    if (t.acertou) {
      porTema[t.tema].acertos++;
      porTema[t.tema].sementesCertas.push(t.semente);
    }
  }
  for (const [slug, p] of Object.entries(porTema)) p.feito = p.acertos >= ACERTOS_PARA_FEITO && !!TEMAS[slug];
  const acertos = tentativas.filter((t) => t.acertou).length;

  const ciclos = Object.entries(revisoes)
    .filter(([slug, c]) => TEMAS[slug] && !c.concluida && c.venceEm)
    .map(([slug, c]) => ({ tema: slug, ...c, ordem: c.etapa + 1, intervalo: INTERVALOS[c.etapa] }))
    .sort((a, b) => (a.venceEm < b.venceEm ? -1 : 1));

  // Semana corrente, de domingo a sábado.
  const domingo = somarDias(hoje, -diaDaSemana(hoje));
  const ativos = new Set(tentativas.map((t) => diaEmBrasilia(t.em)));
  const semana = Array.from({ length: 7 }, (_, i) => {
    const dia = somarDias(domingo, i);
    return { dia, ativo: ativos.has(dia), hoje: dia === hoje, futuro: diferencaEmDias(hoje, dia) > 0 };
  });

  return {
    totalTentativas: tentativas.length,
    acertos,
    taxa: tentativas.length ? acertos / tentativas.length : null,
    temasFeitos: Object.keys(porTema).filter((s) => porTema[s].feito),
    porTema,
    sequencia: sequencia(tentativas, agora),
    semana,
    revisoesHoje: ciclos.filter((c) => c.venceEm <= hoje),
    proximasRevisoes: ciclos.filter((c) => c.venceEm > hoje),
    praticouHoje: ativos.has(hoje),
  };
}

// As 4 etapas do ciclo de um tema, para a faixa "Revisão espaçada".
export function etapasDoCiclo(ciclo, agora) {
  if (!ciclo) return null;
  const hoje = diaEmBrasilia(agora);
  return INTERVALOS.map((d, i) => {
    const dia = somarDias(ciclo.base, d);
    const feita = ciclo.concluida || i < ciclo.etapa;
    const atual = !feita && i === ciclo.etapa;
    return { intervalo: d, dia, feita, atual, vencida: atual && dia <= hoje };
  });
}
