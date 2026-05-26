#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';

const PHASE = '2.9B';

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
  '0030_audit_logs.sql'
];

const dir = 'supabase/migrations';

function fail(message) {
  console.error(`ERROR: Phase ${PHASE}: ${message}`);
  process.exit(1);
}

function requireCondition(condition, message) {
  if (!condition) fail(message);
}

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
  'payment_transactions',
  'invoices',
  'invoice_items',
  'refunds',
  'checkout_sessions',
  'payment_gateway_customers',
  'taxes',
  'coupons',
  'insurance',
  'pricing',
  'ratings',
  'lab_results',
  'prescriptions',
  'diagnoses',
  'medical_records',
  'reminders',
  'notifications',
  'behavior_events',
  'sponsored_slots',
  'review_aggregates',
  'review_summaries',
  'ai_moderation',
  'storage_buckets',
  'upload_jobs',
  'image_processing_jobs'
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
let foundAppointmentStatusHistoryTable = false;
let foundAppointmentStatusHistoryAppointmentRef = false;
let foundAppointmentStatusHistoryChangedByProfileRef = false;
let foundAppointmentStatusHistoryFromStatusUsage = false;
let foundAppointmentStatusHistoryToStatusUsage = false;
let foundAppointmentStatusHistoryCreatedAt = false;

let foundAppointmentCancellationActorEnum = false;
let foundAppointmentCancellationReasonEnum = false;
let foundAppointmentCancellationsTable = false;
let foundAppointmentCancellationsAppointmentRef = false;
let foundAppointmentCancellationsProfileRef = false;
let foundAppointmentCancellationsActorUsage = false;
let foundAppointmentCancellationsReasonUsage = false;
let foundAppointmentCancellationsCancelledAt = false;
let foundAppointmentCancellationsUpdatedAtTrigger = false;


let foundReviewTargetTypeEnum = false;
let foundReviewStatusEnum = false;
let foundReviewsTable = false;
let foundReviewsCenterRef = false;
let foundReviewsDoctorRef = false;
let foundReviewsCenterServiceRef = false;
let foundReviewsDoctorServiceRef = false;
let foundReviewsAppointmentRef = false;
let foundReviewsPatientContactRef = false;
let foundReviewsTargetTypeUsage = false;
let foundReviewsStatusUsage = false;
let foundReviewsLocaleUsage = false;
let foundReviewsRatingCheck = false;
let foundReviewsTargetPresenceCheck = false;
let foundReviewsUpdatedAtTrigger = false;

let foundReviewReportReasonEnum = false;
let foundReviewReportStatusEnum = false;
let foundReviewReportsTable = false;
let foundReviewReportsReviewRef = false;
let foundReviewReportsProfileRef = false;
let foundReviewReportsPatientContactRef = false;
let foundReviewReportsReasonUsage = false;
let foundReviewReportsStatusUsage = false;
let foundReviewReportsUpdatedAtTrigger = false;


let foundCenterTypeGym = false;
let foundCenterTypeFitnessCenter = false;
let foundCenterTypeSpa = false;
let foundCenterTypeHealthyRestaurant = false;
let foundCenterTypeNutritionCenter = false;
let foundCenterTypeJuiceBar = false;
let foundCenterTypeMealPlanProvider = false;
let foundCenterTypeHomeHealthcare = false;
let foundCenterTypeOpticalStore = false;
let foundCenterTypeMedicalEquipmentStore = false;

let foundMediaAssetStatusEnum = false;
let foundMediaAssetSourceEnum = false;
let foundMediaAssetsTable = false;
let foundMediaAssetsProfileRef = false;
let foundMediaAssetsStatusUsage = false;
let foundMediaAssetsSourceUsage = false;
let foundMediaAssetsStorageBucket = false;
let foundMediaAssetsStoragePath = false;
let foundMediaAssetsPublicUrl = false;
let foundMediaAssetsExternalUrl = false;
let foundMediaAssetsMetadata = false;
let foundMediaAssetsLocationCheck = false;
let foundMediaAssetsSizeDimensionChecks = false;
let foundMediaAssetsUpdatedAtTrigger = false;

let foundMediaEntityTypeEnum = false;
let foundMediaUsageKindEnum = false;
let foundEntityMediaTable = false;
let foundEntityMediaMediaAssetRef = false;
let foundEntityMediaEntityTypeUsage = false;
let foundEntityMediaUsageKindUsage = false;
let foundEntityMediaEntityId = false;
let foundEntityMediaAltText = false;
let foundEntityMediaCaption = false;
let foundEntityMediaIsPrimary = false;
let foundEntityMediaSortOrder = false;
let foundEntityMediaMetadata = false;
let foundEntityMediaUpdatedAtTrigger = false;

let foundSubscriptionPlanStatusEnum = false;
let foundSubscriptionPlansTable = false;
let foundSubscriptionPlansStatusUsage = false;
let foundSubscriptionPlansIntervalUsage = false;
let foundSubscriptionPlansSlugUnique = false;
let foundSubscriptionPlansPriceCheck = false;
let foundSubscriptionPlansCurrencyDefault = false;
let foundSubscriptionPlansUpdatedAtTrigger = false;

let foundCenterSubscriptionStatusEnum = false;
let foundCenterSubscriptionsTable = false;
let foundCenterSubscriptionsCenterRef = false;
let foundCenterSubscriptionsPlanRef = false;
let foundCenterSubscriptionsProfileRef = false;
let foundCenterSubscriptionsStatusUsage = false;
let foundCenterSubscriptionsIntervalUsage = false;
let foundCenterSubscriptionsDateChecks = false;
let foundCenterSubscriptionsPartialUnique = false;
let foundCenterSubscriptionsUpdatedAtTrigger = false;

