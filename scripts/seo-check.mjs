import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

const requiredFiles = [
  'src/app/robots.ts',
  'src/app/sitemap.ts',
  'src/lib/market/public-market.ts',
  'src/lib/seo/site.ts',
  'src/lib/seo/metadata.ts',
  'public/llms.txt'
];

const approvedDiscoveryRoutes = ['/doctors', '/centers', '/pharmacies', '/pet-clinics', '/pet-shops', '/labs', '/services', '/search'];
const approvedProviderRoutes = ['/for-providers'];

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

const jsonLdPath = 'src/lib/seo/jsonld.ts';
await ensureFileExists(jsonLdPath);
const jsonLdSource = await readText(jsonLdPath);

assertMatch(jsonLdSource, /export\s+function\s+createJsonLd\s*</, 'src/lib/seo/jsonld.ts must export createJsonLd.');
assertMatch(jsonLdSource, /export\s+function\s+serializeJsonLd\s*\(/, 'src/lib/seo/jsonld.ts must export serializeJsonLd.');

for (const token of ['Organization', 'WebSite', 'BreadcrumbList', 'FAQPage', 'Physician', 'MedicalClinic', 'MedicalOrganization']) {
  if (!jsonLdSource.includes(token)) {
    throw new Error(`src/lib/seo/jsonld.ts must include ${token} schema support.`);
  }
}

if (/dangerouslySetInnerHTML/i.test(jsonLdSource)) {
  throw new Error('src/lib/seo/jsonld.ts must not use dangerouslySetInnerHTML.');
}

const forbiddenJsonLdClaimPatterns = [
  /moh[-\s]*verified/i,
  /verified\s+by\s+moh/i,
  /moh\s+approved/i,
  /moh\s+certified/i,
  /\brating(s)?\b/i,
  /\breview(s)?\b/i,
  /\bbook(ing)?\b/i,
  /\binsurance\b/i,
  /\blicense\b/i
];

if (forbiddenJsonLdClaimPatterns.some((pattern) => pattern.test(jsonLdSource))) {
  throw new Error('src/lib/seo/jsonld.ts must not include fake MOH/rating/review/booking/insurance/license claims.');
}

if (
  /from\s+['"`]@supabase\//i.test(jsonLdSource) ||
  /require\(\s*['"`]@supabase\//i.test(jsonLdSource) ||
  /import\(\s*['"`]@supabase\//i.test(jsonLdSource) ||
  /from\s+['"`]react['"`]/i.test(jsonLdSource) ||
  /require\(\s*['"`]react['"`]\s*\)/i.test(jsonLdSource) ||
  /import\(\s*['"`]react['"`]\s*\)/i.test(jsonLdSource)
) {
  throw new Error('src/lib/seo/jsonld.ts must not import Supabase or React.');
}

const marketSource = await readText('src/lib/market/public-market.ts');
const siteSource = await readText('src/lib/seo/site.ts');
const robotsSource = await readText('src/app/robots.ts');
const sitemapSource = await readText('src/app/sitemap.ts');
const metadataSource = await readText('src/lib/seo/metadata.ts');
const seoCheckSource = await readText('scripts/seo-check.mjs');
const llmsSource = await readText('public/llms.txt');

assertMatch(siteSource, /supportedLocales\s*=\s*\[['"]en['"]\s*,\s*['"]ar['"]\]/, 'supportedLocales must include en and ar in src/lib/seo/site.ts');
assertMatch(siteSource, /supportedCountries\s*=\s*publicMarketCountries/, 'SEO supportedCountries must come from publicMarketCountries.');
assertMatch(marketSource, /publicMarketCountries\s*=\s*\['om'\]\s+as\s+const/, 'Only Oman must be public in public-market config.');
assertMatch(marketSource, /seoIndexableMarketCountries\s*=\s*\['om'\]\s+as\s+const/, 'Only Oman must be SEO-indexable in public-market config.');
assertMatch(marketSource, /sitemapMarketCountries\s*=\s*\['om'\]\s+as\s+const/, 'Only Oman must be included in sitemap market config.');

if (!sitemapSource.includes('sitemapMarketCountries.flatMap') || !sitemapSource.includes('localizedRootPath(locale, country)')) {
  throw new Error('src/app/sitemap.ts must build public URLs from sitemapMarketCountries and localizedRootPath(locale, country).');
}

for (const route of approvedDiscoveryRoutes) {
  if (!sitemapSource.includes(route)) {
    throw new Error(`src/app/sitemap.ts must include approved public skeleton route: ${route}.`);
  }
}

for (const route of approvedProviderRoutes) {
  if (!sitemapSource.includes(route)) {
    throw new Error(`src/app/sitemap.ts must include approved provider route: ${route}.`);
  }
}

for (const blockedCountry of ['ae', 'qa', 'bh', 'kw', 'sa', 'iq', 'sy', 'jo', 'lb', 'ps', 'eg', 'ye', 'ma', 'dz', 'tn', 'ly', 'sd', 'mr', 'ir']) {
  const blockedPattern = new RegExp(`/(en|ar)/${blockedCountry}(?:/|['\"\`])`, 'i');
  if (blockedPattern.test(sitemapSource)) {
    throw new Error(`src/app/sitemap.ts must not include non-launched country URLs: ${blockedCountry}.`);
  }
}

if (/\/(doctor|center|service|pharmacy|lab)s?\/\[/.test(sitemapSource)) {
  throw new Error('src/app/sitemap.ts must not include dynamic provider route patterns in this phase.');
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

assertMatch(llmsSource, /drmuscat/i, 'public/llms.txt must mention DrMuscat.');
assertMatch(llmsSource, /\/en\/om/, 'public/llms.txt must mention /en/om.');
assertMatch(llmsSource, /\/ar\/om/, 'public/llms.txt must mention /ar/om.');
assertMatch(llmsSource, /\/robots\.txt/i, 'public/llms.txt must mention /robots.txt.');
assertMatch(llmsSource, /\/sitemap\.xml/i, 'public/llms.txt must mention /sitemap.xml.');

if (!/(not yet public|are not yet public|not public in this phase)/i.test(llmsSource)) {
  throw new Error('public/llms.txt must clearly state future doctor/center/service/pharmacy/laboratory/programmatic pages are not yet public in this phase.');
}

const forbiddenMohPositiveClaimPatterns = [
  /\bmoh[-\s]*verified\b/i,
  /\bverified\s+by\s+moh\b/i,
  /\bmoh[-\s]*approved\b/i,
  /\bmoh\s+approved\b/i,
  /\bmoh\s+certified\b/i,
  /\bcertified\s+by\s+moh\b/i,
  /\bmoh\s+verification\s+badge\b/i,
  /\bofficial\s+moh\s+verification\b/i,
  /\bmoh\s+checked\b/i,
  /\bchecked\s+by\s+moh\b/i
];

if (forbiddenMohPositiveClaimPatterns.some((pattern) => pattern.test(llmsSource))) {
  throw new Error('public/llms.txt must not claim MOH verification or approval.');
}

const forbiddenAiSymptomPositiveClaimPatterns = [
  /\bai\s*diagnosis\s+is\s+available\b/i,
  /\bai\s*diagnosis\s+available\b/i,
  /\boffers\s+ai\s*diagnosis\b/i,
  /\bprovides\s+ai\s*diagnosis\b/i,
  /\bai\s*diagnostic\s+tool\b/i,
  /\bai[-\s]*powered\s+diagnosis\b/i,
  /\bsymptom\s*checker\s+is\s+available\b/i,
  /\bsymptom\s*checker\s+available\b/i,
  /\buse\s+our\s+symptom\s*checker\b/i,
  /\btry\s+our\s+symptom\s*checker\b/i,
  /\bai\s*symptom\s*checker\b/i,
  /\bdiagnose\s+your\s+symptoms\b/i,
  /\bget\s+a\s+diagnosis\b/i,
  /\bmedical\s+diagnosis\s+by\s+ai\b/i
];

if (forbiddenAiSymptomPositiveClaimPatterns.some((pattern) => pattern.test(llmsSource))) {
  throw new Error('public/llms.txt must not claim AI diagnosis or symptom checker availability.');
}

console.log('seo:check passed (robots, sitemap, market gate, llms, and static SEO constraints verified).');
