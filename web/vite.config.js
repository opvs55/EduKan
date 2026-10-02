import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Em desenvolvimento, /api vai para a API local (npm run dev:api).
    proxy: { '/api': 'http://localhost:3000' },
  },
  ssr: {
    noExternal: ['@edukan/conteudo'],
  },
  test: {
    include: ['src/**/*.test.{js,jsx}'],
  },
});
