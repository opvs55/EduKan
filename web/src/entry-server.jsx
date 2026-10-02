import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { App, criarQueryClient } from './App.jsx';

export { metaDaRota, rotasEstaticas } from './lib/seo.js';

export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <App queryClient={criarQueryClient()} />
    </StaticRouter>,
  );
}
