import { readFile } from 'node:fs/promises';
import path from 'node:path';

const files = {
  contract: 'docs/import/registry-convergence.md',
  roadmap: 'docs/import/import-readiness-roadmap-after-933.md',
  domain: 'src/server/admin/import-entity-domain.ts',
  imports: 'src/server/admin/imports.ts',
  adapter: 'src/server/admin/import-provider-authority-adapter.ts',
  publicAdapter: 'src/lib/catalog/public-provider-import-adapter.ts',
  publicFamilies: 'src/lib/catalog/public-entity-family-registry.ts',
  routeResolver: 'src/lib/catalog/public-provider-route-resolver.ts',
  relation: 'src/server/admin/import-link-rule-matrix.ts',
  sitemap: 'src/server/public/import-sitemap.ts',
  sitemapInclusion: 'src/server/admin/import-sitemap-inclusion.ts',
  package: 'package.json',
};

function parseRootArgument(argv) {
  const rootIndex = argv.indexOf('--root');
  if (rootIndex === -1) return process.cwd();
  const value = argv[rootIndex + 1];
  if (!value || value.startsWith('--')) {
    throw new Error('Usage: check-registry-convergence.mjs [--root <repository-root>]');
  }
  return path.resolve(value);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function extractManifest(source) {
  const match = source.match(/```json registry-convergence\s*\r?\n([\s\S]*?)\r?\n```/);
  assert(match, `${files.contract}: machine-readable convergence record is missing.`);
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    throw new Error(`${files.contract}: convergence record is invalid JSON: ${error.message}`);
  }
}

