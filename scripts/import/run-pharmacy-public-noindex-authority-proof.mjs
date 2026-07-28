#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;
const evidencePath = path.resolve(
  process.env.PHARMACY_NOINDEX_AUTHORITY_EVIDENCE_PATH ||
    'artifacts/pharmacy-public-noindex-authority/proof.json',
);
const schemaVersion = 'drkhaleej.import.pharmacyPublicNoindex.v1';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function required(name) {
  const value = process.env[name]?.trim();
  assert(value, `${name} is required; the authority proof never skips.`);
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

function redact(value) {
  return String(value || '')
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, '[REDACTED_DATABASE_URL]')
    .replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi,
      '[REDACTED_ID]',
    )
    .slice(0, 1200);
}

function verifyPreviewIdentity(databaseUrl, previewRef, productionRef) {
  const parsed = new URL(databaseUrl);
  assert(
    ['postgres:', 'postgresql:'].includes(parsed.protocol),
    'Authority proof requires PostgreSQL.',
  );
  assert(
    previewRef && productionRef && previewRef !== productionRef,
    'Preview and Production refs must be present and different.',
  );
  assert(
    parsed.port === '5432',
    'Authority proof requires the isolated Preview Session pooler on port 5432.',
  );
  assert(
    parsed.hostname.endsWith('.pooler.supabase.com'),
    'Authority proof requires the isolated Supabase Session pooler.',
  );
  assert(
    decodeURIComponent(parsed.username) === `postgres.${previewRef}`,
    'Database identity does not match the isolated Preview project.',
  );
  assert(
    !databaseUrl.includes(productionRef),
    'Production ref appeared in the Preview database URL.',
  );
}

function connectionConfig(databaseUrl, suffix) {
  return {
    connectionString: databaseUrl,
    application_name: `drkhaleej-pharmacy-noindex-authority-${suffix}`,
    ssl: { rejectUnauthorized: false },
    keepAlive: true,
    statement_timeout: 45_000,
    query_timeout: 50_000,
    connectionTimeoutMillis: 15_000,
  };
}

