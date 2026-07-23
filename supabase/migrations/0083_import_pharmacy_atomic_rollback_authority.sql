-- P06 ROLLBACK-AUTHORITY-HARDENING: atomically consume one durable Pharmacy rollback authority.
-- Reuses the existing private rollback RPC and terminal persistence. No public/index/sitemap/route activation.

alter table public.import_pharmacy_publish_references
  add column if not exists consumed_by_profile_id uuid references public.profiles(id) on delete restrict,
  add column if not exists consumed_result jsonb,
  add column if not exists consumed_result_hash text;

alter table public.import_pharmacy_publish_references
  add constraint import_pharmacy_publish_references_consumed_result_object_check
  check (consumed_result is null or jsonb_typeof(consumed_result) = 'object') not valid;
alter table public.import_pharmacy_publish_references
  validate constraint import_pharmacy_publish_references_consumed_result_object_check;

alter table public.import_pharmacy_publish_references
  add constraint import_pharmacy_publish_references_consumed_result_hash_check
  check (consumed_result_hash is null or consumed_result_hash ~ '^[a-f0-9]{64}$') not valid;
alter table public.import_pharmacy_publish_references
  validate constraint import_pharmacy_publish_references_consumed_result_hash_check;

alter table public.import_pharmacy_publish_references
  add constraint import_pharmacy_publish_references_consumption_shape_check
  check (
    (consumed_at is null and consumed_by_profile_id is null and consumed_result is null and consumed_result_hash is null)
    or
    (consumed_at is not null and (
      (consumed_by_profile_id is null and consumed_result is null and consumed_result_hash is null)
      or
      (consumed_by_profile_id is not null and consumed_result is not null and consumed_result_hash is not null)
    ))
  ) not valid;
alter table public.import_pharmacy_publish_references
  validate constraint import_pharmacy_publish_references_consumption_shape_check;

create unique index if not exists import_pharmacy_publish_references_active_version_unique
  on public.import_pharmacy_publish_references (
    actor_profile_id,
    entity_id,
    expected_current_version
  )
  where consumed_at is null;

