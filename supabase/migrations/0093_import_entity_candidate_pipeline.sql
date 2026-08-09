-- ENTITY-CANDIDATE-PIPELINE
-- Atomic, replay-safe persistence for contract-bound Candidate/Evidence rows only.
-- Human review decisions, duplicate resolution, geo verification, canonical writes and publish remain closed.

alter table public.import_entity_candidates
  add column if not exists pipeline_schema_version text,
  add column if not exists contract_schema_version text,
  add column if not exists contract_policy_version text,
  add column if not exists draft_version integer,
  add column if not exists draft_hash text,
  add column if not exists canonicalization_version text,
  add column if not exists source_observation_id uuid
    references public.import_source_observations(id) on delete restrict,
  add column if not exists source_evidence_reference_ids text[],
  add column if not exists persistence_actor_profile_id uuid
    references public.profiles(id) on delete restrict,
  add column if not exists idempotency_key text,
  add column if not exists request_hash text,
  add column if not exists persistence_payload_hash text;

alter table public.import_entity_candidates
  drop constraint if exists import_entity_candidates_entity_type_check;
alter table public.import_entity_candidates
  add constraint import_entity_candidates_entity_type_check check (entity_type in (
    'doctor','hospital','clinic','pharmacy','lab','imaging_center','dental_clinic','dentist',
    'dermatologist','gynecologist','fertility_clinic','ivf_center',
    'reproductive_medicine_doctor','embryology_lab','andrology_lab',
    'hair_transplant_clinic','hair_transplant_doctor','plastic_surgeon','aesthetic_doctor',
    'medical_beauty_clinic','salon','spa','gym','fitness_center','personal_trainer',
    'yoga_studio','pilates_studio','sports_medicine_doctor','physiotherapy','wellness_center',
    'vet_doctor','pet_clinic','pet_pharmacy','pet_shop','pet_grooming','pet_boarding',
    'laboratory','medical_center'
  ));

alter table public.import_entity_candidates
  drop constraint if exists import_entity_candidates_status_check;
alter table public.import_entity_candidates
  add constraint import_entity_candidates_status_check check (
    candidate_status in ('draft','collecting','needs_review','approved','rejected','blocked')
  );

alter table public.import_entity_candidates
  add constraint import_entity_candidates_pipeline_shape_check check (
    pipeline_schema_version is null
    or (
      pipeline_schema_version = 'drkhaleej.import.entityCandidatePipeline.v1'
      and contract_schema_version = '1.2.2'
      and char_length(btrim(contract_policy_version)) between 1 and 80
      and draft_version >= 1
      and draft_hash ~ '^[a-f0-9]{64}$'
      and canonicalization_version = 'drkhaleej.import.canonicalJson.v1'
      and source_observation_id is not null
      and cardinality(source_evidence_reference_ids) between 1 and 32
      and persistence_actor_profile_id is not null
      and char_length(btrim(idempotency_key)) between 8 and 240
      and request_hash ~ '^[a-f0-9]{64}$'
      and persistence_payload_hash ~ '^[a-f0-9]{64}$'
      and candidate_status in ('collecting','needs_review')
      and review_note is null
      and candidate_payload->>'schema_version' = contract_schema_version
      and candidate_payload->>'policy_version' = contract_policy_version
      and (candidate_payload->>'draft_id')::uuid = id
      and candidate_payload->>'entity_family' = entity_type
      and candidate_payload->>'status' = candidate_status
      and (candidate_payload->>'version')::integer = draft_version
    )
  );

create unique index if not exists import_entity_candidates_pipeline_idempotency_unique
  on public.import_entity_candidates (idempotency_key)
  where pipeline_schema_version = 'drkhaleej.import.entityCandidatePipeline.v1';
create index if not exists import_entity_candidates_source_observation_idx
  on public.import_entity_candidates (source_observation_id)
  where source_observation_id is not null;

alter table public.import_duplicate_candidates
  add column if not exists entity_candidate_id uuid
    references public.import_entity_candidates(id) on delete restrict,
  add column if not exists pipeline_candidate_key text,
  add column if not exists evidence_reference_ids text[];

