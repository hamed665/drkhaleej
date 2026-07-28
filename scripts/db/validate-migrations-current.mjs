#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, renameSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const migrationsDir = path.join(repoRoot, 'supabase', 'migrations');
const script = (...parts) => path.join(repoRoot, 'scripts', ...parts);
const migration = (name) => path.join(migrationsDir, name);

const legacyValidator = script('db', 'validate-migrations-taxrlsa.mjs');
const validators = {
  functionSearchPath: script('db', 'check-security-function-search-path.mjs'),
  helperSearchPath: script('db', 'check-sensitive-helper-search-path.mjs'),
  publishRpc: script('db', 'check-import-publish-transaction-rpcs.mjs'),
  pharmacyPublishRpc: script('db', 'check-import-pharmacy-private-publish-rpc.mjs'),
  pharmacyRollback: script('import', 'check-import-pharmacy-private-rollback.mjs'),
  durableReference: script('import', 'check-import-pharmacy-durable-publish-reference.mjs'),
  pharmacyReadState: script('import', 'check-import-pharmacy-admin-read-state-persistence.mjs'),
  pharmacyAuthorization: script('import', 'check-import-pharmacy-publish-authorization-persistence.mjs'),
  pharmacyMetadataLocale: script('import', 'check-import-pharmacy-metadata-locale-preservation.mjs'),
  pharmacyStableOperation: script('import', 'check-import-pharmacy-stable-operation-identity.mjs'),
  pharmacyAuthorizationV2: script('import', 'check-import-pharmacy-authorization-persistence-v2.mjs'),
  pharmacyAuthorizationLifecycle: script('import', 'check-import-pharmacy-authorization-invalidation-readback.mjs'),
  pharmacyExpectedVersionTimestamp: script('db', 'check-import-pharmacy-expected-version-timestamp-equivalence.mjs'),
};

const migrationNames = {
  scheduleRls: '0065_schedule_appointment_rls_hardening.sql',
  functionSearchPath: '0066_function_search_path_hardening.sql',
  helperSearchPath: '0067_sensitive_helper_search_path_hardening.sql',
  publishPersistence: '0068_import_publish_persistence_schema.sql',
  publishRpc: '0069_import_publish_transaction_rpcs.sql',
  pharmacyPublishRpc: '0070_import_pharmacy_private_publish_rpc.sql',
  pharmacyRollback: '0071_import_pharmacy_private_rollback_rpc.sql',
  durableReference: '0072_import_pharmacy_publish_references.sql',
  pharmacyReadState: '0073_import_pharmacy_admin_read_states.sql',
  pharmacyAuthorization: '0074_import_pharmacy_publish_authorizations.sql',
  pharmacyMetadataLocale: '0075_import_pharmacy_metadata_locale_preservation.sql',
  pharmacyStableOperation: '0076_import_pharmacy_stable_operation_identity.sql',
  pharmacyAuthorizationV2: '0077_import_pharmacy_authorization_persistence_v2.sql',
  pharmacyAuthorizationLifecycle: '0078_import_pharmacy_authorization_invalidation_readback.sql',
  pharmacyAtomicAuthorization: '0079_import_pharmacy_atomic_authorization_reservation.sql',
  pharmacyReadStateUpsert: '0080_import_pharmacy_read_state_upsert_identity.sql',
  pharmacyReservationAuditSplit: '0081_import_pharmacy_reservation_audit_split.sql',
  pharmacyPrivateExecutionAudit: '0082_import_pharmacy_private_execution_audit.sql',
  pharmacyAtomicRollbackAuthority: '0083_import_pharmacy_atomic_rollback_authority.sql',
  pharmacyRollbackDigestSchema: '0084_import_pharmacy_rollback_digest_schema.sql',
  pharmacyExpectedVersionTimestamp: '0085_import_pharmacy_expected_version_timestamp_equivalence.sql',
  pharmacyRecoveryReviewAttempts: '0086_import_pharmacy_recovery_review_attempts.sql',
};

