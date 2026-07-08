import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contractPath = 'src/server/admin/import-geo-alias-duplicate-guard.ts';
const auditPath = 'scripts/import/check-import-publish-readiness-audit.mjs';

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const source = await readText(contractPath);
const auditSource = await readText(auditPath);

for (const requiredToken of [
  'OmanGeoAliasDuplicateGuardIssue',
  'OmanGeoAliasDuplicateGuardReason',
  'OmanGeoAliasDuplicateGuardResult',
  'OmanGeoDeprecatedEntryResolution',
  'normalizeOmanGeoAlias',
  'getCanonicalSlugCollisionIssues',
  'getAliasCollisionIssues',
  'getDeprecatedGeoEntryIssues',
  'getNonCanonicalSlugVariantIssues',
  'getOmanGeoAliasDuplicateGuardIssues',
  'getOmanGeoAliasDuplicateGuardResult',
  'isOmanGeoAliasDuplicateGuardReady',
]) {
  assert(source.includes(requiredToken), `geo alias duplicate guard must include ${requiredToken}.`);
}

for (const issue of [
  'canonical_slug_duplicate',
  'alias_collides_with_canonical_slug',
  'alias_collides_with_other_alias',
  'alias_points_to_multiple_entries',
  'deprecated_entry_missing_replacement',
  'non_canonical_slug_variant',
  'empty_alias_value',
  'empty_normalized_alias',
]) {
  assert(source.includes(issue), `geo alias duplicate guard must include issue ${issue}.`);
}

for (const forbidden of ['public_indexable_entities', 'publishEntity', 'insert(', 'update(', 'delete(']) {
  assert(!source.includes(forbidden), `geo alias duplicate guard must not include runtime publish or mutation token ${forbidden}.`);
}

assert(
  auditSource.includes("import './check-import-geo-alias-duplicate-guard.mjs';"),
  'publish readiness audit must chain the geo alias duplicate guard validator.',
);

console.log('import geo alias duplicate guard check passed.');
