-- 1) Utilisateur démo dans auth.users (id fixe, pour l'intégrité des FK).
--    L'app y accède via le service role (pas de login requis dans ce build).
--    Un mot de passe est posé pour un éventuel login futur (Phase 5).
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
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Investisseur démo"}'::jsonb
) on conflict (id) do nothing;

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
where p.user_id = '00000000-0000-0000-0000-0000000000e5'
on conflict (property_id) do nothing;

-- 7) Quelques notes
insert into public.property_notes (property_id, user_id, kind, body) values
  ('00000000-0000-0000-0000-000000000301','00000000-0000-0000-0000-0000000000e5','note','Copro saine, à voir le bruit côté rue.'),
  ('00000000-0000-0000-0000-000000000304','00000000-0000-0000-0000-0000000000e5','visite','Studio lumineux, cuisine à refaire.'),
  ('00000000-0000-0000-0000-000000000305','00000000-0000-0000-0000-0000000000e5','nego','Offre à 149k proposée, en attente retour.');

-- 8) Un market_snapshot d'exemple (Lyon 3e)
insert into public.market_snapshots (address_key, payload, source) values
  ('69383',
   '{"dvf_m2":6050,"loyer_marche_m2":15.4,"tension":82,"vacance":6.1,"revenus_medians":24800}'::jsonb,
   'seed');
