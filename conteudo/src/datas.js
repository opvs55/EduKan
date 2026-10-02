// Datas no fuso de Brasília. O Brasil não tem horário de verão desde 2019,
// então o fuso é fixo em −03:00 e dá para calcular sem tabela de fusos.

export const FUSO = '-03:00';
const OFFSET_MS = -3 * 3600 * 1000;
const DIA_MS = 24 * 3600 * 1000;

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

// Dia (AAAA-MM-DD) em Brasília para um instante.
export function diaEmBrasilia(instante) {
  return new Date(new Date(instante).getTime() + OFFSET_MS).toISOString().slice(0, 10);
}

export function somarDias(dia, n) {
  return new Date(Date.parse(`${dia}T00:00:00Z`) + n * DIA_MS).toISOString().slice(0, 10);
}

export function diferencaEmDias(a, b) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DIA_MS);
}

// 0 = domingo … 6 = sábado
export function diaDaSemana(dia) {
  return new Date(`${dia}T00:00:00Z`).getUTCDay();
}

export function instanteEm(dia, hora = '19:00') {
  return new Date(`${dia}T${hora}:00${FUSO}`);
}

// "29 set"
export function dataCurta(dia) {
  const [, m, d] = dia.split('-').map(Number);
  return `${d} ${MESES[m - 1]}`;
}

// "sáb, 4 out"
export function dataComDia(dia) {
  return `${DIAS[diaDaSemana(dia)]}, ${dataCurta(dia)}`;
}

export function nomeDoDia(dia) {
  return DIAS[diaDaSemana(dia)];
}

// "Hoje, 19h" · "Amanhã, 19h" · "sáb, 4 out, 19h"
export function quandoRelativo(dia, agora, hora = '19h') {
  const hoje = diaEmBrasilia(agora);
  const d = diferencaEmDias(hoje, dia);
  if (d === 0) return `Hoje, ${hora}`;
  if (d === 1) return `Amanhã, ${hora}`;
  return `${dataComDia(dia)}, ${hora}`;
}
