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
const taxC1Migration = '0054_healthcare_verticals_center_categories.sql';
const taxRlsMigration = '0055_taxonomy_public_rls.sql';
const geoFullBCountryCodeMigration = '0056_country_code_regional_expansion.sql';
const taxSpecialtyModelMigration = '0057_specialty_taxonomy_hierarchy.sql';
const adminAuditEventsMigration = '0058_admin_audit_events.sql';
const taxRlsMigrationPath = path.join(migrationsDir, taxRlsMigration);
const geoFullBCountryCodeMigrationPath = path.join(migrationsDir, geoFullBCountryCodeMigration);
const taxSpecialtyModelMigrationPath = path.join(migrationsDir, taxSpecialtyModelMigration);
const adminAuditEventsMigrationPath = path.join(migrationsDir, adminAuditEventsMigration);
const hiddenTaxRlsMigrationPath = path.join(
  migrationsDir,
  `.taxrlsa-${taxRlsMigration}.hidden`,
);
const hiddenGeoFullBCountryCodeMigrationPath = path.join(
  migrationsDir,
  `.geofullb-${geoFullBCountryCodeMigration}.hidden`,
);
const hiddenTaxSpecialtyModelMigrationPath = path.join(
  migrationsDir,
  `.taxspecialtymodela-${taxSpecialtyModelMigration}.hidden`,
);
const hiddenAdminAuditEventsMigrationPath = path.join(
  migrationsDir,
  `.admgova-${adminAuditEventsMigration}.hidden`,
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
  taxC1Migration,
  taxRlsMigration,
  geoFullBCountryCodeMigration,
  taxSpecialtyModelMigration,
  adminAuditEventsMigration,
];

function fail(message) {
  console.error(`ERROR: TAX-RLS-A: ${message}`);
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

    fail('Migration inventory must be exactly 0001 through 0058 for ADM-GOV-A.');
  }
}

function validateTaxRlsMigration() {
  requireCondition(existsSync(taxRlsMigrationPath), `${taxRlsMigration} is missing.`);

  const content = readFileSync(taxRlsMigrationPath, 'utf8');

  for (const [pattern, message] of [
    [/\binsert\s+into\b/i, '0055 must not seed rows or use INSERT INTO.'],
    [/\bdrop\b/i, '0055 must not contain DROP statements.'],
    [/\bfor\s+insert\b/i, '0055 must not add INSERT policies.'],
    [/\bfor\s+update\b/i, '0055 must not add UPDATE policies.'],
    [/\bfor\s+delete\b/i, '0055 must not add DELETE policies.'],
    [/\bpayments?\b/i, '0055 must not include payment scope.'],
    [/\binvoices?\b/i, '0055 must not include invoice scope.'],
    [/\bbilling\b/i, '0055 must not include billing scope.'],
    [/\bprovider\s+dashboard\b/i, '0055 must not include provider dashboard scope.'],
    [/\bai\b/i, '0055 must not include AI scope.'],
    [/\bstorage\s+bucket\b/i, '0055 must not include storage scope.'],
    [/\bupload\b/i, '0055 must not include upload scope.'],
  ]) {
    forbidPattern(content, pattern, message);
  }

  const requiredPatterns = [
    [/alter\s+table\s+public\.healthcare_verticals\s+enable\s+row\s+level\s+security/i, '0055 must enable RLS on healthcare_verticals.'],
    [/alter\s+table\s+public\.center_categories\s+enable\s+row\s+level\s+security/i, '0055 must enable RLS on center_categories.'],
    [/alter\s+table\s+public\.center_category_assignments\s+enable\s+row\s+level\s+security/i, '0055 must enable RLS on center_category_assignments.'],

    [/create\s+policy\s+healthcare_verticals_select_public_active\s+on\s+public\.healthcare_verticals/i, '0055 must create healthcare_verticals public select policy.'],
    [/create\s+policy\s+center_categories_select_public_active\s+on\s+public\.center_categories/i, '0055 must create center_categories public select policy.'],
    [/create\s+policy\s+center_category_assignments_select_public_approved\s+on\s+public\.center_category_assignments/i, '0055 must create center_category_assignments public select policy.'],

    [/for\s+select/i, '0055 policies must be SELECT policies.'],
    [/to\s+anon\s*,\s*authenticated/i, '0055 policies must be scoped to anon and authenticated public reads.'],
    [/deleted_at\s+is\s+null/i, '0055 policies must require deleted_at IS NULL.'],
    [/is_active\s*=\s*true/i, '0055 taxonomy policies must require is_active = true.'],
    [/public_directory_enabled\s*=\s*true/i, '0055 policies must respect public_directory_enabled.'],
    [/public_profile_enabled\s*=\s*true/i, '0055 policies must respect public_profile_enabled.'],
    [/is_public\s*=\s*true/i, '0055 assignment policy must require is_public = true.'],
    [/review_status\s*=\s*'approved'/i, '0055 assignment policy must require approved review_status.'],
    [/centers\.status\s*=\s*'active'/i, '0055 assignment policy must require active centers.'],
    [/centers\.is_active\s*=\s*true/i, '0055 assignment policy must require center is_active = true.'],
    [/from\s+public\.healthcare_verticals/i, '0055 must check healthcare_verticals in subqueries.'],
    [/from\s+public\.center_categories/i, '0055 must check center_categories in subqueries.'],
    [/from\s+public\.centers/i, '0055 must check centers in assignment policy.'],
  ];

  for (const [pattern, message] of requiredPatterns) {
    requirePattern(content, pattern, message);
  }
}

