import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const contractPath = resolve(projectRoot, 'docs/seo/internal-link-engine-contract.md');
const typesPath = resolve(projectRoot, 'src/lib/seo/internal-links/types.ts');
const budgetPath = resolve(projectRoot, 'src/lib/seo/internal-links/link-budget-policy.ts');
const roadmapPath = resolve(projectRoot, 'docs/seo/DRKHALEEJ_SEO_GEO_ROADMAP_2026_V1.md');
const blockerPath = resolve(projectRoot, 'docs/import/imported-hospital-release-blockers.md');

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
    console.error(`${label} is missing required internal link contract phrases:`);
    for (const phrase of missing) console.error(`- ${phrase}`);
    process.exit(1);
  }
}

const contractSource = readRequired(contractPath, 'internal link engine contract');
const typesSource = readRequired(typesPath, 'internal link types');
const budgetSource = readRequired(budgetPath, 'internal link budget policy');
const roadmapSource = readRequired(roadmapPath, 'SEO/Geo roadmap');
const blockerSource = readRequired(blockerPath, 'imported hospital release blockers');

const pageTypes = [
  'doctor_profile',
  'center_profile',
  'hospital_profile',
  'pharmacy_profile',
  'lab_profile',
  'imaging_profile',
  'dental_profile',
  'beauty_profile',
  'pet_profile',
  'charity_profile',
  'geo_page',
  'specialty_page',
  'service_page',
  'article_page',
];

const relationTypes = [
  'doctor_practices_at_facility',
  'facility_has_doctor',
  'facility_offers_service',
  'doctor_has_specialty',
  'provider_located_in_area',
  'provider_near_provider',
  'service_available_in_area',
  'specialty_available_in_area',
  'article_related_to_entity',
  'article_related_to_service',
  'article_related_to_area',
  'same_specialty_provider',
  'same_service_provider',
  'same_area_provider',
  'nearby_pharmacy',
  'nearby_lab',
  'nearby_imaging',
  'nearby_pet_service',
  'nearby_beauty_service',
  'nearby_dental_service',
];

requirePhrases('internal link engine contract', contractSource, [
  'Status: canonical internal link engine contract.',
  'candidate-first, budgeted, canonical-only, fail-closed',
  'source_page_type',
  'target_page_type',
  'relation_type',
  'anchor_en',
  'anchor_ar',
  'review_status',
  'canonical_path',
  'public_safe',
  'route_enabled',
  'target canonical exists',
  'target publicRouteEnabled = true',
  'review_status is approved or deterministic_approved',
  'canonical path comes from canonical route resolver',
  'link budget is not exceeded',
  'imported hospital release blocker is not violated',
  'doctor_profile: 18',
  'hospital_profile: 22',
  'geo_page: 30',
  'article_page: 16',
  'same exact area',
  'coordinate distance',
  'Imported hospitals must not be public internal link targets',
  'Sitemap eligibility must eventually require minimum internal link coverage.',
]);
requirePhrases('internal link engine contract', contractSource, pageTypes);
requirePhrases('internal link engine contract', contractSource, relationTypes);

requirePhrases('internal link types', typesSource, pageTypes.map((value) => `'${value}'`));
requirePhrases('internal link types', typesSource, relationTypes.map((value) => `'${value}'`));
requirePhrases('internal link types', typesSource, [
  'export type PublicInternalLinkCandidate',
  'export type PublicInternalLinkProjection',
  'export type PublicInternalLinkBudgetFamily',
  'export type PublicInternalLinkBudgetPolicy',
  'isProjectablePublicInternalLink',
  'candidate.canonicalPath',
  'candidate.publicSafe === true',
  'candidate.routeEnabled === true',
  "candidate.reviewStatus === 'approved'",
  "candidate.reviewStatus === 'deterministic_approved'",
  'candidate.sourceEntityId !== candidate.targetEntityId',
]);

requirePhrases('internal link budget policy', budgetSource, pageTypes.map((value) => `pageType: '${value}'`));
requirePhrases('internal link budget policy', budgetSource, [
  'maxTotal: 18',
  'maxTotal: 22',
  'maxTotal: 30',
  'maxTotal: 16',
  'primaryRelations',
  'nearby',
  'sameArea',
  'sameFamily',
  'getPublicInternalLinkBudgetPolicy',
]);

requirePhrases('SEO/Geo roadmap', roadmapSource, [
  'Internal Link Engine',
  'link budget',
  'imported hospital controlled release',
]);

requirePhrases('imported hospital release blockers', blockerSource, [
  'internal link coverage exists',
  'minimumInternalLinks passed',
  'Imported hospitals must not be public internal link targets',
]);

console.log('Internal link engine contract validation passed.');
