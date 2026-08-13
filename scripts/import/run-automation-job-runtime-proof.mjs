#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;
const schemaVersion = 'drkhaleej.import.automationJobRuntimeProof.v1';
const evidencePath = process.env.AUTOMATION_JOB_RUNTIME_EVIDENCE_PATH ??
  'artifacts/automation-job-runtime/proof.json';
const workerSubject = 'urn:drkhaleej:service:worker-preview';
const n8nSubject = 'urn:drkhaleej:service:n8n-preview';

function assert(condition, message) { if (!condition) throw new Error(message); }
function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}
function digest(value) { return createHash('sha256').update(String(value)).digest('hex'); }
function deterministicUuid(seed) {
  const hex = digest(seed).slice(0, 32).split('');
  hex[12] = '4';
  hex[16] = ((Number.parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)]
    .map((part) => part.join('')).join('-');
}
function verifyPreviewIdentity(databaseUrl, previewRef, productionRef) {
  assert(previewRef !== productionRef, 'Preview and Production refs must differ.');
  const parsed = new URL(databaseUrl);
  assert(parsed.protocol === 'postgresql:', 'AUTOMATION-JOB-RUNTIME proof requires postgresql.');
  assert(parsed.port === '5432', 'AUTOMATION-JOB-RUNTIME proof requires Session pooler port 5432.');
  assert(parsed.hostname.endsWith('.pooler.supabase.com'), 'AUTOMATION-JOB-RUNTIME proof requires the isolated Supabase Session pooler.');
  assert(decodeURIComponent(parsed.username) === `postgres.${previewRef}`, 'Database identity does not match Preview.');
  assert(!databaseUrl.includes(productionRef), 'Production identity appeared in Preview URL.');
}
function connectionConfig(databaseUrl, name) {
  return {
    connectionString: databaseUrl,
    application_name: name,
    ssl: { rejectUnauthorized: false },
    keepAlive: true,
    statement_timeout: 45_000,
    query_timeout: 50_000,
    connectionTimeoutMillis: 15_000,
  };
}
async function result(client, sql, params = []) {
  const response = await client.query(sql, params);
  return response.rows[0]?.result;
}

async function verifySchema(client) {
  const ledger = await client.query(
    `select version::text as version from supabase_migrations.schema_migrations where version::text = '0095'`,
  );
  assert(ledger.rowCount === 1, 'Preview migration ledger must contain exactly one 0095.');

  const migration = await readFile('supabase/migrations/0095_import_automation_job_runtime.sql', 'utf8');
  assert(migration.toLowerCase().includes('for update skip locked'), 'Atomic claim declaration drifted.');
  const tables = await client.query(
    `select c.relname, c.relrowsecurity,
       has_table_privilege('service_role', c.oid, 'SELECT') as service_select,
       has_table_privilege('authenticated', c.oid, 'SELECT') as authenticated_select
     from pg_catalog.pg_class c
     join pg_catalog.pg_namespace n on n.oid=c.relnamespace
     where n.nspname='public' and c.relname = any($1::text[])
     order by c.relname`,
    [[
      'import_automation_controls', 'import_automation_service_identities',
      'import_automation_request_replays', 'import_automation_jobs',
      'import_automation_job_artifacts', 'import_automation_notification_outbox',
      'import_automation_audit_events',
    ]],
  );
  assert(tables.rowCount === 7 && tables.rows.every((row) => row.relrowsecurity &&
    !row.service_select && !row.authenticated_select), 'Automation table RLS/grant boundary drifted.');

  const functions = await client.query(
    `select p.proname, p.prosecdef,
       exists (
         select 1 from unnest(coalesce(p.proconfig, '{}'::text[])) setting
         where replace(setting, ' ', '')='search_path=pg_catalog,public'
       ) as search_path_pinned,
       has_function_privilege('service_role', p.oid, 'EXECUTE') as service_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute
     from pg_catalog.pg_proc p
     join pg_catalog.pg_namespace n on n.oid=p.pronamespace
     where n.nspname='public' and p.proname like 'import_automation_%'
     order by p.proname`,
  );
  const expected = new Set([
    'import_automation_accept_service_request', 'import_automation_cancel_job',
    'import_automation_claim_job', 'import_automation_complete_job',
    'import_automation_configure_service_identity', 'import_automation_create_job',
    'import_automation_heartbeat_job', 'import_automation_job_readback',
    'import_automation_lease_is_valid', 'import_automation_set_control',
    'import_automation_start_job', 'import_automation_write_job_artifact',
  ]);
  assert(functions.rowCount === expected.size && functions.rows.every((row) => expected.has(row.proname) &&
    row.prosecdef && row.search_path_pinned && !row.authenticated_execute), 'Automation RPC inventory/security drifted.');
  assert(functions.rows.every((row) => row.proname === 'import_automation_lease_is_valid' ?
    !row.service_execute : row.service_execute), 'Automation service-role grants drifted.');
}

