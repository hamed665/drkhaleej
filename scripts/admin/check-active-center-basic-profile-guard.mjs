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

const pagePath = 'src/app/admin/active-centers/[centerId]/edit-profile/page.tsx';
const page = readFile(pagePath);
for (const token of [
  'ACTIVE_CENTER_BASIC_PROFILE_EDIT',
  'updateActiveCenterBasicProfileDetails',
  'requireAdminPermission("active_centers.public_state.update")',
  '.from("centers")',
  '.eq("status", "active")',
  '.eq("is_active", true)',
  '.is("deleted_at", null)',
  'Edit basic profile info',
  'Basic profile details',
  '6 fields only',
  'English name',
  'Arabic name',
  'Short description EN',
  'Short description AR',
  'Description EN',
  'Description AR',
  'Save basic profile info',
  'No contact, location, taxonomy, media, claim, verification, billing, or commercial edits.',
]) {
  mustHave(page, token, pagePath);
}

const allowedFieldNames = uniqueSorted([
  'centerId',
  'descriptionAr',
  'descriptionEn',
  'nameAr',
  'nameEn',
  'shortDescriptionAr',
  'shortDescriptionEn',
]);
const actualFieldNames = uniqueSorted([...page.matchAll(/\bname="([^"]+)"/g)].map((match) => match[1]));
if (!sameList(actualFieldNames, allowedFieldNames)) {
  throw new Error(`${pagePath} exposes unexpected form field names: ${actualFieldNames.join(', ')}`);
}

for (const token of [
  'name="primaryPhone"',
  'name="secondaryPhone"',
  'name="whatsappPhone"',
  'name="email"',
  'name="websiteUrl"',
  'name="mapUrl"',
  'name="centerType"',
  'name="verificationStatus"',
  'name="defaultCountry"',
  'name="defaultLocale"',
  'name="slug"',
  'name="legalName"',
  'useActionState',
  'DraftCenterEditForm',
]) {
  mustNotHave(page, token, pagePath);
}

const actionPath = 'src/server/admin/active-center-basic-profile-actions.ts';
const action = readFile(actionPath);
for (const token of [
  '"use server";',
  'export async function updateActiveCenterBasicProfileDetails',
  'requireAdminPermission("active_centers.public_state.update")',
  'const centerId = formRequiredText(formData, "centerId", 64)',
  'const nameEn = formRequiredText(formData, "nameEn", 160)',
  'const nameAr = formText(formData, "nameAr", 160)',
  'const shortDescriptionEn = formText(formData, "shortDescriptionEn", 240)',
  'const shortDescriptionAr = formText(formData, "shortDescriptionAr", 240)',
  'const descriptionEn = formText(formData, "descriptionEn", 4000)',
  'const descriptionAr = formText(formData, "descriptionAr", 4000)',
  '.eq("status", "active")',
  '.eq("is_active", true)',
  '.is("deleted_at", null)',
  'name_en: nameEn',
  'name_ar: nameAr',
  'short_description_en: shortDescriptionEn',
  'short_description_ar: shortDescriptionAr',
  'description_en: descriptionEn',
  'description_ar: descriptionAr',
  'writeAdminAuditEvent({',
  'action: "active_center.basic_profile_updated"',
  'revalidatePath(enPath)',
  'revalidatePath(arPath)',
  'revalidatePath("/admin/active-centers")',
  'revalidatePath(`/admin/active-centers/${centerId}/edit-profile`)',
]) {
  mustHave(action, token, actionPath);
}

for (const token of [
  'primary_phone',
  'secondary_phone',
  'whatsapp_phone',
  'email,',
  'website_url',
  'map_url',
  'center_type',
  'verification_status',
  'is_claimable',
  'billing',
  'subscription',
  'sponsored',
  'center_locations',
  'entity_media',
  '.delete(',
  '.upsert(',
  '.insert(',
]) {
  mustNotHave(action, token, actionPath);
}

const auditPath = 'src/server/admin/audit-log.ts';
const audit = readFile(auditPath);
mustHave(audit, '| "active_center.basic_profile_updated"', auditPath);

const avPath = 'scripts/admin/check-av.mjs';
const av = readFile(avPath);
mustHave(av, "import './check-active-center-basic-profile-guard.mjs';", avPath);

console.log('Active center basic profile guard checks passed.');
