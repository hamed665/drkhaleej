import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const files = {
  migration:
    'supabase/migrations/0087_import_pharmacy_public_noindex_authority.sql',
  proof: 'scripts/import/run-pharmacy-public-noindex-authority-proof.mjs',
  workflow: '.github/workflows/preview-migration-sync.yml',
  contract: 'docs/import/PHARMACY_PUBLIC_NOINDEX_AUTHORITY.md',
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
  'P11 PHARMACY-PUBLIC-NOINDEX-AUTHORITY',
  'import_pharmacy_public_noindex_authorizations',
  'import_pharmacy_public_noindex_events',
  'candidate_id uuid not null',
  'snapshot_payload jsonb not null',
  "status in ('issued', 'published')",
  'import_authorize_pharmacy_public_noindex',
  'import_publish_pharmacy_public_noindex',
  "publish_status = 'published_noindex'",
  "index_policy = 'noindex'",
  "sitemap_policy = 'excluded'",
  "'robots_policy', 'noindex'",
  "'sitemap_included', false",
  "'index_promoted', false",
  "'public_route_enabled', false",
  "'visibility', 'authority_only'",
  'security invoker',
  'set search_path = pg_catalog, public',
  'enable row level security',
  'to service_role',
]) {
  includes(sources.migration.toLowerCase(), token.toLowerCase(), files.migration);
}
for (const forbidden of [
  'import_rollback_pharmacy_public_noindex_by_authority',
  "'rolled_back'",
  "index_policy = 'index'",
  "sitemap_policy = 'included'",
  "status = 'active'::public.provider_status",
  'is_active = true',
  'create policy',
  'delete from public.import_publish_queue',
]) {
  excludes(sources.migration.toLowerCase(), forbidden, files.migration);
}

for (const token of [
  'PHARMACY_NOINDEX_AUTHORITY_PREVIEW_DATABASE_URL',
  'PHARMACY_NOINDEX_AUTHORITY_PREVIEW_PROJECT_REF',
  'PHARMACY_NOINDEX_AUTHORITY_PRODUCTION_PROJECT_REF',
  "parsed.port === '5432'",
  '.pooler.supabase.com',
  "where version::text in ('0087', '0088')",
  'from pg_catalog.pg_proc p',
  'not p.prosecdef as security_invoker',
  "'search_path=pg_catalog,public'",
  'has_function_privilege',
  'Independent rollback RPC does not match the applied migration ledger',
  'Promise.all([clientA.connect(), clientB.connect()])',
  "'published,replayed'",
  'bilingualLiveRoutesVerified: false',
  'publicRouteEnabled: false',
  'rollbackGatePresent',
  'rollbackExercised: false',
  'indexLeakageCount: 0',
  'sitemapLeakageCount: 0',
  'cleanupVerified: true',
  'productionConnected: false',
]) {
  includes(sources.proof, token, files.proof);
}
excludes(
  sources.proof,
  'select public.import_rollback_pharmacy_public_noindex_by_authority(',
  files.proof,
);

for (const token of [
  'PHARMACY_NOINDEX_AUTHORITY_SOURCE_COMMIT',
  'test "$PREVIEW_SOURCE_COMMIT" = "$PHARMACY_NOINDEX_AUTHORITY_SOURCE_COMMIT"',
  'check-pharmacy-public-noindex-authority.mjs',
  'run-pharmacy-public-noindex-authority-proof.mjs',
  'Prove Pharmacy public/noindex authority only',
  'pharmacy-public-noindex-authority-${{ github.event.pull_request.head.sha || github.sha }}',
]) {
  includes(sources.workflow, token, files.workflow);
}
assert(
  sources.workflow.indexOf('Verify exact ledger and database inventories') <
    sources.workflow.indexOf('Prove Pharmacy public/noindex authority only'),
  `${files.workflow} must apply and verify 0087 before the hosted P11 proof.`,
);

const manifestMatch = sources.contract.match(
  /```json pharmacy-public-noindex-authority\s*\r?\n([\s\S]*?)\r?\n```/,
);
assert(manifestMatch, `${files.contract} machine-readable record is missing.`);
const manifest = JSON.parse(manifestMatch[1]);
assert(
  manifest.schemaVersion ===
    'drkhaleej.pharmacyPublicNoindexAuthority.v1' &&
    manifest.status === 'complete' &&
    manifest.migration ===
      '0087_import_pharmacy_public_noindex_authority.sql' &&
    manifest.phaseMapping?.executionPhase === 9 &&
    manifest.phaseMapping?.lockScope === 10 &&
    manifest.phaseMapping?.productModule === 18 &&
    manifest.phaseMapping?.subphaseId ===
      'PHARMACY-PUBLIC-NOINDEX-AUTHORITY' &&
    manifest.publicationPolicy?.indexPolicy === 'noindex' &&
    manifest.publicationPolicy?.sitemapPolicy === 'excluded' &&
    manifest.publicationPolicy?.publicRouteEnabled === false &&
    manifest.bilingualPathsBound === true &&
    manifest.bilingualLiveRoutesVerified === false &&
    manifest.rollbackInstalled === false &&
    manifest.jsonLdEnabled === false &&
    manifest.indexPromoted === false &&
    manifest.sitemapPromoted === false &&
    manifest.productionConnected === false &&
    manifest.next === 'PHARMACY-BILINGUAL-LIVE-VERIFY',
  `${files.contract} authority record drifted.`,
);

for (const token of [
  '"currentMigration": "0089_import_pharmacy_index_promotion.sql"',
  '"currentNext": "PHARMACY-SITEMAP-PROMOTION"',
  'Wave 7.1   COMPLETE',
  'PHARMACY_PUBLIC_NOINDEX_AUTHORITY.md',
]) {
  includes(sources.roadmap, token, files.roadmap);
}

for (const token of [
  '"import:pharmacy-public-noindex-authority:validate"',
  'scripts/import/check-pharmacy-public-noindex-authority.mjs',
]) {
  includes(sources.package, token, files.package);
}

console.log('Pharmacy public/noindex authority contract passed.');
