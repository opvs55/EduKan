import { Link, useParams } from 'react-router';
import { Play } from 'lucide-react';
import {
  ACERTOS_PARA_FEITO,
  TEMAS,
  blocoDoTema,
  dataCurta,
  disciplina,
  etapasDoCiclo,
  exerciciosDaPagina,
  itemDoTema,
  noAr,
  quandoRelativo,
  resumo,
} from '@edukan/conteudo';
import { Destaque } from '../componentes/Conceito.jsx';
import { Passos } from '../componentes/Passos.jsx';
import { Tutor } from '../componentes/Tutor.jsx';
import { Video } from '../componentes/Video.jsx';
import { useProgresso } from '../lib/progresso.jsx';
import { linkDoPost, useSerie } from '../lib/serie.js';
import NaoEncontrado from './NaoEncontrado.jsx';

function Secao({ rotulo, id, alerta, children }) {
  return (
    <section className={`secao${alerta ? ' alerta' : ''}`} id={id} aria-label={rotulo}>
      <div className="rotulo">{rotulo}</div>
      <div className="corpo">{children}</div>
    </section>
  );
}

function RevisaoEspacada({ slug, ciclo, acertos, agora }) {
  if (!agora) return <span className="esqueleto" style={{ height: 60 }} />;
  if (!ciclo) {
    return (
      <p>
        Acerte {ACERTOS_PARA_FEITO} exercícios e este tema volta para revisão em 1, 3, 7 e 21 dias.{' '}
        <strong>
          {Math.min(acertos, ACERTOS_PARA_FEITO)} de {ACERTOS_PARA_FEITO}
        </strong>{' '}
        até agora.
      </p>
    );
  }
  const etapas = etapasDoCiclo(ciclo, agora);
  const vencida = etapas.some((e) => e.vencida);
  return (
    <>
      <div className="ciclo">
        {etapas.map((e) => (
          <div key={e.intervalo} className={e.feita ? 'feita' : e.atual ? 'atual' : ''}>
            <strong>{e.intervalo}d</strong>
            <span>{e.feita ? 'feito' : dataCurta(e.dia)}</span>
          </div>
        ))}
      </div>
      {ciclo.concluida && <p>Ciclo completo. Este tema está firme.</p>}
      {vencida && (
        <Link to={`/praticar?tema=${slug}&modo=revisao`} className="btn btn-primario btn-p">
          Revisar agora →
        </Link>
      )}
    </>
  );
}

