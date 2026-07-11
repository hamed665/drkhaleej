import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contractPath = 'src/server/admin/import-private-persistence-adapter.ts';
const fixturePath = 'fixtures/import/import-private-persistence-adapter.fixture.json';
const docsPath = 'docs/platform/DRKHALEEJ_PRIVATE_PERSISTENCE_ADAPTER.md';
const auditPath = 'scripts/import/check-import-publish-readiness-audit.mjs';

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

for (const token of [
  'ImportPrivatePublishPersistenceAdapter',
  'ImportPublishPersistenceTransactionRequest',
  'ImportPublishPersistenceTerminalResult',
  'ImportPublishPersistenceTransactionResult',
  'runReservationSnapshotAuditTransaction',
  'persistTerminalResult',
  'kind: "reserved"',
  'kind: "replayed"',
  'kind: "conflict"',
  'kind: "failed"',
  'mode: "private_adapter_contract_only"',
  'adapterReady: false',
  'executionReady: false',
  'mutationEnabled: false',
  'bulkAllowed: false',
  'databaseOperations: []',
]) {
  assert(source.includes(token), `${contractPath} must include ${token}.`);
}

for (const blocker of [
  'transaction_contract_not_ready',
  'private_server_boundary_missing',
  'atomic_transaction_missing',
  'idempotency_reservation_missing',
  'rollback_snapshot_write_missing',
  'audit_event_write_missing',
  'replay_lookup_missing',
  'conflict_detection_missing',
  'terminal_result_write_missing',
  'adapter_not_enabled',
]) {
  assert(source.includes(blocker), `${contractPath} must include blocker ${blocker}.`);
}

for (const forbidden of [
  'createSupabaseServiceRoleClient',
  '.from(',
  'rpc(',
  'publishEntity(',
  'executePublish(',
  'bulkPublish(',
  '"use server"',
]) {
  assert(!source.includes(forbidden), `${contractPath} must not include runtime persistence token ${forbidden}.`);
}

assert(
  fixture.schemaVersion === 'drkhaleej.import.privatePersistenceAdapter.v1',
  'private persistence adapter fixture schema version is invalid.',
);
assert(Array.isArray(fixture.cases) && fixture.cases.length >= 4, 'fixture must include at least four cases.');

const readyCase = fixture.cases.find((testCase) => testCase.id === 'contract-ready-adapter-disabled');
assert(readyCase?.expected.contractReady === true, 'fixture must include a contract-ready case.');
assert(readyCase?.expected.adapterReady === false, 'contract-ready case must keep adapter disabled.');
assert(readyCase?.expected.executionReady === false, 'contract-ready case must keep execution disabled.');
assert(readyCase?.expected.mutationEnabled === false, 'contract-ready case must keep mutation disabled.');
assert(readyCase?.expected.bulkAllowed === false, 'contract-ready case must keep bulk disabled.');

for (const token of [
  'Private server boundary',
  'Atomic reservation transaction',
  'Explicit result union',
  'Replay and conflict behavior',
  'No database adapter implementation',
  'No publish mutation',
  'No bulk publish',
]) {
  assert(docs.includes(token), `${docsPath} must include ${token}.`);
}

assert(
  audit.includes("import './check-import-private-persistence-adapter.mjs';"),
  'publish readiness audit must chain the private persistence adapter validator.',
);

console.log('import private persistence adapter contract check passed.');
