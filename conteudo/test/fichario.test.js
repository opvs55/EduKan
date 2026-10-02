import { describe, expect, it } from 'vitest';
import { BLOCOS, ORDEM, TEMAS, temasDaDisciplina } from '../src/catalogo.js';
import { TEMAS as TEMAS_FICHARIO } from '../src/fichario/matematica.js';
import { GERADORES } from '../src/geradores/index.js';
import { verificarConta, verificarTexto } from '../src/verificador.js';

const temas = temasDaDisciplina('matematica');

describe('fichário de Matemática', () => {
  it('tem a temporada de 15 temas em 4 blocos', () => {
    expect(temas).toHaveLength(15);
    expect(BLOCOS.matematica).toHaveLength(4);
    expect(BLOCOS.matematica.flatMap((b) => b.temas)).toEqual(ORDEM.matematica);
    expect(Object.keys(TEMAS_FICHARIO).sort()).toEqual([...ORDEM.matematica].sort());
  });

  it.each(temas.map((t) => [t.slug, t]))('%s tem todos os campos', (_, t) => {
    for (const campo of ['titulo', 'resumo', 'gancho', 'conceito']) expect(t[campo], campo).toMatch(/\S/);
    expect(t.conceito).toMatch(/\*\*.+\*\*/);
    expect(t.fatos.length).toBeGreaterThanOrEqual(3);
    expect(t.exemplos.length).toBeGreaterThanOrEqual(1);
    expect(t.erro_comum.errado).toBeTruthy();
    expect(t.erro_comum.explicacao).toBeTruthy();
    expect(t.desafio.pergunta && t.desafio.resposta && t.desafio.explicacao).toBeTruthy();
    expect(GERADORES[t.gerador], `gerador ${t.gerador}`).toBeTypeOf('function');
    for (const p of t.pre_requisitos) expect(TEMAS[p], `pré-requisito ${p}`).toBeTruthy();
    if (t.juntos) expect(TEMAS[t.juntos.com], `juntos.com ${t.juntos.com}`).toBeTruthy();
  });

  it.each(temas.map((t) => [t.slug, t]))('%s: toda conta dos exemplos confere', (_, t) => {
    for (const ex of t.exemplos) {
      for (const p of ex.passos) {
        if (p.conta === null) continue;
        const r = verificarConta(p.conta);
        expect(r.ok, `${p.conta} → ${r.erro}`).toBe(true);
      }
    }
  });

  it.each(temas.map((t) => [t.slug, t]))('%s: contas do desafio e de "juntos" conferem', (_, t) => {
    for (const texto of [t.desafio.explicacao, t.juntos?.texto ?? '', ...t.fatos]) {
      const r = verificarTexto(texto);
      expect(r.ok, JSON.stringify(r.contas.filter((c) => !c.ok))).toBe(true);
    }
  });

  it('o fecho (pista) não diz o nome do próximo tema', () => {
    for (const t of temas) {
      if (!t.proximo) {
        expect(t.pista).toBeNull();
        continue;
      }
      const proximo = TEMAS[t.proximo].titulo.toLowerCase();
      expect(t.pista.toLowerCase()).not.toContain(proximo);
    }
  });
});
