import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contractPath = 'src/server/admin/import-publish-reservation-snapshot-transaction.ts';
const fixturePath = 'fixtures/import/import-publish-reservation-snapshot-transaction.fixture.json';
const docsPath = 'docs/platform/DRKHALEEJ_PUBLISH_RESERVATION_SNAPSHOT_TRANSACTION.md';
const auditPath = 'scripts/import/check-import-publish-readiness-audit.mjs';

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const readText = (relativePath) => readFile(path.join(root, relativePath), 'utf8');

const source = await readText(contractPath);
const fixture = JSON.parse(await readText(fixturePath));
const docs = await readText(docsPath);
const audit = await readText(auditPath);

for (const token of [
  'ImportPublishReservationSnapshotBlocker',
  'ImportPublishReservationSnapshotTransactionInput',
  'ImportPublishReservationSnapshotTransactionPlan',
  'getImportPublishReservationSnapshotTransactionPlan',
  'isImportPublishReservationSnapshotTransactionContractReady',
  'mode: "transaction_contract_only"',
  'reserve_idempotency_key',
  'capture_rollback_snapshot',
  'append_execution_started_audit',
  'atomicity: "single_transaction"',
  'return_existing_terminal_result_or_fail_closed',
  'persistenceReady: false',
  'executionReady: false',
  'mutationEnabled: false',
  'bulkAllowed: false',
  'databaseOperations: []',
]) assert(source.includes(token), `${contractPath} must include ${token}.`);

for (const blocker of [
  'dry_run_plan_not_ready', 'persistence_schema_not_ready', 'transaction_coordinator_unavailable',
  'entity_id_missing', 'actor_id_missing', 'idempotency_key_missing', 'request_hash_invalid',
  'expected_version_missing', 'rollback_snapshot_incomplete', 'audit_schema_version_missing',
  'reservation_ttl_invalid', 'rollback_retention_invalid', 'persistence_not_enabled',
]) assert(source.includes(blocker), `${contractPath} must include blocker ${blocker}.`);

for (const forbidden of [
  'createSupabaseServiceRoleClient', '.from(', 'insert(', 'update(', 'delete(', 'rpc(',
  'publishEntity(', 'executePublish(', 'bulkPublish(', '"use server"',
]) assert(!source.includes(forbidden), `${contractPath} must not include runtime persistence token ${forbidden}.`);

assert(fixture.schemaVersion === 'drkhaleej.import.publishReservationSnapshotTransaction.v1', 'fixture schema version is invalid.');
assert(Array.isArray(fixture.cases) && fixture.cases.length >= 4, 'fixture must include at least four cases.');
const readyCase = fixture.cases.find((item) => item.id === 'contract-ready-persistence-disabled');
assert(readyCase?.expected.contractReady === true, 'fixture must include a contract-ready case.');
assert(readyCase?.expected.persistenceReady === false, 'persistence must remain disabled.');
assert(readyCase?.expected.executionReady === false, 'execution must remain disabled.');
assert(readyCase?.expected.databaseOperationCount === 0, 'contract must perform zero database operations.');

for (const token of [
  'Ordered transaction', 'Idempotency conflict behavior', 'one transaction', 'Partial success is forbidden',
  'No database adapter implementation', 'No reservation write', 'No snapshot write', 'No audit write',
  'No publish mutation', 'No bulk publish',
]) assert(docs.includes(token), `${docsPath} must include ${token}.`);

assert(audit.includes("import './check-import-publish-reservation-snapshot-transaction.mjs';"), 'publish readiness audit must chain reservation transaction validator.');

console.log('import publish reservation snapshot transaction check passed.');
