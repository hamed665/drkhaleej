import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const contractPath = resolve(projectRoot, 'docs/seo/public-provider-canonical-route-contract.md');
const resolverPath = resolve(projectRoot, 'src/lib/catalog/public-provider-route-resolver.ts');
const routePath = resolve(projectRoot, 'src/lib/routes/public.ts');

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
    console.error(`${label} is missing required canonical route phrases:`);
    for (const phrase of missing) console.error(`- ${phrase}`);
    process.exit(1);
  }
}

function forbidPhrases(label, source, phrases) {
  const found = phrases.filter((phrase) => source.includes(phrase));
  if (found.length > 0) {
    console.error(`${label} contains forbidden canonical route phrases:`);
    for (const phrase of found) console.error(`- ${phrase}`);
    process.exit(1);
  }
}

const contractSource = readRequired(contractPath, 'canonical route contract');
const resolverSource = readRequired(resolverPath, 'canonical route resolver');
const routeSource = readRequired(routePath, 'public route helpers');

requirePhrases('canonical route contract', contractSource, [
  'Status: canonical route resolver contract.',
  'resolver-first, route-last, fail-closed',
  'doctor',
  'center',
  'hospital',
  'pharmacy',
  'lab',
  'imaging_center',
  'beauty_clinic',
  'pet_clinic',
  'pet_shop',
  'doctor → /:locale/:country/doctor/:slug',
  'center → /:locale/:country/center/:slug',
  'publicRouteEnabled: boolean',
  'unsupported_family',
  'missing_slug',
  'route_disabled',
  'invalid_locale',
  'invalid_country',
  'Imported hospital routes remain blocked.',
  'This contract does not add or change:',
  'public routes',
  'sitemap output',
]);

requirePhrases('canonical route resolver', resolverSource, [
  'export const publicProviderRouteFamilies',
  'export type PublicProviderRouteFamily',
  'export type PublicProviderRouteReason',
  'export type PublicProviderCanonicalRouteResult',
  'export type PublicProviderCanonicalRouteInput',
  'resolvePublicProviderCanonicalRoute',
  'canonicalPath: string | null',
  'publicRouteEnabled: boolean',
  "reason: 'unsupported_family'",
  "reason: 'invalid_locale'",
  "reason: 'invalid_country'",
  "reason: 'missing_slug'",
  "reason: 'route_disabled'",
  "family === 'doctor'",
  "family === 'center'",
  'publicDoctorDetailRoute(input.locale, input.country, slug)',
  'publicCenterDetailRoute(input.locale, input.country, slug)',
  "'hospital'",
  "'pharmacy'",
  "'lab'",
  "'imaging_center'",
  "'beauty_clinic'",
  "'pet_clinic'",
  "'pet_shop'",
]);

forbidPhrases('canonical route resolver', resolverSource, [
  '/hospitals/${slug}',
  '/pharmacies/${slug}',
  '/labs/${slug}',
  '/imaging-centers/${slug}',
  '/beauty-clinics/${slug}',
  '/pet-clinics/${slug}',
  '/pet-shops/${slug}',
]);

requirePhrases('public route helpers', routeSource, [
  'publicDoctorDetailRoute',
  'publicCenterDetailRoute',
]);

console.log('Public provider canonical route contract validation passed.');
