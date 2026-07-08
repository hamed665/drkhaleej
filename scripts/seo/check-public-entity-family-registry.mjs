import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const contractPath = resolve(projectRoot, 'docs/seo/public-entity-family-registry-contract.md');
const registryPath = resolve(projectRoot, 'src/lib/catalog/public-entity-family-registry.ts');
const resolverPath = resolve(projectRoot, 'src/lib/catalog/public-provider-route-resolver.ts');
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
    console.error(`${label} is missing required entity family registry phrases:`);
    for (const phrase of missing) console.error(`- ${phrase}`);
    process.exit(1);
  }
}

const contractSource = readRequired(contractPath, 'entity family registry contract');
const registrySource = readRequired(registryPath, 'entity family registry');
const resolverSource = readRequired(resolverPath, 'canonical route resolver');
const roadmapSource = readRequired(roadmapPath, 'SEO/Geo roadmap');

const families = [
  'doctor',
  'hospital',
  'clinic',
  'dental_clinic',
  'dentist',
  'pharmacy',
  'lab',
  'imaging_center',
  'beauty_clinic',
  'charity_center',
  'pet_clinic',
  'pet_shop',
  'service',
  'specialty',
  'department',
  'article',
  'geo_area',
];

requirePhrases('entity family registry contract', contractSource, [
  'Status: canonical entity family registry contract.',
  'registry-first, adapter-driven, cards-last',
  'Family-specific behavior must live in registry policy or adapters',
  'Provider-like families are:',
  'Non-provider families are:',
  'Capabilities are policy flags, not route approval.',
  'The family registry must not build URLs directly.',
  'Imported hospital detail/discovery/sitemap release remains blocked',
]);

requirePhrases('entity family registry contract', contractSource, families);
requirePhrases('entity family registry', registrySource, families.map((family) => `'${family}'`));

requirePhrases('entity family registry', registrySource, [
  'export const publicEntityFamilies',
  'export type PublicEntityFamily',
  'export const publicProviderEntityFamilies',
  'export type PublicProviderEntityFamily',
  'export const publicNonProviderEntityFamilies',
  'export type PublicNonProviderEntityFamily',
  'export type PublicEntityFamilyVertical',
  'export type PublicEntityFamilyCapabilities',
  'export type PublicEntityFamilyRegistryEntry',
  'export const publicEntityFamilyRegistry',
  'routeFamily: PublicProviderRouteFamily | null',
  'detailPage: boolean',
  'directoryPage: boolean',
  'geoPage: boolean',
  'searchResult: boolean',
  'internalLinkTarget: boolean',
  'sitemapEntry: boolean',
  'nearbyRecommendation: boolean',
  'isPublicEntityFamily',
  'isPublicProviderEntityFamily',
  'getPublicEntityFamilyRegistryEntry',
]);

requirePhrases('canonical route resolver', resolverSource, [
  'PublicProviderRouteFamily',
  "'doctor'",
  "'hospital'",
  "'pharmacy'",
  "'lab'",
  "'imaging_center'",
  "'beauty_clinic'",
  "'pet_clinic'",
  "'pet_shop'",
]);

requirePhrases('SEO/Geo roadmap', roadmapSource, [
  'Entity Registry',
  'doctor',
  'hospital',
  'pharmacy',
  'lab',
  'imaging_center',
  'beauty_clinic',
  'pet_clinic',
  'pet_shop',
  'charity_center',
]);

console.log('Public entity family registry validation passed.');
