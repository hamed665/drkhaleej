import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const migrationPath = 'supabase/migrations/0073_import_pharmacy_admin_read_states.sql';
const storePath = 'src/server/admin/import-pharmacy-admin-read-state-store.ts';
const testPath = 'src/server/admin/import-pharmacy-admin-read-state-store.test.ts';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const migration = await readText(migrationPath);
const store = await readText(storePath);
const tests = await readText(testPath);

for (const token of [
  'IMPORT-ADMIN-G: bounded Pharmacy dry-run and review state persistence',
  'create table if not exists public.import_pharmacy_admin_read_states',
  "operation in ('dry_run', 'review')",
  "snapshot_hash ~ '^[a-f0-9]{64}$'",
  "entity_fingerprint ~ '^[a-f0-9]{64}$'",
  'current_state jsonb not null',
  'proposed_state jsonb not null',
  'exact_diff jsonb not null',
  'expires_at > created_at',
  'reviewed_at is not null',
  'on delete restrict',
  'enable row level security',
]) assert(migration.toLowerCase().includes(token.toLowerCase()), `${migrationPath} must include ${token}`);

for (const forbidden of [
  'create policy',
  'to anon',
  'to authenticated',
  'to service_role',
  'insert into',
  'drop table',
]) assert(!migration.toLowerCase().includes(forbidden), `${migrationPath} must not include ${forbidden}`);

for (const token of [
  'createPharmacyAdminReadStateStore',
  'import_pharmacy_admin_read_states',
  'readLatestFresh',
  'isPharmacyAdminBoundedReadStateFresh',
  'actor_profile_id',
  'entity_fingerprint',
  'exact_diff',
  'return null',
]) assert(store.includes(token), `${storePath} must include ${token}`);

for (const forbidden of [
  'visibility: "public"',
  'indexEligible: true',
  'sitemapEligible: true',
  'routeEnabled: true',
  'Promise.all(',
]) assert(!store.includes(forbidden), `${storePath} must not include ${forbidden}`);

for (const token of [
  'persists and reads back only a valid bounded state',
  'rejects stale readback and malformed rows',
  'fails closed on database errors',
]) assert(tests.includes(token), `${testPath} must cover ${token}`);

console.log('bounded Pharmacy Admin read state persistence check passed.');