let foundSponsoredCampaignStatusEnum = false;
let foundSponsoredCampaignsTable = false;
let foundSponsoredPlacementsTable = false;
let foundSponsoredCampaignsCenterRef = false;
let foundSponsoredCampaignsProfileRef = false;
let foundSponsoredCampaignsStatusUsage = false;
let foundSponsoredPlacementsCampaignRef = false;
let foundSponsoredPlacementsCenterRef = false;
let foundSponsoredPlacementsDoctorRef = false;
let foundSponsoredPlacementsCenterServiceRef = false;
let foundSponsoredPlacementsDoctorServiceRef = false;
let foundSponsoredPlacementsSlotTypeUsage = false;
let foundSponsoredPlacementsCountryUsage = false;
let foundSponsoredPlacementsLocaleUsage = false;
let foundSponsoredPlacementsTargetCheck = false;
let foundSponsoredCampaignsUpdatedAtTrigger = false;
let foundSponsoredPlacementsUpdatedAtTrigger = false;

let foundLegalDocumentStatusEnum = false;
let foundLegalDocumentsTable = false;
let foundLegalDocumentsConsentTypeUsage = false;
let foundLegalDocumentsStatusUsage = false;
let foundLegalDocumentsProfilesRef = false;
let foundLegalDocumentsVersionNotNull = false;
let foundLegalDocumentsTitleEnNotNull = false;
let foundLegalDocumentsBodyEnNotNull = false;
let foundLegalDocumentsPartialUnique = false;
let foundLegalDocumentsUpdatedAtTrigger = false;

let foundConsentLogsTable = false;
let foundConsentLogsConsentTypeUsage = false;
let foundConsentLogsLegalDocumentRef = false;
let foundConsentLogsProfilesRef = false;
let foundConsentLogsPatientContactsRef = false;
let foundConsentLogsLocaleUsage = false;
let foundConsentLogsCountryCodeUsage = false;
let foundConsentLogsConsentedAt = false;
let foundConsentLogsIdentityCheck = false;

let foundAuditLogsTable = false;
let foundAuditLogsActorTypeUsage = false;
let foundAuditLogsActionTypeUsage = false;
let foundAuditLogsProfilesRef = false;
let foundAuditLogsEntityTypeNotNull = false;
let foundAuditLogsCreatedAt = false;


