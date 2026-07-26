#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function verifyPreviewIdentity(connectionString, previewRef, productionRef) {
  const parsed = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) throw new Error('Preview database URL must use PostgreSQL');
  if (!previewRef || !productionRef || previewRef === productionRef) throw new Error('Preview and Production refs must be different');
  if (parsed.port !== '5432') throw new Error('Preview diagnostic requires port 5432');
  const username = decodeURIComponent(parsed.username);
  const direct = parsed.hostname === `db.${previewRef}.supabase.co` && username === 'postgres';
  const pooler = parsed.hostname.endsWith('.pooler.supabase.com') && username === `postgres.${previewRef}`;
  if (!direct && !pooler) throw new Error('Database identity does not match isolated Preview');
  if (connectionString.includes(productionRef)) throw new Error('Production ref appeared in Preview URL');
}

function one(rows) {
  return rows.length === 1 ? rows[0] : null;
}

const databaseUrl = required('PREVIEW_DATABASE_URL');
const previewRef = required('PREVIEW_PROJECT_REF');
const productionRef = required('PRODUCTION_PROJECT_REF');
const entityId = required('P09_UI_ENTITY_ID');
const outputPath = path.resolve(process.env.P09_UI_DIAGNOSTIC_PATH || 'artifacts/p09-ui-publish/diagnostic.json');
verifyPreviewIdentity(databaseUrl, previewRef, productionRef);

const parsed = new URL(databaseUrl);
const local = ['localhost', '127.0.0.1'].includes(parsed.hostname);
const client = new Client({
  connectionString: databaseUrl,
  ssl: local ? false : { rejectUnauthorized: false },
  application_name: 'drmuscat-p09-ui-publish-readonly-diagnostic',
  statement_timeout: 30000,
  query_timeout: 35000,
  connectionTimeoutMillis: 15000,
});

