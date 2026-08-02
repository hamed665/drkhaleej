import { readFile } from 'node:fs/promises';
import path from 'node:path';

const files = {
  migration: 'supabase/migrations/0090_import_pharmacy_sitemap_promotion.sql',
  compatibilityMigration:
    'supabase/migrations/0091_import_publish_queue_index_policy_compat.sql',
  writer: 'src/server/admin/import-supabase-pharmacy-sitemap-writer.ts',
  operation: 'src/server/admin/import-pharmacy-sitemap-operation.ts',
  sitemap: 'src/server/public/import-sitemap.ts',
  sitemapTest: 'src/server/public/import-sitemap.test.ts',
  proof: 'scripts/import/run-pharmacy-sitemap-promotion-proof.mjs',
  workflow: '.github/workflows/preview-migration-sync.yml',
  contract: 'docs/import/PHARMACY_SITEMAP_PROMOTION.md',
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
  'P15 hosted compatibility correction',
  'drop constraint if exists import_publish_queue_index_policy_check',
  "index_policy in ('noindex', 'index_eligible', 'index', 'blocked')",
]) {
  assert(
    sources.compatibilityMigration.toLowerCase().includes(token.toLowerCase()),
    `${files.compatibilityMigration} must include ${token}`,
  );
}

for (const token of [
  'P15 PHARMACY-SITEMAP-PROMOTION',
  'import_pharmacy_sitemap_authorizations',
  'import_pharmacy_sitemap_events',
  'index_authorization_id',
  'import_authorize_pharmacy_sitemap_promotion',
  'import_include_pharmacy_sitemap_by_authority',
  'import_rollback_pharmacy_sitemap_by_authority',
  "publish_status = 'index_eligible'",
  "index_policy = 'index'",
  "sitemap_policy = 'included'",
  "'sitemap_included', true",
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
  "status = 'active'::public.provider_status",
  'is_active = true',
  'create policy',
  'insert into public.centers',
  'update public.centers',
  'doctor_sitemap',
  'hospital_sitemap',
]) {
  assert(
    !sources.migration.toLowerCase().includes(forbidden),
    `${files.migration} must not include ${forbidden}`,
  );
}

for (const token of [
  'PHARMACY_SITEMAP_PROMOTION_SCHEMA_VERSION',
  'import_authorize_pharmacy_sitemap_promotion',
  'import_include_pharmacy_sitemap_by_authority',
  'import_rollback_pharmacy_sitemap_by_authority',
  'indexEligible: true',
  'sitemapEligible: true',
  'rawReferenceExposed: false',
]) {
  assert(sources.writer.includes(token), `${files.writer} must include ${token}`);
}
for (const token of [
  'IMPORT_PHARMACY_SITEMAP_PROMOTION_ENABLED',
  'IMPORT_PHARMACY_SITEMAP_ROLLBACK_ENABLED',
  'VERCEL_ENV',
  'PREVIEW_PROJECT_REF',
  'PRODUCTION_PROJECT_REF',
  'INCLUDE PHARMACY SITEMAP',
  'ROLLBACK PHARMACY SITEMAP',
  'indexEligible: true',
]) {
  assert(sources.operation.includes(token), `${files.operation} must include ${token}`);
}
for (const token of [
  'pharmacy_sitemap_promotion_schema_version',
  'drkhaleej.import.pharmacySitemapPromotion.v1',
  'metadata.sitemap_included !== true',
  'readString(metadata, "robots_policy") !== "index"',
  '.eq("publish_status", "index_eligible")',
  '.eq("index_policy", "index")',
  '.eq("sitemap_policy", "included")',
]) {
  assert(sources.sitemap.includes(token), `${files.sitemap} must include ${token}`);
}
assert(
  sources.sitemapTest.includes('accepts Pharmacy only with the independent P15 Sitemap evidence'),
  `${files.sitemapTest} must prove the P15 marker gate.`,
);

for (const token of [
  'PHARMACY_SITEMAP_PREVIEW_DATABASE_URL',
  'PHARMACY_SITEMAP_PRODUCTION_PROJECT_REF',
  "join(',') === '0090,0091'",
  'import_publish_queue_index_policy_check',
  'Promise.all',
  'sitemap_prerequisite_queue_integrity_mismatch',
  'sitemap_included_queue_integrity_mismatch',
  'exactP14IndexRecovery: true',
  'productionConnected: false',
  'rawIdentifiersExposed: false',
]) {
  assert(sources.proof.includes(token), `${files.proof} must include ${token}`);
}
for (const token of [
  'PHARMACY_SITEMAP_SOURCE_COMMIT',
  'run-pharmacy-sitemap-promotion-proof.mjs',
  'pharmacy-sitemap-promotion-${{ github.event.pull_request.head.sha || github.sha }}',
]) {
  assert(sources.workflow.includes(token), `${files.workflow} must include ${token}`);
}

const match = sources.contract.match(
  /```json pharmacy-sitemap-promotion\s*\r?\n([\s\S]*?)\r?\n```/,
);
assert(match, `${files.contract} machine-readable record is missing.`);
const manifest = JSON.parse(match[1]);
assert(
  manifest.schemaVersion === 'drkhaleej.pharmacySitemapPromotion.v1' &&
    manifest.status === 'complete' &&
    manifest.migration === '0090_import_pharmacy_sitemap_promotion.sql' &&
    manifest.compatibilityMigration ===
      '0091_import_publish_queue_index_policy_compat.sql' &&
    manifest.phaseMapping?.subphaseId === 'PHARMACY-SITEMAP-PROMOTION' &&
    manifest.promotionState?.indexPolicy === 'index' &&
    manifest.promotionState?.robotsPolicy === 'index' &&
    manifest.promotionState?.sitemapPolicy === 'included' &&
    manifest.promotionState?.sitemapIncluded === true &&
    manifest.rollbackRecovery === 'exact_p14_index_restore' &&
    manifest.jsonLdEnabled === false &&
    manifest.productionConnected === false &&
    manifest.next === 'INTAKE-CONTRACT-CONVERGENCE',
  `${files.contract} P15 record drifted.`,
);
assert(
  sources.roadmap.includes('"currentMigration": "0092_import_source_evidence_ledger.sql"') &&
    sources.roadmap.includes('"currentNext": "DUPLICATE-GEO-CONTRACT"') &&
    sources.roadmap.includes('Wave 7.4   COMPLETE') &&
    sources.roadmap.includes('Wave 8     PARTIAL'),
  `${files.roadmap} P15 state drifted.`,
);
assert(
  sources.package.includes('"import:pharmacy-sitemap-promotion:validate"'),
  `${files.package} validation command is missing.`,
);

console.log('Pharmacy Sitemap promotion contract passed.');
