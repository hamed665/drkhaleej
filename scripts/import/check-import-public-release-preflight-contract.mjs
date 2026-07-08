import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assertIncludes(source, token, label) {
  if (!source.includes(token)) throw new Error(`${label} must include ${token}`);
}

const doc = await readText('docs/import/public-release-preflight-contract.md');
const workflow = await readText('.github/workflows/import-readiness-contract.yml');
const manifest = await readText('fixtures/import/import-readiness-runner.manifest.json');
const holdDoc = await readText('docs/import/public-hospital-hold-contract.md');
const fixtureDoc = await readText('docs/import/DRKHALEEJ_FIRST_BATCH_REAL_FIXTURE_V1.md');
const fixtureCheck = await readText('scripts/import/check-first-batch-real-fixture.mjs');

for (const token of [
  '# Import Public Release Preflight Contract',
  'public detail route',
  'directory or search result',
  'sitemap entry',
  'public sitemap eligibility is downstream of public discovery eligibility',
  'public discovery eligibility is downstream of public detail eligibility',
  'reviewed source, location, contact or map, candidate approval, canonical path, and route-family match',
  'unsafe public relation and local-suggestion counts are zero',
  'English and Arabic representative samples pass smoke checks',
  'manual duplicate records win over imported duplicate records',
  'Imported hospitals remain blocked',
  'unified public provider projection',
  'must not create a family-specific parallel catalog',
]) {
  assertIncludes(doc, token, 'public release preflight docs');
}

assertIncludes(workflow, 'node scripts/import/run-import-readiness.mjs', 'import readiness workflow');

for (const token of [
  'scripts/import/check-imported-hospital-public-hold.mjs',
  'scripts/import/check-first-batch-real-fixture.mjs',
]) {
  assertIncludes(manifest, token, 'import readiness runner manifest');
}

for (const token of [
  'public sitemap eligibility is downstream of public discovery eligibility',
  'first-batch dry-run fixture passes',
]) {
  assertIncludes(holdDoc, token, 'hospital hold docs');
}

for (const token of [
  'zero public eligibility',
  'hospital sitemap URL count stays zero',
  'Promotion rule',
]) {
  assertIncludes(fixtureDoc, token, 'first batch fixture docs');
}

for (const token of [
  "report.decision === 'no_go'",
  'hospital rows must not enter sitemap yet',
  'hospital suggestions must not be public yet',
]) {
  assertIncludes(fixtureCheck, token, 'first batch fixture validator');
}

console.log('import public release preflight contract check passed.');