alter table public.import_duplicate_candidates
  drop constraint if exists import_duplicate_candidates_matched_entity_type_check;
alter table public.import_duplicate_candidates
  add constraint import_duplicate_candidates_matched_entity_type_check check (matched_entity_type in (
    'doctor','center','hospital','clinic','pharmacy','lab','imaging_center','dental_clinic','dentist',
    'dermatologist','gynecologist','fertility_clinic','ivf_center',
    'reproductive_medicine_doctor','embryology_lab','andrology_lab',
    'hair_transplant_clinic','hair_transplant_doctor','plastic_surgeon','aesthetic_doctor',
    'medical_beauty_clinic','salon','spa','gym','fitness_center','personal_trainer',
    'yoga_studio','pilates_studio','sports_medicine_doctor','physiotherapy','wellness_center',
    'vet_doctor','pet_clinic','pet_pharmacy','pet_shop','pet_grooming','pet_boarding',
    'laboratory','medical_center','unknown'
  ));
alter table public.import_duplicate_candidates
  add constraint import_duplicate_candidates_pipeline_shape_check check (
    entity_candidate_id is null
    or (
      char_length(btrim(pipeline_candidate_key)) between 1 and 160
      and cardinality(evidence_reference_ids) between 1 and 32
      and resolution_status = 'pending'
      and resolved_by_profile_id is null
      and resolved_at is null
      and metadata->>'pipelineSchemaVersion' = 'drkhaleej.import.entityCandidatePipeline.v1'
    )
  );
create unique index if not exists import_duplicate_candidates_pipeline_key_unique
  on public.import_duplicate_candidates (entity_candidate_id, pipeline_candidate_key)
  where entity_candidate_id is not null;

alter table public.import_mapping_results
  add column if not exists entity_candidate_id uuid
    references public.import_entity_candidates(id) on delete restrict,
  add column if not exists evidence_reference_ids text[];
alter table public.import_mapping_results
  add constraint import_mapping_results_pipeline_geo_shape_check check (
    entity_candidate_id is null
    or (
      mapping_type = 'geo'
      and target_type = 'geo_area'
      and mapping_status in ('pending','needs_review')
      and cardinality(evidence_reference_ids) between 1 and 32
      and metadata->>'pipelineSchemaVersion' = 'drkhaleej.import.entityCandidatePipeline.v1'
      and metadata->>'geoVerified' = 'false'
    )
  );
create unique index if not exists import_mapping_results_pipeline_geo_unique
  on public.import_mapping_results (entity_candidate_id)
  where entity_candidate_id is not null and mapping_type = 'geo';

create or replace function public.import_entity_candidate_pipeline_guard()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'INSERT' then
    if tg_table_name = 'import_entity_candidates' then
      if new.pipeline_schema_version is not null and current_user not in ('postgres', 'supabase_admin') then
        raise exception 'entity_candidate_pipeline_rpc_required' using errcode = '42501';
      end if;
    elsif tg_table_name = 'import_duplicate_candidates' then
      if new.entity_candidate_id is not null and current_user not in ('postgres', 'supabase_admin') then
        raise exception 'entity_candidate_pipeline_rpc_required' using errcode = '42501';
      end if;
    elsif tg_table_name = 'import_mapping_results' then
      if new.entity_candidate_id is not null and current_user not in ('postgres', 'supabase_admin') then
        raise exception 'entity_candidate_pipeline_rpc_required' using errcode = '42501';
      end if;
    end if;
    return new;
  end if;

  if tg_table_name = 'import_entity_candidates' then
    if old.pipeline_schema_version is not null then
      raise exception 'entity_candidate_pipeline_row_immutable' using errcode = '55000';
    end if;
  elsif tg_table_name = 'import_duplicate_candidates' then
    if old.entity_candidate_id is not null then
      raise exception 'entity_candidate_pipeline_row_immutable' using errcode = '55000';
    end if;
  elsif tg_table_name = 'import_mapping_results' then
    if old.entity_candidate_id is not null then
      raise exception 'entity_candidate_pipeline_row_immutable' using errcode = '55000';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create trigger trg_import_entity_candidates_pipeline_guard
  before insert or update or delete on public.import_entity_candidates
  for each row execute function public.import_entity_candidate_pipeline_guard();
