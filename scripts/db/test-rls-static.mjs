#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const migrationsDir = path.join(repoRoot, 'supabase', 'migrations');

const REQUIRED_FILES = [
  '0031_rls_auth_helpers.sql',
  '0032_rls_public_catalog_read_policies.sql',
  '0033_profiles_rls.sql',
  '0034_center_access_helpers.sql',
  '0035_center_claims_memberships_rls.sql',
  '0037_patient_appointment_access_helpers.sql',
  '0038_patient_contacts_appointments_rls.sql',
  '0039_review_media_access_helpers.sql',
  '0040_reviews_reports_media_private_rls.sql',
  '0041_monetization_access_helpers.sql',
  '0042_monetization_sponsored_rls.sql',
  '0043_legal_consent_audit_access_helpers.sql',
  '0044_legal_consent_audit_rls.sql',
  '0046_callback_request_foundation.sql',
  '0047_provider_license_verification_foundation.sql',
  '0048_media_public_visibility_hardening.sql',
  '0049_media_public_rls_hardening.sql',
  '0050_provider_onboarding_leads.sql',
];

const APPROVED_POLICY_FILES = new Set([
  '0032_rls_public_catalog_read_policies.sql',
  '0033_profiles_rls.sql',
  '0035_center_claims_memberships_rls.sql',
  '0038_patient_contacts_appointments_rls.sql',
  '0040_reviews_reports_media_private_rls.sql',
  '0042_monetization_sponsored_rls.sql',
  '0044_legal_consent_audit_rls.sql',
  '0046_callback_request_foundation.sql',
  '0047_provider_license_verification_foundation.sql',
  '0049_media_public_rls_hardening.sql',
  '0050_provider_onboarding_leads.sql',
]);

const HELPER_FILES = new Set([
  '0031_rls_auth_helpers.sql',
  '0034_center_access_helpers.sql',
  '0037_patient_appointment_access_helpers.sql',
  '0039_review_media_access_helpers.sql',
  '0041_monetization_access_helpers.sql',
  '0043_legal_consent_audit_access_helpers.sql',
]);

const REQUIRED_POLICY_NAMES = [
  'profiles_select_own',
  'profiles_select_platform_admin',
  'center_memberships_select_own',
  'center_memberships_select_platform_admin',
  'center_memberships_select_center_managers',
  'center_claims_select_own',
  'center_claims_select_platform_admin',
  'center_claims_select_center_managers',
  'patient_contacts_select_allowed',
  'appointments_select_allowed',
  'appointment_status_history_select_allowed',
  'appointment_cancellations_select_allowed',
  'reviews_select_private_allowed',
  'review_reports_select_allowed',
  'media_assets_select_private_allowed',
  'entity_media_select_private_allowed',
  'subscription_plans_select_public_active',
  'subscription_plans_select_platform_admin',
  'center_subscriptions_select_allowed',
  'sponsored_campaigns_select_allowed',
  'sponsored_placements_select_private_allowed',
  'sponsored_placements_select_public_active',
  'legal_documents_select_public_active',
  'legal_documents_select_platform_admin',
  'consent_logs_select_allowed',
  'audit_logs_select_platform_admin',
];

const SENSITIVE_TABLES_NO_ANON = new Set([
  'profiles',
  'center_memberships',
  'center_claims',
  'patient_contacts',
  'appointments',
  'appointment_status_history',
  'appointment_cancellations',
  'review_reports',
  'center_subscriptions',
  'consent_logs',
  'audit_logs',
  'callback_requests',
  'provider_onboarding_leads',
]);

const ALLOWED_ANON_POLICIES = new Set([
  'subscription_plans_select_public_active',
  'sponsored_placements_select_public_active',
  'legal_documents_select_public_active',
  'provider_license_records_public_select_anon',
]);

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function assert(cond, message) {
  if (!cond) fail(message);
}

assert(statSync(migrationsDir).isDirectory(), `Missing migrations directory: ${migrationsDir}`);