async function snapshotBoundary(client) {
  const controls = await client.query(
    `select control_key, enabled, control_epoch, updated_by_profile_id, updated_at
     from public.import_automation_controls where control_key in ('global','family:pharmacy') order by control_key`,
  );
  const identities = await client.query(
    `select subject, active_key_ids, active, updated_by_profile_id, updated_at
     from public.import_automation_service_identities where subject in ($1,$2) order by subject`,
    [n8nSubject, workerSubject],
  );
  assert(controls.rowCount === 2 && controls.rows.every((row) => row.enabled === false),
    'Automation controls must be disabled before the isolated proof.');
  assert(identities.rowCount === 2 && identities.rows.every((row) => row.active === false && row.active_key_ids.length === 0),
    'Automation identities must be inactive before the isolated proof.');
  return { controls: controls.rows, identities: identities.rows };
}

async function openBoundary(client, fixture) {
  await client.query(
    `update public.import_automation_controls set enabled=true, control_epoch=control_epoch+1,
       updated_by_profile_id=null, updated_at=clock_timestamp()
     where control_key in ('global','family:pharmacy')`,
  );
  await client.query(
    `insert into public.import_automation_controls (
       control_key,control_kind,control_target,enabled,control_epoch,updated_by_profile_id
     ) values ($1,'source',$2,true,1,null)`,
    [fixture.sourceControlKey, fixture.sourcePolicyId],
  );
  await client.query(
    `update public.import_automation_service_identities set active=true, active_key_ids=$2::text[],
       updated_by_profile_id=null, updated_at=clock_timestamp() where subject=$1`,
    [n8nSubject, [fixture.n8nKeyId]],
  );
  await client.query(
    `update public.import_automation_service_identities set active=true, active_key_ids=$2::text[],
       updated_by_profile_id=null, updated_at=clock_timestamp() where subject=$1`,
    [workerSubject, [fixture.workerKeyId]],
  );
}

async function proveReplay(client, fixture) {
  const params = [
    n8nSubject, n8nSubject, fixture.n8nKeyId, fixture.jtiDigest, 'job:create', 'POST',
    '/api/internal/automation', fixture.requestHash, null, null, null,
    new Date(Date.now() + 240_000).toISOString(),
  ];
  const first = await result(client,
    `select public.import_automation_accept_service_request(
       $1,$2,$3,$4,$5,$6,$7,$8,$9::uuid,$10::uuid,$11::bigint,$12::timestamptz
     ) as result`, params);
  const replay = await result(client,
    `select public.import_automation_accept_service_request(
       $1,$2,$3,$4,$5,$6,$7,$8,$9::uuid,$10::uuid,$11::bigint,$12::timestamptz
     ) as result`, params);
  assert(first?.status === 'accepted', 'First service request was not accepted.');
  assert(replay?.status === 'rejected' && replay?.reason === 'service_request_replayed',
    'One-use jti replay did not fail closed with service_request_replayed.');
  return true;
}

