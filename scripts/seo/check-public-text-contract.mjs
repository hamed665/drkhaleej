import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

const scanRoots = [
  'public/llms.txt',
  'src/app/[locale]/[country]',
  'src/components/home',
  'src/lib/seo'
];

const ignoredPathFragments = [
  '.test.',
  'for-providers/page-content.tsx'
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

function shouldIgnore(relativePath) {
  return ignoredPathFragments.some((fragment) => relativePath.includes(fragment));
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

function assertNoBlockedText(relativePath, source) {
  for (const value of blockedValues) {
    if (source.includes(value)) {
      throw new Error(`${relativePath} contains previous public name text.`);
    }
  }
}

const files = (await Promise.all(scanRoots.map((entry) => listFiles(entry))))
  .flat()
  .filter((file) => checkedExtensions.has(path.extname(file)))
  .filter((file) => !shouldIgnore(file));

for (const file of files) {
  const source = await readFile(path.join(root, file), 'utf8');
  assertNoBlockedText(file, source);
}

console.log(`public text contract check passed for ${files.length} files.`);
