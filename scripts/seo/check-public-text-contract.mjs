import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

const staticScanRoots = [
  'public/llms.txt',
  'src/components/home',
  'src/lib/seo'
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
const checkedExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.md', '.txt']);

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

async function listFiles(relativePath) {
  const absolutePath = path.join(root, relativePath);
  const fileStat = await stat(absolutePath);

  if (fileStat.isFile()) return [relativePath];

  const entries = await readdir(absolutePath, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => listFiles(path.join(relativePath, entry.name)))
  );

  return nested.flat();
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

const staticFiles = (await Promise.all(staticScanRoots.map((entry) => listFiles(entry))))
  .flat()
  .filter((file) => checkedExtensions.has(path.extname(file)))
  .filter((file) => !file.includes('.test.'));

const files = [...new Set([...staticFiles, ...publicPageFiles])];

for (const file of files) {
  const source = await readText(file);
  assertNoBlockedText(file, source);
}

console.log(`public text contract check passed for ${files.length} files.`);
