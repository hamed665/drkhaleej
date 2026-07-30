#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import pg from 'pg';

const { Client } = pg;
const publicSchemaVersion = 'drkhaleej.import.pharmacyPublicNoindex.v1';
const indexSchemaVersion = 'drkhaleej.import.pharmacyIndexPromotion.v1';
const evidencePath =
  process.env.PHARMACY_INDEX_EVIDENCE_PATH ??
  'artifacts/pharmacy-index-promotion/proof.json';

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
  return [
    hex.slice(0, 8).join(''),
    hex.slice(8, 12).join(''),
    hex.slice(12, 16).join(''),
    hex.slice(16, 20).join(''),
    hex.slice(20, 32).join(''),
  ].join('-');
}

function redact(value) {
  return String(value)
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, '[REDACTED_DATABASE_URL]')
    .replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, '[REDACTED_ID]')
    .slice(0, 600);
}

function verifyPreviewIdentity(databaseUrl, previewRef, productionRef) {
  assert(previewRef !== productionRef, 'Preview and Production refs must differ.');
  const parsed = new URL(databaseUrl);
  assert(parsed.protocol === 'postgresql:', 'Index proof requires postgresql.');
  assert(parsed.port === '5432', 'Index proof requires Session pooler port 5432.');
  assert(
    parsed.hostname.endsWith('.pooler.supabase.com'),
    'Index proof requires the isolated Supabase Session pooler.',
  );
  assert(
    decodeURIComponent(parsed.username) === `postgres.${previewRef}`,
    'Database identity does not match the isolated Preview project.',
  );
  assert(!databaseUrl.includes(productionRef), 'Production identity appeared in Preview URL.');
}

function connectionConfig(databaseUrl, suffix) {
  return {
    connectionString: databaseUrl,
    application_name: `drkhaleej-pharmacy-index-${suffix}`,
    ssl: { rejectUnauthorized: false },
    keepAlive: true,
    statement_timeout: 45_000,
    query_timeout: 50_000,
    connectionTimeoutMillis: 15_000,
  };
}

function fixture(runId) {
  const seed = `pharmacy-index-promotion:${runId}`;
  const slug = `index-proof-${digest(seed).slice(0, 12)}`;
  return {
    actorId: deterministicUuid(`${seed}:actor`),
    entityId: deterministicUuid(`${seed}:entity`),
    batchId: deterministicUuid(`${seed}:batch`),
    rawRowId: deterministicUuid(`${seed}:raw-row`),
    candidateId: deterministicUuid(`${seed}:candidate`),
    slug,
    canonicalPathEn: `/en/om/pharmacies/${slug}`,
    canonicalPathAr: `/ar/om/pharmacies/${slug}`,
    publicIdempotencyKey: `public-index-${digest(`${seed}:public-key`).slice(0, 40)}`,
    publicRequestHash: digest(`${seed}:public-request`),
    indexIdempotencyKey: `index-${digest(`${seed}:index-key`).slice(0, 40)}`,
    indexRequestHash: digest(`${seed}:index-request`),
    candidatePayload: {
      projectionVersion: 'v1',
      identity: {
        primaryName: 'Preview Index Proof Pharmacy',
        nameEn: 'Preview Index Proof Pharmacy',
        nameAr: 'صيدلية إثبات فهرسة المعاينة',
        slugCandidate: slug,
      },
      contact: {
        phoneE164: '+96824000014',
        whatsappE164: null,
        email: null,
        websiteUrl: 'https://example.invalid/index-proof',
        googleMapsUrl: 'https://maps.example.invalid/index-proof',
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
        sourceName: 'Isolated Preview P14 proof',
        sourceUrl: 'https://example.invalid/source',
        lastCheckedAt: '2026-07-30T00:00:00.000Z',
      },
      quality: { score: 94, flags: [] },
    },
  };
}

