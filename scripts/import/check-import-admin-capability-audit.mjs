import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const capabilityPath = 'src/server/admin/import-admin-capability-audit.ts';
const manualPublishPath = 'src/server/admin/import-manual-publish-flow.ts';
const queuePath = 'src/server/admin/import-queue-dashboard.ts';
const readinessPath = 'src/server/admin/import-readiness-engine.ts';

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

const capabilitySource = await readText(capabilityPath);
const manualPublishSource = await readText(manualPublishPath);
const queueSource = await readText(queuePath);
const readinessSource = await readText(readinessPath);

for (const token of [
  'export type ImportAdminCapabilityAction',
  '"view_import_queue"',
  '"view_readiness_panel"',
  '"revalidate_geo"',
  '"revalidate_seo"',
  '"regenerate_schema"',
  '"regenerate_internal_links"',
  '"rerun_duplicate_check"',
  '"export_blocked_rows"',
  '"manual_approve"',
  '"publish_entity"',
  '"unpublish_entity"',
  '"archive_import_row"',
  'export type ImportAdminCapabilityPermission',
  '"imports.read"',
  '"imports.validate"',
  '"imports.generate"',
  '"imports.export"',
  '"imports.approve"',
  '"imports.publish"',
  '"imports.archive"',
  'export type ImportAdminCapabilityState = "enabled" | "disabled";',
  'export type ImportAdminCapabilityBlocker',
  'missing_permission',
  'readiness_blocked',
  'manual_publish_flow_blocked',
  'row_not_selected',
  'row_already_published',
  'row_archived',
  'no_blocked_rows_to_export',
  'audit_log_required',
  'export type ImportAdminCapabilityContext',
  'selectedRow: ImportQueueDashboardRow | null',
  'readiness: ImportEntityReadiness | null',
  'manualPublishFlow: ImportManualPublishFlowResult | null',
  'grantedPermissions: readonly ImportAdminCapabilityPermission[]',
  'blockedRowCount: number',
  'auditLogAvailable: boolean',
  'export type ImportAdminCapability',
  'IMPORT_ADMIN_ACTION_PERMISSIONS',
  'auditRequiredActions',
  'export function buildImportAdminCapabilities',
  'export function buildImportAdminCapability',
  'export function getImportAdminCapabilityBlockers',
  'requiresSelectedRow',
]) {
  assertIncludes(capabilitySource, token, `${capabilityPath} must include ${token}`);
}

for (const forbiddenToken of [
  'return true;',
  'state: "enabled"',
  'publish_entity: "imports.read"',
  'manual_approve: "imports.read"',
  'regenerate_schema: "imports.read"',
  'update(',
  'insert(',
  'delete(',
  'visibility: "public"',
]) {
  assertNotIncludes(capabilitySource, forbiddenToken, `${capabilityPath} must not include unsafe admin capability shortcut ${forbiddenToken}.`);
}

for (const token of ['ImportManualPublishFlowResult', 'canPublish']) {
  assertIncludes(manualPublishSource, token, `${manualPublishPath} must include manual publish token ${token}`);
}

for (const token of ['ImportQueueDashboardRow', 'row_status']) {
  assertIncludes(queueSource, token, `${queuePath} must include queue token ${token}`);
}

for (const token of ['ImportEntityReadiness', 'publishReady']) {
  assertIncludes(readinessSource, token, `${readinessPath} must include readiness token ${token}`);
}

console.log('import admin capability audit check passed.');
