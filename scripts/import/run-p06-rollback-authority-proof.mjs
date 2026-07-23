#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;
const root = process.cwd();
const evidencePath = path.resolve(
  root,
  process.env.P06_EVIDENCE_PATH || 'artifacts/p06/rollback-authority-proof.json',
);
const auditSchemaVersion = 'drkhaleej.import.publishAudit.v4';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required; P06 never skips isolated Preview proof.`);
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
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
}

function snapshotHash(value) {
  return digest(JSON.stringify(canonicalize(value)));
}

function redact(value) {
  return String(value || '')
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, '[REDACTED_DATABASE_URL]')
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, '[REDACTED_ID]')
    .slice(0, 1200);
}

function verifyPreviewIdentity(connectionString, previewRef, productionRef) {
  const parsed = new URL(connectionString);
  assert(['postgres:', 'postgresql:'].includes(parsed.protocol), 'P06 database URL must use PostgreSQL.');
  assert(previewRef && productionRef && previewRef !== productionRef, 'Preview and Production project refs must be present and different.');
  assert(parsed.port === '5432', 'P06 requires Session pooler port 5432.');
  assert(parsed.hostname.endsWith('.pooler.supabase.com'), 'P06 requires the isolated Supabase Session pooler host.');
  assert(decodeURIComponent(parsed.username) === `postgres.${previewRef}`, 'P06 database identity does not match the configured Preview project.');
  assert(!connectionString.includes(productionRef), 'Production project ref must not appear in the P06 database URL.');
}

function connectionConfig(connectionString, applicationName) {
  return {
    connectionString,
    application_name: applicationName,
    ssl: { rejectUnauthorized: false },
    keepAlive: true,
    statement_timeout: 45_000,
    query_timeout: 50_000,
    connectionTimeoutMillis: 15_000,
  };
}

function fixture(runId, suffix, conflict = false) {
  const seed = `p06:${runId}:${suffix}`;
  return {
    actorId: deterministicUuid(`${seed}:actor`),
    entityId: deterministicUuid(`${seed}:entity`),
    reservationId: deterministicUuid(`${seed}:reservation`),
    snapshotId: deterministicUuid(`${seed}:snapshot`),
    referenceId: deterministicUuid(`${seed}:reference`),
    idempotencyKey: `p06-${digest(`${seed}:idempotency`).slice(0, 32)}`,
    requestHash: digest(`${seed}:request`),
    tokenHash: digest(`${seed}:server-only-reference`),
    conflict,
  };
}

function originalSnapshot(item) {
  return {
    visibility: 'private',
    indexPolicy: 'noindex',
    sitemapPolicy: 'excluded',
    publishStatus: 'private_published',
    publicReady: false,
    projectionVersion: 'p06-original-v1',
    canonicalRoute: `/en/om/pharmacies/p06-original-${digest(item.entityId).slice(0, 12)}`,
    center: {
      id: item.entityId,
      centerType: 'pharmacy',
      slug: `p06-original-${digest(item.entityId).slice(0, 12)}`,
      nameEn: 'P06 Original Pharmacy',
      nameAr: null,
      legalName: 'P06 Original Pharmacy LLC',
      status: 'draft',
      verificationStatus: 'unverified',
      primaryPhone: '+96824000010',
      secondaryPhone: null,
      whatsappPhone: '+96894000010',
      email: 'p06-original@example.invalid',
      websiteUrl: 'https://example.invalid/p06-original',
      logoUrl: null,
      coverImageUrl: null,
      shortDescriptionEn: null,
      shortDescriptionAr: null,
      descriptionEn: 'P06 original rollback state.',
      descriptionAr: null,
      defaultLocale: 'en',
      defaultCountry: 'om',
      isActive: false,
      isClaimable: false,
      isFeatured: false,
      sortOrder: 0,
      metadata: {
        source: 'p06-hosted-proof',
        canonicalGeo: {
          country_code: 'om',
          governorate_id: 'muscat',
          city_id: 'muscat',
          area_id: 'bausher',
          latitude: 23.565,
          longitude: 58.42,
          geo_confidence_score: 100,
          geo_source: 'manual_verified',
          geo_resolution_status: 'manually_verified',
          geo_validated: true,
        },
        projectionVersion: 'p06-original-v1',
        visibility: 'private',
        publicRouteEnabled: false,
        indexable: false,
        sitemapEligible: false,
      },
      deletedAt: null,
    },
  };
}

async function verifyMigrationAndRpc(client) {
  const ledger = await client.query(
    `select version::text as version
     from supabase_migrations.schema_migrations
     where version = '0084'`,
  );
  assert(ledger.rowCount === 1, 'Preview migration ledger does not include 0084.');

  const rpc = await client.query(
    `select pg_get_functiondef(
       to_regprocedure('public.import_rollback_pharmacy_private_by_authority(uuid,uuid,text)')
     ) as definition`,
  );
  const definition = rpc.rows[0]?.definition;
  assert(typeof definition === 'string' && definition.length > 0, 'P06 atomic rollback authority RPC is missing.');
  const normalized = definition.toLowerCase();
  for (const token of [
    'import_pharmacy_publish_references',
    'for update',
    'import_rollback_pharmacy_private',
    'consumed_result_hash',
    'rollback_authority_atomic_consume_failed',
    "'status', 'replayed'",
    "'rawreferenceexposed', false",
    auditSchemaVersion,
  ]) assert(normalized.includes(token.toLowerCase()), `P06 RPC is missing required token: ${token}.`);
}

async function insertFixture(client, item) {
  const snapshot = originalSnapshot(item);
  const hash = snapshotHash(snapshot);
  item.snapshot = snapshot;
  item.snapshotHash = hash;

  await client.query('begin');
  try {
    await client.query(
      `insert into public.profiles (
         id, full_name, display_name, locale, country, is_platform_admin,
         is_provider_user, is_patient_user, metadata
       ) values ($1, 'P06 Hosted Proof Actor', 'P06 Proof', 'en', 'om', true, false, false, $2::jsonb)`,
      [item.actorId, JSON.stringify({ p06HostedProof: true })],
    );
    await client.query(
      `insert into public.centers (
         id, slug, name_en, legal_name, center_type, status, verification_status,
         primary_phone, whatsapp_phone, email, website_url, description_en,
         default_locale, default_country, is_active, is_claimable, is_featured,
         sort_order, metadata
       ) values (
         $1, $2, 'P06 Original Pharmacy', 'P06 Original Pharmacy LLC',
         'pharmacy', 'draft', 'unverified', '+96824000010', '+96894000010',
         'p06-original@example.invalid', 'https://example.invalid/p06-original',
         'P06 original rollback state.', 'en', 'om', false, false, false, 0, $3::jsonb
       )`,
      [item.entityId, snapshot.center.slug, JSON.stringify(snapshot.center.metadata)],
    );
    const original = await client.query(
      `select updated_at::text as updated_at from public.centers where id = $1`,
      [item.entityId],
    );
    item.originalVersion = original.rows[0]?.updated_at;
    assert(typeof item.originalVersion === 'string', 'P06 original version was not captured.');

    const mutated = await client.query(
      `update public.centers
       set name_en = 'P06 Mutated Pharmacy',
           legal_name = 'P06 Mutated Pharmacy LLC',
           slug = $2,
           primary_phone = '+96824000011',
           whatsapp_phone = '+96894000011',
           email = 'p06-mutated@example.invalid',
           website_url = 'https://example.invalid/p06-mutated',
           description_en = 'P06 mutated private state awaiting rollback.',
           metadata = metadata || $3::jsonb,
           status = 'draft', is_active = false, is_featured = false
       where id = $1
       returning updated_at::text as updated_at`,
      [
        item.entityId,
        `p06-mutated-${digest(item.entityId).slice(0, 12)}`,
        JSON.stringify({ projectionVersion: 'p06-mutated-v1', visibility: 'private', publicRouteEnabled: false, indexable: false, sitemapEligible: false }),
      ],
    );
    item.currentVersion = mutated.rows[0]?.updated_at;
    assert(typeof item.currentVersion === 'string', 'P06 mutated version was not captured.');

    const authorityVersion = item.conflict ? 'p06-stale-version' : item.currentVersion;
    await client.query(
      `insert into public.import_publish_idempotency_records (
         id, idempotency_key, entity_id, actor_profile_id, expected_version,
         request_hash, status, terminal_result, created_at, updated_at, expires_at
       ) values (
         $1, $2, $3, $4, $5, $6, 'succeeded', $7::jsonb,
         clock_timestamp() - interval '2 minutes', clock_timestamp() - interval '1 minute',
         clock_timestamp() + interval '2 hours'
       )`,
      [
        item.reservationId,
        item.idempotencyKey,
        item.entityId,
        item.actorId,
        item.originalVersion,
        item.requestHash,
        JSON.stringify({
          kind: 'mutated',
          entityId: item.entityId,
          actualVersion: authorityVersion,
          visibility: 'private',
          publicRouteEnabled: false,
          indexable: false,
          sitemapEligible: false,
        }),
      ],
    );
    await client.query(
      `insert into public.import_publish_rollback_snapshots (
         id, entity_id, actor_profile_id, idempotency_record_id, expected_version,
         snapshot_payload, snapshot_hash, created_at, expires_at
       ) values (
         $1, $2, $3, $4, $5, $6::jsonb, $7,
         clock_timestamp() - interval '2 minutes', clock_timestamp() + interval '30 days'
       )`,
      [item.snapshotId, item.entityId, item.actorId, item.reservationId, item.originalVersion, JSON.stringify(snapshot), hash],
    );
    await client.query(
      `insert into public.import_pharmacy_publish_references (
         id, token_hash, actor_profile_id, entity_id, idempotency_record_id,
         rollback_snapshot_id, expected_current_version, expected_snapshot_hash,
         expires_at, created_at
       ) values (
         $1, $2, $3, $4, $5, $6, $7, $8,
         clock_timestamp() + interval '30 days', clock_timestamp() - interval '1 minute'
       )`,
      [item.referenceId, item.tokenHash, item.actorId, item.entityId, item.reservationId, item.snapshotId, authorityVersion, hash],
    );
    await client.query('commit');
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  }
}

async function invokeRollback(client, item) {
  const response = await client.query(
    `select public.import_rollback_pharmacy_private_by_authority(
       $1::uuid, $2::uuid, $3::text
     ) as result`,
    [item.entityId, item.actorId, auditSchemaVersion],
  );
  return response.rows[0]?.result;
}

async function verifySuccessfulFixture(client, item, results) {
  const statuses = results.map((result) => result?.status).sort();
  assert(JSON.stringify(statuses) === JSON.stringify(['replayed', 'rolled_back']), 'P06 concurrent rollback did not yield exactly one fresh rollback and one replay.');
  for (const result of results) {
    assert(result?.authorityConsumed === true, 'P06 successful result did not confirm authority consumption.');
    assert(result?.privateBoundaryVerified === true, 'P06 successful result did not confirm the private boundary.');
    assert(result?.rawReferenceExposed === false, 'P06 successful result exposed a raw reference.');
  }

  const [reference, snapshot, reservation, audits, entity, exposure] = await Promise.all([
    client.query(
      `select count(*)::int as count, min(consumed_at) as consumed_at,
              min(consumed_by_profile_id::text) as consumed_by,
              min(consumed_result::text) as consumed_result,
              min(consumed_result_hash) as consumed_result_hash,
              min(encode(extensions.digest(consumed_result::text, 'sha256'), 'hex')) as recomputed_hash
       from public.import_pharmacy_publish_references
       where id = $1 and actor_profile_id = $2 and entity_id = $3`,
      [item.referenceId, item.actorId, item.entityId],
    ),
    client.query(
      `select count(*)::int as count, min(restored_at) as restored_at,
              min(restored_by_profile_id::text) as restored_by
       from public.import_publish_rollback_snapshots
       where id = $1 and idempotency_record_id = $2`,
      [item.snapshotId, item.reservationId],
    ),
    client.query(
      `select count(*)::int as count, min(status) as status, min(terminal_result::text) as terminal_result
       from public.import_publish_idempotency_records
       where id = $1 and actor_profile_id = $2 and entity_id = $3`,
      [item.reservationId, item.actorId, item.entityId],
    ),
    client.query(
      `select count(*)::int as count
       from public.import_publish_audit_events
       where idempotency_record_id = $1 and actor_profile_id = $2 and entity_id = $3
         and event_type = 'rollback_succeeded' and outcome = 'rolled_back'
         and schema_version = $4`,
      [item.reservationId, item.actorId, item.entityId, auditSchemaVersion],
    ),
    client.query(
      `select id, center_type, slug, name_en, legal_name, status, verification_status,
              primary_phone, whatsapp_phone, email, website_url, description_en,
              default_locale, default_country, is_active, is_claimable, is_featured,
              sort_order, metadata, deleted_at, updated_at::text as updated_at
       from public.centers where id = $1`,
      [item.entityId],
    ),
    client.query(
      `select count(*)::int as count
       from public.import_publish_queue
       where target_entity_type = 'pharmacy'
         and publish_status = 'index_eligible'
         and index_policy = 'index'
         and sitemap_policy = 'included'
         and metadata ->> 'canonical_path' = $1`,
      [item.snapshot.canonicalRoute],
    ),
  ]);

  const referenceRow = reference.rows[0];
  assert(referenceRow?.count === 1, 'P06 durable authority count is not exactly one.');
  assert(referenceRow.consumed_at, 'P06 durable authority was not consumed.');
  assert(referenceRow.consumed_by === item.actorId, 'P06 authority consumer identity mismatch.');
  assert(referenceRow.consumed_result_hash === referenceRow.recomputed_hash, 'P06 consumed result hash mismatch.');
  const consumedResult = JSON.parse(referenceRow.consumed_result);
  assert(consumedResult.kind === 'rolled_back' && consumedResult.rawReferenceExposed === false, 'P06 bounded consumed result is invalid.');

  assert(snapshot.rows[0]?.count === 1 && snapshot.rows[0]?.restored_at, 'P06 snapshot was not restored exactly once.');
  assert(snapshot.rows[0]?.restored_by === item.actorId, 'P06 snapshot restorer identity mismatch.');
  assert(reservation.rows[0]?.count === 1 && reservation.rows[0]?.status === 'rolled_back', 'P06 terminal Reservation state is invalid.');
  const terminal = JSON.parse(reservation.rows[0].terminal_result);
  assert(terminal.kind === 'rolled_back' && terminal.visibility === 'private', 'P06 terminal rollback result is invalid.');
  assert(audits.rows[0]?.count === 1, 'P06 rollback success audit count is not exactly one.');
  assert(exposure.rows[0]?.count === 0, 'P06 rollback leaked into a public queue boundary.');

  assert(entity.rowCount === 1, 'P06 restored Pharmacy entity is missing.');
  const restored = entity.rows[0];
  const original = item.snapshot.center;
  assert(restored.id === item.entityId && restored.center_type === 'pharmacy', 'P06 restored entity identity mismatch.');
  assert(
    restored.slug === original.slug &&
      restored.name_en === original.nameEn &&
      restored.legal_name === original.legalName &&
      restored.primary_phone === original.primaryPhone &&
      restored.whatsapp_phone === original.whatsappPhone &&
      restored.email === original.email &&
      restored.website_url === original.websiteUrl &&
      restored.description_en === original.descriptionEn,
    'P06 rollback did not restore the protected snapshot fields.',
  );
  assert(
    restored.status === 'draft' &&
      restored.is_active === false &&
      restored.is_featured === false &&
      restored.deleted_at === null &&
      restored.metadata?.visibility === 'private' &&
      restored.metadata?.publicRouteEnabled === false &&
      restored.metadata?.indexable === false &&
      restored.metadata?.sitemapEligible === false,
    'P06 rollback violated the private boundary.',
  );

  return {
    referenceCount: referenceRow.count,
    rollbackAuditCount: audits.rows[0].count,
    publicExposureCount: exposure.rows[0].count,
    actualVersion: restored.updated_at,
  };
}

async function verifyConflictFixture(client, item) {
  const result = await invokeRollback(client, item);
  assert(result?.status === 'conflict' && result?.reason === 'rollback_authority_not_available', 'P06 conflict fixture did not fail closed.');
  assert(result?.authorityConsumed === undefined || result?.authorityConsumed === false, 'P06 conflict incorrectly reported consumed authority.');

  const verification = await client.query(
    `select r.consumed_at, r.consumed_by_profile_id, r.consumed_result,
            s.restored_at,
            (select count(*)::int from public.import_publish_audit_events a
             where a.idempotency_record_id = r.idempotency_record_id
               and a.event_type = 'rollback_succeeded') as rollback_audit_count
     from public.import_pharmacy_publish_references r
     join public.import_publish_rollback_snapshots s on s.id = r.rollback_snapshot_id
     where r.id = $1`,
    [item.referenceId],
  );
  const row = verification.rows[0];
  assert(row && row.consumed_at === null && row.consumed_by_profile_id === null && row.consumed_result === null, 'P06 failed rollback consumed its authority.');
  assert(row.restored_at === null && row.rollback_audit_count === 0, 'P06 failed rollback mutated snapshot or audit state.');
}

async function cleanup(client, item) {
  if (!item) return;
  await client.query('begin');
  try {
    await client.query('delete from public.import_pharmacy_publish_references where entity_id = $1', [item.entityId]);
    await client.query('delete from public.import_publish_audit_events where entity_id = $1', [item.entityId]);
    await client.query('delete from public.import_publish_rollback_snapshots where entity_id = $1', [item.entityId]);
    await client.query('delete from public.import_publish_idempotency_records where entity_id = $1', [item.entityId]);
    await client.query('delete from public.centers where id = $1', [item.entityId]);
    await client.query('delete from public.profiles where id = $1', [item.actorId]);
    await client.query('commit');
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  }
}

async function verifyCleanup(client, items) {
  for (const item of items) {
    const counts = await client.query(
      `select
         (select count(*)::int from public.import_pharmacy_publish_references where entity_id = $1) as references,
         (select count(*)::int from public.import_publish_audit_events where entity_id = $1) as audits,
         (select count(*)::int from public.import_publish_rollback_snapshots where entity_id = $1) as snapshots,
         (select count(*)::int from public.import_publish_idempotency_records where entity_id = $1) as reservations,
         (select count(*)::int from public.centers where id = $1) as centers,
         (select count(*)::int from public.profiles where id = $2) as profiles`,
      [item.entityId, item.actorId],
    );
    assert(Object.values(counts.rows[0]).every((count) => count === 0), 'P06 deterministic cleanup did not remove every fixture row.');
  }
}

async function writeEvidence(evidence) {
  await mkdir(path.dirname(evidencePath), { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
}

async function main() {
  const connectionString = requiredEnv('P06_PREVIEW_DATABASE_URL');
  const previewRef = requiredEnv('P06_PREVIEW_PROJECT_REF');
  const productionRef = requiredEnv('P06_PRODUCTION_PROJECT_REF');
  const sourceCommit = requiredEnv('P06_SOURCE_COMMIT');
  const runId = requiredEnv('P06_RUN_ID');
  verifyPreviewIdentity(connectionString, previewRef, productionRef);

  const mainClient = new Client(connectionConfig(connectionString, 'drmuscat-p06-rollback-authority-proof'));
  const concurrentA = new Client(connectionConfig(connectionString, 'drmuscat-p06-rollback-authority-a'));
  const concurrentB = new Client(connectionConfig(connectionString, 'drmuscat-p06-rollback-authority-b'));
  const successItem = fixture(runId, 'success');
  const conflictItem = fixture(runId, 'conflict', true);
  const items = [successItem, conflictItem];
  let connected = false;

  try {
    await mainClient.connect();
    connected = true;
    await verifyMigrationAndRpc(mainClient);
    await insertFixture(mainClient, successItem);
    await insertFixture(mainClient, conflictItem);

    await Promise.all([concurrentA.connect(), concurrentB.connect()]);
    const results = await Promise.all([
      invokeRollback(concurrentA, successItem),
      invokeRollback(concurrentB, successItem),
    ]);
    const verified = await verifySuccessfulFixture(mainClient, successItem, results);
    await verifyConflictFixture(mainClient, conflictItem);

    await cleanup(mainClient, successItem);
    await cleanup(mainClient, conflictItem);
    await verifyCleanup(mainClient, items);

    await writeEvidence({
      schemaVersion: 'drkhaleej.import.p06RollbackAuthorityProof.v1',
      sourceCommit,
      runId: digest(runId),
      previewIdentityVerified: true,
      migration0084Verified: true,
      atomicRollbackVerified: true,
      concurrentFreshCount: results.filter((result) => result?.status === 'rolled_back').length,
      concurrentReplayCount: results.filter((result) => result?.status === 'replayed').length,
      referenceCount: verified.referenceCount,
      consumedReferenceCount: 1,
      rollbackAuditCount: verified.rollbackAuditCount,
      duplicateRollbackCount: 0,
      failedRollbackAuthorityConsumed: false,
      exactSnapshotRestored: true,
      privateBoundaryVerified: true,
      publicExposureCount: verified.publicExposureCount,
      cleanupVerified: true,
      productionConnected: false,
      rawIdentifiersExposed: false,
    });
    console.log('P06 isolated atomic rollback authority proof passed.');
  } catch (error) {
    if (connected) {
      for (const item of items) await cleanup(mainClient, item).catch(() => {});
    }
    await writeEvidence({
      schemaVersion: 'drkhaleej.import.p06RollbackAuthorityProof.v1',
      sourceCommit,
      runId: digest(runId),
      verified: false,
      productionConnected: false,
      rawIdentifiersExposed: false,
      error: redact(error instanceof Error ? error.message : error),
    }).catch(() => {});
    throw error;
  } finally {
    await Promise.allSettled([concurrentA.end(), concurrentB.end(), mainClient.end()]);
  }
}

await main();
