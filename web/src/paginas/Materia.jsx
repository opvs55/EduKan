import { Link, useParams } from 'react-router';
import { BLOCOS, TEMAS, disciplina, quandoRelativo, resumo } from '@edukan/conteudo';
import { useProgresso } from '../lib/progresso.jsx';
import { statusDoItem, useSerie } from '../lib/serie.js';
import NaoEncontrado from './NaoEncontrado.jsx';

function EmBreve({ d }) {
  return (
    <>
      <div className="cabecalho-pagina faixa">
        <span className="sobretitulo">Matéria · em breve</span>
        <h1 className="titulo-l">{d.nome}</h1>
        <p className="lead">{d.chamada} Esta matéria ainda está sendo preparada, com fichário revisado e série própria.</p>
      </div>
      <div className="cel">
        <Link to="/materia/matematica" className="btn btn-primario">
          Enquanto isso, comece por Matemática →
        </Link>
      </div>
    </>
  );
}

export default function Materia() {
  const { disciplina: id } = useParams();
  const d = disciplina(id);
  const { situacao: s, agora } = useSerie(id);
  const { estado } = useProgresso();
  if (!d) return <NaoEncontrado />;
  if (d.status !== 'no-ar') return <EmBreve d={d} />;

  const porTema = estado && agora ? resumo(estado, agora).porTema : {};
  const itemDo = (slug) => s?.itens.find((i) => i.tema === slug);
  const total = s?.total ?? 15;

  return (
    <>
      <div className="dois-um faixa">
        <div className="cabecalho-pagina">
          <span className="sobretitulo">Matéria · {d.nivel}</span>
          <h1 className="titulo-l">{d.nome}</h1>
          <p className="lead" style={{ fontSize: 18 }}>
            {d.descricao}
          </p>
        </div>
        <div className="cabecalho-lado">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 600 }}>
            <span>Episódios lançados</span>
            <span>{s ? `${s.lancados} de ${total}` : `— de ${total}`}</span>
          </div>
          <div className="barra-segmentos" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }} aria-hidden="true">
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={s && i < s.lancados ? 'cheio' : ''} />
            ))}
          </div>
          <span className="discreto" style={{ fontSize: 14 }}>
            {s?.proximo
              ? s.proximo.tipo === 'trailer'
                ? `A série estreia ${quandoRelativo(s.proximo.dia, agora).toLowerCase()}.`
                : `Próximo episódio: ${quandoRelativo(s.proximo.dia, agora).toLowerCase()}`
              : s
                ? 'Temporada completa.'
                : ' '}
          </span>
        </div>
      </div>
      <div className="blocos">
        {BLOCOS[id].map((b) => (
          <section className="bloco" key={b.numero} aria-labelledby={`bloco-${b.numero}`}>
            <div className="bloco-cab">
              <span>Bloco {b.numero}</span>
              <span id={`bloco-${b.numero}`}>{b.titulo}</span>
            </div>
            {b.temas.map((slug) => {
              const t = TEMAS[slug];
              const feito = porTema[slug]?.feito;
              const item = itemDo(slug);
              const st = feito ? { texto: '✓ Feito', classe: 'status-feito' } : statusDoItem(item, agora);
              const futuro = !feito && item && item.status !== 'no-ar';
              return (
                <Link key={slug} to={`/tema/${slug}`} className={`tema-linha${futuro ? ' futuro' : ''}`}>
                  <span className="tema-linha-topo">
                    <span>E{String(t.episodio).padStart(2, '0')}</span>
                    <span className={`status ${st.classe}`}>{st.texto}</span>
                  </span>
                  <span className="tema-linha-titulo">{t.titulo}</span>
                </Link>
              );
            })}
          </section>
        ))}
      </div>
    </>
  );
}
