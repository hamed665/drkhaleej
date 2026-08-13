-- AUTOMATION-JOB-RUNTIME
-- Preview-only Postgres control plane with atomic lease claim, epoch fencing, replay protection,
-- kill switches and transactional bounded outbox. All controls and identities default disabled.
-- No canonical entity, decision, publish, rollback, public, index or sitemap authority is added.

create table if not exists public.import_automation_controls (
  control_key text primary key,
  control_kind text not null check (control_kind in ('global','family','source','ai','notifications')),
  control_target text,
  enabled boolean not null default false,
  control_epoch bigint not null default 1 check (control_epoch >= 1),
  updated_by_profile_id uuid references public.profiles(id) on delete restrict,
  updated_at timestamptz not null default clock_timestamp(),
  constraint import_automation_controls_shape_check check (
    (control_kind in ('global','ai','notifications') and control_target is null)
    or (control_kind = 'family' and control_target = 'pharmacy')
    or (control_kind = 'source' and char_length(btrim(control_target)) between 1 and 120)
  )
);

insert into public.import_automation_controls (control_key, control_kind, control_target, enabled)
values
  ('global', 'global', null, false),
  ('family:pharmacy', 'family', 'pharmacy', false),
  ('ai', 'ai', null, false),
  ('notifications', 'notifications', null, false)
on conflict (control_key) do nothing;

create table if not exists public.import_automation_service_identities (
  subject text primary key,
  issuer text not null unique,
  identity_kind text not null check (identity_kind in ('worker','n8n')),
  allowed_scopes text[] not null,
  active_key_ids text[] not null default '{}'::text[],
  active boolean not null default false,
  updated_by_profile_id uuid references public.profiles(id) on delete restrict,
  updated_at timestamptz not null default clock_timestamp(),
  constraint import_automation_service_identity_shape_check check (
    issuer = subject
    and subject in ('urn:drkhaleej:service:worker-preview','urn:drkhaleej:service:n8n-preview')
    and cardinality(allowed_scopes) between 1 and 7
    and cardinality(active_key_ids) <= 2
    and not (allowed_scopes && array['publish','rollback','public_promote','index_promote','sitemap_promote'])
    and (
      (identity_kind = 'worker' and allowed_scopes = array[
        'job:lease','job:execute','job:heartbeat','job:complete','draft:write','evidence:write','report:write'
      ])
      or (identity_kind = 'n8n' and allowed_scopes = array['job:create','job:read'])
    )
  )
);

insert into public.import_automation_service_identities (
  subject, issuer, identity_kind, allowed_scopes, active
) values
  (
    'urn:drkhaleej:service:worker-preview',
    'urn:drkhaleej:service:worker-preview',
    'worker',
    array['job:lease','job:execute','job:heartbeat','job:complete','draft:write','evidence:write','report:write'],
    false
  ),
  (
    'urn:drkhaleej:service:n8n-preview',
    'urn:drkhaleej:service:n8n-preview',
    'n8n',
    array['job:create','job:read'],
    false
  )
on conflict (subject) do nothing;

create table if not exists public.import_automation_request_replays (
  id uuid primary key default gen_random_uuid(),
  issuer text not null references public.import_automation_service_identities(issuer) on delete restrict,
  subject text not null references public.import_automation_service_identities(subject) on delete restrict,
  key_id text not null check (char_length(key_id) between 20 and 80),
  jti_digest text not null check (jti_digest ~ '^[a-f0-9]{64}$'),
  scope text not null,
  method text not null check (method in ('GET','POST')),
  normalized_path text not null check (char_length(normalized_path) between 1 and 240),
  request_hash text not null check (request_hash ~ '^[a-f0-9]{64}$'),
  worker_instance uuid,
  token_expires_at timestamptz not null,
  replay_expires_at timestamptz not null,
  accepted_at timestamptz not null default clock_timestamp(),
  unique (issuer, jti_digest),
  constraint import_automation_request_replay_expiry_check check (replay_expires_at >= token_expires_at)
);

create index if not exists import_automation_request_replays_expiry_idx
  on public.import_automation_request_replays (replay_expires_at);

