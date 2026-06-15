-- Cafe directory schema

create type category_type as enum (
  'overall',
  'coffee',
  'desserts',
  'social',
  'work',
  'value'
);

create table if not exists public.cafes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  city text not null,
  average numeric(4, 2) not null,
  aesthetic_score numeric(4, 2) not null,
  coffee_score numeric(4, 2) not null,
  desserts_score numeric(4, 2) not null,
  amenities_score numeric(4, 2) not null,
  times_visited integer not null default 0,
  price_min numeric(8, 2),
  price_max numeric(8, 2),
  price_to_quality numeric(8, 4),
  notes text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  google_maps_url text,
  address text,
  geocode_verified boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.category_picks (
  id uuid primary key default gen_random_uuid(),
  category category_type not null,
  rank integer not null check (rank between 1 and 3),
  cafe_name text not null,
  city text,
  updated_at timestamptz not null default now(),
  unique (category, rank)
);

create table if not exists public.yet_to_try (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null default 'Jeddah',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists cafes_city_average_idx on public.cafes (city, average desc);
create index if not exists category_picks_category_idx on public.category_picks (category, rank);

alter table public.cafes enable row level security;
alter table public.category_picks enable row level security;
alter table public.yet_to_try enable row level security;

create policy "Public read cafes"
  on public.cafes for select
  to anon, authenticated
  using (true);

create policy "Public read category_picks"
  on public.category_picks for select
  to anon, authenticated
  using (true);

create policy "Public read yet_to_try"
  on public.yet_to_try for select
  to anon, authenticated
  using (true);
