#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import pg from 'pg';

const { Client } = pg;
const schemaVersion = 'drkhaleej.import.sourceEvidenceLedger.v1';
const evidencePath = process.env.SOURCE_EVIDENCE_LEDGER_EVIDENCE_PATH ??
  'artifacts/source-evidence-ledger/proof.json';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}
function digest(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}
function deterministicUuid(seed) {
  const hex = digest(seed).slice(0, 32).split('');
  hex[12] = '4';
  hex[16] = ((Number.parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].map((part) => part.join('')).join('-');
}
function verifyPreviewIdentity(databaseUrl, previewRef, productionRef) {
  assert(previewRef !== productionRef, 'Preview and Production refs must differ.');
  const parsed = new URL(databaseUrl);
  assert(parsed.protocol === 'postgresql:', 'P17 proof requires postgresql.');
  assert(parsed.port === '5432', 'P17 proof requires Session pooler port 5432.');
  assert(parsed.hostname.endsWith('.pooler.supabase.com'), 'P17 proof requires the isolated Supabase Session pooler.');
  assert(decodeURIComponent(parsed.username) === `postgres.${previewRef}`, 'Database identity does not match Preview.');
  assert(!databaseUrl.includes(productionRef), 'Production identity appeared in Preview URL.');
}
function connectionConfig(databaseUrl) {
  return {
    connectionString: databaseUrl,
    application_name: 'drkhaleej-source-evidence-ledger-proof',
    ssl: { rejectUnauthorized: false },
    keepAlive: true,
    statement_timeout: 45_000,
    query_timeout: 50_000,
    connectionTimeoutMillis: 15_000,
  };
}

async function verifySchema(client) {
  const ledger = await client.query(
    `select version::text as version
     from supabase_migrations.schema_migrations
     where version::text = '0092'`,
  );
  assert(ledger.rowCount === 1, 'Preview migration ledger must contain exactly one 0092.');

  const tables = await client.query(
    `select c.relname, c.relrowsecurity,
       (select count(*)::int from pg_catalog.pg_policy p where p.polrelid = c.oid) as policy_count,
       has_table_privilege('service_role', c.oid, 'SELECT') as service_select,
       has_table_privilege('service_role', c.oid, 'INSERT') as service_insert,
       has_table_privilege('service_role', c.oid, 'UPDATE') as service_update,
       has_table_privilege('service_role', c.oid, 'DELETE') as service_delete
     from pg_catalog.pg_class c
     join pg_catalog.pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname in ('import_source_observations','import_source_evidence','import_source_evidence_events')
     order by c.relname`,
  );
  assert(tables.rowCount === 3 && tables.rows.every((row) => row.relrowsecurity && row.policy_count === 0 && !row.service_select && !row.service_insert && !row.service_update && !row.service_delete), 'P17 private table RLS/direct-grant boundary drifted.');

  const functions = await client.query(
    `select p.oid::regprocedure::text as signature, p.prosecdef,
       exists (select 1 from unnest(coalesce(p.proconfig, '{}'::text[])) setting where replace(setting, ' ', '') = 'search_path=pg_catalog,public') as search_path_pinned,
       has_function_privilege('service_role', p.oid, 'EXECUTE') as service_execute,
       has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute
     from pg_catalog.pg_proc p
     where p.oid in (
       to_regprocedure('public.import_register_source_evidence(uuid,text,text,text,text,text,text,text,text,text,timestamptz,text,text,timestamptz,text,jsonb)'),
       to_regprocedure('public.import_read_source_evidence(uuid,uuid,text,text)'),
       to_regprocedure('public.import_record_source_observation_deletion(uuid,uuid,text,text,text)')
     ) order by signature`,
  );
  assert(functions.rowCount === 3 && functions.rows.every((row) => row.prosecdef && row.search_path_pinned && row.service_execute && !row.anon_execute && !row.authenticated_execute), 'P17 RPC privilege/search_path boundary drifted.');
}

async function register(client, fixture, overrides = {}) {
  const values = {
    actorId: fixture.actorId,
    idempotencyKey: fixture.idempotencyKey,
    requestHash: fixture.requestHash,
    sourceType: 'api',
    sourceIdentity: 'isolated-preview-source',
    policyStatus: 'accepted',
    storageReference: 'private-observations/proof/observation.json',
    contentHash: digest('raw-content'),
    selectedHash: digest('selected-content'),
    observedAt: fixture.observedAt,
    parserVersion: 'entity-parser-v1',
    retentionClass: 'standard',
    retainUntil: fixture.retainUntil,
    retentionReason: null,
    evidence: [{ referenceId: 'evidence-proof-001', fieldPaths: ['name', 'contact.phone'], excerpt: 'Preview Evidence Pharmacy', excerptHash: digest('Preview Evidence Pharmacy') }],
    ...overrides,
  };
  const result = await client.query(
    `select public.import_register_source_evidence(
       $1::uuid,$2::text,$3::text,$4::text,$5::text,$6::text,$7::text,$8::text,
       $9::text,$10::text,$11::timestamptz,$12::text,$13::text,$14::timestamptz,
       $15::text,$16::jsonb
     ) as result`,
    [values.actorId, values.idempotencyKey, values.requestHash, schemaVersion, values.sourceType, values.sourceIdentity, values.policyStatus, values.storageReference, values.contentHash, values.selectedHash, values.observedAt, values.parserVersion, values.retentionClass, values.retainUntil, values.retentionReason, JSON.stringify(values.evidence)],
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
       ) values (
         $1, 'Source Evidence Proof Actor', 'Evidence Proof', 'en', 'om',
         true, false, false, '{"isolatedPreviewProof":true}'::jsonb
       )`,
      [fixture.actorId],
    );

    const created = await register(client, fixture);
    assert(created?.status === 'created' && created?.policyStatus === 'accepted' && created?.evidenceReferenceIds?.length === 1 && created?.rawReferenceExposed === false && created?.directEntityWriteAllowed === false && created?.publishAllowed === false, 'Accepted Observation registration drifted.');
    fixture.observationId = created.observationId;

    const replayed = await register(client, fixture);
    assert(replayed?.status === 'replayed' && replayed?.observationId === fixture.observationId && replayed?.rawReferenceExposed === false, 'Exact registration replay drifted.');
    const mismatch = await register(client, fixture, { requestHash: digest('mismatched-request') });
    assert(mismatch?.status === 'conflict' && mismatch?.reason === 'observation_idempotency_mismatch', 'Mismatched registration replay did not fail closed.');

    const read = await client.query(
      `select public.import_read_source_evidence($1::uuid,$2::uuid,$3::text,$4::text) as result`,
      [fixture.actorId, fixture.observationId, fixture.accessKey, 'review selected source evidence'],
    );
    const readResult = read.rows[0]?.result;
    assert(readResult?.status === 'read' && readResult?.evidence?.length === 1 && readResult?.rawReferenceExposed === false && !('storageReference' in readResult), 'Bounded readback exposed or omitted P17 evidence.');
    const readReplay = await client.query(
      `select public.import_read_source_evidence($1::uuid,$2::uuid,$3::text,$4::text) as result`,
      [fixture.actorId, fixture.observationId, fixture.accessKey, 'review selected source evidence'],
    );
    assert(readReplay.rows[0]?.result?.status === 'replayed', 'Access event replay drifted.');

    const deleted = await client.query(
      `select public.import_record_source_observation_deletion($1::uuid,$2::uuid,$3::text,$4::text,$5::text) as result`,
      [fixture.actorId, fixture.observationId, fixture.deleteKey, 'retention expiry object deletion', fixture.deletionReceiptHash],
    );
    assert(deleted.rows[0]?.result?.status === 'deleted' && deleted.rows[0]?.result?.rawReferenceExposed === false, 'Deletion audit drifted.');
    const deleteReplay = await client.query(
      `select public.import_record_source_observation_deletion($1::uuid,$2::uuid,$3::text,$4::text,$5::text) as result`,
      [fixture.actorId, fixture.observationId, fixture.deleteKey, 'retention expiry object deletion', fixture.deletionReceiptHash],
    );
    assert(deleteReplay.rows[0]?.result?.status === 'replayed', 'Deletion replay must precede terminal lifecycle rejection.');

    const deniedRead = await client.query(
      `select public.import_read_source_evidence($1::uuid,$2::uuid,$3::text,$4::text) as result`,
      [fixture.actorId, fixture.observationId, fixture.postDeleteAccessKey, 'verify deleted source boundary'],
    );
    assert(deniedRead.rows[0]?.result?.status === 'denied' && deniedRead.rows[0]?.result?.reason === 'source_observation_deleted', 'Post-deletion access did not fail closed.');

    for (const policyStatus of ['denied', 'needs_review']) {
      const metadataOnly = await register(client, fixture, {
        idempotencyKey: `${policyStatus}-${fixture.idempotencyKey}`,
        requestHash: digest(`${policyStatus}-request`),
        policyStatus,
        storageReference: null,
        contentHash: null,
        selectedHash: null,
        evidence: [],
      });
      assert(metadataOnly?.status === 'created' && metadataOnly?.policyStatus === policyStatus && metadataOnly?.evidenceReferenceIds?.length === 0, `${policyStatus} metadata-only registration drifted.`);
    }
    const forbiddenDenied = await register(client, fixture, {
      idempotencyKey: `forbidden-${fixture.idempotencyKey}`,
      requestHash: digest('forbidden-denied-request'),
      policyStatus: 'denied',
    });
    assert(forbiddenDenied?.status === 'rejected' && forbiddenDenied?.reason === 'nonaccepted_observation_storage_forbidden', 'Denied raw storage vector was not rejected.');

    const state = await client.query(
      `select
         o.lifecycle_status, o.storage_reference, o.deletion_receipt_hash,
         (select count(*)::int from public.import_source_evidence e where e.observation_id = o.id) as evidence_count,
         (select count(*)::int from public.import_source_evidence_events ev where ev.observation_id = o.id) as event_count,
         (select count(*)::int from public.import_source_evidence_events ev where ev.observation_id = o.id and ev.event_type = 'deleted') as deletion_events
       from public.import_source_observations o where o.id = $1`,
      [fixture.observationId],
    );
    const row = state.rows[0];
    assert(row?.lifecycle_status === 'deleted' && row?.storage_reference === null && row?.deletion_receipt_hash === fixture.deletionReceiptHash && row?.evidence_count === 1 && row?.event_count === 4 && row?.deletion_events === 1, 'P17 lifecycle readback or exact event counts drifted.');

    return { created: true, exactRegistrationReplay: true, mismatchRejected: true, boundedReadback: true, accessReplay: true, deletionAudited: true, deletionReplayAfterTerminal: true, postDeletionAccessDenied: true, metadataOnlyPolicyStates: ['denied', 'needs_review'], deniedRawRejected: true, exactEvidenceCount: 1, exactLifecycleEventCount: 4 };
  } finally {
    await client.query('rollback');
  }
}

async function main() {
  const databaseUrl = required('SOURCE_EVIDENCE_PREVIEW_DATABASE_URL');
  const previewRef = required('SOURCE_EVIDENCE_PREVIEW_PROJECT_REF');
  const productionRef = required('SOURCE_EVIDENCE_PRODUCTION_PROJECT_REF');
  verifyPreviewIdentity(databaseUrl, previewRef, productionRef);
  const runId = process.env.GITHUB_RUN_ID ?? `local-${Date.now()}`;
  const seed = `source-evidence-ledger:${runId}`;
  const observedAt = new Date('2026-08-02T00:00:00.000Z');
  const fixture = {
    actorId: deterministicUuid(`${seed}:actor`),
    idempotencyKey: `observation-${digest(`${seed}:registration`).slice(0, 40)}`,
    requestHash: digest(`${seed}:request`),
    accessKey: `access-${digest(`${seed}:access`).slice(0, 40)}`,
    deleteKey: `delete-${digest(`${seed}:delete`).slice(0, 40)}`,
    postDeleteAccessKey: `access-${digest(`${seed}:post-delete`).slice(0, 40)}`,
    deletionReceiptHash: digest(`${seed}:object-deletion-receipt`),
    observedAt: observedAt.toISOString(),
    retainUntil: new Date(observedAt.getTime() + 30 * 86_400_000).toISOString(),
  };
  const client = new Client(connectionConfig(databaseUrl));
  try {
    await client.connect();
    await verifySchema(client);
    const proof = await runProof(client, fixture);
    const remaining = await client.query(
      `select count(*)::int as count from public.import_source_observations where actor_profile_id = $1`,
      [fixture.actorId],
    );
    assert(remaining.rows[0]?.count === 0, 'Rollback cleanup left P17 fixture rows.');
    await mkdir(path.dirname(evidencePath), { recursive: true });
    await writeFile(evidencePath, `${JSON.stringify({ schemaVersion, headSha: process.env.SOURCE_EVIDENCE_SOURCE_COMMIT ?? null, previewProjectRefHash: digest(previewRef), productionDisconnected: true, migration: '0092', schemaVerified: true, rollbackCleanupVerified: true, proof }, null, 2)}\n`);
    console.log('P17 Source Evidence Ledger hosted proof passed.');
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch(async (error) => {
  await mkdir(path.dirname(evidencePath), { recursive: true }).catch(() => {});
  await writeFile(evidencePath, `${JSON.stringify({ schemaVersion, status: 'failed', error: String(error?.message ?? error).replace(/postgres(?:ql)?:\/\/[^\s]+/gi, '[REDACTED_DATABASE_URL]').replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, '[REDACTED_ID]').slice(0, 600), productionDisconnected: true }, null, 2)}\n`).catch(() => {});
  console.error(`P17 Source Evidence Ledger hosted proof failed: ${String(error?.message ?? error).slice(0, 600)}`);
  process.exit(1);
});
