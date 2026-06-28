import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const join = (parts) => parts.join('');

const files = {
  packageJson: 'package.json',
  routeContract: 'src/config/geo/route-contract.ts',
  indexPolicy: 'src/config/geo/index-promotion-policy.ts',
  readiness: 'src/lib/geo/oman-readiness.ts',
  publicationGates: 'src/lib/geo/oman-publication-gates.ts',
  thresholdPolicy: 'src/config/geo/location-threshold-policy.ts',
  candidateRuntime: 'src/lib/geo/oman-location-candidates.ts',
  snapshotContract: join(['src/config/geo/location-candidate-evidence', '-snapshot-contract.ts']),
  snapshotRuntime: join(['src/lib/geo/oman-location-candidate-evidence', '-snapshots.ts']),
  promotionContract: join(['src/config/geo/location-candidate-promotion', '-checklist-contract.ts']),
  promotionRuntime: join(['src/lib/geo/oman-location-candidate-promotion', '-checklists.ts']),
};

const forbiddenCandidateRouteFiles = [
  'src/app/[locale]/[country]/locations/[governorateSlug]/[categorySlug]/page.tsx',
  'src/app/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]/[categorySlug]/page.tsx',
  'src/app/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]/[areaSlug]/[categorySlug]/page.tsx',
  'src/app/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]/[areaSlug]/services/[serviceSlug]/page.tsx',
  'src/app/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]/[areaSlug]/specialties/[specialtySlug]/page.tsx',
];

function read(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8');
}

function requireTokens(label, source, tokens) {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    console.error(`${label} is missing required route readiness final gate tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

function forbidTokens(label, source, tokens) {
  const forbidden = tokens.filter((token) => source.includes(token));
  if (forbidden.length > 0) {
    console.error(`${label} contains forbidden route readiness final gate tokens:`);
    for (const token of forbidden) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

for (const routeFile of forbiddenCandidateRouteFiles) {
  if (existsSync(resolve(projectRoot, routeFile))) {
    console.error(`Candidate route must not exist before explicit promotion approval: ${routeFile}`);
    process.exit(1);
  }
}

const packageJson = read(files.packageJson);
const routeContract = read(files.routeContract);
const indexPolicy = read(files.indexPolicy);
const readiness = read(files.readiness);
const publicationGates = read(files.publicationGates);
const thresholdPolicy = read(files.thresholdPolicy);
const candidateRuntime = read(files.candidateRuntime);
const snapshotContract = read(files.snapshotContract);
const snapshotRuntime = read(files.snapshotRuntime);
const promotionContract = read(files.promotionContract);
const promotionRuntime = read(files.promotionRuntime);

requireTokens(files.packageJson, packageJson, [
  'seo:location-candidate-route-readiness-final:validate',
  'check-location-candidate-route-readiness-final-gate.mjs',
]);

requireTokens(files.routeContract, routeContract, [
  'location-governorate',
  'location-wilayat',
  'location-area',
  'noindexEnabled: true',
  'jsonLdEnabled: false',
  'sitemapEnabled: false',
  'indexableCanonical: false',
]);

requireTokens(files.indexPolicy, indexPolicy, [
  'blocked-until-content-ready',
  'noindexRequiredByDefault: true',
  'sitemapAllowedByDefault: false',
  'jsonLdAllowedByDefault: false',
]);

requireTokens(files.readiness, readiness, [
  'readyForPromotionReview = false',
]);
forbidTokens(files.readiness, readiness, [
  'readyForPromotionReview = true',
]);

requireTokens(files.publicationGates, publicationGates, [
  'technicalGateEnabled = false',
]);
forbidTokens(files.publicationGates, publicationGates, [
  'technicalGateEnabled = true',
]);

requireTokens(files.thresholdPolicy, thresholdPolicy, [
  'defaultNoindexRequired: true',
  'defaultSitemapAllowed: false',
  'defaultJsonLdAllowed: false',
  'defaultInternalSeoLinksAllowed: false',
  'defaultCandidatePromotionAllowed: false',
]);

requireTokens(files.candidateRuntime, candidateRuntime, [
  "status: 'blocked'",
  'canRenderPreview: false',
  'canIndex: false',
  'canSitemap: false',
  'canEmitJsonLd: false',
  'canUseInternalSeoLinks: false',
]);

requireTokens(files.snapshotContract, snapshotContract, [
  "status: 'contract-only'",
  'currentSnapshotsAvailable: false',
  'runtimeSnapshotGenerationAllowed: false',
  'databaseAccessAllowed: false',
  'sitemapPromotionAllowed: false',
  'jsonLdAllowed: false',
  'indexPromotionAllowed: false',
]);

requireTokens(files.snapshotRuntime, snapshotRuntime, [
  "status: 'disabled'",
  'snapshotGenerationAllowed: false',
  'promotionAllowed: false',
  'snapshot: null',
]);

requireTokens(files.promotionContract, promotionContract, [
  "status: 'contract-only'",
  'promotionAllowedByDefault: false',
  'reviewAllowedByDefault: false',
  'routeCreationAllowed: false',
  'runtimePromotionAllowed: false',
]);

requireTokens(files.promotionRuntime, promotionRuntime, [
  "status: 'blocked'",
  'reviewAllowed: false',
  'promotionAllowed: false',
  'canIndex: false',
  'canSitemap: false',
  'canEmitJsonLd: false',
  'canUseInternalSeoLinks: false',
]);

console.log('Location candidate route readiness final gate passed.');
