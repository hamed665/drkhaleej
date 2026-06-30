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

const docPath = 'docs/admin/next-wave-boundary.md';
const doc = readFile(docPath);

for (const token of [
  'Next Wave Boundary',
  'one provider at a time',
  'Each provider must have its own complete packet:',
  'No provider may reuse another provider packet or decision.',
]) {
  mustHave(doc, token, docPath);
}

for (const file of [
  'docs/admin/first-packet-index.md',
  'docs/admin/go-no-go-decision-record.md',
  'docs/admin/first-observation-report.md',
]) {
  readFile(file);
}

const pkg = readFile('package.json');
for (const token of [
  '"admin:w:validate": "node scripts/admin/check-wave.mjs"',
  'pnpm admin:w:validate',
]) {
  mustHave(pkg, token, 'package.json');
}

console.log('Wave checks passed.');
