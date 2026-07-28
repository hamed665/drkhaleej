#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;
const advisoryLockKey = 824731905;
const migrationVersion = '0087';
const cleanupConfirmation =
  'REMOVE_UNPUBLISHED_0087_FROM_ISOLATED_PREVIEW_PR_962';
const cleanupHeadRef = 'agent/pharmacy-public-noindex-lifecycle';
const cleanupRepository = 'hamed665/drkhaleej';
const artifactPath = path.resolve(
  process.env.PREVIEW_0087_CLEANUP_EVIDENCE_PATH ||
    'artifacts/preview-0087-cleanup/evidence.json',
);

function assert(value, message) {
  if (!value) throw new Error(message);
}

function required(name) {
  const value = process.env[name]?.trim();
  assert(value, `${name} is required.`);
  return value;
}

function redact(value) {
  return String(value || '')
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, '[REDACTED_DATABASE_URL]')
    .replace(/password=[^\s]+/gi, 'password=[REDACTED]');
}

function verifyPreviewIdentity(databaseUrl, previewRef, productionRef) {
  const parsed = new URL(databaseUrl);
  assert(
    ['postgres:', 'postgresql:'].includes(parsed.protocol),
    'Preview cleanup requires a PostgreSQL URL.',
  );
  assert(
    previewRef.length > 0 && productionRef.length > 0 && previewRef !== productionRef,
    'Preview and Production refs must be present and different.',
  );
  assert(parsed.port === '5432', 'Preview cleanup requires port 5432.');

  const username = decodeURIComponent(parsed.username);
  const direct =
    parsed.hostname === `db.${previewRef}.supabase.co` && username === 'postgres';
  const pooler =
    parsed.hostname.endsWith('.pooler.supabase.com') &&
    username === `postgres.${previewRef}`;
  assert(
    direct || pooler,
    'Database identity does not match the isolated Preview project.',
  );
  assert(
    !databaseUrl.includes(productionRef),
    'Production ref must not appear in the Preview database URL.',
  );
  return direct ? 'direct' : 'session_pooler';
}

function connectionConfig(databaseUrl) {
  const parsed = new URL(databaseUrl);
  return {
    connectionString: databaseUrl,
    ssl: ['localhost', '127.0.0.1'].includes(parsed.hostname)
      ? false
      : { rejectUnauthorized: false },
    application_name: 'drmuscat-preview-cleanup-unpublished-0087',
    statement_timeout: 60_000,
    query_timeout: 65_000,
    connectionTimeoutMillis: 15_000,
  };
}

async function writeEvidence(evidence) {
  await mkdir(path.dirname(artifactPath), { recursive: true });
  await writeFile(artifactPath, `${JSON.stringify(evidence, null, 2)}\n`);
}

async function assertExactRpc(client, identity) {
  const result = await client.query(
    `select
       not p.prosecdef as security_invoker,
       p.prorettype = 'jsonb'::regtype as returns_jsonb,
       exists (
         select 1
         from unnest(coalesce(p.proconfig, '{}'::text[])) as setting
         where replace(setting, ' ', '') = 'search_path=pg_catalog,public'
       ) as search_path_pinned
     from pg_catalog.pg_proc p
     where p.oid = to_regprocedure($1)`,
    [identity],
  );
  const rpc = result.rows[0];
  assert(
    result.rowCount === 1 &&
      rpc.security_invoker === true &&
      rpc.returns_jsonb === true &&
      rpc.search_path_pinned === true,
    `Unexpected or missing unpublished RPC: ${identity}`,
  );
}

const databaseUrl = required('PREVIEW_DATABASE_URL');
const previewRef = required('PREVIEW_PROJECT_REF');
const productionRef = required('PRODUCTION_PROJECT_REF');
const sourceCommit = required('PREVIEW_SOURCE_COMMIT');
const confirmation = required('PREVIEW_0087_CLEANUP_CONFIRMATION');
const pullRequest = required('PREVIEW_0087_CLEANUP_PR_NUMBER');
const headRef = required('PREVIEW_0087_CLEANUP_HEAD_REF');
const repository = required('PREVIEW_0087_CLEANUP_REPOSITORY');
assert(
  confirmation === cleanupConfirmation,
  'Preview cleanup literal confirmation is invalid.',
);
assert(pullRequest === '962', 'Preview cleanup is restricted to PR 962.');
assert(
  headRef === cleanupHeadRef,
  'Preview cleanup is restricted to the unpublished lifecycle branch.',
);
assert(
  repository === cleanupRepository,
  'Preview cleanup is restricted to the canonical repository.',
);
assert(
  /^[a-f0-9]{40}$/.test(sourceCommit),
  'Preview cleanup requires the exact 40-character source commit.',
);
const identityMode = verifyPreviewIdentity(
  databaseUrl,
  previewRef,
  productionRef,
);

