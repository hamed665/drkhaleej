import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const files = {
  handoff: 'src/server/admin/import-pharmacy-verified-reservation-handoff.ts',
  handoffTest: 'src/server/admin/import-pharmacy-verified-reservation-handoff.test.ts',
  wiring: 'src/server/admin/import-pharmacy-private-admin-real-wiring.ts',
  wiringTest: 'src/server/admin/import-pharmacy-private-admin-real-wiring.test.ts',
  operation: 'src/server/admin/import-pharmacy-private-admin-publish-operation.ts',
  executor: 'src/server/admin/import-pharmacy-private-admin-publish-executor.ts',
  action: 'src/app/admin/imports/readiness/actions.ts',
  serverAction: 'src/server/admin/import-pharmacy-private-admin-server-action.ts',
  panel: 'src/components/admin/import-pharmacy-private-admin-control-panel.tsx',
  docs: 'docs/import/VERIFIED_RESERVATION_HANDOFF.md',
  p05Docs: 'docs/import/PRIVATE_ADMIN_WIRING.md',
};

const text = async (file) => readFile(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const [handoff, handoffTest, wiring, wiringTest, operation, executor, action, serverAction, panel, docs, p05Docs] = await Promise.all([
  text(files.handoff),
  text(files.handoffTest),
  text(files.wiring),
  text(files.wiringTest),
  text(files.operation),
  text(files.executor),
  text(files.action),
  text(files.serverAction),
  text(files.panel),
  text(files.docs),
  text(files.p05Docs),
]);

for (const token of [
  'import "server-only"',
  'PharmacyVerifiedReservationReviewBinding',
  'ImportPersistenceReadbackVerificationInput',
  'ImportPersistenceReadbackVerificationResult',
  'isCompatibleReservationAudit',
  'reservation_incomplete',
  'reservation_expired',
  'foreign_reservation',
  'stale_reservation',
  'reservation_binding_mismatch',
  'reservation_not_verified',
  'reservation_integrity_failed',
  'reservation_audit_incompatible',
  'review.operationAttemptId !== verification.operationAttemptId',
  'review.patchHash !== verification.patchHash',
  'verification.entityFamily !== "pharmacy"',
  'verification.operationScope !== "reserve_private_publish"',
  'result.counts.authorization === 1',
  'result.counts.idempotency === 1',
  'result.counts.rollbackSnapshot === 1',
  'result.counts.reservationAudit === 1',
  'result.findings.duplicateCount === 0',
  'result.findings.orphanCount === 0',
  'result.findings.auditGapCount === 0',
  'acceptVerifiedReservation',
  'reservationRpcInvocations: 0',
  'mutationActivated: false',
  'rawIdentifiersExposed: false',
]) {
  assert(handoff.includes(token), `${files.handoff} must include ${token}`);
}

for (const forbidden of [
  'runReservationSnapshotAuditTransaction',
  'runImportRealReservationCanary',
  'createClient(',
  '.from(',
  '.insert(',
  '.update(',
  '.delete(',
  '"use client"',
]) {
  assert(!handoff.includes(forbidden), `${files.handoff} must not include ${forbidden}`);
}

for (const token of [
  'hands one fully verified reservation to an injected executor without invoking reservation again',
  'rejects an expired reservation before the executor port',
  'rejects foreign and incomplete reservation evidence',
  'rejects stale version, fingerprint, and request binding',
  'rejects unverified or non-exact readback integrity',
  'retains compatible legacy reservation-audit handoff during the migration window',
  'returns a bounded blocker when the injected executor refuses the handoff',
]) {
  assert(handoffTest.includes(token), `${files.handoffTest} must cover ${token}`);
}

for (const token of [
  'loadVerifiedReservationEvidence',
  'verifiedReservationExecutor?: PharmacyVerifiedReservationExecutorPort',
  'runPharmacyVerifiedReservationHandoff',
]) {
  assert(wiring.includes(token), `${files.wiring} must include ${token}`);
}
for (const forbidden of [
  'runImportRealReservationCanary',
  'reservationRunner',
  'runReservationSnapshotAuditTransaction',
  'runImportPharmacyPrivateMutation',
  'createSupabasePharmacyPrivateMutationWriter',
]) {
  assert(!wiring.includes(forbidden), `${files.wiring} must not include ${forbidden}`);
}

for (const token of [
  'hands a pre-verified reservation to the injected executor exactly once',
  'keeps private publish disabled when the executor port is absent',
  'does not expose raw reservation identifiers in the workflow result',
]) {
  assert(wiringTest.includes(token), `${files.wiringTest} must cover ${token}`);
}

for (const token of [
  '"reserve_private_publish"',
  '"private_publish"',
  'runPharmacyPrivateAdminPublishOperation',
]) {
  assert(action.includes(token), `${files.action} must activate P05 through ${token}`);
}
assert(!/IMPORT_PHARMACY_PRIVATE_ADMIN_ENABLED_OPERATIONS\s*=\s*\[[\s\S]*?"rollback"[\s\S]*?\]\s+as const/.test(action), `${files.action} must keep rollback disabled until P06.`);

for (const token of [
  'loadPharmacyVerifiedReservationForPublish',
  'createPharmacyPrivateAdminRealPorts',
  'verifiedReservationExecutor: input.dependencies.executor',
]) assert(operation.includes(token), `${files.operation} must preserve the verified handoff through ${token}`);

for (const token of [
  'runImportPharmacyPrivateMutation',
  'publishReferenceStore.create',
  'verifyPharmacyPrivatePublishReadback',
]) assert(executor.includes(token), `${files.executor} must consume the verified handoff through ${token}`);

for (const source of [action, serverAction, panel]) {
  for (const forbidden of [
    'expectedReservationId',
    'expectedRollbackSnapshotId',
    'expectedAuditEventId',
    'authorizationId',
    'PharmacyVerifiedReservationEvidence',
    'PharmacyVerifiedReservationReviewBinding',
  ]) {
    assert(!source.includes(forbidden), `browser/action surface must not expose ${forbidden}`);
  }
}

for (const token of [
  'P04-B',
  'server-only',
  'No second Reservation',
  'stale',
  'foreign',
  'incomplete',
  'P05',
  'disabled',
  'No Production',
]) {
  assert(docs.includes(token), `${files.docs} must include ${token}`);
}
for (const token of [
  'P05 Private Admin Wiring',
  'already verified Reservation',
  'must not create a second Reservation',
  'post-mutation readback',
  'no Production',
]) assert(p05Docs.toLowerCase().includes(token.toLowerCase()), `${files.p05Docs} must include ${token}`);

console.log('import verified Reservation handoff contract passed through P05 activation.');
