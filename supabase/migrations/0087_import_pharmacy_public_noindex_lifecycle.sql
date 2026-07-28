-- PHARMACY-PUBLIC-NOINDEX-LIFECYCLE
-- Independent, single-entity Pharmacy public/noindex authority and exact logical rollback.
-- This migration cannot promote index or sitemap state and is service-role-only.

create table if not exists public.import_pharmacy_public_noindex_authorizations (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid not null references public.profiles(id) on delete restrict,
  entity_id uuid not null references public.centers(id) on delete restrict,
  candidate_id uuid not null references public.import_entity_candidates(id) on delete restrict,
  idempotency_key text not null unique,
  request_hash text not null,
  expected_entity_version text not null,
  candidate_payload_hash text not null,
  canonical_path_en text not null,
  canonical_path_ar text not null,
  snapshot_payload jsonb not null,
  snapshot_hash text not null,
  status text not null default 'issued',
  published_queue_id uuid null references public.import_publish_queue(id) on delete set null,
  terminal_result jsonb null,
  terminal_result_hash text null,
  issued_at timestamptz not null default clock_timestamp(),
  expires_at timestamptz not null,
  published_at timestamptz null,
  rolled_back_at timestamptz null,
  updated_at timestamptz not null default clock_timestamp(),
  constraint import_pharmacy_public_noindex_idempotency_key_check
    check (char_length(btrim(idempotency_key)) between 8 and 240),
  constraint import_pharmacy_public_noindex_request_hash_check
    check (request_hash ~ '^[a-f0-9]{64}$'),
  constraint import_pharmacy_public_noindex_expected_version_check
    check (char_length(btrim(expected_entity_version)) between 1 and 120),
  constraint import_pharmacy_public_noindex_candidate_hash_check
    check (candidate_payload_hash ~ '^[a-f0-9]{64}$'),
  constraint import_pharmacy_public_noindex_path_en_check
    check (canonical_path_en ~ '^/en/om/pharmacies/[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint import_pharmacy_public_noindex_path_ar_check
    check (canonical_path_ar ~ '^/ar/om/pharmacies/[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint import_pharmacy_public_noindex_snapshot_object_check
    check (jsonb_typeof(snapshot_payload) = 'object'),
  constraint import_pharmacy_public_noindex_snapshot_hash_check
    check (snapshot_hash ~ '^[a-f0-9]{64}$'),
  constraint import_pharmacy_public_noindex_status_check
    check (status in ('issued', 'published', 'rolled_back', 'invalidated', 'expired')),
  constraint import_pharmacy_public_noindex_terminal_object_check
    check (terminal_result is null or jsonb_typeof(terminal_result) = 'object'),
  constraint import_pharmacy_public_noindex_terminal_hash_check
    check (terminal_result_hash is null or terminal_result_hash ~ '^[a-f0-9]{64}$'),
  constraint import_pharmacy_public_noindex_expiry_check
    check (expires_at > issued_at and expires_at <= issued_at + interval '168 hours'),
  constraint import_pharmacy_public_noindex_lifecycle_shape_check check (
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
  )
);

create table if not exists public.import_pharmacy_public_noindex_events (
  id uuid primary key default gen_random_uuid(),
  authorization_id uuid not null
    references public.import_pharmacy_public_noindex_authorizations(id) on delete restrict,
  actor_profile_id uuid not null references public.profiles(id) on delete restrict,
  entity_id uuid not null references public.centers(id) on delete restrict,
  event_type text not null,
  outcome text not null,
  schema_version text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default clock_timestamp(),
  constraint import_pharmacy_public_noindex_event_type_check
    check (event_type in ('authorization_issued', 'public_noindex_published', 'public_noindex_rolled_back')),
  constraint import_pharmacy_public_noindex_event_outcome_check
    check (outcome in ('issued', 'published', 'rolled_back')),
  constraint import_pharmacy_public_noindex_event_schema_check
    check (char_length(btrim(schema_version)) between 1 and 64),
  constraint import_pharmacy_public_noindex_event_payload_check
    check (jsonb_typeof(event_payload) = 'object')
);

create unique index if not exists import_pharmacy_public_noindex_active_entity_unique
  on public.import_pharmacy_public_noindex_authorizations (entity_id)
  where status in ('issued', 'published');

create index if not exists import_pharmacy_public_noindex_actor_entity_idx
  on public.import_pharmacy_public_noindex_authorizations
  (actor_profile_id, entity_id, issued_at desc);

create index if not exists import_pharmacy_public_noindex_event_authority_idx
  on public.import_pharmacy_public_noindex_events
  (authorization_id, created_at asc);

create trigger trg_import_pharmacy_public_noindex_set_updated_at
  before update on public.import_pharmacy_public_noindex_authorizations
  for each row execute function public.set_updated_at();

alter table public.import_pharmacy_public_noindex_authorizations enable row level security;
alter table public.import_pharmacy_public_noindex_events enable row level security;

create or replace function public.import_authorize_pharmacy_public_noindex(
  p_actor_profile_id uuid,
  p_entity_id uuid,
  p_candidate_id uuid,
  p_idempotency_key text,
  p_request_hash text,
  p_expected_entity_version text,
  p_canonical_path_en text,
  p_canonical_path_ar text,
  p_schema_version text,
  p_ttl_hours integer default 24
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_existing public.import_pharmacy_public_noindex_authorizations%rowtype;
  v_center public.centers%rowtype;
  v_candidate public.import_entity_candidates%rowtype;
  v_queue public.import_publish_queue%rowtype;
  v_queue_count integer;
  v_snapshot jsonb;
  v_snapshot_hash text;
  v_candidate_hash text;
  v_authorization_id uuid;
  v_slug text;
  v_now timestamptz := clock_timestamp();
begin
  if p_actor_profile_id is null or p_entity_id is null or p_candidate_id is null then
    raise exception 'public_noindex_identity_missing' using errcode = '22023';
  end if;
  if char_length(btrim(coalesce(p_idempotency_key, ''))) not between 8 and 240
    or coalesce(p_request_hash, '') !~ '^[a-f0-9]{64}$'
    or char_length(btrim(coalesce(p_expected_entity_version, ''))) not between 1 and 120 then
    raise exception 'public_noindex_request_identity_invalid' using errcode = '22023';
  end if;
  if p_schema_version is distinct from 'drkhaleej.import.pharmacyPublicNoindex.v1' then
    raise exception 'public_noindex_schema_version_invalid' using errcode = '22023';
  end if;
  if p_ttl_hours not between 1 and 168 then
    raise exception 'public_noindex_ttl_invalid' using errcode = '22023';
  end if;
  if coalesce(p_canonical_path_en, '') !~ '^/en/om/pharmacies/[a-z0-9]+(-[a-z0-9]+)*$'
    or coalesce(p_canonical_path_ar, '') !~ '^/ar/om/pharmacies/[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'public_noindex_bilingual_paths_invalid' using errcode = '22023';
  end if;

  select *
  into v_existing
  from public.import_pharmacy_public_noindex_authorizations
  where idempotency_key = p_idempotency_key
  for update;

  if found then
    if v_existing.actor_profile_id <> p_actor_profile_id
      or v_existing.entity_id <> p_entity_id
      or v_existing.candidate_id <> p_candidate_id
      or v_existing.request_hash <> p_request_hash
      or v_existing.expected_entity_version <> p_expected_entity_version
      or v_existing.canonical_path_en <> p_canonical_path_en
      or v_existing.canonical_path_ar <> p_canonical_path_ar then
      return jsonb_build_object('status', 'conflict', 'reason', 'idempotency_request_mismatch');
    end if;
    return jsonb_build_object(
      'status', 'replayed',
      'authorizationId', v_existing.id,
      'lifecycleStatus', v_existing.status,
      'snapshotHash', v_existing.snapshot_hash
    );
  end if;

  select *
  into v_center
  from public.centers
  where id = p_entity_id
  for update;

  if not found then
    return jsonb_build_object('status', 'failed', 'reason', 'pharmacy_not_found');
  end if;
  if v_center.center_type <> 'pharmacy'::public.center_type
    or v_center.status <> 'draft'::public.provider_status
    or v_center.is_active
    or v_center.is_featured
    or v_center.deleted_at is not null then
    return jsonb_build_object('status', 'conflict', 'reason', 'pharmacy_private_boundary_invalid');
  end if;
  if v_center.updated_at::text <> p_expected_entity_version then
    return jsonb_build_object('status', 'conflict', 'reason', 'entity_version_mismatch');
  end if;

  v_slug := v_center.slug;
  if p_canonical_path_en <> ('/en/om/pharmacies/' || v_slug)
    or p_canonical_path_ar <> ('/ar/om/pharmacies/' || v_slug) then
    return jsonb_build_object('status', 'conflict', 'reason', 'canonical_route_mismatch');
  end if;

  select *
  into v_candidate
  from public.import_entity_candidates
  where id = p_candidate_id
  for update;

  if not found then
    return jsonb_build_object('status', 'failed', 'reason', 'candidate_not_found');
  end if;
  if v_candidate.entity_type <> 'pharmacy'
    or v_candidate.candidate_status <> 'approved'
    or jsonb_typeof(v_candidate.candidate_payload) <> 'object' then
    return jsonb_build_object('status', 'conflict', 'reason', 'candidate_not_approved_pharmacy');
  end if;
  if coalesce(
      nullif(btrim(v_candidate.candidate_payload #>> '{identity,primaryName}'), ''),
      nullif(btrim(v_candidate.candidate_payload #>> '{identity,nameEn}'), '')
    ) is null then
    return jsonb_build_object('status', 'conflict', 'reason', 'candidate_identity_missing');
  end if;
  if coalesce(
      nullif(btrim(v_candidate.candidate_payload #>> '{geo,area}'), ''),
      nullif(btrim(v_candidate.candidate_payload #>> '{geo,wilayat}'), ''),
      nullif(btrim(v_candidate.candidate_payload #>> '{geo,governorate}'), ''),
      nullif(btrim(v_candidate.candidate_payload #>> '{geo,latitude}'), ''),
      nullif(btrim(v_candidate.candidate_payload #>> '{geo,longitude}'), '')
    ) is null then
    return jsonb_build_object('status', 'conflict', 'reason', 'candidate_geo_missing');
  end if;
  if coalesce(
      nullif(btrim(v_candidate.candidate_payload #>> '{source,sourceName}'), ''),
      nullif(btrim(v_candidate.candidate_payload #>> '{source,sourceUrl}'), '')
    ) is null
    or nullif(btrim(v_candidate.candidate_payload #>> '{source,lastCheckedAt}'), '') is null then
    return jsonb_build_object('status', 'conflict', 'reason', 'candidate_source_evidence_missing');
  end if;
  if coalesce(
      nullif(btrim(v_candidate.candidate_payload #>> '{contact,phoneE164}'), ''),
      nullif(btrim(v_candidate.candidate_payload #>> '{contact,whatsappE164}'), ''),
      nullif(btrim(v_candidate.candidate_payload #>> '{contact,email}'), ''),
      nullif(btrim(v_candidate.candidate_payload #>> '{contact,websiteUrl}'), ''),
      nullif(btrim(v_candidate.candidate_payload #>> '{contact,googleMapsUrl}'), ''),
      nullif(btrim(v_candidate.candidate_payload #>> '{contact,directionUrl}'), '')
    ) is null then
    return jsonb_build_object('status', 'conflict', 'reason', 'candidate_contact_missing');
  end if;

  v_candidate_hash := encode(
    extensions.digest(v_candidate.candidate_payload::text, 'sha256'),
    'hex'
  );

  update public.import_pharmacy_public_noindex_authorizations
  set status = 'expired'
  where entity_id = p_entity_id
    and status = 'issued'
    and expires_at <= v_now;

  select count(*)::integer
  into v_queue_count
  from public.import_publish_queue
  where raw_row_id = v_candidate.raw_row_id
     or target_entity_id = p_entity_id;

  if v_queue_count > 1 then
    return jsonb_build_object('status', 'conflict', 'reason', 'publish_queue_ambiguous');
  end if;

  if v_queue_count = 1 then
    select *
    into v_queue
    from public.import_publish_queue
    where raw_row_id = v_candidate.raw_row_id
       or target_entity_id = p_entity_id
    for update;

    if v_queue.target_entity_type <> 'pharmacy'
      or v_queue.publish_status not in ('not_ready', 'queued', 'published_noindex')
      or v_queue.index_policy <> 'noindex'
      or v_queue.sitemap_policy <> 'excluded'
      or (v_queue.target_entity_id is not null and v_queue.target_entity_id <> p_entity_id) then
      return jsonb_build_object('status', 'conflict', 'reason', 'publish_queue_state_invalid');
    end if;

    v_snapshot := jsonb_build_object(
      'queuePresent', true,
      'queue', jsonb_build_object(
        'id', v_queue.id,
        'batchId', v_queue.batch_id,
        'rawRowId', v_queue.raw_row_id,
        'targetEntityType', v_queue.target_entity_type,
        'targetEntityId', v_queue.target_entity_id,
        'publishStatus', v_queue.publish_status,
        'indexPolicy', v_queue.index_policy,
        'sitemapPolicy', v_queue.sitemap_policy,
        'qualityScore', v_queue.quality_score,
        'adminNote', v_queue.admin_note,
        'metadata', v_queue.metadata
      )
    );
  else
    v_snapshot := jsonb_build_object('queuePresent', false);
  end if;

  v_snapshot_hash := encode(extensions.digest(v_snapshot::text, 'sha256'), 'hex');

  insert into public.import_pharmacy_public_noindex_authorizations (
    actor_profile_id,
    entity_id,
    candidate_id,
    idempotency_key,
    request_hash,
    expected_entity_version,
    candidate_payload_hash,
    canonical_path_en,
    canonical_path_ar,
    snapshot_payload,
    snapshot_hash,
    status,
    issued_at,
    expires_at
  ) values (
    p_actor_profile_id,
    p_entity_id,
    p_candidate_id,
    p_idempotency_key,
    p_request_hash,
    p_expected_entity_version,
    v_candidate_hash,
    p_canonical_path_en,
    p_canonical_path_ar,
    v_snapshot,
    v_snapshot_hash,
    'issued',
    v_now,
    v_now + make_interval(hours => p_ttl_hours)
  )
  returning id into v_authorization_id;

  insert into public.import_pharmacy_public_noindex_events (
    authorization_id,
    actor_profile_id,
    entity_id,
    event_type,
    outcome,
    schema_version,
    event_payload
  ) values (
    v_authorization_id,
    p_actor_profile_id,
    p_entity_id,
    'authorization_issued',
    'issued',
    p_schema_version,
    jsonb_build_object(
      'requestHash', p_request_hash,
      'candidatePayloadHash', v_candidate_hash,
      'snapshotHash', v_snapshot_hash
    )
  );

  return jsonb_build_object(
    'status', 'issued',
    'authorizationId', v_authorization_id,
    'snapshotHash', v_snapshot_hash,
    'candidatePayloadHash', v_candidate_hash
  );
end;
$$;

create or replace function public.import_publish_pharmacy_public_noindex(
  p_authorization_id uuid,
  p_actor_profile_id uuid,
  p_entity_id uuid,
  p_request_hash text,
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
  v_queue_id uuid;
  v_candidate_hash text;
  v_terminal jsonb;
  v_terminal_hash text;
  v_now timestamptz := clock_timestamp();
begin
  if p_authorization_id is null or p_actor_profile_id is null or p_entity_id is null then
    raise exception 'public_noindex_publish_identity_missing' using errcode = '22023';
  end if;
  if coalesce(p_request_hash, '') !~ '^[a-f0-9]{64}$'
    or p_schema_version is distinct from 'drkhaleej.import.pharmacyPublicNoindex.v1' then
    raise exception 'public_noindex_publish_contract_invalid' using errcode = '22023';
  end if;

  select *
  into v_authorization
  from public.import_pharmacy_public_noindex_authorizations
  where id = p_authorization_id
  for update;

  if not found then
    return jsonb_build_object('status', 'failed', 'reason', 'authorization_not_found');
  end if;
  if v_authorization.actor_profile_id <> p_actor_profile_id
    or v_authorization.entity_id <> p_entity_id
    or v_authorization.request_hash <> p_request_hash then
    return jsonb_build_object('status', 'conflict', 'reason', 'authorization_identity_mismatch');
  end if;
  if v_authorization.status = 'published' then
    return jsonb_build_object(
      'status', 'replayed',
      'lifecycleStatus', 'published',
      'terminalResult', v_authorization.terminal_result
    );
  end if;
  if v_authorization.status <> 'issued' or v_authorization.expires_at <= v_now then
    return jsonb_build_object('status', 'conflict', 'reason', 'authorization_not_active');
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
    or v_center.deleted_at is not null then
    return jsonb_build_object('status', 'conflict', 'reason', 'pharmacy_private_boundary_invalid');
  end if;
  if v_center.updated_at::text <> v_authorization.expected_entity_version then
    return jsonb_build_object('status', 'conflict', 'reason', 'entity_version_mismatch');
  end if;

  select *
  into v_candidate
  from public.import_entity_candidates
  where id = v_authorization.candidate_id
  for update;

  if not found
    or v_candidate.entity_type <> 'pharmacy'
    or v_candidate.candidate_status <> 'approved' then
    return jsonb_build_object('status', 'conflict', 'reason', 'candidate_not_approved_pharmacy');
  end if;

  v_candidate_hash := encode(
    extensions.digest(v_candidate.candidate_payload::text, 'sha256'),
    'hex'
  );
  if v_candidate_hash <> v_authorization.candidate_payload_hash then
    return jsonb_build_object('status', 'conflict', 'reason', 'candidate_payload_changed');
  end if;

  select *
  into v_queue
  from public.import_publish_queue
  where raw_row_id = v_candidate.raw_row_id
     or target_entity_id = p_entity_id
  for update;

  if found then
    if v_queue.target_entity_type <> 'pharmacy'
      or v_queue.index_policy <> 'noindex'
      or v_queue.sitemap_policy <> 'excluded'
      or v_queue.publish_status not in ('not_ready', 'queued', 'published_noindex')
      or (v_queue.target_entity_id is not null and v_queue.target_entity_id <> p_entity_id) then
      return jsonb_build_object('status', 'conflict', 'reason', 'publish_queue_state_changed');
    end if;

    update public.import_publish_queue
    set target_entity_id = p_entity_id,
        publish_status = 'published_noindex',
        index_policy = 'noindex',
        sitemap_policy = 'excluded',
        quality_score = greatest(0, least(100, v_candidate.quality_score)),
        admin_note = 'Public Pharmacy noindex lifecycle; index and sitemap promotions remain separately locked.',
        metadata = jsonb_build_object(
          'public_noindex_schema_version', p_schema_version,
          'public_noindex_authorization_id', v_authorization.id,
          'import_entity_candidate_id', v_candidate.id,
          'canonical_path', v_authorization.canonical_path_en,
          'canonical_paths', jsonb_build_object(
            'en', v_authorization.canonical_path_en,
            'ar', v_authorization.canonical_path_ar
          ),
          'robots_policy', 'noindex',
          'sitemap_included', false,
          'index_promoted', false,
          'published_noindex_at', v_now,
          'candidate_payload_hash', v_authorization.candidate_payload_hash,
          'snapshot_hash', v_authorization.snapshot_hash
        )
    where id = v_queue.id
    returning id into v_queue_id;
  else
    insert into public.import_publish_queue (
      batch_id,
      raw_row_id,
      target_entity_type,
      target_entity_id,
      publish_status,
      index_policy,
      sitemap_policy,
      quality_score,
      admin_note,
      metadata
    ) values (
      v_candidate.batch_id,
      v_candidate.raw_row_id,
      'pharmacy',
      p_entity_id,
      'published_noindex',
      'noindex',
      'excluded',
      greatest(0, least(100, v_candidate.quality_score)),
      'Public Pharmacy noindex lifecycle; index and sitemap promotions remain separately locked.',
      jsonb_build_object(
        'public_noindex_schema_version', p_schema_version,
        'public_noindex_authorization_id', v_authorization.id,
        'import_entity_candidate_id', v_candidate.id,
        'canonical_path', v_authorization.canonical_path_en,
        'canonical_paths', jsonb_build_object(
          'en', v_authorization.canonical_path_en,
          'ar', v_authorization.canonical_path_ar
        ),
        'robots_policy', 'noindex',
        'sitemap_included', false,
        'index_promoted', false,
        'published_noindex_at', v_now,
        'candidate_payload_hash', v_authorization.candidate_payload_hash,
        'snapshot_hash', v_authorization.snapshot_hash
      )
    )
    returning id into v_queue_id;
  end if;

  v_terminal := jsonb_build_object(
    'kind', 'pharmacy_public_noindex_published',
    'visibility', 'public',
    'indexPolicy', 'noindex',
    'sitemapPolicy', 'excluded',
    'robotsPolicy', 'noindex',
    'bilingualRoutesVerified', true,
    'queueId', v_queue_id
  );
  v_terminal_hash := encode(extensions.digest(v_terminal::text, 'sha256'), 'hex');

  update public.import_pharmacy_public_noindex_authorizations
  set status = 'published',
      published_queue_id = v_queue_id,
      terminal_result = v_terminal,
      terminal_result_hash = v_terminal_hash,
      published_at = v_now
  where id = v_authorization.id;

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
    'public_noindex_published',
    'published',
    p_schema_version,
    jsonb_build_object(
      'terminalResultHash', v_terminal_hash,
      'snapshotHash', v_authorization.snapshot_hash,
      'indexPolicy', 'noindex',
      'sitemapPolicy', 'excluded'
    )
  );

  return jsonb_build_object(
    'status', 'published',
    'terminalResult', v_terminal,
    'terminalResultHash', v_terminal_hash
  );
end;
$$;

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
  v_queue public.import_publish_queue%rowtype;
  v_snapshot_queue jsonb;
  v_rollback_result jsonb;
  v_rollback_hash text;
  v_candidate_id text;
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
    return jsonb_build_object('status', 'conflict', 'reason', 'rollback_authority_not_available');
  end if;
  if v_authorization.status = 'rolled_back' then
    return jsonb_build_object(
      'status', 'replayed',
      'lifecycleStatus', 'rolled_back',
      'terminalResult', v_authorization.terminal_result
    );
  end if;

  select *
  into v_queue
  from public.import_publish_queue
  where id = v_authorization.published_queue_id
  for update;

  if not found then
    return jsonb_build_object('status', 'conflict', 'reason', 'published_queue_missing');
  end if;

  v_candidate_id := v_queue.metadata ->> 'import_entity_candidate_id';
  if v_queue.target_entity_type <> 'pharmacy'
    or v_queue.target_entity_id <> p_entity_id
    or v_queue.publish_status <> 'published_noindex'
    or v_queue.index_policy <> 'noindex'
    or v_queue.sitemap_policy <> 'excluded'
    or v_queue.metadata ->> 'robots_policy' <> 'noindex'
    or coalesce((v_queue.metadata ->> 'sitemap_included')::boolean, true)
    or coalesce((v_queue.metadata ->> 'index_promoted')::boolean, true)
    or v_queue.metadata ->> 'public_noindex_authorization_id' <> v_authorization.id::text
    or v_candidate_id <> v_authorization.candidate_id::text then
    return jsonb_build_object('status', 'conflict', 'reason', 'published_queue_integrity_mismatch');
  end if;

  v_rollback_result := jsonb_build_object(
    'kind', 'pharmacy_public_noindex_rolled_back',
    'visibility', 'private',
    'indexPolicy', 'noindex',
    'sitemapPolicy', 'excluded',
    'exactLogicalRecovery', true,
    'restoredQueuePresent', coalesce(
      (v_authorization.snapshot_payload ->> 'queuePresent')::boolean,
      false
    )
  );
  v_rollback_hash := encode(extensions.digest(v_rollback_result::text, 'sha256'), 'hex');

  update public.import_pharmacy_public_noindex_authorizations
  set status = 'rolled_back',
      terminal_result = v_rollback_result,
      terminal_result_hash = v_rollback_hash,
      rolled_back_at = v_now
  where id = v_authorization.id;

  if coalesce((v_authorization.snapshot_payload ->> 'queuePresent')::boolean, false) then
    v_snapshot_queue := v_authorization.snapshot_payload -> 'queue';
    if v_snapshot_queue is null or jsonb_typeof(v_snapshot_queue) <> 'object'
      or v_snapshot_queue ->> 'id' <> v_queue.id::text then
      return jsonb_build_object('status', 'conflict', 'reason', 'rollback_snapshot_shape_invalid');
    end if;

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
  else
    delete from public.import_publish_queue
    where id = v_queue.id;
    if not found then
      raise exception 'public_noindex_queue_delete_failed' using errcode = 'P0001';
    end if;
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
      'exactLogicalRecovery', true
    )
  );

  return jsonb_build_object(
    'status', 'rolled_back',
    'terminalResult', v_rollback_result,
    'terminalResultHash', v_rollback_hash
  );
end;
$$;

revoke all on table public.import_pharmacy_public_noindex_authorizations
  from public, anon, authenticated;
revoke all on table public.import_pharmacy_public_noindex_events
  from public, anon, authenticated;
grant select, insert, update on table public.import_pharmacy_public_noindex_authorizations
  to service_role;
grant select, insert on table public.import_pharmacy_public_noindex_events
  to service_role;

revoke all on function public.import_authorize_pharmacy_public_noindex(
  uuid, uuid, uuid, text, text, text, text, text, text, integer
) from public, anon, authenticated;
grant execute on function public.import_authorize_pharmacy_public_noindex(
  uuid, uuid, uuid, text, text, text, text, text, text, integer
) to service_role;

revoke all on function public.import_publish_pharmacy_public_noindex(
  uuid, uuid, uuid, text, text
) from public, anon, authenticated;
grant execute on function public.import_publish_pharmacy_public_noindex(
  uuid, uuid, uuid, text, text
) to service_role;

revoke all on function public.import_rollback_pharmacy_public_noindex_by_authority(
  uuid, uuid, text
) from public, anon, authenticated;
grant execute on function public.import_rollback_pharmacy_public_noindex_by_authority(
  uuid, uuid, text
) to service_role;

comment on table public.import_pharmacy_public_noindex_authorizations is
  'Protected single-entity Pharmacy public/noindex authority, snapshot, terminal readback and rollback state.';
comment on table public.import_pharmacy_public_noindex_events is
  'Append-only audit events for Pharmacy public/noindex authorization, publication and rollback.';
