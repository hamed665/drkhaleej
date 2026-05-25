#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';

const required = [
  '0001_extensions.sql',
  '0002_enums.sql',
  '0003_profiles_auth.sql',
  '0004_geo.sql',
  '0005_taxonomy.sql',
  '0006_centers.sql',
  '0007_center_locations.sql'
];

const dir = 'supabase/migrations';

const requiredEnumChecks = [
  {
    file: '0002_enums.sql',
    regex: /create\s+type\s+center_type\s+as\s+enum/i,
    message: 'Phase 2.4B requires create type center_type as enum in 0002_enums.sql.'
  }
];

const forbiddenPatterns = [
  { regex: /\bpostgis\b/i, message: 'postgis is deferred and forbidden in Phase 2.4B.' },
  { regex: /\bgeometry\b/i, message: 'geometry is forbidden in Phase 2.4B.' },
  { regex: /\bgeography\b/i, message: 'geography is forbidden in Phase 2.4B.' },
  { regex: /\bcreate\s+policy\b/i, message: 'CREATE POLICY is forbidden in Phase 2.4B.' },
  { regex: /\benable\s+row\s+level\s+security\b/i, message: 'ENABLE ROW LEVEL SECURITY is forbidden in Phase 2.4B.' },
  { regex: /\binsert\s+into\b/i, message: 'INSERT INTO is forbidden in Phase 2.4B.' },
  { regex: /\bdrop\b/i, message: 'DROP statements are forbidden in Phase 2.4B.' }
];

const forbiddenTables = [
  'center_services',
  'center_owners',
  'provider_locations',
  'center_location_mappings',
  'providers',
  'doctors',
  'doctor_practice_locations',
  'appointments',
  'appointment_slots',
  'insurance',
  'pricing',
  'legal_documents',
  'consent_logs',
  'behavior_events',
  'sponsored_slots',
  'audit_logs'
];

const allowedGeoTables = ['geo_countries', 'geo_regions', 'geo_cities', 'geo_areas'];
const allowedTaxonomyTables = ['taxonomy_groups', 'service_categories', 'services', 'specialties'];

try {
  if (!statSync(dir).isDirectory()) throw new Error(`${dir} is not a directory`);
} catch (error) {
  console.error(`ERROR: Missing required directory: ${dir}`);
  console.error(`Details: ${error.message}`);
  process.exit(1);
}

const files = readdirSync(dir).filter((name) => name.endsWith('.sql')).sort();

if (files.join('|') !== required.join('|')) {
  console.error('ERROR: Phase 2.4B requires exactly these migration files:');
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

const createdGeoTables = new Set();
const createdTaxonomyTables = new Set();

for (const file of files) {
  const content = readFileSync(`${dir}/${file}`, 'utf8');

  for (const rule of forbiddenPatterns) {
    if (rule.regex.test(content)) {
      console.error(`ERROR: ${file} violates Phase 2.4B rule: ${rule.message}`);
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
    const tableRegex = new RegExp(`\\b${table}\\b`, 'i');

    if (tableRegex.test(content)) {
      console.error(`ERROR: ${file} references forbidden table for Phase 2.4B: ${table}`);
      process.exit(1);
    }
  }

  for (const table of allowedGeoTables) {
    const createRegex = new RegExp(`\\bcreate\\s+table\\s+(if\\s+not\\s+exists\\s+)?public\\.${table}\\b`, 'i');
    if (createRegex.test(content)) createdGeoTables.add(table);
  }

  for (const table of allowedTaxonomyTables) {
    const createRegex = new RegExp(`\\bcreate\\s+table\\s+(if\\s+not\\s+exists\\s+)?public\\.${table}\\b`, 'i');
    if (createRegex.test(content)) createdTaxonomyTables.add(table);
  }

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
  if (
    /latitude\s+is\s+null\s+or\s*\(\s*latitude\s*>=\s*-90\s+and\s+latitude\s*<=\s*90\s*\)/i.test(content) ||
    /\bconstraint\s+center_locations_latitude_range_check\b/i.test(content)
  ) {
    foundLatitudeRangeCheck = true;
  }
  if (
    /longitude\s+is\s+null\s+or\s*\(\s*longitude\s*>=\s*-180\s+and\s+longitude\s*<=\s*180\s*\)/i.test(content) ||
    /\bconstraint\s+center_locations_longitude_range_check\b/i.test(content)
  ) {
    foundLongitudeRangeCheck = true;
  }
  if (/\bcreate\s+trigger\b[\s\S]*\bbefore\s+update\s+on\s+public\.center_locations\b[\s\S]*\bexecute\s+function\s+public\.set_updated_at\s*\(\s*\)/i.test(content)) foundCenterLocationsUpdatedAtTrigger = true;
}

if (!foundProfilesTable) {
  console.error('ERROR: Phase 2.4B requires CREATE TABLE public.profiles from 0003_profiles_auth.sql.');
  process.exit(1);
}

if (foundSetUpdatedAtFunction && !foundProfilesUpdatedAtTrigger) {
  console.error('ERROR: public.set_updated_at() is only allowed when used by a trigger on public.profiles.updated_at.');
  process.exit(1);
}

if (!foundCentersTable) {
  console.error('ERROR: Phase 2.4B requires CREATE TABLE public.centers from 0006_centers.sql.');
  process.exit(1);
}

if (!foundCentersUpdatedAtTrigger) {
  console.error('ERROR: Phase 2.4B requires a BEFORE UPDATE trigger on public.centers using public.set_updated_at().');
  process.exit(1);
}

if (centersCenterTypeUsesProviderStatus) {
  console.error('ERROR: Phase 2.4B forbids `center_type provider_status`; center_type must use the canonical center_type enum from 0002_enums.sql.');
  process.exit(1);
}

if (!foundCenterLocationsTable) {
  console.error('ERROR: Phase 2.4B requires CREATE TABLE public.center_locations in 0007_center_locations.sql.');
  process.exit(1);
}

if (!foundCenterReference || !foundCountryReference || !foundRegionReference || !foundCityReference || !foundAreaReference) {
  console.error('ERROR: Phase 2.4B requires center_locations references to centers, geo_countries, geo_regions, geo_cities, and geo_areas.');
  process.exit(1);
}

if (!foundLatitudeNumeric || !foundLongitudeNumeric || !foundLatitudeRangeCheck || !foundLongitudeRangeCheck) {
  console.error('ERROR: Phase 2.4B requires latitude/longitude numeric(9,6) with safe range checks.');
  process.exit(1);
}

if (!foundCenterLocationsUpdatedAtTrigger) {
  console.error('ERROR: Phase 2.4B requires a BEFORE UPDATE trigger on public.center_locations using public.set_updated_at().');
  process.exit(1);
}

for (const table of allowedGeoTables) {
  if (!createdGeoTables.has(table)) {
    console.error(`ERROR: Phase 2.4B requires CREATE TABLE public.${table}.`);
    process.exit(1);
  }
}

for (const table of allowedTaxonomyTables) {
  if (!createdTaxonomyTables.has(table)) {
    console.error(`ERROR: Phase 2.4B requires CREATE TABLE public.${table}.`);
    process.exit(1);
  }
}

console.log('Phase 2.4B migration validation passed.');
console.log(`Validated files: ${required.join(', ')}`);
