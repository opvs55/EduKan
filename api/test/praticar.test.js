import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { gerarQuestao } from '@edukan/conteudo';
import { USUARIO, montar } from './ajuda.js';

const AUTH = { Authorization: 'Bearer token-bom' };

describe('praticar', () => {
  it('entrega questão sem gabarito', async () => {
    const { app } = montar();
    const r = await request(app).get('/api/v1/praticar/escala/questao?semente=42').expect(200);
    expect(r.body.questao.id).toBe('escala:42');
    expect(r.body.questao).not.toHaveProperty('correta');
    await request(app).get('/api/v1/praticar/escala/questao?semente=0').expect(400);
    await request(app).get('/api/v1/praticar/nada/questao').expect(404);
  });

  it('corrige pela semente, sem conta não grava nada', async () => {
    const { app, repo } = montar();
    const q = gerarQuestao('porcentagem', 9);
    const certo = await request(app).post('/api/v1/praticar/corrigir').send({ tema: 'porcentagem', semente: 9, escolha: q.correta }).expect(200);
    expect(certo.body).toMatchObject({ acertou: true, registrado: false, resposta: q.resposta });
    const errado = await request(app)
      .post('/api/v1/praticar/corrigir')
      .send({ tema: 'porcentagem', semente: 9, escolha: (q.correta + 1) % 5 })
      .expect(200);
    expect(errado.body.acertou).toBe(false);
    expect((await repo.estadoDoUsuario(USUARIO.id)).tentativas).toHaveLength(0);
  });

  it('valida a entrada', async () => {
    const { app } = montar();
    const r = await request(app).post('/api/v1/praticar/corrigir').send({ tema: 'porcentagem', semente: 9, escolha: 9 }).expect(400);
    expect(r.body.erro).toBe('DADOS_INVALIDOS');
    await request(app).post('/api/v1/praticar/corrigir').send({ tema: 'xx', semente: 9, escolha: 1 }).expect(400);
  });

  it('com conta, grava a tentativa e abre a revisão no 3º acerto', async () => {
    const { app, repo } = montar();
    for (const s of [1, 2, 3]) {
      const q = gerarQuestao('escala', s);
      const r = await request(app).post('/api/v1/praticar/corrigir').set(AUTH).send({ tema: 'escala', semente: s, escolha: q.correta }).expect(200);
      expect(r.body.registrado).toBe(true);
    }
    const estado = await repo.estadoDoUsuario(USUARIO.id);
    expect(estado.tentativas).toHaveLength(3);
    expect(estado.revisoes.escala).toMatchObject({ base: '2026-10-14', etapa: 0, venceEm: '2026-10-15' });
  });

  it('token inválido → 401', async () => {
    const { app } = montar();
    const r = await request(app)
      .post('/api/v1/praticar/corrigir')
      .set({ Authorization: 'Bearer token-ruim' })
      .send({ tema: 'escala', semente: 1, escolha: 0 })
      .expect(401);
    expect(r.body.erro).toBe('SESSAO_INVALIDA');
  });
});

describe('progresso', () => {
  it('exige conta', async () => {
    const { app } = montar();
    await request(app).get('/api/v1/progresso').expect(401);
  });

  it('importa o progresso do navegador sem confiar no "acertou" dele', async () => {
    const { app } = montar();
    const q1 = gerarQuestao('porcentagem', 1);
    const q2 = gerarQuestao('porcentagem', 2);
    const q3 = gerarQuestao('porcentagem', 3);
    const tentativas = [
      { tema: 'porcentagem', semente: 1, escolha: q1.correta, em: '2026-10-13T12:00:00Z' },
      { tema: 'porcentagem', semente: 2, escolha: q2.correta, em: '2026-10-13T12:01:00Z' },
      { tema: 'porcentagem', semente: 3, escolha: (q3.correta + 1) % 5, acertou: true, em: '2026-10-13T12:02:00Z' },
      { tema: 'tema-inventado', semente: 3, escolha: 0, em: '2026-10-13T12:02:00Z' },
    ];
    const r = await request(app).post('/api/v1/progresso/importar').set(AUTH).send({ tentativas }).expect(200);
    expect(r.body.importadas).toBe(3);
    expect(r.body.resumo.acertos).toBe(2);
    expect(r.body.resumo.temasFeitos).toEqual([]);

    // importar de novo não duplica
    const de2 = await request(app).post('/api/v1/progresso/importar').set(AUTH).send({ tentativas }).expect(200);
    expect(de2.body.importadas).toBe(0);
  });

  it('reconstrói o ciclo de revisão ao importar e conclui a revisão', async () => {
    const { app, relogio } = montar();
    const tentativas = [1, 2, 3].map((s, i) => ({
      tema: 'escala',
      semente: s,
      escolha: gerarQuestao('escala', s).correta,
      em: `2026-10-13T12:0${i}:00Z`,
    }));
    const r = await request(app).post('/api/v1/progresso/importar').set(AUTH).send({ tentativas }).expect(200);
    expect(r.body.estado.revisoes.escala).toMatchObject({ base: '2026-10-13', venceEm: '2026-10-14' });
    expect(r.body.resumo.revisoesHoje.map((x) => x.tema)).toEqual(['escala']);

    relogio.atual = new Date('2026-10-14T18:00:00Z');
    const respostas = [11, 12, 13].map((s) => ({ semente: s, escolha: gerarQuestao('escala', s).correta }));
    const rv = await request(app).post('/api/v1/revisoes/escala').set(AUTH).send({ respostas }).expect(200);
    expect(rv.body).toMatchObject({ acertos: 3, total: 3, ciclo: { etapa: 1, venceEm: '2026-10-16' } });

    await request(app).post('/api/v1/revisoes/porcentagem').set(AUTH).send({ respostas }).expect(409);
  });
});
