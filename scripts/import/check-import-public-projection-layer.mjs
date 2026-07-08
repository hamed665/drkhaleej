import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const projectionPath = 'src/server/admin/import-public-projection-layer.ts';
const auditPath = 'scripts/import/check-import-publish-readiness-audit.mjs';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const source = await readText(projectionPath);
const auditSource = await readText(auditPath);

for (const token of [
  'ImportPublicProjectionKind',
  'ImportPublicProjectionTable',
  'ImportPublicProjectionBuildSource',
  'ImportPublicProjectionStatus',
  'ImportPublicProjectionRecord',
  'ImportPublicProjectionManifest',
  'ImportPublicProjectionBlocker',
  'IMPORT_PUBLIC_PROJECTION_TABLES',
  'IMPORT_PUBLIC_REQUIRED_ENTITY_PROJECTION_KINDS',
  'IMPORT_PUBLIC_PROJECTION_DATA_SOURCE_BY_KIND',
  'IMPORT_PUBLIC_PROJECTION_MISSING_BLOCKER_BY_KIND',
  'IMPORT_PUBLIC_ALLOWED_RENDER_DATA_SOURCES',
  'IMPORT_PUBLIC_PROJECTION_MAX_RECORD_PAYLOAD_KB',
  'uniquePublicPageDataSources',
  'uniquePublicProjectionBlockers',
  'getPublicProjectionDataSources',
  'getImportPublicProjectionBlockers',
  'isImportPublicProjectionManifestReady',
]) {
  assert(source.includes(token), `public projection layer must include ${token}.`);
}

for (const table of [
  'public_entity_projection',
  'public_geo_projection',
  'public_seo_projection',
  'public_schema_projection',
  'public_internal_links_projection',
  'public_nearby_entities_projection',
  'public_llm_answer_projection',
  'public_area_page_projection',
]) {
  assert(source.includes(table), `public projection layer must include table ${table}.`);
}

for (const dataSource of [
  'public_indexable_entities',
  'entity_internal_links_cache',
  'schema_projection',
  'canonical_geo_projection',
  'public_content_projection',
  'public_seo_projection',
  'public_nearby_entities_projection',
  'public_llm_answer_projection',
]) {
  assert(source.includes(dataSource), `public projection layer must allow data source ${dataSource}.`);
}

for (const kind of [
  'entity',
  'geo',
  'seo',
  'schema',
  'internal_links',
  'nearby_entities',
  'llm_answer',
  'area_page',
]) {
  assert(source.includes(kind), `public projection layer must include kind ${kind}.`);
}

for (const blocker of [
  'entity_projection_missing',
  'geo_projection_missing',
  'seo_projection_missing',
  'schema_projection_missing',
  'internal_links_projection_missing',
  'nearby_entities_projection_missing',
  'llm_answer_projection_missing',
  'projection_stale',
  'projection_blocked',
  'projection_payload_too_large',
  'projection_route_mismatch',
  'projection_source_missing',
  'raw_import_source_in_public_render',
]) {
  assert(source.includes(blocker), `public projection layer blockers must include ${blocker}.`);
}

for (const forbidden of ['createSupabaseServiceRoleClient', 'insert(', 'update(', 'delete(', 'publishEntity']) {
  assert(!source.includes(forbidden), `public projection layer contract must not include runtime mutation token ${forbidden}.`);
}

assert(
  auditSource.includes("import './check-import-public-projection-layer.mjs';"),
  'publish readiness audit must chain the public projection layer validator.',
);

console.log('import public projection layer check passed.');
