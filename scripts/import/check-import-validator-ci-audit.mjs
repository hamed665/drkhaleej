import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const packagePath = 'package.json';
const auditPath = 'scripts/import/check-import-publish-readiness-audit.mjs';

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'));
}

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertScript(scripts, name, expected) {
  assert(typeof scripts[name] === 'string', `package.json must define ${name}.`);
  if (expected) assert(scripts[name].includes(expected), `${name} must include ${expected}.`);
}

const packageJson = await readJson(packagePath);
const scripts = packageJson.scripts ?? {};
const auditSource = await readText(auditPath);

for (const [name, expected] of [
  ['typecheck', 'tsc --noEmit'],
  ['build', 'next build'],
  ['lint', 'eslint .'],
  ['import:publish-readiness-audit:validate', 'scripts/import/check-import-publish-readiness-audit.mjs'],
]) {
  assertScript(scripts, name, expected);
}

for (const validator of [
  './check-import-publish-lock.mjs',
  './check-import-publish-lifecycle.mjs',
  './check-import-domain-entity-contract.mjs',
  './check-import-canonical-geo-contract.mjs',
  './check-import-publication-validation.mjs',
  './check-import-link-rule-matrix.mjs',
  './check-import-internal-link-generator.mjs',
  './check-import-internal-link-cache.mjs',
  './check-import-sitemap-eligibility.mjs',
  './check-import-schema-generator.mjs',
  './check-import-readiness-engine.mjs',
  './check-import-admin-readiness-panel.mjs',
  './check-import-performance-guard.mjs',
  './check-import-manual-publish-flow.mjs',
  './check-import-queue-dashboard.mjs',
  './check-import-admin-capability-audit.mjs',
]) {
  assert(auditSource.includes(`import '${validator}';`), `publish readiness audit must chain ${validator}.`);
}

assert(!auditSource.includes('createSupabaseServiceRoleClient'), 'top-level import readiness validator must not perform DB reads.');
assert(!auditSource.includes('insert('), 'top-level import readiness validator must not mutate data.');
assert(!auditSource.includes('update('), 'top-level import readiness validator must not mutate data.');
assert(!auditSource.includes('delete('), 'top-level import readiness validator must not mutate data.');

console.log('import validator CI audit check passed.');