function extractTypeUnion(source, typeName) {
  const match = source.match(new RegExp(`export type ${typeName} =([\\s\\S]*?);`));
  assert(match, `${files.domain}: could not read ${typeName}.`);
  return [...match[1].matchAll(/["']([a-z0-9_]+)["']/g)].map((item) => item[1]);
}

function extractConstArray(source, constName) {
  const match = source.match(new RegExp(`export const ${constName} = \\[([\\s\\S]*?)\\] as const`));
  assert(match, `${files.domain}: could not read ${constName}.`);
  return [...match[1].matchAll(/["']([a-z0-9_]+)["']/g)].map((item) => item[1]);
}

function extractAdapterKeys(source) {
  const match = source.match(/PUBLIC_FAMILY_BY_IMPORT_ENTITY_TYPE = \{([\s\S]*?)\n\} as const/);
  assert(match, `${files.adapter}: total public-family adapter is missing.`);
  return [...match[1].matchAll(/^\s{2}([a-z0-9_]+):/gm)].map((item) => item[1]);
}

function sameValues(actual, expected) {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

const root = parseRootArgument(process.argv.slice(2));
const sources = Object.fromEntries(
  await Promise.all(
    Object.entries(files).map(async ([key, relativePath]) => [
      key,
      await readFile(path.join(root, relativePath), 'utf8'),
    ]),
  ),
);
const manifest = extractManifest(sources.contract);

assert(
  manifest.schemaVersion === 'drkhaleej.registryConvergence.v1' &&
    manifest.status === 'complete',
  `${files.contract}: convergence status drifted.`,
);
assert(
  manifest.repositoryBaseline === 'dfa0b63c34c9b8d1f369c535b7a2dfa540eabca4' &&
    manifest.runtimeBaseline === 'baba0cc91508ef8fad16e43650cf425099c8908a',
  `${files.contract}: convergence baseline drifted.`,
);
assert(
  manifest.phaseMapping?.executionPhase === 9 &&
    manifest.phaseMapping?.lockScope === 10 &&
    manifest.phaseMapping?.productModule === 18 &&
    manifest.phaseMapping?.subphaseId === 'REGISTRY-CONVERGENCE',
  `${files.contract}: canonical four-axis mapping drifted.`,
);
assert(
  manifest.next === 'PHARMACY-PUBLIC-NOINDEX-LIFECYCLE',
  `${files.contract}: next gate drifted.`,
);
assert(
  sameValues(manifest.enabledRouteFamilies ?? [], ['center', 'doctor']),
  `${files.contract}: enabled route-family record drifted.`,
);
assert(
  sameValues(
    manifest.resolvedFindings ?? [],
    ['AUTH-001', 'AUTH-002', 'AUTH-003', 'AUTH-004', 'AUTH-005', 'AUTH-006', 'AUTH-008'],
  ) && sameValues(manifest.deferredFindings ?? [], ['AUTH-007']),
  `${files.contract}: finding disposition drifted.`,
);

const canonicalTypes = extractTypeUnion(sources.domain, 'ImportEntityType');
const adminTypes = extractConstArray(sources.domain, 'ADMIN_IMPORT_ENTITY_TYPES');
const adapterTypes = extractAdapterKeys(sources.adapter);
assert(
  canonicalTypes.length === manifest.canonicalImportEntityCount &&
    new Set(canonicalTypes).size === canonicalTypes.length,
  `${files.domain}: canonical intake coverage drifted.`,
);
assert(
  adminTypes.length === manifest.legacyAdminEntityCount &&
    new Set(adminTypes).size === adminTypes.length,
  `${files.domain}: legacy Admin vocabulary drifted.`,
);
assert(
  sameValues([...adapterTypes].sort(), [...canonicalTypes].sort()),
  `${files.adapter}: adapter must cover every ImportEntityType exactly once.`,
);

for (const token of [
  'ADMIN_IMPORT_ENTITY_TYPE_TO_CANONICAL',
  'resolveImportStagingEntityType',
  'laboratory: "lab"',
  'medical_center: "clinic"',
]) {
  assert(sources.domain.includes(token), `${files.domain}: missing convergence token ${token}.`);
}
assert(
  sources.imports.includes('import type { AdminImportEntityType }') &&
    sources.imports.includes('export type { AdminImportEntityType }') &&
    !sources.imports.includes('export type AdminImportEntityType ='),
  `${files.imports}: Admin import vocabulary must consume the canonical staging adapter type.`,
);

for (const token of [
  'PUBLIC_FAMILY_BY_IMPORT_ENTITY_TYPE',
  'PUBLIC_PROJECTION_BY_FAMILY',
  'storageAuthority',
  'potentialCapabilities',
  'routeRelease',
  'resolvePublicProviderCanonicalRoute',
  'resolveImportStagingEntityType',
  '"unsupported_entity_type"',
  '"public_family_registry_missing"',
]) {
  assert(sources.adapter.includes(token), `${files.adapter}: missing convergence token ${token}.`);
}
for (const forbidden of [
  'createSupabaseServiceRoleClient',
  '.insert(',
  '.update(',
  '.delete(',
]) {
  assert(!sources.adapter.includes(forbidden), `${files.adapter}: adapter must be read-only.`);
}

assert(
  sources.publicAdapter.includes('resolveImportProviderAuthority') &&
    sources.publicAdapter.includes('candidateEntityType ?? queueEntityType') &&
    !sources.publicAdapter.includes('FAMILY_BY_ENTITY') &&
    !sources.publicAdapter.includes('ROUTE_FAMILY_BY_ENTITY'),
  `${files.publicAdapter}: public import projection must consume the convergence adapter.`,
);
assert(
  sources.publicFamilies.includes('?? null') &&
    !sources.publicFamilies.includes('?? publicEntityFamilyRegistry[0]'),
  `${files.publicFamilies}: unknown public families must fail closed.`,
);
assert(
  !sources.relation.includes('"human_pharmacy" as ImportEntityType') &&
    /source_type:\s*"pet_clinic"[\s\S]*?target_type:\s*"pharmacy"[\s\S]*?allowed:\s*false/.test(
      sources.relation,
    ),
  `${files.relation}: pet-to-human Pharmacy separation must use the canonical type.`,
);
assert(
  sources.sitemap.includes('resolveImportProviderAuthority') &&
    sources.sitemap.includes('resolvePublicProviderCanonicalRoute') &&
    sources.sitemap.includes('resolvedRoute.publicRouteEnabled') &&
    sources.sitemap.includes('resolvedRoute.canonicalPath !== canonicalPath') &&
    !sources.sitemap.includes('^\\/(en|ar)\\/om\\/pharmacies\\/') &&
    !sources.sitemap.includes('^\\/(en|ar)\\/om\\/hospitals\\/'),
  `${files.sitemap}: sitemap must consume canonical route authority without local family routes.`,
);

const enabledRouteFamilies = [
  ...sources.routeResolver.matchAll(/if \(family === '([a-z0-9_]+)'\)/g),
]
  .map((item) => item[1])
  .sort();
assert(
  sameValues(enabledRouteFamilies, ['center', 'doctor', 'pharmacy']),
  `${files.routeResolver}: only the independently released route families may be enabled.`,
);
assert(
  /index_policy:\s*"index"[\s\S]*sitemap_policy:\s*"included"/.test(
    sources.sitemapInclusion,
  ),
  `${files.sitemapInclusion}: deferred legacy coupling changed outside its promotion package.`,
);

assert(
  sources.roadmap.includes(
    '"currentMigration": "0095_import_automation_job_runtime.sql"',
  ) &&
    sources.roadmap.includes('"currentNext": "AUTOMATION-JOB-PREVIEW-ACTIVATION"') &&
    sources.roadmap.includes('Wave 6     COMPLETE') &&
    sources.roadmap.includes('Wave 7.4   COMPLETE') &&
    sources.roadmap.includes('Registry Convergence complete') &&
    sources.roadmap.includes('Wave 8     PARTIAL'),
  `${files.roadmap}: completed convergence state is not aligned.`,
);
assert(
  sources.package.includes('"import:registry-convergence:validate"') &&
    sources.package.includes('scripts/import/check-registry-convergence.mjs'),
  `${files.package}: convergence validation script is not registered.`,
);

console.log('registry convergence check passed.');
