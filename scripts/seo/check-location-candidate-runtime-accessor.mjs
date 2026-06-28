import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();

const files = {
  runtimeAccessor: 'src/lib/geo/oman-location-candidates.ts',
  thresholdPolicy: 'src/config/geo/location-threshold-policy.ts',
  candidateGate: 'scripts/seo/check-location-category-candidate-gate.mjs',
  packageJson: 'package.json',
};

function read(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8');
}

function requireTokens(label, source, tokens) {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    console.error(`${label} is missing required candidate runtime accessor tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

function forbidTokens(label, source, tokens) {
  const forbidden = tokens.filter((token) => source.includes(token));
  if (forbidden.length > 0) {
    console.error(`${label} contains forbidden candidate runtime accessor tokens:`);
    for (const token of forbidden) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

const runtimeAccessor = read(files.runtimeAccessor);
const thresholdPolicy = read(files.thresholdPolicy);
const candidateGate = read(files.candidateGate);
const packageJson = read(files.packageJson);

requireTokens(files.runtimeAccessor, runtimeAccessor, [
  'OmanLocationCandidateStatus',
  "'blocked' | 'preview' | 'eligible_for_review' | 'indexable'",
  'OmanLocationCandidateInput',
  'OmanLocationCandidateRuntimeState',
  'getOmanLocationThresholdPolicy',
  'getOmanLocationCandidateState',
  'parentHierarchyResolved: boolean',
  'providerThresholdMet',
  'approvedEvidenceComplete',
  'readinessGatesComplete',
  'humanReviewComplete',
  'promotionPrApproved',
  "status: 'blocked'",
  'canRenderPreview: false',
  'canIndex: false',
  'canSitemap: false',
  'canEmitJsonLd: false',
  'canUseInternalSeoLinks: false',
  'location-candidate-engine-disabled',
]);

requireTokens(files.thresholdPolicy, thresholdPolicy, [
  'OMAN_LOCATION_THRESHOLD_POLICIES',
  'defaultCandidatePromotionAllowed: false',
  'defaultInternalSeoLinksAllowed: false',
  'promotionRequiresParentHierarchy: true',
  'promotionRequiresProviderThreshold: true',
  'promotionRequiresApprovedEvidence: true',
  'promotionRequiresReadinessGates: true',
  'promotionRequiresHumanReview: true',
  'promotionRequiresApprovedPr: true',
]);

requireTokens(files.candidateGate, candidateGate, [
  'forbiddenCompositeRouteFiles',
  'minimumPublishedProviders',
  'minimumApprovedEvidenceEntries',
  'registryEnabled: false',
  'promotionAllowed: false',
]);

forbidTokens(files.runtimeAccessor, runtimeAccessor, [
  "status: 'preview'",
  "status: 'eligible_for_review'",
  "status: 'indexable'",
  'canRenderPreview: true',
  'canIndex: true',
  'canSitemap: true',
  'canEmitJsonLd: true',
  'canUseInternalSeoLinks: true',
  'providerThresholdMet = true',
  'approvedEvidenceComplete = true',
  'readinessGatesComplete = true',
  'humanReviewComplete = true',
  'promotionPrApproved = true',
]);

requireTokens(files.packageJson, packageJson, [
  'seo:location-candidate-runtime:validate',
  'check-location-candidate-runtime-accessor.mjs',
]);

console.log('Location candidate runtime accessor validation passed.');
