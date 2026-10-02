// Service worker simples: arquivos com hash (/assets) vêm do cache; páginas
// vêm da rede e, sem internet, da última versão guardada.
const VERSAO = 'edukan-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      for (const chave of await caches.keys()) if (chave !== VERSAO) await caches.delete(chave);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.open(VERSAO).then(async (cache) => {
        const guardado = await cache.match(req);
        if (guardado) return guardado;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      }),
    );
    return;
  }

  if (req.mode === 'navigate') {
    e.respondWith(
      (async () => {
        const cache = await caches.open(VERSAO);
        try {
          const res = await fetch(req);
          if (res.ok) cache.put(req, res.clone());
          return res;
        } catch {
          return (await cache.match(req)) || (await cache.match('/')) || Response.error();
        }
      })(),
    );
  }
});
