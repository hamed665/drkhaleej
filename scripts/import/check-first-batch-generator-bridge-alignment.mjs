import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function mustContain(source, token, label) {
  if (!source.includes(token)) throw new Error(`${label} must include ${token}`);
}

const generator = await readText('scripts/import/generate-first-batch-dry-run-fixture.mjs');
const bridge = await readText('src/server/admin/import-first-batch-dry-run-bridge.ts');
const selection = await readText('src/server/admin/import-first-batch-selection.ts');
const report = await readText('src/server/admin/import-batch-dry-run-report.ts');
const manifest = await readText('fixtures/import/import-readiness-runner.manifest.json');

for (const token of [
  'bridgeContract',
  'buildFirstBatchDryRunReport',
  'ImportFirstBatchSelection',
  'ImportBatchDryRunReport',
  'importBatchDryRunRequiredChecks',
  'firstBatchFamilies',
  '--bridge-contract',
]) {
  mustContain(generator, token, 'first batch fixture generator');
}

for (const token of [
  'buildFirstBatchDryRunReport',
  'BuildFirstBatchDryRunReportInput',
  'buildImportBatchDryRunReport',
  'buildFamilySummary',
  'defaultSitemapSummary',
  'hospitalRelations',
  'localSuggestions',
]) {
  mustContain(bridge, token, 'first batch dry-run bridge');
}

for (const token of [
  'ImportFirstBatchSelection',
  'firstBatchFamilies',
  'validateFirstBatchSelection',
]) {
  mustContain(selection, token, 'first batch selection contract');
}

for (const token of [
  'ImportBatchDryRunReport',
  'importBatchDryRunRequiredChecks',
  'buildImportBatchDryRunReport',
]) {
  mustContain(report, token, 'dry-run report contract');
}

for (const token of [
  'generated first batch dry-run fixture',
  'scripts/import/generate-first-batch-dry-run-fixture.mjs',
  '--check',
]) {
  mustContain(manifest, token, 'import readiness runner manifest');
}

console.log('first batch generator bridge alignment check passed.');
