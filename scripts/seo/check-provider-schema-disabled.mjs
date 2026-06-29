import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

const providerRouteFiles = [
  'src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx',
  'src/app/[locale]/[country]/pharmacies/[pharmacySlug]/page.tsx',
  'src/pages/[locale]/[country]/hospitals/[hospitalSlug].tsx',
];

const forbiddenTokens = [
  'application/ld+json',
  'createJsonLd',
  'serializeJsonLd',
  'buildFaqJsonLd',
  'FAQPage',
  'AggregateRating',
  'Review',
  'openingHours',
  'ratingValue',
];

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

async function assertFile(relativePath) {
  try {
    await access(path.join(root, relativePath));
  } catch {
    throw new Error(`Missing provider route file: ${relativePath}`);
  }
}

for (const routeFile of providerRouteFiles) {
  await assertFile(routeFile);
  const source = await readText(routeFile);

  for (const token of forbiddenTokens) {
    if (source.includes(token)) {
      throw new Error(`${routeFile} must not include structured-data token before a dedicated provider schema promotion PR: ${token}`);
    }
  }
}

console.log('provider schema disabled guard passed.');
