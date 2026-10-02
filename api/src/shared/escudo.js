// Escudo para rotas caras (IA): limites globais por minuto e por hora,
// orçamento diário e concorrência máxima. Estourou → 503 SERVICE_BUSY.
// Fica em memória: com uma instância só (Render Starter) é o suficiente.

import { diaEmBrasilia } from '@edukan/conteudo';
import { ocupado } from './erros.js';

export function criarEscudo({ porMinuto = 30, porHora = 300, orcamentoDiario = 500, concorrencia = 4, agora = () => new Date() } = {}) {
  let emAndamento = 0;
  const chamadas = []; // instantes (ms) da última hora
  let dia = null;
  let gastoHoje = 0;

  function limpar(ms) {
    while (chamadas.length && chamadas[0] <= ms - 3600_000) chamadas.shift();
    const hoje = diaEmBrasilia(ms);
    if (hoje !== dia) {
      dia = hoje;
      gastoHoje = 0;
    }
  }

  return {
    async executar(fn) {
      const ms = agora().getTime();
      limpar(ms);
      if (emAndamento >= concorrencia) throw ocupado();
      if (gastoHoje >= orcamentoDiario) throw ocupado('O tutor atingiu o limite de hoje. Volte amanhã.');
      if (chamadas.length >= porHora || chamadas.filter((t) => t > ms - 60_000).length >= porMinuto) throw ocupado();
      chamadas.push(ms);
      gastoHoje++;
      emAndamento++;
      try {
        return await fn();
      } finally {
        emAndamento--;
      }
    },
    estado() {
      const ms = agora().getTime();
      limpar(ms);
      return { emAndamento, ultimaHora: chamadas.length, gastoHoje, orcamentoDiario };
    },
  };
}
