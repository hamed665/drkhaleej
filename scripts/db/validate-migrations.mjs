#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';

const PHASE = '2.6B';

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
  '0012_doctor_services.sql',
  '0013_doctor_schedules.sql',
  '0014_doctor_schedule_exceptions.sql',
  '0015_appointment_slots.sql',
  '0016_patient_contacts.sql',
  '0017_appointments.sql'
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
  'bookings',
  'patients',
  'payments',
  'insurance',
  'pricing',
  'reviews',
  'ratings',
  'lab_results',
  'prescriptions',
  'diagnoses',
  'medical_records',
  'reminders',
  'notifications',
  'legal_documents',
  'consent_logs',
  'behavior_events',
  'sponsored_slots',
  'audit_logs'
];

const allowedGeoTables = ['geo_countries', 'geo_regions', 'geo_cities', 'geo_areas'];
const allowedTaxonomyTables = ['taxonomy_groups', 'service_categories', 'services', 'specialties'];
const allowedOwnershipTables = ['center_claims', 'center_memberships'];
const allowedDoctorTables = ['doctors', 'doctor_services', 'doctor_schedules', 'doctor_schedule_exceptions', 'appointment_slots'];

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


let foundDoctorScheduleDayEnum = false;
let foundDoctorSchedulesTable = false;
let foundDoctorSchedulesDoctorRef = false;
let foundDoctorSchedulesPracticeLocationRef = false;
let foundDoctorSchedulesCenterRef = false;
let foundDoctorSchedulesCenterLocationRef = false;
let foundDoctorSchedulesDayEnumUsage = false;
let foundDoctorSchedulesStartTime = false;
let foundDoctorSchedulesEndTime = false;
let foundDoctorSchedulesTimeWindowCheck = false;
let foundDoctorSchedulesSlotMinutesCheck = false;
let foundDoctorSchedulesTimezoneDefault = false;
let foundDoctorSchedulesUpdatedAtTrigger = false;


let foundDoctorScheduleExceptionTypeEnum = false;
let foundDoctorScheduleExceptionsTable = false;
let foundDoctorScheduleExceptionsDoctorRef = false;
let foundDoctorScheduleExceptionsScheduleRef = false;
let foundDoctorScheduleExceptionsPracticeLocationRef = false;
let foundDoctorScheduleExceptionsCenterRef = false;
let foundDoctorScheduleExceptionsCenterLocationRef = false;
let foundDoctorScheduleExceptionsTypeUsage = false;
let foundDoctorScheduleExceptionsDateNotNull = false;
let foundDoctorScheduleExceptionsStartTime = false;
let foundDoctorScheduleExceptionsEndTime = false;
let foundDoctorScheduleExceptionsTimePairCheck = false;
let foundDoctorScheduleExceptionsTimeWindowCheck = false;
let foundDoctorScheduleExceptionsUpdatedAtTrigger = false;


let foundAppointmentSlotStatusEnum = false;
let foundAppointmentSlotsTable = false;
let foundAppointmentSlotsDoctorRef = false;
let foundAppointmentSlotsPracticeLocationRef = false;
let foundAppointmentSlotsScheduleRef = false;
let foundAppointmentSlotsScheduleExceptionRef = false;
let foundAppointmentSlotsCenterRef = false;
let foundAppointmentSlotsCenterLocationRef = false;
let foundAppointmentSlotsDoctorServiceRef = false;
let foundAppointmentSlotsCenterServiceRef = false;
let foundAppointmentSlotsSlotDateNotNull = false;
let foundAppointmentSlotsStartTime = false;
let foundAppointmentSlotsEndTime = false;
let foundAppointmentSlotsTimeWindowCheck = false;
let foundAppointmentSlotsCapacityCheck = false;
let foundAppointmentSlotsBookedCountChecks = false;
let foundAppointmentSlotsStatusUsage = false;
let foundAppointmentSlotsTimezoneDefault = false;
let foundAppointmentSlotsUpdatedAtTrigger = false;


