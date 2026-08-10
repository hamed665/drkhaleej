-- ENTITY-RESOLUTION-GATE
-- Additive, immutable Human Review decisions bound to one immutable Entity Candidate snapshot.
-- This gate never mutates Candidate/duplicate/geo/canonical/publish state and never stores a raw reviewer session id.

create table if not exists public.import_entity_review_decisions (
  id uuid primary key,
  entity_candidate_id uuid not null
    references public.import_entity_candidates(id) on delete restrict,
  resolution_schema_version text not null,
  contract_schema_version text not null,
  contract_policy_version text not null,
  draft_version integer not null,
  draft_hash text not null,
  decision text not null,
  reviewer_profile_id uuid not null references public.profiles(id) on delete restrict,
  reviewer_role text not null,
  reviewer_session_hash text not null,
  reason text not null,
  evidence_ids uuid[] not null default '{}'::uuid[],
  duplicate_candidate_id uuid null
    references public.import_duplicate_candidates(id) on delete restrict,
  duplicate_entity_id uuid null,
  field_edits jsonb not null default '[]'::jsonb,
  contract_decided_at timestamptz not null,
  decided_at timestamptz not null default clock_timestamp(),
  idempotency_key text not null,
  request_hash text not null,
  decision_payload_hash text not null,
  constraint import_entity_review_decisions_candidate_unique unique (entity_candidate_id),
  constraint import_entity_review_decisions_idempotency_unique unique (idempotency_key),
  constraint import_entity_review_decisions_schema_check check (
    resolution_schema_version = 'drkhaleej.import.entityResolutionGate.v1'
    and contract_schema_version = '1.2.2'
  ),
  constraint import_entity_review_decisions_policy_check
    check (char_length(btrim(contract_policy_version)) between 1 and 80),
  constraint import_entity_review_decisions_draft_check check (
    draft_version >= 1 and draft_hash ~ '^[a-f0-9]{64}$'
  ),
  constraint import_entity_review_decisions_decision_check check (decision in (
    'approve_for_exact_review','edit','reject','request_refetch',
    'confirmed_duplicate','not_duplicate','defer'
  )),
  constraint import_entity_review_decisions_reviewer_check check (
    reviewer_role = 'platform_admin' and reviewer_session_hash ~ '^[a-f0-9]{64}$'
  ),
  constraint import_entity_review_decisions_reason_check
    check (char_length(btrim(reason)) between 1 and 2000),
  constraint import_entity_review_decisions_evidence_check
    check (cardinality(evidence_ids) between 0 and 200),
  constraint import_entity_review_decisions_field_edits_check check (
    jsonb_typeof(field_edits) = 'array' and jsonb_array_length(field_edits) <= 200
  ),
  constraint import_entity_review_decisions_idempotency_check
    check (char_length(btrim(idempotency_key)) between 8 and 240),
  constraint import_entity_review_decisions_hashes_check check (
    request_hash ~ '^[a-f0-9]{64}$' and decision_payload_hash ~ '^[a-f0-9]{64}$'
  ),
  constraint import_entity_review_decisions_conditional_check check (
    (
      decision = 'confirmed_duplicate'
      and duplicate_candidate_id is not null
      and duplicate_entity_id is not null
      and cardinality(evidence_ids) >= 1
      and jsonb_array_length(field_edits) = 0
    )
    or (
      decision = 'not_duplicate'
      and duplicate_candidate_id is not null
      and duplicate_entity_id is not null
      and jsonb_array_length(field_edits) = 0
    )
    or (
      decision = 'edit'
      and duplicate_candidate_id is null
      and duplicate_entity_id is null
      and jsonb_array_length(field_edits) between 1 and 200
    )
    or (
      decision not in ('confirmed_duplicate','not_duplicate','edit')
      and duplicate_candidate_id is null
      and duplicate_entity_id is null
      and jsonb_array_length(field_edits) = 0
      and (decision <> 'approve_for_exact_review' or cardinality(evidence_ids) >= 1)
    )
  )
);

