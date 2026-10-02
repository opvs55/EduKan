# EduKan

Site de estudo + série em vídeo curta e encadeada nas redes. Cada episódio ensina um tema e leva para a página dele no site.

**Vídeo → página de estudo → exercício → volta amanhã para o próximo episódio.**

MVP: **Matemática para o ENEM, Temporada 1** (15 temas em 4 blocos). História, Sociologia e Programação aparecem como "em breve".

## Estrutura

```
conteudo/   @edukan/conteudo: o coração do projeto, usado pelo site e pela API
  src/fichario/matematica.js   fatos revisados de cada tema (a IA só pode usar o que está aqui)
  src/geradores/               um gerador de exercícios por tema; resposta calculada por código
  src/verificador.js           recalcula qualquer conta escrita em texto ("200 × 0,90 = 180")
  src/programacao.js           grade da série (dom–sex 19h, sábado de revisão), chave única por post
  src/progresso.js             revisão espaçada (1, 3, 7, 21 dias), sequência de dias, resumo
api/        Node + Express (Render): conteúdo, correção, progresso, tutor (Gemini), ops
web/        Vite + React + React Router + TanStack Query (Cloudflare Pages), com pré-render
supabase/   migrações do banco (Postgres + Auth + RLS)
```

## Rodar localmente

Precisa de Node 22.

```bash
npm install
npm run dev:api   # API em http://localhost:3000 (sem .env: sem contas e sem tutor)
npm run dev:web   # site em http://localhost:5173 (repassa /api para a porta 3000)
```

Sem nenhuma configuração o site funciona inteiro: páginas, série, exercícios e progresso (guardado no navegador). Para ligar contas e tutor, copie `api/.env.example` para `api/.env` e `web/.env.example` para `web/.env` e preencha.

## Testes

```bash
npm test                          # unidade: conteúdo (118), API (26), site (3)
cd web && npm run test:e2e        # build + Playwright: primeira visita, tema, prática, revisão, série, celular
```

Se o Chromium já estiver instalado em outro lugar, use `CHROMIUM_PATH=/caminho/do/chromium npm run test:e2e`.

Os testes de conteúdo geram 600 questões de cada tema e conferem que toda conta do fichário, dos passos e das explicações está certa, que as 5 alternativas são diferentes e que a correção bate com a semente.

## Regras de qualidade já aplicadas

| Regra do guia | Onde |
|---|---|
| Fatos só do fichário | `conteudo/src/fichario/`; o prompt do tutor (`api/src/modules/tutor/prompt.js`) só recebe o fichário do tema |
| Matemática por código | geradores com semente; a API refaz a questão pela semente para corrigir (não confia no navegador) |
| Conferir toda conta | `verificarTexto` roda nos testes do fichário e em cada resposta do tutor; conta errada → pede de novo dizendo qual (até 3 vezes) e, se insistir, não mostra |
| Fecho não diz o próximo tema | teste em `conteudo/test/fichario.test.js`; a página da série esconde o título dos episódios futuros |
| Público 13+ / LGPD | login pede confirmação de idade; sem conta, nada sai do navegador; política em `/privacidade` |
| Limites e orçamento de IA | `api/src/shared/escudo.js` (por minuto, hora, dia e concorrência → 503 `SERVICE_BUSY`) e limite por IP com `CF-Connecting-IP` |
| Calendário único | site e API usam a mesma `programacao.js` |

## A série

A data de estreia fica em `conteudo/src/programacao.js` (`inicio: '2026-10-11'`, um domingo). A grade sai dela: trailer no domingo, um episódio por dia de domingo a sexta às 19h (Brasília) e sábado de revisão. O link de cada vídeo aparece no site quando a tabela `social_posts` tem um post `publicado` com a chave do episódio (ex.: `mat:t1e05:razao-e-proporcao`).

## Deploy

1. **Supabase**: crie o projeto e rode `supabase/migrations/20261002000000_inicial.sql`. Em Authentication → URL Configuration, coloque o endereço do site (para o link de login por e-mail).
2. **API no Render**: New → Blueprint → este repositório (usa `render.yaml`). Preencha `CORS_ORIGINS` (endereço do site), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `GOOGLE_API_KEY`.
3. **Site no Cloudflare Pages**: build `npm ci && npm run build -w web`, saída `web/dist`. Variáveis: `VITE_API_URL` (endereço da API), `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (chave pública) e `SITE_URL`. O pré-render gera uma página HTML por rota, `sitemap.xml`, `robots.txt`, `404.html` e `_headers` (CSP e cache).

Segredos (só os nomes; os valores ficam no Render, no Cloudflare e no GitHub): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_API_KEY`, `OPS_TOKEN`, `VITE_SUPABASE_ANON_KEY`.

## API

| Rota | O que faz |
|---|---|
| `GET /api/v1/saude` | saúde (banco e IA) |
| `GET /api/v1/disciplinas`, `/temas`, `/temas/:slug` | catálogo e fichário |
| `GET /api/v1/series/:disciplina` | grade com status e links dos posts |
| `GET /api/v1/hoje` | o que sai hoje e o Desafio do dia (para os stories) |
| `GET /api/v1/praticar/:tema/questao` | questão sem gabarito |
| `POST /api/v1/praticar/corrigir` | corrige pela semente; com sessão, grava a tentativa |
| `GET /api/v1/progresso` · `POST /progresso/importar` · `POST /revisoes/:tema` | progresso da conta |
| `POST /api/v1/tutor` | tutor do tema (Gemini, JSON validado, contas conferidas) |
| `POST /api/v1/ops/erros` · `GET /api/v1/ops/estado` | erros do navegador; estado (com `x-ops-token`) |

## Próximos passos (ordem do guia)

1. Pipeline de vídeo curto (roteiro Gemini → revisão → voz → Remotion → conferência ffmpeg → prévia), publicação no Instagram à mão e depois agendada.
2. Search Console com o `sitemap.xml`.
3. Web push para revisões vencidas e "Desafio do dia" nos stories (a rota `/hoje` já existe).
4. Medição simples (visitas por origem, exercícios, volta em 7 dias).
5. História e Português, formato estendido com diálogo, YouTube e TikTok.
