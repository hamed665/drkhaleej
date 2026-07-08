import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const contractPath = resolve(projectRoot, 'docs/seo/public-geo-registry-contract.md');
const registryPath = resolve(projectRoot, 'src/lib/catalog/public-geo-registry.ts');
const roadmapPath = resolve(projectRoot, 'docs/seo/DRKHALEEJ_SEO_GEO_ROADMAP_2026_V1.md');

function readRequired(filePath, label) {
  if (!existsSync(filePath)) {
    console.error(`Missing ${label}: ${filePath}`);
    process.exit(1);
  }
  return readFileSync(filePath, 'utf8');
}

function requirePhrases(label, source, phrases) {
  const missing = phrases.filter((phrase) => !source.includes(phrase));
  if (missing.length > 0) {
    console.error(`${label} is missing required public geo registry phrases:`);
    for (const phrase of missing) console.error(`- ${phrase}`);
    process.exit(1);
  }
}

const contractSource = readRequired(contractPath, 'public geo registry contract');
const registrySource = readRequired(registryPath, 'public geo registry');
const roadmapSource = readRequired(roadmapPath, 'SEO/Geo roadmap');

requirePhrases('public geo registry contract', contractSource, [
  'Status: canonical geo registry contract for SEO and local discovery.',
  'geo-first, inventory-gated, noindex-first',
  'country',
  'governorate',
  'wilayat_or_city',
  'area',
  'neighborhood_or_landmark optional',
  'provider_location',
  'geoConfidence',
  'inventoryStatus',
  'indexEligibility',
  'minimumProviderCount passed',
  'minimumFamilyDiversity passed',
  'same exact area',
  'coordinate distance',
  'near me search',
  'service plus geo page',
  'specialty plus geo page',
  'Geo pages must stay noindex',
]);

requirePhrases('public geo registry', registrySource, [
  'export const publicGeoNodeTypes',
  'export type PublicGeoNodeType',
  'export const publicGeoConfidenceValues',
  'export type PublicGeoConfidence',
  'export const publicGeoInventoryStatuses',
  'export type PublicGeoInventoryStatus',
  'export type PublicGeoIndexEligibility',
  'export type PublicGeoNode',
  'export type PublicGeoNearbyRankInput',
  'canPromotePublicGeoNode',
  'comparePublicGeoNearbyRank',
  "'verified'",
  "'admin_reviewed'",
  "'imported_candidate'",
  "'unknown'",
  "'index_ready'",
  "'blocked_by_imported_hospital_release'",
  'sameExactArea',
  'sameCityOrWilayat',
  'coordinateDistanceMeters',
  'sameSpecialtyOrService',
  'sourceQualityScore',
  'profileCompletenessScore',
  'freshnessScore',
]);

requirePhrases('SEO/Geo roadmap', roadmapSource, [
  'Geo Registry',
  'same exact area',
  'coordinate distance',
  'Geo page',
  'nearby recommendation',
]);

console.log('Public geo registry contract validation passed.');
