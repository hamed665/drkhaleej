import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const wiringPath = 'src/server/admin/import-pharmacy-private-admin-real-wiring.ts';
const testPath = 'src/server/admin/import-pharmacy-private-admin-real-wiring.test.ts';
const actionPath = 'src/app/admin/imports/readiness/actions.ts';
const operationPath = 'src/server/admin/import-pharmacy-private-admin-publish-operation.ts';
const executorPath = 'src/server/admin/import-pharmacy-private-admin-publish-executor.ts';

const readText = (relativePath) => readFile(path.join(root, relativePath), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const [wiring, tests, action, operation, executor] = await Promise.all([
  readText(wiringPath),
  readText(testPath),
  readText(actionPath),
  readText(operationPath),
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
  'resolveRollbackRequest',
  'request.actorId !== actorId',
  'request.entityId !== entityId',
]) {
  assert(wiring.includes(token), `${wiringPath} must include ${token}`);
}

for (const forbidden of [
  'runImportRealReservationCanary',
  'reservationRunner',
  'runReservationSnapshotAuditTransaction',
  'runImportPharmacyPrivateMutation',
  'createSupabasePharmacyPrivateMutationWriter',
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
  'resolves an opaque reference and runs the existing rollback boundary once',
]) {
  assert(tests.includes(token), `${testPath} must cover ${token}`);
}

for (const token of [
  '"dry_run"',
  '"review"',
  '"reserve_private_publish"',
  '"private_publish"',
  'operation !== "private_publish"',
  'runPharmacyPrivateAdminPublishOperation',
]) {
  assert(action.includes(token), `${actionPath} must include P05 activation token ${token}`);
}
assert(!/IMPORT_PHARMACY_PRIVATE_ADMIN_ENABLED_OPERATIONS\s*=\s*\[[\s\S]*?"rollback"[\s\S]*?\]\s+as const/.test(action), `${actionPath} must keep rollback disabled until P06.`);

for (const token of [
  'loadPharmacyVerifiedReservationForPublish',
  'createPharmacyPrivateAdminRealPorts',
  'confirmation !== `EXECUTE PRIVATE PUBLISH ${input.entityId}`',
  'rawIdentifiersExposed: false',
]) assert(operation.includes(token), `${operationPath} must include ${token}`);

for (const token of [
  'runImportPharmacyPrivateMutation',
  'publishReferenceStore.create',
  'readbackClient.read',
  'verifyPharmacyPrivatePublishReadback',
  'readback.verified',
]) assert(executor.includes(token), `${executorPath} must include ${token}`);

for (const source of [action, operation, executor]) {
  for (const forbidden of [
    'visibility: "public"',
    'indexEligible: true',
    'sitemapEligible: true',
    'routeEnabled: true',
    'publicRouteEnabled: true',
  ]) assert(!source.includes(forbidden), `P05 private Admin wiring must not include ${forbidden}`);
}

console.log('import Pharmacy private Admin real wiring check passed.');
