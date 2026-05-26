import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

const requiredFiles = [
  'src/app/robots.ts',
  'src/app/sitemap.ts',
  'src/lib/seo/site.ts',
  'src/lib/seo/metadata.ts'
];

const forbiddenRouteTokens = ['doctor', 'center', 'service', 'pharmacy', 'lab'];

async function ensureFileExists(relativePath) {
  const absolutePath = path.join(root, relativePath);
  try {
    await access(absolutePath);
  } catch {
    throw new Error(`Missing required file: ${relativePath}`);
  }
}

async function readText(relativePath) {
  const absolutePath = path.join(root, relativePath);
  return readFile(absolutePath, 'utf8');
}

function assertMatch(source, regex, message) {
  if (!regex.test(source)) {
    throw new Error(message);
  }
}

for (const file of requiredFiles) {
  await ensureFileExists(file);
}

const siteSource = await readText('src/lib/seo/site.ts');
const robotsSource = await readText('src/app/robots.ts');
const sitemapSource = await readText('src/app/sitemap.ts');
const metadataSource = await readText('src/lib/seo/metadata.ts');
const seoCheckSource = await readText('scripts/seo-check.mjs');

assertMatch(siteSource, /supportedLocales\s*=\s*\[['"]en['"]\s*,\s*['"]ar['"]\]/, 'supportedLocales must include en and ar in src/lib/seo/site.ts');
assertMatch(siteSource, /supportedCountries\s*=\s*\[['"]om['"]\]/, 'supportedCountries must include om in src/lib/seo/site.ts');

if (!sitemapSource.includes("localizedRootPath('en')") || !sitemapSource.includes("localizedRootPath('ar')")) {
  throw new Error('src/app/sitemap.ts must include /en/om and /ar/om via localizedRootPath helper usage.');
}

for (const token of forbiddenRouteTokens) {
  if (new RegExp(`['"\\"]/[^'"\\n]*${token}`, 'i').test(sitemapSource)) {
    throw new Error(`src/app/sitemap.ts must not include programmatic ${token} routes in Phase 4.0B.`);
  }
}

if (!/sitemap\s*:/.test(robotsSource)) {
  throw new Error('src/app/robots.ts must reference sitemap.');
}

if (/https:\/\/[^'"\s]+/i.test(robotsSource) && !robotsSource.includes('siteConfig.baseUrl')) {
  throw new Error('src/app/robots.ts must not require hardcoded production-only URLs.');
}

for (const [name, source] of [
  ['src/app/robots.ts', robotsSource],
  ['src/app/sitemap.ts', sitemapSource]
]) {
  if (/supabase/i.test(source)) {
    throw new Error(`Forbidden Supabase reference detected in ${name}.`);
  }
}

if (
  /from\s+['"`]@supabase\//i.test(seoCheckSource) ||
  /require\(\s*['"`]@supabase\//i.test(seoCheckSource) ||
  /import\(\s*['"`]@supabase\//i.test(seoCheckSource)
) {
  throw new Error('Forbidden Supabase import/require detected in scripts/seo-check.mjs.');
}

if (!metadataSource.includes('siteConfig.baseUrl')) {
  throw new Error('src/lib/seo/metadata.ts must continue using siteConfig.baseUrl.');
}

console.log('seo:check passed (robots, sitemap, locales/countries, and static SEO constraints verified).');
