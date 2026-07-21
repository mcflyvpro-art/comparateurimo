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

-- PROFILES : id = auth.uid()
create policy "profiles self" on public.profiles
  for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Tables « user_id » : accès total à ses propres lignes
create policy "subscriptions owner" on public.subscriptions
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "projects owner" on public.projects
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "contacts owner" on public.contacts
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "properties owner" on public.properties
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "property_scenarios owner" on public.property_scenarios
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "property_notes owner" on public.property_notes
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "property_photos owner" on public.property_photos
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "property_documents owner" on public.property_documents
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "status_history owner" on public.status_history
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "comparisons owner" on public.comparisons
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- MARKET_SNAPSHOTS : donnée publique (open data), lecture pour tout utilisateur connecté ;
-- écriture réservée au service role (aucune policy insert/update pour les clients).
create policy "market read" on public.market_snapshots
  for select to authenticated using (true);

-- STORAGE : chaque utilisateur n'accède qu'aux fichiers préfixés par son user_id
create policy "photos owner" on storage.objects
  for all to authenticated
  using (bucket_id = 'property-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'property-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "documents owner" on storage.objects
  for all to authenticated
  using (bucket_id = 'property-documents' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'property-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