const migrationFiles = readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort();

for (const file of REQUIRED_FILES) {
  assert(migrationFiles.includes(file), `Required migration file missing: ${file}`);
}

const contentsByFile = new Map(
  migrationFiles.map((file) => [file, readFileSync(path.join(migrationsDir, file), 'utf8')]),
);

for (const [file, contents] of contentsByFile) {
  if (/\bcreate\s+policy\b/i.test(contents)) {
    assert(APPROVED_POLICY_FILES.has(file), `CREATE POLICY found in non-approved file: ${file}`);
  }

  if (/\benable\s+row\s+level\s+security\b/i.test(contents)) {
    assert(APPROVED_POLICY_FILES.has(file), `ENABLE ROW LEVEL SECURITY found in non-approved file: ${file}`);
  }

  assert(!/\bdrop\b/i.test(contents), `DROP found in migration file: ${file}`);
  assert(!/\binsert\s+into\b/i.test(contents), `INSERT INTO found in migration file: ${file}`);
  assert(!/RLS test placeholder/i.test(contents), `Placeholder text found in migration file: ${file}`);
  assert(!/no policies allowed in Phase 2\.0/i.test(contents), `Phase 2.0 placeholder text found in migration file: ${file}`);
}

for (const file of HELPER_FILES) {
  const contents = contentsByFile.get(file);
  assert(contents, `Missing helper file content: ${file}`);
  assert(!/\bcreate\s+policy\b/i.test(contents), `Helper file contains CREATE POLICY: ${file}`);
  assert(!/\benable\s+row\s+level\s+security\b/i.test(contents), `Helper file contains ENABLE ROW LEVEL SECURITY: ${file}`);
}

const policyStatements = [];
const policyRegex = /create\s+policy\s+"?([a-zA-Z0-9_]+)"?\s+on\s+(?:public\.)?"?([a-zA-Z0-9_]+)"?[\s\S]*?to\s+([^;]+);/gi;
for (const file of APPROVED_POLICY_FILES) {
  const content = contentsByFile.get(file) ?? '';
  assert(!/\bfor\s+(insert|update|delete)\b/i.test(content), `Non-SELECT policy action found in approved RLS file: ${file}`);

  let match;
  while ((match = policyRegex.exec(content)) !== null) {
    const [, policyName, tableName, toClauseRaw] = match;
    policyStatements.push({ file, policyName, tableName, toClauseRaw: toClauseRaw.toLowerCase() });
  }
}

for (const name of REQUIRED_POLICY_NAMES) {
  const exists = policyStatements.some((p) => p.policyName === name);
  assert(exists, `Missing required policy name: ${name}`);
}

const publicCatalogPolicyIn0032 = policyStatements.some(
  (p) => p.file === '0032_rls_public_catalog_read_policies.sql' && p.toClauseRaw.includes('anon'),
);
assert(publicCatalogPolicyIn0032, 'Expected public catalog TO anon policy not found in 0032 file');

for (const p of policyStatements) {
  if (p.toClauseRaw.includes('anon')) {
    const isAllowedByName = ALLOWED_ANON_POLICIES.has(p.policyName);
    const isAllowedPublicCatalog = p.file === '0032_rls_public_catalog_read_policies.sql';
    assert(
      isAllowedByName || isAllowedPublicCatalog,
      `Unexpected TO anon usage in policy ${p.policyName} (${p.file})`,
    );

    assert(
      !SENSITIVE_TABLES_NO_ANON.has(p.tableName),
      `Sensitive table policy grants TO anon: ${p.tableName} via ${p.policyName} (${p.file})`,
    );
  }
}



