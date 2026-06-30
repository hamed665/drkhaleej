import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();

function readFile(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) throw new Error(`Missing required file: ${file}`);
  return fs.readFileSync(full, 'utf8');
}

function has(text, token, label) {
  if (!text.includes(token)) throw new Error(`${label} missing token: ${token}`);
}

const doc = readFile('docs/admin/first-provider-rehearsal.md');
for (const token of [
  'First Provider Rehearsal',
  'dry run',
  'Choose one candidate only.',
  'status `pending_review`',
  '`is_active` false',
  '`is_claimable` false',
  'approved primary taxonomy',
  'zero quality blockers',
  'readiness blocker list',
  'English public center route may load through the eligibility wrapper',
  'provider appears in `/admin/active-centers`',
  'draft_center.public_profile_activated',
  'Passing this rehearsal does not activate the provider.',
]) {
  has(doc, token, 'docs/admin/first-provider-rehearsal.md');
}

for (const file of [
  'src/app/admin/draft-centers/[centerId]/page.tsx',
  'src/app/admin/active-centers/page.tsx',
  'src/app/admin/audit-log/page.tsx',
  'src/app/[locale]/[country]/center/[centerSlug]/page.tsx',
  'src/server/admin/draft-center-publication-readiness.ts',
  'src/server/admin/draft-center-public-activation-actions.ts',
]) {
  readFile(file);
}

const pkg = readFile('package.json');
for (const token of [
  '"admin:r1:validate": "node scripts/admin/check-r1.mjs"',
  'pnpm admin:r1:validate',
  'pnpm admin:soft-launch-checklist:validate',
]) {
  has(pkg, token, 'package.json');
}

console.log('R1 checklist checks passed.');
