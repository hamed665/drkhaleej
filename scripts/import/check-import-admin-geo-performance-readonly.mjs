import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const modelPath = 'src/server/admin/import-admin-geo-performance-readonly.ts';
const componentPath = 'src/components/admin/import-geo-performance-readonly-panel.tsx';
const pagePath = 'src/app/admin/imports/readiness/page.tsx';
const docsPath = 'docs/platform/DRKHALEEJ_ADMIN_GEO_PERFORMANCE_READONLY.md';
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
  'ImportAdminGeoPerformanceReadOnlyModel',
  'mode: "read_only"',
  'databaseWriteReady: false',
  'publicGeoReady: false',
  'allowedActions: readonly []',
  'IMPORT_OMAN_GEO_EXPECTED_GOVERNORATES',
  'IMPORT_OMAN_GEO_EXPECTED_WILAYATS',
  'IMPORT_OMAN_GEO_EXPECTED_MUSCAT_AREAS',
  'IMPORT_PUBLIC_PERFORMANCE_BUDGET',
  'getImportAdminGeoPerformanceReadOnlyModel',
]) {
  assert(model.includes(token), `${modelPath} must include ${token}.`);
}

for (const token of [
  'Geo and performance readiness',
  'Allowed actions: none',
  'DB write ready',
  'Public geo ready',
  'Public performance budget',
]) {
  assert(component.includes(token), `${componentPath} must include ${token}.`);
}

for (const token of [
  'ImportGeoPerformanceReadOnlyPanel',
  'getImportAdminGeoPerformanceReadOnlyModel',
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
  'sitemapIncluded: true',
]) {
  assert(!model.includes(forbidden), `${modelPath} must not include ${forbidden}.`);
  assert(!component.includes(forbidden), `${componentPath} must not include ${forbidden}.`);
  assert(!page.includes(forbidden), `${pagePath} must not include ${forbidden}.`);
}

for (const token of [
  'Read-only only',
  'No database writes',
  'No publish controls',
  'No sitemap controls',
  'No index toggles',
  'No manual bypass',
]) {
  assert(docs.includes(token), `${docsPath} must include ${token}.`);
}

assert(
  audit.includes("import './check-import-admin-geo-performance-readonly.mjs';"),
  'publish readiness audit must chain the read-only geo/performance validator.',
);

console.log('import admin geo/performance read-only check passed.');