let foundPatientContactGenderEnum = false;
let foundPatientContactsTable = false;
let foundPatientContactsGenderUsage = false;
let foundPatientContactsLocaleUsage = false;
let foundPatientContactsCountryUsage = false;
let foundPatientContactsFullNameNotNull = false;
let foundPatientContactsPhoneNotNull = false;
let foundPatientContactsEmail = false;
let foundPatientContactsEmailCheck = false;
let foundPatientContactsBirthYearCheck = false;
let foundPatientContactsUpdatedAtTrigger = false;

let foundAppointmentStatusEnum = false;
let foundAppointmentsTable = false;
let foundAppointmentsSlotRef = false;
let foundAppointmentsPatientContactRef = false;
let foundAppointmentsDoctorRef = false;
let foundAppointmentsPracticeLocationRef = false;
let foundAppointmentsCenterRef = false;
let foundAppointmentsCenterLocationRef = false;
let foundAppointmentsDoctorServiceRef = false;
let foundAppointmentsCenterServiceRef = false;
let foundAppointmentsSlotDateNotNull = false;
let foundAppointmentsStartTime = false;
let foundAppointmentsEndTime = false;
let foundAppointmentsTimeWindowCheck = false;
let foundAppointmentsStatusUsage = false;
let foundAppointmentsTimezoneDefault = false;
let foundAppointmentsUpdatedAtTrigger = false;

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


  if (file === '0013_doctor_schedules.sql' && /create\s+type\s+doctor_schedule_day\s+as\s+enum/i.test(content)) foundDoctorScheduleDayEnum = true;
  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.doctor_schedules\b/i.test(content)) foundDoctorSchedulesTable = true;
  if (/\bdoctor_id\s+uuid\s+not\s+null\s+references\s+public\.doctors\s*\(\s*id\s*\)/i.test(content)) foundDoctorSchedulesDoctorRef = true;
  if (/\bdoctor_practice_location_id\s+uuid\s+null\s+references\s+public\.doctor_practice_locations\s*\(\s*id\s*\)/i.test(content)) foundDoctorSchedulesPracticeLocationRef = true;
  if (/\bcenter_id\s+uuid\s+null\s+references\s+public\.centers\s*\(\s*id\s*\)/i.test(content)) foundDoctorSchedulesCenterRef = true;
  if (/\bcenter_location_id\s+uuid\s+null\s+references\s+public\.center_locations\s*\(\s*id\s*\)/i.test(content)) foundDoctorSchedulesCenterLocationRef = true;
  if (/\bday_of_week\s+doctor_schedule_day\s+not\s+null\b/i.test(content)) foundDoctorSchedulesDayEnumUsage = true;
  if (/\bstart_time\s+time\s+not\s+null\b/i.test(content)) foundDoctorSchedulesStartTime = true;
  if (/\bend_time\s+time\s+not\s+null\b/i.test(content)) foundDoctorSchedulesEndTime = true;
  if (/\bend_time\s*>\s*start_time\b/i.test(content) || /\bconstraint\s+doctor_schedules_time_window_check\b/i.test(content)) foundDoctorSchedulesTimeWindowCheck = true;
  if (/\bslot_minutes\s+is\s+null\s+or\s*\(\s*slot_minutes\s*>=\s*5\s+and\s+slot_minutes\s*<=\s*240\s*\)/i.test(content) || /\bconstraint\s+doctor_schedules_slot_minutes_check\b/i.test(content)) foundDoctorSchedulesSlotMinutesCheck = true;
  if (/\btimezone\s+text\s+not\s+null\s+default\s+'Asia\/Muscat'/i.test(content)) foundDoctorSchedulesTimezoneDefault = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.doctor_schedules\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundDoctorSchedulesUpdatedAtTrigger = true;

  if (file === '0014_doctor_schedule_exceptions.sql' && /create\s+type\s+doctor_schedule_exception_type\s+as\s+enum/i.test(content)) foundDoctorScheduleExceptionTypeEnum = true;
  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.doctor_schedule_exceptions\b/i.test(content)) foundDoctorScheduleExceptionsTable = true;
  if (/\bdoctor_id\s+uuid\s+not\s+null\s+references\s+public\.doctors\s*\(\s*id\s*\)/i.test(content)) foundDoctorScheduleExceptionsDoctorRef = true;
  if (/\bdoctor_schedule_id\s+uuid\s+null\s+references\s+public\.doctor_schedules\s*\(\s*id\s*\)/i.test(content)) foundDoctorScheduleExceptionsScheduleRef = true;
  if (/\bdoctor_practice_location_id\s+uuid\s+null\s+references\s+public\.doctor_practice_locations\s*\(\s*id\s*\)/i.test(content)) foundDoctorScheduleExceptionsPracticeLocationRef = true;
  if (/\bcenter_id\s+uuid\s+null\s+references\s+public\.centers\s*\(\s*id\s*\)/i.test(content)) foundDoctorScheduleExceptionsCenterRef = true;
  if (/\bcenter_location_id\s+uuid\s+null\s+references\s+public\.center_locations\s*\(\s*id\s*\)/i.test(content)) foundDoctorScheduleExceptionsCenterLocationRef = true;
  if (/\bexception_type\s+doctor_schedule_exception_type\s+not\s+null\b/i.test(content)) foundDoctorScheduleExceptionsTypeUsage = true;
  if (/\bexception_date\s+date\s+not\s+null\b/i.test(content)) foundDoctorScheduleExceptionsDateNotNull = true;
  if (/\bstart_time\s+time\s+null\b/i.test(content)) foundDoctorScheduleExceptionsStartTime = true;
  if (/\bend_time\s+time\s+null\b/i.test(content)) foundDoctorScheduleExceptionsEndTime = true;
  if (/\bconstraint\s+doctor_schedule_exceptions_time_pair_check\b/i.test(content) || /(start_time\s+is\s+null\s+and\s+end_time\s+is\s+null)[\s\S]*(start_time\s+is\s+not\s+null\s+and\s+end_time\s+is\s+not\s+null)/i.test(content)) foundDoctorScheduleExceptionsTimePairCheck = true;
  if (/\bconstraint\s+doctor_schedule_exceptions_time_window_check\b/i.test(content) || /end_time\s*>\s*start_time/i.test(content)) foundDoctorScheduleExceptionsTimeWindowCheck = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.doctor_schedule_exceptions\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundDoctorScheduleExceptionsUpdatedAtTrigger = true;

  if (file === '0015_appointment_slots.sql' && /create\s+type\s+appointment_slot_status\s+as\s+enum/i.test(content)) foundAppointmentSlotStatusEnum = true;
  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.appointment_slots\b/i.test(content)) foundAppointmentSlotsTable = true;
  if (/\bdoctor_id\s+uuid\s+not\s+null\s+references\s+public\.doctors\s*\(\s*id\s*\)/i.test(content)) foundAppointmentSlotsDoctorRef = true;
  if (/\bdoctor_practice_location_id\s+uuid\s+null\s+references\s+public\.doctor_practice_locations\s*\(\s*id\s*\)/i.test(content)) foundAppointmentSlotsPracticeLocationRef = true;
  if (/\bdoctor_schedule_id\s+uuid\s+null\s+references\s+public\.doctor_schedules\s*\(\s*id\s*\)/i.test(content)) foundAppointmentSlotsScheduleRef = true;
  if (/\bdoctor_schedule_exception_id\s+uuid\s+null\s+references\s+public\.doctor_schedule_exceptions\s*\(\s*id\s*\)/i.test(content)) foundAppointmentSlotsScheduleExceptionRef = true;
  if (/\bcenter_id\s+uuid\s+null\s+references\s+public\.centers\s*\(\s*id\s*\)/i.test(content)) foundAppointmentSlotsCenterRef = true;
  if (/\bcenter_location_id\s+uuid\s+null\s+references\s+public\.center_locations\s*\(\s*id\s*\)/i.test(content)) foundAppointmentSlotsCenterLocationRef = true;
  if (/\bdoctor_service_id\s+uuid\s+null\s+references\s+public\.doctor_services\s*\(\s*id\s*\)/i.test(content)) foundAppointmentSlotsDoctorServiceRef = true;
  if (/\bcenter_service_id\s+uuid\s+null\s+references\s+public\.center_services\s*\(\s*id\s*\)/i.test(content)) foundAppointmentSlotsCenterServiceRef = true;
  if (/\bslot_date\s+date\s+not\s+null\b/i.test(content)) foundAppointmentSlotsSlotDateNotNull = true;
  if (/\bstart_time\s+time\s+not\s+null\b/i.test(content)) foundAppointmentSlotsStartTime = true;
  if (/\bend_time\s+time\s+not\s+null\b/i.test(content)) foundAppointmentSlotsEndTime = true;
  if (/\bconstraint\s+appointment_slots_time_window_check\b/i.test(content) || /end_time\s*>\s*start_time/i.test(content)) foundAppointmentSlotsTimeWindowCheck = true;
  if (/\bconstraint\s+appointment_slots_capacity_check\b/i.test(content) || /capacity\s*>=\s*1/i.test(content)) foundAppointmentSlotsCapacityCheck = true;
  if ((/booked_count\s*>=\s*0/i.test(content) || /appointment_slots_booked_count_nonnegative_check/i.test(content)) && (/booked_count\s*<=\s*capacity/i.test(content) || /appointment_slots_booked_count_capacity_check/i.test(content))) foundAppointmentSlotsBookedCountChecks = true;
  if (/\bstatus\s+appointment_slot_status\s+not\s+null\s+default\s+'draft'/i.test(content)) foundAppointmentSlotsStatusUsage = true;
  if (/\btimezone\s+text\s+not\s+null\s+default\s+'Asia\/Muscat'/i.test(content)) foundAppointmentSlotsTimezoneDefault = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.appointment_slots\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundAppointmentSlotsUpdatedAtTrigger = true;

  if (file === '0016_patient_contacts.sql' && /create\s+type\s+patient_contact_gender\s+as\s+enum/i.test(content)) foundPatientContactGenderEnum = true;
  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.patient_contacts\b/i.test(content)) foundPatientContactsTable = true;
  if (/\bgender\s+patient_contact_gender\s+not\s+null\s+default\s+'unspecified'/i.test(content)) foundPatientContactsGenderUsage = true;
  if (/\bpreferred_locale\s+app_locale\s+not\s+null\s+default\s+'en'/i.test(content)) foundPatientContactsLocaleUsage = true;
  if (/\bcountry_code\s+country_code\s+not\s+null\s+default\s+'om'/i.test(content)) foundPatientContactsCountryUsage = true;
  if (/\bfull_name\s+text\s+not\s+null\b/i.test(content)) foundPatientContactsFullNameNotNull = true;
  if (/\bphone\s+text\s+not\s+null\b/i.test(content)) foundPatientContactsPhoneNotNull = true;
  if (/\bemail\s+text\s+null\b/i.test(content)) foundPatientContactsEmail = true;
  if (/email\s+is\s+null\s+or\s+email\s+~\*/i.test(content)) foundPatientContactsEmailCheck = true;
  if (/birth_year\s+is\s+null\s+or\s*\(\s*birth_year\s+between\s+1900\s+and\s+2100\s*\)/i.test(content)) foundPatientContactsBirthYearCheck = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.patient_contacts\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundPatientContactsUpdatedAtTrigger = true;

  if (file === '0017_appointments.sql' && /create\s+type\s+appointment_status\s+as\s+enum/i.test(content)) foundAppointmentStatusEnum = true;
  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.appointments\b/i.test(content)) foundAppointmentsTable = true;
  if (/\bappointment_slot_id\s+uuid\s+null\s+references\s+public\.appointment_slots\s*\(\s*id\s*\)/i.test(content)) foundAppointmentsSlotRef = true;
  if (/\bpatient_contact_id\s+uuid\s+not\s+null\s+references\s+public\.patient_contacts\s*\(\s*id\s*\)/i.test(content)) foundAppointmentsPatientContactRef = true;
  if (/\bdoctor_id\s+uuid\s+not\s+null\s+references\s+public\.doctors\s*\(\s*id\s*\)/i.test(content)) foundAppointmentsDoctorRef = true;
  if (/\bdoctor_practice_location_id\s+uuid\s+null\s+references\s+public\.doctor_practice_locations\s*\(\s*id\s*\)/i.test(content)) foundAppointmentsPracticeLocationRef = true;
  if (/\bcenter_id\s+uuid\s+null\s+references\s+public\.centers\s*\(\s*id\s*\)/i.test(content)) foundAppointmentsCenterRef = true;
  if (/\bcenter_location_id\s+uuid\s+null\s+references\s+public\.center_locations\s*\(\s*id\s*\)/i.test(content)) foundAppointmentsCenterLocationRef = true;
  if (/\bdoctor_service_id\s+uuid\s+null\s+references\s+public\.doctor_services\s*\(\s*id\s*\)/i.test(content)) foundAppointmentsDoctorServiceRef = true;
  if (/\bcenter_service_id\s+uuid\s+null\s+references\s+public\.center_services\s*\(\s*id\s*\)/i.test(content)) foundAppointmentsCenterServiceRef = true;
  if (/\bslot_date\s+date\s+not\s+null\b/i.test(content)) foundAppointmentsSlotDateNotNull = true;
  if (/\bstart_time\s+time\s+not\s+null\b/i.test(content)) foundAppointmentsStartTime = true;
  if (/\bend_time\s+time\s+not\s+null\b/i.test(content)) foundAppointmentsEndTime = true;
  if (/\bconstraint\s+appointments_time_window_check\b/i.test(content) || /end_time\s*>\s*start_time/i.test(content)) foundAppointmentsTimeWindowCheck = true;
  if (/\bstatus\s+appointment_status\s+not\s+null\s+default\s+'requested'/i.test(content)) foundAppointmentsStatusUsage = true;
  if (/\btimezone\s+text\s+not\s+null\s+default\s+'Asia\/Muscat'/i.test(content)) foundAppointmentsTimezoneDefault = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.appointments\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundAppointmentsUpdatedAtTrigger = true;


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


