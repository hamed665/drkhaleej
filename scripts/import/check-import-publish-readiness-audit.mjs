import './check-import-publish-lock.mjs';
import './check-import-publish-lifecycle.mjs';
import './check-import-domain-entity-contract.mjs';
import './check-import-canonical-geo-contract.mjs';
import './check-import-publication-validation.mjs';
import './check-import-link-rule-matrix.mjs';
import './check-import-internal-link-generator.mjs';
import './check-import-internal-link-cache.mjs';
import './check-import-sitemap-eligibility.mjs';
import './check-import-schema-generator.mjs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const auditPath = 'src/server/admin/import-publish-readiness-audit.ts';
const lockPath = 'src/server/admin/import-publish-lock.ts';
const lifecyclePath = 'src/server/admin/import-publish-lifecycle.ts';
const domainPath = 'src/server/admin/import-entity-domain.ts';
const geoPath = 'src/server/admin/import-canonical-geo.ts';
const validationPath = 'src/server/admin/import-publication-validation.ts';
const linkRulePath = 'src/server/admin/import-link-rule-matrix.ts';
const linkGeneratorPath = 'src/server/admin/import-internal-link-generator.ts';
const linkCachePath = 'src/server/admin/import-internal-link-cache.ts';
const sitemapEligibilityPath = 'src/server/admin/import-sitemap-eligibility-contract.ts';
const schemaGeneratorPath = 'src/server/admin/import-schema-generator.ts';
const schemaValidationPath = 'src/server/admin/import-schema-validation.ts';

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
const validationSource = await readText(validationPath);
const linkRuleSource = await readText(linkRulePath);
const linkGeneratorSource = await readText(linkGeneratorPath);
const linkCacheSource = await readText(linkCachePath);
const sitemapEligibilitySource = await readText(sitemapEligibilityPath);
const schemaGeneratorSource = await readText(schemaGeneratorPath);
const schemaValidationSource = await readText(schemaValidationPath);
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
  'ivf_center',
  'hair_transplant_clinic',
  'sports_medicine_doctor',
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

for (const validationToken of [
  'ImportPublicationValidationBlocker',
  'ImportPublicationValidationInput',
  'isValidImportSlug',
  'isValidImportCanonicalPath',
  'getImportPublicationValidationBlockers',
  'isImportPublicationValidationReady',
  'slug_invalid',
  'title_too_short',
  'meta_description_too_short',
  'canonical_invalid',
  'minimum_content_incomplete',
  'schema_invalid',
  'internal_links_missing',
]) {
  assertIncludes(validationSource, validationToken, `${validationPath} must include ${validationToken}`);
}

for (const linkRuleToken of [
  'ImportEntityLinkRule',
  'IMPORT_ENTITY_LINK_RULES',
  'source_type',
  'target_type',
  'source_domain',
  'target_domain',
  'allowed',
  'priority',
  'max_links',
  'max_distance_km',
  'same_city_required',
  'same_area_boost',
  'same_specialty_required',
  'min_quality_score',
  'findImportEntityLinkRule',
  'getImportLinkRuleDecision',
  'isImportEntityLinkAllowed',
]) {
  assertIncludes(linkRuleSource, linkRuleToken, `${linkRulePath} must include ${linkRuleToken}`);
}

for (const linkGeneratorToken of [
  'ImportInternalLinkCandidate',
  'ImportInternalLinkSource',
  'ImportGeneratedInternalLink',
  'ImportInternalLinkGenerationInput',
  'IMPORT_INTERNAL_LINK_GENERATOR_VERSION',
  'IMPORT_INTERNAL_LINK_RULE_VERSION',
  'generateImportInternalLinks',
  'getImportLinkRuleDecision',
  'generatedLinksByRule',
  'maxLinksByRule',
  'allowed_rule_geo_quality_specialty_filter',
  'rule_version',
  'generator_version',
]) {
  assertIncludes(linkGeneratorSource, linkGeneratorToken, `${linkGeneratorPath} must include ${linkGeneratorToken}`);
}

for (const linkCacheToken of [
  'ImportInternalLinkCacheRow',
  'ImportInternalLinkCacheWriteInput',
  'ImportInternalLinkCacheReadFilter',
  'IMPORT_INTERNAL_LINK_CACHE_TABLE',
  'entity_internal_links_cache',
  'IMPORT_INTERNAL_LINK_CACHE_REQUIRED_COLUMNS',
  'toImportInternalLinkCacheRow',
  'isImportInternalLinkCacheRowActive',
  'filterImportInternalLinkCacheRows',
  'rule_id',
  'rule_version',
  'generator_version',
  'generated_reason',
  'generated_at',
  'expires_at',
  'is_active',
]) {
  assertIncludes(linkCacheSource, linkCacheToken, `${linkCachePath} must include ${linkCacheToken}`);
}

for (const sitemapEligibilityToken of [
  'ImportSitemapEligibilityEntity',
  'ImportSitemapEligibilityBlocker',
  'IMPORT_SITEMAP_VALIDATED_PROJECTION',
  'public_indexable_entities',
  'IMPORT_SITEMAP_FILES',
  'getSitemapBlockers',
  'isSitemapEligible',
  'visibility_not_public',
  'index_policy_not_index',
  'sitemap_policy_not_included',
  'duplicate_check_not_passed',
  'canonical_not_validated',
]) {
  assertIncludes(sitemapEligibilitySource, sitemapEligibilityToken, `${sitemapEligibilityPath} must include ${sitemapEligibilityToken}`);
}

for (const schemaToken of [
  'ImportSchemaType',
  'ImportSchemaEntityInput',
  'ImportGeneratedSchema',
  'IMPORT_SCHEMA_TYPES_BY_ENTITY_TYPE',
  'generateEntitySchema',
  'getImportSchemaTypesForEntityType',
  'Hospital',
  'Physician',
  'Pharmacy',
  'VeterinaryCare',
  'PetStore',
  'SportsActivityLocation',
]) {
  assertIncludes(schemaGeneratorSource, schemaToken, `${schemaGeneratorPath} must include ${schemaToken}`);
}

for (const schemaValidationToken of [
  'ImportSchemaValidationBlocker',
  'ImportSchemaValidationInput',
  'schema_domain_mismatch',
  'schema_name_missing',
  'schema_url_missing',
  'schema_address_missing',
  'schema_geo_missing',
  'getSchemaBlockers',
  'validateGeneratedSchema',
  'isSchemaReady',
]) {
  assertIncludes(schemaValidationSource, schemaValidationToken, `${schemaValidationPath} must include ${schemaValidationToken}`);
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
