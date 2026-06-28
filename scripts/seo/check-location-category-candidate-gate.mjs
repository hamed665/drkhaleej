import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();

const files = {
  pageRegistry: 'src/lib/seo/page-registry.ts',
  routeContract: 'src/config/geo/route-contract.ts',
  readiness: 'src/lib/geo/oman-readiness.ts',
  publicationGates: 'src/lib/geo/oman-publication-gates.ts',
  indexPromotionPolicy: 'src/config/geo/index-promotion-policy.ts',
  providerInventoryContract: 'src/config/geo/provider-inventory-contract.ts',
  evidenceRegistryContract: 'src/config/geo/evidence-registry-contract.ts',
  packageJson: 'package.json',
};

const forbiddenCompositeRouteFiles = [
  'src/app/[locale]/[country]/locations/[governorateSlug]/[categorySlug]/page.tsx',
  'src/app/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]/[categorySlug]/page.tsx',
  'src/app/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]/[areaSlug]/[categorySlug]/page.tsx',
  'src/app/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]/[areaSlug]/services/[serviceSlug]/page.tsx',
  'src/app/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]/[areaSlug]/specialties/[specialtySlug]/page.tsx',
];

function read(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8');
}

function requireTokens(label, source, tokens) {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    console.error(`${label} is missing required location-category candidate gate tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

function forbidTokens(label, source, tokens) {
  const forbidden = tokens.filter((token) => source.includes(token));
  if (forbidden.length > 0) {
    console.error(`${label} contains forbidden location-category candidate tokens:`);
    for (const token of forbidden) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

for (const routeFile of forbiddenCompositeRouteFiles) {
  if (existsSync(resolve(projectRoot, routeFile))) {
    console.error(`Location-category candidate route must not exist before the candidate engine gate is implemented: ${routeFile}`);
    process.exit(1);
  }
}

const pageRegistry = read(files.pageRegistry);
const routeContract = read(files.routeContract);
const readiness = read(files.readiness);
const publicationGates = read(files.publicationGates);
const indexPromotionPolicy = read(files.indexPromotionPolicy);
const providerInventoryContract = read(files.providerInventoryContract);
const evidenceRegistryContract = read(files.evidenceRegistryContract);
const packageJson = read(files.packageJson);

requireTokens(files.pageRegistry, pageRegistry, [
  "pathname: '/doctors'",
  "pathname: '/pharmacies'",
  "pathname: '/hospitals'",
  "pathname: '/labs'",
  "pathname: '/centers'",
  'isSitemapReadySeoPageDefinition',
  "page.indexPolicy === 'index'",
  "page.readiness === 'ready'",
  'page.sitemapEligible',
]);

forbidTokens(files.pageRegistry, pageRegistry, [
  '/locations/',
  'location_category',
  'location-category',
]);

requireTokens(files.routeContract, routeContract, [
  "routeName: 'location-governorate'",
  "routeName: 'location-wilayat'",
  "routeName: 'location-area'",
  'indexableCanonical: false',
  'sitemapEnabled: false',
  'jsonLdEnabled: false',
  'Location route scaffolds are noindex-first and must not become indexable until page readiness gates pass.',
]);

requireTokens(files.indexPromotionPolicy, indexPromotionPolicy, [
  "defaultStatus: 'blocked-until-content-ready'",
  'noindexRequiredByDefault: true',
  'sitemapAllowedByDefault: false',
  'jsonLdAllowedByDefault: false',
  'promotionRequiresApprovedPr: true',
  'minimumPublishedProviders',
  'minimumEditorialWords',
  'No geo route is indexable in the current scaffold phase.',
  'Index promotion must happen in a separate approved PR after content and listing readiness is proven.',
]);

requireTokens(files.providerInventoryContract, providerInventoryContract, [
  'minimumPublishedProviders',
  'publishedProviderCount: 0',
  'verifiedProviderCount: 0',
  'requiresPublishedProviderProfiles: true',
  'requiresHumanReview: true',
  'providerQueryAllowed: false',
  'databaseAccessAllowed: false',
  'indexPromotionAllowed: false',
  'sitemapPromotionAllowed: false',
  'promotionRequiresRuntimeEvidence: true',
]);

requireTokens(files.evidenceRegistryContract, evidenceRegistryContract, [
  'minimumApprovedEvidenceEntries',
  'approvedEvidenceEntries: 0',
  'registryEnabled: false',
  'requiredEvidenceKinds',
  "'provider-inventory'",
  "'editorial-content'",
  "'qa-evidence'",
  "'promotion-review'",
  'promotionAllowed: false',
  'noindexRemovalAllowed: false',
  'sitemapPromotionAllowed: false',
  'jsonLdAllowed: false',
  'indexPromotionAllowed: false',
]);

requireTokens(files.readiness, readiness, [
  'const readyForPromotionReview = false;',
  'provider-inventory-not-ready',
  'editorial-content-not-ready',
  'qa-evidence-not-ready',
  'index-promotion-eligibility-not-ready',
  'promotion-review-approval-missing',
  'indexPromotionAllowed: false',
  'sitemapPromotionAllowed: false',
  'jsonLdAllowed: false',
]);

requireTokens(files.publicationGates, publicationGates, [
  'technicalGateEnabled = false',
  'technical-publication-gate-disabled',
  'reviewApproved',
  'evidenceApproved',
  'readinessComplete',
  'indexPromotionAllowed: false',
  'sitemapPromotionAllowed: false',
  'jsonLdAllowed: false',
]);

forbidTokens(files.routeContract, routeContract, [
  'locationCategoryCandidatesEnabled: true',
  'categoryLocationRoutesEnabled: true',
  'locationCategorySitemapEnabled: true',
]);

forbidTokens(files.readiness, readiness, [
  'readyForPromotionReview: true',
  'indexPromotionAllowed: true',
  'sitemapPromotionAllowed: true',
  'jsonLdAllowed: true',
]);

forbidTokens(files.publicationGates, publicationGates, [
  'technicalGateEnabled = true',
  'indexPromotionAllowed: true',
  'sitemapPromotionAllowed: true',
  'jsonLdAllowed: true',
]);

requireTokens(files.packageJson, packageJson, [
  'seo:location-category-candidates:validate',
  'check-location-category-candidate-gate.mjs',
]);

console.log('Location-category candidate gate validation passed.');
