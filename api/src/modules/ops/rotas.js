import { Router } from 'express';
import { z } from 'zod';
import { timingSafeEqual } from 'node:crypto';
import { limitarPorIp } from '../../middleware/limites.js';
import { ErroApi, validar } from '../../shared/erros.js';

const esquemaErro = z.object({
  mensagem: z.string().max(2000),
  pilha: z.string().max(8000).optional(),
  url: z.string().max(500).optional(),
});

function tokenConfere(recebido, esperado) {
  const a = Buffer.from(recebido ?? '');
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function rotasOps({ repo, escudo, config, gemini, inicio }) {
  const r = Router();
  const limiteErros = limitarPorIp({ nome: 'erros', max: 30, janelaMs: 3600_000, confiarCloudflare: config.confiarCloudflare });

  // Pública: usada pelo monitor e pelo Render (health check).
  r.get('/saude', async (req, res) => {
    let banco = 'desligado';
    try {
      banco = await repo.saude();
    } catch {
      banco = 'erro';
    }
    res.set('Cache-Control', 'no-store');
    res.status(banco === 'erro' ? 503 : 200).json({ ok: banco !== 'erro', banco, ia: gemini ? 'ligada' : 'desligada' });
  });

  // Erros do navegador (window.onerror), para saber o que quebra em produção.
  r.post('/ops/erros', limiteErros, async (req, res) => {
    const e = validar(esquemaErro, req.body);
    await repo.registrarErro({ origem: 'navegador', ...e, navegador: req.get('user-agent')?.slice(0, 300) ?? null });
    res.status(204).end();
  });

  r.get('/ops/estado', (req, res) => {
    if (!config.opsToken || !tokenConfere(req.get('x-ops-token'), config.opsToken)) {
      throw new ErroApi(401, 'NAO_AUTORIZADO', 'Token de operação inválido.');
    }
    res.json({
      noArDesde: inicio.toISOString(),
      memoriaMb: Math.round(process.memoryUsage().rss / 1e6),
      tutor: escudo.estado(),
      ia: gemini ? gemini.modelo : null,
    });
  });

  return r;
}
