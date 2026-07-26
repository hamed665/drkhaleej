#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;
const required = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
};
const one = (rows) => rows.length === 1 ? rows[0] : null;
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isRecord(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
};
const sha256 = (value) => createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex');

function verifyPreviewIdentity(connectionString, previewRef, productionRef) {
  const parsed = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) throw new Error('Preview database URL must use PostgreSQL');
  if (!previewRef || !productionRef || previewRef === productionRef) throw new Error('Preview and Production refs must differ');
  if (parsed.port !== '5432') throw new Error('Preview diagnostic requires port 5432');
  const username = decodeURIComponent(parsed.username);
  const direct = parsed.hostname === `db.${previewRef}.supabase.co` && username === 'postgres';
  const pooler = parsed.hostname.endsWith('.pooler.supabase.com') && username === `postgres.${previewRef}`;
  if (!direct && !pooler) throw new Error('Database identity does not match isolated Preview');
  if (connectionString.includes(productionRef)) throw new Error('Production ref appeared in Preview URL');
}

const databaseUrl = required('PREVIEW_DATABASE_URL');
const previewRef = required('PREVIEW_PROJECT_REF');
const productionRef = required('PRODUCTION_PROJECT_REF');
const entityId = required('P09_UI_ENTITY_ID');
const outputPath = path.resolve(process.env.P09_UI_DIAGNOSTIC_PATH || 'artifacts/p09-ui-publish/preflight.json');
verifyPreviewIdentity(databaseUrl, previewRef, productionRef);

const parsed = new URL(databaseUrl);
const client = new Client({
  connectionString: databaseUrl,
  ssl: ['localhost', '127.0.0.1'].includes(parsed.hostname) ? false : { rejectUnauthorized: false },
  application_name: 'drmuscat-p09-ui-publish-preflight-readonly',
  statement_timeout: 30000,
  query_timeout: 35000,
  connectionTimeoutMillis: 15000,
});