function fixture(runId) {
  const seed = `pharmacy-public-noindex-authority:${runId}`;
  const slug = `noindex-authority-${digest(seed).slice(0, 12)}`;
  const candidatePayload = {
    projectionVersion: 'v1',
    identity: {
      primaryName: 'Preview Noindex Authority Pharmacy',
      nameEn: 'Preview Noindex Authority Pharmacy',
      nameAr: 'صيدلية معاينة لصلاحية عدم الفهرسة',
      slugCandidate: slug,
    },
    contact: {
      phoneE164: '+96824000011',
      whatsappE164: '+96894000011',
      email: 'noindex-authority@example.invalid',
      websiteUrl: 'https://example.invalid/noindex-authority',
      googleMapsUrl: 'https://maps.example.invalid/noindex-authority',
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
      sourceName: 'Isolated Preview authority proof',
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
    idempotencyKey: `public-noindex-authority-${digest(`${seed}:idempotency`).slice(0, 40)}`,
    requestHash: digest(`${seed}:request`),
    candidatePayload,
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

async function verifyMigrationAuthority(client) {
  const ledger = await client.query(
    `select version::text as version
     from supabase_migrations.schema_migrations
     where version::text = '0087'`,
  );
  assert(
    ledger.rowCount === 1,
    'Preview migration ledger does not include exactly one 0087.',
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
    'Authority tables must exist with RLS enabled and zero public policies.',
  );

  const expectedRpcs = [
    'public.import_authorize_pharmacy_public_noindex(uuid,uuid,uuid,text,text,text,text,text,text,integer)',
    'public.import_publish_pharmacy_public_noindex(uuid,uuid,uuid,text,text)',
  ];
  for (const identity of expectedRpcs) {
    const result = await client.query(
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
       where p.oid = to_regprocedure($1)`,
      [identity],
    );
    const rpc = result.rows[0];
    assert(
      result.rowCount === 1 &&
        rpc.security_invoker === true &&
        rpc.search_path_pinned === true &&
        rpc.service_execute === true &&
        rpc.anon_execute === false &&
        rpc.authenticated_execute === false,
      `Protected RPC boundary drifted: ${identity}`,
    );
  }

  const rollback = await client.query(
    `select to_regprocedure(
       'public.import_rollback_pharmacy_public_noindex_by_authority(uuid,uuid,text)'
     ) is null as absent`,
  );
  assert(
    rollback.rows[0]?.absent === true,
    'P11 must not install the independent rollback RPC.',
  );
}

async function insertFixture(client, item) {
  await client.query('begin');
  try {
    await client.query(
      `insert into public.profiles (
         id, full_name, display_name, locale, country, is_platform_admin,
         is_provider_user, is_patient_user, metadata
       ) values (
         $1, 'Pharmacy Noindex Authority Actor', 'Noindex Authority', 'en', 'om',
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
         $1, $2, 'Preview Noindex Authority Pharmacy',
         'صيدلية معاينة لصلاحية عدم الفهرسة',
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
         $1, $2, 'Pharmacy noindex authority proof', 'pharmacy', 'manual',
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
         $1, $2, $3, 'pharmacy', $4::jsonb, 'approved', 92,
         'Approved only for the isolated Preview P11 proof.'
       )`,
      [
        item.candidateId,
        item.batchId,
        item.rawRowId,
        JSON.stringify(item.candidatePayload),
      ],
    );
    await client.query(
      `insert into public.import_publish_queue (
         id, batch_id, raw_row_id, target_entity_type, target_entity_id,
         publish_status, index_policy, sitemap_policy, quality_score,
         admin_note, metadata
       ) values (
         $1, $2, $3, 'pharmacy', null, 'queued', 'noindex', 'excluded', 81,
         'Pre-authority isolated Preview fixture.',
         '{"fixture":"pharmacy-public-noindex-authority","state":"queued"}'::jsonb
       )`,
      [item.queueId, item.batchId, item.rawRowId],
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
  assert(version.rowCount === 1, 'Authority fixture Pharmacy is missing.');
  item.expectedEntityVersion = version.rows[0].version;
}

async function authorize(client, item) {
  const args = [
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
  ];
  const sql = `select public.import_authorize_pharmacy_public_noindex(
    $1::uuid, $2::uuid, $3::uuid, $4::text, $5::text, $6::text,
    $7::text, $8::text, $9::text, $10::integer
  ) as result`;
  const issued = (await client.query(sql, args)).rows[0]?.result;
  assert(issued?.status === 'issued', 'Authority was not issued.');
  assert(
    issued.authorizationId &&
      issued.snapshotHash &&
      issued.candidatePayloadHash,
    'Issued authority references are incomplete.',
  );
  item.authorizationId = issued.authorizationId;
  item.snapshotHash = issued.snapshotHash;

  const replayed = (await client.query(sql, args)).rows[0]?.result;
  assert(
    replayed?.status === 'replayed' &&
      replayed.authorizationId === item.authorizationId,
    'Authority replay was not bounded to the original identity.',
  );
}

async function publish(client, item) {
  const response = await client.query(
    `select public.import_publish_pharmacy_public_noindex(
       $1::uuid, $2::uuid, $3::uuid, $4::text, $5::text
     ) as result`,
    [
      item.authorizationId,
      item.actorId,
      item.entityId,
      item.requestHash,
      schemaVersion,
    ],
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
      `select status, is_active, is_featured, deleted_at,
              updated_at::text as version
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

  const authorityRow = authority.rows[0];
  assert(
    authority.rowCount === 1 &&
      authorityRow.status === 'published' &&
      authorityRow.candidate_id === item.candidateId &&
      authorityRow.published_queue_id === item.queueId &&
      authorityRow.snapshot_hash === item.snapshotHash &&
      authorityRow.snapshot_payload?.queuePresent === true,
    'Published authority identity or snapshot readback failed.',
  );
  assert(
    authorityRow.terminal_result?.visibility === 'authority_only' &&
      authorityRow.terminal_result?.indexPolicy === 'noindex' &&
      authorityRow.terminal_result?.sitemapPolicy === 'excluded' &&
      authorityRow.terminal_result?.publicRouteEnabled === false &&
      /^[a-f0-9]{64}$/.test(authorityRow.terminal_result_hash),
    'P11 terminal result crossed an independent release boundary.',
  );

  const published = queue.rows[0];
  assert(
    queue.rowCount === 1 &&
      published.target_entity_type === 'pharmacy' &&
      published.target_entity_id === item.entityId &&
      published.publish_status === 'published_noindex' &&
      published.index_policy === 'noindex' &&
      published.sitemap_policy === 'excluded',
    'Published Queue authority readback failed.',
  );
  assert(
    published.metadata?.robots_policy === 'noindex' &&
      published.metadata?.sitemap_included === false &&
      published.metadata?.index_promoted === false &&
      published.metadata?.public_route_enabled === false &&
      published.metadata?.canonical_paths?.en === item.canonicalPathEn &&
      published.metadata?.canonical_paths?.ar === item.canonicalPathAr,
    'Bilingual noindex authority metadata readback failed.',
  );
  assert(
    events.rows.length === 2 &&
      events.rows.filter((row) => row.event_type === 'authorization_issued')
        .length === 1 &&
      events.rows.filter(
        (row) => row.event_type === 'public_noindex_published',
      ).length === 1,
    'Authority audit history is incomplete or duplicated.',
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
    leakage.rows[0]?.index_leakage === 0 &&
      leakage.rows[0]?.sitemap_leakage === 0,
    'Index or Sitemap leakage detected.',
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
    [
      item.entityId,
      item.queueId,
      item.candidateId,
      item.rawRowId,
      item.batchId,
      item.actorId,
    ],
  );
  assert(
    Object.values(result.rows[0]).every((count) => count === 0),
    'Authority proof cleanup left fixture rows.',
  );
}

const databaseUrl = required('PHARMACY_NOINDEX_AUTHORITY_PREVIEW_DATABASE_URL');
const previewRef = required('PHARMACY_NOINDEX_AUTHORITY_PREVIEW_PROJECT_REF');
const productionRef = required(
  'PHARMACY_NOINDEX_AUTHORITY_PRODUCTION_PROJECT_REF',
);
const sourceCommit = required('PHARMACY_NOINDEX_AUTHORITY_SOURCE_COMMIT');
const runId = required('PHARMACY_NOINDEX_AUTHORITY_RUN_ID');
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
  await verifyMigrationAuthority(clientA);
  await insertFixture(clientA, item);
  await authorize(clientA, item);

  const publishResults = await Promise.all([
    publish(clientA, item),
    publish(clientB, item),
  ]);
  assert(
    publishResults
      .map((result) => result?.status)
      .sort()
      .join(',') === 'published,replayed',
    'Concurrent publish must produce one mutation and one bounded replay.',
  );
  await verifyPublishedReadback(clientA, item);

  await cleanup(clientA, item);
  await verifyCleanup(clientA, item);
  verified = true;

  await writeEvidence({
    schemaVersion: 'drkhaleej.pharmacyPublicNoindexAuthorityProof.v1',
    status: 'green',
    sourceCommit,
    environmentClass: 'isolated_preview',
    migrationVersion: '0087',
    productionConnected: false,
    secretRedaction: true,
    authorizationCount: 1,
    authorizationReplayCount: 1,
    publicationCount: 1,
    publicationReplayCount: 1,
    bilingualPathsBound: true,
    bilingualLiveRoutesVerified: false,
    publicRouteEnabled: false,
    rollbackInstalled: false,
    robotsNoindexVerified: true,
    sitemapExcludedVerified: true,
    indexLeakageCount: 0,
    sitemapLeakageCount: 0,
    canonicalEntityUnchanged: true,
    cleanupVerified: true,
    rawIdentifiersExposed: false,
    generatedAt: new Date().toISOString(),
  });
} catch (error) {
  if (clientA) await cleanup(clientA, item).catch(() => {});
  await writeEvidence({
    schemaVersion: 'drkhaleej.pharmacyPublicNoindexAuthorityProof.v1',
    status: 'red',
    sourceCommit,
    environmentClass: 'isolated_preview',
    migrationVersion: '0087',
    productionConnected: false,
    secretRedaction: true,
    publicRouteEnabled: false,
    rollbackInstalled: false,
    rawIdentifiersExposed: false,
    error: redact(error instanceof Error ? error.message : error),
    generatedAt: new Date().toISOString(),
  }).catch(() => {});
  console.error(
    `Pharmacy noindex authority proof failed: ${redact(
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
    console.log(
      'Pharmacy public/noindex authority proof passed on isolated Preview.',
    );
  }
}