async function createJob(client, fixture) {
  const created = await result(client,
    `select public.import_automation_create_job(
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::timestamptz,$14
     ) as result`,
    [
      n8nSubject, '1.2.2', 'entity-policy-2026-01', 'report', 'pharmacy', 'om',
      null, fixture.targetHash, fixture.inputHash, fixture.jobKey,
      50, 3, new Date(Date.now() - 1_000).toISOString(), 'Isolated Preview lease and fencing proof.',
    ]);
  assert(created?.status === 'created' && created?.jobType === 'report' && created?.attemptCount === 0 &&
    created?.publishAllowed === false && created?.rollbackAllowed === false &&
    created?.productionAllowed === false && created?.aiAllowed === false,
  'Bounded Job creation/readback drifted.');
  fixture.jobId = created.jobId;
  return created;
}

async function claim(client, workerInstance) {
  return result(client,
    `select public.import_automation_claim_job($1,$2::uuid,$3::text[]) as result`,
    [workerSubject, workerInstance, ['report']]);
}
async function start(client, lease) {
  return result(client,
    `select public.import_automation_start_job($1::uuid,$2,$3::uuid,$4,$5::bigint) as result`,
    [lease.jobId, workerSubject, lease.workerInstance, lease.leaseToken, lease.leaseEpoch]);
}
async function heartbeat(client, lease) {
  return result(client,
    `select public.import_automation_heartbeat_job($1::uuid,$2,$3::uuid,$4,$5::bigint) as result`,
    [lease.jobId, workerSubject, lease.workerInstance, lease.leaseToken, lease.leaseEpoch]);
}
async function artifact(client, lease, fixture) {
  return result(client,
    `select public.import_automation_write_job_artifact(
       $1::uuid,$2,$3::uuid,$4,$5::bigint,$6,$7,$8,$9
     ) as result`,
    [lease.jobId, workerSubject, lease.workerInstance, lease.leaseToken, lease.leaseEpoch,
      'report:write', 'report', fixture.artifactHash, fixture.artifactKey]);
}
async function complete(client, lease, fixture) {
  return result(client,
    `select public.import_automation_complete_job(
       $1::uuid,$2,$3::uuid,$4,$5::bigint,$6,$7::integer,$8,$9
     ) as result`,
    [lease.jobId, workerSubject, lease.workerInstance, lease.leaseToken, lease.leaseEpoch,
      'waiting_review', null, fixture.completionKey, fixture.outputHash]);
}

