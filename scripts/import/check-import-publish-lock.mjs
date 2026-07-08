import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
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

const lockSource = await readText(lockPath);
const architectureSource = await readText(architecturePath);

for (const token of [
  'export type ImportVisibilityPolicy = "private" | "public";',
  'export type ImportIndexPolicy = "noindex" | "index";',
  'export type ImportSitemapPolicy = "excluded" | "included";',
  'export type ImportPublishStatus',
  'export const IMPORT_PUBLISH_LOCK_DEFAULTS',
  'visibility: "private"',
  'index_policy: "noindex"',
  'sitemap_policy: "excluded"',
  'manual_approved: false',
  'publish_status: "imported"',
  'public_ready: false',
  'robots_policy: "noindex"',
  'sitemap_included: false',
  'export function withImportPublishLockDefaults',
  'export function sanitizeImportPublishLockMetadata',
  'export function getImportPublishLockViolations',
  'export function isImportPublishLocked',
  'visibility_not_private',
  'index_policy_not_noindex',
  'sitemap_policy_not_excluded',
  'manual_approved_not_false',
  'public_ready_not_false',
  'metadata_sitemap_included_true',
  'metadata_robots_policy_index',
]) {
  assertIncludes(lockSource, token, `${lockPath} must include ${token}`);
}

for (const forbiddenToken of [
  'visibility: "public"',
  'index_policy: "index"',
  'sitemap_policy: "included"',
  'manual_approved: true',
  'publish_status: "published"',
  'public_ready: true',
  'robots_policy: "index"',
  'sitemap_included: true',
]) {
  assertNotIncludes(lockSource, forbiddenToken, `${lockPath} must not default imported rows with ${forbiddenToken}.`);
}

for (const token of [
  'PR 1: Import Publish Lock',
  'visibility = private',
  'index_policy = noindex',
  'sitemap_policy = excluded',
  'manual_approved = false',
  'Import code must not accept public visibility from CSV input.',
  'Import code must not infer sitemap inclusion.',
  'Import code must not set manual approval.',
]) {
  assertIncludes(architectureSource, token, `${architecturePath} must include PR 1 contract token ${token}`);
}

console.log('import publish lock check passed.');
