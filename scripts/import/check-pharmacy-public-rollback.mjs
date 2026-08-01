import { readFile } from 'node:fs/promises';
import path from 'node:path';

const files = {
  migration: 'supabase/migrations/0088_import_pharmacy_public_rollback.sql',
  writer: 'src/server/admin/import-supabase-pharmacy-public-rollback-writer.ts',
  operation: 'src/server/admin/import-pharmacy-public-rollback-operation.ts',
  proof: 'scripts/import/run-pharmacy-public-rollback-proof.mjs',
  workflow: '.github/workflows/preview-migration-sync.yml',
  contract: 'docs/import/PHARMACY_PUBLIC_ROLLBACK.md',
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
  'P13 PHARMACY-PUBLIC-ROLLBACK',
  'import_rollback_pharmacy_public_noindex_by_authority',
  "status in ('issued', 'published', 'rolled_back'",
  "'public_noindex_rolled_back'",
  'extensions.digest(v_authorization.snapshot_payload::text',
  'delete from public.import_publish_queue',
  'update public.import_publish_queue',
  'security invoker',
  'set search_path = pg_catalog, public',
  'to service_role',
]) {
  assert(sources.migration.toLowerCase().includes(token.toLowerCase()), `${files.migration} must include ${token}`);
}
for (const forbidden of [
  "index_policy = 'index'",
  "sitemap_policy = 'included'",
  "status = 'active'::public.provider_status",
  'is_active = true',
  'create policy',
]) {
  assert(!sources.migration.toLowerCase().includes(forbidden), `${files.migration} must not include ${forbidden}`);
}

for (const token of [
  'p_actor_profile_id',
  'p_entity_id',
  'p_schema_version',
  'rawReferenceExposed',
]) {
  assert(sources.writer.includes(token), `${files.writer} must include ${token}`);
}
for (const token of [
  'IMPORT_PHARMACY_PUBLIC_ROLLBACK_ENABLED',
  'VERCEL_ENV',
  'PREVIEW_PROJECT_REF',
  'PRODUCTION_PROJECT_REF',
  'ROLLBACK PHARMACY PUBLIC',
  'routeEnabled: false',
]) {
  assert(sources.operation.includes(token), `${files.operation} must include ${token}`);
}
for (const token of [
  'PHARMACY_PUBLIC_ROLLBACK_PREVIEW_DATABASE_URL',
  'PHARMACY_PUBLIC_ROLLBACK_PRODUCTION_PROJECT_REF',
  'Promise.all',
  `metadata || '{"index_promoted":true}'::jsonb`,
  'published_queue_integrity_mismatch',
  'computed_snapshot_hash',
  'productionConnected: false',
  'rawIdentifiersExposed: false',
]) {
  assert(sources.proof.includes(token), `${files.proof} must include ${token}`);
}
for (const token of [
  'PHARMACY_PUBLIC_ROLLBACK_SOURCE_COMMIT',
  'run-pharmacy-public-rollback-proof.mjs',
  'pharmacy-public-rollback-${{ github.event.pull_request.head.sha || github.sha }}',
]) {
  assert(sources.workflow.includes(token), `${files.workflow} must include ${token}`);
}

const match = sources.contract.match(
  /```json pharmacy-public-rollback\s*\r?\n([\s\S]*?)\r?\n```/,
);
assert(match, `${files.contract} machine-readable record is missing.`);
const manifest = JSON.parse(match[1]);
assert(
  manifest.schemaVersion === 'drkhaleej.pharmacyPublicRollback.v1' &&
    manifest.status === 'complete' &&
    manifest.migration === '0088_import_pharmacy_public_rollback.sql' &&
    manifest.phaseMapping?.subphaseId === 'PHARMACY-PUBLIC-ROLLBACK' &&
    manifest.rpcInputs?.join(',') === 'actor_profile_id,entity_id,schema_version' &&
    manifest.preExistingQueueRecovery === 'exact_restore' &&
    manifest.createdQueueRecovery === 'exact_delete' &&
    manifest.indexPromoted === false &&
    manifest.sitemapPromoted === false &&
    manifest.productionConnected === false &&
    manifest.next === 'PHARMACY-INDEX-PROMOTION',
  `${files.contract} rollback record drifted.`,
);
assert(
  sources.roadmap.includes(
    '"currentMigration": "0090_import_pharmacy_sitemap_promotion.sql"',
  ) &&
    sources.roadmap.includes('"currentNext": "INTAKE-CONTRACT-CONVERGENCE"') &&
    sources.roadmap.includes('Wave 7.2   COMPLETE') &&
    sources.roadmap.includes('Wave 7.4   COMPLETE'),
  `${files.roadmap} P13 state drifted.`,
);
assert(
  sources.package.includes('"import:pharmacy-public-rollback:validate"'),
  `${files.package} validation command is missing.`,
);

console.log('Pharmacy public rollback contract passed.');
