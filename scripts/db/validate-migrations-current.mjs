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
const pharmacyAuthorizationValidator = path.join(repoRoot, 'scripts', 'import', 'check-import-pharmacy-publish-authorization-persistence.mjs');
const pharmacyMetadataLocaleValidator = path.join(repoRoot, 'scripts', 'import', 'check-import-pharmacy-metadata-locale-preservation.mjs');
const pharmacyStableOperationIdentityValidator = path.join(repoRoot, 'scripts', 'import', 'check-import-pharmacy-stable-operation-identity.mjs');
const pharmacyAuthorizationV2Validator = path.join(repoRoot, 'scripts', 'import', 'check-import-pharmacy-authorization-persistence-v2.mjs');
const pharmacyAuthorizationLifecycleValidator = path.join(repoRoot, 'scripts', 'import', 'check-import-pharmacy-authorization-invalidation-readback.mjs');
const scheduleRlsMigrationName = '0065_schedule_appointment_rls_hardening.sql';
const functionSearchPathMigrationName = '0066_function_search_path_hardening.sql';
const helperSearchPathMigrationName = '0067_sensitive_helper_search_path_hardening.sql';
const publishPersistenceMigrationName = '0068_import_publish_persistence_schema.sql';
const publishRpcMigrationName = '0069_import_publish_transaction_rpcs.sql';
const pharmacyPublishRpcMigrationName = '0070_import_pharmacy_private_publish_rpc.sql';
const pharmacyRollbackMigrationName = '0071_import_pharmacy_private_rollback_rpc.sql';
const durableReferenceMigrationName = '0072_import_pharmacy_publish_references.sql';
const pharmacyReadStateMigrationName = '0073_import_pharmacy_admin_read_states.sql';
const pharmacyAuthorizationMigrationName = '0074_import_pharmacy_publish_authorizations.sql';
const pharmacyMetadataLocaleMigrationName = '0075_import_pharmacy_metadata_locale_preservation.sql';
const pharmacyStableOperationIdentityMigrationName = '0076_import_pharmacy_stable_operation_identity.sql';
const pharmacyAuthorizationV2MigrationName = '0077_import_pharmacy_authorization_persistence_v2.sql';
const pharmacyAuthorizationLifecycleMigrationName = '0078_import_pharmacy_authorization_invalidation_readback.sql';
const pharmacyAtomicAuthorizationMigrationName = '0079_import_pharmacy_atomic_authorization_reservation.sql';
const pharmacyReadStateUpsertIdentityMigrationName = '0080_import_pharmacy_read_state_upsert_identity.sql';
const pharmacyReservationAuditSplitMigrationName = '0081_import_pharmacy_reservation_audit_split.sql';
const pharmacyPrivateExecutionAuditMigrationName = '0082_import_pharmacy_private_execution_audit.sql';
const scheduleRlsMigrationPath = path.join(migrationsDir, scheduleRlsMigrationName);
const functionSearchPathMigrationPath = path.join(migrationsDir, functionSearchPathMigrationName);
const helperSearchPathMigrationPath = path.join(migrationsDir, helperSearchPathMigrationName);
const publishPersistenceMigrationPath = path.join(migrationsDir, publishPersistenceMigrationName);
const publishRpcMigrationPath = path.join(migrationsDir, publishRpcMigrationName);
const pharmacyPublishRpcMigrationPath = path.join(migrationsDir, pharmacyPublishRpcMigrationName);
const pharmacyRollbackMigrationPath = path.join(migrationsDir, pharmacyRollbackMigrationName);
const durableReferenceMigrationPath = path.join(migrationsDir, durableReferenceMigrationName);
const pharmacyReadStateMigrationPath = path.join(migrationsDir, pharmacyReadStateMigrationName);
const pharmacyAuthorizationMigrationPath = path.join(migrationsDir, pharmacyAuthorizationMigrationName);
const pharmacyMetadataLocaleMigrationPath = path.join(migrationsDir, pharmacyMetadataLocaleMigrationName);
const pharmacyStableOperationIdentityMigrationPath = path.join(migrationsDir, pharmacyStableOperationIdentityMigrationName);
const pharmacyAuthorizationV2MigrationPath = path.join(migrationsDir, pharmacyAuthorizationV2MigrationName);
const pharmacyAuthorizationLifecycleMigrationPath = path.join(migrationsDir, pharmacyAuthorizationLifecycleMigrationName);
const pharmacyAtomicAuthorizationMigrationPath = path.join(migrationsDir, pharmacyAtomicAuthorizationMigrationName);
const pharmacyReadStateUpsertIdentityMigrationPath = path.join(migrationsDir, pharmacyReadStateUpsertIdentityMigrationName);
const pharmacyReservationAuditSplitMigrationPath = path.join(migrationsDir, pharmacyReservationAuditSplitMigrationName);
const pharmacyPrivateExecutionAuditMigrationPath = path.join(migrationsDir, pharmacyPrivateExecutionAuditMigrationName);
const hiddenScheduleRlsMigrationPath = path.join(migrationsDir, `.schedule-rls-${scheduleRlsMigrationName}.hidden`);
const hiddenFunctionSearchPathMigrationPath = path.join(migrationsDir, `.function-search-path-${functionSearchPathMigrationName}.hidden`);
const hiddenHelperSearchPathMigrationPath = path.join(migrationsDir, `.helper-search-path-${helperSearchPathMigrationName}.hidden`);
const hiddenPublishPersistenceMigrationPath = path.join(migrationsDir, `.publish-persistence-${publishPersistenceMigrationName}.hidden`);
const hiddenPublishRpcMigrationPath = path.join(migrationsDir, `.publish-rpc-${publishRpcMigrationName}.hidden`);
const hiddenPharmacyPublishRpcMigrationPath = path.join(migrationsDir, `.pharmacy-publish-rpc-${pharmacyPublishRpcMigrationName}.hidden`);
const hiddenPharmacyRollbackMigrationPath = path.join(migrationsDir, `.pharmacy-rollback-${pharmacyRollbackMigrationName}.hidden`);
const hiddenDurableReferenceMigrationPath = path.join(migrationsDir, `.durable-reference-${durableReferenceMigrationName}.hidden`);
const hiddenPharmacyReadStateMigrationPath = path.join(migrationsDir, `.pharmacy-read-state-${pharmacyReadStateMigrationName}.hidden`);
const hiddenPharmacyAuthorizationMigrationPath = path.join(migrationsDir, `.pharmacy-authorization-${pharmacyAuthorizationMigrationName}.hidden`);
const hiddenPharmacyMetadataLocaleMigrationPath = path.join(migrationsDir, `.pharmacy-metadata-locale-${pharmacyMetadataLocaleMigrationName}.hidden`);
const hiddenPharmacyStableOperationIdentityMigrationPath = path.join(migrationsDir, `.pharmacy-stable-operation-${pharmacyStableOperationIdentityMigrationName}.hidden`);
const hiddenPharmacyAuthorizationV2MigrationPath = path.join(migrationsDir, `.pharmacy-authorization-v2-${pharmacyAuthorizationV2MigrationName}.hidden`);
const hiddenPharmacyAuthorizationLifecycleMigrationPath = path.join(migrationsDir, `.pharmacy-authorization-lifecycle-${pharmacyAuthorizationLifecycleMigrationName}.hidden`);
const hiddenPharmacyAtomicAuthorizationMigrationPath = path.join(migrationsDir, `.pharmacy-atomic-authorization-${pharmacyAtomicAuthorizationMigrationName}.hidden`);
const hiddenPharmacyReadStateUpsertIdentityMigrationPath = path.join(migrationsDir, `.pharmacy-read-state-upsert-${pharmacyReadStateUpsertIdentityMigrationName}.hidden`);
const hiddenPharmacyReservationAuditSplitMigrationPath = path.join(migrationsDir, `.pharmacy-reservation-audit-split-${pharmacyReservationAuditSplitMigrationName}.hidden`);
const hiddenPharmacyPrivateExecutionAuditMigrationPath = path.join(migrationsDir, `.pharmacy-private-execution-audit-${pharmacyPrivateExecutionAuditMigrationName}.hidden`);

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
  [pharmacyAuthorizationMigrationName, pharmacyAuthorizationMigrationPath, hiddenPharmacyAuthorizationMigrationPath],
  [pharmacyMetadataLocaleMigrationName, pharmacyMetadataLocaleMigrationPath, hiddenPharmacyMetadataLocaleMigrationPath],
  [pharmacyStableOperationIdentityMigrationName, pharmacyStableOperationIdentityMigrationPath, hiddenPharmacyStableOperationIdentityMigrationPath],
  [pharmacyAuthorizationV2MigrationName, pharmacyAuthorizationV2MigrationPath, hiddenPharmacyAuthorizationV2MigrationPath],
  [pharmacyAuthorizationLifecycleMigrationName, pharmacyAuthorizationLifecycleMigrationPath, hiddenPharmacyAuthorizationLifecycleMigrationPath],
  [pharmacyAtomicAuthorizationMigrationName, pharmacyAtomicAuthorizationMigrationPath, hiddenPharmacyAtomicAuthorizationMigrationPath],
  [pharmacyReadStateUpsertIdentityMigrationName, pharmacyReadStateUpsertIdentityMigrationPath, hiddenPharmacyReadStateUpsertIdentityMigrationPath],
  [pharmacyReservationAuditSplitMigrationName, pharmacyReservationAuditSplitMigrationPath, hiddenPharmacyReservationAuditSplitMigrationPath],
  [pharmacyPrivateExecutionAuditMigrationName, pharmacyPrivateExecutionAuditMigrationPath, hiddenPharmacyPrivateExecutionAuditMigrationPath],
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
  requireCondition(existsSync(pharmacyPrivateExecutionAuditMigrationPath), `${pharmacyPrivateExecutionAuditMigrationName} is missing.`);
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
function validatePharmacyAuthorizationMigration() {
  requireCondition(existsSync(pharmacyAuthorizationMigrationPath), `${pharmacyAuthorizationMigrationName} is missing.`);
  execFileSync(process.execPath, [pharmacyAuthorizationValidator], { cwd: repoRoot, stdio: 'inherit' });
}
function validatePharmacyMetadataLocaleMigration() {
  requireCondition(existsSync(pharmacyMetadataLocaleMigrationPath), `${pharmacyMetadataLocaleMigrationName} is missing.`);
  execFileSync(process.execPath, [pharmacyMetadataLocaleValidator], { cwd: repoRoot, stdio: 'inherit' });
}
function validatePharmacyStableOperationIdentityMigration() {
  requireCondition(existsSync(pharmacyStableOperationIdentityMigrationPath), `${pharmacyStableOperationIdentityMigrationName} is missing.`);
  execFileSync(process.execPath, [pharmacyStableOperationIdentityValidator], { cwd: repoRoot, stdio: 'inherit' });
}
function validatePharmacyAuthorizationV2Migration() {
  requireCondition(existsSync(pharmacyAuthorizationV2MigrationPath), `${pharmacyAuthorizationV2MigrationName} is missing.`);
  execFileSync(process.execPath, [pharmacyAuthorizationV2Validator], { cwd: repoRoot, stdio: 'inherit' });
}
function validatePharmacyAuthorizationLifecycleMigration() {
  requireCondition(existsSync(pharmacyAuthorizationLifecycleMigrationPath), `${pharmacyAuthorizationLifecycleMigrationName} is missing.`);
  execFileSync(process.execPath, [pharmacyAuthorizationLifecycleValidator], { cwd: repoRoot, stdio: 'inherit' });
}
function validatePharmacyAtomicAuthorizationMigration() {
  requireCondition(existsSync(pharmacyAtomicAuthorizationMigrationPath), `${pharmacyAtomicAuthorizationMigrationName} is missing.`);
  const content = readFileSync(pharmacyAtomicAuthorizationMigrationPath, 'utf8');
  for (const [pattern, message] of [
    [/IMPORT-ADMIN-AE: atomically verify and consume one Pharmacy authorization/i, '0079 must include its migration marker.'],
    [/add\s+column\s+if\s+not\s+exists\s+pharmacy_authorization_id\s+uuid/i, '0079 must bind reservations to Pharmacy authorization IDs.'],
    [/from\s+public\.import_pharmacy_publish_authorizations[\s\S]*for\s+update/i, '0079 must lock the authorization row before reservation writes.'],
    [/status\s*=\s*'consumed'/i, '0079 must consume authorization in the transaction.'],
    [/consumed_by_reservation_id\s*=\s*v_idempotency_id/i, '0079 must bind consumption to the reservation.'],
    [/security\s+invoker/i, '0079 RPC must remain security invoker.'],
    [/set\s+search_path\s*=\s*pg_catalog,\s*public/i, '0079 RPC must pin search_path.'],
    [/grant\s+execute[\s\S]*to\s+service_role/i, '0079 RPC must be service-role-only.'],
  ]) requirePattern(content, pattern, message);
  for (const [pattern, message] of [
    [/\bcreate\s+policy\b/i, '0079 must not add public policies.'],
    [/grant\s+execute[\s\S]*to\s+(public|anon|authenticated)/i, '0079 must not grant public execution.'],
  ]) forbidPattern(content, pattern, message);
}

