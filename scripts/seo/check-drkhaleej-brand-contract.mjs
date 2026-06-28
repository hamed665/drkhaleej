import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

const scannedFiles = [
  'public/llms.txt',
  'src/lib/seo/site.ts',
  'src/lib/seo/metadata.ts',
  'src/lib/seo/jsonld.ts',
  'src/lib/seo/faq-jsonld.ts',
  'src/lib/seo/page-registry.ts',
  'src/lib/brand/public-brand-copy.ts',
  'src/lib/brand/public-brand-copy.test.ts',
  'src/lib/brand/public-brand-metadata.ts',
  'src/app/[locale]/[country]/page.tsx',
  'src/app/[locale]/[country]/doctors/page.tsx',
  'src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx',
  'src/app/[locale]/[country]/centers/page.tsx',
  'src/app/[locale]/[country]/labs/page.tsx',
  'src/app/[locale]/[country]/pharmacies/page.tsx',
  'src/app/[locale]/[country]/pharmacies/[pharmacySlug]/page.tsx',
  'src/app/[locale]/[country]/hospitals/page.tsx',
  'src/app/[locale]/[country]/services/page.tsx',
  'src/app/[locale]/[country]/for-providers/page.tsx',
  'src/app/[locale]/[country]/dental/page.tsx',
  'src/app/[locale]/[country]/beauty/page.tsx',
  'src/app/[locale]/[country]/offers/page.tsx',
  'src/app/[locale]/[country]/pet-clinics/page.tsx',
  'src/app/[locale]/[country]/pet-shops/page.tsx',
  'src/app/[locale]/[country]/search/page.tsx',
];

const latinPlace = 'Mus' + 'cat';
const persianDoctor = String.fromCharCode(1583, 1705, 1578, 1585);
const arabicDoctor = String.fromCharCode(1583, 1603, 1578, 1608, 1585);
const arabicPlace = String.fromCharCode(1605, 1587, 1602, 1591);
const arabicDal = String.fromCharCode(1583);

const forbiddenLegacyBrandPatterns = [
  new RegExp(String.raw`\bDr\s*${latinPlace}\b`, 'i'),
  new RegExp(String.raw`\bDoctor\s+${latinPlace}\b`, 'i'),
  new RegExp(String.raw`\bDr${latinPlace}\b`, 'i'),
  new RegExp(String.raw`\bdr${latinPlace.toLowerCase()}\b`, 'i'),
  new RegExp(`${persianDoctor}\\s*${arabicPlace}`, 'i'),
  new RegExp(`${arabicDoctor}\\s*${arabicPlace}`, 'i'),
  new RegExp(`${arabicDal}\\.\\s*${arabicPlace}`, 'i'),
];

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

for (const file of scannedFiles) {
  const source = await readText(file);

  for (const pattern of forbiddenLegacyBrandPatterns) {
    if (pattern.test(source)) {
      throw new Error(`${file} contains legacy public brand text that must not leak into DrKhaleej surfaces.`);
    }
  }
}

console.log(`DrKhaleej public brand contract passed for ${scannedFiles.length} files.`);
