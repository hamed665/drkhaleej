import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const projectRoot = process.cwd();

const scannedRoots = ['src', 'scripts', 'public'];
const scannedExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.txt']);

const allowedReferenceFiles = new Set([
  'src/config/geo/oman-location-candidate-paths.ts',
  'src/config/geo/oman-location-candidate-paths.test.ts',
  'scripts/seo/check-location-candidate-path-builder.mjs',
  'scripts/seo/check-location-candidate-path-builder-integration.mjs',
]);

const forbiddenCompositeRouteFiles = [
  'src/app/[locale]/[country]/locations/[governorateSlug]/[categorySlug]/page.tsx',
  'src/app/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]/[categorySlug]/page.tsx',
  'src/app/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]/[areaSlug]/[categorySlug]/page.tsx',
  'src/app/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]/[areaSlug]/services/[serviceSlug]/page.tsx',
  'src/app/[locale]/[country]/locations/[governorateSlug]/[wilayatSlug]/[areaSlug]/specialties/[specialtySlug]/page.tsx',
];

const forbiddenUsageTokens = [
  'oman-location-candidate-paths',
  'buildOmanLocationCandidatePath',
  'buildOmanGovernorateLocationCandidatePath',
  'buildOmanWilayatLocationCandidatePath',
  'buildOmanAreaLocationCandidatePath',
];

function extensionOf(filePath) {
  const dotIndex = filePath.lastIndexOf('.');
  return dotIndex === -1 ? '' : filePath.slice(dotIndex);
}

function collectFiles(rootPath) {
  const absoluteRoot = resolve(projectRoot, rootPath);

  if (!existsSync(absoluteRoot)) {
    return [];
  }

  const files = [];
  const entries = readdirSync(absoluteRoot);

  for (const entry of entries) {
    const absolutePath = join(absoluteRoot, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      files.push(...collectFiles(relative(projectRoot, absolutePath)));
      continue;
    }

    if (stats.isFile() && scannedExtensions.has(extensionOf(absolutePath))) {
      files.push(relative(projectRoot, absolutePath));
    }
  }

  return files;
}

function requireTokens(label, source, tokens) {
  const missing = tokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    console.error(`${label} is missing required candidate path integration guard tokens:`);
    for (const token of missing) {
      console.error(`- ${token}`);
    }
    process.exit(1);
  }
}

for (const routeFile of forbiddenCompositeRouteFiles) {
  if (existsSync(resolve(projectRoot, routeFile))) {
    console.error(`Composite candidate route file must not exist before route promotion is explicitly approved: ${routeFile}`);
    process.exit(1);
  }
}

const violations = [];

for (const root of scannedRoots) {
  for (const relativePath of collectFiles(root)) {
    if (allowedReferenceFiles.has(relativePath)) {
      continue;
    }

    const source = readFileSync(resolve(projectRoot, relativePath), 'utf8');
    const matchedToken = forbiddenUsageTokens.find((token) => source.includes(token));

    if (matchedToken) {
      violations.push(`${relativePath} references ${matchedToken}`);
    }
  }
}

if (violations.length > 0) {
  console.error('Candidate path builder must not be integrated into routes, registries, sitemap, UI, or runtime surfaces yet.');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

const packageJson = readFileSync(resolve(projectRoot, 'package.json'), 'utf8');
requireTokens('package.json', packageJson, [
  'seo:location-candidate-path-integration:validate',
  'check-location-candidate-path-builder-integration.mjs',
]);

console.log('Location candidate path builder integration guard passed.');
