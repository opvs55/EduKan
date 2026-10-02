import { ErroApi } from '../shared/erros.js';

// Lê "Authorization: Bearer <token do Supabase>" e põe o usuário em req.usuario.
// Token presente e inválido → 401 (o site renova a sessão e tenta de novo).
export function identificar(verificarToken) {
  return async (req, res, next) => {
    const cabecalho = req.get('authorization') ?? '';
    const [tipo, token] = cabecalho.split(' ');
    if (tipo !== 'Bearer' || !token) return next();
    if (!verificarToken) return next(new ErroApi(503, 'SEM_CONTAS', 'As contas ainda não estão ativadas.'));
    try {
      const usuario = await verificarToken(token);
      if (!usuario) return next(new ErroApi(401, 'SESSAO_INVALIDA', 'Sua sessão expirou. Entre de novo.'));
      req.usuario = usuario;
      next();
    } catch (e) {
      next(e);
    }
  };
}

export function exigirUsuario(req, res, next) {
  if (!req.usuario) return next(new ErroApi(401, 'SEM_SESSAO', 'Entre na sua conta para ver isso.'));
  next();
}

// Valida o token no Supabase, com cache curto para não chamar a cada requisição.
export function verificadorSupabase(supabase, { ttlMs = 60_000, agora = () => Date.now() } = {}) {
  const cache = new Map();
  return async (token) => {
    const ms = agora();
    const c = cache.get(token);
    if (c && c.ate > ms) return c.usuario;
    const { data, error } = await supabase.auth.getUser(token);
    const usuario = error || !data?.user ? null : { id: data.user.id, email: data.user.email ?? null };
    if (cache.size > 5000) cache.clear();
    cache.set(token, { usuario, ate: ms + ttlMs });
    return usuario;
  };
}
