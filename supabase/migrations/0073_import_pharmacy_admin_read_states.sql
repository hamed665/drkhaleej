-- IMPORT-ADMIN-G: bounded Pharmacy dry-run and review state persistence

create table if not exists public.import_pharmacy_admin_read_states (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid not null references public.profiles(id) on delete restrict,
  entity_id uuid not null references public.centers(id) on delete restrict,
  operation text not null check (operation in ('dry_run', 'review')),
  snapshot_hash text not null check (snapshot_hash ~ '^[a-f0-9]{64}$'),
  entity_fingerprint text not null check (entity_fingerprint ~ '^[a-f0-9]{64}$'),
  current_state jsonb not null,
  proposed_state jsonb not null,
  exact_diff jsonb not null,
  blocker_codes text[] not null default '{}',
  reviewed_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint import_pharmacy_admin_read_states_expiry check (expires_at > created_at),
  constraint import_pharmacy_admin_read_states_review_time check (
    (operation = 'dry_run' and reviewed_at is null)
    or
    (operation = 'review' and reviewed_at is not null and reviewed_at >= created_at and reviewed_at < expires_at)
  )
);

create unique index if not exists import_pharmacy_admin_read_states_identity_idx
  on public.import_pharmacy_admin_read_states (
    actor_profile_id,
    entity_id,
    operation,
    snapshot_hash,
    entity_fingerprint
  );

create index if not exists import_pharmacy_admin_read_states_actor_entity_created_idx
  on public.import_pharmacy_admin_read_states (actor_profile_id, entity_id, created_at desc);

alter table public.import_pharmacy_admin_read_states enable row level security;

comment on table public.import_pharmacy_admin_read_states is
  'Server-only bounded dry-run and review state for one allowlisted Pharmacy Preview canary.';
