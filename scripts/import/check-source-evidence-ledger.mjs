#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = {
  migration: 'supabase/migrations/0092_import_source_evidence_ledger.sql',
  contract: 'src/server/admin/import-source-evidence-ledger.ts',
  tests: 'src/server/admin/import-source-evidence-ledger.test.ts',
  docs: 'docs/import/SOURCE_EVIDENCE_LEDGER.md',
  hostedProof: 'scripts/import/run-source-evidence-ledger-proof.mjs',
};

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}
function requireToken(source, token, message) {
  if (!source.includes(token)) throw new Error(`${message}: missing ${token}`);
}
function requirePattern(source, pattern, message) {
  if (!pattern.test(source)) throw new Error(message);
}
function forbidPattern(source, pattern, message) {
  if (pattern.test(source)) throw new Error(message);
}

const migration = read(files.migration);
const contract = read(files.contract);
const tests = read(files.tests);
const docs = read(files.docs);
const hostedProof = read(files.hostedProof);

for (const token of [
  'P17 SOURCE-EVIDENCE-LEDGER',
  'create table if not exists public.import_source_observations',
  'create table if not exists public.import_source_evidence',
  'create table if not exists public.import_source_evidence_events',
  'create or replace function public.import_register_source_evidence',
  'create or replace function public.import_read_source_evidence',
  'create or replace function public.import_record_source_observation_deletion',
  "policy_status in ('accepted', 'denied', 'needs_review')",
  "interval '30 days'",
  "interval '90 days'",
  'source_evidence_append_only',
  'pg_advisory_xact_lock',
  'security definer',
  'set search_path = pg_catalog, public',
  'rawReferenceExposed',
  'directEntityWriteAllowed',
  'publishAllowed',
]) requireToken(migration, token, 'P17 migration contract drifted');

for (const table of ['import_source_observations', 'import_source_evidence', 'import_source_evidence_events']) {
  requirePattern(migration, new RegExp(`alter\\s+table\\s+public\\.${table}\\s+enable\\s+row\\s+level\\s+security`, 'i'), `${table} must enable RLS.`);
  requirePattern(migration, new RegExp(`revoke\\s+all\\s+on\\s+table\\s+public\\.${table}\\s+from\\s+public\\s*,\\s*anon\\s*,\\s*authenticated\\s*,\\s*service_role`, 'i'), `${table} must revoke direct access.`);
}
forbidPattern(migration, /create\s+policy/i, 'P17 must not create any public or authenticated policy.');
forbidPattern(migration, /grant\s+(select|insert|update|delete|all)\s+on\s+(table\s+)?public\.import_source_/i, 'P17 must not grant direct table access.');
forbidPattern(migration, /\b(insert|update|delete)\s+(into\s+)?public\.(centers|doctors|import_publish_queue)\b/i, 'P17 must not mutate canonical or publish tables.');

for (const token of [
  'drkhaleej.import.sourceEvidenceLedger.v1',
  'SOURCE_EVIDENCE_STANDARD_RETENTION_DAYS = 30',
  'SOURCE_EVIDENCE_DISPUTE_RETENTION_DAYS = 90',
  'rawPayloadInCanonicalDatabaseAllowed: false',
  'directEntityWriteAllowed: false',
  'publishAllowed: false',
  'raw_storage_forbidden',
  'requestHash',
  'evidence_forbidden',
  'intakeEvidenceReferences',
]) requireToken(contract, token, 'P17 TypeScript contract drifted');

requirePattern(tests, /describe\("source evidence ledger contract"/, 'P17 focused tests are missing.');
requirePattern(tests, /denied and needs-review policy metadata only/, 'P17 denied/needs-review vector is missing.');
requirePattern(tests, /never turns accepted evidence into canonical entity or publication authority/, 'P17 authority-negative vector is missing.');
for (const token of ['Object storage', '30 days', '90 days', 'denied', 'needs_review', 'Production remains disconnected']) {
  requireToken(docs, token, 'P17 documentation drifted');
}
for (const token of [
  'SOURCE_EVIDENCE_PREVIEW_DATABASE_URL',
  'SOURCE_EVIDENCE_PRODUCTION_PROJECT_REF',
  "where version::text = '0092'",
  'observation_idempotency_mismatch',
  'source_observation_deleted',
  'nonaccepted_observation_storage_forbidden',
  "await client.query('rollback')",
  'Rollback cleanup left P17 fixture rows.',
]) requireToken(hostedProof, token, 'P17 Hosted Preview proof drifted');
forbidPattern(hostedProof, /PRODUCTION_DATABASE_URL|SUPABASE_SERVICE_ROLE_KEY/, 'P17 proof must not accept Production database credentials or API service keys.');

console.log('source evidence ledger static contract passed.');
