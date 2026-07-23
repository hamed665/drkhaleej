import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const boundaryPath = 'src/server/admin/import-pharmacy-private-admin-server-action.ts';
const actionPath = 'src/app/admin/imports/readiness/actions.ts';
const operationPath = 'src/server/admin/import-pharmacy-private-admin-publish-operation.ts';
const testPath = 'src/server/admin/import-pharmacy-private-admin-server-action.test.ts';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const [boundary, action, operation, tests] = await Promise.all([
  readText(boundaryPath),
  readText(actionPath),
  readText(operationPath),
  readText(testPath),
]);

for (const token of [
  'executionEnabled: boolean',
  'enabledOperations: readonly PharmacyPrivateAdminOperation[]',
  'operation_not_enabled',
  'new Set(dependencies.enabledOperations)',
  'allowedEntityIds: readonly string[]',
  'formData.getAll(key)',
  'entity_not_allowed',
  'environment_not_preview',
  'RESERVE PRIVATE PUBLISH',
  'EXECUTE PRIVATE PUBLISH',
  'ROLLBACK PRIVATE PUBLISH',
  'dependencies.execute',
]) assert(boundary.includes(token), `${boundaryPath} must include ${token}`);

for (const forbidden of [
  'invalid_publish_reference',
  'readSingle(input.formData, "publishReference")',
  'publishReference:',
  'ROLLBACK PRIVATE PHARMACY',
]) assert(!boundary.includes(forbidden), `${boundaryPath} must not include ${forbidden}`);

for (const token of [
  '"use server"',
  'requirePlatformAdmin()',
  '"reserve_private_publish"',
  '"private_publish"',
  'executionEnabled: process.env.VERCEL_ENV === "preview"',
  'enabledOperations: IMPORT_PHARMACY_PRIVATE_ADMIN_ENABLED_OPERATIONS',
  'runPharmacyPrivateAdminActionState',
  'process.env.VERCEL_ENV',
  'IMPORT_PREVIEW_CANARY_ENTITY_IDS',
  'IMPORT_PREVIEW_ALLOWED_ACTOR_IDS',
  'createPharmacyPrivateAdminRuntimeContextReaderFromEnvironment',
  'loadPharmacyPrivateAdminRuntimeContext',
  'runPharmacyAdminReservationOperation',
  'runPharmacyPrivateAdminPublishOperation',
]) assert(action.includes(token), `${actionPath} must include ${token}`);

for (const token of [
  'environment !== "preview"',
  'EXECUTE PRIVATE PUBLISH ${input.entityId}',
  'loadPharmacyVerifiedReservationForPublish',
  'createPharmacyPrivateAdminPublishExecutor',
  'createPharmacyPrivateAdminRealPorts',
  'rawIdentifiersExposed: false',
]) assert(operation.includes(token), `${operationPath} must include ${token}`);

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
  assert(!boundary.includes(forbidden), `${boundaryPath} must not include ${forbidden}`);
  assert(!action.includes(forbidden), `${actionPath} must not include ${forbidden}`);
}
assert(!action.includes('"rollback"\n] as const'), `${actionPath} must keep rollback UI activation disabled until P08/P09.`);

for (const token of [
  'fails closed while the production action switch is disabled',
  'allows only explicitly enabled read operations',
  'requires exact entity-bound confirmation before one reservation',
  'rejects duplicate fields, non-allowlisted entities, and production mutation',
  'requires exact entity-bound confirmation before one private publish',
  'accepts rollback only with an entity-bound confirmation and no raw reference field',
]) assert(tests.includes(token), `${testPath} must cover ${token}`);

assert(!boundary.includes('publishReference'), `${boundaryPath} must keep the raw rollback reference outside the browser contract.`);

console.log('import Pharmacy private Admin server action check passed.');
