#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, renameSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const migrationsDir = path.join(repoRoot, 'supabase', 'migrations');
const legacyValidator = path.join(repoRoot, 'scripts', 'db', 'validate-migrations-taxrlsa.mjs');
const functionSearchPathValidator = path.join(repoRoot, 'scripts', 'db', 'check-security-function-search-path.mjs');
const helperSearchPathValidator = path.join(repoRoot, 'scripts', 'db', 'check-sensitive-helper-search-path.mjs');
const publishRpcValidator = path.join(repoRoot, 'scripts', 'db', 'check-import-publish-transaction-rpcs.mjs');
const pharmacyPublishRpcValidator = path.join(repoRoot, 'scripts', 'db', 'check-import-pharmacy-private-publish-rpc.mjs');
const pharmacyRollbackValidator = path.join(repoRoot, 'scripts', 'import', 'check-import-pharmacy-private-rollback.mjs');
const durableReferenceValidator = path.join(repoRoot, 'scripts', 'import', 'check-import-pharmacy-durable-publish-reference.mjs');
const pharmacyReadStateValidator = path.join(repoRoot, 'scripts', 'import', 'check-import-pharmacy-admin-read-state-persistence.mjs');
const scheduleRlsMigrationName = '0065_schedule_appointment_rls_hardening.sql';
const functionSearchPathMigrationName = '0066_function_search_path_hardening.sql';
const helperSearchPathMigrationName = '0067_sensitive_helper_search_path_hardening.sql';
const publishPersistenceMigrationName = '0068_import_publish_persistence_schema.sql';
const publishRpcMigrationName = '0069_import_publish_transaction_rpcs.sql';
const pharmacyPublishRpcMigrationName = '0070_import_pharmacy_private_publish_rpc.sql';
const pharmacyRollbackMigrationName = '0071_import_pharmacy_private_rollback_rpc.sql';
const durableReferenceMigrationName = '0072_import_pharmacy_publish_references.sql';
const pharmacyReadStateMigrationName = '0073_import_pharmacy_admin_read_states.sql';
const scheduleRlsMigrationPath = path.join(migrationsDir, scheduleRlsMigrationName);
const functionSearchPathMigrationPath = path.join(migrationsDir, functionSearchPathMigrationName);
const helperSearchPathMigrationPath = path.join(migrationsDir, helperSearchPathMigrationName);
const publishPersistenceMigrationPath = path.join(migrationsDir, publishPersistenceMigrationName);
const publishRpcMigrationPath = path.join(migrationsDir, publishRpcMigrationName);
const pharmacyPublishRpcMigrationPath = path.join(migrationsDir, pharmacyPublishRpcMigrationName);
const pharmacyRollbackMigrationPath = path.join(migrationsDir, pharmacyRollbackMigrationName);
const durableReferenceMigrationPath = path.join(migrationsDir, durableReferenceMigrationName);
const pharmacyReadStateMigrationPath = path.join(migrationsDir, pharmacyReadStateMigrationName);
const hiddenScheduleRlsMigrationPath = path.join(migrationsDir, `.schedule-rls-${scheduleRlsMigrationName}.hidden`);
const hiddenFunctionSearchPathMigrationPath = path.join(migrationsDir, `.function-search-path-${functionSearchPathMigrationName}.hidden`);
const hiddenHelperSearchPathMigrationPath = path.join(migrationsDir, `.helper-search-path-${helperSearchPathMigrationName}.hidden`);
const hiddenPublishPersistenceMigrationPath = path.join(migrationsDir, `.publish-persistence-${publishPersistenceMigrationName}.hidden`);
const hiddenPublishRpcMigrationPath = path.join(migrationsDir, `.publish-rpc-${publishRpcMigrationName}.hidden`);
const hiddenPharmacyPublishRpcMigrationPath = path.join(migrationsDir, `.pharmacy-publish-rpc-${pharmacyPublishRpcMigrationName}.hidden`);
const hiddenPharmacyRollbackMigrationPath = path.join(migrationsDir, `.pharmacy-rollback-${pharmacyRollbackMigrationName}.hidden`);
const hiddenDurableReferenceMigrationPath = path.join(migrationsDir, `.durable-reference-${durableReferenceMigrationName}.hidden`);
const hiddenPharmacyReadStateMigrationPath = path.join(migrationsDir, `.pharmacy-read-state-${pharmacyReadStateMigrationName}.hidden`);

