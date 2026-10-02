const numero = (v, padrao) => (v === undefined || v === '' || Number.isNaN(Number(v)) ? padrao : Number(v));

export function lerConfig(env = process.env) {
  return {
    porta: numero(env.PORT, 3000),
    producao: env.NODE_ENV === 'production',
    origens: (env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:4173')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    supabaseUrl: env.SUPABASE_URL || null,
    supabaseServiceKey: env.SUPABASE_SERVICE_ROLE_KEY || null,
    googleApiKey: env.GOOGLE_API_KEY || null,
    geminiModelo: env.GEMINI_MODEL || 'gemini-2.5-flash',
    geminiOrcamentoPensamento: env.GEMINI_THINKING_BUDGET === '' ? null : numero(env.GEMINI_THINKING_BUDGET, 0),
    opsToken: env.OPS_TOKEN || null,
    confiarCloudflare: env.TRUST_CF_CONNECTING_IP !== 'false',
    orcamentoIaDiario: numero(env.AI_DAILY_BUDGET, 500),
    tutorPorIpHora: numero(env.TUTOR_PER_IP_HOUR, 15),
  };
}
