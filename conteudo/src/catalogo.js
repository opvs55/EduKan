// Catálogo: disciplinas, blocos e temas com a ordem da temporada aplicada.

import { BLOCOS as BLOCOS_MAT, ORDEM_T1, TEMAS as TEMAS_MAT } from './fichario/matematica.js';

export const DISCIPLINAS = [
  {
    id: 'matematica',
    nome: 'Matemática',
    status: 'no-ar',
    nivel: 'Ensino médio / ENEM',
    descricao: 'Temporada 1: a matemática do dia a dia. Quinze temas em quatro blocos, cada um com episódio, página de estudo e exercícios.',
    chamada: 'Porcentagem, juros, proporção, funções, estatística e probabilidade.',
  },
  { id: 'historia', nome: 'História', status: 'em-breve', chamada: 'Linhas do tempo, fontes e mitos.' },
  { id: 'sociologia', nome: 'Sociologia', status: 'em-breve', chamada: 'Conceitos e autores do ENEM.' },
  { id: 'programacao', nome: 'Programação', status: 'em-breve', chamada: 'Lógica e código, do zero.' },
];

export const ORDEM = { matematica: ORDEM_T1 };

export const TEMAS = Object.fromEntries(
  ORDEM_T1.map((slug, i) => [
    slug,
    {
      ...TEMAS_MAT[slug],
      slug,
      disciplina: 'matematica',
      nivel: 'enem',
      temporada: 1,
      episodio: i + 1,
      anterior: ORDEM_T1[i - 1] ?? null,
      proximo: ORDEM_T1[i + 1] ?? null,
    },
  ]),
);

export const BLOCOS = {
  matematica: BLOCOS_MAT.map((b) => ({ ...b, temas: ORDEM_T1.filter((s) => TEMAS_MAT[s].bloco === b.numero) })),
};

export function disciplina(id) {
  return DISCIPLINAS.find((d) => d.id === id) ?? null;
}

export function temasDaDisciplina(id) {
  return (ORDEM[id] ?? []).map((s) => TEMAS[s]);
}

export function blocoDoTema(slug) {
  const t = TEMAS[slug];
  return t ? BLOCOS[t.disciplina].find((b) => b.numero === t.bloco) : null;
}

// "T1 · E05"
export function codigoEpisodio(episodio, temporada = 1) {
  return `T${temporada} · E${String(episodio).padStart(2, '0')}`;
}
