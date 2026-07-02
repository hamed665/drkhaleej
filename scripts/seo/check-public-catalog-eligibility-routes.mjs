import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();

const eligibleImport = '@/lib/catalog/public-eligible-queries';
const rawImport = '@/lib/catalog/public-queries';

const centerRouteFiles = [
  'src/app/[locale]/[country]/centers/page.tsx',
  'src/app/[locale]/[country]/labs/page.tsx',
  'src/app/[locale]/[country]/hospitals/page.tsx',
  'src/app/[locale]/[country]/pharmacies/page.tsx',
  'src/app/[locale]/[country]/center/[centerSlug]/page.tsx',
];

const doctorRouteFiles = [
  'src/app/[locale]/[country]/doctors/page.tsx',
  'src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx',
];

const requiredWrapperTokens = [
  'export async function listPublicCenters',
  'export async function getPublicCenterBySlug',
  'export async function listPublicDoctors',
  'export async function getPublicDoctorBySlug',
  'export async function searchPublicCatalog',
  '.eq("is_active", true)',
  '.eq("status", "active")',
  '.is("deleted_at", null)',
  'verificationStatusFilterValues()',
];

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

for (const routeFile of [...centerRouteFiles, ...doctorRouteFiles]) {
  const content = readFile(routeFile);
  assertIncludes(content, eligibleImport, routeFile);
  assertNotIncludes(content, rawImport, routeFile);
}

const wrapperPath = 'src/lib/catalog/public-eligible-queries.ts';
const wrapperContent = readFile(wrapperPath);

for (const token of requiredWrapperTokens) {
  assertIncludes(wrapperContent, token, wrapperPath);
}

const centerDetailPath = 'src/components/public/public-center-detail.tsx';
const centerDetail = readFile(centerDetailPath);
for (const token of [
  "import Link from 'next/link'",
  'publicDoctorDetailRoute',
  '<Link href={href}',
  'doctorProfileLabel',
]) {
  assertIncludes(centerDetail, token, centerDetailPath);
}

const doctorDetailPath = 'src/components/public/public-doctor-detail.tsx';
const doctorDetail = readFile(doctorDetailPath);
for (const token of [
  "import Link from 'next/link'",
  'publicCenterDetailRoute',
  'const centerHref = publicCenterDetailRoute',
  '<Link href={centerHref}',
  'relationshipCardClassName',
  'pillActionClassName',
  'internalProfileLinkClassName',
  'grid gap-3 md:grid-cols-2',
  'sm:flex-row sm:flex-wrap sm:items-center',
]) {
  assertIncludes(doctorDetail, token, doctorDetailPath);
}

for (const forbiddenToken of [
  '<a href={publicCenterDetailRoute',
  'rating',
  'insurance',
  'MOH approved',
  'Book now',
]) {
  assertNotIncludes(doctorDetail, forbiddenToken, doctorDetailPath);
}

const sectionPath = 'src/components/public/public-center-detail-section.tsx';
const section = readFile(sectionPath);
for (const token of [
  'dm2026-profile-section',
  'dm2026-profile-section__header',
  'dm2026-profile-section__body',
]) {
  assertIncludes(section, token, sectionPath);
}

const layoutPath = 'src/app/layout.tsx';
const layout = readFile(layoutPath);
assertIncludes(layout, '@/styles/dm2026-public-profile.css', layoutPath);

const publicProfileCssPath = 'src/styles/dm2026-public-profile.css';
const publicProfileCss = readFile(publicProfileCssPath);
for (const token of [
  '.dm2026-profile-section',
  '.dm2026-profile-section__header',
  '.dm2026-profile-section__body',
  '.dm2026-profile-card',
]) {
  assertIncludes(publicProfileCss, token, publicProfileCssPath);
}

console.log('Public catalog eligibility route and profile relationship link checks passed.');
