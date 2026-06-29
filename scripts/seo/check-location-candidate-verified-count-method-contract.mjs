import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const contractPath = 'src/config/geo/location-candidate-verified-count-method-contract.ts';
const packagePath = 'package.json';

function read(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8');
}

function requireTokens(label, source, tokens) {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    console.error(`${label} is missing required verified count method tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

function forbidTokens(label, source, tokens) {
  const forbidden = tokens.filter((token) => source.includes(token));
  if (forbidden.length > 0) {
    console.error(`${label} contains forbidden verified count method tokens:`);
    for (const token of forbidden) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

const contract = read(contractPath);
const packageJson = read(packagePath);

requireTokens(contractPath, contract, [
  'OMAN_LOCATION_CANDIDATE_VERIFIED_COUNT_METHOD_CONTRACT_VERSION',
  'OmanLocationCandidateVerifiedCountMethod',
  "status: 'contract-only'",
  "scope: 'verified-provider-count'",
  'definition:',
  'minimumIndependentSourcesRequired: 2',
  'sourceRefsRequired: true',
  'reviewerRequired: true',
  'reviewedAtRequired: true',
  'conflictNoteRequired: true',
  'staleSourceReviewRequired: true',
  'runtimeCountingAllowed: false',
  'databaseAccessAllowed: false',
  'importAllowed: false',
  'routeCreationAllowed: false',
  'sitemapAllowed: false',
  'jsonLdAllowed: false',
  'indexPromotionAllowed: false',
  'internalSeoLinksAllowed: false',
]);

forbidTokens(contractPath, contract, [
  "status: 'ready-for-audit'",
  "status: 'active'",
  'runtimeCountingAllowed: true',
  'databaseAccessAllowed: true',
  'importAllowed: true',
  'routeCreationAllowed: true',
  'sitemapAllowed: true',
  'jsonLdAllowed: true',
  'indexPromotionAllowed: true',
  'internalSeoLinksAllowed: true',
]);

requireTokens(packagePath, packageJson, [
  'seo:location-candidate-verified-count-method:validate',
  'check-location-candidate-verified-count-method-contract.mjs',
]);

console.log('Location candidate verified count method contract validation passed.');
