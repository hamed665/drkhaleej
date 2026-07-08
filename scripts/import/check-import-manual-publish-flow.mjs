import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const flowPath = 'src/server/admin/import-manual-publish-flow.ts';
const readinessPath = 'src/server/admin/import-readiness-engine.ts';
const performancePath = 'src/server/admin/import-performance-guard.ts';
const manualPublishContractPath = 'docs/platform/DRMUSCAT_MANUAL_PUBLISH_FLOW_CONTRACT.md';

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

const flowSource = await readText(flowPath);
const readinessSource = await readText(readinessPath);
const performanceSource = await readText(performancePath);
const manualPublishContractSource = await readText(manualPublishContractPath);

for (const token of [
  'export type ImportManualPublishStep',
  '"validate_readiness"',
  '"generate_internal_links"',
  '"generate_schema"',
  '"check_sitemap_eligibility"',
  '"check_public_render_budget"',
  '"manual_approve"',
  '"publish"',
  'export type ImportManualPublishStepStatus = "pending" | "complete" | "blocked";',
  'export type ImportManualPublishBlocker',
  'readiness_blocked',
  'internal_links_not_generated',
  'schema_not_generated',
  'sitemap_not_eligible',
  'public_render_budget_failed',
  'manual_approval_missing',
  'publish_step_not_reached',
  'export type ImportManualPublishFlowInput',
  'readinessInput: ImportReadinessInput',
  'publicRenderPlan: ImportPublicRenderPlan',
  'internalLinksGenerated: boolean',
  'schemaGenerated: boolean',
  'manualApproved: boolean',
  'export type ImportManualPublishFlowStep',
  'export type ImportManualPublishFlowResult',
  'IMPORT_MANUAL_PUBLISH_ORDER',
  'export function getManualPublishFlow',
  'export function canManualPublish',
  'getEntityReadiness',
  'isImportPublicRenderPlanWithinBudget',
]) {
  assertIncludes(flowSource, token, `${flowPath} must include ${token}`);
}

const orderedTokens = [
  '"validate_readiness",',
  '"generate_internal_links",',
  '"generate_schema",',
  '"check_sitemap_eligibility",',
  '"check_public_render_budget",',
  '"manual_approve",',
  '"publish",',
];
let previousIndex = -1;
for (const token of orderedTokens) {
  const index = flowSource.indexOf(token);
  assert(index > previousIndex, `${flowPath} must keep publish flow order token ${token}`);
  previousIndex = index;
}

for (const forbiddenToken of [
  'return true;',
  'canPublish: true',
  'status: "complete", blockers: []',
  'update(',
  'insert(',
  'delete(',
  'visibility: "public"',
  'index_policy: "index"',
  'sitemap_policy: "included"',
]) {
  assertNotIncludes(flowSource, forbiddenToken, `${flowPath} must not include unsafe publish shortcut ${forbiddenToken}.`);
}

for (const token of ['getEntityReadiness', 'publishReady', 'sitemapReady']) {
  assertIncludes(readinessSource, token, `${readinessPath} must include readiness token ${token}`);
}

for (const token of ['isImportPublicRenderPlanWithinBudget', 'getImportPerformanceBlockers']) {
  assertIncludes(performanceSource, token, `${performancePath} must include performance token ${token}`);
}

for (const token of [
  'PR 11: Manual Publish Flow',
  'Manual publish must only happen after all readiness checks pass.',
  'Manual approval is required before visibility can become public.',
  'Publish flow order is fixed:',
  'Validate readiness',
  'Generate links',
  'Generate schema',
  'Check sitemap eligibility',
  'Check public render budget',
  'Manual approve',
  'Publish',
  'This PR should not add public routes or sitemap XML generation.',
]) {
  assertIncludes(manualPublishContractSource, token, `${manualPublishContractPath} must include manual publish flow token ${token}`);
}

console.log('import manual publish flow check passed.');
