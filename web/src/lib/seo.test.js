import { describe, expect, it } from 'vitest';
import { metaDaRota, rotasEstaticas } from './seo.js';

describe('SEO', () => {
  it('dá título e descrição a cada página estática', () => {
    const rotas = rotasEstaticas();
    expect(rotas).toContain('/tema/probabilidade');
    expect(rotas).toContain('/materia/historia');
    for (const r of rotas) {
      const m = metaDaRota(r);
      expect(m.naoEncontrada, r).toBeUndefined();
      expect(m.titulo.length, r).toBeLessThanOrEqual(70);
      expect(m.descricao.length, r).toBeGreaterThan(30);
    }
  });

  it('usa o fichário nas páginas de tema', () => {
    const m = metaDaRota('/tema/juros-compostos/');
    expect(m.titulo).toBe('Juros compostos · Matemática para o ENEM · EduKan');
    expect(m.descricao).toContain('Bloco 1: Porcentagem e dinheiro');
    expect(m.caminho).toBe('/tema/juros-compostos');
  });

  it('marca endereços desconhecidos', () => {
    expect(metaDaRota('/tema/nao-existe').naoEncontrada).toBe(true);
  });
});
