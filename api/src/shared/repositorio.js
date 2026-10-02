// Acesso ao banco. Duas implementações com a mesma interface: Supabase
// (produção) e memória (testes e desenvolvimento sem banco).

const daLinhaTentativa = (r) => ({
  tema: r.topic,
  semente: r.seed,
  escolha: r.choice,
  acertou: r.correct,
  modo: r.mode,
  em: r.created_at,
});

const daLinhaRevisao = (r) => ({ base: r.base_on, etapa: r.step, venceEm: r.due_on, concluida: r.done });

export function repositorioSupabase(supabase) {
  async function tudo(consulta, max = 5000) {
    const linhas = [];
    for (let de = 0; de < max; de += 1000) {
      const { data, error } = await consulta().range(de, de + 999);
      if (error) throw error;
      linhas.push(...data);
      if (data.length < 1000) break;
    }
    return linhas;
  }

  return {
    async estadoDoUsuario(userId) {
      const [tentativas, revisoes] = await Promise.all([
        tudo(() =>
          supabase.from('attempts').select('topic, seed, choice, correct, mode, created_at').eq('user_id', userId).order('created_at'),
        ),
        tudo(() => supabase.from('reviews').select('topic, base_on, step, due_on, done').eq('user_id', userId)),
      ]);
      return {
        tentativas: tentativas.map(daLinhaTentativa),
        revisoes: Object.fromEntries(revisoes.map((r) => [r.topic, daLinhaRevisao(r)])),
      };
    },

    async inserirTentativas(userId, tentativas) {
      if (!tentativas.length) return;
      const { error } = await supabase.from('attempts').insert(
        tentativas.map((t) => ({
          user_id: userId,
          topic: t.tema,
          seed: t.semente,
          choice: t.escolha,
          correct: t.acertou,
          mode: t.modo,
          created_at: t.em,
        })),
      );
      if (error) throw error;
    },

    async salvarRevisao(userId, tema, c) {
      const { error } = await supabase.from('reviews').upsert(
        {
          user_id: userId,
          topic: tema,
          base_on: c.base,
          step: c.etapa,
          due_on: c.venceEm,
          done: c.concluida,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,topic' },
      );
      if (error) throw error;
    },

    async postsPublicados() {
      const { data, error } = await supabase
        .from('social_posts')
        .select('key, platform, permalink, published_at')
        .eq('status', 'publicado')
        .eq('kind', 'reel');
      if (error) throw error;
      const mapa = new Map();
      for (const p of data) {
        const lista = mapa.get(p.key) ?? [];
        lista.push({ plataforma: p.platform, permalink: p.permalink, publicadoEm: p.published_at });
        mapa.set(p.key, lista);
      }
      return mapa;
    },

    async registrarErro(e) {
      const { error } = await supabase.from('app_errors').insert({
        source: e.origem,
        message: e.mensagem,
        stack: e.pilha,
        url: e.url,
        user_agent: e.navegador,
      });
      if (error) throw error;
    },

    async saude() {
      const { error } = await supabase.from('social_posts').select('key', { head: true, count: 'exact' }).limit(1);
      return error ? 'erro' : 'ok';
    },
  };
}

export function repositorioEmMemoria() {
  const tentativas = new Map();
  const revisoes = new Map();
  const posts = new Map();
  const erros = [];
  return {
    _erros: erros,
    _publicar(chave, post) {
      posts.set(chave, [...(posts.get(chave) ?? []), post]);
    },
    async estadoDoUsuario(userId) {
      return {
        tentativas: [...(tentativas.get(userId) ?? [])],
        revisoes: Object.fromEntries(revisoes.get(userId) ?? []),
      };
    },
    async inserirTentativas(userId, novas) {
      tentativas.set(userId, [...(tentativas.get(userId) ?? []), ...novas]);
    },
    async salvarRevisao(userId, tema, c) {
      if (!revisoes.has(userId)) revisoes.set(userId, new Map());
      revisoes.get(userId).set(tema, c);
    },
    async postsPublicados() {
      return new Map(posts);
    },
    async registrarErro(e) {
      erros.push(e);
    },
    async saude() {
      return 'memoria';
    },
  };
}
