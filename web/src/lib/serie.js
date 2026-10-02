import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { quandoRelativo, situacao, temporadaDaDisciplina } from '@edukan/conteudo';
import { api } from './api.js';
import { useAgora } from './agora.js';

// A grade vem do código compartilhado (igual ao do backend); da API vêm só
// os links dos posts já publicados.
export function useSerie(disciplina = 'matematica') {
  const agora = useAgora();
  const temporada = temporadaDaDisciplina(disciplina);
  const consulta = useQuery({
    queryKey: ['serie', disciplina],
    queryFn: () => api(`/series/${disciplina}`),
    enabled: !!temporada,
    staleTime: 60_000,
    retry: 1,
  });
  const s = useMemo(() => (temporada && agora ? situacao(temporada.id, agora) : null), [temporada, agora]);
  const posts = useMemo(() => new Map((consulta.data?.itens ?? []).map((i) => [i.chave, i.posts ?? []])), [consulta.data]);
  return { temporada, situacao: s, posts, agora };
}

export function linkDoPost(posts) {
  if (!posts?.length) return null;
  return (posts.find((p) => p.plataforma === 'instagram') ?? posts[0]).permalink ?? null;
}

// Texto e classe do status de um item da grade (Matéria e Série).
export function statusDoItem(item, agora) {
  if (!item?.status || !agora) return { texto: '', classe: '' };
  if (item.status === 'no-ar') return { texto: item.tipo === 'revisao' ? 'Revisão' : 'No ar', classe: 'status-no-ar' };
  if (item.status === 'hoje' || item.status === 'proximo') return { texto: quandoRelativo(item.dia, agora), classe: `status-${item.status}` };
  return { texto: 'Em breve', classe: 'status-em-breve' };
}
