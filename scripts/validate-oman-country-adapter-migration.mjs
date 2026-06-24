import fs from 'node:fs';

const helperPath = 'src/lib/geo/oman-country-adapter.ts';
const countryAdapterPath = 'src/lib/geo/country-adapters.ts';
const contractPath = 'src/config/geo/country-adapter-contract.ts';
const docsPath = 'docs/DRMUSCAT_OMAN_COUNTRY_ADAPTER_MIGRATION_V1.md';
const routeFiles = [
  'src/app/[locale]/[country]/oman/governorates/[governorateSlug]/page.tsx',
  'src/app/[locale]/[country]/oman/wilayats/[wilayatSlug]/page.tsx',
  'src/app/[locale]/[country]/oman/areas/[areaSlug]/page.tsx',
];

function readFile(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${filePath}`);
  return fs.readFileSync(filePath, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const helperSource = readFile(helperPath);
const adapterSource = readFile(countryAdapterPath);
const contractSource = readFile(contractPath);
const docsSource = readFile(docsPath);

assert(helperSource.includes("OMAN_COUNTRY_CODE = 'om'"), 'Missing Oman country code helper constant.');
assert(helperSource.includes('getActiveCountryAdapter'), 'Oman helper must read active country adapter.');
assert(helperSource.includes('listCountryGeoLevels'), 'Oman helper must read adapter geo levels.');
assert(helperSource.includes('getOmanCountryAdapter'), 'Missing getOmanCountryAdapter helper.');
assert(helperSource.includes('isOmanCountryRoute'), 'Missing isOmanCountryRoute helper.');
assert(helperSource.includes('getOmanRouteNamespace'), 'Missing getOmanRouteNamespace helper.');
assert(helperSource.includes('getOmanGeoRouteSegment'), 'Missing getOmanGeoRouteSegment helper.');
assert(helperSource.includes('buildOmanGeoPath'), 'Missing buildOmanGeoPath helper.');
assert(helperSource.includes("getOmanCountryAdapter()?.routeNamespace ?? 'oman'"), 'Oman namespace must preserve oman fallback.');
assert(helperSource.includes("listCountryGeoLevels(OMAN_COUNTRY_CODE)"), 'Oman geo route segment must come from adapter levels.');

assert(adapterSource.includes('getActiveCountryAdapter'), 'Country adapter runtime helper missing active adapter lookup.');
assert(contractSource.includes("routeNamespace: 'oman'"), 'Oman adapter must preserve route namespace.');
assert(contractSource.includes("metadataPolicy: 'noindex-first'"), 'Oman adapter must preserve noindex-first metadata policy.');
assert(contractSource.includes("publicationPolicy: 'gated'"), 'Oman adapter must preserve gated publication policy.');
assert(contractSource.includes("schemaPolicy: 'disabled-until-approved'"), 'Oman adapter must keep schema disabled.');

for (const routeFile of routeFiles) {
  const routeSource = readFile(routeFile);
  assert(routeSource.includes('isOmanCountryRoute'), `${routeFile} must use adapter-backed Oman route guard.`);
  assert(!routeSource.includes("country !== 'om'"), `${routeFile} must not hard-code country !== 'om'.`);
  assert(routeSource.includes('buildOmanGeoPath'), `${routeFile} must build metadata pathname through adapter helper.`);
  assert(!routeSource.includes('pathname: `/oman/'), `${routeFile} must not hard-code Oman metadata pathname.`);
  assert(routeSource.includes('buildOmanGeoGatedMetadata'), `${routeFile} must keep gated metadata.`);
  assert(routeSource.includes('notFound'), `${routeFile} must keep invalid param guard.`);
}

assert(docsSource.includes('Oman Country Adapter Migration'), 'Docs must describe migration.');
assert(docsSource.includes('No route behavior changes'), 'Docs must state route behavior is unchanged.');
assert(docsSource.includes('Prompt 36'), 'Docs must identify next country adapter prompt.');

console.log('Oman country adapter migration validated.');
console.log({
  helper: helperPath,
  routeFiles: routeFiles.length,
  countryCode: 'om',
  routeNamespace: 'oman',
  metadataPolicy: 'noindex-first',
  publicationPolicy: 'gated',
});
