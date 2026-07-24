#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const files = {
  operation: path.resolve('src/server/admin/import-pharmacy-admin-reservation-operation.ts'),
  action: path.resolve('src/app/admin/imports/readiness/actions.ts'),
  panel: path.resolve('src/components/admin/import-pharmacy-private-admin-control-panel.tsx'),
  stateMachine: path.resolve('src/server/admin/import-pharmacy-admin-state-machine.ts'),
  test: path.resolve('src/server/admin/import-pharmacy-admin-reservation-operation.test.ts'),
  evidence: path.resolve('docs/import/RES_INTEGRITY_READBACK_PREVIEW_EVIDENCE.md'),
};
for (const [name, file] of Object.entries(files)) {
  if (!existsSync(file)) throw new Error(`${name} reservation operation file missing`);
}
const source = Object.fromEntries(
  Object.entries(files).map(([name, file]) => [name, readFileSync(file, 'utf8')]),
);

for (const token of [
  'RESERVE PRIVATE PUBLISH ${input.entityId}',
  'runReservationSnapshotAuditTransaction',
  'readByReviewStateId',
  'entityMutated: false',
  'publicVisibility: "private"',
  'verifyImportPersistenceReadback',
  'reservation_integrity_failed',
  'indexEligible: false',
  'sitemapEligible: false',
  'routeEnabled: false',
]) {
  if (!source.operation.includes(token)) throw new Error(`reservation operation missing ${token}`);
}

for (const token of [
  'reserve_private_publish',
  'runPharmacyAdminReservationOperation',
  'const reservationResult',
  'reservationState = reservationResult',
  'reservationResult?.reserved && reservationResult.integrityVerified',
  'reservationReplayed = reservationResult?.replayed === true',
  'expectedReadbackStage',
  'reservation_verified',
  'state_readback_unverified',
]) {
  if (!source.action.includes(token)) throw new Error(`Admin action missing ${token}`);
}

for (const token of [
  'Reserve private publish',
  'confirmationName: "confirmation"',
  'confirmationPrefix: "RESERVE PRIVATE PUBLISH"',
  'name="stateRevision"',
  'Locked by server state',
  'Waiting for server readback',
  'state_revision_mismatch',
  'No automatic mutation retry',
]) {
  if (!source.panel.includes(token)) throw new Error(`Admin panel missing bounded reservation UI ${token}`);
}

for (const token of [
  'reservationAuditCount === 1',
  'reservation_verified',
  'Reservation, snapshot, and reservation audit readback are exact.',
  'automaticMutationRetryAllowed: false',
  'rawIdentifiersExposed: false',
]) {
  if (!source.stateMachine.includes(token)) throw new Error(`Admin state machine missing Reservation invariant ${token}`);
}

for (const forbidden of ['authorizationId', 'rollbackSnapshotId', 'auditEventId', 'token', 'nonce']) {
  if (
    source.action.includes(`reservationState.${forbidden}`) ||
    source.action.includes(`reservationResult.${forbidden}`) ||
    source.panel.includes(forbidden)
  ) {
    throw new Error(`browser reservation result exposes ${forbidden}`);
  }
}

for (const token of [
  'reserves exactly once without entity or public mutation',
  'fails closed for wrong confirmation and unavailable authorization',
  'fails the operation closed when readback integrity fails',
]) {
  if (!source.test.includes(token)) throw new Error(`reservation tests missing ${token}`);
}

for (const token of [
  'isolated Preview Supabase project',
  'RESERVE PRIVATE PUBLISH <entity-id>',
  'authorization rows = 1',
  'reservation rows = 1',
  'snapshot rows = 1',
  'reservation audit rows = 1',
  'duplicates = 0',
  'orphans = 0',
  'audit gaps = 0',
  'independent reviewer login',
  'Never attach authorization material',
]) {
  if (!source.evidence.includes(token)) throw new Error(`Preview evidence runbook missing ${token}`);
}

for (const forbidden of [
  /setTimeout\s*\(/,
  /setInterval\s*\(/,
  /autoRetry/i,
]) {
  if (forbidden.test(source.action)) throw new Error('Reservation action must not automatically retry writes');
}

console.log('Pharmacy Admin reservation operation validation passed.');