try {
  if (!statSync(dir).isDirectory()) throw new Error(`${dir} is not a directory`);
} catch (error) {
  fail(`Missing required directory: ${dir}. Details: ${error.message}`);
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
      fail(`${file} violates rule: ${rule.message}`);
    }
  }

  for (const check of requiredEnumChecks) {
    if (file === check.file && !check.regex.test(content)) {
      fail(check.message.replace(`Phase ${PHASE} `, ''));
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
  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.appointment_status_history\b/i.test(content)) foundAppointmentStatusHistoryTable = true;
  if (/\bappointment_id\s+uuid\s+not\s+null\s+references\s+public\.appointments\s*\(\s*id\s*\)/i.test(content)) foundAppointmentStatusHistoryAppointmentRef = true;
  if (/\bchanged_by_profile_id\s+uuid\s+null\s+references\s+public\.profiles\s*\(\s*id\s*\)/i.test(content)) foundAppointmentStatusHistoryChangedByProfileRef = true;
  if (/\bfrom_status\s+appointment_status\s+null\b/i.test(content)) foundAppointmentStatusHistoryFromStatusUsage = true;
  if (/\bto_status\s+appointment_status\s+not\s+null\b/i.test(content)) foundAppointmentStatusHistoryToStatusUsage = true;
  if (/\bcreated_at\s+timestamptz\s+not\s+null\s+default\s+now\s*\(\s*\)/i.test(content)) foundAppointmentStatusHistoryCreatedAt = true;

  if (file === '0019_appointment_cancellations.sql' && /create\s+type\s+appointment_cancellation_actor\s+as\s+enum/i.test(content)) foundAppointmentCancellationActorEnum = true;
  if (file === '0019_appointment_cancellations.sql' && /create\s+type\s+appointment_cancellation_reason\s+as\s+enum/i.test(content)) foundAppointmentCancellationReasonEnum = true;
  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.appointment_cancellations\b/i.test(content)) foundAppointmentCancellationsTable = true;
  if (/\bappointment_id\s+uuid\s+not\s+null\s+references\s+public\.appointments\s*\(\s*id\s*\)/i.test(content)) foundAppointmentCancellationsAppointmentRef = true;
  if (/\bcancelled_by_profile_id\s+uuid\s+null\s+references\s+public\.profiles\s*\(\s*id\s*\)/i.test(content)) foundAppointmentCancellationsProfileRef = true;
  if (/\bcancelled_by_actor\s+appointment_cancellation_actor\s+not\s+null\s+default\s+'unknown'/i.test(content)) foundAppointmentCancellationsActorUsage = true;
  if (/\bcancellation_reason\s+appointment_cancellation_reason\s+not\s+null\s+default\s+'other'/i.test(content)) foundAppointmentCancellationsReasonUsage = true;
  if (/\bcancelled_at\s+timestamptz\s+not\s+null\s+default\s+now\s*\(\s*\)/i.test(content)) foundAppointmentCancellationsCancelledAt = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.appointment_cancellations\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundAppointmentCancellationsUpdatedAtTrigger = true;




  if (file === '0020_reviews.sql' && /create\s+type\s+review_target_type\s+as\s+enum/i.test(content)) foundReviewTargetTypeEnum = true;
  if (file === '0020_reviews.sql' && /create\s+type\s+review_status\s+as\s+enum/i.test(content)) foundReviewStatusEnum = true;
  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.reviews\b/i.test(content)) foundReviewsTable = true;
  if (/\bcenter_id\s+uuid\s+null\s+references\s+public\.centers\s*\(\s*id\s*\)/i.test(content)) foundReviewsCenterRef = true;
  if (/\bdoctor_id\s+uuid\s+null\s+references\s+public\.doctors\s*\(\s*id\s*\)/i.test(content)) foundReviewsDoctorRef = true;
  if (/\bcenter_service_id\s+uuid\s+null\s+references\s+public\.center_services\s*\(\s*id\s*\)/i.test(content)) foundReviewsCenterServiceRef = true;
  if (/\bdoctor_service_id\s+uuid\s+null\s+references\s+public\.doctor_services\s*\(\s*id\s*\)/i.test(content)) foundReviewsDoctorServiceRef = true;
  if (/\bappointment_id\s+uuid\s+null\s+references\s+public\.appointments\s*\(\s*id\s*\)/i.test(content)) foundReviewsAppointmentRef = true;
  if (/\bpatient_contact_id\s+uuid\s+null\s+references\s+public\.patient_contacts\s*\(\s*id\s*\)/i.test(content)) foundReviewsPatientContactRef = true;
  if (/\btarget_type\s+review_target_type\s+not\s+null\b/i.test(content)) foundReviewsTargetTypeUsage = true;
  if (/\bstatus\s+review_status\s+not\s+null\s+default\s+'pending'/i.test(content)) foundReviewsStatusUsage = true;
  if (/\bsource_locale\s+app_locale\s+not\s+null\s+default\s+'en'/i.test(content)) foundReviewsLocaleUsage = true;
  if (/\bconstraint\s+reviews_rating_check\s+check\s*\(\s*rating\s*>?=\s*1\s+and\s+rating\s*<=\s*5\s*\)/i.test(content) || /rating\s+between\s+1\s+and\s+5/i.test(content)) foundReviewsRatingCheck = true;
  if (/\bconstraint\s+reviews_target_presence_check\s+check\s*\([\s\S]*center_id\s+is\s+not\s+null[\s\S]*doctor_id\s+is\s+not\s+null[\s\S]*center_service_id\s+is\s+not\s+null[\s\S]*doctor_service_id\s+is\s+not\s+null[\s\S]*\)/i.test(content)) foundReviewsTargetPresenceCheck = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.reviews\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundReviewsUpdatedAtTrigger = true;

  if (file === '0021_review_reports.sql' && /create\s+type\s+review_report_reason\s+as\s+enum/i.test(content)) foundReviewReportReasonEnum = true;
  if (file === '0021_review_reports.sql' && /create\s+type\s+review_report_status\s+as\s+enum/i.test(content)) foundReviewReportStatusEnum = true;
  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.review_reports\b/i.test(content)) foundReviewReportsTable = true;
  if (/\breview_id\s+uuid\s+not\s+null\s+references\s+public\.reviews\s*\(\s*id\s*\)/i.test(content)) foundReviewReportsReviewRef = true;
  if (/\breported_by_profile_id\s+uuid\s+null\s+references\s+public\.profiles\s*\(\s*id\s*\)/i.test(content) && /\breviewed_by_profile_id\s+uuid\s+null\s+references\s+public\.profiles\s*\(\s*id\s*\)/i.test(content)) foundReviewReportsProfileRef = true;
  if (/\breported_by_patient_contact_id\s+uuid\s+null\s+references\s+public\.patient_contacts\s*\(\s*id\s*\)/i.test(content)) foundReviewReportsPatientContactRef = true;
  if (/\breason\s+review_report_reason\s+not\s+null\s+default\s+'other'/i.test(content)) foundReviewReportsReasonUsage = true;
  if (/\bstatus\s+review_report_status\s+not\s+null\s+default\s+'open'/i.test(content)) foundReviewReportsStatusUsage = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.review_reports\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundReviewReportsUpdatedAtTrigger = true;

  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.doctor_practice_locations\b/i.test(content)) foundDoctorPracticeLocationsTable = true;
  if (/\bdoctor_id\s+uuid\s+not\s+null\s+references\s+public\.doctors\s*\(\s*id\s*\)/i.test(content)) foundDoctorPracticeLocationsDoctorRef = true;
  if (/\bcenter_id\s+uuid\s+not\s+null\s+references\s+public\.centers\s*\(\s*id\s*\)/i.test(content)) foundDoctorPracticeLocationsCenterRef = true;
  if (/\bcenter_location_id\s+uuid\s+null\s+references\s+public\.center_locations\s*\(\s*id\s*\)/i.test(content)) foundDoctorPracticeLocationsCenterLocationRef = true;
  if (/\bprimary_specialty_id\s+uuid\s+null\s+references\s+public\.specialties\s*\(\s*id\s*\)/i.test(content)) foundDoctorPracticeLocationsSpecialtyRef = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.doctor_practice_locations\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundDoctorPracticeLocationsUpdatedAtTrigger = true;

  if (file === '0022_center_type_expansion.sql') {
    if (/alter\s+type\s+center_type\s+add\s+value\s+if\s+not\s+exists\s+'gym'/i.test(content)) foundCenterTypeGym = true;
    if (/alter\s+type\s+center_type\s+add\s+value\s+if\s+not\s+exists\s+'fitness_center'/i.test(content)) foundCenterTypeFitnessCenter = true;
    if (/alter\s+type\s+center_type\s+add\s+value\s+if\s+not\s+exists\s+'spa'/i.test(content)) foundCenterTypeSpa = true;
    if (/alter\s+type\s+center_type\s+add\s+value\s+if\s+not\s+exists\s+'healthy_restaurant'/i.test(content)) foundCenterTypeHealthyRestaurant = true;
    if (/alter\s+type\s+center_type\s+add\s+value\s+if\s+not\s+exists\s+'nutrition_center'/i.test(content)) foundCenterTypeNutritionCenter = true;
    if (/alter\s+type\s+center_type\s+add\s+value\s+if\s+not\s+exists\s+'juice_bar'/i.test(content)) foundCenterTypeJuiceBar = true;
    if (/alter\s+type\s+center_type\s+add\s+value\s+if\s+not\s+exists\s+'meal_plan_provider'/i.test(content)) foundCenterTypeMealPlanProvider = true;
    if (/alter\s+type\s+center_type\s+add\s+value\s+if\s+not\s+exists\s+'home_healthcare'/i.test(content)) foundCenterTypeHomeHealthcare = true;
    if (/alter\s+type\s+center_type\s+add\s+value\s+if\s+not\s+exists\s+'optical_store'/i.test(content)) foundCenterTypeOpticalStore = true;
    if (/alter\s+type\s+center_type\s+add\s+value\s+if\s+not\s+exists\s+'medical_equipment_store'/i.test(content)) foundCenterTypeMedicalEquipmentStore = true;
  }

  if (file === '0023_media_assets.sql' && /create\s+type\s+media_asset_status\s+as\s+enum/i.test(content)) foundMediaAssetStatusEnum = true;
  if (file === '0023_media_assets.sql' && /create\s+type\s+media_asset_source\s+as\s+enum/i.test(content)) foundMediaAssetSourceEnum = true;
  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.media_assets\b/i.test(content)) foundMediaAssetsTable = true;
  if (/\bcreated_by_profile_id\s+uuid\s+null\s+references\s+public\.profiles\s*\(\s*id\s*\)/i.test(content)) foundMediaAssetsProfileRef = true;
  if (/\bstatus\s+media_asset_status\s+not\s+null\s+default\s+'draft'/i.test(content)) foundMediaAssetsStatusUsage = true;
  if (/\bsource\s+media_asset_source\s+not\s+null\s+default\s+'uploaded'/i.test(content)) foundMediaAssetsSourceUsage = true;
  if (/\bstorage_bucket\s+text\s+null\b/i.test(content)) foundMediaAssetsStorageBucket = true;
  if (/\bstorage_path\s+text\s+null\b/i.test(content)) foundMediaAssetsStoragePath = true;
  if (/\bpublic_url\s+text\s+null\b/i.test(content)) foundMediaAssetsPublicUrl = true;
  if (/\bexternal_url\s+text\s+null\b/i.test(content)) foundMediaAssetsExternalUrl = true;
  if (/\bmetadata\s+jsonb\s+not\s+null\s+default\s+'\{\}'::jsonb/i.test(content)) foundMediaAssetsMetadata = true;
  if (/storage_path\s+is\s+not\s+null\s+or\s+public_url\s+is\s+not\s+null\s+or\s+external_url\s+is\s+not\s+null/i.test(content)) foundMediaAssetsLocationCheck = true;
  if ((/file_size_bytes\s+is\s+null\s+or\s+file_size_bytes\s*>=\s*0/i.test(content)) && (/width\s+is\s+null\s+or\s+width\s*>\s*0/i.test(content)) && (/height\s+is\s+null\s+or\s+height\s*>\s*0/i.test(content))) foundMediaAssetsSizeDimensionChecks = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.media_assets\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundMediaAssetsUpdatedAtTrigger = true;

  if (file === '0024_entity_media.sql' && /create\s+type\s+media_entity_type\s+as\s+enum/i.test(content)) foundMediaEntityTypeEnum = true;
  if (file === '0024_entity_media.sql' && /create\s+type\s+media_usage_kind\s+as\s+enum/i.test(content)) foundMediaUsageKindEnum = true;
  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.entity_media\b/i.test(content)) foundEntityMediaTable = true;
  if (/\bmedia_asset_id\s+uuid\s+not\s+null\s+references\s+public\.media_assets\s*\(\s*id\s*\)/i.test(content)) foundEntityMediaMediaAssetRef = true;
  if (/\bentity_type\s+media_entity_type\s+not\s+null\b/i.test(content)) foundEntityMediaEntityTypeUsage = true;
  if (/\busage_kind\s+media_usage_kind\s+not\s+null\s+default\s+'gallery'/i.test(content)) foundEntityMediaUsageKindUsage = true;
  if (/\bentity_id\s+uuid\s+not\s+null\b/i.test(content)) foundEntityMediaEntityId = true;
  if (/\balt_text_en\s+text\s+null\b/i.test(content) && /\balt_text_ar\s+text\s+null\b/i.test(content)) foundEntityMediaAltText = true;
  if (/\bcaption_en\s+text\s+null\b/i.test(content) && /\bcaption_ar\s+text\s+null\b/i.test(content)) foundEntityMediaCaption = true;
  if (/\bis_primary\s+boolean\s+not\s+null\s+default\s+false\b/i.test(content)) foundEntityMediaIsPrimary = true;
  if (/\bsort_order\s+integer\s+not\s+null\s+default\s+0\b/i.test(content)) foundEntityMediaSortOrder = true;
  if (/\bmetadata\s+jsonb\s+not\s+null\s+default\s+'\{\}'::jsonb/i.test(content)) foundEntityMediaMetadata = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.entity_media\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundEntityMediaUpdatedAtTrigger = true;


  if (/create\s+type\s+subscription_plan_status\s+as\s+enum/i.test(content)) foundSubscriptionPlanStatusEnum = true;
  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.subscription_plans\b/i.test(content)) foundSubscriptionPlansTable = true;
  if (/\bstatus\s+subscription_plan_status\s+not\s+null\s+default\s+'draft'/i.test(content)) foundSubscriptionPlansStatusUsage = true;
  if (/\binterval\s+plan_interval\s+not\s+null\s+default\s+'monthly'/i.test(content)) foundSubscriptionPlansIntervalUsage = true;
  if (/\bslug\s+text\s+not\s+null\s+unique\b/i.test(content)) foundSubscriptionPlansSlugUnique = true;
  if (/price_amount[^\n]*check[^\n]*>=\s*0/i.test(content)) foundSubscriptionPlansPriceCheck = true;
  if (/\bcurrency_code\s+text\s+not\s+null\s+default\s+'OMR'/i.test(content)) foundSubscriptionPlansCurrencyDefault = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.subscription_plans\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundSubscriptionPlansUpdatedAtTrigger = true;

  if (/create\s+type\s+center_subscription_status\s+as\s+enum/i.test(content)) foundCenterSubscriptionStatusEnum = true;
  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.center_subscriptions\b/i.test(content)) foundCenterSubscriptionsTable = true;
  if (/center_id\s+uuid\s+not\s+null\s+references\s+public\.centers\s*\(\s*id\s*\)/i.test(content)) foundCenterSubscriptionsCenterRef = true;
  if (/subscription_plan_id\s+uuid\s+not\s+null\s+references\s+public\.subscription_plans\s*\(\s*id\s*\)/i.test(content)) foundCenterSubscriptionsPlanRef = true;
  if (/sales_profile_id\s+uuid\s+null\s+references\s+public\.profiles\s*\(\s*id\s*\)/i.test(content)) foundCenterSubscriptionsProfileRef = true;
  if (/\bstatus\s+center_subscription_status\s+not\s+null\s+default\s+'pending'/i.test(content)) foundCenterSubscriptionsStatusUsage = true;
  if (/\bbilling_interval\s+plan_interval\s+not\s+null\s+default\s+'monthly'/i.test(content)) foundCenterSubscriptionsIntervalUsage = true;
  if (/ends_at[^\n]*>=\s*starts_at/i.test(content) && /trial_ends_at[^\n]*>=\s*starts_at/i.test(content)) foundCenterSubscriptionsDateChecks = true;
  if (/create\s+unique\s+index\s+if\s+not\s+exists\s+uq_center_subscriptions_one_active_like_per_center/i.test(content) && /status\s+in\s*\(\s*'pending'\s*,\s*'active'\s*,\s*'paused'\s*\)/i.test(content) && /deleted_at\s+is\s+null/i.test(content)) foundCenterSubscriptionsPartialUnique = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.center_subscriptions\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundCenterSubscriptionsUpdatedAtTrigger = true;

  if (/create\s+type\s+sponsored_campaign_status\s+as\s+enum/i.test(content)) foundSponsoredCampaignStatusEnum = true;
  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.sponsored_campaigns\b/i.test(content)) foundSponsoredCampaignsTable = true;
  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.sponsored_placements\b/i.test(content)) foundSponsoredPlacementsTable = true;
  if (/center_id\s+uuid\s+not\s+null\s+references\s+public\.centers\s*\(\s*id\s*\)/i.test(content)) foundSponsoredCampaignsCenterRef = true;
  if (/created_by_profile_id\s+uuid\s+null\s+references\s+public\.profiles\s*\(\s*id\s*\)/i.test(content)) foundSponsoredCampaignsProfileRef = true;
  if (/\bstatus\s+sponsored_campaign_status\s+not\s+null\s+default\s+'draft'/i.test(content)) foundSponsoredCampaignsStatusUsage = true;
  if (/campaign_id\s+uuid\s+not\s+null\s+references\s+public\.sponsored_campaigns\s*\(\s*id\s*\)/i.test(content)) foundSponsoredPlacementsCampaignRef = true;
  if (/target_center_id\s+uuid\s+null\s+references\s+public\.centers\s*\(\s*id\s*\)/i.test(content)) foundSponsoredPlacementsCenterRef = true;
  if (/target_doctor_id\s+uuid\s+null\s+references\s+public\.doctors\s*\(\s*id\s*\)/i.test(content)) foundSponsoredPlacementsDoctorRef = true;
  if (/target_center_service_id\s+uuid\s+null\s+references\s+public\.center_services\s*\(\s*id\s*\)/i.test(content)) foundSponsoredPlacementsCenterServiceRef = true;
  if (/target_doctor_service_id\s+uuid\s+null\s+references\s+public\.doctor_services\s*\(\s*id\s*\)/i.test(content)) foundSponsoredPlacementsDoctorServiceRef = true;
  if (/slot_type\s+sponsored_slot_type\s+not\s+null\s+default\s+'sponsored_result'/i.test(content)) foundSponsoredPlacementsSlotTypeUsage = true;
  if (/country_code\s+country_code\s+not\s+null\s+default\s+'om'/i.test(content)) foundSponsoredPlacementsCountryUsage = true;
  if (/locale\s+app_locale\s+null/i.test(content)) foundSponsoredPlacementsLocaleUsage = true;
  if (/target_center_id\s+is\s+not\s+null[\s\S]*target_doctor_id\s+is\s+not\s+null[\s\S]*target_center_service_id\s+is\s+not\s+null[\s\S]*target_doctor_service_id\s+is\s+not\s+null/i.test(content)) foundSponsoredPlacementsTargetCheck = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.sponsored_campaigns\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundSponsoredCampaignsUpdatedAtTrigger = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.sponsored_placements\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundSponsoredPlacementsUpdatedAtTrigger = true;
  if (/create\s+type\s+legal_document_status\s+as\s+enum/i.test(content)) foundLegalDocumentStatusEnum = true;
  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.legal_documents\b/i.test(content)) foundLegalDocumentsTable = true;
  if (/document_type\s+consent_type\s+not\s+null/i.test(content)) foundLegalDocumentsConsentTypeUsage = true;
  if (/status\s+legal_document_status\s+not\s+null\s+default\s+'draft'/i.test(content)) foundLegalDocumentsStatusUsage = true;
  if (/created_by_profile_id\s+uuid\s+references\s+public\.profiles\s*\(\s*id\s*\)/i.test(content) || /created_by_profile_id\s+uuid\s+null\s+references\s+public\.profiles\s*\(\s*id\s*\)/i.test(content)) foundLegalDocumentsProfilesRef = true;
  if (/version\s+text\s+not\s+null/i.test(content)) foundLegalDocumentsVersionNotNull = true;
  if (/title_en\s+text\s+not\s+null/i.test(content)) foundLegalDocumentsTitleEnNotNull = true;
  if (/body_en\s+text\s+not\s+null/i.test(content)) foundLegalDocumentsBodyEnNotNull = true;
  if (/create\s+unique\s+index[\s\S]*on\s+public\.legal_documents\s*\(\s*document_type\s*,\s*version\s*\)[\s\S]*where\s+deleted_at\s+is\s+null/i.test(content)) foundLegalDocumentsPartialUnique = true;
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.legal_documents\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundLegalDocumentsUpdatedAtTrigger = true;

  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.consent_logs\b/i.test(content)) foundConsentLogsTable = true;
  if (/consent_type\s+consent_type\s+not\s+null/i.test(content)) foundConsentLogsConsentTypeUsage = true;
  if (/legal_document_id\s+uuid\s+references\s+public\.legal_documents\s*\(\s*id\s*\)/i.test(content) || /legal_document_id\s+uuid\s+null\s+references\s+public\.legal_documents\s*\(\s*id\s*\)/i.test(content)) foundConsentLogsLegalDocumentRef = true;
  if (/profile_id\s+uuid\s+references\s+public\.profiles\s*\(\s*id\s*\)/i.test(content) || /profile_id\s+uuid\s+null\s+references\s+public\.profiles\s*\(\s*id\s*\)/i.test(content)) foundConsentLogsProfilesRef = true;
  if (/patient_contact_id\s+uuid\s+references\s+public\.patient_contacts\s*\(\s*id\s*\)/i.test(content) || /patient_contact_id\s+uuid\s+null\s+references\s+public\.patient_contacts\s*\(\s*id\s*\)/i.test(content)) foundConsentLogsPatientContactsRef = true;
  if (/locale\s+app_locale\s+not\s+null\s+default\s+'en'/i.test(content)) foundConsentLogsLocaleUsage = true;
  if (/country_code\s+country_code\s+not\s+null\s+default\s+'om'/i.test(content)) foundConsentLogsCountryCodeUsage = true;
  if (/consented_at\s+timestamptz\s+not\s+null\s+default\s+now\s*\(\s*\)/i.test(content)) foundConsentLogsConsentedAt = true;
  if (/profile_id\s+is\s+not\s+null[\s\S]*patient_contact_id\s+is\s+not\s+null[\s\S]*anonymous_id/i.test(content)) foundConsentLogsIdentityCheck = true;

  if (/\bcreate\s+table\s+(if\s+not\s+exists\s+)?public\.audit_logs\b/i.test(content)) foundAuditLogsTable = true;
  if (/actor_type\s+audit_actor_type\s+not\s+null\s+default\s+'system'/i.test(content)) foundAuditLogsActorTypeUsage = true;
  if (/action_type\s+audit_action_type\s+not\s+null/i.test(content)) foundAuditLogsActionTypeUsage = true;
  if (/actor_profile_id\s+uuid\s+references\s+public\.profiles\s*\(\s*id\s*\)/i.test(content) || /actor_profile_id\s+uuid\s+null\s+references\s+public\.profiles\s*\(\s*id\s*\)/i.test(content)) foundAuditLogsProfilesRef = true;
  if (/entity_type\s+text\s+not\s+null/i.test(content)) foundAuditLogsEntityTypeNotNull = true;
  if (/created_at\s+timestamptz\s+not\s+null\s+default\s+now\s*\(\s*\)/i.test(content)) foundAuditLogsCreatedAt = true;

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
if (!foundAppointmentStatusHistoryTable) { console.error(`ERROR: Phase ${PHASE} requires CREATE TABLE public.appointment_status_history in 0018_appointment_status_history.sql.`); process.exit(1); }
if (!foundAppointmentStatusHistoryAppointmentRef || !foundAppointmentStatusHistoryChangedByProfileRef) { console.error(`ERROR: Phase ${PHASE} requires appointment_status_history references to public.appointments(id) and public.profiles(id).`); process.exit(1); }
if (!foundAppointmentStatusHistoryFromStatusUsage || !foundAppointmentStatusHistoryToStatusUsage) { console.error(`ERROR: Phase ${PHASE} requires appointment_status_history from_status/to_status to use appointment_status enum.`); process.exit(1); }
if (!foundAppointmentStatusHistoryCreatedAt) { console.error(`ERROR: Phase ${PHASE} requires appointment_status_history.created_at timestamptz not null default now().`); process.exit(1); }
if (!foundAppointmentCancellationActorEnum || !foundAppointmentCancellationReasonEnum) { console.error(`ERROR: Phase ${PHASE} requires create type appointment_cancellation_actor and appointment_cancellation_reason as enum in 0019_appointment_cancellations.sql.`); process.exit(1); }
if (!foundAppointmentCancellationsTable) { console.error(`ERROR: Phase ${PHASE} requires CREATE TABLE public.appointment_cancellations in 0019_appointment_cancellations.sql.`); process.exit(1); }
if (!foundAppointmentCancellationsAppointmentRef || !foundAppointmentCancellationsProfileRef) { console.error(`ERROR: Phase ${PHASE} requires appointment_cancellations references to public.appointments(id) and public.profiles(id).`); process.exit(1); }
if (!foundAppointmentCancellationsActorUsage || !foundAppointmentCancellationsReasonUsage) { console.error(`ERROR: Phase ${PHASE} requires appointment_cancellations enum usage for cancelled_by_actor and cancellation_reason.`); process.exit(1); }
if (!foundAppointmentCancellationsCancelledAt) { console.error(`ERROR: Phase ${PHASE} requires appointment_cancellations.cancelled_at timestamptz not null default now().`); process.exit(1); }
if (!foundAppointmentCancellationsUpdatedAtTrigger) { console.error(`ERROR: Phase ${PHASE} requires appointment_cancellations BEFORE UPDATE trigger using public.set_updated_at().`); process.exit(1); }




