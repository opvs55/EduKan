import { describe, expect, it } from 'vitest';
import {
  ACERTOS_PARA_FEITO,
  aplicarRevisao,
  concluirRevisao,
  estadoVazio,
  etapasDoCiclo,
  novoCiclo,
  registrarTentativa,
  resumo,
  revisaoVencida,
  sequencia,
} from '../src/progresso.js';

const dia = (d, h = 15) => new Date(`2026-10-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:00:00Z`);

function praticar(estado, tema, acertos, erros, agora) {
  let e = estado;
  for (let i = 0; i < acertos; i++) e = registrarTentativa(e, { tema, semente: i + 1, escolha: 0, acertou: true }, agora);
  for (let i = 0; i < erros; i++) e = registrarTentativa(e, { tema, semente: 100 + i, escolha: 1, acertou: false }, agora);
  return e;
}

describe('revisão espaçada', () => {
  it('o tema entra em revisão ao virar "feito" e volta em 1, 3, 7 e 21 dias', () => {
    let e = praticar(estadoVazio(), 'porcentagem', ACERTOS_PARA_FEITO - 1, 1, dia(1));
    expect(e.revisoes.porcentagem).toBeUndefined();
    e = praticar(e, 'porcentagem', 1, 0, dia(1));
    expect(e.revisoes.porcentagem).toEqual({ base: '2026-10-01', etapa: 0, venceEm: '2026-10-02', concluida: false });

    expect(revisaoVencida(e.revisoes.porcentagem, dia(1))).toBe(false);
    expect(revisaoVencida(e.revisoes.porcentagem, dia(2))).toBe(true);
    e = concluirRevisao(e, 'porcentagem', { acertos: 2, total: 3 }, dia(2));
    expect(e.revisoes.porcentagem.venceEm).toBe('2026-10-04');
    e = concluirRevisao(e, 'porcentagem', { acertos: 3, total: 3 }, dia(4));
    expect(e.revisoes.porcentagem.venceEm).toBe('2026-10-08');
    e = concluirRevisao(e, 'porcentagem', { acertos: 3, total: 3 }, dia(8));
    expect(e.revisoes.porcentagem.venceEm).toBe('2026-10-22');
    e = concluirRevisao(e, 'porcentagem', { acertos: 3, total: 3 }, dia(22));
    expect(e.revisoes.porcentagem.concluida).toBe(true);
  });

  it('reprovar na revisão recomeça o ciclo a partir de hoje', () => {
    const c = aplicarRevisao(novoCiclo(dia(1)), { acertos: 1, total: 3 }, dia(5));
    expect(c).toEqual({ base: '2026-10-05', etapa: 0, venceEm: '2026-10-06', concluida: false });
  });

  it('mostra as 4 etapas do ciclo', () => {
    const etapas = etapasDoCiclo({ base: '2026-09-29', etapa: 1, venceEm: '2026-10-02', concluida: false }, dia(2));
    expect(etapas.map((e) => e.dia)).toEqual(['2026-09-30', '2026-10-02', '2026-10-06', '2026-10-20']);
    expect(etapas.map((e) => e.feita)).toEqual([true, false, false, false]);
    expect(etapas[1]).toMatchObject({ atual: true, vencida: true });
  });
});

describe('sequência e resumo', () => {
  it('conta dias seguidos e não zera antes do fim do dia', () => {
    const t = [dia(1), dia(2), dia(3)].map((em) => ({ em: em.toISOString() }));
    expect(sequencia(t, dia(3))).toBe(3);
    expect(sequencia(t, dia(4))).toBe(3);
    expect(sequencia(t, dia(5))).toBe(0);
  });

  it('resume acertos, temas feitos e revisões do dia', () => {
    let e = praticar(estadoVazio(), 'porcentagem', 3, 1, dia(1));
    e = praticar(e, 'juros-simples', 1, 2, dia(2));
    const r = resumo(e, dia(2));
    expect(r.totalTentativas).toBe(7);
    expect(r.acertos).toBe(4);
    expect(r.temasFeitos).toEqual(['porcentagem']);
    expect(r.revisoesHoje.map((x) => x.tema)).toEqual(['porcentagem']);
    expect(r.sequencia).toBe(2);
    expect(r.semana).toHaveLength(7);
    expect(r.semana.find((d) => d.hoje).dia).toBe('2026-10-02');
  });
});
