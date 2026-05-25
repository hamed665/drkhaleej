create table if not exists public.taxonomy_groups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_ar text not null,
  description_en text null,
  description_ar text null,
  is_medical boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  taxonomy_group_id uuid not null references public.taxonomy_groups(id),
  parent_category_id uuid null references public.service_categories(id),
  slug text not null,
  name_en text not null,
  name_ar text not null,
  description_en text null,
  description_ar text null,
  is_medical boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint service_categories_taxonomy_group_slug_unique unique (taxonomy_group_id, slug),
  constraint service_categories_parent_not_self_check check (parent_category_id is null or parent_category_id <> id)
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  taxonomy_group_id uuid not null references public.taxonomy_groups(id),
  category_id uuid null references public.service_categories(id),
  slug text not null,
  name_en text not null,
  name_ar text not null,
  description_en text null,
  description_ar text null,
  search_keywords_en text[] not null default '{}',
  search_keywords_ar text[] not null default '{}',
  is_medical boolean not null default true,
  requires_medical_disclaimer boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint services_taxonomy_group_slug_unique unique (taxonomy_group_id, slug)
);

create table if not exists public.specialties (
  id uuid primary key default gen_random_uuid(),
  taxonomy_group_id uuid null references public.taxonomy_groups(id),
  slug text not null unique,
  name_en text not null,
  name_ar text not null,
  description_en text null,
  description_ar text null,
  is_medical boolean not null default true,
  requires_medical_disclaimer boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create index if not exists service_categories_taxonomy_group_id_idx
  on public.service_categories (taxonomy_group_id);

create index if not exists service_categories_parent_category_id_idx
  on public.service_categories (parent_category_id)
  where parent_category_id is not null;

create index if not exists services_taxonomy_group_id_idx
  on public.services (taxonomy_group_id);

create index if not exists services_category_id_idx
  on public.services (category_id)
  where category_id is not null;

create index if not exists specialties_taxonomy_group_id_idx
  on public.specialties (taxonomy_group_id)
  where taxonomy_group_id is not null;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_taxonomy_groups_updated_at'
  ) then
    create trigger set_taxonomy_groups_updated_at
    before update on public.taxonomy_groups
    for each row
    execute function public.set_updated_at();
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_service_categories_updated_at'
  ) then
    create trigger set_service_categories_updated_at
    before update on public.service_categories
    for each row
    execute function public.set_updated_at();
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_services_updated_at'
  ) then
    create trigger set_services_updated_at
    before update on public.services
    for each row
    execute function public.set_updated_at();
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_specialties_updated_at'
  ) then
    create trigger set_specialties_updated_at
    before update on public.specialties
    for each row
    execute function public.set_updated_at();
  end if;
end $$;