if (!foundReviewTargetTypeEnum || !foundReviewStatusEnum) { console.error(`ERROR: Phase ${PHASE} requires create type review_target_type and review_status as enum in 0020_reviews.sql.`); process.exit(1); }
if (!foundReviewsTable) { console.error(`ERROR: Phase ${PHASE} requires CREATE TABLE public.reviews in 0020_reviews.sql.`); process.exit(1); }
if (!foundReviewsCenterRef || !foundReviewsDoctorRef || !foundReviewsCenterServiceRef || !foundReviewsDoctorServiceRef || !foundReviewsAppointmentRef || !foundReviewsPatientContactRef) { console.error(`ERROR: Phase ${PHASE} requires reviews references to centers, doctors, center_services, doctor_services, appointments, and patient_contacts.`); process.exit(1); }
if (!foundReviewsTargetTypeUsage || !foundReviewsStatusUsage || !foundReviewsLocaleUsage) { console.error(`ERROR: Phase ${PHASE} requires reviews enum usage for review_target_type, review_status, and app_locale.`); process.exit(1); }
if (!foundReviewsRatingCheck) { console.error(`ERROR: Phase ${PHASE} requires reviews rating safe check between 1 and 5.`); process.exit(1); }
if (!foundReviewsTargetPresenceCheck) { console.error(`ERROR: Phase ${PHASE} requires reviews target presence check for center_id/doctor_id/center_service_id/doctor_service_id.`); process.exit(1); }
if (!foundReviewsUpdatedAtTrigger) { console.error(`ERROR: Phase ${PHASE} requires reviews BEFORE UPDATE trigger using public.set_updated_at().`); process.exit(1); }

