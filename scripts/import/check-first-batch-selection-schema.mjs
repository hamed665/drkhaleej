import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function mustContain(source, token, label) {
  if (!source.includes(token)) throw new Error(`${label} must include ${token}`);
}

const selectionSource = await readText('src/server/admin/import-first-batch-selection.ts');
const manifestSource = await readText('docs/import/DRKHALEEJ_FIRST_BATCH_MANIFEST_V1.md');
const packageSource = await readText('package.json');

for (const token of [
  'ImportFirstBatchFamily = "doctor" | "pharmacy" | "hospital"',
  'ImportFirstBatchLocale = "en" | "ar"',
  'ImportFirstBatchStatus = "selected" | "held" | "removed"',
  'drkhaleej.import.firstBatchSelection.v1',
  'ImportFirstBatchRow',
  'ImportFirstBatchSelection',
  'firstBatchCaps',
  'doctor: 50,',
  'pharmacy: 25,',
  'hospital: 10,',
  'emptyFirstBatchCounts',
  'countSelectedFirstBatchRows',
  'isFirstBatchWithinCaps',
]) {
  mustContain(selectionSource, token, 'first batch selection schema');
}

for (const token of [
  '# DrKhaleej First Batch Manifest V1',
  '| doctor | 50 |',
  '| pharmacy | 25 |',
  '| hospital | 10 |',
  '`qa_status`',
  '`selected`, `blocked`, or `removed`',
]) {
  mustContain(manifestSource, token, 'first batch manifest');
}

for (const token of [
  'import:first-batch-selection:validate',
  'scripts/import/check-first-batch-selection-schema.mjs',
  'pnpm import:first-batch-selection:validate',
]) {
  mustContain(packageSource, token, 'package.json');
}

console.log('first batch selection schema check passed.');
