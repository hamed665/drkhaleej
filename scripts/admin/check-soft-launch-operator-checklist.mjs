import './check-soft-launch-manual-qa-evidence.mjs';
import '../db/check-security-warning-backlog.mjs';
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
  if (content.includes(token)) throw new Error(`${label} contains forbidden token: ${token}`);
}

function mustHaveAll(content, tokens, label) {
  for (const token of tokens) mustHave(content, token, label);
}

const checklistPath = 'docs/admin/soft-launch-operator-checklist.md';
const checklist = readFile(checklistPath);

mustHaveAll(checklist, [
  'Soft Launch Operator Checklist',
  'does not approve bulk activation',
  'native doctor/center sitemap expansion',
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
  'generated public profile summaries outside the summary contract',
  'profile completeness score visibility',
  'native profile sitemap expansion',
  'Use only the final gated control in the publication readiness panel.',
  '/admin/draft-centers',
  '/admin/draft-centers/[centerId]',
  '/admin/active-centers',
  '/admin/audit-log',
  'draft_center.public_profile_activated',
  'English public profile route',
  'Arabic public profile route',
  'public eligibility wrapper',
  'generated fact-based profile summary is visible in the About section',
  'provider description or biography does not replace the generated summary baseline',
  'metadata description remains profile-specific through the profile summary contract',
  'medical safety note is visible',
  'generated profile summary',
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
  'generated fact-based profile summary is visible',
], checklistPath);

mustHaveAll(checklist, [
  'profile index eligibility passes',
  'profile completeness `missing[]` is empty or accepted by the soft-launch rule',
  'metadata gate returns indexable only if eligible',
  'center and doctor fallback metadata remains `noindex,follow`',
  'provider copy is approved or not public',
  'license copy appears only with `licenseInfo`',
  'contact actions are approved public values',
  'relation previews are capped',
], checklistPath);

mustHaveAll(checklist, [
  'Import profile checks',
  'imported doctor must be reviewed',
  'imported pharmacy must be reviewed',
  'imported hospital must be reviewed',
  'language present',
  'source present',
  'taxonomy signal present',
  'location present',
  'contact/map signal present',
  'name-only imported profile remains noindex',
  'imported profile metadata stays `noindex,follow` when import profile eligibility fails',
  'reviewed imported profile uses the public import summary helper',
  'Arabic output is checked where applicable',
], checklistPath);

mustHaveAll(checklist, [
  'Manual QA list',
  '1 English doctor profile',
  '1 Arabic doctor profile',
  '1 English center profile',
  '1 Arabic center profile',
  '1 missing/invalid center fallback',
  '1 missing/invalid doctor fallback',
  '1 imported doctor',
  '1 imported pharmacy',
  '1 imported hospital',
  '`/sitemap.xml`',
  'Security Advisor errors = 0',
], checklistPath);

mustHaveAll(checklist, [
  'best doctors',
  'top-rated',
  'rating schema',
  'review schema',
  'AggregateRating',
  'ratingValue',
  'reviewCount',
  'Book now',
  'booking guarantee',
  'Open now',
  'available now',
  'insurance accepted',
  'MOH approved',
  'verified by MOH',
  'guaranteed treatment',
  'emergency availability',
], checklistPath);

mustHaveAll(checklist, [
  'no native doctor/center profile sitemap expansion yet',
  'no query/filter URLs',
  'no preview URLs',
  'import sitemap remains reviewed/index_eligible/included only',
  'Security launch blocker',
  'Supabase Security Advisor Errors must be 0 before soft launch.',
  'Warnings may remain only if tracked in the security warning backlog.',
], checklistPath);

