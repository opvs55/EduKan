import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { montar } from './ajuda.js';

describe('conteúdo', () => {
  const { app, repo } = montar();

  it('lista disciplinas e temas', async () => {
    const d = await request(app).get('/api/v1/disciplinas').expect(200);
    expect(d.body.disciplinas.map((x) => x.id)).toEqual(['matematica', 'historia', 'sociologia', 'programacao']);
    const t = await request(app).get('/api/v1/temas?disciplina=matematica').expect(200);
    expect(t.body.temas).toHaveLength(15);
    expect(t.body.blocos).toHaveLength(4);
    await request(app).get('/api/v1/temas?disciplina=quimica').expect(404);
  });

  it('entrega o fichário de um tema', async () => {
    const r = await request(app).get('/api/v1/temas/juros-compostos').expect(200);
    expect(r.body.tema).toMatchObject({ slug: 'juros-compostos', episodio: 4, anterior: 'juros-simples' });
    await request(app).get('/api/v1/temas/nada').expect(404);
  });

  it('mostra a série com status e o link do post publicado', async () => {
    repo._publicar('mat:t1e01:porcentagem', { plataforma: 'instagram', permalink: 'https://instagram.com/p/x', publicadoEm: '2026-10-12T22:00:00Z' });
    const r = await request(app).get('/api/v1/series/matematica').expect(200);
    const e1 = r.body.itens.find((i) => i.tema === 'porcentagem');
    expect(e1.status).toBe('no-ar');
    expect(e1.posts[0].permalink).toBe('https://instagram.com/p/x');
    expect(r.body.proximo.status).toBe('hoje');
    await request(app).get('/api/v1/series/historia').expect(404);
  });

  it('diz o plano e o desafio do dia', async () => {
    const r = await request(app).get('/api/v1/hoje').expect(200);
    expect(r.body.dia).toBe('2026-10-14');
    expect(r.body.plano.tipo).toBe('episodio');
    expect(r.body.desafio.pergunta).toBeTruthy();
  });
});

describe('infra', () => {
  it('responde saúde e 404 em JSON', async () => {
    const { app } = montar();
    const s = await request(app).get('/api/v1/saude').expect(200);
    expect(s.body).toMatchObject({ ok: true, banco: 'memoria', ia: 'desligada' });
    const n = await request(app).get('/api/v1/nada').expect(404);
    expect(n.body.erro).toBe('NAO_ENCONTRADO');
  });

  it('libera CORS só para as origens configuradas', async () => {
    const { app } = montar();
    const ok = await request(app).options('/api/v1/praticar/corrigir').set('Origin', 'https://edukan.com.br').expect(204);
    expect(ok.headers['access-control-allow-origin']).toBe('https://edukan.com.br');
    const nao = await request(app).get('/api/v1/disciplinas').set('Origin', 'https://outro.site');
    expect(nao.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('protege /ops/estado com o OPS_TOKEN', async () => {
    const { app } = montar();
    await request(app).get('/api/v1/ops/estado').expect(401);
    await request(app).get('/api/v1/ops/estado').set('x-ops-token', 'errado').expect(401);
    const r = await request(app).get('/api/v1/ops/estado').set('x-ops-token', 'segredo').expect(200);
    expect(r.body.tutor.orcamentoDiario).toBe(500);
  });

  it('guarda erros do navegador', async () => {
    const { app, repo } = montar();
    await request(app).post('/api/v1/ops/erros').send({ mensagem: 'x is undefined', url: '/tema/escala' }).expect(204);
    expect(repo._erros[0]).toMatchObject({ origem: 'navegador', mensagem: 'x is undefined' });
  });

  it('limita por IP usando o CF-Connecting-IP', async () => {
    const { app } = montar();
    for (let i = 0; i < 30; i++) await request(app).post('/api/v1/ops/erros').set('CF-Connecting-IP', '1.1.1.1').send({ mensagem: 'e' }).expect(204);
    const r = await request(app).post('/api/v1/ops/erros').set('CF-Connecting-IP', '1.1.1.1').send({ mensagem: 'e' }).expect(429);
    expect(r.headers['retry-after']).toBeTruthy();
    // outro visitante não é afetado
    await request(app).post('/api/v1/ops/erros').set('CF-Connecting-IP', '2.2.2.2').send({ mensagem: 'e' }).expect(204);
  });

  it('JSON inválido vira 400', async () => {
    const { app } = montar();
    const r = await request(app).post('/api/v1/praticar/corrigir').set('content-type', 'application/json').send('{oops').expect(400);
    expect(r.body.erro).toBe('JSON_INVALIDO');
  });
});
