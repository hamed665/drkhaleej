import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();

const files = {
  runtimeAccessor: 'src/lib/geo/oman-location-candidate-source-model.ts',
  contract: 'src/config/geo/location-candidate-source-model-contract.ts',
  packageJson: 'package.json',
};

function read(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8');
}

function requireTokens(label, source, tokens) {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    console.error(`${label} is missing required source model runtime tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

function forbidTokens(label, source, tokens) {
  const forbidden = tokens.filter((token) => source.includes(token));
  if (forbidden.length > 0) {
    console.error(`${label} contains forbidden source model runtime tokens:`);
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
  'getOmanLocationCandidateSourceModelPolicy',
  'getOmanLocationCandidateSourceModelState',
  'getOmanLocationCandidateSourceModelRuntimeContract',
  "status: 'disabled'",
  'runtimeCollectionAllowed: false',
  'databaseAccessAllowed: false',
  'importAllowed: false',
  'routeCreationAllowed: false',
  'sitemapAllowed: false',
  'jsonLdAllowed: false',
  'indexPromotionAllowed: false',
  'candidate-source-model-contract-only',
  'candidate-source-model-runtime-disabled',
  'candidate-source-model-runtime-collection-disabled',
  'candidate-source-model-import-disabled',
]);

requireTokens(files.contract, contract, [
  "status: 'contract-only'",
  'runtimeCollectionAllowed: false',
  'databaseAccessAllowed: false',
  'importAllowed: false',
  'routeCreationAllowed: false',
  'sitemapAllowed: false',
  'jsonLdAllowed: false',
  'indexPromotionAllowed: false',
]);

forbidTokens(files.runtimeAccessor, runtimeAccessor, [
  "status: 'ready-for-audit'",
  "status: 'active'",
  'runtimeCollectionAllowed: true',
  'databaseAccessAllowed: true',
  'importAllowed: true',
  'routeCreationAllowed: true',
  'sitemapAllowed: true',
  'jsonLdAllowed: true',
  'indexPromotionAllowed: true',
  'fetch(',
  'supabase',
]);

requireTokens(files.packageJson, packageJson, [
  'seo:location-candidate-source-model-runtime:validate',
  'check-location-candidate-source-model-runtime-accessor.mjs',
]);

console.log('Location candidate source model runtime accessor validation passed.');
