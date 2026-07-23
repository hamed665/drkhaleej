#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;
const root = process.cwd();
const evidencePath = path.resolve(
  root,
  process.env.P05_EVIDENCE_PATH || 'artifacts/p05/private-publish-proof.json',
);
const reservationAuditSchemaVersion = 'drkhaleej.import.publishAudit.v2';
const executionAuditSchemaVersion = 'drkhaleej.import.publishAudit.v3';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required; P05 never skips isolated Preview proof.`);
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

function jsonEqual(left, right) {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

function redact(value) {
  return String(value || '')
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, '[REDACTED_DATABASE_URL]')
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, '[REDACTED_ID]')
    .slice(0, 1200);
}

function verifyPreviewIdentity(connectionString, previewRef, productionRef) {
  const parsed = new URL(connectionString);
  assert(['postgres:', 'postgresql:'].includes(parsed.protocol), 'P05 database URL must use PostgreSQL.');
  assert(previewRef && productionRef && previewRef !== productionRef, 'Preview and Production project refs must be present and different.');
  assert(parsed.port === '5432', 'P05 requires Session pooler port 5432.');
  assert(parsed.hostname.endsWith('.pooler.supabase.com'), 'P05 requires the isolated Supabase Session pooler host.');
  assert(decodeURIComponent(parsed.username) === `postgres.${previewRef}`, 'P05 database identity does not match the configured Preview project.');
  assert(!connectionString.includes(productionRef), 'Production project ref must not appear in the P05 database URL.');
}

function connectionConfig(connectionString) {
  return {
    connectionString,
    application_name: 'drmuscat-p05-private-publish-proof',
    ssl: { rejectUnauthorized: false },
    keepAlive: true,
    statement_timeout: 45_000,
    query_timeout: 50_000,
    connectionTimeoutMillis: 15_000,
  };
}

function fixture(runId) {
  const seed = `p05:${runId}`;
  const actorId = deterministicUuid(`${seed}:actor`);
  const entityId = deterministicUuid(`${seed}:entity`);
  const canonicalPath = `/en/om/pharmacies/p05-hosted-${digest(seed).slice(0, 12)}`;
  const protectedMetadata = {
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
    projectionVersion: 'p05-hosted-v1',
  };
  const sourceEvidence = {
    source: 'manual',
    sourceId: `p05-${digest(`${seed}:source`).slice(0, 12)}`,
    sourceName: 'P05 isolated hosted proof',
    importedBy: actorId,
    importedAt: '2026-07-23T00:00:00.000Z',
  };
  const patch = {
    name_en: 'P05 Verified Private Pharmacy',
    legal_name: 'P05 Verified Private Pharmacy LLC',
    slug: canonicalPath.split('/').at(-1),
    description_en: 'Isolated P05 private publish proof fixture.',
    primary_phone: '+96824000001',
    whatsapp_phone: '+96894000001',
    email: 'p05-proof@example.invalid',
    website_url: 'https://example.invalid/p05-proof',
    metadata_patch: {
      source: 'p05-hosted-proof',
      sourceEvidence,
      rawPayloadHash: digest(`${seed}:raw-payload`),
      visibility: 'private',
      publicRouteEnabled: false,
      indexable: false,
      sitemapEligible: false,
    },
  };
  return {
    actorId,
    entityId,
    readStateId: deterministicUuid(`${seed}:read-state`),
    authorizationId: deterministicUuid(`${seed}:authorization`),
    operationAttemptId: deterministicUuid(`${seed}:attempt`),
    referenceId: deterministicUuid(`${seed}:reference`),
    idempotencyKey: `p05-${digest(`${seed}:idempotency`).slice(0, 32)}`,
    requestHash: digest(`${seed}:request`),
    reviewSnapshotHash: digest(`${seed}:review`),
    entityFingerprint: digest(`${seed}:fingerprint`),
    patchHash: digest(JSON.stringify(canonicalize(patch))),
    token: `p05_${digest(`${seed}:opaque-token`)}`,
    canonicalPath,
    protectedMetadata,
    sourceEvidence,
    patch,
  };
}

async function cleanup(client, item) {
  if (!client || !item) return;
  await client.query('begin');
  try {
    await client.query('delete from public.import_pharmacy_publish_references where entity_id = $1', [item.entityId]);
    await client.query('delete from public.import_publish_audit_events where entity_id = $1', [item.entityId]);
    await client.query('delete from public.import_publish_rollback_snapshots where entity_id = $1', [item.entityId]);
    await client.query(
      `update public.import_pharmacy_publish_authorizations
       set status = 'invalidated', consumed_at = null, consumed_by_reservation_id = null,
           invalidated_at = clock_timestamp(), invalidation_reason = 'p05_cleanup'
       where id = $1`,
      [item.authorizationId],
    );
    await client.query('delete from public.import_publish_idempotency_records where entity_id = $1', [item.entityId]);
    await client.query('delete from public.import_pharmacy_publish_authorizations where id = $1', [item.authorizationId]);
    await client.query('delete from public.import_pharmacy_admin_read_states where entity_id = $1', [item.entityId]);
    await client.query('delete from public.centers where id = $1', [item.entityId]);
    await client.query('delete from public.profiles where id = $1', [item.actorId]);
    await client.query('commit');
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  }
}

async function writeEvidence(evidence) {
  await mkdir(path.dirname(evidencePath), { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
}

async function verifyMigrationAndRpc(client) {
  const ledger = await client.query(
    `select version::text as version
     from supabase_migrations.schema_migrations
     where version = '0082'`,
  );
  assert(ledger.rowCount === 1, 'Preview migration ledger does not include 0082.');

  const rpc = await client.query(
    `select pg_get_functiondef(
       to_regprocedure('public.import_publish_pharmacy_private(uuid,uuid,uuid,uuid,uuid,text,jsonb,text)')
     ) as definition`,
  );
  const definition = rpc.rows[0]?.definition;
  assert(typeof definition === 'string' && definition.length > 0, 'P05 Pharmacy private publish RPC is missing.');
  const normalized = definition.toLowerCase();
  for (const token of [
    'p_execution_started_audit_id',
    "'reservation_created'",
    "'phase', 'mutation'",
    executionAuditSchemaVersion,
    'import_publish_persist_terminal_result',
    "status = 'draft'",
    'is_active = false',
    'is_featured = false',
  ]) {
    assert(normalized.includes(token.toLowerCase()), `P05 RPC is missing required token: ${token}.`);
  }
}

async function insertFixture(client, item) {
  await client.query('begin');
  try {
    await client.query(
      `insert into public.profiles (
         id, full_name, display_name, locale, country, is_platform_admin,
         is_provider_user, is_patient_user, metadata
       ) values ($1, 'P05 Hosted Proof Actor', 'P05 Proof', 'en', 'om', true, false, false, $2::jsonb)`,
      [item.actorId, JSON.stringify({ p05HostedProof: true })],
    );
    await client.query(
      `insert into public.centers (
         id, slug, name_en, center_type, status, verification_status,
         primary_phone, default_locale, default_country, is_active, is_claimable,
         is_featured, sort_order, metadata
       ) values (
         $1, $2, 'P05 Original Pharmacy', 'pharmacy', 'draft', 'unverified',
         '+96824000000', 'en', 'om', false, false, false, 0, $3::jsonb
       )`,
      [
        item.entityId,
        `p05-original-${digest(item.entityId).slice(0, 12)}`,
        JSON.stringify({
          source: 'manual',
          sourceEvidence: item.sourceEvidence,
          rawPayloadHash: digest(`${item.entityId}:original`),
          ...item.protectedMetadata,
          visibility: 'private',
          publicRouteEnabled: false,
          indexable: false,
          sitemapEligible: false,
        }),
      ],
    );
    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    throw error;
  }

  const center = await client.query(
    `select id, center_type, slug, name_en, name_ar, legal_name, status, verification_status,
            primary_phone, secondary_phone, whatsapp_phone, email, website_url, logo_url,
            cover_image_url, short_description_en, short_description_ar, description_en,
            description_ar, default_locale, default_country, is_active, is_claimable,
            is_featured, sort_order, metadata, deleted_at, updated_at::text as updated_at
     from public.centers where id = $1`,
    [item.entityId],
  );
  assert(center.rowCount === 1, 'P05 fixture Pharmacy was not created.');
  const row = center.rows[0];
  item.expectedVersion = row.updated_at;
  item.rollbackSnapshot = {
    visibility: 'private',
    indexPolicy: 'noindex',
    sitemapPolicy: 'excluded',
    publishStatus: 'private_published',
    publicReady: false,
    projectionVersion: item.protectedMetadata.projectionVersion,
    canonicalRoute: item.canonicalPath,
    center: {
      id: row.id,
      centerType: row.center_type,
      slug: row.slug,
      nameEn: row.name_en,
      nameAr: row.name_ar,
      legalName: row.legal_name,
      status: row.status,
      verificationStatus: row.verification_status,
      primaryPhone: row.primary_phone,
      secondaryPhone: row.secondary_phone,
      whatsappPhone: row.whatsapp_phone,
      email: row.email,
      websiteUrl: row.website_url,
      logoUrl: row.logo_url,
      coverImageUrl: row.cover_image_url,
      shortDescriptionEn: row.short_description_en,
      shortDescriptionAr: row.short_description_ar,
      descriptionEn: row.description_en,
      descriptionAr: row.description_ar,
      defaultLocale: row.default_locale,
      defaultCountry: row.default_country,
      isActive: row.is_active,
      isClaimable: row.is_claimable,
      isFeatured: row.is_featured,
      sortOrder: row.sort_order,
      metadata: row.metadata ?? {},
      deletedAt: row.deleted_at,
    },
  };
  item.snapshotHash = digest(JSON.stringify(canonicalize(item.rollbackSnapshot)));

  await client.query('begin');
  try {
    await client.query(
      `insert into public.import_pharmacy_admin_read_states (
         id, actor_profile_id, entity_id, operation, snapshot_hash, entity_fingerprint,
         current_state, proposed_state, exact_diff, blocker_codes, reviewed_at, expires_at,
         created_at, operation_attempt_id, idempotency_key, request_hash, patch_hash,
         operation_scope, entity_family, expected_entity_version
       ) values (
         $1, $2, $3, 'review', $4, $5, $6::jsonb, $7::jsonb, '[]'::jsonb, '{}',
         clock_timestamp(), clock_timestamp() + interval '2 hours', clock_timestamp() - interval '1 minute',
         $8, $9, $10, $11, 'reserve_private_publish', 'pharmacy', $12
       )`,
      [
        item.readStateId,
        item.actorId,
        item.entityId,
        item.reviewSnapshotHash,
        item.entityFingerprint,
        JSON.stringify(item.rollbackSnapshot),
        JSON.stringify({ ...item.rollbackSnapshot, proposedPatch: item.patch }),
        item.operationAttemptId,
        item.idempotencyKey,
        item.requestHash,
        item.patchHash,
        item.expectedVersion,
      ],
    );
    await client.query(
      `insert into public.import_pharmacy_publish_authorizations (
         id, token_hash, nonce_hash, actor_profile_id, entity_id, review_snapshot_hash,
         entity_fingerprint, issued_at, expires_at, review_state_id, operation_attempt_id,
         idempotency_key, request_hash, patch_hash, expected_entity_version,
         entity_family, operation_scope, status
       ) values (
         $1, $2, $3, $4, $5, $6, $7, clock_timestamp() - interval '1 minute',
         clock_timestamp() + interval '2 hours', $8, $9, $10, $11, $12, $13,
         'pharmacy', 'reserve_private_publish', 'issued'
       )`,
      [
        item.authorizationId,
        digest(`${item.token}:authorization`),
        digest(`${item.token}:nonce`),
        item.actorId,
        item.entityId,
        item.reviewSnapshotHash,
        item.entityFingerprint,
        item.readStateId,
        item.operationAttemptId,
        item.idempotencyKey,
        item.requestHash,
        item.patchHash,
        item.expectedVersion,
      ],
    );
    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    throw error;
  }
}

async function reserve(client, item) {
  const response = await client.query(
    `select public.import_publish_reserve_snapshot_audit(
       $1::uuid, $2::uuid, $3::text, $4::text, $5::text, $6::jsonb, $7::text,
       $8::text, $9::uuid, $10::text, $11::text, $12::uuid, $13::text,
       $14::text, $15::text, $16::integer, $17::integer
     ) as result`,
    [
      item.entityId,
      item.actorId,
      item.idempotencyKey,
      item.requestHash,
      item.expectedVersion,
      JSON.stringify(item.rollbackSnapshot),
      item.snapshotHash,
      reservationAuditSchemaVersion,
      item.authorizationId,
      item.reviewSnapshotHash,
      item.entityFingerprint,
      item.operationAttemptId,
      item.patchHash,
      'pharmacy',
      'reserve_private_publish',
      168,
      365,
    ],
  );
  const result = response.rows[0]?.result;
  assert(result?.status === 'reserved' && result.replayed === false, 'P05 fixture Reservation was not created exactly once.');
  assert(result.idempotencyRecordId && result.rollbackSnapshotId && result.auditEventId, 'P05 Reservation references are incomplete.');
  item.reservationId = result.idempotencyRecordId;
  item.rollbackSnapshotId = result.rollbackSnapshotId;
  item.reservationAuditId = result.auditEventId;
}

async function publish(client, item) {
  const response = await client.query(
    `select public.import_publish_pharmacy_private(
       $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid, $6::text, $7::jsonb, $8::text
     ) as result`,
    [
      item.reservationId,
      item.rollbackSnapshotId,
      item.reservationAuditId,
      item.entityId,
      item.actorId,
      item.expectedVersion,
      JSON.stringify(item.patch),
      executionAuditSchemaVersion,
    ],
  );
  const result = response.rows[0]?.result;
  assert(result?.status === 'mutated', 'P05 private mutation did not commit successfully.');
  assert(typeof result.actualVersion === 'string' && result.actualVersion.length > 0, 'P05 private mutation did not return an actual version.');
  item.actualVersion = result.actualVersion;

  await client.query(
    `insert into public.import_pharmacy_publish_references (
       id, token_hash, actor_profile_id, entity_id, idempotency_record_id,
       rollback_snapshot_id, expected_current_version, expected_snapshot_hash,
       expires_at, created_at
     ) values ($1, $2, $3, $4, $5, $6, $7, $8, clock_timestamp() + interval '30 days', clock_timestamp())`,
    [
      item.referenceId,
      digest(item.token),
      item.actorId,
      item.entityId,
      item.reservationId,
      item.rollbackSnapshotId,
      item.actualVersion,
      item.snapshotHash,
    ],
  );

  const replay = await client.query(
    `select public.import_publish_pharmacy_private(
       $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid, $6::text, $7::jsonb, $8::text
     ) as result`,
    [
      item.reservationId,
      item.rollbackSnapshotId,
      item.reservationAuditId,
      item.entityId,
      item.actorId,
      item.expectedVersion,
      JSON.stringify(item.patch),
      executionAuditSchemaVersion,
    ],
  );
  assert(replay.rows[0]?.result?.status === 'replayed', 'P05 mutation replay was not bounded by terminal persistence.');
  assert(replay.rows[0]?.result?.actualVersion === item.actualVersion, 'P05 replay did not return the committed version.');
}

async function verifyReadback(client, item) {
  const [reservation, snapshot, audits, reference, entity, publicExposure] = await Promise.all([
    client.query(
      `select actor_profile_id, entity_id, expected_version, status, terminal_result
       from public.import_publish_idempotency_records
       where id = $1 and actor_profile_id = $2 and entity_id = $3`,
      [item.reservationId, item.actorId, item.entityId],
    ),
    client.query(
      `select id, expected_version, snapshot_hash
       from public.import_publish_rollback_snapshots
       where id = $1 and idempotency_record_id = $2 and actor_profile_id = $3 and entity_id = $4`,
      [item.rollbackSnapshotId, item.reservationId, item.actorId, item.entityId],
    ),
    client.query(
      `select id, event_type, outcome, schema_version, actual_version, event_payload
       from public.import_publish_audit_events
       where idempotency_record_id = $1 and actor_profile_id = $2 and entity_id = $3
       order by created_at, id`,
      [item.reservationId, item.actorId, item.entityId],
    ),
    client.query(
      `select count(*)::int as count
       from public.import_pharmacy_publish_references
       where token_hash = $1 and idempotency_record_id = $2 and rollback_snapshot_id = $3
         and actor_profile_id = $4 and entity_id = $5`,
      [digest(item.token), item.reservationId, item.rollbackSnapshotId, item.actorId, item.entityId],
    ),
    client.query(
      `select id, center_type, status, is_active, is_featured, deleted_at,
              updated_at::text as updated_at, name_en, legal_name, slug, description_en,
              primary_phone, whatsapp_phone, email, website_url, default_locale,
              default_country, metadata
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
      [item.canonicalPath],
    ),
  ]);

  assert(reservation.rowCount === 1, 'P05 readback did not find exactly one Reservation.');
  const reservationRow = reservation.rows[0];
  const terminal = reservationRow.terminal_result;
  assert(reservationRow.actor_profile_id === item.actorId && reservationRow.entity_id === item.entityId, 'P05 Reservation identity mismatch.');
  assert(reservationRow.expected_version === item.expectedVersion && reservationRow.status === 'succeeded', 'P05 terminal Reservation state is invalid.');
  assert(
    terminal?.actualVersion === item.actualVersion &&
      terminal?.visibility === 'private' &&
      terminal?.publicRouteEnabled === false &&
      terminal?.indexable === false &&
      terminal?.sitemapEligible === false,
    'P05 terminal result violated the private boundary.',
  );

  assert(snapshot.rowCount === 1, 'P05 readback did not find exactly one rollback snapshot.');
  assert(snapshot.rows[0].id === item.rollbackSnapshotId, 'P05 rollback snapshot identity mismatch.');
  assert(snapshot.rows[0].expected_version === item.expectedVersion, 'P05 rollback snapshot version mismatch.');
  assert(snapshot.rows[0].snapshot_hash === item.snapshotHash, 'P05 rollback snapshot hash mismatch.');

  const reservationAudits = audits.rows.filter((row) => row.id === item.reservationAuditId);
  const startedAudits = audits.rows.filter(
    (row) => row.event_type === 'execution_started' && row.event_payload?.phase === 'mutation',
  );
  const succeededAudits = audits.rows.filter(
    (row) => row.event_type === 'execution_succeeded' && row.outcome === 'succeeded',
  );
  assert(
    reservationAudits.length === 1 &&
      reservationAudits[0].event_type === 'reservation_created' &&
      reservationAudits[0].event_payload?.phase === 'reservation' &&
      reservationAudits[0].schema_version === reservationAuditSchemaVersion,
    'P05 Reservation audit readback mismatch.',
  );
  assert(
    startedAudits.length === 1 &&
      startedAudits[0].schema_version === executionAuditSchemaVersion &&
      startedAudits[0].event_payload?.reservationAuditId === item.reservationAuditId,
    'P05 mutation execution_started readback mismatch.',
  );
  assert(
    succeededAudits.length === 1 &&
      succeededAudits[0].schema_version === executionAuditSchemaVersion &&
      succeededAudits[0].actual_version === item.actualVersion,
    'P05 terminal success audit readback mismatch.',
  );
  assert(reference.rows[0]?.count === 1, 'P05 durable publish reference count is not exactly one.');
  assert(publicExposure.rows[0]?.count === 0, 'P05 private publish leaked into a public queue boundary.');

  assert(entity.rowCount === 1, 'P05 final Pharmacy entity is missing.');
  const final = entity.rows[0];
  assert(final.id === item.entityId && final.center_type === 'pharmacy', 'P05 final entity identity mismatch.');
  assert(final.updated_at === item.actualVersion, 'P05 final entity version mismatch.');
  assert(
    final.name_en === item.patch.name_en &&
      final.legal_name === item.patch.legal_name &&
      final.slug === item.patch.slug &&
      final.description_en === item.patch.description_en &&
      final.primary_phone === item.patch.primary_phone &&
      final.whatsapp_phone === item.patch.whatsapp_phone &&
      final.email === item.patch.email &&
      final.website_url === item.patch.website_url,
    'P05 exact canonical patch readback mismatch.',
  );
  assert(
    final.metadata?.source === item.patch.metadata_patch.source &&
      jsonEqual(final.metadata?.sourceEvidence, item.patch.metadata_patch.sourceEvidence) &&
      final.metadata?.rawPayloadHash === item.patch.metadata_patch.rawPayloadHash,
    'P05 canonical metadata patch readback mismatch.',
  );
  assert(
    jsonEqual(final.metadata?.canonicalGeo, item.protectedMetadata.canonicalGeo) &&
      final.metadata?.projectionVersion === item.protectedMetadata.projectionVersion &&
      final.default_locale === 'en' && final.default_country === 'om',
    'P05 protected metadata was not preserved.',
  );
  assert(
    final.status === 'draft' && final.is_active === false && final.is_featured === false &&
      final.deleted_at === null && final.metadata?.visibility === 'private' &&
      final.metadata?.publicRouteEnabled === false && final.metadata?.indexable === false &&
      final.metadata?.sitemapEligible === false,
    'P05 final Pharmacy crossed a forbidden public boundary.',
  );

  return {
    reservationCount: reservation.rowCount,
    rollbackSnapshotCount: snapshot.rowCount,
    reservationAuditCount: reservationAudits.length,
    executionStartedCount: startedAudits.length,
    executionSucceededCount: succeededAudits.length,
    durableReferenceCount: reference.rows[0].count,
    duplicateExecutionCount: Math.max(0, startedAudits.length - 1),
    publicExposureCount: publicExposure.rows[0].count,
    exactPatchVerified: true,
    protectedMetadataVerified: true,
    privateBoundaryVerified: true,
    replayBounded: true,
  };
}

