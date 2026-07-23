import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const wiringPath = 'src/server/admin/import-pharmacy-private-admin-real-wiring.ts';
const testPath = 'src/server/admin/import-pharmacy-private-admin-real-wiring.test.ts';
const actionPath = 'src/app/admin/imports/readiness/actions.ts';

const readText = (relativePath) => readFile(path.join(root, relativePath), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const [wiring, tests, action] = await Promise.all([
  readText(wiringPath),
  readText(testPath),
  readText(actionPath),
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
  'IMPORT_PHARMACY_PRIVATE_ADMIN_ENABLED_OPERATIONS = ["dry_run", "review", "reserve_private_publish"] as const',
  'operation !== "dry_run" && operation !== "review" && operation !== "reserve_private_publish"',
]) {
  assert(action.includes(token), `${actionPath} must keep P04-B runtime activation disabled with ${token}`);
}

console.log('import pharmacy private admin real wiring check passed.');
