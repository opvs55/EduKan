import { Router } from 'express';
import {
  BLOCOS,
  DISCIPLINAS,
  TEMAS,
  diaEmBrasilia,
  disciplina,
  planoDoDia,
  situacao,
  temaDoDesafio,
  temasDaDisciplina,
  temporadaDaDisciplina,
} from '@edukan/conteudo';
import { ErroApi } from '../../shared/erros.js';

const resumoDoTema = (t) => ({
  slug: t.slug,
  titulo: t.titulo,
  resumo: t.resumo,
  disciplina: t.disciplina,
  bloco: t.bloco,
  episodio: t.episodio,
});

export function rotasConteudo({ repo, agora }) {
  const r = Router();

  r.get('/disciplinas', (req, res) => {
    res.json({ disciplinas: DISCIPLINAS });
  });

  r.get('/temas', (req, res) => {
    const id = req.query.disciplina ?? 'matematica';
    if (!disciplina(id)) throw new ErroApi(404, 'NAO_ENCONTRADO', 'Disciplina não encontrada.');
    res.json({ blocos: BLOCOS[id] ?? [], temas: temasDaDisciplina(id).map(resumoDoTema) });
  });

  r.get('/temas/:slug', (req, res) => {
    const t = TEMAS[req.params.slug];
    if (!t) throw new ErroApi(404, 'NAO_ENCONTRADO', 'Tema não encontrado.');
    res.json({ tema: t });
  });

  // Episódios lançados (com link do post), o próximo com data e os que vêm.
  r.get('/series/:disciplina', async (req, res) => {
    const temporada = temporadaDaDisciplina(req.params.disciplina);
    if (!temporada) throw new ErroApi(404, 'NAO_ENCONTRADO', 'Essa matéria ainda não tem série.');
    const s = situacao(temporada.id, agora());
    let posts = new Map();
    try {
      posts = await repo.postsPublicados();
    } catch {
      // sem banco, a grade continua valendo; só os links ficam de fora
    }
    const itens = s.itens.map((i) => ({ ...i, posts: posts.get(i.chave) ?? [] }));
    res.set('Cache-Control', 'public, max-age=60');
    res.json({ ...s, itens, proximo: s.proximo ? itens.find((i) => i.chave === s.proximo.chave) : null, temporada });
  });

  // O que vai ao ar hoje e o Desafio do dia (usado pelos stories).
  r.get('/hoje', (req, res) => {
    const instante = agora();
    const slug = temaDoDesafio(instante);
    const t = TEMAS[slug];
    res.json({
      dia: diaEmBrasilia(instante),
      plano: planoDoDia(diaEmBrasilia(instante)),
      desafio: { tema: slug, titulo: t.titulo, ...t.desafio },
    });
  });

  return r;
}