create index if not exists import_entity_review_decisions_reviewer_time_idx
  on public.import_entity_review_decisions (reviewer_profile_id, decided_at desc);

alter table public.import_entity_review_decisions enable row level security;
revoke all on table public.import_entity_review_decisions from public, anon, authenticated, service_role;

create or replace function public.import_entity_review_decision_guard()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'INSERT' then
    if current_user not in ('postgres', 'supabase_admin') then
      raise exception 'entity_review_decision_rpc_required' using errcode = '42501';
    end if;
    return new;
  end if;
  raise exception 'entity_review_decision_immutable' using errcode = '55000';
end;
$$;

create trigger trg_import_entity_review_decisions_guard
  before insert or update or delete on public.import_entity_review_decisions
  for each row execute function public.import_entity_review_decision_guard();

create or replace function public.import_entity_review_decision_readback(
  p_decision_id uuid
)
returns jsonb
language sql
security definer
set search_path = pg_catalog, public
stable
as $$
  select jsonb_build_object(
    'decisionId', d.id,
    'candidateId', d.entity_candidate_id,
    'draftVersion', d.draft_version,
    'draftHash', d.draft_hash,
    'decision', d.decision,
    'reviewerProfileId', d.reviewer_profile_id,
    'evidenceCount', cardinality(d.evidence_ids),
    'evidenceSetHash', encode(extensions.digest(to_jsonb(d.evidence_ids)::text, 'sha256'), 'hex'),
    'fieldEditCount', jsonb_array_length(d.field_edits),
    'contractDecidedAt', d.contract_decided_at,
    'decidedAt', d.decided_at,
    'decisionRecordingAllowed', true,
    'exactReviewApprovalRecorded', d.decision = 'approve_for_exact_review',
    'duplicateResolutionRecorded', d.decision in ('confirmed_duplicate','not_duplicate'),
    'candidateMutationAllowed', false,
    'duplicateMergeAllowed', false,
    'geoVerificationAllowed', false,
    'directEntityWriteAllowed', false,
    'publishAllowed', false,
    'receiptHash', encode(extensions.digest(jsonb_build_object(
      'decisionId', d.id,
      'candidateId', d.entity_candidate_id,
      'draftVersion', d.draft_version,
      'draftHash', d.draft_hash,
      'decision', d.decision,
      'reviewerProfileId', d.reviewer_profile_id,
      'reviewerSessionHash', d.reviewer_session_hash,
      'evidenceIds', d.evidence_ids,
      'duplicateCandidateId', d.duplicate_candidate_id,
      'duplicateEntityId', d.duplicate_entity_id,
      'fieldEdits', d.field_edits,
      'contractDecidedAt', d.contract_decided_at,
      'decisionPayloadHash', d.decision_payload_hash
    )::text, 'sha256'), 'hex')
  )
  from public.import_entity_review_decisions d
  where d.id = p_decision_id;
$$;

