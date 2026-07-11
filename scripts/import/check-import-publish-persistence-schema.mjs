import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const migrationPath = 'supabase/migrations/0068_import_publish_persistence_schema.sql';
const contractPath = 'src/server/admin/import-publish-persistence-schema.ts';
const fixturePath = 'fixtures/import/import-publish-persistence-schema.fixture.json';
const docsPath = 'docs/platform/DRKHALEEJ_PUBLISH_PERSISTENCE_SCHEMA.md';
const auditPath = 'scripts/import/check-import-publish-readiness-audit.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

const migration = await readText(migrationPath);
const contract = await readText(contractPath);
const fixture = JSON.parse(await readText(fixturePath));
const docs = await readText(docsPath);
const audit = await readText(auditPath);

for (const table of [
  'import_publish_idempotency_records',
  'import_publish_rollback_snapshots',
  'import_publish_audit_events',
]) {
  assert(migration.includes(`public.${table}`), `${migrationPath} must include ${table}.`);
  assert(
    new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`, 'i').test(migration),
    `${migrationPath} must enable RLS on ${table}.`,
  );
}

for (const token of [
  'idempotency_key text NOT NULL UNIQUE',
  "request_hash ~ '^[a-f0-9]{64}$'",
  "snapshot_hash ~ '^[a-f0-9]{64}$'",
  "interval '168 hours'",
  "interval '365 days'",
  'ON DELETE RESTRICT',
  "jsonb_typeof(snapshot_payload) = 'object'",
  "jsonb_typeof(event_payload) = 'object'",
]) {
  assert(migration.includes(token), `${migrationPath} must include integrity token ${token}.`);
}

for (const forbidden of [
  'CREATE POLICY',
  'TO anon',
  'TO authenticated',
  'TO service_role',
  'INSERT INTO',
  'DROP TABLE',
]) {
  assert(!migration.toUpperCase().includes(forbidden.toUpperCase()), `${migrationPath} must not include ${forbidden}.`);
}

for (const token of [
  'ImportPublishPersistenceTable',
  'ImportPublishPersistenceBlocker',
  'ImportPublishPersistenceSchemaInput',
  'ImportPublishPersistenceSchemaReadiness',
  'IMPORT_PUBLISH_PERSISTENCE_REQUIRED_TABLES',
  'getImportPublishPersistenceSchemaReadiness',
  'isImportPublishPersistenceSchemaReady',
  'executionReady: false',
  'mutationEnabled: false',
  'bulkAllowed: false',
]) {
  assert(contract.includes(token), `${contractPath} must include ${token}.`);
}

assert(
  fixture.schemaVersion === 'drkhaleej.import.publishPersistenceSchema.v1',
  'publish persistence fixture schema version is invalid.',
);
assert(Array.isArray(fixture.cases) && fixture.cases.length >= 4, 'fixture must include at least four cases.');
const readyCase = fixture.cases.find((testCase) => testCase.id === 'schema-ready-execution-disabled');
assert(readyCase?.expected.schemaReady === true, 'fixture must include a schema-ready case.');
assert(readyCase?.expected.executionReady === false, 'schema-ready case must remain execution-disabled.');
assert(readyCase?.expected.mutationEnabled === false, 'schema-ready case must keep mutation disabled.');
assert(readyCase?.expected.bulkAllowed === false, 'schema-ready case must keep bulk disabled.');

for (const token of [
  'Idempotency records',
  'Rollback snapshots',
  'Audit events',
  'Row Level Security',
  'private-by-default',
  'no publish executor',
  'no runtime database writes',
  'no bulk publish',
]) {
  assert(docs.toLowerCase().includes(token.toLowerCase()), `${docsPath} must include ${token}.`);
}

assert(
  audit.includes("import './check-import-publish-persistence-schema.mjs';"),
  'publish readiness audit must chain the publish persistence schema validator.',
);

console.log('import publish persistence schema check passed.');
