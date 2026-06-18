#!/usr/bin/env node
import { readFileSync } from 'node:fs';

function fail(message) {
  console.error(`ERROR: GEO-MARKET-GATE-A: ${message}`);
  process.exit(1);
}

function requirePattern(content, pattern, message) {
  if (!pattern.test(content)) fail(message);
}

function forbidPattern(content, pattern, message) {
  if (pattern.test(content)) fail(message);
}

const marketConfig = readFileSync('src/lib/market/public-market.ts', 'utf8');
const i18nConfig = readFileSync('src/lib/i18n/config.ts', 'utf8');
const seoSite = readFileSync('src/lib/seo/site.ts', 'utf8');
const sitemap = readFileSync('src/app/sitemap.ts', 'utf8');
const rootPage = readFileSync('src/app/page.tsx', 'utf8');

requirePattern(marketConfig, /publicMarketCountries\s*=\s*\['om'\]\s+as\s+const/, 'Only Oman must be publicly enabled.');
requirePattern(marketConfig, /seoIndexableMarketCountries\s*=\s*\['om'\]\s+as\s+const/, 'Only Oman must be SEO-indexable.');
requirePattern(marketConfig, /sitemapMarketCountries\s*=\s*\['om'\]\s+as\s+const/, 'Only Oman must be included in sitemap.');

for (const country of ['ae', 'qa', 'bh', 'kw', 'sa', 'iq', 'sy', 'jo', 'lb', 'ps', 'eg', 'ye', 'ma', 'dz', 'tn', 'ly', 'sd', 'mr', 'ir']) {
  requirePattern(
    marketConfig,
    new RegExp(`${country}:\\s*\\{[\\s\\S]*?publicEnabled:\\s*false[\\s\\S]*?seoIndexable:\\s*false[\\s\\S]*?sitemapEnabled:\\s*false`, 'm'),
    `Country ${country} must stay non-public, non-indexable, and excluded from sitemap.`,
  );
}

requirePattern(i18nConfig, /supportedCountries\s*=\s*publicMarketCountries/, 'i18n supportedCountries must come from publicMarketCountries.');
requirePattern(i18nConfig, /isSupportedCountry\s*=\s*isPublicMarketCountry/, 'i18n isSupportedCountry must use market gate.');
forbidPattern(i18nConfig, /supportedCountries\s*=\s*\[[^\]]*'ae'/, 'i18n must not directly expose non-Oman countries.');
forbidPattern(i18nConfig, /supportedCountries\s*=\s*\[[^\]]*'sa'/, 'i18n must not directly expose non-Oman countries.');
forbidPattern(i18nConfig, /supportedCountries\s*=\s*\[[^\]]*'ir'/, 'i18n must not directly expose non-Oman countries.');

requirePattern(seoSite, /supportedCountries\s*=\s*publicMarketCountries/, 'SEO site countries must come from publicMarketCountries.');
requirePattern(seoSite, /defaultCountry:\s*'om'/, 'SEO default country must remain Oman.');

requirePattern(sitemap, /sitemapMarketCountries\.flatMap/, 'Sitemap must be generated from sitemapMarketCountries.');
forbidPattern(sitemap, /siteConfig\.countries\.flatMap/, 'Sitemap must not use all siteConfig countries directly.');
forbidPattern(sitemap, /['"]\/en\/ae['"]|['"]\/ar\/ae['"]/, 'Sitemap must not hardcode UAE URLs.');
forbidPattern(sitemap, /['"]\/en\/sa['"]|['"]\/ar\/sa['"]/, 'Sitemap must not hardcode Saudi URLs.');
forbidPattern(sitemap, /['"]\/en\/ir['"]|['"]\/ar\/ir['"]/, 'Sitemap must not hardcode Iran URLs.');

requirePattern(rootPage, /permanentRedirect\('\/en\/om'\)/, 'Root page must redirect to /en/om.');

console.log('GEO-MARKET-GATE-A static market gate checks passed.');
