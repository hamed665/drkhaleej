import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();

function readFile(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing required file: ${relativePath}`);
  return fs.readFileSync(fullPath, 'utf8');
}

function mustHave(source, token, label) {
  if (!source.includes(token)) throw new Error(`${label} missing token: ${token}`);
}

function mustNotHave(source, token, label) {
  if (source.includes(token)) throw new Error(`${label} has forbidden token: ${token}`);
}

function mustAppearBefore(source, earlier, later, label) {
  const earlierIndex = source.indexOf(earlier);
  const laterIndex = source.indexOf(later);
  if (earlierIndex === -1) throw new Error(`${label} missing earlier token: ${earlier}`);
  if (laterIndex === -1) throw new Error(`${label} missing later token: ${later}`);
  if (earlierIndex > laterIndex) throw new Error(`${label} expected ${earlier} before ${later}`);
}

function mustAppearAfter(source, later, earlier, label) {
  mustAppearBefore(source, earlier, later, label);
}

const actionPath = 'src/server/admin/active-center-public-state-actions.ts';
const action = readFile(actionPath);

for (const token of [
  '"use server";',
  'export async function deactivateActiveCenterPublicProfile',
  'requireAdminPermission("active_centers.public_state.update")',
  'const reason = formString(formData, "reason")',
  'message: "A public state change reason is required."',
  'getAdminActiveCenterPublicStateReadiness(centerId)',
  'if (!readiness.canDeactivate)',
  '.from("centers")',
  '.select("id,slug,status,default_country,is_active,deleted_at")',
  '.eq("id", centerId)',
  '.eq("status", "active")',
  '.eq("is_active", true)',
  '.is("deleted_at", null)',
  'const updatePayload: CenterUpdate = {',
  'is_active: false',
  'status: "inactive"',
  'updated_at: new Date().toISOString()',
  '.update(updatePayload)',
  '.select("id")',
  'writeAdminAuditEvent({',
  'permissionKey: "active_centers.public_state.update"',
  'action: "active_center.public_profile_deactivated"',
  'entityType: "center"',
  'targetTable: "centers"',
  'summary: "Active center public profile deactivated."',
  'reason,',
  'oldValues: {',
  'newValues: {',
  'metadata: {',
  'evidence_summary: readiness.evidenceSummary',
  'public_paths: [enPath, arPath]',
  'sitemap_revalidated: true',
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
  'verificationStatus',
  'contact_visibility',
  'contactVisibility',
  'billing',
  'subscription',
  'commercial_addon',
  'sponsored',
  'claim_status',
  'is_claimable',
  'license_number',
  '.delete(',
  '.upsert(',
  '.insert(',
  '.from("center_locations")',
  '.from("center_contacts")',
  '.from("center_subscriptions")',
  '.from("sponsored_placements")',
  '.from("center_claims")',
  '.from("doctors")',
]) {
  mustNotHave(action, token, actionPath);
}

mustAppearBefore(action, 'getAdminActiveCenterPublicStateReadiness(centerId)', '.update(updatePayload)', actionPath);
mustAppearBefore(action, 'if (!readiness.canDeactivate)', '.update(updatePayload)', actionPath);
mustAppearBefore(action, 'const updatePayload: CenterUpdate = {', '.update(updatePayload)', actionPath);
mustAppearAfter(action, 'writeAdminAuditEvent({', '.update(updatePayload)', actionPath);
mustAppearAfter(action, 'revalidatePath(enPath)', 'writeAdminAuditEvent({', actionPath);
mustAppearAfter(action, 'revalidatePath(arPath)', 'writeAdminAuditEvent({', actionPath);
mustAppearAfter(action, 'revalidatePath("/sitemap.xml")', 'writeAdminAuditEvent({', actionPath);

const readinessPath = 'src/server/admin/active-center-public-state-readiness.ts';
const readiness = readFile(readinessPath);
for (const token of [
  'import "server-only";',
  'requireAdminPermission("active_centers.public_state.update")',
  'center.status !== "active"',
  'center.is_active !== true',
  'center.deleted_at !== null',
  'canDeactivate: canPreparePublicStateChange',
  'contactVisibilityUnchanged: true',
  'commercialStateUnchanged: true',
]) {
  mustHave(readiness, token, readinessPath);
}
for (const token of [
  '.update(',
  '.delete(',
  '.insert(',
  'revalidatePath',
  'writeAdminAuditEvent',
]) {
  mustNotHave(readiness, token, readinessPath);
}

const listPagePath = 'src/app/admin/active-centers/page.tsx';
const listPage = readFile(listPagePath);
for (const token of [
  'READ_ONLY_ACTIVE_PROVIDER_VIEW',
  'View public state readiness',
  'href={`/admin/active-centers/${center.id}`}',
]) {
  mustHave(listPage, token, listPagePath);
}
for (const token of [
  'deactivateActiveCenterPublicProfile',
  'useActionState',
  '<form',
  'type="submit"',
  'revalidatePath',
]) {
  mustNotHave(listPage, token, listPagePath);
}

const detailPagePath = 'src/app/admin/active-centers/[centerId]/page.tsx';
const detailPage = readFile(detailPagePath);
for (const token of [
  'ACTIVE_CENTER_PUBLIC_STATE_READINESS',
  'No action available here',
  'Future public removal or deactivation controls must live in a separate guarded server action PR.',
]) {
  mustHave(detailPage, token, detailPagePath);
}
for (const token of [
  'deactivateActiveCenterPublicProfile',
  'useActionState',
  '<form',
  'action={',
  'type="submit"',
  'revalidatePath',
  'writeAdminAuditEvent',
]) {
  mustNotHave(detailPage, token, detailPagePath);
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

const typesPath = 'supabase/types/database.types.ts';
const types = readFile(typesPath);
mustHave(types, 'provider_status:', typesPath);
mustHave(types, '| "inactive"', typesPath);

console.log('Active center public state action guard checks passed.');
