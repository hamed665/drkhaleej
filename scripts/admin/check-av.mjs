import './check-active-center-public-state-action-guard.mjs';
import './check-active-center-contact-edit-guard.mjs';
import './check-active-center-contact-edit-smoke-checklist.mjs';
import './check-active-center-basic-profile-guard.mjs';
import './check-active-center-basic-profile-checklist.mjs';

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
  'ACTIVE_PROVIDER_OPERATIONS_VIEW',
  'Operational view for centers that have left the draft workflow.',
  'Guarded basic profile and public contact correction routes are available.',
  'basic profile copy corrections',
  'narrow public contact corrections',
  'English public profile',
  'Arabic public profile',
  'Back to draft centers',
  'View public state readiness',
  'View public action gates',
  'Edit basic profile info',
  'Edit public contact info',
  'href={`/admin/active-centers/${center.id}/edit-profile`}',
  'href={`/admin/active-centers/${center.id}/edit-contact`}',
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
  'requireAdminPermission("active_centers.public_state.update")',
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

const actionPath = 'src/server/admin/active-center-public-state-actions.ts';
const action = readFile(actionPath);
for (const token of [
  '"use server";',
  'export async function deactivateActiveCenterPublicProfile',
  'requireAdminPermission("active_centers.public_state.update")',
  'const reason = formString(formData, "reason")',
  'getAdminActiveCenterPublicStateReadiness(centerId)',
  'readiness.canDeactivate',
  '.select("id,slug,status,default_country,is_active,deleted_at")',
  '.eq("status", "active")',
  '.eq("is_active", true)',
  'status: "inactive"',
  'is_active: false',
  '.update(updatePayload)',
  'writeAdminAuditEvent({',
  'permissionKey: "active_centers.public_state.update"',
  'action: "active_center.public_profile_deactivated"',
  'reason,',
  'revalidatePath(enPath)',
  'revalidatePath(arPath)',
  'revalidatePath("/sitemap.xml")',
  'revalidatePath("/admin/active-centers")',
  'revalidatePath(`/admin/active-centers/${centerId}`)',
]) {
  mustHave(action, token, actionPath);
}
for (const token of [
  'useActionState',
  '<form',
  'type="submit"',
  'DraftCenterEditForm',
  'activateDraftCenterPublicProfile',
  'verification_status',
  'contact_visibility',
  'subscription',
  'billing',
  'sponsored',
  'is_claimable',
  '.delete(',
]) {
  mustNotHave(action, token, actionPath);
}

const auditPath = 'src/server/admin/audit-log.ts';
const audit = readFile(auditPath);
mustHave(audit, '| "active_center.public_profile_deactivated"', auditPath);

const permissionsPath = 'src/lib/admin/permissions.ts';
const permissions = readFile(permissionsPath);
for (const token of [
  'label: "Active Centers"',
  '"active_centers.public_state.update"',
  'operations_manager: { label: "Operations manager"',
]) {
  mustHave(permissions, token, permissionsPath);
}

const pkg = readFile('package.json');
for (const token of [
  '"admin:av:validate": "node scripts/admin/check-av.mjs"',
  'pnpm admin:av:validate',
]) {
  mustHave(pkg, token, 'package.json');
}

console.log('Active view checks passed.');
