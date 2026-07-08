import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const panelPath = 'src/server/admin/import-admin-readiness-panel.ts';
const enginePath = 'src/server/admin/import-readiness-engine.ts';

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

const panelSource = await readText(panelPath);
const engineSource = await readText(enginePath);

for (const token of [
  'export type ImportAdminReadinessStage',
  '"imported"',
  '"validated"',
  '"geo_checked"',
  '"seo_checked"',
  '"schema_generated"',
  '"links_generated"',
  '"manual_approved"',
  '"published"',
  'export type ImportAdminReadinessStageStatus = "complete" | "blocked" | "pending";',
  'export type ImportAdminReadinessEntityRow',
  'entity_id: string',
  'entity_name: string | null',
  'entity_type: ImportEntityType',
  'entity_domain: ImportEntityDomain',
  'lifecycle_state: string',
  'publish_status: string | null',
  'imported_at: string | null',
  'updated_at: string | null',
  'last_validation_at: string | null',
  'readiness: ImportEntityReadiness',
  'export type ImportAdminReadinessFilter',
  'ready_state?: "ready" | "blocked"',
  'sitemap_eligible?: boolean',
  'blocker_category?: ImportReadinessCategory',
  'export type ImportAdminReadinessSummary',
  'totalImported: number',
  'readyToPublish: number',
  'blocked: number',
  'sitemapEligible: number',
  'missingGeo: number',
  'missingSeo: number',
  'missingSchema: number',
  'missingInternalLinks: number',
  'duplicateRisk: number',
  'waitingManualApproval: number',
  'export type ImportAdminReadinessBlockerGroup',
  'export type ImportAdminReadinessTimelineItem',
  'export type ImportAdminReadinessPanelRow',
  'export function buildAdminReadinessSummary',
  'export function groupReadinessBlockers',
  'export function buildAdminReadinessTimeline',
  'export function buildAdminReadinessPanelRows',
  'export function filterAdminReadinessRows',
  'hasReadinessCategory',
  'stageStatus',
  'highestSeverity',
]) {
  assertIncludes(panelSource, token, `${panelPath} must include ${token}`);
}

for (const forbiddenToken of [
  'createSupabaseServiceRoleClient',
  'insert(',
  'update(',
  'delete(',
  'publishEntity',
  'manual_approved?: boolean',
]) {
  assertNotIncludes(panelSource, forbiddenToken, `${panelPath} must not include mutation/UI shortcut ${forbiddenToken}.`);
}

for (const token of [
  'ImportEntityReadiness',
  'ImportReadinessBlocker',
  'ImportReadinessCategory',
  'ImportReadinessNextAction',
  'ImportReadinessSeverity',
  'getEntityReadiness',
]) {
  assertIncludes(engineSource, token, `${enginePath} must include readiness engine token ${token}`);
}

console.log('import admin readiness panel check passed.');
