#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourcePath = 'src/server/admin/import-persistence-readback-verifier.ts';
const testPath = 'src/server/admin/import-persistence-readback-verifier.test.ts';
const auditPath = 'scripts/import/check-import-publish-readiness-audit.mjs';

const source = await readFile(path.join(root, sourcePath), 'utf8');
const test = await readFile(path.join(root, testPath), 'utf8');
const audit = await readFile(path.join(root, auditPath), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const token of [
  'import "server-only"',
  'MAX_ROWS_PER_READ = 2',
  'verifyImportPersistenceReadback',
  'readIdempotencyRows',
  'readRollbackRows',
  'readAuditRows',
  'readEntityFingerprint',
  'eventType: "execution_started"',
  'rawPayloadExposed: false',
  'writeAllowed: false',
  'publicEndpointAllowed: false',
  'adminEndpointAllowed: false',
]) {
  assert(source.includes(token), `${sourcePath} must include ${token}.`);
}

for (const blocker of [
  'idempotency_row_count_invalid',
  'idempotency_identity_mismatch',
  'rollback_linkage_mismatch',
  'audit_linkage_mismatch',
  'entity_changed',
]) {
  assert(source.includes(blocker), `${sourcePath} must include blocker ${blocker}.`);
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

for (const token of [
  'exactly one linked row in each persistence table',
  'duplicate idempotency rows',
  'entity fingerprint changed',
]) {
  assert(test.includes(token), `${testPath} must include ${token}.`);
}

assert(
  audit.includes("import './check-import-persistence-readback-verifier.mjs';"),
  'publish readiness audit must chain the persistence readback verifier validator.',
);

console.log('import persistence readback verifier check passed.');
