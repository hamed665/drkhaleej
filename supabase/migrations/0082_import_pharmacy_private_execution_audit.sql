-- P05 PRIVATE-ADMIN-WIRING: execute one already-reserved Pharmacy mutation.
-- The existing mutation authority is preserved and aligned to the P04-A reservation audit split.
-- This function appends execution_started only at real mutation time, persists the terminal result,
-- and keeps the entity draft/private with no route, index, sitemap, or public activation.
-- PostgreSQL keeps input parameter names as part of the existing function identity. The legacy
-- third parameter name is therefore retained; in P05 it carries the verified reservation audit id.

create or replace function public.import_publish_pharmacy_private(
  p_idempotency_record_id uuid,
  p_rollback_snapshot_id uuid,
  p_execution_started_audit_id uuid,
  p_entity_id uuid,
  p_actor_profile_id uuid,
  p_expected_version text,
  p_patch jsonb,
  p_audit_schema_version text
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_record public.import_publish_idempotency_records%rowtype;
  v_snapshot public.import_publish_rollback_snapshots%rowtype;
  v_center public.centers%rowtype;
  v_reservation_audit public.import_publish_audit_events%rowtype;
  v_execution_started_audit_id uuid := gen_random_uuid();
  v_actual_version text;
  v_terminal_result jsonb;
  v_terminal_persist jsonb;
  v_metadata_patch jsonb;
  v_allowed_keys constant text[] := array[
    'name_en','legal_name','slug','description_en','primary_phone','whatsapp_phone',
    'email','website_url','metadata_patch'
  ];
  v_key text;
begin
  if p_idempotency_record_id is null
    or p_rollback_snapshot_id is null
    or p_execution_started_audit_id is null
    or p_entity_id is null
    or p_actor_profile_id is null then
    raise exception 'pharmacy_publish_identity_missing' using errcode = '22023';
  end if;

  if char_length(btrim(coalesce(p_expected_version, ''))) not between 1 and 120 then
    raise exception 'expected_version_invalid' using errcode = '22023';
  end if;
  if p_patch is null or jsonb_typeof(p_patch) <> 'object' then
    raise exception 'pharmacy_patch_invalid' using errcode = '22023';
  end if;
  if p_audit_schema_version is distinct from 'drkhaleej.import.publishAudit.v3' then
    raise exception 'audit_schema_version_invalid' using errcode = '22023';
  end if;

  for v_key in select jsonb_object_keys(p_patch)
  loop
    if not (v_key = any(v_allowed_keys)) then
      raise exception 'pharmacy_patch_key_forbidden:%', v_key using errcode = '22023';
    end if;
  end loop;

  v_metadata_patch := p_patch -> 'metadata_patch';
  if v_metadata_patch is null or jsonb_typeof(v_metadata_patch) <> 'object' then
    raise exception 'pharmacy_metadata_patch_invalid' using errcode = '22023';
  end if;
  if v_metadata_patch ->> 'visibility' <> 'private'
    or coalesce((v_metadata_patch ->> 'publicRouteEnabled')::boolean, true) <> false
    or coalesce((v_metadata_patch ->> 'indexable')::boolean, true) <> false
    or coalesce((v_metadata_patch ->> 'sitemapEligible')::boolean, true) <> false then
    raise exception 'pharmacy_private_boundary_invalid' using errcode = '22023';
  end if;

  select * into v_record
  from public.import_publish_idempotency_records
  where id = p_idempotency_record_id
  for update;

  if not found then
    return jsonb_build_object('status', 'failed', 'reason', 'idempotency_record_not_found');
  end if;
  if v_record.entity_id <> p_entity_id or v_record.actor_profile_id <> p_actor_profile_id then
    return jsonb_build_object('status', 'conflict', 'reason', 'reservation_identity_mismatch');
  end if;
  if v_record.expected_version <> p_expected_version then
    return jsonb_build_object('status', 'conflict', 'reason', 'expected_version_mismatch');
  end if;
  if v_record.terminal_result is not null then
    return jsonb_build_object(
      'status', 'replayed',
      'entityId', p_entity_id,
      'actualVersion', coalesce(v_record.terminal_result ->> 'actualVersion', v_record.expected_version),
      'terminalResult', v_record.terminal_result
    );
  end if;
  if v_record.status <> 'reserved' then
    return jsonb_build_object('status', 'conflict', 'reason', 'reservation_not_active');
  end if;

  select * into v_snapshot
  from public.import_publish_rollback_snapshots
  where id = p_rollback_snapshot_id
    and idempotency_record_id = p_idempotency_record_id
    and entity_id = p_entity_id
    and actor_profile_id = p_actor_profile_id
  for update;

  if not found then
    return jsonb_build_object('status', 'failed', 'reason', 'rollback_snapshot_not_found');
  end if;
  if v_snapshot.expected_version <> p_expected_version then
    return jsonb_build_object('status', 'conflict', 'reason', 'rollback_snapshot_version_mismatch');
  end if;

  select * into v_reservation_audit
  from public.import_publish_audit_events
  where id = p_execution_started_audit_id
    and idempotency_record_id = p_idempotency_record_id
    and rollback_snapshot_id = p_rollback_snapshot_id
    and entity_id = p_entity_id
    and actor_profile_id = p_actor_profile_id
    and outcome = 'pending'
    and event_payload ->> 'phase' = 'reservation'
    and (
      (event_type = 'reservation_created'
        and schema_version = 'drkhaleej.import.publishAudit.v2')
      or (event_type = 'execution_started'
        and schema_version <> 'drkhaleej.import.publishAudit.v2')
    )
  for update;

  if not found then
    return jsonb_build_object('status', 'conflict', 'reason', 'reservation_audit_mismatch');
  end if;

  if exists (
    select 1
    from public.import_publish_audit_events
    where idempotency_record_id = p_idempotency_record_id
      and event_type = 'execution_started'
      and event_payload ->> 'phase' = 'mutation'
  ) then
    return jsonb_build_object('status', 'conflict', 'reason', 'duplicate_execution_started');
  end if;

  select * into v_center
  from public.centers
  where id = p_entity_id
  for update;

  if not found then
    return jsonb_build_object('status', 'failed', 'reason', 'pharmacy_not_found');
  end if;
  if v_center.center_type <> 'pharmacy'::public.center_type then
    return jsonb_build_object('status', 'conflict', 'reason', 'entity_not_pharmacy');
  end if;
  if v_center.updated_at::text <> p_expected_version then
    return jsonb_build_object('status', 'conflict', 'reason', 'expected_version_mismatch');
  end if;
  if v_center.status <> 'draft'::public.provider_status
    or v_center.is_active
    or v_center.is_featured
    or v_center.deleted_at is not null then
    return jsonb_build_object('status', 'conflict', 'reason', 'pharmacy_private_state_invalid');
  end if;

  insert into public.import_publish_audit_events (
    id,
    entity_id,
    actor_profile_id,
    idempotency_record_id,
    rollback_snapshot_id,
    event_type,
    outcome,
    schema_version,
    expected_version,
    event_payload
  ) values (
    v_execution_started_audit_id,
    p_entity_id,
    p_actor_profile_id,
    p_idempotency_record_id,
    p_rollback_snapshot_id,
    'execution_started',
    'pending',
    p_audit_schema_version,
    p_expected_version,
    jsonb_build_object(
      'phase', 'mutation',
      'reservationAuditId', p_execution_started_audit_id,
      'snapshotHash', v_snapshot.snapshot_hash
    )
  );

  update public.import_publish_idempotency_records
  set status = 'in_progress', updated_at = clock_timestamp()
  where id = p_idempotency_record_id;

  update public.centers
  set
    name_en = coalesce(nullif(btrim(p_patch ->> 'name_en'), ''), name_en),
    legal_name = case when p_patch ? 'legal_name' then nullif(btrim(p_patch ->> 'legal_name'), '') else legal_name end,
    slug = coalesce(nullif(btrim(p_patch ->> 'slug'), ''), slug),
    description_en = case when p_patch ? 'description_en' then nullif(btrim(p_patch ->> 'description_en'), '') else description_en end,
    primary_phone = case when p_patch ? 'primary_phone' then nullif(btrim(p_patch ->> 'primary_phone'), '') else primary_phone end,
    whatsapp_phone = case when p_patch ? 'whatsapp_phone' then nullif(btrim(p_patch ->> 'whatsapp_phone'), '') else whatsapp_phone end,
    email = case when p_patch ? 'email' then nullif(btrim(p_patch ->> 'email'), '') else email end,
    website_url = case when p_patch ? 'website_url' then nullif(btrim(p_patch ->> 'website_url'), '') else website_url end,
    metadata = coalesce(metadata, '{}'::jsonb) || v_metadata_patch,
    status = 'draft'::public.provider_status,
    is_active = false,
    is_featured = false
  where id = p_entity_id
  returning updated_at::text into v_actual_version;

  v_terminal_result := jsonb_build_object(
    'kind', 'mutated',
    'entityId', p_entity_id,
    'actualVersion', v_actual_version,
    'visibility', 'private',
    'publicRouteEnabled', false,
    'indexable', false,
    'sitemapEligible', false,
    'executionStartedAuditId', v_execution_started_audit_id
  );

  select public.import_publish_persist_terminal_result(
    p_idempotency_record_id,
    p_entity_id,
    p_actor_profile_id,
    'succeeded',
    v_actual_version,
    v_terminal_result,
    p_audit_schema_version
  ) into v_terminal_persist;

  if coalesce(v_terminal_persist ->> 'status', '') not in ('succeeded','replayed') then
    raise exception 'terminal_persistence_failed' using errcode = 'P0001';
  end if;

  return jsonb_build_object(
    'status', 'mutated',
    'entityId', p_entity_id,
    'actualVersion', v_actual_version,
    'executionStartedAuditId', v_execution_started_audit_id,
    'terminalPersistence', v_terminal_persist
  );
end;
$$;

revoke all on function public.import_publish_pharmacy_private(
  uuid, uuid, uuid, uuid, uuid, text, jsonb, text
) from public, anon, authenticated;

grant execute on function public.import_publish_pharmacy_private(
  uuid, uuid, uuid, uuid, uuid, text, jsonb, text
) to service_role;

create unique index if not exists import_pharmacy_publish_references_reservation_unique
  on public.import_pharmacy_publish_references (idempotency_record_id);

comment on function public.import_publish_pharmacy_private(
  uuid, uuid, uuid, uuid, uuid, text, jsonb, text
) is 'Atomic service-role-only Pharmacy private mutation using an already verified Reservation, mutation-time execution_started, exact private patch, and terminal persistence. The legacy third parameter name carries the verified reservation audit id for signature compatibility.';
