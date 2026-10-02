import { Link } from 'react-router';

export default function NaoEncontrado() {
  return (
    <div className="cabecalho-pagina" style={{ padding: '64px var(--gutter)', gap: 24 }}>
      <span className="sobretitulo">Erro 404</span>
      <h1 className="titulo-l">Essa página não existe.</h1>
      <p className="lead">Talvez o link esteja errado, ou o tema mudou de endereço.</p>
      <div className="heroi-acoes">
        <Link to="/materia/matematica" className="btn btn-primario">
          Ver os temas de Matemática →
        </Link>
        <Link to="/" className="btn btn-contorno">
          Ir para o início
        </Link>
      </div>
    </div>
  );
}
