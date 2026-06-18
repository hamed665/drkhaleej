#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const seedDir = path.join(repoRoot, 'supabase', 'seed');
const packageJsonPath = path.join(repoRoot, 'package.json');
const expectedSeedFiles = [
  '0000_oman_geo_foundation.sql',
  '0001_taxonomy_verticals_center_categories.sql',
  '0002_geo_regions_c3_north_africa.sql',
];
const geoSeedFiles = [
  '0000_oman_geo_foundation.sql',
  '0002_geo_regions_c3_north_africa.sql',
];
const taxonomySeedFile = '0001_taxonomy_verticals_center_categories.sql';

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function assert(cond, message) {
  if (!cond) fail(message);
}

function walkForSql(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const sqlFiles = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      sqlFiles.push(...walkForSql(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.sql')) {
      sqlFiles.push(path.relative(repoRoot, fullPath));
    }
  }

  return sqlFiles.sort();
}

if (!statSync(seedDir).isDirectory()) {
  fail(`Missing seed directory: ${seedDir}`);
}

const allSqlUnderSeed = walkForSql(seedDir);
const expectedRelativePaths = expectedSeedFiles.map((fileName) => `supabase/seed/${fileName}`);
assert(
  JSON.stringify(allSqlUnderSeed) === JSON.stringify(expectedRelativePaths),
  `Expected only approved SQL seed files ${expectedRelativePaths.join(', ')}; found: ${allSqlUnderSeed.join(', ') || '(none)'}`,
);

const geoSeedContent = geoSeedFiles.map((fileName) => readFileSync(path.join(seedDir, fileName), 'utf8')).join('\n');
const taxonomySeedContent = readFileSync(path.join(seedDir, taxonomySeedFile), 'utf8');
const allSeedContent = `${geoSeedContent}\n${taxonomySeedContent}`;

for (const forbidden of [
  /insert\s+into\s+public\.centers\b/i,
  /insert\s+into\s+public\.doctors\b/i,
  /insert\s+into\s+public\.reviews\b/i,
  /insert\s+into\s+public\.review_reports\b/i,
  /insert\s+into\s+public\.provider_onboarding_leads\b/i,
  /insert\s+into\s+public\.media_assets\b/i,
  /insert\s+into\s+public\.sponsored_campaigns\b/i,
  /\bratings?\b/i,
  /\binsurance\b/i,
  /\blicense_authorities\b/i,
  /\bcreate\s+policy\b/i,
  /\balter\s+table\b/i,
  /\bcreate\s+table\b/i,
  /\bdrop\b/i,
]) {
  assert(!forbidden.test(allSeedContent), `Forbidden seed scope found: ${forbidden}`);
}

for (const required of [
  /insert\s+into\s+public\.geo_countries/i,
  /insert\s+into\s+public\.geo_regions/i,
  /insert\s+into\s+public\.geo_cities/i,
  /insert\s+into\s+public\.geo_areas/i,
  /'oman'/i,
  /'muscat-governorate'/i,
  /'muscat'/i,
  /'al-khuwair'/i,
  /'casablanca-settat'/i,
  /'algiers-province'/i,
  /'tunis-governorate'/i,
  /'tripoli-district'/i,
  /'khartoum-state'/i,
  /'nouakchott-nord-region'/i,
]) {
  assert(required.test(geoSeedContent), `Missing required approved geo seed pattern: ${required}`);
}

for (const required of [
  /insert\s+into\s+public\.healthcare_verticals/i,
  /insert\s+into\s+public\.center_categories/i,
  /update\s+public\.healthcare_verticals/i,
  /update\s+public\.center_categories/i,
  /'medical'/i,
  /'dental'/i,
  /'diagnostics'/i,
  /'pharmacy'/i,
  /'veterinary'/i,
  /'healthy-food'/i,
  /'medical-laboratory'/i,
  /'dental-clinic'/i,
  /'pet-clinic'/i,
  /'healthy-restaurant'/i,
  /schema_org_hint\s*=\s*null/i,
  /where\s+not\s+exists/i,
]) {
  assert(required.test(taxonomySeedContent), `Missing required approved taxonomy seed pattern: ${required}`);
}

for (const forbiddenSlug of [
  /'home_care'/i,
  /'mental_health'/i,
  /'optical_eye_care'/i,
  /'healthy_food'/i,
  /'other_health'/i,
]) {
  assert(!forbiddenSlug.test(taxonomySeedContent), `Underscore vertical slug is not allowed: ${forbiddenSlug}`);
}

const packageJson = readFileSync(packageJsonPath, 'utf8');
if (/Seed test placeholder/i.test(packageJson)) {
  fail('Placeholder string "Seed test placeholder" still present in package.json.');
}

console.log(`✅ Seed static harness checks passed: approved seed files ${expectedRelativePaths.join(', ')} only.`);
