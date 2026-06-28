import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();

const files = {
  runtimeAccessor: 'src/lib/geo/oman-location-candidate-data-readiness.ts',
  contract: 'src/config/geo/location-candidate-data-readiness-contract.ts',
  packageJson: 'package.json',
};

function read(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8');
}

function requireTokens(label, source, tokens) {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    console.error(`${label} is missing required data-readiness runtime tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

function forbidTokens(label, source, tokens) {
  const forbidden = tokens.filter((token) => source.includes(token));
  if (forbidden.length > 0) {
    console.error(`${label} contains forbidden data-readiness runtime tokens:`);
    for (const token of forbidden) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

const runtimeAccessor = read(files.runtimeAccessor);
const contract = read(files.contract);
const packageJson = read(files.packageJson);

requireTokens(files.runtimeAccessor, runtimeAccessor, [
  'getOmanLocationCandidateDataReadinessPolicy',
  'getOmanLocationCandidateDataReadinessState',
  'getOmanLocationCandidateDataReadinessRuntimeContract',
  "status: 'disabled'",
  'dataImportAllowed: false',
  'runtimeGenerationAllowed: false',
  'databaseAccessAllowed: false',
  'routeCreationAllowed: false',
  'sitemapAllowed: false',
  'jsonLdAllowed: false',
  'indexPromotionAllowed: false',
  'internalSeoLinksAllowed: false',
  'candidate-data-readiness-contract-only',
  'candidate-data-import-disabled',
  'candidate-data-runtime-generation-disabled',
  'candidate-data-readiness-runtime-disabled',
]);

requireTokens(files.contract, contract, [
  "status: 'contract-only'",
  'dataImportAllowedByDefault: false',
  'runtimeGenerationAllowedByDefault: false',
  'databaseAccessAllowed: false',
  'routeCreationAllowed: false',
  'sitemapAllowed: false',
  'jsonLdAllowed: false',
  'indexPromotionAllowed: false',
  'internalSeoLinksAllowed: false',
]);

forbidTokens(files.runtimeAccessor, runtimeAccessor, [
  "status: 'ready-for-audit'",
  "status: 'active'",
  'dataImportAllowed: true',
  'runtimeGenerationAllowed: true',
  'databaseAccessAllowed: true',
  'routeCreationAllowed: true',
  'sitemapAllowed: true',
  'jsonLdAllowed: true',
  'indexPromotionAllowed: true',
  'internalSeoLinksAllowed: true',
  'fetch(',
  'supabase',
]);

requireTokens(files.packageJson, packageJson, [
  'seo:location-candidate-data-readiness-runtime:validate',
  'check-location-candidate-data-readiness-runtime-accessor.mjs',
]);

console.log('Location candidate data-readiness runtime accessor validation passed.');
