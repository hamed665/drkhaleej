#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const DEFAULT_COUNTRY_CODE = 'ir';
const DEFAULT_SEED_PHASE = 'GEO-FULL-D2B';
const REQUIRED_COLUMNS = [
  'source_id',
  'name_en',
  'name_ar',
  'province_slug',
  'feature_class',
  'feature_code',
  'is_capital',
  'population',
  'latitude',
  'longitude',
];

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {
    countryCode: DEFAULT_COUNTRY_CODE,
    seedPhase: DEFAULT_SEED_PHASE,
    input: null,
    manifest: null,
    output: null,
  };

  for (const arg of argv) {
    if (arg.startsWith('--input=')) args.input = arg.slice('--input='.length);
    else if (arg.startsWith('--manifest=')) args.manifest = arg.slice('--manifest='.length);
    else if (arg.startsWith('--output=')) args.output = arg.slice('--output='.length);
    else if (arg.startsWith('--country-code=')) args.countryCode = arg.slice('--country-code='.length);
    else if (arg.startsWith('--seed-phase=')) args.seedPhase = arg.slice('--seed-phase='.length);
    else fail(`Unknown argument: ${arg}`);
  }

  if (!args.input) fail('Missing required --input=<path>.');
  if (!args.manifest) fail('Missing required --manifest=<path>.');

  return args;
}

function parseBoolean(value, columnName) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  fail(`${columnName} must be true or false. Received: ${value}`);
}

function parseNumberOrNull(value, columnName) {
  if (value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number)) fail(`${columnName} must be numeric or empty. Received: ${value}`);
  return number;
}

function normalizeSlug(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function readManifest(manifestPath, countryCode, seedPhase) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const requiredKeys = [
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
  ];

  for (const key of requiredKeys) {
    if (!(key in manifest)) fail(`Manifest is missing required key: ${key}`);
  }

  if (manifest.country_code !== countryCode) fail(`Manifest country_code must be ${countryCode}.`);
  if (manifest.seed_phase !== seedPhase) fail(`Manifest seed_phase must be ${seedPhase}.`);
  if (!Array.isArray(manifest.province_slugs) || manifest.province_slugs.length === 0) {
    fail('Manifest province_slugs must be a non-empty array.');
  }
  if (!Array.isArray(manifest.allowed_feature_classes) || manifest.allowed_feature_classes.length === 0) {
    fail('Manifest allowed_feature_classes must be a non-empty array.');
  }
  if (!Array.isArray(manifest.allowed_feature_codes) || manifest.allowed_feature_codes.length === 0) {
    fail('Manifest allowed_feature_codes must be a non-empty array.');
  }

  return manifest;
}

function parseTsv(inputPath) {
  const text = readFileSync(inputPath, 'utf8').trim();
  if (!text) fail('Input TSV is empty.');

  const [headerLine, ...lines] = text.split(/\r?\n/);
  const headers = headerLine.split('\t');

  if (JSON.stringify(headers) !== JSON.stringify(REQUIRED_COLUMNS)) {
    fail(`Input TSV header must be exactly: ${REQUIRED_COLUMNS.join('\t')}`);
  }

  return lines.map((line, index) => {
    const values = line.split('\t');
    if (values.length !== headers.length) {
      fail(`Row ${index + 2} has ${values.length} columns; expected ${headers.length}.`);
    }

    return Object.fromEntries(headers.map((header, columnIndex) => [header, values[columnIndex]]));
  });
}

