-- IMPORT-ADMIN-L: persistent single-use Pharmacy publish authorization envelopes
-- Scope: server-only authorization persistence and atomic consumption. No entity mutation.

create table if not exists public.import_pharmacy_publish_authorizations (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  nonce_hash text not null check (nonce_hash ~ '^[a-f0-9]{64}$'),
  actor_profile_id uuid not null references public.profiles(id) on delete restrict,
  entity_id uuid not null references public.centers(id) on delete restrict,
  review_snapshot_hash text not null check (review_snapshot_hash ~ '^[a-f0-9]{64}$'),
  entity_fingerprint text not null check (entity_fingerprint ~ '^[a-f0-9]{64}$'),
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint import_pharmacy_publish_authorizations_expiry check (expires_at > issued_at),
  constraint import_pharmacy_publish_authorizations_consumption_time check (
    consumed_at is null or (consumed_at >= issued_at and consumed_at < expires_at)
  )
);

create index if not exists import_pharmacy_publish_authorizations_actor_entity_idx
  on public.import_pharmacy_publish_authorizations (actor_profile_id, entity_id, issued_at desc);

alter table public.import_pharmacy_publish_authorizations enable row level security;

create or replace function public.import_pharmacy_consume_publish_authorization(
  p_token_hash text,
  p_nonce_hash text,
  p_actor_profile_id uuid,
  p_entity_id uuid,
  p_review_snapshot_hash text,
  p_entity_fingerprint text,
  p_consumed_at timestamptz
)
returns boolean
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_updated_count integer;
begin
  if coalesce(p_token_hash, '') !~ '^[a-f0-9]{64}$'
    or coalesce(p_nonce_hash, '') !~ '^[a-f0-9]{64}$'
    or coalesce(p_review_snapshot_hash, '') !~ '^[a-f0-9]{64}$'
    or coalesce(p_entity_fingerprint, '') !~ '^[a-f0-9]{64}$'
    or p_actor_profile_id is null
    or p_entity_id is null
    or p_consumed_at is null then
    return false;
  end if;

  update public.import_pharmacy_publish_authorizations
  set consumed_at = p_consumed_at
  where token_hash = p_token_hash
    and nonce_hash = p_nonce_hash
    and actor_profile_id = p_actor_profile_id
    and entity_id = p_entity_id
    and review_snapshot_hash = p_review_snapshot_hash
    and entity_fingerprint = p_entity_fingerprint
    and consumed_at is null
    and issued_at <= p_consumed_at
    and expires_at > p_consumed_at;

  get diagnostics v_updated_count = row_count;
  return v_updated_count = 1;
end;
$$;

revoke all on function public.import_pharmacy_consume_publish_authorization(
  text, text, uuid, uuid, text, text, timestamptz
) from public, anon, authenticated;

grant execute on function public.import_pharmacy_consume_publish_authorization(
  text, text, uuid, uuid, text, text, timestamptz
) to service_role;

comment on table public.import_pharmacy_publish_authorizations is
  'Server-only single-use authorization envelopes for one allowlisted Pharmacy Preview publish canary.';

comment on function public.import_pharmacy_consume_publish_authorization(
  text, text, uuid, uuid, text, text, timestamptz
) is 'Atomically consumes one exact unexpired Pharmacy publish authorization envelope.';
