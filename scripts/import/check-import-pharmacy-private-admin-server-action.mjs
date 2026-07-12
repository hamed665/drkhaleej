import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const boundaryPath = 'src/server/admin/import-pharmacy-private-admin-server-action.ts';
const actionPath = 'src/app/admin/imports/readiness/actions.ts';
const testPath = 'src/server/admin/import-pharmacy-private-admin-server-action.test.ts';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const boundary = await readText(boundaryPath);
const action = await readText(actionPath);
const tests = await readText(testPath);

for (const token of [
  'executionEnabled: boolean',
  'enabledOperations: readonly PharmacyPrivateAdminOperation[]',
  'operation_not_enabled',
  'new Set(dependencies.enabledOperations)',
  'allowedEntityIds: readonly string[]',
  'formData.getAll(key)',
  'entity_not_allowed',
  'environment_not_preview',
  'PUBLISH PRIVATE PHARMACY',
  'ROLLBACK PRIVATE PHARMACY',
  'invalid_publish_reference',
  'dependencies.execute',
]) {
  assert(boundary.includes(token), `${boundaryPath} must include ${token}`);
}

for (const token of [
  '"use server"',
  'requirePlatformAdmin()',
  'IMPORT_PHARMACY_PRIVATE_ADMIN_ACTION_ENABLED = false as const',
  'IMPORT_PHARMACY_PRIVATE_ADMIN_ENABLED_OPERATIONS = [] as const',
  'enabledOperations: IMPORT_PHARMACY_PRIVATE_ADMIN_ENABLED_OPERATIONS',
  'process.env.VERCEL_ENV',
  'IMPORT_PREVIEW_CANARY_ENTITY_IDS',
  'IMPORT_PREVIEW_ALLOWED_ACTOR_IDS',
  'createPharmacyPrivateAdminRuntimeContextReaderFromEnvironment',
  'loadPharmacyPrivateAdminRuntimeContext',
]) {
  assert(action.includes(token), `${actionPath} must include ${token}`);
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
  assert(!boundary.includes(forbidden), `${boundaryPath} must not include ${forbidden}`);
  assert(!action.includes(forbidden), `${actionPath} must not include ${forbidden}`);
}

for (const token of [
  'fails closed while the production action switch is disabled',
  'allows only explicitly enabled read operations',
  'rejects duplicate fields, non-allowlisted entities, and production mutation',
  'requires exact confirmation before one private publish',
  'requires an opaque publish reference before rollback',
]) {
  assert(tests.includes(token), `${testPath} must cover ${token}`);
}

console.log('import pharmacy private Admin server action check passed.');