if (!foundDoctorScheduleDayEnum) { console.error(`ERROR: Phase ${PHASE} requires create type doctor_schedule_day as enum in 0013_doctor_schedules.sql.`); process.exit(1); }
if (!foundDoctorSchedulesTable) { console.error(`ERROR: Phase ${PHASE} requires CREATE TABLE public.doctor_schedules in 0013_doctor_schedules.sql.`); process.exit(1); }
if (!foundDoctorSchedulesDoctorRef || !foundDoctorSchedulesPracticeLocationRef || !foundDoctorSchedulesCenterRef || !foundDoctorSchedulesCenterLocationRef) { console.error(`ERROR: Phase ${PHASE} requires doctor_schedules references to doctors, doctor_practice_locations, centers, and center_locations.`); process.exit(1); }
if (!foundDoctorSchedulesDayEnumUsage) { console.error(`ERROR: Phase ${PHASE} requires doctor_schedules.day_of_week to use doctor_schedule_day enum.`); process.exit(1); }
if (!foundDoctorSchedulesStartTime || !foundDoctorSchedulesEndTime) { console.error(`ERROR: Phase ${PHASE} requires doctor_schedules start_time and end_time as time columns.`); process.exit(1); }
if (!foundDoctorSchedulesTimeWindowCheck) { console.error(`ERROR: Phase ${PHASE} requires doctor_schedules safe check end_time > start_time.`); process.exit(1); }
if (!foundDoctorSchedulesSlotMinutesCheck) { console.error(`ERROR: Phase ${PHASE} requires doctor_schedules safe slot_minutes check (null or 5..240).`); process.exit(1); }
if (!foundDoctorSchedulesTimezoneDefault) { console.error(`ERROR: Phase ${PHASE} requires doctor_schedules timezone default 'Asia/Muscat'.`); process.exit(1); }
if (!foundDoctorSchedulesUpdatedAtTrigger) { console.error(`ERROR: Phase ${PHASE} requires doctor_schedules BEFORE UPDATE trigger using public.set_updated_at().`); process.exit(1); }


