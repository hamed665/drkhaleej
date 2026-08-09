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
  entityCandidatePipeline: script('import', 'check-entity-candidate-pipeline.mjs'),
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
  pharmacyPublicNoindexAuthority: '0087_import_pharmacy_public_noindex_authority.sql',
  pharmacyPublicRollback: '0088_import_pharmacy_public_rollback.sql',
  pharmacyIndexPromotion: '0089_import_pharmacy_index_promotion.sql',
  pharmacySitemapPromotion: '0090_import_pharmacy_sitemap_promotion.sql',
  importPublishQueueIndexPolicyCompat:
    '0091_import_publish_queue_index_policy_compat.sql',
  sourceEvidenceLedger: '0092_import_source_evidence_ledger.sql',
  entityCandidatePipeline: '0093_import_entity_candidate_pipeline.sql',
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

function validatePharmacyPublicNoindexAuthority() {
  const content = readMigration(migrationNames.pharmacyPublicNoindexAuthority);
  for (const [pattern, message] of [
    [/P11 PHARMACY-PUBLIC-NOINDEX-AUTHORITY/i, '0087 authority phase marker is missing.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_pharmacy_public_noindex_authorizations/i, '0087 must create the protected public/noindex authority.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_pharmacy_public_noindex_events/i, '0087 must create append-only public/noindex events.'],
    [/candidate_id\s+uuid\s+not\s+null/i, '0087 must bind an existing candidate identity.'],
    [/snapshot_payload\s+jsonb\s+not\s+null/i, '0087 must persist the pre-public Queue snapshot.'],
    [/create\s+unique\s+index\s+if\s+not\s+exists\s+import_pharmacy_public_noindex_active_entity_unique/i, '0087 must allow only one active authority per Pharmacy.'],
    [/where\s+status\s+in\s*\(\s*'issued'\s*,\s*'published'\s*\)/i, '0087 active authority index is not authority-bounded.'],
    [/create\s+or\s+replace\s+function\s+public\.import_authorize_pharmacy_public_noindex/i, '0087 must define independent authorization.'],
    [/create\s+or\s+replace\s+function\s+public\.import_publish_pharmacy_public_noindex/i, '0087 must define atomic Queue publication.'],
    [/publish_status\s*=\s*'published_noindex'/i, '0087 must publish only to published_noindex.'],
    [/index_policy\s*=\s*'noindex'/i, '0087 must preserve noindex.'],
    [/sitemap_policy\s*=\s*'excluded'/i, '0087 must preserve sitemap exclusion.'],
    [/'robots_policy'\s*,\s*'noindex'/i, '0087 must persist noindex robots state.'],
    [/'sitemap_included'\s*,\s*false/i, '0087 must persist sitemap exclusion evidence.'],
    [/'public_route_enabled'\s*,\s*false/i, '0087 must keep the public route independently locked.'],
    [/security\s+invoker/i, '0087 RPCs must remain security invoker.'],
    [/set\s+search_path\s*=\s*pg_catalog\s*,\s*public/i, '0087 RPCs must pin search_path.'],
    [/alter\s+table\s+public\.import_pharmacy_public_noindex_authorizations\s+enable\s+row\s+level\s+security/i, '0087 must enable authority RLS.'],
    [/alter\s+table\s+public\.import_pharmacy_public_noindex_events\s+enable\s+row\s+level\s+security/i, '0087 must enable event RLS.'],
    [/grant\s+execute[\s\S]*to\s+service_role/i, '0087 RPCs must be service-role-only.'],
  ]) requirePattern(content, pattern, message);
  for (const [pattern, message] of [
    [/import_rollback_pharmacy_public_noindex_by_authority/i, '0087 authority scope must not include rollback.'],
    [/'rolled_back'/i, '0087 authority scope must not claim rollback state.'],
    [/\bcreate\s+policy\b/i, '0087 must not create public policies.'],
    [/grant\s+execute[\s\S]*to\s+(public|anon|authenticated)/i, '0087 must not expose RPCs to public roles.'],
    [/index_policy\s*=\s*'index'/i, '0087 must not promote index state.'],
    [/sitemap_policy\s*=\s*'included'/i, '0087 must not promote sitemap state.'],
    [/status\s*=\s*'active'::public\.provider_status/i, '0087 must not activate the canonical center row.'],
    [/is_active\s*=\s*true/i, '0087 must not activate the canonical center row.'],
    [/delete\s+from\s+public\.import_publish_queue/i, '0087 authority scope must not implement rollback.'],
  ]) forbidPattern(content, pattern, message);
}