if (!foundReviewReportReasonEnum || !foundReviewReportStatusEnum) { console.error(`ERROR: Phase ${PHASE} requires create type review_report_reason and review_report_status as enum in 0021_review_reports.sql.`); process.exit(1); }
if (!foundReviewReportsTable) { console.error(`ERROR: Phase ${PHASE} requires CREATE TABLE public.review_reports in 0021_review_reports.sql.`); process.exit(1); }
if (!foundReviewReportsReviewRef || !foundReviewReportsProfileRef || !foundReviewReportsPatientContactRef) { console.error(`ERROR: Phase ${PHASE} requires review_reports references to reviews, profiles, and patient_contacts.`); process.exit(1); }
if (!foundReviewReportsReasonUsage || !foundReviewReportsStatusUsage) { console.error(`ERROR: Phase ${PHASE} requires review_reports enum usage for review_report_reason and review_report_status.`); process.exit(1); }
if (!foundReviewReportsUpdatedAtTrigger) { console.error(`ERROR: Phase ${PHASE} requires review_reports BEFORE UPDATE trigger using public.set_updated_at().`); process.exit(1); }


if (!foundLegalDocumentStatusEnum) { console.error(`ERROR: Phase ${PHASE} requires create type legal_document_status as enum in 0028_legal_documents.sql.`); process.exit(1); }
if (!foundLegalDocumentsTable || !foundLegalDocumentsConsentTypeUsage || !foundLegalDocumentsStatusUsage || !foundLegalDocumentsProfilesRef || !foundLegalDocumentsVersionNotNull || !foundLegalDocumentsTitleEnNotNull || !foundLegalDocumentsBodyEnNotNull || !foundLegalDocumentsPartialUnique || !foundLegalDocumentsUpdatedAtTrigger) { console.error(`ERROR: Phase ${PHASE} requires complete legal_documents enum/table/references/constraints/partial-unique/trigger foundation.`); process.exit(1); }
if (!foundConsentLogsTable || !foundConsentLogsConsentTypeUsage || !foundConsentLogsLegalDocumentRef || !foundConsentLogsProfilesRef || !foundConsentLogsPatientContactsRef || !foundConsentLogsLocaleUsage || !foundConsentLogsCountryCodeUsage || !foundConsentLogsConsentedAt || !foundConsentLogsIdentityCheck) { console.error(`ERROR: Phase ${PHASE} requires complete consent_logs table/references/enum usage/consented_at/identity check foundation.`); process.exit(1); }
if (!foundAuditLogsTable || !foundAuditLogsActorTypeUsage || !foundAuditLogsActionTypeUsage || !foundAuditLogsProfilesRef || !foundAuditLogsEntityTypeNotNull || !foundAuditLogsCreatedAt) { console.error(`ERROR: Phase ${PHASE} requires complete audit_logs table/references/enum usage/entity_type/created_at foundation.`); process.exit(1); }

