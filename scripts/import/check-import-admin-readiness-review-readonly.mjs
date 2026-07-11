import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const modelPath = 'src/server/admin/import-admin-readiness-review-readonly.ts';
const componentPath = 'src/components/admin/import-readiness-review-readonly-panel.tsx';
const pagePath = 'src/app/admin/imports/readiness/page.tsx';
const docsPath = 'docs/platform/DRKHALEEJ_ADMIN_READINESS_REVIEW_READONLY.md';
const auditPath = 'scripts/import/check-import-publish-readiness-audit.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

const model = await readText(modelPath);
const component = await readText(componentPath);
const page = await readText(pagePath);
const docs = await readText(docsPath);
const audit = await readText(auditPath);

for (const token of [
  'ImportAdminReadinessReviewReadOnlyModel',
  'mode: "read_only"',
  'buildAdminReadinessPanelRows',
  'buildAdminReadinessSummary',
  'supportedStates: readonly ["ready", "blocked"]',
  'allowedActions: readonly []',
  'getImportAdminReadinessReviewReadOnlyModel',
]) {
  assert(model.includes(token), `${modelPath} must include ${token}.`);
}

for (const token of [
  'Import readiness review',
  'Allowed actions: none',
  'No readiness rows loaded',
  'Blocked',
  'Next action',
]) {
  assert(component.includes(token), `${componentPath} must include ${token}.`);
}

for (const token of [
  'ImportReadinessReviewReadOnlyPanel',
  'getImportAdminReadinessReviewReadOnlyModel',
  'Read-only boundary',
]) {
  assert(page.includes(token), `${pagePath} must include ${token}.`);
}

for (const forbidden of [
  '"use server"',
  '<form',
  '<button',
  'createSupabaseServiceRoleClient',
  'insert(',
  'update(',
  'delete(',
  'publishEntity',
  'bulkPublish',
  'manualBypass',
]) {
  assert(!model.includes(forbidden), `${modelPath} must not include ${forbidden}.`);
  assert(!component.includes(forbidden), `${componentPath} must not include ${forbidden}.`);
  assert(!page.includes(forbidden), `${pagePath} must not include ${forbidden}.`);
}

for (const token of [
  'Read-only boundary',
  'No database writes',
  'No forms or buttons',
  'No approval controls',
  'No publish controls',
  'No sitemap controls',
  'No index toggles',
  'No manual bypass',
]) {
  assert(docs.includes(token), `${docsPath} must include ${token}.`);
}

assert(
  audit.includes("import './check-import-admin-readiness-review-readonly.mjs';"),
  'publish readiness audit must chain the admin readiness review validator.',
);

console.log('import admin readiness review read-only check passed.');
