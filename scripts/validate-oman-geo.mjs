import fs from 'node:fs';

const geoPath = 'src/config/geo/oman.ts';
const validScopes = new Set(['core', 'adjacent', 'deferred', 'excluded']);
const validLaunchPhases = new Set(['1', '2', '3', 'deferred', 'excluded']);
const placeholderPattern = /TODO|placeholder|taxonomy|area name/i;

const errors = [];
const warnings = [];

function readFile(path) {
  if (!fs.existsSync(path)) {
    errors.push(`Missing geo file: ${path}`);
    return '';
  }

  return fs.readFileSync(path, 'utf8');
}

function section(source, exportName) {
  const marker = `export const ${exportName}`;
  const start = source.indexOf(marker);
  if (start === -1) return '';

  const nextExport = source.indexOf('\nexport const ', start + marker.length);
  return source.slice(start, nextExport === -1 ? source.length : nextExport);
}

function stringProp(line, prop) {
  const match = line.match(new RegExp(`${prop}: '([^']*)'`));
  return match?.[1];
}

function rawProp(line, prop) {
  const match = line.match(new RegExp(`${prop}: ([^,}]+)`));
  if (!match) return undefined;
  const value = match[1].trim();
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value.replace(/^'|'$/g, '');
}

function parseRegistry(source, exportName, registry) {
  return section(source, exportName)
    .split('\n')
    .filter((line) => line.includes("slug: '"))
    .map((line) => ({
      registry,
      raw: line,
      slug: stringProp(line, 'slug'),
      governorateSlug: stringProp(line, 'governorateSlug'),
      wilayatSlug: stringProp(line, 'wilayatSlug'),
      labelEn: stringProp(line, 'labelEn'),
      labelAr: stringProp(line, 'labelAr'),
      countryCode: stringProp(line, 'countryCode'),
      scope: rawProp(line, 'scope'),
      publicLaunchPhase: rawProp(line, 'publicLaunchPhase'),
      isMvp: rawProp(line, 'isMvp'),
    }));
}

function fail(item, message) {
  errors.push(`${item.registry}:${item.slug ?? 'unknown'} - ${message}`);
}

function warn(item, message) {
  warnings.push(`${item.registry}:${item.slug ?? 'unknown'} - ${message}`);
}

function checkSlug(item) {
  if (!item.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) {
    fail(item, `Invalid slug: ${item.slug}`);
  }
}

function checkCommon(item) {
  for (const field of ['slug', 'labelEn', 'labelAr', 'scope', 'publicLaunchPhase']) {
    if (item[field] === undefined || item[field] === null || item[field] === '') {
      fail(item, `Missing ${field}`);
    }
  }

  checkSlug(item);

  if (!validScopes.has(item.scope)) {
    fail(item, `Invalid scope: ${item.scope}`);
  }

  if (!validLaunchPhases.has(String(item.publicLaunchPhase))) {
    fail(item, `Invalid publicLaunchPhase: ${item.publicLaunchPhase}`);
  }

  if (placeholderPattern.test(`${item.labelAr ?? ''}`)) {
    fail(item, 'Arabic label contains placeholder text');
  }

  if (item.labelAr && /[A-Za-z]{4,}/.test(item.labelAr)) {
    warn(item, 'Arabic label may contain Latin text');
  }
}

function checkUnique(registryName, items) {
  const seen = new Set();

  for (const item of items) {
    if (!item.slug) continue;

    if (seen.has(item.slug)) {
      errors.push(`${registryName}:${item.slug} duplicate slug inside registry`);
    }

    seen.add(item.slug);
  }
}

const source = readFile(geoPath);
const governorates = parseRegistry(source, 'OMAN_GOVERNORATES', 'governorates');
const wilayats = parseRegistry(source, 'OMAN_WILAYATS', 'wilayats');
const areas = parseRegistry(source, 'OMAN_AREAS', 'areas');

for (const registry of [governorates, wilayats, areas]) {
  for (const item of registry) checkCommon(item);
}

checkUnique('governorates', governorates);
checkUnique('wilayats', wilayats);
checkUnique('areas', areas);

const governorateSlugs = new Set(governorates.map((item) => item.slug).filter(Boolean));
const wilayatSlugs = new Set(wilayats.map((item) => item.slug).filter(Boolean));
const wilayatGovernorate = new Map(wilayats.map((item) => [item.slug, item.governorateSlug]));

for (const item of governorates) {
  if (item.countryCode !== 'OM') {
    fail(item, `Invalid countryCode: ${item.countryCode}`);
  }
}

for (const item of wilayats) {
  if (!item.governorateSlug) {
    fail(item, 'Missing governorateSlug');
  } else if (!governorateSlugs.has(item.governorateSlug)) {
    fail(item, `Unknown governorateSlug: ${item.governorateSlug}`);
  }
}

for (const item of areas) {
  if (!item.governorateSlug) {
    fail(item, 'Missing governorateSlug');
  } else if (!governorateSlugs.has(item.governorateSlug)) {
    fail(item, `Unknown governorateSlug: ${item.governorateSlug}`);
  }

  if (!item.wilayatSlug) {
    fail(item, 'Missing wilayatSlug');
  } else if (!wilayatSlugs.has(item.wilayatSlug)) {
    fail(item, `Unknown wilayatSlug: ${item.wilayatSlug}`);
  } else if (wilayatGovernorate.get(item.wilayatSlug) !== item.governorateSlug) {
    fail(item, `Area wilayat ${item.wilayatSlug} does not belong to governorate ${item.governorateSlug}`);
  }
}

console.log('Oman geo registry counts:');
console.log(`- governorates: ${governorates.length}`);
console.log(`- wilayats: ${wilayats.length}`);
console.log(`- areas: ${areas.length}`);

if (warnings.length > 0) {
  console.log('\nWarnings:');
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (errors.length > 0) {
  console.error('\nOman geo validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('\nOman geo validation passed.');
}
