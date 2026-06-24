import fs from 'node:fs';

const marketPath = 'src/lib/market/public-market.ts';
const contractPath = 'src/config/geo/country-adapter-contract.ts';
const accessorPath = 'src/lib/geo/country-adapters.ts';
const docsPath = 'docs/DRMUSCAT_COUNTRY_ADAPTER_FOUNDATION_V1.md';
const requiredDraftMarketCodes = ['ae', 'qa', 'sa', 'kw', 'bh', 'ca', 'us', 'gb'];
const requiredExplicitDraftAdapters = ['ca', 'us', 'gb'];

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }

  return fs.readFileSync(filePath, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const marketSource = readFile(marketPath);
const contractSource = readFile(contractPath);
const accessorSource = readFile(accessorPath);
const docsSource = readFile(docsPath);
const countryCodes = [...marketSource.matchAll(/'([a-z]{2})'/g)].map((match) => match[1]);
const uniqueCountryCodes = [...new Set(countryCodes)];

assert(contractSource.includes('DRMUSCAT_COUNTRY_ADAPTER_CONTRACT'), 'Missing country adapter contract export.');
assert(contractSource.includes('DRMUSCAT_COUNTRY_ADAPTERS'), 'Missing country adapters export.');
assert(contractSource.includes('internalGeoCountryCodes.map'), 'Country adapters must be derived from internal country codes.');
assert(contractSource.includes('disabledDraftAdapter(countryCode)'), 'Non-Oman countries must use disabled draft adapter.');
assert(contractSource.includes("activeCountryCodes: ['om']"), 'Only Oman may be active.');
assert(contractSource.includes("disabledDraftCountryCodes: internalGeoCountryCodes.filter((countryCode) => countryCode !== 'om')"), 'All non-Oman countries must stay disabled drafts.');

for (const countryCode of requiredDraftMarketCodes) {
  assert(marketSource.includes(`'${countryCode}'`), `Missing draft market code: ${countryCode}.`);
}

for (const countryCode of requiredExplicitDraftAdapters) {
  assert(contractSource.includes(`${countryCode}: {`), `Missing explicit draft adapter override for ${countryCode}.`);
}

assert(contractSource.includes("countryCode: 'om'"), 'Missing Oman adapter.');
assert(contractSource.includes("countrySlug: 'oman'"), 'Missing Oman country slug.');
assert(contractSource.includes("routeNamespace: 'oman'"), 'Missing Oman route namespace.');
assert(contractSource.includes("status: 'active'"), 'Missing active Oman adapter status.');
assert(contractSource.includes("key: 'governorate'"), 'Missing Oman governorate level.');
assert(contractSource.includes("key: 'wilayat'"), 'Missing Oman wilayat level.');
assert(contractSource.includes("key: 'area'"), 'Missing Oman area level.');
assert(contractSource.includes("parentKey: 'governorate'"), 'Missing wilayat parent key.');
assert(contractSource.includes("parentKey: 'wilayat'"), 'Missing area parent key.');

assert(contractSource.includes("countrySlug: 'canada'"), 'Missing Canada country slug.');
assert(contractSource.includes("countrySlug: 'united-states'"), 'Missing United States country slug.');
assert(contractSource.includes("countrySlug: 'united-kingdom'"), 'Missing United Kingdom country slug.');
assert(contractSource.includes("routeNamespace: 'uk'"), 'United Kingdom route namespace should be uk.');
assert(contractSource.includes("key: 'province'"), 'Missing Canada province level.');
assert(contractSource.includes("key: 'state'"), 'Missing United States state level.');
assert(contractSource.includes("key: 'nation'"), 'Missing United Kingdom nation level.');
assert(contractSource.includes("parentKey: 'province'"), 'Missing Canada city parent key.');
assert(contractSource.includes("parentKey: 'state'"), 'Missing United States city parent key.');
assert(contractSource.includes("parentKey: 'nation'"), 'Missing United Kingdom city parent key.');
assert(contractSource.includes('enabled: false'), 'Draft country geo levels must remain disabled.');

for (const forbidden of ["countryCode: 'ca',\n      countrySlug: 'canada',\n      status: 'active'", "countryCode: 'us',\n      countrySlug: 'united-states',\n      status: 'active'", "countryCode: 'gb',\n      countrySlug: 'united-kingdom',\n      status: 'active'"]) {
  assert(!contractSource.includes(forbidden), 'Draft country must not be active.');
}

assert(contractSource.includes("defaultMetadataPolicy: 'noindex-first'"), 'Missing noindex-first default policy.');
assert(contractSource.includes("defaultPublicationPolicy: 'gated'"), 'Missing gated publication policy.');
assert(contractSource.includes("defaultSchemaPolicy: 'disabled-until-approved'"), 'Missing disabled schema policy.');
assert(!contractSource.includes('schemaPolicy: \'enabled\''), 'Schema must not be enabled.');
assert(!contractSource.includes('llmSurfaceEnabled: true'), 'LLM surfaces must not be enabled by this foundation.');

assert(accessorSource.includes('listCountryAdapters'), 'Missing listCountryAdapters helper.');
assert(accessorSource.includes('getCountryAdapter'), 'Missing getCountryAdapter helper.');
assert(accessorSource.includes('getActiveCountryAdapter'), 'Missing getActiveCountryAdapter helper.');
assert(accessorSource.includes('listCountryGeoLevels'), 'Missing listCountryGeoLevels helper.');
assert(accessorSource.includes('getCountryAdapterRuntimeState'), 'Missing runtime state helper.');
assert(accessorSource.includes('isInternalGeoCountryCode'), 'Country lookup must validate internal country codes.');
assert(accessorSource.includes("adapter?.status === 'active' && adapter.publicEnabled"), 'Active adapter helper must require active and public enabled.');
assert(accessorSource.includes("metadataPolicy: 'noindex-first'"), 'Runtime state must preserve noindex-first policy.');
assert(accessorSource.includes("publicationPolicy: 'gated'"), 'Runtime state must preserve gated policy.');
assert(accessorSource.includes("schemaPolicy: 'disabled-until-approved'"), 'Runtime state must preserve disabled schema policy.');

assert(docsSource.includes('Country Adapter Foundation'), 'Docs must describe country adapter foundation.');
assert(docsSource.includes('Only Oman is active'), 'Docs must state only Oman is active.');
assert(docsSource.includes('Canada'), 'Docs must mention Canada draft coverage.');
assert(docsSource.includes('United States'), 'Docs must mention United States draft coverage.');
assert(docsSource.includes('United Kingdom'), 'Docs must mention United Kingdom draft coverage.');
assert(docsSource.includes('Prompt 35'), 'Docs must identify next migration prompt.');

console.log('Country adapter foundation validated.');
console.log({
  countryCodes: uniqueCountryCodes.length,
  activeCountry: 'om',
  draftCountries: requiredDraftMarketCodes.length,
  metadataPolicy: 'noindex-first',
  publicationPolicy: 'gated',
  schemaPolicy: 'disabled-until-approved',
});
