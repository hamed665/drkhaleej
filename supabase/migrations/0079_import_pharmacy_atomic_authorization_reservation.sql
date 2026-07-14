-- IMPORT-ADMIN-AE: atomically verify and consume one Pharmacy authorization while reserving publish persistence.
-- Extends the existing reservation authority. No entity, route, index, sitemap, or public visibility mutation.

alter table public.import_publish_idempotency_records
  add column if not exists pharmacy_authorization_id uuid
    references public.import_pharmacy_publish_authorizations(id) on delete restrict;

create unique index if not exists import_publish_idempotency_pharmacy_authorization_idx
  on public.import_publish_idempotency_records (pharmacy_authorization_id)
  where pharmacy_authorization_id is not null;

drop function if exists public.import_publish_reserve_snapshot_audit(
  uuid, uuid, text, text, text, jsonb, text, text, integer, integer
);

create function public.import_publish_reserve_snapshot_audit(
  p_entity_id uuid,
  p_actor_profile_id uuid,
  p_idempotency_key text,
  p_request_hash text,
  p_expected_version text,
  p_snapshot_payload jsonb,
  p_snapshot_hash text,
  p_audit_schema_version text,
  p_authorization_id uuid,
  p_review_snapshot_hash text,
  p_entity_fingerprint text,
  p_operation_attempt_id uuid,
  p_patch_hash text,
  p_entity_family text,
  p_operation_scope text,
  p_reservation_ttl_hours integer default 168,
  p_rollback_retention_days integer default 365
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_authorization public.import_pharmacy_publish_authorizations%rowtype;
  v_existing public.import_publish_idempotency_records%rowtype;
  v_idempotency_id uuid;
  v_snapshot_id uuid;
  v_audit_id uuid;
  v_created_at timestamptz := clock_timestamp();
  v_updated_count integer;
begin
  if p_entity_id is null or p_actor_profile_id is null or p_authorization_id is null then
    raise exception 'reservation_identity_missing' using errcode = '22023';
  end if;
  if char_length(btrim(coalesce(p_idempotency_key, ''))) not between 8 and 240 then
    raise exception 'idempotency_key_invalid' using errcode = '22023';
  end if;
  if coalesce(p_request_hash, '') !~ '^[a-f0-9]{64}$'
    or coalesce(p_snapshot_hash, '') !~ '^[a-f0-9]{64}$'
    or coalesce(p_review_snapshot_hash, '') !~ '^[a-f0-9]{64}$'
    or coalesce(p_entity_fingerprint, '') !~ '^[a-f0-9]{64}$'
    or coalesce(p_patch_hash, '') !~ '^[a-f0-9]{64}$' then
    raise exception 'reservation_hash_invalid' using errcode = '22023';
  end if;
  if p_operation_attempt_id is null then
    raise exception 'operation_attempt_id_missing' using errcode = '22023';
  end if;
  if char_length(btrim(coalesce(p_expected_version, ''))) not between 1 and 120 then
    raise exception 'expected_version_invalid' using errcode = '22023';
  end if;
  if p_entity_family <> 'pharmacy' or p_operation_scope <> 'reserve_private_publish' then
    raise exception 'authorization_scope_invalid' using errcode = '22023';
  end if;
  if p_snapshot_payload is null or jsonb_typeof(p_snapshot_payload) <> 'object' then
    raise exception 'snapshot_payload_invalid' using errcode = '22023';
  end if;
  if char_length(btrim(coalesce(p_audit_schema_version, ''))) not between 1 and 64 then
    raise exception 'audit_schema_version_invalid' using errcode = '22023';
  end if;
  if p_reservation_ttl_hours not between 24 and 168 then
    raise exception 'reservation_ttl_invalid' using errcode = '22023';
  end if;
  if p_rollback_retention_days not between 30 and 365 then
    raise exception 'rollback_retention_invalid' using errcode = '22023';
  end if;

  select * into v_authorization
  from public.import_pharmacy_publish_authorizations
  where id = p_authorization_id
  for update;

  if not found then
    return jsonb_build_object('status', 'conflict', 'reason', 'authorization_not_found');
  end if;

  if v_authorization.actor_profile_id <> p_actor_profile_id
    or v_authorization.entity_id <> p_entity_id
    or v_authorization.review_snapshot_hash <> p_review_snapshot_hash
    or v_authorization.entity_fingerprint <> p_entity_fingerprint
    or v_authorization.operation_attempt_id <> p_operation_attempt_id
    or v_authorization.idempotency_key <> p_idempotency_key
    or v_authorization.request_hash <> p_request_hash
    or v_authorization.patch_hash <> p_patch_hash
    or v_authorization.expected_entity_version <> p_expected_version
    or v_authorization.entity_family <> p_entity_family
    or v_authorization.operation_scope <> p_operation_scope then
    return jsonb_build_object('status', 'conflict', 'reason', 'authorization_identity_mismatch');
  end if;

  select * into v_existing
  from public.import_publish_idempotency_records
  where idempotency_key = p_idempotency_key
  for update;

  if found then
    if v_existing.entity_id <> p_entity_id
      or v_existing.actor_profile_id <> p_actor_profile_id
      or v_existing.request_hash <> p_request_hash
      or v_existing.expected_version <> p_expected_version
      or v_existing.pharmacy_authorization_id <> p_authorization_id then
      return jsonb_build_object(
        'status', 'conflict',
        'reason', 'idempotency_request_mismatch',
        'idempotencyRecordId', v_existing.id
      );
    end if;

    if v_existing.terminal_result is not null then
      return jsonb_build_object(
        'status', 'replayed',
        'idempotencyRecordId', v_existing.id,
        'terminalResult', v_existing.terminal_result
      );
    end if;

    if v_authorization.status = 'consumed'
      and v_authorization.consumed_by_reservation_id = v_existing.id then
      select id into v_snapshot_id
      from public.import_publish_rollback_snapshots
      where idempotency_record_id = v_existing.id;

      select id into v_audit_id
      from public.import_publish_audit_events
      where idempotency_record_id = v_existing.id
        and rollback_snapshot_id = v_snapshot_id
        and event_type = 'execution_started'
        and outcome = 'pending'
      order by created_at asc
      limit 1;

      if v_snapshot_id is null or v_audit_id is null then
        return jsonb_build_object('status', 'conflict', 'reason', 'reservation_replay_incomplete');
      end if;

      return jsonb_build_object(
        'status', 'reserved',
        'replayed', true,
        'idempotencyRecordId', v_existing.id,
        'rollbackSnapshotId', v_snapshot_id,
        'auditEventId', v_audit_id
      );
    end if;

    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'request_already_in_progress',
      'idempotencyRecordId', v_existing.id
    );
  end if;

  if v_authorization.status <> 'issued'
    or v_authorization.consumed_at is not null
    or v_authorization.invalidated_at is not null then
    return jsonb_build_object('status', 'conflict', 'reason', 'authorization_not_issued');
  end if;
  if v_authorization.issued_at > v_created_at or v_authorization.expires_at <= v_created_at then
    return jsonb_build_object('status', 'conflict', 'reason', 'authorization_expired');
  end if;

  begin
    insert into public.import_publish_idempotency_records (
      idempotency_key, entity_id, actor_profile_id, expected_version, request_hash,
      status, created_at, updated_at, expires_at, pharmacy_authorization_id
    ) values (
      p_idempotency_key, p_entity_id, p_actor_profile_id, p_expected_version, p_request_hash,
      'reserved', v_created_at, v_created_at,
      v_created_at + make_interval(hours => p_reservation_ttl_hours), p_authorization_id
    ) returning id into v_idempotency_id;
  exception when unique_violation then
    return jsonb_build_object('status', 'conflict', 'reason', 'concurrent_idempotency_conflict');
  end;

  insert into public.import_publish_rollback_snapshots (
    entity_id, actor_profile_id, idempotency_record_id, expected_version,
    snapshot_payload, snapshot_hash, created_at, expires_at
  ) values (
    p_entity_id, p_actor_profile_id, v_idempotency_id, p_expected_version,
    p_snapshot_payload, p_snapshot_hash, v_created_at,
    v_created_at + make_interval(days => p_rollback_retention_days)
  ) returning id into v_snapshot_id;

  -- Kept as execution_started for backward compatibility with the existing private executor/readers.
  -- The payload marks this as the reservation phase; the event name will be split when the mutation gate is rewired.
  insert into public.import_publish_audit_events (
    entity_id, actor_profile_id, idempotency_record_id, rollback_snapshot_id,
    event_type, outcome, schema_version, expected_version, event_payload, created_at
  ) values (
    p_entity_id, p_actor_profile_id, v_idempotency_id, v_snapshot_id,
    'execution_started', 'pending', p_audit_schema_version, p_expected_version,
    jsonb_build_object(
      'phase', 'reservation',
      'requestHash', p_request_hash,
      'authorizationId', p_authorization_id,
      'reviewSnapshotHash', p_review_snapshot_hash,
      'entityFingerprint', p_entity_fingerprint,
      'operationAttemptId', p_operation_attempt_id,
      'patchHash', p_patch_hash,
      'entityFamily', p_entity_family,
      'operationScope', p_operation_scope
    ),
    v_created_at
  ) returning id into v_audit_id;

  update public.import_pharmacy_publish_authorizations
  set status = 'consumed',
      consumed_at = v_created_at,
      consumed_by_reservation_id = v_idempotency_id
  where id = p_authorization_id
    and status = 'issued'
    and consumed_at is null
    and invalidated_at is null
    and expires_at > v_created_at;

  get diagnostics v_updated_count = row_count;
  if v_updated_count <> 1 then
    raise exception 'authorization_consume_failed' using errcode = 'P0001';
  end if;

  return jsonb_build_object(
    'status', 'reserved',
    'replayed', false,
    'idempotencyRecordId', v_idempotency_id,
    'rollbackSnapshotId', v_snapshot_id,
    'auditEventId', v_audit_id
  );
end;
$$;

revoke all on function public.import_publish_reserve_snapshot_audit(
  uuid, uuid, text, text, text, jsonb, text, text,
  uuid, text, text, uuid, text, text, text, integer, integer
) from public, anon, authenticated;

grant execute on function public.import_publish_reserve_snapshot_audit(
  uuid, uuid, text, text, text, jsonb, text, text,
  uuid, text, text, uuid, text, text, text, integer, integer
) to service_role;

comment on column public.import_publish_idempotency_records.pharmacy_authorization_id is
  'Exact Pharmacy authorization atomically consumed by this reservation.';

comment on function public.import_publish_reserve_snapshot_audit(
  uuid, uuid, text, text, text, jsonb, text, text,
  uuid, text, text, uuid, text, text, text, integer, integer
) is 'Atomically verifies one exact issued Pharmacy authorization, reserves idempotency, captures rollback state, appends the reservation-phase audit, and consumes authorization.';
