import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();

const files = {
  contract: 'src/config/geo/route-contract.ts',
  governorateRoute: 'src/app/[locale]/[country]/locations/[governorateSlug]/page.tsx',
  wilayatRoute: 'src/app/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]/page.tsx',
  areaRoute: 'src/app/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]/[areaSlug]/page.tsx',
  geoMetadata: 'src/lib/seo/geo-route-metadata.ts',
  packageJson: 'package.json',
};

function read(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8');
}

function requireTokens(label, source, tokens) {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    console.error(`${label} is missing required metadata consistency tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

function forbidTokens(label, source, tokens) {
  const forbidden = tokens.filter((token) => source.includes(token));
  if (forbidden.length > 0) {
    console.error(`${label} contains forbidden metadata/indexing tokens:`);
    for (const token of forbidden) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

const contract = read(files.contract);
const governorateRoute = read(files.governorateRoute);
const wilayatRoute = read(files.wilayatRoute);
const areaRoute = read(files.areaRoute);
const geoMetadata = read(files.geoMetadata);
const packageJson = read(files.packageJson);

requireTokens(files.contract, contract, [
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
  "entity: 'governorate'",
  'pathname: buildOmanGovernorateLocationPath',
  'governorateSlug: governorate.slug',
  'buildOmanGeoGatedMetadata',
  'getOmanGeoReadiness',
  'getOmanGeoPublicationGates',
  'notFound',
]);

requireTokens(files.wilayatRoute, wilayatRoute, [
  'buildOmanWilayatLocationPath',
  'function resolveWilayat',
  'item.slug === wilayatSlug && item.governorateSlug === governorateSlug',
  "entity: 'wilayat'",
  'pathname: buildOmanWilayatLocationPath',
  'governorateSlug,',
  'wilayatSlug: wilayat.slug',
  'parentLabel',
  'buildOmanGeoGatedMetadata',
  'notFound',
]);

requireTokens(files.areaRoute, areaRoute, [
  'buildOmanAreaLocationPath',
  'function resolveArea',
  'item.slug === areaSlug && item.governorateSlug === governorateSlug && item.wilayatSlug === wilayatSlug',
  "entity: 'area'",
  'pathname: buildOmanAreaLocationPath',
  'governorateSlug,',
  'wilayatSlug,',
  'areaSlug: area.slug',
  'buildParentLabel',
  'parentLabel',
  'buildOmanGeoGatedMetadata',
  'notFound',
]);

for (const [label, source] of [
  [files.governorateRoute, governorateRoute],
  [files.wilayatRoute, wilayatRoute],
  [files.areaRoute, areaRoute],
]) {
  forbidTokens(label, source, [
    'generateStaticParams',
    'sitemap',
    'jsonLd',
    'application/ld+json',
    'DrMuscat',
  ]);
}

requireTokens(files.geoMetadata, geoMetadata, [
  'DrKhaleej',
  'index: false',
  'follow: true',
]);
forbidTokens(files.geoMetadata, geoMetadata, ['DrMuscat']);

requireTokens(files.packageJson, packageJson, [
  'seo:location-metadata:validate',
  'check-location-route-metadata-consistency.mjs',
]);

console.log('Location route metadata consistency validation passed.');