function validatePharmacyPublicRollback() {
  const content = readMigration(migrationNames.pharmacyPublicRollback);
  for (const [pattern, message] of [
    [/P13 PHARMACY-PUBLIC-ROLLBACK/i, '0088 rollback phase marker is missing.'],
    [/add\s+column\s+if\s+not\s+exists\s+rolled_back_at\s+timestamptz/i, '0088 must persist rollback time.'],
    [/status\s+in\s*\(\s*'issued'\s*,\s*'published'\s*,\s*'rolled_back'/i, '0088 must extend the existing authority lifecycle.'],
    [/'public_noindex_rolled_back'/i, '0088 must append the rollback event type.'],
    [/create\s+or\s+replace\s+function\s+public\.import_rollback_pharmacy_public_noindex_by_authority/i, '0088 must define server-selected rollback.'],
    [/from\s+public\.import_pharmacy_public_noindex_authorizations[\s\S]*for\s+update/i, '0088 must lock the existing authority.'],
    [/extensions\.digest\(v_authorization\.snapshot_payload::text/i, '0088 must verify the protected snapshot hash.'],
    [/delete\s+from\s+public\.import_publish_queue/i, '0088 must remove a P11-created Queue.'],
    [/update\s+public\.import_publish_queue/i, '0088 must restore a pre-existing Queue.'],
    [/status\s*=\s*'rolled_back'/i, '0088 must consume the authority before Queue deletion.'],
    [/security\s+invoker/i, '0088 RPC must remain security invoker.'],
    [/set\s+search_path\s*=\s*pg_catalog\s*,\s*public/i, '0088 RPC must pin search_path.'],
    [/grant\s+execute[\s\S]*to\s+service_role/i, '0088 RPC must be service-role-only.'],
  ]) requirePattern(content, pattern, message);
  for (const [pattern, message] of [
    [/\bcreate\s+policy\b/i, '0088 must not create public policies.'],
    [/grant\s+execute[\s\S]*to\s+(public|anon|authenticated)/i, '0088 must not expose public roles.'],
    [/index_policy\s*=\s*'index'/i, '0088 must not promote index state.'],
    [/sitemap_policy\s*=\s*'included'/i, '0088 must not promote sitemap state.'],
    [/status\s*=\s*'active'::public\.provider_status/i, '0088 must not activate the canonical center.'],
    [/is_active\s*=\s*true/i, '0088 must not activate the canonical center.'],
  ]) forbidPattern(content, pattern, message);
}

function validatePharmacyIndexPromotion() {
  const content = readMigration(migrationNames.pharmacyIndexPromotion);
  for (const [pattern, message] of [
    [/P14 PHARMACY-INDEX-PROMOTION/i, '0089 Index phase marker is missing.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_pharmacy_index_authorizations/i, '0089 must create the independent Index authority.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_pharmacy_index_events/i, '0089 must create append-only Index events.'],
    [/public_noindex_authorization_id\s+uuid\s+not\s+null/i, '0089 must bind the P11 public/noindex authority.'],
    [/snapshot_payload\s+jsonb\s+not\s+null/i, '0089 must persist the exact pre-Index Queue snapshot.'],
    [/where\s+status\s+in\s*\(\s*'issued'\s*,\s*'promoted'\s*\)/i, '0089 must allow only one active Index authority per Pharmacy.'],
    [/create\s+or\s+replace\s+function\s+public\.import_authorize_pharmacy_index_promotion/i, '0089 must define independent Index authorization.'],
    [/create\s+or\s+replace\s+function\s+public\.import_promote_pharmacy_index_by_authority/i, '0089 must define atomic Index promotion.'],
    [/create\s+or\s+replace\s+function\s+public\.import_rollback_pharmacy_index_by_authority/i, '0089 must define exact Index rollback.'],
    [/publish_status\s*=\s*'index_eligible'/i, '0089 must use the existing index-eligible Queue state.'],
    [/index_policy\s*=\s*'index_eligible'/i, '0089 must promote only the Index policy.'],
    [/sitemap_policy\s*=\s*'excluded'/i, '0089 must keep Sitemap excluded.'],
    [/'sitemap_included'\s*,\s*false/i, '0089 must persist Sitemap exclusion.'],
    [/jsonb_array_elements_text\([\s\S]*candidate_payload\s*->\s*'languages'/i, '0089 must require an Index language signal.'],
    [/candidate_payload\s*#>\s*'\{taxonomy,services\}'/i, '0089 must require an Index taxonomy signal.'],
    [/'index_candidate_content_ineligible'/i, '0089 must fail closed on thin Index content.'],
    [/extensions\.digest\(v_authorization\.snapshot_payload::text/i, '0089 must verify the protected Queue snapshot hash.'],
    [/index_policy\s*=\s*v_snapshot_queue\s*->>\s*'indexPolicy'/i, '0089 rollback must restore the prior Index policy.'],
    [/security\s+invoker/i, '0089 RPCs must remain security invoker.'],
    [/set\s+search_path\s*=\s*pg_catalog\s*,\s*public/i, '0089 RPCs must pin search_path.'],
    [/alter\s+table\s+public\.import_pharmacy_index_authorizations\s+enable\s+row\s+level\s+security/i, '0089 must enable authority RLS.'],
    [/alter\s+table\s+public\.import_pharmacy_index_events\s+enable\s+row\s+level\s+security/i, '0089 must enable event RLS.'],
    [/grant\s+execute[\s\S]*to\s+service_role/i, '0089 RPCs must be service-role-only.'],
  ]) requirePattern(content, pattern, message);
  for (const [pattern, message] of [
    [/\bcreate\s+policy\b/i, '0089 must not create public policies.'],
    [/grant\s+execute[\s\S]*to\s+(public|anon|authenticated)/i, '0089 must not expose public roles.'],
    [/sitemap_policy\s*=\s*'included'/i, '0089 must not include Sitemap.'],
    [/'sitemap_included'\s*,\s*true/i, '0089 must not persist Sitemap inclusion.'],
    [/status\s*=\s*'active'::public\.provider_status/i, '0089 must not activate the canonical center.'],
    [/is_active\s*=\s*true/i, '0089 must not activate the canonical center.'],
    [/pharmacy_sitemap_promotion/i, '0089 must not claim the later Sitemap authority.'],
  ]) forbidPattern(content, pattern, message);
}

function validatePharmacySitemapPromotion() {
  const content = readMigration(migrationNames.pharmacySitemapPromotion);
  for (const [pattern, message] of [
    [/P15 PHARMACY-SITEMAP-PROMOTION/i, '0090 Sitemap phase marker is missing.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_pharmacy_sitemap_authorizations/i, '0090 must create the independent Sitemap authority.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_pharmacy_sitemap_events/i, '0090 must create append-only Sitemap events.'],
    [/index_authorization_id\s+uuid\s+not\s+null/i, '0090 must bind the exact P14 Index authority.'],
    [/snapshot_payload\s+jsonb\s+not\s+null/i, '0090 must persist the exact pre-Sitemap Queue snapshot.'],
    [/where\s+status\s+in\s*\(\s*'issued'\s*,\s*'included'\s*\)/i, '0090 must allow only one active Sitemap authority per Pharmacy.'],
    [/create\s+or\s+replace\s+function\s+public\.import_authorize_pharmacy_sitemap_promotion/i, '0090 must define independent Sitemap authorization.'],
    [/create\s+or\s+replace\s+function\s+public\.import_include_pharmacy_sitemap_by_authority/i, '0090 must define atomic Sitemap inclusion.'],
    [/create\s+or\s+replace\s+function\s+public\.import_rollback_pharmacy_sitemap_by_authority/i, '0090 must define exact Sitemap rollback.'],
    [/publish_status\s*=\s*'index_eligible'/i, '0090 must preserve the P14 publish status.'],
    [/index_policy\s*=\s*'index'/i, '0090 must emit the existing included-Sitemap Index policy.'],
    [/sitemap_policy\s*=\s*'included'/i, '0090 must include only the authorized Sitemap row.'],
    [/'sitemap_included'\s*,\s*true/i, '0090 must persist Sitemap inclusion evidence.'],
    [/extensions\.digest\(v_authorization\.snapshot_payload::text/i, '0090 must verify the protected P14 Queue snapshot hash.'],
    [/sitemap_policy\s*=\s*v_snapshot_queue\s*->>\s*'sitemapPolicy'/i, '0090 rollback must restore the prior Sitemap policy.'],
    [/index_policy\s*=\s*v_snapshot_queue\s*->>\s*'indexPolicy'/i, '0090 rollback must restore the prior Index policy exactly.'],
    [/security\s+invoker/i, '0090 RPCs must remain security invoker.'],
    [/set\s+search_path\s*=\s*pg_catalog\s*,\s*public/i, '0090 RPCs must pin search_path.'],
    [/alter\s+table\s+public\.import_pharmacy_sitemap_authorizations\s+enable\s+row\s+level\s+security/i, '0090 must enable authority RLS.'],
    [/alter\s+table\s+public\.import_pharmacy_sitemap_events\s+enable\s+row\s+level\s+security/i, '0090 must enable event RLS.'],
    [/grant\s+execute[\s\S]*to\s+service_role/i, '0090 RPCs must be service-role-only.'],
  ]) requirePattern(content, pattern, message);
  for (const [pattern, message] of [
    [/\bcreate\s+policy\b/i, '0090 must not create public policies.'],
    [/grant\s+execute[\s\S]*to\s+(public|anon|authenticated)/i, '0090 must not expose public roles.'],
    [/status\s*=\s*'active'::public\.provider_status/i, '0090 must not activate the canonical center.'],
    [/is_active\s*=\s*true/i, '0090 must not activate the canonical center.'],
    [/json_ld/i, '0090 must not add JSON-LD behavior.'],
  ]) forbidPattern(content, pattern, message);
}

function validateImportPublishQueueIndexPolicyCompat() {
  const content = readMigration(migrationNames.importPublishQueueIndexPolicyCompat);
  for (const [pattern, message] of [
    [/P15 hosted compatibility correction/i, '0091 compatibility phase marker is missing.'],
    [/alter\s+table\s+public\.import_publish_queue\s+drop\s+constraint\s+if\s+exists\s+import_publish_queue_index_policy_check/i, '0091 must replace only the existing Queue policy constraint.'],
    [/alter\s+table\s+public\.import_publish_queue\s+add\s+constraint\s+import_publish_queue_index_policy_check/i, '0091 must restore the named Queue policy constraint.'],
    [/index_policy\s+in\s*\(\s*'noindex'\s*,\s*'index_eligible'\s*,\s*'index'\s*,\s*'blocked'\s*\)/i, '0091 must preserve every prior state and add only the reviewed Sitemap Index state.'],
    [/comment\s+on\s+constraint\s+import_publish_queue_index_policy_check/i, '0091 must document the corrected policy boundary.'],
  ]) requirePattern(content, pattern, message);
  for (const [pattern, message] of [
    [/\b(insert|update|delete|truncate)\b/i, '0091 must not mutate Queue data.'],
    [/\bcreate\s+policy\b/i, '0091 must not create public policies.'],
    [/\bgrant\b/i, '0091 must not change grants.'],
    [/\bcreate\s+(table|function)\b/i, '0091 must not create runtime surfaces.'],
  ]) forbidPattern(content, pattern, message);
}

function validateSourceEvidenceLedger() {
  const content = readMigration(migrationNames.sourceEvidenceLedger);
  for (const [pattern, message] of [
    [/P17 SOURCE-EVIDENCE-LEDGER/i, '0092 phase marker is missing.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_source_observations/i, '0092 must create private observations.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_source_evidence\s*\(/i, '0092 must create bounded evidence.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_source_evidence_events/i, '0092 must create lifecycle audit events.'],
    [/policy_status\s+in\s*\(\s*'accepted'\s*,\s*'denied'\s*,\s*'needs_review'\s*\)/i, '0092 must use the reviewed policy vocabulary.'],
    [/interval\s+'30 days'/i, '0092 must cap standard retention at 30 days.'],
    [/interval\s+'90 days'/i, '0092 must cap dispute retention at 90 days.'],
    [/create\s+or\s+replace\s+function\s+public\.import_register_source_evidence/i, '0092 must define atomic registration.'],
    [/create\s+or\s+replace\s+function\s+public\.import_read_source_evidence/i, '0092 must define bounded audited readback.'],
    [/create\s+or\s+replace\s+function\s+public\.import_record_source_observation_deletion/i, '0092 must define deletion audit.'],
    [/source_evidence_append_only/i, '0092 must protect append-only rows.'],
    [/pg_advisory_xact_lock/i, '0092 must serialize idempotency-key races before readback.'],
    [/for\s+update/i, '0092 must serialize idempotency and lifecycle transitions.'],
    [/security\s+definer/i, '0092 RPCs must cross the private table boundary through a pinned definer.'],
    [/set\s+search_path\s*=\s*pg_catalog\s*,\s*public/i, '0092 functions must pin search_path.'],
    [/grant\s+execute[\s\S]*to\s+service_role/i, '0092 RPCs must be service-role-only.'],
    [/alter\s+table\s+public\.import_source_observations\s+enable\s+row\s+level\s+security/i, '0092 must enable Observation RLS.'],
    [/alter\s+table\s+public\.import_source_evidence\s+enable\s+row\s+level\s+security/i, '0092 must enable Evidence RLS.'],
    [/alter\s+table\s+public\.import_source_evidence_events\s+enable\s+row\s+level\s+security/i, '0092 must enable event RLS.'],
    [/revoke\s+all\s+on\s+table\s+public\.import_source_observations\s+from\s+public\s*,\s*anon\s*,\s*authenticated\s*,\s*service_role/i, '0092 must close direct Observation access.'],
  ]) requirePattern(content, pattern, message);
  for (const [pattern, message] of [
    [/\bcreate\s+policy\b/i, '0092 must not create public policies.'],
    [/grant\s+(select|insert|update|delete|all)\s+on\s+(table\s+)?public\.import_source_/i, '0092 must not grant direct table access.'],
    [/\b(insert|update|delete)\s+(into\s+)?public\.(centers|doctors|import_publish_queue)\b/i, '0092 must not mutate canonical or publish rows.'],
    [/json_ld|sitemap_policy|index_policy/i, '0092 must not open SEO promotion behavior.'],
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
validatePharmacyPublicNoindexAuthority();
validatePharmacyPublicRollback();
validatePharmacyIndexPromotion();
validatePharmacySitemapPromotion();
validateImportPublishQueueIndexPolicyCompat();
validateSourceEvidenceLedger();
requireCondition(existsSync(migration(migrationNames.entityCandidatePipeline)), `${migrationNames.entityCandidatePipeline} is missing.`);
runValidator(validators.entityCandidatePipeline);

console.log('Current migration validation passed through 0093.');
