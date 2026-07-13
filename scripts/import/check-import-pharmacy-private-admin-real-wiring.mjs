import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const wiringPath = 'src/server/admin/import-pharmacy-private-admin-real-wiring.ts';
const testPath = 'src/server/admin/import-pharmacy-private-admin-real-wiring.test.ts';

const readText = (relativePath) => readFile(path.join(root, relativePath), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const wiring = await readText(wiringPath);
const tests = await readText(testPath);

for (const token of [
  'runImportRealReservationCanary',
  'runImportPharmacyPrivateMutation',
  'createSupabasePharmacyPrivateMutationWriter',
  'createSupabasePharmacyPrivateRollbackWriter',
  'verifyPublishReview',
  'expectedSnapshotHash: context.canaryInput.expectedSnapshotHash',
  'expectedEntityFingerprint: context.canaryInput.expectedEntityFingerprint',
  'if (!reviewApproved) return { ok: false, reference: null }',
  'canary.reservationResult?.kind !== "reserved"',
  '!canary.verified',
  'context.mutationRequest.family === "pharmacy"',
  'context.mutationRequest.selectedFamily === "pharmacy"',
  '(context.mutationRequest.batchSize ?? 1) === 1',
  'createPublishReference',
  'resolveRollbackRequest',
  'request.actorId !== actorId',
  'request.entityId !== entityId',
]) {
  assert(wiring.includes(token), `${wiringPath} must include ${token}`);
}

for (const forbidden of [
  '.from(',
  '.insert(',
  '.update(',
  '.delete(',
  'is_active: true',
  'indexEligible: true',
  'sitemapEligible: true',
  'routeEnabled: true',
  'Promise.all(',
]) {
  assert(!wiring.includes(forbidden), `${wiringPath} must not include ${forbidden}`);
}

for (const token of [
  'requires review, reserves, mutates one pharmacy, and creates an opaque publish reference',
  'fails closed before reservation when persisted review is not approved',
  'fails closed before mutation when reservation readback is not verified',
  'rejects mismatched publish context before review or reservation',
  'resolves an opaque reference and runs the real rollback boundary once',
]) {
  assert(tests.includes(token), `${testPath} must cover ${token}`);
}

console.log('import pharmacy private admin real wiring check passed.');
