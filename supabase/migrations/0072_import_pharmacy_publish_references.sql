-- IMPORT-PUBLISH-AD: durable Pharmacy private publish references

create table if not exists public.import_pharmacy_publish_references (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  actor_profile_id uuid not null references public.profiles(id) on delete restrict,
  entity_id uuid not null references public.centers(id) on delete restrict,
  idempotency_record_id uuid not null references public.import_publish_idempotency_records(id) on delete restrict,
  rollback_snapshot_id uuid not null references public.import_publish_rollback_snapshots(id) on delete restrict,
  expected_current_version text not null,
  expected_snapshot_hash text not null check (expected_snapshot_hash ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint import_pharmacy_publish_references_expiry check (expires_at > created_at)
);

create index if not exists import_pharmacy_publish_references_actor_entity_idx
  on public.import_pharmacy_publish_references (actor_profile_id, entity_id, created_at desc);

alter table public.import_pharmacy_publish_references enable row level security;

comment on table public.import_pharmacy_publish_references is
  'Server-only opaque rollback references for one controlled Pharmacy private publish.';
