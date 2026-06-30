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

const checklistPath = 'docs/admin/soft-launch-operator-checklist.md';
const checklist = readFile(checklistPath);

for (const token of [
  'Soft Launch Operator Checklist',
  'does not approve bulk activation',
  'the provider is still in `pending_review`',
  'the provider is not active yet',
  'the provider is not claimable',
  'taxonomy review is approved',
  'quality blockers are zero',
  'readiness panel shows no blockers',
  'Do not activate a provider only because the UI button is enabled.',
  'verification status',
  'claim state',
  'billing state',
  'commercial add-ons',
  'Use only the final gated control in the publication readiness panel.',
  '/admin/draft-centers',
  '/admin/active-centers',
  '/admin/audit-log',
  'draft_center.public_profile_activated',
  'English public profile route',
  'Arabic public profile route',
  'public eligibility wrapper',
  'medical safety note is visible',
  'best or top provider',
  'rating or review score',
  'open-now availability',
  'booking availability',
  'insurance acceptance',
  'unsupported MOH approval',
  'guaranteed provider availability',
  'sponsored ranking',
  'Do not manually insert public sitemap entries during soft launch.',
  'separate deactivate or unpublish workflow',
  'final action succeeded without manual database edits',
]) {
  mustHave(checklist, token, checklistPath);
}

for (const relativePath of [
  'src/app/admin/draft-centers/page.tsx',
  'src/app/admin/draft-centers/[centerId]/page.tsx',
  'src/app/admin/active-centers/page.tsx',
  'src/app/admin/audit-log/page.tsx',
  'src/app/[locale]/[country]/center/[centerSlug]/page.tsx',
  'src/server/admin/draft-center-public-activation-actions.ts',
  'src/server/admin/draft-center-publication-readiness.ts',
  'scripts/admin/check-final-route-indexability-sanity.mjs',
  'scripts/admin/check-final-launch-chain-recap.mjs',
  'scripts/admin/check-active-centers-readonly-view.mjs',
  'scripts/admin/check-audit-log-readonly-route.mjs',
  'scripts/seo/check-public-launch-safe-ui.mjs',
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

const activeCentersPath = 'src/app/admin/active-centers/page.tsx';
const activeCenters = readFile(activeCentersPath);
for (const token of [
  'READ_ONLY_ACTIVE_PROVIDER_VIEW',
  'English public profile',
  'Arabic public profile',
  'draft_center.public_profile_activated',
]) {
  mustHave(activeCenters, token, activeCentersPath);
}

const packagePath = 'package.json';
const packageJson = readFile(packagePath);
for (const token of [
  '"admin:soft-launch-checklist:validate": "node scripts/admin/check-soft-launch-operator-checklist.mjs"',
  'pnpm admin:soft-launch-checklist:validate',
  'pnpm admin:final-route-sanity:validate',
  'pnpm admin:final-launch-recap:validate',
  'pnpm admin:active-centers-readonly:validate',
  'pnpm admin:audit-log-readonly:validate',
  'pnpm seo:public-launch-safe-ui:validate',
  'pnpm import:sitemap-family-caps:validate',
]) {
  mustHave(packageJson, token, packagePath);
}

console.log('Soft launch operator checklist checks passed.');
