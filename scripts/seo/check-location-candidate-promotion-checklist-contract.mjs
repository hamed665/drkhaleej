import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();

const files = {
  checklistContract: 'src/config/geo/location-candidate-promotion-checklist-contract.ts',
  packageJson: 'package.json',
};

const expectedPairs = [
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

const checklistKeys = [
  'canonical-parent-hierarchy',
  'candidate-path',
  'threshold-policy',
  'provider-counts',
  'approved-evidence',
  'source-refs',
  'readiness-gates',
  'human-review',
  'promotion-pr',
  'blocked-reasons',
  'noindex-default',
  'sitemap-disabled',
  'jsonld-disabled',
  'internal-links-disabled',
];

function read(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8');
}

function requireTokens(label, source, tokens) {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    console.error(`${label} is missing required promotion checklist tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

function forbidTokens(label, source, tokens) {
  const forbidden = tokens.filter((token) => source.includes(token));
  if (forbidden.length > 0) {
    console.error(`${label} contains forbidden promotion checklist tokens:`);
    for (const token of forbidden) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

const checklistContract = read(files.checklistContract);
const packageJson = read(files.packageJson);

requireTokens(files.checklistContract, checklistContract, [
  'OMAN_LOCATION_CANDIDATE_PROMOTION_CHECKLIST_CONTRACT_VERSION',
  'OmanLocationCandidatePromotionChecklistItem',
  'OmanLocationCandidatePromotionChecklistPolicy',
  "status: 'contract-only'",
  'promotionAllowedByDefault: false',
  'reviewAllowedByDefault: false',
  'noindexRequiredByDefault: true',
  'sitemapAllowedByDefault: false',
  'jsonLdAllowedByDefault: false',
  'internalLinksAllowedByDefault: false',
  'databaseAccessAllowed: false',
  'routeCreationAllowed: false',
  'runtimePromotionAllowed: false',
  'No candidate promotion is enabled by this contract.',
  'No candidate review workflow is enabled by this contract.',
]);

for (const key of checklistKeys) {
  requireTokens(files.checklistContract, checklistContract, [key]);
}

for (const [entityToken, dimensionToken] of expectedPairs) {
  requireTokens(files.checklistContract, checklistContract, [entityToken, dimensionToken]);
}

forbidTokens(files.checklistContract, checklistContract, [
  'currentlySatisfied: true',
  'promotionAllowed: true',
  'promotionAllowedByDefault: true',
  'reviewAllowedByDefault: true',
  'sitemapAllowedByDefault: true',
  'jsonLdAllowedByDefault: true',
  'internalLinksAllowedByDefault: true',
  'databaseAccessAllowed: true',
  'routeCreationAllowed: true',
  'runtimePromotionAllowed: true',
]);

requireTokens(files.packageJson, packageJson, [
  'seo:location-candidate-promotion-checklist:validate',
  'check-location-candidate-promotion-checklist-contract.mjs',
]);

console.log('Location candidate promotion checklist contract validation passed.');
