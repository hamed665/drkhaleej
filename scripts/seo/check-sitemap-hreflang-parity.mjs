import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) throw new Error(`Missing file: ${file}`);
  return fs.readFileSync(full, 'utf8');
}

function mustHave(source, token, label) {
  if (!source.includes(token)) throw new Error(`${label} must include: ${token}`);
}

const sitemapPath = 'src/app/sitemap.ts';
const metadataPath = 'src/lib/seo/metadata.ts';
const registryPath = 'src/lib/seo/page-registry.ts';

const sitemap = read(sitemapPath);
const metadata = read(metadataPath);
const registry = read(registryPath);

for (const token of [
  'listSitemapEligibleSeoPageDefinitions',
  'siteConfig.baseUrl',
  'new URL(page.pathname, siteConfig.baseUrl)',
  'return [...staticEntries, ...importedEntries]',
]) {
  mustHave(sitemap, token, sitemapPath);
}

for (const token of [
  'listPublicSeoPageDefinitions',
  'isSitemapReadySeoPageDefinition',
  'listSitemapEligibleSeoPageDefinitions',
  "page.indexPolicy === 'index'",
  "page.readiness === 'ready'",
  'page.sitemapEligible',
]) {
  mustHave(registry, token, registryPath);
}

for (const token of [
  'buildCanonicalUrl',
  'robotsForStaticSeoPage',
  'isSitemapReadySeoPageDefinition',
  'alternates',
  'languages',
  "[regionalLanguageCode('en', country)]",
  "[regionalLanguageCode('ar', country)]",
  'en: englishAlternate',
  'ar: arabicAlternate',
  "'x-default': englishAlternate",
  'openGraphLocale(locale, country)',
  'url: canonical',
]) {
  mustHave(metadata, token, metadataPath);
}

console.log('Sitemap and hreflang parity checks passed.');