const providerOnboardingLeadsContent = contentsByFile.get('0050_provider_onboarding_leads.sql') ?? '';
assert(
  /alter\s+table\s+public\.provider_onboarding_leads\s+enable\s+row\s+level\s+security/i.test(providerOnboardingLeadsContent),
  '0050 must enable RLS on public.provider_onboarding_leads',
);
assert(
  !/create\s+policy[\s\S]*?on\s+public\.provider_onboarding_leads/i.test(providerOnboardingLeadsContent),
  '0050 must not create policies on public.provider_onboarding_leads',
);
assert(
  !/to\s+anon[\s\S]*?on\s+public\.provider_onboarding_leads/i.test(providerOnboardingLeadsContent)
    && !/on\s+public\.provider_onboarding_leads[\s\S]*?to\s+anon/i.test(providerOnboardingLeadsContent),
  'provider_onboarding_leads must not grant anon access',
);
assert(
  !/to\s+authenticated[\s\S]*?on\s+public\.provider_onboarding_leads/i.test(providerOnboardingLeadsContent)
    && !/on\s+public\.provider_onboarding_leads[\s\S]*?to\s+authenticated/i.test(providerOnboardingLeadsContent),
  'provider_onboarding_leads must not grant authenticated broad access',
);
assert(
  !/on\s+public\.provider_onboarding_leads[\s\S]*?for\s+(insert|update|delete)/i.test(providerOnboardingLeadsContent)
    && !/for\s+(insert|update|delete)[\s\S]*?on\s+public\.provider_onboarding_leads/i.test(providerOnboardingLeadsContent),
  'provider_onboarding_leads must not define public write policies',
);


const mediaPublicRlsHardeningContent = contentsByFile.get('0049_media_public_rls_hardening.sql') ?? '';
assert(
  /alter\s+policy\s+entity_media_public_select\s+on\s+public\.entity_media/i.test(mediaPublicRlsHardeningContent),
  '0049 must alter the existing entity_media_public_select policy on public.entity_media',
);
assert(
  /to\s+anon\s*,\s*authenticated/i.test(mediaPublicRlsHardeningContent),
  '0049 entity_media public policy must remain scoped to anon and authenticated public reads',
);
assert(
  /deleted_at\s+is\s+null/i.test(mediaPublicRlsHardeningContent),
  '0049 entity_media policy must require entity_media.deleted_at IS NULL',
);
assert(
  /public_media_visible\s*=\s*true/i.test(mediaPublicRlsHardeningContent),
  '0049 entity_media policy must require public_media_visible = true',
);
assert(
  /media_review_status\s*=\s*'approved'/i.test(mediaPublicRlsHardeningContent),
  "0049 entity_media policy must require media_review_status = 'approved'",
);
assert(
  /entity_type\s+in\s*\(\s*'center'\s*,\s*'doctor'\s*\)/i.test(mediaPublicRlsHardeningContent),
  '0049 entity_media policy must only allow center and doctor entity types',
);
assert(
  /usage_kind\s+in\s*\([\s\S]*'logo'[\s\S]*'cover'[\s\S]*'profile'[\s\S]*'gallery'[\s\S]*'thumbnail'[\s\S]*\)/i.test(mediaPublicRlsHardeningContent),
  '0049 entity_media policy must allow only logo, cover, profile, gallery, and thumbnail usage kinds',
);
for (const forbiddenUsageKind of ['certificate', 'document', 'before_after']) {
  assert(
    !new RegExp(`usage_kind\\s+in\\s*\\([\\s\\S]*'${forbiddenUsageKind}'`, 'i').test(mediaPublicRlsHardeningContent),
    `0049 entity_media policy must not publicly allow usage kind: ${forbiddenUsageKind}`,
  );
}
assert(
  /from\s+public\.media_assets/i.test(mediaPublicRlsHardeningContent),
  '0049 entity_media policy must check linked public.media_assets rows',
);
assert(
  /media_assets\.id\s*=\s*entity_media\.media_asset_id/i.test(mediaPublicRlsHardeningContent),
  '0049 entity_media policy must link media_assets.id to entity_media.media_asset_id',
);
assert(
  /media_assets\.deleted_at\s+is\s+null/i.test(mediaPublicRlsHardeningContent),
  '0049 entity_media policy must require linked media_assets.deleted_at IS NULL',
);
assert(
  /media_assets\.status\s*=\s*'approved'/i.test(mediaPublicRlsHardeningContent),
  "0049 entity_media policy must require linked media_assets.status = 'approved'",
);
assert(
  /media_assets\.mime_type\s+in\s*\([\s\S]*'image\/jpeg'[\s\S]*'image\/png'[\s\S]*'image\/webp'[\s\S]*'image\/avif'[\s\S]*\)/i.test(mediaPublicRlsHardeningContent),
  '0049 entity_media policy must require the approved public image MIME allowlist',
);
assert(
  !/on\s+public\.(entity_media|media_assets)[\s\S]*?for\s+(insert|update|delete)/i.test(mediaPublicRlsHardeningContent),
  '0049 must not add INSERT/UPDATE/DELETE policies for entity_media or media_assets',
);
assert(
  !/to\s+anon[\s\S]*?for\s+(insert|update|delete)/i.test(mediaPublicRlsHardeningContent)
    && !/for\s+(insert|update|delete)[\s\S]*?to\s+anon/i.test(mediaPublicRlsHardeningContent),
  '0049 must not grant anon INSERT/UPDATE/DELETE',
);
assert(
  !/create\s+policy[\s\S]*?on\s+public\.entity_media[\s\S]*?to\s+anon[\s\S]*?using\s*\(\s*deleted_at\s+is\s+null\s*\)/i.test(mediaPublicRlsHardeningContent),
  '0049 must not introduce a broad entity_media public SELECT policy',
);
assert(
  !/create\s+policy[\s\S]*?on\s+public\.media_assets[\s\S]*?for\s+(insert|update|delete)/i.test(mediaPublicRlsHardeningContent),
  '0049 must not add media_assets write policies',
);

