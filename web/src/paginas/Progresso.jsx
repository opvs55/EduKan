import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ACERTOS_PARA_FEITO, QUESTOES_REVISAO, TEMAS, dataComDia, nomeDoDia, resumo, temasDaDisciplina } from '@edukan/conteudo';
import { useAgora } from '../lib/agora.js';
import { useProgresso } from '../lib/progresso.jsx';
import { useSessao } from '../lib/sessao.jsx';

const LETRA_DIA = { dom: 'D', seg: 'S', ter: 'T', qua: 'Q', qui: 'Q', sex: 'S', sáb: 'S' };

// Botão "Instalar" quando o navegador oferece (PWA).
function useInstalar() {
  const [evento, setEvento] = useState(null);
  useEffect(() => {
    const guardar = (e) => {
      e.preventDefault();
      setEvento(e);
    };
    window.addEventListener('beforeinstallprompt', guardar);
    return () => window.removeEventListener('beforeinstallprompt', guardar);
  }, []);
  return evento ? () => evento.prompt().finally(() => setEvento(null)) : null;
}

export default function Progresso() {
  const agora = useAgora();
  const { estado, fonte, erroSync } = useProgresso();
  const { usuario, contasAtivas, sair } = useSessao();
  const instalar = useInstalar();
  const r = estado && agora ? resumo(estado, agora) : null;
  const totalTemas = temasDaDisciplina('matematica').length;
  const nHoje = r?.revisoesHoje.length ?? 0;

  let subtitulo = ' ';
  if (r) {
    if (nHoje) subtitulo = `Você tem ${nHoje} ${nHoje === 1 ? 'revisão' : 'revisões'} para hoje. Leva uns ${nHoje * 3} minutos.`;
    else if (!r.totalTentativas) subtitulo = 'Faça os primeiros exercícios e o seu progresso aparece aqui.';
    else subtitulo = 'Nenhuma revisão para hoje. Que tal seguir para o próximo tema?';
  }

  return (
    <>
      <div className="cabecalho-pagina faixa" style={{ paddingBottom: 32 }}>
        <h1 className="titulo-m">{usuario ? `Oi, ${usuario.nome}.` : 'Seu progresso'}</h1>
        <p className="lead" style={{ fontSize: 18 }}>
          {subtitulo}
        </p>
      </div>

      {!usuario && contasAtivas && (
        <div className="faixa-aviso">
          <span>Seu progresso fica salvo só neste aparelho. Entre para guardar na sua conta.</span>
          <Link to="/entrar" className="link-forte">
            Entrar →
          </Link>
        </div>
      )}
      {usuario && erroSync && (
        <div className="faixa-aviso">
          <span>Não conseguimos sincronizar com a sua conta agora ({erroSync}). Suas respostas continuam aparecendo aqui.</span>
        </div>
      )}

      <div className="numeros">
        <div className="numero acento">
          <span className="rotulo">Sequência</span>
          <span className="valor">{r ? r.sequencia : '–'}</span>
          <span className="legenda">{r?.sequencia === 1 ? 'dia seguido' : 'dias seguidos'}</span>
        </div>
        <div className="numero">
          <span className="rotulo">Temas feitos</span>
          <span className="valor">
            {r ? r.temasFeitos.length : '–'}
            <small> / {totalTemas}</small>
          </span>
          <span className="legenda">Temporada 1</span>
        </div>
        <div className="numero">
          <span className="rotulo">Acertos</span>
          <span className="valor">{r?.taxa != null ? `${Math.round(r.taxa * 100)}%` : '–'}</span>
          <span className="legenda">{r ? `em ${r.totalTentativas} ${r.totalTentativas === 1 ? 'exercício' : 'exercícios'}` : ' '}</span>
        </div>
      </div>

      <div className="dois-um">
        <div className="cel" style={{ paddingTop: 32, paddingBottom: 32, display: 'flex', flexDirection: 'column' }}>
          <span className="rotulo" style={{ marginBottom: 16 }}>
            Revisão de hoje
          </span>
          {r && nHoje === 0 && <p className="discreto">Nada para revisar hoje.</p>}
          {r?.revisoesHoje.map((c, i) => (
            <div className="revisao-linha" key={c.tema}>
              <div>
                <strong>{TEMAS[c.tema].titulo}</strong>
                <span className="discreto">
                  {c.ordem}ª revisão · intervalo de {c.intervalo} {c.intervalo === 1 ? 'dia' : 'dias'}
                </span>
              </div>
              <span className="discreto qtd" style={{ fontSize: 14 }}>
                {QUESTOES_REVISAO} questões
              </span>
              <Link to={`/praticar?tema=${c.tema}&modo=revisao`} className={`btn btn-p ${i === 0 ? 'btn-primario' : 'btn-contorno'}`} style={{ minWidth: 120 }}>
                Revisar →
              </Link>
            </div>
          ))}
          <span className="rotulo" style={{ margin: '32px 0 16px' }}>
            Próximas
          </span>
          {r && r.proximasRevisoes.length === 0 && (
            <p className="discreto">
              Quando um tema tiver {ACERTOS_PARA_FEITO} acertos, ele entra aqui. <Link to="/praticar">Praticar →</Link>
            </p>
          )}
          {r?.proximasRevisoes.map((c) => (
            <div className="linha-simples" key={c.tema}>
              <span>{TEMAS[c.tema].titulo}</span>
              <span className="discreto">{dataComDia(c.venceEm)}</span>
            </div>
          ))}
        </div>
        <div className="cel" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span className="rotulo">Esta semana</span>
          <div className="semana">
            {(r?.semana ?? Array.from({ length: 7 }, (_, i) => ({ dia: String(i), ativo: false, hoje: false }))).map((d) => (
              <div key={d.dia}>
                <div className={`dia${d.ativo ? ' ativo' : ''}${d.hoje ? ' hoje' : ''}`} />
                <span>{r ? LETRA_DIA[nomeDoDia(d.dia)] : ''}</span>
              </div>
            ))}
          </div>
          <div className="caixa" style={{ marginTop: 8 }}>
            <strong>Volte com um toque</strong>
            <span className="discreto" style={{ fontSize: 14 }}>
              Instale o EduKan na tela inicial do celular. Os avisos de revisão no celular chegam em breve.
            </span>
            {instalar && (
              <button type="button" className="btn btn-contorno btn-p" onClick={instalar}>
                Instalar o EduKan
              </button>
            )}
          </div>
          {usuario && (
            <div className="caixa">
              <span style={{ fontSize: 14 }}>
                Conectado como <strong>{usuario.email}</strong>
                {fonte === 'conta' ? '. Progresso salvo na conta.' : '.'}
              </span>
              <button type="button" className="btn btn-contorno btn-p" onClick={sair}>
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
