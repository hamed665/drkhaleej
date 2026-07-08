import './check-import-publish-lock.mjs';
import './check-import-publish-lifecycle.mjs';
import './check-import-domain-entity-contract.mjs';
import './check-import-canonical-geo-contract.mjs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const auditPath = 'src/server/admin/import-publish-readiness-audit.ts';
const lockPath = 'src/server/admin/import-publish-lock.ts';
const lifecyclePath = 'src/server/admin/import-publish-lifecycle.ts';
const domainPath = 'src/server/admin/import-entity-domain.ts';
const geoPath = 'src/server/admin/import-canonical-geo.ts';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(source, token, message) {
  assert(source.includes(token), message);
}

function assertNotIncludes(source, token, message) {
  assert(!source.includes(token), message);
}

const auditSource = await readText(auditPath);
const lockSource = await readText(lockPath);
const lifecycleSource = await readText(lifecyclePath);
const domainSource = await readText(domainPath);
const geoSource = await readText(geoPath);
const packageSource = await readText('package.json');

for (const token of [
  'export type ImportAuditFamily = "doctor" | "pharmacy" | "hospital";',
  'export type ImportAuditBlockerReason',
  'export type ImportAuditFamilySummary',
  'export type ImportPublishReadinessAudit',
  'export async function getImportPublishReadinessAudit',
  'createSupabaseServiceRoleClient',
  'import_publish_queue',
  'import_entity_candidates',
  'id, target_entity_type, publish_status, index_policy, sitemap_policy, quality_score, updated_at, metadata',
  'id, entity_type, candidate_status, candidate_payload',
  'candidate_status === "approved"',
  'candidate.entity_type !== family',
  'metadata.sitemap_included !== true',
  'readString(metadata, "canonical_path")',
  'readString(metadata, "import_entity_candidate_id")',
  'readString(source, "lastCheckedAt")',
  'readString(contact, "phoneE164")',
  'readString(contact, "googleMapsUrl")',
  'readString(geo, "wilayat")',
  'readNumber(geo, "latitude")',
  '^\\/(en|ar)\\/om\\/doctor\\/',
  '^\\/(en|ar)\\/om\\/pharmacies\\/',
  '^\\/(en|ar)\\/om\\/hospitals\\/',
  'readyForPublicIndexRows',
  'rowIssues',
]) {
  assertIncludes(auditSource, token, `${auditPath} must include ${token}`);
}

for (const lockToken of [
  'IMPORT_PUBLISH_LOCK_DEFAULTS',
  'visibility: "private"',
  'index_policy: "noindex"',
  'sitemap_policy: "excluded"',
  'manual_approved: false',
  'public_ready: false',
  'robots_policy: "noindex"',
  'sitemap_included: false',
]) {
  assertIncludes(lockSource, lockToken, `${lockPath} must include ${lockToken}`);
}

for (const lifecycleToken of [
  'ImportEntityLifecycleState',
  'canPublishEntity',
  'getPublishBlockers',
  'getReadinessStatus',
  'manual_approval_missing',
  'seo_not_validated',
  'geo_not_validated',
  'content_not_validated',
  'relations_not_validated',
  'schema_not_validated',
  'duplicate_check_missing',
]) {
  assertIncludes(lifecycleSource, lifecycleToken, `${lifecyclePath} must include ${lifecycleToken}`);
}

for (const domainToken of [
  'ImportEntityDomain',
  'ImportEntityType',
  'IMPORT_ENTITY_DOMAIN_BY_TYPE',
  'human_healthcare',
  'pet_healthcare',
  'medical_beauty',
  'non_medical_beauty',
  'wellness',
  'fitness',
  'resolveImportEntityDomain',
  'getDomainSeparationViolations',
  'isCrossDomainBlockedByDefault',
]) {
  assertIncludes(domainSource, domainToken, `${domainPath} must include ${domainToken}`);
}

for (const geoToken of [
  'ImportCanonicalGeo',
  'ImportGeoResolutionStatus',
  'IMPORT_CANONICAL_GEO_REQUIRED_TABLES',
  'IMPORT_CANONICAL_OMAN_GEO_SEED_AREAS',
  'getCanonicalGeoBlockers',
  'isCanonicalGeoPublishReady',
  'geo_countries',
  'geo_governorates',
  'geo_cities',
  'geo_areas',
  'geo_confidence_score',
  'geo_validated',
]) {
  assertIncludes(geoSource, geoToken, `${geoPath} must include ${geoToken}`);
}

for (const forbiddenToken of [
  'provider-dashboard',
  'billing',
  'payment',
  'rating',
  'Review',
]) {
  assertNotIncludes(auditSource, forbiddenToken, `${auditPath} must not include ${forbiddenToken}.`);
}

for (const packageToken of [
  'import:publish-readiness-audit:validate',
  'scripts/import/check-import-publish-readiness-audit.mjs',
  'pnpm import:publish-readiness-audit:validate',
]) {
  assertIncludes(packageSource, packageToken, `package.json must include ${packageToken}.`);
}

console.log('import publish readiness audit check passed.');
