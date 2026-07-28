import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const files = {
  migration: 'supabase/migrations/0087_import_pharmacy_public_noindex_lifecycle.sql',
  runtime: 'src/server/admin/import-pharmacy-public-noindex-lifecycle.ts',
  guard: 'src/server/public/import-pharmacy-profile-guard.ts',
  route: 'src/app/[locale]/[country]/pharmacies/[pharmacySlug]/page.tsx',
  resolver: 'src/lib/catalog/public-provider-route-resolver.ts',
  publicAdapter: 'src/lib/catalog/public-provider-import-adapter.ts',
  sitemap: 'src/server/public/import-sitemap.ts',
  proof: 'scripts/import/run-pharmacy-public-noindex-lifecycle-proof.mjs',
  workflow: '.github/workflows/preview-migration-sync.yml',
  contract: 'docs/import/PHARMACY_PUBLIC_NOINDEX_LIFECYCLE.md',
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
  'PHARMACY-PUBLIC-NOINDEX-LIFECYCLE',
  'import_pharmacy_public_noindex_authorizations',
  'import_pharmacy_public_noindex_events',
  'snapshot_payload jsonb not null',
  "status in ('issued', 'published')",
  'import_authorize_pharmacy_public_noindex',
  'import_publish_pharmacy_public_noindex',
  'import_rollback_pharmacy_public_noindex_by_authority',
  "publish_status = 'published_noindex'",
  "index_policy = 'noindex'",
  "sitemap_policy = 'excluded'",
  "'robots_policy', 'noindex'",
  "'sitemap_included', false",
  "'index_promoted', false",
  'exactLogicalRecovery',
  'security invoker',
  'set search_path = pg_catalog, public',
  'enable row level security',
  'to service_role',
]) {
  includes(sources.migration.toLowerCase(), token.toLowerCase(), files.migration);
}
for (const forbidden of [
  "index_policy = 'index'",
  "sitemap_policy = 'included'",
  "status = 'active'::public.provider_status",
  'is_active = true',
  'create policy',
]) {
  excludes(sources.migration.toLowerCase(), forbidden, files.migration);
}

for (const token of [
  'PHARMACY_PUBLIC_NOINDEX_SCHEMA_VERSION',
  'resolvePublicProviderCanonicalRoute',
  'environment !== "preview"',
  'previewRef === productionRef',
  '!url.includes(previewRef)',
  'url.includes(productionRef)',
  'IMPORT_PHARMACY_PUBLIC_NOINDEX_ENABLED',
  'IMPORT_PREVIEW_ALLOWED_ACTOR_IDS',
  'IMPORT_PREVIEW_CANARY_ENTITY_IDS',
  '"import_authorize_pharmacy_public_noindex"',
  '"import_publish_pharmacy_public_noindex"',
  '"import_rollback_pharmacy_public_noindex_by_authority"',
  'productionConnected: false',
]) {
  includes(sources.runtime, token, files.runtime);
}
for (const forbidden of [
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'localStorage',
  'sessionStorage',
  'document.cookie',
]) {
  excludes(sources.runtime, forbidden, files.runtime);
}

for (const token of [
  'isPublicNoindexPharmacyQueueRow',
  'isPublicNoindexPharmacyAuthorization',
  'row.publish_status !== "published_noindex"',
  'row.index_policy !== "noindex"',
  'row.sitemap_policy !== "excluded"',
  'row.metadata.sitemap_included !== false',
  'row.metadata.index_promoted !== false',
  'stringValue(row.metadata, "robots_policy") !== "noindex"',
  'import_pharmacy_public_noindex_authorizations',
  'authorization.status !== "published"',
  'localSuggestions: []',
]) {
  includes(sources.guard, token, files.guard);
}
excludes(sources.guard, 'buildPublicImportLocalSuggestions', files.guard);

for (const token of [
  'return buildProfileNoindexMetadata(metadata)',
  'data-index-policy="noindex"',
  'data-sitemap-policy="excluded"',
  'buildLocalizedMetadata',
  'href={`/${locale}/${country}/pharmacies`}',
]) {
  includes(sources.route, token, files.route);
}
for (const forbidden of [
  'isPublicImportProfileIndexEligible',
  'profile.localSuggestions.map',
  'publicLocalSuggestionHref',
  'rating',
  'booking',
  'insurance',
  'claim',
  'application/ld+json',
  'createJsonLd',
  'serializeJsonLd',
  '"@type": "Pharmacy"',
]) {
  excludes(sources.route, forbidden, files.route);
}

