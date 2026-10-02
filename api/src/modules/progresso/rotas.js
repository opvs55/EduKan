import { Router } from 'express';
import { z } from 'zod';
import { TEMAS, estadoVazio, registrarTentativa, resumo } from '@edukan/conteudo';
import { exigirUsuario } from '../../middleware/auth.js';
import { ErroApi, validar } from '../../shared/erros.js';
import { concluirRevisaoDoUsuario, recorrigir } from './servico.js';

const resposta = z.object({
  semente: z.number().int().min(1).max(2147483646),
  escolha: z.number().int().min(0).max(4),
});

const tentativaLocal = resposta.extend({
  tema: z.string(),
  modo: z.enum(['pratica', 'revisao']).default('pratica'),
  em: z.iso.datetime({ offset: true }),
});

const dia = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const ciclo = z.object({
  base: dia,
  etapa: z.number().int().min(0).max(4),
  venceEm: dia.nullable(),
  concluida: z.boolean(),
});

const esquemaImportar = z.object({
  tentativas: z.array(tentativaLocal).max(2000),
  revisoes: z.record(z.string(), ciclo).default({}),
});

const esquemaRevisao = z.object({
  respostas: z.array(resposta).min(1).max(10),
});

export function rotasProgresso({ repo, agora }) {
  const r = Router();

  r.get('/progresso', exigirUsuario, async (req, res) => {
    const estado = await repo.estadoDoUsuario(req.usuario.id);
    res.json({ estado, resumo: resumo(estado, agora()) });
  });

  // Ao entrar pela primeira vez, o site manda o que ficou guardado no
  // navegador. Só entram tentativas que ainda não estão na conta.
  r.post('/progresso/importar', exigirUsuario, async (req, res) => {
    const { tentativas, revisoes } = validar(esquemaImportar, req.body);
    const atual = await repo.estadoDoUsuario(req.usuario.id);
    const vistas = new Set(atual.tentativas.map((t) => `${t.tema}:${t.semente}:${new Date(t.em).getTime()}`));
    const instante = agora().getTime();
    const novas = recorrigir(tentativas)
      .filter((t) => Date.parse(t.em) <= instante + 60_000)
      .filter((t) => !vistas.has(`${t.tema}:${t.semente}:${Date.parse(t.em)}`))
      .sort((a, b) => Date.parse(a.em) - Date.parse(b.em));
    await repo.inserirTentativas(req.usuario.id, novas);

    // Ciclos de revisão que a conta ainda não tem: usa o do navegador ou,
    // se não houver, reconstrói pelas tentativas.
    const depois = await repo.estadoDoUsuario(req.usuario.id);
    let simulado = estadoVazio();
    for (const t of depois.tentativas) simulado = registrarTentativa(simulado, t, new Date(t.em));
    for (const [tema, c] of Object.entries({ ...simulado.revisoes, ...revisoes })) {
      if (!depois.revisoes[tema] && TEMAS[tema] && simulado.revisoes[tema]) await repo.salvarRevisao(req.usuario.id, tema, c);
    }
    const estado = await repo.estadoDoUsuario(req.usuario.id);
    res.json({ importadas: novas.length, estado, resumo: resumo(estado, agora()) });
  });

  r.post('/revisoes/:tema', exigirUsuario, async (req, res) => {
    const { tema } = req.params;
    if (!TEMAS[tema]) throw new ErroApi(404, 'NAO_ENCONTRADO', 'Tema não encontrado.');
    const { respostas } = validar(esquemaRevisao, req.body);
    const r2 = await concluirRevisaoDoUsuario(repo, req.usuario.id, tema, respostas, agora());
    if (!r2) throw new ErroApi(409, 'SEM_REVISAO', 'Este tema ainda não está em revisão.');
    res.json(r2);
  });

  return r;
}