async function verifyCleanup(client, item) {
  const result = await client.query(
    `select
       (select count(*)::int from public.import_pharmacy_publish_references where entity_id = $1) as references,
       (select count(*)::int from public.import_publish_audit_events where entity_id = $1) as audits,
       (select count(*)::int from public.import_publish_rollback_snapshots where entity_id = $1) as snapshots,
       (select count(*)::int from public.import_publish_idempotency_records where entity_id = $1) as reservations,
       (select count(*)::int from public.import_pharmacy_publish_authorizations where entity_id = $1) as authorizations,
       (select count(*)::int from public.import_pharmacy_admin_read_states where entity_id = $1) as read_states,
       (select count(*)::int from public.centers where id = $1) as entities,
       (select count(*)::int from public.profiles where id = $2) as actors`,
    [item.entityId, item.actorId],
  );
  assert(Object.values(result.rows[0]).every((value) => value === 0), 'P05 fixture cleanup left persistent rows.');
}

const runId = requiredEnv('P05_RUN_ID');
const sourceCommit = requiredEnv('P05_SOURCE_COMMIT');
const databaseUrl = requiredEnv('P05_PREVIEW_DATABASE_URL');
const previewRef = requiredEnv('P05_PREVIEW_PROJECT_REF');
const productionRef = requiredEnv('P05_PRODUCTION_PROJECT_REF');
const item = fixture(runId);
let client;
let verified = false;

