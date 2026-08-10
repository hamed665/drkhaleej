#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;
const resolutionSchemaVersion = 'drkhaleej.import.entityResolutionGate.v1';
const candidateSchemaVersion = 'drkhaleej.import.entityCandidatePipeline.v1';
const evidencePath = process.env.ENTITY_RESOLUTION_EVIDENCE_PATH ??
  'artifacts/entity-resolution-gate/proof.json';

function assert(condition, message) { if (!condition) throw new Error(message); }
function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}
function digest(value) { return createHash('sha256').update(String(value)).digest('hex'); }
function deterministicUuid(seed) {
  const hex = digest(seed).slice(0, 32).split('');
  hex[12] = '4';
  hex[16] = ((Number.parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)]
    .map((part) => part.join('')).join('-');
}
function verifyPreviewIdentity(databaseUrl, previewRef, productionRef) {
  assert(previewRef !== productionRef, 'Preview and Production refs must differ.');
  const parsed = new URL(databaseUrl);
  assert(parsed.protocol === 'postgresql:', 'ENTITY-RESOLUTION-GATE proof requires postgresql.');
  assert(parsed.port === '5432', 'ENTITY-RESOLUTION-GATE proof requires Session pooler port 5432.');
  assert(parsed.hostname.endsWith('.pooler.supabase.com'), 'ENTITY-RESOLUTION-GATE proof requires the isolated Supabase Session pooler.');
  assert(decodeURIComponent(parsed.username) === `postgres.${previewRef}`, 'Database identity does not match Preview.');
  assert(!databaseUrl.includes(productionRef), 'Production identity appeared in Preview URL.');
}
function connectionConfig(databaseUrl) {
  return {
    connectionString: databaseUrl,
    application_name: 'drkhaleej-entity-resolution-gate-proof',
    ssl: { rejectUnauthorized: false },
    keepAlive: true,
    statement_timeout: 45_000,
    query_timeout: 50_000,
    connectionTimeoutMillis: 15_000,
  };
}
function canonicalize(value) {
  if (typeof value === 'string') return value.normalize('NFC');
  if (value === null || typeof value === 'boolean' || typeof value === 'number') return Object.is(value, -0) ? 0 : value;
  if (Array.isArray(value)) return value.map(canonicalize);
  return Object.fromEntries(Object.entries(value)
    .map(([key, item]) => [key.normalize('NFC'), item])
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([key, item]) => [key, canonicalize(item)]));
}
function contractHash(contractId, schemaVersion, payload) {
  return digest(JSON.stringify(canonicalize({
    canonicalizationVersion: 'drkhaleej.import.canonicalJson.v1',
    contractId,
    payload,
    schemaVersion,
  })));
}

async function verifySchema(client) {
  const ledger = await client.query(
    `select version::text as version from supabase_migrations.schema_migrations where version::text = '0094'`,
  );
  assert(ledger.rowCount === 1, 'Preview migration ledger must contain exactly one 0094.');
  const functions = await client.query(
    `select p.oid::regprocedure::text as signature, p.prosecdef,
       exists (select 1 from unnest(coalesce(p.proconfig, '{}'::text[])) setting where replace(setting, ' ', '') = 'search_path=pg_catalog,public') as search_path_pinned,
       has_function_privilege('service_role', p.oid, 'EXECUTE') as service_execute,
       has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute
     from pg_catalog.pg_proc p
     where p.oid in (
       to_regprocedure('public.import_record_entity_review_decision(uuid,uuid,text,text,jsonb)'),
       to_regprocedure('public.import_entity_review_decision_readback(uuid)')
     ) order by signature`,
  );
  assert(functions.rowCount === 2 && functions.rows.every((row) => row.prosecdef && row.search_path_pinned), 'Resolution RPC/helper security boundary drifted.');
  const rpc = functions.rows.find((row) => row.signature.startsWith('import_record_entity_review_decision'));
  const helper = functions.rows.find((row) => row.signature.startsWith('import_entity_review_decision_readback'));
  assert(rpc?.service_execute && !rpc?.anon_execute && !rpc?.authenticated_execute, 'Resolution RPC privilege boundary drifted.');
  assert(!helper?.service_execute && !helper?.anon_execute && !helper?.authenticated_execute, 'Private resolution readback became directly executable.');

  const table = await client.query(
    `select c.relrowsecurity,
       has_table_privilege('service_role', c.oid, 'SELECT') as service_select,
       has_table_privilege('authenticated', c.oid, 'SELECT') as authenticated_select
     from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relname = 'import_entity_review_decisions'`,
  );
  assert(table.rowCount === 1 && table.rows[0].relrowsecurity &&
    !table.rows[0].service_select && !table.rows[0].authenticated_select,
  'Private resolution table RLS/grants drifted.');
  const trigger = await client.query(
    `select count(*)::int as count from pg_catalog.pg_trigger
     where tgrelid = 'public.import_entity_review_decisions'::regclass
       and tgname = 'trg_import_entity_review_decisions_guard' and not tgisinternal`,
  );
  assert(trigger.rows[0]?.count === 1, 'Resolution immutability trigger drifted.');
  const rawSessionColumn = await client.query(
    `select count(*)::int as count from information_schema.columns
     where table_schema = 'public' and table_name = 'import_entity_review_decisions'
       and column_name in ('session_id','reviewer_session_id')`,
  );
  assert(rawSessionColumn.rows[0]?.count === 0, 'A raw reviewer session column exists.');
}

