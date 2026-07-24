#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;
const root = process.cwd();
const evidencePath = path.resolve(
  root,
  process.env.P07_EVIDENCE_PATH || 'artifacts/p07/rollback-exact-recovery-proof.json',
);
const auditSchemaVersion = 'drkhaleej.import.publishAudit.v4';
const allowedDifferencePaths = [
  'operation.entityVersion',
  'operation.rollbackMetadata',
  'operation.authorityState',
  'operation.auditHistory',
];
const MAX_MISMATCH_DIAGNOSTICS = 24;
const ROOT_PATH = '$';
const MISSING_VALUE = Object.freeze({ __drkhaleejMissingValue: true });
const ALLOWED_DIFFERENCE = Object.freeze({ __drkhaleejAllowedDifference: true });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required; P07 never skips isolated Preview proof.`);
  return value;
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function canonicalize(value) {
  if (Array.isArray(value)) {
    const normalized = value.map(canonicalize);
    return normalized.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
  }
  if (!isRecord(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
}

function serialized(value) {
  return JSON.stringify(canonicalize(value === undefined ? MISSING_VALUE : value));
}

function digest(value) {
  return createHash('sha256').update(serialized(value)).digest('hex');
}

function deterministicUuid(value) {
  const chars = digest(value).slice(0, 32).split('');
  chars[12] = '4';
  chars[16] = '8';
  const hex = chars.join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function pathAllowed(fieldPath, allowedPaths) {
  return allowedPaths.some(
    (allowed) => fieldPath === allowed || fieldPath.startsWith(`${allowed}.`) || fieldPath.startsWith(`${allowed}[`),
  );
}

function childPath(parent, key) {
  return parent === ROOT_PATH ? key : `${parent}.${key}`;
}

function maskAllowedDifferences(value, fieldPath, allowedPaths) {
  if (pathAllowed(fieldPath, allowedPaths)) return ALLOWED_DIFFERENCE;
  if (Array.isArray(value)) {
    return value.map((item, index) => maskAllowedDifferences(item, `${fieldPath}[${index}]`, allowedPaths));
  }
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.keys(value).map((key) => [key, maskAllowedDifferences(value[key], childPath(fieldPath, key), allowedPaths)]),
  );
}

function compareValues(expected, actual, fieldPath, allowedPaths, state) {
  if (pathAllowed(fieldPath, allowedPaths) || serialized(expected) === serialized(actual)) return;

  if (isRecord(expected) && isRecord(actual)) {
    const keys = [...new Set([...Object.keys(expected), ...Object.keys(actual)])].sort();
    for (const key of keys) compareValues(expected[key], actual[key], childPath(fieldPath, key), allowedPaths, state);
    return;
  }

  if (Array.isArray(expected) && Array.isArray(actual)) {
    const normalizedExpected = canonicalize(expected);
    const normalizedActual = canonicalize(actual);
    const length = Math.max(normalizedExpected.length, normalizedActual.length);
    for (let index = 0; index < length; index += 1) {
      compareValues(normalizedExpected[index], normalizedActual[index], `${fieldPath}[${index}]`, allowedPaths, state);
    }
    return;
  }

  state.count += 1;
  if (state.diagnostics.length < MAX_MISMATCH_DIAGNOSTICS) {
    state.diagnostics.push({
      path: fieldPath.slice(0, 180),
      expectedHash: digest(expected),
      actualHash: digest(actual),
    });
  }
}

function compareExactRecovery(expected, actual, allowedPaths = []) {
  const state = { count: 0, diagnostics: [] };
  compareValues(expected, actual, ROOT_PATH, allowedPaths, state);
  return {
    verified: state.count === 0,
    expectedHash: digest(maskAllowedDifferences(expected, ROOT_PATH, allowedPaths)),
    actualHash: digest(maskAllowedDifferences(actual, ROOT_PATH, allowedPaths)),
    mismatchCount: state.count,
    mismatches: state.diagnostics,
    diagnosticsTruncated: state.count > state.diagnostics.length,
    rawValuesExposed: false,
  };
}

function redact(value) {
  return String(value || '')
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, '[REDACTED_DATABASE_URL]')
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, '[REDACTED_ID]')
    .replace(/P07-(?:ORIGINAL|TAMPERED)-LICENSE/gi, '[REDACTED_PROTECTED_VALUE]')
    .slice(0, 1200);
}

function verifyPreviewIdentity(connectionString, previewRef, productionRef) {
  const parsed = new URL(connectionString);
  assert(['postgres:', 'postgresql:'].includes(parsed.protocol), 'P07 database URL must use PostgreSQL.');
  assert(previewRef && productionRef && previewRef !== productionRef, 'Preview and Production project refs must be present and different.');
  assert(parsed.port === '5432', 'P07 requires Session pooler port 5432.');
  assert(parsed.hostname.endsWith('.pooler.supabase.com'), 'P07 requires the isolated Supabase Session pooler host.');
  assert(decodeURIComponent(parsed.username) === `postgres.${previewRef}`, 'P07 database identity does not match the configured Preview project.');
  assert(!connectionString.includes(productionRef), 'Production project ref must not appear in the P07 database URL.');
}

function connectionConfig(connectionString) {
  return {
    connectionString,
    application_name: 'drmuscat-p07-rollback-exact-recovery-proof',
    ssl: { rejectUnauthorized: false },
    keepAlive: true,
    statement_timeout: 45_000,
    query_timeout: 50_000,
    connectionTimeoutMillis: 15_000,
  };
}

function fixture(runId) {
  const seed = `p07:${runId}`;
  return {
    actorId: deterministicUuid(`${seed}:actor`),
    entityId: deterministicUuid(`${seed}:entity`),
    reservationId: deterministicUuid(`${seed}:reservation`),
    snapshotId: deterministicUuid(`${seed}:snapshot`),
    referenceId: deterministicUuid(`${seed}:reference`),
    idempotencyKey: `p07-${digest(`${seed}:idempotency`).slice(0, 32)}`,
    requestHash: digest(`${seed}:request`),
    tokenHash: digest(`${seed}:server-only-reference`),
  };
}

function originalSnapshot(item) {
  const slug = `p07-original-${digest(item.entityId).slice(0, 12)}`;
  return {
    schemaVersion: 'drkhaleej.import.pharmacyRollbackSnapshot.v1',
    visibility: 'private',
    indexPolicy: 'noindex',
    sitemapPolicy: 'excluded',
    publishStatus: 'private_published',
    publicReady: false,
    projectionVersion: 'p07-original-v1',
    canonicalRoute: `/ar/om/pharmacies/${slug}`,
    center: {
      id: item.entityId,
      centerType: 'pharmacy',
      slug,
      nameEn: 'P07 Original Pharmacy',
      nameAr: 'صيدلية P07 الأصلية',
      legalName: 'P07 Original Pharmacy LLC',
      status: 'draft',
      verificationStatus: 'unverified',
      primaryPhone: '+96824000020',
      secondaryPhone: '+96824000021',
      whatsappPhone: '+96894000020',
      email: 'p07-original@example.invalid',
      websiteUrl: 'https://example.invalid/p07-original',
      logoUrl: 'https://example.invalid/p07-logo.png',
      coverImageUrl: 'https://example.invalid/p07-cover.png',
      shortDescriptionEn: 'P07 original short description.',
      shortDescriptionAr: 'وصف P07 الأصلي المختصر.',
      descriptionEn: 'P07 original exact rollback state.',
      descriptionAr: 'حالة الاسترجاع الأصلية الدقيقة P07.',
      defaultLocale: 'ar',
      defaultCountry: 'om',
      isActive: false,
      isClaimable: false,
      isFeatured: false,
      sortOrder: 7,
      metadata: {
        source: 'p07-hosted-proof',
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
        projectionVersion: 'p07-original-v1',
        visibility: 'private',
        publicRouteEnabled: false,
        indexable: false,
        sitemapEligible: false,
        protected: {
          licenseNumber: 'P07-ORIGINAL-LICENSE',
          sourceEvidenceHashes: [digest('p07-evidence-b'), digest('p07-evidence-a')],
        },
      },
      deletedAt: null,
    },
    relations: [],
  };
}

function actualSnapshotFromRow(row) {
  return {
    schemaVersion: 'drkhaleej.import.pharmacyRollbackSnapshot.v1',
    visibility: row.metadata?.visibility,
    indexPolicy: row.metadata?.indexable ? 'index' : 'noindex',
    sitemapPolicy: row.metadata?.sitemapEligible ? 'included' : 'excluded',
    publishStatus: 'private_published',
    publicReady: Boolean(row.is_active || row.is_featured || row.metadata?.publicRouteEnabled),
    projectionVersion: row.metadata?.projectionVersion,
    canonicalRoute: `/${row.default_locale}/${row.default_country}/pharmacies/${row.slug}`,
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
      metadata: row.metadata,
      deletedAt: row.deleted_at ? new Date(row.deleted_at).toISOString() : null,
    },
    relations: [],
  };
}

async function verifyMigrationAndRpc(client) {
  const ledger = await client.query(
    `select version::text as version from supabase_migrations.schema_migrations where version = '0084'`,
  );
  assert(ledger.rowCount === 1, 'Preview migration ledger does not include 0084.');
  const rpc = await client.query(
    `select pg_get_functiondef(to_regprocedure('public.import_rollback_pharmacy_private_by_authority(uuid,uuid,text)')) as definition`,
  );
  const definition = rpc.rows[0]?.definition;
  assert(typeof definition === 'string' && definition.includes('extensions.digest'), 'P07 requires the final schema-qualified P06 rollback authority RPC.');
}

async function insertFixture(client, item) {
  const snapshot = originalSnapshot(item);
  item.snapshot = snapshot;
  item.snapshotHash = digest(snapshot);

  await client.query('begin');
  try {
    await client.query(
      `insert into public.profiles (
         id, full_name, display_name, locale, country, is_platform_admin,
         is_provider_user, is_patient_user, metadata
       ) values ($1, 'P07 Hosted Proof Actor', 'P07 Proof', 'ar', 'om', true, false, false, $2::jsonb)`,
      [item.actorId, JSON.stringify({ p07HostedProof: true })],
    );
    await client.query(
      `insert into public.centers (
         id, slug, name_en, name_ar, legal_name, center_type, status, verification_status,
         primary_phone, secondary_phone, whatsapp_phone, email, website_url, logo_url,
         cover_image_url, short_description_en, short_description_ar, description_en,
         description_ar, default_locale, default_country, is_active, is_claimable,
         is_featured, sort_order, metadata, deleted_at
       ) values (
         $1, $2, $3, $4, $5, 'pharmacy', 'draft', 'unverified',
         $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
         'ar', 'om', false, false, false, 7, $17::jsonb, null
       )`,
      [
        item.entityId,
        snapshot.center.slug,
        snapshot.center.nameEn,
        snapshot.center.nameAr,
        snapshot.center.legalName,
        snapshot.center.primaryPhone,
        snapshot.center.secondaryPhone,
        snapshot.center.whatsappPhone,
        snapshot.center.email,
        snapshot.center.websiteUrl,
        snapshot.center.logoUrl,
        snapshot.center.coverImageUrl,
        snapshot.center.shortDescriptionEn,
        snapshot.center.shortDescriptionAr,
        snapshot.center.descriptionEn,
        snapshot.center.descriptionAr,
        JSON.stringify(snapshot.center.metadata),
      ],
    );
    const original = await client.query(`select updated_at::text as updated_at from public.centers where id = $1`, [item.entityId]);
    item.originalVersion = original.rows[0]?.updated_at;
    assert(typeof item.originalVersion === 'string', 'P07 original version was not captured.');

    const mutatedMetadata = {
      ...snapshot.center.metadata,
      projectionVersion: 'p07-mutated-v1',
      protected: {
        licenseNumber: 'P07-MUTATED-LICENSE',
        sourceEvidenceHashes: [digest('p07-mutated-evidence')],
      },
    };
    const mutated = await client.query(
      `update public.centers
       set slug = $2,
           name_en = 'P07 Mutated Pharmacy',
           name_ar = 'صيدلية P07 المعدلة',
           legal_name = 'P07 Mutated Pharmacy LLC',
           primary_phone = '+96824000030',
           secondary_phone = null,
           whatsapp_phone = '+96894000030',
           email = 'p07-mutated@example.invalid',
           website_url = 'https://example.invalid/p07-mutated',
           logo_url = null,
           cover_image_url = null,
           short_description_en = 'P07 mutated short description.',
           short_description_ar = null,
           description_en = 'P07 mutated state awaiting rollback.',
           description_ar = null,
           default_locale = 'en',
           is_claimable = true,
           sort_order = 99,
           metadata = $3::jsonb,
           status = 'draft', is_active = false, is_featured = false, deleted_at = null
       where id = $1
       returning updated_at::text as updated_at`,
      [item.entityId, `p07-mutated-${digest(item.entityId).slice(0, 12)}`, JSON.stringify(mutatedMetadata)],
    );
    item.currentVersion = mutated.rows[0]?.updated_at;
    assert(typeof item.currentVersion === 'string', 'P07 mutated version was not captured.');

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
          actualVersion: item.currentVersion,
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
      [item.snapshotId, item.entityId, item.actorId, item.reservationId, item.originalVersion, JSON.stringify(snapshot), item.snapshotHash],
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
      [item.referenceId, item.tokenHash, item.actorId, item.entityId, item.reservationId, item.snapshotId, item.currentVersion, item.snapshotHash],
    );
    await client.query('commit');
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  }
}

async function invokeRollback(client, item) {
  const response = await client.query(
    `select public.import_rollback_pharmacy_private_by_authority($1::uuid, $2::uuid, $3::text) as result`,
    [item.entityId, item.actorId, auditSchemaVersion],
  );
  return response.rows[0]?.result;
}

async function verifyExactRecovery(client, item, rollbackResult) {
  assert(rollbackResult?.status === 'rolled_back', 'P07 rollback did not complete freshly.');
  assert(rollbackResult?.authorityConsumed === true, 'P07 rollback did not consume its authority.');
  assert(rollbackResult?.privateBoundaryVerified === true, 'P07 rollback did not verify the private boundary.');
  assert(rollbackResult?.rawReferenceExposed === false, 'P07 rollback exposed a raw reference.');

  const [reference, snapshot, reservation, audits, entity, exposure] = await Promise.all([
    client.query(
      `select consumed_at::text as consumed_at, consumed_by_profile_id::text as consumed_by,
              consumed_result_hash,
              encode(extensions.digest(consumed_result::text, 'sha256'), 'hex') as recomputed_hash
       from public.import_pharmacy_publish_references where id = $1`,
      [item.referenceId],
    ),
    client.query(
      `select restored_at::text as restored_at, restored_by_profile_id::text as restored_by
       from public.import_publish_rollback_snapshots where id = $1`,
      [item.snapshotId],
    ),
    client.query(
      `select status, terminal_result from public.import_publish_idempotency_records where id = $1`,
      [item.reservationId],
    ),
    client.query(
      `select count(*)::int as count from public.import_publish_audit_events
       where idempotency_record_id = $1 and actor_profile_id = $2 and entity_id = $3
         and event_type = 'rollback_succeeded' and outcome = 'rolled_back' and schema_version = $4`,
      [item.reservationId, item.actorId, item.entityId, auditSchemaVersion],
    ),
    client.query(
      `select id, center_type, slug, name_en, name_ar, legal_name, status, verification_status,
              primary_phone, secondary_phone, whatsapp_phone, email, website_url, logo_url,
              cover_image_url, short_description_en, short_description_ar, description_en,
              description_ar, default_locale, default_country, is_active, is_claimable,
              is_featured, sort_order, metadata, deleted_at, updated_at::text as updated_at
       from public.centers where id = $1`,
      [item.entityId],
    ),
    client.query(
      `select count(*)::int as count from public.import_publish_queue
       where target_entity_type = 'pharmacy'
         and publish_status = 'index_eligible'
         and index_policy = 'index'
         and sitemap_policy = 'included'
         and metadata ->> 'canonical_path' = $1`,
      [item.snapshot.canonicalRoute],
    ),
  ]);

  assert(reference.rowCount === 1 && reference.rows[0].consumed_at, 'P07 authority consumption readback is missing.');
  assert(reference.rows[0].consumed_by === item.actorId, 'P07 authority consumer mismatch.');
  assert(reference.rows[0].consumed_result_hash === reference.rows[0].recomputed_hash, 'P07 authority result hash mismatch.');
  assert(snapshot.rowCount === 1 && snapshot.rows[0].restored_at, 'P07 rollback snapshot restoration metadata is missing.');
  assert(snapshot.rows[0].restored_by === item.actorId, 'P07 rollback restorer mismatch.');
  assert(reservation.rows[0]?.status === 'rolled_back', 'P07 terminal Reservation state is invalid.');
  assert(reservation.rows[0]?.terminal_result?.kind === 'rolled_back', 'P07 terminal rollback result is invalid.');
  assert(audits.rows[0]?.count === 1, 'P07 rollback success audit count is not exactly one.');
  assert(entity.rowCount === 1, 'P07 restored Pharmacy entity is missing.');
  assert(exposure.rows[0]?.count === 0, 'P07 exact recovery leaked into a public queue boundary.');

  const actualLogicalSnapshot = actualSnapshotFromRow(entity.rows[0]);
  const expectedEnvelope = {
    logical: item.snapshot,
    operation: {
      entityVersion: item.originalVersion,
      rollbackMetadata: null,
      authorityState: 'unconsumed',
      auditHistory: { rollbackSucceeded: 0 },
    },
  };
  const actualEnvelope = {
    logical: actualLogicalSnapshot,
    operation: {
      entityVersion: entity.rows[0].updated_at,
      rollbackMetadata: { restoredAt: snapshot.rows[0].restored_at },
      authorityState: 'consumed',
      auditHistory: { rollbackSucceeded: audits.rows[0].count },
    },
  };
  const exactRecovery = compareExactRecovery(expectedEnvelope, actualEnvelope, allowedDifferencePaths);
  assert(exactRecovery.verified, `P07 exact logical recovery mismatch at ${exactRecovery.mismatches[0]?.path || 'unknown'}.`);
  assert(exactRecovery.mismatchCount === 0, 'P07 exact recovery reported unexpected mismatches.');
  assert(exactRecovery.expectedHash === exactRecovery.actualHash, 'P07 allowlisted exact recovery hashes differ.');
  assert(exactRecovery.rawValuesExposed === false, 'P07 exact recovery diagnostics exposed raw values.');

  const tamperedEnvelope = structuredClone(actualEnvelope);
  tamperedEnvelope.logical.center.metadata.protected.licenseNumber = 'P07-TAMPERED-LICENSE';
  const mismatchProof = compareExactRecovery(expectedEnvelope, tamperedEnvelope, allowedDifferencePaths);
  const mismatchSerialized = JSON.stringify(mismatchProof);
  assert(!mismatchProof.verified && mismatchProof.mismatchCount === 1, 'P07 mismatch fixture was not detected exactly once.');
  assert(
    mismatchProof.mismatches[0]?.path === 'logical.center.metadata.protected.licenseNumber',
    'P07 mismatch fixture did not report the bounded field path.',
  );
  assert(/^[a-f0-9]{64}$/.test(mismatchProof.mismatches[0]?.expectedHash || ''), 'P07 expected mismatch hash is invalid.');
  assert(/^[a-f0-9]{64}$/.test(mismatchProof.mismatches[0]?.actualHash || ''), 'P07 actual mismatch hash is invalid.');
  assert(!mismatchSerialized.includes('P07-ORIGINAL-LICENSE'), 'P07 mismatch diagnostics leaked the expected protected value.');
  assert(!mismatchSerialized.includes('P07-TAMPERED-LICENSE'), 'P07 mismatch diagnostics leaked the actual protected value.');

  return {
    exactRecovery,
    mismatchProof,
    publicExposureCount: exposure.rows[0].count,
    actualVersion: entity.rows[0].updated_at,
  };
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

async function verifyCleanup(client, item) {
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
  assert(Object.values(counts.rows[0]).every((count) => count === 0), 'P07 deterministic cleanup did not remove every fixture row.');
}

async function writeEvidence(evidence) {
  await mkdir(path.dirname(evidencePath), { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
}

async function main() {
  const connectionString = requiredEnv('P07_PREVIEW_DATABASE_URL');
  const previewRef = requiredEnv('P07_PREVIEW_PROJECT_REF');
  const productionRef = requiredEnv('P07_PRODUCTION_PROJECT_REF');
  const sourceCommit = requiredEnv('P07_SOURCE_COMMIT');
  const runId = requiredEnv('P07_RUN_ID');
  verifyPreviewIdentity(connectionString, previewRef, productionRef);

  const client = new Client(connectionConfig(connectionString));
  const item = fixture(runId);
  let connected = false;

  try {
    await client.connect();
    connected = true;
    await verifyMigrationAndRpc(client);
    await insertFixture(client, item);
    const rollbackResult = await invokeRollback(client, item);
    const verified = await verifyExactRecovery(client, item, rollbackResult);
    await cleanup(client, item);
    await verifyCleanup(client, item);

    await writeEvidence({
      schemaVersion: 'drkhaleej.import.p07RollbackExactRecoveryProof.v1',
      sourceCommit,
      runId: digest(runId),
      previewIdentityVerified: true,
      migration0084Verified: true,
      rollbackCompleted: true,
      exactLogicalRecoveryVerified: verified.exactRecovery.verified,
      expectedLogicalHash: verified.exactRecovery.expectedHash,
      actualLogicalHash: verified.exactRecovery.actualHash,
      mismatchCount: verified.exactRecovery.mismatchCount,
      allowedDifferencePaths,
      mismatchFixtureVerified: !verified.mismatchProof.verified,
      mismatchDiagnosticPaths: verified.mismatchProof.mismatches.map((item) => item.path),
      mismatchDiagnosticsBounded: true,
      protectedValuesExposed: false,
      relationSnapshotContract: 'empty_and_exact',
      privateBoundaryVerified: true,
      publicExposureCount: verified.publicExposureCount,
      cleanupVerified: true,
      productionConnected: false,
      rawIdentifiersExposed: false,
    });
    console.log('P07 isolated exact rollback recovery proof passed.');
  } catch (error) {
    if (connected) await cleanup(client, item).catch(() => {});
    await writeEvidence({
      schemaVersion: 'drkhaleej.import.p07RollbackExactRecoveryProof.v1',
      sourceCommit,
      runId: digest(runId),
      verified: false,
      productionConnected: false,
      rawIdentifiersExposed: false,
      protectedValuesExposed: false,
      error: redact(error instanceof Error ? error.message : error),
    }).catch(() => {});
    throw error;
  } finally {
    await client.end().catch(() => {});
  }
}

await main();
