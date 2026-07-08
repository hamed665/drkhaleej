import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const lifecyclePath = 'src/server/admin/import-publish-lifecycle.ts';
const lockPath = 'src/server/admin/import-publish-lock.ts';
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

const lifecycleSource = await readText(lifecyclePath);
const lockSource = await readText(lockPath);
const architectureSource = await readText(architecturePath);

for (const token of [
  'export type ImportEntityLifecycleState',
  '| "draft"',
  '| "imported"',
  '| "validation_failed"',
  '| "validated"',
  '| "approved"',
  '| "published"',
  '| "unpublished"',
  '| "archived"',
  'export type ImportPublishBlockerReason',
  'export type ImportPublishEligibilityEntity',
  'export type ImportReadinessStatus',
  'publishableLifecycleStates',
  'normalizeImportLifecycleState',
  'export function getPublishBlockers',
  'export function canPublishEntity',
  'export function getReadinessStatus',
  'getImportPublishLockViolations',
  'manual_approval_missing',
  'seo_not_validated',
  'geo_not_validated',
  'content_not_validated',
  'relations_not_validated',
  'schema_not_validated',
  'duplicate_check_missing',
]) {
  assertIncludes(lifecycleSource, token, `${lifecyclePath} must include ${token}`);
}

for (const forbiddenToken of [
  'return true;',
  'visibility = "public"',
  'index_policy = "index"',
  'sitemap_policy = "included"',
]) {
  assertNotIncludes(lifecycleSource, forbiddenToken, `${lifecyclePath} must not include unsafe shortcut ${forbiddenToken}.`);
}

for (const token of [
  'IMPORT_PUBLISH_LOCK_DEFAULTS',
  'getImportPublishLockViolations',
  'isImportPublishLocked',
]) {
  assertIncludes(lockSource, token, `${lockPath} must still include ${token}`);
}

for (const token of [
  'PR 2: Entity Lifecycle + Publish Eligibility',
  'canPublishEntity(entity)',
  'getPublishBlockers(entity)',
  'getReadinessStatus(entity)',
  'draft',
  'imported',
  'validation_failed',
  'validated',
  'approved',
  'published',
  'unpublished',
  'archived',
  '`public_ready` should be computed from validation state, not manually trusted as source-of-truth.',
]) {
  assertIncludes(architectureSource, token, `${architecturePath} must include PR 2 contract token ${token}`);
}

console.log('import publish lifecycle check passed.');
