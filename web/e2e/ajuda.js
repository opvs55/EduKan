import { expect } from '@playwright/test';

// Erros de console que importam (ignora rede: fontes e API fora do ar no teste).
export function vigiarConsole(page) {
  const erros = [];
  page.on('pageerror', (e) => erros.push(e.message));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/Failed to load resource|net::ERR_/.test(t)) return;
    erros.push(t);
  });
  return {
    async semErros() {
      expect(erros, erros.join('\n')).toEqual([]);
    },
  };
}

export async function semTour(page) {
  await page.addInitScript(() => window.localStorage.setItem('edukan:tour:v1', 'true'));
}

// Instante em Brasília (UTC−3).
export const brasilia = (dia, hora = '12:00') => new Date(`${dia}T${hora}:00-03:00`);
