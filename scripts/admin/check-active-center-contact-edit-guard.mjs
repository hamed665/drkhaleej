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

function uniqueSorted(values) {
  return [...new Set(values)].sort();
}

function sameList(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

const editPagePath = 'src/app/admin/active-centers/[centerId]/edit-contact/page.tsx';
const editPage = readFile(editPagePath);

for (const token of [
  'ACTIVE_CENTER_CONTACT_EDIT',
  'updateActiveCenterPublicContactDetails',
  'requireAdminPermission("active_centers.public_state.update")',
  '.from("centers")',
  '.eq("status", "active")',
  '.eq("is_active", true)',
  '.is("deleted_at", null)',
  '.from("center_locations")',
  '.eq("is_active", true)',
  'getPrimaryActiveLocation(centerId)',
  'Controlled edit surface for an already-active center.',
  '6 fields only',
  'Save public contact details',
  'View public action gates',
  'Check gates after saving',
]) {
  mustHave(editPage, token, editPagePath);
}

const allowedFieldNames = uniqueSorted([
  'centerId',
  'email',
  'mapUrl',
  'primaryPhone',
  'secondaryPhone',
  'websiteUrl',
  'whatsappPhone',
]);
const actualFieldNames = uniqueSorted([...editPage.matchAll(/\bname="([^"]+)"/g)].map((match) => match[1]));
if (!sameList(actualFieldNames, allowedFieldNames)) {
  throw new Error(`${editPagePath} exposes unexpected form field names: ${actualFieldNames.join(', ')}`);
}

for (const token of [
  'verificationStatus',
  'verification_status',
  'centerType',
  'center_type',
  'descriptionEn',
  'descriptionAr',
  'description_en',
  'description_ar',
  'isClaimable',
  'is_claimable',
  'DraftCenterEditForm',
  'activateDraftCenterPublicProfile',
  'deactivateActiveCenterPublicProfile',
  'useActionState',
]) {
  mustNotHave(editPage, token, editPagePath);
}

const actionPath = 'src/server/admin/active-center-contact-edit-actions.ts';
const action = readFile(actionPath);
for (const token of [
  '"use server";',
  'export async function updateActiveCenterPublicContactDetails',
  'requireAdminPermission("active_centers.public_state.update")',
  'const centerId = formText(formData, "centerId", 64)',
  'const primaryPhone = formText(formData, "primaryPhone", 64)',
  'const secondaryPhone = formText(formData, "secondaryPhone", 64)',
  'const whatsappPhone = formText(formData, "whatsappPhone", 64)',
  'const email = formText(formData, "email", 254)',
  'const websiteUrl = formText(formData, "websiteUrl", 2048)',
  'const mapUrl = formText(formData, "mapUrl", 2048)',
  '.eq("status", "active")',
  '.eq("is_active", true)',
  '.is("deleted_at", null)',
  'contact_review_status: "approved"',
  'public_primary_phone_visible: hasText(primaryPhone)',
  'public_secondary_phone_visible: hasText(secondaryPhone)',
  'public_whatsapp_phone_visible: hasText(whatsappPhone)',
  'public_email_visible: hasText(email)',
  'map_url: mapUrl',
  'writeAdminAuditEvent({',
  'active_center.public_contact_actions_prepared',
  'revalidatePath(enPath)',
  'revalidatePath(arPath)',
  'revalidatePath("/sitemap.xml")',
  'revalidatePath("/admin/active-centers")',
  'revalidatePath(`/admin/active-centers/${centerId}/gates`)',
]) {
  mustHave(action, token, actionPath);
}

for (const token of [
  'verification_status',
  'center_type',
  'description_en',
  'description_ar',
  'is_claimable',
  'activateDraftCenterPublicProfile',
  'deactivateActiveCenterPublicProfile',
  '.delete(',
  '.upsert(',
  '.insert(',
]) {
  mustNotHave(action, token, actionPath);
}

const avPath = 'scripts/admin/check-av.mjs';
const av = readFile(avPath);
mustHave(av, "import './check-active-center-contact-edit-guard.mjs';", avPath);

console.log('Active center contact edit guard checks passed.');
