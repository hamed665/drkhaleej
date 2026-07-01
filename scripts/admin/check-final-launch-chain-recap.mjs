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

const docPath = 'docs/admin/final-launch-chain-recap.md';
const doc = readFile(docPath);

mustHaveAll(doc, [
  'Final Launch Chain Recap',
  'draft center workflow panel',
  'draft center taxonomy panel',
  'draft center location panel',
  'draft center contact review panel',
  'draft center quality panel',
  'publication readiness panel',
  '`draft`',
  '`pending_review`',
  'The readiness helper and panel must keep activation blocked until required evidence is present.',
  'The final server action must:',
  'require `draft_centers.update`',
  'set `status` to `active`',
  'set `is_active` to true',
  'keep `is_claimable` false',
  'write `draft_center.public_profile_activated`',
  'Public center routes must continue using the explicit public eligibility wrapper.',
  '`is_active` equals true',
  '`status` equals `active`',
  'Relation failures must fail closed.',
  'Public UI must remain launch-safe:',
  'active centers read-only view',
  'audit log read-only route',
  'The audit route must remain read-only and gated by `admin.audit.read`.',
  'bulk activation',
  'live provider editing',
  'claim workflow changes',
], docPath);

mustHaveAll(doc, [
  'profile index eligibility is understood before indexable metadata is allowed',
  'profile completeness is internal-only and not exposed as a public score',
  'provider copy is approved or not public',
  'relation previews remain capped',
  'Native doctor/center profile indexability uses profile index eligibility.',
  'isPublicProfileIndexEligible',
  'applyProfileMetadataIndexGate',
  'buildProfileNoindexMetadata',
  'robots: { index: false, follow: true }',
  'fromPublicEligibleQuery: true',
  'Profile metadata index gate is launch-critical.',
  'Fallback profile metadata must fail closed as `noindex,follow` or notFound.',
  'Relation limit guard is launch-critical.',
], docPath);

mustHaveAll(doc, [
  'Import profile boundary',
  'Import profile eligibility remains separate from native profile eligibility.',
  'Imported doctor, pharmacy, and hospital profile indexability must continue using the import profile eligibility gate and reviewed import evidence.',
  'Imported name-only profiles remain `noindex,follow`.',
  'Imported profile indexability requires source, location, language, taxonomy signal, and contact-or-map signal.',
], docPath);

mustHaveAll(doc, [
  'Sitemap boundary',
  'Profile sitemap expansion remains off unless a promotion gate exists.',
  'Native doctor/center profile sitemap expansion remains blocked during soft launch.',
  'The sitemap must stay limited to static SEO pages plus reviewed import sitemap entries.',
  'Import sitemap entries must remain reviewed, `index_eligible`, `index`, and `included`.',
  'No query URLs, filter URLs, preview URLs, admin URLs, provider-dashboard URLs, booking URLs, insurance URLs, rating schema, review schema, or native profile bulk expansion are approved by this recap.',
], docPath);

mustHaveAll(doc, [
  'no fake rating copy',
  'no rating schema',
  'no review schema',
  'no open-now copy',
  'no booking copy',
  'no insurance copy',
  'no unsupported MOH approval claim',
  'no best/top provider claims',
  'no guaranteed availability copy',
  'no emergency availability copy',
  'license copy appears only with `licenseInfo`',
  'contact actions come only from approved public contact arrays',
], docPath);

const requiredPackageScripts = [
  'admin:provider-publication-contract:validate',
  'admin:final-chain:validate',
  'admin:launch-checklist:validate',
  'admin:post-activation:validate',
  'admin:provider-view-contract:validate',
  'admin:active-centers-readonly:validate',
  'admin:audit-log-readonly:validate',
  'admin:soft-launch-checklist:validate',
  'seo:public-catalog-eligibility:validate',
  'seo:public-listing-card-safety:validate',
  'seo:public-launch-safe-ui:validate',
  'import:publish-readiness-audit:validate',
  'import:sitemap-family-caps:validate',
  'import:profile-smoke:validate',
];

const requiredChainedValidators = [
  'scripts/seo/check-soft-launch-profile-seo-gate.mjs',
  'scripts/seo/check-public-profile-index-eligibility-contract.mjs',
  'scripts/seo/check-profile-relation-limit-guard.mjs',
];

for (const token of [...requiredPackageScripts, ...requiredChainedValidators]) {
  mustHave(doc, token, docPath);
}

mustHaveAll(doc, [
  'The soft launch profile SEO gate is reached through `seo:public-listing-card-safety:validate`',
  'which chains `check-public-profile-index-eligibility-contract.mjs`',
  'which chains `check-soft-launch-profile-seo-gate.mjs`.',
  'Security launch blocker',
  'Supabase Security Advisor Errors must be 0 before soft launch.',
  'Warnings may remain only if tracked in the security warning backlog.',
  'Security warning hardening is a separate post-profile-SEO sequence',
  'native profile sitemap expansion',
  'GEO/index expansion',
  'Supabase warning migrations inside profile SEO PRs',
], docPath);

for (const relativePath of [
  'src/server/admin/draft-center-publication-readiness.ts',
  'src/server/admin/draft-center-public-activation-actions.ts',
  'src/app/admin/draft-centers/[centerId]/page.tsx',
  'src/server/admin/active-centers.ts',
  'src/app/admin/active-centers/page.tsx',
  'src/app/admin/audit-log/page.tsx',
  'src/lib/catalog/public-eligible-queries.ts',
  'src/lib/catalog/public-profile-index-eligibility.ts',
  'src/lib/seo/profile-metadata-index-gate.ts',
  'src/lib/catalog/public-import-profile-index-eligibility.ts',
  'src/lib/catalog/public-profile-relation-limits.ts',
  'scripts/admin/check-admin-final-chain.mjs',
  'scripts/admin/check-post-activation-verifier.mjs',
  'scripts/admin/check-provider-view-contract.mjs',
  'scripts/admin/check-active-centers-readonly-view.mjs',
  'scripts/admin/check-audit-log-readonly-route.mjs',
  'scripts/admin/check-soft-launch-operator-checklist.mjs',
  'scripts/seo/check-public-launch-safe-ui.mjs',
  'scripts/seo/check-soft-launch-profile-seo-gate.mjs',
  'scripts/seo/check-public-profile-index-eligibility-contract.mjs',
  'scripts/seo/check-profile-relation-limit-guard.mjs',
  'scripts/import/check-public-import-profile-smoke.mjs',
]) {
  readFile(relativePath);
}

const profileEligibilityGuardPath = 'scripts/seo/check-public-profile-index-eligibility-contract.mjs';
const profileEligibilityGuard = readFile(profileEligibilityGuardPath);
mustHave(profileEligibilityGuard, "import './check-soft-launch-profile-seo-gate.mjs';", profileEligibilityGuardPath);

const listingSafetyPath = 'scripts/seo/check-public-listing-card-safety.mjs';
const listingSafety = readFile(listingSafetyPath);
mustHave(listingSafety, "import './check-public-profile-index-eligibility-contract.mjs';", listingSafetyPath);

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

const packagePath = 'package.json';
const packageJson = readFile(packagePath);
for (const token of [
  '"admin:final-launch-recap:validate": "node scripts/admin/check-final-launch-chain-recap.mjs"',
  'pnpm admin:final-launch-recap:validate',
  ...requiredPackageScripts.map((script) => `pnpm ${script}`),
]) {
  mustHave(packageJson, token, packagePath);
}

console.log('Final launch chain recap checks passed.');
