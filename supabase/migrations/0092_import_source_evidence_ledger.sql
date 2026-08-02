-- P17 SOURCE-EVIDENCE-LEDGER
-- Private, bounded Observation/Evidence persistence with audited access and deletion.
-- Raw bodies remain in private object storage; no Agent/Worker, entity write or publish authority is opened.

create table if not exists public.import_source_observations (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid not null references public.profiles(id) on delete restrict,
  schema_version text not null,
  idempotency_key text not null unique,
  request_hash text not null,
  source_type text not null,
  source_identity text not null,
  policy_status text not null,
  storage_reference text null,
  content_hash text null,
  selected_hash text null,
  observed_at timestamptz not null,
  parser_version text not null,
  retention_class text not null,
  retain_until timestamptz not null,
  retention_reason text null,
  lifecycle_status text not null default 'active',
  deletion_receipt_hash text null,
  deleted_at timestamptz null,
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  constraint import_source_observations_schema_check
    check (schema_version = 'drkhaleej.import.sourceEvidenceLedger.v1'),
  constraint import_source_observations_idempotency_check
    check (char_length(btrim(idempotency_key)) between 8 and 240),
  constraint import_source_observations_request_hash_check
    check (request_hash ~ '^[a-f0-9]{64}$'),
  constraint import_source_observations_source_type_check
    check (source_type in ('manual', 'csv', 'excel', 'api', 'ai_assisted')),
  constraint import_source_observations_source_identity_check
    check (char_length(btrim(source_identity)) between 1 and 160),
  constraint import_source_observations_policy_check
    check (policy_status in ('accepted', 'denied', 'needs_review')),
  constraint import_source_observations_storage_reference_check
    check (storage_reference is null or char_length(btrim(storage_reference)) between 1 and 500),
  constraint import_source_observations_content_hash_check
    check (content_hash is null or content_hash ~ '^[a-f0-9]{64}$'),
  constraint import_source_observations_selected_hash_check
    check (selected_hash is null or selected_hash ~ '^[a-f0-9]{64}$'),
  constraint import_source_observations_parser_version_check
    check (char_length(btrim(parser_version)) between 1 and 80),
  constraint import_source_observations_retention_class_check
    check (retention_class in ('standard', 'dispute')),
  constraint import_source_observations_retention_reason_check
    check (retention_reason is null or char_length(btrim(retention_reason)) between 1 and 500),
  constraint import_source_observations_retention_window_check check (
    retain_until > observed_at
    and (
      (retention_class = 'standard' and retain_until <= observed_at + interval '30 days')
      or (
        retention_class = 'dispute'
        and retention_reason is not null
        and retain_until <= observed_at + interval '90 days'
      )
    )
  ),
  constraint import_source_observations_lifecycle_check
    check (lifecycle_status in ('active', 'deleted')),
  constraint import_source_observations_deletion_receipt_check
    check (deletion_receipt_hash is null or deletion_receipt_hash ~ '^[a-f0-9]{64}$'),
  constraint import_source_observations_policy_storage_check check (
    (
      policy_status = 'accepted'
      and lifecycle_status = 'active'
      and storage_reference is not null
      and content_hash is not null
      and selected_hash is not null
      and deleted_at is null
      and deletion_receipt_hash is null
    )
    or (
      policy_status = 'accepted'
      and lifecycle_status = 'deleted'
      and storage_reference is null
      and content_hash is not null
      and selected_hash is not null
      and deleted_at is not null
      and deletion_receipt_hash is not null
    )
    or (
      policy_status in ('denied', 'needs_review')
      and storage_reference is null
      and content_hash is null
      and selected_hash is null
      and lifecycle_status = 'active'
      and deleted_at is null
      and deletion_receipt_hash is null
    )
  )
);

create table if not exists public.import_source_evidence (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null
    references public.import_source_observations(id) on delete restrict,
  reference_id text not null,
  field_paths text[] not null,
  excerpt text not null,
  excerpt_hash text not null,
  created_at timestamptz not null default clock_timestamp(),
  constraint import_source_evidence_reference_check
    check (char_length(btrim(reference_id)) between 1 and 128),
  constraint import_source_evidence_field_paths_check
    check (cardinality(field_paths) between 1 and 32),
  constraint import_source_evidence_excerpt_check
    check (char_length(btrim(excerpt)) between 1 and 1000),
  constraint import_source_evidence_excerpt_hash_check
    check (excerpt_hash ~ '^[a-f0-9]{64}$'),
  constraint import_source_evidence_observation_reference_unique
    unique (observation_id, reference_id)
);

