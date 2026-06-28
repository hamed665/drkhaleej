import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();

const files = {
  contractDoc: 'docs/DRKHALEEJ_CANONICAL_URL_GEO_CONTRACT_V2.md',
  routeContract: 'src/config/geo/route-contract.ts',
  governorateRoute: 'src/app/[locale]/[country]/locations/[governorateSlug]/page.tsx',
  wilayatRoute: 'src/app/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]/page.tsx',
  areaRoute: 'src/app/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]/[areaSlug]/page.tsx',
  packageJson: 'package.json',
};

function read(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8');
}

function requireTokens(label, source, tokens) {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    console.error(`${label} is missing required breadcrumb contract tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

function forbidTokens(label, source, tokens) {
  const forbidden = tokens.filter((token) => source.includes(token));
  if (forbidden.length > 0) {
    console.error(`${label} contains forbidden breadcrumb/indexing tokens:`);
    for (const token of forbidden) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

const contractDoc = read(files.contractDoc);
const routeContract = read(files.routeContract);
const governorateRoute = read(files.governorateRoute);
const wilayatRoute = read(files.wilayatRoute);
const areaRoute = read(files.areaRoute);
const packageJson = read(files.packageJson);

requireTokens(files.contractDoc, contractDoc, [
  'Breadcrumb contract',
  'Breadcrumbs must use the canonical hierarchy for the current page family.',
  'Home → Oman → Muscat Governorate → Bawshar → Al Khuwair → Clinics → Clinic Name',
  'Breadcrumb JSON-LD must only represent visible breadcrumb content.',
  'canonical breadcrumb must remain singular',
  'parent-aware location paths',
]);

requireTokens(files.routeContract, routeContract, [
  "routeName: 'location-governorate'",
  "routeName: 'location-wilayat'",
  "routeName: 'location-area'",
  "pathTemplate: '/[locale]/[country]/locations/[governorateSlug]'",
  "pathTemplate: '/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]'",
  "pathTemplate: '/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]/[areaSlug]'",
  'indexableCanonical: false',
  'sitemapEnabled: false',
  'jsonLdEnabled: false',
]);

requireTokens(files.governorateRoute, governorateRoute, [
  'buildOmanGovernorateLocationPath',
  'governorateSlug: governorate.slug',
  "entity: 'governorate'",
  'buildOmanGeoGatedMetadata',
]);

requireTokens(files.wilayatRoute, wilayatRoute, [
  'buildOmanWilayatLocationPath',
  'function resolveWilayat',
  'item.slug === wilayatSlug && item.governorateSlug === governorateSlug',
  'getParentLabel',
  'parentLabel',
  "entity: 'wilayat'",
]);

requireTokens(files.areaRoute, areaRoute, [
  'buildOmanAreaLocationPath',
  'function resolveArea',
  'item.slug === areaSlug && item.governorateSlug === governorateSlug && item.wilayatSlug === wilayatSlug',
  'buildParentLabel',
  'parentLabel',
  "entity: 'area'",
]);

for (const [label, source] of [
  [files.governorateRoute, governorateRoute],
  [files.wilayatRoute, wilayatRoute],
  [files.areaRoute, areaRoute],
]) {
  forbidTokens(label, source, [
    'BreadcrumbList',
    'application/ld+json',
    'jsonLd',
    'generateStaticParams',
    'sitemap',
  ]);
}

requireTokens(files.packageJson, packageJson, [
  'seo:location-breadcrumb:validate',
  'check-location-breadcrumb-contract.mjs',
]);

console.log('Location breadcrumb contract validation passed.');
