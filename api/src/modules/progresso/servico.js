import { ACERTOS_PARA_FEITO, TEMAS, aplicarRevisao, corrigir, novoCiclo } from '@edukan/conteudo';

// Grava tentativas e abre o ciclo de revisão dos temas que viraram "feitos".
export async function registrarParaUsuario(repo, userId, tentativas, agora) {
  const em = new Date(agora).toISOString();
  const linhas = tentativas.map((t) => ({ modo: 'pratica', em, ...t }));
  await repo.inserirTentativas(userId, linhas);
  const estado = await repo.estadoDoUsuario(userId);
  const temas = new Set(linhas.map((t) => t.tema));
  for (const tema of temas) {
    if (estado.revisoes[tema]) continue;
    const acertos = estado.tentativas.filter((t) => t.tema === tema && t.acertou).length;
    if (acertos >= ACERTOS_PARA_FEITO) await repo.salvarRevisao(userId, tema, novoCiclo(agora));
  }
}

// Recalcula cada resposta pela semente: o navegador não decide o que acertou.
export function recorrigir(tentativas) {
  return tentativas
    .filter((t) => TEMAS[t.tema])
    .map((t) => ({ ...t, acertou: corrigir(t.tema, t.semente, t.escolha).acertou }));
}

export async function concluirRevisaoDoUsuario(repo, userId, tema, respostas, agora) {
  const estado = await repo.estadoDoUsuario(userId);
  const ciclo = estado.revisoes[tema];
  if (!ciclo) return null;
  const corrigidas = recorrigir(respostas.map((r) => ({ ...r, tema })));
  const acertos = corrigidas.filter((t) => t.acertou).length;
  const novo = aplicarRevisao(ciclo, { acertos, total: corrigidas.length }, agora);
  await repo.salvarRevisao(userId, tema, novo);
  return { ciclo: novo, acertos, total: corrigidas.length };
}