async function registerEvidence(client, fixture) {
  const result = await client.query(
    `select public.import_register_source_evidence(
       $1::uuid,$2::text,$3::text,$4::text,$5::text,$6::text,$7::text,$8::text,
       $9::text,$10::text,$11::timestamptz,$12::text,$13::text,$14::timestamptz,
       $15::text,$16::jsonb
     ) as result`,
    [
      fixture.actorId, fixture.evidenceKey, digest(`${fixture.seed}:evidence-request`),
      'drkhaleej.import.sourceEvidenceLedger.v1', 'api', 'entity-resolution-proof', 'accepted',
      'private-observations/entity-resolution/proof.json', digest('resolution-raw-content'),
      digest('resolution-selected-content'), '2026-08-03T08:00:00.000Z', 'entity-parser-v1',
      'standard', '2026-09-02T08:00:00.000Z', null,
      JSON.stringify([{ referenceId: 'evidence-resolution-001', fieldPaths: ['contact.phone'], excerpt: 'Public contact number', excerptHash: digest('Public contact number') }]),
    ],
  );
  assert(result.rows[0]?.result?.status === 'created', 'P17 fixture registration failed.');
  return result.rows[0].result.observationId;
}

function buildCandidatePipeline(fixture) {
  const candidatePayload = {
    schema_version: '1.2.2',
    policy_version: 'entity-policy-2026-01',
    draft_id: fixture.draftId,
    entity_family: 'pharmacy',
    status: 'needs_review',
    locales: {
      en: { official_name: 'Preview Resolution Pharmacy' },
      ar: { official_name: 'صيدلية بوابة المراجعة' },
    },
    fields: [{
      path: 'contact.phone', value: '+96800000000', normalized_value: '+96800000000',
      observation_id: fixture.observationId, source_tier: 'T1', confidence: 0.99,
      extraction_method: 'structured_data', evidence_excerpt: 'Public contact number', conflicts: [],
      observed_at: '2026-08-03T08:00:00.000Z', review_status: 'pending',
    }],
    duplicate_candidates: [{
      entity_id: fixture.matchedEntityId, score: 0.82,
      reasons: ['normalized name and city match'], decision: 'candidate',
    }],
    evidence_coverage: 1,
    created_by: { actor_type: 'admin', actor_id: fixture.actorId },
    version: 1,
    created_at: '2026-08-03T08:00:00.000Z',
    updated_at: '2026-08-03T08:00:00.000Z',
  };
  return {
    pipelineSchemaVersion: candidateSchemaVersion,
    intakeSchemaVersion: 'drkhaleej.import.intake.v1',
    sourceEvidenceSchemaVersion: 'drkhaleej.import.sourceEvidenceLedger.v1',
    duplicateGeoSchemaVersion: 'drkhaleej.import.duplicateGeo.v1',
    duplicateGeoPolicyVersion: 'drkhaleej.import.duplicateGeoPolicy.v1',
    canonicalizationVersion: 'drkhaleej.import.canonicalJson.v1',
    contractSchemaVersion: '1.2.2',
    contractPolicyVersion: 'entity-policy-2026-01',
    draftHash: contractHash('entity-draft', '1.2.2', candidatePayload),
    sourceEvidenceReferenceIds: ['evidence-resolution-001'],
    candidatePayload,
    duplicateCandidates: [{
      candidateId: 'duplicate-candidate-001', matchedEntityType: 'pharmacy',
      matchedEntityId: fixture.matchedEntityId, score: 0.82,
      reasons: ['normalized name and city match'], status: 'candidate',
      evidenceReferenceIds: ['evidence-resolution-001'],
    }],
    geoCandidate: {
      countryId: fixture.countryId, governorateId: fixture.governorateId,
      cityId: fixture.cityId, areaId: null, latitude: 23.588, longitude: 58.3829,
      confidence: 0.9, status: 'candidate', evidenceReferenceIds: ['evidence-resolution-001'],
    },
  };
}

