#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const files = {
  migration: path.resolve('supabase/migrations/0078_import_pharmacy_authorization_invalidation_readback.sql'),
  envelope: path.resolve('src/server/admin/import-pharmacy-publish-authorization-envelope.ts'),
  store: path.resolve('src/server/admin/import-pharmacy-publish-authorization-store.ts'),
  issue: path.resolve('src/server/admin/import-pharmacy-preview-publish-authorization-issue.ts'),
  action: path.resolve('src/app/admin/imports/readiness/actions.ts'),
};
for (const [name, filePath] of Object.entries(files)) {
  if (!existsSync(filePath)) throw new Error(`${name} authorization lifecycle file is missing`);
}
const source = Object.fromEntries(Object.entries(files).map(([name, filePath]) => [name, readFileSync(filePath, 'utf8')]));

for (const token of [
  'import_pharmacy_invalidate_publish_authorizations',
  'import_pharmacy_transition_publish_authorization',
  'superseded_by_review',
  'authorization_identity_mismatch',
  'readByReviewStateId',
  'invalidateActive',
  'transition',
]) {
  if (!source.envelope.includes(token) && !source.store.includes(token) && !source.issue.includes(token) && !source.migration.includes(token)) {
    throw new Error(`authorization lifecycle missing ${token}`);
  }
}
for (const pattern of [
  /drop\s+index\s+if\s+exists\s+public\.import_pharmacy_publish_authorizations_attempt_scope_idx/i,
  /create\s+unique\s+index[\s\S]*review_state_id[\s\S]*operation_scope/i,
  /\bstatus\s*=\s*'issued'/i,
  /security\s+invoker/i,
  /set\s+search_path\s*=\s*pg_catalog,\s*public/i,
  /grant\s+execute[\s\S]*to\s+service_role/i,
]) {
  if (!pattern.test(source.migration)) throw new Error(`authorization lifecycle migration missing safety pattern ${pattern}`);
}
for (const forbidden of [/\bto\s+anon\b/i, /\bto\s+authenticated\b/i, /\bcreate\s+policy\b/i, /\binsert\s+into\b/i]) {
  if (forbidden.test(source.migration)) throw new Error(`authorization lifecycle migration contains forbidden pattern ${forbidden}`);
}
for (const token of ['authorizationReady', 'authorizationStatus', 'expiresAt']) {
  if (!source.issue.includes(token) || !source.action.includes(token)) {
    throw new Error(`bounded authorization readback missing ${token}`);
  }
}
for (const forbidden of ['authorization.token', 'authorization.nonce', 'legacySecret']) {
  if (source.action.includes(forbidden)) throw new Error(`Admin action must not access ${forbidden}`);
}
if (!source.issue.includes('service.readback({')) {
  throw new Error('authorization issuance must use server-side lifecycle readback');
}
console.log('Pharmacy authorization invalidation and readback validation passed.');
