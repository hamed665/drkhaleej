#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const verifierPath = path.resolve('src/server/admin/import-pharmacy-private-public-exposure-verifier.ts');
const routePath = path.resolve('src/app/[locale]/[country]/pharmacies/[pharmacySlug]/page.tsx');
const guardPath = path.resolve('src/server/public/import-pharmacy-profile-guard.ts');
const sitemapPath = path.resolve('src/server/public/import-sitemap.ts');

for (const file of [verifierPath, routePath, guardPath, sitemapPath]) {
  if (!existsSync(file)) throw new Error(`private pharmacy verification file missing: ${file}`);
}

const verifier = readFileSync(verifierPath, 'utf8');
const route = readFileSync(routePath, 'utf8');
const guard = readFileSync(guardPath, 'utf8');
const sitemap = readFileSync(sitemapPath, 'utf8');

for (const pattern of [
  /publicProfileResolved/,
  /routeStatus\s*!==\s*404/,
  /robotsIndex\s*===\s*true/,
  /canonicalHref\s*!==\s*null/,
  /hreflangCount\s*!==\s*0/,
  /jsonLdCount\s*!==\s*0/,
  /queryCount\s*>\s*MAXIMUM_PRIVATE_ROUTE_QUERIES/,
  /listedInSearch/,
  /listedInSitemap/,
  /maximumQueries:\s*2/,
  /maximumHtmlBytes:\s*120000/,
]) {
  if (!pattern.test(verifier)) throw new Error(`private exposure verifier missing required pattern: ${pattern}`);
}

for (const pattern of [
  /if \(!result\.ok\) notFound\(\)/,
  /robots:\s*\{\s*index:\s*false/,
]) {
  if (!pattern.test(route)) throw new Error(`pharmacy route missing private fail-closed pattern: ${pattern}`);
}

for (const pattern of [
  /publish_status !== "index_eligible"/,
  /index_policy !== "index"/,
  /sitemap_policy !== "included"/,
  /metadata\.sitemap_included !== true/,
  /robots_policy"\) !== "index"/,
  /\.eq\("publish_status", "index_eligible"\)/,
  /\.eq\("index_policy", "index"\)/,
  /\.eq\("sitemap_policy", "included"\)/,
  /\.limit\(lookupLimit\)/,
]) {
  if (!pattern.test(guard)) throw new Error(`public pharmacy guard missing exposure gate: ${pattern}`);
}

if (!/target_entity_type/.test(sitemap) || !/sitemap_policy/.test(sitemap)) {
  throw new Error('import sitemap must remain policy-gated.');
}

for (const pattern of [/publicRouteEnabled:\s*true/, /indexable:\s*true/, /sitemapEligible:\s*true/]) {
  if (pattern.test(verifier)) throw new Error(`private verifier contains forbidden promotion pattern: ${pattern}`);
}

console.log('private pharmacy public exposure validation passed.');
