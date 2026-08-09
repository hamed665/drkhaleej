#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;
const pipelineSchemaVersion = 'drkhaleej.import.entityCandidatePipeline.v1';
const evidencePath = process.env.ENTITY_CANDIDATE_EVIDENCE_PATH ??
  'artifacts/entity-candidate-pipeline/proof.json';

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
  assert(parsed.protocol === 'postgresql:', 'ENTITY-CANDIDATE-PIPELINE proof requires postgresql.');
  assert(parsed.port === '5432', 'ENTITY-CANDIDATE-PIPELINE proof requires Session pooler port 5432.');
  assert(parsed.hostname.endsWith('.pooler.supabase.com'), 'ENTITY-CANDIDATE-PIPELINE proof requires the isolated Supabase Session pooler.');
  assert(decodeURIComponent(parsed.username) === `postgres.${previewRef}`, 'Database identity does not match Preview.');
  assert(!databaseUrl.includes(productionRef), 'Production identity appeared in Preview URL.');
}
function connectionConfig(databaseUrl) {
  return {
    connectionString: databaseUrl,
    application_name: 'drkhaleej-entity-candidate-pipeline-proof',
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
    `select version::text as version from supabase_migrations.schema_migrations where version::text = '0093'`,
  );
  assert(ledger.rowCount === 1, 'Preview migration ledger must contain exactly one 0093.');
  const functions = await client.query(
    `select p.oid::regprocedure::text as signature, p.prosecdef,
       exists (select 1 from unnest(coalesce(p.proconfig, '{}'::text[])) setting where replace(setting, ' ', '') = 'search_path=pg_catalog,public') as search_path_pinned,
       has_function_privilege('service_role', p.oid, 'EXECUTE') as service_execute,
       has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute
     from pg_catalog.pg_proc p
     where p.oid in (
       to_regprocedure('public.import_persist_entity_candidate(uuid,uuid,uuid,uuid,text,text,jsonb)'),
       to_regprocedure('public.import_entity_candidate_pipeline_readback(uuid)')
     ) order by signature`,
  );
  assert(functions.rowCount === 2 && functions.rows.every((row) => row.prosecdef && row.search_path_pinned), 'Pipeline RPC/helper security-definer boundary drifted.');
  const rpc = functions.rows.find((row) => row.signature.startsWith('import_persist_entity_candidate'));
  const helper = functions.rows.find((row) => row.signature.startsWith('import_entity_candidate_pipeline_readback'));
  assert(rpc?.service_execute && !rpc?.anon_execute && !rpc?.authenticated_execute, 'Pipeline RPC privilege boundary drifted.');
  assert(!helper?.service_execute && !helper?.anon_execute && !helper?.authenticated_execute, 'Private readback helper became directly executable.');

  const triggers = await client.query(
    `select c.relname, t.tgname
     from pg_catalog.pg_trigger t
     join pg_catalog.pg_class c on c.oid = t.tgrelid
     join pg_catalog.pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and not t.tgisinternal
       and t.tgname in (
         'trg_import_entity_candidates_pipeline_guard',
         'trg_import_duplicate_candidates_pipeline_guard',
         'trg_import_mapping_results_pipeline_guard'
       ) order by c.relname`,
  );
  assert(triggers.rowCount === 3, 'Pipeline immutability trigger inventory drifted.');
}

async function registerEvidence(client, fixture) {
  const observedAt = '2026-08-03T08:00:00.000Z';
  const result = await client.query(
    `select public.import_register_source_evidence(
       $1::uuid,$2::text,$3::text,$4::text,$5::text,$6::text,$7::text,$8::text,
       $9::text,$10::text,$11::timestamptz,$12::text,$13::text,$14::timestamptz,
       $15::text,$16::jsonb
     ) as result`,
    [
      fixture.actorId, fixture.evidenceKey, digest(`${fixture.seed}:evidence-request`),
      'drkhaleej.import.sourceEvidenceLedger.v1', 'api', 'entity-candidate-proof', 'accepted',
      'private-observations/entity-candidate/proof.json', digest('candidate-raw-content'),
      digest('candidate-selected-content'), observedAt, 'entity-parser-v1', 'standard',
      '2026-09-02T08:00:00.000Z', null,
      JSON.stringify([{ referenceId: 'evidence-entity-001', fieldPaths: ['contact.phone'], excerpt: 'Public contact number', excerptHash: digest('Public contact number') }]),
    ],
  );
  assert(result.rows[0]?.result?.status === 'created', 'P17 fixture registration failed.');
  return result.rows[0].result.observationId;
}

