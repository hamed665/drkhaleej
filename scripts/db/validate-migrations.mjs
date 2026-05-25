#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';

const PHASE = '2.5C';

const required = [
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
  '0012_doctor_services.sql'
];

const dir = 'supabase/migrations';

const requiredEnumChecks = [
  { file: '0002_enums.sql', regex: /create\s+type\s+center_type\s+as\s+enum/i, message: `Phase ${PHASE} requires create type center_type as enum in 0002_enums.sql.` },
  { file: '0009_center_ownership_claims.sql', regex: /create\s+type\s+center_member_role\s+as\s+enum/i, message: `Phase ${PHASE} requires create type center_member_role as enum in 0009_center_ownership_claims.sql.` },
  { file: '0009_center_ownership_claims.sql', regex: /create\s+type\s+center_membership_status\s+as\s+enum/i, message: `Phase ${PHASE} requires create type center_membership_status as enum in 0009_center_ownership_claims.sql.` },
  { file: '0010_doctors.sql', regex: /create\s+type\s+doctor_title\s+as\s+enum/i, message: `Phase ${PHASE} requires create type doctor_title as enum in 0010_doctors.sql.` },
  { file: '0010_doctors.sql', regex: /create\s+type\s+doctor_gender\s+as\s+enum/i, message: `Phase ${PHASE} requires create type doctor_gender as enum in 0010_doctors.sql.` }
];

const forbiddenPatterns = [
  { regex: /\bpostgis\b/i, message: `postgis is deferred and forbidden in Phase ${PHASE}.` },
  { regex: /\bgeometry\b/i, message: `geometry is forbidden in Phase ${PHASE}.` },
  { regex: /\bgeography\b/i, message: `geography is forbidden in Phase ${PHASE}.` },
  { regex: /\bcreate\s+policy\b/i, message: `CREATE POLICY is forbidden in Phase ${PHASE}.` },
  { regex: /\benable\s+row\s+level\s+security\b/i, message: `ENABLE ROW LEVEL SECURITY is forbidden in Phase ${PHASE}.` },
  { regex: /\binsert\s+into\b/i, message: `INSERT INTO is forbidden in Phase ${PHASE}.` },
  { regex: /\bdrop\b/i, message: `DROP statements are forbidden in Phase ${PHASE}.` }
];

const forbiddenTables = [
  'center_owners',
  'provider_locations',
  'center_location_mappings',
  'providers',
  'doctor_centers',
  'doctor_memberships',
  'doctor_schedules',
  'appointments',
  'appointment_slots',
  'insurance',
  'pricing',
  'reviews',
  'ratings',
  'legal_documents',
  'consent_logs',
  'behavior_events',
  'sponsored_slots',
  'audit_logs'
];

const allowedGeoTables = ['geo_countries', 'geo_regions', 'geo_cities', 'geo_areas'];
const allowedTaxonomyTables = ['taxonomy_groups', 'service_categories', 'services', 'specialties'];
const allowedOwnershipTables = ['center_claims', 'center_memberships'];
const allowedDoctorTables = ['doctors', 'doctor_services'];

let foundDoctorsTable = false;
let foundDoctorTitleUsage = false;
let foundDoctorGenderUsage = false;
let foundDoctorSpecialtiesReference = false;
let foundDoctorVerificationStatusUsage = false;
let foundDoctorProviderStatusUsage = false;
let foundDoctorAppLocaleUsage = false;
let foundDoctorCountryCodeUsage = false;
let foundDoctorYearsExperienceCheck = false;
let foundDoctorsUpdatedAtTrigger = false;

let foundDoctorPracticeLocationsTable = false;
let foundDoctorPracticeLocationsDoctorRef = false;
let foundDoctorPracticeLocationsCenterRef = false;
let foundDoctorPracticeLocationsCenterLocationRef = false;
let foundDoctorPracticeLocationsSpecialtyRef = false;
let foundDoctorPracticeLocationsUpdatedAtTrigger = false;

