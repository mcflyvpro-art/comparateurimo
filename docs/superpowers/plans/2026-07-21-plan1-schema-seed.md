# Plan 1 — Schéma Supabase & seed — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Poser tout le schéma de données Estio (toutes les tables, enums, RLS, Storage) sur le projet Supabase, avec un utilisateur démo et des données d'exemple, et un accès serveur depuis Next.js.

**Architecture:** Migrations SQL versionnées dans `supabase/migrations/`, appliquées sur le projet Supabase distant via le MCP (`apply_migration`). RLS activée dès le départ, policies `user_id = auth.uid()`. Comme l'auth réelle est Phase 5, on crée un **utilisateur démo** (email/mot de passe seedés) et un **client Supabase serveur démo** qui se connecte avec ces identifiants → toutes les requêtes passent la RLS avec `auth.uid()` = id démo. Types TS générés depuis le schéma.

**Tech Stack:** Supabase (Postgres 17), `@supabase/ssr` (déjà installé), Next.js App Router, TypeScript.

## Global Constraints

- Projet Supabase cible : **`cltvujujsmigbbtnslmk`** (comparateurimo, région eu-west-1).
- Toutes les tables : colonnes `id uuid primary key default gen_random_uuid()`, `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()` avec trigger `moddatetime`, **RLS activée**.
- Isolation : chaque table portant des données utilisateur a `user_id uuid not null` (directement ou via le projet parent) et une policy `auth.uid() = user_id`.
- **Jamais de N2 figé dans un bien** : le marché vit dans `market_snapshots` (cache périssable).
- Nommage : tables et colonnes en **snake_case anglais**, enums en snake_case.
- Migrations = fichiers `supabase/migrations/<timestamp>_<nom>.sql` **committés** dans le repo, ET appliqués via MCP `apply_migration` (name = `<nom>` sans timestamp/extension).
- Secrets démo dans `.env.local` (jamais committés) : `DEMO_USER_EMAIL`, `DEMO_USER_PASSWORD`.
- Vérifications via MCP : `list_tables`, `execute_sql`, `get_advisors` (type `security`).

---

### Task 1: Migration « foundation » (extensions, enums, trigger updated_at)

**Files:**
- Create: `supabase/migrations/20260721000001_foundation.sql`

**Interfaces:**
- Produces: extensions `pgcrypto`, `moddatetime` ; fonction implicite `moddatetime` (trigger) ; enums `property_status`, `plan_tier`, `add_source`, `tax_regime`, `note_kind`, `contact_kind`, `loan_type`, `market_scenario`. Ces enums sont consommés par la Task 2/3.

- [ ] **Step 1: Écrire la migration foundation**

Fichier `supabase/migrations/20260721000001_foundation.sql` :

```sql
-- Extensions
create extension if not exists pgcrypto with schema extensions;      -- gen_random_uuid, crypt
create extension if not exists moddatetime with schema extensions;   -- trigger updated_at

-- Enums métier
create type public.property_status as enum ('analyser','analyse','visite','nego','ecarte','offre');
create type public.plan_tier      as enum ('free','pro','expert');
create type public.add_source     as enum ('capture','paste','pdf','whatsapp','manual','extension');
create type public.tax_regime     as enum ('nu_micro','nu_reel','lmnp_micro','lmnp_reel','sci_ir','sci_is');
create type public.note_kind      as enum ('note','visite','nego');
create type public.contact_kind   as enum ('agent','mandataire','particulier','notaire','autre');
create type public.loan_type      as enum ('amortissable','in_fine');
create type public.market_scenario as enum ('prudent','central','dynamique');
```

- [ ] **Step 2: Appliquer la migration via MCP**

Appeler `apply_migration` sur le projet `cltvujujsmigbbtnslmk`, name `foundation`, query = contenu du fichier ci-dessus.
Expected : succès, aucune erreur.

- [ ] **Step 3: Vérifier les enums créés**