create table if not exists public.import_automation_jobs (
  id uuid primary key default gen_random_uuid(),
  runtime_schema_version text not null default 'drkhaleej.import.automationJobRuntime.v1',
  contract_schema_version text not null,
  contract_policy_version text not null check (char_length(btrim(contract_policy_version)) between 1 and 80),
  job_type text not null check (job_type in (
    'entity_discovery','entity_fetch','entity_extract','entity_monitor','report'
  )),
  priority integer not null check (priority between 0 and 100),
  status text not null default 'queued' check (status in (
    'queued','leased','running','waiting_review','succeeded','failed_retryable',
    'failed_terminal','deferred_budget','cancelled'
  )),
  family text not null check (family = 'pharmacy'),
  country text not null check (country = 'om'),
  source_policy_id text check (source_policy_id is null or char_length(btrim(source_policy_id)) between 1 and 120),
  target_reference_hash text not null check (target_reference_hash ~ '^[a-f0-9]{64}$'),
  canonical_input_hash text not null check (canonical_input_hash ~ '^[a-f0-9]{64}$'),
  idempotency_key text not null unique check (char_length(btrim(idempotency_key)) between 16 and 240),
  requested_by_subject text not null references public.import_automation_service_identities(subject) on delete restrict,
  reason text not null check (char_length(btrim(reason)) between 1 and 500),
  attempt_count integer not null default 0 check (attempt_count between 0 and 3),
  max_attempts integer not null default 3 check (max_attempts = 3),
  budget_hard_limit_usd numeric(12,6) not null default 0 check (budget_hard_limit_usd = 0),
  budget_actual_usd numeric(12,6) not null default 0 check (budget_actual_usd = 0),
  scheduled_for timestamptz not null,
  lease_owner_subject text references public.import_automation_service_identities(subject) on delete restrict,
  worker_instance uuid,
  lease_token_digest text check (lease_token_digest is null or lease_token_digest ~ '^[a-f0-9]{64}$'),
  lease_epoch bigint not null default 0 check (lease_epoch >= 0),
  lease_expires_at timestamptz,
  heartbeat_at timestamptz,
  leased_global_epoch bigint,
  leased_family_epoch bigint,
  leased_source_epoch bigint,
  completion_idempotency_key text,
  completion_result text,
  completion_output_hash text check (completion_output_hash is null or completion_output_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default clock_timestamp(),
  started_at timestamptz,
  finished_at timestamptz,
  updated_at timestamptz not null default clock_timestamp(),
  constraint import_automation_jobs_contract_check check (
    runtime_schema_version = 'drkhaleej.import.automationJobRuntime.v1'
    and contract_schema_version = '1.2.2'
    and (job_type = 'report' or source_policy_id is not null)
    and (attempt_count <= max_attempts)
  ),
  constraint import_automation_jobs_lease_shape_check check (
    (
      status in ('leased','running')
      and lease_owner_subject = 'urn:drkhaleej:service:worker-preview'
      and worker_instance is not null
      and lease_token_digest is not null
      and lease_epoch >= 1
      and lease_expires_at is not null
      and heartbeat_at is not null
      and leased_global_epoch is not null
      and leased_family_epoch is not null
    )
    or status not in ('leased','running')
  ),
  constraint import_automation_jobs_completion_shape_check check (
    (completion_idempotency_key is null and completion_result is null and completion_output_hash is null)
    or (
      char_length(btrim(completion_idempotency_key)) between 16 and 240
      and completion_result in ('waiting_review','succeeded','failed_retryable','failed_terminal','deferred_budget','cancelled')
      and completion_output_hash is not null
    )
  )
);

create unique index if not exists import_automation_jobs_completion_idempotency_unique
  on public.import_automation_jobs (completion_idempotency_key)
  where completion_idempotency_key is not null;
create index if not exists import_automation_jobs_claim_idx
  on public.import_automation_jobs (priority desc, scheduled_for, created_at)
  where status in ('queued','failed_retryable','leased','running');

create table if not exists public.import_automation_job_artifacts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.import_automation_jobs(id) on delete restrict,
  artifact_kind text not null check (artifact_kind in ('checkpoint','draft','evidence','report')),
  payload_hash text not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  idempotency_key text not null unique check (char_length(btrim(idempotency_key)) between 16 and 240),
  worker_subject text not null check (worker_subject = 'urn:drkhaleej:service:worker-preview'),
  worker_instance uuid not null,
  lease_epoch bigint not null check (lease_epoch >= 1),
  created_at timestamptz not null default clock_timestamp()
);

create table if not exists public.import_automation_notification_outbox (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.import_automation_jobs(id) on delete restrict,
  event_type text not null check (event_type in (
    'automation_job_waiting_review','automation_job_succeeded','automation_job_failed_terminal'
  )),
  template_id text not null check (char_length(template_id) between 1 and 80),
  locale text not null check (locale in ('en','ar')),
  bounded_status text not null,
  hashed_reference text not null check (hashed_reference ~ '^[a-f0-9]{64}$'),
  deduplication_key text not null unique check (char_length(btrim(deduplication_key)) between 16 and 240),
  delivery_status text not null default 'pending' check (delivery_status in ('pending','claimed','sent','dead_letter')),
  attempt_count integer not null default 0 check (attempt_count between 0 and 3),
  provider_message_id_hash text check (provider_message_id_hash is null or provider_message_id_hash ~ '^[a-f0-9]{64}$'),
  bounded_failure_code text,
  created_at timestamptz not null default clock_timestamp(),
  sent_at timestamptz
);

create table if not exists public.import_automation_audit_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (char_length(event_type) between 1 and 80),
  actor_type text not null check (actor_type in ('service','admin','system')),
  actor_hash text not null check (actor_hash ~ '^[a-f0-9]{64}$'),
  job_id uuid references public.import_automation_jobs(id) on delete restrict,
  scope text,
  result_code text not null check (char_length(result_code) between 1 and 80),
  request_hash text check (request_hash is null or request_hash ~ '^[a-f0-9]{64}$'),
  lease_epoch bigint,
  created_at timestamptz not null default clock_timestamp()
);

