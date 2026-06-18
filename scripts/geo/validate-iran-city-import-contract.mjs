#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const importerPath = path.join(repoRoot, 'scripts', 'geo', 'import-geonames-iran-cities.mjs');
const fixturePath = path.join(repoRoot, 'scripts', 'geo', 'fixtures', 'iran-cities.sample.tsv');
const manifestPath = path.join(repoRoot, 'scripts', 'geo', 'fixtures', 'iran-city-source-manifest.sample.json');

function fail(message) {
  console.error(`ERROR: GEO-FULL-D2B1: ${message}`);
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

for (const filePath of [importerPath, fixturePath, manifestPath]) {
  requireCondition(statSync(filePath).isFile(), `Missing required file: ${path.relative(repoRoot, filePath)}`);
}

const fixtureHeader = readFileSync(fixturePath, 'utf8').split(/\r?\n/)[0];
requireCondition(
  fixtureHeader === 'source_id\tname_en\tname_ar\tprovince_slug\tfeature_class\tfeature_code\tis_capital\tpopulation\tlatitude\tlongitude',
  'Iran city sample fixture header is not the approved import contract.',
);

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
for (const key of [
  'source',
  'source_version',
  'source_url',
  'license',
  'attribution',
  'country_code',
  'seed_phase',
  'review_status',
  'allowed_feature_classes',
  'allowed_feature_codes',
  'province_slugs',
]) {
  requireCondition(key in manifest, `Manifest missing required key: ${key}`);
}

requireCondition(manifest.country_code === 'ir', 'Manifest must target Iran only.');
requireCondition(manifest.seed_phase === 'GEO-FULL-D2B', 'Manifest must use GEO-FULL-D2B seed phase.');
requireCondition(manifest.source === 'geonames', 'Sample contract must use geonames source.');
requireCondition(Array.isArray(manifest.province_slugs), 'Manifest province_slugs must be an array.');
requireCondition(manifest.province_slugs.includes('tehran-province'), 'Manifest must map Tehran province.');
requireCondition(manifest.province_slugs.includes('razavi-khorasan-province'), 'Manifest must map Razavi Khorasan province.');

const sql = execFileSync(process.execPath, [
  importerPath,
  `--input=${fixturePath}`,
  `--manifest=${manifestPath}`,
], {
  cwd: repoRoot,
  encoding: 'utf8',
});

for (const [pattern, message] of [
  [/insert\s+into\s+public\.geo_cities/i, 'Importer output must insert geo_cities.'],
  [/update\s+public\.geo_cities/i, 'Importer output must update geo_cities idempotently.'],
  [/(from|join)\s+public\.geo_regions/i, 'Importer output must resolve geo_regions.'],
  [/code\s*=\s*'ir'::country_code/i, 'Importer output must target Iran country code.'],
  [/GEO-FULL-D2B/i, 'Importer output must include GEO-FULL-D2B metadata.'],
  [/source_version/i, 'Importer output must include source_version metadata.'],
  [/source_id/i, 'Importer output must include source_id metadata.'],
  [/review_status/i, 'Importer output must include review_status metadata.'],
  [/'tehran'/i, 'Importer output must include Tehran.'],
  [/'karaj'/i, 'Importer output must include Karaj.'],
  [/'isfahan'/i, 'Importer output must include Isfahan.'],
  [/'shiraz'/i, 'Importer output must include Shiraz.'],
  [/'mashhad'/i, 'Importer output must include Mashhad.'],
  [/'tabriz'/i, 'Importer output must include Tabriz.'],
  [/'tehran-province'/i, 'Importer output must include Tehran province mapping.'],
  [/'razavi-khorasan-province'/i, 'Importer output must include Razavi Khorasan mapping.'],
]) {
  requirePattern(sql, pattern, message);
}

for (const [pattern, message] of [
  [/\binsert\s+into\s+public\.centers\b/i, 'Importer must not insert centers.'],
  [/\binsert\s+into\s+public\.doctors\b/i, 'Importer must not insert doctors.'],
  [/\binsert\s+into\s+public\.reviews\b/i, 'Importer must not insert reviews.'],
  [/\bratings?\b/i, 'Importer must not include ratings.'],
  [/\binsurance\b/i, 'Importer must not include insurance data.'],
  [/\blicense_authorities\b/i, 'Importer must not include license authority data.'],
  [/\bmedia_assets\b/i, 'Importer must not include media assets.'],
  [/\bsponsored_campaigns\b/i, 'Importer must not include sponsored campaigns.'],
  [/\bcreate\s+policy\b/i, 'Importer must not create policies.'],
  [/\bcreate\s+table\b/i, 'Importer must not create tables.'],
  [/\bdrop\b/i, 'Importer must not drop objects.'],
]) {
  forbidPattern(sql, pattern, message);
}

console.log('GEO-FULL-D2B1 Iran city import contract validated.');