const currentOnlyMigrations = [
  [scheduleRlsMigrationName, scheduleRlsMigrationPath, hiddenScheduleRlsMigrationPath],
  [functionSearchPathMigrationName, functionSearchPathMigrationPath, hiddenFunctionSearchPathMigrationPath],
  [helperSearchPathMigrationName, helperSearchPathMigrationPath, hiddenHelperSearchPathMigrationPath],
  [publishPersistenceMigrationName, publishPersistenceMigrationPath, hiddenPublishPersistenceMigrationPath],
  [publishRpcMigrationName, publishRpcMigrationPath, hiddenPublishRpcMigrationPath],
  [pharmacyPublishRpcMigrationName, pharmacyPublishRpcMigrationPath, hiddenPharmacyPublishRpcMigrationPath],
  [pharmacyRollbackMigrationName, pharmacyRollbackMigrationPath, hiddenPharmacyRollbackMigrationPath],
  [durableReferenceMigrationName, durableReferenceMigrationPath, hiddenDurableReferenceMigrationPath],
  [pharmacyReadStateMigrationName, pharmacyReadStateMigrationPath, hiddenPharmacyReadStateMigrationPath],
];

function fail(message) {
  console.error(`ERROR: SEC-SCHEDULE-RLS-A: ${message}`);
  process.exit(1);
}

function requireCondition(condition, message) {
  if (!condition) fail(message);
}

function requirePattern(content, pattern, message) {
  requireCondition(pattern.test(content), message);
}

function forbidPattern(content, pattern, message) {
  requireCondition(!pattern.test(content), message);
}

function validateScheduleRlsMigration() {
  requireCondition(existsSync(scheduleRlsMigrationPath), `${scheduleRlsMigrationName} is missing.`);
  const content = readFileSync(scheduleRlsMigrationPath, 'utf8');
  for (const [pattern, message] of [
    [/\binsert\s+into\b/i, '0065 must not seed rows.'],
    [/\bdrop\b/i, '0065 must not contain DROP statements.'],
    [/\bcreate\s+policy\b/i, '0065 must not add public or authenticated policies.'],
    [/\bto\s+anon\b/i, '0065 must not grant anon access.'],
    [/\bto\s+authenticated\b/i, '0065 must not grant authenticated access.'],
    [/\bfor\s+insert\b/i, '0065 must not add insert policies.'],
    [/\bfor\s+update\b/i, '0065 must not add update policies.'],
    [/\bfor\s+delete\b/i, '0065 must not add delete policies.'],
  ]) forbidPattern(content, pattern, message);
  for (const [pattern, message] of [
    [/SEC-SCHEDULE-RLS-A: schedule and appointment table RLS hardening/i, '0065 must include its migration marker.'],
    [/alter\s+table\s+public\.doctor_schedules\s+enable\s+row\s+level\s+security/i, '0065 must enable RLS on doctor_schedules.'],
    [/alter\s+table\s+public\.doctor_schedule_exceptions\s+enable\s+row\s+level\s+security/i, '0065 must enable RLS on doctor_schedule_exceptions.'],
    [/alter\s+table\s+public\.appointment_slots\s+enable\s+row\s+level\s+security/i, '0065 must enable RLS on appointment_slots.'],
  ]) requirePattern(content, pattern, message);
}

function validateFunctionSearchPathMigration() {
  execFileSync(process.execPath, [functionSearchPathValidator], { cwd: repoRoot, stdio: 'inherit' });
}

function validateHelperSearchPathMigration() {
  execFileSync(process.execPath, [helperSearchPathValidator], { cwd: repoRoot, stdio: 'inherit' });
}

