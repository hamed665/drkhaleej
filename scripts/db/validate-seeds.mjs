#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const dir = 'supabase/seed';
const expectedSeedFile = '0001_taxonomy_verticals_center_categories.sql';
const expectedVerticalSlugs = [
  'medical',
  'dental',
  'aesthetic',
  'diagnostics',
  'pharmacy',
  'wellness',
  'fitness',
  'nutrition',
  'home_care',
  'rehabilitation',
  'mental_health',
  'optical_eye_care',
  'veterinary',
  'healthy_food',
  'other_health',
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
  sqlFiles.length === 1 && sqlFiles[0] === expectedSeedFile,
  `TAX-SEED-B allows exactly one SQL seed file: ${expectedSeedFile}. Found: ${sqlFiles.join(', ') || '(none)'}`,
);

const content = readFileSync(path.join(dir, expectedSeedFile), 'utf8');

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
  forbidPattern(content, pattern, message);
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
  requirePattern(content, pattern, message);
}

for (const slug of expectedVerticalSlugs) {
  requirePattern(
    content,
    new RegExp(`'${slug}'`, 'i'),
    `Missing expected vertical slug in seed: ${slug}`,
  );
}

for (const slug of expectedCategorySlugs) {
  requirePattern(
    content,
    new RegExp(`'${slug}'`, 'i'),
    `Missing expected category slug in seed: ${slug}`,
  );
}

for (const disabledSlug of ['veterinary', 'healthy_food', 'pet-clinic', 'veterinary-clinic', 'healthy-restaurant', 'healthy-cafe']) {
  requirePattern(
    content,
    new RegExp(`'${disabledSlug}'[\\s\\S]*?false[\\s\\S]*?false[\\s\\S]*?false`, 'i'),
    `Disabled taxonomy seed must keep ${disabledSlug} inactive/non-public.`,
  );
}

console.log('Seed protocol validated.');
console.log(`Approved TAX-SEED-B SQL seed file found: ${expectedSeedFile}`);