async function writeEvidence(evidence) {
  await mkdir(path.dirname(evidencePath), { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
}

async function verifyMigration(client) {
  const ledger = await client.query(
    `select version::text as version
     from supabase_migrations.schema_migrations
     where version::text = '0089'`,
  );
  assert(ledger.rowCount === 1, 'Preview ledger must include exactly one 0089.');

  const rpcs = await client.query(
    `select
       p.oid::regprocedure::text as signature,
       not p.prosecdef as security_invoker,
       exists (
         select 1
         from unnest(coalesce(p.proconfig, '{}'::text[])) as setting
         where replace(setting, ' ', '') = 'search_path=pg_catalog,public'
       ) as search_path_pinned,
       has_function_privilege('service_role', p.oid, 'EXECUTE') as service_execute,
       has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute
     from pg_catalog.pg_proc p
     where p.oid in (
       to_regprocedure(
         'public.import_authorize_pharmacy_index_promotion(uuid,uuid,text,text,text,integer)'
       ),
       to_regprocedure(
         'public.import_promote_pharmacy_index_by_authority(uuid,uuid,uuid,text,text)'
       ),
       to_regprocedure(
         'public.import_rollback_pharmacy_index_by_authority(uuid,uuid,text)'
       )
     )
     order by signature`,
  );
  assert(
    rpcs.rowCount === 3 &&
      rpcs.rows.every(
        (rpc) =>
          rpc.security_invoker === true &&
          rpc.search_path_pinned === true &&
          rpc.service_execute === true &&
          rpc.anon_execute === false &&
          rpc.authenticated_execute === false,
      ),
    'P14 RPC privilege boundary drifted.',
  );

  const tables = await client.query(
    `select
       c.relname,
       c.relrowsecurity,
       (
         select count(*)::int
         from pg_catalog.pg_policy policy
         where policy.polrelid = c.oid
       ) as policy_count
     from pg_catalog.pg_class c
     join pg_catalog.pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname in (
         'import_pharmacy_index_authorizations',
         'import_pharmacy_index_events'
       )
     order by c.relname`,
  );
  assert(
    tables.rowCount === 2 &&
      tables.rows.every(
        (table) => table.relrowsecurity === true && table.policy_count === 0,
      ),
    'P14 authority tables must keep RLS and zero public policies.',
  );
}

async function cleanup(client, item) {
  await client.query('begin');
  try {
    await client.query(
      'delete from public.import_pharmacy_index_events where entity_id = $1',
      [item.entityId],
    );
    await client.query(
      'delete from public.import_pharmacy_index_authorizations where entity_id = $1',
      [item.entityId],
    );
    await client.query(
      'delete from public.import_pharmacy_public_noindex_events where entity_id = $1',
      [item.entityId],
    );
    await client.query(
      'delete from public.import_pharmacy_public_noindex_authorizations where entity_id = $1',
      [item.entityId],
    );
    await client.query(
      'delete from public.import_publish_queue where raw_row_id = $1 or target_entity_id = $2',
      [item.rawRowId, item.entityId],
    );
    await client.query(
      'delete from public.import_entity_candidates where id = $1',
      [item.candidateId],
    );
    await client.query('delete from public.import_raw_rows where id = $1', [
      item.rawRowId,
    ]);
    await client.query('delete from public.import_batches where id = $1', [
      item.batchId,
    ]);
    await client.query('delete from public.centers where id = $1', [
      item.entityId,
    ]);
    await client.query('delete from public.profiles where id = $1', [
      item.actorId,
    ]);
    await client.query('commit');
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
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
         $1, 'Pharmacy Index Proof Actor', 'Index Proof', 'en', 'om',
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
         $1, $2, 'Preview Index Proof Pharmacy',
         'صيدلية إثبات فهرسة المعاينة',
         'pharmacy', 'draft', 'unverified', '+96824000014', 'en', 'om',
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
         $1, $2, 'Pharmacy Index promotion proof', 'pharmacy', 'manual',
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
         'ready_for_publish', 94, 'https://example.invalid/source',
         date '2026-07-30', '{"isolatedPreviewProof":true}'::jsonb
       )`,
      [
        item.rawRowId,
        item.batchId,
        `proof-${item.slug}`,
        JSON.stringify(item.candidatePayload),
      ],
    );
    await client.query(
      `insert into public.import_entity_candidates (
         id, batch_id, raw_row_id, entity_type, candidate_payload,
         candidate_status, quality_score, review_note
       ) values (
         $1, $2, $3, 'pharmacy', $4::jsonb, 'approved', 94,
         'Approved only for the isolated Preview P14 proof.'
       )`,
      [
        item.candidateId,
        item.batchId,
        item.rawRowId,
        JSON.stringify(item.candidatePayload),
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
  assert(version.rowCount === 1, 'P14 fixture Pharmacy is missing.');
  item.expectedEntityVersion = version.rows[0].version;
}

async function publishPublicNoindex(client, item) {
  const authorized = await client.query(
    `select public.import_authorize_pharmacy_public_noindex(
       $1::uuid, $2::uuid, $3::uuid, $4::text, $5::text, $6::text,
       $7::text, $8::text, $9::text, $10::integer
     ) as result`,
    [
      item.actorId,
      item.entityId,
      item.candidateId,
      item.publicIdempotencyKey,
      item.publicRequestHash,
      item.expectedEntityVersion,
      item.canonicalPathEn,
      item.canonicalPathAr,
      publicSchemaVersion,
      24,
    ],
  );
  const authority = authorized.rows[0]?.result;
  assert(authority?.status === 'issued', 'P14 prerequisite P11 authority was not issued.');

  const published = await client.query(
    `select public.import_publish_pharmacy_public_noindex(
       $1::uuid, $2::uuid, $3::uuid, $4::text, $5::text
     ) as result`,
    [
      authority.authorizationId,
      item.actorId,
      item.entityId,
      item.publicRequestHash,
      publicSchemaVersion,
    ],
  );
  assert(
    published.rows[0]?.result?.status === 'published',
    'P14 prerequisite P11 authority was not published.',
  );
}

async function authorizeIndex(client, item) {
  const result = await client.query(
    `select public.import_authorize_pharmacy_index_promotion(
       $1::uuid, $2::uuid, $3::text, $4::text, $5::text, $6::integer
     ) as result`,
    [
      item.actorId,
      item.entityId,
      item.indexIdempotencyKey,
      item.indexRequestHash,
      indexSchemaVersion,
      24,
    ],
  );
  const authority = result.rows[0]?.result;
  assert(authority?.status === 'issued', 'P14 Index authority was not issued.');
  item.indexAuthorizationId = authority.authorizationId;
}

async function proveThinContentFailsClosed(client, item) {
  const candidate = await client.query(
    'select candidate_payload from public.import_entity_candidates where id = $1',
    [item.candidateId],
  );
  assert(candidate.rowCount === 1, 'P14 candidate content readback is missing.');
  await client.query(
    `update public.import_entity_candidates
     set candidate_payload = jsonb_set(candidate_payload, '{languages}', '[]'::jsonb)
     where id = $1`,
    [item.candidateId],
  );
  const blocked = await client.query(
    `select public.import_authorize_pharmacy_index_promotion(
       $1::uuid, $2::uuid, $3::text, $4::text, $5::text, $6::integer
     ) as result`,
    [
      item.actorId,
      item.entityId,
      item.indexIdempotencyKey,
      item.indexRequestHash,
      indexSchemaVersion,
      24,
    ],
  );
  assert(
    blocked.rows[0]?.result?.status === 'conflict' &&
      blocked.rows[0]?.result?.reason === 'index_candidate_content_ineligible' &&
      blocked.rows[0]?.result?.authorityConsumed === false,
    'Thin candidate content did not fail Index authorization closed.',
  );
  const writes = await client.query(
    `select
       (select count(*)::int
        from public.import_pharmacy_index_authorizations
        where entity_id = $1) as authorities,
       (select count(*)::int
        from public.import_pharmacy_index_events
        where entity_id = $1) as events`,
    [item.entityId],
  );
  assert(
    writes.rows[0]?.authorities === 0 && writes.rows[0]?.events === 0,
    'Thin content failure persisted Index authority or event state.',
  );
  await client.query(
    `update public.import_entity_candidates
     set candidate_payload = $2::jsonb
     where id = $1`,
    [item.candidateId, JSON.stringify(candidate.rows[0].candidate_payload)],
  );
}

async function promote(client, item) {
  const result = await client.query(
    `select public.import_promote_pharmacy_index_by_authority(
       $1::uuid, $2::uuid, $3::uuid, $4::text, $5::text
     ) as result`,
    [
      item.indexAuthorizationId,
      item.actorId,
      item.entityId,
      item.indexRequestHash,
      indexSchemaVersion,
    ],
  );
  return result.rows[0]?.result;
}

async function rollback(client, item) {
  const result = await client.query(
    `select public.import_rollback_pharmacy_index_by_authority(
       $1::uuid, $2::uuid, $3::text
     ) as result`,
    [item.actorId, item.entityId, indexSchemaVersion],
  );
  return result.rows[0]?.result;
}

async function readQueue(client, item) {
  const result = await client.query(
    `select *
     from public.import_publish_queue
     where target_entity_id = $1 and raw_row_id = $2`,
    [item.entityId, item.rawRowId],
  );
  assert(result.rowCount === 1, 'P14 Queue readback is not singular.');
  return result.rows[0];
}

async function provePromotionTamperFailsClosed(client, item) {
  const queue = await readQueue(client, item);
  await client.query(
    `update public.import_publish_queue
     set metadata = metadata || '{"sitemap_included":true}'::jsonb
     where id = $1`,
    [queue.id],
  );
  const blocked = await promote(client, item);
  assert(
    blocked?.status === 'conflict' &&
      blocked?.reason === 'index_prerequisite_queue_integrity_mismatch' &&
      blocked?.authorityConsumed === false,
    'Pre-promotion Queue tamper did not fail closed.',
  );
  const state = await client.query(
    `select
       a.status,
       count(e.id) filter (where e.event_type = 'index_promoted')::int
         as promotion_events
     from public.import_pharmacy_index_authorizations a
     left join public.import_pharmacy_index_events e on e.authorization_id = a.id
     where a.id = $1
     group by a.status`,
    [item.indexAuthorizationId],
  );
  assert(
    state.rows[0]?.status === 'issued' &&
      state.rows[0]?.promotion_events === 0,
    'Promotion tamper consumed authority or wrote an event.',
  );
  await client.query(
    'update public.import_publish_queue set metadata = $2::jsonb where id = $1',
    [queue.id, JSON.stringify(queue.metadata)],
  );
}

async function verifyPromoted(client, item) {
  const queue = await readQueue(client, item);
  assert(
    queue.publish_status === 'index_eligible' &&
      queue.index_policy === 'index_eligible' &&
      queue.sitemap_policy === 'excluded' &&
      queue.metadata?.robots_policy === 'index' &&
      queue.metadata?.index_promoted === true &&
      queue.metadata?.sitemap_included === false &&
      queue.metadata?.pharmacy_index_promotion_schema_version === indexSchemaVersion &&
      queue.metadata?.pharmacy_index_authorization_id === item.indexAuthorizationId &&
      queue.metadata?.canonical_path === item.canonicalPathEn &&
      queue.metadata?.canonical_paths?.ar === item.canonicalPathAr,
    'Promoted Queue readback crossed or missed the P14 boundary.',
  );

  const state = await client.query(
    `select
       a.status,
       a.terminal_result,
       a.terminal_result_hash,
       encode(extensions.digest(a.terminal_result::text, 'sha256'), 'hex')
         as computed_terminal_hash,
       p.status as public_status,
       c.status::text as center_status,
       c.is_active,
       count(e.id) filter (where e.event_type = 'index_promoted')::int
         as promotion_events
     from public.import_pharmacy_index_authorizations a
     join public.import_pharmacy_public_noindex_authorizations p
       on p.id = a.public_noindex_authorization_id
     join public.centers c on c.id = a.entity_id
     left join public.import_pharmacy_index_events e on e.authorization_id = a.id
     where a.id = $1
     group by a.id, p.status, c.status, c.is_active`,
    [item.indexAuthorizationId],
  );
  const row = state.rows[0];
  assert(
    row?.status === 'promoted' &&
      row.public_status === 'published' &&
      row.center_status === 'draft' &&
      row.is_active === false &&
      row.promotion_events === 1 &&
      row.terminal_result?.indexPolicy === 'index_eligible' &&
      row.terminal_result?.sitemapPolicy === 'excluded' &&
      row.terminal_result?.sitemapIncluded === false &&
      row.computed_terminal_hash === row.terminal_result_hash,
    'Promoted authority readback drifted.',
  );
}

async function proveRollbackTamperFailsClosed(client, item) {
  const queue = await readQueue(client, item);
  await client.query(
    `update public.import_publish_queue
     set metadata = metadata || '{"sitemap_included":true}'::jsonb
     where id = $1`,
    [queue.id],
  );
  const blocked = await rollback(client, item);
  assert(
    blocked?.status === 'conflict' &&
      blocked?.reason === 'index_promoted_queue_integrity_mismatch' &&
      blocked?.authorityConsumed === false,
    'Promoted Queue tamper did not fail rollback closed.',
  );
  const state = await client.query(
    `select
       a.status,
       count(e.id) filter (where e.event_type = 'index_rolled_back')::int
         as rollback_events
     from public.import_pharmacy_index_authorizations a
     left join public.import_pharmacy_index_events e on e.authorization_id = a.id
     where a.id = $1
     group by a.status`,
    [item.indexAuthorizationId],
  );
  assert(
    state.rows[0]?.status === 'promoted' &&
      state.rows[0]?.rollback_events === 0,
    'Rollback tamper consumed authority or wrote an event.',
  );
  await client.query(
    'update public.import_publish_queue set metadata = $2::jsonb where id = $1',
    [queue.id, JSON.stringify(queue.metadata)],
  );
}

async function verifyRolledBack(client, item) {
  const result = await client.query(
    `select
       a.status,
       a.snapshot_payload,
       a.snapshot_hash,
       encode(extensions.digest(a.snapshot_payload::text, 'sha256'), 'hex')
         as computed_snapshot_hash,
       a.terminal_result,
       a.terminal_result_hash,
       encode(extensions.digest(a.terminal_result::text, 'sha256'), 'hex')
         as computed_terminal_hash,
       p.status as public_status,
       count(e.id) filter (where e.event_type = 'index_rolled_back')::int
         as rollback_events
     from public.import_pharmacy_index_authorizations a
     join public.import_pharmacy_public_noindex_authorizations p
       on p.id = a.public_noindex_authorization_id
     left join public.import_pharmacy_index_events e on e.authorization_id = a.id
     where a.id = $1
     group by a.id, p.status`,
    [item.indexAuthorizationId],
  );
  const row = result.rows[0];
  assert(
    row?.status === 'rolled_back' &&
      row.public_status === 'published' &&
      row.rollback_events === 1 &&
      row.computed_snapshot_hash === row.snapshot_hash &&
      row.computed_terminal_hash === row.terminal_result_hash &&
      row.terminal_result?.visibility === 'public_noindex' &&
      row.terminal_result?.exactLogicalRecovery === true,
    'Rolled-back Index authority readback drifted.',
  );

  const queue = await readQueue(client, item);
  const snapshot = row.snapshot_payload?.queue;
  assert(
    queue.id === snapshot?.id &&
      queue.batch_id === snapshot.batchId &&
      queue.raw_row_id === snapshot.rawRowId &&
      queue.target_entity_type === snapshot.targetEntityType &&
      queue.target_entity_id === snapshot.targetEntityId &&
      queue.publish_status === snapshot.publishStatus &&
      queue.index_policy === snapshot.indexPolicy &&
      queue.sitemap_policy === snapshot.sitemapPolicy &&
      queue.quality_score === snapshot.qualityScore &&
      queue.admin_note === snapshot.adminNote &&
      JSON.stringify(queue.metadata) === JSON.stringify(snapshot.metadata) &&
      queue.publish_status === 'published_noindex' &&
      queue.index_policy === 'noindex' &&
      queue.sitemap_policy === 'excluded' &&
      queue.metadata?.robots_policy === 'noindex' &&
      queue.metadata?.index_promoted === false &&
      queue.metadata?.sitemap_included === false,
    'Index rollback did not restore the exact P11 public/noindex Queue.',
  );
}

async function verifyCleanup(client, item) {
  const result = await client.query(
    `select
       (select count(*)::int from public.import_pharmacy_index_events where entity_id = $1) as index_events,
       (select count(*)::int from public.import_pharmacy_index_authorizations where entity_id = $1) as index_authorities,
       (select count(*)::int from public.import_pharmacy_public_noindex_events where entity_id = $1) as public_events,
       (select count(*)::int from public.import_pharmacy_public_noindex_authorizations where entity_id = $1) as public_authorities,
       (select count(*)::int from public.import_publish_queue where raw_row_id = $2 or target_entity_id = $1) as queues,
       (select count(*)::int from public.import_entity_candidates where id = $3) as candidates,
       (select count(*)::int from public.import_raw_rows where id = $2) as raw_rows,
       (select count(*)::int from public.import_batches where id = $4) as batches,
       (select count(*)::int from public.centers where id = $1) as centers,
       (select count(*)::int from public.profiles where id = $5) as actors`,
    [item.entityId, item.rawRowId, item.candidateId, item.batchId, item.actorId],
  );
  assert(
    Object.values(result.rows[0]).every((count) => count === 0),
    'P14 cleanup left fixture rows.',
  );
}

const databaseUrl = required('PHARMACY_INDEX_PREVIEW_DATABASE_URL');
const previewRef = required('PHARMACY_INDEX_PREVIEW_PROJECT_REF');
const productionRef = required('PHARMACY_INDEX_PRODUCTION_PROJECT_REF');
const sourceCommit = required('PHARMACY_INDEX_SOURCE_COMMIT');
const runId = required('PHARMACY_INDEX_RUN_ID');
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
  await verifyMigration(clientA);
  await insertFixture(clientA, item);
  await publishPublicNoindex(clientA, item);
  await proveThinContentFailsClosed(clientA, item);
  await authorizeIndex(clientA, item);
  await provePromotionTamperFailsClosed(clientA, item);

  const promotionResults = await Promise.all([
    promote(clientA, item),
    promote(clientB, item),
  ]);
  assert(
    promotionResults
      .map((result) => result?.status)
      .sort()
      .join(',') === 'promoted,replayed',
    'Concurrent P14 promotion must produce one promotion and one replay.',
  );
  await verifyPromoted(clientA, item);
  await proveRollbackTamperFailsClosed(clientA, item);

  const rollbackResults = await Promise.all([
    rollback(clientA, item),
    rollback(clientB, item),
  ]);
  assert(
    rollbackResults
      .map((result) => result?.status)
      .sort()
      .join(',') === 'replayed,rolled_back',
    'Concurrent P14 rollback must produce one rollback and one replay.',
  );
  const persistedReplay = await rollback(clientA, item);
  assert(
    persistedReplay?.status === 'replayed' &&
      persistedReplay?.exactLogicalRecovery === true &&
      persistedReplay?.sitemapIncluded === false,
    'P14 persisted rollback replay did not use exact readback.',
  );
  await verifyRolledBack(clientA, item);
  await cleanup(clientA, item);
  await verifyCleanup(clientA, item);
  verified = true;

  await writeEvidence({
    schemaVersion: 'drkhaleej.pharmacyIndexPromotionProof.v1',
    status: 'green',
    sourceCommit,
    environmentClass: 'isolated_preview',
    migrationVersion: '0089',
    productionConnected: false,
    secretRedaction: true,
    publicNoindexPrerequisiteVerified: true,
    thinContentBlockedBeforeAuthorization: true,
    concurrentPromotionCount: 2,
    freshPromotionCount: 1,
    concurrentPromotionReplayCount: 1,
    promotionTamperBlockedBeforeConsumption: true,
    promotedReadbackVerified: true,
    robotsPolicyAfterPromotion: 'index',
    sitemapIncludedAfterPromotion: false,
    concurrentRollbackCount: 2,
    freshRollbackCount: 1,
    concurrentRollbackReplayCount: 1,
    persistedRollbackReplayCount: 1,
    rollbackTamperBlockedBeforeConsumption: true,
    exactPublicNoindexRecovery: true,
    indexEventCountPerAuthority: 3,
    rawIdentifiersExposed: false,
    cleanupVerified: true,
    generatedAt: new Date().toISOString(),
  });
} catch (error) {
  if (clientA) await cleanup(clientA, item).catch(() => {});
  await writeEvidence({
    schemaVersion: 'drkhaleej.pharmacyIndexPromotionProof.v1',
    status: 'red',
    sourceCommit,
    environmentClass: 'isolated_preview',
    migrationVersion: '0089',
    productionConnected: false,
    secretRedaction: true,
    rawIdentifiersExposed: false,
    error: redact(error instanceof Error ? error.message : error),
    generatedAt: new Date().toISOString(),
  }).catch(() => {});
  console.error(
    `Pharmacy Index promotion proof failed: ${redact(
      error instanceof Error ? error.message : error,
    )}`,
  );
  process.exitCode = 1;
} finally {
  await Promise.all([
    clientA?.end().catch(() => {}),
    clientB?.end().catch(() => {}),
  ]);
  if (verified) {
    console.log('Pharmacy Index promotion proof passed on isolated Preview.');
  }
}
