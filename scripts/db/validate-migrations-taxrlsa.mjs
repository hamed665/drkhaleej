#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const migrationsDir = path.join(repoRoot, 'supabase', 'migrations');
const taxC1Validator = path.join(repoRoot, 'scripts', 'db', 'validate-migrations-taxc1.mjs');

const laterMigrationNames = {
  taxC1: '0054_healthcare_verticals_center_categories.sql',
  taxRls: '0055_taxonomy_public_rls.sql',
  geoFullB: '0056_country_code_regional_expansion.sql',
  specialty: '0057_specialty_taxonomy_hierarchy.sql',
  adminAudit: '0058_admin_audit_events.sql',
  adminMedia: '0059_admin_media_library_foundation.sql',
  adminCms: '0060_admin_cms_core_revision_foundation.sql',
  importStaging: '0061_import_staging_foundation.sql',
  doctorPracticeHardening: '0062_doctor_multi_practice_relation_hardening.sql',
  facilityDepartment: '0063_facility_department_foundation.sql',
  importRelationCandidates: '0064_import_relation_candidates.sql',
};

const migrationPaths = Object.fromEntries(
  Object.entries(laterMigrationNames).map(([key, fileName]) => [
    key,
    path.join(migrationsDir, fileName),
  ]),
);

const hiddenMigrationPaths = Object.fromEntries(
  Object.entries(laterMigrationNames)
    .filter(([key]) => key !== 'taxC1')
    .map(([key, fileName]) => [
      key,
      path.join(migrationsDir, `.${key}-${fileName}.hidden`),
    ]),
);

const expectedMigrations = [
  '0001_extensions.sql',
  '0002_enums.sql',
  '0003_profiles_auth.sql',
  '0004_geo.sql',
  '0005_taxonomy.sql',
  '0006_centers.sql',
  '0007_center_locations.sql',
  '0008_center_services.sql',
  '0009_center_ownership_claims.sql',
  '0010_doctors.sql',
  '0011_doctor_practice_locations.sql',
  '0012_doctor_services.sql',
  '0013_doctor_schedules.sql',
  '0014_doctor_schedule_exceptions.sql',
  '0015_appointment_slots.sql',
  '0016_patient_contacts.sql',
  '0017_appointments.sql',
  '0018_appointment_status_history.sql',
  '0019_appointment_cancellations.sql',
  '0020_reviews.sql',
  '0021_review_reports.sql',
  '0022_center_type_expansion.sql',
  '0023_media_assets.sql',
  '0024_entity_media.sql',
  '0025_subscription_plans.sql',
  '0026_center_subscriptions.sql',
  '0027_sponsored_campaigns.sql',
  '0028_legal_documents.sql',
  '0029_consent_logs.sql',
  '0030_audit_logs.sql',
  '0031_rls_auth_helpers.sql',
  '0032_rls_public_catalog_read_policies.sql',
  '0033_profiles_rls.sql',
  '0034_center_access_helpers.sql',
  '0035_center_claims_memberships_rls.sql',
  '0036_patient_contacts_profile_link.sql',
  '0037_patient_appointment_access_helpers.sql',
  '0038_patient_contacts_appointments_rls.sql',
  '0039_review_media_access_helpers.sql',
  '0040_reviews_reports_media_private_rls.sql',
  '0041_monetization_access_helpers.sql',
  '0042_monetization_sponsored_rls.sql',
  '0043_legal_consent_audit_access_helpers.sql',
  '0044_legal_consent_audit_rls.sql',
  '0045_contact_visibility_foundation.sql',
  '0046_callback_request_foundation.sql',
  '0047_provider_license_verification_foundation.sql',
  '0048_media_public_visibility_hardening.sql',
  '0049_media_public_rls_hardening.sql',
  '0050_provider_onboarding_leads.sql',
  '0051_landing_page_contents.sql',
  '0052_review_companion_tables.sql',
  '0053_provider_onboarding_lead_events.sql',
  laterMigrationNames.taxC1,
  laterMigrationNames.taxRls,
  laterMigrationNames.geoFullB,
  laterMigrationNames.specialty,
  laterMigrationNames.adminAudit,
  laterMigrationNames.adminMedia,
  laterMigrationNames.adminCms,
  laterMigrationNames.importStaging,
  laterMigrationNames.doctorPracticeHardening,
  laterMigrationNames.facilityDepartment,
  laterMigrationNames.importRelationCandidates,
];

