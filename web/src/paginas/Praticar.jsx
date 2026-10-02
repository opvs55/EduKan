import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  ACERTOS_PARA_FEITO,
  BLOCOS,
  QUESTOES_PRATICA,
  QUESTOES_REVISAO,
  TEMAS,
  dataComDia,
  gerarQuestao,
  novaSemente,
  resumo,
  sementeValida,
} from '@edukan/conteudo';
import { Grafico } from '../componentes/Grafico.jsx';
import { Passos } from '../componentes/Passos.jsx';
import { useAgora } from '../lib/agora.js';
import { useProgresso } from '../lib/progresso.jsx';

const LETRAS = 'ABCDE';

function Escolher() {
  const agora = useAgora();
  const { estado } = useProgresso();
  const r = estado && agora ? resumo(estado, agora) : null;
  return (
    <>
      <div className="cabecalho-pagina faixa">
        <span className="sobretitulo">Praticar · Matemática</span>
        <h1 className="titulo-l">Escolha um tema</h1>
        <p className="lead" style={{ fontSize: 18 }}>
          Cinco questões por vez, geradas e corrigidas na hora. Valores e resposta saem de um gerador em código; a explicação vem do fichário revisado.
        </p>
      </div>
      {r && r.revisoesHoje.length > 0 && (
        <div className="cel faixa">
          <span className="rotulo" style={{ display: 'block', marginBottom: 16 }}>
            Revisão de hoje
          </span>
          {r.revisoesHoje.map((c) => (
            <div className="revisao-linha" key={c.tema}>
              <div>
                <strong>{TEMAS[c.tema].titulo}</strong>
                <span className="discreto">
                  {c.ordem}ª revisão · intervalo de {c.intervalo} {c.intervalo === 1 ? 'dia' : 'dias'}
                </span>
              </div>
              <span className="discreto qtd">{QUESTOES_REVISAO} questões</span>
              <Link to={`/praticar?tema=${c.tema}&modo=revisao`} className="btn btn-primario btn-p">
                Revisar →
              </Link>
            </div>
          ))}
        </div>
      )}
      <div className="blocos">
        {BLOCOS.matematica.map((b) => (
          <section className="bloco" key={b.numero} aria-labelledby={`pb-${b.numero}`}>
            <div className="bloco-cab">
              <span>Bloco {b.numero}</span>
              <span id={`pb-${b.numero}`}>{b.titulo}</span>
            </div>
            {b.temas.map((slug) => {
              const p = r?.porTema[slug];
              return (
                <Link key={slug} to={`/praticar?tema=${slug}`} className="tema-linha">
                  <span className="tema-linha-topo">
                    <span>E{String(TEMAS[slug].episodio).padStart(2, '0')}</span>
                    <span className={`status ${p?.feito ? 'status-feito' : 'status-em-breve'}`}>
                      {p?.feito ? '✓ Feito' : p ? `${p.acertos} de ${p.tentativas}` : ''}
                    </span>
                  </span>
                  <span className="tema-linha-titulo">{TEMAS[slug].titulo}</span>
                </Link>
              );
            })}
          </section>
        ))}
      </div>
    </>
  );
}

