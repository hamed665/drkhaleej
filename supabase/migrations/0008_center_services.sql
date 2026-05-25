create table if not exists public.center_services (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id),
  center_location_id uuid null references public.center_locations(id),
  taxonomy_group_id uuid null references public.taxonomy_groups(id),
  service_category_id uuid null references public.service_categories(id),
  service_id uuid null references public.services(id),
  specialty_id uuid null references public.specialties(id),
  slug text null,
  display_name_en text null,
  display_name_ar text null,
  description_en text null,
  description_ar text null,
  is_available boolean not null default true,
  requires_medical_disclaimer boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint center_services_service_scope_check check (
    service_id is not null
    or specialty_id is not null
    or service_category_id is not null
  )
);

create unique index if not exists center_services_center_slug_unique_idx
  on public.center_services (center_id, slug)
  where slug is not null and deleted_at is null;

create index if not exists center_services_center_id_idx
  on public.center_services (center_id);

create index if not exists center_services_center_location_id_idx
  on public.center_services (center_location_id)
  where center_location_id is not null;

create index if not exists center_services_taxonomy_group_id_idx
  on public.center_services (taxonomy_group_id)
  where taxonomy_group_id is not null;

create index if not exists center_services_service_category_id_idx
  on public.center_services (service_category_id)
  where service_category_id is not null;

create index if not exists center_services_service_id_idx
  on public.center_services (service_id)
  where service_id is not null;

create index if not exists center_services_specialty_id_idx
  on public.center_services (specialty_id)
  where specialty_id is not null;

create index if not exists center_services_deleted_at_idx
  on public.center_services (deleted_at)
  where deleted_at is not null;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_center_services_updated_at'
  ) then
    create trigger set_center_services_updated_at
    before update on public.center_services
    for each row
    execute function public.set_updated_at();
  end if;
end
$$;
