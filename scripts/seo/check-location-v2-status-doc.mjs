import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const statusDocPath = 'docs/DRKHALEEJ_LOCATION_V2_STATUS.md';
const closeoutDocPath = 'docs/DRKHALEEJ_LOCATION_V2_CLOSEOUT_CHECKLIST.md';
const providerStatusDocPath = 'docs/DRKHALEEJ_LOCATION_V2_PROVIDER_SOURCE_PLAN_STATUS.md';
const providerAddendumDocPath = 'docs/DRKHALEEJ_LOCATION_V2_PROVIDER_PLAN_ADDENDUM.md';
const guardChainAddendumDocPath = 'docs/DRKHALEEJ_LOCATION_V2_GUARD_CHAIN_PROVIDER_PLAN_ADDENDUM.md';
const verifiedCountStatusDocPath = 'docs/DRKHALEEJ_LOCATION_V2_VERIFIED_COUNT_STATUS.md';
const referenceStatusDocPath = 'docs/DRKHALEEJ_LOCATION_V2_REFERENCE_STATUS.md';
const packagePath = 'package.json';

function read(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8');
}

function requireDocument(relativePath, label) {
  if (!existsSync(resolve(projectRoot, relativePath))) {
    console.error(`Missing ${label}: ${relativePath}`);
    process.exit(1);
  }
}

function requireTokens(label, source, tokens) {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    console.error(`${label} is missing required Location V2 documentation tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

requireDocument(statusDocPath, 'Location V2 status document');
requireDocument(closeoutDocPath, 'Location V2 closeout checklist');
requireDocument(providerStatusDocPath, 'Location V2 provider status document');
requireDocument(providerAddendumDocPath, 'Location V2 provider addendum document');
requireDocument(guardChainAddendumDocPath, 'Location V2 guard chain addendum document');
requireDocument(verifiedCountStatusDocPath, 'Location V2 verified count status document');
requireDocument(referenceStatusDocPath, 'Location V2 reference status document');

const statusDoc = read(statusDocPath);
const closeoutDoc = read(closeoutDocPath);
const providerStatusDoc = read(providerStatusDocPath);
const providerAddendumDoc = read(providerAddendumDocPath);
const guardChainAddendumDoc = read(guardChainAddendumDocPath);
const verifiedCountStatusDoc = read(verifiedCountStatusDocPath);
const referenceStatusDoc = read(referenceStatusDocPath);
const packageJson = read(packagePath);

requireTokens(statusDocPath, statusDoc, [
  'DrKhaleej Location V2 Status',
  'noindex-first, fail-closed system',
  'Country -> Governorate -> Wilayat / City-level -> Area / Neighborhood',
  'Candidate composite routes are still forbidden.',
  'Required promotion sequence',
  'route readiness final gate',
  'Any PR that changes a candidate from blocked to reviewable or indexable must include:',
]);

requireTokens(statusDocPath, statusDoc, [
  'manual gate contract',
  'disabled manual gate runtime accessor',
  'manual gate runtime tests',
  'manual gate integration guard',
  'final gate manual chain coverage',
  'The route readiness final gate now directly checks the manual gate chain',
  'manualGateContract',
  'manualGateRuntime',
  'manualGateTest',
  'manualGateIntegration',
  'contract-only',
  'disabled',
  'public-surface blocking tokens',
]);

requireTokens(closeoutDocPath, closeoutDoc, [
  'DrKhaleej Location V2 Closeout Checklist',
  'Phase status',
  'Do not touch yet',
  'Required before data/import work',
  'Required before any candidate route PR',
  'Safe next phase',
  'No candidate page becomes reviewable or indexable',
]);

requireTokens(closeoutDocPath, closeoutDoc, [
  'Manual gate runtime stays disabled.',
  'Manual gate integration guard is wired into `seo:check`.',
  'Route readiness final gate is wired into `seo:check`.',
  'Route readiness final gate explicitly checks the manual gate contract, disabled runtime accessor, runtime tests, and integration guard.',
  'keep manual gate runtime disabled until explicit promotion review',
  'final gate manual-chain coverage review when manual gate, route, sitemap, JSON-LD, or index behavior changes',
]);

requireTokens(providerStatusDocPath, providerStatusDoc, [
  'DrKhaleej Location V2 Provider Source Plan Status',
  'contract-only and fail-closed',
  'provider source plan contract',
  'disabled runtime accessor',
  'runtime test coverage',
  'route snapshot guard coverage',
]);

requireTokens(providerAddendumDocPath, providerAddendumDoc, [
  'DrKhaleej Location V2 Provider Plan Addendum',
  'Guard chain',
  'typecheck guard',
  'disabled accessor',
  'tests for nine candidate policy pairs',
  'route snapshot checks',
  'planning-only',
]);

requireTokens(guardChainAddendumDocPath, guardChainAddendumDoc, [
  'DrKhaleej Location V2 Guard Chain Provider Plan Addendum',
  'provider planning step',
  'source model -> provider plan -> manual gate',
  'planning-only',
]);

requireTokens(verifiedCountStatusDocPath, verifiedCountStatusDoc, [
  'DrKhaleej Location V2 Verified Count Status',
  'Guard chain',
  'Boundary',
]);

requireTokens(referenceStatusDocPath, referenceStatusDoc, [
  'DrKhaleej Location V2 Reference Status',
  'Guard chain',
  'Boundary',
]);

requireTokens(packagePath, packageJson, [
  'seo:location-v2-status-doc:validate',
  'check-location-v2-status-doc.mjs',
]);

console.log('Location V2 documentation validation passed.');
