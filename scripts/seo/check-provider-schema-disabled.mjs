import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

const providerRouteFiles = [
  'src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx',
  'src/app/[locale]/[country]/pharmacies/[pharmacySlug]/page.tsx',
];

const blockedHospitalRouteFiles = [
  'src/pages/[locale]/[country]/hospitals/[hospitalSlug].tsx',
  'src/app/[locale]/[country]/hospitals/[hospitalSlug]/page.tsx',
  'src/app/[locale]/[country]/hospitals/[slug]/page.tsx',
  'src/app/[locale]/[country]/hospitals/[slug]/layout.tsx',
  'src/app/api/_drk/hospital-profile/[locale]/[country]/[hospitalSlug]/route.ts',
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

async function assertMissing(relativePath) {
  try {
    await access(path.join(root, relativePath));
  } catch {
    return;
  }
  throw new Error(`${relativePath} must not exist while imported hospital detail pages are on public hold.`);
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

for (const routeFile of blockedHospitalRouteFiles) {
  await assertMissing(routeFile);
}

console.log('provider schema disabled guard passed.');