let foundDoctorServicesTable = false;
let foundDoctorServicesDoctorRef = false;
let foundDoctorServicesPracticeLocationRef = false;
let foundDoctorServicesCenterRef = false;
let foundDoctorServicesCenterLocationRef = false;
let foundDoctorServicesCenterServiceRef = false;
let foundDoctorServicesTaxonomyRef = false;
let foundDoctorServicesServiceCategoryRef = false;
let foundDoctorServicesServiceRef = false;
let foundDoctorServicesSpecialtyRef = false;
let foundDoctorServicesScopeCheck = false;
let foundDoctorServicesUpdatedAtTrigger = false;

try {
  if (!statSync(dir).isDirectory()) throw new Error(`${dir} is not a directory`);
} catch (error) {
  console.error(`ERROR: Missing required directory: ${dir}`);
  console.error(`Details: ${error.message}`);
  process.exit(1);
}

const files = readdirSync(dir).filter((name) => name.endsWith('.sql')).sort();

if (files.join('|') !== required.join('|')) {
  console.error(`ERROR: Phase ${PHASE} requires exactly these migration files:`);
  required.forEach((name) => console.error(`- ${name}`));

  const missing = required.filter((name) => !files.includes(name));
  const unexpected = files.filter((name) => !required.includes(name));

  if (missing.length) console.error(`Missing required files: ${missing.join(', ')}`);
  if (unexpected.length) console.error(`Unexpected SQL migration files: ${unexpected.join(', ')}`);
  if (!files.length) console.error('No SQL migration files were found.');

  process.exit(1);
}

let foundProfilesTable = false;
let foundSetUpdatedAtFunction = false;
let foundProfilesUpdatedAtTrigger = false;
let foundCentersTable = false;
let foundCentersUpdatedAtTrigger = false;
let centersCenterTypeUsesProviderStatus = false;
let foundCenterLocationsTable = false;
let foundCenterLocationsUpdatedAtTrigger = false;
let foundCenterReference = false;
let foundCountryReference = false;
let foundRegionReference = false;
let foundCityReference = false;
let foundAreaReference = false;
let foundLatitudeNumeric = false;
let foundLongitudeNumeric = false;
let foundLatitudeRangeCheck = false;
let foundLongitudeRangeCheck = false;
let foundCenterServicesTable = false;
let foundCenterServicesCenterRef = false;
let foundCenterServicesLocationRef = false;
let foundCenterServicesTaxonomyRef = false;
let foundCenterServicesServiceCategoryRef = false;
let foundCenterServicesServiceRef = false;
let foundCenterServicesSpecialtyRef = false;
let foundCenterServicesScopeCheck = false;
let foundCenterServicesUpdatedAtTrigger = false;
let foundCenterClaimsTable = false;
let foundCenterMembershipsTable = false;
let foundCenterClaimsCenterRef = false;
let foundCenterClaimsClaimantProfileRef = false;
let foundCenterClaimsReviewedByProfileRef = false;
let foundCenterClaimsClaimStatusEnum = false;
let foundCenterMembershipsCenterRef = false;
let foundCenterMembershipsProfileRef = false;
let foundCenterMembershipsRoleEnum = false;
let foundCenterMembershipsStatusEnum = false;
let foundCenterClaimsUpdatedAtTrigger = false;
let foundCenterMembershipsUpdatedAtTrigger = false;

const createdGeoTables = new Set();
const createdTaxonomyTables = new Set();
const createdOwnershipTables = new Set();
const createdDoctorTables = new Set();

