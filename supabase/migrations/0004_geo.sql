create table if not exists public.geo_countries (
  id uuid primary key default gen_random_uuid(),
  code country_code not null unique,
  slug text not null unique,
  name_en text not null,
  name_ar text not null,
  phone_country_code text,
  currency_code text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.geo_regions (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.geo_countries(id),
  slug text not null,
  name_en text not null,
  name_ar text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint geo_regions_country_id_slug_key unique (country_id, slug)
);

create table if not exists public.geo_cities (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.geo_countries(id),
  region_id uuid references public.geo_regions(id),
  slug text not null,
  name_en text not null,
  name_ar text not null,
  is_capital boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint geo_cities_country_id_slug_key unique (country_id, slug)
);

create table if not exists public.geo_areas (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.geo_countries(id),
  region_id uuid references public.geo_regions(id),
  city_id uuid not null references public.geo_cities(id),
  slug text not null,
  name_en text not null,
  name_ar text not null,
  latitude numeric(9,6),
  longitude numeric(9,6),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint geo_areas_city_id_slug_key unique (city_id, slug),
  constraint geo_areas_latitude_check check (latitude is null or (latitude >= -90 and latitude <= 90)),
  constraint geo_areas_longitude_check check (longitude is null or (longitude >= -180 and longitude <= 180))
);

create index if not exists idx_geo_regions_country_id on public.geo_regions(country_id);
create index if not exists idx_geo_cities_country_id on public.geo_cities(country_id);
create index if not exists idx_geo_cities_region_id_not_null on public.geo_cities(region_id) where region_id is not null;
create index if not exists idx_geo_areas_country_id on public.geo_areas(country_id);
create index if not exists idx_geo_areas_region_id_not_null on public.geo_areas(region_id) where region_id is not null;
create index if not exists idx_geo_areas_city_id on public.geo_areas(city_id);

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_geo_countries_set_updated_at'
  ) then
    create trigger trg_geo_countries_set_updated_at
    before update on public.geo_countries
    for each row
    execute function public.set_updated_at();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_geo_regions_set_updated_at'
  ) then
    create trigger trg_geo_regions_set_updated_at
    before update on public.geo_regions
    for each row
    execute function public.set_updated_at();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_geo_cities_set_updated_at'
  ) then
    create trigger trg_geo_cities_set_updated_at
    before update on public.geo_cities
    for each row
    execute function public.set_updated_at();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_geo_areas_set_updated_at'
  ) then
    create trigger trg_geo_areas_set_updated_at
    before update on public.geo_areas
    for each row
    execute function public.set_updated_at();
  end if;
end;
$$;
