import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contractPath = 'src/server/admin/import-controlled-single-publish-contract.ts';
const fixturePath = 'fixtures/import/import-controlled-single-publish-contract.fixture.json';
const docsPath = 'docs/platform/DRKHALEEJ_CONTROLLED_SINGLE_PUBLISH_CONTRACT.md';
const auditPath = 'scripts/import/check-import-publish-readiness-audit.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

const source = await readText(contractPath);
const docs = await readText(docsPath);
const audit = await readText(auditPath);
const fixture = JSON.parse(await readText(fixturePath));

for (const token of [
  'ImportControlledSinglePublishBlocker',
  'ImportControlledSinglePublishRequest',
  'ImportControlledSinglePublishPlan',
  'getImportControlledSinglePublishBlockers',
  'getImportControlledSinglePublishPlan',
  'isImportControlledSinglePublishContractReady',
  'mode: "contract_only"',
  'executionReady: false',
  'auditRequired: true',
  'rollbackRequired: true',
  'transactionRequired: true',
  'bulkAllowed: false',
]) {
  assert(source.includes(token), `${contractPath} must include ${token}.`);
}

for (const blocker of [
  'entity_id_missing',
  'multiple_targets_not_allowed',
  'actor_id_missing',
  'idempotency_key_missing',
  'expected_version_missing',
  'readiness_not_ready',
  'manual_publish_flow_blocked',
  'sitemap_not_eligible',
  'audit_log_unavailable',
  'rollback_snapshot_missing',
  'transaction_boundary_missing',
  'dry_run_not_reviewed',
  'mutation_not_enabled',
]) {
  assert(source.includes(blocker), `${contractPath} must include blocker ${blocker}.`);
}

for (const forbidden of [
  'createSupabaseServiceRoleClient',
  'insert(',
  'update(',
  'delete(',
  'rpc(',
  'publishEntity(',
  'bulkPublish(',
  '"use server"',
]) {
  assert(!source.includes(forbidden), `${contractPath} must not include runtime mutation token ${forbidden}.`);
}

assert(
  fixture.schemaVersion === 'drkhaleej.import.controlledSinglePublishContract.v1',
  'controlled single publish fixture schema version is invalid.',
);
assert(Array.isArray(fixture.cases) && fixture.cases.length >= 4, 'fixture must include at least four cases.');

const readyCase = fixture.cases.find((testCase) => testCase.id === 'contract-ready-execution-disabled');
assert(readyCase, 'fixture must include contract-ready-execution-disabled.');
assert(readyCase.expected.contractReady === true, 'ready case must be contract-ready.');
assert(readyCase.expected.executionReady === false, 'ready case must remain execution-disabled.');
assert(readyCase.expected.bulkAllowed === false, 'bulk must remain disabled.');
assert(readyCase.expected.blockers.includes('mutation_not_enabled'), 'ready case must retain mutation_not_enabled.');

const multipleCase = fixture.cases.find((testCase) => testCase.id === 'multiple-targets-blocked');
assert(multipleCase?.expected.blockers.includes('multiple_targets_not_allowed'), 'fixture must block multiple targets.');

for (const token of [
  'Contract only',
  'Exactly one entity',
  'Idempotency key',
  'Expected version',
  'Audit trail',
  'Rollback snapshot',
  'Single transaction',
  'Dry-run review',
  'No mutation implementation',
  'No bulk publish',
]) {
  assert(docs.includes(token), `${docsPath} must include ${token}.`);
}

assert(
  audit.includes("import './check-import-controlled-single-publish-contract.mjs';"),
  'publish readiness audit must chain the controlled single publish validator.',
);

console.log('import controlled single publish contract check passed.');
