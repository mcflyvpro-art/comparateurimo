-- =============================================================================
-- LES FAITS — ce qui rend possible « Estio affiche ce qu'il ne sait pas encore ».
--
-- Jusqu'ici une colonne nulle voulait dire deux choses indistinguables :
-- « personne ne l'a renseigné » et « ça vaut zéro ». Un bien sans loyer sortait
-- donc « Correct » au lieu de « Données incomplètes ».
--
-- `property_facts` tranche : un champ est CONFIRMÉ s'il a une ligne ici. Tout le
-- reste est une proposition d'Estio, affichée en pointillé et jamais tenue pour
-- vraie. C'est ce registre qui alimente les questions de l'écran du soir.
--
-- Registre APPEND-ONLY : on n'écrase jamais une réponse, on en ajoute une plus
-- récente. Il sert donc à la fois de provenance, de journal et de retour arrière.
-- =============================================================================

-- D'où vient une valeur. « propose_accepte » = Estio a proposé, l'humain a validé
-- d'un clic : c'est confirmé, mais on garde la nuance pour l'audit.
create type public.fact_source as enum ('extrait', 'saisi', 'propose_accepte', 'importe');

create table public.property_facts (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  -- Le nom du champ N1 confirmé (« estimated_rent », « works_estimate »…).
  -- Volontairement du texte et non un enum : le catalogue de questions est un
  -- contenu éditorial qui bougera souvent, une migration à chaque ajout serait
  -- un frein absurde.
  field       text not null,
  value       jsonb,
  source      public.fact_source not null default 'saisi',
  created_at  timestamptz not null default now()
);

-- La lecture dominante : « tous les faits confirmés de ce bien, le plus récent
-- de chaque champ d'abord ».
create index property_facts_property_field_idx
  on public.property_facts (property_id, field, created_at desc);

alter table public.property_facts enable row level security;

create policy "property_facts_select_own" on public.property_facts
  for select using (auth.uid() = user_id);
create policy "property_facts_insert_own" on public.property_facts
  for insert with check (auth.uid() = user_id);
create policy "property_facts_delete_own" on public.property_facts
  for delete using (auth.uid() = user_id);
-- Pas de policy UPDATE : le registre est append-only par construction.

-- =============================================================================
-- Trois champs N1 qui manquaient au formulaire de saisie.
-- Additif uniquement — aucune donnée existante n'est touchée.
-- =============================================================================

alter table public.properties
  -- Une petite copropriété encaisse mal un gros ravalement : le nombre de lots
  -- est un signal de risque que l'annonce donne presque toujours.
  add column if not exists lots_count integer,
  -- Travaux déjà VOTÉS en assemblée générale : juridiquement dus par l'acheteur,
  -- et invisibles dans le prix affiché. C'est le piège classique du primo.
  add column if not exists voted_works integer not null default 0,
  -- Depuis combien de jours le bien est en vente. Un bien qui traîne se négocie.
  add column if not exists listed_since_days integer;

comment on table public.property_facts is
  'Registre append-only des champs CONFIRMÉS par l''utilisateur. Absence de ligne = valeur proposée par Estio, jamais tenue pour vraie.';
comment on column public.properties.voted_works is
  'Travaux votés en AG, dus par l''acquéreur. Non compris dans le prix affiché.';
