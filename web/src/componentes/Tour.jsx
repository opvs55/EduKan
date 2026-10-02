import { useEffect, useState } from 'react';
import { ler, gravar } from '../lib/armazenamento.js';

const CHAVE = 'edukan:tour:v1';
const PASSOS = [
  { titulo: 'Assista', texto: 'Todo dia, de domingo a sexta às 19h, sai um episódio de 1 minuto nas redes. Cada um continua do anterior.' },
  { titulo: 'Estude', texto: 'Cada episódio tem uma página aqui, com o conceito, um exemplo passo a passo e o erro que quase todo mundo comete.' },
  { titulo: 'Pratique e volte', texto: 'Os exercícios são gerados e corrigidos na hora. O tema volta para revisão em 1, 3, 7 e 21 dias.' },
];

export function Tour() {
  const [passo, setPasso] = useState(null);
  useEffect(() => {
    if (!ler(CHAVE)) setPasso(0);
  }, []);
  if (passo === null) return null;
  const fechar = () => {
    gravar(CHAVE, true);
    setPasso(null);
  };
  const atual = PASSOS[passo];
  const ultimo = passo === PASSOS.length - 1;
  return (
    <div className="tour-fundo" onClick={(e) => e.target === e.currentTarget && fechar()} onKeyDown={(e) => e.key === 'Escape' && fechar()}>
      <div className="tour" role="dialog" aria-modal="true" aria-labelledby="tour-titulo">
        <div className="tour-corpo">
          <span className="sobretitulo">
            Bem-vindo ao EduKan · {passo + 1} de {PASSOS.length}
          </span>
          <h2 id="tour-titulo">{atual.titulo}</h2>
          <p>{atual.texto}</p>
        </div>
        <div className="tour-acoes">
          <div className="tour-pontos" aria-hidden="true">
            {PASSOS.map((_, i) => (
              <span key={i} className={i === passo ? 'ativo' : ''} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-p" onClick={fechar}>
              Pular
            </button>
            <button type="button" className="btn btn-primario btn-p" autoFocus onClick={() => (ultimo ? fechar() : setPasso(passo + 1))}>
              {ultimo ? 'Começar' : 'Próximo →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
