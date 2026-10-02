// Login opcional. Sem as variáveis do Supabase, o site funciona sem contas
// e o progresso fica só no navegador.
const url = import.meta.env.VITE_SUPABASE_URL;
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const contasAtivas = Boolean(url && chave);

let cliente = null;
export async function obterSupabase() {
  if (!contasAtivas || typeof window === 'undefined') return null;
  if (!cliente) {
    const { createClient } = await import('@supabase/supabase-js');
    cliente = createClient(url, chave, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
    });
  }
  return cliente;
}
