import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contractPath = 'src/server/admin/import-pharmacy-private-mutation-adapter.ts';
const testPath = 'src/server/admin/import-pharmacy-private-mutation-adapter.test.ts';
const auditPath = 'scripts/import/check-import-publish-readiness-audit.mjs';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const source = await readText(contractPath);
const tests = await readText(testPath);
const audit = await readText(auditPath);

for (const token of [
  'ImportPharmacyPrivateMutationRequest',
  'ImportPharmacyPrivateMutationWriter',
  'runImportPharmacyPrivateMutation',
  'getImportPharmacyPrivateMutationBlockers',
  'visibility: "private"',
  'publicRouteEnabled: false',
  'indexable: false',
  'sitemapEligible: false',
  'bulk_not_allowed',
  'rollback_failed',
  'mutation_failed_after_write',
]) {
  assert(source.includes(token), `pharmacy private mutation adapter must include ${token}.`);
}

for (const forbidden of [
  'doctor',
  'hospital',
  'batchSize: number',
  'publicRouteEnabled: true',
  'indexable: true',
  'sitemapEligible: true',
  'createSupabaseServiceRoleClient',
  '.from(',
]) {
  assert(!source.includes(forbidden), `pharmacy private mutation adapter must not include ${forbidden}.`);
}

for (const behavior of [
  'forces a successful mutation to remain private and undiscoverable',
  'fails closed when execution is disabled or bulk is requested',
  'rolls back when the writer reports failure after a write',
  'reports rollback failure instead of pretending recovery succeeded',
]) {
  assert(tests.includes(behavior), `pharmacy private mutation tests must cover: ${behavior}.`);
}

assert(
  audit.includes("import './check-import-pharmacy-private-mutation-adapter.mjs';"),
  'publish readiness audit must chain the pharmacy private mutation adapter validator.',
);

console.log('import pharmacy private mutation adapter check passed.');
