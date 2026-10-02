// Título e descrição de cada página. O mesmo código serve ao pré-render
// (HTML pronto para o Google e para a prévia de link) e ao navegador.

import { DISCIPLINAS, TEMAS, blocoDoTema, disciplina } from '@edukan/conteudo';

const MARCA = 'EduKan';
const PADRAO = {
  titulo: 'EduKan · Matemática para o ENEM, um episódio por dia',
  descricao:
    'Um episódio de 1 minuto por dia nas redes e, aqui, a página de estudo de cada tema, com exemplos passo a passo e exercícios corrigidos na hora.',
};

const FIXAS = {
  '/': PADRAO,
  '/praticar': {
    titulo: `Praticar · ${MARCA}`,
    descricao: 'Exercícios de Matemática para o ENEM gerados e corrigidos na hora, com a explicação de cada erro.',
  },
  '/progresso': { titulo: `Seu progresso · ${MARCA}`, descricao: 'Temas feitos, sequência de dias e a revisão do dia.' },
  '/entrar': { titulo: `Entrar · ${MARCA}`, descricao: 'Entre com um link no seu e-mail para guardar seu progresso.' },
  '/como-funciona': {
    titulo: `Como funciona · ${MARCA}`,
    descricao: 'Como o EduKan usa IA: textos a partir de um fichário revisado e contas sempre calculadas por código.',
  },
  '/ajuda': { titulo: `Ajuda · ${MARCA}`, descricao: 'Perguntas frequentes sobre o EduKan: conta, exercícios, revisão e vídeos.' },
  '/privacidade': { titulo: `Privacidade · ${MARCA}`, descricao: 'Que dados o EduKan guarda, por quê e como apagar.' },
  '/termos': { titulo: `Termos de uso · ${MARCA}`, descricao: 'As regras de uso do EduKan, site gratuito de estudo para o ENEM.' },
};

export function metaDaRota(caminho) {
  const limpo = caminho.replace(/\/+$/, '') || '/';
  if (FIXAS[limpo]) return { ...FIXAS[limpo], caminho: limpo };

  let m = limpo.match(/^\/tema\/([^/]+)$/);
  if (m && TEMAS[m[1]]) {
    const t = TEMAS[m[1]];
    const b = blocoDoTema(t.slug);
    return {
      titulo: `${t.titulo} · Matemática para o ENEM · ${MARCA}`,
      descricao: `${t.resumo} Bloco ${b.numero}: ${b.titulo}. Com exemplo resolvido, erro comum e exercícios.`,
      caminho: limpo,
    };
  }
  m = limpo.match(/^\/materia\/([^/]+)$/);
  if (m && disciplina(m[1])) {
    const d = disciplina(m[1]);
    return {
      titulo: `${d.nome}${d.status === 'no-ar' ? ' para o ENEM' : ' (em breve)'} · ${MARCA}`,
      descricao: d.status === 'no-ar' ? d.descricao : `${d.chamada} Em breve no EduKan, com fichário revisado e série própria.`,
      caminho: limpo,
    };
  }
  m = limpo.match(/^\/serie\/([^/]+)$/);
  if (m && disciplina(m[1])) {
    const d = disciplina(m[1]);
    return {
      titulo: `A série de ${d.nome} · Temporada 1 · ${MARCA}`,
      descricao: 'Um episódio curto por dia, de domingo a sexta às 19h. Cada um lembra o anterior e termina com uma pista do próximo.',
      caminho: limpo,
    };
  }
  return { titulo: `Página não encontrada · ${MARCA}`, descricao: PADRAO.descricao, caminho: limpo, naoEncontrada: true };
}

// Todas as páginas que viram HTML estático no build.
export function rotasEstaticas() {
  return [
    ...Object.keys(FIXAS),
    ...DISCIPLINAS.map((d) => `/materia/${d.id}`),
    '/serie/matematica',
    ...Object.keys(TEMAS).map((s) => `/tema/${s}`),
  ];
}
