import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();

const files = {
  runtimeAccessor: 'src/lib/geo/oman-location-candidate-evidence-snapshots.ts',
  snapshotContract: 'src/config/geo/location-candidate-evidence-snapshot-contract.ts',
  candidateRuntime: 'src/lib/geo/oman-location-candidates.ts',
  packageJson: 'package.json',
};

function read(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8');
}

function requireTokens(label, source, tokens) {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    console.error(`${label} is missing required candidate evidence snapshot runtime tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

function forbidTokens(label, source, tokens) {
  const forbidden = tokens.filter((token) => source.includes(token));
  if (forbidden.length > 0) {
    console.error(`${label} contains forbidden candidate evidence snapshot runtime tokens:`);
    for (const token of forbidden) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

const runtimeAccessor = read(files.runtimeAccessor);
const snapshotContract = read(files.snapshotContract);
const candidateRuntime = read(files.candidateRuntime);
const packageJson = read(files.packageJson);

requireTokens(files.runtimeAccessor, runtimeAccessor, [
  'getOmanLocationCandidateEvidenceSnapshotRequirement',
  'getOmanLocationCandidateEvidenceSnapshotState',
  'getOmanLocationCandidateEvidenceSnapshotRuntimeContract',
  'getOmanLocationCandidateState',
  'candidatePath',
  'locationSlug',
  'candidateState',
  "status: 'disabled'",
  'snapshotGenerationAllowed: false',
  'promotionAllowed: false',
  'snapshot: null',
  'candidate-evidence-snapshot-contract-only',
  'candidate-evidence-snapshot-runtime-disabled',
]);

requireTokens(files.snapshotContract, snapshotContract, [
  'currentSnapshotsAvailable: false',
  'runtimeSnapshotGenerationAllowed: false',
  'databaseAccessAllowed: false',
  'sitemapPromotionAllowed: false',
  'jsonLdAllowed: false',
  'indexPromotionAllowed: false',
  'snapshotPromotionAllowed: false',
]);

requireTokens(files.candidateRuntime, candidateRuntime, [
  "status: 'blocked'",
  'canIndex: false',
  'canSitemap: false',
  'canEmitJsonLd: false',
  'canUseInternalSeoLinks: false',
]);

forbidTokens(files.runtimeAccessor, runtimeAccessor, [
  "status: 'blocked'",
  "status: 'ready_for_review'",
  "status: 'approved'",
  'snapshotGenerationAllowed: true',
  'promotionAllowed: true',
  'database',
  'fetch(',
  'supabase',
]);

requireTokens(files.packageJson, packageJson, [
  'seo:location-candidate-evidence-runtime:validate',
  'check-location-candidate-evidence-snapshot-runtime-accessor.mjs',
]);

console.log('Location candidate evidence snapshot runtime accessor validation passed.');
