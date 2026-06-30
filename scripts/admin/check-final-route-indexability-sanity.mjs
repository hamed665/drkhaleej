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

const requiredFiles = [
  'src/app/admin/draft-centers/page.tsx',
  'src/app/admin/draft-centers/[centerId]/page.tsx',
  'src/app/admin/active-centers/page.tsx',
  'src/app/admin/audit-log/page.tsx',
  'src/app/[locale]/[country]/center/[centerSlug]/page.tsx',
  'src/app/sitemap.ts',
  'scripts/seo/check-public-catalog-eligibility-routes.mjs',
  'scripts/import/check-import-sitemap-family-caps.mjs',
  'scripts/import/check-public-import-profile-smoke.mjs',
  'scripts/import/check-import-publish-readiness-audit.mjs',
];

for (const relativePath of requiredFiles) {
  readFile(relativePath);
}

const draftListPath = 'src/app/admin/draft-centers/page.tsx';
const draftList = readFile(draftListPath);
for (const token of [
  'listAdminDraftCenters',
  '/admin/draft-centers/new',
]) {
  mustHave(draftList, token, draftListPath);
}

const activeCentersPath = 'src/app/admin/active-centers/page.tsx';
const activeCenters = readFile(activeCentersPath);
for (const token of [
  'listAdminActiveCenters()',
  'READ_ONLY_ACTIVE_PROVIDER_VIEW',
  'English public profile',
  'Arabic public profile',
  'draft_center.public_profile_activated',
]) {
  mustHave(activeCenters, token, activeCentersPath);
}
for (const token of [
  'useActionState',
  'action={',
  'method="post"',
  'DraftCenterEditForm',
]) {
  mustNotHave(activeCenters, token, activeCentersPath);
}

const auditPath = 'src/app/admin/audit-log/page.tsx';
const audit = readFile(auditPath);
for (const token of [
  'listAdminAuditEvents',
  'Read-only server-side audit events for protected admin actions.',
  'Audit log could not be loaded.',
]) {
  mustHave(audit, token, auditPath);
}

const centerDetailPath = 'src/app/[locale]/[country]/center/[centerSlug]/page.tsx';
const centerDetail = readFile(centerDetailPath);
for (const token of [
  "import { getPublicCenterBySlug } from '@/lib/catalog/public-eligible-queries';",
  'const result = await getPublicCenterBySlug({ slug: centerSlug, country });',
  'if (!result.data) notFound();',
  'PublicCenterDetail locale={locale} center={result.data}',
]) {
  mustHave(centerDetail, token, centerDetailPath);
}
mustNotHave(centerDetail, '@/lib/catalog/public-queries', centerDetailPath);

const routeGuardPath = 'scripts/seo/check-public-catalog-eligibility-routes.mjs';
const routeGuard = readFile(routeGuardPath);
for (const token of [
  'src/app/[locale]/[country]/center/[centerSlug]/page.tsx',
  '@/lib/catalog/public-eligible-queries',
  '@/lib/catalog/public-queries',
  'verificationStatusFilterValues()',
]) {
  mustHave(routeGuard, token, routeGuardPath);
}

const packagePath = 'package.json';
const packageJson = readFile(packagePath);
for (const token of [
  '"admin:final-route-sanity:validate": "node scripts/admin/check-final-route-indexability-sanity.mjs"',
  'pnpm admin:final-route-sanity:validate',
  'pnpm seo:public-catalog-eligibility:validate',
  'pnpm seo:public-launch-safe-ui:validate',
  'pnpm import:sitemap-family-caps:validate',
  'pnpm import:profile-smoke:validate',
  'pnpm import:publish-readiness-audit:validate',
  'pnpm admin:final-launch-recap:validate',
]) {
  mustHave(packageJson, token, packagePath);
}

console.log('Final route indexability sanity checks passed.');