create table if not exists public.import_source_evidence_events (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null
    references public.import_source_observations(id) on delete restrict,
  actor_profile_id uuid not null references public.profiles(id) on delete restrict,
  event_idempotency_key text not null unique,
  event_type text not null,
  reason text null,
  receipt_hash text null,
  event_result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default clock_timestamp(),
  constraint import_source_evidence_events_idempotency_check
    check (char_length(btrim(event_idempotency_key)) between 8 and 240),
  constraint import_source_evidence_events_type_check
    check (event_type in ('registered', 'accessed', 'access_denied', 'deleted')),
  constraint import_source_evidence_events_reason_check
    check (reason is null or char_length(btrim(reason)) between 1 and 500),
  constraint import_source_evidence_events_receipt_hash_check
    check (receipt_hash is null or receipt_hash ~ '^[a-f0-9]{64}$'),
  constraint import_source_evidence_events_result_check
    check (jsonb_typeof(event_result) = 'object'),
  constraint import_source_evidence_events_delete_shape_check check (
    (event_type = 'deleted' and reason is not null and receipt_hash is not null)
    or (event_type <> 'deleted' and receipt_hash is null)
  )
);

create index if not exists import_source_observations_retention_idx
  on public.import_source_observations (lifecycle_status, retain_until);
create index if not exists import_source_observations_source_idx
  on public.import_source_observations (source_type, source_identity, observed_at desc);
create index if not exists import_source_evidence_observation_idx
  on public.import_source_evidence (observation_id, created_at asc);
create index if not exists import_source_evidence_events_observation_idx
  on public.import_source_evidence_events (observation_id, created_at asc);

alter table public.import_source_observations enable row level security;
alter table public.import_source_evidence enable row level security;
alter table public.import_source_evidence_events enable row level security;

create or replace function public.import_source_evidence_forbid_mutation()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  raise exception 'source_evidence_append_only' using errcode = '55000';
end;
$$;

create or replace function public.import_source_observation_protect_immutable()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  if (to_jsonb(new) - array['storage_reference', 'lifecycle_status', 'deletion_receipt_hash', 'deleted_at', 'updated_at'])
    is distinct from
    (to_jsonb(old) - array['storage_reference', 'lifecycle_status', 'deletion_receipt_hash', 'deleted_at', 'updated_at']) then
    raise exception 'source_observation_immutable_fields_changed' using errcode = '55000';
  end if;
  if old.lifecycle_status = 'deleted' then
    raise exception 'source_observation_terminal' using errcode = '55000';
  end if;
  return new;
end;
$$;

create trigger trg_import_source_evidence_append_only
  before update or delete on public.import_source_evidence
  for each row execute function public.import_source_evidence_forbid_mutation();
create trigger trg_import_source_evidence_events_append_only
  before update or delete on public.import_source_evidence_events
  for each row execute function public.import_source_evidence_forbid_mutation();
create trigger trg_import_source_observation_protect_immutable
  before update or delete on public.import_source_observations
  for each row execute function public.import_source_observation_protect_immutable();

