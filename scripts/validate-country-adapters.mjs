import fs from 'node:fs';

const marketPath = 'src/lib/market/public-market.ts';
const contractPath = 'src/config/geo/country-adapter-contract.ts';
const accessorPath = 'src/lib/geo/country-adapters.ts';
const docsPath = 'docs/DRMUSCAT_COUNTRY_ADAPTER_FOUNDATION_V1.md';

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
const uniqueCountryCodes = [...new Set(countryCodes)].filter((code) => contractSource.includes(`countryCode: '${code}'`) || code === 'om');

assert(contractSource.includes('DRMUSCAT_COUNTRY_ADAPTER_CONTRACT'), 'Missing country adapter contract export.');
assert(contractSource.includes('DRMUSCAT_COUNTRY_ADAPTERS'), 'Missing country adapters export.');
assert(contractSource.includes('internalGeoCountryCodes.map'), 'Country adapters must be derived from internal country codes.');
assert(contractSource.includes("countryCode: 'om'"), 'Missing Oman adapter.');
assert(contractSource.includes("status: 'active'"), 'Missing active Oman adapter status.');
assert(contractSource.includes("countrySlug: 'oman'"), 'Missing Oman country slug.');
assert(contractSource.includes("routeNamespace: 'oman'"), 'Missing Oman route namespace.');
assert(contractSource.includes("key: 'governorate'"), 'Missing Oman governorate level.');
assert(contractSource.includes("key: 'wilayat'"), 'Missing Oman wilayat level.');
assert(contractSource.includes("key: 'area'"), 'Missing Oman area level.');
assert(contractSource.includes("parentKey: 'governorate'"), 'Missing wilayat parent key.');
assert(contractSource.includes("parentKey: 'wilayat'"), 'Missing area parent key.');
assert(contractSource.includes("defaultMetadataPolicy: 'noindex-first'"), 'Missing noindex-first default policy.');
assert(contractSource.includes("defaultPublicationPolicy: 'gated'"), 'Missing gated publication policy.');
assert(contractSource.includes("defaultSchemaPolicy: 'disabled-until-approved'"), 'Missing disabled schema policy.');
assert(contractSource.includes('disabledDraftAdapter(countryCode)'), 'Non-Oman countries must use disabled draft adapter.');
assert(!contractSource.includes("countryCode: 'ae',\n      countrySlug: 'ae',\n      status: 'active'"), 'UAE must not be active.');
assert(!contractSource.includes("countryCode: 'sa',\n      countrySlug: 'sa',\n      status: 'active'"), 'Saudi Arabia must not be active.');
assert(!contractSource.includes("countryCode: 'qa',\n      countrySlug: 'qa',\n      status: 'active'"), 'Qatar must not be active.');
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
assert(docsSource.includes('Prompt 35'), 'Docs must identify next migration prompt.');

console.log('Country adapter foundation validated.');
console.log({
  countryCodes: uniqueCountryCodes.length,
  activeCountry: 'om',
  metadataPolicy: 'noindex-first',
  publicationPolicy: 'gated',
  schemaPolicy: 'disabled-until-approved',
});
