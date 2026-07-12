import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const executorPath = 'src/server/admin/import-pharmacy-private-admin-runtime-executor.ts';
const testPath = 'src/server/admin/import-pharmacy-private-admin-runtime-executor.test.ts';

const executor = await readFile(path.join(root, executorPath), 'utf8');
const tests = await readFile(path.join(root, testPath), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const token of [
  'createPharmacyPrivateAdminRuntimeExecutor',
  'executePharmacyPrivateAdminWorkflow',
  'loadExecution',
  'readinessPassed',
  'reviewApproved',
  'auditAvailable',
  'withTimeout',
  'publicVisibility: "private"',
  'indexEligible: false',
  'sitemapEligible: false',
  'routeEnabled: false',
]) {
  assert(executor.includes(token), `${executorPath} must include ${token}`);
}

for (const forbidden of [
  'visibility: "public"',
  'indexEligible: true',
  'sitemapEligible: true',
  'routeEnabled: true',
  'Promise.all(',
  'process.env.SUPABASE_SERVICE_ROLE_KEY',
]) {
  assert(!executor.includes(forbidden), `${executorPath} must not include ${forbidden}`);
}

for (const token of [
  'executes the guarded workflow through supplied real ports',
  'fails closed when runtime loading is unavailable',
  'keeps readiness and review enforcement inside the workflow',
]) {
  assert(tests.includes(token), `${testPath} must cover ${token}`);
}

console.log('import pharmacy private Admin runtime executor check passed.');