function FimDaSessao({ tema, modo, respostas, ciclo, feitoAgora, recomecar }) {
  const t = TEMAS[tema];
  const acertos = respostas.filter((r) => r.acertou).length;
  const proximo = t.proximo ? TEMAS[t.proximo] : null;
  let mensagem = acertos === respostas.length ? 'Gabaritou.' : acertos >= respostas.length / 2 ? 'Bom treino.' : 'Vale rever o exemplo resolvido e tentar de novo.';
  if (modo === 'revisao' && ciclo) {
    if (ciclo.concluida) mensagem = 'Ciclo completo: você revisou este tema 4 vezes. Ele está firme.';
    else if (ciclo.etapa > 0 && ciclo.venceEm) mensagem = `Revisão feita. A próxima é ${dataComDia(ciclo.venceEm)}.`;
    else mensagem = 'Vamos reforçar: o ciclo recomeçou e o tema volta amanhã.';
  } else if (feitoAgora) {
    mensagem = 'Tema feito! Ele volta para revisão amanhã, depois em 3, 7 e 21 dias.';
  }
  return (
    <div className="fim-sessao" aria-live="polite">
      <span className="sobretitulo">{t.titulo}</span>
      <p className="placar">
        {acertos} <span>/ {respostas.length}</span>
      </p>
      <h1 className="titulo-m" style={{ fontSize: 40 }}>
        {mensagem}
      </h1>
      <div className="retorno-acoes">
        <button type="button" className="btn btn-primario" onClick={recomecar}>
          Mais {QUESTOES_PRATICA} questões
        </button>
        <Link to={`/tema/${tema}`} className="btn btn-contorno">
          Voltar ao tema
        </Link>
        {proximo && (
          <Link to={`/tema/${proximo.slug}`} className="btn btn-contorno">
            Próximo tema: {proximo.titulo} →
          </Link>
        )}
      </div>
    </div>
  );
}

