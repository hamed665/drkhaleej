import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();

const files = {
  routeContract: 'src/config/geo/route-contract.ts',
  contractDoc: 'docs/DRKHALEEJ_CANONICAL_URL_GEO_CONTRACT_V2.md',
  packageJson: 'package.json',
};

const legacyRouteFiles = [
  'src/app/[locale]/[country]/oman/governorates/[governorateSlug]/page.tsx',
  'src/app/[locale]/[country]/oman/wilayats/[wilayatSlug]/page.tsx',
  'src/app/[locale]/[country]/oman/areas/[areaSlug]/page.tsx',
];

function read(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8');
}

function assertIncludes(label, source, token) {
  if (!source.includes(token)) {
    throw new Error(`${label} must include: ${token}`);
  }
}

function assertNotIncludes(label, source, token) {
  if (source.includes(token)) {
    throw new Error(`${label} must not include: ${token}`);
  }
}

const routeContract = read(files.routeContract);
const contractDoc = read(files.contractDoc);
const packageJson = read(files.packageJson);

assertIncludes(files.routeContract, routeContract, "status: 'metadata-noindex'");
assertIncludes(files.routeContract, routeContract, 'runtimeRoutesEnabled: true');
assertIncludes(files.routeContract, routeContract, 'noindexEnabled: true');
assertIncludes(files.routeContract, routeContract, 'sitemapEnabled: false');
assertIncludes(files.routeContract, routeContract, 'jsonLdEnabled: false');
assertIncludes(files.routeContract, routeContract, 'No geo page is indexable yet.');
assertIncludes(files.routeContract, routeContract, 'compatibilityOnly: true');
assertIncludes(files.routeContract, routeContract, 'indexableCanonical: false');
assertIncludes(files.routeContract, routeContract, "canonicalReplacementFamily: '/[locale]/[country]/locations/...'");
assertIncludes(files.routeContract, routeContract, "canonicalReplacementPathTemplate: '/[locale]/[country]/locations/[governorateSlug]'");
assertIncludes(files.routeContract, routeContract, "canonicalReplacementPathTemplate: '/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]'");
assertIncludes(files.routeContract, routeContract, "canonicalReplacementPathTemplate: '/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]/[areaSlug]'");
assertIncludes(files.routeContract, routeContract, '/[locale]/[country]/oman/areas/[areaSlug]');
assertIncludes(files.routeContract, routeContract, 'Legacy Oman geo routes are compatibility-only and must not become indexable canonical pages.');

assertIncludes(files.contractDoc, contractDoc, '/{locale}/{country}/locations/{governorateSlug}/{wilayatSlug}/{areaSlug}');
assertIncludes(files.contractDoc, contractDoc, '`/areas/{areaSlug}` is not allowed as an indexable canonical route because area slugs are not globally unique.');
assertIncludes(files.contractDoc, contractDoc, '`/areas/{governorateSlug}/{wilayatSlug}/{areaSlug}` is not a DrKhaleej canonical route family.');
assertIncludes(files.contractDoc, contractDoc, 'parentless area URLs');

assertIncludes(files.packageJson, packageJson, 'seo:legacy-geo-compat:validate');
assertIncludes(files.packageJson, packageJson, 'check-legacy-geo-route-compatibility.mjs');

for (const routeFile of legacyRouteFiles) {
  const source = read(routeFile);
  assertIncludes(routeFile, source, 'generateMetadata');
  assertIncludes(routeFile, source, 'notFound');
  assertIncludes(routeFile, source, 'buildOmanGeoGatedMetadata');
  assertNotIncludes(routeFile, source, 'generateStaticParams');
  assertNotIncludes(routeFile, source, 'sitemap');
  assertNotIncludes(routeFile, source, 'jsonLd');
  assertNotIncludes(routeFile, source, 'application/ld+json');
}

console.log('Legacy Oman geo route compatibility guard validation passed.');