function validatePharmacyReadStateUpsertIdentityMigration() {
  requireCondition(existsSync(pharmacyReadStateUpsertIdentityMigrationPath), `${pharmacyReadStateUpsertIdentityMigrationName} is missing.`);
  const content = readFileSync(pharmacyReadStateUpsertIdentityMigrationPath, 'utf8');
  for (const [pattern, message] of [
    [/P02 RES-INTEGRITY-READBACK: make Pharmacy read-state UPSERT identities inferable/i, '0080 must include its migration marker.'],
    [/drop\s+index\s+if\s+exists\s+public\.import_pharmacy_admin_read_states_attempt_operation_idx/i, '0080 must replace the partial operation-attempt index.'],
    [/create\s+unique\s+index\s+import_pharmacy_admin_read_states_attempt_operation_idx[\s\S]*\(\s*operation_attempt_id\s*,\s*operation\s*\)\s*;/i, '0080 must create an inferable operation-attempt UPSERT index.'],
    [/drop\s+index\s+if\s+exists\s+public\.import_pharmacy_admin_read_states_idempotency_operation_idx/i, '0080 must replace the partial idempotency index.'],
    [/create\s+unique\s+index\s+import_pharmacy_admin_read_states_idempotency_operation_idx[\s\S]*\(\s*idempotency_key\s*,\s*operation\s*\)\s*;/i, '0080 must create an inferable idempotency UPSERT index.'],
  ]) requirePattern(content, pattern, message);
  for (const [pattern, message] of [
    [/where\s+(operation_attempt_id|idempotency_key)\s+is\s+not\s+null/i, '0080 UPSERT indexes must not remain partial.'],
    [/\b(insert\s+into|update\s+public\.|delete\s+from|truncate\s+table)\b/i, '0080 must not mutate table rows.'],
    [/\bcreate\s+policy\b/i, '0080 must not create policies.'],
    [/\bgrant\b/i, '0080 must not grant privileges.'],
    [/\bto\s+(public|anon|authenticated)\b/i, '0080 must not expose public roles.'],
  ]) forbidPattern(content, pattern, message);
}

