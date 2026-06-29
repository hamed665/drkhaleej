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

const actionPath = 'src/server/admin/draft-center-location-actions.ts';
const actionContent = readFile(actionPath);

for (const token of [
  'export async function markDraftCenterLocationReadyForReview',
  'requireAdminPermission("draft_centers.update")',
  '.in("status", [...draftStatuses])',
  '.eq("center_id", centerId)',
  '.eq("is_active", false)',
  'hasReviewLocationGeography(reviewLocation)',
  'hasReviewLocationIdentity(reviewLocation)',
  'contact_review_status: "pending"',
  'contact_reviewed_at: null',
  'is_active: true',
  'public_email_visible: false',
  'public_primary_phone_visible: false',
  'public_secondary_phone_visible: false',
  'public_whatsapp_phone_visible: false',
  'summary: "Draft center location candidate marked ready for quality review."',
  'revalidatePath(`/admin/draft-centers/${centerId}`)',
]) {
  assertIncludes(actionContent, token, actionPath);
}

const forbiddenTokens = [
  'revalidatePath(`/en/',
  'revalidatePath(`/ar/',
  'revalidatePath(`/sitemap',
  'verification_status',
  'is_claimable',
  'subscription_status',
];

for (const token of forbiddenTokens) {
  if (actionContent.includes(token)) {
    throw new Error(`${actionPath} contains forbidden review side effect token: ${token}`);
  }
}

console.log('Draft location review runtime checks passed.');
