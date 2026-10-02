const BASE = `${(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')}/api/v1`;

let obterToken = async () => null;
export function definirObterToken(fn) {
  obterToken = fn;
}

export class ErroDaApi extends Error {
  constructor(status, codigo, mensagem) {
    super(mensagem);
    this.status = status;
    this.codigo = codigo;
  }
}

export async function api(caminho, { method = 'GET', corpo, sinal } = {}) {
  const token = await obterToken();
  const headers = {};
  if (corpo !== undefined) headers['content-type'] = 'application/json';
  if (token) headers.authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(BASE + caminho, {
      method,
      headers,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      signal: sinal,
    });
  } catch {
    throw new ErroDaApi(0, 'SEM_CONEXAO', 'Sem conexão com o servidor.');
  }
  const dados = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ErroDaApi(res.status, dados?.erro ?? 'ERRO', dados?.mensagem ?? 'Não foi possível falar com o servidor.');
  }
  return dados;
}
