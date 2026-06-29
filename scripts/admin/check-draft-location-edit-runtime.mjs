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

function assertIncludes(content, token, label) {
  if (!content.includes(token)) {
    throw new Error(`${label} is missing required token: ${token}`);
  }
}

const actionPath = 'src/server/admin/draft-center-location-actions.ts';
const actionContent = readFile(actionPath);

for (const token of [
  'export async function updateDraftCenterLocationCandidate',
  'requireAdminPermission("draft_centers.update")',
  '.in("status", [...draftStatuses])',
  '.eq("is_active", false)',
  'locationUpdatePayload(formData)',
  'is_active: false',
  'public_email_visible: false',
  'public_primary_phone_visible: false',
  'public_secondary_phone_visible: false',
  'public_whatsapp_phone_visible: false',
  'contact_review_status: "pending"',
  'writeAdminAuditEvent',
  'summary: "Draft center location candidate updated."',
  'revalidatePath(`/admin/draft-centers/${centerId}`)',
]) {
  assertIncludes(actionContent, token, actionPath);
}

const formPath = 'src/components/admin/draft-center-location-edit-form.tsx';
const formContent = readFile(formPath);

for (const token of [
  'updateDraftCenterLocationCandidate',
  'Private candidate edit',
  'No public visibility changes',
  'Save private edits',
  'Editing active locations requires a separate review workflow.',
]) {
  assertIncludes(formContent, token, formPath);
}

const panelPath = 'src/components/admin/draft-center-location-panel.tsx';
const panelContent = readFile(panelPath);

for (const token of [
  'DraftCenterLocationEditForm',
  'Candidate edits stay private.',
  'Activation, public visibility, and promotion require a separate review workflow.',
]) {
  assertIncludes(panelContent, token, panelPath);
}

console.log('Draft location edit runtime checks passed.');
