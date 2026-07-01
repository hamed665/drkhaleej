import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const docPath = 'docs/admin/soft-launch-decision-gate.md';
const absolutePath = path.join(repoRoot, docPath);

if (!fs.existsSync(absolutePath)) {
  throw new Error(`Missing required file: ${docPath}`);
}

const doc = fs.readFileSync(absolutePath, 'utf8');

for (const token of [
  'Soft launch decision gate',
  'Default state is no-go.',
  'Required pass evidence',
  'Blockers',
  'Allowed after go',
  'Not allowed by this gate',
  'Operator note',
]) {
  if (!doc.includes(token)) {
    throw new Error(`${docPath} missing token: ${token}`);
  }
}

console.log('Release decision doc check passed.');
