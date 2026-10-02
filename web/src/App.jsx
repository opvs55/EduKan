import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Routes } from 'react-router';
import { Layout } from './componentes/Layout.jsx';
import { ProgressoProvider } from './lib/progresso.jsx';
import { SessaoProvider } from './lib/sessao.jsx';
import Entrar from './paginas/Entrar.jsx';
import Inicio from './paginas/Inicio.jsx';
import Materia from './paginas/Materia.jsx';
import NaoEncontrado from './paginas/NaoEncontrado.jsx';
import Praticar from './paginas/Praticar.jsx';
import Progresso from './paginas/Progresso.jsx';
import Serie from './paginas/Serie.jsx';
import Tema from './paginas/Tema.jsx';
import { Ajuda, ComoFunciona, Privacidade, Termos } from './paginas/Textos.jsx';

export function criarQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false } } });
}

export function App({ queryClient }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessaoProvider>
        <ProgressoProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Inicio />} />
              <Route path="materia/:disciplina" element={<Materia />} />
              <Route path="tema/:slug" element={<Tema />} />
              <Route path="serie/:disciplina" element={<Serie />} />
              <Route path="praticar" element={<Praticar />} />
              <Route path="progresso" element={<Progresso />} />
              <Route path="entrar" element={<Entrar />} />
              <Route path="como-funciona" element={<ComoFunciona />} />
              <Route path="ajuda" element={<Ajuda />} />
              <Route path="privacidade" element={<Privacidade />} />
              <Route path="termos" element={<Termos />} />
              <Route path="*" element={<NaoEncontrado />} />
            </Route>
          </Routes>
        </ProgressoProvider>
      </SessaoProvider>
    </QueryClientProvider>
  );
}
