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
  'import Link from',
  'export function PublicListingCard',
  "variant: 'center'",
  "variant: 'doctor'",
  "variant: 'service'",
  'listingHref',
  "'center'",
  "'doctor'",
  'View profile',
  'Profile coming soon',
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
]) {
  assertNotIncludes(cardContent, forbiddenToken, cardPath);
}

const directoryContracts = [
  {
    path: 'src/app/[locale]/[country]/doctors/page.tsx',
    tokens: ['listPublicDoctors({ country: safeCountry })', 'PublicDirectoryListingContent', 'variant="doctor"', 'result={result}'],
  },
  {
    path: 'src/app/[locale]/[country]/centers/page.tsx',
    tokens: ['listPublicCenters({ country: safeCountry })', 'PublicDirectoryListingContent', 'variant="center"', 'result={result}'],
  },
  {
    path: 'src/app/[locale]/[country]/labs/page.tsx',
    tokens: ['listPublicCenters({', 'centerType: "laboratory"', 'PublicDirectoryListingContent', 'variant="center"', 'result={result}'],
  },
  {
    path: 'src/app/[locale]/[country]/pharmacies/page.tsx',
    tokens: ['listPublicCenters({', 'centerType: "pharmacy"', 'PublicDirectoryListingContent', 'variant="center"', 'result={result}'],
  },
  {
    path: 'src/app/[locale]/[country]/hospitals/page.tsx',
    tokens: ['listPublicCenters({', 'centerType: "hospital"', 'PublicDirectoryListingContent', 'variant="center"', 'result={result}'],
  },
];

for (const contract of directoryContracts) {
  const content = readFile(contract.path);
  for (const token of contract.tokens) {
    assertIncludes(content, token, contract.path);
  }
  for (const forbiddenToken of ['contactActions', 'Book now', 'Open now', 'Verified', 'rating', 'insurance']) {
    assertNotIncludes(content, forbiddenToken, contract.path);
  }
}

const directorySearchContractPath = 'docs/seo/directory-search-filter-contract.md';
const directorySearchContract = readFile(directorySearchContractPath);
for (const token of [
  'Directory search and filter contract',
  'Query and filter URL variants are user state only.',
  'Directory query variants must not enter the sitemap.',
  'Canonical metadata remains the base directory path.',
  '`q` text search on `/doctors`',
  'SSR execution using `searchPublicCatalog`',
  'client-only filtering that changes the URL without changing the server-rendered results',
  'Specialty and area filters only after their gates and canonical rules exist.',
]) {
  assertIncludes(directorySearchContract, token, directorySearchContractPath);
}

const packagePath = 'package.json';
const packageContent = readFile(packagePath);
for (const token of [
  '"seo:public-listing-card-safety:validate": "node scripts/seo/check-public-listing-card-safety.mjs"',
  'pnpm seo:public-listing-card-safety:validate',
]) {
  assertIncludes(packageContent, token, packagePath);
}

console.log('Public listing card safety, directory graph, and directory search contract checks passed.');
