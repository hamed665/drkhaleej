import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const adapterPath = resolve(projectRoot, 'src/lib/catalog/public-provider-import-adapter.ts');
const resolverPath = resolve(projectRoot, 'src/lib/catalog/public-provider-route-resolver.ts');

function readRequired(path, label) {
  if (!existsSync(path)) {
    console.error(`Missing ${label}: ${path}`);
    process.exit(1);
  }
  return readFileSync(path, 'utf8');
}

function requirePhrases(label, source, phrases) {
  const missing = phrases.filter((phrase) => !source.includes(phrase));
  if (missing.length > 0) {
    console.error(`${label} is missing canonical resolver integration phrases:`);
    for (const phrase of missing) console.error(`- ${phrase}`);
    process.exit(1);
  }
}

function forbidPhrases(label, source, phrases) {
  const found = phrases.filter((phrase) => source.includes(phrase));
  if (found.length > 0) {
    console.error(`${label} contains forbidden canonical resolver integration phrases:`);
    for (const phrase of found) console.error(`- ${phrase}`);
    process.exit(1);
  }
}

const adapterSource = readRequired(adapterPath, 'public provider import adapter');
const resolverSource = readRequired(resolverPath, 'public provider canonical resolver');

requirePhrases('public provider import adapter', adapterSource, [
  'resolvePublicProviderCanonicalRoute',
  'type PublicProviderRouteFamily',
  'ROUTE_FAMILY_BY_ENTITY',
  'doctor: "doctor"',
  'pharmacy: "pharmacy"',
  'hospital: "hospital"',
  'lab: "lab"',
  'radiology: "imaging_center"',
  'dentistry: "dental_clinic"',
  'beauty: "beauty_clinic"',
  'function localeFromPath',
  'const resolvedRoute = resolvePublicProviderCanonicalRoute({',
  'family: routeFamily,',
  'locale,',
  'country: "om"',
  'resolvedRoute.publicRouteEnabled',
  'resolvedRoute.canonicalPath === metadataCanonicalPath',
  'const publicDetailEligible = Boolean(',
  'routeMatchesResolver',
  'const publicDiscoveryEligible = Boolean(publicDetailEligible && routeMatchesResolver)',
]);

forbidPhrases('public provider import adapter', adapterSource, [
  'const routeMatchesFamily = canonicalPath.split("/").filter(Boolean).includes(family);',
  'const publicDiscoveryEligible = Boolean(publicDetailEligible && routeMatchesFamily);',
]);

requirePhrases('public provider canonical resolver', resolverSource, [
  'resolvePublicProviderCanonicalRoute',
  "family === 'doctor'",
  "family === 'center'",
  "reason: 'route_disabled'",
]);

console.log('Import adapter canonical resolver integration validation passed.');
