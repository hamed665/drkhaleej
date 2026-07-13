-- IMPORT-PUBLISH-AA: preserve protected Pharmacy metadata and locale during private publish.
-- The mutation accepts only a bounded metadata_patch. Locale and country are not mutable here.

CREATE OR REPLACE FUNCTION public.import_publish_pharmacy_private(
  p_idempotency_record_id uuid,
  p_rollback_snapshot_id uuid,
  p_execution_started_audit_id uuid,
  p_entity_id uuid,
  p_actor_profile_id uuid,
  p_expected_version text,
  p_patch jsonb,
  p_audit_schema_version text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_record public.import_publish_idempotency_records%ROWTYPE;
  v_snapshot public.import_publish_rollback_snapshots%ROWTYPE;
  v_center public.centers%ROWTYPE;
  v_actual_version text;
  v_terminal_result jsonb;
  v_terminal_persist jsonb;
  v_allowed_keys constant text[] := ARRAY[
    'name_en','name_ar','legal_name','slug','primary_phone','secondary_phone',
    'whatsapp_phone','email','website_url','logo_url','cover_image_url',
    'short_description_en','short_description_ar','description_en','description_ar',
    'metadata_patch'
  ];
  v_allowed_metadata_keys constant text[] := ARRAY[
    'source','sourceEvidence','rawPayloadHash','visibility',
    'publicRouteEnabled','indexable','sitemapEligible'
  ];
  v_key text;
BEGIN
  IF p_idempotency_record_id IS NULL
    OR p_rollback_snapshot_id IS NULL
    OR p_execution_started_audit_id IS NULL
    OR p_entity_id IS NULL
    OR p_actor_profile_id IS NULL THEN
    RAISE EXCEPTION 'pharmacy_publish_identity_missing' USING ERRCODE = '22023';
  END IF;

  IF char_length(btrim(coalesce(p_expected_version, ''))) NOT BETWEEN 1 AND 120 THEN
    RAISE EXCEPTION 'expected_version_invalid' USING ERRCODE = '22023';
  END IF;
  IF p_patch IS NULL OR jsonb_typeof(p_patch) <> 'object' THEN
    RAISE EXCEPTION 'pharmacy_patch_invalid' USING ERRCODE = '22023';
  END IF;
  IF char_length(btrim(coalesce(p_audit_schema_version, ''))) NOT BETWEEN 1 AND 64 THEN
    RAISE EXCEPTION 'audit_schema_version_invalid' USING ERRCODE = '22023';
  END IF;

  FOR v_key IN SELECT jsonb_object_keys(p_patch)
  LOOP
    IF NOT (v_key = ANY(v_allowed_keys)) THEN
      RAISE EXCEPTION 'pharmacy_patch_key_forbidden:%', v_key USING ERRCODE = '22023';
    END IF;
  END LOOP;

  IF p_patch ? 'metadata_patch' THEN
    IF jsonb_typeof(p_patch->'metadata_patch') <> 'object' THEN
      RAISE EXCEPTION 'pharmacy_metadata_patch_invalid' USING ERRCODE = '22023';
    END IF;
    FOR v_key IN SELECT jsonb_object_keys(p_patch->'metadata_patch')
    LOOP
      IF NOT (v_key = ANY(v_allowed_metadata_keys)) THEN
        RAISE EXCEPTION 'pharmacy_metadata_patch_key_forbidden:%', v_key USING ERRCODE = '22023';
      END IF;
    END LOOP;
  END IF;

  SELECT * INTO v_record
  FROM public.import_publish_idempotency_records
  WHERE id = p_idempotency_record_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'failed', 'reason', 'idempotency_record_not_found');
  END IF;
  IF v_record.entity_id <> p_entity_id OR v_record.actor_profile_id <> p_actor_profile_id THEN
    RETURN jsonb_build_object('status', 'conflict', 'reason', 'reservation_identity_mismatch');
  END IF;
  IF v_record.expected_version <> p_expected_version THEN
    RETURN jsonb_build_object('status', 'conflict', 'reason', 'expected_version_mismatch');
  END IF;
  IF v_record.terminal_result IS NOT NULL THEN
    RETURN jsonb_build_object(
      'status', 'replayed',
      'entityId', p_entity_id,
      'actualVersion', coalesce(v_record.terminal_result->>'actualVersion', v_record.expected_version),
      'terminalResult', v_record.terminal_result
    );
  END IF;
  IF v_record.status NOT IN ('reserved','in_progress') THEN
    RETURN jsonb_build_object('status', 'conflict', 'reason', 'reservation_not_active');
  END IF;

  SELECT * INTO v_snapshot
  FROM public.import_publish_rollback_snapshots
  WHERE id = p_rollback_snapshot_id
    AND idempotency_record_id = p_idempotency_record_id
    AND entity_id = p_entity_id
    AND actor_profile_id = p_actor_profile_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'failed', 'reason', 'rollback_snapshot_not_found');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.import_publish_audit_events
    WHERE id = p_execution_started_audit_id
      AND idempotency_record_id = p_idempotency_record_id
      AND rollback_snapshot_id = p_rollback_snapshot_id
      AND entity_id = p_entity_id
      AND actor_profile_id = p_actor_profile_id
      AND event_type = 'execution_started'
      AND outcome = 'pending'
  ) THEN
    RETURN jsonb_build_object('status', 'conflict', 'reason', 'execution_audit_mismatch');
  END IF;

  SELECT * INTO v_center
  FROM public.centers
  WHERE id = p_entity_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'failed', 'reason', 'pharmacy_not_found');
  END IF;
  IF v_center.center_type <> 'pharmacy'::public.center_type THEN
    RETURN jsonb_build_object('status', 'conflict', 'reason', 'entity_not_pharmacy');
  END IF;
  IF v_center.updated_at::text <> p_expected_version THEN
    RETURN jsonb_build_object('status', 'conflict', 'reason', 'expected_version_mismatch');
  END IF;

  UPDATE public.import_publish_idempotency_records
  SET status = 'in_progress', updated_at = clock_timestamp()
  WHERE id = p_idempotency_record_id;

  UPDATE public.centers
  SET
    name_en = coalesce(nullif(btrim(p_patch->>'name_en'), ''), name_en),
    name_ar = CASE WHEN p_patch ? 'name_ar' THEN nullif(btrim(p_patch->>'name_ar'), '') ELSE name_ar END,
    legal_name = CASE WHEN p_patch ? 'legal_name' THEN nullif(btrim(p_patch->>'legal_name'), '') ELSE legal_name END,
    slug = coalesce(nullif(btrim(p_patch->>'slug'), ''), slug),
    primary_phone = CASE WHEN p_patch ? 'primary_phone' THEN nullif(btrim(p_patch->>'primary_phone'), '') ELSE primary_phone END,
    secondary_phone = CASE WHEN p_patch ? 'secondary_phone' THEN nullif(btrim(p_patch->>'secondary_phone'), '') ELSE secondary_phone END,
    whatsapp_phone = CASE WHEN p_patch ? 'whatsapp_phone' THEN nullif(btrim(p_patch->>'whatsapp_phone'), '') ELSE whatsapp_phone END,
    email = CASE WHEN p_patch ? 'email' THEN nullif(btrim(p_patch->>'email'), '') ELSE email END,
    website_url = CASE WHEN p_patch ? 'website_url' THEN nullif(btrim(p_patch->>'website_url'), '') ELSE website_url END,
    logo_url = CASE WHEN p_patch ? 'logo_url' THEN nullif(btrim(p_patch->>'logo_url'), '') ELSE logo_url END,
    cover_image_url = CASE WHEN p_patch ? 'cover_image_url' THEN nullif(btrim(p_patch->>'cover_image_url'), '') ELSE cover_image_url END,
    short_description_en = CASE WHEN p_patch ? 'short_description_en' THEN nullif(btrim(p_patch->>'short_description_en'), '') ELSE short_description_en END,
    short_description_ar = CASE WHEN p_patch ? 'short_description_ar' THEN nullif(btrim(p_patch->>'short_description_ar'), '') ELSE short_description_ar END,
    description_en = CASE WHEN p_patch ? 'description_en' THEN nullif(btrim(p_patch->>'description_en'), '') ELSE description_en END,
    description_ar = CASE WHEN p_patch ? 'description_ar' THEN nullif(btrim(p_patch->>'description_ar'), '') ELSE description_ar END,
    metadata = CASE
      WHEN p_patch ? 'metadata_patch'
        THEN coalesce(metadata, '{}'::jsonb) || (p_patch->'metadata_patch')
      ELSE metadata
    END,
    status = 'draft'::public.provider_status,
    is_active = false,
    is_featured = false
  WHERE id = p_entity_id
  RETURNING updated_at::text INTO v_actual_version;

  v_terminal_result := jsonb_build_object(
    'kind', 'mutated',
    'entityId', p_entity_id,
    'actualVersion', v_actual_version,
    'visibility', 'private',
    'publicRouteEnabled', false,
    'indexable', false,
    'sitemapEligible', false
  );

  SELECT public.import_publish_persist_terminal_result(
    p_idempotency_record_id,
    p_entity_id,
    p_actor_profile_id,
    'succeeded',
    v_actual_version,
    v_terminal_result,
    p_audit_schema_version
  ) INTO v_terminal_persist;

  IF coalesce(v_terminal_persist->>'status', '') NOT IN ('succeeded','replayed') THEN
    RAISE EXCEPTION 'terminal_persistence_failed' USING ERRCODE = 'P0001';
  END IF;

  RETURN jsonb_build_object(
    'status', 'mutated',
    'entityId', p_entity_id,
    'actualVersion', v_actual_version,
    'terminalPersistence', v_terminal_persist
  );
END;
$$;

REVOKE ALL ON FUNCTION public.import_publish_pharmacy_private(
  uuid, uuid, uuid, uuid, uuid, text, jsonb, text
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.import_publish_pharmacy_private(
  uuid, uuid, uuid, uuid, uuid, text, jsonb, text
) TO service_role;

COMMENT ON FUNCTION public.import_publish_pharmacy_private(
  uuid, uuid, uuid, uuid, uuid, text, jsonb, text
) IS 'Atomic service-role-only private Pharmacy mutation that preserves locale, country, and protected metadata while merging a bounded metadata patch.';
