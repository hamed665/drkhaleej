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
const manifestSource = await readText('fixtures/import/import-readiness-runner.manifest.json');
const manifest = JSON.parse(manifestSource);
const holdDoc = await readText('docs/import/public-hospital-hold-contract.md');
const fixtureDoc = await readText('docs/import/DRKHALEEJ_FIRST_BATCH_REAL_FIXTURE_V1.md');
const fixtureCheck = await readText('scripts/import/check-first-batch-real-fixture.mjs');
const importSitemap = await readText('src/server/public/import-sitemap.ts');

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
  'Imported hospital detail and discovery remain blocked',
  'hospital sitemap eligibility remains guarded by import queue readiness',
  'unified public provider projection',
  'must not create a family-specific parallel catalog',
]) {
  assertIncludes(doc, token, 'public release preflight docs');
}

assertIncludes(
  workflow,
  'node scripts/import/run-import-readiness.mjs',
  'import readiness workflow',
);

const manifestCommands = new Set(
  manifest.checks.map((check) => check.command.join(' ')),
);

for (const command of [
  'scripts/import/check-imported-hospital-public-hold.mjs',
  'scripts/import/check-first-batch-real-fixture.mjs',
  'scripts/import/check-import-public-release-preflight-contract.mjs',
]) {
  if (!manifestCommands.has(command)) {
    throw new Error(`import readiness manifest must include ${command}`);
  }
}

for (const token of [
  'public sitemap entry is allowed only after import sitemap eligibility passes',
  'hospital detail route must not exist',
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

for (const token of [
  'type SupportedImportSitemapEntityType = "doctor" | "pharmacy" | "hospital"',
  'hospital: 500',
  '.eq("publish_status", "index_eligible")',
  '.eq("index_policy", "index")',
  '.eq("sitemap_policy", "included")',
]) {
  assertIncludes(importSitemap, token, 'import sitemap eligibility gate');
}

console.log('import public release preflight contract check passed.');