if (!foundCenterTypeGym || !foundCenterTypeFitnessCenter || !foundCenterTypeSpa || !foundCenterTypeHealthyRestaurant || !foundCenterTypeNutritionCenter || !foundCenterTypeJuiceBar || !foundCenterTypeMealPlanProvider || !foundCenterTypeHomeHealthcare || !foundCenterTypeOpticalStore || !foundCenterTypeMedicalEquipmentStore) { console.error(`ERROR: Phase ${PHASE} requires 0022_center_type_expansion.sql ALTER TYPE center_type ADD VALUE IF NOT EXISTS for all required values.`); process.exit(1); }
if (!foundMediaAssetStatusEnum || !foundMediaAssetSourceEnum || !foundMediaAssetsTable || !foundMediaAssetsProfileRef || !foundMediaAssetsStatusUsage || !foundMediaAssetsSourceUsage || !foundMediaAssetsStorageBucket || !foundMediaAssetsStoragePath || !foundMediaAssetsPublicUrl || !foundMediaAssetsExternalUrl || !foundMediaAssetsMetadata || !foundMediaAssetsLocationCheck || !foundMediaAssetsSizeDimensionChecks || !foundMediaAssetsUpdatedAtTrigger) { console.error(`ERROR: Phase ${PHASE} requires complete media_assets enum/table/constraint/trigger foundation.`); process.exit(1); }
if (!foundMediaEntityTypeEnum || !foundMediaUsageKindEnum || !foundEntityMediaTable || !foundEntityMediaMediaAssetRef || !foundEntityMediaEntityTypeUsage || !foundEntityMediaUsageKindUsage || !foundEntityMediaEntityId || !foundEntityMediaAltText || !foundEntityMediaCaption || !foundEntityMediaIsPrimary || !foundEntityMediaSortOrder || !foundEntityMediaMetadata || !foundEntityMediaUpdatedAtTrigger) { console.error(`ERROR: Phase ${PHASE} requires complete entity_media enum/table/trigger foundation.`); process.exit(1); }

