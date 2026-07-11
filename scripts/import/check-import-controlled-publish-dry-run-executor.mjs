import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contractPath = 'src/server/admin/import-controlled-publish-dry-run-executor.ts';
const fixturePath = 'fixtures/import/import-controlled-publish-dry-run-executor.fixture.json';
const docsPath = 'docs/platform/DRKHALEEJ_CONTROLLED_PUBLISH_DRY_RUN_EXECUTOR.md';
const auditPath = 'scripts/import/check-import-publish-readiness-audit.mjs';
const requestedSection = process.argv.find((argument) => argument.startsWith('--section='))?.split('=')[1] ?? 'all';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

const source = await readText(contractPath);
const fixture = JSON.parse(await readText(fixturePath));
const docs = await readText(docsPath);
const audit = await readText(auditPath);

function shouldRun(section) {
  return requestedSection === 'all' || requestedSection === section;
}

if (shouldRun('source')) {
  for (const token of [
    'ImportControlledPublishDryRunBlocker',
    'ImportControlledPublishState',
    'ImportControlledPublishDryRunInput',
    'ImportControlledPublishDryRunPlan',
    'getImportControlledPublishDryRunPlan',
    'isImportControlledPublishDryRunPlanReady',
    'mode: "dry_run_only"',
    'createHash("sha256")',
    'rollbackPreview',
    'auditPreview',
    'executionReady: false',
    'mutationEnabled: false',
    'bulkAllowed: false',
    'databaseOperations: []',
  ]) {
    assert(source.includes(token), `${contractPath} must include ${token}.`);
  }

  for (const blocker of [
    'controlled_publish_contract_not_ready',
    'executor_infrastructure_not_ready',
    'persistence_schema_not_ready',
    'entity_id_missing',
    'actor_id_missing',
    'idempotency_key_missing',
    'expected_version_missing',
    'current_version_missing',
    'version_mismatch',
    'canonical_route_missing',
    'projection_version_missing',
    'snapshot_incomplete',
  ]) {
    assert(source.includes(blocker), `${contractPath} must include blocker ${blocker}.`);
  }

  for (const field of [
    'visibility',
    'indexPolicy',
    'sitemapPolicy',
    'publishStatus',
    'publicReady',
    'projectionVersion',
    'canonicalRoute',
  ]) {
    assert(source.includes(field), `${contractPath} must preserve rollback field ${field}.`);
  }

  for (const forbidden of [
    'createSupabaseServiceRoleClient',
    '.from(',
    'insert(',
    'update(',
    'delete(',
    'rpc(',
    'publishEntity(',
    'executePublish(',
    'bulkPublish(',
    '"use server"',
  ]) {
    assert(!source.includes(forbidden), `${contractPath} must not include runtime mutation token ${forbidden}.`);
  }
}

if (shouldRun('fixture')) {
  assert(
    fixture.schemaVersion === 'drkhaleej.import.controlledPublishDryRunExecutor.v1',
    'controlled publish dry-run fixture schema version is invalid.',
  );
  assert(Array.isArray(fixture.cases) && fixture.cases.length >= 4, 'fixture must include at least four cases.');

  const readyCase = fixture.cases.find((testCase) => testCase.id === 'plan-ready-no-writes');
  assert(readyCase?.expected.planReady === true, 'fixture must include a plan-ready case.');
  assert(readyCase?.expected.executionReady === false, 'plan-ready case must remain execution-disabled.');
  assert(readyCase?.expected.mutationEnabled === false, 'plan-ready case must keep mutation disabled.');
  assert(readyCase?.expected.bulkAllowed === false, 'plan-ready case must keep bulk disabled.');
  assert(readyCase?.expected.databaseOperationCount === 0, 'plan-ready case must perform zero database operations.');

  const mismatchCase = fixture.cases.find((testCase) => testCase.id === 'version-mismatch-blocked');
  assert(mismatchCase?.expected.blockers.includes('version_mismatch'), 'fixture must block optimistic-lock mismatch.');
}

if (shouldRun('docs')) {
  for (const token of [
    'Deterministic request hash',
    'Change and rollback previews',
    'Audit preview',
    'Dry-run only',
    'No database reads or writes',
    'No publish mutation',
    'No bulk publish',
  ]) {
    assert(docs.includes(token), `${docsPath} must include ${token}.`);
  }
}

if (shouldRun('audit')) {
  assert(
    audit.includes("import './check-import-controlled-publish-dry-run-executor.mjs';"),
    'publish readiness audit must chain the controlled publish dry-run validator.',
  );
}

console.log(`import controlled publish dry-run executor ${requestedSection} check passed.`);