create trigger trg_import_duplicate_candidates_pipeline_guard
  before insert or update or delete on public.import_duplicate_candidates
  for each row execute function public.import_entity_candidate_pipeline_guard();
create trigger trg_import_mapping_results_pipeline_guard
  before insert or update or delete on public.import_mapping_results
  for each row execute function public.import_entity_candidate_pipeline_guard();

create or replace function public.import_entity_candidate_pipeline_readback(
  p_candidate_id uuid
)
returns jsonb
language sql
security definer
set search_path = pg_catalog, public
stable
as $$
  select jsonb_build_object(
    'candidateId', c.id,
    'candidateStatus', c.candidate_status,
    'draftId', c.candidate_payload->>'draft_id',
    'draftVersion', c.draft_version,
    'draftHash', c.draft_hash,
    'databasePayloadHash', c.persistence_payload_hash,
    'duplicateCandidateIds', coalesce((
      select jsonb_agg(d.id order by d.pipeline_candidate_key)
      from public.import_duplicate_candidates d
      where d.entity_candidate_id = c.id
    ), '[]'::jsonb),
    'duplicateCandidateCount', (
      select count(*) from public.import_duplicate_candidates d where d.entity_candidate_id = c.id
    ),
    'geoMappingId', (
      select m.id from public.import_mapping_results m
      where m.entity_candidate_id = c.id and m.mapping_type = 'geo'
      limit 1
    ),
    'geoMappingCount', (
      select count(*) from public.import_mapping_results m
      where m.entity_candidate_id = c.id and m.mapping_type = 'geo'
    ),
    'candidatePersistenceAllowed', true,
    'duplicateResolutionAllowed', false,
    'duplicateMergeAllowed', false,
    'geoVerificationAllowed', false,
    'reviewDecisionAllowed', false,
    'directEntityWriteAllowed', false,
    'publishAllowed', false
  ) || jsonb_build_object(
    'receiptHash', encode(extensions.digest(jsonb_build_object(
      'candidateId', c.id,
      'candidateStatus', c.candidate_status,
      'draftHash', c.draft_hash,
      'databasePayloadHash', c.persistence_payload_hash,
      'duplicateCandidateIds', coalesce((
        select jsonb_agg(d.id order by d.pipeline_candidate_key)
        from public.import_duplicate_candidates d
        where d.entity_candidate_id = c.id
      ), '[]'::jsonb),
      'geoMappingId', (
        select m.id from public.import_mapping_results m
        where m.entity_candidate_id = c.id and m.mapping_type = 'geo'
        limit 1
      )
    )::text, 'sha256'), 'hex')
  )
  from public.import_entity_candidates c
  where c.id = p_candidate_id
    and c.pipeline_schema_version = 'drkhaleej.import.entityCandidatePipeline.v1';
$$;

