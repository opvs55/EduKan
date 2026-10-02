import { ErroApi } from '../shared/erros.js';

// IP do visitante. Atrás do Render + Cloudflare ele vem em CF-Connecting-IP;
// sem isso, todo mundo teria o IP do proxy e o limite por IP viraria global.
export function ipDoCliente(req, confiarCloudflare) {
  const cf = req.get('cf-connecting-ip');
  if (confiarCloudflare && cf) return cf.trim();
  return req.ip ?? req.socket?.remoteAddress ?? 'desconhecido';
}

// Janela fixa por IP, em memória.
export function limitarPorIp({ nome, max, janelaMs, confiarCloudflare = true, agora = () => Date.now() }) {
  const contagens = new Map();
  let ultimaLimpeza = 0;
  return (req, res, next) => {
    const ms = agora();
    if (ms - ultimaLimpeza > janelaMs) {
      for (const [k, v] of contagens) if (v.fim <= ms) contagens.delete(k);
      ultimaLimpeza = ms;
    }
    const chave = `${nome}:${ipDoCliente(req, confiarCloudflare)}`;
    let c = contagens.get(chave);
    if (!c || c.fim <= ms) {
      c = { n: 0, fim: ms + janelaMs };
      contagens.set(chave, c);
    }
    c.n++;
    if (c.n > max) {
      const espera = Math.ceil((c.fim - ms) / 1000);
      return next(new ErroApi(429, 'LIMITE', 'Muitas requisições. Espere um pouco e tente de novo.', { retryAfter: espera }));
    }
    next();
  };
}
