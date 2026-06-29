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

const actionPath = 'src/server/admin/draft-center-contact-visibility-actions.ts';
const actionContent = readFile(actionPath);

for (const token of [
  'export async function updateDraftLocationContactVisibility',
  'requireAdminPermission("draft_centers.update")',
  'const draftStatuses = ["draft", "pending_review"]',
  '.in("status", [...draftStatuses])',
  '.eq("center_id", centerId)',
  '.eq("is_active", true)',
  'contact_review_status: nextStatus',
  'contact_reviewed_at: new Date().toISOString()',
  'public_email_visible: nextEmail',
  'public_primary_phone_visible: nextPrimary',
  'public_whatsapp_phone_visible: nextWhatsapp',
  'writeAdminAuditEvent',
  'draft_center.contact_visibility_updated',
  'targetTable: "center_locations"',
  'revalidatePath(`/admin/draft-centers/${centerId}`)',
]) {
  assertIncludes(actionContent, token, actionPath);
}

for (const token of [
  'revalidatePath(`/en/',
  'revalidatePath(`/ar/',
  'revalidatePath(`/sitemap',
  'verification_status',
  'is_claimable',
  'subscription',
  'sponsor',
  'publishReviewedCenter',
  'public_secondary_phone_visible: true',
]) {
  assertNotIncludes(actionContent, token, actionPath);
}

const auditPath = 'src/server/admin/audit-log.ts';
const auditContent = readFile(auditPath);
assertIncludes(auditContent, '"draft_center.contact_visibility_updated"', auditPath);

const readerPath = 'src/server/admin/draft-center-locations.ts';
const readerContent = readFile(readerPath);
for (const token of [
  'email',
  'public_email_visible',
  'publicEmailVisible',
]) {
  assertIncludes(readerContent, token, readerPath);
}

const panelPath = 'src/components/admin/draft-center-contact-review-panel.tsx';
const panelContent = readFile(panelPath);
for (const token of [
  'DraftCenterContactReviewPanel',
  'Read-only admin surface',
  'Provider publication remains blocked by a separate workflow',
  'This panel does not publish or revalidate public routes',
  'Public profile display still depends on provider publication readiness',
  'publicPrimaryPhoneVisible',
  'publicWhatsappPhoneVisible',
  'publicEmailVisible',
]) {
  assertIncludes(panelContent, token, panelPath);
}

for (const token of [
  'useActionState',
  'updateDraftLocationContactVisibility',
  '<form',
  'type="submit"',
]) {
  assertNotIncludes(panelContent, token, panelPath);
}

const pagePath = 'src/app/admin/draft-centers/[centerId]/page.tsx';
const pageContent = readFile(pagePath);
for (const token of [
  'DraftCenterContactReviewPanel',
  '<DraftCenterContactReviewPanel centerId={centerId} locations={locations.locations} />',
]) {
  assertIncludes(pageContent, token, pagePath);
}

const packagePath = 'package.json';
const packageContent = readFile(packagePath);
for (const token of [
  '"admin:contact-review-guard:validate": "node scripts/admin/check-draft-center-contact-review-guard.mjs"',
  'pnpm admin:contact-review-guard:validate',
]) {
  assertIncludes(packageContent, token, packagePath);
}

console.log('Draft center contact review guard checks passed.');
