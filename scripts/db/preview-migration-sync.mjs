#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;
const root = process.cwd();
const migrationDir = path.join(root, 'supabase/migrations');
const artifactPath = path.resolve(process.env.PREVIEW_MIGRATION_EVIDENCE_PATH || 'artifacts/preview-migration-sync/evidence.json');
const advisoryLockKey = 824731905;

function fail(message) { throw new Error(message); }
function assert(value, message) { if (!value) fail(message); }
function required(name) {
  const value = process.env[name]?.trim();
  assert(value, `${name} is required.`);
  return value;
}
function hash(value) { return createHash('sha256').update(value).digest('hex'); }
function redactError(error) {
  const raw = error instanceof Error ? error.message : String(error);
  return raw.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, '[REDACTED_DATABASE_URL]');
}
function connectionConfig(connectionString) {
  const parsed = new URL(connectionString);
  const local = ['localhost', '127.0.0.1'].includes(parsed.hostname);
  return {
    connectionString,
    ssl: local ? false : { rejectUnauthorized: false },
    application_name: 'drmuscat-preview-migration-sync',
    statement_timeout: 60000,
    query_timeout: 65000,
  };
}
function verifyIdentity(connectionString, previewRef, productionRef) {
  const parsed = new URL(connectionString);
  assert(['postgres:', 'postgresql:'].includes(parsed.protocol), 'Preview database URL must use PostgreSQL.');
  assert(previewRef && productionRef && previewRef !== productionRef, 'Preview and Production project refs must be present and different.');
  assert(parsed.port === '5432', 'Preview migration sync requires port 5432 only.');
  const direct = parsed.hostname === `db.${previewRef}.supabase.co` && decodeURIComponent(parsed.username) === 'postgres';
  const pooler = parsed.hostname.endsWith('.pooler.supabase.com') && decodeURIComponent(parsed.username) === `postgres.${previewRef}`;
  assert(direct || pooler, 'Database identity does not match the configured isolated Preview project.');
  assert(!connectionString.includes(productionRef), 'Production project ref must not appear in the Preview database URL.');
  return { mode: direct ? 'direct' : 'session_pooler', port: 5432 };
}
async function repositoryMigrations() {
  const files = (await readdir(migrationDir)).filter((name) => /^\d{4}_.+\.sql$/.test(name)).sort();
  assert(files.length > 0, 'No repository migrations found.');
  const versions = files.map((name) => name.slice(0, 4));
  assert(new Set(versions).size === versions.length, 'Migration versions must be unique.');
  for (let index = 0; index < versions.length; index += 1) {
    const expected = String(index + 1).padStart(4, '0');
    assert(versions[index] === expected, `Migration gap detected: expected ${expected}, found ${versions[index]}.`);
  }
  const checksums = {};
  for (const file of files) checksums[file] = hash(await readFile(path.join(migrationDir, file)));
  return { files, versions, checksums };
}
async function openClient(url) {
  const client = new Client(connectionConfig(url));
  await client.connect();
  return client;
}
async function inspectDatabase(client, expected) {
  await client.query('select pg_advisory_lock($1)', [advisoryLockKey]);
  try {
    const ledger = await client.query('select version::text as version from supabase_migrations.schema_migrations order by version');
    const actual = ledger.rows.map((row) => row.version).filter((version) => /^\d{4}$/.test(version));
    assert(JSON.stringify(actual) === JSON.stringify(expected.versions), 'Migration ledger differs from repository migrations.');

    const pending = expected.versions.filter((version) => !actual.includes(version));
    const extra = actual.filter((version) => !expected.versions.includes(version));
    assert(pending.length === 0 && extra.length === 0, 'Migration gap or extra migration detected.');

    const rls = await client.query(`select n.nspname as schema_name, c.relname as table_name, c.relrowsecurity as rls_enabled, c.relforcerowsecurity as rls_forced
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where c.relkind = 'r' and n.nspname = 'public' order by c.relname`);
    const rlsDisabled = rls.rows.filter((row) => row.rls_enabled === false).map((row) => row.table_name);

    const rpc = await client.query(`select n.nspname as schema_name, p.proname as function_name, pg_get_function_identity_arguments(p.oid) as arguments
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' order by p.proname, arguments`);

    const schemaObjects = await client.query(`select n.nspname as schema_name, c.relkind, c.relname
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind in ('r','p','v','m','S') order by c.relkind, c.relname`);
    const schemaFingerprint = hash(JSON.stringify({ objects: schemaObjects.rows, rls: rls.rows, rpc: rpc.rows }));

    return {
      ledger: { first: actual[0], last: actual.at(-1), count: actual.length, exact: true },
      migrationGap: [],
      extraMigrations: [],
      schemaDrift: { catalogFingerprintSha256: schemaFingerprint, ambiguous: false },
      rls: { tableCount: rls.rows.length, disabledTables: rlsDisabled },
      rpc: { count: rpc.rows.length, inventorySha256: hash(JSON.stringify(rpc.rows)) },
    };
  } finally {
    await client.query('select pg_advisory_unlock($1)', [advisoryLockKey]).catch(() => {});
  }
}

async function main() {
  const mode = process.argv[2];
  assert(['preflight', 'verify'].includes(mode), 'Usage: preview-migration-sync.mjs preflight|verify');
  const databaseUrl = required('PREVIEW_DATABASE_URL');
  const previewRef = required('PREVIEW_PROJECT_REF');
  const productionRef = required('PRODUCTION_PROJECT_REF');
  const identity = verifyIdentity(databaseUrl, previewRef, productionRef);
  const migrations = await repositoryMigrations();

  if (mode === 'preflight') {
    console.log(JSON.stringify({ ok: true, identity, migrationCount: migrations.files.length, first: migrations.versions[0], last: migrations.versions.at(-1) }));
    return;
  }

  const client = await openClient(databaseUrl);
  try {
    const database = await inspectDatabase(client, migrations);
    const evidence = {
      schemaVersion: 'drmuscat.previewMigrationSyncEvidence.v1',
      status: 'green',
      commitSha: process.env.GITHUB_SHA || null,
      runId: process.env.GITHUB_RUN_ID || null,
      identity,
      repository: { first: migrations.versions[0], last: migrations.versions.at(-1), count: migrations.files.length, checksumsSha256: hash(JSON.stringify(migrations.checksums)) },
      database,
      secretRedaction: true,
      productionConnected: false,
      generatedAt: new Date().toISOString(),
    };
    await mkdir(path.dirname(artifactPath), { recursive: true });
    await writeFile(artifactPath, `${JSON.stringify(evidence, null, 2)}\n`);
    console.log(`Preview migration sync verified through ${evidence.repository.last}.`);
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch(async (error) => {
  const evidence = {
    schemaVersion: 'drmuscat.previewMigrationSyncEvidence.v1',
    status: 'red',
    commitSha: process.env.GITHUB_SHA || null,
    runId: process.env.GITHUB_RUN_ID || null,
    error: redactError(error),
    secretRedaction: true,
    productionConnected: false,
    generatedAt: new Date().toISOString(),
  };
  await mkdir(path.dirname(artifactPath), { recursive: true }).catch(() => {});
  await writeFile(artifactPath, `${JSON.stringify(evidence, null, 2)}\n`).catch(() => {});
  console.error(`Preview migration sync failed: ${evidence.error}`);
  process.exit(1);
});