Appeler `execute_sql` :
```sql
select typname from pg_type where typname in
('property_status','plan_tier','add_source','tax_regime','note_kind','contact_kind','loan_type','market_scenario')
order by typname;
```
Expected : 8 lignes.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260721000001_foundation.sql
git commit -m "feat(db): extensions + enums métier Estio"
```

---

### Task 2: Migration « core tables » (profiles, subscriptions, projects, contacts)

**Files:**
- Create: `supabase/migrations/20260721000002_core.sql`

**Interfaces:**
- Consumes: enums de la Task 1.
- Produces: tables `public.profiles(id→auth.users)`, `public.subscriptions`, `public.projects`, `public.contacts`. `projects.id` et `contacts.id` sont référencés par `properties` (Task 3).

- [ ] **Step 1: Écrire la migration core**

Fichier `supabase/migrations/20260721000002_core.sql` :

```sql
-- Helper trigger : updated_at
-- (moddatetime prend le nom de la colonne en argument)

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
  criteria   jsonb not null default '{}'::jsonb,   -- {budget_max, goal, target_type, zone...}
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
```

- [ ] **Step 2: Appliquer via MCP** — `apply_migration`, name `core`, query = fichier ci-dessus. Expected : succès.

- [ ] **Step 3: Vérifier** — `list_tables` (schema public) → doit contenir `profiles, subscriptions, projects, contacts`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260721000002_core.sql
git commit -m "feat(db): tables profiles, subscriptions, projects, contacts"
```

---

### Task 3: Migration « properties » (properties + property_scenarios)

**Files:**
- Create: `supabase/migrations/20260721000003_properties.sql`

**Interfaces:**
- Consumes: enums (Task 1), `projects.id`, `contacts.id` (Task 2).
- Produces: `public.properties`, `public.property_scenarios` (1-1 via `property_id`). `properties.id` référencé par les tables filles (Task 4/5).

- [ ] **Step 1: Écrire la migration properties**

Fichier `supabase/migrations/20260721000003_properties.sql` :

```sql
-- PROPERTIES : le bien (N1) + contexte humain
create table public.properties (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references public.projects(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  status         public.property_status not null default 'analyser',
  board_position double precision not null default 0,   -- ordre dans la colonne
  add_source     public.add_source not null default 'manual',
  contact_id     uuid references public.contacts(id) on delete set null,
  max_price      integer,                               -- prix max (contexte humain)
  discard_reason text,                                  -- si status = ecarte
  -- N1 : localisation
  address        text,
  address_extra  text,
  city           text,
  postal_code    text,
  insee_code     text,
  lat            double precision,
  lng            double precision,
  -- N1 : caractéristiques
  property_type       text,                             -- Studio, T1, T2...
  surface_carrez      double precision,
  rooms               integer,
  bedrooms            integer,
  floor               integer,
  floors_total        integer,
  has_elevator        boolean,
  year_built          integer,
  condition           text,
  dpe_letter          text,
  ges_letter          text,
  dpe_value           integer,
  exposure            text,
  has_balcony         boolean,
  has_terrace         boolean,
  outdoor_area        double precision,
  has_parking         boolean,
  has_cave            boolean,
  furnished           boolean not null default false,
  -- N1 : chiffres du bien
  asking_price          integer,
  works_estimate        integer not null default 0,
  monthly_copro_charges integer not null default 0,
  property_tax          integer not null default 0,     -- taxe foncière annuelle
  estimated_rent        integer,                        -- loyer mensuel présumé
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index properties_project_id_idx on public.properties(project_id);
create index properties_user_id_idx    on public.properties(user_id);
create index properties_status_idx     on public.properties(status);
create trigger set_updated_at before update on public.properties
  for each row execute function extensions.moddatetime(updated_at);

-- PROPERTY_SCENARIOS : la config d'investissement (N3), 1-1 avec le bien
create table public.property_scenarios (
  id                uuid primary key default gen_random_uuid(),
  property_id       uuid not null references public.properties(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete cascade,
  apport_pct        double precision not null default 10,
  interest_rate     double precision not null default 3.85,
  duration_years    integer not null default 20,
  loan_type         public.loan_type not null default 'amortissable',
  insurance_rate    double precision not null default 0.34,
  insurance_on_initial boolean not null default true,
  notary_fees_pct   double precision not null default 8,
  dossier_fees      integer not null default 1000,
  guarantee_type    text not null default 'caution',
  guarantee_fees    integer not null default 0,
  broker_fees       integer not null default 0,
  deferral_months   integer not null default 0,
  tax_regime        public.tax_regime not null default 'lmnp_reel',
  tmi_pct           double precision not null default 30,
  management_fees_pct double precision not null default 0,
  gli               boolean not null default false,
  pno               boolean not null default true,
  vacancy_pct       double precision not null default 0,
  works_provision   integer not null default 0,
  horizon_years     integer not null default 15,
  market_scenario   public.market_scenario not null default 'central',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index property_scenarios_property_id_key on public.property_scenarios(property_id);
create trigger set_updated_at before update on public.property_scenarios
  for each row execute function extensions.moddatetime(updated_at);
```