for (const file of files) {
  const content = readFileSync(`${dir}/${file}`, 'utf8');

  for (const rule of forbiddenPatterns) {
    if (rule.regex.test(content)) {
      console.error(`ERROR: ${file} violates Phase ${PHASE} rule: ${rule.message}`);
      process.exit(1);
    }
  }

  for (const check of requiredEnumChecks) {
    if (file === check.file && !check.regex.test(content)) {
      console.error(`ERROR: ${check.message}`);
      process.exit(1);
    }
  }

  for (const table of forbiddenTables) {
    if (new RegExp(`\\b${table}\\b`, 'i').test(content)) {
      console.error(`ERROR: ${file} references forbidden table for Phase ${PHASE}: ${table}`);
      process.exit(1);
    }
  }

  for (const table of allowedGeoTables) if (new RegExp(`\\bcreate\\s+table\\s+(if\\s+not\\s+exists\\s+)?public\\.${table}\\b`, 'i').test(content)) createdGeoTables.add(table);
  for (const table of allowedTaxonomyTables) if (new RegExp(`\\bcreate\\s+table\\s+(if\\s+not\\s+exists\\s+)?public\\.${table}\\b`, 'i').test(content)) createdTaxonomyTables.add(table);
  for (const table of allowedOwnershipTables) if (new RegExp(`\\bcreate\\s+table\\s+(if\\s+not\\s+exists\\s+)?public\\.${table}\\b`, 'i').test(content)) createdOwnershipTables.add(table);
  for (const table of allowedDoctorTables) if (new RegExp(`\\bcreate\\s+table\\s+(if\\s+not\\s+exists\\s+)?public\\.${table}\\b`, 'i').test(content)) createdDoctorTables.add(table);

  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.profiles\b/i.test(content)) foundProfilesTable = true;
  if (/\bcreate\s+or\s+replace\s+function\s+public\.set_updated_at\s*\(\s*\)\b/i.test(content)) foundSetUpdatedAtFunction = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.profiles\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundProfilesUpdatedAtTrigger = true;
  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.centers\b/i.test(content)) foundCentersTable = true;
  if (/\bcenter_type\s+provider_status\b/i.test(content)) centersCenterTypeUsesProviderStatus = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.centers\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundCentersUpdatedAtTrigger = true;

  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.center_locations\b/i.test(content)) foundCenterLocationsTable = true;
  if (/\bcenter_id\s+uuid\s+not\s+null\s+references\s+public\.centers\s*\(\s*id\s*\)/i.test(content)) foundCenterReference = true;
  if (/\bcountry_id\s+uuid\s+not\s+null\s+references\s+public\.geo_countries\s*\(\s*id\s*\)/i.test(content)) foundCountryReference = true;
  if (/\bregion_id\s+uuid\s+not\s+null\s+references\s+public\.geo_regions\s*\(\s*id\s*\)/i.test(content)) foundRegionReference = true;
  if (/\bcity_id\s+uuid\s+not\s+null\s+references\s+public\.geo_cities\s*\(\s*id\s*\)/i.test(content)) foundCityReference = true;
  if (/\barea_id\s+uuid\s+null\s+references\s+public\.geo_areas\s*\(\s*id\s*\)/i.test(content)) foundAreaReference = true;
  if (/\blatitude\s+numeric\s*\(\s*9\s*,\s*6\s*\)/i.test(content)) foundLatitudeNumeric = true;
  if (/\blongitude\s+numeric\s*\(\s*9\s*,\s*6\s*\)/i.test(content)) foundLongitudeNumeric = true;
  if (/latitude\s+is\s+null\s+or\s*\(\s*latitude\s*>=\s*-90\s+and\s+latitude\s*<=\s*90\s*\)/i.test(content) || /\bconstraint\s+center_locations_latitude_range_check\b/i.test(content)) foundLatitudeRangeCheck = true;
  if (/longitude\s+is\s+null\s+or\s*\(\s*longitude\s*>=\s*-180\s+and\s+longitude\s*<=\s*180\s*\)/i.test(content) || /\bconstraint\s+center_locations_longitude_range_check\b/i.test(content)) foundLongitudeRangeCheck = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.center_locations\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundCenterLocationsUpdatedAtTrigger = true;

  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.center_services\b/i.test(content)) foundCenterServicesTable = true;
  if (/\bcenter_id\s+uuid\s+not\s+null\s+references\s+public\.centers\s*\(\s*id\s*\)/i.test(content)) foundCenterServicesCenterRef = true;
  if (/\bcenter_location_id\s+uuid\s+null\s+references\s+public\.center_locations\s*\(\s*id\s*\)/i.test(content)) foundCenterServicesLocationRef = true;
  if (/\btaxonomy_group_id\s+uuid\s+null\s+references\s+public\.taxonomy_groups\s*\(\s*id\s*\)/i.test(content)) foundCenterServicesTaxonomyRef = true;
  if (/\bservice_category_id\s+uuid\s+null\s+references\s+public\.service_categories\s*\(\s*id\s*\)/i.test(content)) foundCenterServicesServiceCategoryRef = true;
  if (/\bservice_id\s+uuid\s+null\s+references\s+public\.services\s*\(\s*id\s*\)/i.test(content)) foundCenterServicesServiceRef = true;
  if (/\bspecialty_id\s+uuid\s+null\s+references\s+public\.specialties\s*\(\s*id\s*\)/i.test(content)) foundCenterServicesSpecialtyRef = true;
  if (/\bconstraint\s+center_services_service_scope_check\s+check\s*\([\s\S]*service_id\s+is\s+not\s+null[\s\S]*specialty_id\s+is\s+not\s+null[\s\S]*service_category_id\s+is\s+not\s+null[\s\S]*\)/i.test(content)) foundCenterServicesScopeCheck = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.center_services\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundCenterServicesUpdatedAtTrigger = true;

  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.center_claims\b/i.test(content)) foundCenterClaimsTable = true;
  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.center_memberships\b/i.test(content)) foundCenterMembershipsTable = true;
  if (/\bclaimant_profile_id\s+uuid\s+not\s+null\s+references\s+public\.profiles\s*\(\s*id\s*\)/i.test(content)) foundCenterClaimsClaimantProfileRef = true;
  if (/\breviewed_by_profile_id\s+uuid\s+null\s+references\s+public\.profiles\s*\(\s*id\s*\)/i.test(content)) foundCenterClaimsReviewedByProfileRef = true;
  if (/\bclaim_status\s+claim_status\s+not\s+null\s+default\s+'started'/i.test(content)) foundCenterClaimsClaimStatusEnum = true;
  if (/\bprofile_id\s+uuid\s+not\s+null\s+references\s+public\.profiles\s*\(\s*id\s*\)/i.test(content)) foundCenterMembershipsProfileRef = true;
  if (/\brole\s+center_member_role\s+not\s+null\s+default\s+'staff'/i.test(content)) foundCenterMembershipsRoleEnum = true;
  if (/\bstatus\s+center_membership_status\s+not\s+null\s+default\s+'pending'/i.test(content)) foundCenterMembershipsStatusEnum = true;
  if (/\bcenter_id\s+uuid\s+not\s+null\s+references\s+public\.centers\s*\(\s*id\s*\)/i.test(content)) { foundCenterClaimsCenterRef = true; foundCenterMembershipsCenterRef = true; }
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.center_claims\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundCenterClaimsUpdatedAtTrigger = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.center_memberships\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundCenterMembershipsUpdatedAtTrigger = true;

  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.doctors\b/i.test(content)) foundDoctorsTable = true;
  if (/\btitle\s+doctor_title\s+not\s+null\s+default\s+'dr'/i.test(content)) foundDoctorTitleUsage = true;
  if (/\bgender\s+doctor_gender\s+not\s+null\s+default\s+'unspecified'/i.test(content)) foundDoctorGenderUsage = true;
  if (/\bprimary_specialty_id\s+uuid\s+null\s+references\s+public\.specialties\s*\(\s*id\s*\)/i.test(content)) foundDoctorSpecialtiesReference = true;
  if (/\bverification_status\s+verification_status\s+not\s+null\s+default\s+'unverified'/i.test(content)) foundDoctorVerificationStatusUsage = true;
  if (/\bstatus\s+provider_status\s+not\s+null\s+default\s+'draft'/i.test(content)) foundDoctorProviderStatusUsage = true;
  if (/\bdefault_locale\s+app_locale\s+not\s+null\s+default\s+'en'/i.test(content)) foundDoctorAppLocaleUsage = true;
  if (/\bdefault_country\s+country_code\s+not\s+null\s+default\s+'om'/i.test(content)) foundDoctorCountryCodeUsage = true;
  if (/\byears_experience\s+is\s+null\s+or\s*\(\s*years_experience\s*>=\s*0\s+and\s+years_experience\s*<=\s*80\s*\)/i.test(content) || /\bconstraint\s+doctors_years_experience_check\b/i.test(content)) foundDoctorYearsExperienceCheck = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.doctors\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundDoctorsUpdatedAtTrigger = true;


  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.doctor_services\b/i.test(content)) foundDoctorServicesTable = true;
  if (/\bdoctor_id\s+uuid\s+not\s+null\s+references\s+public\.doctors\s*\(\s*id\s*\)/i.test(content)) foundDoctorServicesDoctorRef = true;
  if (/\bdoctor_practice_location_id\s+uuid\s+null\s+references\s+public\.doctor_practice_locations\s*\(\s*id\s*\)/i.test(content)) foundDoctorServicesPracticeLocationRef = true;
  if (/\bcenter_id\s+uuid\s+null\s+references\s+public\.centers\s*\(\s*id\s*\)/i.test(content)) foundDoctorServicesCenterRef = true;
  if (/\bcenter_location_id\s+uuid\s+null\s+references\s+public\.center_locations\s*\(\s*id\s*\)/i.test(content)) foundDoctorServicesCenterLocationRef = true;
  if (/\bcenter_service_id\s+uuid\s+null\s+references\s+public\.center_services\s*\(\s*id\s*\)/i.test(content)) foundDoctorServicesCenterServiceRef = true;
  if (/\btaxonomy_group_id\s+uuid\s+null\s+references\s+public\.taxonomy_groups\s*\(\s*id\s*\)/i.test(content)) foundDoctorServicesTaxonomyRef = true;
  if (/\bservice_category_id\s+uuid\s+null\s+references\s+public\.service_categories\s*\(\s*id\s*\)/i.test(content)) foundDoctorServicesServiceCategoryRef = true;
  if (/\bservice_id\s+uuid\s+null\s+references\s+public\.services\s*\(\s*id\s*\)/i.test(content)) foundDoctorServicesServiceRef = true;
  if (/\bspecialty_id\s+uuid\s+null\s+references\s+public\.specialties\s*\(\s*id\s*\)/i.test(content)) foundDoctorServicesSpecialtyRef = true;
  if (/\bconstraint\s+doctor_services_service_scope_check\s+check\s*\([\s\S]*service_id\s+is\s+not\s+null[\s\S]*specialty_id\s+is\s+not\s+null[\s\S]*service_category_id\s+is\s+not\s+null[\s\S]*\)/i.test(content)) foundDoctorServicesScopeCheck = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.doctor_services\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundDoctorServicesUpdatedAtTrigger = true;

  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.doctor_practice_locations\b/i.test(content)) foundDoctorPracticeLocationsTable = true;
  if (/\bdoctor_id\s+uuid\s+not\s+null\s+references\s+public\.doctors\s*\(\s*id\s*\)/i.test(content)) foundDoctorPracticeLocationsDoctorRef = true;
  if (/\bcenter_id\s+uuid\s+not\s+null\s+references\s+public\.centers\s*\(\s*id\s*\)/i.test(content)) foundDoctorPracticeLocationsCenterRef = true;
  if (/\bcenter_location_id\s+uuid\s+null\s+references\s+public\.center_locations\s*\(\s*id\s*\)/i.test(content)) foundDoctorPracticeLocationsCenterLocationRef = true;
  if (/\bprimary_specialty_id\s+uuid\s+null\s+references\s+public\.specialties\s*\(\s*id\s*\)/i.test(content)) foundDoctorPracticeLocationsSpecialtyRef = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.doctor_practice_locations\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundDoctorPracticeLocationsUpdatedAtTrigger = true;
}


