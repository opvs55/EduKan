import { describe, expect, it } from 'vitest';
import { ORDEM } from '../src/catalogo.js';
import { corrigir, exerciciosDaPagina, gerarQuestao, semGabarito } from '../src/geradores/index.js';
import { verificarConta, verificarTexto } from '../src/verificador.js';

const SEMENTES = Array.from({ length: 600 }, (_, i) => 1 + i * 7919);
const PROIBIDO = /undefined|NaN|Infinity|null|\[object/;

describe.each(ORDEM.matematica)('gerador de %s', (slug) => {
  it('gera questões válidas e com contas certas', () => {
    const tipos = new Set();
    for (const s of SEMENTES) {
      const q = gerarQuestao(slug, s);
      tipos.add(q.tipo);
      const ctx = `${slug}:${s} (${q.tipo})`;
      expect(q.alternativas, ctx).toHaveLength(5);
      expect(new Set(q.alternativas).size, ctx).toBe(5);
      expect(q.correta, ctx).toBeGreaterThanOrEqual(0);
      expect(q.correta, ctx).toBeLessThan(5);
      expect(q.resposta).toBe(q.alternativas[q.correta]);
      for (const texto of [q.enunciado, q.resumo, q.explicacao, ...q.alternativas, ...Object.values(q.erros)]) {
        expect(texto, ctx).toMatch(/\S/);
        expect(texto, `${ctx}: ${texto}`).not.toMatch(PROIBIDO);
      }
      expect(q.erros[q.correta], ctx).toBeUndefined();
      for (const p of q.passos) {
        expect(p.texto, ctx).not.toMatch(PROIBIDO);
        if (p.conta === null) continue;
        const r = verificarConta(p.conta);
        expect(r.ok, `${ctx}: ${p.conta} → ${r.erro}`).toBe(true);
      }
      for (const texto of [q.explicacao, ...Object.values(q.erros)]) {
        const r = verificarTexto(texto);
        expect(r.ok, `${ctx}: ${texto}`).toBe(true);
      }
    }
    // Cada gerador tem mais de um tipo de questão e todos aparecem.
    expect(tipos.size).toBeGreaterThan(1);
  });

  it('é determinístico pela semente', () => {
    expect(gerarQuestao(slug, 12345)).toEqual(gerarQuestao(slug, 12345));
  });

  it('corrige pela semente', () => {
    const q = gerarQuestao(slug, 777);
    expect(corrigir(slug, 777, q.correta).acertou).toBe(true);
    const errada = (q.correta + 1) % 5;
    const r = corrigir(slug, 777, errada);
    expect(r.acertou).toBe(false);
    expect(r.correta).toBe(q.correta);
  });
});

describe('questões', () => {
  it('a versão sem gabarito não entrega a resposta', () => {
    const q = semGabarito(gerarQuestao('porcentagem', 5));
    expect(q).not.toHaveProperty('correta');
    expect(q).not.toHaveProperty('resposta');
    expect(q).not.toHaveProperty('passos');
    expect(q.alternativas).toHaveLength(5);
  });

  it('rejeita tema, semente e alternativa inválidos', () => {
    expect(() => gerarQuestao('nao-existe', 1)).toThrow();
    expect(() => gerarQuestao('porcentagem', 0)).toThrow();
    expect(() => gerarQuestao('porcentagem', 1.5)).toThrow();
    expect(() => corrigir('porcentagem', 1, 7)).toThrow();
  });

  it('a página de estudo tem 3 exercícios fixos por tema', () => {
    for (const slug of ORDEM.matematica) expect(exerciciosDaPagina(slug)).toHaveLength(3);
  });

  it('o exemplo do design bate: aumento de 25% e desconto de 20% voltam ao preço', () => {
    const achada = SEMENTES.map((s) => gerarQuestao('aumentos-e-descontos-sucessivos', s)).find(
      (q) => q.tipo === 'preco' && q.resumo === 'Aumento de 25% seguido de desconto de 20%',
    );
    expect(achada).toBeTruthy();
    expect(achada.explicacao).toContain('Os fatores se anulam');
  });
});
