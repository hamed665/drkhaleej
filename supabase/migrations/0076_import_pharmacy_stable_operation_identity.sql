-- IMPORT-ADMIN-AB: stable Pharmacy operation and idempotency identity.
-- Existing short-lived v2 read-state rows remain readable only by legacy code; all new v3 writes persist the full identity group.

alter table public.import_pharmacy_admin_read_states
  add column if not exists operation_attempt_id uuid,
  add column if not exists idempotency_key text,
  add column if not exists request_hash text,
  add column if not exists patch_hash text,
  add column if not exists operation_scope text,
  add column if not exists entity_family text,
  add column if not exists expected_entity_version text;

alter table public.import_pharmacy_admin_read_states
  add constraint import_pharmacy_admin_read_states_operation_identity_group check (
    (
      operation_attempt_id is null
      and idempotency_key is null
      and request_hash is null
      and patch_hash is null
      and operation_scope is null
      and entity_family is null
      and expected_entity_version is null
    )
    or
    (
      operation_attempt_id is not null
      and char_length(btrim(idempotency_key)) between 1 and 200
      and request_hash ~ '^[a-f0-9]{64}$'
      and patch_hash ~ '^[a-f0-9]{64}$'
      and operation_scope = 'reserve_private_publish'
      and entity_family = 'pharmacy'
      and char_length(btrim(expected_entity_version)) between 1 and 120
    )
  ) not valid;

alter table public.import_pharmacy_admin_read_states
  validate constraint import_pharmacy_admin_read_states_operation_identity_group;

create unique index if not exists import_pharmacy_admin_read_states_attempt_operation_idx
  on public.import_pharmacy_admin_read_states (operation_attempt_id, operation)
  where operation_attempt_id is not null;

create unique index if not exists import_pharmacy_admin_read_states_idempotency_operation_idx
  on public.import_pharmacy_admin_read_states (idempotency_key, operation)
  where idempotency_key is not null;

comment on column public.import_pharmacy_admin_read_states.operation_attempt_id is
  'Deterministic UUID derived from actor, entity, snapshot, fingerprint, expected version, patch hash, family, and operation scope.';
comment on column public.import_pharmacy_admin_read_states.idempotency_key is
  'Stable idempotency key reused for the same reviewed operation attempt across refresh and multi-tab requests.';
comment on column public.import_pharmacy_admin_read_states.request_hash is
  'Canonical request identity hash for conflict detection.';
comment on column public.import_pharmacy_admin_read_states.patch_hash is
  'Canonical reviewed proposed-state hash bound to the operation attempt.';
