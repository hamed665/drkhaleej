#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourcePath = 'src/server/admin/import-preview-reservation-adapter-wiring.ts';
const fixturePath = 'fixtures/import/import-preview-reservation-adapter-wiring.fixture.json';
const docsPath = 'docs/platform/DRKHALEEJ_PREVIEW_RESERVATION_ADAPTER_WIRING.md';
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
  'IMPORT_PREVIEW_RESERVATION_ADAPTER_WIRING_ENABLED = false as const',
  'createImportPreviewReservationAdapterWiring',
  'ImportPreviewReservationAdapter',
  'runReservationSnapshotAuditTransaction',
  'mode: "preview_wiring_disabled"',
  'clientConstructed: false',
  'terminalPersistenceAllowed: false',
  'entityMutationAllowed: false',
  'bulkAllowed: false',
  'allowedEnvironment: "preview"',
  'import_publish_reserve_snapshot_audit',
]) {
  assert(source.includes(token), `${sourcePath} must include ${token}.`);
}

for (const blocker of [
  'environment_not_preview',
  'service_role_not_configured',
  'reservation_mode_not_enabled',
  'preview_wiring_disabled',
]) {
  assert(source.includes(blocker), `${sourcePath} must include blocker ${blocker}.`);
}

for (const forbidden of [
  'process.env',
  'createClient(',
  'createServerClient(',
  'persistTerminalResult:',
  'persistTerminalResult(',
  'import_publish_persist_terminal_result',
  'fetch(',
  'IMPORT_PREVIEW_RESERVATION_ADAPTER_WIRING_ENABLED = true',
  '"use server"',
]) {
  assert(!source.includes(forbidden), `${sourcePath} must not include ${forbidden}.`);
}

assert(
  fixture.schemaVersion === 'drkhaleej.import.previewReservationAdapterWiring.v1',
  'preview reservation adapter wiring fixture schema version is invalid.',
);
assert(Array.isArray(fixture.cases) && fixture.cases.length >= 4, 'fixture must include at least four cases.');

const readyCase = fixture.cases.find((testCase) => testCase.id === 'preview-ready-but-disabled');
assert(readyCase?.expected.wiringReady === true, 'fixture must include a wiring-ready case.');
assert(readyCase?.expected.clientConstructed === false, 'disabled wiring must not construct a client.');
assert(readyCase?.expected.adapterAvailable === false, 'disabled wiring must not expose an adapter.');

assert(fixture.safety?.environmentVariableAccess === false, 'fixture must forbid environment access.');
assert(fixture.safety?.supabaseClientConstruction === false, 'fixture must forbid client construction.');
assert(fixture.safety?.rpcAttempted === false, 'fixture must forbid RPC attempts.');
assert(fixture.safety?.terminalPersistenceAllowed === false, 'terminal persistence must remain forbidden.');
assert(fixture.safety?.entityMutationAllowed === false, 'entity mutation must remain forbidden.');
assert(fixture.safety?.bulkAllowed === false, 'bulk publish must remain forbidden.');

for (const token of [
  'server-only preview factory',
  'Dependency injection boundary',
  'While the hard flag is false, the callback is never invoked',
  'Terminal-result persistence remains forbidden',
  'No environment-variable access',
  'No bulk publish',
]) {
  assert(docs.includes(token), `${docsPath} must include ${token}.`);
}

assert(
  audit.includes("import './check-import-preview-reservation-adapter-wiring.mjs';"),
  'publish readiness audit must chain the preview reservation adapter wiring validator.',
);

console.log('import preview reservation adapter wiring check passed.');
