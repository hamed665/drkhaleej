import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const cachePath = 'src/server/admin/import-internal-link-cache.ts';
const generatorPath = 'src/server/admin/import-internal-link-generator.ts';
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

const cacheSource = await readText(cachePath);
const generatorSource = await readText(generatorPath);
const architectureSource = await readText(architecturePath);

for (const token of [
  'export type ImportInternalLinkCacheRow',
  'source_entity_id: string',
  'source_type: ImportEntityType',
  'source_domain: ImportEntityDomain',
  'target_entity_id: string',
  'target_type: ImportEntityType',
  'target_domain: ImportEntityDomain',
  'link_group: string',
  'score: number',
  'priority: number',
  'anchor_text_en: string',
  'anchor_text_ar: string',
  'rule_id: string',
  'rule_version: string',
  'generator_version: string',
  'generated_reason: string',
  'generated_at: string',
  'expires_at: string',
  'is_active: boolean',
  'export type ImportInternalLinkCacheWriteInput',
  'export type ImportInternalLinkCacheReadFilter',
  'IMPORT_INTERNAL_LINK_CACHE_TABLE = "entity_internal_links_cache"',
  'IMPORT_INTERNAL_LINK_CACHE_REQUIRED_COLUMNS',
  'export function toImportInternalLinkCacheRow',
  'export function isImportInternalLinkCacheRowActive',
  'export function filterImportInternalLinkCacheRows',
  'row.is_active === true',
  'row.expires_at > now',
]) {
  assertIncludes(cacheSource, token, `${cachePath} must include ${token}`);
}

for (const forbiddenToken of [
  'return true;',
  'is_active: false',
  'expires_at: null',
  'generated_at: null',
]) {
  assertNotIncludes(cacheSource, forbiddenToken, `${cachePath} must not include unsafe shortcut ${forbiddenToken}.`);
}

for (const token of [
  'ImportGeneratedInternalLink',
  'rule_version',
  'generator_version',
  'generated_reason',
  'IMPORT_INTERNAL_LINK_GENERATOR_VERSION',
  'IMPORT_INTERNAL_LINK_RULE_VERSION',
]) {
  assertIncludes(generatorSource, token, `${generatorPath} must still include ${token}`);
}

for (const token of [
  'PR 7: Internal Link Generator + Versioned Cache',
  'entity_internal_links_cache',
  'source_entity_id',
  'source_type',
  'source_domain',
  'target_entity_id',
  'target_type',
  'target_domain',
  'link_group',
  'score',
  'priority',
  'anchor_text_en',
  'anchor_text_ar',
  'rule_id',
  'rule_version',
  'generator_version',
  'generated_reason',
  'generated_at',
  'expires_at',
  'is_active',
  'Public pages must not calculate related links from scratch at render time.',
]) {
  assertIncludes(architectureSource, token, `${architecturePath} must include internal link cache contract token ${token}`);
}

console.log('import internal link cache check passed.');
