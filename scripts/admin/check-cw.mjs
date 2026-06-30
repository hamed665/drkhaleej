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

const docPath = 'docs/admin/candidate-selection-worksheet.md';
const doc = readFile(docPath);

for (const token of [
  'Candidate Selection Worksheet',
  'manual evidence record',
  'Center id:',
  'Slug:',
  'Current workflow status:',
  'Current `is_active` value:',
  'Current `is_claimable` value:',
  'Active location count:',
  'Taxonomy review status:',
  'Quality blocker count:',
  'Contact review status:',
  'English public route expected path:',
  'Arabic public route expected path:',
  'Expected audit action: `draft_center.public_profile_activated`',
  'Ready for rehearsal: yes / no',
]) {
  mustHave(doc, token, docPath);
}

for (const file of [
  'docs/admin/first-provider-rehearsal.md',
  'docs/admin/soft-launch-operator-checklist.md',
  'docs/admin/readiness-bundle.md',
  'src/app/admin/active-centers/page.tsx',
  'src/app/[locale]/[country]/center/[centerSlug]/page.tsx',
]) {
  readFile(file);
}

const pkg = readFile('package.json');
for (const token of [
  '"admin:cw:validate": "node scripts/admin/check-cw.mjs"',
  'pnpm admin:cw:validate',
  'pnpm admin:r1:validate',
  'pnpm admin:soft-launch-checklist:validate',
  'pnpm admin:readiness-bundle:validate',
]) {
  mustHave(pkg, token, 'package.json');
}

console.log('Worksheet checks passed.');
