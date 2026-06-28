import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();

const files = {
  helper: 'src/config/geo/oman-location-paths.ts',
  test: 'src/config/geo/oman-location-paths.test.ts',
  contract: 'docs/DRKHALEEJ_CANONICAL_URL_GEO_CONTRACT_V2.md',
  packageJson: 'package.json',
};

function read(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8');
}

function requireTokens(label, source, tokens) {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    console.error(`${label} is missing required parent-aware location path tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

function forbidTokens(label, source, tokens) {
  const forbidden = tokens.filter((token) => source.includes(token));
  if (forbidden.length > 0) {
    console.error(`${label} contains forbidden parentless location path tokens:`);
    for (const token of forbidden) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

const helperSource = read(files.helper);
const testSource = read(files.test);
const contractSource = read(files.contract);
const packageSource = read(files.packageJson);

requireTokens(files.helper, helperSource, [
  'buildOmanLocationPath',
  "level: 'governorate'",
  "level: 'wilayat'",
  "level: 'area'",
  '/locations/${input.governorateSlug}',
  '${basePath}/${input.wilayatSlug}',
  '${wilayatPath}/${input.areaSlug}',
  'canonicalSlugPattern',
]);

requireTokens(files.test, testSource, [
  '/en/om/locations/muscat',
  '/ar/om/locations/muscat/al-seeb',
  '/en/om/locations/muscat/al-seeb/al-khoud',
  'toThrow',
]);

requireTokens(files.contract, contractSource, [
  '/{locale}/{country}/locations/{governorateSlug}/{wilayatSlug}/{areaSlug}',
  'parent-aware location paths',
]);

requireTokens(files.packageJson, packageSource, [
  'seo:location-path-helper:validate',
  'check-parent-aware-location-path-helper.mjs',
]);

forbidTokens(files.helper, helperSource, ['/areas/']);
forbidTokens(files.test, testSource, ['/areas/']);

console.log('Parent-aware location path helper validation passed.');
