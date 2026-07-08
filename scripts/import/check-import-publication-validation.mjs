import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const validationPath = 'src/server/admin/import-publication-validation.ts';
const lifecyclePath = 'src/server/admin/import-publish-lifecycle.ts';
const architecturePath = 'docs/platform/DRMUSCAT_IMPORT_READINESS_CONTROLLED_PUBLISHING_ARCHITECTURE_V1.md';

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

const validationSource = await readText(validationPath);
const lifecycleSource = await readText(lifecyclePath);
const architectureSource = await readText(architecturePath);

for (const token of [
  'export type ImportPublicationValidationBlocker',
  'slug_missing',
  'slug_invalid',
  'title_missing',
  'title_too_short',
  'meta_description_missing',
  'meta_description_too_short',
  'canonical_missing',
  'canonical_invalid',
  'domain_invalid',
  'entity_type_invalid',
  'canonical_geo_invalid',
  'minimum_content_incomplete',
  'duplicate_check_missing',
  'duplicate_check_failed',
  'schema_missing',
  'schema_invalid',
  'internal_links_missing',
  'manual_approval_missing',
  'export type ImportPublicationValidationInput',
  'slug: string | null',
  'title: string | null',
  'meta_description: string | null',
  'canonical_path: string | null',
  'domain_validated: boolean',
  'entity_type_validated: boolean',
  'canonical_geo_validated: boolean',
  'minimum_content_complete: boolean',
  'duplicate_check_passed: boolean | null',
  'schema_generated: boolean',
  'schema_validated: boolean',
  'internal_links_generated: boolean',
  'manual_approved: boolean',
  'const slugPattern',
  'const canonicalPathPattern',
  'minimumTitleLength = 10',
  'minimumMetaDescriptionLength = 40',
  'export function isValidImportSlug',
  'export function isValidImportCanonicalPath',
  'export function getImportPublicationValidationBlockers',
  'export function isImportPublicationValidationReady',
]) {
  assertIncludes(validationSource, token, `${validationPath} must include ${token}`);
}

for (const forbiddenToken of [
  'return true;',
  'schema_validated: true',
  'manual_approved: true',
  'internal_links_generated: true',
]) {
  assertNotIncludes(validationSource, forbiddenToken, `${validationPath} must not include unsafe shortcut ${forbiddenToken}.`);
}

for (const token of [
  'seo_not_validated',
  'geo_not_validated',
  'content_not_validated',
  'relations_not_validated',
  'schema_not_validated',
  'duplicate_check_missing',
]) {
  assertIncludes(lifecycleSource, token, `${lifecyclePath} must still include lifecycle blocker ${token}`);
}

for (const token of [
  'PR 5: SEO / Content / Schema Validation Blockers',
  'slug valid',
  'title valid',
  'meta description valid',
  'canonical valid',
  'domain valid',
  'entity type valid',
  'canonical geo valid',
  'minimum content complete',
  'duplicate check passed',
  'schema generated',
  'schema valid',
  'internal links generated',
  'manual approved',
]) {
  assertIncludes(architectureSource, token, `${architecturePath} must include PR 5 contract token ${token}`);
}

console.log('import publication validation check passed.');
