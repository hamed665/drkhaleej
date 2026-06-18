#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const dir = 'supabase/seed';
const expectedSeedFiles = [
  '0000_oman_geo_foundation.sql',
  '0001_taxonomy_verticals_center_categories.sql',
  '0002_geo_regions_c3_north_africa.sql',
  '0003_geo_cities_d1a_oman.sql',
  '0004_geo_cities_d1b_gulf.sql',
];
const taxonomySeedFile = '0001_taxonomy_verticals_center_categories.sql';
const geoSeedFiles = [
  '0000_oman_geo_foundation.sql',
  '0002_geo_regions_c3_north_africa.sql',
  '0003_geo_cities_d1a_oman.sql',
  '0004_geo_cities_d1b_gulf.sql',
];
const expectedVerticalSlugs = [
  'medical',
  'dental',
  'aesthetic',
  'diagnostics',
  'pharmacy',
  'wellness',
  'fitness',
  'nutrition',
  'home-care',
  'rehabilitation',
  'mental-health',
  'optical-eye-care',
  'veterinary',
  'healthy-food',
  'other-health',
];
const expectedCategorySlugs = [
  'clinic',
  'hospital',
  'medical-center',
  'dental-clinic',
  'aesthetic-clinic',
  'dermatology-clinic',
  'medical-laboratory',
  'imaging-center',
  'pharmacy',
  'wellness-center',
  'spa-wellness',
  'gym-fitness-center',
  'nutrition-center',
  'dietitian-clinic',
  'home-healthcare',
  'physiotherapy-center',
  'rehabilitation-center',
  'psychology-clinic',
  'psychiatry-clinic',
  'eye-clinic',
  'optical-store',
  'pet-clinic',
  'veterinary-clinic',
  'healthy-restaurant',
  'healthy-cafe',
  'other-health-service',
];

