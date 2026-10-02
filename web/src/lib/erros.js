import { api } from './api.js';

// Manda para a API os erros que acontecem no navegador (no máximo 5 por visita).
export function instalarRelatorioDeErros() {
  let enviados = 0;
  const enviar = (mensagem, pilha) => {
    if (enviados >= 5 || !mensagem) return;
    enviados++;
    api('/ops/erros', {
      method: 'POST',
      corpo: { mensagem: String(mensagem).slice(0, 2000), pilha: pilha ? String(pilha).slice(0, 8000) : undefined, url: location.pathname },
    }).catch(() => {});
  };
  window.addEventListener('error', (e) => enviar(e.message, e.error?.stack));
  window.addEventListener('unhandledrejection', (e) => enviar(e.reason?.message ?? e.reason, e.reason?.stack));
}
