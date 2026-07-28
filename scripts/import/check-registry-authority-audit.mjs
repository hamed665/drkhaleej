import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const files = {
  audit: 'docs/import/registry-authority-audit.md',
  roadmap: 'docs/import/import-readiness-roadmap-after-933.md',
  importDomain: 'src/server/admin/import-entity-domain.ts',
  adminImports: 'src/server/admin/imports.ts',
  convergenceAdapter: 'src/server/admin/import-provider-authority-adapter.ts',
  publicFamilies: 'src/lib/catalog/public-entity-family-registry.ts',
  routeResolver: 'src/lib/catalog/public-provider-route-resolver.ts',
  publicStorage: 'src/lib/catalog/public-eligible-queries.ts',
  importStaging: 'supabase/migrations/0061_import_staging_foundation.sql',
  publicProjection: 'src/lib/catalog/public-provider-projection.ts',
  seo: 'src/server/admin/import-seo-profile-contract.ts',
  schema: 'src/server/admin/import-schema-generator.ts',
  relation: 'src/server/admin/import-link-rule-matrix.ts',
  sitemapEligibility: 'src/server/admin/import-sitemap-eligibility-2026.ts',
  sitemapInclusion: 'src/server/admin/import-sitemap-inclusion.ts',
  sitemapReader: 'src/server/public/import-sitemap.ts',
};

const expectedColumns = [
  'entityType',
  'publicFamily',
  'publicFamilyStatus',
  'routeFamily',
  'routeStatus',
  'storageFamily',
  'storageStatus',
  'seoStatus',
  'schemaStatus',
  'relationStatus',
  'sitemapFamily',
  'sitemapStatus',
];

const allowedStatuses = ['supported', 'planned', 'disabled', 'unsupported'];
const expectedFindings = new Map([
  ['AUTH-001', 'unsupported'],
  ['AUTH-002', 'disabled'],
  ['AUTH-003', 'disabled'],
  ['AUTH-004', 'unsupported'],
  ['AUTH-005', 'planned'],
  ['AUTH-006', 'planned'],
  ['AUTH-007', 'disabled'],
  ['AUTH-008', 'unsupported'],
]);
const expectedConvergenceGates = [
  'one-total-import-to-public-family-adapter',
  'remove-noncanonical-human-pharmacy-alias',
  'sitemap-consumes-canonical-route-authority',
  'capability-flags-cannot-enable-release',
  'unknown-family-lookup-fails-closed',
  'index-and-sitemap-promotions-remain-independent',
  'all-public-route-families-remain-disabled-except-existing-doctor-and-center',
];

