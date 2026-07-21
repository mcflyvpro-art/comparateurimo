-- NOTES : fil de notes / CR visite / négo
create table public.property_notes (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        public.note_kind not null default 'note',
  body        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index property_notes_property_id_idx on public.property_notes(property_id);
create trigger set_updated_at before update on public.property_notes
  for each row execute function extensions.moddatetime(updated_at);

-- PHOTOS (bucket property-photos)
create table public.property_photos (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references public.properties(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  caption      text,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index property_photos_property_id_idx on public.property_photos(property_id);
create trigger set_updated_at before update on public.property_photos
  for each row execute function extensions.moddatetime(updated_at);

-- DOCUMENTS (bucket property-documents)
create table public.property_documents (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references public.properties(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  filename     text not null,
  doc_type     text not null default 'other',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index property_documents_property_id_idx on public.property_documents(property_id);
create trigger set_updated_at before update on public.property_documents
  for each row execute function extensions.moddatetime(updated_at);

-- Buckets Storage privés
insert into storage.buckets (id, name, public) values
  ('property-photos','property-photos', false),
  ('property-documents','property-documents', false)
on conflict (id) do nothing;