function Sessao({ tema, modo, sementeInicial }) {
  const total = modo === 'revisao' ? QUESTOES_REVISAO : QUESTOES_PRATICA;
  const { estado, registrar, terminarRevisao } = useProgresso();
  const [rodada, setRodada] = useState(0);
  const [sementes, setSementes] = useState(null);
  const [indice, setIndice] = useState(0);
  const [escolha, setEscolha] = useState(null);
  const [respostas, setRespostas] = useState([]);
  const [fim, setFim] = useState(null);
  const [acertosAntes, setAcertosAntes] = useState(null);

  // As sementes são sorteadas no navegador (o HTML pré-renderizado não tem questão).
  useEffect(() => {
    const lista = rodada === 0 && sementeValida(sementeInicial) ? [sementeInicial] : [];
    while (lista.length < total) lista.push(novaSemente());
    setSementes(lista);
    setIndice(0);
    setEscolha(null);
    setRespostas([]);
    setFim(null);
  }, [rodada, sementeInicial, total]);

  useEffect(() => {
    if (estado && acertosAntes === null) setAcertosAntes(estado.tentativas.filter((t) => t.tema === tema && t.acertou).length);
  }, [estado, acertosAntes, tema]);

  const q = useMemo(() => (sementes ? gerarQuestao(tema, sementes[indice]) : null), [sementes, indice, tema]);
  const respondida = escolha !== null;
  const acertou = respondida && escolha === q.correta;
  const ultima = indice + 1 >= total;

  const responder = useCallback(
    (i) => {
      if (!q || escolha !== null) return;
      const certo = i === q.correta;
      setEscolha(i);
      setRespostas((r) => [...r, { semente: q.semente, escolha: i, acertou: certo }]);
      registrar({ tema, semente: q.semente, escolha: i, acertou: certo, modo });
    },
    [q, escolha, registrar, tema, modo],
  );

  const avancar = useCallback(async () => {
    if (!respondida) return;
    if (!ultima) {
      setIndice((n) => n + 1);
      setEscolha(null);
      return;
    }
    let ciclo = null;
    if (modo === 'revisao') ciclo = await terminarRevisao(tema, respostas);
    const acertosAgora = (acertosAntes ?? 0) + respostas.filter((r) => r.acertou).length;
    setFim({ ciclo, feitoAgora: (acertosAntes ?? 0) < ACERTOS_PARA_FEITO && acertosAgora >= ACERTOS_PARA_FEITO });
  }, [respondida, ultima, modo, terminarRevisao, tema, respostas, acertosAntes]);

  // Atalhos: 1–5 ou A–E respondem; Enter avança.
  useEffect(() => {
    const tecla = (e) => {
      if (e.target.closest?.('input, textarea')) return;
      const k = e.key.toUpperCase();
      const i = '12345'.indexOf(k) >= 0 ? '12345'.indexOf(k) : LETRAS.indexOf(k);
      if (!respondida && i >= 0 && k.length === 1) responder(i);
      else if (respondida && e.key === 'Enter' && !e.target.closest?.('button, a')) avancar();
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [respondida, responder, avancar]);

  if (fim) return <FimDaSessao tema={tema} modo={modo} respostas={respostas} {...fim} recomecar={() => setRodada((n) => n + 1)} />;

  const t = TEMAS[tema];
  const acertosSessao = respostas.filter((r) => r.acertou).length;
  return (
    <div className="dois-um">
      <div className="pratica">
        <div className="pratica-topo">
          <span className="sobretitulo">
            {modo === 'revisao' ? 'Revisão · ' : ''}
            {t.titulo}
          </span>
          <span>
            Questão {indice + 1} de {total}
          </span>
        </div>
        <div className="barra-questoes" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }} aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={i < indice || (i === indice && respondida) ? 'feita' : i === indice ? 'atual' : ''} />
          ))}
        </div>
        {!q ? (
          <span className="esqueleto" style={{ height: 240 }} />
        ) : (
          <>
            <p className="enunciado" id="enunciado">
              {q.enunciado}
            </p>
            <Grafico grafico={q.grafico} />
            <ol className="alternativas" aria-labelledby="enunciado">
              {q.alternativas.map((alt, i) => {
                const certa = respondida && i === q.correta;
                const errada = respondida && i === escolha && !certa;
                return (
                  <li key={alt}>
                    <button
                      type="button"
                      className={`alternativa${certa ? ' certa' : ''}${errada ? ' errada' : ''}`}
                      onClick={() => responder(i)}
                      disabled={respondida}
                      aria-label={`Alternativa ${LETRAS[i]}: ${alt}${certa ? ', resposta certa' : ''}${errada ? ', sua resposta' : ''}`}
                    >
                      <span className="letra">{LETRAS[i]}</span>
                      <span className="valor">{alt}</span>
                      <span className="marca">{certa ? '✓ certa' : errada ? '✗ sua resposta' : ''}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div aria-live="polite">
              {respondida && (
                <div className={`retorno${acertou ? '' : ' errou'}`}>
                  <span className="retorno-titulo">{acertou ? `Isso. ${q.resposta}.` : `Quase. A resposta é ${q.resposta}.`}</span>
                  {!acertou && q.erros[escolha] && <p>{q.erros[escolha]}</p>}
                  <p>{q.explicacao}</p>
                  {q.passos.some((p) => p.conta) && (
                    <div className="passos-mini">
                      <Passos passos={q.passos} />
                    </div>
                  )}
                  <div className="retorno-acoes">
                    <button type="button" className="btn btn-escuro btn-p" style={{ minWidth: 200 }} onClick={avancar} autoFocus>
                      {ultima ? 'Ver resultado →' : 'Próxima questão →'}
                    </button>
                    <Link to={`/tema/${tema}#exemplo`} className="btn btn-contorno btn-p">
                      Ver o exemplo resolvido
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <aside className="lateral">
        <section>
          <span className="rotulo">Sessão de agora</span>
          <span className="placar">
            {acertosSessao} <span>/ {total}</span>
          </span>
          <span className="discreto" style={{ fontSize: 15 }}>
            acertos até agora
          </span>
        </section>
        <section>
          <span className="rotulo">Como esta questão foi feita</span>
          <p>Valores e resposta saem de um gerador em código. A explicação vem do fichário revisado do tema, não de uma IA improvisando.</p>
        </section>
        <section>
          <span className="rotulo">Travou?</span>
          <Link to={`/tema/${tema}#exemplo`} className="btn btn-contorno btn-p btn-bloco">
            Ver o exemplo resolvido
          </Link>
          <Link to={`/tema/${tema}#tutor`} className="btn btn-contorno btn-p btn-bloco">
            Perguntar ao tutor
          </Link>
        </section>
      </aside>
    </div>
  );
}

export default function Praticar() {
  const [params] = useSearchParams();
  const tema = params.get('tema');
  const modo = params.get('modo') === 'revisao' ? 'revisao' : 'pratica';
  const semente = Number(params.get('semente'));
  if (!tema || !TEMAS[tema]) return <Escolher />;
  return <Sessao key={`${tema}:${modo}:${semente}`} tema={tema} modo={modo} sementeInicial={semente} />;
}
