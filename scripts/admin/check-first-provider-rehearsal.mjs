import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();

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

function mustNotHave(content, token, label) {
  if (content.includes(token)) throw new Error(`${label} has forbidden token: ${token}`);
}

const docPath = 'docs/admin/first-provider-rehearsal.md';
const doc = readFile(docPath);

for (const token of [
  'First Provider Rehearsal',
  'dry run',
  'not an activation instruction',
  'must not trigger database updates, route revalidation, sitemap changes, or public visibility changes',
  'Choose one candidate only.',
  'status `pending_review`',
  '`is_active` false',
  '`is_claimable` false',
  'at least one active location',
  'approved primary taxonomy',
  'zero quality blockers',
  'contact values reviewed before visibility is enabled',
  'draft center id',
  'readiness blocker list',
  'readiness warning list',
  'The operator must be able to explain why readiness should pass.',
  'English public center route should not show the provider',
  'Arabic public center route should not show the provider',
  'English public center route may load through the eligibility wrapper',
  'Arabic public center route may load through the eligibility wrapper',
  'provider no longer appears in `/admin/draft-centers`',
  'provider appears in `/admin/active-centers`',
  'draft_center.public_profile_activated',
  'best or top provider',
  'rating or review score',
  'open-now availability',
  'booking availability',
  'insurance acceptance',
  'unsupported MOH approval',
  'guaranteed provider availability',
  'sponsored ranking',
  'Do not compensate for a failed rehearsal with manual database edits.',
  'Passing this rehearsal does not activate the provider.',
]) {
  mustHave(doc, token, docPath);
}

for (const token of [
  'Click the activation button now',
  'manually update centers',
  'manually insert sitemap',
  'set is_active true manually',
]) {
  mustNotHave(doc, token, docPath);
}

for (const relativePath of [
  'src/server/admin/draft-center-publication-readiness.ts',
  'src/server/admin/draft-center-public-activation-actions.ts',
  'src/app/admin/draft-centers/[centerId]/page.tsx',
  'src/app/admin/active-centers/page.tsx',
  'src/app/admin/audit-log/page.tsx',
  'src/app/[locale]/[country]/center/[centerSlug]/page.tsx',
  'scripts/admin/check-soft-launch-operator-checklist.mjs',
  'scripts/admin/check-final-route-indexability-sanity.mjs',
  'scripts/admin/check-final-launch-chain-recap.mjs',
]) {
  readFile(relativePath);
}

const actionPath = 'src/server/admin/draft-center-public-activation-actions.ts';
const action = readFile(actionPath);
for (const token of [
  'getDraftCenterPublicationReadiness(centerId)',
  'if (!readiness.canPublish)',
  'draft_center.public_profile_activated',
  'public_paths: [enPath, arPath]',
  'sitemap_revalidated: true',
]) {
  mustHave(action, token, actionPath);
}

const publicRoutePath = 'src/app/[locale]/[country]/center/[centerSlug]/page.tsx';
const publicRoute = readFile(publicRoutePath);
for (const token of [
  '@/lib/catalog/public-eligible-queries',
  'getPublicCenterBySlug({ slug: centerSlug, country })',
]) {
  mustHave(publicRoute, token, publicRoutePath);
}

const packagePath = 'package.json';
const packageJson = readFile(packagePath);
for (const token of [
  '"admin:first-run-check:validate": "node scripts/admin/check-first-provider-rehearsal.mjs"',
  'pnpm admin:first-run-check:validate',
  'pnpm admin:soft-launch-checklist:validate',
  'pnpm admin:final-route-sanity:validate',
  'pnpm admin:final-launch-recap:validate',
]) {
  mustHave(packageJson, token, packagePath);
}

console.log('First provider rehearsal checks passed.');
