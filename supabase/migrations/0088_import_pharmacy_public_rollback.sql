-- P13 PHARMACY-PUBLIC-ROLLBACK
-- Extend the existing Pharmacy public/noindex authority with exact Queue recovery.
-- Index, Sitemap, JSON-LD, later families and Production execution remain closed.

alter table public.import_pharmacy_public_noindex_authorizations
  add column if not exists rolled_back_at timestamptz null;

alter table public.import_pharmacy_public_noindex_authorizations
  drop constraint if exists import_pharmacy_public_noindex_status_check;
alter table public.import_pharmacy_public_noindex_authorizations
  add constraint import_pharmacy_public_noindex_status_check
  check (status in ('issued', 'published', 'rolled_back', 'invalidated', 'expired'));

alter table public.import_pharmacy_public_noindex_authorizations
  drop constraint if exists import_pharmacy_public_noindex_lifecycle_shape_check;
alter table public.import_pharmacy_public_noindex_authorizations
  add constraint import_pharmacy_public_noindex_lifecycle_shape_check check (
    (
      status = 'issued'
      and published_queue_id is null
      and terminal_result is null
      and terminal_result_hash is null
      and published_at is null
      and rolled_back_at is null
    )
    or (
      status = 'published'
      and published_queue_id is not null
      and terminal_result is not null
      and terminal_result_hash is not null
      and published_at is not null
      and rolled_back_at is null
    )
    or (
      status = 'rolled_back'
      and terminal_result is not null
      and terminal_result_hash is not null
      and published_at is not null
      and rolled_back_at is not null
    )
    or (
      status in ('invalidated', 'expired')
      and published_queue_id is null
      and published_at is null
      and rolled_back_at is null
    )
  );

alter table public.import_pharmacy_public_noindex_events
  drop constraint if exists import_pharmacy_public_noindex_event_type_check;
alter table public.import_pharmacy_public_noindex_events
  add constraint import_pharmacy_public_noindex_event_type_check
  check (
    event_type in (
      'authorization_issued',
      'public_noindex_published',
      'public_noindex_rolled_back'
    )
  );

alter table public.import_pharmacy_public_noindex_events
  drop constraint if exists import_pharmacy_public_noindex_event_outcome_check;
alter table public.import_pharmacy_public_noindex_events
  add constraint import_pharmacy_public_noindex_event_outcome_check
  check (outcome in ('issued', 'published', 'rolled_back'));

