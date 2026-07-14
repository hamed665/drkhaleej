#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const files = {
  migration: path.resolve('supabase/migrations/0077_import_pharmacy_authorization_persistence_v2.sql'),
  envelope: path.resolve('src/server/admin/import-pharmacy-publish-authorization-envelope.ts'),
  store: path.resolve('src/server/admin/import-pharmacy-publish-authorization-store.ts'),
  issue: path.resolve('src/server/admin/import-pharmacy-preview-publish-authorization-issue.ts'),
  action: path.resolve('src/app/admin/imports/readiness/actions.ts'),
};
for (const [name, filePath] of Object.entries(files)) {
  if (!existsSync(filePath)) throw new Error(`${name} authorization persistence v2 file is missing`);
}
const source = Object.fromEntries(
  Object.entries(files).map(([name, filePath]) => [name, readFileSync(filePath, 'utf8')]),
);

for (const token of [
  'review_state_id',
  'operation_attempt_id',
  'idempotency_key',
  'request_hash',
  'patch_hash',
  'expected_entity_version',
  'entity_family',
  'operation_scope',
  'status',
  'invalidated_at',
  'invalidation_reason',
  'consumed_by_reservation_id',
]) {
  if (!source.migration.includes(token)) throw new Error(`authorization migration missing ${token}`);
  if (!source.store.includes(token)) throw new Error(`authorization store missing ${token}`);
}
for (const pattern of [
  /review_state_id\s+uuid\s+references\s+public\.import_pharmacy_admin_read_states\(id\)\s+on\s+delete\s+restrict/i,
  /operation_scope\s*=\s*'reserve_private_publish'/i,
  /entity_family\s*=\s*'pharmacy'/i,
  /status\s+in\s*\('issued',\s*'consumed',\s*'invalidated',\s*'expired'\)/i,
  /create\s+unique\s+index[\s\S]*operation_attempt_id[\s\S]*operation_scope/i,
  /create\s+unique\s+index[\s\S]*actor_profile_id[\s\S]*entity_id[\s\S]*operation_scope[\s\S]*where\s+status\s*=\s*'issued'/i,
]) {
  if (!pattern.test(source.migration)) throw new Error(`authorization migration missing safety pattern ${pattern}`);
}
for (const forbidden of [/\bdrop\b/i, /\bdelete\s+from\b/i, /\bto\s+anon\b/i, /\bto\s+authenticated\b/i]) {
  if (forbidden.test(source.migration)) throw new Error(`authorization migration contains forbidden pattern ${forbidden}`);
}
if (!source.store.includes('from("import_pharmacy_admin_read_states")')) {
  throw new Error('authorization store must resolve the persisted Review server-side');
}
if (!source.store.includes('.eq("operation_attempt_id", operationAttemptId)')) {
  throw new Error('authorization store must resolve Review by stable operation identity');
}

// Inspect only the public handle type. Internal compatibility secrets are intentionally outside this slice.
const envelopeTypeStart = source.envelope.indexOf('export type PharmacyPublishAuthorizationEnvelope =');
const envelopeTypeEnd = source.envelope.indexOf('export type PharmacyPublishAuthorizationLegacySecret =', envelopeTypeStart);
if (envelopeTypeStart < 0 || envelopeTypeEnd < 0) {
  throw new Error('authorization envelope and internal legacy secret types must be explicit');
}
const publicEnvelopeType = source.envelope.slice(envelopeTypeStart, envelopeTypeEnd);
if (!publicEnvelopeType.includes('authorizationId: string') || !publicEnvelopeType.includes('expiresAt: string')) {
  throw new Error('authorization issuance must return only a bounded server-owned handle');
}
if (/\btoken\s*:/.test(publicEnvelopeType)) {
  throw new Error('authorization envelope must not expose raw token');
}
if (/\bnonce\s*:/.test(publicEnvelopeType)) {
  throw new Error('authorization envelope must not expose raw nonce');
}
for (const forbidden of ['authorization?.token', 'authorization?.nonce', 'authorization.token', 'authorization.nonce']) {
  if (source.action.includes(forbidden) || source.issue.includes(forbidden)) {
    throw new Error(`browser-facing authorization flow must not access ${forbidden}`);
  }
}

console.log('Pharmacy authorization persistence v2 validation passed.');
