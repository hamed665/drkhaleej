alter table public.specialties
  add column if not exists parent_specialty_id uuid null references public.specialties(id),
  add column if not exists specialty_level text not null default 'specialty',
  add column if not exists clinical_domain text null,
  add column if not exists age_focus text not null default 'all',
  add column if not exists is_doctor_specialty boolean not null default true,
  add column if not exists is_primary_care boolean not null default false,
  add column if not exists is_surgical boolean not null default false,
  add column if not exists is_dental boolean not null default false,
  add column if not exists public_directory_enabled boolean not null default true,
  add column if not exists public_profile_enabled boolean not null default true,
  add column if not exists source_system text null,
  add column if not exists source_version text null;

alter table public.specialties
  add constraint specialties_parent_not_self_check
  check (parent_specialty_id is null or parent_specialty_id <> id);

alter table public.specialties
  add constraint specialties_specialty_level_check
  check (specialty_level in ('generalist', 'specialty', 'subspecialty', 'fellowship', 'role'));

alter table public.specialties
  add constraint specialties_age_focus_check
  check (age_focus in ('all', 'adult', 'pediatric', 'maternal', 'geriatric'));

create index if not exists specialties_parent_specialty_id_idx
  on public.specialties (parent_specialty_id)
  where parent_specialty_id is not null;

create index if not exists specialties_specialty_level_idx
  on public.specialties (specialty_level)
  where deleted_at is null;

create index if not exists specialties_clinical_domain_idx
  on public.specialties (clinical_domain)
  where clinical_domain is not null and deleted_at is null;

create table if not exists public.specialty_aliases (
  id uuid primary key default gen_random_uuid(),
  specialty_id uuid not null references public.specialties(id) on delete cascade,
  locale text not null,
  alias text not null,
  normalized_alias text not null,
  source_system text null,
  source_version text null,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint specialty_aliases_locale_check check (locale in ('en', 'ar', 'fa', 'all')),
  constraint specialty_aliases_alias_not_empty_check check (length(trim(alias)) > 0),
  constraint specialty_aliases_normalized_alias_not_empty_check check (length(trim(normalized_alias)) > 0),
  constraint specialty_aliases_unique unique (specialty_id, locale, normalized_alias)
);

create index if not exists specialty_aliases_specialty_id_idx
  on public.specialty_aliases (specialty_id);

create index if not exists specialty_aliases_normalized_alias_idx
  on public.specialty_aliases (normalized_alias)
  where is_active = true and deleted_at is null;

alter table public.specialty_aliases enable row level security;

drop policy if exists specialty_aliases_select_public_active on public.specialty_aliases;
create policy specialty_aliases_select_public_active
  on public.specialty_aliases
  for select
  to anon, authenticated
  using (
    is_active = true
    and deleted_at is null
    and exists (
      select 1
      from public.specialties specialty
      where specialty.id = specialty_aliases.specialty_id
        and specialty.is_active = true
        and specialty.deleted_at is null
        and specialty.public_directory_enabled = true
        and specialty.public_profile_enabled = true
    )
  );

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_specialty_aliases_updated_at'
  ) then
    create trigger set_specialty_aliases_updated_at
    before update on public.specialty_aliases
    for each row
    execute function public.set_updated_at();
  end if;
end $$;
