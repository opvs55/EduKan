import { useState } from 'react';
import { Link } from 'react-router';
import { Play } from 'lucide-react';
import { DISCIPLINAS, TEMAS, dataComDia, grade, resumo, temaDoDesafio } from '@edukan/conteudo';
import { Tour } from '../componentes/Tour.jsx';
import { Video } from '../componentes/Video.jsx';
import { useProgresso } from '../lib/progresso.jsx';
import { linkDoPost, useSerie } from '../lib/serie.js';

const CICLO = [
  ['Assista', 'O episódio do dia, em 1 minuto.'],
  ['Estude', 'A página do tema, passo a passo.'],
  ['Pratique', 'Exercícios com resposta calculada.'],
  ['Volte amanhã', 'O próximo episódio continua deste.'],
];

function DesafioDoDia({ agora }) {
  const [aberto, setAberto] = useState(false);
  const slug = agora ? temaDoDesafio(agora) : null;
  const tema = slug ? TEMAS[slug] : null;
  return (
    <section className="desafio" aria-labelledby="desafio-titulo">
      <div className="desafio-rotulo rotulo" id="desafio-titulo">
        Desafio do dia
      </div>
      <div className="desafio-corpo">
        {tema ? (
          <>
            <p className="desafio-pergunta">{tema.desafio.pergunta}</p>
            {aberto ? (
              <div className="desafio-resposta" aria-live="polite">
                <strong>{tema.desafio.resposta}</strong>
                {tema.desafio.explicacao} <Link to={`/praticar?tema=${slug}`}>Praticar {tema.titulo.toLowerCase()} →</Link>
              </div>
            ) : (
              <button type="button" className="btn btn-branco" style={{ minWidth: 220 }} onClick={() => setAberto(true)}>
                Responder →
              </button>
            )}
          </>
        ) : (
          <span className="esqueleto" style={{ width: '80%', height: 88, background: 'rgba(255,255,255,0.2)' }} />
        )}
      </div>
    </section>
  );
}

export default function Inicio() {
  const { situacao: s, posts, agora } = useSerie('matematica');
  const { estado } = useProgresso();
  const r = estado && agora ? resumo(estado, agora) : null;
  const trailer = grade('mat-t1')[0];
  const linkTrailer = linkDoPost(posts.get(trailer.chave));

  return (
    <>
      <Tour />
      <section className="heroi">
        <div className="heroi-texto">
          <span className="sobretitulo">Temporada 1 · Matemática para o ENEM</span>
          <h1 className="titulo-xl">Toda conta esconde uma pergunta boa.</h1>
          <p className="lead">
            Um episódio de 1 minuto por dia nas redes. Aqui, a página de estudo de cada tema, com exemplos passo a passo e exercícios corrigidos na
            hora.
          </p>
          <div className="heroi-acoes">
            <Link to="/tema/porcentagem" className="btn btn-primario">
              <Play size={14} fill="currentColor" aria-hidden="true" />
              Começar pelo episódio 1
            </Link>
            <Link to="/serie/matematica" className="btn btn-contorno">
              Ver a temporada
            </Link>
          </div>
        </div>
        <div className="heroi-video">
          <Video rotulo="trailer 9:16 — episódio 0" href={linkTrailer} />
          <span className="discreto" style={{ fontSize: 14 }}>
            {s && !s.estreou ? `A série estreia ${dataComDia(trailer.dia)}, às 19h.` : 'Trailer da temporada: o que a matemática do ENEM tem a ver com o seu dia a dia.'}
          </span>
        </div>
      </section>

      {r && r.revisoesHoje.length > 0 && (
        <div className="revisoes-aviso">
          <div>
            <strong>
              {r.revisoesHoje.length === 1 ? '1 revisão para hoje' : `${r.revisoesHoje.length} revisões para hoje`}
            </strong>
            <div className="discreto" style={{ fontSize: 14 }}>
              uns {r.revisoesHoje.length * 3} minutos
            </div>
          </div>
          <Link to="/progresso" className="link-forte">
            Revisar →
          </Link>
        </div>
      )}

      <section className="passos-ciclo" aria-label="Como funciona">
        {CICLO.map(([titulo, texto], i) => (
          <div className="passo-ciclo" key={titulo}>
            <span className="n">{String(i + 1).padStart(2, '0')}</span>
            <strong>{titulo}</strong>
            <span>{texto}</span>
          </div>
        ))}
      </section>

      <h2 className="secao-titulo rotulo" style={{ fontSize: 14, letterSpacing: '0.08em' }}>
        Matérias
      </h2>
      <section className="materias">
        {DISCIPLINAS.map((d) =>
          d.status === 'no-ar' ? (
            <Link key={d.id} to={`/materia/${d.id}`} className="materia no-ar">
              <span className="tag tag-acento">No ar</span>
              <span className="materia-nome">{d.nome}</span>
              <span className="materia-desc">15 temas{s ? ` · ${s.lancados} ${s.lancados === 1 ? 'episódio lançado' : 'episódios lançados'}` : ''}</span>
              <span className="link-forte">Abrir matéria →</span>
            </Link>
          ) : (
            <div key={d.id} className="materia em-breve">
              <span className="tag tag-contorno">Em breve</span>
              <span className="materia-nome">{d.nome}</span>
              <span className="materia-desc">{d.chamada}</span>
            </div>
          ),
        )}
      </section>

      <DesafioDoDia agora={agora} />
    </>
  );
}
