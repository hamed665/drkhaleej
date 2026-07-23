#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const root = process.cwd();
const reservationAuditSchemaVersion = 'drkhaleej.import.publishAudit.v2';
const evidencePath = path.resolve(
  root,
  process.env.P03_EVIDENCE_PATH || 'artifacts/p03/res-db-safety-proof.json',
);
const faultSqlPath = path.join(root, 'scripts/import/sql/p03-reservation-fault-injection.sql');
const migrationDir = path.join(root, 'supabase/migrations');
const requiredFaultBoundaries = [
  'reservation_insert',
  'snapshot_insert',
  'audit_insert',
  'authorization_update',
];
const transientConnectionCodes = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'EPIPE',
  'ETIMEDOUT',
  '57P01',
  '57P02',
  '57P03',
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required; P03 never skips real Preview database proof.`);
  return value;
}

function digest(value) {
  return createHash('sha256').update(value).digest('hex');
}

function deterministicUuid(value) {
  const chars = digest(value).slice(0, 32).split('');
  chars[12] = '4';
  chars[16] = '8';
  const hex = chars.join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function connectionConfig(connectionString, applicationName) {
  const parsed = new URL(connectionString);
  const local = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  return {
    connectionString,
    application_name: applicationName,
    ssl: local ? false : { rejectUnauthorized: false },
    keepAlive: true,
    keepAliveInitialDelayMillis: 5_000,
    statement_timeout: 30_000,
    query_timeout: 35_000,
  };
}

function isTransientConnectionError(error) {
  const code = typeof error?.code === 'string' ? error.code.toUpperCase() : '';
  const message = error instanceof Error ? error.message : String(error || '');
  return code.startsWith('08')
    || transientConnectionCodes.has(code)
    || /connection terminated|connection reset|connection timeout|server closed the connection|socket hang up/i.test(message);
}

async function openCheckedClient(connectionString, applicationName) {
  const client = new Client(connectionConfig(connectionString, applicationName));
  let idleConnectionError;
  client.on('error', (error) => {
    idleConnectionError ||= error;
  });
  try {
    await client.connect();
    const ready = await client.query({
      text: `select 1 as p03_connection_ready,
                    pg_backend_pid()::int as backend_pid,
                    set_config('application_name', $1, false) as application_name`,
      values: [applicationName],
      query_timeout: 5_000,
    });
    assert(
      ready.rows[0]?.application_name === applicationName,
      'P03 database session did not retain its bounded application identity.',
    );
    const backendPid = ready.rows[0]?.backend_pid;
    assert(Number.isInteger(backendPid) && backendPid > 0, 'P03 could not resolve the PostgreSQL backend identity.');
    if (idleConnectionError) throw idleConnectionError;
    return {
      client,
      backendPid,
      getIdleConnectionError: () => idleConnectionError,
    };
  } catch (error) {
    await client.end().catch(() => {});
    throw error;
  }
}

async function withFreshClient(connectionString, applicationName, callback) {
  const { client, getIdleConnectionError } = await openCheckedClient(
    connectionString,
    applicationName,
  );
  try {
    const result = await callback(client);
    const idleConnectionError = getIdleConnectionError();
    if (idleConnectionError) throw idleConnectionError;
    return result;
  } finally {
    await client.end().catch(() => {});
  }
}

async function runStage(label, callback) {
  const started = Date.now();
  console.log(`P03 stage ${label} started.`);
  try {
    const result = await callback();
    console.log(`P03 stage ${label} passed in ${Date.now() - started}ms.`);
    return result;
  } catch (error) {
    if (error && typeof error === 'object') error.p03Stage = label;
    throw error;
  }
}

function verifyPreviewIdentity(connectionString, expectedProjectRef, productionProjectRef) {
  const parsed = new URL(connectionString);
  assert(['postgres:', 'postgresql:'].includes(parsed.protocol), 'P03 database URL must use PostgreSQL.');
  assert(expectedProjectRef !== productionProjectRef, 'Preview and Production project references must differ.');
  assert(parsed.port === '' || parsed.port === '5432', 'P03 requires a direct or session-pooler connection, never transaction pooling.');
  const directHost = parsed.hostname === `db.${expectedProjectRef}.supabase.co`;
  const poolerHost = parsed.hostname.endsWith('.pooler.supabase.com');
  const poolerUser = decodeURIComponent(parsed.username) === `postgres.${expectedProjectRef}`;
  assert(
    directHost || (poolerHost && poolerUser),
    'P03 database identity does not match the explicitly configured isolated Preview project.',
  );
  return parsed;
}

function fixture(runId, runRef, label) {
  const seed = `${runId}:${label}`;
  const requestHash = digest(`${seed}:request`);
  const patchHash = digest(`${seed}:patch`);
  const snapshotHash = digest(`${seed}:snapshot`);
  const reviewSnapshotHash = digest(`${seed}:review`);
  const entityFingerprint = digest(`${seed}:fingerprint`);
  const operationAttemptId = deterministicUuid(`${seed}:attempt`);
  return {
    label,
    actorId: deterministicUuid(`${seed}:actor`),
    entityId: deterministicUuid(`${seed}:entity`),
    readStateId: deterministicUuid(`${seed}:read-state`),
    authorizationId: deterministicUuid(`${seed}:authorization`),
    operationAttemptId,
    idempotencyKey: `p03-${runRef}-${digest(`${seed}:idempotency`).slice(0, 20)}`,
    requestHash,
    patchHash,
    snapshotHash,
    reviewSnapshotHash,
    entityFingerprint,
    tokenHash: digest(`${seed}:token`),
    nonceHash: digest(`${seed}:nonce`),
    expectedVersion: `p03-${runRef}-${digest(`${seed}:version`).slice(0, 10)}`,
    slug: `p03-db-safety-${runRef}-${digest(label).slice(0, 10)}`,
    snapshotPayload: {
      status: 'draft',
      is_active: false,
      is_featured: false,
      metadata: {
        visibility: null,
        publicRouteEnabled: null,
        indexable: null,
        sitemapEligible: null,
      },
    },
  };
}

async function expectedMigrationVersions() {
  const files = (await readdir(migrationDir))
    .filter((file) => /^\d{4}_.+\.sql$/.test(file))
    .sort();
  const versions = files.map((file) => file.slice(0, 4));
  assert(versions.length > 0, 'No repository migrations were found.');
  assert(new Set(versions).size === versions.length, 'Repository migration versions are not unique.');
  return versions;
}

async function verifyMigrationLedger(client) {
  const expected = await expectedMigrationVersions();
  const result = await client.query(
    'select version::text as version from supabase_migrations.schema_migrations order by version',
  );
  const actual = result.rows.map((row) => row.version);
  const repositoryShaped = actual.filter((version) => /^\d{4}$/.test(version));
  assert(
    JSON.stringify(repositoryShaped) === JSON.stringify(expected),
    'Preview migration ledger must exactly match repository migrations from 0001 through current.',
  );
  return {
    firstVersion: expected[0],
    lastVersion: expected.at(-1),
    count: expected.length,
    exactlyMatchesRepository: true,
  };
}

async function verifyProductionRpc(client) {
  const signature = [
    'uuid', 'uuid', 'text', 'text', 'text', 'jsonb', 'text', 'text', 'uuid',
    'text', 'text', 'uuid', 'text', 'text', 'text', 'integer', 'integer',
  ].join(',');
  const result = await client.query(
    `select pg_get_functiondef(to_regprocedure($1)) as definition`,
    [`public.import_publish_reserve_snapshot_audit(${signature})`],
  );
  const definition = result.rows[0]?.definition;
  assert(definition, 'Canonical reservation RPC is missing from the Preview database.');
  const normalizedDefinition = definition.toLowerCase();
  for (const token of [
    'for update',
    'import_publish_idempotency_records',
    'import_publish_rollback_snapshots',
    'import_publish_audit_events',
    "'consumed'",
    "'reservation_created'",
    reservationAuditSchemaVersion,
  ]) {
    assert(normalizedDefinition.includes(token.toLowerCase()), `Canonical reservation RPC is missing required transaction token: ${token}.`);
  }
  return { present: true, definitionSha256: digest(definition) };
}

async function cleanupFixtures(client, fixtures) {
  if (fixtures.length === 0) return;
  const entityIds = fixtures.map((item) => item.entityId);
  const actorIds = fixtures.map((item) => item.actorId);
  const authorizationIds = fixtures.map((item) => item.authorizationId);
  await client.query('begin');
  try {
    await client.query('delete from public.import_publish_audit_events where entity_id = any($1::uuid[])', [entityIds]);
    await client.query('delete from public.import_publish_rollback_snapshots where entity_id = any($1::uuid[])', [entityIds]);
    await client.query(
      `update public.import_pharmacy_publish_authorizations
       set status = 'invalidated', consumed_at = null, consumed_by_reservation_id = null,
           invalidated_at = clock_timestamp(), invalidation_reason = 'p03_cleanup'
       where id = any($1::uuid[])`,
      [authorizationIds],
    );
    await client.query('delete from public.import_publish_idempotency_records where entity_id = any($1::uuid[])', [entityIds]);
    await client.query('delete from public.import_pharmacy_publish_authorizations where id = any($1::uuid[])', [authorizationIds]);
    await client.query('delete from public.import_pharmacy_admin_read_states where entity_id = any($1::uuid[])', [entityIds]);
    await client.query('delete from public.centers where id = any($1::uuid[])', [entityIds]);
    await client.query('delete from public.profiles where id = any($1::uuid[])', [actorIds]);
    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    throw error;
  }
}

async function insertFixture(client, item, runRef) {
  await client.query('begin');
  try {
    await client.query(
      `insert into public.profiles (
         id, full_name, display_name, locale, country, is_platform_admin,
         is_provider_user, is_patient_user, metadata
       ) values ($1, 'P03 DB Safety Actor', 'P03 Safety', 'en', 'om', true, false, false, $2::jsonb)`,
      [item.actorId, JSON.stringify({ p03RunRef: runRef })],
    );
    await client.query(
      `insert into public.centers (
         id, slug, name_en, center_type, status, verification_status,
         default_locale, default_country, is_active, is_claimable, is_featured, metadata
       ) values ($1, $2, 'P03 DB Safety Pharmacy', 'pharmacy', 'draft', 'unverified',
                 'en', 'om', false, false, false, $3::jsonb)`,
      [item.entityId, item.slug, JSON.stringify({ p03RunRef: runRef })],
    );
    await client.query(
      `insert into public.import_pharmacy_admin_read_states (
         id, actor_profile_id, entity_id, operation, snapshot_hash, entity_fingerprint,
         current_state, proposed_state, exact_diff, blocker_codes, reviewed_at, expires_at,
         created_at, operation_attempt_id, idempotency_key, request_hash, patch_hash,
         operation_scope, entity_family, expected_entity_version
       ) values (
         $1, $2, $3, 'review', $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, '{}',
         clock_timestamp(), clock_timestamp() + interval '2 hours', clock_timestamp() - interval '1 minute',
         $9, $10, $11, $12, 'reserve_private_publish', 'pharmacy', $13
       )`,
      [
        item.readStateId, item.actorId, item.entityId, item.reviewSnapshotHash,
        item.entityFingerprint, JSON.stringify(item.snapshotPayload),
        JSON.stringify(item.snapshotPayload), JSON.stringify([]), item.operationAttemptId,
        item.idempotencyKey, item.requestHash, item.patchHash, item.expectedVersion,
      ],
    );
    await client.query(
      `insert into public.import_pharmacy_publish_authorizations (
         id, token_hash, nonce_hash, actor_profile_id, entity_id, review_snapshot_hash,
         entity_fingerprint, issued_at, expires_at, review_state_id, operation_attempt_id,
         idempotency_key, request_hash, patch_hash, expected_entity_version,
         entity_family, operation_scope, status
       ) values (
         $1, $2, $3, $4, $5, $6, $7, clock_timestamp() - interval '1 minute',
         clock_timestamp() + interval '2 hours', $8, $9, $10, $11, $12, $13,
         'pharmacy', 'reserve_private_publish', 'issued'
       )`,
      [
        item.authorizationId, item.tokenHash, item.nonceHash, item.actorId, item.entityId,
        item.reviewSnapshotHash, item.entityFingerprint, item.readStateId,
        item.operationAttemptId, item.idempotencyKey, item.requestHash, item.patchHash,
        item.expectedVersion,
      ],
    );
    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    throw error;
  }
}

async function entityState(client, item) {
  const result = await client.query(
    `select to_jsonb(c) as state from public.centers c where id = $1`,
    [item.entityId],
  );
  assert(result.rowCount === 1, 'Fixture entity is missing.');
  return result.rows[0].state;
}

function rpcValues(item, overrides = {}) {
  return [
    item.entityId,
    item.actorId,
    overrides.idempotencyKey || item.idempotencyKey,
    overrides.requestHash || item.requestHash,
    item.expectedVersion,
    JSON.stringify(item.snapshotPayload),
    item.snapshotHash,
    reservationAuditSchemaVersion,
    item.authorizationId,
    item.reviewSnapshotHash,
    item.entityFingerprint,
    item.operationAttemptId,
    item.patchHash,
    'pharmacy',
    'reserve_private_publish',
    168,
    365,
  ];
}

async function callProductionRpc(client, item, overrides) {
  const result = await client.query(
    `select public.import_publish_reserve_snapshot_audit(
       $1::uuid, $2::uuid, $3::text, $4::text, $5::text, $6::jsonb, $7::text,
       $8::text, $9::uuid, $10::text, $11::text, $12::uuid, $13::text,
       $14::text, $15::text, $16::integer, $17::integer
     ) as result`,
    rpcValues(item, overrides),
  );
  return result.rows[0].result;
}

async function callProductionRpcWithRetry(
  connectionString,
  item,
  overrides,
  label,
  maxAttempts = 3,
) {
  assert(maxAttempts === 3, 'P03 transport recovery must remain bounded to three total attempts.');
  let transientRetries = 0;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const result = await withFreshClient(
        connectionString,
        `${label}-attempt-${attempt}`,
        (client) => callProductionRpc(client, item, overrides),
      );
      return { result, transientRetries };
    } catch (error) {
      if (!isTransientConnectionError(error) || attempt === maxAttempts) throw error;
      transientRetries += 1;
      console.log(`P03 stage ${label} recovered a transient database connection; retry ${transientRetries} of 2.`);
      await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }
  }
  throw new Error('P03 bounded transport recovery exhausted unexpectedly.');
}

async function persistenceCounts(client, item) {
  const result = await client.query(
    `select
       (select count(*)::int from public.import_publish_idempotency_records where entity_id = $1) as reservations,
       (select count(*)::int from public.import_publish_rollback_snapshots where entity_id = $1) as snapshots,
       (select count(*)::int from public.import_publish_audit_events where entity_id = $1) as audits,
       (select count(*)::int from public.import_pharmacy_publish_authorizations
          where id = $2 and status = 'consumed' and consumed_at is not null
            and consumed_by_reservation_id is not null) as consumed_authorizations`,
    [item.entityId, item.authorizationId],
  );
  return result.rows[0];
}

async function runReplayAndConflict(connectionString, item) {
  const before = await withFreshClient(connectionString, 'p03-replay-before', (client) => (
    entityState(client, item)
  ));
  const firstCall = await callProductionRpcWithRetry(
    connectionString,
    item,
    undefined,
    'p03-replay-first',
  );
  const secondCall = await callProductionRpcWithRetry(
    connectionString,
    item,
    undefined,
    'p03-replay-second',
  );
  const conflictCall = await callProductionRpcWithRetry(connectionString, item, {
    requestHash: digest(`${item.requestHash}:different-request`),
  }, 'p03-replay-conflict');
  const first = firstCall.result;
  const second = secondCall.result;
  const conflict = conflictCall.result;
  const { after, counts } = await withFreshClient(
    connectionString,
    'p03-replay-verification',
    async (client) => ({
      after: await entityState(client, item),
      counts: await persistenceCounts(client, item),
    }),
  );

  assert(
    first.status === 'reserved' && (first.replayed === false || firstCall.transientRetries > 0),
    'First request must create one reservation or recover its exact idempotent replay after transport loss.',
  );
  assert(second.status === 'reserved' && second.replayed === true, 'Same request must replay the reservation.');
  assert(first.idempotencyRecordId === second.idempotencyRecordId, 'Replay must return the same reservation reference.');
  assert(first.rollbackSnapshotId === second.rollbackSnapshotId, 'Replay must return the same snapshot reference.');
  assert(first.auditEventId === second.auditEventId, 'Replay must return the same audit reference.');
  assert(conflict.status === 'conflict', 'Different request identity must conflict.');
  assert(conflict.reason === 'authorization_identity_mismatch', 'Conflict reason must be bounded and deterministic.');
  assert(JSON.stringify(before) === JSON.stringify(after), 'Replay/conflict proof mutated the Pharmacy entity.');
  assert(counts.reservations === 1 && counts.snapshots === 1 && counts.audits === 1, 'Replay created duplicate persistence rows.');
  assert(counts.consumed_authorizations === 1, 'Successful reservation did not consume and link exactly one authorization.');

  return {
    firstCreated: true,
    sameRequestReplayed: true,
    sameReferencesReturned: true,
    differentRequestConflicted: true,
    conflictReason: conflict.reason,
    entityUnchanged: true,
    counts,
    transientRetries:
      firstCall.transientRetries + secondCall.transientRetries + conflictCall.transientRetries,
  };
}

async function waitForLockObservation(
  observer,
  participantBackendPids,
  blockerBackendPid,
) {
  const deadline = Date.now() + 8_000;
  while (Date.now() < deadline) {
    const result = await observer.query(
      `select count(*)::int as waiting
       from pg_stat_activity waiting_session
       where (
           waiting_session.pid = any($1::int[])
           or waiting_session.application_name = any($2::text[])
         )
         and waiting_session.wait_event_type = 'Lock'
         and exists (
           select 1
           from pg_stat_activity blocker_session
           where blocker_session.pid = any(pg_blocking_pids(waiting_session.pid))
             and (
               blocker_session.pid = $3::int
               or blocker_session.application_name = $4
             )
         )`,
      [
        participantBackendPids,
        ['p03-concurrent-a', 'p03-concurrent-b'],
        blockerBackendPid,
        'p03-row-lock-blocker',
      ],
    );
    if (result.rows[0].waiting > 0) return true;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return false;
}

async function runConcurrencyProof(connectionString, item) {
  const connections = [];
  try {
    for (const applicationName of [
      'p03-row-lock-blocker',
      'p03-concurrent-a',
      'p03-concurrent-b',
      'p03-concurrency-observer',
    ]) {
      connections.push(await openCheckedClient(connectionString, applicationName));
    }
  } catch (error) {
    await Promise.allSettled(connections.map(({ client }) => client.end()));
    throw error;
  }
  const [blockerConnection, firstConnection, secondConnection, observerConnection] = connections;
  const blocker = blockerConnection.client;
  const firstClient = firstConnection.client;
  const secondClient = secondConnection.client;
  const observer = observerConnection.client;
  try {
    const before = await entityState(observer, item);
    await blocker.query('begin');
    await blocker.query(
      'select id from public.import_pharmacy_publish_authorizations where id = $1 for update',
      [item.authorizationId],
    );

    // Attach rejection handlers at launch time. The lock observer intentionally
    // waits before the blocker commits, so a pooler disconnect during that wait
    // must be captured for the bounded idempotent recovery below instead of
    // becoming an unhandled rejection that terminates the hosted proof.
    const concurrentCallsSettled = Promise.allSettled([
      callProductionRpc(firstClient, item),
      callProductionRpc(secondClient, item),
    ]);
    const lockWaitObserved = await waitForLockObservation(
      observer,
      [firstConnection.backendPid, secondConnection.backendPid],
      blockerConnection.backendPid,
    );
    assert(lockWaitObserved, 'Two-client proof did not observe PostgreSQL row-lock waiting.');
    await blocker.query('commit');
    await observer.end();
    const settled = await concurrentCallsSettled;
    const results = [];
    let transientRetries = 0;
    for (let index = 0; index < settled.length; index += 1) {
      const outcome = settled[index];
      if (outcome.status === 'fulfilled') {
        results.push(outcome.value);
        continue;
      }
      if (!isTransientConnectionError(outcome.reason)) throw outcome.reason;
      transientRetries += 1;
      const recovered = await callProductionRpcWithRetry(
        connectionString,
        item,
        undefined,
        `p03-concurrent-recovery-${index + 1}`,
      );
      transientRetries += recovered.transientRetries;
      results.push(recovered.result);
    }
    const { after, counts } = await withFreshClient(
      connectionString,
      'p03-concurrency-verification',
      async (client) => ({
        after: await entityState(client, item),
        counts: await persistenceCounts(client, item),
      }),
    );
    const created = results.filter((result) => result.status === 'reserved' && result.replayed === false).length;
    const replayed = results.filter((result) => result.status === 'reserved' && result.replayed === true).length;

    assert(results.every((result) => result.status === 'reserved'), 'Concurrent clients must both resolve to the reserved result.');
    assert(
      results[0].idempotencyRecordId === results[1].idempotencyRecordId
        && results[0].rollbackSnapshotId === results[1].rollbackSnapshotId
        && results[0].auditEventId === results[1].auditEventId,
      'Concurrent clients must resolve to the same durable reservation, snapshot, and audit references.',
    );
    assert(
      transientRetries > 0 || (created === 1 && replayed === 1),
      'Without transport recovery, concurrent clients must produce one creation response and one replay response.',
    );
    assert(replayed >= 1, 'Concurrent proof must observe at least one replay response.');
    assert(JSON.stringify(before) === JSON.stringify(after), 'Concurrency proof mutated the Pharmacy entity.');
    assert(counts.reservations === 1 && counts.snapshots === 1 && counts.audits === 1, 'Concurrency produced partial or duplicate rows.');
    assert(counts.consumed_authorizations === 1, 'Concurrency did not consume exactly one authorization.');

    return {
      clients: 2,
      rowLockWaitObserved: true,
      created: 1,
      replayed: 1,
      responseCreatedCount: created,
      responseReplayCount: replayed,
      transientRetries,
      entityUnchanged: true,
      counts,
    };
  } finally {
    if (!blocker.ended) {
      try { await blocker.query('rollback'); } catch {}
    }
    await Promise.allSettled([
      blocker.end(),
      firstClient.end(),
      secondClient.end(),
      observer.ended ? Promise.resolve() : observer.end(),
    ]);
  }
}

async function callFaultWrapper(client, item, boundary) {
  const values = [...rpcValues(item).slice(0, 15), boundary, 168, 365];
  return client.query(
    `select pg_temp.p03_import_publish_reserve_snapshot_audit_fault(
       $1::uuid, $2::uuid, $3::text, $4::text, $5::text, $6::jsonb, $7::text,
       $8::text, $9::uuid, $10::text, $11::text, $12::uuid, $13::text,
       $14::text, $15::text, $16::text, $17::integer, $18::integer
     ) as result`,
    values,
  );
}

async function verifyForcedAbort(client, item) {
  const result = await client.query(
    `select
       (select count(*)::int from public.import_publish_idempotency_records where entity_id = $1) as reservations,
       (select count(*)::int from public.import_publish_rollback_snapshots where entity_id = $1) as snapshots,
       (select count(*)::int from public.import_publish_audit_events where entity_id = $1) as audits,
       (select count(*)::int from public.import_pharmacy_publish_authorizations
          where id = $2 and status = 'issued' and consumed_at is null
            and consumed_by_reservation_id is null and invalidated_at is null) as issued_authorizations`,
    [item.entityId, item.authorizationId],
  );
  return result.rows[0];
}

async function runFaultProof(client, item, boundary) {
  const before = await entityState(client, item);
  await client.query('begin');
  let forced = false;
  try {
    await callFaultWrapper(client, item, boundary);
  } catch (error) {
    forced = error.message === `p03_forced_abort_${boundary}`;
  } finally {
    await client.query('rollback');
  }
  assert(forced, `Fault boundary ${boundary} did not raise its exact forced exception.`);
  const state = await verifyForcedAbort(client, item);
  const after = await entityState(client, item);
  assert(state.reservations === 0 && state.snapshots === 0 && state.audits === 0, `${boundary} left partial persistence rows.`);
  assert(state.issued_authorizations === 1, `${boundary} consumed or invalidated the authorization after rollback.`);
  assert(JSON.stringify(before) === JSON.stringify(after), `${boundary} mutated the Pharmacy entity.`);
  return {
    boundary,
    forcedExceptionObserved: true,
    transactionRolledBack: true,
    authorizationStillIssued: true,
    partialRows: 0,
    entityUnchanged: true,
  };
}

async function verifyGlobalIntegrity(client, fixtures) {
  const entityIds = fixtures.map((item) => item.entityId);
  const result = await client.query(
    `with selected_idempotency as (
       select * from public.import_publish_idempotency_records where entity_id = any($1::uuid[])
     ), selected_snapshots as (
       select * from public.import_publish_rollback_snapshots where entity_id = any($1::uuid[])
     ), selected_audits as (
       select * from public.import_publish_audit_events where entity_id = any($1::uuid[])
     )
     select
       (select count(*)::int from (
          select idempotency_key from selected_idempotency group by idempotency_key having count(*) > 1
        ) duplicate_groups) as duplicates,
       (select count(*)::int from selected_snapshots s
          left join selected_idempotency i on i.id = s.idempotency_record_id where i.id is null)
         +
       (select count(*)::int from selected_audits a
          left join selected_idempotency i on i.id = a.idempotency_record_id where i.id is null)
         +
       (select count(*)::int from selected_audits a
          left join selected_snapshots s on s.id = a.rollback_snapshot_id
          where a.rollback_snapshot_id is not null and s.id is null) as orphans,
       (select count(*)::int from selected_idempotency i
          left join selected_snapshots s on s.idempotency_record_id = i.id
          left join selected_audits a on a.idempotency_record_id = i.id
            and a.rollback_snapshot_id = s.id
            and a.event_type = 'reservation_created'
            and a.schema_version = 'drkhaleej.import.publishAudit.v2'
          where s.id is null or a.id is null) as audit_gaps,
       (select count(*)::int from selected_audits
          where event_type <> 'reservation_created'
            or schema_version <> 'drkhaleej.import.publishAudit.v2'
            or event_payload ->> 'phase' <> 'reservation') as audit_contract_mismatches,
       (select count(*)::int from selected_idempotency i
          left join public.import_pharmacy_publish_authorizations p
            on p.id = i.pharmacy_authorization_id
          where p.id is null or p.status <> 'consumed' or p.consumed_by_reservation_id <> i.id) as incomplete_rows`,
    [entityIds],
  );
  const integrity = result.rows[0];
  assert(
    integrity.duplicates === 0 && integrity.orphans === 0
      && integrity.audit_gaps === 0 && integrity.audit_contract_mismatches === 0
      && integrity.incomplete_rows === 0,
    'Global P03 integrity check found duplicates, orphans, audit gaps, or incomplete rows.',
  );
  return integrity;
}

async function verifyCleanup(client, fixtures) {
  const entityIds = fixtures.map((item) => item.entityId);
  const actorIds = fixtures.map((item) => item.actorId);
  const result = await client.query(
    `select
       (select count(*)::int from public.import_publish_idempotency_records where entity_id = any($1::uuid[]))
       + (select count(*)::int from public.import_publish_rollback_snapshots where entity_id = any($1::uuid[]))
       + (select count(*)::int from public.import_publish_audit_events where entity_id = any($1::uuid[]))
       + (select count(*)::int from public.import_pharmacy_publish_authorizations where entity_id = any($1::uuid[]))
       + (select count(*)::int from public.import_pharmacy_admin_read_states where entity_id = any($1::uuid[]))
       + (select count(*)::int from public.centers where id = any($1::uuid[]))
       + (select count(*)::int from public.profiles where id = any($2::uuid[])) as remaining_rows`,
    [entityIds, actorIds],
  );
  assert(result.rows[0].remaining_rows === 0, 'P03 cleanup left fixture rows behind.');
  return { remainingRows: 0, ttlBounded: true, rerunSafe: true };
}

async function runDeterministicRerunProof(connectionString, item, runRef) {
  await withFreshClient(connectionString, 'p03-rerun-fixture', (client) => (
    insertFixture(client, item, runRef)
  ));
  const before = await withFreshClient(connectionString, 'p03-rerun-before', (client) => (
    entityState(client, item)
  ));
  const rpc = await callProductionRpcWithRetry(
    connectionString,
    item,
    undefined,
    'p03-rerun-reservation',
  );
  const { after, counts } = await withFreshClient(
    connectionString,
    'p03-rerun-verification',
    async (client) => ({
      after: await entityState(client, item),
      counts: await persistenceCounts(client, item),
    }),
  );
  assert(
    rpc.result.status === 'reserved' && (rpc.result.replayed === false || rpc.transientRetries > 0),
    'Deterministic rerun did not create or recover one fresh reservation.',
  );
  assert(counts.reservations === 1 && counts.snapshots === 1 && counts.audits === 1, 'Deterministic rerun did not recreate exact one-row persistence.');
  assert(counts.consumed_authorizations === 1, 'Deterministic rerun did not consume exactly one authorization.');
  assert(JSON.stringify(before) === JSON.stringify(after), 'Deterministic rerun mutated the Pharmacy entity.');
  const cleanup = await withFreshClient(connectionString, 'p03-rerun-cleanup', async (client) => {
    await cleanupFixtures(client, [item]);
    return verifyCleanup(client, [item]);
  });
  return {
    sameFixtureRecreated: true,
    freshReservationCreated: true,
    exactOneRowPersistence: true,
    entityUnchanged: true,
    transientRetries: rpc.transientRetries,
    cleanup,
  };
}

function sanitizeEvidence(evidence, forbiddenValues) {
  const serialized = JSON.stringify(evidence, null, 2);
  assert(!/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i.test(serialized), 'Evidence contains a raw UUID.');
  assert(!/postgres(?:ql)?:\/\//i.test(serialized), 'Evidence contains a database URL.');
  for (const value of forbiddenValues) {
    assert(!serialized.includes(value), 'Evidence contains a forbidden raw identity or secret value.');
  }
  return `${serialized}\n`;
}

async function main() {
  const databaseUrl = requiredEnv('P03_PREVIEW_DATABASE_URL');
  const expectedProjectRef = requiredEnv('P03_PREVIEW_PROJECT_REF');
  const productionProjectRef = requiredEnv('P03_PRODUCTION_PROJECT_REF');
  const runId = requiredEnv('P03_RUN_ID');
  assert(runId.length >= 12 && runId.length <= 240, 'P03_RUN_ID must be 12-240 characters.');
  const parsedUrl = verifyPreviewIdentity(databaseUrl, expectedProjectRef, productionProjectRef);
  const runRef = digest(runId).slice(0, 16);
  const fixtures = [
    fixture(runId, runRef, 'replay-conflict'),
    fixture(runId, runRef, 'concurrency'),
    ...requiredFaultBoundaries.map((boundary) => fixture(runId, runRef, `abort-${boundary}`)),
  ];
  const startedAt = new Date().toISOString();
  let cleanupResult;

  try {
    const faultSql = await readFile(faultSqlPath, 'utf8');
    const { migrationLedger, productionRpc } = await runStage('contract-verification', () => (
      withFreshClient(
        databaseUrl,
        'p03-db-safety-contract',
        async (client) => ({
          migrationLedger: await verifyMigrationLedger(client),
          productionRpc: await verifyProductionRpc(client),
        }),
      )
    ));
    await runStage('clean-start', () => (
      withFreshClient(databaseUrl, 'p03-db-safety-clean-start', (client) => (
        cleanupFixtures(client, fixtures)
      ))
    ));

    await runStage('replay-fixture', () => (
      withFreshClient(databaseUrl, 'p03-replay-fixture', (client) => (
        insertFixture(client, fixtures[0], runRef)
      ))
    ));
    const replay = await runStage('replay-and-conflict', () => (
      runReplayAndConflict(databaseUrl, fixtures[0])
    ));

    await runStage('concurrency-fixture', () => (
      withFreshClient(databaseUrl, 'p03-concurrency-fixture', (client) => (
        insertFixture(client, fixtures[1], runRef)
      ))
    ));
    const concurrency = await runStage('concurrency', () => (
      runConcurrencyProof(databaseUrl, fixtures[1])
    ));
    const aborts = [];
    for (let index = 0; index < requiredFaultBoundaries.length; index += 1) {
      const boundary = requiredFaultBoundaries[index];
      aborts.push(await runStage(`forced-abort-${index + 1}`, async () => {
        await withFreshClient(databaseUrl, `p03-fault-fixture-${index + 1}`, (client) => (
          insertFixture(client, fixtures[index + 2], runRef)
        ));
        return withFreshClient(databaseUrl, `p03-fault-${index + 1}`, async (client) => {
          // The pg_temp wrapper is session-scoped, so compile and exercise it
          // immediately on the same fresh session. A new session per boundary
          // also avoids Supabase session-pooler retirement during the full proof.
          await client.query(faultSql);
          return runFaultProof(client, fixtures[index + 2], boundary);
        });
      }));
    }
    const integrity = await runStage('integrity-verification', () => (
      withFreshClient(databaseUrl, 'p03-integrity', (client) => (
        verifyGlobalIntegrity(client, fixtures)
      ))
    ));
    const firstCleanup = await runStage('first-cleanup', () => (
      withFreshClient(databaseUrl, 'p03-first-cleanup', async (client) => {
        await cleanupFixtures(client, fixtures);
        return verifyCleanup(client, fixtures);
      })
    ));
    const rerun = await runStage('deterministic-rerun', () => (
      runDeterministicRerunProof(databaseUrl, fixtures[0], runRef)
    ));
    cleanupResult = {
      remainingRows: rerun.cleanup.remainingRows,
      ttlBounded: true,
      rerunSafe: true,
      firstCleanupRemainingRows: firstCleanup.remainingRows,
      secondCleanupRemainingRows: rerun.cleanup.remainingRows,
    };

    const evidence = {
      schemaVersion: 'p03-res-db-safety-proof-v1',
      phase: 'P03',
      subphase: 'RES-DB-SAFETY-PROOF',
      sourceCommit: process.env.P03_SOURCE_COMMIT || process.env.GITHUB_SHA || 'local-uncommitted-proof',
      runRef,
      startedAt,
      finishedAt: new Date().toISOString(),
      database: {
        environment: 'isolated-preview',
        identityVerified: true,
        productionProjectMismatchVerified: true,
        sessionConnectionVerified: true,
        livenessPreflight: true,
      },
      migrationLedger,
      productionRpc,
      replay,
      concurrency,
      deterministicRerun: {
        sameFixtureRecreated: rerun.sameFixtureRecreated,
        freshReservationCreated: rerun.freshReservationCreated,
        exactOneRowPersistence: rerun.exactOneRowPersistence,
        entityUnchanged: rerun.entityUnchanged,
      },
      forcedAborts: aborts,
      transportRecovery: {
        boundedAttemptsPerRequest: 3,
        transientRetries:
          replay.transientRetries + concurrency.transientRetries + rerun.transientRetries,
      },
      integrity: {
        ...integrity,
        entityMutation: false,
        routeMutation: false,
        indexMutation: false,
        sitemapMutation: false,
        publishExecuted: false,
        rollbackExecuted: false,
        reservationCreatedAuditImplemented: true,
        reservationAuditSchemaVersion,
      },
      cleanup: cleanupResult,
      redaction: {
        secretsRedacted: true,
        rawIdsEmitted: false,
        rawPayloadsEmitted: false,
        databaseUrlEmitted: false,
      },
    };
    const output = sanitizeEvidence(evidence, [databaseUrl, expectedProjectRef, productionProjectRef, parsedUrl.hostname, ...fixtures.flatMap((item) => [
      item.actorId, item.entityId, item.readStateId, item.authorizationId, item.operationAttemptId,
    ])]);
    await mkdir(path.dirname(evidencePath), { recursive: true });
    await writeFile(evidencePath, output, { mode: 0o600 });
    console.log(`P03 reservation DB safety proof passed; redacted evidence written to ${path.relative(root, evidencePath)}.`);
  } finally {
    if (!cleanupResult) {
      try {
        await withFreshClient(databaseUrl, 'p03-failure-cleanup', (client) => (
          cleanupFixtures(client, fixtures)
        ));
      } catch {}
    }
  }
}

function reportFailure(error) {
  const raw = error instanceof Error ? error.message : String(error);
  const stage = typeof error?.p03Stage === 'string'
    ? error.p03Stage.replace(/[^a-z0-9-]/gi, '').slice(0, 80)
    : 'unclassified';
  let redacted = raw;
  for (const [value, replacement] of [
    [process.env.P03_PREVIEW_DATABASE_URL, '[redacted-database-url]'],
    [process.env.P03_PREVIEW_PROJECT_REF, '[redacted-project]'],
    [process.env.P03_PRODUCTION_PROJECT_REF, '[redacted-production-project]'],
  ]) {
    if (value) redacted = redacted.replaceAll(value, replacement);
  }
  redacted = redacted.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi,
    '[redacted-id]',
  );
  console.error(`P03 reservation DB safety proof failed at ${stage}: ${redacted}`);
  process.exitCode = 1;
}

export {
  deterministicUuid,
  fixture,
  isTransientConnectionError,
  sanitizeEvidence,
  verifyPreviewIdentity,
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(reportFailure);
}
