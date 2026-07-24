import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contextPath = 'src/server/admin/import-pharmacy-private-admin-runtime-context.ts';
const actionPath = 'src/app/admin/imports/readiness/actions.ts';
const rollbackOperationPath = 'src/server/admin/import-pharmacy-private-admin-rollback-operation.ts';
const stateMachinePath = 'src/server/admin/import-pharmacy-admin-state-machine.ts';
const persistencePath = 'src/server/admin/import-private-persistence-adapter.ts';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const [context, action, rollbackOperation, stateMachine, persistence] = await Promise.all([
  readText(contextPath),
  readText(actionPath),
  readText(rollbackOperationPath),
  readText(stateMachinePath),
  readText(persistencePath),
]);

for (const token of [
  'createSupabasePharmacyPrivateAdminContextReader',
  'loadPharmacyPrivateAdminRuntimeContext',
  'environment_not_preview',
  'actor_not_allowed',
  'entity_not_allowed',
  'approval_token_invalid',
  'center_type !== "pharmacy"',
  'center.status !== "draft"',
  'center.is_active',
  'center.is_featured',
  'center: buildPharmacyPrivateAdminCenterSnapshot(center)',
  'buildPharmacyPrivateAdminEntityFingerprint(center)',
  'batchSize: 1',
  'expectedSnapshotHash: snapshotHash',
  'expectedEntityFingerprint: fingerprint',
]) {
  assert(context.includes(token), `${contextPath} must include ${token}`);
}

for (const token of [
  'ImportPublishRollbackSnapshot',
  'center?: Readonly<Record<string, unknown>>',
]) {
  assert(persistence.includes(token), `${persistencePath} must include ${token}`);
}

for (const token of [
  'executionEnabled: process.env.VERCEL_ENV === "preview"',
  '"dry_run",\n  "review",\n  "reserve_private_publish",\n  "private_publish",\n  "rollback",',
  'if (operation === "rollback")',
  'if (operation === "private_publish")',
  'if (operation === "reserve_private_publish")',
  'createPharmacyPrivateAdminRuntimeContextReaderFromEnvironment()',
  'loadPharmacyPrivateAdminRuntimeContext(',
  'runPharmacyPrivateAdminPublishOperation',
  'runPharmacyPrivateAdminRollbackOperation',
  'submittedRevision !== beforeState.revision',
  'state_readback_unverified',
]) {
  assert(action.includes(token), `${actionPath} must include ${token}`);
}

for (const token of [
  'environment !== "preview"',
  '!input.allowedActorIds.includes(input.actorId)',
  '!input.allowedEntityIds.includes(input.entityId)',
  'confirmation !== `ROLLBACK PRIVATE PUBLISH ${input.entityId}`',
  'rawReferenceExposed: false',
]) {
  assert(rollbackOperation.includes(token), `${rollbackOperationPath} must include ${token}`);
}

for (const token of [
  'automaticMutationRetryAllowed: false',
  'rawIdentifiersExposed: false',
  'publicVisibility: "private"',
  'indexEligible: false',
  'sitemapEligible: false',
  'routeEnabled: false',
  'bulkAllowed: false',
]) {
  assert(stateMachine.includes(token), `${stateMachinePath} must include ${token}`);
}

for (const forbidden of [
  'is_active: true',
  'is_featured: true',
  'indexPolicy: "index"',
  'sitemapPolicy: "included"',
  'visibility: "public"',
]) {
  assert(!context.includes(forbidden), `${contextPath} must not include ${forbidden}`);
  assert(!action.includes(forbidden), `${actionPath} must not include ${forbidden}`);
  assert(!rollbackOperation.includes(forbidden), `${rollbackOperationPath} must not include ${forbidden}`);
  assert(!stateMachine.includes(forbidden), `${stateMachinePath} must not include ${forbidden}`);
}

for (const forbidden of [/setTimeout\s*\(/, /setInterval\s*\(/]) {
  assert(!forbidden.test(action), `${actionPath} must not automatically retry writes`);
}

console.log('import pharmacy private Admin runtime context check passed through bounded P08 activation.');