for (const relativePath of [
  'src/app/admin/draft-centers/page.tsx',
  'src/app/admin/draft-centers/[centerId]/page.tsx',
  'src/app/admin/active-centers/page.tsx',
  'src/app/admin/audit-log/page.tsx',
  'src/app/[locale]/[country]/center/[centerSlug]/page.tsx',
  'src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx',
  'src/app/[locale]/[country]/pharmacies/[pharmacySlug]/page.tsx',
  'src/pages/[locale]/[country]/hospitals/[hospitalSlug].tsx',
  'src/server/admin/draft-center-public-activation-actions.ts',
  'src/server/admin/draft-center-publication-readiness.ts',
  'src/lib/catalog/public-profile-summary.ts',
  'src/lib/catalog/public-profile-summary.test.ts',
  'src/lib/catalog/public-profile-index-eligibility.ts',
  'src/lib/catalog/public-profile-completeness.ts',
  'src/lib/catalog/provider-description-review.ts',
  'src/lib/catalog/public-import-profile-index-eligibility.ts',
  'src/lib/catalog/public-profile-relation-limits.ts',
  'src/lib/seo/profile-metadata-index-gate.ts',
  'docs/seo/public-profile-summary-contract.md',
  'docs/seo/public-profile-index-eligibility.md',
  'docs/seo/public-profile-completeness-signals.md',
  'docs/seo/public-profile-evidence-copy-guard.md',
  'docs/seo/provider-description-review-contract.md',
  'docs/seo/public-import-profile-index-eligibility.md',
  'docs/seo/profile-relation-limit-guard.md',
  'docs/seo/soft-launch-profile-seo-gate.md',
  'scripts/admin/check-final-route-indexability-sanity.mjs',
  'scripts/admin/check-final-launch-chain-recap.mjs',
  'scripts/admin/check-active-centers-readonly-view.mjs',
  'scripts/admin/check-audit-log-readonly-route.mjs',
  'scripts/seo/check-public-launch-safe-ui.mjs',
  'scripts/seo/check-public-profile-summary-contract.mjs',
  'scripts/seo/check-public-profile-index-eligibility-contract.mjs',
  'scripts/seo/check-soft-launch-profile-seo-gate.mjs',
  'scripts/seo/check-profile-relation-limit-guard.mjs',
  'scripts/import/check-import-profile-index-eligibility.mjs',
  'scripts/import/check-public-import-profile-smoke.mjs',
  'docs/security/supabase-warning-hardening-backlog.md',
  'scripts/db/check-security-warning-backlog.mjs',
]) {
  readFile(relativePath);
}

const actionPath = 'src/server/admin/draft-center-public-activation-actions.ts';
const action = readFile(actionPath);
mustHaveAll(action, [
  'getDraftCenterPublicationReadiness(centerId)',
  'if (!readiness.canPublish)',
  'draft_center.public_profile_activated',
  'public_paths: [enPath, arPath]',
  'sitemap_revalidated: true',
], actionPath);

const activeCentersPath = 'src/app/admin/active-centers/page.tsx';
const activeCenters = readFile(activeCentersPath);
mustHaveAll(activeCenters, [
  'ACTIVE_PROVIDER_OPERATIONS_VIEW',
  'English public profile',
  'Arabic public profile',
  'View public action gates',
  'Edit public contact info',
  'draft_center.public_profile_activated',
], activeCentersPath);

const summaryContractPath = 'docs/seo/public-profile-summary-contract.md';
const summaryContract = readFile(summaryContractPath);
mustHaveAll(summaryContract, [
  'Every indexable public doctor or center profile must use the shared summary helpers',
  'buildPublicCenterProfileSummary',
  'buildPublicDoctorProfileSummary',
  'buildPublicProfileMetaDescription',
], summaryContractPath);

const softLaunchGatePath = 'docs/seo/soft-launch-profile-seo-gate.md';
const softLaunchGate = readFile(softLaunchGatePath);
mustHaveAll(softLaunchGate, [
  'Soft launch profile SEO gate',
  'Summary readiness',
  'Native profile index eligibility',
  'Metadata noindex gate',
  'Sitemap boundary',
  'Import profile boundary',
  'Profile graph and relation limits',
  'Forbidden SEO claims',
  'The soft launch profile SEO gate does not enable native profile sitemap expansion.',
], softLaunchGatePath);

const profileEligibilityGuardPath = 'scripts/seo/check-public-profile-index-eligibility-contract.mjs';
const profileEligibilityGuard = readFile(profileEligibilityGuardPath);
mustHave(profileEligibilityGuard, "import './check-soft-launch-profile-seo-gate.mjs';", profileEligibilityGuardPath);

const sitemapPath = 'src/app/sitemap.ts';
const sitemap = readFile(sitemapPath);
for (const forbiddenToken of [
  'getPublicDoctorBySlug',
  'getPublicCenterBySlug',
  'listPublicDoctors',
  'listPublicCenters',
  'isPublicProfileIndexEligible',
  'generateStaticParams',
  'searchParams',
  '?q=',
]) {
  mustNotHave(sitemap, forbiddenToken, sitemapPath);
}

const relationLimitPath = 'src/lib/catalog/public-profile-relation-limits.ts';
const relationLimit = readFile(relationLimitPath);
mustHaveAll(relationLimit, [
  'PUBLIC_CENTER_PROFILE_LOCATION_LIMIT = 6',
  'PUBLIC_CENTER_PROFILE_SERVICE_LIMIT = 12',
  'PUBLIC_CENTER_PROFILE_DOCTOR_LIMIT = 12',
  'PUBLIC_DOCTOR_PROFILE_SERVICE_LIMIT = 12',
], relationLimitPath);

const packagePath = 'package.json';
const packageJson = readFile(packagePath);
for (const token of [
  '"admin:soft-launch-checklist:validate": "node scripts/admin/check-soft-launch-operator-checklist.mjs"',
  'pnpm admin:soft-launch-checklist:validate',
]) {
  mustHave(packageJson, token, packagePath);
}

console.log('Soft launch operator checklist checks passed.');
