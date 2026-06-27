import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

const staticScanFiles = [
  'public/llms.txt',
  'src/components/home/HomePage2026HeaderHero.tsx',
  'src/components/home/HomeSearch2026.tsx',
  'src/components/home/HomeEntityClarity2026.tsx',
  'src/components/home/HomeFeaturedBoard2026.tsx',
  'src/components/home/HomeDiscoveryCategories2026.tsx',
  'src/components/home/HomeSpecialOffersShowcase2026.tsx',
  'src/components/home/HomeProviderCTA2026.tsx',
  'src/components/home/HomeFAQ2026.tsx',
  'src/components/home/HomeTrustSafety2026.tsx',
  'src/components/home/HomeSupportContact2026.tsx',
  'src/lib/seo/site.ts',
  'src/lib/seo/metadata.ts',
  'src/lib/seo/jsonld.ts',
  'src/lib/seo/faq-jsonld.ts',
  'src/lib/seo/page-registry.ts'
];

const blockedParts = [
  ['Dr', 'Muscat'],
  ['Dr ', 'Muscat'],
  ['Doc', 'tor ', 'Muscat'],
  [String.fromCharCode(1583, 1705, 1578, 1585), ' ', String.fromCharCode(1605, 1587, 1602, 1591)],
  [String.fromCharCode(1583, 1603, 1578, 1608, 1585), ' ', String.fromCharCode(1605, 1587, 1602, 1591)],
  [String.fromCharCode(1583), '.', ' ', String.fromCharCode(1605, 1587, 1602, 1591)]
];

const blockedValues = blockedParts.map((parts) => parts.join(''));

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function routeFileForPathname(pathname) {
  return pathname === '/'
    ? 'src/app/[locale]/[country]/page.tsx'
    : `src/app/[locale]/[country]${pathname}/page.tsx`;
}

function assertNoBlockedText(relativePath, source) {
  for (const value of blockedValues) {
    if (source.includes(value)) {
      throw new Error(`${relativePath} contains previous public name text.`);
    }
  }
}

const registrySource = await readText('src/lib/seo/page-registry.ts');
const staticRouteMatches = [...registrySource.matchAll(/['"](\/[a-z0-9-]+)['"]/gi)].map((match) => match[1]);
const publicPageFiles = ['/', ...new Set(staticRouteMatches)].map(routeFileForPathname);
const files = [...new Set([...staticScanFiles, ...publicPageFiles])];

for (const file of files) {
  const source = await readText(file);
  assertNoBlockedText(file, source);
}

console.log(`public text contract check passed for ${files.length} files.`);
