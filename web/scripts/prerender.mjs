// Pré-render: gera um HTML pronto para cada página (Google e prévia de
// link), o sitemap.xml, o robots.txt e o _headers do Cloudflare Pages.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const raiz = path.resolve(import.meta.dirname, '..');
const dist = path.join(raiz, 'dist');
const { render, metaDaRota, rotasEstaticas } = await import(pathToFileURL(path.join(raiz, 'dist-ssr/entry-server.js')).href);

const SITE = (process.env.SITE_URL || 'https://edukan.pages.dev').replace(/\/$/, '');
const API = (process.env.VITE_API_URL || '').replace(/\/$/, '');
const SUPABASE = (process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SEM_INDICE = new Set(['/progresso', '/entrar']);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const modelo = await readFile(path.join(dist, 'index.html'), 'utf8');

function cabecalho(rota, meta) {
  const url = `${SITE}${rota === '/' ? '/' : rota}`;
  return [
    `<title>${esc(meta.titulo)}</title>`,
    `<meta name="description" content="${esc(meta.descricao)}" />`,
    meta.naoEncontrada || SEM_INDICE.has(rota) ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${url}" />`,
    '<meta property="og:site_name" content="EduKan" />',
    '<meta property="og:locale" content="pt_BR" />',
    '<meta property="og:type" content="website" />',
    `<meta property="og:title" content="${esc(meta.titulo)}" />`,
    `<meta property="og:description" content="${esc(meta.descricao)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${SITE}/compartilhar.png" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
  ].join('\n    ');
}

async function salvar(arquivo, rota) {
  const meta = metaDaRota(rota);
  const html = modelo.replace('<!--app-head-->', cabecalho(rota, meta)).replace('<!--app-html-->', render(rota));
  await mkdir(path.dirname(arquivo), { recursive: true });
  await writeFile(arquivo, html);
}

const rotas = rotasEstaticas();
// /tema/escala → dist/tema/escala.html: o Cloudflare Pages serve sem barra no fim e sem redirecionar.
for (const rota of rotas) {
  await salvar(rota === '/' ? path.join(dist, 'index.html') : path.join(dist, `${rota.slice(1)}.html`), rota);
}
// Endereço desconhecido: o Cloudflare Pages serve o 404.html com status 404.
await salvar(path.join(dist, '404.html'), '/pagina-nao-encontrada');

const hoje = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rotas
  .filter((r) => !SEM_INDICE.has(r))
  .map((r) => `  <url><loc>${SITE}${r === '/' ? '/' : r}</loc><lastmod>${hoje}</lastmod></url>`)
  .join('\n')}
</urlset>
`;
await writeFile(path.join(dist, 'sitemap.xml'), sitemap);
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /progresso\nDisallow: /entrar\n\nSitemap: ${SITE}/sitemap.xml\n`);

const conectar = ["'self'", API, SUPABASE, SUPABASE && SUPABASE.replace(/^https:/, 'wss:')].filter(Boolean).join(' ');
const headers = `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src ${conectar}; manifest-src 'self'; worker-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/sw.js
  Cache-Control: no-cache
`;
await writeFile(path.join(dist, '_headers'), headers);
await rm(path.join(raiz, 'dist-ssr'), { recursive: true, force: true });

console.log(`[prerender] ${rotas.length + 1} páginas, sitemap e _headers gerados para ${SITE}`);
