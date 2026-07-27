-- P09-B EXPIRED-RESERVATION-RECOVERY: allow a fresh persisted Review for the same unchanged Pharmacy state.
--
-- The original v1 identity index predates stable operation_attempt_id. It correctly made legacy
-- rows idempotent, but it also rejected a new v3 recovery Review whenever actor, entity, snapshot,
-- fingerprint and operation were unchanged. V3 rows are already uniquely protected by the exact
-- operation-attempt and idempotency indexes introduced in 0076 and made UPSERT-inferable in 0080.

-- Remove the obsolete all-row identity boundary that blocks a new bounded recovery attempt.
drop index if exists public.import_pharmacy_admin_read_states_identity_idx;

-- Preserve the original idempotency contract only for legacy rows that have no stable operation identity.
create unique index if not exists import_pharmacy_admin_read_states_legacy_identity_idx
  on public.import_pharmacy_admin_read_states (
    actor_profile_id,
    entity_id,
    operation,
    snapshot_hash,
    entity_fingerprint
  )
  where operation_attempt_id is null;

comment on index public.import_pharmacy_admin_read_states_legacy_identity_idx is
  'Legacy-only bounded read-state identity. V3 recovery attempts are uniquely bound by operation_attempt_id and idempotency_key.';