function validateGeoFullBCountryCodeMigration() {
  requireCondition(existsSync(geoFullBCountryCodeMigrationPath), `${geoFullBCountryCodeMigration} is missing.`);

  const content = readFileSync(geoFullBCountryCodeMigrationPath, 'utf8');

  for (const [pattern, message] of [
    [/\binsert\s+into\b/i, '0056 must not seed rows or use INSERT INTO.'],
    [/\bcreate\s+table\b/i, '0056 must not create tables.'],
    [/\bdrop\b/i, '0056 must not contain DROP statements.'],
    [/\bcreate\s+policy\b/i, '0056 must not create policies.'],
    [/\benable\s+row\s+level\s+security\b/i, '0056 must not alter RLS.'],
    [/\bpayments?\b/i, '0056 must not include payment scope.'],
    [/\binsurance\b/i, '0056 must not include insurance scope.'],
    [/\blicense\b/i, '0056 must not include license scope.'],
    [/\bmedia\b/i, '0056 must not include media scope.'],
    [/\bai\b/i, '0056 must not include AI scope.'],
  ]) {
    forbidPattern(content, pattern, message);
  }

  for (const code of ['ae', 'qa', 'bh', 'kw', 'sa', 'iq', 'sy', 'jo', 'lb', 'ps', 'eg', 'ye', 'ma', 'dz', 'tn', 'ly', 'sd', 'mr', 'ir']) {
    requirePattern(
      content,
      new RegExp(`alter\\s+type\\s+country_code\\s+add\\s+value\\s+if\\s+not\\s+exists\\s+'${code}'`, 'i'),
      `0056 must add country_code value '${code}'.`,
    );
  }
}

function validateTaxSpecialtyModelMigration() {
  requireCondition(existsSync(taxSpecialtyModelMigrationPath), `${taxSpecialtyModelMigration} is missing.`);

  const content = readFileSync(taxSpecialtyModelMigrationPath, 'utf8');

  for (const [pattern, message] of [
    [/\binsert\s+into\b/i, '0057 must not seed rows or use INSERT INTO.'],
    [/\bdrop\s+table\b/i, '0057 must not drop tables.'],
    [/\bpayments?\b/i, '0057 must not include payment scope.'],
    [/\binsurance\b/i, '0057 must not include insurance scope.'],
    [/\blicense_authorities\b/i, '0057 must not include license authority scope.'],
    [/\bmedia_assets\b/i, '0057 must not include media scope.'],
    [/\bsponsored_campaigns\b/i, '0057 must not include ads scope.'],
    [/\bai\b/i, '0057 must not include AI scope.'],
  ]) {
    forbidPattern(content, pattern, message);
  }

  const requiredPatterns = [
    [/alter\s+table\s+public\.specialties/i, '0057 must alter public.specialties.'],
    [/parent_specialty_id\s+uuid\s+null\s+references\s+public\.specialties\(id\)/i, '0057 must add parent_specialty_id.'],
    [/specialty_level\s+text\s+not\s+null\s+default\s+'specialty'/i, '0057 must add specialty_level.'],
    [/clinical_domain\s+text\s+null/i, '0057 must add clinical_domain.'],
    [/age_focus\s+text\s+not\s+null\s+default\s+'all'/i, '0057 must add age_focus.'],
    [/is_doctor_specialty\s+boolean\s+not\s+null\s+default\s+true/i, '0057 must add is_doctor_specialty.'],
    [/is_primary_care\s+boolean\s+not\s+null\s+default\s+false/i, '0057 must add is_primary_care.'],
    [/is_surgical\s+boolean\s+not\s+null\s+default\s+false/i, '0057 must add is_surgical.'],
    [/public_directory_enabled\s+boolean\s+not\s+null\s+default\s+true/i, '0057 must add public_directory_enabled.'],
    [/public_profile_enabled\s+boolean\s+not\s+null\s+default\s+true/i, '0057 must add public_profile_enabled.'],
    [/specialties_specialty_level_check/i, '0057 must constrain specialty_level.'],
    [/specialties_age_focus_check/i, '0057 must constrain age_focus.'],
    [/create\s+table\s+if\s+not\s+exists\s+public\.specialty_aliases/i, '0057 must create specialty_aliases.'],
    [/specialty_aliases_locale_check/i, '0057 must constrain alias locale.'],
    [/specialty_aliases_unique/i, '0057 must keep specialty aliases unique.'],
    [/alter\s+table\s+public\.specialty_aliases\s+enable\s+row\s+level\s+security/i, '0057 must enable RLS on specialty_aliases.'],
    [/create\s+policy\s+specialty_aliases_select_public_active\s+on\s+public\.specialty_aliases/i, '0057 must create public select policy for specialty_aliases.'],
    [/for\s+select/i, '0057 alias policy must be SELECT-only.'],
    [/to\s+anon\s*,\s*authenticated/i, '0057 alias policy must target anon and authenticated.'],
    [/public_directory_enabled\s*=\s*true/i, '0057 alias policy must respect public_directory_enabled.'],
    [/public_profile_enabled\s*=\s*true/i, '0057 alias policy must respect public_profile_enabled.'],
  ];

  for (const [pattern, message] of requiredPatterns) {
    requirePattern(content, pattern, message);
  }
}

