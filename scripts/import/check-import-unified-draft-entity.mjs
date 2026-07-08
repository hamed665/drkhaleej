import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contractPath = 'src/server/admin/import-unified-draft-entity.ts';
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
  'ImportDraftEntitySource',
  'manual',
  'csv',
  'excel',
  'api',
  'ai_assisted',
  'ImportUnifiedDraftEntity',
  'ImportUnifiedDraftEntityInput',
  'ImportUnifiedDraftEntityBlocker',
  'buildUnifiedDraftEntity',
  'getUnifiedDraftEntityBlockers',
  'isUnifiedDraftEntityReadyForValidation',
  'resolveImportEntityDomain',
  'ImportCanonicalGeo',
  'canonicalGeo',
  'sourceEvidence',
  'duplicateCandidateIds',
  'requiresManualReview',
]) {
  assert(source.includes(requiredToken), `unified draft entity contract must include ${requiredToken}.`);
}

for (const blocker of [
  'draft_id_missing',
  'source_missing',
  'source_unsupported',
  'entity_type_missing',
  'entity_type_unsupported',
  'entity_domain_unresolved',
  'name_missing',
  'source_evidence_missing',
  'manual_review_required',
  'duplicate_candidates_present',
  'canonical_geo_missing',
]) {
  assert(source.includes(blocker), `unified draft entity blockers must include ${blocker}.`);
}

for (const forbidden of [
  'public_indexable_entities',
  'sitemap',
  'publishEntity',
  'createSupabaseServiceRoleClient',
  'insert(',
  'update(',
  'delete(',
]) {
  assert(!source.includes(forbidden), `unified draft entity contract must not include runtime publish or mutation token ${forbidden}.`);
}

assert(
  auditSource.includes("import './check-import-unified-draft-entity.mjs';"),
  'publish readiness audit must chain the unified draft entity validator.',
);

console.log('import unified draft entity check passed.');
