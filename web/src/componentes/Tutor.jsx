import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api.js';

export function Tutor({ tema, sugestao }) {
  const [pergunta, setPergunta] = useState('');
  const [conversa, setConversa] = useState([]);
  const envio = useMutation({
    mutationFn: (texto) =>
      api('/tutor', {
        method: 'POST',
        corpo: { tema, pergunta: texto, historico: conversa.slice(-6).map((m) => ({ papel: m.papel, texto: m.texto })) },
      }),
    onSuccess: (r, texto) => {
      setConversa((c) => [...c, { papel: 'user', texto }, { papel: 'model', texto: r.resposta }]);
      setPergunta('');
    },
  });
  const enviar = (e) => {
    e.preventDefault();
    const texto = pergunta.trim() || (conversa.length === 0 ? sugestao : '');
    if (texto.length >= 3 && !envio.isPending) envio.mutate(texto);
  };
  return (
    <>
      <p>Pergunte sobre este tema. O tutor explica, mas não resolve a lição por você.</p>
      {conversa.length > 0 && (
        <div className="tutor-conversa" aria-live="polite">
          {conversa.map((m, i) => (
            <div key={i} className={`tutor-msg ${m.papel === 'user' ? 'aluno' : 'tutor'}`}>
              {m.texto}
            </div>
          ))}
        </div>
      )}
      <form className="tutor-form" onSubmit={enviar}>
        <label className="so-leitor" htmlFor={`tutor-${tema}`}>
          Sua pergunta
        </label>
        <textarea
          id={`tutor-${tema}`}
          className="campo"
          rows={2}
          maxLength={500}
          placeholder={sugestao}
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) enviar(e);
          }}
        />
        <button type="submit" className="btn btn-contorno btn-p" disabled={envio.isPending}>
          {envio.isPending ? 'Pensando…' : 'Perguntar →'}
        </button>
        {envio.isError && <span className="mensagem-erro">{envio.error.message}</span>}
        <span className="aviso-pequeno">Respostas geradas por IA a partir do fichário do tema; as contas são conferidas por código.</span>
      </form>
    </>
  );
}
