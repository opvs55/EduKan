import { Router } from 'express';
import { z } from 'zod';
import { TEMAS, corrigir, gerarQuestao, novaSemente, semGabarito } from '@edukan/conteudo';
import { ErroApi, validar } from '../../shared/erros.js';
import { registrarParaUsuario } from '../progresso/servico.js';

const semente = z.number().int().min(1).max(2147483646);

const esquemaCorrecao = z.object({
  tema: z.string().refine((s) => !!TEMAS[s], 'tema desconhecido'),
  semente,
  escolha: z.number().int().min(0).max(4),
  modo: z.enum(['pratica', 'revisao']).default('pratica'),
});

export function rotasPraticar({ repo, agora }) {
  const r = Router();

  // Uma questão sem o gabarito. Sem ?semente, sorteia uma.
  r.get('/praticar/:tema/questao', (req, res) => {
    const { tema } = req.params;
    if (!TEMAS[tema]) throw new ErroApi(404, 'NAO_ENCONTRADO', 'Tema não encontrado.');
    const s = req.query.semente === undefined ? novaSemente() : validar(semente, Number(req.query.semente));
    res.json({ questao: semGabarito(gerarQuestao(tema, s)) });
  });

  // Corrige pela semente: a questão é refeita aqui, então a resposta certa
  // nunca depende do que o navegador diz. Com sessão, grava a tentativa.
  r.post('/praticar/corrigir', async (req, res) => {
    const dados = validar(esquemaCorrecao, req.body);
    const resultado = corrigir(dados.tema, dados.semente, dados.escolha);
    let registrado = false;
    if (req.usuario) {
      await registrarParaUsuario(repo, req.usuario.id, [{ ...dados, acertou: resultado.acertou }], agora());
      registrado = true;
    }
    res.json({ ...resultado, registrado });
  });

  return r;
}