function fail(message) {
  console.error(`ERROR: ${message}`);
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

function readSeed(fileName) {
  return readFileSync(path.join(dir, fileName), 'utf8');
}

try {
  if (!statSync(dir).isDirectory()) {
    throw new Error(`${dir} is not a directory`);
  }
} catch (error) {
  console.error(`ERROR: Missing required directory: ${dir}`);
  console.error(`Details: ${error.message}`);
  process.exit(1);
}

const sqlFiles = readdirSync(dir).filter((name) => name.endsWith('.sql')).sort();
requireCondition(
  JSON.stringify(sqlFiles) === JSON.stringify(expectedSeedFiles),
  `Allowed seed SQL files are exactly: ${expectedSeedFiles.join(', ')}. Found: ${sqlFiles.join(', ') || '(none)'}`,
);

const geoContent = geoSeedFiles.map(readSeed).join('\n');
const taxonomyContent = readSeed(taxonomySeedFile);
const allContent = `${geoContent}\n${taxonomyContent}`;

for (const [pattern, message] of [
  [/\binsert\s+into\s+public\.centers\b/i, 'Seed must not insert centers.'],
  [/\bupdate\s+public\.centers\b/i, 'Seed must not update centers.'],
  [/\binsert\s+into\s+public\.doctors\b/i, 'Seed must not insert doctors.'],
  [/\bupdate\s+public\.doctors\b/i, 'Seed must not update doctors.'],
  [/\binsert\s+into\s+public\.reviews\b/i, 'Seed must not insert reviews.'],
  [/\bratings?\b/i, 'Seed must not include ratings.'],
  [/\binsurance\b/i, 'Seed must not include insurance data.'],
  [/\blicense_authorities\b/i, 'Seed must not include license authority data.'],
  [/\bprovider_onboarding_leads\b/i, 'Seed must not touch provider onboarding leads.'],
  [/\bmedia_assets\b/i, 'Seed must not touch media assets.'],
  [/\bsponsored_campaigns\b/i, 'Seed must not touch sponsored campaigns.'],
  [/\bai\b/i, 'Seed must not include AI scope.'],
  [/\bcreate\s+policy\b/i, 'Seed must not create policies.'],
  [/\balter\s+table\b/i, 'Seed must not alter tables.'],
  [/\bcreate\s+table\b/i, 'Seed must not create tables.'],
  [/\bdrop\b/i, 'Seed must not drop objects.'],
]) {
  forbidPattern(allContent, pattern, message);
}

for (const [pattern, message] of [
  [/insert\s+into\s+public\.geo_countries/i, 'Geo seed must insert countries.'],
  [/insert\s+into\s+public\.geo_regions/i, 'Geo seed must insert regions.'],
  [/insert\s+into\s+public\.geo_cities/i, 'Geo seed must insert cities.'],
  [/insert\s+into\s+public\.geo_areas/i, 'Geo seed must insert areas.'],
  [/'oman'/i, 'Geo seed must include Oman.'],
  [/'muscat-governorate'/i, 'Geo seed must include Muscat Governorate.'],
  [/'muscat'/i, 'Geo seed must include Muscat.'],
  [/'al-khuwair'/i, 'Geo seed must include Al Khuwair.'],
  [/'casablanca-settat'/i, 'GEO-FULL-C3 seed must include Casablanca-Settat.'],
  [/'algiers-province'/i, 'GEO-FULL-C3 seed must include Algiers Province.'],
  [/'tunis-governorate'/i, 'GEO-FULL-C3 seed must include Tunis Governorate.'],
  [/'tripoli-district'/i, 'GEO-FULL-C3 seed must include Tripoli District.'],
  [/'khartoum-state'/i, 'GEO-FULL-C3 seed must include Khartoum State.'],
  [/'nouakchott-nord-region'/i, 'GEO-FULL-C3 seed must include Nouakchott-Nord.'],
  [/'jabal-akhdar'/i, 'GEO-FULL-D1A seed must include Jabal Akhdar.'],
  [/'sinaw'/i, 'GEO-FULL-D1A seed must include Sinaw.'],
  [/'sohar'/i, 'GEO-FULL-D1A seed must include Sohar.'],
  [/'salalah'/i, 'GEO-FULL-D1A seed must include Salalah.'],
  [/'shalim-and-the-hallaniyat-islands'/i, 'GEO-FULL-D1A seed must include Shalim and the Hallaniyat Islands.'],
  [/'abu-dhabi'/i, 'GEO-FULL-D1B seed must include Abu Dhabi.'],
  [/'al-ain'/i, 'GEO-FULL-D1B seed must include Al Ain.'],
  [/'dubai'/i, 'GEO-FULL-D1B seed must include Dubai.'],
  [/'doha'/i, 'GEO-FULL-D1B seed must include Doha.'],
  [/'lusail'/i, 'GEO-FULL-D1B seed must include Lusail.'],
  [/'manama'/i, 'GEO-FULL-D1B seed must include Manama.'],
  [/'kuwait-city'/i, 'GEO-FULL-D1B seed must include Kuwait City.'],
  [/'salmiya'/i, 'GEO-FULL-D1B seed must include Salmiya.'],
]) {
  requirePattern(geoContent, pattern, message);
}

for (const [pattern, message] of [
  [/with\s+vertical_seed\s*\(/i, 'Seed must define vertical_seed CTE.'],
  [/insert\s+into\s+public\.healthcare_verticals/i, 'Seed must insert healthcare_verticals.'],
  [/update\s+public\.healthcare_verticals/i, 'Seed must update existing healthcare_verticals idempotently.'],
  [/with\s+category_seed\s*\(/i, 'Seed must define category_seed CTE.'],
  [/insert\s+into\s+public\.center_categories/i, 'Seed must insert center_categories.'],
  [/update\s+public\.center_categories/i, 'Seed must update existing center_categories idempotently.'],
  [/jsonb_build_object\s*\(\s*'seed_key'/i, 'Seed must mark seed metadata.'],
  [/schema_org_hint\s*=\s*null/i, 'Seed must keep schema_org_hint null.'],
  [/where\s+not\s+exists/i, 'Seed must use WHERE NOT EXISTS for idempotent inserts.'],
  [/join\s+public\.healthcare_verticals\s+verticals/i, 'Category seed must resolve verticals by slug.'],
]) {
  requirePattern(taxonomyContent, pattern, message);
}

for (const slug of expectedVerticalSlugs) {
  requirePattern(taxonomyContent, new RegExp(`'${slug}'`, 'i'), `Missing expected vertical slug in seed: ${slug}`);
}

for (const slug of expectedCategorySlugs) {
  requirePattern(taxonomyContent, new RegExp(`'${slug}'`, 'i'), `Missing expected category slug in seed: ${slug}`);
}

for (const disabledSlug of ['veterinary', 'healthy-food', 'pet-clinic', 'veterinary-clinic', 'healthy-restaurant', 'healthy-cafe']) {
  requirePattern(
    taxonomyContent,
    new RegExp(`'${disabledSlug}'[\\s\\S]*?false[\\s\\S]*?false[\\s\\S]*?false`, 'i'),
    `Disabled taxonomy seed must keep ${disabledSlug} inactive/non-public.`,
  );
}

for (const underscoreSlug of ['home_care', 'mental_health', 'optical_eye_care', 'healthy_food', 'other_health']) {
  forbidPattern(taxonomyContent, new RegExp(`'${underscoreSlug}'`, 'i'), `Seed must not use underscore slug: ${underscoreSlug}`);
}

console.log('Seed protocol validated.');
console.log(`Approved seed files found: ${expectedSeedFiles.join(', ')}`);