- [ ] **Step 2: Appliquer via MCP** — `apply_migration`, name `properties`. Expected : succès.

- [ ] **Step 3: Vérifier** — `execute_sql` :
```sql
select column_name from information_schema.columns
where table_schema='public' and table_name='properties' order by ordinal_position;
```
Expected : la liste des colonnes ci-dessus (≈ 35 colonnes).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260721000003_properties.sql
git commit -m "feat(db): tables properties (N1) + property_scenarios (N3)"
```

---

### Task 4: Migration « filles » (notes, photos, documents) + buckets Storage

**Files:**
- Create: `supabase/migrations/20260721000004_children_storage.sql`

**Interfaces:**
- Consumes: `properties.id` (Task 3).
- Produces: `public.property_notes`, `public.property_photos`, `public.property_documents` ; buckets Storage `property-photos`, `property-documents` (privés).

- [ ] **Step 1: Écrire la migration**

Fichier `supabase/migrations/20260721000004_children_storage.sql` :

```sql
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

-- PHOTOS (fichiers dans le bucket property-photos)
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

-- DOCUMENTS (fichiers dans le bucket property-documents)
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
```

- [ ] **Step 2: Appliquer via MCP** — `apply_migration`, name `children_storage`. Expected : succès.

- [ ] **Step 3: Vérifier les buckets** — `execute_sql` :
```sql
select id, public from storage.buckets where id in ('property-photos','property-documents');
```
Expected : 2 lignes, `public = false`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260721000004_children_storage.sql
git commit -m "feat(db): notes/photos/documents + buckets Storage privés"
```

---

### Task 5: Migration « marché & historique » (market_snapshots, status_history, comparisons)

**Files:**
- Create: `supabase/migrations/20260721000005_market_history.sql`

**Interfaces:**
- Consumes: `properties.id`, `projects.id`.
- Produces: `public.market_snapshots` (cache N2), `public.status_history`, `public.comparisons`.

- [ ] **Step 1: Écrire la migration**

Fichier `supabase/migrations/20260721000005_market_history.sql` :

```sql
-- MARKET_SNAPSHOTS : cache N2 périssable, clé géographique (jamais figé dans un bien)
create table public.market_snapshots (
  id          uuid primary key default gen_random_uuid(),
  address_key text not null,                 -- insee_code ou geohash
  payload     jsonb not null default '{}'::jsonb, -- {dvf, loyers, tension, vacance, demographie, risques...}
  source      text,
  fetched_at  timestamptz not null default now(),
  ttl_hours   integer not null default 720,  -- péremption (30j par défaut)
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
```