const callbackRequestFoundationContent = contentsByFile.get('0046_callback_request_foundation.sql') ?? '';
assert(
  /alter\s+table\s+public\.callback_requests\s+enable\s+row\s+level\s+security/i.test(callbackRequestFoundationContent),
  'callback_requests must have RLS enabled in 0046_callback_request_foundation.sql',
);
assert(
  !/create\s+policy[\s\S]*?on\s+public\.callback_requests[\s\S]*?to\s+anon[\s\S]*?for\s+select/i.test(callbackRequestFoundationContent)
    && !/create\s+policy[\s\S]*?on\s+public\.callback_requests[\s\S]*?for\s+select[\s\S]*?to\s+anon/i.test(callbackRequestFoundationContent),
  'callback_requests must not grant anon SELECT',
);
assert(
  !/create\s+policy[\s\S]*?on\s+public\.callback_requests[\s\S]*?to\s+anon[\s\S]*?for\s+insert/i.test(callbackRequestFoundationContent)
    && !/create\s+policy[\s\S]*?on\s+public\.callback_requests[\s\S]*?for\s+insert[\s\S]*?to\s+anon/i.test(callbackRequestFoundationContent),
  'callback_requests must not grant anon INSERT',
);
assert(
  !/create\s+policy[\s\S]*?on\s+public\.callback_requests[\s\S]*?to\s+anon[\s\S]*?for\s+update/i.test(callbackRequestFoundationContent)
    && !/create\s+policy[\s\S]*?on\s+public\.callback_requests[\s\S]*?for\s+update[\s\S]*?to\s+anon/i.test(callbackRequestFoundationContent),
  'callback_requests must not grant anon UPDATE',
);
assert(
  !/create\s+policy[\s\S]*?on\s+public\.callback_requests[\s\S]*?to\s+anon[\s\S]*?for\s+delete/i.test(callbackRequestFoundationContent)
    && !/create\s+policy[\s\S]*?on\s+public\.callback_requests[\s\S]*?for\s+delete[\s\S]*?to\s+anon/i.test(callbackRequestFoundationContent),
  'callback_requests must not grant anon DELETE',
);
assert(
  !/create\s+policy[\s\S]*?on\s+public\.callback_requests[\s\S]*?for\s+select/i.test(callbackRequestFoundationContent),
  'callback_requests must not have any public SELECT policy in this phase',
);


