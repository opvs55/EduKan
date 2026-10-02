import { describe, expect, it } from 'vitest';
import { dataCurta, diaEmBrasilia, quandoRelativo } from '../src/datas.js';
import { grade, itemDoTema, planoDoDia, situacao, temaDoDesafio, TEMPORADAS } from '../src/programacao.js';

const t1 = TEMPORADAS[0];

describe('grade da temporada', () => {
  const g = grade('mat-t1');

  it('começa no domingo com o trailer e tem os 15 episódios em ordem', () => {
    expect(g[0]).toMatchObject({ tipo: 'trailer', dia: t1.inicio, episodio: 0, chave: 'mat:t1e00:trailer' });
    const eps = g.filter((i) => i.tipo === 'episodio');
    expect(eps.map((i) => i.tema)).toEqual(t1.temas);
    expect(eps.map((i) => i.episodio)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
  });

  it('não publica episódio no sábado; sábado é revisão da semana', () => {
    for (const i of g) {
      const sabado = new Date(`${i.dia}T00:00:00Z`).getUTCDay() === 6;
      expect(sabado, `${i.chave} em ${i.dia}`).toBe(i.tipo === 'revisao');
    }
    const revisoes = g.filter((i) => i.tipo === 'revisao');
    expect(revisoes.flatMap((r) => r.temas)).toEqual(t1.temas);
    expect(g[g.length - 1].tipo).toBe('revisao');
  });

  it('cada post tem chave única e sai às 19h de Brasília', () => {
    expect(new Set(g.map((i) => i.chave)).size).toBe(g.length);
    expect(itemDoTema('razao-e-proporcao').chave).toBe('mat:t1e05:razao-e-proporcao');
    for (const i of g) expect(i.publicaEm).toBe(new Date(`${i.dia}T22:00:00Z`).toISOString());
  });

  it('planoDoDia acha o item do dia', () => {
    expect(planoDoDia(t1.inicio).tipo).toBe('trailer');
    expect(planoDoDia('2020-01-01')).toBeNull();
  });
});

describe('situação da série', () => {
  it('antes da estreia, nada no ar e o trailer é o próximo', () => {
    const s = situacao('mat-t1', new Date('2026-10-02T12:00:00Z'));
    expect(s.estreou).toBe(false);
    expect(s.lancados).toBe(0);
    expect(s.proximo.tipo).toBe('trailer');
    expect(s.proximo.status).toBe('proximo');
  });

  it('no dia do episódio, antes das 19h, ele aparece como "hoje"', () => {
    const e2 = itemDoTema('aumentos-e-descontos-sucessivos');
    const s = situacao('mat-t1', new Date(`${e2.dia}T20:00:00Z`)); // 17h em Brasília
    expect(s.proximo.chave).toBe(e2.chave);
    expect(s.proximo.status).toBe('hoje');
    expect(s.lancados).toBe(1);
    const depois = situacao('mat-t1', new Date(`${e2.dia}T22:00:01Z`));
    expect(depois.lancados).toBe(2);
  });

  it('o desafio do dia segue o episódio mais recente', () => {
    const e3 = itemDoTema('juros-simples');
    expect(temaDoDesafio(new Date(`${e3.dia}T23:00:00Z`))).toBe('juros-simples');
    expect(t1.temas).toContain(temaDoDesafio(new Date('2026-10-02T12:00:00Z')));
  });
});

describe('datas', () => {
  it('usa o dia de Brasília', () => {
    expect(diaEmBrasilia('2026-10-03T02:00:00Z')).toBe('2026-10-02');
    expect(dataCurta('2026-09-29')).toBe('29 set');
    expect(quandoRelativo('2026-10-03', new Date('2026-10-02T15:00:00Z'))).toBe('Amanhã, 19h');
    expect(quandoRelativo('2026-10-04', new Date('2026-10-02T15:00:00Z'))).toBe('dom, 4 out, 19h');
  });
});