for (const table of allowedGeoTables) if (!createdGeoTables.has(table)) { console.error(`ERROR: Phase ${PHASE} requires CREATE TABLE public.${table}.`); process.exit(1); }
for (const table of allowedTaxonomyTables) if (!createdTaxonomyTables.has(table)) { console.error(`ERROR: Phase ${PHASE} requires CREATE TABLE public.${table}.`); process.exit(1); }
for (const table of allowedOwnershipTables) if (!createdOwnershipTables.has(table)) { console.error(`ERROR: Phase ${PHASE} requires CREATE TABLE public.${table}.`); process.exit(1); }
for (const table of allowedDoctorTables) if (!createdDoctorTables.has(table)) { console.error(`ERROR: Phase ${PHASE} requires CREATE TABLE public.${table}.`); process.exit(1); }

if (!foundProfilesTable) { console.error(`ERROR: Phase ${PHASE} requires CREATE TABLE public.profiles from 0003_profiles_auth.sql.`); process.exit(1); }
if (foundSetUpdatedAtFunction && !foundProfilesUpdatedAtTrigger) { console.error('ERROR: public.set_updated_at() is only allowed when used by a trigger on public.profiles.updated_at.'); process.exit(1); }
if (!foundCentersTable) { console.error(`ERROR: Phase ${PHASE} requires CREATE TABLE public.centers from 0006_centers.sql.`); process.exit(1); }
if (!foundCentersUpdatedAtTrigger) { console.error(`ERROR: Phase ${PHASE} requires a BEFORE UPDATE trigger on public.centers using public.set_updated_at().`); process.exit(1); }
if (centersCenterTypeUsesProviderStatus) { console.error('ERROR: center_type must use center_type enum; found invalid provider_status usage.'); process.exit(1); }
if (!foundCenterLocationsTable || !foundCenterReference || !foundCountryReference || !foundRegionReference || !foundCityReference || !foundAreaReference) { console.error(`ERROR: Phase ${PHASE} requires valid center_locations + geo references.`); process.exit(1); }
if (!foundLatitudeNumeric || !foundLongitudeNumeric || !foundLatitudeRangeCheck || !foundLongitudeRangeCheck) { console.error(`ERROR: Phase ${PHASE} requires latitude/longitude numeric(9,6) with safe range checks.`); process.exit(1); }
if (!foundCenterLocationsUpdatedAtTrigger) { console.error(`ERROR: Phase ${PHASE} requires center_locations BEFORE UPDATE trigger with public.set_updated_at().`); process.exit(1); }
if (!foundCenterServicesTable || !foundCenterServicesCenterRef || !foundCenterServicesLocationRef || !foundCenterServicesTaxonomyRef || !foundCenterServicesServiceCategoryRef || !foundCenterServicesServiceRef || !foundCenterServicesSpecialtyRef || !foundCenterServicesScopeCheck || !foundCenterServicesUpdatedAtTrigger) { console.error(`ERROR: Phase ${PHASE} requires complete center_services schema and trigger.`); process.exit(1); }
if (!foundCenterClaimsTable || !foundCenterMembershipsTable || !foundCenterClaimsCenterRef || !foundCenterClaimsClaimantProfileRef || !foundCenterClaimsReviewedByProfileRef || !foundCenterClaimsClaimStatusEnum || !foundCenterMembershipsCenterRef || !foundCenterMembershipsProfileRef || !foundCenterMembershipsRoleEnum || !foundCenterMembershipsStatusEnum || !foundCenterClaimsUpdatedAtTrigger || !foundCenterMembershipsUpdatedAtTrigger) { console.error(`ERROR: Phase ${PHASE} requires complete center claims/memberships schema and triggers.`); process.exit(1); }

