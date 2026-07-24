import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const wiringPath = 'src/server/admin/import-pharmacy-private-admin-real-wiring.ts';
const testPath = 'src/server/admin/import-pharmacy-private-admin-real-wiring.test.ts';
const actionPath = 'src/app/admin/imports/readiness/actions.ts';
const operationPath = 'src/server/admin/import-pharmacy-private-admin-publish-operation.ts';
const rollbackOperationPath = 'src/server/admin/import-pharmacy-private-admin-rollback-operation.ts';
const stateMachinePath = 'src/server/admin/import-pharmacy-admin-state-machine.ts';
const executorPath = 'src/server/admin/import-pharmacy-private-admin-publish-executor.ts';

const readText = (relativePath) => readFile(path.join(root, relativePath), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const [wiring, tests, action, operation, rollbackOperation, stateMachine, executor] = await Promise.all([
  readText(wiringPath),
  readText(testPath),
  readText(actionPath),
  readText(operationPath),
  readText(rollbackOperationPath),
  readText(stateMachinePath),
  readText(executorPath),
]);

for (const token of [
  'runPharmacyVerifiedReservationHandoff',
  'loadVerifiedReservationEvidence',
  'verifiedReservationExecutor?: PharmacyVerifiedReservationExecutorPort',
  'if (!executor) return { ok: false, reference: null }',
  'handoff.kind === "handed_off"',
  'context.mutationRequest.family === "pharmacy"',
  'context.mutationRequest.selectedFamily === "pharmacy"',
  '(context.mutationRequest.batchSize ?? 1) === 1',
  'rollbackWriter({ actorId, entityId })',
  'result.kind === "rolled_back"',
  'result.kind === "replayed"',
  'rollback-authority-consumed',
  'rollback-authority-replayed',
]) {
  assert(wiring.includes(token), `${wiringPath} must include ${token}`);
}

for (const forbidden of [
  'runImportRealReservationCanary',
  'reservationRunner',
  'runReservationSnapshotAuditTransaction',
  'runImportPharmacyPrivateMutation',
  'createSupabasePharmacyPrivateMutationWriter',
  'resolveRollbackRequest',
  'publishReference })',
  '.from(',
  '.insert(',
  '.update(',
  '.delete(',
  'is_active: true',
  'indexEligible: true',
  'sitemapEligible: true',
  'routeEnabled: true',
]) {
  assert(!wiring.includes(forbidden), `${wiringPath} must not include ${forbidden}`);
}

for (const token of [
  'hands a pre-verified reservation to the injected executor exactly once',
  'keeps private publish disabled when the executor port is absent',
  'fails closed before the executor when verified evidence is stale or foreign',
  'rejects mismatched publish context before reading reservation evidence',
  'does not expose raw reservation identifiers in the workflow result',
  'invokes the atomic authority rollback once without resolving a raw reference',
  'distinguishes a bounded rollback replay without a second authority path',
]) {
  assert(tests.includes(token), `${testPath} must cover ${token}`);
}

for (const token of [
  '"dry_run"',
  '"review"',
  '"reserve_private_publish"',
  '"private_publish"',
  '"rollback"',
  'if (operation === "private_publish")',
  'if (operation === "rollback")',
  'runPharmacyPrivateAdminPublishOperation',
  'runPharmacyPrivateAdminRollbackOperation',
  'submittedRevision !== beforeState.revision',
  'state_readback_unverified',
]) {
  assert(action.includes(token), `${actionPath} must include P08 activation token ${token}`);
}

for (const token of [
  'environment !== "preview"',
  '!input.allowedActorIds.includes(input.actorId)',
  '!input.allowedEntityIds.includes(input.entityId)',
  'confirmation !== `ROLLBACK PRIVATE PUBLISH ${input.entityId}`',
  'createSupabasePharmacyPrivateRollbackWriter',
  'rawReferenceExposed: false',
  'publicVisibility: "private"',
  'indexEligible: false',
  'sitemapEligible: false',
  'routeEnabled: false',
]) {
  assert(rollbackOperation.includes(token), `${rollbackOperationPath} must include ${token}`);
}

for (const token of [
  'loadPharmacyVerifiedReservationForPublish',
  'createPharmacyPrivateAdminRealPorts',
  'confirmation !== `EXECUTE PRIVATE PUBLISH ${input.entityId}`',
  'rawIdentifiersExposed: false',
]) assert(operation.includes(token), `${operationPath} must include ${token}`);

for (const token of [
  'runImportPharmacyPrivateMutation',
  'if (mutation.kind !== "mutated")',
  'publishReferenceStore.create',
  'readbackClient.read',
  'verifyPharmacyPrivatePublishReadback',
  'readback.verified',
  'BOUNDED_ROLLBACK_AUTHORITY_REFERENCE',
]) assert(executor.includes(token), `${executorPath} must include ${token}`);

for (const token of [
  'automaticMutationRetryAllowed: false',
  'rawIdentifiersExposed: false',
  'publicVisibility: "private"',
  'indexEligible: false',
  'sitemapEligible: false',
  'routeEnabled: false',
  'bulkAllowed: false',
]) assert(stateMachine.includes(token), `${stateMachinePath} must include ${token}`);

for (const source of [action, operation, rollbackOperation, executor, stateMachine]) {
  for (const forbidden of [
    'visibility: "public"',
    'indexEligible: true',
    'sitemapEligible: true',
    'routeEnabled: true',
    'publicRouteEnabled: true',
  ]) assert(!source.includes(forbidden), `P08 private Admin wiring must not include ${forbidden}`);
}

for (const forbidden of [
  /setTimeout\s*\(/,
  /setInterval\s*\(/,
]) assert(!forbidden.test(action), `${actionPath} must not automatically retry writes`);

console.log('import Pharmacy private Admin real wiring check passed.');