function validatePublishPersistenceMigration() {
  requireCondition(existsSync(publishPersistenceMigrationPath), `${publishPersistenceMigrationName} is missing.`);
  const content = readFileSync(publishPersistenceMigrationPath, 'utf8');
  for (const [pattern, message] of [
    [/\binsert\s+into\b/i, '0068 must not seed rows.'],
    [/\bdrop\b/i, '0068 must not contain DROP statements.'],
    [/\bcreate\s+policy\b/i, '0068 must not create anon/authenticated policies.'],
    [/\bto\s+anon\b/i, '0068 must not grant anon access.'],
    [/\bto\s+authenticated\b/i, '0068 must not grant authenticated access.'],
    [/\bto\s+service_role\b/i, '0068 must not add explicit service_role grants.'],
  ]) forbidPattern(content, pattern, message);
  for (const [pattern, message] of [
    [/IMPORT-PUBLISH-C: controlled publish persistence schema/i, '0068 must include its migration marker.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_publish_idempotency_records/i, '0068 must create idempotency persistence.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_publish_rollback_snapshots/i, '0068 must create rollback snapshots.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_publish_audit_events/i, '0068 must create publish audit events.'],
    [/idempotency_key\s+text\s+not\s+null\s+unique/i, '0068 must enforce unique idempotency keys.'],
    [/request_hash\s+~\s+'\^\[a-f0-9\]\{64\}\$'/i, '0068 must validate request hashes.'],
    [/snapshot_hash\s+~\s+'\^\[a-f0-9\]\{64\}\$'/i, '0068 must validate snapshot hashes.'],
    [/on\s+delete\s+restrict/i, '0068 must prevent destructive audit-chain cascades.'],
    [/alter\s+table\s+public\.import_publish_idempotency_records\s+enable\s+row\s+level\s+security/i, '0068 must enable RLS on idempotency records.'],
    [/alter\s+table\s+public\.import_publish_rollback_snapshots\s+enable\s+row\s+level\s+security/i, '0068 must enable RLS on rollback snapshots.'],
    [/alter\s+table\s+public\.import_publish_audit_events\s+enable\s+row\s+level\s+security/i, '0068 must enable RLS on audit events.'],
  ]) requirePattern(content, pattern, message);
}

function validatePublishRpcMigration() {
  requireCondition(existsSync(publishRpcMigrationPath), `${publishRpcMigrationName} is missing.`);
  execFileSync(process.execPath, [publishRpcValidator], { cwd: repoRoot, stdio: 'inherit' });
}

function validatePharmacyPublishRpcMigration() {
  requireCondition(existsSync(pharmacyPublishRpcMigrationPath), `${pharmacyPublishRpcMigrationName} is missing.`);
  execFileSync(process.execPath, [pharmacyPublishRpcValidator], { cwd: repoRoot, stdio: 'inherit' });
}

function validatePharmacyRollbackMigration() {
  requireCondition(existsSync(pharmacyRollbackMigrationPath), `${pharmacyRollbackMigrationName} is missing.`);
  execFileSync(process.execPath, [pharmacyRollbackValidator], { cwd: repoRoot, stdio: 'inherit' });
}

function validateDurableReferenceMigration() {
  requireCondition(existsSync(durableReferenceMigrationPath), `${durableReferenceMigrationName} is missing.`);
  execFileSync(process.execPath, [durableReferenceValidator], { cwd: repoRoot, stdio: 'inherit' });
}

function validatePharmacyReadStateMigration() {
  requireCondition(existsSync(pharmacyReadStateMigrationPath), `${pharmacyReadStateMigrationName} is missing.`);
  execFileSync(process.execPath, [pharmacyReadStateValidator], { cwd: repoRoot, stdio: 'inherit' });
}

function runLegacyValidatorWithoutCurrentOnlyMigrations() {
  for (const [migrationName, migrationPath, hiddenMigrationPath] of currentOnlyMigrations) {
    requireCondition(existsSync(migrationPath), `${migrationName} is missing before legacy validation.`);
    requireCondition(!existsSync(hiddenMigrationPath), `Hidden migration file already exists for ${migrationName}.`);
  }
  const renamedMigrations = [];
  try {
    for (const [migrationName, migrationPath, hiddenMigrationPath] of currentOnlyMigrations) {
      renameSync(migrationPath, hiddenMigrationPath);
      renamedMigrations.push([migrationName, migrationPath, hiddenMigrationPath]);
    }
    execFileSync(process.execPath, [legacyValidator], { cwd: repoRoot, stdio: 'inherit' });
  } finally {
    for (const [, migrationPath, hiddenMigrationPath] of renamedMigrations.reverse()) {
      if (existsSync(hiddenMigrationPath)) renameSync(hiddenMigrationPath, migrationPath);
    }
  }
}

runLegacyValidatorWithoutCurrentOnlyMigrations();
validateScheduleRlsMigration();
validateFunctionSearchPathMigration();
validateHelperSearchPathMigration();
validatePublishPersistenceMigration();
validatePublishRpcMigration();
validatePharmacyPublishRpcMigration();
validatePharmacyRollbackMigration();
validateDurableReferenceMigration();
validatePharmacyReadStateMigration();

console.log('Current migration validation passed.');
