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

const pkg = readFile('package.json');
for (const token of [
  '"admin:av:validate": "node scripts/admin/check-av.mjs"',
  'pnpm admin:av:validate',
]) {
  mustHave(pkg, token, 'package.json');
}

console.log('Active view checks passed.');
