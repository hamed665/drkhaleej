import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const uploadPagePath = 'src/app/admin/imports/upload/page.tsx';
const importsPagePath = 'src/app/admin/imports/page.tsx';
const formPath = 'src/components/admin/import-upload-form.tsx';
const actionPath = 'src/server/admin/import-upload-actions.ts';
const docsPath = 'docs/import/DRKHALEEJ_TEMPLATE_IMPORT_CONTRACT_V1.md';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

async function assertFile(relativePath) {
  try {
    await access(path.join(root, relativePath));
  } catch {
    throw new Error(`Missing required file: ${relativePath}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(source, token, label) {
  assert(source.includes(token), `${label} must include ${token}`);
}

function assertNotIncludes(source, token, label) {
  assert(!source.includes(token), `${label} must not include ${token}`);
}

await assertFile(uploadPagePath);

const uploadPageSource = await readText(uploadPagePath);
const importsPageSource = await readText(importsPagePath);
const formSource = await readText(formPath);
const actionSource = await readText(actionPath);
const docsSource = await readText(docsPath);
const packageSource = await readText('package.json');

for (const token of [
  'ImportUploadForm',
  'requireAdminPermission',
  'await requireAdminPermission("imports.upload")',
  'robots: {',
  'index: false',
  'follow: false',
  'Upload approved Excel, CSV, or TSV import templates into protected staging',
  'does not publish profiles',
  'does not publish profiles, index URLs, update sitemap output, or create public pages',
  '5 MB',
  '500 parsed rows',
  '/admin/imports',
]) {
  assertIncludes(uploadPageSource, token, uploadPagePath);
}

for (const forbiddenToken of [
  'listPublicImportSitemapEntries',
  'application/ld+json',
  'schema.org',
  'publish_status: "index_eligible"',
  'sitemap_policy: "included"',
]) {
  assertNotIncludes(uploadPageSource, forbiddenToken, uploadPagePath);
}

for (const token of [
  'href="/admin/imports/upload"',
  'Upload spreadsheet',
  '/admin/imports/upload',
  '<ImportUploadForm />',
]) {
  assertIncludes(importsPageSource, token, importsPagePath);
}

for (const token of [
  'uploadImportSpreadsheet',
  'name="templateKey"',
  'name="batchName"',
  'name="sourceName"',
  'name="importFile"',
  'type="file"',
  'accept=".xlsx,.csv,.tsv"',
  'Maximum 5 MB',
  'Upload to staging',
  'Open staged batch',
]) {
  assertIncludes(formSource, token, formPath);
}

for (const token of [
  '"use server";',
  'requireAdminPermission("imports.upload")',
  'const maxUploadBytes = 5 * 1024 * 1024;',
  'const maxParsedRows = 500;',
  'isSupportedFileName',
  String.raw`/\.(xlsx|csv|tsv)$/i`,
  'parseImportSpreadsheet(bytes, fileValue.name)',
  '.from<InsertedBatch>("import_batches")',
  '.from<InsertedFile>("import_files")',
  'import_raw_rows',
  'import_validation_issues',
  'writeAdminAuditEvent',
  'Nothing was published',
  'revalidatePath("/admin/imports")',
]) {
  assertIncludes(actionSource, token, actionPath);
}

for (const forbiddenToken of [
  'import_publish_queue',
  'sitemap_policy',
  'index_policy',
  'publish_status',
  'application/ld+json',
]) {
  assertNotIncludes(actionSource, forbiddenToken, actionPath);
}

for (const token of [
  '/admin/imports/upload',
  'imports.upload',
  'staging only',
]) {
  assertIncludes(docsSource, token, docsPath);
}

for (const token of [
  'import:templates:validate',
  'scripts/import/check-template-import-contract.mjs',
  'pnpm import:templates:validate',
]) {
  assertIncludes(packageSource, token, 'package.json');
}

console.log('import upload workspace check passed.');
