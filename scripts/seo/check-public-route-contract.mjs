import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const locales = ['en', 'ar'];
const country = 'om';
const configBuilderPattern = /\bbuild[A-Za-z0-9]+DiscoveryConfig\s*\(/;
const protectedConfigPattern = /\bcleanConfigBrand\s*\(\s*build[A-Za-z0-9]+DiscoveryConfig\s*\(/;

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

async function ensureFile(relativePath) {
  try {
    await access(path.join(root, relativePath));
  } catch {
    throw new Error(`Missing file: ${relativePath}`);
  }
}

function assertIncludes(source, needle, message) {
  if (!source.includes(needle)) throw new Error(message);
}

function routeFileForPathname(pathname) {
  return pathname === '/'
    ? 'src/app/[locale]/[country]/page.tsx'
    : `src/app/[locale]/[country]${pathname}/page.tsx`;
}

function localizedPath(locale, pathname) {
  return pathname === '/' ? `/${locale}/${country}` : `/${locale}/${country}${pathname}`;
}

function assertProtectedConfig(file, source) {
  if (!configBuilderPattern.test(source)) return;
  assertIncludes(source, 'cleanConfigBrand', `${file} must import the config brand cleaner.`);
  if (!protectedConfigPattern.test(source)) {
    throw new Error(`${file} must wrap discovery config builder output with cleanConfigBrand(...).`);
  }
}

const llmsSource = await readText('public/llms.txt');
const registrySource = await readText('src/lib/seo/page-registry.ts');
const staticRouteMatches = [...registrySource.matchAll(/['"](\/[a-z0-9-]+)['"]/gi)].map((match) => match[1]);
const publicPathnames = ['/', ...new Set(staticRouteMatches)].sort();

if (publicPathnames.length < 10) {
  throw new Error('Route contract did not discover the expected routes.');
}

for (const pathname of publicPathnames) {
  for (const locale of locales) {
    assertIncludes(llmsSource, localizedPath(locale, pathname), `Missing listed path for ${locale} ${pathname}.`);
  }

  const file = routeFileForPathname(pathname);
  await ensureFile(file);
  const source = await readText(file);
  assertIncludes(source, 'generateMetadata', `${file} must expose metadata generation.`);
  assertIncludes(source, 'export default', `${file} must expose a page component.`);
  assertProtectedConfig(file, source);
}

console.log('route contract check passed.');
