import fs from 'node:fs';

const contractPath = 'src/config/geo/evidence-registry-contract.ts';
const accessorPath = 'src/lib/geo/oman-evidence-registry.ts';
const packagePath = 'package.json';
const expectedEntities = ['governorate', 'wilayat', 'area'];
const expectedKinds = ['provider-inventory', 'editorial-content', 'qa-evidence', 'promotion-review'];

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${filePath}`);
  }

  return fs.readFileSync(filePath, 'utf8');
}

function sectionForEntity(source, entity) {
  const marker = `entity: '${entity}'`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) return '';

  const start = source.lastIndexOf('{', markerIndex);
  const end = source.indexOf('\n  },', markerIndex);
  return source.slice(start, end === -1 ? source.length : end);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const contractSource = readFile(contractPath);
const accessorSource = readFile(accessorPath);
const packageSource = readFile(packagePath);

assert(contractSource.includes('OMAN_GEO_EVIDENCE_REGISTRY_CONTRACT'), 'Missing evidence registry contract export.');
assert(contractSource.includes('OMAN_GEO_EVIDENCE_REGISTRY_ENTRIES'), 'Missing evidence registry entries export.');
assert(contractSource.includes('OMAN_GEO_EVIDENCE_REGISTRY_ENTITY_CONTRACTS'), 'Missing evidence registry entity contracts export.');
assert(contractSource.includes('registryEnabled: false'), 'Evidence registry must remain disabled.');
assert(contractSource.includes('OMAN_GEO_EVIDENCE_REGISTRY_ENTRIES: readonly OmanGeoEvidenceRegistryEntry[] = []'), 'Evidence registry entries must remain empty.');
assert(!contractSource.includes('registryEnabled: true'), 'Evidence registry must not be enabled.');
assert(!contractSource.includes('promotionAllowed: true'), 'Evidence registry must not allow promotion.');
assert(!contractSource.includes('noindexRemovalAllowed: true'), 'Evidence registry must not allow noindex removal.');
assert(!contractSource.includes('sitemapPromotionAllowed: true'), 'Evidence registry must not allow sitemap promotion.');
assert(!contractSource.includes('jsonLdAllowed: true'), 'Evidence registry must not allow JSON-LD.');
assert(!contractSource.includes('indexPromotionAllowed: true'), 'Evidence registry must not allow index promotion.');

for (const kind of expectedKinds) {
  assert(contractSource.includes(`'${kind}'`), `Missing required evidence kind: ${kind}.`);
}

for (const entity of expectedEntities) {
  const section = sectionForEntity(contractSource, entity);

  assert(section, `Missing evidence registry entity contract for ${entity}.`);
  assert(section.includes('registryEnabled: false'), `Evidence registry must remain disabled for ${entity}.`);
  assert(section.includes('minimumApprovedEvidenceEntries: 4'), `Evidence registry must require four evidence kinds for ${entity}.`);
  assert(section.includes('approvedEvidenceEntries: 0'), `Evidence registry must not approve evidence entries for ${entity}.`);
  assert(section.includes('promotionAllowed: false'), `Evidence registry must block promotion for ${entity}.`);
  assert(section.includes('noindexRemovalAllowed: false'), `Evidence registry must block noindex removal for ${entity}.`);
  assert(section.includes('sitemapPromotionAllowed: false'), `Evidence registry must block sitemap promotion for ${entity}.`);
  assert(section.includes('jsonLdAllowed: false'), `Evidence registry must block JSON-LD for ${entity}.`);
  assert(section.includes('indexPromotionAllowed: false'), `Evidence registry must block index promotion for ${entity}.`);
}

assert(accessorSource.includes('listOmanGeoEvidenceRegistryEntries'), 'Missing evidence registry entry list helper.');
assert(accessorSource.includes('listOmanGeoEvidenceRegistryEntityContracts'), 'Missing evidence registry entity contract list helper.');
assert(accessorSource.includes('getOmanGeoEvidenceRegistryEntityContract'), 'Missing evidence registry entity contract lookup helper.');
assert(accessorSource.includes('listOmanGeoEvidenceRegistryEntriesForEntity'), 'Missing evidence registry filtered entry helper.');
assert(accessorSource.includes('getOmanGeoEvidenceRegistryRuntimeState'), 'Missing evidence registry runtime state helper.');
assert(accessorSource.includes('entry.reviewedByHuman === true && entry.status === \'approved\''), 'Evidence registry accessor must only expose human-reviewed approved entries.');
assert(accessorSource.includes('registryEnabled: OMAN_GEO_EVIDENCE_REGISTRY_CONTRACT.registryEnabled'), 'Runtime state must derive registryEnabled from contract.');
assert(accessorSource.includes('promotionAllowed: false'), 'Runtime state must keep promotion blocked.');
assert(accessorSource.includes('noindexRemovalAllowed: false'), 'Runtime state must keep noindex removal blocked.');
assert(accessorSource.includes('sitemapPromotionAllowed: false'), 'Runtime state must keep sitemap promotion blocked.');
assert(accessorSource.includes('jsonLdAllowed: false'), 'Runtime state must keep JSON-LD blocked.');
assert(accessorSource.includes('indexPromotionAllowed: false'), 'Runtime state must keep index promotion blocked.');

assert(packageSource.includes('geo:evidence-registry:validate'), 'package.json must include evidence registry validation script.');
assert(packageSource.includes('pnpm geo:evidence-registry:validate'), 'geo:check:oman must include evidence registry validation.');

const forbiddenRuntimeSignals = [
  '@supabase/',
  'createClient',
  'from(',
  'select(',
  'fetch(',
  'axios',
  'prisma',
];

for (const signal of forbiddenRuntimeSignals) {
  assert(!accessorSource.includes(signal), `Evidence registry accessor must not include runtime data access signal: ${signal}`);
}

console.log('Oman geo evidence registry validated.');
console.log({
  entries: 0,
  registryEnabled: false,
  promotionAllowed: false,
  noindexRemovalAllowed: false,
  sitemapPromotionAllowed: false,
  jsonLdAllowed: false,
  indexPromotionAllowed: false,
});
