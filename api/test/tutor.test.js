import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { RESPOSTA_RESERVA } from '../src/modules/tutor/rotas.js';
import { instrucaoDoTutor } from '../src/modules/tutor/prompt.js';
import { TEMAS } from '@edukan/conteudo';
import { montar } from './ajuda.js';

function geminiFalso(respostas) {
  const chamadas = [];
  return {
    modelo: 'falso',
    chamadas,
    async responder(args) {
      chamadas.push(structuredClone(args));
      const r = respostas[Math.min(chamadas.length - 1, respostas.length - 1)];
      if (r instanceof Error) throw r;
      return r;
    },
  };
}

const corpo = { tema: 'aumentos-e-descontos-sucessivos', pergunta: 'Por que não posso somar as porcentagens?' };

describe('tutor', () => {
  it('sem chave do Gemini, responde 503', async () => {
    const { app } = montar();
    const r = await request(app).post('/api/v1/tutor').send(corpo).expect(503);
    expect(r.body.erro).toBe('TUTOR_INDISPONIVEL');
  });

  it('responde quando as contas conferem, com o fichário no prompt', async () => {
    const gemini = geminiFalso(['O segundo desconto vale sobre o novo preço: 200 × 0,90 = 180, e 180 × 0,90 = 162.']);
    const { app } = montar({ gemini });
    const r = await request(app).post('/api/v1/tutor').send(corpo).expect(200);
    expect(r.body).toMatchObject({ conferida: true });
    expect(gemini.chamadas[0].sistema).toContain('Porcentagens aplicadas em sequência se multiplicam');
    expect(gemini.chamadas[0].mensagens.at(-1)).toEqual({ papel: 'user', texto: corpo.pergunta });
  });

  it('conta errada → pede de novo dizendo qual', async () => {
    const gemini = geminiFalso(['Veja: 200 × 0,90 = 170.', 'Veja: 200 × 0,90 = 180.']);
    const { app } = montar({ gemini });
    const r = await request(app).post('/api/v1/tutor').send(corpo).expect(200);
    expect(r.body.resposta).toBe('Veja: 200 × 0,90 = 180.');
    expect(gemini.chamadas[1].mensagens.at(-1).texto).toContain('200 × 0,90 = 170');
  });

  it('errou 3 vezes → resposta reserva, nunca a conta errada', async () => {
    const gemini = geminiFalso(['2 + 2 = 5']);
    const { app } = montar({ gemini });
    const r = await request(app).post('/api/v1/tutor').send(corpo).expect(200);
    expect(r.body).toEqual({ resposta: RESPOSTA_RESERVA, conferida: false });
    expect(gemini.chamadas).toHaveLength(3);
  });

  it('falha do Gemini → tenta de novo e, por fim, 502', async () => {
    const ok = geminiFalso([new Error('timeout'), 'Tudo certo: 1 + 1 = 2.']);
    const r1 = await request(montar({ gemini: ok }).app).post('/api/v1/tutor').send(corpo).expect(200);
    expect(r1.body.conferida).toBe(true);
    const ruim = geminiFalso([new Error('timeout')]);
    await request(montar({ gemini: ruim }).app).post('/api/v1/tutor').send(corpo).expect(502);
  });

  it('valida pergunta e tema e limita por IP', async () => {
    const gemini = geminiFalso(['Certo.']);
    const { app } = montar({ gemini, env: { TUTOR_PER_IP_HOUR: '2' } });
    await request(app).post('/api/v1/tutor').send({ ...corpo, pergunta: 'a' }).expect(400);
    await request(app).post('/api/v1/tutor').send({ ...corpo, tema: 'xx' }).expect(400);
    // cada IP tem o próprio limite (2 por hora neste teste)
    await request(app).post('/api/v1/tutor').set('CF-Connecting-IP', '9.9.9.9').send(corpo).expect(200);
    await request(app).post('/api/v1/tutor').set('CF-Connecting-IP', '9.9.9.9').send(corpo).expect(200);
    await request(app).post('/api/v1/tutor').set('CF-Connecting-IP', '9.9.9.9').send(corpo).expect(429);
  });

  it('o orçamento diário de IA vira 503 SERVICE_BUSY', async () => {
    const gemini = geminiFalso(['Certo.']);
    const { app } = montar({ gemini, env: { AI_DAILY_BUDGET: '1' } });
    await request(app).post('/api/v1/tutor').send(corpo).expect(200);
    const r = await request(app).post('/api/v1/tutor').send(corpo).expect(503);
    expect(r.body.erro).toBe('SERVICE_BUSY');
  });

  it('o prompt traz as regras de não fazer a lição e de conferir contas', () => {
    const p = instrucaoDoTutor(TEMAS['juros-simples']);
    expect(p).toContain('Não resolva o exercício');
    expect(p).toContain('J = C × i × t');
    expect(p).toContain('≠');
  });
});