const providerLicenseRecordsContent = contentsByFile.get('0047_provider_license_verification_foundation.sql') ?? '';
assert(
  /alter\s+table\s+public\.provider_license_records\s+enable\s+row\s+level\s+security/i.test(providerLicenseRecordsContent),
  'provider_license_records must have RLS enabled in 0047_provider_license_verification_foundation.sql',
);

for (const policyName of [
  'provider_license_records_public_select_anon',
  'provider_license_records_public_select_authenticated',
]) {
  assert(
    new RegExp(`create\\s+policy\\s+${policyName}\\s+on\\s+public\\.provider_license_records[\\s\\S]*?for\\s+select`, 'i').test(providerLicenseRecordsContent),
    `provider_license_records missing SELECT policy: ${policyName}`,
  );
  assert(
    new RegExp(`create\\s+policy\\s+${policyName}[\\s\\S]*?public_license_visible\\s*=\\s*true`, 'i').test(providerLicenseRecordsContent),
    `${policyName} must require public_license_visible = true`,
  );
  assert(
    new RegExp(`create\\s+policy\\s+${policyName}[\\s\\S]*?license_review_status\\s*=\\s*'approved'`, 'i').test(providerLicenseRecordsContent),
    `${policyName} must require license_review_status = 'approved'`,
  );
  assert(
    new RegExp(`create\\s+policy\\s+${policyName}[\\s\\S]*?license_number\\s+is\\s+not\\s+null[\\s\\S]*?btrim\\s*\\(\\s*license_number\\s*\\)\\s*<>\\s*''`, 'i').test(providerLicenseRecordsContent),
    `${policyName} must require a non-empty license_number`,
  );
  assert(
    new RegExp(`create\\s+policy\\s+${policyName}[\\s\\S]*?from\\s+public\\.centers\\s+as\\s+c[\\s\\S]*?c\\.deleted_at\\s+is\\s+null[\\s\\S]*?c\\.is_active\\s*=\\s*true[\\s\\S]*?c\\.status\\s*=\\s*'active'`, 'i').test(providerLicenseRecordsContent),
    `${policyName} must require linked centers to be public active`,
  );
  assert(
    new RegExp(`create\\s+policy\\s+${policyName}[\\s\\S]*?from\\s+public\\.doctors\\s+as\\s+d[\\s\\S]*?d\\.deleted_at\\s+is\\s+null[\\s\\S]*?d\\.is_active\\s*=\\s*true[\\s\\S]*?d\\.status\\s*=\\s*'active'`, 'i').test(providerLicenseRecordsContent),
    `${policyName} must require linked doctors to be public active`,
  );
}

assert(
  !/create\s+policy[\s\S]*?on\s+public\.provider_license_records[\s\S]*?for\s+(insert|update|delete)/i.test(providerLicenseRecordsContent),
  'provider_license_records must not have INSERT/UPDATE/DELETE policies',
);
assert(
  !/create\s+policy[\s\S]*?on\s+public\.provider_license_records[\s\S]*?to\s+anon[\s\S]*?for\s+(insert|update|delete)/i.test(providerLicenseRecordsContent),
  'provider_license_records must not grant anon write policies',
);
assert(
  !/create\s+policy[\s\S]*?on\s+public\.provider_license_records[\s\S]*?to\s+authenticated[\s\S]*?for\s+(insert|update|delete)/i.test(providerLicenseRecordsContent),
  'provider_license_records must not grant authenticated write policies',
);
assert(
  !/create\s+policy(?!\s+provider_license_records_public_select_anon|\s+provider_license_records_public_select_authenticated)[\s\S]*?on\s+public\.provider_license_records[\s\S]*?for\s+select/i.test(providerLicenseRecordsContent),
  'provider_license_records must not include broad or unexpected SELECT policies',
);

console.log('✅ RLS static harness checks passed for required Phase 3 policy/helper migration rules.');