async function runLeaseProof(admin, left, right, fixture) {
  const outcomes = await Promise.all([
    claim(left, fixture.workerOne),
    claim(right, fixture.workerTwo),
  ]);
  const claimedIndex = outcomes.findIndex((item) => item?.status === 'claimed');
  const emptyIndex = outcomes.findIndex((item) => item?.status === 'empty');
  assert(claimedIndex >= 0 && emptyIndex >= 0 && claimedIndex !== emptyIndex,
    'Concurrent FOR UPDATE SKIP LOCKED claim did not produce exactly one lease.');
  const originalClient = claimedIndex === 0 ? left : right;
  const reclaimClient = claimedIndex === 0 ? right : left;
  const originalLease = outcomes[claimedIndex];
  assert(/^[a-f0-9]{64}$/.test(originalLease.leaseToken) && originalLease.leaseEpoch === 1 &&
    originalLease.attemptCount === 1, 'Initial 256-bit lease contract drifted.');
  const running = await start(originalClient, originalLease);
  assert(running?.status === 'running', 'Initial lease did not transition to running.');

  await admin.query(
    `update public.import_automation_jobs set lease_expires_at=clock_timestamp()-interval '1 second'
     where id=$1`, [fixture.jobId]);
  const reclaimed = await claim(reclaimClient, claimedIndex === 0 ? fixture.workerTwo : fixture.workerOne);
  assert(reclaimed?.status === 'claimed' && reclaimed?.leaseEpoch === 2 && reclaimed?.attemptCount === 2 &&
    reclaimed?.leaseToken !== originalLease.leaseToken, 'Expired active Job was not fenced and reclaimed.');

  const staleHeartbeat = await heartbeat(originalClient, originalLease);
  const staleArtifact = await artifact(originalClient, originalLease, fixture);
  const staleCompletion = await complete(originalClient, originalLease, fixture);
  assert([staleHeartbeat, staleArtifact, staleCompletion].every((item) =>
    item?.status === 'stale_lease' && item?.reason === 'automation_lease_fenced'),
  'Old Worker writes did not fail closed with automation_lease_fenced.');

  const restarted = await start(reclaimClient, reclaimed);
  assert(restarted?.status === 'running', 'Reclaimed lease did not transition to running.');
  const storedArtifact = await artifact(reclaimClient, reclaimed, fixture);
  assert(storedArtifact?.status === 'created' && storedArtifact?.payloadHash === fixture.artifactHash,
    'Bounded hash-only artifact write drifted.');
  const completed = await complete(reclaimClient, reclaimed, fixture);
  const replayed = await complete(reclaimClient, reclaimed, fixture);
  assert(completed?.status === 'completed' && completed?.outboxCount === 1 &&
    replayed?.status === 'replayed' && replayed?.outboxCount === 1,
  'Atomic completion/outbox idempotency drifted.');
  const persisted = await admin.query(
    `select j.status, j.attempt_count, j.lease_epoch,
       (select count(*)::int from public.import_automation_job_artifacts a where a.job_id=j.id) artifact_count,
       (select count(*)::int from public.import_automation_notification_outbox o where o.job_id=j.id) outbox_count
     from public.import_automation_jobs j where j.id=$1`, [fixture.jobId]);
  assert(persisted.rows[0]?.status === 'waiting_review' && persisted.rows[0]?.attempt_count === 2 &&
    Number(persisted.rows[0]?.lease_epoch) === 2 && persisted.rows[0]?.artifact_count === 1 &&
    persisted.rows[0]?.outbox_count === 1, 'Persisted lease/artifact/outbox state drifted.');
  return {
    concurrentClaimWinnerCount: 1,
    expiredLeaseReclaimed: true,
    staleHeartbeatFenced: true,
    staleArtifactFenced: true,
    staleCompletionFenced: true,
    artifactRows: 1,
    outboxRows: 1,
    completionReplayRowsAdded: 0,
  };
}

async function cleanup(client, fixture, snapshot) {
  const jobs = `select id from public.import_automation_jobs where idempotency_key=$1`;
  await client.query(
    `delete from public.import_automation_audit_events
     where job_id in (${jobs}) or request_hash=$2`, [fixture.jobKey, fixture.requestHash]);
  await client.query(
    `delete from public.import_automation_notification_outbox where job_id in (${jobs})`, [fixture.jobKey]);
  await client.query(
    `delete from public.import_automation_job_artifacts where job_id in (${jobs})`, [fixture.jobKey]);
  await client.query(`delete from public.import_automation_jobs where idempotency_key=$1`, [fixture.jobKey]);
  await client.query(
    `delete from public.import_automation_request_replays where issuer=$1 and jti_digest=$2`,
    [n8nSubject, fixture.jtiDigest]);
  await client.query(`delete from public.import_automation_controls where control_key=$1`, [fixture.sourceControlKey]);
  for (const row of snapshot.controls) {
    await client.query(
      `update public.import_automation_controls set enabled=$2, control_epoch=$3,
       updated_by_profile_id=$4, updated_at=$5 where control_key=$1`,
      [row.control_key, row.enabled, row.control_epoch, row.updated_by_profile_id, row.updated_at]);
  }
  for (const row of snapshot.identities) {
    await client.query(
      `update public.import_automation_service_identities set active_key_ids=$2::text[], active=$3,
       updated_by_profile_id=$4, updated_at=$5 where subject=$1`,
      [row.subject, row.active_key_ids, row.active, row.updated_by_profile_id, row.updated_at]);
  }
}

