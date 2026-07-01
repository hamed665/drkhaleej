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

function assertIncludes(content, token, label) {
  if (!content.includes(token)) {
    throw new Error(`${label} is missing required token: ${token}`);
  }
}

function assertNotIncludes(content, token, label) {
  if (content.includes(token)) {
    throw new Error(`${label} contains forbidden token: ${token}`);
  }
}

function assertFileIncludes(relativePath, tokens) {
  const content = readFile(relativePath);
  for (const token of tokens) assertIncludes(content, token, relativePath);
  return content;
}

function assertFileNotIncludes(relativePath, tokens) {
  const content = readFile(relativePath);
  for (const token of tokens) assertNotIncludes(content, token, relativePath);
  return content;
}

function assertCriticalFilesDoNotContain(paths, tokens) {
  for (const relativePath of paths) {
    const content = readFile(relativePath).toLowerCase();
    for (const token of tokens) {
      const normalizedToken = token.toLowerCase();
      if (content.includes(normalizedToken)) {
        throw new Error(`${relativePath} contains forbidden public SEO claim token: ${token}`);
      }
    }
  }
}

const docPath = 'docs/seo/soft-launch-profile-seo-gate.md';
assertFileIncludes(docPath, [
  'Soft launch profile SEO gate',
  'Summary readiness',
  'Native profile index eligibility',
  'Metadata noindex gate',
  'Sitemap boundary',
  'Completeness signals',
  'Evidence copy guard',
  'Provider copy review',
  'Import profile boundary',
  'Profile graph and relation limits',
  'Forbidden SEO claims',
  'does not enable native profile sitemap expansion',
]);

assertFileIncludes('src/lib/catalog/public-profile-summary.ts', [
  'buildPublicCenterProfileSummary',
  'buildPublicDoctorProfileSummary',
  'buildPublicProfileMetaDescription',
  'approved DrKhaleej directory data',
  'current details should be confirmed directly with the provider',
]);
assertFileIncludes('src/lib/catalog/public-import-profile-summary.ts', [
  'buildPublicImportProfileSummary',
  'buildPublicImportProfileMetaDescription',
  'Reviewed public directory signals include',
  'reviewed public import data for discovery',
]);
assertFileIncludes('src/lib/catalog/public-profile-summary.test.ts', [
  'buildPublicCenterProfileSummary',
  'buildPublicDoctorProfileSummary',
  'buildPublicProfileMetaDescription',
  'expectNoForbiddenClaims',
  'toBeLessThanOrEqual(155)',
  'builds localized Arabic summaries from the same approved data',
]);
assertFileIncludes('docs/seo/public-profile-summary-contract.md', [
  'Public profile summary contract',
  'Every indexable public doctor or center profile must use the shared summary helpers',
  'Every reviewed imported public profile must use the shared import summary helpers',
  'Generated summaries must not include these claims',
  'Metadata must not fall back to a generic repeated sentence',
]);
assertFileIncludes('scripts/seo/check-public-profile-summary-contract.mjs', [
  'buildPublicCenterProfileSummary',
  'buildPublicDoctorProfileSummary',
  'buildPublicProfileMetaDescription',
  'buildPublicImportProfileSummary',
  'buildPublicImportProfileMetaDescription',
  'assertNotIncludes(summaryHelper, forbiddenToken',
  'assertNotIncludes(importSummaryHelper, forbiddenToken',
]);

assertFileIncludes('src/lib/catalog/public-profile-index-eligibility.ts', [
  'PublicProfileIndexEligibilityReason',
  'PublicProfileIndexEligibilityResult',
  'isPublicProfileIndexEligible',
  'fromPublicEligibleQuery',
  'missing_profile',
  'missing_name',
  'missing_slug',
  'missing_country',
  'missing_entity_type',
  'missing_summary',
  'missing_relation_signal',
  'missing_safety_copy',
  'unsafe_claim',
  'deleted_or_inactive',
  'not_from_public_eligible_query',
]);
assertFileIncludes('src/lib/catalog/public-profile-index-eligibility.test.ts', [
  "describe('public profile index eligibility'",
  'marks a fact-complete center from the public eligible query chain as indexable',
  'marks a fact-complete doctor from the public eligible query chain as indexable',
  'requires public eligible query provenance before indexing',
  'returns reasons for missing core facts instead of a silent boolean',
]);
assertFileIncludes('docs/seo/public-profile-index-eligibility.md', [
  'Public profile index eligibility contract',
  'PublicProfileIndexEligibilityResult',
  'fromPublicEligibleQuery: true',
  'not_from_public_eligible_query',
  'deleted_or_inactive',
  'missing_relation_signal',
  'missing_safety_copy',
  'unsafe_claim',
]);