create or replace function public.import_persist_entity_candidate(
  p_actor_profile_id uuid,
  p_batch_id uuid,
  p_raw_row_id uuid,
  p_source_observation_id uuid,
  p_idempotency_key text,
  p_request_hash text,
  p_pipeline jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_existing public.import_entity_candidates%rowtype;
  v_candidate jsonb;
  v_duplicates jsonb;
  v_geo jsonb;
  v_item jsonb;
  v_contract_duplicate jsonb;
  v_reference_ids text[];
  v_reference_id text;
  v_candidate_id uuid;
  v_matched_entity_id uuid;
  v_geo_target_id uuid;
  v_match_reason text;
  v_payload_hash text;
  v_readback jsonb;
  v_duplicate_count integer;
  v_geo_count integer;
  v_required_candidate_keys text[] := array[
    'schema_version','policy_version','draft_id','entity_family','status','locales','fields',
    'duplicate_candidates','evidence_coverage','created_by','version','created_at','updated_at'
  ];
  v_allowed_candidate_keys text[] := v_required_candidate_keys || array['candidate_entity_id','operator_type'];
  v_allowed_entity_types text[] := array[
    'doctor','hospital','clinic','pharmacy','lab','imaging_center','dental_clinic','dentist',
    'dermatologist','gynecologist','fertility_clinic','ivf_center',
    'reproductive_medicine_doctor','embryology_lab','andrology_lab',
    'hair_transplant_clinic','hair_transplant_doctor','plastic_surgeon','aesthetic_doctor',
    'medical_beauty_clinic','salon','spa','gym','fitness_center','personal_trainer',
    'yoga_studio','pilates_studio','sports_medicine_doctor','physiotherapy','wellness_center',
    'vet_doctor','pet_clinic','pet_pharmacy','pet_shop','pet_grooming','pet_boarding'
  ];
begin
  if char_length(btrim(coalesce(p_idempotency_key, ''))) not between 8 and 240
    or coalesce(p_request_hash, '') !~ '^[a-f0-9]{64}$'
    or jsonb_typeof(coalesce(p_pipeline, 'null'::jsonb)) <> 'object' then
    return jsonb_build_object('status', 'rejected', 'reason', 'candidate_persistence_identity_invalid');
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(btrim(p_idempotency_key), 0)
  );
  v_payload_hash := encode(extensions.digest(p_pipeline::text, 'sha256'), 'hex');

  select * into v_existing
  from public.import_entity_candidates
  where idempotency_key = btrim(p_idempotency_key)
    and pipeline_schema_version = 'drkhaleej.import.entityCandidatePipeline.v1'
  for update;
  if found then
    if v_existing.persistence_actor_profile_id is distinct from p_actor_profile_id
      or v_existing.batch_id is distinct from p_batch_id
      or v_existing.raw_row_id is distinct from p_raw_row_id
      or v_existing.source_observation_id is distinct from p_source_observation_id
      or v_existing.request_hash is distinct from p_request_hash
      or v_existing.persistence_payload_hash is distinct from v_payload_hash then
      return jsonb_build_object('status', 'conflict', 'reason', 'candidate_idempotency_mismatch');
    end if;
    v_readback := public.import_entity_candidate_pipeline_readback(v_existing.id);
    if v_readback is null
      or (v_readback->>'duplicateCandidateCount')::integer <> jsonb_array_length(p_pipeline->'duplicateCandidates')
      or (v_readback->>'geoMappingCount')::integer <> case when p_pipeline->'geoCandidate' = 'null'::jsonb then 0 else 1 end then
      return jsonb_build_object('status', 'conflict', 'reason', 'candidate_readback_integrity_mismatch');
    end if;
    return v_readback || jsonb_build_object('status', 'replayed');
  end if;

  if not exists (
    select 1 from public.profiles where id = p_actor_profile_id and is_platform_admin
  ) then
    return jsonb_build_object('status', 'conflict', 'reason', 'candidate_actor_not_authorized');
  end if;
  if not exists (
    select 1 from public.import_raw_rows r
    join public.import_batches b on b.id = r.batch_id
    where r.id = p_raw_row_id and r.batch_id = p_batch_id and b.id = p_batch_id
  ) then
    return jsonb_build_object('status', 'rejected', 'reason', 'candidate_staging_binding_invalid');
  end if;
  if not exists (
    select 1 from public.import_source_observations o
    where o.id = p_source_observation_id
      and o.schema_version = 'drkhaleej.import.sourceEvidenceLedger.v1'
      and o.policy_status = 'accepted'
      and o.lifecycle_status = 'active'
  ) then
    return jsonb_build_object('status', 'rejected', 'reason', 'candidate_source_observation_invalid');
  end if;

  if (select count(*) from jsonb_object_keys(p_pipeline)) <> 13
    or not (p_pipeline ?& array[
      'pipelineSchemaVersion','intakeSchemaVersion','sourceEvidenceSchemaVersion',
      'duplicateGeoSchemaVersion','duplicateGeoPolicyVersion','canonicalizationVersion',
      'contractSchemaVersion','contractPolicyVersion','draftHash','sourceEvidenceReferenceIds',
      'candidatePayload','duplicateCandidates','geoCandidate'
    ])
    or p_pipeline->>'pipelineSchemaVersion' <> 'drkhaleej.import.entityCandidatePipeline.v1'
    or p_pipeline->>'intakeSchemaVersion' <> 'drkhaleej.import.intake.v1'
    or p_pipeline->>'sourceEvidenceSchemaVersion' <> 'drkhaleej.import.sourceEvidenceLedger.v1'
    or p_pipeline->>'duplicateGeoSchemaVersion' <> 'drkhaleej.import.duplicateGeo.v1'
    or p_pipeline->>'duplicateGeoPolicyVersion' <> 'drkhaleej.import.duplicateGeoPolicy.v1'
    or p_pipeline->>'canonicalizationVersion' <> 'drkhaleej.import.canonicalJson.v1'
    or p_pipeline->>'contractSchemaVersion' <> '1.2.2'
    or char_length(btrim(coalesce(p_pipeline->>'contractPolicyVersion', ''))) not between 1 and 80
    or coalesce(p_pipeline->>'draftHash', '') !~ '^[a-f0-9]{64}$'
    or jsonb_typeof(p_pipeline->'sourceEvidenceReferenceIds') <> 'array'
    or jsonb_array_length(p_pipeline->'sourceEvidenceReferenceIds') not between 1 and 32
    or jsonb_typeof(p_pipeline->'candidatePayload') <> 'object'
    or jsonb_typeof(p_pipeline->'duplicateCandidates') <> 'array'
    or jsonb_array_length(p_pipeline->'duplicateCandidates') > 20
    or jsonb_typeof(p_pipeline->'geoCandidate') not in ('object','null') then
    return jsonb_build_object('status', 'rejected', 'reason', 'candidate_pipeline_contract_invalid');
  end if;

  select array_agg(btrim(value #>> '{}') order by ordinality)
    into v_reference_ids
  from jsonb_array_elements(p_pipeline->'sourceEvidenceReferenceIds') with ordinality;
  if cardinality(v_reference_ids) <> (
      select count(distinct reference_id) from unnest(v_reference_ids) reference_id
    )
    or exists (
      select 1 from unnest(v_reference_ids) reference_id
      where char_length(reference_id) not between 1 and 128
    )
    or (
      select count(*) from public.import_source_evidence e
      where e.observation_id = p_source_observation_id
        and e.reference_id = any(v_reference_ids)
    ) <> cardinality(v_reference_ids) then
    return jsonb_build_object('status', 'rejected', 'reason', 'candidate_evidence_reference_invalid');
  end if;

  v_candidate := p_pipeline->'candidatePayload';
  if not (v_candidate ?& v_required_candidate_keys)
    or exists (select 1 from jsonb_object_keys(v_candidate) key where not (key = any(v_allowed_candidate_keys)))
    or v_candidate->>'schema_version' <> '1.2.2'
    or v_candidate->>'policy_version' <> p_pipeline->>'contractPolicyVersion'
    or coalesce(v_candidate->>'draft_id', '') !~ '^[0-9a-fA-F-]{36}$'
    or not (v_candidate->>'entity_family' = any(v_allowed_entity_types))
    or v_candidate->>'status' not in ('collecting','needs_review')
    or jsonb_typeof(v_candidate->'locales') <> 'object'
    or not (v_candidate->'locales' ?& array['en','ar'])
    or (select count(*) from jsonb_object_keys(v_candidate->'locales')) <> 2
    or jsonb_typeof(v_candidate->'fields') <> 'array'
    or jsonb_array_length(v_candidate->'fields') not between 1 and 200
    or jsonb_typeof(v_candidate->'duplicate_candidates') <> 'array'
    or jsonb_array_length(v_candidate->'duplicate_candidates') > 20
    or (v_candidate->>'evidence_coverage')::numeric not between 0 and 1
    or jsonb_typeof(v_candidate->'created_by') <> 'object'
    or (select count(*) from jsonb_object_keys(v_candidate->'created_by')) <> 2
    or not (v_candidate->'created_by' ?& array['actor_type','actor_id'])
    or v_candidate->'created_by'->>'actor_type' not in ('admin','manual_import','api_import')
    or char_length(btrim(coalesce(v_candidate->'created_by'->>'actor_id', ''))) not between 1 and 120
    or ((v_candidate->'created_by'->>'actor_type') = 'admin' and (v_candidate->'created_by'->>'actor_id') <> p_actor_profile_id::text)
    or (v_candidate->>'version')::integer < 1
    or (v_candidate->>'draft_id')::uuid is null then
    return jsonb_build_object('status', 'rejected', 'reason', 'entity_draft_contract_invalid');
  end if;

  for v_item in select value from jsonb_array_elements(v_candidate->'fields') loop
    if jsonb_typeof(v_item) <> 'object'
      or (select count(*) from jsonb_object_keys(v_item)) <> 11
      or not (v_item ?& array[
        'path','value','normalized_value','observation_id','source_tier','confidence',
        'extraction_method','evidence_excerpt','conflicts','observed_at','review_status'
      ])
      or coalesce(v_item->>'path', '') !~ '^[a-zA-Z0-9_.-]{1,240}$'
      or v_item->>'observation_id' <> p_source_observation_id::text
      or v_item->>'source_tier' not in ('T1','T2','T3','T4','T5')
      or (v_item->>'confidence')::numeric not between 0 and 1
      or v_item->>'extraction_method' not in ('structured_data','selector','regex','small_model','strong_model','manual')
      or char_length(coalesce(v_item->>'evidence_excerpt', '')) > 1000
      or jsonb_typeof(v_item->'conflicts') <> 'array'
      or jsonb_array_length(v_item->'conflicts') > 20
      or v_item->>'review_status' <> 'pending'
      or not exists (
        select 1 from public.import_source_evidence e
        where e.observation_id = p_source_observation_id
          and e.reference_id = any(v_reference_ids)
          and v_item->>'path' = any(e.field_paths)
      ) then
      return jsonb_build_object('status', 'rejected', 'reason', 'entity_draft_field_invalid');
    end if;
  end loop;

  v_duplicates := p_pipeline->'duplicateCandidates';
  if jsonb_array_length(v_candidate->'duplicate_candidates') <> jsonb_array_length(v_duplicates)
    or (jsonb_array_length(v_duplicates) = 0 and p_pipeline->'geoCandidate' = 'null'::jsonb) then
    return jsonb_build_object('status', 'rejected', 'reason', 'candidate_output_binding_invalid');
  end if;
  for v_item in select value from jsonb_array_elements(v_duplicates) loop
    if jsonb_typeof(v_item) <> 'object'
      or (select count(*) from jsonb_object_keys(v_item)) <> 7
      or not (v_item ?& array[
        'candidateId','matchedEntityType','matchedEntityId','score','reasons','status','evidenceReferenceIds'
      ])
      or char_length(btrim(coalesce(v_item->>'candidateId', ''))) not between 1 and 160
      or not (v_item->>'matchedEntityType' = any(v_allowed_entity_types))
      or coalesce(v_item->>'matchedEntityId', '') !~ '^[0-9a-fA-F-]{36}$'
      or (v_item->>'score')::numeric not between 0 and 1
      or jsonb_typeof(v_item->'reasons') <> 'array'
      or jsonb_array_length(v_item->'reasons') not between 1 and 20
      or v_item->>'status' not in ('candidate','not_duplicate_candidate','requires_review')
      or jsonb_typeof(v_item->'evidenceReferenceIds') <> 'array'
      or jsonb_array_length(v_item->'evidenceReferenceIds') not between 1 and 32
      or exists (
        select 1 from jsonb_array_elements_text(v_item->'evidenceReferenceIds') evidence_id
        where not (evidence_id = any(v_reference_ids))
      ) then
      return jsonb_build_object('status', 'rejected', 'reason', 'duplicate_candidate_contract_invalid');
    end if;
    select value into v_contract_duplicate
    from jsonb_array_elements(v_candidate->'duplicate_candidates')
    where value->>'entity_id' = v_item->>'matchedEntityId'
      and (value->>'score')::numeric = (v_item->>'score')::numeric
      and value->>'decision' = v_item->>'status'
      and value->'reasons' = v_item->'reasons'
    limit 1;
    if v_contract_duplicate is null then
      return jsonb_build_object('status', 'rejected', 'reason', 'duplicate_candidate_draft_mismatch');
    end if;
  end loop;

  v_geo := p_pipeline->'geoCandidate';
  if v_geo <> 'null'::jsonb then
    if (select count(*) from jsonb_object_keys(v_geo)) <> 9
      or not (v_geo ?& array[
        'countryId','governorateId','cityId','areaId','latitude','longitude','confidence','status','evidenceReferenceIds'
      ])
      or (v_geo->>'countryId')::uuid is null
      or (v_geo->>'governorateId' is not null and (v_geo->>'governorateId')::uuid is null)
      or (v_geo->>'cityId' is not null and (v_geo->>'cityId')::uuid is null)
      or (v_geo->>'areaId' is not null and (v_geo->>'areaId')::uuid is null)
      or (v_geo->>'confidence')::numeric not between 0 and 1
      or v_geo->>'status' not in ('candidate','requires_review')
      or jsonb_typeof(v_geo->'evidenceReferenceIds') <> 'array'
      or jsonb_array_length(v_geo->'evidenceReferenceIds') not between 1 and 32
      or exists (
        select 1 from jsonb_array_elements_text(v_geo->'evidenceReferenceIds') evidence_id
        where not (evidence_id = any(v_reference_ids))
      ) then
      return jsonb_build_object('status', 'rejected', 'reason', 'geo_candidate_contract_invalid');
    end if;
  end if;
  if v_candidate->>'status' = 'collecting' and (
    exists (select 1 from jsonb_array_elements(v_duplicates) item where item->>'status' = 'requires_review')
    or (v_geo <> 'null'::jsonb and v_geo->>'status' = 'requires_review')
  ) then
    return jsonb_build_object('status', 'rejected', 'reason', 'candidate_review_status_required');
  end if;

  v_candidate_id := (v_candidate->>'draft_id')::uuid;
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_candidate_id::text, 0)
  );
  if exists (select 1 from public.import_entity_candidates where id = v_candidate_id) then
    return jsonb_build_object('status', 'conflict', 'reason', 'candidate_draft_identity_already_persisted');
  end if;
  insert into public.import_entity_candidates (
    id, batch_id, raw_row_id, entity_type, candidate_payload, candidate_status,
    quality_score, review_note, pipeline_schema_version, contract_schema_version,
    contract_policy_version, draft_version, draft_hash, canonicalization_version,
    source_observation_id, source_evidence_reference_ids, persistence_actor_profile_id,
    idempotency_key, request_hash, persistence_payload_hash
  ) values (
    v_candidate_id, p_batch_id, p_raw_row_id, v_candidate->>'entity_family', v_candidate,
    v_candidate->>'status', round((v_candidate->>'evidence_coverage')::numeric * 100)::integer,
    null, 'drkhaleej.import.entityCandidatePipeline.v1', '1.2.2',
    p_pipeline->>'contractPolicyVersion', (v_candidate->>'version')::integer,
    p_pipeline->>'draftHash', 'drkhaleej.import.canonicalJson.v1', p_source_observation_id,
    v_reference_ids, p_actor_profile_id, btrim(p_idempotency_key), p_request_hash, v_payload_hash
  );

  for v_item in select value from jsonb_array_elements(v_duplicates) loop
    v_matched_entity_id := (v_item->>'matchedEntityId')::uuid;
    select string_agg(reason, '; ' order by ordinality) into v_match_reason
    from jsonb_array_elements_text(v_item->'reasons') with ordinality as reasons(reason, ordinality);
    insert into public.import_duplicate_candidates (
      batch_id, raw_row_id, matched_entity_type, matched_entity_id, match_score,
      match_reason, resolution_status, resolved_by_profile_id, resolved_at, metadata,
      entity_candidate_id, pipeline_candidate_key, evidence_reference_ids
    ) values (
      p_batch_id, p_raw_row_id, v_item->>'matchedEntityType', v_matched_entity_id,
      (v_item->>'score')::numeric * 100, left(v_match_reason, 1000), 'pending', null, null,
      jsonb_build_object(
        'pipelineSchemaVersion', 'drkhaleej.import.entityCandidatePipeline.v1',
        'candidateStatus', v_item->>'status',
        'reasons', v_item->'reasons',
        'resolutionAllowed', false
      ),
      v_candidate_id, btrim(v_item->>'candidateId'),
      array(select jsonb_array_elements_text(v_item->'evidenceReferenceIds'))
    );
  end loop;

  if v_geo <> 'null'::jsonb then
    v_geo_target_id := coalesce(
      nullif(v_geo->>'areaId', '')::uuid,
      nullif(v_geo->>'cityId', '')::uuid,
      nullif(v_geo->>'governorateId', '')::uuid,
      (v_geo->>'countryId')::uuid
    );
    insert into public.import_mapping_results (
      batch_id, raw_row_id, mapping_type, source_value, target_type, target_id,
      target_slug, confidence_score, mapping_status, metadata,
      entity_candidate_id, evidence_reference_ids
    ) values (
      p_batch_id, p_raw_row_id, 'geo', null, 'geo_area', v_geo_target_id, null,
      (v_geo->>'confidence')::numeric * 100,
      case when v_geo->>'status' = 'requires_review' then 'needs_review' else 'pending' end,
      jsonb_build_object(
        'pipelineSchemaVersion', 'drkhaleej.import.entityCandidatePipeline.v1',
        'countryId', v_geo->>'countryId',
        'governorateId', v_geo->>'governorateId',
        'cityId', v_geo->>'cityId',
        'areaId', v_geo->>'areaId',
        'latitude', v_geo->'latitude',
        'longitude', v_geo->'longitude',
        'candidateStatus', v_geo->>'status',
        'geoVerified', false,
        'geoVerificationAllowed', false
      ),
      v_candidate_id,
      array(select jsonb_array_elements_text(v_geo->'evidenceReferenceIds'))
    );
  end if;

  v_readback := public.import_entity_candidate_pipeline_readback(v_candidate_id);
  v_duplicate_count := (v_readback->>'duplicateCandidateCount')::integer;
  v_geo_count := (v_readback->>'geoMappingCount')::integer;
  if v_readback is null
    or v_duplicate_count <> jsonb_array_length(v_duplicates)
    or v_geo_count <> case when v_geo = 'null'::jsonb then 0 else 1 end
    or coalesce(v_readback->>'receiptHash', '') !~ '^[a-f0-9]{64}$' then
    raise exception 'candidate_persistence_readback_mismatch' using errcode = '55000';
  end if;
  return v_readback || jsonb_build_object('status', 'created');
end;
$$;

revoke all on function public.import_entity_candidate_pipeline_guard() from public, anon, authenticated, service_role;
revoke all on function public.import_entity_candidate_pipeline_readback(uuid) from public, anon, authenticated, service_role;
revoke all on function public.import_persist_entity_candidate(uuid,uuid,uuid,uuid,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.import_persist_entity_candidate(uuid,uuid,uuid,uuid,text,text,jsonb) to service_role;

comment on function public.import_persist_entity_candidate(uuid,uuid,uuid,uuid,text,text,jsonb) is
  'ENTITY-CANDIDATE-PIPELINE: atomically persists immutable collecting/needs_review Candidate, duplicate-candidate and geo-candidate evidence with exact replay/readback. No review decision, resolution, canonical write or publish authority.';
