-- IMPORT-PUBLISH-H: controlled publish persistence transaction RPCs
-- Scope: atomic idempotency reservation, rollback snapshot, audit-start, and terminal-result persistence only.
-- This migration does not mutate imported entities, routes, projections, sitemap state, or public visibility.

ALTER TABLE public.import_publish_idempotency_records
  DROP CONSTRAINT IF EXISTS import_publish_idempotency_status_check;

ALTER TABLE public.import_publish_idempotency_records
  ADD CONSTRAINT import_publish_idempotency_status_check
  CHECK (status IN ('reserved','in_progress','succeeded','failed','rolled_back'));

CREATE OR REPLACE FUNCTION public.import_publish_reserve_snapshot_audit(
  p_entity_id uuid,
  p_actor_profile_id uuid,
  p_idempotency_key text,
  p_request_hash text,
  p_expected_version text,
  p_snapshot_payload jsonb,
  p_snapshot_hash text,
  p_audit_schema_version text,
  p_reservation_ttl_hours integer DEFAULT 168,
  p_rollback_retention_days integer DEFAULT 365
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_existing public.import_publish_idempotency_records%ROWTYPE;
  v_idempotency_id uuid;
  v_snapshot_id uuid;
  v_audit_id uuid;
  v_created_at timestamptz := clock_timestamp();
BEGIN
  IF p_entity_id IS NULL THEN
    RAISE EXCEPTION 'entity_id_missing' USING ERRCODE = '22023';
  END IF;
  IF p_actor_profile_id IS NULL THEN
    RAISE EXCEPTION 'actor_profile_id_missing' USING ERRCODE = '22023';
  END IF;
  IF char_length(btrim(coalesce(p_idempotency_key, ''))) NOT BETWEEN 8 AND 240 THEN
    RAISE EXCEPTION 'idempotency_key_invalid' USING ERRCODE = '22023';
  END IF;
  IF coalesce(p_request_hash, '') !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'request_hash_invalid' USING ERRCODE = '22023';
  END IF;
  IF char_length(btrim(coalesce(p_expected_version, ''))) NOT BETWEEN 1 AND 120 THEN
    RAISE EXCEPTION 'expected_version_invalid' USING ERRCODE = '22023';
  END IF;
  IF p_snapshot_payload IS NULL OR jsonb_typeof(p_snapshot_payload) <> 'object' THEN
    RAISE EXCEPTION 'snapshot_payload_invalid' USING ERRCODE = '22023';
  END IF;
  IF coalesce(p_snapshot_hash, '') !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'snapshot_hash_invalid' USING ERRCODE = '22023';
  END IF;
  IF char_length(btrim(coalesce(p_audit_schema_version, ''))) NOT BETWEEN 1 AND 64 THEN
    RAISE EXCEPTION 'audit_schema_version_invalid' USING ERRCODE = '22023';
  END IF;
  IF p_reservation_ttl_hours NOT BETWEEN 24 AND 168 THEN
    RAISE EXCEPTION 'reservation_ttl_invalid' USING ERRCODE = '22023';
  END IF;
  IF p_rollback_retention_days NOT BETWEEN 30 AND 365 THEN
    RAISE EXCEPTION 'rollback_retention_invalid' USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_existing
  FROM public.import_publish_idempotency_records
  WHERE idempotency_key = p_idempotency_key
  FOR UPDATE;

  IF FOUND THEN
    IF v_existing.entity_id <> p_entity_id
      OR v_existing.actor_profile_id <> p_actor_profile_id
      OR v_existing.request_hash <> p_request_hash
      OR v_existing.expected_version <> p_expected_version THEN
      RETURN jsonb_build_object(
        'status', 'conflict',
        'reason', 'idempotency_request_mismatch',
        'idempotencyRecordId', v_existing.id
      );
    END IF;

    IF v_existing.terminal_result IS NOT NULL THEN
      RETURN jsonb_build_object(
        'status', 'replayed',
        'idempotencyRecordId', v_existing.id,
        'terminalResult', v_existing.terminal_result
      );
    END IF;

    RETURN jsonb_build_object(
      'status', 'conflict',
      'reason', 'request_already_in_progress',
      'idempotencyRecordId', v_existing.id
    );
  END IF;

  BEGIN
    INSERT INTO public.import_publish_idempotency_records (
      idempotency_key,
      entity_id,
      actor_profile_id,
      expected_version,
      request_hash,
      status,
      created_at,
      updated_at,
      expires_at
    ) VALUES (
      p_idempotency_key,
      p_entity_id,
      p_actor_profile_id,
      p_expected_version,
      p_request_hash,
      'reserved',
      v_created_at,
      v_created_at,
      v_created_at + make_interval(hours => p_reservation_ttl_hours)
    )
    RETURNING id INTO v_idempotency_id;
  EXCEPTION WHEN unique_violation THEN
    SELECT *
    INTO v_existing
    FROM public.import_publish_idempotency_records
    WHERE idempotency_key = p_idempotency_key
    FOR UPDATE;

    IF v_existing.entity_id = p_entity_id
      AND v_existing.actor_profile_id = p_actor_profile_id
      AND v_existing.request_hash = p_request_hash
      AND v_existing.expected_version = p_expected_version
      AND v_existing.terminal_result IS NOT NULL THEN
      RETURN jsonb_build_object(
        'status', 'replayed',
        'idempotencyRecordId', v_existing.id,
        'terminalResult', v_existing.terminal_result
      );
    END IF;

    RETURN jsonb_build_object(
      'status', 'conflict',
      'reason', 'concurrent_idempotency_conflict',
      'idempotencyRecordId', v_existing.id
    );
  END;

  INSERT INTO public.import_publish_rollback_snapshots (
    entity_id,
    actor_profile_id,
    idempotency_record_id,
    expected_version,
    snapshot_payload,
    snapshot_hash,
    created_at,
    expires_at
  ) VALUES (
    p_entity_id,
    p_actor_profile_id,
    v_idempotency_id,
    p_expected_version,
    p_snapshot_payload,
    p_snapshot_hash,
    v_created_at,
    v_created_at + make_interval(days => p_rollback_retention_days)
  )
  RETURNING id INTO v_snapshot_id;

  INSERT INTO public.import_publish_audit_events (
    entity_id,
    actor_profile_id,
    idempotency_record_id,
    rollback_snapshot_id,
    event_type,
    outcome,
    schema_version,
    expected_version,
    event_payload,
    created_at
  ) VALUES (
    p_entity_id,
    p_actor_profile_id,
    v_idempotency_id,
    v_snapshot_id,
    'execution_started',
    'pending',
    p_audit_schema_version,
    p_expected_version,
    jsonb_build_object('requestHash', p_request_hash),
    v_created_at
  )
  RETURNING id INTO v_audit_id;

  RETURN jsonb_build_object(
    'status', 'reserved',
    'idempotencyRecordId', v_idempotency_id,
    'rollbackSnapshotId', v_snapshot_id,
    'auditEventId', v_audit_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.import_publish_persist_terminal_result(
  p_idempotency_record_id uuid,
  p_entity_id uuid,
  p_actor_profile_id uuid,
  p_outcome text,
  p_actual_version text,
  p_terminal_result jsonb,
  p_audit_schema_version text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_record public.import_publish_idempotency_records%ROWTYPE;
  v_snapshot_id uuid;
  v_event_type text;
  v_audit_id uuid;
BEGIN
  IF p_idempotency_record_id IS NULL OR p_entity_id IS NULL OR p_actor_profile_id IS NULL THEN
    RAISE EXCEPTION 'terminal_identity_missing' USING ERRCODE = '22023';
  END IF;
  IF p_outcome NOT IN ('succeeded', 'failed', 'rolled_back') THEN
    RAISE EXCEPTION 'terminal_outcome_invalid' USING ERRCODE = '22023';
  END IF;
  IF char_length(btrim(coalesce(p_actual_version, ''))) NOT BETWEEN 1 AND 120 THEN
    RAISE EXCEPTION 'actual_version_invalid' USING ERRCODE = '22023';
  END IF;
  IF p_terminal_result IS NULL OR jsonb_typeof(p_terminal_result) <> 'object' THEN
    RAISE EXCEPTION 'terminal_result_invalid' USING ERRCODE = '22023';
  END IF;
  IF char_length(btrim(coalesce(p_audit_schema_version, ''))) NOT BETWEEN 1 AND 64 THEN
    RAISE EXCEPTION 'audit_schema_version_invalid' USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_record
  FROM public.import_publish_idempotency_records
  WHERE id = p_idempotency_record_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'failed', 'reason', 'idempotency_record_not_found');
  END IF;
  IF v_record.entity_id <> p_entity_id OR v_record.actor_profile_id <> p_actor_profile_id THEN
    RETURN jsonb_build_object('status', 'conflict', 'reason', 'terminal_identity_mismatch');
  END IF;
  IF v_record.terminal_result IS NOT NULL THEN
    RETURN jsonb_build_object(
      'status', 'replayed',
      'idempotencyRecordId', v_record.id,
      'terminalResult', v_record.terminal_result
    );
  END IF;

  SELECT id
  INTO v_snapshot_id
  FROM public.import_publish_rollback_snapshots
  WHERE idempotency_record_id = p_idempotency_record_id;

  IF v_snapshot_id IS NULL THEN
    RETURN jsonb_build_object('status', 'failed', 'reason', 'rollback_snapshot_not_found');
  END IF;

  UPDATE public.import_publish_idempotency_records
  SET status = p_outcome,
      terminal_result = p_terminal_result,
      updated_at = clock_timestamp()
  WHERE id = p_idempotency_record_id;

  v_event_type := CASE p_outcome
    WHEN 'succeeded' THEN 'execution_succeeded'
    WHEN 'rolled_back' THEN 'rollback_succeeded'
    ELSE 'execution_failed'
  END;

  INSERT INTO public.import_publish_audit_events (
    entity_id,
    actor_profile_id,
    idempotency_record_id,
    rollback_snapshot_id,
    event_type,
    outcome,
    schema_version,
    expected_version,
    actual_version,
    event_payload
  ) VALUES (
    p_entity_id,
    p_actor_profile_id,
    p_idempotency_record_id,
    v_snapshot_id,
    v_event_type,
    p_outcome,
    p_audit_schema_version,
    v_record.expected_version,
    p_actual_version,
    p_terminal_result
  )
  RETURNING id INTO v_audit_id;

  RETURN jsonb_build_object(
    'status', p_outcome,
    'idempotencyRecordId', p_idempotency_record_id,
    'auditEventId', v_audit_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.import_publish_reserve_snapshot_audit(
  uuid, uuid, text, text, text, jsonb, text, text, integer, integer
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.import_publish_reserve_snapshot_audit(
  uuid, uuid, text, text, text, jsonb, text, text, integer, integer
) TO service_role;

REVOKE ALL ON FUNCTION public.import_publish_persist_terminal_result(
  uuid, uuid, uuid, text, text, jsonb, text
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.import_publish_persist_terminal_result(
  uuid, uuid, uuid, text, text, jsonb, text
) TO service_role;

COMMENT ON FUNCTION public.import_publish_reserve_snapshot_audit(
  uuid, uuid, text, text, text, jsonb, text, text, integer, integer
) IS 'Private atomic reservation, rollback snapshot, and execution-start audit RPC for controlled single-entity publish preparation.';

COMMENT ON FUNCTION public.import_publish_persist_terminal_result(
  uuid, uuid, uuid, text, text, jsonb, text
) IS 'Private terminal-result and terminal-audit persistence RPC for controlled single-entity publish attempts.';
