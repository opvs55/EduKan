// Grade da série. O site e o backend usam este mesmo código, para que a
// página nunca diga "em breve" com o vídeo já no ar (lição do guia).
//
// Regra: a temporada começa num domingo com o trailer (episódio 0). De
// domingo a sexta sai um episódio por dia, às 19h. Sábado é revisão da
// semana. Depois do último episódio ainda vem o sábado de revisão final.

import { TEMAS, codigoEpisodio } from './catalogo.js';
import { ORDEM_T1 } from './fichario/matematica.js';
import { diaDaSemana, diaEmBrasilia, diferencaEmDias, instanteEm, somarDias } from './datas.js';

export const HORA_PUBLICACAO = '19:00';

export const TEMPORADAS = [
  {
    id: 'mat-t1',
    disciplina: 'matematica',
    sigla: 'mat',
    numero: 1,
    titulo: 'Temporada 1',
    // Domingo da estreia (trailer). Mude aqui para adiar ou antecipar a série.
    inicio: '2026-10-11',
    temas: ORDEM_T1,
  },
];

const pad = (n) => String(n).padStart(2, '0');

function montarGrade(t) {
  if (diaDaSemana(t.inicio) !== 0) throw new Error(`a temporada ${t.id} precisa começar num domingo`);
  const itens = [];
  const fila = ['__trailer', ...t.temas];
  let dia = t.inicio;
  let semana = 1;
  let semanaAtual = [];
  while (fila.length || semanaAtual.length) {
    if (diaDaSemana(dia) === 6) {
      if (semanaAtual.length) {
        itens.push({
          chave: `${t.sigla}:t${t.numero}r${semana}:revisao`,
          tipo: 'revisao',
          codigo: 'SÁB',
          episodio: null,
          tema: null,
          temas: semanaAtual,
          titulo: `Sábado de revisão: semana ${semana}`,
          semana,
          dia,
        });
        semanaAtual = [];
      }
      semana++;
    } else if (fila.length) {
      const item = fila.shift();
      if (item === '__trailer') {
        itens.push({
          chave: `${t.sigla}:t${t.numero}e00:trailer`,
          tipo: 'trailer',
          codigo: codigoEpisodio(0, t.numero),
          episodio: 0,
          tema: null,
          temas: [],
          titulo: 'Trailer da temporada',
          semana,
          dia,
        });
      } else {
        const tema = TEMAS[item];
        itens.push({
          chave: `${t.sigla}:t${t.numero}e${pad(tema.episodio)}:${item}`,
          tipo: 'episodio',
          codigo: codigoEpisodio(tema.episodio, t.numero),
          episodio: tema.episodio,
          tema: item,
          temas: [item],
          titulo: tema.titulo,
          semana,
          dia,
        });
        semanaAtual.push(item);
      }
    }
    dia = somarDias(dia, 1);
  }
  return itens.map((i) => ({
    ...i,
    temporada: t.id,
    disciplina: t.disciplina,
    publicaEm: instanteEm(i.dia, HORA_PUBLICACAO).toISOString(),
  }));
}

const GRADES = new Map(TEMPORADAS.map((t) => [t.id, montarGrade(t)]));

export function temporadaDaDisciplina(disciplina) {
  return TEMPORADAS.find((t) => t.disciplina === disciplina) ?? null;
}

export function grade(temporadaId = 'mat-t1') {
  return GRADES.get(temporadaId) ?? [];
}

export function itemDoTema(slug) {
  for (const g of GRADES.values()) {
    const item = g.find((i) => i.tema === slug);
    if (item) return item;
  }
  return null;
}

// O que sai num dia (AAAA-MM-DD), para o agendador do vídeo.
export function planoDoDia(dia) {
  for (const g of GRADES.values()) {
    const item = g.find((i) => i.dia === dia);
    if (item) return item;
  }
  return null;
}

export function noAr(item, agora) {
  return new Date(agora).getTime() >= Date.parse(item.publicaEm);
}

// Grade com a situação de cada item: no-ar · hoje · proximo · em-breve.
export function situacao(temporadaId, agora) {
  const g = grade(temporadaId);
  const hoje = diaEmBrasilia(agora);
  const proximo = g.find((i) => !noAr(i, agora)) ?? null;
  const itens = g.map((i) => {
    let status = 'em-breve';
    if (noAr(i, agora)) status = 'no-ar';
    else if (i === proximo) status = i.dia === hoje ? 'hoje' : 'proximo';
    return { ...i, status };
  });
  const lancados = itens.filter((i) => i.status === 'no-ar' && i.tipo === 'episodio').length;
  return {
    itens,
    proximo: proximo ? itens.find((i) => i.chave === proximo.chave) : null,
    lancados,
    total: g.filter((i) => i.tipo === 'episodio').length,
    estreou: g.length > 0 && noAr(g[0], agora),
    terminou: g.length > 0 && noAr(g[g.length - 1], agora),
  };
}

// Tema do "Desafio do dia": o do episódio mais recente no ar. Antes da
// estreia (ou depois do fim), roda pela lista de temas, um por dia.
export function temaDoDesafio(agora, temporadaId = 'mat-t1') {
  const g = grade(temporadaId);
  const t = TEMPORADAS.find((x) => x.id === temporadaId);
  const recentes = g.filter((i) => i.tipo === 'episodio' && noAr(i, agora));
  const ultimo = recentes[recentes.length - 1];
  const hoje = diaEmBrasilia(agora);
  if (ultimo && diferencaEmDias(ultimo.dia, hoje) <= 1) return ultimo.tema;
  const indice = ((diferencaEmDias('2026-01-01', hoje) % t.temas.length) + t.temas.length) % t.temas.length;
  return t.temas[indice];
}
