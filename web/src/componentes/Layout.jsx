import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { useAgora } from '../lib/agora.js';
import { useProgresso } from '../lib/progresso.jsx';
import { iniciais, useSessao } from '../lib/sessao.jsx';
import { metaDaRota } from '../lib/seo.js';
import { resumo } from '@edukan/conteudo';

const NAV = [
  { para: '/materia/matematica', rotulo: 'Matérias', ativoEm: ['/materia', '/tema'] },
  { para: '/serie/matematica', rotulo: 'Série', ativoEm: ['/serie'] },
  { para: '/praticar', rotulo: 'Praticar', ativoEm: ['/praticar'] },
  { para: '/progresso', rotulo: 'Progresso', ativoEm: ['/progresso', '/entrar'] },
];

const ativo = (caminho, item) => item.ativoEm.some((p) => caminho.startsWith(p));

export function Marca({ beta = false }) {
  return (
    <Link to="/" className="marca" aria-label="EduKan, página inicial">
      <span className="marca-quadrado" aria-hidden="true" />
      <span className="marca-nome">EduKan</span>
      {beta && <span className="tag tag-clara">Beta</span>}
    </Link>
  );
}

function Sequencia() {
  const { estado } = useProgresso();
  const agora = useAgora();
  if (!estado || !agora) return null;
  const n = resumo(estado, agora).sequencia;
  if (!n) return null;
  return <span className="cab-sequencia">{n === 1 ? '1 dia seguido' : `${n} dias seguidos`}</span>;
}

function Cabecalho() {
  const { pathname } = useLocation();
  const { usuario, contasAtivas } = useSessao();
  return (
    <header className="cab">
      <Marca beta />
      <nav className="cab-nav" aria-label="Principal">
        {NAV.map((item) => (
          <NavLink key={item.para} to={item.para} className={() => (ativo(pathname, item) ? 'ativo' : '')}>
            {item.rotulo}
          </NavLink>
        ))}
      </nav>
      <div className="cab-extra">
        <Link to="/como-funciona">Como funciona</Link>
        {usuario ? (
          <Link to="/progresso" className="avatar">
            <span className="avatar-letras" aria-hidden="true">
              {iniciais(usuario.nome)}
            </span>
            {usuario.nome}
          </Link>
        ) : (
          contasAtivas && (
            <Link to="/entrar" className="btn btn-contorno btn-p">
              Entrar
            </Link>
          )
        )}
      </div>
      <Sequencia />
    </header>
  );
}

function NavInferior() {
  const { pathname } = useLocation();
  const itens = [
    { para: '/', rotulo: 'Início', ativo: pathname === '/' },
    { para: '/serie/matematica', rotulo: 'Série', ativo: pathname.startsWith('/serie') },
    { para: '/praticar', rotulo: 'Praticar', ativo: pathname.startsWith('/praticar') },
    { para: '/progresso', rotulo: 'Eu', ativo: pathname.startsWith('/progresso') || pathname.startsWith('/entrar') },
  ];
  return (
    <nav className="nav-inferior" aria-label="Atalhos">
      {itens.map((i) => (
        <Link key={i.para} to={i.para} className={i.ativo ? 'ativo' : ''}>
          {i.rotulo}
        </Link>
      ))}
    </nav>
  );
}

function Rodape() {
  return (
    <footer className="rodape">
      <span>Textos gerados com IA a partir de um fichário revisado. Contas calculadas por código.</span>
      <Link to="/como-funciona">Como funciona</Link>
      <Link to="/ajuda">Ajuda</Link>
      <Link to="/privacidade">Privacidade</Link>
      <Link to="/termos">Termos</Link>
    </footer>
  );
}

// Ao trocar de página: volta ao topo (ou à âncora) e atualiza o título.
function AoNavegar() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    document.title = metaDaRota(pathname).titulo;
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export function Layout() {
  return (
    <div className="moldura">
      <AoNavegar />
      <Cabecalho />
      <main className="conteudo" id="conteudo">
        <Outlet />
      </main>
      <Rodape />
      <NavInferior />
    </div>
  );
}
