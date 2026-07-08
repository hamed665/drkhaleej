import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const actionPath = 'src/server/admin/import-admin-action-contract.ts';
const capabilityPath = 'src/server/admin/import-admin-capability-audit.ts';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(source, token, message) {
  assert(source.includes(token), message);
}

function assertNotIncludes(source, token, message) {
  assert(!source.includes(token), message);
}

const actionSource = await readText(actionPath);
const capabilitySource = await readText(capabilityPath);

for (const token of [
  'export type ImportAdminActionTarget',
  '"none"',
  '"import_batch"',
  '"import_row"',
  '"entity"',
  '"blocked_rows_export"',
  'export type ImportAdminActionMutationBoundary',
  '"read_only"',
  '"validation_only"',
  '"generation_only"',
  '"approval_only"',
  '"publish_state"',
  '"archive_state"',
  'export type ImportAdminActionAuditEvent',
  '"admin_geo_revalidated"',
  '"admin_seo_revalidated"',
  '"admin_schema_regenerated"',
  '"admin_internal_links_regenerated"',
  '"admin_duplicate_check_rerun"',
  '"admin_blocked_rows_exported"',
  '"admin_entity_manually_approved"',
  '"admin_entity_published"',
  '"admin_entity_unpublished"',
  '"admin_import_row_archived"',
  'export type ImportAdminActionContract',
  'action: ImportAdminCapabilityAction',
  'target: ImportAdminActionTarget',
  'requiredPermission: ImportAdminCapabilityPermission',
  'mutationBoundary: ImportAdminActionMutationBoundary',
  'auditEvent: ImportAdminActionAuditEvent',
  'requiresSelectedRow: boolean',
  'requiresAuditLog: boolean',
  'requiresReadiness: boolean',
  'requiresManualPublishFlow: boolean',
  'IMPORT_ADMIN_ACTION_CONTRACTS',
  'view_import_queue:',
  'view_readiness_panel:',
  'revalidate_geo:',
  'revalidate_seo:',
  'regenerate_schema:',
  'regenerate_internal_links:',
  'rerun_duplicate_check:',
  'export_blocked_rows:',
  'manual_approve:',
  'publish_entity:',
  'unpublish_entity:',
  'archive_import_row:',
  'export function getImportAdminActionContract',
  'export function isImportAdminActionReadOnly',
]) {
  assertIncludes(actionSource, token, `${actionPath} must include ${token}`);
}

for (const token of [
  'publish_entity: {',
  'requiredPermission: "imports.publish"',
  'mutationBoundary: "publish_state"',
  'auditEvent: "admin_entity_published"',
  'requiresManualPublishFlow: true',
  'manual_approve: {',
  'requiredPermission: "imports.approve"',
  'requiresReadiness: true',
  'regenerate_schema: {',
  'mutationBoundary: "generation_only"',
  'export_blocked_rows: {',
  'mutationBoundary: "read_only"',
]) {
  assertIncludes(actionSource, token, `${actionPath} must include safe action contract token ${token}`);
}

for (const forbiddenToken of [
  'publish_entity: {\n    action: "publish_entity",\n    target: "none"',
  'publish_entity: {\n    action: "publish_entity",\n    target: "entity",\n    requiredPermission: "imports.read"',
  'manual_approve: {\n    action: "manual_approve",\n    target: "entity",\n    requiredPermission: "imports.read"',
  'auditEvent: "none",\n    requiresSelectedRow: true,\n    requiresAuditLog: true',
  'return true;',
  'insert(',
  'update(',
  'delete(',
]) {
  assertNotIncludes(actionSource, forbiddenToken, `${actionPath} must not include unsafe action shortcut ${forbiddenToken}.`);
}

for (const token of [
  'ImportAdminCapabilityAction',
  'ImportAdminCapabilityPermission',
  'IMPORT_ADMIN_ACTION_PERMISSIONS',
  'buildImportAdminCapability',
]) {
  assertIncludes(capabilitySource, token, `${capabilityPath} must include capability token ${token}`);
}

console.log('import admin action contract check passed.');