if (!foundDoctorScheduleExceptionTypeEnum) { console.error(`ERROR: Phase ${PHASE} requires create type doctor_schedule_exception_type as enum in 0014_doctor_schedule_exceptions.sql.`); process.exit(1); }
if (!foundDoctorScheduleExceptionsTable) { console.error(`ERROR: Phase ${PHASE} requires CREATE TABLE public.doctor_schedule_exceptions in 0014_doctor_schedule_exceptions.sql.`); process.exit(1); }
if (!foundDoctorScheduleExceptionsDoctorRef || !foundDoctorScheduleExceptionsScheduleRef || !foundDoctorScheduleExceptionsPracticeLocationRef || !foundDoctorScheduleExceptionsCenterRef || !foundDoctorScheduleExceptionsCenterLocationRef) { console.error(`ERROR: Phase ${PHASE} requires doctor_schedule_exceptions references to doctors, doctor_schedules, doctor_practice_locations, centers, and center_locations.`); process.exit(1); }
if (!foundDoctorScheduleExceptionsTypeUsage) { console.error(`ERROR: Phase ${PHASE} requires doctor_schedule_exceptions.exception_type to use doctor_schedule_exception_type enum.`); process.exit(1); }
if (!foundDoctorScheduleExceptionsDateNotNull) { console.error(`ERROR: Phase ${PHASE} requires doctor_schedule_exceptions.exception_date date not null.`); process.exit(1); }
if (!foundDoctorScheduleExceptionsStartTime || !foundDoctorScheduleExceptionsEndTime) { console.error(`ERROR: Phase ${PHASE} requires doctor_schedule_exceptions start_time and end_time time columns.`); process.exit(1); }
if (!foundDoctorScheduleExceptionsTimePairCheck || !foundDoctorScheduleExceptionsTimeWindowCheck) { console.error(`ERROR: Phase ${PHASE} requires doctor_schedule_exceptions safe start_time/end_time pairing and ordering checks.`); process.exit(1); }
if (!foundDoctorScheduleExceptionsUpdatedAtTrigger) { console.error(`ERROR: Phase ${PHASE} requires doctor_schedule_exceptions BEFORE UPDATE trigger using public.set_updated_at().`); process.exit(1); }