function validatePharmacyReservationAuditSplitMigration() {
  requireCondition(existsSync(pharmacyReservationAuditSplitMigrationPath), `${pharmacyReservationAuditSplitMigrationName} is missing.`);
  const content = readFileSync(pharmacyReservationAuditSplitMigrationPath, 'utf8');
  for (const [pattern, message] of [
    [/P04-A RESERVATION-AUDIT-SPLIT/i, '0081 must include its phase marker.'],
    [/add\s+constraint\s+import_publish_audit_event_type_check[\s\S]*'reservation_created'/i, '0081 must admit reservation_created in the audit event constraint.'],
    [/validate\s+constraint\s+import_publish_audit_event_type_check/i, '0081 must validate the replacement audit event constraint.'],
    [/create\s+or\s+replace\s+function\s+public\.import_publish_reserve_snapshot_audit/i, '0081 must replace the canonical reservation RPC.'],
    [/p_audit_schema_version\s+is\s+distinct\s+from\s+'drkhaleej\.import\.publishAudit\.v2'/i, '0081 must require the exact v2 reservation audit schema.'],
    [/'reservation_created'\s*,\s*'pending'\s*,\s*p_audit_schema_version/i, '0081 must write reservation_created for new reservations.'],
    [/event_type\s*=\s*'execution_started'[\s\S]*schema_version\s*<>\s*'drkhaleej\.import\.publishAudit\.v2'/i, '0081 must keep legacy reservation replay compatibility without admitting the v2/legacy pairing.'],
    [/event_payload\s*->>\s*'phase'\s*=\s*'reservation'/i, '0081 legacy replay must remain reservation-phase bounded.'],
    [/security\s+invoker/i, '0081 RPC must remain security invoker.'],
    [/set\s+search_path\s*=\s*pg_catalog\s*,\s*public/i, '0081 RPC must pin search_path.'],
    [/revoke\s+all\s+on\s+function\s+public\.import_publish_reserve_snapshot_audit[\s\S]*from\s+public\s*,\s*anon\s*,\s*authenticated/i, '0081 must revoke RPC access from public roles.'],
    [/grant\s+execute\s+on\s+function\s+public\.import_publish_reserve_snapshot_audit[\s\S]*to\s+service_role/i, '0081 must grant the RPC only to service_role.'],
  ]) requirePattern(content, pattern, message);
  for (const [pattern, message] of [
    [/\bcreate\s+policy\b/i, '0081 must not add public policies.'],
    [/grant\s+execute[\s\S]*to\s+(public|anon|authenticated)/i, '0081 must not grant public execution.'],
    [/'execution_started'\s*,\s*'pending'\s*,\s*p_audit_schema_version/i, '0081 must not write the legacy execution_started reservation event.'],
  ]) forbidPattern(content, pattern, message);
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
validatePharmacyAuthorizationMigration();
validatePharmacyMetadataLocaleMigration();
validatePharmacyStableOperationIdentityMigration();
validatePharmacyAuthorizationV2Migration();
validatePharmacyAuthorizationLifecycleMigration();
validatePharmacyAtomicAuthorizationMigration();
validatePharmacyReadStateUpsertIdentityMigration();
validatePharmacyReservationAuditSplitMigration();

console.log('Current migration validation passed.');
