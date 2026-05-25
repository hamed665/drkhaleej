create table if not exists public.center_locations (
    id uuid primary key default gen_random_uuid(),
    center_id uuid not null references public.centers(id),
    country_id uuid not null references public.geo_countries(id),
    region_id uuid not null references public.geo_regions(id),
    city_id uuid not null references public.geo_cities(id),
    area_id uuid null references public.geo_areas(id),
    slug text not null,
    name_en text null,
    name_ar text null,
    address_line1_en text null,
    address_line1_ar text null,
    address_line2_en text null,
    address_line2_ar text null,
    landmark_en text null,
    landmark_ar text null,
    postal_code text null,
    primary_phone text null,
    secondary_phone text null,
    whatsapp_phone text null,
    email text null,
    map_url text null,
    latitude numeric(9,6) null,
    longitude numeric(9,6) null,
    is_primary boolean not null default false,
    is_active boolean not null default true,
    sort_order integer not null default 0,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz null,
    constraint center_locations_center_id_slug_key unique (center_id, slug),
    constraint center_locations_latitude_range_check check (latitude is null or (latitude >= -90 and latitude <= 90)),
    constraint center_locations_longitude_range_check check (longitude is null or (longitude >= -180 and longitude <= 180)),
    constraint center_locations_email_format_check check (
        email is null or email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    ),
    constraint center_locations_map_url_format_check check (
        map_url is null or map_url ~* '^(https?://|/)[^\s]+$'
    )
);

create index if not exists idx_center_locations_center_id
    on public.center_locations (center_id);

create index if not exists idx_center_locations_country_id
    on public.center_locations (country_id);

create index if not exists idx_center_locations_region_id
    on public.center_locations (region_id);

create index if not exists idx_center_locations_city_id
    on public.center_locations (city_id);

create index if not exists idx_center_locations_area_id
    on public.center_locations (area_id)
    where area_id is not null;

create index if not exists idx_center_locations_deleted_at
    on public.center_locations (deleted_at)
    where deleted_at is not null;

do $$
begin
    if not exists (
        select 1
        from pg_trigger
        where tgname = 'trg_center_locations_set_updated_at'
    ) then
        create trigger trg_center_locations_set_updated_at
            before update on public.center_locations
            for each row
            execute function public.set_updated_at();
    end if;
end
$$;