alter table public.import_automation_controls enable row level security;
alter table public.import_automation_service_identities enable row level security;
alter table public.import_automation_request_replays enable row level security;
alter table public.import_automation_jobs enable row level security;
alter table public.import_automation_job_artifacts enable row level security;
alter table public.import_automation_notification_outbox enable row level security;
alter table public.import_automation_audit_events enable row level security;

revoke all on table public.import_automation_controls from public, anon, authenticated, service_role;
revoke all on table public.import_automation_service_identities from public, anon, authenticated, service_role;
revoke all on table public.import_automation_request_replays from public, anon, authenticated, service_role;
revoke all on table public.import_automation_jobs from public, anon, authenticated, service_role;
revoke all on table public.import_automation_job_artifacts from public, anon, authenticated, service_role;
revoke all on table public.import_automation_notification_outbox from public, anon, authenticated, service_role;
revoke all on table public.import_automation_audit_events from public, anon, authenticated, service_role;

create or replace function public.import_automation_job_readback(p_job_id uuid)
returns jsonb
language sql
security definer
set search_path = pg_catalog, public
stable
as $$
  select jsonb_build_object(
    'jobId', j.id,
    'runtimeSchemaVersion', j.runtime_schema_version,
    'contractSchemaVersion', j.contract_schema_version,
    'jobType', j.job_type,
    'family', j.family,
    'country', j.country,
    'status', j.status,
    'attemptCount', j.attempt_count,
    'maxAttempts', j.max_attempts,
    'leaseEpoch', j.lease_epoch,
    'leaseExpiresAt', j.lease_expires_at,
    'scheduledFor', j.scheduled_for,
    'startedAt', j.started_at,
    'finishedAt', j.finished_at,
    'artifactCount', (select count(*) from public.import_automation_job_artifacts a where a.job_id = j.id),
    'outboxCount', (select count(*) from public.import_automation_notification_outbox o where o.job_id = j.id),
    'publishAllowed', false,
    'rollbackAllowed', false,
    'publicPromotionAllowed', false,
    'indexPromotionAllowed', false,
    'sitemapPromotionAllowed', false,
    'aiAllowed', false,
    'productionAllowed', false
  )
  from public.import_automation_jobs j
  where j.id = p_job_id;
$$;

