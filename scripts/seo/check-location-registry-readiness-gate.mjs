import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();

const files = {
  routeContract: 'src/config/geo/route-contract.ts',
  readiness: 'src/lib/geo/oman-readiness.ts',
  publicationGates: 'src/lib/geo/oman-publication-gates.ts',
  indexPromotionPolicy: 'src/config/geo/index-promotion-policy.ts',
  packageJson: 'package.json',
};

const requiredLocationRouteNames = [
  "routeName: 'location-governorate'",
  "routeName: 'location-wilayat'",
  "routeName: 'location-area'",
];

const requiredLocationPathTemplates = [
  "pathTemplate: '/[locale]/[country]/locations/[governorateSlug]'",
  "pathTemplate: '/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]'",
  "pathTemplate: '/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]/[areaSlug]'",
];

function read(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8');
}

function requireTokens(label, source, tokens) {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    console.error(`${label} is missing required registry/readiness tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

function forbidTokens(label, source, tokens) {
  const forbidden = tokens.filter((token) => source.includes(token));
  if (forbidden.length > 0) {
    console.error(`${label} contains forbidden registry/readiness tokens:`);
    for (const token of forbidden) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

const routeContract = read(files.routeContract);
const readiness = read(files.readiness);
const publicationGates = read(files.publicationGates);
const indexPromotionPolicy = read(files.indexPromotionPolicy);
const packageJson = read(files.packageJson);

requireTokens(files.routeContract, routeContract, [
  ...requiredLocationRouteNames,
  ...requiredLocationPathTemplates,
  'runtimeEnabled: true',
  'metadataEnabled: true',
  'noindexEnabled: true',
  'sitemapEnabled: false',
  'jsonLdEnabled: false',
  'indexableCanonical: false',
  'Location route scaffolds are noindex-first and must not become indexable until page readiness gates pass.',
]);

requireTokens(files.indexPromotionPolicy, indexPromotionPolicy, [
  "defaultStatus: 'blocked-until-content-ready'",
  'noindexRequiredByDefault: true',
  'sitemapAllowedByDefault: false',
  'jsonLdAllowedByDefault: false',
  'promotionRequiresApprovedPr: true',
  'No geo route is indexable in the current scaffold phase.',
  'Index promotion must happen in a separate approved PR after content and listing readiness is proven.',
]);

for (const entity of ['governorate', 'wilayat', 'area']) {
  requireTokens(files.indexPromotionPolicy, indexPromotionPolicy, [
    `entity: '${entity}'`,
    "status: 'blocked-until-content-ready'",
    'noindexRequired: true',
    'sitemapAllowed: false',
    'jsonLdAllowed: false',
  ]);
}

requireTokens(files.readiness, readiness, [
  'const readyForPromotionReview = false;',
  'readyForPromotionReview,',
  'noindexRemovalAllowed: false',
  'sitemapPromotionAllowed: false',
  'jsonLdAllowed: false',
  'indexPromotionAllowed: false',
  'provider-inventory-not-ready',
  'editorial-content-not-ready',
  'qa-evidence-not-ready',
  'index-promotion-eligibility-not-ready',
  'promotion-review-approval-missing',
]);

requireTokens(files.publicationGates, publicationGates, [
  'technicalGateEnabled = false',
  'technical-publication-gate-disabled',
  'noindexRemovalAllowed: false',
  'sitemapPromotionAllowed: false',
  'jsonLdAllowed: false',
  'indexPromotionAllowed: false',
]);

forbidTokens(files.readiness, readiness, [
  'readyForPromotionReview: true',
  'noindexRemovalAllowed: true',
  'sitemapPromotionAllowed: true',
  'jsonLdAllowed: true',
  'indexPromotionAllowed: true',
]);

forbidTokens(files.publicationGates, publicationGates, [
  'technicalGateEnabled = true',
  'noindexRemovalAllowed: true',
  'sitemapPromotionAllowed: true',
  'jsonLdAllowed: true',
  'indexPromotionAllowed: true',
]);

requireTokens(files.packageJson, packageJson, [
  'seo:location-registry-readiness:validate',
  'check-location-registry-readiness-gate.mjs',
]);

console.log('Location registry readiness gate validation passed.');
