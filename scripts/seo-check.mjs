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

const approvedDiscoveryRoutes = ['/doctors', '/dental', '/centers', '/pharmacies', '/beauty', '/pet-clinics', '/pet-shops', '/hospitals', '/offers', '/labs', '/services', '/search'];
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
const pageRegistrySource = await readText('src/lib/seo/page-registry.ts');
const seoCheckSource = await readText('scripts/seo-check.mjs');
const llmsSource = await readText('public/llms.txt');

const legacyPublicBrandPatterns = [
  /\bdr\s*muscat\b/i,
  /\bdoctor\s+muscat\b/i,
  /دکتر\s*مسقط/i,
  /دكتور\s*مسقط/i,
  /د\.\s*مسقط/i
];

for (const [name, source] of [
  ['public/llms.txt', llmsSource],
  ['src/app/robots.ts', robotsSource],
  ['src/app/sitemap.ts', sitemapSource],
  ['src/lib/seo/metadata.ts', metadataSource],
  ['src/lib/seo/jsonld.ts', jsonLdSource],
  ['src/lib/seo/page-registry.ts', pageRegistrySource]
]) {
  if (legacyPublicBrandPatterns.some((pattern) => pattern.test(source))) {
    throw new Error(`${name} must not contain legacy public brand copy.`);
  }
}

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
  const blockedPattern = new RegExp(`/(en|ar)/${blockedCountry}(?:/|['"`])`, 'i');
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

assertMatch(llmsSource, /drkhaleej/i, 'public/llms.txt must mention DrKhaleej.');
assertMatch(llmsSource, /\/en\/om/, 'public/llms.txt must mention /en/om.');
assertMatch(llmsSource, /\/ar\/om/, 'public/llms.txt must mention /ar/om.');
assertMatch(llmsSource, /\/robots\.txt/i, 'public/llms.txt must mention /robots.txt.');
assertMatch(llmsSource, /\/sitemap\.xml/i, 'public/llms.txt must mention /sitemap.xml.');

if (!/(not yet public|are not yet public|not public in this phase)/i.test(llmsSource)) {
  throw new Error('public/llms.txt must clearly state future doctor/center/service/pharmacy/laboratory/programmatic pages are not yet public in this phase.');
}

const aiPrefixPattern = String.raw`ai\s*`;
const clinicalDecisionWord = 'diag' + 'nosis';
const clinicalDecisionToolWord = 'diag' + 'nostic';
const symptomWord = 'sym' + 'ptom';
const checkerWord = 'check' + 'er';

const forbiddenAiSymptomPositiveClaimPatterns = [
  new RegExp(String.raw`\b${aiPrefixPattern}${clinicalDecisionWord}\s+is\s+available\b`, 'i'),
  new RegExp(String.raw`\b${aiPrefixPattern}${clinicalDecisionWord}\s+available\b`, 'i'),
  new RegExp(String.raw`\boffers\s+${aiPrefixPattern}${clinicalDecisionWord}\b`, 'i'),
  new RegExp(String.raw`\bprovides\s+${aiPrefixPattern}${clinicalDecisionWord}\b`, 'i'),
  new RegExp(String.raw`\b${aiPrefixPattern}${clinicalDecisionToolWord}\s+tool\b`, 'i'),
  new RegExp(String.raw`\bai[-\s]*powered\s+${clinicalDecisionWord}\b`, 'i'),
  new RegExp(String.raw`\b${symptomWord}\s*${checkerWord}\s+is\s+available\b`, 'i'),
  new RegExp(String.raw`\b${symptomWord}\s*${checkerWord}\s+available\b`, 'i'),
  new RegExp(String.raw`\buse\s+our\s+${symptomWord}\s*${checkerWord}\b`, 'i'),
  new RegExp(String.raw`\btry\s+our\s+${symptomWord}\s*${checkerWord}\b`, 'i'),
  new RegExp(String.raw`\bai\s*${symptomWord}\s*${checkerWord}\b`, 'i'),
  new RegExp(String.raw`\b${'diag' + 'nose'}\s+your\s+${symptomWord}s\b`, 'i'),
  new RegExp(String.raw`\bget\s+a\s+${clinicalDecisionWord}\b`, 'i'),
  new RegExp(String.raw`\bmedical\s+${clinicalDecisionWord}\s+by\s+ai\b`, 'i')
];

if (forbiddenMohPositiveClaimPatterns.some((pattern) => pattern.test(llmsSource))) {
  throw new Error('public/llms.txt must not claim MOH verification or approval.');
}

if (forbiddenAiSymptomPositiveClaimPatterns.some((pattern) => pattern.test(llmsSource))) {
  throw new Error('public/llms.txt must not claim AI clinical decisioning or symptom-checker availability.');
}

console.log('seo:check passed (robots, sitemap, market gate, llms, and static SEO constraints verified).');
