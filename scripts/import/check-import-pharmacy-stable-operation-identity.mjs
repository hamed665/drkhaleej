#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const files = {
  identity: path.resolve('src/server/admin/import-pharmacy-operation-identity.ts'),
  state: path.resolve('src/server/admin/import-pharmacy-admin-bounded-read-state.ts'),
  store: path.resolve('src/server/admin/import-pharmacy-admin-read-state-store.ts'),
  action: path.resolve('src/app/admin/imports/readiness/actions.ts'),
  migration: path.resolve('supabase/migrations/0076_import_pharmacy_stable_operation_identity.sql'),
};
for (const [name, filePath] of Object.entries(files)) {
  if (!existsSync(filePath)) throw new Error(`${name} stable operation identity file is missing`);
}
const source = Object.fromEntries(
  Object.entries(files).map(([name, filePath]) => [name, readFileSync(filePath, 'utf8')]),
);

for (const token of [
  'operationAttemptId',
  'idempotencyKey',
  'requestHash',
  'patchHash',
  'reserve_private_publish',
  'expectedEntityVersion',
]) {
  if (!source.identity.includes(token)) throw new Error(`operation identity builder missing ${token}`);
}
for (const token of [
  'PharmacyStableOperationIdentity',
  'buildPharmacyStableOperationIdentity',
  '...identity',
  'pharmacy_admin_read_state_v3',
]) {
  if (!source.state.includes(token)) throw new Error(`bounded read state missing composed identity contract ${token}`);
}
if (/randomUUID|randomBytes/.test(source.identity)) {
  throw new Error('stable operation identity must not use random material');
}
if (!source.action.includes('expectedEntityVersion: context.context.canaryInput.reservationRequest.expectedVersion')) {
  throw new Error('Admin action must bind identity to the existing reservation expected version');
}
for (const column of [
  'operation_attempt_id',
  'idempotency_key',
  'request_hash',
  'patch_hash',
  'operation_scope',
  'entity_family',
  'expected_entity_version',
]) {
  if (!source.store.includes(column)) throw new Error(`read-state store missing ${column}`);
  if (!source.migration.includes(column)) throw new Error(`identity migration missing ${column}`);
}
for (const pattern of [
  /create\s+unique\s+index[\s\S]*operation_attempt_id[\s\S]*operation/i,
  /create\s+unique\s+index[\s\S]*idempotency_key[\s\S]*operation/i,
  /request_hash\s*~\s*'\^\[a-f0-9\]\{64\}\$'/i,
  /patch_hash\s*~\s*'\^\[a-f0-9\]\{64\}\$'/i,
  /operation_scope\s*=\s*'reserve_private_publish'/i,
  /entity_family\s*=\s*'pharmacy'/i,
]) {
  if (!pattern.test(source.migration)) throw new Error(`identity migration missing safety pattern ${pattern}`);
}
for (const forbidden of [/\bdrop\b/i, /\bdelete\s+from\b/i, /\bto\s+anon\b/i, /\bto\s+authenticated\b/i]) {
  if (forbidden.test(source.migration)) throw new Error(`identity migration contains forbidden pattern ${forbidden}`);
}

console.log('Pharmacy stable operation identity validation passed.');