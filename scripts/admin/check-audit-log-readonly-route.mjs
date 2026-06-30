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

const pagePath = 'src/app/admin/audit-log/page.tsx';
const page = readFile(pagePath);
for (const token of [
  'import { listAdminAuditEvents } from "@/server/admin/audit-log";',
  'export default async function AdminAuditLogPage',
  'searchParams',
  'listAdminAuditEvents({',
  'action: value("action")',
  'entityType: value("entityType")',
  'actorEmail: value("actorEmail")',
  'createdFrom: value("createdFrom")',
  'createdTo: value("createdTo")',
  'Read-only server-side audit events for protected admin actions.',
  'No secrets, raw sessions,',
  'Audit log could not be loaded.',
  'No audit events yet.',
  'event.permissionKey',
  'event.action',
  'event.entityType',
  'event.summary',
]) {
  mustHave(page, token, pagePath);
}

for (const token of [
  'useActionState',
  'action={',
  'method="post"',
  'type="submit" name=',
  'writeAdminAuditEvent',
  'createSupabaseServiceRoleClient',
  '.insert(',
  '.update(',
  '.delete(',
  'revalidatePath',
  'redirect(',
]) {
  mustNotHave(page, token, pagePath);
}

const helperPath = 'src/server/admin/audit-log.ts';
const helper = readFile(helperPath);
for (const token of [
  'export async function listAdminAuditEvents',
  'await requireAdminPermission("admin.audit.read")',
  '.from("admin_audit_events")',
  '"id, created_at, actor_profile_id, actor_auth_user_id, actor_email, permission_key, action, entity_type, entity_id, summary, reason"',
  '.order("created_at", { ascending: false })',
  '.limit(100)',
  'query = query.eq("action", filters.action)',
  'query = query.eq("entity_type", filters.entityType)',
  'query = query.ilike("actor_email", `%${filters.actorEmail}%`)',
  'query = query.gte("created_at", filters.createdFrom)',
  'query = query.lte("created_at", filters.createdTo)',
  'return { ok: false }',
]) {
  mustHave(helper, token, helperPath);
}

const controlCenterPath = 'src/lib/admin/control-center.ts';
const controlCenter = readFile(controlCenterPath);
for (const token of [
  'title: "Audit Log"',
  'Read-only audit log for actor, permission, action, entity, summary, and reason.',
  'status: "Read-only"',
  'href: "/admin/audit-log"',
]) {
  mustHave(controlCenter, token, controlCenterPath);
}

const activeCentersPath = 'src/app/admin/active-centers/page.tsx';
const activeCenters = readFile(activeCentersPath);
for (const token of [
  'Activation evidence remains in the audit log under the action',
  'draft_center.public_profile_activated',
]) {
  mustHave(activeCenters, token, activeCentersPath);
}

const packagePath = 'package.json';
const packageJson = readFile(packagePath);
for (const token of [
  '"admin:audit-log-readonly:validate": "node scripts/admin/check-audit-log-readonly-route.mjs"',
  'pnpm admin:audit-log-readonly:validate',
]) {
  mustHave(packageJson, token, packagePath);
}

console.log('Audit log read-only route checks passed.');
