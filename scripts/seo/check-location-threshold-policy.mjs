import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();

const files = {
  thresholdPolicy: 'src/config/geo/location-threshold-policy.ts',
  providerInventoryContract: 'src/config/geo/provider-inventory-contract.ts',
  evidenceRegistryContract: 'src/config/geo/evidence-registry-contract.ts',
  indexPromotionPolicy: 'src/config/geo/index-promotion-policy.ts',
  candidateGate: 'scripts/seo/check-location-category-candidate-gate.mjs',
  packageJson: 'package.json',
};

const expectedPolicyPairs = [
  ["entity: 'governorate'", "dimension: 'category'"],
  ["entity: 'governorate'", "dimension: 'service'"],
  ["entity: 'governorate'", "dimension: 'specialty'"],
  ["entity: 'wilayat'", "dimension: 'category'"],
  ["entity: 'wilayat'", "dimension: 'service'"],
  ["entity: 'wilayat'", "dimension: 'specialty'"],
  ["entity: 'area'", "dimension: 'category'"],
  ["entity: 'area'", "dimension: 'service'"],
  ["entity: 'area'", "dimension: 'specialty'"],
];

function read(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8');
}

function requireTokens(label, source, tokens) {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    console.error(`${label} is missing required threshold policy tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

function forbidTokens(label, source, tokens) {
  const forbidden = tokens.filter((token) => source.includes(token));
  if (forbidden.length > 0) {
    console.error(`${label} contains forbidden threshold policy tokens:`);
    for (const token of forbidden) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

const thresholdPolicy = read(files.thresholdPolicy);
const providerInventoryContract = read(files.providerInventoryContract);
const evidenceRegistryContract = read(files.evidenceRegistryContract);
const indexPromotionPolicy = read(files.indexPromotionPolicy);
const candidateGate = read(files.candidateGate);
const packageJson = read(files.packageJson);

requireTokens(files.thresholdPolicy, thresholdPolicy, [
  'OMAN_LOCATION_THRESHOLD_POLICY_VERSION',
  "status: 'contract-only'",
  'minimumPublishedProviders',
  'minimumVerifiedProviders',
  'minimumApprovedEvidenceEntries',
  'minimumEditorialWords',
  'defaultNoindexRequired: true',
  'defaultSitemapAllowed: false',
  'defaultJsonLdAllowed: false',
  'defaultInternalSeoLinksAllowed: false',
  'defaultCandidatePromotionAllowed: false',
  'promotionRequiresParentHierarchy: true',
  'promotionRequiresProviderThreshold: true',
  'promotionRequiresApprovedEvidence: true',
  'promotionRequiresReadinessGates: true',
  'promotionRequiresHumanReview: true',
  'promotionRequiresApprovedPr: true',
  'No location-category candidate engine is added by this contract.',
  'No composite location route is added by this contract.',
  'No public index promotion is allowed by this contract.',
]);

for (const [entityToken, dimensionToken] of expectedPolicyPairs) {
  requireTokens(files.thresholdPolicy, thresholdPolicy, [entityToken, dimensionToken]);
}

requireTokens(files.thresholdPolicy, thresholdPolicy, [
  'minimumPublishedProviders: 8',
  'minimumPublishedProviders: 6',
  'minimumPublishedProviders: 5',
  'minimumPublishedProviders: 3',
  'minimumEditorialWords: 120',
  'minimumEditorialWords: 90',
  'minimumEditorialWords: 70',
]);

forbidTokens(files.thresholdPolicy, thresholdPolicy, [
  'candidatePromotionAllowed: true',
  'internalSeoLinksAllowed: true',
  'sitemapAllowed: true',
  'jsonLdAllowed: true',
  'defaultCandidatePromotionAllowed: true',
  'defaultInternalSeoLinksAllowed: true',
  'defaultSitemapAllowed: true',
  'defaultJsonLdAllowed: true',
]);

requireTokens(files.providerInventoryContract, providerInventoryContract, [
  'minimumPublishedProviders',
  'publishedProviderCount: 0',
  'verifiedProviderCount: 0',
  'providerQueryAllowed: false',
  'databaseAccessAllowed: false',
  'indexPromotionAllowed: false',
]);

requireTokens(files.evidenceRegistryContract, evidenceRegistryContract, [
  'minimumApprovedEvidenceEntries',
  'approvedEvidenceEntries: 0',
  'registryEnabled: false',
  'promotionAllowed: false',
  'indexPromotionAllowed: false',
]);

requireTokens(files.indexPromotionPolicy, indexPromotionPolicy, [
  "defaultStatus: 'blocked-until-content-ready'",
  'noindexRequiredByDefault: true',
  'sitemapAllowedByDefault: false',
  'jsonLdAllowedByDefault: false',
]);

requireTokens(files.candidateGate, candidateGate, [
  'forbiddenCompositeRouteFiles',
  'minimumPublishedProviders',
  'minimumApprovedEvidenceEntries',
  'registryEnabled: false',
  'promotionAllowed: false',
]);

requireTokens(files.packageJson, packageJson, [
  'seo:location-thresholds:validate',
  'check-location-threshold-policy.mjs',
]);

console.log('Location threshold policy validation passed.');