create or replace function public.import_register_source_evidence(
  p_actor_profile_id uuid,
  p_idempotency_key text,
  p_request_hash text,
  p_schema_version text,
  p_source_type text,
  p_source_identity text,
  p_policy_status text,
  p_storage_reference text,
  p_content_hash text,
  p_selected_hash text,
  p_observed_at timestamptz,
  p_parser_version text,
  p_retention_class text,
  p_retain_until timestamptz,
  p_retention_reason text,
  p_evidence jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_existing public.import_source_observations%rowtype;
  v_observation_id uuid;
  v_item jsonb;
  v_field_path jsonb;
  v_reference_ids text[] := array[]::text[];
  v_reference_id text;
  v_field_paths text[];
  v_result jsonb;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(coalesce(p_idempotency_key, ''), 0)
  );
  select * into v_existing
  from public.import_source_observations
  where idempotency_key = p_idempotency_key
  for update;
  if found then
    if v_existing.actor_profile_id is distinct from p_actor_profile_id
      or v_existing.request_hash is distinct from p_request_hash then
      return jsonb_build_object('status', 'conflict', 'reason', 'observation_idempotency_mismatch', 'rawReferenceExposed', false);
    end if;
    return jsonb_build_object('status', 'replayed', 'observationId', v_existing.id, 'policyStatus', v_existing.policy_status, 'lifecycleStatus', v_existing.lifecycle_status, 'rawReferenceExposed', false);
  end if;

  if not exists (
    select 1 from public.profiles
    where id = p_actor_profile_id and is_platform_admin
  ) then
    return jsonb_build_object('status', 'conflict', 'reason', 'source_evidence_actor_not_authorized', 'rawReferenceExposed', false);
  end if;
  if p_schema_version is distinct from 'drkhaleej.import.sourceEvidenceLedger.v1'
    or char_length(btrim(coalesce(p_idempotency_key, ''))) not between 8 and 240
    or coalesce(p_request_hash, '') !~ '^[a-f0-9]{64}$'
    or p_source_type not in ('manual', 'csv', 'excel', 'api', 'ai_assisted')
    or char_length(btrim(coalesce(p_source_identity, ''))) not between 1 and 160
    or p_policy_status not in ('accepted', 'denied', 'needs_review')
    or char_length(btrim(coalesce(p_parser_version, ''))) not between 1 and 80
    or p_observed_at is null or p_retain_until is null then
    return jsonb_build_object('status', 'rejected', 'reason', 'source_observation_contract_invalid', 'rawReferenceExposed', false);
  end if;
  if p_retention_class = 'standard' then
    if p_retain_until <= p_observed_at or p_retain_until > p_observed_at + interval '30 days' then
      return jsonb_build_object('status', 'rejected', 'reason', 'source_observation_retention_invalid', 'rawReferenceExposed', false);
    end if;
  elsif p_retention_class = 'dispute' then
    if char_length(btrim(coalesce(p_retention_reason, ''))) not between 1 and 500
      or p_retain_until <= p_observed_at or p_retain_until > p_observed_at + interval '90 days' then
      return jsonb_build_object('status', 'rejected', 'reason', 'source_observation_retention_invalid', 'rawReferenceExposed', false);
    end if;
  else
    return jsonb_build_object('status', 'rejected', 'reason', 'source_observation_retention_invalid', 'rawReferenceExposed', false);
  end if;
  if jsonb_typeof(coalesce(p_evidence, '[]'::jsonb)) <> 'array' then
    return jsonb_build_object('status', 'rejected', 'reason', 'source_evidence_invalid', 'rawReferenceExposed', false);
  end if;

  if p_policy_status = 'accepted' then
    if char_length(btrim(coalesce(p_storage_reference, ''))) not between 1 and 500
      or coalesce(p_content_hash, '') !~ '^[a-f0-9]{64}$'
      or coalesce(p_selected_hash, '') !~ '^[a-f0-9]{64}$'
      or jsonb_array_length(p_evidence) not between 1 and 32 then
      return jsonb_build_object('status', 'rejected', 'reason', 'accepted_observation_evidence_required', 'rawReferenceExposed', false);
    end if;
  elsif p_storage_reference is not null or p_content_hash is not null or p_selected_hash is not null
    or jsonb_array_length(p_evidence) <> 0 then
    return jsonb_build_object('status', 'rejected', 'reason', 'nonaccepted_observation_storage_forbidden', 'rawReferenceExposed', false);
  end if;

  insert into public.import_source_observations (
    actor_profile_id, schema_version, idempotency_key, request_hash, source_type,
    source_identity, policy_status, storage_reference, content_hash, selected_hash,
    observed_at, parser_version, retention_class, retain_until, retention_reason
  ) values (
    p_actor_profile_id, p_schema_version, btrim(p_idempotency_key), p_request_hash,
    p_source_type, btrim(p_source_identity), p_policy_status,
    case when p_policy_status = 'accepted' then btrim(p_storage_reference) else null end,
    case when p_policy_status = 'accepted' then p_content_hash else null end,
    case when p_policy_status = 'accepted' then p_selected_hash else null end,
    p_observed_at, btrim(p_parser_version), p_retention_class, p_retain_until,
    nullif(btrim(coalesce(p_retention_reason, '')), '')
  ) returning id into v_observation_id;

  if p_policy_status = 'accepted' then
    for v_item in select value from jsonb_array_elements(p_evidence) loop
      if jsonb_typeof(v_item) <> 'object'
        or (select count(*) from jsonb_object_keys(v_item)) <> 4
        or not (v_item ?& array['referenceId', 'fieldPaths', 'excerpt', 'excerptHash'])
        or char_length(btrim(coalesce(v_item->>'referenceId', ''))) not between 1 and 128
        or jsonb_typeof(v_item->'fieldPaths') <> 'array'
        or jsonb_array_length(v_item->'fieldPaths') not between 1 and 32
        or char_length(btrim(coalesce(v_item->>'excerpt', ''))) not between 1 and 1000
        or coalesce(v_item->>'excerptHash', '') !~ '^[a-f0-9]{64}$' then
        raise exception 'source_evidence_item_invalid' using errcode = '22023';
      end if;
      v_reference_id := btrim(v_item->>'referenceId');
      if v_reference_id = any(v_reference_ids) then
        raise exception 'source_evidence_reference_duplicate' using errcode = '23505';
      end if;
      v_reference_ids := array_append(v_reference_ids, v_reference_id);
      v_field_paths := array[]::text[];
      for v_field_path in select value from jsonb_array_elements(v_item->'fieldPaths') loop
        if jsonb_typeof(v_field_path) <> 'string'
          or char_length(btrim(v_field_path #>> '{}')) not between 1 and 160 then
          raise exception 'source_evidence_field_path_invalid' using errcode = '22023';
        end if;
        v_field_paths := array_append(v_field_paths, btrim(v_field_path #>> '{}'));
      end loop;
      insert into public.import_source_evidence (
        observation_id, reference_id, field_paths, excerpt, excerpt_hash
      ) values (
        v_observation_id, v_reference_id, v_field_paths,
        btrim(v_item->>'excerpt'), v_item->>'excerptHash'
      );
    end loop;
  end if;

  v_result := jsonb_build_object(
    'status', 'created', 'observationId', v_observation_id,
    'policyStatus', p_policy_status, 'evidenceReferenceIds', to_jsonb(v_reference_ids),
    'rawReferenceExposed', false, 'directEntityWriteAllowed', false, 'publishAllowed', false
  );
  insert into public.import_source_evidence_events (
    observation_id, actor_profile_id, event_idempotency_key, event_type, event_result
  ) values (
    v_observation_id, p_actor_profile_id, btrim(p_idempotency_key), 'registered', v_result
  );
  return v_result;
end;
$$;

create or replace function public.import_read_source_evidence(
  p_actor_profile_id uuid,
  p_observation_id uuid,
  p_event_idempotency_key text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_existing public.import_source_evidence_events%rowtype;
  v_observation public.import_source_observations%rowtype;
  v_result jsonb;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(coalesce(p_event_idempotency_key, ''), 0)
  );
  select * into v_existing
  from public.import_source_evidence_events
  where event_idempotency_key = p_event_idempotency_key
  for update;
  if found then
    if v_existing.actor_profile_id is distinct from p_actor_profile_id
      or v_existing.observation_id is distinct from p_observation_id then
      return jsonb_build_object('status', 'conflict', 'reason', 'source_evidence_event_idempotency_mismatch', 'rawReferenceExposed', false);
    end if;
    return v_existing.event_result || jsonb_build_object('status', 'replayed');
  end if;
  if not exists (select 1 from public.profiles where id = p_actor_profile_id and is_platform_admin)
    or char_length(btrim(coalesce(p_event_idempotency_key, ''))) not between 8 and 240
    or char_length(btrim(coalesce(p_reason, ''))) not between 1 and 500 then
    return jsonb_build_object('status', 'conflict', 'reason', 'source_evidence_access_not_authorized', 'rawReferenceExposed', false);
  end if;
  select * into v_observation
  from public.import_source_observations
  where id = p_observation_id
  for update;
  if not found then
    return jsonb_build_object('status', 'not_found', 'rawReferenceExposed', false);
  end if;
  if v_observation.lifecycle_status = 'deleted' then
    v_result := jsonb_build_object('status', 'denied', 'reason', 'source_observation_deleted', 'observationId', p_observation_id, 'rawReferenceExposed', false);
    insert into public.import_source_evidence_events (
      observation_id, actor_profile_id, event_idempotency_key, event_type, reason, event_result
    ) values (p_observation_id, p_actor_profile_id, btrim(p_event_idempotency_key), 'access_denied', btrim(p_reason), v_result);
    return v_result;
  end if;
  select jsonb_build_object(
    'status', 'read', 'observationId', v_observation.id,
    'source', v_observation.source_type, 'sourceIdentity', v_observation.source_identity,
    'policyStatus', v_observation.policy_status, 'observedAt', v_observation.observed_at,
    'parserVersion', v_observation.parser_version, 'retainUntil', v_observation.retain_until,
    'evidence', coalesce((
      select jsonb_agg(jsonb_build_object(
        'referenceId', evidence.reference_id,
        'fieldPaths', to_jsonb(evidence.field_paths),
        'excerpt', evidence.excerpt,
        'excerptHash', evidence.excerpt_hash
      ) order by evidence.created_at, evidence.id)
      from public.import_source_evidence evidence
      where evidence.observation_id = v_observation.id
    ), '[]'::jsonb),
    'rawReferenceExposed', false, 'directEntityWriteAllowed', false, 'publishAllowed', false
  ) into v_result;
  insert into public.import_source_evidence_events (
    observation_id, actor_profile_id, event_idempotency_key, event_type, reason, event_result
  ) values (p_observation_id, p_actor_profile_id, btrim(p_event_idempotency_key), 'accessed', btrim(p_reason), v_result);
  return v_result;
end;
$$;

create or replace function public.import_record_source_observation_deletion(
  p_actor_profile_id uuid,
  p_observation_id uuid,
  p_event_idempotency_key text,
  p_reason text,
  p_deletion_receipt_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_existing public.import_source_evidence_events%rowtype;
  v_observation public.import_source_observations%rowtype;
  v_result jsonb;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(coalesce(p_event_idempotency_key, ''), 0)
  );
  select * into v_existing
  from public.import_source_evidence_events
  where event_idempotency_key = p_event_idempotency_key
  for update;
  if found then
    if v_existing.actor_profile_id is distinct from p_actor_profile_id
      or v_existing.observation_id is distinct from p_observation_id
      or v_existing.receipt_hash is distinct from p_deletion_receipt_hash then
      return jsonb_build_object('status', 'conflict', 'reason', 'source_evidence_event_idempotency_mismatch', 'rawReferenceExposed', false);
    end if;
    return v_existing.event_result || jsonb_build_object('status', 'replayed');
  end if;
  if not exists (select 1 from public.profiles where id = p_actor_profile_id and is_platform_admin)
    or char_length(btrim(coalesce(p_event_idempotency_key, ''))) not between 8 and 240
    or char_length(btrim(coalesce(p_reason, ''))) not between 1 and 500
    or coalesce(p_deletion_receipt_hash, '') !~ '^[a-f0-9]{64}$' then
    return jsonb_build_object('status', 'conflict', 'reason', 'source_evidence_deletion_not_authorized', 'rawReferenceExposed', false);
  end if;
  select * into v_observation
  from public.import_source_observations
  where id = p_observation_id
  for update;
  if not found then return jsonb_build_object('status', 'not_found', 'rawReferenceExposed', false); end if;
  if v_observation.policy_status <> 'accepted' then
    return jsonb_build_object('status', 'conflict', 'reason', 'source_observation_has_no_raw_storage', 'rawReferenceExposed', false);
  end if;
  if v_observation.lifecycle_status = 'deleted' then
    return jsonb_build_object('status', 'conflict', 'reason', 'source_observation_already_deleted', 'rawReferenceExposed', false);
  end if;
  update public.import_source_observations
  set storage_reference = null,
      lifecycle_status = 'deleted',
      deletion_receipt_hash = p_deletion_receipt_hash,
      deleted_at = clock_timestamp(),
      updated_at = clock_timestamp()
  where id = p_observation_id;
  v_result := jsonb_build_object('status', 'deleted', 'observationId', p_observation_id, 'rawReferenceExposed', false, 'publishAllowed', false);
  insert into public.import_source_evidence_events (
    observation_id, actor_profile_id, event_idempotency_key, event_type, reason, receipt_hash, event_result
  ) values (
    p_observation_id, p_actor_profile_id, btrim(p_event_idempotency_key), 'deleted', btrim(p_reason), p_deletion_receipt_hash, v_result
  );
  return v_result;
end;
$$;

revoke all on table public.import_source_observations from public, anon, authenticated, service_role;
revoke all on table public.import_source_evidence from public, anon, authenticated, service_role;
revoke all on table public.import_source_evidence_events from public, anon, authenticated, service_role;
revoke all on function public.import_source_evidence_forbid_mutation() from public, anon, authenticated, service_role;
revoke all on function public.import_source_observation_protect_immutable() from public, anon, authenticated, service_role;
revoke all on function public.import_register_source_evidence(uuid,text,text,text,text,text,text,text,text,text,timestamptz,text,text,timestamptz,text,jsonb) from public, anon, authenticated;
revoke all on function public.import_read_source_evidence(uuid,uuid,text,text) from public, anon, authenticated;
revoke all on function public.import_record_source_observation_deletion(uuid,uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.import_register_source_evidence(uuid,text,text,text,text,text,text,text,text,text,timestamptz,text,text,timestamptz,text,jsonb) to service_role;
grant execute on function public.import_read_source_evidence(uuid,uuid,text,text) to service_role;
grant execute on function public.import_record_source_observation_deletion(uuid,uuid,text,text,text) to service_role;

comment on table public.import_source_observations is
  'P17 private source observation ledger. Raw bodies remain in private object storage; denied and needs-review observations retain metadata only.';
comment on table public.import_source_evidence is
  'P17 bounded evidence excerpts and P16-compatible references. Append-only and private.';
comment on table public.import_source_evidence_events is
  'P17 append-only registration, access and deletion audit ledger.';
