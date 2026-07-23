#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const runnerPath = path.resolve('scripts/import/run-p05-private-publish-proof.mjs');
const workflowPath = path.resolve('.github/workflows/preview-migration-sync.yml');
const migrationPath = path.resolve('supabase/migrations/0082_import_pharmacy_private_execution_audit.sql');

for (const file of [runnerPath, workflowPath, migrationPath]) {
  if (!existsSync(file)) throw new Error(`P05 hosted proof file is missing: ${file}`);
}

const runner = readFileSync(runnerPath, 'utf8');
const workflow = readFileSync(workflowPath, 'utf8');
const migration = readFileSync(migrationPath, 'utf8');

function requirePattern(content, pattern, message) {
  if (!pattern.test(content)) throw new Error(message);
}

function forbidPattern(content, pattern, message) {
  if (pattern.test(content)) throw new Error(message);
}

for (const [pattern, message] of [
  [/P05_PREVIEW_DATABASE_URL/, 'P05 proof must require the isolated Preview database URL.'],
  [/P05_PREVIEW_PROJECT_REF/, 'P05 proof must require the Preview project ref.'],
  [/P05_PRODUCTION_PROJECT_REF/, 'P05 proof must reject the Production project ref.'],
  [/Preview and Production project refs must be present and different/, 'P05 proof must fail closed on identical project refs.'],
  [/pooler\.supabase\.com/, 'P05 proof must require the Session pooler.'],
  [/parsed\.port === '5432'/, 'P05 proof must require port 5432.'],
  [/version = '0082'/, 'P05 proof must verify migration 0082 in the hosted ledger.'],
  [/import_publish_reserve_snapshot_audit/, 'P05 proof must create exactly one canonical Reservation.'],
  [/import_publish_pharmacy_private/, 'P05 proof must execute the existing Pharmacy mutation RPC.'],
  [/p_execution_started_audit_id/, 'P05 proof must preserve the compatible Reservation audit parameter identity.'],
  [/reservation_created/, 'P05 proof must verify the Reservation audit.'],
  [/execution_started/, 'P05 proof must verify mutation execution_started.'],
  [/execution_succeeded/, 'P05 proof must verify terminal success.'],
  [/import_pharmacy_publish_references/, 'P05 proof must verify one durable publish reference.'],
  [/publicExposureCount/, 'P05 proof must verify zero public exposure.'],
  [/duplicateExecutionCount/, 'P05 proof must verify zero duplicate execution.'],
  [/exactPatchVerified: true/, 'P05 proof must verify the exact canonical patch.'],
  [/protectedMetadataVerified: true/, 'P05 proof must verify protected metadata.'],
  [/privateBoundaryVerified: true/, 'P05 proof must verify the private boundary.'],
  [/replayBounded: true/, 'P05 proof must verify bounded replay.'],
  [/cleanupVerified: true/, 'P05 proof must verify deterministic cleanup.'],
  [/productionConnected: false/, 'P05 evidence must state that Production was not connected.'],
  [/rawIdentifiersExposed: false/, 'P05 evidence must remain bounded.'],
]) requirePattern(runner, pattern, message);

for (const forbidden of [
  /status\s*=\s*'active'/i,
  /is_active\s*=\s*true/i,
  /is_featured\s*=\s*true/i,
  /sitemapEligible:\s*true/,
  /indexable:\s*true/,
  /publicRouteEnabled:\s*true/,
  /ROLLBACK PRIVATE PUBLISH/,
]) forbidPattern(runner, forbidden, `P05 proof contains forbidden scope: ${forbidden}`);

for (const [pattern, message] of [
  [/run-p05-private-publish-proof\.mjs/, 'Preview Migration Sync must run the P05 hosted proof after migration verification.'],
  [/P05_EVIDENCE_PATH/, 'Preview Migration Sync must define the P05 evidence path.'],
  [/p05-private-publish-/, 'Preview Migration Sync must upload a distinct exact-SHA P05 artifact.'],
  [/Verify exact ledger and database inventories[\s\S]*Run isolated P05 private publish proof/, 'P05 proof must run only after exact migration verification.'],
]) requirePattern(workflow, pattern, message);

for (const [pattern, message] of [
  [/p_execution_started_audit_id\s+uuid/i, 'Migration 0082 must preserve the existing PostgreSQL parameter identity.'],
  [/event_payload\s*->>\s*'phase'\s*=\s*'reservation'/i, 'Migration 0082 must verify the Reservation audit before mutation.'],
  [/insert\s+into\s+public\.import_publish_audit_events[\s\S]*'execution_started'/i, 'Migration 0082 must append mutation execution_started.'],
  [/import_publish_persist_terminal_result/i, 'Migration 0082 must persist terminal state in the existing authority.'],
]) requirePattern(migration, pattern, message);

console.log('P05 isolated hosted private publish proof contract passed.');
