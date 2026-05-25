do $$
begin
  create type doctor_title as enum (
    'dr',
    'prof',
    'consultant',
    'specialist',
    'therapist',
    'dentist',
    'other'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type doctor_gender as enum (
    'male',
    'female',
    'unspecified'
  );
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title doctor_title not null default 'dr',
  gender doctor_gender not null default 'unspecified',
  full_name_en text not null,
  full_name_ar text null,
  display_name_en text null,
  display_name_ar text null,
  bio_en text null,
  bio_ar text null,
  profile_image_url text null,
  license_number text null,
  years_experience integer null,
  primary_specialty_id uuid null references public.specialties(id),
  verification_status verification_status not null default 'unverified',
  status provider_status not null default 'draft',
  default_locale app_locale not null default 'en',
  default_country country_code not null default 'om',
  is_active boolean not null default true,
  is_claimable boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint doctors_years_experience_check
    check (years_experience is null or (years_experience >= 0 and years_experience <= 80)),
  constraint doctors_profile_image_url_check
    check (
      profile_image_url is null
      or profile_image_url ~* '^(https?://|/)[^\s]+$'
    )
);

create index if not exists doctors_primary_specialty_id_idx
  on public.doctors (primary_specialty_id)
  where primary_specialty_id is not null;

create index if not exists doctors_verification_status_idx
  on public.doctors (verification_status);

create index if not exists doctors_status_idx
  on public.doctors (status);

create index if not exists doctors_default_country_idx
  on public.doctors (default_country);

create index if not exists doctors_is_active_idx
  on public.doctors (is_active);

create index if not exists doctors_deleted_at_idx
  on public.doctors (deleted_at)
  where deleted_at is not null;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_doctors_updated_at'
  ) then
    create trigger set_doctors_updated_at
    before update on public.doctors
    for each row
    execute function public.set_updated_at();
  end if;
end
$$;