function fail(message) {
  console.error(`ERROR: ADM-IMPORT-A: ${message}`);
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

function readSqlMigrationFiles() {
  requireCondition(statSync(migrationsDir).isDirectory(), 'Missing migrations directory.');

  return readdirSync(migrationsDir)
    .filter((name) => name.endsWith('.sql'))
    .sort();
}

function validateMigrationInventory() {
  const actualMigrations = readSqlMigrationFiles();

  if (actualMigrations.join('|') !== expectedMigrations.join('|')) {
    const missing = expectedMigrations.filter((name) => !actualMigrations.includes(name));
    const unexpected = actualMigrations.filter((name) => !expectedMigrations.includes(name));

    if (missing.length > 0) console.error(`Missing required files: ${missing.join(', ')}`);
    if (unexpected.length > 0) console.error(`Unexpected SQL migration files: ${unexpected.join(', ')}`);

    fail('Migration inventory must be exactly 0001 through 0064 for ADM-IMPORT-A.');
  }
}

function validateTaxonomyRlsMigration() {
  const content = readMigration('taxRls');
  for (const [pattern, message] of [
    [/\binsert\s+into\b/i, '0055 must not seed rows or use INSERT INTO.'],
    [/\bdrop\b/i, '0055 must not contain DROP statements.'],
    [/\bfor\s+insert\b/i, '0055 must not add INSERT policies.'],
    [/\bfor\s+update\b/i, '0055 must not add UPDATE policies.'],
    [/\bfor\s+delete\b/i, '0055 must not add DELETE policies.'],
  ]) forbidPattern(content, pattern, message);
  for (const [pattern, message] of [
    [/alter\s+table\s+public\.healthcare_verticals\s+enable\s+row\s+level\s+security/i, '0055 must enable RLS on healthcare_verticals.'],
    [/alter\s+table\s+public\.center_categories\s+enable\s+row\s+level\s+security/i, '0055 must enable RLS on center_categories.'],
    [/alter\s+table\s+public\.center_category_assignments\s+enable\s+row\s+level\s+security/i, '0055 must enable RLS on center_category_assignments.'],
    [/create\s+policy\s+healthcare_verticals_select_public_active\s+on\s+public\.healthcare_verticals/i, '0055 must create healthcare_verticals public select policy.'],
    [/create\s+policy\s+center_categories_select_public_active\s+on\s+public\.center_categories/i, '0055 must create center_categories public select policy.'],
    [/create\s+policy\s+center_category_assignments_select_public_approved\s+on\s+public\.center_category_assignments/i, '0055 must create center_category_assignments public select policy.'],
    [/to\s+anon\s*,\s*authenticated/i, '0055 public policies must target anon and authenticated.'],
    [/deleted_at\s+is\s+null/i, '0055 policies must require deleted_at IS NULL.'],
    [/is_active\s*=\s*true/i, '0055 policies must require active rows.'],
    [/review_status\s*=\s*'approved'/i, '0055 assignment policy must require approved review_status.'],
  ]) requirePattern(content, pattern, message);
}

function validateGeoFullBCountryCodeMigration() {
  const content = readMigration('geoFullB');
  for (const [pattern, message] of [
    [/\binsert\s+into\b/i, '0056 must not seed rows or use INSERT INTO.'],
    [/\bcreate\s+table\b/i, '0056 must not create tables.'],
    [/\bdrop\b/i, '0056 must not contain DROP statements.'],
    [/\bcreate\s+policy\b/i, '0056 must not create policies.'],
    [/\benable\s+row\s+level\s+security\b/i, '0056 must not alter RLS.'],
  ]) forbidPattern(content, pattern, message);
  for (const code of ['ae', 'qa', 'bh', 'kw', 'sa', 'iq', 'sy', 'jo', 'lb', 'ps', 'eg', 'ye', 'ma', 'dz', 'tn', 'ly', 'sd', 'mr', 'ir']) {
    requirePattern(
      content,
      new RegExp(`alter\\s+type\\s+country_code\\s+add\\s+value\\s+if\\s+not\\s+exists\\s+'${code}'`, 'i'),
      `0056 must add country_code value '${code}'.`,
    );
  }
}

function validateSpecialtyModelMigration() {
  const content = readMigration('specialty');
  for (const [pattern, message] of [
    [/\binsert\s+into\b/i, '0057 must not seed rows or use INSERT INTO.'],
    [/\bdrop\s+table\b/i, '0057 must not drop tables.'],
  ]) forbidPattern(content, pattern, message);
  for (const [pattern, message] of [
    [/alter\s+table\s+public\.specialties/i, '0057 must alter public.specialties.'],
    [/parent_specialty_id\s+uuid\s+null\s+references\s+public\.specialties\(id\)/i, '0057 must add parent_specialty_id.'],
    [/specialty_level\s+text\s+not\s+null\s+default\s+'specialty'/i, '0057 must add specialty_level.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.specialty_aliases/i, '0057 must create specialty_aliases.'],
    [/alter\s+table\s+public\.specialty_aliases\s+enable\s+row\s+level\s+security/i, '0057 must enable RLS on specialty_aliases.'],
    [/create\s+policy\s+specialty_aliases_select_public_active\s+on\s+public\.specialty_aliases/i, '0057 must create public select policy for specialty_aliases.'],
  ]) requirePattern(content, pattern, message);
}

function validateAdminAuditEventsMigration() {
  const content = readMigration('adminAudit');
  validateAdminOnlyMigration(content, '0058');
  for (const [pattern, message] of [
    [/create\s+table\s+if\s+not\s+exists\s+public\.admin_audit_events/i, '0058 must create admin_audit_events.'],
    [/actor_profile_id\s+uuid\s+references\s+public\.profiles\(id\)/i, '0058 must reference profiles for actor_profile_id.'],
    [/alter\s+table\s+public\.admin_audit_events\s+enable\s+row\s+level\s+security/i, '0058 must enable RLS on admin_audit_events.'],
  ]) requirePattern(content, pattern, message);
}

function validateAdminMediaLibraryMigration() {
  const content = readMigration('adminMedia');
  validateAdminOnlyMigration(content, '0059');
  for (const [pattern, message] of [
    [/alter\s+table\s+public\.media_assets/i, '0059 must alter existing media_assets instead of creating a duplicate table.'],
    [/admin_review_status\s+text\s+not\s+null\s+default\s+'draft'/i, '0059 must add admin-only review status default draft.'],
    [/admin_visibility_status\s+text\s+not\s+null\s+default\s+'private'/i, '0059 must keep admin visibility private by default.'],
    [/media_assets_admin_review_status_check/i, '0059 must constrain admin review values.'],
  ]) requirePattern(content, pattern, message);
}

function validateAdminCmsMigration() {
  const content = readMigration('adminCms');
  validateAdminOnlyMigration(content, '0060');
  for (const [pattern, message] of [
    [/ADM-CMS-A: admin CMS core and revision foundation/i, '0060 must include ADM-CMS-A comment prefix.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.cms_content_entries/i, '0060 must create cms_content_entries.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.cms_content_revisions/i, '0060 must create cms_content_revisions.'],
    [/alter\s+table\s+public\.cms_content_entries\s+enable\s+row\s+level\s+security/i, '0060 must enable RLS on cms_content_entries.'],
    [/alter\s+table\s+public\.cms_content_revisions\s+enable\s+row\s+level\s+security/i, '0060 must enable RLS on cms_content_revisions.'],
    [/create\s+unique\s+index\s+if\s+not\s+exists\s+cms_content_entries_active_key_locale_country_idx\s+on\s+public\.cms_content_entries\s*\(\s*content_key\s*,\s*locale\s*,\s*country\s*\)\s+where\s+deleted_at\s+is\s+null\s+and\s+locale\s+is\s+not\s+null/i, '0060 must enforce active localized content uniqueness without casting the locale enum.'],
    [/create\s+unique\s+index\s+if\s+not\s+exists\s+cms_content_entries_active_key_global_country_idx\s+on\s+public\.cms_content_entries\s*\(\s*content_key\s*,\s*country\s*\)\s+where\s+deleted_at\s+is\s+null\s+and\s+locale\s+is\s+null/i, '0060 must enforce one active global content entry per key and country.'],
  ]) requirePattern(content, pattern, message);
  forbidPattern(
    content,
    /coalesce\s*\(\s*locale\s*::\s*text/i,
    '0060 must not cast app_locale to text inside an index expression because enum casts are not immutable.',
  );
}

function validateImportStagingMigration() {
  const content = readMigration('importStaging');
  validateAdminOnlyMigration(content, '0061');
  for (const [pattern, message] of [
    [/ADM-IMPORT-A: unified import staging foundation/i, '0061 must include ADM-IMPORT-A comment prefix.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_batches/i, '0061 must create import_batches.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_files/i, '0061 must create import_files.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_raw_rows/i, '0061 must create import_raw_rows.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_validation_issues/i, '0061 must create import_validation_issues.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_entity_candidates/i, '0061 must create import_entity_candidates.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_duplicate_candidates/i, '0061 must create import_duplicate_candidates.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_mapping_results/i, '0061 must create import_mapping_results.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_publish_queue/i, '0061 must create import_publish_queue.'],
    [/entity_type\s+in\s+\('doctor','hospital','pharmacy','clinic','laboratory','medical_center'\)/i, '0061 must constrain import entity types.'],
    [/template_key\s+in\s+\('doctor_profile_v3','pharmacy_v1','hospital_v1','generic_provider_v1'\)/i, '0061 must constrain supported template keys.'],
    [/index_policy\s+in\s+\('noindex','index_eligible','blocked'\)/i, '0061 must constrain index policies.'],
    [/alter\s+table\s+public\.import_batches\s+enable\s+row\s+level\s+security/i, '0061 must enable RLS on import_batches.'],
    [/alter\s+table\s+public\.import_publish_queue\s+enable\s+row\s+level\s+security/i, '0061 must enable RLS on import_publish_queue.'],
  ]) requirePattern(content, pattern, message);
}

function validateDoctorPracticeHardeningMigration() {
  const content = readMigration('doctorPracticeHardening');
  validateAdminOnlyMigration(content, '0062');
  for (const [pattern, message] of [
    [/REL-DOCTOR-A: doctor multi-practice relation hardening/i, '0062 must include REL-DOCTOR-A comment prefix.'],
    [/alter\s+table\s+public\.doctor_practice_locations/i, '0062 must alter doctor_practice_locations.'],
    [/practice_type\s+text\s+not\s+null\s+default\s+'unknown'/i, '0062 must add practice_type default unknown.'],
    [/relation_review_status\s+text\s+not\s+null\s+default\s+'draft'/i, '0062 must add relation_review_status default draft.'],
    [/public_relation_visible\s+boolean\s+not\s+null\s+default\s+false/i, '0062 must add public_relation_visible default false.'],
    [/source_url\s+text\s+null/i, '0062 must add source_url.'],
    [/source_name\s+text\s+null/i, '0062 must add source_name.'],
    [/source_type\s+text\s+null/i, '0062 must add source_type.'],
    [/last_checked_at\s+timestamptz\s+null/i, '0062 must add last_checked_at.'],
    [/confidence_score\s+numeric\(5,2\)\s+null/i, '0062 must add confidence_score numeric(5,2).'],
    [/reviewed_by_profile_id\s+uuid\s+null\s+references\s+public\.profiles\(id\)/i, '0062 must add reviewed_by_profile_id.'],
    [/reviewed_at\s+timestamptz\s+null/i, '0062 must add reviewed_at.'],
    [/doctor_practice_locations_practice_type_check/i, '0062 must constrain practice_type.'],
    [/hospital_staff[\s\S]*clinic_staff[\s\S]*private_practice[\s\S]*visiting_consultant[\s\S]*department_member[\s\S]*unknown/i, '0062 must include approved practice types.'],
    [/doctor_practice_locations_relation_review_status_check/i, '0062 must constrain relation_review_status.'],
    [/draft[\s\S]*pending_review[\s\S]*approved[\s\S]*rejected[\s\S]*hold[\s\S]*archived/i, '0062 must include relation review statuses.'],
    [/doctor_practice_locations_public_visible_gate_check/i, '0062 must gate public relation visibility.'],
    [/last_checked_at\s+is\s+not\s+null/i, '0062 public gate must require last_checked_at.'],
    [/source_url\s+is\s+not\s+null\s+or\s+source_name\s+is\s+not\s+null/i, '0062 public gate must require source.'],
    [/create\s+index\s+if\s+not\s+exists\s+doctor_practice_locations_practice_type_idx/i, '0062 must index practice_type.'],
    [/create\s+index\s+if\s+not\s+exists\s+doctor_practice_locations_relation_review_status_idx/i, '0062 must index relation_review_status.'],
    [/create\s+index\s+if\s+not\s+exists\s+doctor_practice_locations_public_relation_visible_idx/i, '0062 must index public_relation_visible.'],
  ]) requirePattern(content, pattern, message);
}

function validateFacilityDepartmentMigration() {
  const content = readMigration('facilityDepartment');
  validateAdminOnlyMigration(content, '0063');
  for (const [pattern, message] of [
    [/REL-DEPT-A: facility department foundation/i, '0063 must include REL-DEPT-A comment prefix.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.facility_departments/i, '0063 must create facility_departments.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.doctor_department_assignments/i, '0063 must create doctor_department_assignments.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.department_services/i, '0063 must create department_services.'],
    [/center_id\s+uuid\s+not\s+null\s+references\s+public\.centers\(id\)/i, '0063 departments must reference centers.'],
    [/center_location_id\s+uuid\s+null\s+references\s+public\.center_locations\(id\)/i, '0063 departments must optionally reference center_locations.'],
    [/facility_department_id\s+uuid\s+not\s+null\s+references\s+public\.facility_departments\(id\)/i, '0063 child tables must reference facility_departments.'],
    [/doctor_id\s+uuid\s+not\s+null\s+references\s+public\.doctors\(id\)/i, '0063 assignments must reference doctors.'],
    [/doctor_practice_location_id\s+uuid\s+null\s+references\s+public\.doctor_practice_locations\(id\)/i, '0063 assignments must optionally reference practice locations.'],
    [/department_kind\s+text\s+not\s+null\s+default\s+'clinical'/i, '0063 must add department_kind default clinical.'],
    [/department_review_status\s+text\s+not\s+null\s+default\s+'draft'/i, '0063 must add department review status.'],
    [/public_department_visible\s+boolean\s+not\s+null\s+default\s+false/i, '0063 must default public department visibility false.'],
    [/assignment_review_status\s+text\s+not\s+null\s+default\s+'draft'/i, '0063 must add assignment review status.'],
    [/public_assignment_visible\s+boolean\s+not\s+null\s+default\s+false/i, '0063 must default public assignment visibility false.'],
    [/service_review_status\s+text\s+not\s+null\s+default\s+'draft'/i, '0063 must add service review status.'],
    [/public_service_visible\s+boolean\s+not\s+null\s+default\s+false/i, '0063 must default public service visibility false.'],
    [/source_url\s+text\s+null/i, '0063 must add source_url fields.'],
    [/last_checked_at\s+timestamptz\s+null/i, '0063 must add last_checked_at fields.'],
    [/confidence_score\s+numeric\(5,2\)\s+null/i, '0063 must add confidence_score fields.'],
    [/public_department_visible\s+=\s+false[\s\S]*department_review_status\s+=\s+'approved'[\s\S]*last_checked_at\s+is\s+not\s+null/i, '0063 must gate department public visibility.'],
    [/public_assignment_visible\s+=\s+false[\s\S]*assignment_review_status\s+=\s+'approved'[\s\S]*last_checked_at\s+is\s+not\s+null/i, '0063 must gate assignment public visibility.'],
    [/public_service_visible\s+=\s+false[\s\S]*service_review_status\s+=\s+'approved'[\s\S]*last_checked_at\s+is\s+not\s+null/i, '0063 must gate service public visibility.'],
    [/alter\s+table\s+public\.facility_departments\s+enable\s+row\s+level\s+security/i, '0063 must enable RLS on facility_departments.'],
    [/alter\s+table\s+public\.doctor_department_assignments\s+enable\s+row\s+level\s+security/i, '0063 must enable RLS on doctor_department_assignments.'],
    [/alter\s+table\s+public\.department_services\s+enable\s+row\s+level\s+security/i, '0063 must enable RLS on department_services.'],
  ]) requirePattern(content, pattern, message);
}

function validateImportRelationCandidatesMigration() {
  const content = readMigration('importRelationCandidates');
  validateAdminOnlyMigration(content, '0064');
  for (const [pattern, message] of [
    [/ADM-REL-A: import relation candidates foundation/i, '0064 must include ADM-REL-A comment prefix.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.import_relation_candidates/i, '0064 must create import_relation_candidates.'],
    [/batch_id\s+uuid\s+not\s+null\s+references\s+public\.import_batches\(id\)\s+on\s+delete\s+cascade/i, '0064 must reference import_batches.'],
    [/raw_row_id\s+uuid\s+null\s+references\s+public\.import_raw_rows\(id\)\s+on\s+delete\s+cascade/i, '0064 must optionally reference import_raw_rows.'],
    [/source_entity_candidate_id\s+uuid\s+null\s+references\s+public\.import_entity_candidates\(id\)\s+on\s+delete\s+set\s+null/i, '0064 must reference import_entity_candidates.'],
    [/relation_type\s+text\s+not\s+null/i, '0064 must include relation_type.'],
    [/source_entity_type\s+text\s+not\s+null/i, '0064 must include source_entity_type.'],
    [/target_entity_type\s+text\s+not\s+null/i, '0064 must include target_entity_type.'],
    [/candidate_payload\s+jsonb\s+not\s+null\s+default\s+'\{\}'::jsonb/i, '0064 must include candidate_payload object.'],
    [/match_score\s+numeric\(5,2\)\s+not\s+null\s+default\s+0/i, '0064 must include match_score numeric.'],
    [/match_reason\s+text\s+not\s+null/i, '0064 must include match_reason.'],
    [/resolution_status\s+text\s+not\s+null\s+default\s+'pending'/i, '0064 must default pending resolution.'],
    [/doctor_practices_at_facility[\s\S]*doctor_member_of_department[\s\S]*facility_has_department[\s\S]*department_service[\s\S]*service_available_in_area/i, '0064 must include required relation families and entity types.'],
    [/resolution_status\s+in\s+\('pending','approved','rejected','needs_manual_review','ignored'\)/i, '0064 must constrain resolution_status.'],
    [/resolution_status\s+=\s+'pending'[\s\S]*resolved_at\s+is\s+null[\s\S]*resolved_by_profile_id\s+is\s+null/i, '0064 pending relation candidates must be unresolved.'],
    [/alter\s+table\s+public\.import_relation_candidates\s+enable\s+row\s+level\s+security/i, '0064 must enable RLS on import_relation_candidates.'],
    [/create\s+index\s+if\s+not\s+exists\s+idx_import_relation_candidates_batch_id/i, '0064 must index batch_id.'],
    [/create\s+index\s+if\s+not\s+exists\s+idx_import_relation_candidates_resolution_status/i, '0064 must index resolution_status.'],
  ]) requirePattern(content, pattern, message);
}

function validateAdminOnlyMigration(content, label) {
  for (const [pattern, message] of [
    [/\binsert\s+into\b/i, `${label} must not seed rows.`],
    [/\bdrop\s+table\b/i, `${label} must not drop tables.`],
    [/\bcreate\s+policy\b/i, `${label} must not add public or authenticated RLS policies.`],
    [/\bto\s+anon\b/i, `${label} must not grant anon access.`],
    [/\bto\s+authenticated\b/i, `${label} must not grant authenticated access.`],
    [/\bpayments?\b/i, `${label} must not include payment scope.`],
    [/\bbookings?\b/i, `${label} must not include booking scope.`],
    [/\bai\b/i, `${label} must not include AI scope.`],
  ]) forbidPattern(content, pattern, message);
}

function readMigration(key) {
  const migrationPath = migrationPaths[key];
  const migrationName = laterMigrationNames[key];
  requireCondition(typeof migrationPath === 'string' && existsSync(migrationPath), `${migrationName} is missing.`);
  return readFileSync(migrationPath, 'utf8');
}

function runTaxC1ValidatorWithoutLaterMigrations() {
  for (const [key, hiddenPath] of Object.entries(hiddenMigrationPaths)) {
    requireCondition(!existsSync(hiddenPath), `Hidden migration file already exists for ${key}.`);
  }

  for (const [key, hiddenPath] of Object.entries(hiddenMigrationPaths)) {
    renameSync(migrationPaths[key], hiddenPath);
  }

  try {
    execFileSync(process.execPath, [taxC1Validator], {
      cwd: repoRoot,
      stdio: 'inherit',
    });
  } finally {
    for (const [key, hiddenPath] of Object.entries(hiddenMigrationPaths).reverse()) {
      if (existsSync(hiddenPath)) {
        renameSync(hiddenPath, migrationPaths[key]);
      }
    }
  }
}

validateMigrationInventory();
validateTaxonomyRlsMigration();
validateGeoFullBCountryCodeMigration();
validateSpecialtyModelMigration();
validateAdminAuditEventsMigration();
validateAdminMediaLibraryMigration();
validateAdminCmsMigration();
validateImportStagingMigration();
validateDoctorPracticeHardeningMigration();
validateFacilityDepartmentMigration();
validateImportRelationCandidatesMigration();
runTaxC1ValidatorWithoutLaterMigrations();

console.log('ADM-IMPORT-A migration validation passed.');
