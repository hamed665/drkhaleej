import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const resultPath = 'src/server/admin/import-admin-action-result-contract.ts';
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

const resultSource = await readText(resultPath);
const actionSource = await readText(actionPath);
const capabilitySource = await readText(capabilityPath);

for (const token of [
  'export type ImportAdminActionResultStatus = "success" | "blocked" | "failed";',
  'export type ImportAdminActionRetryPolicy = "retry_allowed" | "retry_after_fix" | "retry_not_allowed";',
  'export type ImportAdminActionResultCode',
  '"ok"',
  '"blocked_by_capability"',
  '"blocked_by_contract"',
  '"audit_log_unavailable"',
  '"validation_failed"',
  '"generation_failed"',
  '"publish_failed"',
  '"archive_failed"',
  '"unexpected_error"',
  'export type ImportAdminActionAuditPayload',
  'event: ImportAdminActionAuditEvent',
  'action: ImportAdminCapabilityAction',
  'actor_id: string',
  'target_id: string | null',
  'mutation_boundary: ImportAdminActionMutationBoundary',
  'created_at: string',
  'metadata: Record<string, string | number | boolean | null>',
  'export type ImportAdminActionResult',
  'status: ImportAdminActionResultStatus',
  'code: ImportAdminActionResultCode',
  'blockers: readonly ImportAdminCapabilityBlocker[]',
  'retryPolicy: ImportAdminActionRetryPolicy',
  'auditPayload: ImportAdminActionAuditPayload | null',
  'export type ImportAdminActionResultInput',
  'export function buildBlockedAdminActionResult',
  'export function buildSuccessfulAdminActionResult',
  'export function buildFailedAdminActionResult',
  'export function buildAdminActionAuditPayload',
]) {
  assertIncludes(resultSource, token, `${resultPath} must include ${token}`);
}

for (const token of [
  'status: "blocked"',
  'code: input.blockers.includes("audit_log_required") ? "audit_log_unavailable" : "blocked_by_capability"',
  'auditPayload: null',
  'status: "success"',
  'code: "ok"',
  'status: "failed"',
  'retryPolicy: code === "unexpected_error" ? "retry_allowed" : "retry_after_fix"',
  'if (input.audit_event === "none") return null;',
]) {
  assertIncludes(resultSource, token, `${resultPath} must include action result behavior token ${token}`);
}

for (const forbiddenToken of [
  'return true;',
  'auditPayload: {}',
  'status: "success",\n    code: "ok",\n    message: "Admin action completed successfully.",\n    blockers: input.blockers',
  'insert(',
  'update(',
  'delete(',
]) {
  assertNotIncludes(resultSource, forbiddenToken, `${resultPath} must not include unsafe result shortcut ${forbiddenToken}.`);
}

for (const token of ['ImportAdminActionAuditEvent', 'ImportAdminActionMutationBoundary', 'getImportAdminActionContract']) {
  assertIncludes(actionSource, token, `${actionPath} must include admin action token ${token}`);
}

for (const token of ['ImportAdminCapabilityAction', 'ImportAdminCapabilityBlocker']) {
  assertIncludes(capabilitySource, token, `${capabilityPath} must include admin capability token ${token}`);
}

console.log('import admin action result contract check passed.');
