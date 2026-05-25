create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid null,
  email text null,
  phone text null,
  full_name text null,
  display_name text null,
  avatar_url text null,
  locale app_locale not null default 'en',
  country country_code not null default 'om',
  verification_status verification_status not null default 'unverified',
  is_platform_admin boolean not null default false,
  is_provider_user boolean not null default false,
  is_patient_user boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint profiles_email_format_check check (
    email is null or email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  )
);

create unique index if not exists profiles_auth_user_id_unique_idx
  on public.profiles (auth_user_id)
  where auth_user_id is not null;

create index if not exists profiles_email_idx
  on public.profiles (email)
  where email is not null;

create index if not exists profiles_phone_idx
  on public.profiles (phone)
  where phone is not null;

create index if not exists profiles_deleted_at_idx
  on public.profiles (deleted_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_profiles_updated_at'
  ) then
    create trigger set_profiles_updated_at
    before update on public.profiles
    for each row
    execute function public.set_updated_at();
  end if;
end $$;
