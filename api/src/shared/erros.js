export class ErroApi extends Error {
  constructor(status, codigo, mensagem, extra = {}) {
    super(mensagem);
    this.status = status;
    this.codigo = codigo;
    this.extra = extra;
  }
}

export const ocupado = (mensagem = 'O serviço está ocupado. Tente de novo em instantes.') =>
  new ErroApi(503, 'SERVICE_BUSY', mensagem);

export function tratarErros(registrar = console.error) {
  // eslint-disable-next-line no-unused-vars
  return (err, req, res, next) => {
    if (err instanceof ErroApi) {
      if (err.extra.retryAfter) res.set('Retry-After', String(err.extra.retryAfter));
      return res.status(err.status).json({ erro: err.codigo, mensagem: err.message });
    }
    if (err?.type === 'entity.parse.failed') {
      return res.status(400).json({ erro: 'JSON_INVALIDO', mensagem: 'O corpo da requisição não é um JSON válido.' });
    }
    if (err?.type === 'entity.too.large') {
      return res.status(413).json({ erro: 'GRANDE_DEMAIS', mensagem: 'O corpo da requisição é grande demais.' });
    }
    registrar(err);
    return res.status(500).json({ erro: 'ERRO_INTERNO', mensagem: 'Algo deu errado do nosso lado.' });
  };
}

// Valida com zod e devolve 400 com a primeira mensagem legível.
export function validar(esquema, dados) {
  const r = esquema.safeParse(dados);
  if (!r.success) {
    const p = r.error.issues[0];
    throw new ErroApi(400, 'DADOS_INVALIDOS', `${p.path.join('.') || 'corpo'}: ${p.message}`);
  }
  return r.data;
}
