import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const files = {
  migration: 'supabase/migrations/0087_import_pharmacy_public_noindex_authority.sql',
  routes: 'src/lib/routes/public.ts',
  resolver: 'src/lib/catalog/public-provider-route-resolver.ts',
  guard: 'src/server/public/import-pharmacy-profile-guard.ts',
  route: 'src/app/[locale]/[country]/pharmacies/[pharmacySlug]/page.tsx',
  publicAdapter: 'src/lib/catalog/public-provider-import-adapter.ts',
  sitemap: 'src/server/public/import-sitemap.ts',
  evidence: 'scripts/import/write-pharmacy-bilingual-live-evidence.mjs',
  workflow: '.github/workflows/preview-migration-sync.yml',
  contract: 'docs/import/PHARMACY_BILINGUAL_LIVE_VERIFY.md',
  roadmap: 'docs/import/import-readiness-roadmap-after-933.md',
  package: 'package.json',
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function includes(source, token, file) {
  assert(source.includes(token), `${file} must include ${token}`);
}

function excludes(source, token, file) {
  assert(!source.includes(token), `${file} must not include ${token}`);
}

const sources = Object.fromEntries(
  await Promise.all(
    Object.entries(files).map(async ([key, relativePath]) => [
      key,
      await readFile(path.join(root, relativePath), 'utf8'),
    ]),
  ),
);

for (const token of [
  'publicPharmacyDetailRoute',
  '`/${locale}/${country}/pharmacies/${pharmacySlug}`',
  'publicPharmacyDetailRoutePattern',
]) {
  includes(sources.routes, token, files.routes);
}
for (const token of [
  "if (family === 'pharmacy')",
  'publicPharmacyDetailRoute',
  "reason: 'enabled'",
]) {
  includes(sources.resolver, token, files.resolver);
}
excludes(sources.resolver, "if (family === 'hospital')", files.resolver);

for (const token of [
  'isPublicNoindexPharmacyQueueRow',
  'isPublicNoindexPharmacyAuthorization',
  'row.publish_status !== "published_noindex"',
  'row.index_policy !== "noindex"',
  'row.sitemap_policy !== "excluded"',
  'row.metadata.sitemap_included !== false',
  'row.metadata.index_promoted !== false',
  'row.metadata.public_route_enabled !== false',
  '"drkhaleej.import.pharmacyPublicNoindex.v1"',
  'import_pharmacy_public_noindex_authorizations',
  'authorization.status !== "published"',
  'localSuggestions: []',
]) {
  includes(sources.guard, token, files.guard);
}
for (const forbidden of [
  'buildPublicImportLocalSuggestions({',
  '.eq("publish_status", "index_eligible")',
  '.eq("index_policy", "index")',
  '.eq("sitemap_policy", "included")',
]) {
  excludes(sources.guard, forbidden, files.guard);
}

for (const token of [
  'result.profile.indexPolicy === "index"',
  ': buildProfileNoindexMetadata(metadata)',
  'buildLocalizedMetadata',
  'data-index-policy={profile.indexPolicy}',
  'data-sitemap-policy="excluded"',
  'href={`/${locale}/${country}/pharmacies`}',
  'تصفح الصيدليات',
]) {
  includes(sources.route, token, files.route);
}
for (const forbidden of [
  'isPublicImportProfileIndexEligible',
  'profile.localSuggestions',
  'publicLocalSuggestionHref',
  'application/ld+json',
  'createJsonLd',
  'serializeJsonLd',
  '"@type": "Pharmacy"',
]) {
  excludes(sources.route, forbidden, files.route);
}

includes(
  sources.publicAdapter,
  '"drkhaleej.import.pharmacyIndexPromotion.v1"',
  files.publicAdapter,
);
includes(
  sources.sitemap,
  '"drkhaleej.import.pharmacySitemapPromotion.v1"',
  files.sitemap,
);
excludes(
  sources.migration,
  'import_rollback_pharmacy_public_noindex_by_authority',
  files.migration,
);

for (const token of [
  'drkhaleej.pharmacyPublicNoindexAuthorityProof.v1',
  'authorityEvidence.sourceCommit === sourceCommit',
  'persistentHttpFixtureCreated: false',
  'productionConnected: false',
  'secretsRedacted: true',
]) {
  includes(sources.evidence, token, files.evidence);
}

for (const token of [
  'PHARMACY_BILINGUAL_SOURCE_COMMIT',
  'test "$PREVIEW_SOURCE_COMMIT" = "$PHARMACY_BILINGUAL_SOURCE_COMMIT"',
  'pnpm import:pharmacy-bilingual-live:validate',
  'write-pharmacy-bilingual-live-evidence.mjs',
  'pharmacy-bilingual-live-verify-${{ github.event.pull_request.head.sha || github.sha }}',
]) {
  includes(sources.workflow, token, files.workflow);
}
assert(
  sources.workflow.indexOf('Prove Pharmacy public/noindex authority only') <
    sources.workflow.indexOf('Write Pharmacy bilingual live route evidence'),
  `${files.workflow} must produce the P11 database proof before P12 evidence.`,
);

const manifestMatch = sources.contract.match(
  /```json pharmacy-bilingual-live-verify\s*\r?\n([\s\S]*?)\r?\n```/,
);
assert(manifestMatch, `${files.contract} machine-readable record is missing.`);
const manifest = JSON.parse(manifestMatch[1]);
assert(
  manifest.schemaVersion === 'drkhaleej.pharmacyBilingualLiveVerify.v1' &&
    manifest.status === 'complete' &&
    manifest.migration ===
      '0087_import_pharmacy_public_noindex_authority.sql' &&
    manifest.phaseMapping?.executionPhase === 9 &&
    manifest.phaseMapping?.lockScope === 10 &&
    manifest.phaseMapping?.productModule === 18 &&
    manifest.phaseMapping?.subphaseId ===
      'PHARMACY-BILINGUAL-LIVE-VERIFY' &&
    manifest.publicationPolicy?.publishStatus === 'published_noindex' &&
    manifest.publicationPolicy?.indexPolicy === 'noindex' &&
    manifest.publicationPolicy?.sitemapPolicy === 'excluded' &&
    manifest.p11AuthorityRequired === true &&
    manifest.canonicalAndHreflangVerified === true &&
    manifest.candidateRelationLinksEnabled === false &&
    manifest.jsonLdEnabled === false &&
    manifest.rollbackInstalled === false &&
    manifest.indexPromoted === false &&
    manifest.sitemapPromoted === false &&
    manifest.productionConnected === false &&
    manifest.next === 'PHARMACY-PUBLIC-ROLLBACK',
  `${files.contract} P12 record drifted.`,
);

for (const token of [
  '"currentMigration": "0093_import_entity_candidate_pipeline.sql"',
  '"currentNext": "ENTITY-RESOLUTION-GATE"',
  'Wave 7.1   COMPLETE',
  'Wave 7.2   COMPLETE',
  'Wave 7.3   COMPLETE',
  'Wave 7.4   COMPLETE',
  'Wave 8     PARTIAL',
  'PHARMACY_BILINGUAL_LIVE_VERIFY.md',
]) {
  includes(sources.roadmap, token, files.roadmap);
}
for (const token of [
  '"import:pharmacy-bilingual-live:validate"',
  'scripts/import/check-pharmacy-bilingual-live-verify.mjs',
  'src/lib/catalog/public-provider-route-resolver.test.ts',
  'src/server/public/import-pharmacy-profile-guard.test.ts',
]) {
  includes(sources.package, token, files.package);
}

console.log('Pharmacy bilingual live verification contract passed.');
