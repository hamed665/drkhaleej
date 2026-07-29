#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import pg from 'pg';

const { Client } = pg;
const schemaVersion = 'drkhaleej.import.pharmacyPublicNoindex.v1';
const evidencePath =
  process.env.PHARMACY_PUBLIC_ROLLBACK_EVIDENCE_PATH ??
  'artifacts/pharmacy-public-rollback/proof.json';

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
  assert(parsed.protocol === 'postgresql:', 'Preview database URL must use postgresql.');
  assert(parsed.port === '5432', 'Rollback proof requires Session pooler port 5432.');
  assert(
    parsed.hostname.endsWith('.pooler.supabase.com'),
    'Rollback proof requires the isolated Supabase Session pooler.',
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
    application_name: `drkhaleej-public-rollback-${suffix}`,
    ssl: { rejectUnauthorized: false },
    keepAlive: true,
    statement_timeout: 45_000,
    query_timeout: 50_000,
    connectionTimeoutMillis: 15_000,
  };
}

function fixture(runId, label, queueInitiallyPresent) {
  const seed = `pharmacy-public-rollback:${runId}:${label}`;
  const slug = `public-rollback-${digest(seed).slice(0, 12)}`;
  const candidatePayload = {
    projectionVersion: 'v1',
    identity: {
      primaryName: `Preview Public Rollback Pharmacy ${label}`,
      nameEn: `Preview Public Rollback Pharmacy ${label}`,
      nameAr: 'صيدلية معاينة لاسترجاع النشر',
      slugCandidate: slug,
    },
    contact: {
      phoneE164: '+96824000013',
      whatsappE164: '+96894000013',
      email: `public-rollback-${label}@example.invalid`,
      websiteUrl: 'https://example.invalid/public-rollback',
      googleMapsUrl: 'https://maps.example.invalid/public-rollback',
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
      sourceName: 'Isolated Preview P13 proof',
      sourceUrl: 'https://example.invalid/source',
      lastCheckedAt: '2026-07-29T00:00:00.000Z',
    },
    quality: { score: 93, flags: [] },
  };
  return {
    label,
    queueInitiallyPresent,
    actorId: deterministicUuid(`${seed}:actor`),
    entityId: deterministicUuid(`${seed}:entity`),
    batchId: deterministicUuid(`${seed}:batch`),
    rawRowId: deterministicUuid(`${seed}:raw-row`),
    candidateId: deterministicUuid(`${seed}:candidate`),
    initialQueueId: deterministicUuid(`${seed}:queue`),
    slug,
    canonicalPathEn: `/en/om/pharmacies/${slug}`,
    canonicalPathAr: `/ar/om/pharmacies/${slug}`,
    idempotencyKey: `public-rollback-${digest(`${seed}:idempotency`).slice(0, 40)}`,
    requestHash: digest(`${seed}:request`),
    candidatePayload,
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
     where version::text = '0088'`,
  );
  assert(ledger.rowCount === 1, 'Preview ledger must include exactly one 0088.');

  const rpc = await client.query(
    `select
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
     where p.oid = to_regprocedure(
       'public.import_rollback_pharmacy_public_noindex_by_authority(uuid,uuid,text)'
     )`,
  );
  const boundary = rpc.rows[0];
  assert(
    rpc.rowCount === 1 &&
      boundary.security_invoker === true &&
      boundary.search_path_pinned === true &&
      boundary.service_execute === true &&
      boundary.anon_execute === false &&
      boundary.authenticated_execute === false,
    'P13 rollback RPC privilege boundary drifted.',
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
         'import_pharmacy_public_noindex_authorizations',
         'import_pharmacy_public_noindex_events'
       )
     order by c.relname`,
  );
  assert(
    tables.rowCount === 2 &&
      tables.rows.every(
        (table) => table.relrowsecurity === true && table.policy_count === 0,
      ),
    'P13 authority tables must keep RLS and zero public policies.',
  );
}

