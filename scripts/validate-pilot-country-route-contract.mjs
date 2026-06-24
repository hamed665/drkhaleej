import fs from 'node:fs';

const adapterPath = 'src/config/geo/country-adapter-contract.ts';
const routeContractPath = 'src/config/geo/pilot-country-route-contract.ts';
const docsPath = 'docs/DRMUSCAT_SECOND_COUNTRY_PILOT_ADAPTER_V1.md';
const packagePath = 'package.json';
const forbiddenRouteDirs = [
  'src/app/[locale]/[country]/uae',
  'src/app/[locale]/[country]/united-arab-emirates',
];

function readFile(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${filePath}`);
  return fs.readFileSync(filePath, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const adapterSource = readFile(adapterPath);
const routeContractSource = readFile(routeContractPath);
const docsSource = readFile(docsPath);
const packageSource = readFile(packagePath);

assert(adapterSource.includes('ae: {'), 'UAE must have an explicit draft adapter override.');
assert(adapterSource.includes("countrySlug: 'united-arab-emirates'"), 'UAE must use a stable country slug.');
assert(adapterSource.includes("routeNamespace: 'uae'"), 'UAE must use uae route namespace.');
assert(adapterSource.includes("key: 'emirate'"), 'UAE must define emirate level.');
assert(adapterSource.includes("key: 'city'"), 'UAE must define city level.');
assert(adapterSource.includes("key: 'area'"), 'UAE must define area level.');
assert(adapterSource.includes("parentKey: 'emirate'"), 'UAE city level must belong to emirate.');
assert(adapterSource.includes("parentKey: 'city'"), 'UAE area level must belong to city.');
assert(adapterSource.includes('enabled: false'), 'UAE geo levels must remain disabled.');

assert(routeContractSource.includes('DISABLED_PILOT_COUNTRY_ROUTE_CONTRACT'), 'Missing disabled pilot route contract export.');
assert(routeContractSource.includes("DISABLED_PILOT_COUNTRY_CODE = 'ae'"), 'Pilot country must be UAE.');
assert(routeContractSource.includes("routeName: 'uae-emirate'"), 'Missing UAE emirate route template.');
assert(routeContractSource.includes("routeName: 'uae-city'"), 'Missing UAE city route template.');
assert(routeContractSource.includes("routeName: 'uae-area'"), 'Missing UAE area route template.');
assert(routeContractSource.includes("pathTemplate: '/[locale]/[country]/uae/emirates/[emirateSlug]'"), 'Missing UAE emirate path template.');
assert(routeContractSource.includes("pathTemplate: '/[locale]/[country]/uae/cities/[citySlug]'"), 'Missing UAE city path template.');
assert(routeContractSource.includes("pathTemplate: '/[locale]/[country]/uae/areas/[areaSlug]'"), 'Missing UAE area path template.');
assert(routeContractSource.includes('routeFile: null'), 'Disabled pilot route templates must not map to route files.');
assert(routeContractSource.includes('runtimeRoutesEnabled: false'), 'Runtime routes must stay disabled.');
assert(routeContractSource.includes('metadataEnabled: false'), 'Metadata must stay disabled.');
assert(routeContractSource.includes('sitemapEnabled: false'), 'Sitemap must stay disabled.');
assert(routeContractSource.includes('jsonLdEnabled: false'), 'JSON-LD must stay disabled.');
assert(routeContractSource.includes('llmSurfaceEnabled: false'), 'LLM surface must stay disabled.');
assert(routeContractSource.includes("activationStatus: 'blocked-until-country-readiness'"), 'Pilot routes must stay blocked until readiness exists.');
assert(routeContractSource.includes('publicRoutesCreated: false'), 'Pilot contract must not create public routes.');
assert(routeContractSource.includes('approved-promotion-review'), 'Activation must require approved promotion review.');

for (const routeDir of forbiddenRouteDirs) {
  assert(!fs.existsSync(routeDir), `Pilot route directory must not exist yet: ${routeDir}`);
}

assert(docsSource.includes('Second Country Pilot Adapter'), 'Docs must describe second country pilot adapter.');
assert(docsSource.includes('UAE'), 'Docs must name UAE as the pilot country.');
assert(docsSource.includes('disabled-draft'), 'Docs must state disabled-draft status.');
assert(docsSource.includes('No public routes'), 'Docs must state no public routes are created.');
assert(docsSource.includes('Prompt 37'), 'Docs must identify next prompt.');

assert(packageSource.includes('geo:pilot-country-route:validate'), 'package.json must include pilot route validator script.');
assert(packageSource.includes('pnpm geo:pilot-country-route:validate'), 'geo check chain must include pilot route validator.');

console.log('Disabled pilot country route contract validated.');
console.log({ countryCode: 'ae', routeTemplates: 3, publicRoutesCreated: false });