async function persistCandidate(client, fixture, pipeline) {
  const result = await client.query(
    `select public.import_persist_entity_candidate(
       $1::uuid,$2::uuid,$3::uuid,$4::uuid,$5::text,$6::text,$7::jsonb
     ) as result`,
    [fixture.actorId, fixture.batchId, fixture.rowId, fixture.observationId,
      fixture.candidateKey, fixture.candidateRequestHash, JSON.stringify(pipeline)],
  );
  return result.rows[0]?.result;
}

async function recordDecision(client, fixture, decision, requestHash = fixture.decisionRequestHash) {
  const result = await client.query(
    `select public.import_record_entity_review_decision(
       $1::uuid,$2::uuid,$3::text,$4::text,$5::jsonb
     ) as result`,
    [fixture.actorId, fixture.draftId, fixture.decisionKey, requestHash, JSON.stringify(decision)],
  );
  return result.rows[0]?.result;
}

async function runProof(client, fixture) {
  await client.query('begin');
  try {
    await client.query(
      `insert into public.profiles (
         id, full_name, display_name, locale, country, is_platform_admin,
         is_provider_user, is_patient_user, metadata
       ) values ($1, 'Resolution Proof Actor', 'Resolution Proof', 'en', 'om', true, false, false, '{"isolatedPreviewProof":true}'::jsonb)`,
      [fixture.actorId],
    );
    await client.query(
      `insert into public.import_batches (
         id, uploaded_by_profile_id, batch_name, entity_type, source_type, status, total_rows, metadata
       ) values ($1,$2,'Entity Resolution Proof','pharmacy','api','reviewing',1,'{"isolatedPreviewProof":true}'::jsonb)`,
      [fixture.batchId, fixture.actorId],
    );
    await client.query(
      `insert into public.import_raw_rows (
         id, batch_id, row_number, entity_type, raw_payload, normalized_payload, row_status, validation_score, metadata
       ) values ($1,$2,1,'pharmacy','{}'::jsonb,'{}'::jsonb,'needs_review',90,'{"isolatedPreviewProof":true}'::jsonb)`,
      [fixture.rowId, fixture.batchId],
    );
    fixture.observationId = await registerEvidence(client, fixture);
    const pipeline = buildCandidatePipeline(fixture);

    await client.query('set local role service_role');
    const persisted = await persistCandidate(client, fixture, pipeline);
    assert(persisted?.status === 'created' && persisted?.candidateStatus === 'needs_review', 'Candidate fixture persistence failed.');
    await client.query('reset role');
    const evidence = await client.query(
      `select id from public.import_source_evidence where observation_id = $1 and reference_id = 'evidence-resolution-001'`,
      [fixture.observationId],
    );
    assert(evidence.rowCount === 1, 'Bound Evidence UUID was not found.');
    fixture.evidenceId = evidence.rows[0].id;

    const decision = {
      schema_version: '1.2.2',
      policy_version: pipeline.contractPolicyVersion,
      decision_id: fixture.decisionId,
      draft_id: fixture.draftId,
      draft_version: 1,
      draft_hash: pipeline.draftHash,
      decision: 'approve_for_exact_review',
      reviewer: {
        reviewer_id: fixture.actorId,
        role: 'platform_admin',
        session_id: fixture.rawSessionId,
      },
      reason: 'Bound Preview evidence supports exact Human Review approval.',
      evidence_ids: [fixture.evidenceId],
      decided_at: new Date().toISOString(),
    };

    await client.query('set local role service_role');
    const invalidRole = await recordDecision(client, fixture, {
      ...decision,
      decision_id: deterministicUuid(`${fixture.seed}:invalid-role-decision`),
      reviewer: { ...decision.reviewer, role: 'entity_reviewer' },
    }, digest(`${fixture.seed}:invalid-role-request`));
    assert(invalidRole?.status === 'rejected' && invalidRole?.reason === 'reviewer_role_not_enabled', 'Unimplemented reviewer role did not fail closed.');

    const staleEdit = await recordDecision(client, fixture, {
      ...decision,
      decision_id: deterministicUuid(`${fixture.seed}:stale-edit-decision`),
      decision: 'edit',
      field_edits: [{
        path: 'contact.phone',
        expected_value_hash: '0'.repeat(64),
        replacement_value: '+96811111111',
        reason: 'Intentional stale-value proof.',
      }],
    }, digest(`${fixture.seed}:stale-edit-request`));
    assert(staleEdit?.status === 'rejected' && staleEdit?.reason === 'review_field_expected_value_mismatch', 'Stale field edit did not fail closed.');

    const created = await recordDecision(client, fixture, decision);
    assert(created?.status === 'created' && created?.decisionId === fixture.decisionId &&
      created?.candidateId === fixture.draftId && created?.decision === 'approve_for_exact_review' &&
      created?.evidenceCount === 1 && /^[a-f0-9]{64}$/.test(created?.evidenceSetHash) &&
      /^[a-f0-9]{64}$/.test(created?.receiptHash) && created?.decisionRecordingAllowed === true &&
      created?.exactReviewApprovalRecorded === true && created?.duplicateResolutionRecorded === false &&
      created?.candidateMutationAllowed === false && created?.duplicateMergeAllowed === false &&
      created?.geoVerificationAllowed === false && created?.directEntityWriteAllowed === false &&
      created?.publishAllowed === false,
    'Atomic Human Review decision/readback drifted.');
    const replayed = await recordDecision(client, fixture, decision);
    assert(replayed?.status === 'replayed' && replayed?.receiptHash === created.receiptHash, 'Exact decision replay drifted.');
    const mismatch = await recordDecision(client, fixture, decision, digest(`${fixture.seed}:decision-mismatch`));
    assert(mismatch?.status === 'conflict' && mismatch?.reason === 'review_decision_idempotency_mismatch', 'Mismatched decision replay did not fail closed.');
    await client.query('reset role');

    const stored = await client.query(
      `select reviewer_session_hash, decision_payload_hash from public.import_entity_review_decisions where id = $1`,
      [fixture.decisionId],
    );
    assert(stored.rowCount === 1 && stored.rows[0].reviewer_session_hash === digest(fixture.rawSessionId) &&
      stored.rows[0].reviewer_session_hash !== fixture.rawSessionId && /^[a-f0-9]{64}$/.test(stored.rows[0].decision_payload_hash),
    'Reviewer session minimization drifted.');

    await client.query('savepoint immutable_guard');
    let immutableError = '';
    try {
      await client.query(`update public.import_entity_review_decisions set reason = 'mutated' where id = $1`, [fixture.decisionId]);
    } catch (error) {
      immutableError = error instanceof Error ? error.message : String(error);
      await client.query('rollback to savepoint immutable_guard');
    }
    assert(immutableError.includes('entity_review_decision_immutable'), 'Decision mutation was not blocked.');

    const state = await client.query(
      `select c.candidate_status,
         (select bool_and(d.resolution_status = 'pending' and d.resolved_at is null and d.resolved_by_profile_id is null)
          from public.import_duplicate_candidates d where d.entity_candidate_id = c.id) as duplicate_unresolved,
         (select bool_and((m.metadata->>'geoVerified')::boolean = false)
          from public.import_mapping_results m where m.entity_candidate_id = c.id and m.mapping_type = 'geo') as geo_unverified,
         (select count(*)::int from public.import_publish_queue q where q.raw_row_id = c.raw_row_id) as publish_count
       from public.import_entity_candidates c where c.id = $1`,
      [fixture.draftId],
    );
    const row = state.rows[0];
    assert(row?.candidate_status === 'needs_review' && row?.duplicate_unresolved === true &&
      row?.geo_unverified === true && row?.publish_count === 0,
    'Decision escaped its additive-only authority boundary.');

    return {
      additiveDecisionRecorded: true,
      exactReplay: true,
      mismatchedReplayRejected: true,
      unimplementedRoleRejected: true,
      staleFieldEditRejected: true,
      rawSessionPersisted: false,
      immutableDecision: true,
      exactReviewApprovalRecorded: true,
      candidateMutated: false,
      duplicateMerged: false,
      geoVerified: false,
      canonicalWriteOpened: false,
      publishOpened: false,
    };
  } finally {
    await client.query('reset role').catch(() => {});
    await client.query('rollback');
  }
}