async function cleanup(client, item) {
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
      `delete from public.import_publish_queue
       where raw_row_id = $1 or target_entity_id = $2 or id = $3`,
      [item.rawRowId, item.entityId, item.initialQueueId],
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
         $1, 'Pharmacy Public Rollback Actor', 'Public Rollback', 'en', 'om',
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
         $1, $2, 'Preview Public Rollback Pharmacy',
         'صيدلية معاينة لاسترجاع النشر',
         'pharmacy', 'draft', 'unverified', '+96824000013', 'en', 'om',
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
         $1, $2, 'Pharmacy public rollback proof', 'pharmacy', 'manual',
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
         'ready_for_publish', 93, 'https://example.invalid/source',
         date '2026-07-29', '{"isolatedPreviewProof":true}'::jsonb
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
         $1, $2, $3, 'pharmacy', $4::jsonb, 'approved', 93,
         'Approved only for the isolated Preview P13 proof.'
       )`,
      [
        item.candidateId,
        item.batchId,
        item.rawRowId,
        JSON.stringify(item.candidatePayload),
      ],
    );
    if (item.queueInitiallyPresent) {
      await client.query(
        `insert into public.import_publish_queue (
           id, batch_id, raw_row_id, target_entity_type, target_entity_id,
           publish_status, index_policy, sitemap_policy, quality_score,
           admin_note, metadata
         ) values (
           $1, $2, $3, 'pharmacy', null, 'queued', 'noindex', 'excluded', 77,
           'Exact pre-public Queue snapshot.',
           '{"fixture":"pharmacy-public-rollback","state":"queued","nested":{"preserve":true}}'::jsonb
         )`,
        [item.initialQueueId, item.batchId, item.rawRowId],
      );
    }
    await client.query('commit');
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  }

  const version = await client.query(
    'select updated_at::text as version from public.centers where id = $1',
    [item.entityId],
  );
  assert(version.rowCount === 1, 'P13 fixture Pharmacy is missing.');
  item.expectedEntityVersion = version.rows[0].version;
}

async function authorizeAndPublish(client, item) {
  const authorized = await client.query(
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
  const authority = authorized.rows[0]?.result;
  assert(authority?.status === 'issued', 'P13 prerequisite authority was not issued.');

  const published = await client.query(
    `select public.import_publish_pharmacy_public_noindex(
       $1::uuid, $2::uuid, $3::uuid, $4::text, $5::text
     ) as result`,
    [
      authority.authorizationId,
      item.actorId,
      item.entityId,
      item.requestHash,
      schemaVersion,
    ],
  );
  assert(
    published.rows[0]?.result?.status === 'published',
    'P13 prerequisite authority was not published.',
  );
}

async function readPublishedQueue(client, item) {
  const result = await client.query(
    `select q.*
     from public.import_publish_queue q
     join public.import_pharmacy_public_noindex_authorizations a
       on a.published_queue_id = q.id
     where a.actor_profile_id = $1
       and a.entity_id = $2
       and a.status = 'published'`,
    [item.actorId, item.entityId],
  );
  assert(result.rowCount === 1, 'Published P13 Queue readback is not singular.');
  return result.rows[0];
}

async function rollback(client, item) {
  const result = await client.query(
    `select public.import_rollback_pharmacy_public_noindex_by_authority(
       $1::uuid, $2::uuid, $3::text
     ) as result`,
    [item.actorId, item.entityId, schemaVersion],
  );
  return result.rows[0]?.result;
}

async function proveTamperFailsClosed(client, item) {
  const published = await readPublishedQueue(client, item);
  await client.query(
    `update public.import_publish_queue
     set metadata = metadata || '{"tampered":true}'::jsonb
     where id = $1`,
    [published.id],
  );
  const blocked = await rollback(client, item);
  assert(
    blocked?.status === 'conflict' &&
      blocked?.reason === 'published_queue_integrity_mismatch' &&
      blocked?.authorityConsumed === false,
    'Tampered published Queue did not fail closed.',
  );
  const unchanged = await client.query(
    `select
       a.status,
       count(e.id) filter (
         where e.event_type = 'public_noindex_rolled_back'
       )::int as rollback_events
     from public.import_pharmacy_public_noindex_authorizations a
     left join public.import_pharmacy_public_noindex_events e
       on e.authorization_id = a.id
     where a.actor_profile_id = $1 and a.entity_id = $2
     group by a.status`,
    [item.actorId, item.entityId],
  );
  assert(
    unchanged.rows[0]?.status === 'published' &&
      unchanged.rows[0]?.rollback_events === 0,
    'Tamper failure consumed authority or wrote rollback audit.',
  );
  await client.query(
    'update public.import_publish_queue set metadata = $2::jsonb where id = $1',
    [published.id, JSON.stringify(published.metadata)],
  );
}

async function verifyRolledBack(client, item) {
  const authority = await client.query(
    `select
       status, published_queue_id, snapshot_payload, snapshot_hash,
       encode(extensions.digest(snapshot_payload::text, 'sha256'), 'hex')
         as computed_snapshot_hash,
       terminal_result, terminal_result_hash, rolled_back_at
     from public.import_pharmacy_public_noindex_authorizations
     where actor_profile_id = $1 and entity_id = $2`,
    [item.actorId, item.entityId],
  );
  assert(authority.rowCount === 1, 'Rolled-back authority readback is not singular.');
  const row = authority.rows[0];
  assert(
    row.status === 'rolled_back' &&
      row.rolled_back_at &&
      row.terminal_result?.visibility === 'private' &&
      row.terminal_result?.indexPolicy === 'noindex' &&
      row.terminal_result?.sitemapPolicy === 'excluded' &&
      row.terminal_result?.exactLogicalRecovery === true &&
      /^[a-f0-9]{64}$/.test(row.terminal_result_hash),
    'Rolled-back authority terminal readback failed.',
  );
  assert(
    row.computed_snapshot_hash === row.snapshot_hash,
    'Persisted Queue snapshot hash drifted.',
  );

  const events = await client.query(
    `select event_type, outcome
     from public.import_pharmacy_public_noindex_events
     where entity_id = $1
     order by created_at, id`,
    [item.entityId],
  );
  assert(
    events.rows.length === 3 &&
      events.rows.filter(
        (event) => event.event_type === 'public_noindex_rolled_back',
      ).length === 1,
    'Rollback event is missing or duplicated.',
  );

  const queue = await client.query(
    `select *
     from public.import_publish_queue
     where raw_row_id = $1 or target_entity_id = $2`,
    [item.rawRowId, item.entityId],
  );
  if (item.queueInitiallyPresent) {
    const restored = queue.rows[0];
    const snapshot = row.snapshot_payload?.queue;
    assert(
      queue.rowCount === 1 &&
        restored.id === snapshot.id &&
        restored.batch_id === snapshot.batchId &&
        restored.raw_row_id === snapshot.rawRowId &&
        restored.target_entity_type === snapshot.targetEntityType &&
        restored.target_entity_id === snapshot.targetEntityId &&
        restored.publish_status === snapshot.publishStatus &&
        restored.index_policy === snapshot.indexPolicy &&
        restored.sitemap_policy === snapshot.sitemapPolicy &&
        restored.quality_score === snapshot.qualityScore &&
        restored.admin_note === snapshot.adminNote &&
        JSON.stringify(restored.metadata) === JSON.stringify(snapshot.metadata),
      'Existing Queue was not restored exactly.',
    );
  } else {
    assert(
      queue.rowCount === 0 && row.published_queue_id === null,
      'P11-created Queue was not removed exactly.',
    );
  }

  const exposure = await client.query(
    `select
       count(*) filter (where a.status = 'published')::int as published_authorities,
       count(*) filter (where q.index_policy = 'index')::int as index_leakage,
       count(*) filter (where q.sitemap_policy = 'included')::int as sitemap_leakage
     from public.import_pharmacy_public_noindex_authorizations a
     left join public.import_publish_queue q on q.target_entity_id = a.entity_id
     where a.entity_id = $1`,
    [item.entityId],
  );
  assert(
    exposure.rows[0]?.published_authorities === 0 &&
      exposure.rows[0]?.index_leakage === 0 &&
      exposure.rows[0]?.sitemap_leakage === 0,
    'Rollback left public, Index or Sitemap authority.',
  );
}

async function verifyCleanup(client, items) {
  for (const item of items) {
    const result = await client.query(
      `select
         (select count(*)::int from public.import_pharmacy_public_noindex_events where entity_id = $1) as events,
         (select count(*)::int from public.import_pharmacy_public_noindex_authorizations where entity_id = $1) as authorities,
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
      'P13 cleanup left fixture rows.',
    );
  }
}