if (!foundAppointmentSlotStatusEnum) { console.error(`ERROR: Phase ${PHASE} requires create type appointment_slot_status as enum in 0015_appointment_slots.sql.`); process.exit(1); }
if (!foundAppointmentSlotsTable) { console.error(`ERROR: Phase ${PHASE} requires CREATE TABLE public.appointment_slots in 0015_appointment_slots.sql.`); process.exit(1); }
if (!foundAppointmentSlotsDoctorRef || !foundAppointmentSlotsPracticeLocationRef || !foundAppointmentSlotsScheduleRef || !foundAppointmentSlotsScheduleExceptionRef || !foundAppointmentSlotsCenterRef || !foundAppointmentSlotsCenterLocationRef || !foundAppointmentSlotsDoctorServiceRef || !foundAppointmentSlotsCenterServiceRef) { console.error(`ERROR: Phase ${PHASE} requires appointment_slots references to doctors, doctor_practice_locations, doctor_schedules, doctor_schedule_exceptions, centers, center_locations, doctor_services, and center_services.`); process.exit(1); }
if (!foundAppointmentSlotsSlotDateNotNull) { console.error(`ERROR: Phase ${PHASE} requires appointment_slots slot_date date not null.`); process.exit(1); }
if (!foundAppointmentSlotsStartTime || !foundAppointmentSlotsEndTime) { console.error(`ERROR: Phase ${PHASE} requires appointment_slots start_time and end_time time columns.`); process.exit(1); }
if (!foundAppointmentSlotsTimeWindowCheck) { console.error(`ERROR: Phase ${PHASE} requires appointment_slots safe check end_time > start_time.`); process.exit(1); }
if (!foundAppointmentSlotsCapacityCheck || !foundAppointmentSlotsBookedCountChecks) { console.error(`ERROR: Phase ${PHASE} requires appointment_slots safe checks for capacity and booked_count.`); process.exit(1); }
if (!foundAppointmentSlotsStatusUsage) { console.error(`ERROR: Phase ${PHASE} requires appointment_slots status to use appointment_slot_status enum with default 'draft'.`); process.exit(1); }
if (!foundAppointmentSlotsTimezoneDefault) { console.error(`ERROR: Phase ${PHASE} requires appointment_slots timezone default 'Asia/Muscat'.`); process.exit(1); }
if (!foundAppointmentSlotsUpdatedAtTrigger) { console.error(`ERROR: Phase ${PHASE} requires appointment_slots BEFORE UPDATE trigger using public.set_updated_at().`); process.exit(1); }

