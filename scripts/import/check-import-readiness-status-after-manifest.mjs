import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function mustContain(source, token, label) {
  if (!source.includes(token)) throw new Error(`${label} must include ${token}`);
}

const doc = await readText('docs/import/IMPORT_READINESS_STATUS_AFTER_MANIFEST.md');
const manifest = await readText('fixtures/import/import-readiness-runner.manifest.json');
const runner = await readText('scripts/import/run-import-readiness.mjs');
const workflow = await readText('.github/workflows/import-readiness-contract.yml');
const hospitalHold = await readText('docs/import/public-hospital-hold-contract.md');

for (const token of [
  '# Import Readiness Status After Manifest',
  '.github/workflows/import-readiness-contract.yml',
  'scripts/import/run-import-readiness.mjs',
  'fixtures/import/import-readiness-runner.manifest.json',
  'Imported hospitals remain blocked from public release.',
  'imported hospital detail page returning `200`',
  'imported hospital sitemap URLs',
  'family-specific parallel public catalog',
  'runner manifest guard',
  'workflow runner guard',
  'imported hospital public hold',
  'first-batch bridge runtime preflight',
  'ready_for_runtime_bridge_selection',
]) {
  mustContain(doc, token, 'import readiness status doc');
}

for (const token of [
  'runner manifest guard',
  'workflow runner guard',
  'hospital public hold',
  'first batch dry-run fixture',
  'generated first batch dry-run fixture',
  'first batch generator bridge alignment',
  'first batch bridge runtime preflight',
  'import public release preflight',
  'combined smoke',
]) {
  mustContain(manifest, token, 'import readiness runner manifest');
}

mustContain(runner, 'fixtures/import/import-readiness-runner.manifest.json', 'import readiness runner');
mustContain(workflow, 'node scripts/import/run-import-readiness.mjs', 'import readiness workflow');
mustContain(hospitalHold, 'Imported hospital records must remain private', 'hospital hold contract');

console.log('import readiness status after manifest check passed.');
