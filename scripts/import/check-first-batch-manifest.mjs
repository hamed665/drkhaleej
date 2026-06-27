import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const manifestPath = 'docs/import/DRKHALEEJ_FIRST_BATCH_MANIFEST_V1.md';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function mustContain(source, token, label) {
  if (!source.includes(token)) throw new Error(`${label} must include ${token}`);
}

const manifest = await readText(manifestPath);
const packageJson = await readText('package.json');
const dryRunContract = await readText('src/server/admin/import-batch-dry-run-report.ts');
const rehearsal = await readText('docs/import/DRKHALEEJ_IMPORT_BATCH_REHEARSAL_V1.md');

for (const token of [
  '# DrKhaleej First Batch Manifest V1',
  '## Batch caps',
  '| doctor | 50 |',
  '| pharmacy | 25 |',
  '| hospital | 10 |',
  '## Required family scope',
  '## Required manifest columns',
  '## Canonical path rules',
  '## Selection rules',
  '## QA sampling rule',
  '## Stop rules',
  '## Decision',
]) {
  mustContain(manifest, token, manifestPath);
}

for (const token of [
  '`family`',
  '`queue_id`',
  '`candidate_id`',
  '`canonical_path`',
  '`locale`',
  '`slug`',
  '`display_name`',
  '`area`',
  '`governorate`',
  '`source_name`',
  '`last_checked_at`',
  '`contact_or_map_signal`',
  '`qa_owner`',
  '`qa_status`',
]) {
  mustContain(manifest, token, manifestPath);
}

for (const token of [
  '/en/om/doctor/{slug}',
  '/ar/om/doctor/{slug}',
  '/en/om/pharmacies/{slug}',
  '/ar/om/pharmacies/{slug}',
  '/en/om/hospitals/{slug}',
  '/ar/om/hospitals/{slug}',
]) {
  mustContain(manifest, token, manifestPath);
}

for (const token of [
  'firstImportBatchDryRunCaps',
  'doctor: 50,',
  'pharmacy: 25,',
  'hospital: 10,',
  'buildImportBatchDryRunReport',
]) {
  mustContain(dryRunContract, token, 'dry-run report contract');
}

for (const token of [
  'Maximum: 50 doctors, 25 pharmacies, 10 hospitals.',
  'The audit must show zero blockers for the selected rows.',
  'Representative page smoke checks pass.',
]) {
  mustContain(rehearsal, token, 'import batch rehearsal');
}

for (const token of [
  'import:first-batch-manifest:validate',
  'scripts/import/check-first-batch-manifest.mjs',
  'pnpm import:first-batch-manifest:validate',
]) {
  mustContain(packageJson, token, 'package.json');
}

console.log('first batch manifest check passed.');