function parseRootArgument(argv) {
  const rootIndex = argv.indexOf('--root');
  if (rootIndex === -1) return process.cwd();
  const value = argv[rootIndex + 1];
  if (!value || value.startsWith('--')) {
    throw new Error('Usage: check-registry-authority-audit.mjs [--root <repository-root>]');
  }
  return path.resolve(value);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sameValues(actual, expected) {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

function extractJsonManifest(source) {
  const match = source.match(/```json registry-authority-audit\s*\r?\n([\s\S]*?)\r?\n```/);
  assert(match, `${files.audit}: machine-readable registry authority manifest is missing.`);
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    throw new Error(`${files.audit}: registry authority manifest is invalid JSON: ${error.message}`);
  }
}

function extractTypeUnion(source, typeName) {
  const match = source.match(new RegExp(`export type ${typeName} =([\\s\\S]*?);`));
  assert(match, `could not read ${typeName}.`);
  return [...match[1].matchAll(/["']([a-z0-9_]+)["']/g)].map((item) => item[1]);
}

function extractConstArray(source, constName) {
  const match = source.match(new RegExp(`(?:export )?const ${constName} = \\[([\\s\\S]*?)\\] as const`));
  assert(match, `could not read ${constName}.`);
  return [...match[1].matchAll(/["']([a-z0-9_]+)["']/g)].map((item) => item[1]);
}

function extractSchemaEntityTypes(source) {
  const match = source.match(/IMPORT_SCHEMA_TYPES_BY_ENTITY_TYPE = \{([\s\S]*?)\n\} as const/);
  assert(match, 'could not read IMPORT_SCHEMA_TYPES_BY_ENTITY_TYPE.');
  return [...match[1].matchAll(/^\s{2}([a-z0-9_]+):/gm)].map((item) => item[1]);
}

function extractObjectKeys(source, objectName) {
  const match = source.match(new RegExp(`${objectName} = \\{([\\s\\S]*?)\\n\\} as const`));
  assert(match, `could not read ${objectName}.`);
  return [...match[1].matchAll(/^\s{2}([a-z0-9_]+):/gm)].map((item) => item[1]);
}

function extractCanonicalLinkEntityTypes(source, canonicalTypes) {
  const values = [...source.matchAll(/(?:source_type|target_type): "([a-z0-9_]+)"/g)].map(
    (item) => item[1],
  );
  return new Set(values.filter((value) => canonicalTypes.has(value)));
}

function extractSitemapFamilies(source) {
  return new Set(
    [...source.matchAll(/"\/sitemaps\/([a-z0-9_-]+)\.xml"/g)].map((item) => item[1]),
  );
}

function rowRecord(row) {
  return Object.fromEntries(expectedColumns.map((column, index) => [column, row[index]]));
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
const manifest = extractJsonManifest(sources.audit);

assert(
  manifest.schemaVersion === 'drkhaleej.registryAuthorityAudit.v1',
  `${files.audit}: schemaVersion drifted.`,
);
assert(manifest.auditStatus === 'complete', `${files.audit}: auditStatus must be complete.`);
assert(
  manifest.repositoryBaseline === '2149fb798d4b6743d61d3edf712dfcacf698b6c2',
  `${files.audit}: repositoryBaseline drifted.`,
);
assert(
  manifest.runtimeBaseline === 'baba0cc91508ef8fad16e43650cf425099c8908a',
  `${files.audit}: runtimeBaseline drifted.`,
);
assert(
  manifest.phaseMapping?.executionPhase === 9 &&
    manifest.phaseMapping?.lockScope === 10 &&
    manifest.phaseMapping?.productModule === 18 &&
    manifest.phaseMapping?.subphaseId === 'REGISTRY-AUTHORITY-AUDIT',
  `${files.audit}: canonical four-axis mapping drifted.`,
);
assert(manifest.next === 'REGISTRY-CONVERGENCE', `${files.audit}: next must be REGISTRY-CONVERGENCE.`);
assert(
  sameValues(manifest.allowedStatuses ?? [], allowedStatuses),
  `${files.audit}: allowedStatuses drifted.`,
);
assert(sameValues(manifest.columns ?? [], expectedColumns), `${files.audit}: columns drifted.`);

const expectedAuthorities = {
  importEntityType: [files.importDomain, 'ImportEntityType'],
  publicFamily: [files.publicFamilies, 'publicEntityFamilyRegistry'],
  route: [files.routeResolver, 'resolvePublicProviderCanonicalRoute'],
  publicStorage: [files.publicStorage, 'doctors/centers'],
  importStaging: [files.importStaging, 'import_entity_candidates/import_publish_queue'],
  seo: [files.seo, 'getImportSeoProfileReadiness'],
  schema: [files.schema, 'IMPORT_SCHEMA_TYPES_BY_ENTITY_TYPE'],
  relation: [files.relation, 'IMPORT_ENTITY_LINK_RULES'],
  sitemapEligibility: [files.sitemapEligibility, 'getImportSitemapEligibility2026'],
  sitemapReader: [files.sitemapReader, 'listPublicImportSitemapEntries'],
};

for (const [name, expected] of Object.entries(expectedAuthorities)) {
  const actual = manifest.authorities?.[name];
  assert(
    Array.isArray(actual) && sameValues(actual, expected),
    `${files.audit}: authority ${name} drifted.`,
  );
  const authoritySource = await readFile(path.join(root, actual[0]), 'utf8');
  for (const token of actual[1].split('/')) {
    assert(authoritySource.includes(token), `${actual[0]}: authority token ${token} is missing.`);
  }
}

const importTypes = extractTypeUnion(sources.importDomain, 'ImportEntityType');
const importTypeSet = new Set(importTypes);
const adminImportTypes = extractConstArray(sources.importDomain, 'ADMIN_IMPORT_ENTITY_TYPES');
const convergedAdapterTypes = extractObjectKeys(
  sources.convergenceAdapter,
  'PUBLIC_FAMILY_BY_IMPORT_ENTITY_TYPE',
);
const publicProviderEntityTypes = extractTypeUnion(
  sources.publicProjection,
  'PublicProviderEntityType',
);
const publicFamilies = new Set(extractConstArray(sources.publicFamilies, 'publicEntityFamilies'));
const routeFamilies = new Set(
  extractConstArray(sources.routeResolver, 'publicProviderRouteFamilies'),
);
const enabledRouteFamilies = new Set(
  [...sources.routeResolver.matchAll(/if \(family === '([a-z0-9_]+)'\)/g)].map(
    (item) => item[1],
  ),
);
const schemaTypes = extractSchemaEntityTypes(sources.schema);
const relationTypes = extractCanonicalLinkEntityTypes(sources.relation, importTypeSet);
const sitemapFamilies = extractSitemapFamilies(sources.sitemapEligibility);

assert(
  !sameValues(adminImportTypes, importTypes),
  'AUTH-001 is stale: AdminImportEntityType unexpectedly converged with ImportEntityType.',
);
assert(
  !sameValues(publicProviderEntityTypes, importTypes),
  'AUTH-001 is stale: PublicProviderEntityType unexpectedly converged with ImportEntityType.',
);
assert(
  sameValues([...convergedAdapterTypes].sort(), [...importTypes].sort()),
  'AUTH-001 remediation drifted: the total convergence adapter no longer covers ImportEntityType.',
);
assert(
  !sources.relation.includes('"human_pharmacy" as ImportEntityType') &&
    sources.relation.includes('target_type: "pharmacy"'),
  'AUTH-004 remediation drifted: relation rules must use canonical pharmacy without a cast.',
);
assert(
  !sources.publicFamilies.includes('?? publicEntityFamilyRegistry[0]') &&
    sources.publicFamilies.includes('?? null'),
  'AUTH-008 remediation drifted: public-family lookup must fail closed.',
);
assert(
  /index_policy:\s*"index"[\s\S]*sitemap_policy:\s*"included"/.test(
    sources.sitemapInclusion,
  ),
  'AUTH-007 is stale: the legacy sitemap helper no longer couples index and sitemap promotion.',
);
assert(
  sameValues([...enabledRouteFamilies].sort(), ['center', 'doctor']),
  `${files.routeResolver}: enabled route families drifted.`,
);
assert(
  sameValues([...schemaTypes].sort(), [...importTypes].sort()),
  `${files.schema}: schema entity coverage drifted.`,
);

assert(Array.isArray(manifest.entities), `${files.audit}: entities must be an array.`);
const rows = manifest.entities.map((row, index) => {
  assert(
    Array.isArray(row) && row.length === expectedColumns.length,
    `${files.audit}: entity row ${index} has invalid width.`,
  );
  return rowRecord(row);
});
const auditedTypes = rows.map((row) => row.entityType);
assert(
  new Set(auditedTypes).size === auditedTypes.length,
  `${files.audit}: entity coverage contains duplicates.`,
);
const missingTypes = importTypes.filter((type) => !auditedTypes.includes(type));
const unknownTypes = auditedTypes.filter((type) => !importTypeSet.has(type));
assert(
  missingTypes.length === 0 && unknownTypes.length === 0 && auditedTypes.length === importTypes.length,
  `${files.audit}: entity coverage drifted; missing=${missingTypes.join(',') || 'none'}; unknown=${unknownTypes.join(',') || 'none'}.`,
);

const supportedStorage = new Map([
  ['doctor', 'doctors'],
  ['clinic', 'centers'],
  ['pharmacy', 'centers'],
]);

for (const row of rows) {
  for (const statusColumn of expectedColumns.filter((column) => column.endsWith('Status'))) {
    assert(
      allowedStatuses.includes(row[statusColumn]),
      `${files.audit}: ${row.entityType}.${statusColumn} has invalid status ${row[statusColumn]}.`,
    );
  }

  if (row.publicFamily === null) {
    assert(
      row.publicFamilyStatus === 'unsupported',
      `${files.audit}: ${row.entityType} without a public family must be unsupported.`,
    );
  } else {
    assert(
      publicFamilies.has(row.publicFamily),
      `${files.audit}: ${row.entityType} references unknown public family ${row.publicFamily}.`,
    );
    const expectedStatus = row.publicFamily === row.entityType ? 'supported' : 'planned';
    assert(
      row.publicFamilyStatus === expectedStatus,
      `${files.audit}: ${row.entityType}.publicFamilyStatus must be ${expectedStatus}.`,
    );
  }

  if (row.routeFamily === null) {
    assert(
      row.routeStatus === 'unsupported',
      `${files.audit}: ${row.entityType} without a route family must be unsupported.`,
    );
  } else {
    assert(
      routeFamilies.has(row.routeFamily),
      `${files.audit}: ${row.entityType} references unknown route family ${row.routeFamily}.`,
    );
    const expectedStatus = enabledRouteFamilies.has(row.routeFamily)
      ? row.entityType === row.routeFamily
        ? 'supported'
        : 'planned'
      : 'disabled';
    assert(
      row.routeStatus === expectedStatus,
      `${files.audit}: ${row.entityType}.routeStatus must be ${expectedStatus}.`,
    );
  }

  const expectedStorage = supportedStorage.get(row.entityType);
  if (expectedStorage) {
    assert(
      row.storageFamily === expectedStorage && row.storageStatus === 'supported',
      `${files.audit}: ${row.entityType} storage authority drifted.`,
    );
  } else {
    assert(
      row.storageFamily === 'import_entity_candidates/import_publish_queue' &&
        row.storageStatus === 'planned',
      `${files.audit}: ${row.entityType} must remain staging-only/planned.`,
    );
  }

  assert(
    row.seoStatus === 'supported',
    `${files.audit}: ${row.entityType}.seoStatus must reflect the generic SEO contract.`,
  );
  assert(
    row.schemaStatus === 'supported',
    `${files.audit}: ${row.entityType}.schemaStatus must reflect total schema coverage.`,
  );
  const expectedRelationStatus = relationTypes.has(row.entityType) ? 'supported' : 'planned';
  assert(
    row.relationStatus === expectedRelationStatus,
    `${files.audit}: ${row.entityType}.relationStatus must be ${expectedRelationStatus}.`,
  );

  if (row.sitemapFamily === null) {
    assert(
      row.sitemapStatus === 'unsupported',
      `${files.audit}: ${row.entityType} without a sitemap family must be unsupported.`,
    );
  } else {
    assert(
      sitemapFamilies.has(row.sitemapFamily),
      `${files.audit}: ${row.entityType} references unknown sitemap family ${row.sitemapFamily}.`,
    );
    const expectedStatus =
      row.entityType === 'doctor' && row.sitemapFamily === 'doctors'
        ? 'supported'
        : row.routeStatus === 'disabled'
          ? 'disabled'
          : 'planned';
    assert(
      row.sitemapStatus === expectedStatus,
      `${files.audit}: ${row.entityType}.sitemapStatus must be ${expectedStatus}.`,
    );
  }
}

assert(Array.isArray(manifest.findings), `${files.audit}: findings must be an array.`);
const findings = new Map(
  manifest.findings.map((finding, index) => {
    assert(
      Array.isArray(finding) && finding.length === 3,
      `${files.audit}: finding ${index} has invalid shape.`,
    );
    return [finding[0], finding[1]];
  }),
);
assert(findings.size === expectedFindings.size, `${files.audit}: finding coverage drifted.`);
for (const [id, status] of expectedFindings) {
  assert(findings.get(id) === status, `${files.audit}: ${id} must remain ${status}.`);
}
assert(
  sameValues(manifest.convergenceGates ?? [], expectedConvergenceGates),
  `${files.audit}: convergence gates drifted.`,
);

for (const relativePath of [
  'src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx',
  'src/app/[locale]/[country]/center/[centerSlug]/page.tsx',
  'src/app/[locale]/[country]/pharmacies/[pharmacySlug]/page.tsx',
]) {
  await access(path.join(root, relativePath));
}
try {
  await access(path.join(root, 'src/app/[locale]/[country]/hospitals/[hospitalSlug]/page.tsx'));
  throw new Error('AUTH-003 is stale: a hospital detail route now exists and requires re-audit.');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

assert(
  sources.routeResolver.includes("if (family === 'doctor')") &&
    sources.routeResolver.includes("if (family === 'center')") &&
    !sources.routeResolver.includes("if (family === 'pharmacy')") &&
    !sources.routeResolver.includes("if (family === 'hospital')"),
  `${files.routeResolver}: Pharmacy/Hospital route disablement drifted.`,
);
assert(
  sources.sitemapReader.includes(
    'type SupportedImportSitemapEntityType = "doctor" | "pharmacy" | "hospital";',
  ) &&
    sources.sitemapReader.includes('resolveImportProviderAuthority') &&
    sources.sitemapReader.includes('resolvePublicProviderCanonicalRoute') &&
    sources.sitemapReader.includes('resolvedRoute.publicRouteEnabled'),
  `${files.sitemapReader}: import sitemap must consume canonical family and route authorities.`,
);
assert(
  sources.roadmap.includes('"currentNext": "PHARMACY-PUBLIC-NOINDEX-LIFECYCLE"') &&
    sources.roadmap.includes('Registry Convergence complete'),
  `${files.roadmap}: convergence completion/next transition is not aligned.`,
);

for (const forbidden of [
  'createSupabaseServiceRoleClient',
  '.insert(',
  '.update(',
  '.delete(',
  'supabase db',
]) {
  assert(
    !sources.audit.includes(forbidden),
    `${files.audit}: audit document must not authorize runtime or database mutation token ${forbidden}.`,
  );
}

console.log('registry authority audit check passed.');
