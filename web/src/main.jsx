import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App, criarQueryClient } from './App.jsx';
import { instalarRelatorioDeErros } from './lib/erros.js';
import './estilos/app.css';

const raiz = document.getElementById('raiz');
const arvore = (
  <StrictMode>
    <BrowserRouter>
      <App queryClient={criarQueryClient()} />
    </BrowserRouter>
  </StrictMode>
);

// Páginas pré-renderizadas no build são hidratadas. Com parâmetros na URL
// (ex.: /praticar?tema=…) o HTML estático não corresponde, então monta do zero.
if (raiz.firstElementChild && !window.location.search) hydrateRoot(raiz, arvore);
else createRoot(raiz).render(arvore);

if (import.meta.env.PROD) {
  instalarRelatorioDeErros();
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
}
