import { defineConfig, devices } from '@playwright/test';

// Rode com: npm run test:e2e (faz o build e sobe o preview).
// Em ambientes com Chromium já instalado, aponte CHROMIUM_PATH para ele.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } }, testIgnore: /celular\.spec\.js/ },
    { name: 'celular', use: { ...devices['Pixel 7'] }, testMatch: /celular\.spec\.js/ },
  ],
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
});
