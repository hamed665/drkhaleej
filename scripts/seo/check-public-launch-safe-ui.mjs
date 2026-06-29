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

function mustHave(content, token, label) {
  if (!content.includes(token)) {
    throw new Error(`${label} missing token: ${token}`);
  }
}

function mustNotHave(content, token, label) {
  if (content.includes(token)) {
    throw new Error(`${label} has forbidden token: ${token}`);
  }
}

const detailPath = 'src/components/public/public-center-detail.tsx';
const detail = readFile(detailPath);

for (const token of [
  'Contact details should be confirmed with the provider.',
  'ينبغي تأكيد تفاصيل التواصل مع مقدم الخدمة.',
  'This is not a license or MOH approval claim.',
  'License and verification details will be added after the provider verification foundation is complete.',
  'This public profile is for healthcare discovery only.',
  'It is not medical advice, diagnosis, emergency guidance, or a guarantee of provider availability.',
  'showSafeContactFallback',
  'center.contactActions.length > 0',
]) {
  mustHave(detail, token, detailPath);
}

for (const token of [
  'Best center',
  'Top rated',
  'Open now',
  'Book now',
  'Accepts insurance',
  'MOH approved provider',
  'Official MOH approval',
  'Guaranteed availability',
]) {
  mustNotHave(detail, token, detailPath);
}

const cardPath = 'src/components/public/public-listing-card.tsx';
const card = readFile(cardPath);
for (const token of [
  'Profile coming soon',
  'الملف قريباً',
  'formatNeutralLabel',
]) {
  mustHave(card, token, cardPath);
}

for (const token of [
  'PublicContactActions',
  'contactActions',
  'Book now',
  'Open now',
  'Top rated',
  'Verified badge',
  'Accepts insurance',
]) {
  mustNotHave(card, token, cardPath);
}

const locationPath = 'src/components/public/public-location-section.tsx';
const location = readFile(locationPath);
for (const token of [
  'getPublicDirectionsUrl',
  'target="_blank"',
  'rel="noopener noreferrer"',
]) {
  mustHave(location, token, locationPath);
}

for (const token of [
  'Book now',
  'Open now',
  'Top rated',
  'Accepts insurance',
]) {
  mustNotHave(location, token, locationPath);
}

const packagePath = 'package.json';
const packageJson = readFile(packagePath);
for (const token of [
  '"seo:public-launch-safe-ui:validate": "node scripts/seo/check-public-launch-safe-ui.mjs"',
  'pnpm seo:public-launch-safe-ui:validate',
]) {
  mustHave(packageJson, token, packagePath);
}

console.log('Public launch-safe UI checks passed.');