function buildPipeline(fixture) {
  const candidatePayload = {
    schema_version: '1.2.2',
    policy_version: 'entity-policy-2026-01',
    draft_id: fixture.draftId,
    entity_family: 'pharmacy',
    status: 'needs_review',
    locales: {
      en: { official_name: 'Preview Pipeline Pharmacy' },
      ar: { official_name: 'صيدلية بايبلاين التجريبية' },
    },
    fields: [{
      path: 'contact.phone', value: '+96800000000', normalized_value: '+96800000000',
      observation_id: fixture.observationId, source_tier: 'T1', confidence: 0.99,
      extraction_method: 'structured_data', evidence_excerpt: 'Public contact number', conflicts: [],
      observed_at: '2026-08-03T08:00:00.000Z', review_status: 'pending',
    }],
    duplicate_candidates: [{
      entity_id: fixture.matchedEntityId, score: 0.82,
      reasons: ['normalized name and city match'], decision: 'requires_review',
    }],
    evidence_coverage: 1,
    created_by: { actor_type: 'admin', actor_id: fixture.actorId },
    version: 1,
    created_at: '2026-08-03T08:00:00.000Z',
    updated_at: '2026-08-03T08:00:00.000Z',
  };
  return {
    pipelineSchemaVersion,
    intakeSchemaVersion: 'drkhaleej.import.intake.v1',
    sourceEvidenceSchemaVersion: 'drkhaleej.import.sourceEvidenceLedger.v1',
    duplicateGeoSchemaVersion: 'drkhaleej.import.duplicateGeo.v1',
    duplicateGeoPolicyVersion: 'drkhaleej.import.duplicateGeoPolicy.v1',
    canonicalizationVersion: 'drkhaleej.import.canonicalJson.v1',
    contractSchemaVersion: '1.2.2',
    contractPolicyVersion: 'entity-policy-2026-01',
    draftHash: contractHash('entity-draft', '1.2.2', candidatePayload),
    sourceEvidenceReferenceIds: ['evidence-entity-001'],
    candidatePayload,
    duplicateCandidates: [{
      candidateId: 'duplicate-candidate-001', matchedEntityType: 'pharmacy',
      matchedEntityId: fixture.matchedEntityId, score: 0.82,
      reasons: ['normalized name and city match'], status: 'requires_review',
      evidenceReferenceIds: ['evidence-entity-001'],
    }],
    geoCandidate: {
      countryId: fixture.countryId, governorateId: fixture.governorateId,
      cityId: fixture.cityId, areaId: null, latitude: 23.588, longitude: 58.3829,
      confidence: 0.9, status: 'candidate', evidenceReferenceIds: ['evidence-entity-001'],
    },
  };
}

