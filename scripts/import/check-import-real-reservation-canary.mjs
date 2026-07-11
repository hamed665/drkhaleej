#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourcePath = 'src/server/admin/import-real-reservation-canary.ts';
const testPath = 'src/server/admin/import-real-reservation-canary.test.ts';
const auditPath = 'scripts/import/check-import-publish-readiness-audit.mjs';

const source = await readFile(path.join(root, sourcePath), 'utf8');
const test = await readFile(path.join(root, testPath), 'utf8');
const audit = await readFile(path.join(root, auditPath), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const token of [
  'import "server-only"',
  'runImportRealReservationCanary',
  'executionEnabled: boolean',
  'environment !== "preview"',
  'allowedActorIds.includes',
  'allowedEntityIds.includes',
  'approvalToken !== input.expectedApprovalToken',
  'runReservationSnapshotAuditTransaction',
  'verifyImportPersistenceReadback',
  'terminalPersistenceAllowed: false',
  'entityMutationAllowed: false',
  'routeMutationAllowed: false',
  'sitemapMutationAllowed: false',
  'bulkAllowed: false',
]) {
  assert(source.includes(token), `${sourcePath} must include ${token}.`);
}

for (const blocker of [
  'canary_execution_disabled',
  'environment_not_preview',
  'actor_not_allowed',
  'entity_not_allowed',
  'approval_token_invalid',
  'request_identity_mismatch',
  'reservation_not_created',
  'readback_verification_failed',
]) {
  assert(source.includes(blocker), `${sourcePath} must include blocker ${blocker}.`);
}

for (const forbidden of [
  'persistTerminalResult(',
  'insert(',
  'update(',
  'upsert(',
  'delete(',
  'publication_status',
  'sitemap_policy',
  'index_policy',
  '"use server"',
]) {
  assert(!source.includes(forbidden), `${sourcePath} must not include ${forbidden}.`);
}

for (const token of [
  'reserves and verifies exactly one preview canary without entity mutation',
  'blocks production before any reservation attempt',
  'blocks a non-canary entity before any reservation attempt',
  'persistTerminalResult).not.toHaveBeenCalled()',
]) {
  assert(test.includes(token), `${testPath} must include ${token}.`);
}

assert(
  audit.includes("import './check-import-real-reservation-canary.mjs';"),
  'publish readiness audit must chain the real reservation canary validator.',
);

console.log('import real reservation canary check passed.');