create or replace function public.import_rollback_pharmacy_public_noindex_by_authority(
  p_actor_profile_id uuid,
  p_entity_id uuid,
  p_schema_version text
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_authorization public.import_pharmacy_public_noindex_authorizations%rowtype;
  v_center public.centers%rowtype;
  v_candidate public.import_entity_candidates%rowtype;
  v_queue public.import_publish_queue%rowtype;
  v_restored_queue public.import_publish_queue%rowtype;
  v_snapshot_queue jsonb;
  v_snapshot_hash text;
  v_candidate_hash text;
  v_terminal_hash text;
  v_rollback_result jsonb;
  v_rollback_hash text;
  v_restored_snapshot jsonb;
  v_rollback_event_count integer;
  v_now timestamptz := clock_timestamp();
begin
  if p_actor_profile_id is null or p_entity_id is null then
    raise exception 'public_noindex_rollback_identity_missing' using errcode = '22023';
  end if;
  if p_schema_version is distinct from 'drkhaleej.import.pharmacyPublicNoindex.v1' then
    raise exception 'public_noindex_rollback_schema_invalid' using errcode = '22023';
  end if;

  select *
  into v_authorization
  from public.import_pharmacy_public_noindex_authorizations
  where actor_profile_id = p_actor_profile_id
    and entity_id = p_entity_id
    and status in ('published', 'rolled_back')
  order by issued_at desc
  limit 1
  for update;

  if not found then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'rollback_authority_not_available',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  v_snapshot_hash := encode(
    extensions.digest(v_authorization.snapshot_payload::text, 'sha256'),
    'hex'
  );
  if v_snapshot_hash <> v_authorization.snapshot_hash then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'rollback_snapshot_hash_mismatch',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  if jsonb_typeof(v_authorization.snapshot_payload) <> 'object'
    or jsonb_typeof(v_authorization.snapshot_payload -> 'queuePresent') <> 'boolean' then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'rollback_snapshot_shape_invalid',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  select count(*)::integer
  into v_rollback_event_count
  from public.import_pharmacy_public_noindex_events
  where authorization_id = v_authorization.id
    and event_type = 'public_noindex_rolled_back';

  if v_authorization.status = 'rolled_back' then
    if v_rollback_event_count <> 1
      or v_authorization.terminal_result is null
      or v_authorization.terminal_result_hash is null
      or v_authorization.rolled_back_at is null then
      raise exception 'public_noindex_rollback_replay_state_invalid' using errcode = 'P0001';
    end if;

    v_terminal_hash := encode(
      extensions.digest(v_authorization.terminal_result::text, 'sha256'),
      'hex'
    );
    if v_terminal_hash <> v_authorization.terminal_result_hash then
      raise exception 'public_noindex_rollback_replay_hash_mismatch' using errcode = 'P0001';
    end if;

    if (v_authorization.snapshot_payload ->> 'queuePresent')::boolean then
      v_snapshot_queue := v_authorization.snapshot_payload -> 'queue';
      if jsonb_typeof(v_snapshot_queue) <> 'object' then
        raise exception 'public_noindex_rollback_replay_snapshot_invalid' using errcode = 'P0001';
      end if;

      select *
      into v_restored_queue
      from public.import_publish_queue
      where id = (v_snapshot_queue ->> 'id')::uuid
      for update;

      if not found then
        raise exception 'public_noindex_rollback_replay_queue_missing' using errcode = 'P0001';
      end if;

      v_restored_snapshot := jsonb_build_object(
        'queuePresent', true,
        'queue', jsonb_build_object(
          'id', v_restored_queue.id,
          'batchId', v_restored_queue.batch_id,
          'rawRowId', v_restored_queue.raw_row_id,
          'targetEntityType', v_restored_queue.target_entity_type,
          'targetEntityId', v_restored_queue.target_entity_id,
          'publishStatus', v_restored_queue.publish_status,
          'indexPolicy', v_restored_queue.index_policy,
          'sitemapPolicy', v_restored_queue.sitemap_policy,
          'qualityScore', v_restored_queue.quality_score,
          'adminNote', v_restored_queue.admin_note,
          'metadata', v_restored_queue.metadata
        )
      );
    else
      if v_authorization.published_queue_id is not null then
        raise exception 'public_noindex_rollback_replay_queue_reference_present' using errcode = 'P0001';
      end if;
      if exists (
        select 1
        from public.import_publish_queue
        where target_entity_id = p_entity_id
           or raw_row_id = (
             select raw_row_id
             from public.import_entity_candidates
             where id = v_authorization.candidate_id
           )
      ) then
        raise exception 'public_noindex_rollback_replay_queue_unexpected' using errcode = 'P0001';
      end if;
      v_restored_snapshot := jsonb_build_object('queuePresent', false);
    end if;

    if v_restored_snapshot <> v_authorization.snapshot_payload
      or encode(extensions.digest(v_restored_snapshot::text, 'sha256'), 'hex')
        <> v_authorization.snapshot_hash then
      raise exception 'public_noindex_rollback_replay_readback_mismatch' using errcode = 'P0001';
    end if;

    return jsonb_build_object(
      'status', 'replayed',
      'visibility', 'private',
      'indexPolicy', 'noindex',
      'sitemapPolicy', 'excluded',
      'exactLogicalRecovery', true,
      'restoredQueuePresent',
        (v_authorization.snapshot_payload ->> 'queuePresent')::boolean,
      'authorityConsumed', true,
      'rawReferenceExposed', false
    );
  end if;

  if v_rollback_event_count <> 0 then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'rollback_event_state_invalid',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  select *
  into v_center
  from public.centers
  where id = p_entity_id
  for update;

  if not found
    or v_center.center_type <> 'pharmacy'::public.center_type
    or v_center.status <> 'draft'::public.provider_status
    or v_center.is_active
    or v_center.is_featured
    or v_center.deleted_at is not null
    or v_center.updated_at::text <> v_authorization.expected_entity_version then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'rollback_private_boundary_invalid',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  select *
  into v_candidate
  from public.import_entity_candidates
  where id = v_authorization.candidate_id
  for update;

  if not found
    or v_candidate.entity_type <> 'pharmacy'
    or v_candidate.candidate_status <> 'approved' then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'rollback_candidate_state_invalid',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  v_candidate_hash := encode(
    extensions.digest(v_candidate.candidate_payload::text, 'sha256'),
    'hex'
  );
  if v_candidate_hash <> v_authorization.candidate_payload_hash then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'rollback_candidate_hash_mismatch',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  if v_authorization.terminal_result is null
    or v_authorization.terminal_result_hash is null then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'rollback_published_result_missing',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;
  v_terminal_hash := encode(
    extensions.digest(v_authorization.terminal_result::text, 'sha256'),
    'hex'
  );
  if v_terminal_hash <> v_authorization.terminal_result_hash then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'rollback_published_result_hash_mismatch',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  select *
  into v_queue
  from public.import_publish_queue
  where id = v_authorization.published_queue_id
  for update;

  if not found
    or v_queue.target_entity_type <> 'pharmacy'
    or v_queue.target_entity_id <> p_entity_id
    or v_queue.publish_status <> 'published_noindex'
    or v_queue.index_policy <> 'noindex'
    or v_queue.sitemap_policy <> 'excluded'
    or v_queue.metadata ->> 'public_noindex_schema_version' <> p_schema_version
    or v_queue.metadata ->> 'public_noindex_authorization_id' <> v_authorization.id::text
    or v_queue.metadata ->> 'import_entity_candidate_id' <> v_authorization.candidate_id::text
    or v_queue.metadata ->> 'snapshot_hash' <> v_authorization.snapshot_hash
    or v_queue.metadata ->> 'candidate_payload_hash' <> v_authorization.candidate_payload_hash
    or v_queue.metadata ->> 'canonical_path' <> v_authorization.canonical_path_en
    or v_queue.metadata #>> '{canonical_paths,en}' <> v_authorization.canonical_path_en
    or v_queue.metadata #>> '{canonical_paths,ar}' <> v_authorization.canonical_path_ar
    or v_queue.metadata ->> 'robots_policy' <> 'noindex'
    or v_queue.metadata -> 'sitemap_included' <> 'false'::jsonb
    or v_queue.metadata -> 'index_promoted' <> 'false'::jsonb
    or v_queue.metadata -> 'public_route_enabled' <> 'false'::jsonb then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'published_queue_integrity_mismatch',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  if (v_authorization.snapshot_payload ->> 'queuePresent')::boolean then
    v_snapshot_queue := v_authorization.snapshot_payload -> 'queue';
    if jsonb_typeof(v_snapshot_queue) <> 'object'
      or v_snapshot_queue ->> 'id' <> v_queue.id::text
      or nullif(v_snapshot_queue ->> 'batchId', '') is null
      or nullif(v_snapshot_queue ->> 'rawRowId', '') is null
      or nullif(v_snapshot_queue ->> 'targetEntityType', '') is null
      or nullif(v_snapshot_queue ->> 'publishStatus', '') is null
      or nullif(v_snapshot_queue ->> 'indexPolicy', '') is null
      or nullif(v_snapshot_queue ->> 'sitemapPolicy', '') is null
      or jsonb_typeof(v_snapshot_queue -> 'metadata') <> 'object' then
      return jsonb_build_object(
        'status', 'conflict',
        'reason', 'rollback_snapshot_shape_invalid',
        'authorityConsumed', false,
        'rawReferenceExposed', false
      );
    end if;
  end if;

  v_rollback_result := jsonb_build_object(
    'kind', 'pharmacy_public_noindex_rolled_back',
    'visibility', 'private',
    'indexPolicy', 'noindex',
    'sitemapPolicy', 'excluded',
    'exactLogicalRecovery', true,
    'restoredQueuePresent',
      (v_authorization.snapshot_payload ->> 'queuePresent')::boolean
  );
  v_rollback_hash := encode(
    extensions.digest(v_rollback_result::text, 'sha256'),
    'hex'
  );

  -- Change authority state before deleting a Queue created by P11. The Queue FK
  -- uses ON DELETE SET NULL, which is invalid while the authority is published.
  update public.import_pharmacy_public_noindex_authorizations
  set status = 'rolled_back',
      terminal_result = v_rollback_result,
      terminal_result_hash = v_rollback_hash,
      rolled_back_at = v_now
  where id = v_authorization.id;

  if (v_authorization.snapshot_payload ->> 'queuePresent')::boolean then
    update public.import_publish_queue
    set batch_id = (v_snapshot_queue ->> 'batchId')::uuid,
        raw_row_id = (v_snapshot_queue ->> 'rawRowId')::uuid,
        target_entity_type = v_snapshot_queue ->> 'targetEntityType',
        target_entity_id = nullif(v_snapshot_queue ->> 'targetEntityId', '')::uuid,
        publish_status = v_snapshot_queue ->> 'publishStatus',
        index_policy = v_snapshot_queue ->> 'indexPolicy',
        sitemap_policy = v_snapshot_queue ->> 'sitemapPolicy',
        quality_score = (v_snapshot_queue ->> 'qualityScore')::integer,
        admin_note = v_snapshot_queue ->> 'adminNote',
        metadata = v_snapshot_queue -> 'metadata'
    where id = v_queue.id;

    if not found then
      raise exception 'public_noindex_rollback_restore_write_missing' using errcode = 'P0001';
    end if;

    select *
    into v_restored_queue
    from public.import_publish_queue
    where id = v_queue.id
    for update;

    v_restored_snapshot := jsonb_build_object(
      'queuePresent', true,
      'queue', jsonb_build_object(
        'id', v_restored_queue.id,
        'batchId', v_restored_queue.batch_id,
        'rawRowId', v_restored_queue.raw_row_id,
        'targetEntityType', v_restored_queue.target_entity_type,
        'targetEntityId', v_restored_queue.target_entity_id,
        'publishStatus', v_restored_queue.publish_status,
        'indexPolicy', v_restored_queue.index_policy,
        'sitemapPolicy', v_restored_queue.sitemap_policy,
        'qualityScore', v_restored_queue.quality_score,
        'adminNote', v_restored_queue.admin_note,
        'metadata', v_restored_queue.metadata
      )
    );
  else
    delete from public.import_publish_queue
    where id = v_queue.id;

    if not found then
      raise exception 'public_noindex_rollback_delete_missing' using errcode = 'P0001';
    end if;

    if exists (
      select 1
      from public.import_publish_queue
      where id = v_queue.id
         or raw_row_id = v_candidate.raw_row_id
         or target_entity_id = p_entity_id
    ) then
      raise exception 'public_noindex_rollback_delete_readback_mismatch' using errcode = 'P0001';
    end if;
    v_restored_snapshot := jsonb_build_object('queuePresent', false);
  end if;

  if v_restored_snapshot <> v_authorization.snapshot_payload
    or encode(extensions.digest(v_restored_snapshot::text, 'sha256'), 'hex')
      <> v_authorization.snapshot_hash then
    raise exception 'public_noindex_rollback_exact_recovery_mismatch' using errcode = 'P0001';
  end if;

  insert into public.import_pharmacy_public_noindex_events (
    authorization_id,
    actor_profile_id,
    entity_id,
    event_type,
    outcome,
    schema_version,
    event_payload
  ) values (
    v_authorization.id,
    p_actor_profile_id,
    p_entity_id,
    'public_noindex_rolled_back',
    'rolled_back',
    p_schema_version,
    jsonb_build_object(
      'terminalResultHash', v_rollback_hash,
      'snapshotHash', v_authorization.snapshot_hash,
      'exactLogicalRecovery', true,
      'restoredQueuePresent',
        (v_authorization.snapshot_payload ->> 'queuePresent')::boolean
    )
  );

  return jsonb_build_object(
    'status', 'rolled_back',
    'visibility', 'private',
    'indexPolicy', 'noindex',
    'sitemapPolicy', 'excluded',
    'exactLogicalRecovery', true,
    'restoredQueuePresent',
      (v_authorization.snapshot_payload ->> 'queuePresent')::boolean,
    'authorityConsumed', true,
    'rawReferenceExposed', false
  );
end;
$$;

revoke all on function public.import_rollback_pharmacy_public_noindex_by_authority(
  uuid, uuid, text
) from public, anon, authenticated;
grant execute on function public.import_rollback_pharmacy_public_noindex_by_authority(
  uuid, uuid, text
) to service_role;

comment on function public.import_rollback_pharmacy_public_noindex_by_authority(
  uuid, uuid, text
) is
  'Server-only exact rollback of one published Pharmacy public/noindex authority; no Index or Sitemap promotion.';

comment on table public.import_pharmacy_public_noindex_authorizations is
  'Protected Pharmacy public/noindex authority, exact Queue snapshot, publication readback and rollback state.';
comment on table public.import_pharmacy_public_noindex_events is
  'Append-only events for Pharmacy public/noindex authorization, publication and rollback.';
