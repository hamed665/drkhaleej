import fs from 'node:fs';

const docPath = 'docs/admin/launch-readiness-checkpoint.md';
const doc = fs.readFileSync(docPath, 'utf8');

if (!doc.includes('Launch readiness checkpoint')) {
  throw new Error(`${docPath} missing title`);
}

console.log('Launch checkpoint check passed.');
