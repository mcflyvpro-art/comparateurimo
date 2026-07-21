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