- [ ] **Step 2: Appliquer via MCP** — `apply_migration`, name `market_history`. Expected : succès.

- [ ] **Step 3: Vérifier** — `list_tables` (public) → 11 tables au total : profiles, subscriptions, projects, contacts, properties, property_scenarios, property_notes, property_photos, property_documents, market_snapshots, status_history, comparisons (12 en comptant comparisons).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260721000005_market_history.sql
git commit -m "feat(db): market_snapshots (cache N2), status_history, comparisons"
```

---

### Task 6: Migration « RLS » (activation + policies sur toutes les tables + Storage)

**Files:**
- Create: `supabase/migrations/20260721000006_rls.sql`

**Interfaces:**
- Consumes: toutes les tables (Task 2-5) + buckets (Task 4).
- Produces: RLS activée + policies `auth.uid() = user_id` partout ; policies Storage limitées au préfixe `<user_id>/`.

- [ ] **Step 1: Écrire la migration RLS**

Fichier `supabase/migrations/20260721000006_rls.sql` :

```sql
-- Active la RLS sur toutes les tables applicatives
alter table public.profiles            enable row level security;
alter table public.subscriptions       enable row level security;
alter table public.projects            enable row level security;
alter table public.contacts            enable row level security;
alter table public.properties          enable row level security;
alter table public.property_scenarios  enable row level security;
alter table public.property_notes      enable row level security;
alter table public.property_photos     enable row level security;
alter table public.property_documents  enable row level security;
alter table public.status_history      enable row level security;
alter table public.comparisons         enable row level security;
alter table public.market_snapshots    enable row level security;

-- PROFILES : l'utilisateur ne voit/écrit que sa propre ligne (id = auth.uid())
create policy "profiles self" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Tables « user_id » : accès total à ses propres lignes
create policy "subscriptions owner" on public.subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "projects owner" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "contacts owner" on public.contacts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "properties owner" on public.properties
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "property_scenarios owner" on public.property_scenarios
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "property_notes owner" on public.property_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "property_photos owner" on public.property_photos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "property_documents owner" on public.property_documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "status_history owner" on public.status_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "comparisons owner" on public.comparisons
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- MARKET_SNAPSHOTS : donnée publique (open data), lecture pour tout utilisateur connecté,
-- écriture réservée au service role (pas de policy insert/update pour les clients).
create policy "market read" on public.market_snapshots
  for select using (auth.role() = 'authenticated');

