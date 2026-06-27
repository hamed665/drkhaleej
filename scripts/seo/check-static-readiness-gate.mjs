import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assertIncludes(source, needle, message) {
  if (!source.includes(needle)) throw new Error(message);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function routeBlock(source, route) {
  const routePattern = new RegExp(String.raw`\{[\s\S]*?pathname:\s*['"]${escapeRegExp(route)}['"][\s\S]*?\}`, 'm');
  const match = source.match(routePattern);
  if (!match) throw new Error(`Missing static SEO route definition for ${route}.`);
  return match[0];
}

function assertRouteReady(source, route) {
  const block = routeBlock(source, route);
  assertIncludes(block, "indexPolicy: 'index'", `${route} must use index policy for launch.`);
  assertIncludes(block, "readiness: 'ready'", `${route} must be launch-ready.`);
  assertIncludes(block, 'sitemapEligible: true', `${route} must be sitemap eligible.`);
}

function assertRouteNoindexUntilReady(source, route) {
  const block = routeBlock(source, route);
  assertIncludes(block, "indexPolicy: 'noindex_until_ready'", `${route} must remain noindex until ready.`);
  assertIncludes(block, 'sitemapEligible: false', `${route} must stay out of sitemap until ready.`);
}

const registrySource = await readText('src/lib/seo/page-registry.ts');
const metadataSource = await readText('src/lib/seo/metadata.ts');
const sitemapSource = await readText('src/app/sitemap.ts');
const packageSource = await readText('package.json');

for (const token of [
  'SeoPageLaunchGateReason',
  'launchGateReason',
  'getPublicSeoPageDefinition',
  'isSitemapReadySeoPageDefinition',
  'listSitemapEligibleSeoPageDefinitions',
]) {
  assertIncludes(registrySource, token, `page registry must expose ${token}.`);
}

for (const route of ['/', '/doctors', '/centers', '/labs', '/pharmacies', '/hospitals', '/services', '/for-providers']) {
  if (route === '/') continue;
  assertRouteReady(registrySource, route);
}

for (const route of ['/dental', '/beauty', '/offers', '/pet-clinics', '/pet-shops', '/search']) {
  assertRouteNoindexUntilReady(registrySource, route);
}

assertIncludes(metadataSource, 'robotsForStaticSeoPage', 'metadata helper must apply static SEO readiness robots.');
assertIncludes(metadataSource, 'getPublicSeoPageDefinition', 'metadata helper must read static SEO page definitions.');
assertIncludes(metadataSource, 'noindexFollowRobots', 'metadata helper must noindex unready static pages while preserving follow.');
assertIncludes(metadataSource, 'isSitemapReadySeoPageDefinition(page)', 'metadata helper must share the sitemap readiness decision.');
assertIncludes(sitemapSource, 'listSitemapEligibleSeoPageDefinitions()', 'sitemap must be generated from index-ready registry entries only.');
assertIncludes(packageSource, 'seo:static-readiness:validate', 'package.json must expose static readiness validation.');

console.log('static readiness gate check passed.');
