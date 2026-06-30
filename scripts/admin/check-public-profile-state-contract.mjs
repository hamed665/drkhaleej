import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const docPath = 'docs/admin/public-profile-removal-contract.md';

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing file: ${relativePath}`);
  return fs.readFileSync(fullPath, 'utf8');
}

function mustHave(source, token) {
  if (!source.includes(token)) throw new Error(`${docPath} must include: ${token}`);
}

const doc = read(docPath);

for (const token of [
  'Public Profile Removal Contract',
  'documentation-only for this phase',
  'approved platform admin permission',
  'currently public-active',
  'without hard-deleting the provider record',
  'English public profile path',
  'Arabic public profile path',
  'sitemap output',
  'admin audit event',
  'old values',
  'new values',
  'public paths',
  'contact visibility',
  'billing',
  'commercial',
  'public listing eligibility becomes false',
  'profile no longer appears in sitemap',
  'server-side readiness helper',
  'server action or equivalent mutation boundary',
  'validator coverage added to the admin validation chain'
]) {
  mustHave(doc, token);
}

console.log('Public profile state contract checks passed.');