if (!foundPatientContactGenderEnum) { console.error(`ERROR: Phase ${PHASE} requires create type patient_contact_gender as enum in 0016_patient_contacts.sql.`); process.exit(1); }
if (!foundPatientContactsTable) { console.error(`ERROR: Phase ${PHASE} requires CREATE TABLE public.patient_contacts in 0016_patient_contacts.sql.`); process.exit(1); }
if (!foundPatientContactsGenderUsage || !foundPatientContactsLocaleUsage || !foundPatientContactsCountryUsage) { console.error(`ERROR: Phase ${PHASE} requires patient_contacts enum usage for patient_contact_gender, app_locale, and country_code.`); process.exit(1); }
if (!foundPatientContactsFullNameNotNull || !foundPatientContactsPhoneNotNull || !foundPatientContactsEmail || !foundPatientContactsEmailCheck || !foundPatientContactsBirthYearCheck) { console.error(`ERROR: Phase ${PHASE} requires patient_contacts full_name/phone/email/birth_year constraints.`); process.exit(1); }
if (!foundPatientContactsUpdatedAtTrigger) { console.error(`ERROR: Phase ${PHASE} requires patient_contacts BEFORE UPDATE trigger using public.set_updated_at().`); process.exit(1); }
if (!foundAppointmentStatusEnum) { console.error(`ERROR: Phase ${PHASE} requires create type appointment_status as enum in 0017_appointments.sql.`); process.exit(1); }
if (!foundAppointmentsTable) { console.error(`ERROR: Phase ${PHASE} requires CREATE TABLE public.appointments in 0017_appointments.sql.`); process.exit(1); }
if (!foundAppointmentsSlotRef || !foundAppointmentsPatientContactRef || !foundAppointmentsDoctorRef || !foundAppointmentsPracticeLocationRef || !foundAppointmentsCenterRef || !foundAppointmentsCenterLocationRef || !foundAppointmentsDoctorServiceRef || !foundAppointmentsCenterServiceRef) { console.error(`ERROR: Phase ${PHASE} requires appointments references to appointment_slots, patient_contacts, doctors, doctor_practice_locations, centers, center_locations, doctor_services, and center_services.`); process.exit(1); }
if (!foundAppointmentsSlotDateNotNull || !foundAppointmentsStartTime || !foundAppointmentsEndTime || !foundAppointmentsTimeWindowCheck) { console.error(`ERROR: Phase ${PHASE} requires appointments slot_date/start_time/end_time with safe end_time > start_time check.`); process.exit(1); }
if (!foundAppointmentsStatusUsage || !foundAppointmentsTimezoneDefault) { console.error(`ERROR: Phase ${PHASE} requires appointments appointment_status enum default and timezone default 'Asia/Muscat'.`); process.exit(1); }
if (!foundAppointmentsUpdatedAtTrigger) { console.error(`ERROR: Phase ${PHASE} requires appointments BEFORE UPDATE trigger using public.set_updated_at().`); process.exit(1); }



console.log(`Phase ${PHASE} migration validation passed.`);
console.log(`Validated files: ${required.join(', ')}`);