const currentOnlyMigrations = Object.values(migrationNames).map((name) => [
  name,
  migration(name),
  migration(`.current-${name}.hidden`),
]);

function fail(message) {
  console.error(`ERROR: CURRENT-MIGRATION-VALIDATION: ${message}`);
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
function readMigration(name) {
  const migrationPath = migration(name);
  requireCondition(existsSync(migrationPath), `${name} is missing.`);
  return readFileSync(migrationPath, 'utf8');
}
function runValidator(file) {
  requireCondition(existsSync(file), `${path.relative(repoRoot, file)} is missing.`);
  execFileSync(process.execPath, [file], { cwd: repoRoot, stdio: 'inherit' });
}

function validateScheduleRls() {
  const content = readMigration(migrationNames.scheduleRls);
  for (const [pattern, message] of [
    [/SEC-SCHEDULE-RLS-A: schedule and appointment table RLS hardening/i, '0065 phase marker is missing.'],
    [/alter\s+table\s+public\.doctor_schedules\s+enable\s+row\s+level\s+security/i, '0065 must enable doctor_schedules RLS.'],
    [/alter\s+table\s+public\.doctor_schedule_exceptions\s+enable\s+row\s+level\s+security/i, '0065 must enable doctor_schedule_exceptions RLS.'],
    [/alter\s+table\s+public\.appointment_slots\s+enable\s+row\s+level\s+security/i, '0065 must enable appointment_slots RLS.'],
  ]) requirePattern(content, pattern, message);
  for (const [pattern, message] of [
    [/\binsert\s+into\b/i, '0065 must not seed rows.'],
    [/\bdrop\b/i, '0065 must not contain DROP statements.'],
    [/\bcreate\s+policy\b/i, '0065 must not create policies.'],
    [/\bto\s+(anon|authenticated)\b/i, '0065 must not expose anon/authenticated roles.'],
    [/\bfor\s+(insert|update|delete)\b/i, '0065 must not add write policies.'],
  ]) forbidPattern(content, pattern, message);
}

function validatePublishPersistence() {
  const content = readMigration(migrationNames.publishPersistence);
  for (const [pattern, message] of [
    [/IMPORT-PUBLISH-C: controlled publish persistence schema/i, '0068 phase marker is missing.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_publish_idempotency_records/i, '0068 must create idempotency persistence.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_publish_rollback_snapshots/i, '0068 must create rollback snapshots.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_publish_audit_events/i, '0068 must create audit events.'],
    [/idempotency_key\s+text\s+not\s+null\s+unique/i, '0068 must enforce unique idempotency keys.'],
    [/on\s+delete\s+restrict/i, '0068 must prevent destructive audit-chain cascades.'],
    [/alter\s+table\s+public\.import_publish_idempotency_records\s+enable\s+row\s+level\s+security/i, '0068 must enable idempotency RLS.'],
    [/alter\s+table\s+public\.import_publish_rollback_snapshots\s+enable\s+row\s+level\s+security/i, '0068 must enable rollback snapshot RLS.'],
    [/alter\s+table\s+public\.import_publish_audit_events\s+enable\s+row\s+level\s+security/i, '0068 must enable audit RLS.'],
  ]) requirePattern(content, pattern, message);
  for (const [pattern, message] of [
    [/\binsert\s+into\b/i, '0068 must not seed rows.'],
    [/\bdrop\b/i, '0068 must not contain DROP statements.'],
    [/\bcreate\s+policy\b/i, '0068 must not create policies.'],
    [/\bto\s+(public|anon|authenticated|service_role)\b/i, '0068 must not add role grants.'],
  ]) forbidPattern(content, pattern, message);
}

function validateAtomicAuthorization() {
  const content = readMigration(migrationNames.pharmacyAtomicAuthorization);
  for (const [pattern, message] of [
    [/IMPORT-ADMIN-AE: atomically verify and consume one Pharmacy authorization/i, '0079 phase marker is missing.'],
    [/add\s+column\s+if\s+not\s+exists\s+pharmacy_authorization_id\s+uuid/i, '0079 must bind Reservation to authorization.'],
    [/from\s+public\.import_pharmacy_publish_authorizations[\s\S]*for\s+update/i, '0079 must lock authorization before writes.'],
    [/status\s*=\s*'consumed'/i, '0079 must consume authorization.'],
    [/consumed_by_reservation_id\s*=\s*v_idempotency_id/i, '0079 must bind consumption to Reservation.'],
    [/security\s+invoker/i, '0079 must remain security invoker.'],
    [/set\s+search_path\s*=\s*pg_catalog\s*,\s*public/i, '0079 must pin search_path.'],
    [/grant\s+execute[\s\S]*to\s+service_role/i, '0079 must remain service-role-only.'],
  ]) requirePattern(content, pattern, message);
  forbidPattern(content, /\bcreate\s+policy\b/i, '0079 must not create policies.');
  forbidPattern(content, /grant\s+execute[\s\S]*to\s+(public|anon|authenticated)/i, '0079 must not expose public roles.');
}

function validateReadStateUpsert() {
  const content = readMigration(migrationNames.pharmacyReadStateUpsert);
  for (const [pattern, message] of [
    [/P02 RES-INTEGRITY-READBACK: make Pharmacy read-state UPSERT identities inferable/i, '0080 phase marker is missing.'],
    [/drop\s+index\s+if\s+exists\s+public\.import_pharmacy_admin_read_states_attempt_operation_idx/i, '0080 must replace the operation-attempt index.'],
    [/create\s+unique\s+index\s+import_pharmacy_admin_read_states_attempt_operation_idx[\s\S]*\(\s*operation_attempt_id\s*,\s*operation\s*\)\s*;/i, '0080 must create an inferable operation-attempt index.'],
    [/drop\s+index\s+if\s+exists\s+public\.import_pharmacy_admin_read_states_idempotency_operation_idx/i, '0080 must replace the idempotency index.'],
    [/create\s+unique\s+index\s+import_pharmacy_admin_read_states_idempotency_operation_idx[\s\S]*\(\s*idempotency_key\s*,\s*operation\s*\)\s*;/i, '0080 must create an inferable idempotency index.'],
  ]) requirePattern(content, pattern, message);
  for (const [pattern, message] of [
    [/where\s+(operation_attempt_id|idempotency_key)\s+is\s+not\s+null/i, '0080 UPSERT indexes must not remain partial.'],
    [/\b(insert\s+into|update\s+public\.|delete\s+from|truncate\s+table)\b/i, '0080 must not mutate rows.'],
    [/\bcreate\s+policy\b/i, '0080 must not create policies.'],
    [/\bgrant\b/i, '0080 must not grant privileges.'],
  ]) forbidPattern(content, pattern, message);
}

function validateReservationAuditSplit() {
  const content = readMigration(migrationNames.pharmacyReservationAuditSplit);
  for (const [pattern, message] of [
    [/P04-A RESERVATION-AUDIT-SPLIT/i, '0081 phase marker is missing.'],
    [/add\s+constraint\s+import_publish_audit_event_type_check[\s\S]*'reservation_created'/i, '0081 must admit reservation_created.'],
    [/validate\s+constraint\s+import_publish_audit_event_type_check/i, '0081 must validate the audit constraint.'],
    [/create\s+or\s+replace\s+function\s+public\.import_publish_reserve_snapshot_audit/i, '0081 must replace the Reservation RPC.'],
    [/p_audit_schema_version\s+is\s+distinct\s+from\s+'drkhaleej\.import\.publishAudit\.v2'/i, '0081 must require v2 reservation audit.'],
    [/'reservation_created'\s*,\s*'pending'\s*,\s*p_audit_schema_version/i, '0081 must write reservation_created.'],
    [/event_payload\s*->>\s*'phase'\s*=\s*'reservation'/i, '0081 replay must remain reservation-phase bounded.'],
    [/security\s+invoker/i, '0081 must remain security invoker.'],
    [/set\s+search_path\s*=\s*pg_catalog\s*,\s*public/i, '0081 must pin search_path.'],
    [/grant\s+execute[\s\S]*to\s+service_role/i, '0081 must remain service-role-only.'],
  ]) requirePattern(content, pattern, message);
  forbidPattern(content, /\bcreate\s+policy\b/i, '0081 must not create policies.');
  forbidPattern(content, /grant\s+execute[\s\S]*to\s+(public|anon|authenticated)/i, '0081 must not expose public roles.');
  forbidPattern(content, /'execution_started'\s*,\s*'pending'\s*,\s*p_audit_schema_version/i, '0081 must not write the legacy reservation event.');
}

function validateRecoveryReviewAttempts() {
  const content = readMigration(migrationNames.pharmacyRecoveryReviewAttempts);
  for (const [pattern, message] of [
    [/P09-B EXPIRED-RESERVATION-RECOVERY/i, '0086 phase marker is missing.'],
    [/drop\s+index\s+if\s+exists\s+public\.import_pharmacy_admin_read_states_identity_idx/i, '0086 must remove the obsolete all-row read-state identity index.'],
    [/create\s+unique\s+index\s+if\s+not\s+exists\s+import_pharmacy_admin_read_states_legacy_identity_idx/i, '0086 must preserve a legacy-only identity index.'],
    [/where\s+operation_attempt_id\s+is\s+null/i, '0086 legacy identity index must exclude v3 recovery attempts.'],
    [/operation_attempt_id\s+and\s+idempotency_key/i, '0086 must document the v3 stable identity authority.'],
  ]) requirePattern(content, pattern, message);
  for (const [pattern, message] of [
    [/\b(insert\s+into|update\s+public\.|delete\s+from|truncate\s+table)\b/i, '0086 must not mutate rows.'],
    [/\bcreate\s+policy\b/i, '0086 must not create policies.'],
    [/\bgrant\b/i, '0086 must not grant privileges.'],
  ]) forbidPattern(content, pattern, message);
}

function runLegacyValidatorWithoutCurrentOnlyMigrations() {
  for (const [name, source, hidden] of currentOnlyMigrations) {
    requireCondition(existsSync(source), `${name} is missing before legacy validation.`);
    requireCondition(!existsSync(hidden), `Stale hidden migration exists for ${name}.`);
  }
  const renamed = [];
  try {
    for (const [name, source, hidden] of currentOnlyMigrations) {
      renameSync(source, hidden);
      renamed.push([name, source, hidden]);
    }
    runValidator(legacyValidator);
  } finally {
    for (const [, source, hidden] of renamed.reverse()) {
      if (existsSync(hidden)) renameSync(hidden, source);
    }
  }
}

runLegacyValidatorWithoutCurrentOnlyMigrations();
validateScheduleRls();
runValidator(validators.functionSearchPath);
runValidator(validators.helperSearchPath);
validatePublishPersistence();
runValidator(validators.publishRpc);
requireCondition(existsSync(migration(migrationNames.pharmacyPrivateExecutionAudit)), `${migrationNames.pharmacyPrivateExecutionAudit} is missing.`);
runValidator(validators.pharmacyPublishRpc);
requireCondition(existsSync(migration(migrationNames.pharmacyAtomicRollbackAuthority)), `${migrationNames.pharmacyAtomicRollbackAuthority} is missing.`);
requireCondition(existsSync(migration(migrationNames.pharmacyRollbackDigestSchema)), `${migrationNames.pharmacyRollbackDigestSchema} is missing.`);
runValidator(validators.pharmacyRollback);
runValidator(validators.durableReference);
runValidator(validators.pharmacyReadState);
runValidator(validators.pharmacyAuthorization);
runValidator(validators.pharmacyMetadataLocale);
runValidator(validators.pharmacyStableOperation);
runValidator(validators.pharmacyAuthorizationV2);
runValidator(validators.pharmacyAuthorizationLifecycle);
validateAtomicAuthorization();
validateReadStateUpsert();
validateReservationAuditSplit();
runValidator(validators.pharmacyExpectedVersionTimestamp);
validateRecoveryReviewAttempts();

console.log('Current migration validation passed through 0086.');
