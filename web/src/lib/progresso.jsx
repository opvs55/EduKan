import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { concluirRevisao, estadoVazio, registrarTentativa } from '@edukan/conteudo';
import { api } from './api.js';
import { apagar, gravar, ler } from './armazenamento.js';
import { useSessao } from './sessao.jsx';

// Sem conta, o progresso fica neste navegador. Ao entrar, ele é enviado
// para a conta (a API recorrige cada resposta) e passa a vir de lá.
const CHAVE_LOCAL = 'edukan:progresso:v1';

const Contexto = createContext(null);

export function ProgressoProvider({ children }) {
  const { usuario, pronto } = useSessao();
  const [estado, setEstado] = useState(null);
  const [fonte, setFonte] = useState('local');
  const [erroSync, setErroSync] = useState(null);
  const estadoRef = useRef(null);
  estadoRef.current = estado;

  const atualizar = useCallback((novo, salvarLocal) => {
    setEstado(novo);
    if (salvarLocal) gravar(CHAVE_LOCAL, novo);
  }, []);

  useEffect(() => {
    if (!pronto) return;
    const local = ler(CHAVE_LOCAL, estadoVazio());
    if (!usuario) {
      setFonte('local');
      setEstado(local);
      return;
    }
    let cancelado = false;
    const pedido = local.tentativas.length
      ? api('/progresso/importar', { method: 'POST', corpo: { tentativas: local.tentativas, revisoes: local.revisoes } })
      : api('/progresso');
    pedido
      .then((r) => {
        if (cancelado) return;
        if (local.tentativas.length) apagar(CHAVE_LOCAL);
        setFonte('conta');
        setErroSync(null);
        setEstado(r.estado);
      })
      .catch((e) => {
        if (cancelado) return;
        setErroSync(e.message);
        setFonte('local');
        setEstado(local);
      });
    return () => {
      cancelado = true;
    };
  }, [usuario, pronto]);

  // Registra uma tentativa já corrigida no navegador. Com conta, a API
  // corrige de novo pela semente e grava.
  const registrar = useCallback(
    (tentativa) => {
      const agora = new Date();
      const base = estadoRef.current ?? estadoVazio();
      const novo = registrarTentativa(base, { ...tentativa, em: agora.toISOString() }, agora);
      atualizar(novo, fonte === 'local');
      if (fonte === 'conta') {
        const { tema, semente, escolha, modo } = tentativa;
        api('/praticar/corrigir', { method: 'POST', corpo: { tema, semente, escolha, modo } }).catch((e) => setErroSync(e.message));
      }
    },
    [atualizar, fonte],
  );

  // Fecha uma sessão de revisão e devolve o novo ciclo do tema.
  const terminarRevisao = useCallback(
    async (tema, respostas) => {
      const agora = new Date();
      const base = estadoRef.current ?? estadoVazio();
      if (fonte === 'conta') {
        try {
          const r = await api(`/revisoes/${tema}`, {
            method: 'POST',
            corpo: { respostas: respostas.map(({ semente, escolha }) => ({ semente, escolha })) },
          });
          atualizar({ ...base, revisoes: { ...base.revisoes, [tema]: r.ciclo } }, false);
          return r.ciclo;
        } catch (e) {
          setErroSync(e.message);
        }
      }
      const acertos = respostas.filter((r) => r.acertou).length;
      const novo = concluirRevisao(base, tema, { acertos, total: respostas.length }, agora);
      atualizar(novo, fonte === 'local');
      return novo.revisoes[tema] ?? null;
    },
    [atualizar, fonte],
  );

  const valor = useMemo(() => ({ estado, fonte, erroSync, registrar, terminarRevisao }), [estado, fonte, erroSync, registrar, terminarRevisao]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useProgresso() {
  return useContext(Contexto);
}