try {
  verifyPreviewIdentity(databaseUrl, previewRef, productionRef);
  client = new Client(connectionConfig(databaseUrl));
  await client.connect();
  console.log('P05 isolated Preview connection established.');

  await cleanup(client, item).catch(() => {});
  await verifyMigrationAndRpc(client);
  console.log('P05 migration and RPC identity verified.');
  await insertFixture(client, item);
  await reserve(client, item);
  console.log('P05 verified Reservation created.');
  await publish(client, item);
  console.log('P05 private mutation and bounded replay completed.');
  const readback = await verifyReadback(client, item);
  console.log('P05 post-mutation readback verified.');

  await cleanup(client, item);
  await verifyCleanup(client, item);
  verified = true;

  await writeEvidence({
    schemaVersion: 'drmuscat.p05PrivatePublishProof.v1',
    status: 'green',
    sourceCommit,
    environmentClass: 'isolated_preview',
    migrationVersion: '0082',
    productionConnected: false,
    secretRedaction: true,
    reservationRpcInvocations: 1,
    mutationRpcInvocations: 2,
    cleanupVerified: true,
    readback,
    rawIdentifiersExposed: false,
    generatedAt: new Date().toISOString(),
  });
} catch (error) {
  if (client) await cleanup(client, item).catch(() => {});
  await writeEvidence({
    schemaVersion: 'drmuscat.p05PrivatePublishProof.v1',
    status: 'red',
    sourceCommit,
    environmentClass: 'isolated_preview',
    migrationVersion: '0082',
    productionConnected: false,
    secretRedaction: true,
    rawIdentifiersExposed: false,
    error: redact(error instanceof Error ? error.message : error),
    generatedAt: new Date().toISOString(),
  }).catch(() => {});
  console.error(`P05 hosted proof failed: ${redact(error instanceof Error ? error.message : error)}`);
  process.exitCode = 1;
} finally {
  if (client) await client.end().catch(() => {});
  if (verified) console.log('P05 isolated Preview private publish proof passed.');
}
