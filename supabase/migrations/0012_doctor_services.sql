-- Phase 2.5C: Doctor services mapping foundation
-- Creates only public.doctor_services

create table if not exists public.doctor_services (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id),
  doctor_practice_location_id uuid null references public.doctor_practice_locations(id),
  center_id uuid null references public.centers(id),
  center_location_id uuid null references public.center_locations(id),
  center_service_id uuid null references public.center_services(id),
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
  constraint doctor_services_service_scope_check check (
    service_id is not null
    or specialty_id is not null
    or service_category_id is not null
  )
);

create index if not exists idx_doctor_services_doctor_id
  on public.doctor_services(doctor_id);

create index if not exists idx_doctor_services_doctor_practice_location_id
  on public.doctor_services(doctor_practice_location_id)
  where doctor_practice_location_id is not null;

create index if not exists idx_doctor_services_center_id
  on public.doctor_services(center_id)
  where center_id is not null;

create index if not exists idx_doctor_services_center_location_id
  on public.doctor_services(center_location_id)
  where center_location_id is not null;

create index if not exists idx_doctor_services_center_service_id
  on public.doctor_services(center_service_id)
  where center_service_id is not null;

create index if not exists idx_doctor_services_taxonomy_group_id
  on public.doctor_services(taxonomy_group_id)
  where taxonomy_group_id is not null;

create index if not exists idx_doctor_services_service_category_id
  on public.doctor_services(service_category_id)
  where service_category_id is not null;

create index if not exists idx_doctor_services_service_id
  on public.doctor_services(service_id)
  where service_id is not null;

create index if not exists idx_doctor_services_specialty_id
  on public.doctor_services(specialty_id)
  where specialty_id is not null;

create index if not exists idx_doctor_services_deleted_at
  on public.doctor_services(deleted_at)
  where deleted_at is not null;

create unique index if not exists uq_doctor_services_doctor_slug_active
  on public.doctor_services(doctor_id, slug)
  where slug is not null and deleted_at is null;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_doctor_services_set_updated_at'
  ) then
    create trigger trg_doctor_services_set_updated_at
      before update on public.doctor_services
      for each row
      execute function public.set_updated_at();
  end if;
end $$;
