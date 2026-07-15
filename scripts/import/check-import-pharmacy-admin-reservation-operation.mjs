#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const files = {
  operation: path.resolve('src/server/admin/import-pharmacy-admin-reservation-operation.ts'),
  action: path.resolve('src/app/admin/imports/readiness/actions.ts'),
  panel: path.resolve('src/components/admin/import-pharmacy-private-admin-control-panel.tsx'),
  test: path.resolve('src/server/admin/import-pharmacy-admin-reservation-operation.test.ts'),
};
for (const [name, file] of Object.entries(files)) if (!existsSync(file)) throw new Error(`${name} reservation operation file missing`);
const source = Object.fromEntries(Object.entries(files).map(([name, file]) => [name, readFileSync(file, 'utf8')]));
for (const token of [
  'RESERVE PRIVATE PUBLISH ${input.entityId}', 'runReservationSnapshotAuditTransaction',
  'readByReviewStateId', 'entityMutated: false', 'publicVisibility: "private"',
  'verifyImportPersistenceReadback', 'reservation_integrity_failed',
  'indexEligible: false', 'sitemapEligible: false', 'routeEnabled: false',
]) if (!source.operation.includes(token)) throw new Error(`reservation operation missing ${token}`);
for (const token of ['reserve_private_publish', 'runPharmacyAdminReservationOperation', 'reservationState', 'reservationState.integrityVerified']) {
  if (!source.action.includes(token)) throw new Error(`Admin action missing ${token}`);
}
for (const token of ['Reserve private publish', 'name={step.operation === "review" ? "publishConfirmation" : "confirmation"}', 'integrity verified', 'integrity blocked', 'Entity mutated: No']) {
  if (!source.panel.includes(token)) throw new Error(`Admin panel missing bounded reservation UI ${token}`);
}
for (const forbidden of ['authorizationId', 'rollbackSnapshotId', 'auditEventId', 'token', 'nonce']) {
  if (source.action.includes(`reservationState.${forbidden}`) || source.panel.includes(forbidden)) throw new Error(`browser reservation result exposes ${forbidden}`);
}
for (const token of ['reserves exactly once without entity or public mutation', 'fails closed for wrong confirmation and unavailable authorization', 'fails the operation closed when readback integrity fails']) {
  if (!source.test.includes(token)) throw new Error(`reservation tests missing ${token}`);
}
console.log('Pharmacy Admin reservation operation validation passed.');