if (!foundDoctorsTable) { console.error(`ERROR: Phase ${PHASE} requires CREATE TABLE public.doctors in 0010_doctors.sql.`); process.exit(1); }
if (!foundDoctorTitleUsage || !foundDoctorGenderUsage) { console.error(`ERROR: Phase ${PHASE} requires doctors.title doctor_title and doctors.gender doctor_gender usage.`); process.exit(1); }
if (!foundDoctorSpecialtiesReference) { console.error(`ERROR: Phase ${PHASE} requires doctors.primary_specialty_id references public.specialties(id).`); process.exit(1); }
if (!foundDoctorVerificationStatusUsage || !foundDoctorProviderStatusUsage || !foundDoctorAppLocaleUsage || !foundDoctorCountryCodeUsage) { console.error(`ERROR: Phase ${PHASE} requires doctors enum usage for verification_status, provider_status, app_locale, and country_code.`); process.exit(1); }
if (!foundDoctorYearsExperienceCheck) { console.error(`ERROR: Phase ${PHASE} requires doctors years_experience safe check (0..80 or null).`); process.exit(1); }
if (!foundDoctorsUpdatedAtTrigger) { console.error(`ERROR: Phase ${PHASE} requires doctors BEFORE UPDATE trigger using public.set_updated_at().`); process.exit(1); }
if (!foundDoctorPracticeLocationsTable) { console.error(`ERROR: Phase ${PHASE} requires CREATE TABLE public.doctor_practice_locations in 0011_doctor_practice_locations.sql.`); process.exit(1); }
if (!foundDoctorPracticeLocationsDoctorRef || !foundDoctorPracticeLocationsCenterRef || !foundDoctorPracticeLocationsCenterLocationRef || !foundDoctorPracticeLocationsSpecialtyRef) { console.error(`ERROR: Phase ${PHASE} requires doctor_practice_locations references to doctors, centers, center_locations, and specialties.`); process.exit(1); }
if (!foundDoctorPracticeLocationsUpdatedAtTrigger) { console.error(`ERROR: Phase ${PHASE} requires doctor_practice_locations BEFORE UPDATE trigger using public.set_updated_at().`); process.exit(1); }