await client.connect();
try {
  await client.query('begin transaction read only');
  const now = one((await client.query('select clock_timestamp() as now')).rows)?.now;
  const review = one((await client.query(`
    select id, actor_profile_id, entity_id, snapshot_hash, entity_fingerprint,
           operation_attempt_id, idempotency_key, request_hash, patch_hash,
           expected_entity_version, created_at, expires_at
      from public.import_pharmacy_admin_read_states
     where entity_id = $1::uuid and operation = 'review'
     order by created_at desc limit 1
  `, [entityId])).rows);
  const auth = review ? one((await client.query(`
    select id, review_state_id, actor_profile_id, entity_id, review_snapshot_hash,
           entity_fingerprint, operation_attempt_id, idempotency_key, request_hash,
           patch_hash, expected_entity_version, entity_family, operation_scope,
           status, consumed_by_reservation_id
      from public.import_pharmacy_publish_authorizations
     where review_state_id = $1::uuid limit 1
  `, [review.id])).rows) : null;
  const reservation = auth?.consumed_by_reservation_id ? one((await client.query(`
    select id, actor_profile_id, entity_id, idempotency_key, request_hash,
           expected_version, status, expires_at, pharmacy_authorization_id, terminal_result
      from public.import_publish_idempotency_records
     where id = $1::uuid limit 1
  `, [auth.consumed_by_reservation_id])).rows) : null;
  const snapshot = reservation ? one((await client.query(`
    select id, actor_profile_id, entity_id, idempotency_record_id, expected_version, snapshot_hash
      from public.import_publish_rollback_snapshots
     where idempotency_record_id = $1::uuid
  `, [reservation.id])).rows) : null;
  const audits = reservation ? (await client.query(`
    select id, actor_profile_id, entity_id, idempotency_record_id, rollback_snapshot_id,
           event_type, outcome, schema_version, expected_version, event_payload
      from public.import_publish_audit_events
     where idempotency_record_id = $1::uuid
       and event_type in ('execution_started','reservation_created')
     order by created_at asc
  `, [reservation.id])).rows : [];
  const center = one((await client.query(`
    select id, center_type::text, slug, name_en, name_ar, legal_name, status::text,
           verification_status::text, primary_phone, secondary_phone, whatsapp_phone,
           email, website_url, logo_url, cover_image_url, short_description_en,
           short_description_ar, description_en, description_ar, default_locale,
           default_country, is_active, is_claimable, is_featured, sort_order,
           metadata, deleted_at, updated_at, updated_at::text as updated_at_text
      from public.centers where id = $1::uuid limit 1
  `, [entityId])).rows);

  let computedFingerprint = null;
  let computedSnapshotHash = null;
  if (center) {
    const centerSnapshot = {
      id: center.id,
      centerType: center.center_type,
      slug: center.slug,
      nameEn: center.name_en,
      nameAr: center.name_ar,
      legalName: center.legal_name,
      status: center.status,
      verificationStatus: center.verification_status,
      primaryPhone: center.primary_phone,
      secondaryPhone: center.secondary_phone,
      whatsappPhone: center.whatsapp_phone,
      email: center.email,
      websiteUrl: center.website_url,
      logoUrl: center.logo_url,
      coverImageUrl: center.cover_image_url,
      shortDescriptionEn: center.short_description_en,
      shortDescriptionAr: center.short_description_ar,
      descriptionEn: center.description_en,
      descriptionAr: center.description_ar,
      defaultLocale: center.default_locale,
      defaultCountry: center.default_country,
      isActive: center.is_active,
      isClaimable: center.is_claimable,
      isFeatured: center.is_featured,
      sortOrder: center.sort_order,
      metadata: center.metadata ?? {},
      deletedAt: center.deleted_at,
    };
    computedFingerprint = sha256(centerSnapshot);
    const projectionVersion = center.metadata?.projectionVersion;
    const canonicalRoute = `/${center.default_locale}/${center.default_country}/pharmacies/${center.slug ?? center.id}`;
    computedSnapshotHash = sha256({
      visibility: 'private',
      indexPolicy: 'noindex',
      sitemapPolicy: 'excluded',
      publishStatus: 'private_published',
      publicReady: false,
      projectionVersion,
      canonicalRoute,
      center: centerSnapshot,
    });
  }

  const audit = audits.length === 1 ? audits[0] : null;
  const payload = audit?.event_payload ?? {};
  const preflightBlockers = [];
  if (!review) preflightBlockers.push('review_unavailable');
  if (!auth || auth.status !== 'consumed') preflightBlockers.push('authorization_unavailable');
  if (!reservation || reservation.status !== 'reserved') preflightBlockers.push('reservation_unavailable');
  if (reservation && now && new Date(reservation.expires_at).getTime() <= new Date(now).getTime()) preflightBlockers.push('reservation_expired');
  if (!snapshot) preflightBlockers.push('snapshot_unavailable');
  if (audits.length !== 1) preflightBlockers.push('audit_row_count_invalid');
  if (review && computedSnapshotHash !== review.snapshot_hash) preflightBlockers.push('context_snapshot_mismatch');
  if (review && computedFingerprint !== review.entity_fingerprint) preflightBlockers.push('context_fingerprint_mismatch');
  if (review && center && new Date(center.updated_at).getTime() !== new Date(review.expected_entity_version).getTime()) preflightBlockers.push('context_version_mismatch');
  if (review && auth && (
    auth.review_state_id !== review.id || auth.actor_profile_id !== review.actor_profile_id ||
    auth.entity_id !== review.entity_id || auth.review_snapshot_hash !== review.snapshot_hash ||
    auth.entity_fingerprint !== review.entity_fingerprint || auth.operation_attempt_id !== review.operation_attempt_id ||
    auth.idempotency_key !== review.idempotency_key || auth.request_hash !== review.request_hash ||
    auth.patch_hash !== review.patch_hash || auth.expected_entity_version !== review.expected_entity_version ||
    auth.entity_family !== 'pharmacy' || auth.operation_scope !== 'reserve_private_publish'
  )) preflightBlockers.push('authorization_mismatch');
  if (review && reservation && (
    reservation.actor_profile_id !== review.actor_profile_id || reservation.entity_id !== review.entity_id ||
    reservation.idempotency_key !== review.idempotency_key || reservation.request_hash !== review.request_hash ||
    reservation.expected_version !== review.expected_entity_version || reservation.pharmacy_authorization_id !== auth?.id
  )) preflightBlockers.push('reservation_binding_mismatch');
  if (review && snapshot && (
    snapshot.actor_profile_id !== review.actor_profile_id || snapshot.entity_id !== review.entity_id ||
    snapshot.idempotency_record_id !== reservation?.id || snapshot.expected_version !== review.expected_entity_version ||
    snapshot.snapshot_hash !== review.snapshot_hash
  )) preflightBlockers.push('snapshot_binding_mismatch');
  if (review && audit && (
    audit.actor_profile_id !== review.actor_profile_id || audit.entity_id !== review.entity_id ||
    audit.idempotency_record_id !== reservation?.id || audit.rollback_snapshot_id !== snapshot?.id ||
    audit.outcome !== 'pending' || audit.expected_version !== review.expected_entity_version ||
    payload.phase !== 'reservation' || payload.requestHash !== review.request_hash ||
    payload.authorizationId !== auth?.id || payload.reviewSnapshotHash !== review.snapshot_hash ||
    payload.entityFingerprint !== review.entity_fingerprint || payload.operationAttemptId !== review.operation_attempt_id ||
    payload.patchHash !== review.patch_hash || payload.entityFamily !== 'pharmacy' ||
    payload.operationScope !== 'reserve_private_publish'
  )) preflightBlockers.push('audit_identity_mismatch');

  const report = {
    schemaVersion: 'drkhaleej.p09UiPublishPreflightDiagnostic.v1',
    previewIdentityVerified: true,
    readOnly: true,
    productionDisconnected: true,
    state: {
      reviewExists: Boolean(review),
      authorizationStatus: auth?.status ?? null,
      reservationStatus: reservation?.status ?? null,
      reservationLive: Boolean(reservation && now && new Date(reservation.expires_at).getTime() > new Date(now).getTime()),
      terminalResultPresent: Boolean(reservation?.terminal_result),
      snapshotExists: Boolean(snapshot),
      reservationAuditCount: audits.length,
      executionStartedCount: audits.filter((row) => row.event_type === 'execution_started').length,
      contextSnapshotMatchesReview: Boolean(review && computedSnapshotHash === review.snapshot_hash),
      contextFingerprintMatchesReview: Boolean(review && computedFingerprint === review.entity_fingerprint),
      contextVersionTemporallyMatchesReview: Boolean(review && center && new Date(center.updated_at).getTime() === new Date(review.expected_entity_version).getTime()),
      centerPrivateDraftBoundary: Boolean(center && center.center_type === 'pharmacy' && center.status === 'draft' && center.is_active === false && center.is_featured === false && center.deleted_at === null),
    },
    preflightBlockers: [...new Set(preflightBlockers)],
  };
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report));
  await client.query('rollback');
} finally {
  await client.end();
}
