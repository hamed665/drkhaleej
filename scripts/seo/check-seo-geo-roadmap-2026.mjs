import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const roadmapPath = resolve(projectRoot, 'docs/seo/DRKHALEEJ_SEO_GEO_ROADMAP_2026_V1.md');

const requiredPhrases = [
  'Status: canonical roadmap and implementation order.',
  'engine-first, public-route-last',
  'Entity Registry',
  'Geo Registry',
  'Canonical Route Resolver',
  'Search Intent Contract',
  'Internal Link Engine',
  'Hreflang Projection',
  'Sitemap Eligibility Gate',
  'Page Payload Projection',
  'Shared Card View Model',
  'First Indexable Batch',
  'Imported Hospital Controlled Release',
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
  'A doctor has one canonical doctor profile.',
  'same exact area',
  'coordinate distance',
  'No component, card, search result, sitemap builder, or schema builder may construct provider URLs directly.',
  'provider_name',
  'service_near_area',
  'pet_service_near_area',
  'beauty_service_near_area',
  'target must have canonical path',
  'imported hospital held entities must not be linked as public targets',
  'doctor_profile: max 18',
  'center_or_hospital_profile: max 22',
  'geo_page: max 30',
  'if canonical is null, hreflang is null',
  'minimumInternalLinks passed',
  'getProviderProfilePayload()',
  'getGeoPagePayload()',
  'getSpecialtyGeoPagePayload()',
  'card does not build URLs',
  'card does not decide relations',
  'LCP < 2s',
  'public JS < 120KB',
  "'use client' on public layout",
  "'use client' on public profile",
  "'use client' on provider card grid",
  'Muscat main pages',
  'Do not publish all imported providers at once.',
  '830 lock hospital blockers',
  '831 canonical resolver',
  '839 hreflang projection',
  '840 sitemap requires internal links',
  '845 performance/client boundary guard',
  '857 first indexable batch',
  '858+ imported hospital controlled release',
  'Current next action: start at PR 830.',
  'imported hospital detail/discovery/sitemap',
  'fail-closed',
  'projection-first',
  'route-last',
  'cards-after-payload',
];

const forbiddenPhrases = [
  'publish all imported providers at once',
  'cards before payload',
  'route-first',
  'public-route-first',
  'hospital release before internal links',
];

if (!existsSync(roadmapPath)) {
  console.error('Missing DrKhaleej SEO/Geo roadmap document.');
  process.exit(1);
}

const source = readFileSync(roadmapPath, 'utf8');
const missing = requiredPhrases.filter((phrase) => !source.includes(phrase));

if (missing.length > 0) {
  console.error('SEO/Geo roadmap is missing required roadmap phrases:');
  for (const phrase of missing) {
    console.error(`- ${phrase}`);
  }
  process.exit(1);
}

for (const phrase of forbiddenPhrases) {
  if (source.includes(phrase)) {
    console.error(`SEO/Geo roadmap contains forbidden phrase: ${phrase}`);
    process.exit(1);
  }
}

console.log('SEO/Geo roadmap 2026 validation passed.');
