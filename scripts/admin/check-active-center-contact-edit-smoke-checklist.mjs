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

const docPath = 'docs/admin/active-center-contact-edit-smoke-checklist.md';
const doc = readFile(docPath);

for (const token of [
  'Active Center Contact Edit Smoke Checklist',
  'This checklist is for active centers only.',
  'does not return an active center to draft',
  '/admin/active-centers/[centerId]/edit-contact',
  '/admin/active-centers/[centerId]/gates',
  'Primary phone',
  'Secondary phone',
  'WhatsApp phone',
  'Email',
  'Website URL',
  'Map URL',
  'verification status changes',
  'billing changes',
  'claim state changes',
  'commercial add-ons',
  'taxonomy changes',
  'fake contact values',
  'guessed map URL',
  'manual database edits',
  'manual sitemap edits',
  'Aster Royal Al Raffah Hospital',
  'ACTIVE_CENTER_CONTACT_EDIT',
  'Save public contact details',
  'Review = approved',
  'Actions > 0',
  'Phone visible = yes',
  'WhatsApp visible = yes',
  'Email visible = yes',
  'Website value = yes',
  'Map URL = yes',
  'public action buttons match the gates',
  'sitemap and public profile paths are revalidated by the action',
  'Passing this smoke test does not approve bulk active-center editing or full active-provider profile editing.',
]) {
  mustHave(doc, token, docPath);
}

for (const token of [
  'manual database edit performed: yes',
  'manual sitemap edit performed: yes',
]) {
  mustNotHave(doc, token, docPath);
}

const pagePath = 'src/app/admin/active-centers/[centerId]/edit-contact/page.tsx';
const page = readFile(pagePath);
for (const token of [
  'ACTIVE_CENTER_CONTACT_EDIT',
  'updateActiveCenterPublicContactDetails',
  'Save public contact details',
  'View public action gates',
  'Check gates after saving',
]) {
  mustHave(page, token, pagePath);
}

const gatesPath = 'src/app/admin/active-centers/[centerId]/gates/page.tsx';
const gates = readFile(gatesPath);
for (const token of [
  'Review',
  'Actions',
  'Phone value',
  'Phone visible',
  'WhatsApp value',
  'WhatsApp visible',
  'Email value',
  'Email visible',
  'Website value',
  'Map URL',
  'Location ID',
]) {
  mustHave(gates, token, gatesPath);
}

const actionPath = 'src/server/admin/active-center-contact-edit-actions.ts';
const action = readFile(actionPath);
for (const token of [
  'contact_review_status: "approved"',
  'public_primary_phone_visible: hasText(primaryPhone)',
  'public_secondary_phone_visible: hasText(secondaryPhone)',
  'public_whatsapp_phone_visible: hasText(whatsappPhone)',
  'public_email_visible: hasText(email)',
  'map_url: mapUrl',
  'writeAdminAuditEvent({',
  'revalidatePath(enPath)',
  'revalidatePath(arPath)',
  'revalidatePath("/sitemap.xml")',
  'revalidatePath("/admin/active-centers")',
  'revalidatePath(`/admin/active-centers/${centerId}/gates`)',
]) {
  mustHave(action, token, actionPath);
}

const avPath = 'scripts/admin/check-av.mjs';
const av = readFile(avPath);
mustHave(av, "import './check-active-center-contact-edit-smoke-checklist.mjs';", avPath);

console.log('Active center contact edit smoke checklist checks passed.');