async function persist(client, fixture, pipeline, requestHash = fixture.requestHash) {
  const result = await client.query(
    `select public.import_persist_entity_candidate(
       $1::uuid,$2::uuid,$3::uuid,$4::uuid,$5::text,$6::text,$7::jsonb
     ) as result`,
    [fixture.actorId, fixture.batchId, fixture.rowId, fixture.observationId,
      fixture.idempotencyKey, requestHash, JSON.stringify(pipeline)],
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
       ) values ($1, 'Candidate Proof Actor', 'Candidate Proof', 'en', 'om', true, false, false, '{"isolatedPreviewProof":true}'::jsonb)`,
      [fixture.actorId],
    );
    await client.query(
      `insert into public.import_batches (
         id, uploaded_by_profile_id, batch_name, entity_type, source_type, status, total_rows, metadata
       ) values ($1,$2,'Entity Candidate Proof','pharmacy','api','reviewing',1,'{"isolatedPreviewProof":true}'::jsonb)`,
      [fixture.batchId, fixture.actorId],
    );
    await client.query(
      `insert into public.import_raw_rows (
         id, batch_id, row_number, entity_type, raw_payload, normalized_payload, row_status, validation_score, metadata
       ) values ($1,$2,1,'pharmacy','{}'::jsonb,'{}'::jsonb,'needs_review',90,'{"isolatedPreviewProof":true}'::jsonb)`,
      [fixture.rowId, fixture.batchId],
    );
    fixture.observationId = await registerEvidence(client, fixture);
    const pipeline = buildPipeline(fixture);

    await client.query('set local role service_role');
    const created = await persist(client, fixture, pipeline);
    assert(created?.status === 'created' && created?.candidateId === fixture.draftId &&
      created?.candidateStatus === 'needs_review' && created?.duplicateCandidateCount === 1 &&
      created?.geoMappingCount === 1 && /^[a-f0-9]{64}$/.test(created?.receiptHash) &&
      created?.candidatePersistenceAllowed === true && created?.duplicateResolutionAllowed === false &&
      created?.geoVerificationAllowed === false && created?.reviewDecisionAllowed === false &&
      created?.directEntityWriteAllowed === false && created?.publishAllowed === false,
    'Atomic Candidate persistence/readback drifted.');
    const replayed = await persist(client, fixture, pipeline);
    assert(replayed?.status === 'replayed' && replayed?.receiptHash === created.receiptHash, 'Exact Candidate replay drifted.');
    const mismatch = await persist(client, fixture, pipeline, digest(`${fixture.seed}:mismatch`));
    assert(mismatch?.status === 'conflict' && mismatch?.reason === 'candidate_idempotency_mismatch', 'Mismatched replay did not fail closed.');

    await client.query('savepoint immutable_guard');
    let immutableError = '';
    try {
      await client.query(
        `update public.import_entity_candidates set candidate_status = 'approved' where id = $1`,
        [fixture.draftId],
      );
    } catch (error) {
      immutableError = error instanceof Error ? error.message : String(error);
      await client.query('rollback to savepoint immutable_guard');
    }
    assert(immutableError.includes('entity_candidate_pipeline_row_immutable'), 'Contract-bound Candidate mutation was not blocked.');
    await client.query('reset role');

    const state = await client.query(
      `select c.candidate_status, c.pipeline_schema_version, c.draft_hash,
         (select count(*)::int from public.import_duplicate_candidates d where d.entity_candidate_id = c.id) as duplicate_count,
         (select count(*)::int from public.import_mapping_results m where m.entity_candidate_id = c.id and m.mapping_type = 'geo') as geo_count,
         (select bool_and(d.resolution_status = 'pending' and d.resolved_at is null and d.resolved_by_profile_id is null)
          from public.import_duplicate_candidates d where d.entity_candidate_id = c.id) as duplicate_unresolved,
         (select bool_and((m.metadata->>'geoVerified')::boolean = false)
          from public.import_mapping_results m where m.entity_candidate_id = c.id and m.mapping_type = 'geo') as geo_unverified
       from public.import_entity_candidates c where c.id = $1`,
      [fixture.draftId],
    );
    const row = state.rows[0];
    assert(row?.candidate_status === 'needs_review' && row?.pipeline_schema_version === pipelineSchemaVersion &&
      /^[a-f0-9]{64}$/.test(row?.draft_hash) && row?.duplicate_count === 1 && row?.geo_count === 1 &&
      row?.duplicate_unresolved === true && row?.geo_unverified === true,
    'Persisted Candidate/Evidence state escaped its bounded authority.');

    return {
      atomicPersistence: true,
      exactReplay: true,
      mismatchedReplayRejected: true,
      immutableContractRows: true,
      boundedReadbackReceipt: true,
      candidateStatus: 'needs_review',
      duplicateResolutionOpened: false,
      geoVerificationOpened: false,
      reviewDecisionOpened: false,
      canonicalWriteOpened: false,
      publishOpened: false,
    };
  } finally {
    await client.query('reset role').catch(() => {});
    await client.query('rollback');
  }
}

async function main() {
  const databaseUrl = required('ENTITY_CANDIDATE_PREVIEW_DATABASE_URL');
  const previewRef = required('ENTITY_CANDIDATE_PREVIEW_PROJECT_REF');
  const productionRef = required('ENTITY_CANDIDATE_PRODUCTION_PROJECT_REF');
  verifyPreviewIdentity(databaseUrl, previewRef, productionRef);
  const runId = process.env.GITHUB_RUN_ID ?? `local-${Date.now()}`;
  const seed = `entity-candidate-pipeline:${runId}`;
  const fixture = {
    seed,
    actorId: deterministicUuid(`${seed}:actor`),
    batchId: deterministicUuid(`${seed}:batch`),
    rowId: deterministicUuid(`${seed}:row`),
    draftId: deterministicUuid(`${seed}:draft`),
    matchedEntityId: deterministicUuid(`${seed}:matched-entity`),
    countryId: deterministicUuid(`${seed}:country`),
    governorateId: deterministicUuid(`${seed}:governorate`),
    cityId: deterministicUuid(`${seed}:city`),
    evidenceKey: `evidence-${digest(`${seed}:evidence`).slice(0, 40)}`,
    idempotencyKey: `candidate-${digest(`${seed}:candidate`).slice(0, 40)}`,
    requestHash: digest(`${seed}:request`),
    observationId: null,
  };
  const client = new Client(connectionConfig(databaseUrl));
  try {
    await client.connect();
    await verifySchema(client);
    const proof = await runProof(client, fixture);
    const remaining = await client.query(
      `select count(*)::int as count from public.import_entity_candidates where id = $1`,
      [fixture.draftId],
    );
    assert(remaining.rows[0]?.count === 0, 'Rollback cleanup left ENTITY-CANDIDATE-PIPELINE fixture rows.');
    await mkdir(path.dirname(evidencePath), { recursive: true });
    await writeFile(evidencePath, `${JSON.stringify({
      schemaVersion: pipelineSchemaVersion,
      headSha: process.env.ENTITY_CANDIDATE_SOURCE_COMMIT ?? null,
      previewProjectRefHash: digest(previewRef),
      productionDisconnected: true,
      migration: '0093',
      schemaVerified: true,
      rollbackCleanupVerified: true,
      proof,
    }, null, 2)}\n`);
    console.log('ENTITY-CANDIDATE-PIPELINE hosted proof passed.');
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
