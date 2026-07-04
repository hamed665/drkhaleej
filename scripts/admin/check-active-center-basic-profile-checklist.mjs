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

const docPath = 'docs/admin/basic-profile-check.md';
const doc = readFile(docPath);
for (const token of [
  'Basic Profile Check',
  '/admin/active-centers/[centerId]/edit-profile',
  'English name',
  'Arabic name',
  'Short description EN',
  'Short description AR',
  'Description EN',
  'Description AR',
  'Edit basic profile info',
  'ACTIVE_CENTER_BASIC_PROFILE_EDIT',
  'active_center.basic_profile_updated',
]) {
  mustHave(doc, token, docPath);
}

const pagePath = 'src/app/admin/active-centers/[centerId]/edit-profile/page.tsx';
const page = readFile(pagePath);
for (const token of [
  'ACTIVE_CENTER_BASIC_PROFILE_EDIT',
  'Save basic profile info',
  'name="nameEn"',
  'name="nameAr"',
  'name="shortDescriptionEn"',
  'name="shortDescriptionAr"',
  'name="descriptionEn"',
  'name="descriptionAr"',
]) {
  mustHave(page, token, pagePath);
}

const actionPath = 'src/server/admin/active-center-basic-profile-actions.ts';
const action = readFile(actionPath);
for (const token of [
  'updateActiveCenterBasicProfileDetails',
  'active_center.basic_profile_updated',
  'revalidatePath(enPath)',
  'revalidatePath(arPath)',
]) {
  mustHave(action, token, actionPath);
}

const auditPath = 'src/server/admin/audit-log.ts';
const audit = readFile(auditPath);
mustHave(audit, '| "active_center.basic_profile_updated"', auditPath);

const avPath = 'scripts/admin/check-av.mjs';
const av = readFile(avPath);
mustHave(av, "import './check-active-center-basic-profile-checklist.mjs';", avPath);

console.log('Active center basic profile checklist checks passed.');