await client.connect();
try {
  await client.query('begin transaction read only');
  const serverNow = one((await client.query('select clock_timestamp() as now')).rows)?.now;
  const review = one((await client.query(`
    select id, actor_profile_id, snapshot_hash, entity_fingerprint, operation_attempt_id,
           idempotency_key, request_hash, patch_hash, expected_entity_version,
           created_at, expires_at
      from public.import_pharmacy_admin_read_states
     where entity_id = $1::uuid and operation = 'review'
     order by created_at desc
     limit 1
  `, [entityId])).rows);

  const latestAuth = review ? one((await client.query(`
    select id, review_state_id, review_snapshot_hash, entity_fingerprint,
           operation_attempt_id, idempotency_key, request_hash, patch_hash,
           expected_entity_version, status, expires_at, consumed_by_reservation_id
      from public.import_pharmacy_publish_authorizations
     where review_state_id = $1::uuid
     limit 1
  `, [review.id])).rows) : null;

  const consumedAuth = one((await client.query(`
    select id, review_state_id, review_snapshot_hash, entity_fingerprint,
           operation_attempt_id, idempotency_key, request_hash, patch_hash,
           expected_entity_version, status, expires_at, consumed_by_reservation_id
      from public.import_pharmacy_publish_authorizations
     where entity_id = $1::uuid
       and status = 'consumed'
       and consumed_by_reservation_id is not null
     order by consumed_at desc nulls last, issued_at desc
     limit 1
  `, [entityId])).rows);

  const boundReview = consumedAuth ? one((await client.query(`
    select id, actor_profile_id, snapshot_hash, entity_fingerprint, operation_attempt_id,
           idempotency_key, request_hash, patch_hash, expected_entity_version,
           created_at, expires_at
      from public.import_pharmacy_admin_read_states
     where id = $1::uuid and operation = 'review'
     limit 1
  `, [consumedAuth.review_state_id])).rows) : null;

  const reservation = consumedAuth?.consumed_by_reservation_id ? one((await client.query(`
    select id, actor_profile_id, entity_id, idempotency_key, request_hash,
           expected_version, status, expires_at, terminal_result
      from public.import_publish_idempotency_records
     where id = $1::uuid
     limit 1
  `, [consumedAuth.consumed_by_reservation_id])).rows) : null;

  const snapshots = reservation ? (await client.query(`
    select id, expected_version, snapshot_hash
      from public.import_publish_rollback_snapshots
     where idempotency_record_id = $1::uuid
  `, [reservation.id])).rows : [];

  const audits = reservation ? (await client.query(`
    select event_type, outcome, schema_version, coalesce(event_payload ->> 'phase', '') as phase,
           count(*)::int as count
      from public.import_publish_audit_events
     where idempotency_record_id = $1::uuid
     group by event_type, outcome, schema_version, coalesce(event_payload ->> 'phase', '')
     order by event_type, phase
  `, [reservation.id])).rows : [];

  const center = one((await client.query(`
    select updated_at, updated_at::text as updated_at_text, status::text as status,
           center_type::text as center_type, is_active, is_featured, deleted_at
      from public.centers
     where id = $1::uuid
     limit 1
  `, [entityId])).rows);

  const exact = {
    latestReviewExists: Boolean(review),
    latestReviewExpired: Boolean(review && serverNow && new Date(review.expires_at).getTime() <= new Date(serverNow).getTime()),
    latestReviewAuthStatus: latestAuth?.status ?? null,
    consumedAuthorizationExists: Boolean(consumedAuth),
    consumedAuthorizationBindsLatestReview: Boolean(review && consumedAuth && String(consumedAuth.review_state_id) === String(review.id)),
    boundReviewExists: Boolean(boundReview),
    reservationExists: Boolean(reservation),
    reservationStatus: reservation?.status ?? null,
    reservationLive: Boolean(reservation && serverNow && new Date(reservation.expires_at).getTime() > new Date(serverNow).getTime()),
    terminalResultPresent: Boolean(reservation?.terminal_result),
    snapshotCount: snapshots.length,
    reservationVersionMatchesBoundReviewText: Boolean(reservation && boundReview && reservation.expected_version === boundReview.expected_entity_version),
    snapshotVersionMatchesBoundReviewText: Boolean(snapshots.length === 1 && boundReview && snapshots[0].expected_version === boundReview.expected_entity_version),
    authorizationBindingsMatchBoundReview: Boolean(consumedAuth && boundReview &&
      consumedAuth.review_snapshot_hash === boundReview.snapshot_hash &&
      consumedAuth.entity_fingerprint === boundReview.entity_fingerprint &&
      consumedAuth.operation_attempt_id === boundReview.operation_attempt_id &&
      consumedAuth.idempotency_key === boundReview.idempotency_key &&
      consumedAuth.request_hash === boundReview.request_hash &&
      consumedAuth.patch_hash === boundReview.patch_hash &&
      consumedAuth.expected_entity_version === boundReview.expected_entity_version),
    centerExists: Boolean(center),
    centerType: center?.center_type ?? null,
    centerStatus: center?.status ?? null,
    centerPrivateDraftBoundary: Boolean(center && center.center_type === 'pharmacy' && center.status === 'draft' && center.is_active === false && center.is_featured === false && center.deleted_at === null),
    centerVersionTemporallyMatchesBoundReview: Boolean(center && boundReview && new Date(center.updated_at).getTime() === new Date(boundReview.expected_entity_version).getTime()),
    auditSummary: audits.map((row) => ({ eventType: row.event_type, outcome: row.outcome, schemaVersion: row.schema_version, phase: row.phase, count: row.count })),
  };

  const likelyBlockers = [];
  if (!exact.latestReviewExists) likelyBlockers.push('review_unavailable');
  if (!exact.consumedAuthorizationExists) likelyBlockers.push('consumed_authorization_unavailable');
  if (exact.consumedAuthorizationExists && !exact.boundReviewExists) likelyBlockers.push('bound_review_unavailable');
  if (exact.latestReviewExists && exact.consumedAuthorizationExists && !exact.consumedAuthorizationBindsLatestReview) likelyBlockers.push('latest_review_not_reservation_bound');
  if (!exact.reservationExists) likelyBlockers.push('reservation_unavailable');
  if (exact.reservationExists && exact.reservationStatus !== 'reserved' && !exact.terminalResultPresent) likelyBlockers.push('reservation_not_active');
  if (exact.reservationExists && !exact.reservationLive && !exact.terminalResultPresent) likelyBlockers.push('reservation_expired');
  if (exact.snapshotCount !== 1) likelyBlockers.push('snapshot_count_mismatch');
  if (!exact.authorizationBindingsMatchBoundReview) likelyBlockers.push('authorization_mismatch');
  if (!exact.reservationVersionMatchesBoundReviewText) likelyBlockers.push('reservation_version_text_mismatch');
  if (!exact.snapshotVersionMatchesBoundReviewText) likelyBlockers.push('snapshot_version_text_mismatch');
  if (!exact.centerPrivateDraftBoundary && !exact.terminalResultPresent) likelyBlockers.push('center_private_boundary_mismatch');
  if (!exact.centerVersionTemporallyMatchesBoundReview && !exact.terminalResultPresent) likelyBlockers.push('center_version_mismatch');

  const report = {
    schemaVersion: 'drkhaleej.p09UiPublishDiagnostic.v1',
    previewIdentityVerified: true,
    readOnly: true,
    productionDisconnected: true,
    exact,
    likelyBlockers,
  };
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report));
  await client.query('rollback');
} finally {
  await client.end();
}
