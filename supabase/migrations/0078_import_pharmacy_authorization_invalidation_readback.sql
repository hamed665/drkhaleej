-- IMPORT-ADMIN-AD: Pharmacy authorization invalidation and server readback lifecycle.
-- No reservation, entity mutation, route, index, sitemap, or public publication changes.

-- Stable operation identity may be shared by a later persisted Review of the same logical state.
-- Authorization uniqueness therefore belongs to the persisted Review, not to the operation attempt forever.
drop index if exists public.import_pharmacy_publish_authorizations_attempt_scope_idx;

create unique index if not exists import_pharmacy_publish_authorizations_review_scope_idx
  on public.import_pharmacy_publish_authorizations (review_state_id, operation_scope)
  where review_state_id is not null;

create or replace function public.import_pharmacy_invalidate_publish_authorizations(
  p_actor_profile_id uuid,
  p_entity_id uuid,
  p_operation_scope text,
  p_except_review_state_id uuid,
  p_invalidated_at timestamptz,
  p_reason text
)
returns integer
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_updated_count integer;
begin
  if p_actor_profile_id is null
    or p_entity_id is null
    or p_except_review_state_id is null
    or p_operation_scope <> 'reserve_private_publish'
    or p_invalidated_at is null
    or char_length(btrim(coalesce(p_reason, ''))) not between 1 and 200 then
    return null;
  end if;

  update public.import_pharmacy_publish_authorizations
  set status = 'invalidated',
      invalidated_at = p_invalidated_at,
      invalidation_reason = btrim(p_reason)
  where actor_profile_id = p_actor_profile_id
    and entity_id = p_entity_id
    and operation_scope = p_operation_scope
    and review_state_id <> p_except_review_state_id
    and status = 'issued'
    and consumed_at is null
    and invalidated_at is null;

  get diagnostics v_updated_count = row_count;
  return v_updated_count;
end;
$$;

create or replace function public.import_pharmacy_transition_publish_authorization(
  p_authorization_id uuid,
  p_from_status text,
  p_to_status text,
  p_transitioned_at timestamptz,
  p_reason text default null
)
returns boolean
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_updated_count integer;
begin
  if p_authorization_id is null
    or p_from_status <> 'issued'
    or p_to_status not in ('invalidated', 'expired')
    or p_transitioned_at is null
    or (p_to_status = 'invalidated' and char_length(btrim(coalesce(p_reason, ''))) not between 1 and 200)
    or (p_to_status = 'expired' and p_reason is not null) then
    return false;
  end if;

  update public.import_pharmacy_publish_authorizations
  set status = p_to_status,
      invalidated_at = case when p_to_status = 'invalidated' then p_transitioned_at else null end,
      invalidation_reason = case when p_to_status = 'invalidated' then btrim(p_reason) else null end
  where id = p_authorization_id
    and status = p_from_status
    and consumed_at is null
    and invalidated_at is null;

  get diagnostics v_updated_count = row_count;
  if v_updated_count = 1 then
    return true;
  end if;

  return exists (
    select 1
    from public.import_pharmacy_publish_authorizations
    where id = p_authorization_id
      and status = p_to_status
  );
end;
$$;

revoke all on function public.import_pharmacy_invalidate_publish_authorizations(
  uuid, uuid, text, uuid, timestamptz, text
) from public, anon, authenticated;
revoke all on function public.import_pharmacy_transition_publish_authorization(
  uuid, text, text, timestamptz, text
) from public, anon, authenticated;

grant execute on function public.import_pharmacy_invalidate_publish_authorizations(
  uuid, uuid, text, uuid, timestamptz, text
) to service_role;
grant execute on function public.import_pharmacy_transition_publish_authorization(
  uuid, text, text, timestamptz, text
) to service_role;

comment on function public.import_pharmacy_invalidate_publish_authorizations(
  uuid, uuid, text, uuid, timestamptz, text
) is 'Idempotently invalidates older active Pharmacy authorizations when a newer persisted Review is issued.';
comment on function public.import_pharmacy_transition_publish_authorization(
  uuid, text, text, timestamptz, text
) is 'Idempotently transitions one issued Pharmacy authorization to invalidated or expired for server-only readback.';
