import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();

const files = {
  builder: 'src/config/geo/oman-location-candidate-paths.ts',
  tests: 'src/config/geo/oman-location-candidate-paths.test.ts',
  thresholdPolicy: 'src/config/geo/location-threshold-policy.ts',
  candidateGate: 'scripts/seo/check-location-category-candidate-gate.mjs',
  packageJson: 'package.json',
};

function read(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8');
}

function requireTokens(label, source, tokens) {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    console.error(`${label} is missing required candidate path builder tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

function forbidTokens(label, source, tokens) {
  const forbidden = tokens.filter((token) => source.includes(token));
  if (forbidden.length > 0) {
    console.error(`${label} contains forbidden candidate path builder tokens:`);
    for (const token of forbidden) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

const builder = read(files.builder);
const tests = read(files.tests);
const thresholdPolicy = read(files.thresholdPolicy);
const candidateGate = read(files.candidateGate);
const packageJson = read(files.packageJson);

requireTokens(files.builder, builder, [
  'OmanLocationCandidateDimension',
  'dimensionPathSegment',
  "category: 'categories'",
  "service: 'services'",
  "specialty: 'specialties'",
  'buildOmanLocationCandidatePath',
  'buildOmanGovernorateLocationCandidatePath',
  'buildOmanWilayatLocationCandidatePath',
  'buildOmanAreaLocationCandidatePath',
  'assertCanonicalSlug',
  'governorateSlug',
  'wilayatSlug',
  'areaSlug',
  'dimensionSlug',
]);

requireTokens(files.tests, tests, [
  '/en/om/locations/muscat/categories/pharmacies',
  '/ar/om/locations/muscat/al-seeb/services/ivf',
  '/en/om/locations/muscat/bawshar/al-khuwair/specialties/dermatology',
  'wilayatSlug must be a lowercase kebab-case canonical slug.',
  'dimensionSlug must be a lowercase kebab-case canonical slug.',
  'areaSlug must be a lowercase kebab-case canonical slug.',
]);

requireTokens(files.thresholdPolicy, thresholdPolicy, [
  "'category' | 'service' | 'specialty'",
  'defaultCandidatePromotionAllowed: false',
  'defaultSitemapAllowed: false',
  'defaultJsonLdAllowed: false',
]);

requireTokens(files.candidateGate, candidateGate, [
  'forbiddenCompositeRouteFiles',
  '[categorySlug]',
  '[serviceSlug]',
  '[specialtySlug]',
]);

forbidTokens(files.builder, builder, [
  'generateStaticParams',
  'sitemap',
  'jsonLd',
  'application/ld+json',
  'database',
]);

requireTokens(files.packageJson, packageJson, [
  'seo:location-candidate-paths:validate',
  'check-location-candidate-path-builder.mjs',
]);

console.log('Location candidate path builder validation passed.');
