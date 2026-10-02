import { criarApp } from '../src/app.js';
import { lerConfig } from '../src/config.js';
import { repositorioEmMemoria } from '../src/shared/repositorio.js';

export const USUARIO = { id: '00000000-0000-0000-0000-000000000001', email: 'aluna@exemplo.com' };

export function montar({ agora = new Date('2026-10-14T15:00:00Z'), gemini = null, env = {} } = {}) {
  const repo = repositorioEmMemoria();
  const relogio = { atual: agora };
  const config = lerConfig({ CORS_ORIGINS: 'https://edukan.com.br', OPS_TOKEN: 'segredo', ...env });
  const app = criarApp({
    config,
    repo,
    gemini,
    verificarToken: async (t) => (t === 'token-bom' ? USUARIO : null),
    agora: () => relogio.atual,
    registrar: () => {},
  });
  return { app, repo, relogio };
}