if (!foundSubscriptionPlanStatusEnum || !foundSubscriptionPlansTable || !foundSubscriptionPlansStatusUsage || !foundSubscriptionPlansIntervalUsage || !foundSubscriptionPlansSlugUnique || !foundSubscriptionPlansPriceCheck || !foundSubscriptionPlansCurrencyDefault || !foundSubscriptionPlansUpdatedAtTrigger) { console.error(`ERROR: Phase ${PHASE} requires complete subscription_plans enum/table/constraints/trigger foundation.`); process.exit(1); }
if (!foundCenterSubscriptionStatusEnum || !foundCenterSubscriptionsTable || !foundCenterSubscriptionsCenterRef || !foundCenterSubscriptionsPlanRef || !foundCenterSubscriptionsProfileRef || !foundCenterSubscriptionsStatusUsage || !foundCenterSubscriptionsIntervalUsage || !foundCenterSubscriptionsDateChecks || !foundCenterSubscriptionsPartialUnique || !foundCenterSubscriptionsUpdatedAtTrigger) { console.error(`ERROR: Phase ${PHASE} requires complete center_subscriptions enum/table/references/constraints/partial-unique/trigger foundation.`); process.exit(1); }
requireCondition(foundSponsoredCampaignStatusEnum && foundSponsoredCampaignsTable && foundSponsoredPlacementsTable && foundSponsoredCampaignsCenterRef && foundSponsoredCampaignsProfileRef && foundSponsoredCampaignsStatusUsage && foundSponsoredPlacementsCampaignRef && foundSponsoredPlacementsCenterRef && foundSponsoredPlacementsDoctorRef && foundSponsoredPlacementsCenterServiceRef && foundSponsoredPlacementsDoctorServiceRef && foundSponsoredPlacementsSlotTypeUsage && foundSponsoredPlacementsCountryUsage && foundSponsoredPlacementsLocaleUsage && foundSponsoredPlacementsTargetCheck && foundSponsoredCampaignsUpdatedAtTrigger && foundSponsoredPlacementsUpdatedAtTrigger, 'requires complete sponsored_campaigns/sponsored_placements enum/table/references/constraints/trigger foundation.');

console.log(`Phase ${PHASE} migration validation passed.`);
console.log(`Validated files: ${required.join(', ')}`);