async function verifyCleanup(client, fixture) {
  const remaining = await client.query(
    `select
       (select count(*)::int from public.import_automation_jobs where idempotency_key=$1) jobs,
       (select count(*)::int from public.import_automation_request_replays where issuer=$2 and jti_digest=$3) replays,
       (select count(*)::int from public.import_automation_controls where control_key=$4) controls,
       (select count(*)::int from public.import_automation_controls where control_key in ('global','family:pharmacy') and enabled) enabled_controls,
       (select count(*)::int from public.import_automation_service_identities where subject in ($2,$5) and (active or cardinality(active_key_ids)>0)) active_identities`,
    [fixture.jobKey, n8nSubject, fixture.jtiDigest, fixture.sourceControlKey, workerSubject]);
  assert(Object.values(remaining.rows[0] ?? {}).every((value) => value === 0),
    'Rollback cleanup left AUTOMATION-JOB-RUNTIME fixture rows.');
}

async function main() {
  const databaseUrl = required('AUTOMATION_JOB_RUNTIME_PREVIEW_DATABASE_URL');
  const previewRef = required('AUTOMATION_JOB_RUNTIME_PREVIEW_PROJECT_REF');
  const productionRef = required('AUTOMATION_JOB_RUNTIME_PRODUCTION_PROJECT_REF');
  const headSha = required('AUTOMATION_JOB_RUNTIME_SOURCE_COMMIT');
  verifyPreviewIdentity(databaseUrl, previewRef, productionRef);
  const runId = process.env.GITHUB_RUN_ID ?? `local-${Date.now()}`;
  const seed = `automation-job-runtime:${runId}:${headSha}`;
  const suffix = digest(seed).slice(0, 24);
  const fixture = {
    sourcePolicyId: `preview-proof-${suffix}`,
    sourceControlKey: `source:preview-proof-${suffix}`,
    n8nKeyId: 'n8n-preview-20260812-01',
    workerKeyId: 'worker-preview-20260812-01',
    jtiDigest: digest(`${seed}:jti`),
    requestHash: digest(`${seed}:request`),
    targetHash: digest(`${seed}:target`),
    inputHash: digest(`${seed}:input`),
    artifactHash: digest(`${seed}:artifact`),
    outputHash: digest(`${seed}:output`),
    jobKey: `automation-job-${suffix}`,
    artifactKey: `automation-artifact-${suffix}`,
    completionKey: `automation-completion-${suffix}`,
    workerOne: deterministicUuid(`${seed}:worker-one`),
    workerTwo: deterministicUuid(`${seed}:worker-two`),
    jobId: null,
  };
  const admin = new Client(connectionConfig(databaseUrl, 'drkhaleej-automation-runtime-proof-admin'));
  const left = new Client(connectionConfig(databaseUrl, 'drkhaleej-automation-runtime-proof-worker-left'));
  const right = new Client(connectionConfig(databaseUrl, 'drkhaleej-automation-runtime-proof-worker-right'));
  let snapshot;
  let proof;
  try {
    await Promise.all([admin.connect(), left.connect(), right.connect()]);
    await verifySchema(admin);
    snapshot = await snapshotBoundary(admin);
    await openBoundary(admin, fixture);
    await Promise.all([left.query('set role service_role'), right.query('set role service_role')]);
    const replayProtected = await proveReplay(left, fixture);
    await createJob(left, fixture);
    proof = { replayProtected, ...(await runLeaseProof(admin, left, right, fixture)) };
  } finally {
    await Promise.all([
      left.query('reset role').catch(() => {}),
      right.query('reset role').catch(() => {}),
    ]);
    if (snapshot) await cleanup(admin, fixture, snapshot);
    await Promise.all([left.end().catch(() => {}), right.end().catch(() => {})]);
  }
  await verifyCleanup(admin, fixture);
  await mkdir(path.dirname(evidencePath), { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify({
    schemaVersion,
    headSha,
    previewProjectRefHash: digest(previewRef),
    productionDisconnected: true,
    migration: '0095',
    schemaVerified: true,
    rollbackCleanupVerified: true,
    proof,
  }, null, 2)}\n`);
  await admin.end();
  console.log('AUTOMATION-JOB-RUNTIME hosted proof passed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
