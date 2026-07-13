-- IMPORT-ADMIN-AC: Pharmacy authorization persistence v2.
-- Extends the existing server-only authorization authority. No reservation or entity mutation.

alter table public.import_pharmacy_publish_authorizations
  add column if not exists review_state_id uuid references public.import_pharmacy_admin_read_states(id) on delete restrict,
  add column if not exists operation_attempt_id uuid,
  add column if not exists idempotency_key text,
  add column if not exists request_hash text,
  add column if not exists patch_hash text,
  add column if not exists expected_entity_version text,
  add column if not exists entity_family text,
  add column if not exists operation_scope text,
  add column if not exists status text,
  add column if not exists invalidated_at timestamptz,
  add column if not exists invalidation_reason text,
  add column if not exists consumed_by_reservation_id uuid references public.import_publish_idempotency_records(id) on delete restrict;

alter table public.import_pharmacy_publish_authorizations
  add constraint import_pharmacy_publish_authorizations_v2_identity_group check (
    (
      review_state_id is null
      and operation_attempt_id is null
      and idempotency_key is null
      and request_hash is null
      and patch_hash is null
      and expected_entity_version is null
      and entity_family is null
      and operation_scope is null
      and status is null
      and invalidated_at is null
      and invalidation_reason is null
      and consumed_by_reservation_id is null
    )
    or
    (
      review_state_id is not null
      and operation_attempt_id is not null
      and char_length(btrim(idempotency_key)) between 1 and 200
      and request_hash ~ '^[a-f0-9]{64}$'
      and patch_hash ~ '^[a-f0-9]{64}$'
      and char_length(btrim(expected_entity_version)) between 1 and 120
      and entity_family = 'pharmacy'
      and operation_scope = 'reserve_private_publish'
      and status in ('issued', 'consumed', 'invalidated', 'expired')
      and (
        (status = 'issued' and consumed_at is null and invalidated_at is null and consumed_by_reservation_id is null)
        or (status = 'consumed' and consumed_at is not null and invalidated_at is null and consumed_by_reservation_id is not null)
        or (status = 'invalidated' and consumed_at is null and invalidated_at is not null and char_length(btrim(invalidation_reason)) between 1 and 200)
        or (status = 'expired' and consumed_at is null and invalidated_at is null and consumed_by_reservation_id is null)
      )
    )
  ) not valid;

alter table public.import_pharmacy_publish_authorizations
  validate constraint import_pharmacy_publish_authorizations_v2_identity_group;

create unique index if not exists import_pharmacy_publish_authorizations_attempt_scope_idx
  on public.import_pharmacy_publish_authorizations (operation_attempt_id, operation_scope)
  where operation_attempt_id is not null;

create unique index if not exists import_pharmacy_publish_authorizations_one_active_idx
  on public.import_pharmacy_publish_authorizations (actor_profile_id, entity_id, operation_scope)
  where status = 'issued';

create index if not exists import_pharmacy_publish_authorizations_review_state_idx
  on public.import_pharmacy_publish_authorizations (review_state_id, issued_at desc)
  where review_state_id is not null;

comment on column public.import_pharmacy_publish_authorizations.review_state_id is
  'Persisted bounded Review row that authorized this operation attempt.';
comment on column public.import_pharmacy_publish_authorizations.operation_attempt_id is
  'Deterministic server-owned operation identity from Pharmacy Admin read state v3.';
comment on column public.import_pharmacy_publish_authorizations.status is
  'Server-owned authorization lifecycle: issued, consumed, invalidated, or expired.';