create or replace function public.import_record_entity_review_decision(
  p_actor_profile_id uuid,
  p_candidate_id uuid,
  p_idempotency_key text,
  p_request_hash text,
  p_decision jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_existing public.import_entity_review_decisions%rowtype;
  v_candidate public.import_entity_candidates%rowtype;
  v_duplicate public.import_duplicate_candidates%rowtype;
  v_decision_id uuid;
  v_decision text;
  v_decided_at timestamptz;
  v_payload_hash text;
  v_session_hash text;
  v_evidence_ids uuid[] := '{}'::uuid[];
  v_duplicate_count integer;
  v_field_edit jsonb;
  v_candidate_field jsonb;
  v_expected_hash text;
  v_readback jsonb;
  v_allowed_keys text[] := array[
    'schema_version','policy_version','decision_id','draft_id','draft_version','draft_hash',
    'decision','reviewer','reason','evidence_ids','decided_at','duplicate_entity_id','field_edits'
  ];
  v_required_keys text[] := array[
    'schema_version','policy_version','decision_id','draft_id','draft_version','draft_hash',
    'decision','reviewer','reason','evidence_ids','decided_at'
  ];
begin
  if p_actor_profile_id is null or p_candidate_id is null
    or char_length(btrim(coalesce(p_idempotency_key, ''))) not between 8 and 240
    or coalesce(p_request_hash, '') !~ '^[a-f0-9]{64}$'
    or jsonb_typeof(coalesce(p_decision, 'null'::jsonb)) <> 'object' then
    return jsonb_build_object('status', 'rejected', 'reason', 'review_decision_identity_invalid');
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(btrim(p_idempotency_key), 0));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_candidate_id::text, 1));
  v_payload_hash := encode(extensions.digest(p_decision::text, 'sha256'), 'hex');

  select * into v_existing
  from public.import_entity_review_decisions
  where idempotency_key = btrim(p_idempotency_key)
  for update;
  if found then
    if v_existing.reviewer_profile_id is distinct from p_actor_profile_id
      or v_existing.entity_candidate_id is distinct from p_candidate_id
      or v_existing.request_hash is distinct from p_request_hash
      or v_existing.decision_payload_hash is distinct from v_payload_hash then
      return jsonb_build_object('status', 'conflict', 'reason', 'review_decision_idempotency_mismatch');
    end if;
    v_readback := public.import_entity_review_decision_readback(v_existing.id);
    if v_readback is null or coalesce(v_readback->>'receiptHash', '') !~ '^[a-f0-9]{64}$' then
      return jsonb_build_object('status', 'conflict', 'reason', 'review_decision_readback_integrity_mismatch');
    end if;
    return v_readback || jsonb_build_object('status', 'replayed');
  end if;

  select * into v_existing
  from public.import_entity_review_decisions
  where entity_candidate_id = p_candidate_id
  for update;
  if found then
    return jsonb_build_object('status', 'conflict', 'reason', 'candidate_review_decision_already_recorded');
  end if;

  if not exists (
    select 1 from public.profiles where id = p_actor_profile_id and is_platform_admin
  ) then
    return jsonb_build_object('status', 'conflict', 'reason', 'reviewer_actor_not_authorized');
  end if;

  select * into v_candidate
  from public.import_entity_candidates
  where id = p_candidate_id
    and pipeline_schema_version = 'drkhaleej.import.entityCandidatePipeline.v1'
  for update;
  if not found then
    return jsonb_build_object('status', 'rejected', 'reason', 'review_candidate_not_found');
  end if;
  if v_candidate.candidate_status <> 'needs_review' then
    return jsonb_build_object('status', 'rejected', 'reason', 'review_candidate_not_reviewable');
  end if;

  if not (p_decision ?& v_required_keys)
    or exists (select 1 from jsonb_object_keys(p_decision) key where key <> all(v_allowed_keys))
    or p_decision->>'schema_version' <> '1.2.2'
    or char_length(btrim(coalesce(p_decision->>'policy_version', ''))) not between 1 and 80
    or coalesce(p_decision->>'decision_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    or coalesce(p_decision->>'draft_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    or coalesce(p_decision->>'draft_version', '') !~ '^[1-9][0-9]*$'
    or coalesce(p_decision->>'draft_hash', '') !~ '^[a-f0-9]{64}$'
    or p_decision->>'decision' not in (
      'approve_for_exact_review','edit','reject','request_refetch',
      'confirmed_duplicate','not_duplicate','defer'
    )
    or char_length(btrim(coalesce(p_decision->>'reason', ''))) not between 1 and 2000
    or jsonb_typeof(p_decision->'evidence_ids') <> 'array'
    or jsonb_array_length(p_decision->'evidence_ids') > 200
    or jsonb_typeof(p_decision->'reviewer') <> 'object'
    or (select count(*) from jsonb_object_keys(p_decision->'reviewer')) <> 3
    or not (p_decision->'reviewer' ?& array['reviewer_id','role','session_id'])
    or coalesce(p_decision#>>'{reviewer,reviewer_id}', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    or char_length(coalesce(p_decision#>>'{reviewer,session_id}', '')) not between 16 and 240 then
    return jsonb_build_object('status', 'rejected', 'reason', 'review_decision_contract_invalid');
  end if;

  if p_decision#>>'{reviewer,role}' <> 'platform_admin' then
    return jsonb_build_object('status', 'rejected', 'reason', 'reviewer_role_not_enabled');
  end if;
  if (p_decision#>>'{reviewer,reviewer_id}')::uuid is distinct from p_actor_profile_id then
    return jsonb_build_object('status', 'rejected', 'reason', 'reviewer_actor_mismatch');
  end if;
  if (p_decision->>'draft_id')::uuid is distinct from p_candidate_id
    or (p_decision->>'draft_version')::integer is distinct from v_candidate.draft_version
    or p_decision->>'draft_hash' is distinct from v_candidate.draft_hash
    or p_decision->>'policy_version' is distinct from v_candidate.contract_policy_version then
    return jsonb_build_object('status', 'rejected', 'reason', 'review_draft_binding_mismatch');
  end if;

  if exists (
    select 1 from jsonb_array_elements(p_decision->'evidence_ids') item
    where jsonb_typeof(item) <> 'string'
      or coalesce(item #>> '{}', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  ) then
    return jsonb_build_object('status', 'rejected', 'reason', 'review_evidence_invalid');
  end if;
  select coalesce(array_agg((item #>> '{}')::uuid order by ordinality), '{}'::uuid[])
    into v_evidence_ids
  from jsonb_array_elements(p_decision->'evidence_ids') with ordinality evidence(item, ordinality);
  if cardinality(v_evidence_ids) <> (
      select count(distinct evidence_id) from unnest(v_evidence_ids) evidence_id
    )
    or exists (
      select 1 from unnest(v_evidence_ids) evidence_id
      left join public.import_source_evidence e on e.id = evidence_id
      where e.id is null
        or e.observation_id is distinct from v_candidate.source_observation_id
        or not (e.reference_id = any(v_candidate.source_evidence_reference_ids))
    ) then
    return jsonb_build_object('status', 'rejected', 'reason', 'review_evidence_unbound');
  end if;

  begin
    v_decision_id := (p_decision->>'decision_id')::uuid;
    v_decided_at := (p_decision->>'decided_at')::timestamptz;
  exception when others then
    return jsonb_build_object('status', 'rejected', 'reason', 'review_decision_time_invalid');
  end;
  if v_decided_at < (v_candidate.candidate_payload->>'created_at')::timestamptz
    or v_decided_at > clock_timestamp() + interval '5 minutes' then
    return jsonb_build_object('status', 'rejected', 'reason', 'review_decision_time_invalid');
  end if;
  if exists (select 1 from public.import_entity_review_decisions where id = v_decision_id) then
    return jsonb_build_object('status', 'conflict', 'reason', 'review_decision_id_conflict');
  end if;

  v_decision := p_decision->>'decision';
  if v_decision = 'approve_for_exact_review' then
    if cardinality(v_evidence_ids) < 1
      or v_candidate.candidate_status <> 'needs_review'
      or coalesce((v_candidate.candidate_payload->>'evidence_coverage')::numeric, 0) <> 1
      or exists (
        select 1 from jsonb_array_elements(v_candidate.candidate_payload->'fields') field,
          jsonb_array_elements(field->'conflicts') conflict
        where conflict->>'status' in ('open','requires_review')
      )
      or exists (
        select 1 from public.import_duplicate_candidates d
        where d.entity_candidate_id = p_candidate_id
          and d.metadata->>'candidateStatus' = 'requires_review'
      )
      or exists (
        select 1 from public.import_mapping_results m
        where m.entity_candidate_id = p_candidate_id
          and m.metadata->>'candidateStatus' = 'requires_review'
      ) then
      return jsonb_build_object('status', 'rejected', 'reason', 'exact_review_preconditions_unmet');
    end if;
  end if;

  if v_decision = 'confirmed_duplicate' then
    if not (p_decision ? 'duplicate_entity_id')
      or coalesce(p_decision->>'duplicate_entity_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      or cardinality(v_evidence_ids) < 1 then
      return jsonb_build_object('status', 'rejected', 'reason', 'confirmed_duplicate_binding_invalid');
    end if;
    select count(*)::integer into v_duplicate_count
    from public.import_duplicate_candidates d
    where d.entity_candidate_id = p_candidate_id
      and d.matched_entity_id = (p_decision->>'duplicate_entity_id')::uuid;
    if v_duplicate_count <> 1 then
      return jsonb_build_object('status', 'rejected', 'reason', 'confirmed_duplicate_binding_invalid');
    end if;
    select * into v_duplicate
    from public.import_duplicate_candidates d
    where d.entity_candidate_id = p_candidate_id
      and d.matched_entity_id = (p_decision->>'duplicate_entity_id')::uuid
    for update;
    if not found or exists (
      select 1 from unnest(v_evidence_ids) evidence_id
      join public.import_source_evidence e on e.id = evidence_id
      where not (e.reference_id = any(v_duplicate.evidence_reference_ids))
    ) then
      return jsonb_build_object('status', 'rejected', 'reason', 'confirmed_duplicate_evidence_invalid');
    end if;
  elsif p_decision ? 'duplicate_entity_id' then
    return jsonb_build_object('status', 'rejected', 'reason', 'duplicate_entity_id_not_allowed');
  end if;

  if v_decision = 'not_duplicate' then
    select count(*)::integer into v_duplicate_count
    from public.import_duplicate_candidates d where d.entity_candidate_id = p_candidate_id;
    if v_duplicate_count <> 1 then
      return jsonb_build_object('status', 'rejected', 'reason', 'not_duplicate_ambiguous');
    end if;
    select * into v_duplicate
    from public.import_duplicate_candidates d where d.entity_candidate_id = p_candidate_id
    for update;
  end if;

  if v_decision = 'edit' then
    if jsonb_typeof(p_decision->'field_edits') <> 'array'
      or jsonb_array_length(p_decision->'field_edits') not between 1 and 200
      or (select count(*) from jsonb_array_elements(p_decision->'field_edits')) <>
         (select count(distinct item->>'path') from jsonb_array_elements(p_decision->'field_edits') item) then
      return jsonb_build_object('status', 'rejected', 'reason', 'review_field_edits_invalid');
    end if;
    for v_field_edit in select item from jsonb_array_elements(p_decision->'field_edits') item loop
      if (select count(*) from jsonb_object_keys(v_field_edit)) <> 4
        or not (v_field_edit ?& array['path','expected_value_hash','replacement_value','reason'])
        or char_length(btrim(coalesce(v_field_edit->>'path', ''))) not between 1 and 160
        or coalesce(v_field_edit->>'expected_value_hash', '') !~ '^[a-f0-9]{64}$'
        or jsonb_typeof(v_field_edit->'replacement_value') not in ('string','number','boolean','null')
        or (jsonb_typeof(v_field_edit->'replacement_value') = 'string' and char_length(v_field_edit->>'replacement_value') > 4000)
        or char_length(btrim(coalesce(v_field_edit->>'reason', ''))) not between 1 and 500 then
        return jsonb_build_object('status', 'rejected', 'reason', 'review_field_edits_invalid');
      end if;
      select count(*)::integer into v_duplicate_count
      from jsonb_array_elements(v_candidate.candidate_payload->'fields') field
      where field->>'path' = btrim(v_field_edit->>'path');
      if v_duplicate_count <> 1 then
        return jsonb_build_object('status', 'rejected', 'reason', 'review_field_path_not_found_or_ambiguous');
      end if;
      select field into v_candidate_field
      from jsonb_array_elements(v_candidate.candidate_payload->'fields') field
      where field->>'path' = btrim(v_field_edit->>'path');
      v_expected_hash := encode(extensions.digest(jsonb_build_object(
        'schemaVersion', 'drkhaleej.import.entityFieldValueJsonb.v1',
        'path', btrim(v_field_edit->>'path'),
        'value', v_candidate_field->'normalized_value'
      )::text, 'sha256'), 'hex');
      if v_field_edit->>'expected_value_hash' is distinct from v_expected_hash then
        return jsonb_build_object('status', 'rejected', 'reason', 'review_field_expected_value_mismatch');
      end if;
    end loop;
  elsif p_decision ? 'field_edits' then
    return jsonb_build_object('status', 'rejected', 'reason', 'field_edits_not_allowed');
  end if;

  v_session_hash := encode(extensions.digest(p_decision#>>'{reviewer,session_id}', 'sha256'), 'hex');
  insert into public.import_entity_review_decisions (
    id, entity_candidate_id, resolution_schema_version, contract_schema_version,
    contract_policy_version, draft_version, draft_hash, decision,
    reviewer_profile_id, reviewer_role, reviewer_session_hash, reason, evidence_ids,
    duplicate_candidate_id, duplicate_entity_id, field_edits, contract_decided_at,
    idempotency_key, request_hash, decision_payload_hash
  ) values (
    v_decision_id, p_candidate_id, 'drkhaleej.import.entityResolutionGate.v1', '1.2.2',
    v_candidate.contract_policy_version, v_candidate.draft_version, v_candidate.draft_hash, v_decision,
    p_actor_profile_id, 'platform_admin', v_session_hash, btrim(p_decision->>'reason'), v_evidence_ids,
    case when v_decision in ('confirmed_duplicate','not_duplicate') then v_duplicate.id else null end,
    case when v_decision in ('confirmed_duplicate','not_duplicate') then v_duplicate.matched_entity_id else null end,
    case when v_decision = 'edit' then p_decision->'field_edits' else '[]'::jsonb end,
    v_decided_at, btrim(p_idempotency_key), p_request_hash, v_payload_hash
  );

  v_readback := public.import_entity_review_decision_readback(v_decision_id);
  if v_readback is null
    or coalesce(v_readback->>'receiptHash', '') !~ '^[a-f0-9]{64}$'
    or (v_readback->>'candidateId')::uuid is distinct from p_candidate_id
    or (v_readback->>'reviewerProfileId')::uuid is distinct from p_actor_profile_id then
    raise exception 'review_decision_readback_mismatch' using errcode = '55000';
  end if;
  return v_readback || jsonb_build_object('status', 'created');
end;
$$;

revoke all on function public.import_entity_review_decision_guard() from public, anon, authenticated, service_role;
revoke all on function public.import_entity_review_decision_readback(uuid) from public, anon, authenticated, service_role;
revoke all on function public.import_record_entity_review_decision(uuid,uuid,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.import_record_entity_review_decision(uuid,uuid,text,text,jsonb) to service_role;

comment on table public.import_entity_review_decisions is
  'ENTITY-RESOLUTION-GATE immutable Human Review decisions. Rows are additive authority records, not Candidate mutations, duplicate merges, geo verification, canonical writes or publish approval.';
comment on function public.import_record_entity_review_decision(uuid,uuid,text,text,jsonb) is
  'ENTITY-RESOLUTION-GATE service-role RPC: binds a real platform admin, immutable Candidate snapshot, real evidence, reason and time. Stores only a reviewer session hash. No Candidate/duplicate/geo/canonical/publish mutation.';