async function main() {
  const databaseUrl = required('ENTITY_RESOLUTION_PREVIEW_DATABASE_URL');
  const previewRef = required('ENTITY_RESOLUTION_PREVIEW_PROJECT_REF');
  const productionRef = required('ENTITY_RESOLUTION_PRODUCTION_PROJECT_REF');
  verifyPreviewIdentity(databaseUrl, previewRef, productionRef);
  const runId = process.env.GITHUB_RUN_ID ?? `local-${Date.now()}`;
  const seed = `entity-resolution-gate:${runId}`;
  const fixture = {
    seed,
    actorId: deterministicUuid(`${seed}:actor`),
    batchId: deterministicUuid(`${seed}:batch`),
    rowId: deterministicUuid(`${seed}:row`),
    draftId: deterministicUuid(`${seed}:draft`),
    decisionId: deterministicUuid(`${seed}:decision`),
    matchedEntityId: deterministicUuid(`${seed}:matched-entity`),
    countryId: deterministicUuid(`${seed}:country`),
    governorateId: deterministicUuid(`${seed}:governorate`),
    cityId: deterministicUuid(`${seed}:city`),
    evidenceKey: `evidence-${digest(`${seed}:evidence`).slice(0, 40)}`,
    candidateKey: `candidate-${digest(`${seed}:candidate`).slice(0, 40)}`,
    decisionKey: `resolution-${digest(`${seed}:decision`).slice(0, 40)}`,
    candidateRequestHash: digest(`${seed}:candidate-request`),
    decisionRequestHash: digest(`${seed}:decision-request`),
    rawSessionId: `preview-session-${digest(`${seed}:session`).slice(0, 40)}`,
    observationId: null,
    evidenceId: null,
  };
  const client = new Client(connectionConfig(databaseUrl));
  try {
    await client.connect();
    await verifySchema(client);
    const proof = await runProof(client, fixture);
    const remaining = await client.query(
      `select count(*)::int as count from public.import_entity_review_decisions where id = $1`,
      [fixture.decisionId],
    );
    assert(remaining.rows[0]?.count === 0, 'Rollback cleanup left ENTITY-RESOLUTION-GATE fixture rows.');
    await mkdir(path.dirname(evidencePath), { recursive: true });
    await writeFile(evidencePath, `${JSON.stringify({
      schemaVersion: resolutionSchemaVersion,
      headSha: process.env.ENTITY_RESOLUTION_SOURCE_COMMIT ?? null,
      previewProjectRefHash: digest(previewRef),
      productionDisconnected: true,
      migration: '0094',
      schemaVerified: true,
      rollbackCleanupVerified: true,
      proof,
    }, null, 2)}\n`);
    console.log('ENTITY-RESOLUTION-GATE hosted proof passed.');
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