assertFileIncludes('src/lib/seo/profile-metadata-index-gate.ts', [
  'buildProfileNoindexMetadata',
  'applyProfileMetadataIndexGate',
  'robots: { index: false, follow: true }',
  'if (eligibility.eligible) return metadata',
]);
assertFileIncludes('src/lib/seo/profile-metadata-index-gate.test.ts', [
  "describe('profile metadata index gate'",
  'keeps metadata indexable when the profile is eligible',
  'adds noindex/follow robots metadata when the profile is not eligible',
  'builds noindex metadata without dropping existing title and description',
]);
for (const routePath of [
  'src/app/[locale]/[country]/center/[centerSlug]/page.tsx',
  'src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx',
]) {
  assertFileIncludes(routePath, [
    'isPublicProfileIndexEligible',
    'applyProfileMetadataIndexGate',
    'fromPublicEligibleQuery: true',
    'buildNoindexFallbackMetadata',
    'robots: { index: false, follow: true }',
  ]);
}

assertFileIncludes('src/app/sitemap.ts', [
  'listSitemapEligibleSeoPageDefinitions',
  'listPublicImportSitemapEntries',
  'return [...staticEntries, ...importedEntries]',
]);
assertFileNotIncludes('src/app/sitemap.ts', [
  'getPublicDoctorBySlug',
  'getPublicCenterBySlug',
  'listPublicDoctors',
  'listPublicCenters',
  'isPublicProfileIndexEligible',
  'doctorSlug',
  'centerSlug',
  'generateStaticParams',
  'searchParams',
  '?q=',
  'provider-dashboard',
  'admin',
  'preview',
]);
assertFileIncludes('src/server/public/import-sitemap.ts', [
  'type SupportedImportSitemapEntityType = "doctor" | "pharmacy" | "hospital"',
  'publicImportSitemapFamilyCaps',
  'hasReviewedImportEvidence',
  '.eq("publish_status", "index_eligible")',
  '.eq("index_policy", "index")',
  '.eq("sitemap_policy", "included")',
  'applyFamilyCaps(entries)',
]);
assertFileIncludes('docs/seo/public-profile-sitemap-boundary.md', [
  'Public profile sitemap boundary',
  'must not use `generateStaticParams`',
  'query and filter URLs must not appear in sitemap output',
  'family caps remain in place',
]);
assertFileIncludes('scripts/seo/check-public-profile-sitemap-boundary.mjs', [
  'listSitemapEligibleSeoPageDefinitions',
  'listPublicImportSitemapEntries',
  'generateStaticParams',
  'searchParams',
  'isPublicProfileIndexEligible',
]);

assertFileIncludes('src/lib/catalog/public-profile-completeness.ts', [
  'PublicProfileCompletenessSignals',
  'buildPublicProfileCompletenessSignals',
  'hasName',
  'hasSlug',
  'hasCountry',
  'hasEntityType',
  'hasSummary',
  'hasRelationSignal',
  'hasSafetyCopy',
  'hasUnsafeClaimFree',
  'score',
  'percentage',
  'missing',
]);
assertFileIncludes('src/lib/catalog/public-profile-completeness.test.ts', [
  "describe('public profile completeness signals'",
  'buildPublicProfileCompletenessSignals',
  'relation_signal',
  'unsafe_claim_free',
]);
assertFileIncludes('docs/seo/public-profile-completeness-signals.md', [
  'Public profile completeness signals',
  'internal quality model',
  'not a public badge',
  'Internal-only rule',
]);

