#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;
const lockKey = 824731905;
const artifactPath = path.resolve(
  process.env.PREVIEW_MIGRATION_EVIDENCE_PATH || 'artifacts/preview-migration-sync/evidence.json',
);
const diagnosticsPath = path.join(path.dirname(artifactPath), 'migration.log');
let migrationOutput = '';

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
function verifyIdentity(connectionString, previewRef, productionRef) {
  const parsed = new URL(connectionString);
  assert(['postgres:', 'postgresql:'].includes(parsed.protocol), 'Preview database URL must use PostgreSQL.');
  assert(previewRef !== productionRef, 'Preview and Production project refs must differ.');
  assert(parsed.port === '5432', 'Preview migration sync requires port 5432 only.');
  const direct = parsed.hostname === `db.${previewRef}.supabase.co`
    && decodeURIComponent(parsed.username) === 'postgres';
  const pooler = parsed.hostname.endsWith('.pooler.supabase.com')
    && decodeURIComponent(parsed.username) === `postgres.${previewRef}`;
  assert(direct || pooler, 'Database identity does not match the configured isolated Preview project.');
  assert(!connectionString.includes(productionRef), 'Production project ref must not appear in the Preview database URL.');
  return direct ? 'direct' : 'session_pooler';
}
function config(connectionString) {
  const parsed = new URL(connectionString);
  return {
    connectionString,
    ssl: ['localhost', '127.0.0.1'].includes(parsed.hostname)
      ? false
      : { rejectUnauthorized: false },
    application_name: 'drmuscat-preview-migration-sync-lock',
    statement_timeout: 0,
    connectionTimeoutMillis: 15_000,
  };
}
function runSupabase(databaseUrl) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'supabase',
      ['db', 'push', '--db-url', databaseUrl, '--include-all', '--yes'],
      { env: process.env, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    const append = (chunk) => {
      migrationOutput = `${migrationOutput}${chunk.toString()}`.slice(-50_000);
    };
    child.stdout.on('data', append);
    child.stderr.on('data', append);
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Supabase migration push exited with code ${code}. See redacted migration diagnostics artifact.`));
    });
  });
}
async function writeRedEvidence(error, identityMode = null) {
  const evidence = {
    schemaVersion: 'drmuscat.previewMigrationSyncEvidence.v1',
    status: 'red',
    stage: 'migration_write',
    commitSha: process.env.PREVIEW_SOURCE_COMMIT || process.env.GITHUB_SHA || null,
    runId: process.env.GITHUB_RUN_ID || null,
    identityMode,
    error: redact(error instanceof Error ? error.message : error),
    secretRedaction: true,
    productionConnected: false,
    generatedAt: new Date().toISOString(),
  };
  await mkdir(path.dirname(artifactPath), { recursive: true });
  await Promise.all([
    writeFile(artifactPath, `${JSON.stringify(evidence, null, 2)}\n`),
    writeFile(diagnosticsPath, redact(migrationOutput || 'No migration command output was captured.')),
  ]);
}

let client;
let identityMode;
try {
  const databaseUrl = required('PREVIEW_DATABASE_URL');
  const previewRef = required('PREVIEW_PROJECT_REF');
  const productionRef = required('PRODUCTION_PROJECT_REF');
  identityMode = verifyIdentity(databaseUrl, previewRef, productionRef);

  client = new Client(config(databaseUrl));
  await client.connect();
  const acquired = await client.query('select pg_try_advisory_lock($1) as acquired', [lockKey]);
  assert(acquired.rows[0]?.acquired === true, 'Preview migration advisory lock is already held; refusing concurrent write.');
  console.log('Preview migration advisory lock acquired.');
  await runSupabase(databaseUrl);
  console.log('Preview migration push completed without emitting connection details.');
} catch (error) {
  await writeRedEvidence(error, identityMode).catch(() => {});
  console.error(`Preview migration write failed: ${redact(error instanceof Error ? error.message : error)}`);
  process.exitCode = 1;
} finally {
  if (client) {
    await client.query('select pg_advisory_unlock($1)', [lockKey]).catch(() => {});
    await client.end().catch(() => {});
  }
}
