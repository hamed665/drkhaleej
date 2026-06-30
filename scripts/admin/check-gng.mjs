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

const docPath = 'docs/admin/go-no-go-decision-record.md';
const doc = readFile(docPath);

for (const token of [
  'Go / No-Go Decision Record',
  'final manual decision checkpoint',
  'Center id:',
  'Slug:',
  'Decision owner:',
  'Candidate selection worksheet: pass / fail',
  'First provider rehearsal: pass / fail',
  'Soft launch operator checklist: pass / fail',
  'Readiness bundle reviewed: yes / no',
  'First observation report prepared for later use: yes / no',
  'Workflow status is `pending_review`: yes / no',
  '`is_active` is false: yes / no',
  '`is_claimable` is false: yes / no',
  'Quality blocker count is zero: yes / no',
  'Public copy is launch-safe: yes / no',
  'If any risk is material, the decision must be no-go.',
  'Activation is not a rollback workflow: yes / no',
  'Deactivation or unpublish must be separate: yes / no',
  'No manual database rollback is approved here: yes / no',
  'Choose exactly one:',
  '- Go',
  '- No-Go',
  'complete the first observation report immediately after activation',
  'This record does not approve bulk rollout.',
]) {
  mustHave(doc, token, docPath);
}

for (const file of [
  'docs/admin/candidate-selection-worksheet.md',
  'docs/admin/first-provider-rehearsal.md',
  'docs/admin/soft-launch-operator-checklist.md',
  'docs/admin/readiness-bundle.md',
  'docs/admin/first-observation-report.md',
  'src/server/admin/draft-center-public-activation-actions.ts',
]) {
  readFile(file);
}

const pkg = readFile('package.json');
for (const token of [
  '"admin:gng:validate": "node scripts/admin/check-gng.mjs"',
  'pnpm admin:gng:validate',
  'pnpm admin:cw:validate',
  'pnpm admin:r1:validate',
  'pnpm admin:fo:validate',
]) {
  mustHave(pkg, token, 'package.json');
}

console.log('Go/no-go decision record checks passed.');
