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
  if (!content.includes(token)) throw new Error(`${label} missing token: ${token}`);
}

function mustNotHave(content, token, label) {
  if (content.includes(token)) throw new Error(`${label} contains forbidden token: ${token}`);
}

const helperPath = 'src/lib/seo/native-profile-sitemap-promotion.ts';
const helper = readFile(helperPath);
for (const token of [
  'NativeProfileSitemapPromotionEntity',
  'NativeProfileSitemapPromotionReason',
  'NativeProfileSitemapPromotionInput',
  'NativeProfileSitemapPromotionDecision',
  'buildNativeProfileSitemapPromotionDecision',
  'not_index_eligible',
  'completeness_not_accepted',
  'missing_reviewed_promotion_evidence',
  'imported_preview',
  'unsafe_canonical_path',
  'family_cap_exceeded',
  'missing_deterministic_order_key',
  'indexEligibility.eligible',
  'familyCapAllowed',
  'deterministicOrderKey',
]) {
  mustHave(helper, token, helperPath);
}

const testPath = 'src/lib/seo/native-profile-sitemap-promotion.test.ts';
const test = readFile(testPath);
for (const token of [
  "describe('native profile sitemap promotion contract'",
  'returns eligible for a reviewed native center profile',
  'requires public profile index eligibility',
  'requires completeness and reviewed evidence',
  'requires native profile path and native source',
  'requires family cap allowance and deterministic ordering',
  'supports doctor profile canonical paths',
]) {
  mustHave(test, token, testPath);
}

const docPath = 'docs/seo/native-profile-sitemap-promotion-contract.md';
const doc = readFile(docPath);
for (const token of [
  'Native profile sitemap promotion contract',
  'It does not enable native profile sitemap expansion.',
  'public profile index eligibility is eligible',
  'profile completeness is accepted by the launch rule',
  'reviewed promotion evidence exists',
  'the profile is not an imported preview',
  'family caps allow inclusion',
  'deterministic ordering exists',
  'src/lib/seo/native-profile-sitemap-promotion.ts',
  'src/app/sitemap.ts must not import or call this helper yet.',
  'must not add massive expansion',
]) {
  mustHave(doc, token, docPath);
}

const sitemapPath = 'src/app/sitemap.ts';
const sitemap = readFile(sitemapPath);
for (const token of [
  'native-profile-sitemap-promotion',
  'buildNativeProfileSitemapPromotionDecision',
  'isPublicProfileIndexEligible',
  'generateStaticParams',
  'searchParams',
  '?q=',
  'provider-dashboard',
  'preview',
]) {
  mustNotHave(sitemap, token, sitemapPath);
}

console.log('Native profile sitemap promotion contract passed.');
