import { Link, useParams } from 'react-router';
import { ORDEM, TEMAS, dataCurta, disciplina, grade, quandoRelativo } from '@edukan/conteudo';
import { linkDoPost, statusDoItem, useSerie } from '../lib/serie.js';
import NaoEncontrado from './NaoEncontrado.jsx';

// A pista do próximo episódio está no episódio anterior (o fecho do vídeo
// insinua o tema seguinte sem dizer o nome).
function pistaPara(item, disciplinaId) {
  if (!item) return null;
  if (item.tipo === 'trailer') return 'A temporada começa com o trailer: o que a matemática do ENEM tem a ver com o seu dia a dia.';
  if (item.tipo === 'revisao') return `Sábado de revisão: os temas da semana ${item.semana} em 3 exercícios.`;
  const anterior = ORDEM[disciplinaId][item.episodio - 2];
  return anterior ? `Pista: “${TEMAS[anterior].pista}”` : 'O primeiro episódio da temporada.';
}

function Cartao({ item, status, agora, link }) {
  const lancado = item.status === 'no-ar';
  const proximo = item.status === 'hoje' || item.status === 'proximo';
  const ep = item.tipo === 'episodio';
  // Episódios que ainda não saíram não mostram o tema: o suspense é parte da série.
  const titulo = lancado || item.tipo !== 'episodio' ? item.titulo : `Episódio ${item.episodio}`;
  const pista = proximo && ep && item.episodio > 1 ? TEMAS[ORDEM.matematica[item.episodio - 2]].pista : null;
  const corpo = (
    <>
      <div className={`capa ${lancado ? 'lancado' : proximo ? 'proximo' : 'futuro'}`}>
        {lancado ? (link ? '▶ assistir' : 'capa 9:16') : pista ? `pista: “${pista}”` : proximo && item.tipo === 'trailer' ? 'estreia da temporada' : ''}
      </div>
      <div className="episodio-topo">
        <span>{item.tipo === 'revisao' ? 'SÁB' : `E${String(item.episodio).padStart(2, '0')}`}</span>
        <span className={`status ${status.classe}`}>{status.texto}</span>
      </div>
      <span className="episodio-titulo">{titulo}</span>
      {!lancado && agora && !proximo && <span className="episodio-data">{dataCurta(item.dia)}</span>}
    </>
  );
  const classe = `episodio${proximo ? ' destaque' : ''}${!lancado && !proximo && item.status ? ' futuro' : ''}`;
  if (lancado && ep) {
    return (
      <Link to={`/tema/${item.tema}`} className={classe}>
        {corpo}
      </Link>
    );
  }
  return <div className={classe}>{corpo}</div>;
}

export default function Serie() {
  const { disciplina: id } = useParams();
  const d = disciplina(id);
  const { temporada, situacao: s, posts, agora } = useSerie(id);
  if (!d || !temporada) return <NaoEncontrado />;
  const itens = s?.itens ?? grade(temporada.id);
  const proximo = s?.proximo;

  return (
    <>
      <div className="dois-um faixa">
        <div className="cabecalho-pagina">
          <span className="sobretitulo">A série · {d.nome}</span>
          <h1 className="titulo-l">{temporada.titulo}</h1>
          <p className="lead" style={{ fontSize: 18 }}>
            Cada episódio lembra o anterior e termina com uma pista do próximo. De domingo a sexta às 19h. Sábado é dia de revisão.
          </p>
        </div>
        <div className="cabecalho-lado" style={{ gap: 8 }}>
          <span className="rotulo">{proximo?.tipo === 'trailer' ? 'Estreia' : 'Próximo episódio'}</span>
          <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-accent)', lineHeight: 1.1 }}>
            {proximo ? quandoRelativo(proximo.dia, agora) : s ? 'Temporada completa' : ' '}
          </span>
          <span className="discreto" style={{ fontSize: 15 }}>
            {proximo ? pistaPara(proximo, id) : s ? 'Todos os episódios estão no ar. Reveja quando quiser.' : ' '}
          </span>
        </div>
      </div>
      <div className="episodios">
        {itens.map((item) => (
          <Cartao key={item.chave} item={item} status={statusDoItem(item, agora)} agora={agora} link={linkDoPost(posts.get(item.chave))} />
        ))}
      </div>
    </>
  );
}