function buildSeedRows(rawRows, manifest) {
  const allowedProvinceSlugs = new Set(manifest.province_slugs);
  const allowedFeatureClasses = new Set(manifest.allowed_feature_classes);
  const allowedFeatureCodes = new Set(manifest.allowed_feature_codes);
  const usedSlugs = new Set();

  return rawRows.map((rawRow, index) => {
    const rowNumber = index + 2;
    for (const column of REQUIRED_COLUMNS) {
      if (rawRow[column] === undefined) fail(`Row ${rowNumber} is missing column ${column}.`);
    }

    if (!rawRow.source_id) fail(`Row ${rowNumber} is missing source_id.`);
    if (!rawRow.name_en) fail(`Row ${rowNumber} is missing name_en.`);
    if (!rawRow.name_ar) fail(`Row ${rowNumber} is missing name_ar.`);
    if (!allowedProvinceSlugs.has(rawRow.province_slug)) {
      fail(`Row ${rowNumber} has unmapped province_slug: ${rawRow.province_slug}`);
    }
    if (!allowedFeatureClasses.has(rawRow.feature_class)) {
      fail(`Row ${rowNumber} has unsupported feature_class: ${rawRow.feature_class}`);
    }
    if (!allowedFeatureCodes.has(rawRow.feature_code)) {
      fail(`Row ${rowNumber} has unsupported feature_code: ${rawRow.feature_code}`);
    }

    let slug = normalizeSlug(rawRow.name_en);
    if (!slug) fail(`Row ${rowNumber} cannot produce a stable slug from name_en: ${rawRow.name_en}`);

    if (usedSlugs.has(slug)) {
      slug = `${slug}-${rawRow.province_slug.replace(/-province$/, '')}`;
    }
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${normalizeSlug(rawRow.source_id)}`;
    }
    if (usedSlugs.has(slug)) {
      fail(`Row ${rowNumber} still has duplicate slug after collision handling: ${slug}`);
    }
    usedSlugs.add(slug);

    return {
      sourceId: rawRow.source_id,
      provinceSlug: rawRow.province_slug,
      slug,
      nameEn: rawRow.name_en,
      nameAr: rawRow.name_ar,
      isCapital: parseBoolean(rawRow.is_capital, 'is_capital'),
      population: parseNumberOrNull(rawRow.population, 'population'),
      latitude: parseNumberOrNull(rawRow.latitude, 'latitude'),
      longitude: parseNumberOrNull(rawRow.longitude, 'longitude'),
      featureClass: rawRow.feature_class,
      featureCode: rawRow.feature_code,
    };
  });
}

function buildSql(rows, manifest, countryCode, seedPhase) {
  const sqlRows = rows.map((row, index) => {
    const metadata = [
      'seed_key', row.slug,
      'seed_phase', seedPhase,
      'source', manifest.source,
      'source_version', manifest.source_version,
      'source_id', row.sourceId,
      'source_url', manifest.source_url,
      'license', manifest.license,
      'attribution', manifest.attribution,
      'review_status', manifest.review_status,
      'feature_class', row.featureClass,
      'feature_code', row.featureCode,
      'population', row.population === null ? '' : String(row.population),
      'latitude', row.latitude === null ? '' : String(row.latitude),
      'longitude', row.longitude === null ? '' : String(row.longitude),
    ];

    const metadataSql = metadata
      .map((value) => sqlString(value))
      .join(', ');

    const comma = index === rows.length - 1 ? '' : ',';

    return `    (${sqlString(row.sourceId)}, ${sqlString(row.provinceSlug)}, ${sqlString(row.slug)}, ${sqlString(row.nameEn)}, ${sqlString(row.nameAr)}, ${row.isCapital ? 'true' : 'false'}, ${index + 10}, jsonb_build_object(${metadataSql}))${comma}`;
  });

  return `with city_seed (\n  source_id,\n  province_slug,\n  slug,\n  name_en,\n  name_ar,\n  is_capital,\n  sort_order,\n  metadata\n) as (\n  values\n${sqlRows.join('\n')}\n), iran_country as (\n  select id\n  from public.geo_countries\n  where code = ${sqlString(countryCode)}::country_code\n    and deleted_at is null\n), city_rows as (\n  select\n    country.id as country_id,\n    region.id as region_id,\n    seed.slug,\n    seed.name_en,\n    seed.name_ar,\n    seed.is_capital,\n    seed.sort_order,\n    seed.metadata\n  from city_seed seed\n  cross join iran_country country\n  join public.geo_regions region\n    on region.country_id = country.id\n   and region.slug = seed.province_slug\n   and region.deleted_at is null\n), updated_cities as (\n  update public.geo_cities target\n  set\n    region_id = seed.region_id,\n    name_en = seed.name_en,\n    name_ar = seed.name_ar,\n    is_capital = seed.is_capital,\n    is_active = true,\n    sort_order = seed.sort_order,\n    deleted_at = null,\n    metadata = seed.metadata,\n    updated_at = now()\n  from city_rows seed\n  where target.country_id = seed.country_id\n    and target.slug = seed.slug\n  returning target.id, target.slug\n)\ninsert into public.geo_cities (\n  country_id,\n  region_id,\n  slug,\n  name_en,\n  name_ar,\n  is_capital,\n  is_active,\n  sort_order,\n  metadata\n)\nselect\n  seed.country_id,\n  seed.region_id,\n  seed.slug,\n  seed.name_en,\n  seed.name_ar,\n  seed.is_capital,\n  true,\n  seed.sort_order,\n  seed.metadata\nfrom city_rows seed\nwhere not exists (\n  select 1\n  from public.geo_cities existing\n  where existing.country_id = seed.country_id\n    and existing.slug = seed.slug\n);\n`;
}

const args = parseArgs(process.argv.slice(2));
const inputPath = path.resolve(args.input);
const manifestPath = path.resolve(args.manifest);
const manifest = readManifest(manifestPath, args.countryCode, args.seedPhase);
const rawRows = parseTsv(inputPath);
const rows = buildSeedRows(rawRows, manifest);
const sql = buildSql(rows, manifest, args.countryCode, args.seedPhase);

if (args.output) {
  writeFileSync(path.resolve(args.output), sql);
} else {
  process.stdout.write(sql);
}
