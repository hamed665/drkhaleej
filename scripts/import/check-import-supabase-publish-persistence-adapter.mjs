import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourcePath = 'src/server/admin/import-supabase-publish-persistence-adapter.ts';
const contractPath = 'src/server/admin/import-private-persistence-adapter.ts';
const fixturePath = 'fixtures/import/import-supabase-publish-persistence-adapter.fixture.json';
const docsPath = 'docs/platform/DRKHALEEJ_SUPABASE_PUBLISH_PERSISTENCE_ADAPTER.md';
const auditPath = 'scripts/import/check-import-publish-readiness-audit.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

const source = await readText(sourcePath);
const contract = await readText(contractPath);
const fixture = JSON.parse(await readText(fixturePath));
const docs = await readText(docsPath);
const audit = await readText(auditPath);

for (const token of [
  'import "server-only"',
  'createImportSupabasePublishPersistenceAdapter',
  'ImportSupabaseRpcClient',
  'import_publish_reserve_snapshot_audit',
  'import_publish_persist_terminal_result',
  'p_snapshot_hash',
  'sha256Json',
  'normalizeReservationResponse',
  'normalizeTerminalResponse',
  'request_already_in_progress',
  'concurrent_idempotency_conflict',
  'idempotency_key_request_hash_mismatch',
  'rpc_failed',
]) {
  assert(source.includes(token), `${sourcePath} must include ${token}.`);
}

for (const token of [
  'ImportPublishPersistenceTerminalWriteRequest',
  'reservationId: string',
  'actualVersion: string',
  'auditSchemaVersion: string',
  'ImportPublishPersistenceTerminalWriteResult',
]) {
  assert(contract.includes(token), `${contractPath} must include ${token}.`);
}

for (const forbidden of [
  '.from(',
  'publishEntity(',
  'executePublish(',
  'bulkPublish(',
  'sitemap',
  'visibility',
  '"use server"',
  'createRoute',
]) {
  assert(!source.includes(forbidden), `${sourcePath} must not include forbidden runtime token ${forbidden}.`);
}

assert(
  fixture.schemaVersion === 'drkhaleej.import.supabasePublishPersistenceAdapter.v1',
  'Supabase persistence adapter fixture schema version is invalid.',
);
assert(Array.isArray(fixture.cases) && fixture.cases.length >= 6, 'fixture must include at least six cases.');
assert(fixture.safety?.serverOnly === true, 'fixture must require server-only execution.');
assert(fixture.safety?.rpcOnly === true, 'fixture must require RPC-only persistence.');
assert(fixture.safety?.entityMutation === false, 'fixture must keep entity mutation disabled.');
assert(fixture.safety?.bulkPublish === false, 'fixture must keep bulk publish disabled.');

for (const token of [
  'Private server-only adapter',
  'Two approved RPCs only',
  'Closed result normalization',
  'Fail-closed error handling',
  'No imported-entity mutation',
  'No Admin action',
  'No bulk publish',
]) {
  assert(docs.includes(token), `${docsPath} must include ${token}.`);
}

assert(
  audit.includes("import './check-import-supabase-publish-persistence-adapter.mjs';"),
  'publish readiness audit must chain the Supabase persistence adapter validator.',
);

console.log('import Supabase publish persistence adapter check passed.');
