#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourcePath = 'src/server/admin/import-preview-runtime-boundary.ts';
const fixturePath = 'fixtures/import/import-preview-runtime-boundary.fixture.json';
const auditPath = 'scripts/import/check-import-publish-readiness-audit.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

const source = await readText(sourcePath);
const fixture = JSON.parse(await readText(fixturePath));
const audit = await readText(auditPath);

for (const token of [
  'import "server-only"',
  'IMPORT_PREVIEW_RUNTIME_EXECUTION_ENABLED = false as const',
  'readImportPreviewRuntimeBoundaryInput',
  'createImportPreviewRuntimeBoundary',
  'environment.VERCEL_ENV',
  'SUPABASE_SERVICE_ROLE_KEY',
  'IMPORT_PREVIEW_ALLOWED_ACTOR_IDS',
  'IMPORT_PREVIEW_CANARY_ENTITY_IDS',
  'autoRefreshToken: false',
  'persistSession: false',
  'rpcExecutionAllowed: false',
  'entityMutationAllowed: false',
  'terminalPersistenceAllowed: false',
  'bulkAllowed: false',
]) {
  assert(source.includes(token), `${sourcePath} must include ${token}.`);
}

for (const blocker of [
  'environment_not_preview',
  'supabase_url_missing',
  'supabase_url_invalid',
  'service_role_key_missing',
  'actor_allowlist_missing',
  'entity_allowlist_missing',
  'runtime_execution_disabled',
]) {
  assert(source.includes(blocker), `${sourcePath} must include blocker ${blocker}.`);
}

for (const forbidden of [
  'console.log',
  'console.error',
  'IMPORT_PREVIEW_RUNTIME_EXECUTION_ENABLED = true',
  'persistTerminalResult',
  'import_publish_persist_terminal_result',
  '"use server"',
]) {
  assert(!source.includes(forbidden), `${sourcePath} must not include ${forbidden}.`);
}

assert(
  fixture.schemaVersion === 'drkhaleej.import.previewRuntimeBoundary.v1',
  'preview runtime boundary fixture schema version is invalid.',
);
assert(Array.isArray(fixture.cases) && fixture.cases.length >= 4, 'fixture must include at least four cases.');

const readyCase = fixture.cases.find((testCase) => testCase.id === 'preview-ready-client-constructed-rpc-disabled');
assert(readyCase?.expected.boundaryReady === true, 'fixture must include a boundary-ready preview case.');
assert(readyCase?.expected.clientConstructed === true, 'ready preview case must construct a client.');
assert(readyCase?.expected.rpcClientAvailable === true, 'ready preview case must expose the guarded RPC client.');
assert(readyCase?.expected.rpcExecutionAllowed === false, 'RPC execution must remain disabled.');

assert(fixture.safety?.previewOnly === true, 'runtime boundary must be preview-only.');
assert(fixture.safety?.secretLoggingAllowed === false, 'secret logging must remain forbidden.');
assert(fixture.safety?.rpcExecutionAllowed === false, 'RPC execution must remain forbidden.');
assert(fixture.safety?.entityMutationAllowed === false, 'entity mutation must remain forbidden.');
assert(fixture.safety?.terminalPersistenceAllowed === false, 'terminal persistence must remain forbidden.');
assert(fixture.safety?.bulkAllowed === false, 'bulk publish must remain forbidden.');

assert(
  audit.includes("import './check-import-preview-runtime-boundary.mjs';"),
  'publish readiness audit must chain the preview runtime boundary validator.',
);

console.log('import preview runtime boundary check passed.');
