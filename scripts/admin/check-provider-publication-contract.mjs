import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const contractPath = 'docs/admin/provider-publication-contract.md';

function readFile(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }

  return fs.readFileSync(absolutePath, 'utf8');
}

function assertIncludes(content, token, label) {
  if (!content.includes(token)) {
    throw new Error(`${label} is missing required token: ${token}`);
  }
}

const contractContent = readFile(contractPath);

for (const token of [
  'Provider Publication Contract',
  'Provider publication is the first workflow that may make a reviewed provider publicly active.',
  'Everything before this workflow remains admin readiness only.',
  'the center exists and is not deleted',
  'the center is still in a reviewed pre-public workflow state',
  'verification has been reviewed and is not rejected or suspended',
  'at least one internally active location exists',
  'taxonomy assignment passes the approved taxonomy requirements',
  'quality blockers equal zero',
  'Contact visibility is optional for publication.',
  'set center status to active',
  'revalidate the approved public center detail route',
  'revalidate sitemap only after the publication gate passes',
  'must not change contact visibility review flags, verification status, claim status, billing, sponsorship',
  'Every successful publication action must write an admin audit event.',
  'Rollback, unpublish, and deactivate must be separate workflows.',
  'read-only publication readiness checker',
  'It must not mutate database state and must not revalidate public routes or sitemap.',
]) {
  assertIncludes(contractContent, token, contractPath);
}

const packagePath = 'package.json';
const packageContent = readFile(packagePath);
for (const token of [
  '"admin:provider-publication-contract:validate": "node scripts/admin/check-provider-publication-contract.mjs"',
  'pnpm admin:provider-publication-contract:validate',
]) {
  assertIncludes(packageContent, token, packagePath);
}

console.log('Provider publication contract checks passed.');
