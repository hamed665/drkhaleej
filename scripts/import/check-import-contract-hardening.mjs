import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const packageRoot = 'docs/ai-agent-program/drkhaleej-ai-agent-program-2026-v1.2.2';
const files = {
  reconciliation: 'docs/import/contract-hardening-reconciliation.json',
  docs: 'docs/import/CONTRACT_HARDENING.md',
  canonicalHash: 'src/server/admin/import-contract-canonical-hash.ts',
  canonicalHashTests: 'src/server/admin/import-contract-canonical-hash.test.ts',
  entityDomain: 'src/server/admin/import-entity-domain.ts',
  intake: 'src/server/admin/import-intake-convergence.ts',
  sourceEvidence: 'src/server/admin/import-source-evidence-ledger.ts',
  duplicateGeo: 'src/server/admin/import-duplicate-geo-contract.ts',
  packageJson: 'package.json',
  workflow: '.github/workflows/preview-migration-sync.yml',
};

const sources = Object.fromEntries(
  await Promise.all(Object.entries(files).map(async ([key, file]) => [key, await readFile(file, 'utf8')])),
);
const reconciliation = JSON.parse(sources.reconciliation);

function fail(message) {
  throw new Error(`contract hardening: ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function requireTokens(file, source, tokens) {
  for (const token of tokens) assert(source.includes(token), `${file}: missing required token ${token}`);
}

assert(reconciliation.schemaVersion === 'drkhaleej.import.contractHardeningReconciliation.v1', 'unsupported reconciliation version');
assert(reconciliation.baseline?.pullRequest === 970, 'baseline PR must be 970');
assert(reconciliation.baseline?.commit === 'd17ce242ae442ca607a9167abfcf01ede1261ceb', 'baseline commit drifted');
assert(reconciliation.baseline?.alignedAt === '2026-08-08', 'baseline alignment date drifted');
assert(reconciliation.contractPackageVersion === '1.2.2', 'contract package version drifted');
assert(reconciliation.canonicalizationVersion === 'drkhaleej.import.canonicalJson.v1', 'canonicalization version drifted');
assert(reconciliation.currentNext === 'ENTITY-CANDIDATE-PIPELINE', 'next gate drifted');

const contractDirectory = path.join(packageRoot, 'contracts');
const schemaNames = (await readdir(contractDirectory))
  .filter((name) => name.endsWith('.schema.json'))
  .sort();
const manifestContracts = [...(reconciliation.contracts ?? [])]
  .sort((left, right) => left.schemaPath.localeCompare(right.schemaPath));
assert(schemaNames.length === 9, `expected 9 schemas, found ${schemaNames.length}`);
assert(manifestContracts.length === 9, `expected 9 reconciliation entries, found ${manifestContracts.length}`);
assert(new Set(manifestContracts.map((entry) => entry.schemaPath)).size === 9, 'duplicate schema path in reconciliation');

for (let index = 0; index < schemaNames.length; index += 1) {
  const expectedPath = `contracts/${schemaNames[index]}`;
  const entry = manifestContracts[index];
  assert(entry.schemaPath === expectedPath, `schema inventory drifted at ${expectedPath}`);
  const schema = JSON.parse(await readFile(path.join(packageRoot, expectedPath), 'utf8'));
  assert(schema.$id === entry.schemaId, `${expectedPath}: schema id drifted`);
  assert(schema.properties?.schema_version?.const === '1.2.2', `${expectedPath}: schema version drifted`);
  assert(schema.additionalProperties === false, `${expectedPath}: root boundary must stay closed`);
  assert(
    entry.status === 'HARDENED_SCHEMA_ONLY' || entry.status === 'HARDENED_CANDIDATE_BOUNDARY',
    `${expectedPath}: unsupported hardening status`,
  );
}

const entityObject = sources.entityDomain.match(/export const IMPORT_ENTITY_DOMAIN_BY_TYPE = \{([\s\S]*?)\n\} as const/);
assert(entityObject, `${files.entityDomain}: entity registry not found`);
const currentEntityFamilies = [...entityObject[1].matchAll(/^\s{2}([a-z_]+):/gm)].map((match) => match[1]);
const entitySchema = JSON.parse(await readFile(path.join(contractDirectory, 'entity-draft.schema.json'), 'utf8'));
assert(
  JSON.stringify(entitySchema.properties?.entity_family?.enum) === JSON.stringify(currentEntityFamilies),
  'entity-draft family vocabulary is not exact current ImportEntityType order',
);

requireTokens(files.intake, sources.intake, [
  'drkhaleej.import.intake.v1',
  'directEntityWriteAllowed: false',
  'source === "ai_assisted"',
]);
requireTokens(files.sourceEvidence, sources.sourceEvidence, [
  'drkhaleej.import.sourceEvidenceLedger.v1',
  'rawPayloadInCanonicalDatabaseAllowed: false',
  'directEntityWriteAllowed: false',
  'publishAllowed: false',
]);
requireTokens(files.duplicateGeo, sources.duplicateGeo, [
  'drkhaleej.import.duplicateGeo.v1',
  'drkhaleej.import.duplicateGeoPolicy.v1',
  'duplicateCandidates: "import_duplicate_candidates"',
  'governorateId: "geo_regions.id"',
  'duplicateResolutionAllowed: false',
  'geoVerificationAllowed: false',
  'directEntityWriteAllowed: false',
  'publishAllowed: false',
]);

const expectedAuthorities = {
  entityFamily: 'src/server/admin/import-entity-domain.ts#ImportEntityType',
  intake: 'drkhaleej.import.intake.v1',
  sourceEvidence: 'drkhaleej.import.sourceEvidenceLedger.v1',
  duplicateGeoSchema: 'drkhaleej.import.duplicateGeo.v1',
  duplicateGeoPolicy: 'drkhaleej.import.duplicateGeoPolicy.v1',
  duplicateCandidates: 'import_duplicate_candidates',
  governorate: 'geo_regions.id',
};
assert(JSON.stringify(reconciliation.currentAuthorities) === JSON.stringify(expectedAuthorities), 'current authority mapping drifted');
for (const [claim, allowed] of Object.entries(reconciliation.authorityClaims ?? {})) {
  assert(allowed === false, `${claim} must remain false`);
}
assert(Object.keys(reconciliation.authorityClaims ?? {}).length === 8, 'authority claim inventory drifted');
for (const [change, changed] of Object.entries(reconciliation.repositoryChanges ?? {})) {
  assert(changed === false, `${change} must remain false`);
}
assert(Object.keys(reconciliation.repositoryChanges ?? {}).length === 4, 'repository change inventory drifted');

requireTokens(files.canonicalHash, sources.canonicalHash, [
  'drkhaleej.import.canonicalJson.v1',
  'createHash(IMPORT_CONTRACT_HASH_ALGORITHM)',
  '.normalize("NFC")',
  '[...normalized.keys()].sort()',
  'Object.is(value, -0) ? 0 : value',
  'key_normalization_collision',
  'serialized_size_exceeded',
]);
requireTokens(files.canonicalHashTests, sources.canonicalHashTests, [
  'is deterministic across object key order',
  'normalizes Unicode strings and keys to NFC',
  'preserves null, empty-string and array-order semantics',
  'domain-separates contract and schema versions',
  'fails closed on unsupported, non-finite and cyclic values',
]);

const forbiddenRuntimeTokens = [
  'createClient(', '@supabase/', 'supabase.', '.from(', '.insert(', '.upsert(', '.rpc(',
  'CREATE TABLE', 'CREATE POLICY', 'ALTER TABLE', 'fetch(',
];
for (const token of forbiddenRuntimeTokens) {
  assert(!sources.canonicalHash.includes(token), `${files.canonicalHash}: forbidden runtime authority token ${token}`);
}

requireTokens(files.docs, sources.docs, [
  'Gate B',
  'PR #970',
  '`ImportEntityType`',
  '`geo_regions.id`',
  '`drkhaleej.import.canonicalJson.v1`',
  '`agentReviewAllowed: false`',
  '`workerRuntimeAllowed: false`',
  '`contentRuntimeAllowed: false`',
  '`publishAllowed: false`',
  '`ENTITY-CANDIDATE-PIPELINE`',
]);
requireTokens(files.packageJson, sources.packageJson, [
  '"import:contract-hardening:validate"',
  'check-import-contract-hardening.mjs',
  'import-contract-canonical-hash.test.ts',
]);
requireTokens(files.workflow, sources.workflow, [
  'Install locked contract validator dependencies',
  'pnpm import:contract-hardening:validate',
]);

console.log('import contract hardening reconciliation check passed.');
