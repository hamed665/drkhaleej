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
  if (!content.includes(token)) {
    throw new Error(`${label} missing token: ${token}`);
  }
}

function mustNotHave(content, token, label) {
  if (content.includes(token)) {
    throw new Error(`${label} has forbidden token: ${token}`);
  }
}

const docPath = 'docs/admin/provider-view-contract.md';
const doc = readFile(docPath);
for (const token of [
  'Provider View Contract',
  'The draft center workflow is only for records in these statuses:',
  '`draft`',
  '`pending_review`',
  '`status` set to `active`',
  '`is_active` set to true',
  '`is_claimable` kept false',
  'must not appear in the draft center list',
  'must not load through the draft center detail helper',
  'the admin audit event list helper',
  '`draft_center.public_profile_activated`',
  'public English profile route',
  'public Arabic profile route',
  'read-only',
  'must not reuse draft center edit forms',
]) {
  mustHave(doc, token, docPath);
}

const draftCentersPath = 'src/server/admin/draft-centers.ts';
const draftCenters = readFile(draftCentersPath);
for (const token of [
  'type AdminCenterWorkflowStatus = Extract<CenterRow["status"], "draft" | "pending_review">',
  'const workflowStatuses: AdminCenterWorkflowStatus[] = ["draft", "pending_review"]',
  'listAdminDraftCenters',
  'getAdminDraftCenterById',
  '.in("status", workflowStatuses)',
  '.is("deleted_at", null)',
]) {
  mustHave(draftCenters, token, draftCentersPath);
}
for (const token of [
  '["draft", "pending_review", "active"]',
  '"draft" | "pending_review" | "active"',
]) {
  mustNotHave(draftCenters, token, draftCentersPath);
}

const auditPath = 'src/server/admin/audit-log.ts';
const audit = readFile(auditPath);
for (const token of [
  'listAdminAuditEvents',
  'requireAdminPermission("admin.audit.read")',
  'draft_center.public_profile_activated',
  'action?: string | undefined',
  'entityType?: string | undefined',
]) {
  mustHave(audit, token, auditPath);
}

const actionPath = 'src/server/admin/draft-center-public-activation-actions.ts';
const action = readFile(actionPath);
for (const token of [
  'draft_center.public_profile_activated',
  'entityType: "center"',
  'targetTable: "centers"',
  'oldValues:',
  'newValues:',
  'public_paths: [enPath, arPath]',
  'sitemap_revalidated: true',
  'revalidatePath(enPath)',
  'revalidatePath(arPath)',
]) {
  mustHave(action, token, actionPath);
}

const adminPagePath = 'src/app/admin/draft-centers/[centerId]/page.tsx';
const adminPage = readFile(adminPagePath);
mustHave(adminPage, 'DraftCenterEditForm', adminPagePath);
mustHave(adminPage, 'getAdminDraftCenterById(centerId)', adminPagePath);

const packagePath = 'package.json';
const packageJson = readFile(packagePath);
for (const token of [
  '"admin:provider-view-contract:validate": "node scripts/admin/check-provider-view-contract.mjs"',
  'pnpm admin:provider-view-contract:validate',
]) {
  mustHave(packageJson, token, packagePath);
}

console.log('Provider view contract checks passed.');
