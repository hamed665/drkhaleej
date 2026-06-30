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

const docPath = 'docs/admin/post-activation-verifier.md';
const doc = readFile(docPath);
for (const token of [
  'Post Activation Verifier',
  'the provider status is `active`',
  '`is_active` is true',
  '`is_claimable` remains false',
  'the draft center list should not include the provider anymore',
  'the draft center detail helper should not return it anymore',
  '`draft_center.public_profile_activated`',
  '`draft`',
  '`pending_review`',
  '`status` equals `active`',
  '`deleted_at` is null',
  'The center detail route must continue using the public eligibility wrapper before loading the full ungated detail.',
  'Public center detail relations must continue filtering related data',
  'fail closed instead of leaking unfiltered relations',
  'The final action may revalidate sitemap',
  'must not directly insert sitemap rows',
  'safe contact fallback remains available when public contact actions are absent',
  'medical safety disclaimer remains visible',
]) {
  mustHave(doc, token, docPath);
}

for (const token of [
  'admin:final-chain:validate',
  'admin:launch-checklist:validate',
  'admin:post-activation:validate',
  'seo:public-catalog-eligibility:validate',
  'seo:public-launch-safe-ui:validate',
  'import:sitemap-family-caps:validate',
  'import:profile-smoke:validate',
]) {
  mustHave(doc, token, docPath);
}

const draftCentersPath = 'src/server/admin/draft-centers.ts';
const draftCenters = readFile(draftCentersPath);
for (const token of [
  'type AdminCenterWorkflowStatus = Extract<CenterRow["status"], "draft" | "pending_review">',
  'const workflowStatuses: AdminCenterWorkflowStatus[] = ["draft", "pending_review"]',
  '.in("status", workflowStatuses)',
  '.is("deleted_at", null)',
]) {
  mustHave(draftCenters, token, draftCentersPath);
}
mustNotHave(draftCenters, '"active" | "pending_review"', draftCentersPath);
mustNotHave(draftCenters, '["draft", "pending_review", "active"]', draftCentersPath);

const publicQueriesPath = 'src/lib/catalog/public-eligible-queries.ts';
const publicQueries = readFile(publicQueriesPath);
for (const token of [
  'function verificationStatusFilterValues()',
  'async function isPublicCenterSlugEligible',
  'export async function listPublicCenters',
  'export async function getPublicCenterBySlug',
  'export async function searchPublicCatalog',
  'getUngatedPublicCenterBySlug(options)',
  'getCenterDetailRelationEligibility(detailResult.data.id)',
  'filterCenterDetailRelations(detailResult.data, relationEligibility)',
  '.eq("is_active", true)',
  '.eq("status", "active")',
  '.in("verification_status", verificationStatusFilterValues())',
  '.is("deleted_at", null)',
]) {
  mustHave(publicQueries, token, publicQueriesPath);
}

for (const token of [
  '.eq("status", "pending_review")',
  '.eq("is_active", false)',
]) {
  mustNotHave(publicQueries, token, publicQueriesPath);
}

const actionPath = 'src/server/admin/draft-center-public-activation-actions.ts';
const action = readFile(actionPath);
for (const token of [
  'draft_center.public_profile_activated',
  'status: "active"',
  'is_active: true',
  'is_claimable: false',
  'revalidatePath("/sitemap.xml")',
]) {
  mustHave(action, token, actionPath);
}
mustNotHave(action, 'import_publish_queue', actionPath);
mustNotHave(action, 'sitemap_policy', actionPath);

const launchUiPath = 'scripts/seo/check-public-launch-safe-ui.mjs';
const launchUi = readFile(launchUiPath);
for (const token of [
  'Contact details should be confirmed with the provider.',
  'This public profile is for healthcare discovery only.',
  'Best center',
  'Open now',
  'Guaranteed availability',
]) {
  mustHave(launchUi, token, launchUiPath);
}

const packagePath = 'package.json';
const packageJson = readFile(packagePath);
for (const token of [
  '"admin:post-activation:validate": "node scripts/admin/check-post-activation-verifier.mjs"',
  'pnpm admin:post-activation:validate',
]) {
  mustHave(packageJson, token, packagePath);
}

console.log('Post activation verifier checks passed.');
