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

const checklistPath = 'docs/admin/launch-smoke-checklist.md';
const checklist = readFile(checklistPath);

for (const token of [
  'Launch Smoke Checklist',
  'workflow panel',
  'taxonomy panel',
  'location panel',
  'contact review panel',
  'publication readiness panel',
  'quality panel',
  'pass only the center id to the server action',
  'stay disabled until readiness can pass',
  'call the publication readiness helper before changing state',
  'require the center to still be in `pending_review`',
  'keep claimable state false',
  'write an admin audit event',
  'revalidate both English and Arabic public profile routes',
  'revalidate sitemap',
  'must not change verification status, contact visibility fields, billing fields, sponsorship fields, claim state, taxonomy assignment, or commercial add-ons',
  'Public center routes must continue to use the public eligibility wrapper.',
  'safe contact fallback copy when public contact actions are absent',
  'medical safety disclaimer remains visible',
  'guarded public route eligibility',
  'guarded sitemap inclusion',
]) {
  mustHave(checklist, token, checklistPath);
}

for (const token of [
  'admin:provider-publication-contract:validate',
  'admin:final-chain:validate',
  'seo:public-catalog-eligibility:validate',
  'seo:public-listing-card-safety:validate',
  'seo:public-launch-safe-ui:validate',
  'import:publish-readiness-audit:validate',
  'import:sitemap-family-caps:validate',
  'import:profile-smoke:validate',
  'import:pharmacy-profile-route:validate',
  'import:hospital-profile-route:validate',
]) {
  mustHave(checklist, token, checklistPath);
}

const pagePath = 'src/app/admin/draft-centers/[centerId]/page.tsx';
const page = readFile(pagePath);
for (const token of [
  'DraftCenterWorkflowPanel',
  'DraftCenterTaxonomyPanel',
  'DraftCenterLocationPanel',
  'DraftCenterContactReviewPanel',
  'DraftCenterPublicationReadinessPanel',
  'DraftCenterQualityPanel',
]) {
  mustHave(page, token, pagePath);
}

const actionPath = 'src/server/admin/draft-center-public-activation-actions.ts';
const action = readFile(actionPath);
for (const token of [
  'getDraftCenterPublicationReadiness(centerId)',
  'if (!readiness.canPublish)',
  '.eq("status", "pending_review")',
  '.eq("is_active", false)',
  '.eq("is_claimable", false)',
  'status: "active"',
  'is_active: true',
  'is_claimable: false',
  'draft_center.public_profile_activated',
  'revalidatePath(enPath)',
  'revalidatePath(arPath)',
  'revalidatePath("/sitemap.xml")',
]) {
  mustHave(action, token, actionPath);
}

for (const token of [
  'verification_status:',
  'is_claimable: true',
  'subscription_status',
  'commercial_addon',
]) {
  mustNotHave(action, token, actionPath);
}

const eligibleRouteCheck = readFile('scripts/seo/check-public-catalog-eligibility-routes.mjs');
mustHave(eligibleRouteCheck, 'src/app/[locale]/[country]/center/[centerSlug]/page.tsx', 'scripts/seo/check-public-catalog-eligibility-routes.mjs');
mustHave(eligibleRouteCheck, 'getPublicCenterBySlug', 'scripts/seo/check-public-catalog-eligibility-routes.mjs');

const packagePath = 'package.json';
const packageJson = readFile(packagePath);
for (const token of [
  '"admin:launch-checklist:validate": "node scripts/admin/check-launch-smoke-checklist.mjs"',
  'pnpm admin:launch-checklist:validate',
]) {
  mustHave(packageJson, token, packagePath);
}

console.log('Launch checklist checks passed.');
