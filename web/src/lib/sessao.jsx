import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { definirObterToken } from './api.js';
import { contasAtivas, obterSupabase } from './supabase.js';

const Contexto = createContext({ usuario: null, pronto: true, contasAtivas: false });

function nomeDe(user) {
  const nome = user?.user_metadata?.nome?.trim();
  if (nome) return nome;
  return user?.email ? user.email.split('@')[0] : 'Você';
}

export function iniciais(nome) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : (partes[0]?.[1] ?? ''))).toUpperCase();
}

export function SessaoProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [pronto, setPronto] = useState(!contasAtivas);
  const sessaoRef = useRef(null);

  useEffect(() => {
    if (!contasAtivas) return undefined;
    let cancelado = false;
    let assinatura;
    definirObterToken(async () => sessaoRef.current?.access_token ?? null);
    obterSupabase().then(async (sb) => {
      if (cancelado || !sb) return;
      const aplicar = (sessao) => {
        sessaoRef.current = sessao;
        setUsuario(sessao?.user ? { id: sessao.user.id, email: sessao.user.email, nome: nomeDe(sessao.user) } : null);
      };
      const { data } = await sb.auth.getSession();
      aplicar(data.session);
      setPronto(true);
      assinatura = sb.auth.onAuthStateChange((_evento, sessao) => aplicar(sessao)).data.subscription;
    });
    return () => {
      cancelado = true;
      assinatura?.unsubscribe();
    };
  }, []);

  const entrar = useCallback(async ({ email, nome }) => {
    const sb = await obterSupabase();
    if (!sb) throw new Error('As contas ainda não estão ativadas.');
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/progresso`, data: nome ? { nome } : undefined },
    });
    if (error) throw error;
  }, []);

  const sair = useCallback(async () => {
    const sb = await obterSupabase();
    await sb?.auth.signOut();
  }, []);

  const valor = useMemo(() => ({ usuario, pronto, contasAtivas, entrar, sair }), [usuario, pronto, entrar, sair]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSessao() {
  return useContext(Contexto);
}
