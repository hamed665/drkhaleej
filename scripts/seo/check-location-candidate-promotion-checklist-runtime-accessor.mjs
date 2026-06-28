import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();

const files = {
  runtimeAccessor: 'src/lib/geo/oman-location-candidate-promotion-checklists.ts',
  checklistContract: 'src/config/geo/location-candidate-promotion-checklist-contract.ts',
  packageJson: 'package.json',
};

function read(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8');
}

function requireTokens(label, source, tokens) {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    console.error(`${label} is missing required promotion checklist runtime tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

function forbidTokens(label, source, tokens) {
  const forbidden = tokens.filter((token) => source.includes(token));
  if (forbidden.length > 0) {
    console.error(`${label} contains forbidden promotion checklist runtime tokens:`);
    for (const token of forbidden) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

const runtimeAccessor = read(files.runtimeAccessor);
const checklistContract = read(files.checklistContract);
const packageJson = read(files.packageJson);

requireTokens(files.runtimeAccessor, runtimeAccessor, [
  'getOmanLocationCandidatePromotionChecklistPolicy',
  'getOmanLocationCandidatePromotionChecklistState',
  'getOmanLocationCandidatePromotionChecklistRuntimeContract',
  'getOmanLocationCandidateEvidenceSnapshotState',
  'snapshotState',
  "status: 'blocked'",
  'reviewAllowed: false',
  'promotionAllowed: false',
  'canIndex: false',
  'canSitemap: false',
  'canEmitJsonLd: false',
  'canUseInternalSeoLinks: false',
  'candidate-promotion-checklist-contract-only',
  'candidate-promotion-review-disabled',
  'candidate-promotion-runtime-disabled',
]);

requireTokens(files.checklistContract, checklistContract, [
  "status: 'contract-only'",
  'promotionAllowedByDefault: false',
  'reviewAllowedByDefault: false',
  'sitemapAllowedByDefault: false',
  'jsonLdAllowedByDefault: false',
  'internalLinksAllowedByDefault: false',
  'databaseAccessAllowed: false',
  'routeCreationAllowed: false',
  'runtimePromotionAllowed: false',
]);

forbidTokens(files.runtimeAccessor, runtimeAccessor, [
  "status: 'ready-for-review'",
  "status: 'approved'",
  'reviewAllowed: true',
  'promotionAllowed: true',
  'canIndex: true',
  'canSitemap: true',
  'canEmitJsonLd: true',
  'canUseInternalSeoLinks: true',
  'database',
  'fetch(',
  'supabase',
]);

requireTokens(files.packageJson, packageJson, [
  'seo:location-candidate-promotion-runtime:validate',
  'check-location-candidate-promotion-checklist-runtime-accessor.mjs',
]);

console.log('Location candidate promotion checklist runtime accessor validation passed.');
