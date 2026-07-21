-- MARKET_SNAPSHOTS : cache N2 périssable, clé géographique (jamais figé dans un bien)
create table public.market_snapshots (
  id          uuid primary key default gen_random_uuid(),
  address_key text not null,
  payload     jsonb not null default '{}'::jsonb,
  source      text,
  fetched_at  timestamptz not null default now(),
  ttl_hours   integer not null default 720,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index market_snapshots_address_key_idx on public.market_snapshots(address_key);
create trigger set_updated_at before update on public.market_snapshots
  for each row execute function extensions.moddatetime(updated_at);

-- STATUS_HISTORY : audit du pipeline
create table public.status_history (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  from_status public.property_status,
  to_status   public.property_status not null,
  reason      text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index status_history_property_id_idx on public.status_history(property_id);
create trigger set_updated_at before update on public.status_history
  for each row execute function extensions.moddatetime(updated_at);

-- COMPARISONS : confrontations sauvegardées
create table public.comparisons (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  project_id   uuid not null references public.projects(id) on delete cascade,
  property_ids uuid[] not null default '{}',
  profile      text not null default 'equilibre',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index comparisons_project_id_idx on public.comparisons(project_id);
create trigger set_updated_at before update on public.comparisons
  for each row execute function extensions.moddatetime(updated_at);
