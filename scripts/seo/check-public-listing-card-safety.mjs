import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();

function readFile(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }

  return fs.readFileSync(absolutePath, 'utf8');
}

function assertIncludes(content, token, label) {
  if (!content.includes(token)) {
    throw new Error(`${label} is missing required token: ${token}`);
  }
}

function assertNotIncludes(content, token, label) {
  if (content.includes(token)) {
    throw new Error(`${label} contains forbidden token: ${token}`);
  }
}

const cardPath = 'src/components/public/public-listing-card.tsx';
const cardContent = readFile(cardPath);

for (const token of [
  "import Link from 'next/link'",
  'export function PublicListingCard',
  "variant: 'center'",
  "variant: 'doctor'",
  "variant: 'service'",
  'href: string | null',
  '<CardTitle href={props.href}',
  '<ProfileAction href={props.href}',
  'Profile coming soon',
  'View public profile',
  'عرض الملف العام',
  'formatNeutralLabel',
]) {
  assertIncludes(cardContent, token, cardPath);
}

for (const forbiddenToken of [
  'PublicContactActions',
  'contactActions',
  'Call center',
  'WhatsApp center',
  'mailto:',
  'tel:',
  'wa.me',
  'Book now',
  'book now',
  'Open now',
  'open now',
  'Verified',
  'verified badge',
  'rating',
  'insurance',
  'target="_blank"',
]) {
  assertNotIncludes(cardContent, forbiddenToken, cardPath);
}

const gridPath = 'src/components/public/public-listing-grid.tsx';
const gridContent = readFile(gridPath);
for (const token of [
  'function isSafeSlug',
  'publicCenterProfileHref',
  'publicDoctorProfileHref',
  '`/${locale}/${countryPathSegment(item.defaultCountry)}/center/${item.slug}`',
  '`/${locale}/${countryPathSegment(item.defaultCountry)}/doctor/${item.slug}`',
  'href={publicCenterProfileHref(props.locale, item)}',
  'href={publicDoctorProfileHref(props.locale, item)}',
  'variant="service" item={item} href={null}',
]) {
  assertIncludes(gridContent, token, gridPath);
}

for (const forbiddenToken of [
  'contactActions',
  'mailto:',
  'tel:',
  'wa.me',
  'Book now',
  'Open now',
  'rating',
  'insurance',
]) {
  assertNotIncludes(gridContent, forbiddenToken, gridPath);
}

const packagePath = 'package.json';
const packageContent = readFile(packagePath);
for (const token of [
  '"seo:public-listing-card-safety:validate": "node scripts/seo/check-public-listing-card-safety.mjs"',
  'pnpm seo:public-listing-card-safety:validate',
]) {
  assertIncludes(packageContent, token, packagePath);
}

console.log('Public listing card safety checks passed.');
