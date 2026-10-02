import { useState } from 'react';
import { Link, Navigate } from 'react-router';
import { useSessao } from '../lib/sessao.jsx';

export default function Entrar() {
  const { usuario, contasAtivas, entrar } = useSessao();
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState(false);
  const [estado, setEstado] = useState('editando');
  const [erro, setErro] = useState(null);

  if (usuario) return <Navigate to="/progresso" replace />;

  const enviar = async (e) => {
    e.preventDefault();
    setErro(null);
    setEstado('enviando');
    try {
      await entrar({ email: email.trim(), nome: nome.trim() });
      setEstado('enviado');
    } catch (err) {
      setErro(err.message ?? 'Não foi possível enviar o link.');
      setEstado('editando');
    }
  };

  return (
    <div className="dois-um">
      <div className="cabecalho-pagina" style={{ gap: 24 }}>
        <span className="sobretitulo">Sua conta</span>
        <h1 className="titulo-m">Entrar</h1>
        {!contasAtivas ? (
          <p className="lead">
            As contas ainda não foram ativadas. Enquanto isso, tudo funciona sem cadastro e o seu progresso fica salvo neste aparelho.{' '}
            <Link to="/praticar">Praticar agora →</Link>
          </p>
        ) : estado === 'enviado' ? (
          <div aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p className="lead">
              Pronto. Mandamos um link para <strong>{email}</strong>. Abra o e-mail neste aparelho e toque no link para entrar.
            </p>
            <button type="button" className="btn btn-contorno btn-p" style={{ alignSelf: 'flex-start' }} onClick={() => setEstado('editando')}>
              Usar outro e-mail
            </button>
          </div>
        ) : (
          <form className="formulario" onSubmit={enviar}>
            <p className="lead" style={{ fontSize: 17 }}>
              Sem senha: você recebe um link no e-mail. Com a conta, o progresso vai com você para qualquer aparelho.
            </p>
            <label>
              E-mail
              <input className="campo" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              Como quer ser chamado (opcional)
              <input className="campo" type="text" maxLength={40} autoComplete="given-name" value={nome} onChange={(e) => setNome(e.target.value)} />
            </label>
            <label className="marcar">
              <input type="checkbox" required checked={idade} onChange={(e) => setIdade(e.target.checked)} />
              <span>
                Tenho 13 anos ou mais e li a <Link to="/privacidade">política de privacidade</Link>.
              </span>
            </label>
            {erro && <span className="mensagem-erro">{erro}</span>}
            <button type="submit" className="btn btn-primario btn-largo" disabled={estado === 'enviando'} style={{ alignSelf: 'flex-start' }}>
              {estado === 'enviando' ? 'Enviando…' : 'Enviar link de acesso →'}
            </button>
          </form>
        )}
      </div>
      <div className="cabecalho-lado" style={{ justifyContent: 'flex-start', paddingTop: 48 }}>
        <span className="rotulo">O que fica guardado</span>
        <p className="discreto" style={{ fontSize: 15 }}>
          Só o seu e-mail, o nome que você escolher e as suas respostas (tema, questão e alternativa). Nada de telefone, escola ou documento. Você pode
          pedir para apagar tudo quando quiser.
        </p>
      </div>
    </div>
  );
}
