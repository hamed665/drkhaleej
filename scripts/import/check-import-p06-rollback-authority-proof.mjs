#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const runnerPath = path.resolve('scripts/import/run-p06-rollback-authority-proof.mjs');
const workflowPath = path.resolve('.github/workflows/preview-migration-sync.yml');
const authorityMigrationPath = path.resolve('supabase/migrations/0083_import_pharmacy_atomic_rollback_authority.sql');
const digestMigrationPath = path.resolve('supabase/migrations/0084_import_pharmacy_rollback_digest_schema.sql');

for (const file of [runnerPath, workflowPath, authorityMigrationPath, digestMigrationPath]) {
  if (!existsSync(file)) throw new Error(`P06 hosted proof file is missing: ${file}`);
}

const runner = readFileSync(runnerPath, 'utf8');
const workflow = readFileSync(workflowPath, 'utf8');
const authorityMigration = readFileSync(authorityMigrationPath, 'utf8');
const digestMigration = readFileSync(digestMigrationPath, 'utf8');

function requirePattern(content, pattern, message) {
  if (!pattern.test(content)) throw new Error(message);
}

function forbidPattern(content, pattern, message) {
  if (pattern.test(content)) throw new Error(message);
}

for (const [pattern, message] of [
  [/P06_PREVIEW_DATABASE_URL/, 'P06 proof must require the isolated Preview database URL.'],
  [/P06_PREVIEW_PROJECT_REF/, 'P06 proof must require the Preview project ref.'],
  [/P06_PRODUCTION_PROJECT_REF/, 'P06 proof must reject the Production project ref.'],
  [/Preview and Production project refs must be present and different/, 'P06 proof must fail closed on identical project refs.'],
  [/pooler\.supabase\.com/, 'P06 proof must require the Session pooler.'],
  [/parsed\.port === '5432'/, 'P06 proof must require port 5432.'],
  [/version = '0084'/, 'P06 proof must verify the final P06 correction migration in the hosted ledger.'],
  [/migration0084Verified:\s*true/, 'P06 evidence must bind to the final P06 migration.'],
  [/import_rollback_pharmacy_private_by_authority/, 'P06 proof must execute the atomic authority RPC.'],
  [/Promise\.all\(\[\s*invokeRollback\(concurrentA/, 'P06 proof must exercise two-client concurrency.'],
  [/\['replayed', 'rolled_back'\]/, 'P06 proof must require one fresh rollback and one replay.'],
  [/extensions\.digest\(consumed_result::text/, 'P06 proof must verify persisted result hashing with the installed pgcrypto schema.'],
  [/rollback_succeeded/, 'P06 proof must verify exactly one rollback success audit.'],
  [/failedRollbackAuthorityConsumed:\s*false/, 'P06 evidence must prove failed rollback does not consume authority.'],
  [/exactSnapshotRestored:\s*true/, 'P06 evidence must prove exact snapshot restoration.'],
  [/privateBoundaryVerified:\s*true/, 'P06 evidence must prove the private boundary.'],
  [/publicExposureCount:\s*verified\.publicExposureCount/, 'P06 evidence must report public exposure count.'],
  [/cleanupVerified:\s*true/, 'P06 evidence must verify deterministic cleanup.'],
  [/productionConnected:\s*false/, 'P06 evidence must state that Production was not connected.'],
  [/rawIdentifiersExposed:\s*false/, 'P06 evidence must remain bounded.'],
]) requirePattern(runner, pattern, message);

for (const forbidden of [
  /status\s*=\s*'active'/i,
  /is_active\s*=\s*true/i,
  /is_featured\s*=\s*true/i,
  /sitemapEligible:\s*true/,
  /indexable:\s*true/,
  /publicRouteEnabled:\s*true/,
  /P06_PRODUCTION_DATABASE_URL/,
]) forbidPattern(runner, forbidden, `P06 proof contains forbidden scope: ${forbidden}`);

for (const [pattern, message] of [
  [/run-p06-rollback-authority-proof\.mjs/, 'Preview Migration Sync must run the P06 hosted proof after migration verification.'],
  [/P06_EVIDENCE_PATH/, 'Preview Migration Sync must define the P06 evidence path.'],
  [/p06-rollback-authority-/, 'Preview Migration Sync must upload a distinct exact-SHA P06 artifact.'],
  [/Run isolated P05 private publish proof[\s\S]*Run isolated P06 atomic rollback authority proof/, 'P06 proof must run only after migration verification and the P05 regression proof.'],
]) requirePattern(workflow, pattern, message);

for (const [pattern, message] of [
  [/create\s+or\s+replace\s+function\s+public\.import_rollback_pharmacy_private_by_authority/i, 'Migration 0083 must define the atomic authority RPC.'],
  [/for\s+update\s+of\s+r\s*,\s*i\s*,\s*s/i, 'Migration 0083 must lock the complete rollback authority chain.'],
  [/public\.import_rollback_pharmacy_private\(/i, 'Migration 0083 must reuse the existing rollback RPC.'],
  [/consumed_result_hash/i, 'Migration 0083 must persist bounded result integrity.'],
  [/rollback_authority_atomic_consume_failed/i, 'Migration 0083 must fail if atomic consumption is lost.'],
  [/'status',\s*'replayed'/i, 'Migration 0083 must return bounded replay.'],
]) requirePattern(authorityMigration, pattern, message);

for (const [pattern, message] of [
  [/Forward-only correction after isolated Preview proved pgcrypto is installed in the extensions schema/i, 'Migration 0084 must document the Preview-proven forward correction.'],
  [/create\s+or\s+replace\s+function\s+public\.import_rollback_pharmacy_private_by_authority/i, 'Migration 0084 must replace the existing authority RPC only.'],
  [/extensions\.digest\(r\.consumed_result::text,\s*'sha256'\)/i, 'Migration 0084 must schema-qualify replay hashing.'],
  [/extensions\.digest\(v_consumed_result::text,\s*'sha256'\)/i, 'Migration 0084 must schema-qualify consumption hashing.'],
  [/security\s+invoker/i, 'Migration 0084 must remain security invoker.'],
  [/grant\s+execute[\s\S]*to\s+service_role/i, 'Migration 0084 must remain service-role-only.'],
]) requirePattern(digestMigration, pattern, message);

for (const forbidden of [
  /\balter\s+table\b/i,
  /\bdrop\b/i,
  /\bcreate\s+policy\b/i,
  /grant\s+execute[\s\S]*to\s+(public|anon|authenticated)/i,
]) forbidPattern(digestMigration, forbidden, `Migration 0084 contains forbidden correction scope: ${forbidden}`);

console.log('P06 isolated hosted rollback authority proof contract passed.');