create or replace function public.import_automation_accept_service_request(
  p_issuer text,
  p_subject text,
  p_key_id text,
  p_jti_digest text,
  p_scope text,
  p_method text,
  p_path text,
  p_request_hash text,
  p_worker_instance uuid,
  p_job_id uuid,
  p_lease_epoch bigint,
  p_token_expires_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_identity public.import_automation_service_identities%rowtype;
  v_now timestamptz := clock_timestamp();
  v_job_bound boolean := p_scope in ('job:execute','job:heartbeat','job:complete','draft:write','evidence:write','report:write');
begin
  if coalesce(p_jti_digest, '') !~ '^[a-f0-9]{64}$'
    or coalesce(p_request_hash, '') !~ '^[a-f0-9]{64}$'
    or p_method not in ('GET','POST')
    or char_length(coalesce(p_path, '')) not between 1 and 240
    or p_path like '%?%' or p_path like '%#%'
    or p_token_expires_at is null
    or p_token_expires_at < v_now - interval '30 seconds'
    or p_token_expires_at > v_now + interval '330 seconds' then
    return jsonb_build_object('status','rejected','reason','service_request_contract_invalid');
  end if;

  select * into v_identity
  from public.import_automation_service_identities
  where subject = p_subject and issuer = p_issuer
  for update;
  if not found or not v_identity.active or not (p_scope = any(v_identity.allowed_scopes))
    or not (p_key_id = any(v_identity.active_key_ids)) then
    return jsonb_build_object('status','rejected','reason','service_identity_not_active');
  end if;
  if (v_identity.identity_kind = 'worker' and p_worker_instance is null)
    or (v_identity.identity_kind = 'n8n' and p_worker_instance is not null)
    or (v_job_bound and (p_job_id is null or p_lease_epoch is null or p_lease_epoch < 1))
    or (not v_job_bound and (p_job_id is not null or p_lease_epoch is not null)) then
    return jsonb_build_object('status','rejected','reason','service_request_binding_invalid');
  end if;

  begin
    insert into public.import_automation_request_replays (
      issuer, subject, key_id, jti_digest, scope, method, normalized_path, request_hash,
      worker_instance, token_expires_at, replay_expires_at
    ) values (
      p_issuer, p_subject, p_key_id, p_jti_digest, p_scope, p_method, p_path, p_request_hash,
      p_worker_instance, p_token_expires_at, p_token_expires_at + interval '10 minutes'
    );
  exception when unique_violation then
    return jsonb_build_object('status','rejected','reason','service_request_replayed');
  end;

  insert into public.import_automation_audit_events (
    event_type, actor_type, actor_hash, job_id, scope, result_code, request_hash, lease_epoch
  ) values (
    'service_request_accepted', 'service',
    encode(extensions.digest(p_subject, 'sha256'), 'hex'), p_job_id, p_scope,
    'accepted', p_request_hash, p_lease_epoch
  );
  return jsonb_build_object('status','accepted');
end;
$$;

create or replace function public.import_automation_create_job(
  p_request_subject text,
  p_contract_schema_version text,
  p_contract_policy_version text,
  p_job_type text,
  p_family text,
  p_country text,
  p_source_policy_id text,
  p_target_reference_hash text,
  p_canonical_input_hash text,
  p_idempotency_key text,
  p_priority integer,
  p_max_attempts integer,
  p_scheduled_for timestamptz,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_existing public.import_automation_jobs%rowtype;
  v_job_id uuid;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(btrim(coalesce(p_idempotency_key,'')), 0));
  select * into v_existing from public.import_automation_jobs where idempotency_key = btrim(p_idempotency_key) for update;
  if found then
    if v_existing.requested_by_subject is distinct from p_request_subject
      or v_existing.job_type is distinct from p_job_type
      or v_existing.target_reference_hash is distinct from p_target_reference_hash
      or v_existing.canonical_input_hash is distinct from p_canonical_input_hash then
      return jsonb_build_object('status','conflict','reason','automation_job_idempotency_mismatch');
    end if;
    return public.import_automation_job_readback(v_existing.id) || jsonb_build_object('status','replayed');
  end if;

  if p_request_subject <> 'urn:drkhaleej:service:n8n-preview'
    or not exists (
      select 1 from public.import_automation_service_identities i
      where i.subject=p_request_subject and i.identity_kind='n8n' and i.active
    )
    or p_contract_schema_version <> '1.2.2'
    or char_length(btrim(coalesce(p_contract_policy_version,''))) not between 1 and 80
    or p_job_type not in ('entity_discovery','entity_fetch','entity_extract','entity_monitor','report')
    or p_family <> 'pharmacy' or p_country <> 'om'
    or (p_job_type <> 'report' and p_source_policy_id is null)
    or coalesce(p_target_reference_hash,'') !~ '^[a-f0-9]{64}$'
    or coalesce(p_canonical_input_hash,'') !~ '^[a-f0-9]{64}$'
    or char_length(btrim(coalesce(p_idempotency_key,''))) not between 16 and 240
    or coalesce(p_priority,-1) not between 0 and 100 or coalesce(p_max_attempts,-1) <> 3
    or p_scheduled_for is null
    or char_length(btrim(coalesce(p_reason,''))) not between 1 and 500 then
    return jsonb_build_object('status','rejected','reason','automation_job_contract_invalid');
  end if;
  if not coalesce((select enabled from public.import_automation_controls where control_key = 'global'), false)
    or not coalesce((select enabled from public.import_automation_controls where control_key = 'family:pharmacy'), false)
    or (p_source_policy_id is not null and not coalesce((
      select enabled from public.import_automation_controls
      where control_key = 'source:' || btrim(p_source_policy_id) and control_kind = 'source'
    ), false)) then
    return jsonb_build_object('status','rejected','reason','automation_control_disabled');
  end if;

  insert into public.import_automation_jobs (
    contract_schema_version, contract_policy_version, job_type, priority, family, country,
    source_policy_id, target_reference_hash, canonical_input_hash, idempotency_key,
    requested_by_subject, reason, max_attempts, scheduled_for
  ) values (
    p_contract_schema_version, btrim(p_contract_policy_version), p_job_type, p_priority, p_family, p_country,
    nullif(btrim(coalesce(p_source_policy_id,'')), ''), p_target_reference_hash, p_canonical_input_hash,
    btrim(p_idempotency_key), p_request_subject, btrim(p_reason), p_max_attempts, p_scheduled_for
  ) returning id into v_job_id;
  insert into public.import_automation_audit_events (
    event_type, actor_type, actor_hash, job_id, scope, result_code, request_hash
  ) values (
    'automation_job_created','service',encode(extensions.digest(p_request_subject,'sha256'),'hex'),
    v_job_id,'job:create','created',p_canonical_input_hash
  );
  return public.import_automation_job_readback(v_job_id) || jsonb_build_object('status','created');
end;
$$;

create or replace function public.import_automation_lease_is_valid(
  p_job_id uuid,
  p_worker_subject text,
  p_worker_instance uuid,
  p_lease_token text,
  p_lease_epoch bigint
)
returns boolean
language sql
security definer
set search_path = pg_catalog, public
stable
as $$
  select exists (
    select 1
    from public.import_automation_jobs j
    join public.import_automation_controls g on g.control_key = 'global'
    join public.import_automation_controls f on f.control_key = 'family:' || j.family
    left join public.import_automation_controls s
      on j.source_policy_id is not null and s.control_key = 'source:' || j.source_policy_id
    where j.id = p_job_id
      and j.status in ('leased','running')
      and exists (
        select 1 from public.import_automation_service_identities i
        where i.subject=p_worker_subject and i.identity_kind='worker' and i.active
      )
      and j.lease_owner_subject = p_worker_subject
      and j.worker_instance = p_worker_instance
      and j.lease_epoch = p_lease_epoch
      and j.lease_token_digest = encode(extensions.digest(decode(p_lease_token,'hex'),'sha256'),'hex')
      and j.lease_expires_at > clock_timestamp()
      and g.enabled and f.enabled and (j.source_policy_id is null or s.enabled)
      and j.leased_global_epoch = g.control_epoch
      and j.leased_family_epoch = f.control_epoch
      and (j.source_policy_id is null or j.leased_source_epoch = s.control_epoch)
  );
$$;

create or replace function public.import_automation_claim_job(
  p_worker_subject text,
  p_worker_instance uuid,
  p_job_types text[]
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_job public.import_automation_jobs%rowtype;
  v_token text;
  v_global_epoch bigint;
  v_family_epoch bigint;
  v_source_epoch bigint;
begin
  if p_worker_subject <> 'urn:drkhaleej:service:worker-preview' or p_worker_instance is null
    or p_job_types is distinct from array['report']::text[]
    or not exists (
      select 1 from public.import_automation_service_identities i
      where i.subject=p_worker_subject and i.identity_kind='worker' and i.active
    ) then
    return jsonb_build_object('status','rejected','reason','worker_identity_invalid');
  end if;
  select control_epoch into v_global_epoch from public.import_automation_controls where control_key='global' and enabled for update;
  select control_epoch into v_family_epoch from public.import_automation_controls where control_key='family:pharmacy' and enabled for update;
  if v_global_epoch is null or v_family_epoch is null then
    return jsonb_build_object('status','empty','reason','automation_control_disabled');
  end if;

  select j.* into v_job
  from public.import_automation_jobs j
  where (
      j.status in ('queued','failed_retryable')
      or (j.status in ('leased','running') and j.lease_expires_at <= clock_timestamp())
    )
    and j.scheduled_for <= clock_timestamp()
    and j.attempt_count < j.max_attempts
    and j.family = 'pharmacy'
    and j.job_type = any(p_job_types)
    and (j.source_policy_id is null or exists (
      select 1 from public.import_automation_controls s
      where s.control_key='source:' || j.source_policy_id and s.enabled
    ))
  order by j.priority desc, j.scheduled_for, j.created_at
  for update skip locked
  limit 1;
  if not found then return jsonb_build_object('status','empty'); end if;

  if v_job.source_policy_id is not null then
    select control_epoch into v_source_epoch from public.import_automation_controls
    where control_key='source:' || v_job.source_policy_id and enabled for update;
    if v_source_epoch is null then return jsonb_build_object('status','empty'); end if;
  end if;
  v_token := encode(extensions.gen_random_bytes(32),'hex');
  update public.import_automation_jobs set
    status='leased', attempt_count=attempt_count+1,
    lease_owner_subject=p_worker_subject, worker_instance=p_worker_instance,
    lease_token_digest=encode(extensions.digest(decode(v_token,'hex'),'sha256'),'hex'),
    lease_epoch=lease_epoch+1, lease_expires_at=clock_timestamp()+interval '60 seconds',
    heartbeat_at=clock_timestamp(), leased_global_epoch=v_global_epoch,
    leased_family_epoch=v_family_epoch, leased_source_epoch=v_source_epoch,
    completion_idempotency_key=null, completion_result=null, completion_output_hash=null,
    started_at=null, finished_at=null, updated_at=clock_timestamp()
  where id=v_job.id
  returning * into v_job;
  insert into public.import_automation_audit_events (
    event_type,actor_type,actor_hash,job_id,scope,result_code,lease_epoch
  ) values (
    'automation_job_leased','service',encode(extensions.digest(p_worker_subject,'sha256'),'hex'),
    v_job.id,'job:lease','leased',v_job.lease_epoch
  );
  return public.import_automation_job_readback(v_job.id) || jsonb_build_object(
    'status','claimed','leaseToken',v_token,'workerInstance',p_worker_instance
  );
end;
$$;

create or replace function public.import_automation_start_job(
  p_job_id uuid, p_worker_subject text, p_worker_instance uuid, p_lease_token text, p_lease_epoch bigint
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if coalesce(p_lease_token,'') !~ '^[a-f0-9]{64}$'
    or not public.import_automation_lease_is_valid(p_job_id,p_worker_subject,p_worker_instance,p_lease_token,p_lease_epoch) then
    return jsonb_build_object('status','stale_lease','reason','automation_lease_fenced');
  end if;
  update public.import_automation_jobs set status='running',
    started_at=coalesce(started_at,clock_timestamp()), updated_at=clock_timestamp()
  where id=p_job_id and status='leased';
  if not found then return jsonb_build_object('status','conflict','reason','automation_start_transition_invalid'); end if;
  return public.import_automation_job_readback(p_job_id) || jsonb_build_object('status','running');
end;
$$;

create or replace function public.import_automation_heartbeat_job(
  p_job_id uuid, p_worker_subject text, p_worker_instance uuid, p_lease_token text, p_lease_epoch bigint
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if coalesce(p_lease_token,'') !~ '^[a-f0-9]{64}$'
    or not public.import_automation_lease_is_valid(p_job_id,p_worker_subject,p_worker_instance,p_lease_token,p_lease_epoch) then
    return jsonb_build_object('status','stale_lease','reason','automation_lease_fenced');
  end if;
  update public.import_automation_jobs set heartbeat_at=clock_timestamp(),
    lease_expires_at=clock_timestamp()+interval '60 seconds', updated_at=clock_timestamp()
  where id=p_job_id and status in ('leased','running');
  return public.import_automation_job_readback(p_job_id) || jsonb_build_object('status','heartbeat');
end;
$$;

create or replace function public.import_automation_write_job_artifact(
  p_job_id uuid,
  p_worker_subject text,
  p_worker_instance uuid,
  p_lease_token text,
  p_lease_epoch bigint,
  p_scope text,
  p_artifact_kind text,
  p_payload_hash text,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_existing public.import_automation_job_artifacts%rowtype;
  v_artifact_id uuid;
begin
  if coalesce(p_lease_token,'') !~ '^[a-f0-9]{64}$'
    or coalesce(p_payload_hash,'') !~ '^[a-f0-9]{64}$'
    or char_length(btrim(coalesce(p_idempotency_key,''))) not between 16 and 240
    or not (
      (p_artifact_kind='checkpoint' and p_scope='job:execute')
      or (p_artifact_kind='draft' and p_scope='draft:write')
      or (p_artifact_kind='evidence' and p_scope='evidence:write')
      or (p_artifact_kind='report' and p_scope='report:write')
    ) then return jsonb_build_object('status','rejected','reason','automation_artifact_contract_invalid');
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(btrim(p_idempotency_key),0));
  select * into v_existing from public.import_automation_job_artifacts
  where idempotency_key=btrim(p_idempotency_key) for update;
  if found then
    if v_existing.job_id is distinct from p_job_id or v_existing.payload_hash is distinct from p_payload_hash
      or v_existing.artifact_kind is distinct from p_artifact_kind then
      return jsonb_build_object('status','conflict','reason','automation_artifact_idempotency_mismatch');
    end if;
    return jsonb_build_object('status','replayed','artifactId',v_existing.id,'payloadHash',v_existing.payload_hash);
  end if;
  if not public.import_automation_lease_is_valid(p_job_id,p_worker_subject,p_worker_instance,p_lease_token,p_lease_epoch)
    or not exists (select 1 from public.import_automation_jobs where id=p_job_id and status='running') then
    return jsonb_build_object('status','stale_lease','reason','automation_lease_fenced');
  end if;
  insert into public.import_automation_job_artifacts (
    job_id,artifact_kind,payload_hash,idempotency_key,worker_subject,worker_instance,lease_epoch
  ) values (
    p_job_id,p_artifact_kind,p_payload_hash,btrim(p_idempotency_key),p_worker_subject,p_worker_instance,p_lease_epoch
  ) returning id into v_artifact_id;
  return jsonb_build_object('status','created','artifactId',v_artifact_id,'payloadHash',p_payload_hash);
end;
$$;

create or replace function public.import_automation_complete_job(
  p_job_id uuid,
  p_worker_subject text,
  p_worker_instance uuid,
  p_lease_token text,
  p_lease_epoch bigint,
  p_result text,
  p_retry_delay_seconds integer,
  p_completion_idempotency_key text,
  p_output_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_job public.import_automation_jobs%rowtype;
  v_terminal boolean;
begin
  select * into v_job from public.import_automation_jobs where id=p_job_id for update;
  if not found then return jsonb_build_object('status','rejected','reason','automation_job_not_found'); end if;
  if v_job.completion_idempotency_key = btrim(p_completion_idempotency_key)
    and v_job.completion_result = p_result and v_job.completion_output_hash = p_output_hash then
    return public.import_automation_job_readback(p_job_id) || jsonb_build_object('status','replayed');
  end if;
  if p_result not in ('waiting_review','succeeded','failed_retryable','failed_terminal','deferred_budget','cancelled')
    or coalesce(p_output_hash,'') !~ '^[a-f0-9]{64}$'
    or char_length(btrim(coalesce(p_completion_idempotency_key,''))) not between 16 and 240
    or (p_result='failed_retryable' and (p_retry_delay_seconds not between 5 and 300))
    or (p_result<>'failed_retryable' and p_retry_delay_seconds is not null) then
    return jsonb_build_object('status','rejected','reason','automation_completion_contract_invalid');
  end if;
  if coalesce(p_lease_token,'') !~ '^[a-f0-9]{64}$'
    or not public.import_automation_lease_is_valid(p_job_id,p_worker_subject,p_worker_instance,p_lease_token,p_lease_epoch)
    or v_job.status <> 'running' then
    return jsonb_build_object('status','stale_lease','reason','automation_lease_fenced');
  end if;
  v_terminal := p_result in ('waiting_review','succeeded','failed_terminal','deferred_budget','cancelled');
  update public.import_automation_jobs set
    status=p_result,
    scheduled_for=case when p_result='failed_retryable' then clock_timestamp()+make_interval(secs=>p_retry_delay_seconds) else scheduled_for end,
    completion_idempotency_key=btrim(p_completion_idempotency_key),
    completion_result=p_result, completion_output_hash=p_output_hash,
    lease_owner_subject=null, worker_instance=null, lease_token_digest=null,
    lease_expires_at=null, heartbeat_at=null,
    finished_at=case when v_terminal then clock_timestamp() else null end,
    updated_at=clock_timestamp()
  where id=p_job_id;

  if p_result in ('waiting_review','succeeded','failed_terminal') then
    insert into public.import_automation_notification_outbox (
      job_id,event_type,template_id,locale,bounded_status,hashed_reference,deduplication_key
    ) values (
      p_job_id,'automation_job_'||p_result,'automation-job-status-v1','en',p_result,
      v_job.target_reference_hash,btrim(p_completion_idempotency_key)
    );
  end if;
  insert into public.import_automation_audit_events (
    event_type,actor_type,actor_hash,job_id,scope,result_code,request_hash,lease_epoch
  ) values (
    'automation_job_completed','service',encode(extensions.digest(p_worker_subject,'sha256'),'hex'),
    p_job_id,'job:complete',p_result,p_output_hash,p_lease_epoch
  );
  return public.import_automation_job_readback(p_job_id) || jsonb_build_object('status','completed');
end;
$$;

create or replace function public.import_automation_cancel_job(
  p_actor_profile_id uuid,
  p_job_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_job public.import_automation_jobs%rowtype;
begin
  if not exists (select 1 from public.profiles where id=p_actor_profile_id and is_platform_admin)
    or char_length(btrim(coalesce(p_reason,''))) not between 8 and 500 then
    return jsonb_build_object('status','rejected','reason','automation_cancel_not_authorized');
  end if;
  select * into v_job from public.import_automation_jobs where id=p_job_id for update;
  if not found then return jsonb_build_object('status','rejected','reason','automation_job_not_found'); end if;
  if v_job.status='cancelled' then
    return public.import_automation_job_readback(p_job_id) || jsonb_build_object('status','replayed');
  end if;
  if v_job.status in ('waiting_review','succeeded','failed_terminal') then
    return jsonb_build_object('status','conflict','reason','automation_cancel_transition_invalid');
  end if;
  update public.import_automation_jobs set
    status='cancelled', lease_epoch=lease_epoch+1,
    lease_owner_subject=null, worker_instance=null, lease_token_digest=null,
    lease_expires_at=null, heartbeat_at=null,
    finished_at=clock_timestamp(), updated_at=clock_timestamp()
  where id=p_job_id;
  insert into public.import_automation_audit_events (
    event_type,actor_type,actor_hash,job_id,scope,result_code,lease_epoch
  ) values (
    'automation_job_cancelled','admin',encode(extensions.digest(p_actor_profile_id::text,'sha256'),'hex'),
    p_job_id,'job:cancel','cancelled',v_job.lease_epoch+1
  );
  return public.import_automation_job_readback(p_job_id) || jsonb_build_object('status','cancelled');
end;
$$;

create or replace function public.import_automation_set_control(
  p_actor_profile_id uuid,
  p_control_kind text,
  p_control_target text,
  p_enabled boolean,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_key text;
  v_epoch bigint;
begin
  if not exists (select 1 from public.profiles where id=p_actor_profile_id and is_platform_admin)
    or p_enabled is null
    or char_length(btrim(coalesce(p_reason,''))) not between 8 and 500
    or p_control_kind not in ('global','family','source','ai','notifications')
    or (p_control_kind='family' and p_control_target<>'pharmacy')
    or (p_control_kind='source' and char_length(btrim(coalesce(p_control_target,''))) not between 1 and 120)
    or (p_control_kind in ('global','ai','notifications') and p_control_target is not null) then
    return jsonb_build_object('status','rejected','reason','automation_control_change_invalid');
  end if;
  v_key := case when p_control_kind in ('global','ai','notifications') then p_control_kind
    else p_control_kind || ':' || btrim(p_control_target) end;
  insert into public.import_automation_controls (
    control_key,control_kind,control_target,enabled,updated_by_profile_id
  ) values (
    v_key,p_control_kind,case when p_control_kind in ('global','ai','notifications') then null else btrim(p_control_target) end,
    p_enabled,p_actor_profile_id
  ) on conflict (control_key) do update set
    enabled=excluded.enabled,
    control_epoch=public.import_automation_controls.control_epoch+1,
    updated_by_profile_id=excluded.updated_by_profile_id,
    updated_at=clock_timestamp()
  returning control_epoch into v_epoch;

  if not p_enabled and p_control_kind in ('global','family','source') then
    update public.import_automation_jobs set
      status='cancelled', lease_epoch=lease_epoch+1,
      lease_owner_subject=null, worker_instance=null, lease_token_digest=null,
      lease_expires_at=null, heartbeat_at=null, finished_at=clock_timestamp(), updated_at=clock_timestamp()
    where status in ('leased','running')
      and (p_control_kind='global'
        or (p_control_kind='family' and family=p_control_target)
        or (p_control_kind='source' and source_policy_id=p_control_target));
  end if;
  insert into public.import_automation_audit_events (
    event_type,actor_type,actor_hash,scope,result_code
  ) values (
    'automation_control_changed','admin',encode(extensions.digest(p_actor_profile_id::text,'sha256'),'hex'),
    v_key,case when p_enabled then 'enabled' else 'disabled' end
  );
  return jsonb_build_object('status','updated','controlKey',v_key,'enabled',p_enabled,'controlEpoch',v_epoch);
end;
$$;

create or replace function public.import_automation_configure_service_identity(
  p_actor_profile_id uuid,
  p_subject text,
  p_active_key_ids text[],
  p_active boolean,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if not exists (select 1 from public.profiles where id=p_actor_profile_id and is_platform_admin)
    or p_active is null or p_active_key_ids is null
    or p_subject not in ('urn:drkhaleej:service:worker-preview','urn:drkhaleej:service:n8n-preview')
    or cardinality(p_active_key_ids) not between 1 and 2
    or exists (select 1 from unnest(p_active_key_ids) kid where kid !~ '^(worker-preview|n8n-preview)-[0-9]{8}-[0-9]{2}$')
    or (p_subject='urn:drkhaleej:service:worker-preview' and exists (
      select 1 from unnest(p_active_key_ids) kid where kid !~ '^worker-preview-'
    ))
    or (p_subject='urn:drkhaleej:service:n8n-preview' and exists (
      select 1 from unnest(p_active_key_ids) kid where kid !~ '^n8n-preview-'
    ))
    or char_length(btrim(coalesce(p_reason,''))) not between 8 and 500 then
    return jsonb_build_object('status','rejected','reason','automation_identity_configuration_invalid');
  end if;
  update public.import_automation_service_identities set
    active_key_ids=p_active_key_ids,active=p_active,
    updated_by_profile_id=p_actor_profile_id,updated_at=clock_timestamp()
  where subject=p_subject;
  if not found then return jsonb_build_object('status','rejected','reason','automation_identity_unknown'); end if;
  return jsonb_build_object('status','updated','subject',p_subject,'active',p_active);
end;
$$;

revoke all on function public.import_automation_job_readback(uuid) from public, anon, authenticated;
revoke all on function public.import_automation_accept_service_request(text,text,text,text,text,text,text,text,uuid,uuid,bigint,timestamptz) from public, anon, authenticated;
revoke all on function public.import_automation_create_job(text,text,text,text,text,text,text,text,text,text,integer,integer,timestamptz,text) from public, anon, authenticated;
revoke all on function public.import_automation_lease_is_valid(uuid,text,uuid,text,bigint) from public, anon, authenticated, service_role;
revoke all on function public.import_automation_claim_job(text,uuid,text[]) from public, anon, authenticated;
revoke all on function public.import_automation_start_job(uuid,text,uuid,text,bigint) from public, anon, authenticated;
revoke all on function public.import_automation_heartbeat_job(uuid,text,uuid,text,bigint) from public, anon, authenticated;
revoke all on function public.import_automation_write_job_artifact(uuid,text,uuid,text,bigint,text,text,text,text) from public, anon, authenticated;
revoke all on function public.import_automation_complete_job(uuid,text,uuid,text,bigint,text,integer,text,text) from public, anon, authenticated;
revoke all on function public.import_automation_cancel_job(uuid,uuid,text) from public, anon, authenticated;
revoke all on function public.import_automation_set_control(uuid,text,text,boolean,text) from public, anon, authenticated;
revoke all on function public.import_automation_configure_service_identity(uuid,text,text[],boolean,text) from public, anon, authenticated;

grant execute on function public.import_automation_job_readback(uuid) to service_role;
grant execute on function public.import_automation_accept_service_request(text,text,text,text,text,text,text,text,uuid,uuid,bigint,timestamptz) to service_role;
grant execute on function public.import_automation_create_job(text,text,text,text,text,text,text,text,text,text,integer,integer,timestamptz,text) to service_role;
grant execute on function public.import_automation_claim_job(text,uuid,text[]) to service_role;
grant execute on function public.import_automation_start_job(uuid,text,uuid,text,bigint) to service_role;
grant execute on function public.import_automation_heartbeat_job(uuid,text,uuid,text,bigint) to service_role;
grant execute on function public.import_automation_write_job_artifact(uuid,text,uuid,text,bigint,text,text,text,text) to service_role;
grant execute on function public.import_automation_complete_job(uuid,text,uuid,text,bigint,text,integer,text,text) to service_role;
grant execute on function public.import_automation_cancel_job(uuid,uuid,text) to service_role;
grant execute on function public.import_automation_set_control(uuid,text,text,boolean,text) to service_role;
grant execute on function public.import_automation_configure_service_identity(uuid,text,text[],boolean,text) to service_role;

comment on table public.import_automation_jobs is
  'AUTOMATION-JOB-RUNTIME Preview-only queue. Atomic claim, 60-second leases, 20-second heartbeat contract, epoch fencing and all switches disabled by default. No downstream authority.';
comment on function public.import_automation_claim_job(text,uuid,text[]) is
  'Atomically claims at most one eligible Preview report probe with FOR UPDATE SKIP LOCKED, increments lease_epoch and returns a random 256-bit lease token once. Other executor types remain activation-closed.';
comment on function public.import_automation_complete_job(uuid,text,uuid,text,bigint,text,integer,text,text) is
  'Fenced completion and bounded outbox in one transaction. No notification delivery and no canonical/publish/rollback/promotion authority.';
