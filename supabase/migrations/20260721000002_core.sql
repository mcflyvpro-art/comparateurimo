-- PROFILES : 1-1 avec auth.users
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on public.profiles
  for each row execute function extensions.moddatetime(updated_at);

-- SUBSCRIPTIONS : placeholder Stripe (Phase 6)
create table public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users(id) on delete cascade,
  plan                   public.plan_tier not null default 'free',
  status                 text not null default 'active',
  current_period_end     timestamptz,
  stripe_customer_id     text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index subscriptions_user_id_key on public.subscriptions(user_id);
create trigger set_updated_at before update on public.subscriptions
  for each row execute function extensions.moddatetime(updated_at);

-- PROJECTS : un projet = un achat
create table public.projects (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  criteria   jsonb not null default '{}'::jsonb,
  archived   boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_user_id_idx on public.projects(user_id);
create trigger set_updated_at before update on public.projects
  for each row execute function extensions.moddatetime(updated_at);

-- CONTACTS : agents/mandataires réutilisables
create table public.contacts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  kind       public.contact_kind not null default 'agent',
  phone      text,
  email      text,
  agency     text,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index contacts_user_id_idx on public.contacts(user_id);
create trigger set_updated_at before update on public.contacts
  for each row execute function extensions.moddatetime(updated_at);