-- STORAGE : chaque utilisateur n'accède qu'aux fichiers préfixés par son user_id
create policy "photos owner" on storage.objects
  for all using (bucket_id = 'property-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'property-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "documents owner" on storage.objects
  for all using (bucket_id = 'property-documents' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'property-documents' and (storage.foldername(name))[1] = auth.uid()::text);
```

- [ ] **Step 2: Appliquer via MCP** — `apply_migration`, name `rls`. Expected : succès.

- [ ] **Step 3: Vérifier via l'advisor sécurité** — appeler `get_advisors` type `security`.
Expected : **aucune** alerte « RLS disabled / policy exists but RLS disabled » sur les tables `public.*`. (Corriger si l'advisor remonte une table oubliée.)

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260721000006_rls.sql
git commit -m "feat(db): RLS + policies owner sur toutes les tables + Storage"
```

---

### Task 7: Utilisateur démo + seed de données d'exemple

**Files:**
- Create: `supabase/migrations/20260721000007_seed_demo.sql`
- Modify: `.env.local` (ajout `DEMO_USER_EMAIL`, `DEMO_USER_PASSWORD`)
- Modify: `.env.example` (mêmes clés, valeurs vides)

**Interfaces:**
- Consumes: toutes les tables + RLS (Task 2-6).
- Produces: utilisateur démo `auth.users` id fixe `00000000-0000-0000-0000-0000000000e5` (email `demo@estio.immo`), sa `profiles` + `subscriptions`, 2 projets, ~6 biens répartis sur les statuts avec scénarios, quelques notes/contacts, 1 `market_snapshot`. Ces id/valeurs sont consommés par les plans suivants (lecture).

- [ ] **Step 1: Écrire le seed (utilisateur démo + données)**

Fichier `supabase/migrations/20260721000007_seed_demo.sql`.
> Note : on insère l'utilisateur démo directement dans `auth.users` avec un mot de passe chiffré (`crypt`) + une identité, pour pouvoir se connecter côté serveur. Idempotent via `on conflict do nothing`.

```sql
-- 1) Utilisateur démo dans auth.users (mot de passe = 'estio-demo-2026')
insert into auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-0000000000e5',
  'authenticated','authenticated','demo@estio.immo',
  extensions.crypt('estio-demo-2026', extensions.gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb
) on conflict (id) do nothing;

-- Identité email (nécessaire pour le login mot de passe)
insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(),
  '00000000-0000-0000-0000-0000000000e5',
  '00000000-0000-0000-0000-0000000000e5',
  '{"sub":"00000000-0000-0000-0000-0000000000e5","email":"demo@estio.immo","email_verified":true}'::jsonb,
  'email', now(), now(), now()
) on conflict do nothing;

-- 2) Profil + abonnement
insert into public.profiles (id, email, full_name) values
  ('00000000-0000-0000-0000-0000000000e5','demo@estio.immo','Investisseur démo')
  on conflict (id) do nothing;
insert into public.subscriptions (user_id, plan) values
  ('00000000-0000-0000-0000-0000000000e5','pro')
  on conflict (user_id) do nothing;

-- 3) Projets (id fixes pour les plans suivants)
insert into public.projects (id, user_id, name, criteria, archived) values
  ('00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-0000000000e5',
   'T2/T3 Lyon locatif',
   '{"budget_max":250000,"goal":"cash-flow ≥ 0","target_type":"T2/T3","zone":"Lyon"}'::jsonb, false),
  ('00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-0000000000e5',
   'Résidence étudiante',
   '{"budget_max":160000,"goal":"rendement ≥ 6 %","target_type":"Studio","zone":"Lyon"}'::jsonb, true)
  on conflict (id) do nothing;

-- 4) Contact d'exemple
insert into public.contacts (id, user_id, name, kind, agency) values
  ('00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-0000000000e5',
   'M. Dubois','agent','Agence Part-Dieu')
  on conflict (id) do nothing;

-- 5) Biens (répartis sur les statuts) — id fixes
insert into public.properties
  (id, project_id, user_id, status, board_position, add_source, contact_id, max_price, discard_reason,
   address, city, postal_code, insee_code, lat, lng, property_type, surface_carrez, rooms, floor,
   has_elevator, year_built, dpe_letter, has_parking, furnished,
   asking_price, works_estimate, monthly_copro_charges, property_tax, estimated_rent)
values
  ('00000000-0000-0000-0000-000000000301','00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-0000000000e5',
   'analyser', 1, 'capture', null, 178000, null,
   'Rue Paul Bert','Lyon 3e','69003','69383',45.7590,4.8560,'T2',33,2,3,true,1975,'D',false,false,
   189000,6000,92,780,780),
  ('00000000-0000-0000-0000-000000000302','00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-0000000000e5',
   'analyser', 2, 'paste', null, null, null,
   'Rue de la Guillotière','Lyon 7e','69007','69387',45.7520,4.8430,'T2',40,2,2,false,1960,'C',false,false,
   205000,3000,82,690,850),
  ('00000000-0000-0000-0000-000000000303','00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-0000000000e5',
   'analyse', 1, 'manual', null, 222000, null,
   'Cours Tolstoï','Villeurbanne','69100','69266',45.7680,4.8790,'T3',58,3,4,true,1982,'E',true,false,
   235000,15000,133,920,990),
  ('00000000-0000-0000-0000-000000000304','00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-0000000000e5',
   'visite', 1, 'capture', '00000000-0000-0000-0000-000000000201', 152000, null,
   'Quai Saint-Vincent','Lyon 1er','69001','69381',45.7700,4.8270,'Studio',24,1,2,false,1930,'D',false,false,
   158000,2000,68,540,690),
  ('00000000-0000-0000-0000-000000000305','00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-0000000000e5',
   'nego', 1, 'manual', '00000000-0000-0000-0000-000000000201', 149000, null,
   'Quai Saint-Vincent (2)','Lyon 1er','69001','69381',45.7695,4.8265,'Studio',26,1,3,false,1932,'C',false,false,
   158000,2000,70,540,700),
  ('00000000-0000-0000-0000-000000000306','00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-0000000000e5',
   'ecarte', 1, 'manual', null, null, 'Travaux trop lourds',
   'Avenue Berthelot','Lyon 8e','69008','69388',45.7440,4.8620,'T4',82,4,1,false,1968,'F',false,false,
   289000,40000,200,1200,1150)
  on conflict (id) do nothing;

-- 6) Un scénario par bien (valeurs par défaut de la table)
insert into public.property_scenarios (property_id, user_id)
select p.id, p.user_id from public.properties p
where p.id like '00000000-0000-0000-0000-0000000003%'
on conflict (property_id) do nothing;

-- 7) Quelques notes
insert into public.property_notes (property_id, user_id, kind, body) values
  ('00000000-0000-0000-0000-000000000301','00000000-0000-0000-0000-0000000000e5','note','Copro saine, à voir le bruit côté rue.'),
  ('00000000-0000-0000-0000-000000000304','00000000-0000-0000-0000-0000000000e5','visite','Studio lumineux, cuisine à refaire.'),
  ('00000000-0000-0000-0000-000000000305','00000000-0000-0000-0000-0000000000e5','nego','Offre à 149k proposée, en attente retour.')
  on conflict do nothing;

-- 8) Un market_snapshot d'exemple (Lyon 3e)
insert into public.market_snapshots (address_key, payload, source) values
  ('69383',
   '{"dvf_m2":6050,"loyer_marche_m2":15.4,"tension":82,"vacance":6.1,"revenus_medians":24800}'::jsonb,
   'seed')
  on conflict do nothing;
```

- [ ] **Step 2: Appliquer via MCP** — `apply_migration`, name `seed_demo`. Expected : succès.

- [ ] **Step 3: Vérifier le seed** — `execute_sql` :
```sql
select
  (select count(*) from public.projects)   as projets,
  (select count(*) from public.properties) as biens,
  (select count(*) from public.property_scenarios) as scenarios,
  (select count(*) from auth.users where id='00000000-0000-0000-0000-0000000000e5') as demo_user;
```
Expected : `projets=2, biens=6, scenarios=6, demo_user=1`.

- [ ] **Step 4: Ajouter les secrets démo**

Dans `.env.local` (non committé) :
```
DEMO_USER_EMAIL=demo@estio.immo
DEMO_USER_PASSWORD=estio-demo-2026
```
Dans `.env.example` (committé), mêmes clés à vide :
```
DEMO_USER_EMAIL=
DEMO_USER_PASSWORD=
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260721000007_seed_demo.sql .env.example
git commit -m "feat(db): utilisateur démo + seed (2 projets, 6 biens, scénarios, notes)"
```

---

### Task 8: Client Supabase serveur démo + types TS générés + smoke read

**Files:**
- Create: `src/lib/supabase/types.ts` (types générés)
- Create: `src/lib/supabase/demo-session.ts` (client serveur connecté en démo)
- Modify: `src/app/(app)/app/page.tsx` (smoke read : liste les projets du démo)

**Interfaces:**
- Consumes: schéma + seed (Task 1-7), `DEMO_USER_EMAIL`/`DEMO_USER_PASSWORD`.
- Produces:
  - `getDemoClient(): Promise<SupabaseClient<Database>>` — client serveur authentifié en tant qu'utilisateur démo (RLS active).
  - `DEMO_USER_ID = '00000000-0000-0000-0000-0000000000e5'`.
  - Type `Database` exporté depuis `src/lib/supabase/types.ts`.

- [ ] **Step 1: Générer les types TS depuis Supabase**

Appeler le MCP `generate_typescript_types` (projet `cltvujujsmigbbtnslmk`) et écrire le résultat dans `src/lib/supabase/types.ts` (il exporte `export type Database = ...`).

- [ ] **Step 2: Écrire le client démo serveur**

Fichier `src/lib/supabase/demo-session.ts` :
```ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export const DEMO_USER_ID = "00000000-0000-0000-0000-0000000000e5";

/**
 * Client Supabase serveur connecté en tant qu'utilisateur démo.
 * Tant que l'auth réelle n'existe pas (Phase 5), toutes les lectures/écritures
 * de l'app passent par ici → la RLS s'applique avec auth.uid() = DEMO_USER_ID.
 */
export async function getDemoClient(): Promise<SupabaseClient<Database>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const email = process.env.DEMO_USER_EMAIL!;
  const password = process.env.DEMO_USER_PASSWORD!;

  const client = createClient<Database>(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error("Connexion démo échouée : " + error.message);
  return client;
}
```

- [ ] **Step 3: Smoke read dans la page /app**

Remplacer le contenu de `src/app/(app)/app/page.tsx` par une lecture réelle (Server Component) :
```tsx
import { getDemoClient } from "@/lib/supabase/demo-session";

export const metadata = { title: "Tableau de bord — Estio" };

export default async function AppDashboard() {
  const supabase = await getDemoClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, archived")
    .order("created_at");

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-sans text-3xl font-semibold tracking-[-0.02em] text-text md:text-4xl">
        Tableau de bord
      </h1>
      <ul className="mt-8 space-y-2">
        {(projects ?? []).map((p) => (
          <li key={p.id} className="rounded-xl border border-border bg-bg-alt px-4 py-3 text-text">
            {p.name} {p.archived ? "· (archivé)" : ""}
          </li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 4: Vérifier en local**

Run : `npm run dev` puis ouvrir `http://localhost:3000/app`.
Expected : la page liste **T2/T3 Lyon locatif** et **Résidence étudiante · (archivé)** (données réelles lues via la RLS démo). Vérifier aussi `npm run build` (vert) et `npm run lint` (vert).

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase/types.ts src/lib/supabase/demo-session.ts "src/app/(app)/app/page.tsx"
git commit -m "feat(app): client Supabase démo + types générés + lecture projets réelle"
```

---

## Self-Review

**Spec coverage (spec §4 modèle de données) :** les 12 tables de la spec sont créées (Task 2-5) ; RLS + Storage (Task 6) ; utilisateur démo seedé + RLS `auth.uid()` (Task 7-8, couvre spec §2.11 et §5) ; buckets photos/documents (Task 4, couvre spec §3⑨) ; `market_snapshots` cache périssable non figé (Task 5, couvre spec §2.9). Types + accès serveur (Task 8). ✅

**Placeholder scan :** aucun « TBD/TODO » ; tout le SQL et le TS sont complets. ✅

**Type consistency :** `getDemoClient` / `DEMO_USER_ID` / `Database` définis en Task 8 et réutilisés tels quels par les plans suivants ; enums référencés (Task 1) correspondent aux colonnes (Task 2-5) ; id fixes du seed (Task 7) cohérents avec les vérifications. ✅

**Note d'exécution :** les `apply_migration` MCP modifient le projet Supabase distant **réel** (pas de branche). C'est voulu (build « pour de vrai »). Les fichiers `.sql` restent la source de vérité committée dans `supabase/migrations/`.