create or replace function public.import_rollback_pharmacy_private_by_authority(
  p_entity_id uuid,
  p_actor_profile_id uuid,
  p_audit_schema_version text
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_center public.centers%rowtype;
  v_reference public.import_pharmacy_publish_references%rowtype;
  v_candidate_count integer;
  v_replay_count integer;
  v_rollback jsonb;
  v_consumed_result jsonb;
  v_consumed_result_hash text;
  v_updated integer;
begin
  if p_entity_id is null or p_actor_profile_id is null then
    raise exception 'rollback_authority_identity_missing' using errcode = '22023';
  end if;
  if p_audit_schema_version is distinct from 'drkhaleej.import.publishAudit.v4' then
    raise exception 'rollback_authority_schema_version_invalid' using errcode = '22023';
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
  if v_center.status <> 'draft'::public.provider_status
    or v_center.is_active
    or v_center.is_featured
    or v_center.deleted_at is not null
    or coalesce(v_center.metadata ->> 'visibility', '') <> 'private'
    or coalesce((v_center.metadata ->> 'publicRouteEnabled')::boolean, true) <> false
    or coalesce((v_center.metadata ->> 'indexable')::boolean, true) <> false
    or coalesce((v_center.metadata ->> 'sitemapEligible')::boolean, true) <> false then
    return jsonb_build_object('status', 'conflict', 'reason', 'rollback_private_boundary_invalid');
  end if;

  select count(*)::integer into v_replay_count
  from public.import_pharmacy_publish_references r
  where r.actor_profile_id = p_actor_profile_id
    and r.entity_id = p_entity_id
    and r.consumed_at is not null
    and r.consumed_by_profile_id = p_actor_profile_id
    and r.consumed_result is not null
    and r.consumed_result_hash = encode(digest(r.consumed_result::text, 'sha256'), 'hex')
    and r.consumed_result ->> 'kind' = 'rolled_back'
    and r.consumed_result ->> 'actualVersion' = v_center.updated_at::text;

  if v_replay_count > 1 then
    return jsonb_build_object('status', 'conflict', 'reason', 'rollback_authority_ambiguous');
  end if;
  if v_replay_count = 1 then
    select * into v_reference
    from public.import_pharmacy_publish_references r
    where r.actor_profile_id = p_actor_profile_id
      and r.entity_id = p_entity_id
      and r.consumed_at is not null
      and r.consumed_by_profile_id = p_actor_profile_id
      and r.consumed_result is not null
      and r.consumed_result_hash = encode(digest(r.consumed_result::text, 'sha256'), 'hex')
      and r.consumed_result ->> 'kind' = 'rolled_back'
      and r.consumed_result ->> 'actualVersion' = v_center.updated_at::text
    for update;

    return jsonb_build_object(
      'status', 'replayed',
      'entityId', p_entity_id,
      'actualVersion', v_reference.consumed_result ->> 'actualVersion',
      'authorityConsumed', true,
      'privateBoundaryVerified', true,
      'rawReferenceExposed', false
    );
  end if;

  select count(*)::integer into v_candidate_count
  from public.import_pharmacy_publish_references r
  join public.import_publish_idempotency_records i
    on i.id = r.idempotency_record_id
  join public.import_publish_rollback_snapshots s
    on s.id = r.rollback_snapshot_id
   and s.idempotency_record_id = i.id
  where r.actor_profile_id = p_actor_profile_id
    and r.entity_id = p_entity_id
    and r.consumed_at is null
    and r.expires_at > clock_timestamp()
    and r.expected_current_version = v_center.updated_at::text
    and r.expected_snapshot_hash = s.snapshot_hash
    and i.actor_profile_id = p_actor_profile_id
    and i.entity_id = p_entity_id
    and i.status = 'succeeded'
    and i.terminal_result ->> 'kind' = 'mutated'
    and i.terminal_result ->> 'actualVersion' = r.expected_current_version
    and i.terminal_result ->> 'visibility' = 'private'
    and coalesce((i.terminal_result ->> 'publicRouteEnabled')::boolean, true) = false
    and coalesce((i.terminal_result ->> 'indexable')::boolean, true) = false
    and coalesce((i.terminal_result ->> 'sitemapEligible')::boolean, true) = false
    and s.actor_profile_id = p_actor_profile_id
    and s.entity_id = p_entity_id
    and s.restored_at is null;

  if v_candidate_count = 0 then
    return jsonb_build_object('status', 'conflict', 'reason', 'rollback_authority_not_available');
  end if;
  if v_candidate_count > 1 then
    return jsonb_build_object('status', 'conflict', 'reason', 'rollback_authority_ambiguous');
  end if;

  select r.* into v_reference
  from public.import_pharmacy_publish_references r
  join public.import_publish_idempotency_records i
    on i.id = r.idempotency_record_id
  join public.import_publish_rollback_snapshots s
    on s.id = r.rollback_snapshot_id
   and s.idempotency_record_id = i.id
  where r.actor_profile_id = p_actor_profile_id
    and r.entity_id = p_entity_id
    and r.consumed_at is null
    and r.expires_at > clock_timestamp()
    and r.expected_current_version = v_center.updated_at::text
    and r.expected_snapshot_hash = s.snapshot_hash
    and i.actor_profile_id = p_actor_profile_id
    and i.entity_id = p_entity_id
    and i.status = 'succeeded'
    and i.terminal_result ->> 'kind' = 'mutated'
    and i.terminal_result ->> 'actualVersion' = r.expected_current_version
    and i.terminal_result ->> 'visibility' = 'private'
    and coalesce((i.terminal_result ->> 'publicRouteEnabled')::boolean, true) = false
    and coalesce((i.terminal_result ->> 'indexable')::boolean, true) = false
    and coalesce((i.terminal_result ->> 'sitemapEligible')::boolean, true) = false
    and s.actor_profile_id = p_actor_profile_id
    and s.entity_id = p_entity_id
    and s.restored_at is null
  for update of r, i, s;

  if not found then
    return jsonb_build_object('status', 'conflict', 'reason', 'rollback_authority_not_available');
  end if;

  select public.import_rollback_pharmacy_private(
    v_reference.idempotency_record_id,
    v_reference.rollback_snapshot_id,
    p_entity_id,
    p_actor_profile_id,
    v_reference.expected_current_version,
    v_reference.expected_snapshot_hash,
    p_audit_schema_version
  ) into v_rollback;

  if coalesce(v_rollback ->> 'status', '') <> 'rolled_back' then
    return v_rollback || jsonb_build_object(
      'authorityConsumed', false,
      'rawReferenceExposed', false
    );
  end if;

  v_consumed_result := jsonb_build_object(
    'kind', 'rolled_back',
    'entityId', p_entity_id,
    'actualVersion', v_rollback ->> 'actualVersion',
    'authorityConsumed', true,
    'privateBoundaryVerified', true,
    'rawReferenceExposed', false
  );
  v_consumed_result_hash := encode(digest(v_consumed_result::text, 'sha256'), 'hex');

  update public.import_pharmacy_publish_references
  set consumed_at = clock_timestamp(),
      consumed_by_profile_id = p_actor_profile_id,
      consumed_result = v_consumed_result,
      consumed_result_hash = v_consumed_result_hash
  where id = v_reference.id
    and consumed_at is null;
  get diagnostics v_updated = row_count;

  if v_updated <> 1 then
    raise exception 'rollback_authority_atomic_consume_failed' using errcode = 'P0001';
  end if;

  return jsonb_build_object(
    'status', 'rolled_back',
    'entityId', p_entity_id,
    'actualVersion', v_rollback ->> 'actualVersion',
    'authorityConsumed', true,
    'privateBoundaryVerified', true,
    'rawReferenceExposed', false
  );
end;
$$;

revoke all on function public.import_rollback_pharmacy_private_by_authority(
  uuid, uuid, text
) from public, anon, authenticated;

grant execute on function public.import_rollback_pharmacy_private_by_authority(
  uuid, uuid, text
) to service_role;

comment on function public.import_rollback_pharmacy_private_by_authority(
  uuid, uuid, text
) is 'Atomically selects and consumes one server-only Pharmacy rollback authority, reuses the existing rollback RPC, and returns bounded replay-safe readback.';
