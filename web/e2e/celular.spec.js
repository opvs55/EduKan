import { expect, test } from '@playwright/test';
import { semTour, vigiarConsole } from './ajuda.js';

test('no celular: navegação inferior e página de tema legível', async ({ page }) => {
  const console = vigiarConsole(page);
  await semTour(page);
  await page.goto('/');
  const atalhos = page.getByRole('navigation', { name: 'Atalhos' });
  await expect(atalhos).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Principal' })).toBeHidden();
  await atalhos.getByRole('link', { name: 'Série' }).click();
  await expect(page).toHaveURL(/\/serie\/matematica$/);

  await page.goto('/tema/porcentagem');
  // sem rolagem horizontal
  const larguras = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(larguras[0]).toBeLessThanOrEqual(larguras[1]);
  await console.semErros();
});
