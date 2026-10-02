-- EduKan · esquema inicial.
-- Todas as tabelas com RLS. A API escreve com a service role (que ignora
-- RLS); o navegador, com a chave pública, só lê os próprios dados.

-- Tentativas de exercício. A questão é refeita pela semente, então não
-- guardamos o enunciado: só tema, semente e a alternativa escolhida.
create table public.attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  topic text not null,
  seed integer not null check (seed > 0),
  choice smallint not null check (choice between 0 and 4),
  correct boolean not null,
  mode text not null default 'pratica' check (mode in ('pratica', 'revisao')),
  created_at timestamptz not null default now()
);
create index attempts_user_created_idx on public.attempts (user_id, created_at);

-- Revisão espaçada: um ciclo por tema (1, 3, 7 e 21 dias depois de base_on).
create table public.reviews (
  user_id uuid not null references auth.users (id) on delete cascade,
  topic text not null,
  base_on date not null,
  step smallint not null default 0 check (step between 0 and 4),
  due_on date,
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, topic)
);
-- Para o aviso no celular: quem tem revisão vencendo hoje.
create index reviews_due_idx on public.reviews (due_on) where not done;

-- Posts nas redes. A chave única (ex.: mat:t1e05:razao-e-proporcao) impede post duplicado.
create table public.social_posts (
  id bigint generated always as identity primary key,
  key text not null,
  kind text not null check (kind in ('reel', 'story')),
  platform text not null default 'instagram' check (platform in ('instagram', 'youtube', 'tiktok')),
  status text not null default 'pendente' check (status in ('pendente', 'publicando', 'publicado', 'erro')),
  permalink text,
  media_id text,
  error text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (key, kind, platform)
);

-- Configurações do servidor (ex.: token do Instagram renovado).
create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Erros do navegador e do servidor.
create table public.app_errors (
  id bigint generated always as identity primary key,
  source text not null,
  message text not null,
  stack text,
  url text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index app_errors_created_idx on public.app_errors (created_at desc);

alter table public.attempts enable row level security;
alter table public.reviews enable row level security;
alter table public.social_posts enable row level security;
alter table public.app_settings enable row level security;
alter table public.app_errors enable row level security;

-- Cada pessoa lê só o próprio progresso.
create policy "ler as próprias tentativas" on public.attempts
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "ler as próprias revisões" on public.reviews
  for select to authenticated using ((select auth.uid()) = user_id);

-- Posts publicados são públicos (a página da série mostra o link).
create policy "posts publicados são públicos" on public.social_posts
  for select to anon, authenticated using (status = 'publicado');

-- app_settings e app_errors: sem política = ninguém além da service role.
