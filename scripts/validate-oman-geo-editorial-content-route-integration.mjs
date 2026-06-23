import fs from 'node:fs';

const accessorPath = 'src/lib/geo/oman-editorial-content.ts';
const scaffoldPath = 'src/components/geo/oman-geo-runtime-scaffold.tsx';
const routeFiles = [
  {
    path: 'src/app/[locale]/[country]/oman/governorates/[governorateSlug]/page.tsx',
    entity: 'governorate',
    slugExpression: 'governorate.slug',
  },
  {
    path: 'src/app/[locale]/[country]/oman/wilayats/[wilayatSlug]/page.tsx',
    entity: 'wilayat',
    slugExpression: 'wilayat.slug',
  },
  {
    path: 'src/app/[locale]/[country]/oman/areas/[areaSlug]/page.tsx',
    entity: 'area',
    slugExpression: 'area.slug',
  },
];

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${filePath}`);
  }

  return fs.readFileSync(filePath, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const accessorSource = readFile(accessorPath);
const scaffoldSource = readFile(scaffoldPath);

assert(accessorSource.includes('listPublishedOmanGeoEditorialContent'), 'Missing published editorial content list helper.');
assert(accessorSource.includes('getOmanGeoEditorialContent'), 'Missing editorial content lookup helper.');
assert(accessorSource.includes("entry.status === 'published'"), 'Accessor must only expose published content.');
assert(accessorSource.includes('entry.reviewedByHuman === true'), 'Accessor must only expose human-reviewed content.');

assert(scaffoldSource.includes('OmanGeoEditorialContentEntry'), 'Runtime scaffold must accept typed editorial content.');
assert(scaffoldSource.includes('editorialContent?: OmanGeoEditorialContentEntry | null'), 'Runtime scaffold must accept nullable editorial content.');
assert(scaffoldSource.includes('editorialContent = null'), 'Runtime scaffold must default editorial content to null.');
assert(scaffoldSource.includes('data-editorial-content-status'), 'Runtime scaffold must expose editorial content status for QA.');
assert(scaffoldSource.includes('editorialContent.blocks.map'), 'Runtime scaffold must render published editorial content blocks when present.');
assert(scaffoldSource.includes('editorialEmpty'), 'Runtime scaffold must render safe empty editorial state when absent.');

for (const route of routeFiles) {
  const source = readFile(route.path);

  assert(source.includes('getOmanGeoEditorialContent'), `Route must import editorial content accessor: ${route.path}`);
  assert(source.includes('const editorialContent = getOmanGeoEditorialContent({'), `Route must call editorial content accessor: ${route.path}`);
  assert(source.includes(`entity: '${route.entity}'`), `Route must use correct editorial content entity: ${route.path}`);
  assert(source.includes(`slug: ${route.slugExpression}`), `Route must use correct editorial content slug: ${route.path}`);
  assert(source.includes('locale,'), `Route must pass locale to editorial content accessor: ${route.path}`);
  assert(source.includes('editorialContent={editorialContent}'), `Route must pass editorial content into scaffold: ${route.path}`);
  assert(!source.includes('sitemap'), `Route integration must not add sitemap behavior: ${route.path}`);
  assert(!source.includes('jsonLd'), `Route integration must not add JSON-LD behavior: ${route.path}`);
}

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
  assert(!accessorSource.includes(signal), `Editorial content accessor must not include runtime data access signal: ${signal}`);
}

console.log('Oman geo editorial content route integration validated.');
console.log({
  routeFiles: routeFiles.length,
  accessorFiltersPublishedContent: true,
  accessorFiltersHumanReviewedContent: true,
  scaffoldSupportsEditorialContent: true,
});
