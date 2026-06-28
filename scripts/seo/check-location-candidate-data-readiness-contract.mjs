import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const contractPath = 'src/config/geo/location-candidate-data-readiness-contract.ts';
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
    console.error(`${label} is missing required data-readiness tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

function forbidTokens(label, source, tokens) {
  const forbidden = tokens.filter((token) => source.includes(token));
  if (forbidden.length > 0) {
    console.error(`${label} contains forbidden data-readiness tokens:`);
    for (const token of forbidden) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

const contract = read(contractPath);
const packageJson = read(packagePath);

requireTokens(contractPath, contract, [
  'OMAN_LOCATION_CANDIDATE_DATA_READINESS_CONTRACT_VERSION',
  'OmanLocationCandidateDataReadinessRequirement',
  'OmanLocationCandidateDataReadinessPolicy',
  "status: 'contract-only'",
  'provider-count-source',
  'verified-provider-source',
  'evidence-count-source',
  'source-reference-model',
  'human-review-model',
  'currentlyAvailable: false',
  'runtimeAccessAllowed: false',
  'dataImportAllowedByDefault: false',
  'runtimeGenerationAllowedByDefault: false',
  'databaseAccessAllowed: false',
  'routeCreationAllowed: false',
  'sitemapAllowed: false',
  'jsonLdAllowed: false',
  'indexPromotionAllowed: false',
  'internalSeoLinksAllowed: false',
]);

for (const [entityToken, dimensionToken] of expectedPairs) {
  requireTokens(contractPath, contract, [entityToken, dimensionToken, 'dataImportAllowed: false']);
}

forbidTokens(contractPath, contract, [
  'currentlyAvailable: true',
  'runtimeAccessAllowed: true',
  'dataImportAllowed: true',
  'runtimeGenerationAllowed: true',
  'dataImportAllowedByDefault: true',
  'runtimeGenerationAllowedByDefault: true',
  'databaseAccessAllowed: true',
  'routeCreationAllowed: true',
  'sitemapAllowed: true',
  'jsonLdAllowed: true',
  'indexPromotionAllowed: true',
  'internalSeoLinksAllowed: true',
]);

requireTokens(packagePath, packageJson, [
  'seo:location-candidate-data-readiness:validate',
  'check-location-candidate-data-readiness-contract.mjs',
]);

console.log('Location candidate data-readiness contract validation passed.');
