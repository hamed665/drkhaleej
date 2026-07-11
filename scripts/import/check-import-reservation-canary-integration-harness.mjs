#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourcePath = 'src/server/admin/import-reservation-canary-integration-harness.ts';
const fixturePath = 'fixtures/import/import-reservation-canary-integration-harness.fixture.json';
const docsPath = 'docs/platform/DRKHALEEJ_RESERVATION_CANARY_INTEGRATION_HARNESS.md';
const auditPath = 'scripts/import/check-import-publish-readiness-audit.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

const source = await readText(sourcePath);
const fixture = JSON.parse(await readText(fixturePath));
const docs = await readText(docsPath);
const audit = await readText(auditPath);

for (const token of [
  'runImportReservationCanaryHarness',
  'runAllImportReservationCanaryHarnessScenarios',
  'createImportSupabasePublishPersistenceAdapter',
  'import_publish_reserve_snapshot_audit',
  'databaseConnected: false',
  'entityMutationAttempted: false',
  'terminalPersistenceAttempted: false',
  '"reserved"',
  '"replayed"',
  '"conflict"',
  '"failed"',
]) {
  assert(source.includes(token), `${sourcePath} must include ${token}.`);
}

for (const forbidden of [
  '.from(',
  'persistTerminalResult(',
  'createClient(',
  'process.env',
  'fetch(',
  '"use server"',
  'publishEntity(',
  'bulkPublish(',
]) {
  assert(!source.includes(forbidden), `${sourcePath} must not include ${forbidden}.`);
}

assert(
  fixture.schemaVersion === 'drkhaleej.import.reservationCanaryIntegrationHarness.v1',
  'reservation canary harness fixture schema version is invalid.',
);
assert(fixture.rpcName === 'import_publish_reserve_snapshot_audit', 'fixture RPC name is invalid.');
assert(fixture.databaseConnected === false, 'harness must not connect to a database.');
assert(fixture.entityMutationAttempted === false, 'harness must not attempt entity mutation.');
assert(fixture.terminalPersistenceAttempted === false, 'harness must not attempt terminal persistence.');
assert(Array.isArray(fixture.cases) && fixture.cases.length === 4, 'fixture must include four scenarios.');

const scenarios = fixture.cases.map((testCase) => testCase.scenario).sort();
assert(
  JSON.stringify(scenarios) === JSON.stringify(['conflict', 'failed', 'replayed', 'reserved']),
  'fixture scenarios are incomplete.',
);
assert(fixture.cases.every((testCase) => testCase.expectedRpcCalls === 1), 'each case must call one fake RPC.');

for (const token of [
  'No database connection',
  'Fake RPC client',
  'reserved / replayed / conflict / failed',
  'No entity mutation',
  'No terminal persistence',
]) {
  assert(docs.includes(token), `${docsPath} must include ${token}.`);
}

assert(
  audit.includes("import './check-import-reservation-canary-integration-harness.mjs';"),
  'publish readiness audit must chain the reservation canary integration harness validator.',
);

console.log('import reservation canary integration harness check passed.');
