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

const actionPath = 'src/server/admin/draft-center-public-activation-actions.ts';
const action = readFile(actionPath);

for (const token of [
  'activateDraftCenterPublicProfile',
  'requireAdminPermission("draft_centers.update")',
  'getDraftCenterPublicationReadiness(centerId)',
  'if (!readiness.canPublish)',
  '.eq("status", "pending_review")',
  '.eq("is_active", false)',
  '.eq("is_claimable", false)',
  'status: "active"',
  'is_active: true',
  'is_claimable: false',
  'draft_center.public_profile_activated',
  'revalidatePath(`/admin/draft-centers/${centerId}`)',
  'revalidatePath(enPath)',
  'revalidatePath(arPath)',
  'revalidatePath("/sitemap.xml")',
]) mustHave(action, token, actionPath);

for (const token of [
  'verification_status:',
  'is_claimable: true',
  'subscription_status',
  'commercial_addon',
]) mustNotHave(action, token, actionPath);

const panelPath = 'src/components/admin/draft-center-publication-readiness-panel.tsx';
const panel = readFile(panelPath);
for (const token of [
  '"use client"',
  'useActionState',
  'activateDraftCenterPublicProfile',
  'name="centerId"',
  'disabled={!canSubmit}',
  'readiness.canPublish',
]) mustHave(panel, token, panelPath);

const pagePath = 'src/app/admin/draft-centers/[centerId]/page.tsx';
const page = readFile(pagePath);
mustHave(page, '<DraftCenterPublicationReadinessPanel centerId={centerId} readiness={readiness.readiness} />', pagePath);

const auditPath = 'src/server/admin/audit-log.ts';
const audit = readFile(auditPath);
mustHave(audit, '"draft_center.public_profile_activated"', auditPath);

const packagePath = 'package.json';
const packageJson = readFile(packagePath);
mustHave(packageJson, '"admin:final-chain:validate": "node scripts/admin/check-admin-final-chain.mjs"', packagePath);
mustHave(packageJson, 'pnpm admin:final-chain:validate', packagePath);

console.log('Admin final chain checks passed.');
