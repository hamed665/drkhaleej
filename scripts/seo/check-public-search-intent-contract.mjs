import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const contractPath = resolve(projectRoot, 'docs/seo/public-search-intent-contract.md');
const intentPath = resolve(projectRoot, 'src/lib/catalog/public-search-intent.ts');
const familyPath = resolve(projectRoot, 'src/lib/catalog/public-entity-family-registry.ts');
const geoPath = resolve(projectRoot, 'src/lib/catalog/public-geo-registry.ts');
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
    console.error(`${label} is missing required public search intent phrases:`);
    for (const phrase of missing) console.error(`- ${phrase}`);
    process.exit(1);
  }
}

const contractSource = readRequired(contractPath, 'public search intent contract');
const intentSource = readRequired(intentPath, 'public search intent types');
const familySource = readRequired(familyPath, 'public entity family registry');
const geoSource = readRequired(geoPath, 'public geo registry');
const roadmapSource = readRequired(roadmapPath, 'SEO/Geo roadmap');

const intents = [
  'provider_name',
  'doctor_by_specialty',
  'center_by_category',
  'service_near_area',
  'specialty_near_area',
  'pharmacy_near_area',
  'lab_near_area',
  'imaging_near_area',
  'emergency_near_area',
  'pet_service_near_area',
  'beauty_service_near_area',
  'charity_near_area',
  'dental_service_near_area',
  'near_me',
  'unknown',
];

requirePhrases('public search intent contract', contractSource, [
  'Status: canonical search intent contract for public discovery.',
  'intent-first, geo-aware, noindex-safe',
  'Public search must understand provider family, specialty, service, city, area, and near-me intent',
  'Search must use the public geo registry',
  'Search must use the public entity family registry',
  'Search result pages remain noindex by default.',
  '`near_me` intent must never create an indexable static page by itself.',
  'build provider URLs directly',
  'promote imported hospital results before release blockers pass',
  'create sitemap URLs from search queries',
  'use client-side heavy search for public SEO pages',
]);
requirePhrases('public search intent contract', contractSource, intents);

requirePhrases('public search intent types', intentSource, intents.map((intent) => `'${intent}'`));
requirePhrases('public search intent types', intentSource, [
  'export const publicSearchIntentKinds',
  'export type PublicSearchIntentKind',
  'export type PublicSearchLanguage',
  'export type PublicSearchParsedIntent',
  'export type PublicSearchRankInput',
  'normalizePublicSearchQuery',
  'canCreateIndexableSearchLanding',
  'comparePublicSearchRank',
  'rawQuery: string',
  'normalizedQuery: string',
  'providerFamily: PublicProviderEntityFamily | null',
  'vertical: PublicEntityFamilyVertical | null',
  'geoConfidence: PublicGeoConfidence',
  'minimumResultFamilyDiversity: number',
  'indexableLandingAllowed: boolean',
  'exactProviderNameMatch',
  'exactAreaMatch',
  'exactCityOrWilayatMatch',
  'coordinateDistanceMeters',
  "intent.intent !== 'near_me'",
  "intent.intent !== 'unknown'",
  "intent.geoConfidence === 'verified'",
  "intent.geoConfidence === 'admin_reviewed'",
]);

requirePhrases('public entity family registry', familySource, [
  'PublicEntityFamilyVertical',
  'publicProviderEntityFamilies',
  "'pharmacy'",
  "'lab'",
  "'imaging_center'",
  "'beauty_clinic'",
  "'pet_clinic'",
  "'charity_center'",
]);

requirePhrases('public geo registry', geoSource, [
  'PublicGeoConfidence',
  "'verified'",
  "'admin_reviewed'",
]);

requirePhrases('SEO/Geo roadmap', roadmapSource, [
  'Search Intent Engine',
  'nearMe',
  'service_near_area',
  'pharmacy_near_area',
]);

console.log('Public search intent contract validation passed.');
