import { Router } from 'express';
import { z } from 'zod';
import { TEMAS, verificarTexto } from '@edukan/conteudo';
import { limitarPorIp } from '../../middleware/limites.js';
import { ErroApi, validar } from '../../shared/erros.js';
import { instrucaoDoTutor } from './prompt.js';

const esquema = z.object({
  tema: z.string().refine((s) => !!TEMAS[s], 'tema desconhecido'),
  pergunta: z.string().trim().min(3, 'escreva uma pergunta').max(500, 'pergunta longa demais'),
  historico: z
    .array(z.object({ papel: z.enum(['user', 'model']), texto: z.string().max(1500) }))
    .max(6)
    .default([]),
});

const TENTATIVAS = 3;
export const RESPOSTA_RESERVA =
  'Não consegui conferir as contas da minha resposta agora. Veja o exemplo resolvido nesta página e tente de novo daqui a pouco.';

export function rotasTutor({ gemini, escudo, config, registrar = console.error }) {
  const r = Router();
  const limite = limitarPorIp({ nome: 'tutor', max: config.tutorPorIpHora, janelaMs: 3600_000, confiarCloudflare: config.confiarCloudflare });

  r.post('/tutor', limite, async (req, res) => {
    const { tema, pergunta, historico } = validar(esquema, req.body);
    if (!gemini) throw new ErroApi(503, 'TUTOR_INDISPONIVEL', 'O tutor ainda não está disponível.');
    const sistema = instrucaoDoTutor(TEMAS[tema]);
    const mensagens = [...historico, { papel: 'user', texto: pergunta }];

    // Regra 2 do guia: toda conta que a IA escreve é conferida por código.
    // Errou a conta → pede de novo dizendo qual (até 3 vezes).
    const resposta = await escudo.executar(async () => {
      for (let i = 0; i < TENTATIVAS; i++) {
        let texto;
        try {
          texto = await gemini.responder({ sistema, mensagens });
        } catch (e) {
          registrar(e);
          if (i === TENTATIVAS - 1) throw new ErroApi(502, 'TUTOR_FALHOU', 'O tutor não respondeu. Tente de novo.');
          continue;
        }
        const conferencia = verificarTexto(texto);
        if (conferencia.ok) return { texto, conferida: true };
        const erradas = conferencia.contas.filter((c) => !c.ok).map((c) => c.conta);
        mensagens.push({ papel: 'model', texto: JSON.stringify({ resposta: texto }) });
        mensagens.push({
          papel: 'user',
          texto: `Sua resposta tem conta errada: ${erradas.join('; ')}. Refaça a resposta inteira com as contas certas.`,
        });
      }
      return { texto: RESPOSTA_RESERVA, conferida: false };
    });

    res.json({ resposta: resposta.texto, conferida: resposta.conferida });
  });

  return r;
}
