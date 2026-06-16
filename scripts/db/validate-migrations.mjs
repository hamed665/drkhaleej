#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';

const PHASE = 'PLAN-A';

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
  '0054_plan_a_subscription_plan_catalog.sql'
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
  'appointment_payments',
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
  ,
  'appointment_reminders',
  'provider_wallets',
  'payouts',
  'webhook_events'
];

const allowedGeoTables = ['geo_countries', 'geo_regions', 'geo_cities', 'geo_areas'];
const allowedTaxonomyTables = ['taxonomy_groups', 'service_categories', 'services', 'specialties'];
const allowedOwnershipTables = ['center_claims', 'center_memberships'];
const allowedDoctorTables = ['doctors', 'doctor_services', 'doctor_schedules', 'doctor_schedule_exceptions', 'appointment_slots'];

const rlsPolicyFiles = new Set([
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
  '0051_landing_page_contents.sql',
  '0052_review_companion_tables.sql',
  '0053_provider_onboarding_lead_events.sql'
]);
const catalogRlsPolicyFile = '0032_rls_public_catalog_read_policies.sql';
const profilesRlsPolicyFile = '0033_profiles_rls.sql';
const centerAccessHelpersFile = '0034_center_access_helpers.sql';
const centerClaimsMembershipsRlsFile = '0035_center_claims_memberships_rls.sql';
const helperFunctionFile = '0031_rls_auth_helpers.sql';

const patientContactsProfileLinkFile = '0036_patient_contacts_profile_link.sql';
const patientAppointmentAccessHelpersFile = '0037_patient_appointment_access_helpers.sql';
const patientContactsAppointmentsRlsFile = '0038_patient_contacts_appointments_rls.sql';
const reviewMediaAccessHelpersFile = '0039_review_media_access_helpers.sql';
const reviewsReportsMediaPrivateRlsFile = '0040_reviews_reports_media_private_rls.sql';
const monetizationAccessHelpersFile = '0041_monetization_access_helpers.sql';
const monetizationSponsoredRlsFile = '0042_monetization_sponsored_rls.sql';
const legalConsentAuditAccessHelpersFile = '0043_legal_consent_audit_access_helpers.sql';
const legalConsentAuditRlsFile = '0044_legal_consent_audit_rls.sql';

const contactVisibilityFoundationFile = '0045_contact_visibility_foundation.sql';
const callbackRequestFoundationFile = '0046_callback_request_foundation.sql';
const providerLicenseVerificationFoundationFile = '0047_provider_license_verification_foundation.sql';
const mediaPublicVisibilityHardeningFile = '0048_media_public_visibility_hardening.sql';
const mediaPublicRlsHardeningFile = '0049_media_public_rls_hardening.sql';
const providerOnboardingLeadsFile = '0050_provider_onboarding_leads.sql';
const landingPageContentsFile = '0051_landing_page_contents.sql';
const providerOnboardingLeadEventsFile = '0053_provider_onboarding_lead_events.sql';
const createPolicyPattern = /\bcreate\s+policy\b/i;
const enableRlsPattern = /\benable\s+row\s+level\s+security\b/i;

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