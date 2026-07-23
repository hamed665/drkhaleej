import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const migrationPath = 'supabase/migrations/0072_import_pharmacy_publish_references.sql';
const adapterPath = 'src/server/admin/import-pharmacy-durable-publish-reference.ts';
const wiringPath = 'src/server/admin/import-pharmacy-private-admin-real-wiring.ts';
const handoffPath = 'src/server/admin/import-pharmacy-verified-reservation-handoff.ts';

async function read(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const [migration, adapter, wiring, handoff] = await Promise.all([
  read(migrationPath),
  read(adapterPath),
  read(wiringPath),
  read(handoffPath),
]);

for (const token of [
  'IMPORT-PUBLISH-AD: durable Pharmacy private publish references',
  'create table if not exists public.import_pharmacy_publish_references',
  'token_hash text not null unique',
  'expected_snapshot_hash text not null',
  'expires_at timestamptz not null',
  'on delete restrict',
  'enable row level security',
]) assert(migration.includes(token), `${migrationPath} must include ${token}`);

for (const token of [
  'randomBytes(32).toString("base64url")',
  'token_hash: sha256(token)',
  '.eq("token_hash", sha256(input.publishReference))',
  'row.actor_profile_id !== input.actorId',
  'row.entity_id !== input.entityId',
  'row.consumed_at !== null',
  'new Date(row.expires_at).getTime() <= now().getTime()',
]) assert(adapter.includes(token), `${adapterPath} must include ${token}`);

for (const token of [
  'loadVerifiedReservationEvidence',
  'verifiedReservationExecutor?: PharmacyVerifiedReservationExecutorPort',
]) assert(wiring.includes(token), `${wiringPath} must preserve the server-only verified handoff boundary with ${token}`);

for (const token of [
  'context.canaryInput.expectedSnapshotHash !== review.snapshotHash',
  'context.canaryInput.expectedSnapshotHash !== verification.expectedSnapshotHash',
  'verification.expectedRollbackSnapshotId',
]) assert(handoff.includes(token), `${handoffPath} must bind the durable reference inputs to verified reservation evidence with ${token}`);

for (const forbidden of [
  'visibility: "public"',
  'indexPolicy: "index"',
  'sitemapPolicy: "included"',
  'to anon',
  'to authenticated',
]) {
  assert(!migration.includes(forbidden), `${migrationPath} must not include ${forbidden}`);
  assert(!adapter.includes(forbidden), `${adapterPath} must not include ${forbidden}`);
  assert(!handoff.includes(forbidden), `${handoffPath} must not include ${forbidden}`);
}

console.log('import Pharmacy durable publish reference check passed.');
