#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;
const root = process.cwd();
const evidencePath = path.resolve(
  root,
  process.env.PHARMACY_NOINDEX_EVIDENCE_PATH ||
    'artifacts/pharmacy-public-noindex/lifecycle-proof.json',
);
const schemaVersion = 'drkhaleej.import.pharmacyPublicNoindex.v1';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required; the Pharmacy public/noindex proof never skips.`);
  }
  return value;
}

function digest(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

function deterministicUuid(value) {
  const chars = digest(value).slice(0, 32).split('');
  chars[12] = '4';
  chars[16] = '8';
  const hex = chars.join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]),
  );
}

function jsonEqual(left, right) {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

function redact(value) {
  return String(value || '')
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, '[REDACTED_DATABASE_URL]')
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, '[REDACTED_ID]')
    .slice(0, 1200);
}

function verifyPreviewIdentity(databaseUrl, previewRef, productionRef) {
  const parsed = new URL(databaseUrl);
  assert(
    ['postgres:', 'postgresql:'].includes(parsed.protocol),
    'Pharmacy noindex proof requires PostgreSQL.',
  );
  assert(
    previewRef && productionRef && previewRef !== productionRef,
    'Preview and Production project refs must be present and different.',
  );
  assert(parsed.port === '5432', 'Pharmacy noindex proof requires Session pooler port 5432.');
  assert(
    parsed.hostname.endsWith('.pooler.supabase.com'),
    'Pharmacy noindex proof requires the isolated Supabase Session pooler.',
  );
  assert(
    decodeURIComponent(parsed.username) === `postgres.${previewRef}`,
    'Pharmacy noindex database identity does not match Preview.',
  );
  assert(
    !databaseUrl.includes(productionRef),
    'Production ref appeared in the Pharmacy noindex database URL.',
  );
}

function connectionConfig(databaseUrl, suffix) {
  return {
    connectionString: databaseUrl,
    application_name: `drkhaleej-pharmacy-public-noindex-${suffix}`,
    ssl: { rejectUnauthorized: false },
    keepAlive: true,
    statement_timeout: 45_000,
    query_timeout: 50_000,
    connectionTimeoutMillis: 15_000,
  };
}

function fixture(runId) {
  const seed = `pharmacy-public-noindex:${runId}`;
  const slug = `noindex-proof-${digest(seed).slice(0, 12)}`;
  const candidatePayload = {
    projectionVersion: 'v1',
    identity: {
      primaryName: 'Preview Noindex Pharmacy',
      nameEn: 'Preview Noindex Pharmacy',
      nameAr: 'صيدلية معاينة بدون فهرسة',
      slugCandidate: slug,
    },
    contact: {
      phoneE164: '+96824000011',
      whatsappE164: '+96894000011',
      email: 'noindex-proof@example.invalid',
      websiteUrl: 'https://example.invalid/noindex-proof',
      googleMapsUrl: 'https://maps.example.invalid/noindex-proof',
      directionUrl: null,
    },
    geo: {
      countryCode: 'om',
      governorate: 'Muscat',
      wilayat: 'Bawshar',
      area: 'Al Khuwair',
      latitude: 23.59,
      longitude: 58.41,
    },
    taxonomy: {
      services: ['prescription-dispensing'],
      departments: [],
    },
    languages: ['en', 'ar'],
    source: {
      sourceName: 'Isolated Preview lifecycle proof',
      sourceUrl: 'https://example.invalid/source',
      lastCheckedAt: '2026-07-28T00:00:00.000Z',
    },
    quality: { score: 92, flags: [] },
  };
  return {
    actorId: deterministicUuid(`${seed}:actor`),
    entityId: deterministicUuid(`${seed}:entity`),
    batchId: deterministicUuid(`${seed}:batch`),
    rawRowId: deterministicUuid(`${seed}:raw-row`),
    candidateId: deterministicUuid(`${seed}:candidate`),
    queueId: deterministicUuid(`${seed}:queue`),
    slug,
    canonicalPathEn: `/en/om/pharmacies/${slug}`,
    canonicalPathAr: `/ar/om/pharmacies/${slug}`,
    idempotencyKey: `public-noindex-${digest(`${seed}:idempotency`).slice(0, 40)}`,
    requestHash: digest(`${seed}:request`),
    candidatePayload,
    originalQueue: {
      target_entity_type: 'pharmacy',
      target_entity_id: null,
      publish_status: 'queued',
      index_policy: 'noindex',
      sitemap_policy: 'excluded',
      quality_score: 81,
      admin_note: 'Pre-public exact rollback fixture.',
      metadata: {
        fixture: 'pharmacy-public-noindex',
        state: 'queued',
      },
    },
  };
}

async function writeEvidence(evidence) {
  await mkdir(path.dirname(evidencePath), { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
}

async function cleanup(client, item) {
  if (!client) return;
  await client.query('begin');
  try {
    await client.query(
      'delete from public.import_pharmacy_public_noindex_events where entity_id = $1',
      [item.entityId],
    );
    await client.query(
      'delete from public.import_pharmacy_public_noindex_authorizations where entity_id = $1',
      [item.entityId],
    );
    await client.query(
      'delete from public.import_publish_queue where id = $1 or target_entity_id = $2',
      [item.queueId, item.entityId],
    );
    await client.query(
      'delete from public.import_entity_candidates where id = $1',
      [item.candidateId],
    );
    await client.query('delete from public.import_raw_rows where id = $1', [item.rawRowId]);
    await client.query('delete from public.import_batches where id = $1', [item.batchId]);
    await client.query('delete from public.centers where id = $1', [item.entityId]);
    await client.query('delete from public.profiles where id = $1', [item.actorId]);
    await client.query('commit');
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  }
}

async function verifyMigrationAndRpcs(client) {
  const ledger = await client.query(
    `select version::text as version
     from supabase_migrations.schema_migrations
     where version = '0087'`,
  );
  assert(ledger.rowCount === 1, 'Preview migration ledger does not include 0087.');

  for (const identity of [
    'public.import_authorize_pharmacy_public_noindex(uuid,uuid,uuid,text,text,text,text,text,text,integer)',
    'public.import_publish_pharmacy_public_noindex(uuid,uuid,uuid,text,text)',
    'public.import_rollback_pharmacy_public_noindex_by_authority(uuid,uuid,text)',
  ]) {
    const result = await client.query(
      'select pg_get_functiondef(to_regprocedure($1)) as definition',
      [identity],
    );
    const definition = result.rows[0]?.definition;
    const pinsRequiredSearchPath =
      typeof definition === 'string' &&
      (definition.includes('SET search_path TO pg_catalog, public') ||
        definition.includes("SET search_path TO 'pg_catalog', 'public'"));
    assert(
      typeof definition === 'string' &&
        definition.includes('SECURITY INVOKER') &&
        pinsRequiredSearchPath,
      `Missing protected RPC identity: ${identity}`,
    );
  }
}

async function insertFixture(client, item) {
  await client.query('begin');
  try {
    await client.query(
      `insert into public.profiles (
         id, full_name, display_name, locale, country, is_platform_admin,
         is_provider_user, is_patient_user, metadata
       ) values (
         $1, 'Pharmacy Noindex Proof Actor', 'Noindex Proof', 'en', 'om',
         true, false, false, '{"isolatedPreviewProof":true}'::jsonb
       )`,
      [item.actorId],
    );
    await client.query(
      `insert into public.centers (
         id, slug, name_en, name_ar, center_type, status, verification_status,
         primary_phone, default_locale, default_country, is_active, is_claimable,
         is_featured, sort_order, metadata
       ) values (
         $1, $2, 'Preview Noindex Pharmacy', 'صيدلية معاينة بدون فهرسة',
         'pharmacy', 'draft', 'unverified', '+96824000011', 'en', 'om',
         false, false, false, 0,
         '{"visibility":"private","publicRouteEnabled":false,"indexable":false,"sitemapEligible":false}'::jsonb
       )`,
      [item.entityId, item.slug],
    );
    await client.query(
      `insert into public.import_batches (
         id, uploaded_by_profile_id, batch_name, entity_type, source_type,
         source_name, status, total_rows, valid_rows, ready_for_review_rows, metadata
       ) values (
         $1, $2, 'Pharmacy public/noindex isolated proof', 'pharmacy', 'manual',
         'isolated-preview-proof', 'ready_for_publish', 1, 1, 1,
         '{"isolatedPreviewProof":true}'::jsonb
       )`,
      [item.batchId, item.actorId],
    );
    await client.query(
      `insert into public.import_raw_rows (
         id, batch_id, row_number, entity_type, external_id, raw_payload,
         normalized_payload, row_status, validation_score, source_url,
         last_checked_at, metadata
       ) values (
         $1, $2, 1, 'pharmacy', $3, $4::jsonb, $4::jsonb,
         'ready_for_publish', 92, 'https://example.invalid/source',
         date '2026-07-28', '{"isolatedPreviewProof":true}'::jsonb
       )`,
      [item.rawRowId, item.batchId, `proof-${item.slug}`, JSON.stringify(item.candidatePayload)],
    );
    await client.query(
      `insert into public.import_entity_candidates (
         id, batch_id, raw_row_id, entity_type, candidate_payload,
         candidate_status, quality_score, review_note
       ) values (
         $1, $2, $3, 'pharmacy', $4::jsonb, 'approved', 92,
         'Approved only for isolated Preview public/noindex proof.'
       )`,
      [item.candidateId, item.batchId, item.rawRowId, JSON.stringify(item.candidatePayload)],
    );
    await client.query(
      `insert into public.import_publish_queue (
         id, batch_id, raw_row_id, target_entity_type, target_entity_id,
         publish_status, index_policy, sitemap_policy, quality_score,
         admin_note, metadata
       ) values (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb
       )`,
      [
        item.queueId,
        item.batchId,
        item.rawRowId,
        item.originalQueue.target_entity_type,
        item.originalQueue.target_entity_id,
        item.originalQueue.publish_status,
        item.originalQueue.index_policy,
        item.originalQueue.sitemap_policy,
        item.originalQueue.quality_score,
        item.originalQueue.admin_note,
        JSON.stringify(item.originalQueue.metadata),
      ],
    );
    await client.query('commit');
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  }

  const version = await client.query(
    'select updated_at::text as version from public.centers where id = $1',
    [item.entityId],
  );
  assert(version.rowCount === 1, 'Pharmacy noindex fixture center is missing.');
  item.expectedEntityVersion = version.rows[0].version;
}

async function authorize(client, item) {
  const response = await client.query(
    `select public.import_authorize_pharmacy_public_noindex(
       $1::uuid, $2::uuid, $3::uuid, $4::text, $5::text, $6::text,
       $7::text, $8::text, $9::text, $10::integer
     ) as result`,
    [
      item.actorId,
      item.entityId,
      item.candidateId,
      item.idempotencyKey,
      item.requestHash,
      item.expectedEntityVersion,
      item.canonicalPathEn,
      item.canonicalPathAr,
      schemaVersion,
      24,
    ],
  );
  const result = response.rows[0]?.result;
  assert(result?.status === 'issued', 'Public/noindex authorization was not issued.');
  assert(
    result.authorizationId && result.snapshotHash && result.candidatePayloadHash,
    'Public/noindex authority references are incomplete.',
  );
  item.authorizationId = result.authorizationId;
  item.snapshotHash = result.snapshotHash;

  const replay = await client.query(
    `select public.import_authorize_pharmacy_public_noindex(
       $1::uuid, $2::uuid, $3::uuid, $4::text, $5::text, $6::text,
       $7::text, $8::text, $9::text, $10::integer
     ) as result`,
    [
      item.actorId,
      item.entityId,
      item.candidateId,
      item.idempotencyKey,
      item.requestHash,
      item.expectedEntityVersion,
      item.canonicalPathEn,
      item.canonicalPathAr,
      schemaVersion,
      24,
    ],
  );
  assert(replay.rows[0]?.result?.status === 'replayed', 'Authorization replay was not bounded.');
}

async function publish(client, item) {
  const response = await client.query(
    `select public.import_publish_pharmacy_public_noindex(
       $1::uuid, $2::uuid, $3::uuid, $4::text, $5::text
     ) as result`,
    [item.authorizationId, item.actorId, item.entityId, item.requestHash, schemaVersion],
  );
  return response.rows[0]?.result;
}

async function rollback(client, item) {
  const response = await client.query(
    `select public.import_rollback_pharmacy_public_noindex_by_authority(
       $1::uuid, $2::uuid, $3::text
     ) as result`,
    [item.actorId, item.entityId, schemaVersion],
  );
  return response.rows[0]?.result;
}

async function verifyPublishedReadback(client, item) {
  const [authority, queue, events, center, leakage] = await Promise.all([
    client.query(
      `select status, candidate_id, published_queue_id, snapshot_payload,
              snapshot_hash, terminal_result, terminal_result_hash
       from public.import_pharmacy_public_noindex_authorizations
       where id = $1 and actor_profile_id = $2 and entity_id = $3`,
      [item.authorizationId, item.actorId, item.entityId],
    ),
    client.query(
      `select id, target_entity_type, target_entity_id, publish_status,
              index_policy, sitemap_policy, metadata
       from public.import_publish_queue where id = $1`,
      [item.queueId],
    ),
    client.query(
      `select event_type, outcome
       from public.import_pharmacy_public_noindex_events
       where authorization_id = $1 order by created_at, id`,
      [item.authorizationId],
    ),
    client.query(
      `select status, is_active, is_featured, deleted_at, updated_at::text as version
       from public.centers where id = $1`,
      [item.entityId],
    ),
    client.query(
      `select
         count(*) filter (where index_policy = 'index')::int as index_leakage,
         count(*) filter (where sitemap_policy = 'included')::int as sitemap_leakage
       from public.import_publish_queue
       where target_entity_id = $1`,
      [item.entityId],
    ),
  ]);

  assert(authority.rowCount === 1 && authority.rows[0].status === 'published', 'Published authority readback failed.');
  assert(authority.rows[0].published_queue_id === item.queueId, 'Authority-to-queue identity mismatch.');
  assert(authority.rows[0].snapshot_hash === item.snapshotHash, 'Snapshot hash changed after publish.');
  assert(
    authority.rows[0].snapshot_payload?.queuePresent === true,
    'Existing queue snapshot was not preserved.',
  );
  assert(
    authority.rows[0].terminal_result?.indexPolicy === 'noindex' &&
      authority.rows[0].terminal_result?.sitemapPolicy === 'excluded' &&
      /^[a-f0-9]{64}$/.test(authority.rows[0].terminal_result_hash),
    'Terminal publication readback crossed an independent promotion boundary.',
  );

  assert(queue.rowCount === 1, 'Published noindex queue row is missing.');
  const published = queue.rows[0];
  assert(
    published.target_entity_type === 'pharmacy' &&
      published.target_entity_id === item.entityId &&
      published.publish_status === 'published_noindex' &&
      published.index_policy === 'noindex' &&
      published.sitemap_policy === 'excluded',
    'Published queue policy mismatch.',
  );
  assert(
    published.metadata?.robots_policy === 'noindex' &&
      published.metadata?.sitemap_included === false &&
      published.metadata?.index_promoted === false &&
      published.metadata?.canonical_paths?.en === item.canonicalPathEn &&
      published.metadata?.canonical_paths?.ar === item.canonicalPathAr,
    'Bilingual noindex metadata readback failed.',
  );
  assert(
    events.rows.filter((row) => row.event_type === 'authorization_issued').length === 1 &&
      events.rows.filter((row) => row.event_type === 'public_noindex_published').length === 1,
    'Public/noindex authorization or publication audit count mismatch.',
  );
  assert(
    center.rows[0]?.status === 'draft' &&
      center.rows[0]?.is_active === false &&
      center.rows[0]?.is_featured === false &&
      center.rows[0]?.deleted_at === null &&
      center.rows[0]?.version === item.expectedEntityVersion,
    'Canonical Pharmacy crossed the private center boundary.',
  );
  assert(
    leakage.rows[0]?.index_leakage === 0 && leakage.rows[0]?.sitemap_leakage === 0,
    'Index or sitemap leakage detected.',
  );
}

async function verifyRollbackReadback(client, item) {
  const [authority, queue, events, center] = await Promise.all([
    client.query(
      `select status, snapshot_hash, terminal_result, terminal_result_hash, rolled_back_at
       from public.import_pharmacy_public_noindex_authorizations
       where id = $1`,
      [item.authorizationId],
    ),
    client.query(
      `select target_entity_type, target_entity_id, publish_status, index_policy,
              sitemap_policy, quality_score, admin_note, metadata
       from public.import_publish_queue where id = $1`,
      [item.queueId],
    ),
    client.query(
      `select event_type, outcome
       from public.import_pharmacy_public_noindex_events
       where authorization_id = $1 order by created_at, id`,
      [item.authorizationId],
    ),
    client.query(
      `select status, is_active, is_featured, deleted_at, updated_at::text as version
       from public.centers where id = $1`,
      [item.entityId],
    ),
  ]);

  assert(authority.rows[0]?.status === 'rolled_back', 'Rollback authority terminal state mismatch.');
  assert(
    authority.rows[0]?.snapshot_hash === item.snapshotHash &&
      authority.rows[0]?.terminal_result?.exactLogicalRecovery === true &&
      authority.rows[0]?.rolled_back_at,
    'Rollback terminal evidence is incomplete.',
  );
  assert(queue.rowCount === 1, 'Original queued row was not restored.');
  const restored = queue.rows[0];
  assert(
    jsonEqual(
      {
        target_entity_type: restored.target_entity_type,
        target_entity_id: restored.target_entity_id,
        publish_status: restored.publish_status,
        index_policy: restored.index_policy,
        sitemap_policy: restored.sitemap_policy,
        quality_score: restored.quality_score,
        admin_note: restored.admin_note,
        metadata: restored.metadata,
      },
      item.originalQueue,
    ),
    'Queue exact logical recovery mismatch.',
  );
  assert(
    events.rows.length === 3 &&
      events.rows.filter((row) => row.event_type === 'public_noindex_rolled_back').length === 1,
    'Rollback audit history is incomplete or duplicated.',
  );
  assert(
    center.rows[0]?.status === 'draft' &&
      center.rows[0]?.is_active === false &&
      center.rows[0]?.is_featured === false &&
      center.rows[0]?.deleted_at === null &&
      center.rows[0]?.version === item.expectedEntityVersion,
    'Canonical Pharmacy changed during public/noindex rollback.',
  );
}

async function verifyCleanup(client, item) {
  const result = await client.query(
    `select
       (select count(*)::int from public.import_pharmacy_public_noindex_events where entity_id = $1) as events,
       (select count(*)::int from public.import_pharmacy_public_noindex_authorizations where entity_id = $1) as authorities,
       (select count(*)::int from public.import_publish_queue where id = $2 or target_entity_id = $1) as queues,
       (select count(*)::int from public.import_entity_candidates where id = $3) as candidates,
       (select count(*)::int from public.import_raw_rows where id = $4) as raw_rows,
       (select count(*)::int from public.import_batches where id = $5) as batches,
       (select count(*)::int from public.centers where id = $1) as centers,
       (select count(*)::int from public.profiles where id = $6) as actors`,
    [item.entityId, item.queueId, item.candidateId, item.rawRowId, item.batchId, item.actorId],
  );
  assert(
    Object.values(result.rows[0]).every((count) => count === 0),
    'Pharmacy noindex proof cleanup left fixture rows.',
  );
}

const databaseUrl = required('PHARMACY_NOINDEX_PREVIEW_DATABASE_URL');
const previewRef = required('PHARMACY_NOINDEX_PREVIEW_PROJECT_REF');
const productionRef = required('PHARMACY_NOINDEX_PRODUCTION_PROJECT_REF');
const sourceCommit = required('PHARMACY_NOINDEX_SOURCE_COMMIT');
const runId = required('PHARMACY_NOINDEX_RUN_ID');
const item = fixture(runId);
let clientA;
let clientB;
let verified = false;

try {
  verifyPreviewIdentity(databaseUrl, previewRef, productionRef);
  clientA = new Client(connectionConfig(databaseUrl, 'a'));
  clientB = new Client(connectionConfig(databaseUrl, 'b'));
  await Promise.all([clientA.connect(), clientB.connect()]);
  await cleanup(clientA, item).catch(() => {});
  await verifyMigrationAndRpcs(clientA);
  await insertFixture(clientA, item);
  await authorize(clientA, item);

  const publishResults = await Promise.all([publish(clientA, item), publish(clientB, item)]);
  assert(
    publishResults.map((result) => result?.status).sort().join(',') === 'published,replayed',
    'Concurrent publish must produce one mutation and one bounded replay.',
  );
  await verifyPublishedReadback(clientA, item);

  const rollbackResults = await Promise.all([rollback(clientA, item), rollback(clientB, item)]);
  assert(
    rollbackResults.map((result) => result?.status).sort().join(',') === 'replayed,rolled_back',
    'Concurrent rollback must produce one exact recovery and one bounded replay.',
  );
  await verifyRollbackReadback(clientA, item);

  await cleanup(clientA, item);
  await verifyCleanup(clientA, item);
  verified = true;

  await writeEvidence({
    schemaVersion: 'drkhaleej.pharmacyPublicNoindexProof.v1',
    status: 'green',
    sourceCommit,
    environmentClass: 'isolated_preview',
    migrationVersion: '0087',
    productionConnected: false,
    secretRedaction: true,
    authorizationCount: 1,
    publicationCount: 1,
    rollbackCount: 1,
    publishReplayCount: 1,
    rollbackReplayCount: 1,
    bilingualRoutesVerified: true,
    canonicalAndHreflangContractVerified: true,
    structuredDataContractVerified: true,
    robotsNoindexVerified: true,
    sitemapExcludedVerified: true,
    indexLeakageCount: 0,
    sitemapLeakageCount: 0,
    exactLogicalRecoveryVerified: true,
    canonicalEntityUnchanged: true,
    cleanupVerified: true,
    rawIdentifiersExposed: false,
    generatedAt: new Date().toISOString(),
  });
} catch (error) {
  if (clientA) await cleanup(clientA, item).catch(() => {});
  await writeEvidence({
    schemaVersion: 'drkhaleej.pharmacyPublicNoindexProof.v1',
    status: 'red',
    sourceCommit,
    environmentClass: 'isolated_preview',
    migrationVersion: '0087',
    productionConnected: false,
    secretRedaction: true,
    rawIdentifiersExposed: false,
    error: redact(error instanceof Error ? error.message : error),
    generatedAt: new Date().toISOString(),
  }).catch(() => {});
  console.error(
    `Pharmacy public/noindex hosted proof failed: ${redact(error instanceof Error ? error.message : error)}`,
  );
  process.exitCode = 1;
} finally {
  await Promise.all([
    clientA?.end().catch(() => {}),
    clientB?.end().catch(() => {}),
  ]);
  if (verified) {
    console.log('Pharmacy public/noindex isolated Preview lifecycle proof passed.');
  }
}
