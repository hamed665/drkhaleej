import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

async function assertFile(relativePath) {
  try {
    await access(path.join(root, relativePath));
  } catch {
    throw new Error(`Missing required file: ${relativePath}`);
  }
}

function assertIncludes(source, token, message) {
  if (!source.includes(token)) throw new Error(message);
}

function assertNotIncludes(source, token, message) {
  if (source.includes(token)) throw new Error(message);
}

for (const file of [
  'docs/LAUNCH_RULES.md',
  'docs/PUBLIC_SURFACE_POLICY.md',
  'docs/launch/SOFT_LAUNCH_2026_06_30.md',
  'public/llms.txt',
  'src/lib/seo/page-registry.ts',
  'src/app/sitemap.ts',
  'src/app/robots.ts',
  'src/lib/seo/metadata.ts',
  'src/components/layout/site-header.tsx',
  'src/components/layout/app-shell.tsx',
  'scripts/seo/check-noindex-preview-structured-data.mjs',
]) {
  await assertFile(file);
}

const rules = await readText('docs/LAUNCH_RULES.md');
const policy = await readText('docs/PUBLIC_SURFACE_POLICY.md');
const checklist = await readText('docs/launch/SOFT_LAUNCH_2026_06_30.md');
const registry = await readText('src/lib/seo/page-registry.ts');
const sitemap = await readText('src/app/sitemap.ts');
const robots = await readText('src/app/robots.ts');
const metadata = await readText('src/lib/seo/metadata.ts');
const llms = await readText('public/llms.txt');
const header = await readText('src/components/layout/site-header.tsx');
const shell = await readText('src/components/layout/app-shell.tsx');
const previewGuard = await readText('scripts/seo/check-noindex-preview-structured-data.mjs');

for (const token of ['SOFT_LAUNCH_CONTROLLED', 'Sitemap output is an allowlist', 'Rollback rule']) {
  assertIncludes(rules, token, `launch rules must include ${token}`);
}

for (const token of ['Provider profile policy', 'Navigation policy', 'Structured data policy']) {
  assertIncludes(policy, token, `public surface policy must include ${token}`);
}

for (const token of ['Static public allowlist', 'Sitemap expectations', 'Rollback plan', 'Go decision', 'No-go decision']) {
  assertIncludes(checklist, token, `soft launch checklist must include ${token}`);
}

for (const token of ['listSitemapEligibleSeoPageDefinitions()', 'listPublicImportSitemapEntries()']) {
  assertIncludes(sitemap, token, `sitemap must include ${token}`);
}

for (const token of ['robotsForStaticSeoPage', 'noindexFollowRobots']) {
  assertIncludes(metadata, token, `metadata helper must include ${token}`);
}

for (const token of ['/api/', '/admin/', '/dashboard/', '/import/', '/preview/', '/demo/']) {
  assertIncludes(robots, token, `robots must keep internal disallow token ${token}`);
}

for (const token of ['/en/om/dental', '/ar/om/dental', '/en/om/beauty', '/ar/om/beauty', '/en/om/offers', '/ar/om/offers', '/en/om/search', '/ar/om/search']) {
  assertNotIncludes(robots, token, `robots must not block preview route token ${token}`);
}

for (const route of ['/doctors', '/centers', '/labs', '/pharmacies', '/hospitals', '/services', '/for-providers']) {
  assertIncludes(registry, `pathname: '${route}'`, `route registry must include ${route}`);
}

for (const route of ['/dental', '/beauty', '/offers', '/pet-clinics', '/pet-shops', '/search']) {
  const routeToken = `pathname: '${route}'`;
  const index = registry.indexOf(routeToken);
  if (index < 0) throw new Error(`route registry must include preview route ${route}`);
  const block = registry.slice(index, registry.indexOf('}', index) + 1);
  assertIncludes(block, "indexPolicy: 'noindex_until_ready'", `${route} must remain noindex_until_ready.`);
  assertIncludes(block, 'sitemapEligible: false', `${route} must remain sitemap-excluded.`);
}

for (const route of ['doctors', 'centers', 'labs', 'pharmacies', 'hospitals', 'services']) {
  assertIncludes(header, `publicDiscoveryRoute(locale, country, '${route}')`, `header must include ${route}`);
}

for (const route of ['dental', 'beauty', 'offers', 'pet-clinics', 'pet-shops']) {
  assertNotIncludes(header, `publicDiscoveryRoute(locale, country, '${route}')`, `header must not include preview route ${route}`);
}

assertNotIncludes(shell, '<main id="main-content"', 'app shell must not create nested main content landmark.');
assertIncludes(shell, '<div id="main-content"', 'app shell must preserve skip-link target.');

for (const token of ['## Index-ready public routes', '## Noindex preview routes', '/robots.txt', '/sitemap.xml']) {
  assertIncludes(llms, token, `llms.txt must include ${token}`);
}

for (const token of ['application/ld+json', 'buildFaqJsonLd', 'AggregateRating', 'openingHours']) {
  assertIncludes(previewGuard, token, `preview structured-data guard must check ${token}`);
}

console.log('soft launch check passed.');
