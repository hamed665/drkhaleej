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

const docPath = 'docs/admin/first-observation-report.md';
const doc = readFile(docPath);

for (const token of [
  'First Observation Report',
  'manual evidence record',
  'Center id:',
  'Slug:',
  'Final gated control used: yes / no',
  'Provider absent from `/admin/draft-centers`: yes / no',
  'Provider present in `/admin/active-centers`: yes / no',
  'Active centers view remains read-only: yes / no',
  'Expected action: `draft_center.public_profile_activated`',
  'Audit public English path:',
  'Audit public Arabic path:',
  'English public route:',
  'Arabic public route:',
  'Medical safety note visible: yes / no',
  'Public route loading must still depend on the public eligibility wrapper.',
  'best or top provider',
  'rating or review score',
  'open-now availability',
  'booking availability',
  'insurance acceptance',
  'unsupported MOH approval',
  'Manual sitemap edit performed: must be no',
  'Public detail route still eligibility-gated: yes / no',
  'Observation passed: yes / no',
  'Passing this observation report does not approve bulk rollout.',
]) {
  mustHave(doc, token, docPath);
}

for (const file of [
  'docs/admin/candidate-selection-worksheet.md',
  'docs/admin/first-provider-rehearsal.md',
  'docs/admin/soft-launch-operator-checklist.md',
  'src/app/admin/active-centers/page.tsx',
  'src/app/admin/audit-log/page.tsx',
  'src/app/[locale]/[country]/center/[centerSlug]/page.tsx',
]) {
  readFile(file);
}

const pkg = readFile('package.json');
for (const token of [
  '"admin:fo:validate": "node scripts/admin/check-fo.mjs"',
  'pnpm admin:fo:validate',
  'pnpm admin:cw:validate',
  'pnpm admin:r1:validate',
]) {
  mustHave(pkg, token, 'package.json');
}

console.log('First observation report checks passed.');
