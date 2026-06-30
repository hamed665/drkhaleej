import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();

function readFile(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) throw new Error(`Missing required file: ${file}`);
  return fs.readFileSync(full, 'utf8');
}

function mustHave(text, token, label) {
  if (!text.includes(token)) throw new Error(`${label} missing token: ${token}`);
}

const docPath = 'docs/admin/first-packet-index.md';
const doc = readFile(docPath);

const docs = [
  'docs/admin/readiness-bundle.md',
  'docs/admin/candidate-selection-worksheet.md',
  'docs/admin/first-provider-rehearsal.md',
  'docs/admin/soft-launch-operator-checklist.md',
  'docs/admin/go-no-go-decision-record.md',
  'docs/admin/first-observation-report.md',
];

for (const token of [
  'First Packet Index',
  'required order',
  'Complete these records in this exact order:',
  '1. `docs/admin/readiness-bundle.md`',
  '2. `docs/admin/candidate-selection-worksheet.md`',
  '3. `docs/admin/first-provider-rehearsal.md`',
  '4. `docs/admin/soft-launch-operator-checklist.md`',
  '5. `docs/admin/go-no-go-decision-record.md`',
  '6. `docs/admin/first-observation-report.md`',
  'The go / no-go decision record must be Go before using the final gated admin control.',
  'No-Go decision',
  'Do not continue by manually editing database rows, sitemap entries, or public route output.',
  'all six source documents exist',
  'the final gated admin control was the only activation path used',
  'no manual database or sitemap edit was performed',
  'This index does not approve:',
  'bulk rollout',
  'manual rollback',
]) {
  mustHave(doc, token, docPath);
}

for (const file of docs) {
  readFile(file);
  mustHave(doc, file, docPath);
}

const pkg = readFile('package.json');
for (const token of [
  '"admin:fpi:validate": "node scripts/admin/check-fpi.mjs"',
  'pnpm admin:fpi:validate',
  'pnpm admin:gng:validate',
  'pnpm admin:fo:validate',
  'pnpm admin:cw:validate',
]) {
  mustHave(pkg, token, 'package.json');
}

console.log('First packet index checks passed.');
