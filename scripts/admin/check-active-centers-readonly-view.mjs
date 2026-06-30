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

function mustHave(content, token, label) {
  if (!content.includes(token)) throw new Error(`${label} missing token: ${token}`);
}

function mustNotHave(content, token, label) {
  if (content.includes(token)) throw new Error(`${label} has forbidden token: ${token}`);
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
  'publicPathAr',
  'publicPathEn',
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
  'status: "active"',
]) {
  mustNotHave(helper, token, helperPath);
}

const pagePath = 'src/app/admin/active-centers/page.tsx';
const page = readFile(pagePath);
for (const token of [
  'export default async function AdminActiveCentersPage',
  'listAdminActiveCenters()',
  'READ_ONLY_ACTIVE_PROVIDER_VIEW',
  'No database error details are exposed here.',
  'read-only operational visibility',
  'draft_center.public_profile_activated',
  'English public profile',
  'Arabic public profile',
]) {
  mustHave(page, token, pagePath);
}
for (const token of [
  'useActionState',
  '<form',
  'type="submit"',
  'DraftCenterEditForm',
  'activateDraftCenterPublicProfile',
  'updateDraft',
  'createDraft',
  'revalidatePath',
  'writeAdminAuditEvent',
]) {
  mustNotHave(page, token, pagePath);
}

const controlCenterPath = 'src/lib/admin/control-center.ts';
const controlCenter = readFile(controlCenterPath);
for (const token of [
  'title: "Active Centers"',
  'status: "Read-only"',
  'href: "/admin/active-centers"',
  'No active-provider edit controls are available here.',
]) {
  mustHave(controlCenter, token, controlCenterPath);
}

const packagePath = 'package.json';
const packageJson = readFile(packagePath);
for (const token of [
  '"admin:active-centers-readonly:validate": "node scripts/admin/check-active-centers-readonly-view.mjs"',
  'pnpm admin:active-centers-readonly:validate',
]) {
  mustHave(packageJson, token, packagePath);
}

console.log('Active centers read-only view checks passed.');
