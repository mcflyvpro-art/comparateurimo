-- PROPERTIES : le bien (N1) + contexte humain
create table public.properties (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references public.projects(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  status         public.property_status not null default 'analyser',
  board_position double precision not null default 0,
  add_source     public.add_source not null default 'manual',
  contact_id     uuid references public.contacts(id) on delete set null,
  max_price      integer,
  discard_reason text,
  -- N1 : localisation
  address        text,
  address_extra  text,
  city           text,
  postal_code    text,
  insee_code     text,
  lat            double precision,
  lng            double precision,
  -- N1 : caractéristiques
  property_type       text,
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
  property_tax          integer not null default 0,
  estimated_rent        integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index properties_project_id_idx on public.properties(project_id);
create index properties_user_id_idx    on public.properties(user_id);
create index properties_status_idx     on public.properties(status);
create trigger set_updated_at before update on public.properties
  for each row execute function extensions.moddatetime(updated_at);

-- PROPERTY_SCENARIOS : config d'investissement (N3), 1-1 avec le bien
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
