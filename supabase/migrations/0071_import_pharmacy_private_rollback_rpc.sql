-- IMPORT-PUBLISH-V: atomic pharmacy private rollback RPC
-- Scope: restore one successfully mutated private pharmacy from its protected snapshot.
-- Fail-closed: only draft/inactive pharmacy snapshots are accepted; no public promotion is possible.

CREATE OR REPLACE FUNCTION public.import_rollback_pharmacy_private(
  p_idempotency_record_id uuid,
  p_rollback_snapshot_id uuid,
  p_entity_id uuid,
  p_actor_profile_id uuid,
  p_expected_current_version text,
  p_expected_snapshot_hash text,
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
  v_source jsonb;
  v_actual_version text;
  v_terminal_result jsonb;
  v_terminal_persist jsonb;
BEGIN
  IF p_idempotency_record_id IS NULL
    OR p_rollback_snapshot_id IS NULL
    OR p_entity_id IS NULL
    OR p_actor_profile_id IS NULL THEN
    RAISE EXCEPTION 'pharmacy_rollback_identity_missing' USING ERRCODE = '22023';
  END IF;
  IF char_length(btrim(coalesce(p_expected_current_version, ''))) NOT BETWEEN 1 AND 120 THEN
    RAISE EXCEPTION 'rollback_current_version_invalid' USING ERRCODE = '22023';
  END IF;
  IF coalesce(p_expected_snapshot_hash, '') !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'rollback_snapshot_hash_invalid' USING ERRCODE = '22023';
  END IF;
  IF char_length(btrim(coalesce(p_audit_schema_version, ''))) NOT BETWEEN 1 AND 64 THEN
    RAISE EXCEPTION 'audit_schema_version_invalid' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_record
  FROM public.import_publish_idempotency_records
  WHERE id = p_idempotency_record_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'failed', 'reason', 'idempotency_record_not_found');
  END IF;
  IF v_record.entity_id <> p_entity_id OR v_record.actor_profile_id <> p_actor_profile_id THEN
    RETURN jsonb_build_object('status', 'conflict', 'reason', 'rollback_identity_mismatch');
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
  IF v_snapshot.snapshot_hash <> p_expected_snapshot_hash THEN
    RETURN jsonb_build_object('status', 'conflict', 'reason', 'rollback_snapshot_hash_mismatch');
  END IF;
  IF v_snapshot.restored_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'status', 'replayed',
      'entityId', p_entity_id,
      'actualVersion', coalesce(v_record.terminal_result->>'actualVersion', p_expected_current_version),
      'restoredAt', v_snapshot.restored_at
    );
  END IF;

  IF v_record.status <> 'succeeded' OR v_record.terminal_result IS NULL THEN
    RETURN jsonb_build_object('status', 'conflict', 'reason', 'rollback_source_not_succeeded');
  END IF;
  IF coalesce(v_record.terminal_result->>'actualVersion', '') <> p_expected_current_version THEN
    RETURN jsonb_build_object('status', 'conflict', 'reason', 'rollback_terminal_version_mismatch');
  END IF;

  v_source := v_snapshot.snapshot_payload->'center';
  IF v_source IS NULL OR jsonb_typeof(v_source) <> 'object' THEN
    RETURN jsonb_build_object('status', 'failed', 'reason', 'rollback_snapshot_shape_invalid');
  END IF;
  IF coalesce(v_source->>'id', '') <> p_entity_id::text
    OR coalesce(v_source->>'centerType', '') <> 'pharmacy'
    OR coalesce(v_source->>'status', '') <> 'draft'
    OR coalesce((v_source->>'isActive')::boolean, true) <> false
    OR coalesce((v_source->>'isFeatured')::boolean, true) <> false THEN
    RETURN jsonb_build_object('status', 'conflict', 'reason', 'rollback_snapshot_not_private_pharmacy');
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
  IF v_center.updated_at::text <> p_expected_current_version THEN
    RETURN jsonb_build_object('status', 'conflict', 'reason', 'rollback_current_version_mismatch');
  END IF;

  UPDATE public.centers
  SET
    slug = v_source->>'slug',
    name_en = v_source->>'nameEn',
    name_ar = v_source->>'nameAr',
    legal_name = v_source->>'legalName',
    status = 'draft'::public.provider_status,
    verification_status = (v_source->>'verificationStatus')::public.verification_status,
    primary_phone = v_source->>'primaryPhone',
    secondary_phone = v_source->>'secondaryPhone',
    whatsapp_phone = v_source->>'whatsappPhone',
    email = v_source->>'email',
    website_url = v_source->>'websiteUrl',
    logo_url = v_source->>'logoUrl',
    cover_image_url = v_source->>'coverImageUrl',
    short_description_en = v_source->>'shortDescriptionEn',
    short_description_ar = v_source->>'shortDescriptionAr',
    description_en = v_source->>'descriptionEn',
    description_ar = v_source->>'descriptionAr',
    default_locale = (v_source->>'defaultLocale')::public.app_locale,
    default_country = (v_source->>'defaultCountry')::public.country_code,
    is_active = false,
    is_claimable = (v_source->>'isClaimable')::boolean,
    is_featured = false,
    sort_order = (v_source->>'sortOrder')::integer,
    metadata = coalesce(v_source->'metadata', '{}'::jsonb),
    deleted_at = (v_source->>'deletedAt')::timestamptz
  WHERE id = p_entity_id
  RETURNING updated_at::text INTO v_actual_version;

  v_terminal_result := jsonb_build_object(
    'kind', 'rolled_back',
    'entityId', p_entity_id,
    'actualVersion', v_actual_version,
    'restoredSnapshotId', p_rollback_snapshot_id,
    'visibility', 'private',
    'publicRouteEnabled', false,
    'indexable', false,
    'sitemapEligible', false
  );

  UPDATE public.import_publish_rollback_snapshots
  SET restored_at = clock_timestamp(), restored_by_profile_id = p_actor_profile_id
  WHERE id = p_rollback_snapshot_id;

  UPDATE public.import_publish_idempotency_records
  SET status = 'in_progress', terminal_result = NULL, updated_at = clock_timestamp()
  WHERE id = p_idempotency_record_id;

  SELECT public.import_publish_persist_terminal_result(
    p_idempotency_record_id,
    p_entity_id,
    p_actor_profile_id,
    'rolled_back',
    v_actual_version,
    v_terminal_result,
    p_audit_schema_version
  ) INTO v_terminal_persist;

  IF coalesce(v_terminal_persist->>'status', '') NOT IN ('rolled_back','replayed') THEN
    RAISE EXCEPTION 'rollback_terminal_persistence_failed' USING ERRCODE = 'P0001';
  END IF;

  RETURN jsonb_build_object(
    'status', 'rolled_back',
    'entityId', p_entity_id,
    'actualVersion', v_actual_version,
    'terminalPersistence', v_terminal_persist
  );
END;
$$;

REVOKE ALL ON FUNCTION public.import_rollback_pharmacy_private(
  uuid, uuid, uuid, uuid, text, text, text
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.import_rollback_pharmacy_private(
  uuid, uuid, uuid, uuid, text, text, text
) TO service_role;

COMMENT ON FUNCTION public.import_rollback_pharmacy_private(
  uuid, uuid, uuid, uuid, text, text, text
) IS 'Atomic service-role-only rollback of one private pharmacy using a protected snapshot, optimistic locking, and shared terminal audit persistence.';