assertFileIncludes('scripts/seo/check-public-profile-evidence-copy-guard.mjs', [
  'PublicLicenseInfoCard',
  'This is not a license or MOH approval claim.',
  'Contact details should be confirmed with the provider.',
  'not medical advice, diagnosis, emergency guidance, or a guarantee of provider availability',
  'MOH ',
  'approved',
  'insurance ',
  'accepted',
  'Book ',
  'now',
  'Open ',
  'available ',
  'emergency ',
  'availability',
]);
assertFileIncludes('docs/seo/public-profile-evidence-copy-guard.md', [
  'Public profile evidence copy guard',
  'only when `licenseInfo` exists',
  'not official regulator approval',
  'Contact actions must come from approved public contact action arrays',
]);
assertFileIncludes('src/components/public/public-center-detail.tsx', [
  'PublicLicenseInfoCard',
  'center.licenseInfo ? (',
  'PublicContactActions actions={center.contactActions}',
  'showSafeContactFallback',
  'medical advice',
]);
assertFileIncludes('src/components/public/public-doctor-detail.tsx', [
  'PublicLicenseInfoCard',
  'doctor.licenseInfo ? (',
  'PublicContactActions actions={practiceLocation.contactActions}',
  'Confirm clinical details directly with the provider before making care decisions.',
]);
assertFileIncludes('src/components/public/public-license-info-card.tsx', [
  'PublicLicenseInfo | null',
  'if (licenseInfo === null) return null',
  'Displayed for transparency.',
]);

assertFileIncludes('src/lib/catalog/provider-description-review.ts', [
  'providerDescriptionReviewStatuses',
  "'draft'",
  "'pending_review'",
  "'approved'",
  "'rejected'",
  'buildProviderDescriptionPublicReadiness',
  'getApprovedProviderDescriptionBody',
  'hasUnsafeProviderDescriptionClaim',
  "reasons.push('not_approved')",
  "reasons.push('empty_body')",
  "reasons.push('unsafe_claim')",
]);
assertFileIncludes('src/lib/catalog/provider-description-review.test.ts', [
  "describe('provider description review contract'",
  'allows approved clean provider copy to become public body text',
  'keeps draft and pending provider copy out of public rendering',
  'blocks unsafe claim wording even if the status is approved',
]);
assertFileIncludes('docs/seo/provider-description-review-contract.md', [
  'Provider description review contract',
  'Only `approved` copy can be considered for public rendering.',
  'does not add admin UI',
]);

assertFileIncludes('src/lib/catalog/public-import-profile-index-eligibility.ts', [
  'PublicImportProfileIndexEligibilityReason',
  'PublicImportProfileIndexEligibilityResult',
  'isPublicImportProfileIndexEligible',
  'missing_name',
  'missing_canonical_path',
  'missing_location',
  'missing_source',
  'missing_last_checked',
  'missing_language',
  'missing_taxonomy_signal',
  'missing_contact_or_map',
]);
assertFileIncludes('src/lib/catalog/public-import-profile-index-eligibility.test.ts', [
  "describe('public import profile index eligibility'",
  'blocks name-only imported profiles from index eligibility',
  'requires a language signal before imported metadata stays indexable',
  'accepts department or service taxonomy signals for imported hospitals and pharmacies',
]);
assertFileIncludes('scripts/import/check-import-profile-index-eligibility.mjs', [
  'isPublicImportProfileIndexEligible',
  'const importIndexEligibility = isPublicImportProfileIndexEligible(importResult.profile)',
  'const importIndexEligibility = isPublicImportProfileIndexEligible(result.profile)',
  'const importIndexEligibility = isPublicImportProfileIndexEligible(profile)',
]);
assertFileIncludes('scripts/import/check-public-import-profile-smoke.mjs', [
  "import './check-import-profile-index-eligibility.mjs';",
  'doctor',
  'pharmacy',
  'hospital',
  'hasSourceEvidence(sourceName, sourceUrl, lastCheckedAt)',
  'hasContactOrMap({ phoneE164, whatsappE164, email, websiteUrl, googleMapsUrl, directionUrl })',
]);

