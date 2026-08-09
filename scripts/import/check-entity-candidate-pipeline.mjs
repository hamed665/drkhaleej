#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = {
  migration: 'supabase/migrations/0093_import_entity_candidate_pipeline.sql',
  runtime: 'src/server/admin/import-entity-candidate-pipeline.ts',
  tests: 'src/server/admin/import-entity-candidate-pipeline.test.ts',
  docs: 'docs/import/ENTITY_CANDIDATE_PIPELINE.md',
  proof: 'scripts/import/run-entity-candidate-pipeline-proof.mjs',
};

function read(file) { return readFileSync(path.join(root, file), 'utf8'); }
function requireTokens(file, source, tokens) {
  for (const token of tokens) {
    if (!source.includes(token)) throw new Error(`${file}: missing required token ${token}`);
  }
}
function forbidPattern(file, source, pattern, message) {
  if (pattern.test(source)) throw new Error(`${file}: ${message}`);
}

const migration = read(files.migration);
const runtime = read(files.runtime);
const tests = read(files.tests);
const docs = read(files.docs);
const proof = read(files.proof);

requireTokens(files.migration, migration, [
  'ENTITY-CANDIDATE-PIPELINE',
  'alter table public.import_entity_candidates',
  "candidate_status in ('collecting','needs_review')",
  'import_entity_candidates_pipeline_idempotency_unique',
  'source_observation_id uuid',
  'entity_candidate_id uuid',
  'create or replace function public.import_persist_entity_candidate',
  'create or replace function public.import_entity_candidate_pipeline_readback',
  'create or replace function public.import_entity_candidate_pipeline_guard',
  'entity_candidate_pipeline_row_immutable',
  'pg_advisory_xact_lock',
  'for update',
  'security definer',
  'set search_path = pg_catalog, public',
  'candidate_idempotency_mismatch',
  'candidate_persistence_readback_mismatch',
  'duplicateResolutionAllowed',
  'geoVerificationAllowed',
  'reviewDecisionAllowed',
  'directEntityWriteAllowed',
  'publishAllowed',
  'grant execute on function public.import_persist_entity_candidate(uuid,uuid,uuid,uuid,text,text,jsonb) to service_role',
]);
forbidPattern(files.migration, migration, /\bcreate\s+policy\b/i, 'must not create public policies');
forbidPattern(files.migration, migration, /\b(insert|update|delete)\s+(into\s+)?public\.(centers|doctors|import_publish_queue)\b/i, 'must not mutate canonical or publish authorities');
forbidPattern(files.migration, migration, /grant\s+execute[\s\S]*to\s+(anon|authenticated)/i, 'must not expose RPCs to public roles');
forbidPattern(files.migration, migration, /<>\s+case\s+when/i, 'must parenthesize CASE operands in PL/pgSQL IF conditions');

requireTokens(files.runtime, runtime, [
  'drkhaleej.import.entityCandidatePipeline.v1',
  'IMPORT_INTAKE_SCHEMA_VERSION',
  'SOURCE_EVIDENCE_LEDGER_SCHEMA_VERSION',
  'IMPORT_DUPLICATE_GEO_SCHEMA_VERSION',
  'IMPORT_DUPLICATE_GEO_POLICY_VERSION',
  'hashImportContractPayload("entity-draft"',
  'candidatePersistenceAllowed: true',
  'duplicateResolutionAllowed: false',
  'duplicateMergeAllowed: false',
  'geoVerificationAllowed: false',
  'reviewDecisionAllowed: false',
  'directEntityWriteAllowed: false',
  'publishAllowed: false',
  'candidate_actor_not_enabled',
  'candidate_evidence_unbound',
  'candidate_status_invalid',
]);
forbidPattern(files.runtime, runtime, /createClient\(|\.from\(|\.insert\(|\.update\(|\.delete\(|\.upsert\(|fetch\(/, 'runtime planner must not own database, network or canonical mutation authority');

requireTokens(files.tests, tests, [
  'describe("entity candidate persistence pipeline"',
  'binds P16, P17, P18 and the canonical Entity Draft hash into one RPC plan',
  'accepts collecting only when no candidate output requires review',
  'keeps Agent/Worker authorship closed in this phase',
  'rejects reviewer, approval, merge, entity-write and publish fields through closed schemas',
]);
requireTokens(files.docs, docs, [
  '`import_entity_candidates`',
  '`import_duplicate_candidates`',
  '`import_mapping_results`',
  '`collecting`',
  '`needs_review`',
  '`ENTITY-RESOLUTION-GATE`',
  'Production remains disconnected',
]);
requireTokens(files.proof, proof, [
  'ENTITY_CANDIDATE_PREVIEW_DATABASE_URL',
  'ENTITY_CANDIDATE_PRODUCTION_PROJECT_REF',
  "where version::text = '0093'",
  'candidate_idempotency_mismatch',
  'entity_candidate_pipeline_row_immutable',
  "await client.query('rollback')",
  'Rollback cleanup left ENTITY-CANDIDATE-PIPELINE fixture rows.',
]);
forbidPattern(files.proof, proof, /PRODUCTION_DATABASE_URL|SUPABASE_SERVICE_ROLE_KEY/, 'proof must not accept Production database credentials or API service keys');

console.log('entity candidate persistence pipeline static contract passed.');