for (const token of [
  "if (family === 'pharmacy')",
  'publicPharmacyDetailRoute',
]) {
  includes(sources.resolver, token, files.resolver);
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

for (const token of [
  'PHARMACY_NOINDEX_PREVIEW_DATABASE_URL',
  'PHARMACY_NOINDEX_PREVIEW_PROJECT_REF',
  'PHARMACY_NOINDEX_PRODUCTION_PROJECT_REF',
  "parsed.port === '5432'",
  '.pooler.supabase.com',
  "where version = '0087'",
  'Promise.all([publish(clientA, item), publish(clientB, item)])',
  "'published,replayed'",
  'Promise.all([rollback(clientA, item), rollback(clientB, item)])',
  "'replayed,rolled_back'",
  'exactLogicalRecoveryVerified: true',
  'indexLeakageCount: 0',
  'sitemapLeakageCount: 0',
  'cleanupVerified: true',
  'productionConnected: false',
  'from pg_catalog.pg_proc p',
  'not p.prosecdef as security_invoker',
  "'search_path=pg_catalog,public'",
]) {
  includes(sources.proof, token, files.proof);
}

for (const token of [
  'PHARMACY_NOINDEX_SOURCE_COMMIT',
  'test "$PREVIEW_SOURCE_COMMIT" = "$PHARMACY_NOINDEX_SOURCE_COMMIT"',
  'check-pharmacy-public-noindex-lifecycle.mjs',
  'Verify exact ledger and database inventories',
  'Prove Pharmacy public/noindex lifecycle and exact rollback',
  'run-pharmacy-public-noindex-lifecycle-proof.mjs',
  'pharmacy-public-noindex-${{ github.event.pull_request.head.sha || github.sha }}',
]) {
  includes(sources.workflow, token, files.workflow);
}
assert(
  sources.workflow.indexOf('Verify exact ledger and database inventories') <
    sources.workflow.indexOf('Prove Pharmacy public/noindex lifecycle and exact rollback'),
  `${files.workflow} must apply and verify migration 0087 before the hosted lifecycle proof.`,
);

const manifestMatch = sources.contract.match(
  /```json pharmacy-public-noindex-lifecycle\s*\r?\n([\s\S]*?)\r?\n```/,
);
assert(manifestMatch, `${files.contract} machine-readable lifecycle record is missing.`);
const manifest = JSON.parse(manifestMatch[1]);
assert(
  manifest.schemaVersion === 'drkhaleej.pharmacyPublicNoindexLifecycle.v1' &&
    manifest.status === 'complete' &&
    manifest.migration === '0087_import_pharmacy_public_noindex_lifecycle.sql' &&
    manifest.phaseMapping?.executionPhase === 9 &&
    manifest.phaseMapping?.lockScope === 10 &&
    manifest.phaseMapping?.productModule === 18 &&
    manifest.phaseMapping?.subphaseId === 'PHARMACY-PUBLIC-NOINDEX-LIFECYCLE' &&
    manifest.publicationPolicy?.indexPolicy === 'noindex' &&
    manifest.publicationPolicy?.sitemapPolicy === 'excluded' &&
    manifest.independentRollback === true &&
    manifest.exactLogicalRecovery === true &&
    manifest.productionConnected === false &&
    manifest.next === 'PHARMACY-INDEX-PROMOTION',
  `${files.contract} lifecycle record drifted.`,
);

for (const token of [
  '"currentMigration": "0087_import_pharmacy_public_noindex_lifecycle.sql"',
  '"currentNext": "PHARMACY-INDEX-PROMOTION"',
  'Wave 7.1   COMPLETE',
  'PHARMACY_PUBLIC_NOINDEX_LIFECYCLE.md',
]) {
  includes(sources.roadmap, token, files.roadmap);
}

for (const token of [
  '"import:pharmacy-public-noindex:validate"',
  'scripts/import/check-pharmacy-public-noindex-lifecycle.mjs',
  'src/server/admin/import-pharmacy-public-noindex-lifecycle.test.ts',
  'src/server/public/import-pharmacy-profile-guard.test.ts',
  'src/lib/catalog/public-provider-route-resolver.test.ts',
]) {
  includes(sources.package, token, files.package);
}

console.log('Pharmacy public/noindex lifecycle contract passed.');