function validateAdminAuditEventsMigration() {
  requireCondition(existsSync(adminAuditEventsMigrationPath), `${adminAuditEventsMigration} is missing.`);

  const content = readFileSync(adminAuditEventsMigrationPath, 'utf8');

  for (const [pattern, message] of [
    [/\binsert\s+into\b/i, '0058 must not seed rows or use INSERT INTO.'],
    [/\bdrop\s+table\b/i, '0058 must not drop tables.'],
    [/\bcreate\s+policy\b/i, '0058 must not add public or authenticated RLS policies.'],
    [/\bto\s+anon\b/i, '0058 must not grant anon access.'],
    [/\bto\s+authenticated\b/i, '0058 must not grant authenticated access.'],
    [/\bpayments?\b/i, '0058 must not include payment scope.'],
    [/\bbookings?\b/i, '0058 must not include booking scope.'],
    [/\bai\b/i, '0058 must not include AI scope.'],
  ]) {
    forbidPattern(content, pattern, message);
  }

  for (const [pattern, message] of [
    [/create\s+table\s+if\s+not\s+exists\s+public\.admin_audit_events/i, '0058 must create admin_audit_events.'],
    [/actor_profile_id\s+uuid\s+references\s+public\.profiles\(id\)/i, '0058 must reference profiles for actor_profile_id.'],
    [/permission_key\s+text/i, '0058 must include permission_key.'],
    [/old_values\s+jsonb\s+not\s+null\s+default\s+'\{\}'::jsonb/i, '0058 must include old_values JSONB default.'],
    [/new_values\s+jsonb\s+not\s+null\s+default\s+'\{\}'::jsonb/i, '0058 must include new_values JSONB default.'],
    [/alter\s+table\s+public\.admin_audit_events\s+enable\s+row\s+level\s+security/i, '0058 must enable RLS on admin_audit_events.'],
    [/idx_admin_audit_events_created_at_desc/i, '0058 must index created_at desc.'],
  ]) {
    requirePattern(content, pattern, message);
  }
}

function runTaxC1ValidatorWithoutLaterMigrations() {
  requireCondition(!existsSync(hiddenTaxRlsMigrationPath), 'Hidden TAX-RLS-A migration file already exists.');
  requireCondition(!existsSync(hiddenGeoFullBCountryCodeMigrationPath), 'Hidden GEO-FULL-B migration file already exists.');
  requireCondition(!existsSync(hiddenTaxSpecialtyModelMigrationPath), 'Hidden TAX-SPECIALTY-MODEL-A migration file already exists.');
  requireCondition(!existsSync(hiddenAdminAuditEventsMigrationPath), 'Hidden ADM-GOV-A migration file already exists.');

  renameSync(taxRlsMigrationPath, hiddenTaxRlsMigrationPath);
  renameSync(geoFullBCountryCodeMigrationPath, hiddenGeoFullBCountryCodeMigrationPath);
  renameSync(taxSpecialtyModelMigrationPath, hiddenTaxSpecialtyModelMigrationPath);
  renameSync(adminAuditEventsMigrationPath, hiddenAdminAuditEventsMigrationPath);

  try {
    execFileSync(process.execPath, [taxC1Validator], {
      cwd: repoRoot,
      stdio: 'inherit',
    });
  } finally {
    if (existsSync(hiddenAdminAuditEventsMigrationPath)) {
      renameSync(hiddenAdminAuditEventsMigrationPath, adminAuditEventsMigrationPath);
    }

    if (existsSync(hiddenTaxSpecialtyModelMigrationPath)) {
      renameSync(hiddenTaxSpecialtyModelMigrationPath, taxSpecialtyModelMigrationPath);
    }

    if (existsSync(hiddenGeoFullBCountryCodeMigrationPath)) {
      renameSync(hiddenGeoFullBCountryCodeMigrationPath, geoFullBCountryCodeMigrationPath);
    }

    if (existsSync(hiddenTaxRlsMigrationPath)) {
      renameSync(hiddenTaxRlsMigrationPath, taxRlsMigrationPath);
    }
  }
}

validateMigrationInventory();
validateTaxRlsMigration();
validateGeoFullBCountryCodeMigration();
validateTaxSpecialtyModelMigration();
validateAdminAuditEventsMigration();
runTaxC1ValidatorWithoutLaterMigrations();

console.log('ADM-GOV-A migration validation passed.');
