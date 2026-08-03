import { readFile } from 'node:fs/promises';

const files = {
  contract: 'src/server/admin/import-duplicate-geo-contract.ts',
  tests: 'src/server/admin/import-duplicate-geo-contract.test.ts',
  docs: 'docs/import/DUPLICATE_GEO_CONTRACT.md',
};

const sources = Object.fromEntries(
  await Promise.all(Object.entries(files).map(async ([key, file]) => [key, await readFile(file, 'utf8')])),
);

function requireTokens(file, source, tokens) {
  for (const token of tokens) {
    if (!source.includes(token)) throw new Error(`${file}: missing required token ${token}`);
  }
}

requireTokens(files.contract, sources.contract, [
  'drkhaleej.import.duplicateGeo.v1',
  'drkhaleej.import.duplicateGeoPolicy.v1',
  'governorateId: "geo_regions.id"',
  'duplicateCandidates: "import_duplicate_candidates"',
  'candidatePersistenceAllowed: true',
  'duplicateResolutionAllowed: false',
  'duplicateMergeAllowed: false',
  'geoVerificationAllowed: false',
  'directEntityWriteAllowed: false',
  'publishAllowed: false',
  'schema_version_unsupported',
  'policy_version_unsupported',
  'evidence_reference_unbound',
  'confirmed_duplicate',
]);

requireTokens(files.tests, sources.tests, [
  'describe("duplicate / geo candidate contract"',
  'fails closed on unknown schema and policy versions',
  'rejects explicit merge, verification, entity-write and publish claims',
  'rejects confirmed_duplicate as a candidate status',
  'requires both P16 intake and P17 source evidence references',
  'reconciles governorateId to the existing geo_regions authority',
]);

requireTokens(files.docs, sources.docs, [
  'P18',
  '`geo_regions.id`',
  '`import_duplicate_candidates`',
  '`confirmed_duplicate`',
  '`duplicateMergeAllowed: false`',
  '`geoVerificationAllowed: false`',
  '`directEntityWriteAllowed: false`',
  '`publishAllowed: false`',
  'CONTRACT-HARDENING',
]);

const forbiddenRuntimeTokens = [
  'createClient(', '.from(', '.insert(', '.update(', '.delete(', '.upsert(', '.rpc(',
  'CREATE TABLE', 'CREATE POLICY', 'ALTER TABLE', 'fetch(',
];
for (const token of forbiddenRuntimeTokens) {
  if (sources.contract.includes(token)) throw new Error(`${files.contract}: forbidden runtime authority token ${token}`);
}

console.log('import duplicate / geo candidate contract check passed.');
