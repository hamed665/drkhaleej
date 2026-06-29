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

const requiredWrapperTokens = [
  'export async function listPublicCenters',
  'export async function getPublicCenterBySlug',
  'export async function listPublicDoctors',
  'export async function getPublicDoctorBySlug',
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

for (const routeFile of centerRouteFiles) {
  const content = readFile(routeFile);
  assertIncludes(content, eligibleImport, routeFile);
  assertNotIncludes(content, rawImport, routeFile);
}

const wrapperPath = 'src/lib/catalog/public-eligible-queries.ts';
const wrapperContent = readFile(wrapperPath);

for (const token of requiredWrapperTokens) {
  assertIncludes(wrapperContent, token, wrapperPath);
}

console.log('Public catalog eligibility route checks passed.');
