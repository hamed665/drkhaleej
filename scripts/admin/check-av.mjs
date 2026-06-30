import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();

function readFile(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) throw new Error(`Missing required file: ${file}`);
  return fs.readFileSync(full, 'utf8');
}

function mustHave(text, token, label) {
  if (!text.includes(token)) throw new Error(`${label} missing token: ${token}`);
}

function mustNotHave(text, token, label) {
  if (text.includes(token)) throw new Error(`${label} has forbidden token: ${token}`);
}

const pagePath = 'src/app/admin/active-centers/page.tsx';
const page = readFile(pagePath);
for (const token of [
  'listAdminActiveCenters()',
  'READ_ONLY_ACTIVE_PROVIDER_VIEW',
  'Read-only view for centers that have left the draft workflow.',
  'read-only operational visibility',
  'English public profile',
  'Arabic public profile',
  'Back to draft centers',
  'View public state readiness',
  'href={`/admin/active-centers/${center.id}`}',
]) {
  mustHave(page, token, pagePath);
}
for (const token of [
  'useActionState',
  '<form',
  'action={',
  'method="post"',
  'type="submit"',
  'DraftCenterEditForm',
  'activateDraftCenterPublicProfile',
  'updateDraft',
  'createDraft',
  'revalidatePath',
]) {
  mustNotHave(page, token, pagePath);
}

const detailPagePath = 'src/app/admin/active-centers/[centerId]/page.tsx';
const detailPage = readFile(detailPagePath);
for (const token of [
  'export default async function AdminActiveCenterPublicStateReadinessPage',
  'getAdminActiveCenterPublicStateReadiness(centerId)',
  'ACTIVE_CENTER_PUBLIC_STATE_READINESS',
  'No action available here',
  'Read-only public state readiness',
  'draft_center.public_profile_activated',
  'Activation audit evidence',
  'English public path',
  'Arabic public path',
  'Contact visibility unchanged',
  'Commercial state unchanged',
  'Back to active centers',
]) {
  mustHave(detailPage, token, detailPagePath);
}
for (const token of [
  '"use client"',
  'useActionState',
  '<form',
  'action={',
  'method="post"',
  'type="submit"',
  'DraftCenterEditForm',
  'activateDraftCenterPublicProfile',
  'updateDraft',
  'createDraft',
  'revalidatePath',
  'writeAdminAuditEvent',
  '.insert(',
  '.update(',
  '.delete(',
]) {
  mustNotHave(detailPage, token, detailPagePath);
}

const helperPath = 'src/server/admin/active-centers.ts';
const helper = readFile(helperPath);
for (const token of [
  'import "server-only";',
  'requireAdminPermission("draft_centers.read")',
  'export async function listAdminActiveCenters',
  '.from("centers")',
  '.eq("status", "active")',
  '.eq("is_active", true)',
  '.is("deleted_at", null)',
  '.limit(fixedLimit)',
]) {
  mustHave(helper, token, helperPath);
}
for (const token of [
  '.insert(',
  '.update(',
  '.delete(',
  'revalidatePath',
  'writeAdminAuditEvent',
  'requireAdminPermission("draft_centers.update")',
]) {
  mustNotHave(helper, token, helperPath);
}

const readinessHelperPath = 'src/server/admin/active-center-public-state-readiness.ts';
const readinessHelper = readFile(readinessHelperPath);
for (const token of [
  'getAdminActiveCenterPublicStateReadiness',
  'requireAdminPermission("draft_centers.update")',
  '.from<ActiveCenterStateRow>("centers")',
  '.from<ActivationAuditRow>("admin_audit_events")',
  '.eq("entity_id", centerId)',
  '.eq("entity_type", "center")',
  '.eq("action", "draft_center.public_profile_activated")',
  'activationAudit',
  'statusSummary',
  'publicPaths',
  'canDeactivate',
  'hasRecentActivationAudit',
  'contactVisibilityUnchanged: true',
  'commercialStateUnchanged: true',
  'futureMutationRequired: true',
]) {
  mustHave(readinessHelper, token, readinessHelperPath);
}
for (const token of [
  '.insert(',
  '.update(',
  '.delete(',
  'revalidatePath',
  'redirect(',
  'writeAdminAuditEvent',
  'insertAuditEvent',
]) {
  mustNotHave(readinessHelper, token, readinessHelperPath);
}

const pkg = readFile('package.json');
for (const token of [
  '"admin:av:validate": "node scripts/admin/check-av.mjs"',
  'pnpm admin:av:validate',
]) {
  mustHave(pkg, token, 'package.json');
}

console.log('Active view checks passed.');
