-- P14 PHARMACY-INDEX-PROMOTION
-- Independent, reversible Pharmacy Index authority over the published P11 Queue.
-- Sitemap, JSON-LD, later families and Production execution remain closed.

create table if not exists public.import_pharmacy_index_authorizations (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid not null references public.profiles(id) on delete restrict,
  entity_id uuid not null references public.centers(id) on delete restrict,
  public_noindex_authorization_id uuid not null
    references public.import_pharmacy_public_noindex_authorizations(id) on delete restrict,
  candidate_id uuid not null references public.import_entity_candidates(id) on delete restrict,
  queue_id uuid null references public.import_publish_queue(id) on delete set null,
  idempotency_key text not null unique,
  request_hash text not null,
  canonical_path_en text not null,
  canonical_path_ar text not null,
  candidate_payload_hash text not null,
  public_terminal_hash text not null,
  snapshot_payload jsonb not null,
  snapshot_hash text not null,
  status text not null default 'issued',
  terminal_result jsonb null,
  terminal_result_hash text null,
  issued_at timestamptz not null default clock_timestamp(),
  expires_at timestamptz not null,
  promoted_at timestamptz null,
  rolled_back_at timestamptz null,
  updated_at timestamptz not null default clock_timestamp(),
  constraint import_pharmacy_index_idempotency_key_check
    check (char_length(btrim(idempotency_key)) between 8 and 240),
  constraint import_pharmacy_index_request_hash_check
    check (request_hash ~ '^[a-f0-9]{64}$'),
  constraint import_pharmacy_index_path_en_check
    check (canonical_path_en ~ '^/en/om/pharmacies/[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint import_pharmacy_index_path_ar_check
    check (canonical_path_ar ~ '^/ar/om/pharmacies/[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint import_pharmacy_index_candidate_hash_check
    check (candidate_payload_hash ~ '^[a-f0-9]{64}$'),
  constraint import_pharmacy_index_public_terminal_hash_check
    check (public_terminal_hash ~ '^[a-f0-9]{64}$'),
  constraint import_pharmacy_index_snapshot_object_check
    check (jsonb_typeof(snapshot_payload) = 'object'),
  constraint import_pharmacy_index_snapshot_hash_check
    check (snapshot_hash ~ '^[a-f0-9]{64}$'),
  constraint import_pharmacy_index_status_check
    check (status in ('issued', 'promoted', 'rolled_back', 'invalidated', 'expired')),
  constraint import_pharmacy_index_terminal_object_check
    check (terminal_result is null or jsonb_typeof(terminal_result) = 'object'),
  constraint import_pharmacy_index_terminal_hash_check
    check (terminal_result_hash is null or terminal_result_hash ~ '^[a-f0-9]{64}$'),
  constraint import_pharmacy_index_expiry_check
    check (expires_at > issued_at and expires_at <= issued_at + interval '168 hours'),
  constraint import_pharmacy_index_lifecycle_shape_check check (
    (
      status = 'issued'
      and queue_id is not null
      and terminal_result is null
      and terminal_result_hash is null
      and promoted_at is null
      and rolled_back_at is null
    )
    or (
      status = 'promoted'
      and queue_id is not null
      and terminal_result is not null
      and terminal_result_hash is not null
      and promoted_at is not null
      and rolled_back_at is null
    )
    or (
      status = 'rolled_back'
      and terminal_result is not null
      and terminal_result_hash is not null
      and promoted_at is not null
      and rolled_back_at is not null
    )
    or (
      status in ('invalidated', 'expired')
      and terminal_result is null
      and terminal_result_hash is null
      and promoted_at is null
      and rolled_back_at is null
    )
  )
);

create table if not exists public.import_pharmacy_index_events (
  id uuid primary key default gen_random_uuid(),
  authorization_id uuid not null
    references public.import_pharmacy_index_authorizations(id) on delete restrict,
  actor_profile_id uuid not null references public.profiles(id) on delete restrict,
  entity_id uuid not null references public.centers(id) on delete restrict,
  event_type text not null,
  outcome text not null,
  schema_version text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default clock_timestamp(),
  constraint import_pharmacy_index_event_type_check
    check (
      event_type in (
        'index_authorization_issued',
        'index_promoted',
        'index_rolled_back'
      )
    ),
  constraint import_pharmacy_index_event_outcome_check
    check (outcome in ('issued', 'promoted', 'rolled_back')),
  constraint import_pharmacy_index_event_schema_check
    check (char_length(btrim(schema_version)) between 1 and 64),
  constraint import_pharmacy_index_event_payload_check
    check (jsonb_typeof(event_payload) = 'object')
);

create unique index if not exists import_pharmacy_index_active_entity_unique
  on public.import_pharmacy_index_authorizations (entity_id)
  where status in ('issued', 'promoted');

create index if not exists import_pharmacy_index_actor_entity_idx
  on public.import_pharmacy_index_authorizations
  (actor_profile_id, entity_id, issued_at desc);

create index if not exists import_pharmacy_index_event_authority_idx
  on public.import_pharmacy_index_events
  (authorization_id, created_at asc);

create trigger trg_import_pharmacy_index_set_updated_at
  before update on public.import_pharmacy_index_authorizations
  for each row execute function public.set_updated_at();

alter table public.import_pharmacy_index_authorizations enable row level security;
alter table public.import_pharmacy_index_events enable row level security;

create or replace function public.import_authorize_pharmacy_index_promotion(
  p_actor_profile_id uuid,
  p_entity_id uuid,
  p_idempotency_key text,
  p_request_hash text,
  p_schema_version text,
  p_ttl_hours integer default 24
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_existing public.import_pharmacy_index_authorizations%rowtype;
  v_actor public.profiles%rowtype;
  v_center public.centers%rowtype;
  v_public_authorization public.import_pharmacy_public_noindex_authorizations%rowtype;
  v_candidate public.import_entity_candidates%rowtype;
  v_queue public.import_publish_queue%rowtype;
  v_snapshot jsonb;
  v_snapshot_hash text;
  v_candidate_hash text;
  v_public_terminal_hash text;
  v_authorization_id uuid;
  v_now timestamptz := clock_timestamp();
begin
  if p_actor_profile_id is null or p_entity_id is null then
    raise exception 'pharmacy_index_identity_missing' using errcode = '22023';
  end if;
  if char_length(btrim(coalesce(p_idempotency_key, ''))) not between 8 and 240
    or coalesce(p_request_hash, '') !~ '^[a-f0-9]{64}$' then
    raise exception 'pharmacy_index_request_identity_invalid' using errcode = '22023';
  end if;
  if p_schema_version is distinct from 'drkhaleej.import.pharmacyIndexPromotion.v1' then
    raise exception 'pharmacy_index_schema_version_invalid' using errcode = '22023';
  end if;
  if p_ttl_hours not between 1 and 168 then
    raise exception 'pharmacy_index_ttl_invalid' using errcode = '22023';
  end if;

  select *
  into v_existing
  from public.import_pharmacy_index_authorizations
  where idempotency_key = p_idempotency_key
  for update;

  if found then
    if v_existing.actor_profile_id <> p_actor_profile_id
      or v_existing.entity_id <> p_entity_id
      or v_existing.request_hash <> p_request_hash then
      return jsonb_build_object(
        'status', 'conflict',
        'reason', 'index_idempotency_request_mismatch',
        'authorityConsumed', false,
        'rawReferenceExposed', false
      );
    end if;
    return jsonb_build_object(
      'status', 'replayed',
      'authorizationId', v_existing.id,
      'lifecycleStatus', v_existing.status,
      'snapshotHash', v_existing.snapshot_hash,
      'rawReferenceExposed', false
    );
  end if;

  select *
  into v_actor
  from public.profiles
  where id = p_actor_profile_id
  for update;

  if not found or not v_actor.is_platform_admin then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_actor_not_authorized',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  select *
  into v_center
  from public.centers
  where id = p_entity_id
  for update;

  if not found then
    return jsonb_build_object(
      'status', 'failed',
      'reason', 'pharmacy_not_found',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;
  if v_center.center_type <> 'pharmacy'::public.center_type
    or v_center.status <> 'draft'::public.provider_status
    or v_center.is_active
    or v_center.is_featured
    or v_center.deleted_at is not null then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_private_boundary_invalid',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  update public.import_pharmacy_index_authorizations
  set status = 'expired'
  where entity_id = p_entity_id
    and status = 'issued'
    and expires_at <= v_now;

  if exists (
    select 1
    from public.import_pharmacy_index_authorizations
    where entity_id = p_entity_id
      and status in ('issued', 'promoted')
  ) then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_active_authority_exists',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  select *
  into v_public_authorization
  from public.import_pharmacy_public_noindex_authorizations
  where entity_id = p_entity_id
    and status = 'published'
  order by issued_at desc
  limit 1
  for update;

  if not found
    or v_public_authorization.published_queue_id is null
    or v_public_authorization.terminal_result is null
    or v_public_authorization.terminal_result_hash is null then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_public_authority_not_available',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  v_public_terminal_hash := encode(
    extensions.digest(v_public_authorization.terminal_result::text, 'sha256'),
    'hex'
  );
  if v_public_terminal_hash <> v_public_authorization.terminal_result_hash
    or encode(
      extensions.digest(v_public_authorization.snapshot_payload::text, 'sha256'),
      'hex'
    ) <> v_public_authorization.snapshot_hash
    or v_public_authorization.terminal_result ->> 'kind'
      <> 'pharmacy_public_noindex_authority_published'
    or v_public_authorization.terminal_result ->> 'indexPolicy' <> 'noindex'
    or v_public_authorization.terminal_result ->> 'sitemapPolicy' <> 'excluded' then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_public_authority_integrity_mismatch',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  select *
  into v_candidate
  from public.import_entity_candidates
  where id = v_public_authorization.candidate_id
  for update;

  if not found
    or v_candidate.entity_type <> 'pharmacy'
    or v_candidate.candidate_status <> 'approved'
    or jsonb_typeof(v_candidate.candidate_payload) <> 'object' then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_candidate_state_invalid',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  if coalesce(
      nullif(btrim(v_candidate.candidate_payload #>> '{geo,area}'), ''),
      nullif(btrim(v_candidate.candidate_payload #>> '{geo,wilayat}'), ''),
      nullif(btrim(v_candidate.candidate_payload #>> '{geo,governorate}'), '')
    ) is null
    or jsonb_typeof(v_candidate.candidate_payload -> 'languages') <> 'array' then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_candidate_content_ineligible',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;
  if not exists (
      select 1
      from jsonb_array_elements_text(
        v_candidate.candidate_payload -> 'languages'
      ) as language(value)
      where nullif(btrim(language.value), '') is not null
    )
    or not (
      case
        when jsonb_typeof(
          v_candidate.candidate_payload #> '{taxonomy,services}'
        ) = 'array' then exists (
          select 1
          from jsonb_array_elements_text(
            v_candidate.candidate_payload #> '{taxonomy,services}'
          ) as service(value)
          where nullif(btrim(service.value), '') is not null
        )
        else false
      end
      or case
        when jsonb_typeof(
          v_candidate.candidate_payload #> '{taxonomy,departments}'
        ) = 'array' then exists (
          select 1
          from jsonb_array_elements_text(
            v_candidate.candidate_payload #> '{taxonomy,departments}'
          ) as department(value)
          where nullif(btrim(department.value), '') is not null
        )
        else false
      end
    ) then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_candidate_content_ineligible',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  v_candidate_hash := encode(
    extensions.digest(v_candidate.candidate_payload::text, 'sha256'),
    'hex'
  );
  if v_candidate_hash <> v_public_authorization.candidate_payload_hash then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_candidate_hash_mismatch',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  select *
  into v_queue
  from public.import_publish_queue
  where id = v_public_authorization.published_queue_id
  for update;

  if not found
    or v_queue.target_entity_type <> 'pharmacy'
    or v_queue.target_entity_id <> p_entity_id
    or v_queue.raw_row_id <> v_candidate.raw_row_id
    or v_queue.publish_status <> 'published_noindex'
    or v_queue.index_policy <> 'noindex'
    or v_queue.sitemap_policy <> 'excluded'
    or v_queue.metadata ->> 'public_noindex_schema_version'
      <> 'drkhaleej.import.pharmacyPublicNoindex.v1'
    or v_queue.metadata ->> 'public_noindex_authorization_id'
      <> v_public_authorization.id::text
    or v_queue.metadata ->> 'import_entity_candidate_id'
      <> v_public_authorization.candidate_id::text
    or v_queue.metadata ->> 'candidate_payload_hash'
      <> v_public_authorization.candidate_payload_hash
    or v_queue.metadata ->> 'snapshot_hash' <> v_public_authorization.snapshot_hash
    or v_queue.metadata ->> 'canonical_path'
      <> v_public_authorization.canonical_path_en
    or v_queue.metadata #>> '{canonical_paths,en}'
      <> v_public_authorization.canonical_path_en
    or v_queue.metadata #>> '{canonical_paths,ar}'
      <> v_public_authorization.canonical_path_ar
    or v_queue.metadata ->> 'robots_policy' <> 'noindex'
    or v_queue.metadata -> 'index_promoted' <> 'false'::jsonb
    or v_queue.metadata -> 'sitemap_included' <> 'false'::jsonb
    or v_queue.metadata -> 'public_route_enabled' <> 'false'::jsonb then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_prerequisite_queue_integrity_mismatch',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  v_snapshot := jsonb_build_object(
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
  v_snapshot_hash := encode(extensions.digest(v_snapshot::text, 'sha256'), 'hex');

  insert into public.import_pharmacy_index_authorizations (
    actor_profile_id,
    entity_id,
    public_noindex_authorization_id,
    candidate_id,
    queue_id,
    idempotency_key,
    request_hash,
    canonical_path_en,
    canonical_path_ar,
    candidate_payload_hash,
    public_terminal_hash,
    snapshot_payload,
    snapshot_hash,
    status,
    issued_at,
    expires_at
  ) values (
    p_actor_profile_id,
    p_entity_id,
    v_public_authorization.id,
    v_public_authorization.candidate_id,
    v_queue.id,
    p_idempotency_key,
    p_request_hash,
    v_public_authorization.canonical_path_en,
    v_public_authorization.canonical_path_ar,
    v_candidate_hash,
    v_public_terminal_hash,
    v_snapshot,
    v_snapshot_hash,
    'issued',
    v_now,
    v_now + make_interval(hours => p_ttl_hours)
  )
  returning id into v_authorization_id;

  insert into public.import_pharmacy_index_events (
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
    'index_authorization_issued',
    'issued',
    p_schema_version,
    jsonb_build_object(
      'requestHash', p_request_hash,
      'candidatePayloadHash', v_candidate_hash,
      'publicTerminalHash', v_public_terminal_hash,
      'snapshotHash', v_snapshot_hash
    )
  );

  return jsonb_build_object(
    'status', 'issued',
    'authorizationId', v_authorization_id,
    'snapshotHash', v_snapshot_hash,
    'rawReferenceExposed', false
  );
end;
$$;

create or replace function public.import_promote_pharmacy_index_by_authority(
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
  v_authorization public.import_pharmacy_index_authorizations%rowtype;
  v_center public.centers%rowtype;
  v_public_authorization public.import_pharmacy_public_noindex_authorizations%rowtype;
  v_candidate public.import_entity_candidates%rowtype;
  v_queue public.import_publish_queue%rowtype;
  v_readback public.import_publish_queue%rowtype;
  v_snapshot jsonb;
  v_candidate_hash text;
  v_public_terminal_hash text;
  v_terminal jsonb;
  v_terminal_hash text;
  v_promoted_metadata jsonb;
  v_promote_event_count integer;
  v_now timestamptz := clock_timestamp();
begin
  if p_authorization_id is null or p_actor_profile_id is null or p_entity_id is null then
    raise exception 'pharmacy_index_promote_identity_missing' using errcode = '22023';
  end if;
  if coalesce(p_request_hash, '') !~ '^[a-f0-9]{64}$'
    or p_schema_version is distinct from 'drkhaleej.import.pharmacyIndexPromotion.v1' then
    raise exception 'pharmacy_index_promote_contract_invalid' using errcode = '22023';
  end if;

  select *
  into v_authorization
  from public.import_pharmacy_index_authorizations
  where id = p_authorization_id
  for update;

  if not found then
    return jsonb_build_object(
      'status', 'failed',
      'reason', 'index_authorization_not_found',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;
  if v_authorization.actor_profile_id <> p_actor_profile_id
    or v_authorization.entity_id <> p_entity_id
    or v_authorization.request_hash <> p_request_hash then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_authorization_identity_mismatch',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;
  if encode(
      extensions.digest(v_authorization.snapshot_payload::text, 'sha256'),
      'hex'
    ) <> v_authorization.snapshot_hash then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_snapshot_hash_mismatch',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;
  if v_authorization.status not in ('issued', 'promoted') then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_authorization_not_active',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;
  if v_authorization.status = 'issued' and v_authorization.expires_at <= v_now then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_authorization_expired',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  select count(*)::integer
  into v_promote_event_count
  from public.import_pharmacy_index_events
  where authorization_id = v_authorization.id
    and event_type = 'index_promoted';

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
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_private_boundary_invalid',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  select *
  into v_public_authorization
  from public.import_pharmacy_public_noindex_authorizations
  where id = v_authorization.public_noindex_authorization_id
  for update;

  if not found
    or v_public_authorization.status <> 'published'
    or v_public_authorization.entity_id <> p_entity_id
    or v_public_authorization.candidate_id <> v_authorization.candidate_id
    or v_public_authorization.published_queue_id <> v_authorization.queue_id
    or v_public_authorization.canonical_path_en <> v_authorization.canonical_path_en
    or v_public_authorization.canonical_path_ar <> v_authorization.canonical_path_ar
    or v_public_authorization.terminal_result is null
    or v_public_authorization.terminal_result_hash is null then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_public_authority_integrity_mismatch',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  v_public_terminal_hash := encode(
    extensions.digest(v_public_authorization.terminal_result::text, 'sha256'),
    'hex'
  );
  if v_public_terminal_hash <> v_authorization.public_terminal_hash
    or v_public_terminal_hash <> v_public_authorization.terminal_result_hash then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_public_authority_integrity_mismatch',
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
      'reason', 'index_candidate_state_invalid',
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
      'reason', 'index_candidate_hash_mismatch',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  select *
  into v_queue
  from public.import_publish_queue
  where id = v_authorization.queue_id
  for update;

  if not found then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_queue_missing',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  if v_authorization.status = 'promoted' then
    if v_promote_event_count <> 1
      or v_authorization.terminal_result is null
      or v_authorization.terminal_result_hash is null
      or v_authorization.promoted_at is null then
      raise exception 'pharmacy_index_replay_state_invalid' using errcode = 'P0001';
    end if;
    v_terminal_hash := encode(
      extensions.digest(v_authorization.terminal_result::text, 'sha256'),
      'hex'
    );
    if v_terminal_hash <> v_authorization.terminal_result_hash
      or v_queue.target_entity_type <> 'pharmacy'
      or v_queue.target_entity_id <> p_entity_id
      or v_queue.publish_status <> 'index_eligible'
      or v_queue.index_policy <> 'index_eligible'
      or v_queue.sitemap_policy <> 'excluded'
      or v_queue.metadata ->> 'pharmacy_index_promotion_schema_version'
        <> p_schema_version
      or v_queue.metadata ->> 'pharmacy_index_authorization_id'
        <> v_authorization.id::text
      or v_queue.metadata ->> 'robots_policy' <> 'index'
      or v_queue.metadata -> 'index_promoted' <> 'true'::jsonb
      or v_queue.metadata -> 'sitemap_included' <> 'false'::jsonb
      or v_queue.metadata ->> 'public_noindex_authorization_id'
        <> v_public_authorization.id::text
      or v_queue.metadata ->> 'import_entity_candidate_id'
        <> v_authorization.candidate_id::text
      or v_queue.metadata ->> 'canonical_path'
        <> v_authorization.canonical_path_en
      or v_queue.metadata #>> '{canonical_paths,en}'
        <> v_authorization.canonical_path_en
      or v_queue.metadata #>> '{canonical_paths,ar}'
        <> v_authorization.canonical_path_ar then
      raise exception 'pharmacy_index_replay_readback_mismatch' using errcode = 'P0001';
    end if;

    return jsonb_build_object(
      'status', 'replayed',
      'visibility', 'public',
      'indexPolicy', 'index_eligible',
      'robotsPolicy', 'index',
      'sitemapPolicy', 'excluded',
      'sitemapIncluded', false,
      'rollbackAvailable', true,
      'authorityConsumed', true,
      'rawReferenceExposed', false
    );
  end if;

  if v_promote_event_count <> 0 then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_event_state_invalid',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  v_snapshot := jsonb_build_object(
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
  if v_snapshot <> v_authorization.snapshot_payload
    or encode(extensions.digest(v_snapshot::text, 'sha256'), 'hex')
      <> v_authorization.snapshot_hash then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_prerequisite_queue_integrity_mismatch',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  v_promoted_metadata := v_queue.metadata || jsonb_build_object(
    'pharmacy_index_promotion_schema_version', p_schema_version,
    'pharmacy_index_authorization_id', v_authorization.id,
    'robots_policy', 'index',
    'index_promoted', true,
    'index_promoted_at', v_now,
    'sitemap_included', false
  );

  update public.import_publish_queue
  set publish_status = 'index_eligible',
      index_policy = 'index_eligible',
      sitemap_policy = 'excluded',
      admin_note = 'Independent Pharmacy Index promotion; Sitemap remains excluded.',
      metadata = v_promoted_metadata
  where id = v_queue.id;

  if not found then
    raise exception 'pharmacy_index_promotion_write_missing' using errcode = 'P0001';
  end if;

  select *
  into v_readback
  from public.import_publish_queue
  where id = v_queue.id
  for update;

  if not found
    or v_readback.publish_status <> 'index_eligible'
    or v_readback.index_policy <> 'index_eligible'
    or v_readback.sitemap_policy <> 'excluded'
    or v_readback.metadata <> v_promoted_metadata then
    raise exception 'pharmacy_index_promotion_readback_mismatch' using errcode = 'P0001';
  end if;

  v_terminal := jsonb_build_object(
    'kind', 'pharmacy_index_promoted',
    'visibility', 'public',
    'indexPolicy', 'index_eligible',
    'robotsPolicy', 'index',
    'sitemapPolicy', 'excluded',
    'sitemapIncluded', false,
    'rollbackAvailable', true
  );
  v_terminal_hash := encode(extensions.digest(v_terminal::text, 'sha256'), 'hex');

  update public.import_pharmacy_index_authorizations
  set status = 'promoted',
      terminal_result = v_terminal,
      terminal_result_hash = v_terminal_hash,
      promoted_at = v_now
  where id = v_authorization.id;

  insert into public.import_pharmacy_index_events (
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
    'index_promoted',
    'promoted',
    p_schema_version,
    jsonb_build_object(
      'terminalResultHash', v_terminal_hash,
      'snapshotHash', v_authorization.snapshot_hash,
      'publicTerminalHash', v_authorization.public_terminal_hash,
      'indexPolicy', 'index_eligible',
      'sitemapPolicy', 'excluded',
      'sitemapIncluded', false
    )
  );

  return jsonb_build_object(
    'status', 'promoted',
    'visibility', 'public',
    'indexPolicy', 'index_eligible',
    'robotsPolicy', 'index',
    'sitemapPolicy', 'excluded',
    'sitemapIncluded', false,
    'rollbackAvailable', true,
    'authorityConsumed', true,
    'rawReferenceExposed', false
  );
end;
$$;

create or replace function public.import_rollback_pharmacy_index_by_authority(
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
  v_authorization public.import_pharmacy_index_authorizations%rowtype;
  v_center public.centers%rowtype;
  v_public_authorization public.import_pharmacy_public_noindex_authorizations%rowtype;
  v_candidate public.import_entity_candidates%rowtype;
  v_queue public.import_publish_queue%rowtype;
  v_readback public.import_publish_queue%rowtype;
  v_snapshot_queue jsonb;
  v_readback_snapshot jsonb;
  v_candidate_hash text;
  v_public_terminal_hash text;
  v_terminal jsonb;
  v_terminal_hash text;
  v_rollback_event_count integer;
  v_now timestamptz := clock_timestamp();
begin
  if p_actor_profile_id is null or p_entity_id is null then
    raise exception 'pharmacy_index_rollback_identity_missing' using errcode = '22023';
  end if;
  if p_schema_version is distinct from 'drkhaleej.import.pharmacyIndexPromotion.v1' then
    raise exception 'pharmacy_index_rollback_schema_invalid' using errcode = '22023';
  end if;

  select *
  into v_authorization
  from public.import_pharmacy_index_authorizations
  where actor_profile_id = p_actor_profile_id
    and entity_id = p_entity_id
  order by issued_at desc
  limit 1
  for update;

  if not found or v_authorization.status not in ('promoted', 'rolled_back') then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_rollback_authority_not_available',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  if encode(
      extensions.digest(v_authorization.snapshot_payload::text, 'sha256'),
      'hex'
    ) <> v_authorization.snapshot_hash
    or jsonb_typeof(v_authorization.snapshot_payload -> 'queue') <> 'object' then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_rollback_snapshot_integrity_mismatch',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;
  v_snapshot_queue := v_authorization.snapshot_payload -> 'queue';

  select count(*)::integer
  into v_rollback_event_count
  from public.import_pharmacy_index_events
  where authorization_id = v_authorization.id
    and event_type = 'index_rolled_back';

  if v_authorization.status = 'rolled_back' then
    if v_rollback_event_count <> 1
      or v_authorization.terminal_result is null
      or v_authorization.terminal_result_hash is null
      or v_authorization.rolled_back_at is null then
      raise exception 'pharmacy_index_rollback_replay_state_invalid' using errcode = 'P0001';
    end if;
    v_terminal_hash := encode(
      extensions.digest(v_authorization.terminal_result::text, 'sha256'),
      'hex'
    );
    if v_terminal_hash <> v_authorization.terminal_result_hash then
      raise exception 'pharmacy_index_rollback_replay_hash_mismatch' using errcode = 'P0001';
    end if;

    select *
    into v_readback
    from public.import_publish_queue
    where id = (v_snapshot_queue ->> 'id')::uuid
    for update;

    if not found then
      return jsonb_build_object(
        'status', 'conflict',
        'reason', 'index_rollback_readback_mismatch',
        'authorityConsumed', false,
        'rawReferenceExposed', false
      );
    end if;
    v_readback_snapshot := jsonb_build_object(
      'queue', jsonb_build_object(
        'id', v_readback.id,
        'batchId', v_readback.batch_id,
        'rawRowId', v_readback.raw_row_id,
        'targetEntityType', v_readback.target_entity_type,
        'targetEntityId', v_readback.target_entity_id,
        'publishStatus', v_readback.publish_status,
        'indexPolicy', v_readback.index_policy,
        'sitemapPolicy', v_readback.sitemap_policy,
        'qualityScore', v_readback.quality_score,
        'adminNote', v_readback.admin_note,
        'metadata', v_readback.metadata
      )
    );
    if v_readback_snapshot <> v_authorization.snapshot_payload
      or encode(extensions.digest(v_readback_snapshot::text, 'sha256'), 'hex')
        <> v_authorization.snapshot_hash then
      return jsonb_build_object(
        'status', 'conflict',
        'reason', 'index_rollback_readback_mismatch',
        'authorityConsumed', false,
        'rawReferenceExposed', false
      );
    end if;

    return jsonb_build_object(
      'status', 'replayed',
      'visibility', 'public_noindex',
      'indexPolicy', 'noindex',
      'robotsPolicy', 'noindex',
      'sitemapPolicy', 'excluded',
      'sitemapIncluded', false,
      'exactLogicalRecovery', true,
      'authorityConsumed', true,
      'rawReferenceExposed', false
    );
  end if;

  if v_rollback_event_count <> 0 then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_rollback_event_state_invalid',
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
    or v_center.deleted_at is not null then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_rollback_private_boundary_invalid',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  select *
  into v_public_authorization
  from public.import_pharmacy_public_noindex_authorizations
  where id = v_authorization.public_noindex_authorization_id
  for update;

  if not found
    or v_public_authorization.status <> 'published'
    or v_public_authorization.entity_id <> p_entity_id
    or v_public_authorization.candidate_id <> v_authorization.candidate_id
    or v_public_authorization.published_queue_id <> v_authorization.queue_id
    or v_public_authorization.terminal_result is null
    or v_public_authorization.terminal_result_hash is null then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_rollback_public_authority_mismatch',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  v_public_terminal_hash := encode(
    extensions.digest(v_public_authorization.terminal_result::text, 'sha256'),
    'hex'
  );
  if v_public_terminal_hash <> v_authorization.public_terminal_hash
    or v_public_terminal_hash <> v_public_authorization.terminal_result_hash then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_rollback_public_authority_mismatch',
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
      'reason', 'index_rollback_candidate_state_invalid',
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
      'reason', 'index_rollback_candidate_hash_mismatch',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  select *
  into v_queue
  from public.import_publish_queue
  where id = v_authorization.queue_id
  for update;

  if not found
    or v_queue.target_entity_type <> 'pharmacy'
    or v_queue.target_entity_id <> p_entity_id
    or v_queue.publish_status <> 'index_eligible'
    or v_queue.index_policy <> 'index_eligible'
    or v_queue.sitemap_policy <> 'excluded'
    or v_queue.metadata ->> 'pharmacy_index_promotion_schema_version'
      <> p_schema_version
    or v_queue.metadata ->> 'pharmacy_index_authorization_id'
      <> v_authorization.id::text
    or v_queue.metadata ->> 'public_noindex_authorization_id'
      <> v_public_authorization.id::text
    or v_queue.metadata ->> 'import_entity_candidate_id'
      <> v_authorization.candidate_id::text
    or v_queue.metadata ->> 'canonical_path'
      <> v_authorization.canonical_path_en
    or v_queue.metadata #>> '{canonical_paths,en}'
      <> v_authorization.canonical_path_en
    or v_queue.metadata #>> '{canonical_paths,ar}'
      <> v_authorization.canonical_path_ar
    or v_queue.metadata ->> 'robots_policy' <> 'index'
    or v_queue.metadata -> 'index_promoted' <> 'true'::jsonb
    or v_queue.metadata -> 'sitemap_included' <> 'false'::jsonb then
    return jsonb_build_object(
      'status', 'conflict',
      'reason', 'index_promoted_queue_integrity_mismatch',
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  v_terminal := jsonb_build_object(
    'kind', 'pharmacy_index_rolled_back',
    'visibility', 'public_noindex',
    'indexPolicy', 'noindex',
    'robotsPolicy', 'noindex',
    'sitemapPolicy', 'excluded',
    'sitemapIncluded', false,
    'exactLogicalRecovery', true
  );
  v_terminal_hash := encode(extensions.digest(v_terminal::text, 'sha256'), 'hex');

  update public.import_pharmacy_index_authorizations
  set status = 'rolled_back',
      terminal_result = v_terminal,
      terminal_result_hash = v_terminal_hash,
      rolled_back_at = v_now
  where id = v_authorization.id;

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
    raise exception 'pharmacy_index_rollback_restore_write_missing' using errcode = 'P0001';
  end if;

  select *
  into v_readback
  from public.import_publish_queue
  where id = v_queue.id
  for update;

  v_readback_snapshot := jsonb_build_object(
    'queue', jsonb_build_object(
      'id', v_readback.id,
      'batchId', v_readback.batch_id,
      'rawRowId', v_readback.raw_row_id,
      'targetEntityType', v_readback.target_entity_type,
      'targetEntityId', v_readback.target_entity_id,
      'publishStatus', v_readback.publish_status,
      'indexPolicy', v_readback.index_policy,
      'sitemapPolicy', v_readback.sitemap_policy,
      'qualityScore', v_readback.quality_score,
      'adminNote', v_readback.admin_note,
      'metadata', v_readback.metadata
    )
  );
  if v_readback_snapshot <> v_authorization.snapshot_payload
    or encode(extensions.digest(v_readback_snapshot::text, 'sha256'), 'hex')
      <> v_authorization.snapshot_hash then
    raise exception 'pharmacy_index_rollback_exact_recovery_mismatch' using errcode = 'P0001';
  end if;

  insert into public.import_pharmacy_index_events (
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
    'index_rolled_back',
    'rolled_back',
    p_schema_version,
    jsonb_build_object(
      'terminalResultHash', v_terminal_hash,
      'snapshotHash', v_authorization.snapshot_hash,
      'exactLogicalRecovery', true,
      'sitemapIncluded', false
    )
  );

  return jsonb_build_object(
    'status', 'rolled_back',
    'visibility', 'public_noindex',
    'indexPolicy', 'noindex',
    'robotsPolicy', 'noindex',
    'sitemapPolicy', 'excluded',
    'sitemapIncluded', false,
    'exactLogicalRecovery', true,
    'authorityConsumed', true,
    'rawReferenceExposed', false
  );
end;
$$;

revoke all on table public.import_pharmacy_index_authorizations
  from public, anon, authenticated;
revoke all on table public.import_pharmacy_index_events
  from public, anon, authenticated;
grant select, insert, update on table public.import_pharmacy_index_authorizations
  to service_role;
grant select, insert on table public.import_pharmacy_index_events
  to service_role;

revoke all on function public.import_authorize_pharmacy_index_promotion(
  uuid, uuid, text, text, text, integer
) from public, anon, authenticated;
grant execute on function public.import_authorize_pharmacy_index_promotion(
  uuid, uuid, text, text, text, integer
) to service_role;

revoke all on function public.import_promote_pharmacy_index_by_authority(
  uuid, uuid, uuid, text, text
) from public, anon, authenticated;
grant execute on function public.import_promote_pharmacy_index_by_authority(
  uuid, uuid, uuid, text, text
) to service_role;

revoke all on function public.import_rollback_pharmacy_index_by_authority(
  uuid, uuid, text
) from public, anon, authenticated;
grant execute on function public.import_rollback_pharmacy_index_by_authority(
  uuid, uuid, text
) to service_role;

comment on table public.import_pharmacy_index_authorizations is
  'Protected single-entity Pharmacy Index authority with exact pre-index Queue snapshot and rollback readback.';
comment on table public.import_pharmacy_index_events is
  'Append-only events for independent Pharmacy Index authorization, promotion and rollback.';
comment on function public.import_authorize_pharmacy_index_promotion(
  uuid, uuid, text, text, text, integer
) is
  'Authorize one independently reversible Pharmacy Index promotion from exact P11 public/noindex state.';
comment on function public.import_promote_pharmacy_index_by_authority(
  uuid, uuid, uuid, text, text
) is
  'Promote one authorized Pharmacy to Index eligibility while keeping Sitemap excluded.';
comment on function public.import_rollback_pharmacy_index_by_authority(
  uuid, uuid, text
) is
  'Rollback one Pharmacy Index promotion to its exact P11 public/noindex Queue state.';