if (!foundDoctorServicesTable) { console.error(`ERROR: Phase ${PHASE} requires CREATE TABLE public.doctor_services in 0012_doctor_services.sql.`); process.exit(1); }
if (!foundDoctorServicesDoctorRef || !foundDoctorServicesPracticeLocationRef || !foundDoctorServicesCenterRef || !foundDoctorServicesCenterLocationRef || !foundDoctorServicesCenterServiceRef || !foundDoctorServicesTaxonomyRef || !foundDoctorServicesServiceCategoryRef || !foundDoctorServicesServiceRef || !foundDoctorServicesSpecialtyRef) { console.error(`ERROR: Phase ${PHASE} requires doctor_services references to doctors, doctor_practice_locations, centers, center_locations, center_services, taxonomy_groups, service_categories, services, and specialties.`); process.exit(1); }
if (!foundDoctorServicesScopeCheck) { console.error(`ERROR: Phase ${PHASE} requires doctor_services check constraint ensuring one of service_id, specialty_id, or service_category_id is not null.`); process.exit(1); }
if (!foundDoctorServicesUpdatedAtTrigger) { console.error(`ERROR: Phase ${PHASE} requires doctor_services BEFORE UPDATE trigger using public.set_updated_at().`); process.exit(1); }

console.log(`Phase ${PHASE} migration validation passed.`);
console.log(`Validated files: ${required.join(', ')}`);
