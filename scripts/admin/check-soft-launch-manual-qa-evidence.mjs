import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const docPath = 'docs/admin/soft-launch-manual-qa-evidence.md';

function readFile(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }
  return fs.readFileSync(absolutePath, 'utf8');
}

function mustHave(content, token, label) {
  if (!content.includes(token)) throw new Error(`${label} missing token: ${token}`);
}

const doc = readFile(docPath);

for (const token of [
  'Soft launch manual QA evidence',
  'before any sitemap or index expansion',
  'Required admin checks',
  '/admin/draft-centers',
  '/admin/draft-centers/[centerId]',
  '/admin/active-centers',
  '/admin/audit-log',
  'draft_center.public_profile_activated',
  'active centers view remains read-only',
  'Required public profile checks',
  '1 English doctor profile',
  '1 Arabic doctor profile',
  '1 English center profile',
  '1 Arabic center profile',
  'invalid fallback remains `noindex,follow` or notFound',
  'approved contact actions only',
  'license copy appears only with `licenseInfo`',
  'relation previews are capped',
  'medical safety note is visible',
  'Required import profile checks',
  '1 imported doctor profile',
  '1 imported pharmacy profile',
  '1 imported hospital profile',
  'name-only imported profile remains noindex',
  'Required sitemap checks',
  '/sitemap.xml',
  'no query URLs',
  'no filter URLs',
  'no preview URLs',
  'no native doctor or center bulk expansion',
  'Required security check',
  'Supabase Security Advisor Errors are 0',
  'Warnings may remain only if tracked in the warning backlog contract.',
  'Do not start native sitemap or index expansion from a partial QA record.',
]) {
  mustHave(doc, token, docPath);
}

console.log('Soft launch manual QA evidence check passed.');