export default function Tema() {
  const { slug } = useParams();
  const tema = TEMAS[slug];
  const { posts, agora } = useSerie(tema?.disciplina ?? 'matematica');
  const { estado } = useProgresso();
  if (!tema) return <NaoEncontrado />;

  const bloco = blocoDoTema(slug);
  const d = disciplina(tema.disciplina);
  const item = itemDoTema(slug);
  const link = linkDoPost(posts.get(item.chave));
  const exercicios = exerciciosDaPagina(slug);
  const progresso = estado && agora ? resumo(estado, agora).porTema[slug] : null;
  const certas = new Set(progresso?.sementesCertas ?? []);
  const ciclo = estado?.revisoes?.[slug] ?? null;
  const anterior = tema.anterior ? TEMAS[tema.anterior] : null;
  const proximo = tema.proximo ? TEMAS[tema.proximo] : null;
  const juntos = tema.juntos ? TEMAS[tema.juntos.com] : null;
  const lancado = agora ? noAr(item, agora) : null;

  let textoFaixa = `Este tema é o episódio ${tema.episodio} da série.`;
  if (lancado === true) textoFaixa += ` Lançado em ${dataCurta(item.dia)}.`;
  if (lancado === false) textoFaixa += ` Estreia ${quandoRelativo(item.dia, agora).replace(/^./, (c) => c.toLowerCase())}.`;

  return (
    <>
      <div className="faixa-episodio">
        <span className="codigo">{item.codigo}</span>
        <span className="texto">{textoFaixa}</span>
        {link && (
          <a className="btn btn-primario" href={link} target="_blank" rel="noopener noreferrer">
            <Play size={11} fill="currentColor" aria-hidden="true" />
            Assistir
          </a>
        )}
      </div>
      <div className="dois-um">
        <article>
          <header className="tema-titulo">
            <div className="trilha">
              <Link to={`/materia/${d.id}`}>{d.nome}</Link> / Bloco {bloco.numero} · {bloco.titulo}
            </div>
            <h1 className="titulo-m">{tema.titulo}</h1>
          </header>

          <Secao rotulo="Conceito">
            <p className="conceito">
              <Destaque texto={tema.conceito} />
            </p>
          </Secao>

          <Secao rotulo="Para lembrar">
            <ul className="lista-fatos">
              {tema.fatos.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </Secao>

          <Secao rotulo={tema.exemplos.length > 1 ? 'Exemplos' : 'Exemplo'} id="exemplo">
            {tema.exemplos.map((ex) => (
              <div className="exemplo" key={ex.enunciado}>
                <p className="exemplo-enunciado">{ex.enunciado}</p>
                <Passos passos={ex.passos} resultado={ex.resposta} />
              </div>
            ))}
          </Secao>

          <Secao rotulo="Erro comum" alerta>
            <div className="erro-comum">
              <span className="riscado">{tema.erro_comum.errado}</span>
              <p>{tema.erro_comum.explicacao}</p>
            </div>
          </Secao>

          <Secao rotulo="Exercícios" id="exercicios">
            {exercicios.map((q) => (
              <Link key={q.semente} to={`/praticar?tema=${slug}&semente=${q.semente}`} className="exercicio-linha">
                <span>{q.resumo}</span>
                {certas.has(q.semente) ? <span className="feito">✓ feito</span> : <span className="a-fazer">a fazer</span>}
              </Link>
            ))}
            <Link to={`/praticar?tema=${slug}`} className="btn btn-primario btn-largo" style={{ marginTop: 16 }}>
              Praticar este tema →
            </Link>
          </Secao>

          <nav className="vizinhos" aria-label="Temas vizinhos">
            {anterior ? (
              <Link to={`/tema/${anterior.slug}`}>
                <span>← Anterior · E{String(anterior.episodio).padStart(2, '0')}</span>
                <span>{anterior.titulo}</span>
              </Link>
            ) : (
              <span className="vazio" />
            )}
            {proximo && (
              <Link to={`/tema/${proximo.slug}`} className="proximo">
                <span>Próximo · E{String(proximo.episodio).padStart(2, '0')}</span>
                <span>{proximo.titulo} →</span>
              </Link>
            )}
          </nav>
        </article>

        <aside className="lateral">
          <section>
            <Video rotulo={`episódio ${tema.episodio} — vídeo 9:16`} href={link} />
            <span className="aviso-pequeno">
              {link
                ? 'Também no Instagram e no YouTube Shorts.'
                : lancado === false
                  ? `O vídeo estreia ${quandoRelativo(item.dia, agora).replace(/^./, (c) => c.toLowerCase())}.`
                  : 'O vídeo deste episódio sai nas redes do EduKan.'}
            </span>
          </section>
          {juntos && (
            <section>
              <span className="rotulo">Quando aparecem juntos</span>
              <p>{tema.juntos.texto}</p>
              <Link to={`/tema/${juntos.slug}`} className="link-forte">
                Rever {juntos.titulo} →
              </Link>
            </section>
          )}
          <section>
            <span className="rotulo">Revisão espaçada</span>
            <RevisaoEspacada slug={slug} ciclo={ciclo} acertos={progresso?.acertos ?? 0} agora={agora} />
          </section>
          <section id="tutor">
            <span className="rotulo">Tutor</span>
            <Tutor tema={slug} sugestao={`Por que “${tema.erro_comum.errado}” está errado?`} />
          </section>
        </aside>
      </div>
    </>
  );
}
