#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourcePath = 'src/server/admin/import-persistence-readback-verifier.ts';
const testPath = 'src/server/admin/import-persistence-readback-verifier.test.ts';
const adapterPath = 'src/server/admin/import-supabase-persistence-readback-client.ts';
const adapterTestPath = 'src/server/admin/import-supabase-persistence-readback-client.test.ts';
const auditPath = 'scripts/import/check-import-publish-readiness-audit.mjs';

const source = await readFile(path.join(root, sourcePath), 'utf8');
const test = await readFile(path.join(root, testPath), 'utf8');
const adapter = await readFile(path.join(root, adapterPath), 'utf8');
const adapterTest = await readFile(path.join(root, adapterTestPath), 'utf8');
const audit = await readFile(path.join(root, auditPath), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const token of [
  'import "server-only"',
  'MAX_ROWS_PER_READ = 2',
  'verifyImportPersistenceReadback',
  'readAuthorizationRows',
  'readIdempotencyRows',
  'readRollbackRows',
  'readAuditRows',
  'readEntityFingerprint',
  '"execution_started", "reservation_created"',
  'authorization_reservation_linkage_mismatch',
  'duplicateCount',
  'orphanCount',
  'auditGapCount',
  'rawPayloadExposed: false',
  'writeAllowed: false',
  'publicEndpointAllowed: false',
  'adminEndpointAllowed: false',
]) {
  assert(source.includes(token), `${sourcePath} must include ${token}.`);
}

for (const blocker of [
  'invalid_verification_input',
  'idempotency_row_count_invalid',
  'idempotency_identity_mismatch',
  'rollback_linkage_mismatch',
  'audit_linkage_mismatch',
  'entity_changed',
]) {
  assert(source.includes(blocker), `${sourcePath} must include blocker ${blocker}.`);
}

for (const token of [
  'import "server-only"',
  'createImportSupabasePersistenceReadbackClient',
  'import_pharmacy_publish_authorizations',
  'import_publish_idempotency_records',
  'import_publish_rollback_snapshots',
  'import_publish_audit_events',
  'PHARMACY_PRIVATE_ADMIN_CENTER_SELECT',
  '.limit(input.limit)',
]) {
  assert(adapter.includes(token), `${adapterPath} must include ${token}.`);
}

for (const forbidden of [
  'insert(',
  'update(',
  'upsert(',
  'delete(',
  '.rpc(',
  'process.env',
  'createClient(',
  'snapshot_payload',
  'event_payload',
  'terminal_result',
  '"use server"',
]) {
  assert(!source.includes(forbidden), `${sourcePath} must not include ${forbidden}.`);
}

for (const forbidden of ['insert(', 'update(', 'upsert(', 'delete(', '.rpc(', 'process.env', 'createClient(', '"use server"']) {
  assert(!adapter.includes(forbidden), `${adapterPath} must not include ${forbidden}.`);
}

for (const token of [
  'exactly one linked row in each persistence table',
  'duplicate idempotency rows',
  'entity fingerprint changed',
  'future reservation audit signature',
  'authorization orphan',
]) {
  assert(test.includes(token), `${testPath} must include ${token}.`);
}


for (const token of ['only bounded selects', 'strips the raw audit object', 'must-not-escape']) {
  assert(adapterTest.includes(token), `${adapterTestPath} must include ${token}.`);
}

assert(
  audit.includes("import './check-import-persistence-readback-verifier.mjs';"),
  'publish readiness audit must chain the persistence readback verifier validator.',
);

console.log('import persistence readback verifier check passed.');
