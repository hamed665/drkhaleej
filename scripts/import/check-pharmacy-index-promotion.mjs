import { readFile } from 'node:fs/promises';
import path from 'node:path';

const files = {
  migration: 'supabase/migrations/0089_import_pharmacy_index_promotion.sql',
  writer: 'src/server/admin/import-supabase-pharmacy-index-writer.ts',
  operation: 'src/server/admin/import-pharmacy-index-operation.ts',
  guard: 'src/server/public/import-pharmacy-profile-guard.ts',
  route: 'src/app/[locale]/[country]/pharmacies/[pharmacySlug]/page.tsx',
  proof: 'scripts/import/run-pharmacy-index-promotion-proof.mjs',
  workflow: '.github/workflows/preview-migration-sync.yml',
  contract: 'docs/import/PHARMACY_INDEX_PROMOTION.md',
  roadmap: 'docs/import/import-readiness-roadmap-after-933.md',
  package: 'package.json',
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const sources = Object.fromEntries(
  await Promise.all(
    Object.entries(files).map(async ([key, relativePath]) => [
      key,
      await readFile(path.join(process.cwd(), relativePath), 'utf8'),
    ]),
  ),
);

for (const token of [
  'P14 PHARMACY-INDEX-PROMOTION',
  'import_pharmacy_index_authorizations',
  'import_pharmacy_index_events',
  'import_authorize_pharmacy_index_promotion',
  'import_promote_pharmacy_index_by_authority',
  'import_rollback_pharmacy_index_by_authority',
  "publish_status = 'index_eligible'",
  "index_policy = 'index_eligible'",
  "sitemap_policy = 'excluded'",
  "'sitemap_included', false",
  'index_candidate_content_ineligible',
  "candidate_payload -> 'languages'",
  "candidate_payload #> '{taxonomy,services}'",
  'extensions.digest(v_authorization.snapshot_payload::text',
  'security invoker',
  'set search_path = pg_catalog, public',
  'to service_role',
]) {
  assert(
    sources.migration.toLowerCase().includes(token.toLowerCase()),
    `${files.migration} must include ${token}`,
  );
}
for (const forbidden of [
  "sitemap_policy = 'included'",
  "'sitemap_included', true",
  "status = 'active'::public.provider_status",
  'is_active = true',
  'create policy',
  'pharmacy_sitemap_promotion',
]) {
  assert(
    !sources.migration.toLowerCase().includes(forbidden),
    `${files.migration} must not include ${forbidden}`,
  );
}

for (const token of [
  'PHARMACY_INDEX_PROMOTION_SCHEMA_VERSION',
  'import_authorize_pharmacy_index_promotion',
  'import_promote_pharmacy_index_by_authority',
  'import_rollback_pharmacy_index_by_authority',
  'sitemapEligible: false',
  'rawReferenceExposed: false',
]) {
  assert(sources.writer.includes(token), `${files.writer} must include ${token}`);
}
for (const token of [
  'IMPORT_PHARMACY_INDEX_PROMOTION_ENABLED',
  'IMPORT_PHARMACY_INDEX_ROLLBACK_ENABLED',
  'VERCEL_ENV',
  'PREVIEW_PROJECT_REF',
  'PRODUCTION_PROJECT_REF',
  'PROMOTE PHARMACY INDEX',
  'ROLLBACK PHARMACY INDEX',
  'sitemapEligible: false',
]) {
  assert(
    sources.operation.includes(token),
    `${files.operation} must include ${token}`,
  );
}
for (const token of [
  'isPublicIndexPharmacyQueueRow',
  'isPublicIndexPharmacyAuthorization',
  'isPublicImportProfileIndexEligible',
  'drkhaleej.import.pharmacyIndexPromotion.v1',
  'sitemap_included !== false',
  'index_promoted !== true',
  '"import_pharmacy_index_authorizations"',
]) {
  assert(sources.guard.includes(token), `${files.guard} must include ${token}`);
}
for (const token of [
  'result.profile.indexPolicy === "index"',
  'buildProfileNoindexMetadata',
  'data-index-policy={profile.indexPolicy}',
]) {
  assert(sources.route.includes(token), `${files.route} must include ${token}`);
}
for (const token of [
  'PHARMACY_INDEX_PREVIEW_DATABASE_URL',
  'PHARMACY_INDEX_PRODUCTION_PROJECT_REF',
  'Promise.all',
  `metadata || '{"sitemap_included":true}'::jsonb`,
  'index_prerequisite_queue_integrity_mismatch',
  'index_promoted_queue_integrity_mismatch',
  'index_candidate_content_ineligible',
  'thinContentBlockedBeforeAuthorization: true',
  'exactPublicNoindexRecovery: true',
  'productionConnected: false',
  'rawIdentifiersExposed: false',
]) {
  assert(sources.proof.includes(token), `${files.proof} must include ${token}`);
}
for (const token of [
  'PHARMACY_INDEX_SOURCE_COMMIT',
  'run-pharmacy-index-promotion-proof.mjs',
  'pharmacy-index-promotion-${{ github.event.pull_request.head.sha || github.sha }}',
]) {
  assert(
    sources.workflow.includes(token),
    `${files.workflow} must include ${token}`,
  );
}

const match = sources.contract.match(
  /```json pharmacy-index-promotion\s*\r?\n([\s\S]*?)\r?\n```/,
);
assert(match, `${files.contract} machine-readable record is missing.`);
const manifest = JSON.parse(match[1]);
assert(
  manifest.schemaVersion === 'drkhaleej.pharmacyIndexPromotion.v1' &&
    manifest.status === 'complete' &&
    manifest.migration === '0089_import_pharmacy_index_promotion.sql' &&
    manifest.phaseMapping?.subphaseId === 'PHARMACY-INDEX-PROMOTION' &&
    manifest.promotionState?.indexPolicy === 'index_eligible' &&
    manifest.promotionState?.robotsPolicy === 'index' &&
    manifest.promotionState?.sitemapPolicy === 'excluded' &&
    manifest.promotionState?.sitemapIncluded === false &&
    manifest.rollbackRecovery === 'exact_public_noindex_restore' &&
    manifest.jsonLdEnabled === false &&
    manifest.productionConnected === false &&
    manifest.next === 'PHARMACY-SITEMAP-PROMOTION',
  `${files.contract} P14 record drifted.`,
);
assert(
  sources.roadmap.includes('"currentMigration": "0089_import_pharmacy_index_promotion.sql"') &&
    sources.roadmap.includes('"currentNext": "PHARMACY-SITEMAP-PROMOTION"') &&
    sources.roadmap.includes('Wave 7.3   COMPLETE'),
  `${files.roadmap} P14 state drifted.`,
);
assert(
  sources.package.includes('"import:pharmacy-index-promotion:validate"'),
  `${files.package} validation command is missing.`,
);

console.log('Pharmacy Index promotion contract passed.');