let client;
let lockAcquired = false;
try {
  client = new Client(connectionConfig(databaseUrl));
  await client.connect();

  const lock = await client.query(
    'select pg_try_advisory_lock($1) as acquired',
    [advisoryLockKey],
  );
  lockAcquired = lock.rows[0]?.acquired === true;
  assert(
    lockAcquired,
    'Preview migration advisory lock is already held; cleanup refused.',
  );

  await client.query('begin');
  try {
    const ledger = await client.query(
      `select
         count(*) filter (where version::text = $1)::int as target_count,
         count(*) filter (
           where version::text ~ '^[0-9]{4}$' and version::text > $1
         )::int as later_count
       from supabase_migrations.schema_migrations`,
      [migrationVersion],
    );
    assert(
      ledger.rows[0]?.target_count === 1 && ledger.rows[0]?.later_count === 0,
      'Preview ledger must contain exactly unpublished 0087 and no later migration.',
    );

    const tables = await client.query(
      `select
         to_regclass('public.import_pharmacy_public_noindex_authorizations')::text
           as authorizations_table,
         to_regclass('public.import_pharmacy_public_noindex_events')::text
           as events_table`,
    );
    assert(
      tables.rows[0]?.authorizations_table ===
        'import_pharmacy_public_noindex_authorizations' &&
        tables.rows[0]?.events_table ===
          'import_pharmacy_public_noindex_events',
      'Expected unpublished 0087 tables are missing or renamed.',
    );

    const tableShape = await client.query(
      `select
         c.relname as table_name,
         c.relkind = 'r' as ordinary_table,
         c.relrowsecurity as rls_enabled,
         array_agg(a.attname order by a.attnum)
           filter (where a.attnum > 0 and not a.attisdropped) as columns
       from pg_catalog.pg_class c
       join pg_catalog.pg_namespace n on n.oid = c.relnamespace
       join pg_catalog.pg_attribute a on a.attrelid = c.oid
       where n.nspname = 'public'
         and c.relname = any($1::text[])
       group by c.oid, c.relname, c.relkind, c.relrowsecurity
       order by c.relname`,
      [
        [
          'import_pharmacy_public_noindex_authorizations',
          'import_pharmacy_public_noindex_events',
        ],
      ],
    );
    const expectedColumns = new Map([
      [
        'import_pharmacy_public_noindex_authorizations',
        [
          'id',
          'actor_profile_id',
          'entity_id',
          'candidate_id',
          'idempotency_key',
          'request_hash',
          'expected_entity_version',
          'candidate_payload_hash',
          'canonical_path_en',
          'canonical_path_ar',
          'snapshot_payload',
          'snapshot_hash',
          'status',
          'published_queue_id',
          'terminal_result',
          'terminal_result_hash',
          'issued_at',
          'expires_at',
          'published_at',
          'rolled_back_at',
          'updated_at',
        ],
      ],
      [
        'import_pharmacy_public_noindex_events',
        [
          'id',
          'authorization_id',
          'actor_profile_id',
          'entity_id',
          'event_type',
          'outcome',
          'schema_version',
          'event_payload',
          'created_at',
        ],
      ],
    ]);
    assert(
      tableShape.rowCount === expectedColumns.size,
      'Unexpected unpublished 0087 table inventory.',
    );
    for (const table of tableShape.rows) {
      assert(
        table.ordinary_table === true &&
          table.rls_enabled === true &&
          JSON.stringify(table.columns) ===
            JSON.stringify(expectedColumns.get(table.table_name)),
        `Unexpected unpublished table shape: ${table.table_name}`,
      );
    }

    const supportObjects = await client.query(
      `select
         to_regclass(
           'public.import_pharmacy_public_noindex_active_entity_unique'
         ) is not null as active_index_present,
         to_regclass(
           'public.import_pharmacy_public_noindex_actor_entity_idx'
         ) is not null as actor_index_present,
         to_regclass(
           'public.import_pharmacy_public_noindex_event_authority_idx'
         ) is not null as event_index_present,
         exists (
           select 1
           from pg_catalog.pg_trigger t
           where t.tgrelid =
             'public.import_pharmacy_public_noindex_authorizations'::regclass
             and t.tgname =
               'trg_import_pharmacy_public_noindex_set_updated_at'
             and not t.tgisinternal
         ) as update_trigger_present`,
    );
    assert(
      Object.values(supportObjects.rows[0] || {}).every(
        (value) => value === true,
      ),
      'Expected unpublished 0087 indexes or trigger are missing.',
    );

    for (const identity of [
      'public.import_authorize_pharmacy_public_noindex(uuid,uuid,uuid,text,text,text,text,text,text,integer)',
      'public.import_publish_pharmacy_public_noindex(uuid,uuid,uuid,text,text)',
      'public.import_rollback_pharmacy_public_noindex_by_authority(uuid,uuid,text)',
    ]) {
      await assertExactRpc(client, identity);
    }

    const rows = await client.query(
      `select
         (select count(*)::int
          from public.import_pharmacy_public_noindex_authorizations)
           as authorizations,
         (select count(*)::int
          from public.import_pharmacy_public_noindex_events)
           as events,
         (select count(*)::int
          from public.import_publish_queue
          where metadata ? 'public_noindex_authorization_id'
             or metadata ? 'public_noindex_schema_version')
           as queue_markers`,
    );
    assert(
      rows.rows[0]?.authorizations === 0 &&
        rows.rows[0]?.events === 0 &&
        rows.rows[0]?.queue_markers === 0,
      'Unpublished 0087 contains data or Queue markers; cleanup refused.',
    );

    await client.query(
      'drop function public.import_rollback_pharmacy_public_noindex_by_authority(uuid, uuid, text)',
    );
    await client.query(
      'drop function public.import_publish_pharmacy_public_noindex(uuid, uuid, uuid, text, text)',
    );
    await client.query(
      'drop function public.import_authorize_pharmacy_public_noindex(uuid, uuid, uuid, text, text, text, text, text, text, integer)',
    );
    await client.query(
      'drop table public.import_pharmacy_public_noindex_events',
    );
    await client.query(
      'drop table public.import_pharmacy_public_noindex_authorizations',
    );
    const deleted = await client.query(
      'delete from supabase_migrations.schema_migrations where version::text = $1',
      [migrationVersion],
    );
    assert(
      deleted.rowCount === 1,
      'Unpublished 0087 ledger removal did not affect exactly one row.',
    );

    const absence = await client.query(
      `select
         to_regclass('public.import_pharmacy_public_noindex_authorizations') is null
           as authorizations_absent,
         to_regclass('public.import_pharmacy_public_noindex_events') is null
           as events_absent,
         to_regprocedure(
           'public.import_authorize_pharmacy_public_noindex(uuid,uuid,uuid,text,text,text,text,text,text,integer)'
         ) is null as authorize_absent,
         to_regprocedure(
           'public.import_publish_pharmacy_public_noindex(uuid,uuid,uuid,text,text)'
         ) is null as publish_absent,
         to_regprocedure(
           'public.import_rollback_pharmacy_public_noindex_by_authority(uuid,uuid,text)'
         ) is null as rollback_absent,
         not exists (
           select 1 from supabase_migrations.schema_migrations
           where version::text = $1
         ) as ledger_absent`,
      [migrationVersion],
    );
    assert(
      Object.values(absence.rows[0] || {}).every((value) => value === true),
      'Transactional cleanup verification failed.',
    );
    await client.query('commit');
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  }

  await writeEvidence({
    schemaVersion: 'drkhaleej.previewUnpublishedMigrationCleanup.v1',
    status: 'green',
    migrationVersion,
    sourceCommit,
    pullRequest: Number(pullRequest),
    headRef,
    repository,
    environmentClass: 'isolated_preview',
    identityMode,
    tablesEmptyBeforeCleanup: true,
    queueMarkersBeforeCleanup: 0,
    exactObjectsRemoved: true,
    ledgerEntryRemoved: true,
    resetPerformed: false,
    productionConnected: false,
    secretRedaction: true,
    generatedAt: new Date().toISOString(),
  });
  console.log(
    'Unpublished migration 0087 was removed from the isolated Preview without a database reset.',
  );
} catch (error) {
  await writeEvidence({
    schemaVersion: 'drkhaleej.previewUnpublishedMigrationCleanup.v1',
    status: 'red',
    migrationVersion,
    sourceCommit,
    pullRequest: Number(pullRequest),
    headRef,
    repository,
    environmentClass: 'isolated_preview',
    identityMode,
    resetPerformed: false,
    productionConnected: false,
    secretRedaction: true,
    error: redact(error instanceof Error ? error.message : error),
    generatedAt: new Date().toISOString(),
  }).catch(() => {});
  console.error(
    `Unpublished 0087 cleanup failed closed: ${redact(
      error instanceof Error ? error.message : error,
    )}`,
  );
  process.exitCode = 1;
} finally {
  if (client && lockAcquired) {
    await client
      .query('select pg_advisory_unlock($1)', [advisoryLockKey])
      .catch(() => {});
  }
  await client?.end().catch(() => {});
}
