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
  'type SupportedImportSitemapEntityType = "doctor" | "pharmacy"',
  'publicImportSitemapFamilyCaps',
  'hasReviewedImportEvidence',
  '.eq("publish_status", "index_eligible")',
  '.eq("index_policy", "index")',
  '.eq("sitemap_policy", "included")',
  'applyFamilyCaps(entries)',
]);
assertFileNotIncludes('src/server/public/import-sitemap.ts', [
  'hospital: 500',
  'value === "hospital"',
  '/hospitals/',
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
]);

console.log('soft launch profile SEO gate checks passed.');
