import { createClient } from '@supabase/supabase-js';
import { criarApp } from './app.js';
import { lerConfig } from './config.js';
import { verificadorSupabase } from './middleware/auth.js';
import { criarGemini } from './modules/tutor/gemini.js';
import { repositorioEmMemoria, repositorioSupabase } from './shared/repositorio.js';

const config = lerConfig();

let repo = repositorioEmMemoria();
let verificarToken = null;
if (config.supabaseUrl && config.supabaseServiceKey) {
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  repo = repositorioSupabase(supabase);
  verificarToken = verificadorSupabase(supabase);
} else {
  console.warn('[edukan] Sem SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY: contas desligadas, dados só em memória.');
}

const gemini = config.googleApiKey
  ? criarGemini({ chave: config.googleApiKey, modelo: config.geminiModelo, orcamentoPensamento: config.geminiOrcamentoPensamento })
  : null;
if (!gemini) console.warn('[edukan] Sem GOOGLE_API_KEY: tutor desligado.');

const app = criarApp({ config, repo, gemini, verificarToken });
app.listen(config.porta, () => console.log(`[edukan] API ouvindo na porta ${config.porta}`));
