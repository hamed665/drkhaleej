#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = {
  migration: 'supabase/migrations/0094_import_entity_resolution_gate.sql',
  runtime: 'src/server/admin/import-entity-resolution-gate.ts',
  tests: 'src/server/admin/import-entity-resolution-gate.test.ts',
  docs: 'docs/import/ENTITY_RESOLUTION_GATE.md',
  proof: 'scripts/import/run-entity-resolution-gate-proof.mjs',
};

function read(file) { return readFileSync(path.join(root, file), 'utf8'); }
function requireTokens(file, source, tokens) {
  for (const token of tokens) if (!source.includes(token)) throw new Error(`${file}: missing required token ${token}`);
}
function forbid(file, source, pattern, message) {
  if (pattern.test(source)) throw new Error(`${file}: ${message}`);
}

const migration = read(files.migration);
const runtime = read(files.runtime);
const tests = read(files.tests);
const docs = read(files.docs);
const proof = read(files.proof);

requireTokens(files.migration, migration, [
  'ENTITY-RESOLUTION-GATE',
  'create table if not exists public.import_entity_review_decisions',
  'import_entity_review_decisions_candidate_unique',
  'reviewer_session_hash text not null',
  'create or replace function public.import_record_entity_review_decision',
  'create or replace function public.import_entity_review_decision_readback',
  'create or replace function public.import_entity_review_decision_guard',
  'entity_review_decision_immutable',
  'pg_advisory_xact_lock',
  'for update',
  'reviewer_role_not_enabled',
  'review_candidate_not_reviewable',
  'review_draft_binding_mismatch',
  'review_evidence_unbound',
  'review_field_expected_value_mismatch',
  'exactReviewApprovalRecorded',
  'duplicateResolutionRecorded',
  'candidateMutationAllowed',
  'duplicateMergeAllowed',
  'geoVerificationAllowed',
  'directEntityWriteAllowed',
  'publishAllowed',
  'alter table public.import_entity_review_decisions enable row level security',
  'grant execute on function public.import_record_entity_review_decision(uuid,uuid,text,text,jsonb) to service_role',
]);
forbid(files.migration, migration, /\bcreate\s+policy\b/i, 'must not create a public policy');
forbid(files.migration, migration, /reviewer_session_id\s+text|session_id\s+text/i, 'must never persist a raw reviewer session id');
forbid(files.migration, migration, /\b(update|delete)\s+public\.(import_entity_candidates|import_duplicate_candidates|import_mapping_results|centers|doctors|import_publish_queue)\b/i, 'must not mutate prior or downstream authority rows');
forbid(files.migration, migration, /\binsert\s+into\s+public\.(centers|doctors|import_publish_queue)\b/i, 'must not create canonical or publish rows');
forbid(files.migration, migration, /grant\s+execute[\s\S]*to\s+(anon|authenticated)/i, 'must not expose the RPC to public roles');

requireTokens(files.runtime, runtime, [
  'drkhaleej.import.entityResolutionGate.v1',
  'IMPORT_ENTITY_REVIEW_DECISION_SCHEMA_VERSION = "1.2.2"',
  'import_record_entity_review_decision',
  'reviewer_role_not_enabled',
  'reviewer_actor_mismatch',
  'decisionRecordingAllowed: true',
  'candidateMutationAllowed: false',
  'duplicateMergeAllowed: false',
  'geoVerificationAllowed: false',
  'directEntityWriteAllowed: false',
  'publishAllowed: false',
]);
forbid(files.runtime, runtime, /createClient\(|\.from\(|\.insert\(|\.update\(|\.delete\(|\.upsert\(|fetch\(/, 'planner must not own database, network or mutation authority');

requireTokens(files.tests, tests, [
  'describe("entity resolution decision gate"',
  'records exact-review approval without mutation, geo, canonical or publish authority',
  'accepts an edit as an immutable decision but never edits the Candidate',
  'fails closed for unimplemented reviewer roles and actor mismatch',
]);
requireTokens(files.docs, docs, [
  '`platform_admin`',
  '`approve_for_exact_review`',
  '`confirmed_duplicate`',
  '`not_duplicate`',
  '`drkhaleej.import.entityFieldValueJsonb.v1`',
  'Candidate remains immutable',
  'Production remains disconnected',
]);
requireTokens(files.proof, proof, [
  'ENTITY_RESOLUTION_PREVIEW_DATABASE_URL',
  'ENTITY_RESOLUTION_PRODUCTION_PROJECT_REF',
  "where version::text = '0094'",
  'review_decision_idempotency_mismatch',
  'entity_review_decision_immutable',
  "await client.query('rollback')",
  'Rollback cleanup left ENTITY-RESOLUTION-GATE fixture rows.',
]);
forbid(files.proof, proof, /PRODUCTION_DATABASE_URL|SUPABASE_SERVICE_ROLE_KEY/, 'proof must not accept Production credentials or API service keys');

console.log('entity resolution decision gate static contract passed.');
