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

function requireScript(scripts, name, expectedSnippet) {
  assert(typeof scripts[name] === 'string', `package.json must define script ${name}.`);
  assert(scripts[name].includes(expectedSnippet), `${name} must include ${expectedSnippet}.`);
}

const packageJson = await readJson(packagePath);
const scripts = packageJson.scripts ?? {};
const auditSource = await readText(auditPath);

requireScript(scripts, 'typecheck', 'tsc --noEmit');
requireScript(scripts, 'build', 'next build');
requireScript(scripts, 'lint', 'eslint .');
requireScript(scripts, 'import:publish-readiness-audit:validate', 'node scripts/import/check-import-publish-readiness-audit.mjs');

for (const forbidden of ['--ignore-build-errors', 'ignoreBuildErrors', 'typescript.ignoreBuildErrors', 'eslint.ignoreDuringBuilds']) {
  assert(!JSON.stringify(packageJson).includes(forbidden), `package.json must not include unsafe build bypass ${forbidden}.`);
}

for (const requiredValidator of [
  './check-import-publish-lock.mjs',
  './check-import-publish-lifecycle.mjs',
  './check-import-domain-entity-contract.mjs',
  './check-import-canonical-geo-contract.mjs',
  './check-import-unified-draft-entity.mjs',
  './check-import-oman-geo-authority-registry.mjs',
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
  './check-import-validator-ci-audit.mjs',
  './check-import-admin-action-contract.mjs',
  './check-import-admin-action-result-contract.mjs',
]) {
  assert(auditSource.includes(`import '${requiredValidator}';`), `import readiness audit must include ${requiredValidator}.`);
}

assert(!auditSource.includes('createSupabaseServiceRoleClient'), 'top-level import audit must not perform DB reads.');
assert(!auditSource.includes('insert('), 'top-level import audit must not mutate rows.');
assert(!auditSource.includes('update('), 'top-level import audit must not mutate rows.');
assert(!auditSource.includes('delete('), 'top-level import audit must not mutate rows.');

console.log('import build typecheck guard passed.');
