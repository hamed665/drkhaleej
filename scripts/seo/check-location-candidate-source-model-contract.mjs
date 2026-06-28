import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const contractPath = 'src/config/geo/location-candidate-source-model-contract.ts';
const packagePath = 'package.json';

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

function read(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8');
}

function requireTokens(label, source, tokens) {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    console.error(`${label} is missing required source model tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

function forbidTokens(label, source, tokens) {
  const forbidden = tokens.filter((token) => source.includes(token));
  if (forbidden.length > 0) {
    console.error(`${label} contains forbidden source model tokens:`);
    for (const token of forbidden) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

const contract = read(contractPath);
const packageJson = read(packagePath);

requireTokens(contractPath, contract, [
  'OMAN_LOCATION_CANDIDATE_SOURCE_MODEL_CONTRACT_VERSION',
  'OmanLocationCandidateSourceModelRule',
  'OmanLocationCandidateSourceModelPolicy',
  "status: 'contract-only'",
  'provider-count',
  'verified-provider-count',
  'evidence-count',
  'sourceRefsRequired: true',
  'reviewerRequired: true',
  'lastReviewedAtRequired: true',
  'runtimeCollectionAllowed: false',
  'databaseAccessAllowed: false',
  'importAllowed: false',
  'routeCreationAllowed: false',
  'sitemapAllowed: false',
  'jsonLdAllowed: false',
  'indexPromotionAllowed: false',
]);

for (const [entityToken, dimensionToken] of expectedPairs) {
  requireTokens(contractPath, contract, [entityToken, dimensionToken]);
}

forbidTokens(contractPath, contract, [
  "status: 'ready-for-audit'",
  "status: 'active'",
  'runtimeCollectionAllowed: true',
  'databaseAccessAllowed: true',
  'importAllowed: true',
  'routeCreationAllowed: true',
  'sitemapAllowed: true',
  'jsonLdAllowed: true',
  'indexPromotionAllowed: true',
]);

requireTokens(packagePath, packageJson, [
  'seo:location-candidate-source-model:validate',
  'check-location-candidate-source-model-contract.mjs',
]);

console.log('Location candidate source model contract validation passed.');
