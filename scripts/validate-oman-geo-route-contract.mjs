import fs from 'node:fs';

const geoPath = 'src/config/geo/oman.ts';
const contractPath = 'src/config/geo/route-contract.ts';

const expectedRouteNames = [
  'oman-governorate-en',
  'oman-governorate-ar',
  'oman-wilayat-en',
  'oman-wilayat-ar',
  'oman-area-en',
  'oman-area-ar',
];

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${filePath}`);
  }

  return fs.readFileSync(filePath, 'utf8');
}

function section(source, exportName) {
  const marker = `export const ${exportName}`;
  const start = source.indexOf(marker);
  if (start === -1) return '';

  const nextExport = source.indexOf('\nexport const ', start + marker.length);
  return source.slice(start, nextExport === -1 ? source.length : nextExport);
}

function countRegistryItems(source, exportName) {
  return section(source, exportName)
    .split('\n')
    .filter((line) => line.includes("slug: '")).length;
}

function collectProp(source, prop) {
  return [...source.matchAll(new RegExp(`${prop}: '([^']+)'`, 'g'))].map((match) => match[1]);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const geoSource = readFile(geoPath);
const contractSource = readFile(contractPath);

assert(contractSource.includes("status: 'planned-only'"), 'Route contract must stay planned-only.');
assert(contractSource.includes('runtimeRoutesEnabled: false'), 'Route contract must not enable runtime routes.');
assert(!contractSource.includes('runtimeRoutesEnabled: true'), 'Runtime routes must not be enabled by this contract.');
assert(!contractSource.includes('runtimeEnabled: true'), 'Route templates must not enable runtime routes.');

const routeNames = collectProp(contractSource, 'routeName');
const duplicateRouteNames = routeNames.filter((routeName, index) => routeNames.indexOf(routeName) !== index);

assert(duplicateRouteNames.length === 0, `Duplicate route names: ${duplicateRouteNames.join(', ')}`);

for (const routeName of expectedRouteNames) {
  assert(routeNames.includes(routeName), `Missing route template: ${routeName}`);
}

assert(contractSource.includes('/en-om/oman/governorates/[governorateSlug]'), 'Missing English governorate route template.');
assert(contractSource.includes('/ar-om/oman/governorates/[governorateSlug]'), 'Missing Arabic governorate route template.');
assert(contractSource.includes('/en-om/oman/wilayats/[wilayatSlug]'), 'Missing English wilayat route template.');
assert(contractSource.includes('/ar-om/oman/wilayats/[wilayatSlug]'), 'Missing Arabic wilayat route template.');
assert(contractSource.includes('/en-om/oman/areas/[areaSlug]'), 'Missing English area route template.');
assert(contractSource.includes('/ar-om/oman/areas/[areaSlug]'), 'Missing Arabic area route template.');

const summary = {
  governorates: countRegistryItems(geoSource, 'OMAN_GOVERNORATES'),
  wilayats: countRegistryItems(geoSource, 'OMAN_WILAYATS'),
  areas: countRegistryItems(geoSource, 'OMAN_AREAS'),
  routeTemplates: routeNames.length,
  runtimeRoutesEnabled: false,
};

console.log('Oman geo route contract validated.');
console.log(summary);
