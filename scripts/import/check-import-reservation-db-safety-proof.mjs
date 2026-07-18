#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const files = {
  runner: 'scripts/import/run-p03-reservation-db-safety.mjs',
  faultSql: 'scripts/import/sql/p03-reservation-fault-injection.sql',
  workflow: '.github/workflows/p03-res-db-safety-proof.yml',
  docs: 'docs/import/RES_DB_SAFETY_PROOF.md',
  audit: 'scripts/import/check-import-publish-readiness-audit.mjs',
  gitignore: '.gitignore',
  package: 'package.json',
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function text(file) {
  return readFile(path.join(root, file), 'utf8');
}

const [runner, faultSql, workflow, docs, audit, gitignore, packageSource] = await Promise.all([
  text(files.runner),
  text(files.faultSql),
  text(files.workflow),
  text(files.docs),
  text(files.audit),
  text(files.gitignore),
  text(files.package),
]);
const packageJson = JSON.parse(packageSource);

assert(packageJson.devDependencies?.pg === '8.22.0', 'P03 must pin node-postgres exactly.');
assert(
  packageJson.scripts?.['import:reservation-db-safety:validate']
    === 'node scripts/import/check-import-reservation-db-safety-proof.mjs',
  'P03 static contract script is missing.',
);
assert(
  packageJson.scripts?.['test:db:reservation-safety']
    === 'node scripts/import/run-p03-reservation-db-safety.mjs',
  'P03 real database proof script is missing.',
);
assert(gitignore.includes('artifacts/p03/'), 'Generated P03 evidence must remain untracked.');
assert(
  audit.includes("import './check-import-reservation-db-safety-proof.mjs';"),
  'Import readiness audit must chain the P03 safety contract.',
);
assert(
  audit.includes("import './test-import-reservation-db-safety-proof.mjs';"),
  'Import readiness audit must chain the P03 safety tests.',
);

for (const token of [
  "requiredEnv('P03_PREVIEW_DATABASE_URL')",
  "requiredEnv('P03_PREVIEW_PROJECT_REF')",
  "requiredEnv('P03_PRODUCTION_PROJECT_REF')",
  "requiredEnv('P03_RUN_ID')",
  'verifyPreviewIdentity',
  'supabase_migrations.schema_migrations',
  'exactlyMatchesRepository: true',
  'verifyProductionRpc',
  'public.import_publish_reserve_snapshot_audit',
  "wait_event_type = 'Lock'",
  'clients: 2',
  'runReplayAndConflict',
  'runFaultProof',
  'await admin.query(faultSql)',
  'authorizationStillIssued: true',
  'verifyGlobalIntegrity',
  'cleanupFixtures',
  'verifyCleanup',
  'runDeterministicRerunProof',
  "process.env.P03_SOURCE_COMMIT",
  'rawIdsEmitted: false',
  'rawPayloadsEmitted: false',
  'databaseUrlEmitted: false',
  'reservationCreatedAuditImplemented: false',
]) {
  assert(runner.includes(token), `${files.runner} must include ${token}.`);
}
assert(
  !runner.includes('p03-fault-session'),
  'P03 must keep the temporary fault wrapper on the active observer session.',
);

for (const boundary of [
  'reservation_insert',
  'snapshot_insert',
  'audit_insert',
  'authorization_update',
]) {
  assert(runner.includes(`'${boundary}'`), `${files.runner} must prove ${boundary}.`);
  assert(faultSql.includes(`'${boundary}'`), `${files.faultSql} must implement ${boundary}.`);
  assert(
    faultSql.includes(`p03_forced_abort_${boundary}`),
    `${files.faultSql} must raise the bounded ${boundary} exception.`,
  );
}

for (const token of [
  'create or replace function pg_temp.p03_import_publish_reserve_snapshot_audit_fault',
  'security invoker',
  'for update',
  'import_publish_idempotency_records',
  'import_publish_rollback_snapshots',
  'import_publish_audit_events',
  "set status = 'consumed'",
]) {
  assert(faultSql.toLowerCase().includes(token.toLowerCase()), `${files.faultSql} must include ${token}.`);
}
for (const forbidden of [
  'create or replace function public.p03_',
  'create function public.p03_',
  'grant execute',
  'alter table',
  'create policy',
  'reservation_created',
]) {
  assert(!faultSql.toLowerCase().includes(forbidden), `${files.faultSql} must not include ${forbidden}.`);
}

for (const token of [
  'P03_PREVIEW_DATABASE_URL: ${{ secrets.P03_PREVIEW_DATABASE_URL }}',
  'P03_PREVIEW_PROJECT_REF: ${{ secrets.P03_PREVIEW_PROJECT_REF }}',
  'P03_PRODUCTION_PROJECT_REF: ${{ secrets.P03_PRODUCTION_PROJECT_REF }}',
  'P03_SOURCE_COMMIT: ${{ github.event.pull_request.head.sha || github.sha }}',
  'P03_RUN_ID: github-${{ github.run_id }}-${{ github.run_attempt }}-${{ github.event.pull_request.head.sha || github.sha }}',
  'ref: ${{ github.event.pull_request.head.sha || github.sha }}',
  'pnpm install --frozen-lockfile',
  'pnpm import:reservation-db-safety:validate',
  'pnpm test:db:reservation-safety',
  'if-no-files-found: error',
]) {
  assert(workflow.includes(token), `${files.workflow} must include ${token}.`);
}
for (const forbidden of ['continue-on-error: true', 'environment: production', 'P03_PREVIEW_DATABASE_URL: postgres']) {
  assert(!workflow.toLowerCase().includes(forbidden.toLowerCase()), `${files.workflow} must not include ${forbidden}.`);
}

for (const token of [
  'test infrastructure only',
  'never Production',
  'reservation_created',
  'two independent PostgreSQL clients',
  'authorization remains `issued`',
  'zero rows',
  'different human',
]) {
  assert(docs.includes(token), `${files.docs} must include ${token}.`);
}

console.log('import reservation DB safety proof contract passed.');