const databaseUrl = required('PHARMACY_PUBLIC_ROLLBACK_PREVIEW_DATABASE_URL');
const previewRef = required('PHARMACY_PUBLIC_ROLLBACK_PREVIEW_PROJECT_REF');
const productionRef = required('PHARMACY_PUBLIC_ROLLBACK_PRODUCTION_PROJECT_REF');
const sourceCommit = required('PHARMACY_PUBLIC_ROLLBACK_SOURCE_COMMIT');
const runId = required('PHARMACY_PUBLIC_ROLLBACK_RUN_ID');
const items = [
  fixture(runId, 'existing-queue', true),
  fixture(runId, 'created-queue', false),
];
let clientA;
let clientB;
let verified = false;

try {
  verifyPreviewIdentity(databaseUrl, previewRef, productionRef);
  clientA = new Client(connectionConfig(databaseUrl, 'a'));
  clientB = new Client(connectionConfig(databaseUrl, 'b'));
  await Promise.all([clientA.connect(), clientB.connect()]);
  for (const item of items) await cleanup(clientA, item).catch(() => {});
  await verifyMigration(clientA);

  for (const item of items) {
    await insertFixture(clientA, item);
    await authorizeAndPublish(clientA, item);
    if (!item.queueInitiallyPresent) await proveTamperFailsClosed(clientA, item);

    const results = await Promise.all([
      rollback(clientA, item),
      rollback(clientB, item),
    ]);
    assert(
      results
        .map((result) => result?.status)
        .sort()
        .join(',') === 'replayed,rolled_back',
      'Concurrent P13 rollback must produce one exact rollback and one replay.',
    );
    const replay = await rollback(clientA, item);
    assert(
      replay?.status === 'replayed' &&
        replay?.exactLogicalRecovery === true &&
        replay?.authorityConsumed === true,
      'Post-rollback replay did not use persisted exact readback.',
    );
    await verifyRolledBack(clientA, item);
  }

  for (const item of items) await cleanup(clientA, item);
  await verifyCleanup(clientA, items);
  verified = true;

  await writeEvidence({
    schemaVersion: 'drkhaleej.pharmacyPublicRollbackProof.v1',
    status: 'green',
    sourceCommit,
    environmentClass: 'isolated_preview',
    migrationVersion: '0088',
    productionConnected: false,
    secretRedaction: true,
    scenarioCount: 2,
    existingQueueRestoredExactly: true,
    createdQueueRemovedExactly: true,
    concurrentRollbackCount: 2,
    freshRollbackCount: 2,
    concurrentReplayCount: 2,
    persistedReplayCount: 2,
    tamperBlockedBeforeConsumption: true,
    rollbackEventCountPerAuthority: 1,
    publicAuthorityCountAfterRollback: 0,
    indexLeakageCount: 0,
    sitemapLeakageCount: 0,
    rawIdentifiersExposed: false,
    cleanupVerified: true,
    generatedAt: new Date().toISOString(),
  });
} catch (error) {
  if (clientA) {
    for (const item of items) await cleanup(clientA, item).catch(() => {});
  }
  await writeEvidence({
    schemaVersion: 'drkhaleej.pharmacyPublicRollbackProof.v1',
    status: 'red',
    sourceCommit,
    environmentClass: 'isolated_preview',
    migrationVersion: '0088',
    productionConnected: false,
    secretRedaction: true,
    rawIdentifiersExposed: false,
    error: redact(error instanceof Error ? error.message : error),
    generatedAt: new Date().toISOString(),
  }).catch(() => {});
  console.error(
    `Pharmacy public rollback proof failed: ${redact(
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
    console.log('Pharmacy public rollback proof passed on isolated Preview.');
  }
}