assertFileIncludes('scripts/seo/check-profile-graph-anchor-text.mjs', [
  "import './check-profile-relation-limit-guard.mjs';",
  'View profile',
  'View doctor profile',
  'View center profile',
  '>More<',
  '>Profile<',
  '>Details<',
]);
assertFileIncludes('src/lib/catalog/public-profile-relation-limits.ts', [
  'PUBLIC_CENTER_PROFILE_LOCATION_LIMIT = 6',
  'PUBLIC_CENTER_PROFILE_SERVICE_LIMIT = 12',
  'PUBLIC_CENTER_PROFILE_DOCTOR_LIMIT = 12',
  'PUBLIC_DOCTOR_PROFILE_SERVICE_LIMIT = 12',
  'PUBLIC_DOCTOR_PROFILE_PRACTICE_LOCATION_LIMIT = 8',
  'items.slice(0, Math.max(0, limit))',
]);
assertFileNotIncludes('src/lib/catalog/public-profile-relation-limits.ts', ['Math.random', 'sort(() =>', 'randomUUID']);
assertFileIncludes('scripts/seo/check-profile-relation-limit-guard.mjs', [
  'PUBLIC_CENTER_PROFILE_LOCATION_LIMIT = 6',
  'PUBLIC_CENTER_PROFILE_SERVICE_LIMIT = 12',
  'PUBLIC_CENTER_PROFILE_DOCTOR_LIMIT = 12',
  'PUBLIC_DOCTOR_PROFILE_SERVICE_LIMIT = 12',
  'PUBLIC_DOCTOR_PROFILE_PRACTICE_LOCATION_LIMIT = 8',
  'PublicDoctorDetailLimited',
]);

const forbiddenSeoClaimTokens = [
  ['Aggregate', 'Rating'].join(''),
  ['rating', 'Value'].join(''),
  ['review', 'Count'].join(''),
  ['review ', 'schema'].join(''),
  ['Book ', 'now'].join(''),
  ['booking ', 'guarantee'].join(''),
  ['Open ', 'now'].join(''),
  ['available ', 'now'].join(''),
  ['insurance ', 'accepted'].join(''),
  ['MOH ', 'approved'].join(''),
  ['verified ', 'by MOH'].join(''),
  ['best ', 'doctors'].join(''),
  ['top-rated'].join(''),
  ['trusted ', 'by thousands'].join(''),
  ['guaranteed ', 'treatment'].join(''),
  ['emergency ', 'availability'].join(''),
];

assertCriticalFilesDoNotContain([
  'src/app/sitemap.ts',
  'src/server/public/import-sitemap.ts',
  'src/app/[locale]/[country]/center/[centerSlug]/page.tsx',
  'src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx',
  'src/app/[locale]/[country]/pharmacies/[pharmacySlug]/page.tsx',
  'src/pages/[locale]/[country]/hospitals/[hospitalSlug].tsx',
  'src/components/public/public-listing-card.tsx',
  'src/components/public/public-center-detail.tsx',
  'src/components/public/public-doctor-detail.tsx',
  'src/components/public/public-license-info-card.tsx',
  'src/components/public/import-profile/GuardedImportProfilePage.tsx',
  'src/lib/catalog/public-profile-summary.ts',
  'src/lib/catalog/public-import-profile-summary.ts',
  'src/lib/seo/profile-metadata-index-gate.ts',
], forbiddenSeoClaimTokens);

assertFileIncludes('scripts/seo/check-public-profile-index-eligibility-contract.mjs', [
  "import './check-soft-launch-profile-seo-gate.mjs';",
  "import './check-public-profile-metadata-index-gate.mjs';",
  "import './check-public-profile-completeness-signals.mjs';",
  "import './check-profile-graph-anchor-text.mjs';",
]);
assertFileIncludes('scripts/seo/check-public-listing-card-safety.mjs', [
  "import './check-public-profile-summary-contract.mjs';",
  "import './check-public-profile-index-eligibility-contract.mjs';",
]);
assertFileIncludes('package.json', [
  'pnpm seo:public-listing-card-safety:validate',
  'pnpm import:profile-smoke:validate',
]);

console.log('Soft launch profile SEO aggregate gate passed.');
