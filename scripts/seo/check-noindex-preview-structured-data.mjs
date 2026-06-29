import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

async function fileExists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

function routeFileForPathname(pathname) {
  return pathname === '/'
    ? 'src/app/[locale]/[country]/page.tsx'
    : `src/app/[locale]/[country]${pathname}/page.tsx`;
}

function routeBlocks(source) {
  return [...source.matchAll(/\{[\s\S]*?pathname:\s*['"](\/[a-z0-9-]+)['"][\s\S]*?\}/g)].map((match) => ({
    pathname: match[1],
    block: match[0],
  }));
}

function isNoindexOrBlocked(block) {
  return (
    block.includes("indexPolicy: 'noindex_until_ready'") ||
    block.includes("readiness: 'blocked'") ||
    block.includes('sitemapEligible: false')
  );
}

const forbiddenTokens = [
  'application/ld+json',
  'buildFaqJsonLd',
  'FAQPage',
  'LocalBusiness',
  'MedicalBusiness',
  'Hospital',
  'Pharmacy',
  'Physician',
  'Dentist',
  'Review',
  'AggregateRating',
  'openingHours',
  'ratingValue',
];

const registrySource = await readText('src/lib/seo/page-registry.ts');
const previewRoutes = routeBlocks(registrySource)
  .filter(({ block }) => isNoindexOrBlocked(block))
  .map(({ pathname }) => pathname)
  .sort();

if (previewRoutes.length === 0) {
  throw new Error('No noindex or blocked preview routes were discovered from the static route registry.');
}

for (const pathname of previewRoutes) {
  const file = routeFileForPathname(pathname);

  if (!(await fileExists(file))) {
    throw new Error(`Noindex preview route is registered but missing a page file: ${pathname} -> ${file}`);
  }

  const source = await readText(file);

  for (const token of forbiddenTokens) {
    if (source.includes(token)) {
      throw new Error(`${file} must not emit or import structured data token on noindex/blocked preview route ${pathname}: ${token}`);
    }
  }
}

console.log(`noindex preview structured data check passed for ${previewRoutes.length} routes.`);
