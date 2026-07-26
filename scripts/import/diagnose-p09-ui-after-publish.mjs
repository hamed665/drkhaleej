#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;

const required = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
};

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
const outputPath = path.resolve(process.env.P09_UI_DIAGNOSTIC_PATH || 'artifacts/p09-ui-after-publish/state.json');
verifyPreviewIdentity(databaseUrl, previewRef, productionRef);

const parsed = new URL(databaseUrl);
const client = new Client({
  connectionString: databaseUrl,
  ssl: ['localhost', '127.0.0.1'].includes(parsed.hostname) ? false : { rejectUnauthorized: false },
  application_name: 'drmuscat-p09-ui-after-publish-readonly',
  statement_timeout: 30000,
  query_timeout: 35000,
  connectionTimeoutMillis: 15000,
});

await client.connect();
try {
  await client.query('begin transaction read only');

  const reservationResult = await client.query(`
    select id, status, expires_at, terminal_result, created_at
      from public.import_publish_idempotency_records
     where entity_id = $1::uuid
     order by created_at desc
     limit 1
  `, [entityId]);
  const reservation = reservationResult.rows[0] ?? null;

  const centerResult = await client.query(`
    select status::text as status, is_active, is_featured, metadata, updated_at
      from public.centers
     where id = $1::uuid
     limit 1
  `, [entityId]);
  const center = centerResult.rows[0] ?? null;

  let referenceRows = [];
  let auditRows = [];
  let snapshotRows = [];
  if (reservation) {
    referenceRows = (await client.query(`
      select consumed_at, created_at
        from public.import_pharmacy_publish_references
       where idempotency_record_id = $1::uuid
       order by created_at desc
    `, [reservation.id])).rows;

    auditRows = (await client.query(`
      select event_type, outcome, coalesce(event_payload ->> 'phase', '') as phase, count(*)::int as count
        from public.import_publish_audit_events
       where idempotency_record_id = $1::uuid
       group by event_type, outcome, coalesce(event_payload ->> 'phase', '')
       order by event_type, phase
    `, [reservation.id])).rows;

    snapshotRows = (await client.query(`
      select restored_at
        from public.import_publish_rollback_snapshots
       where idempotency_record_id = $1::uuid
    `, [reservation.id])).rows;
  }

  const metadata = center?.metadata && typeof center.metadata === 'object' ? center.metadata : {};
  const terminal = reservation?.terminal_result && typeof reservation.terminal_result === 'object'
    ? reservation.terminal_result
    : {};

  const auditCount = (eventType, outcome, phase = null) => auditRows
    .filter((row) => row.event_type === eventType && row.outcome === outcome && (phase === null || row.phase === phase))
    .reduce((sum, row) => sum + Number(row.count || 0), 0);

  const report = {
    schemaVersion: 'drkhaleej.p09UiAfterPublishDiagnostic.v1',
    previewIdentityVerified: true,
    productionDisconnected: true,
    readOnly: true,
    state: {
      reservationExists: Boolean(reservation),
      reservationStatus: reservation?.status ?? null,
      reservationTerminalKind: terminal.kind ?? null,
      reservationLive: Boolean(reservation && new Date(reservation.expires_at).getTime() > Date.now()),
      publishReferenceCount: referenceRows.length,
      publishReferenceConsumedCount: referenceRows.filter((row) => row.consumed_at !== null).length,
      rollbackSnapshotCount: snapshotRows.length,
      rollbackRestoredCount: snapshotRows.filter((row) => row.restored_at !== null).length,
      mutationStartedCount: auditCount('execution_started', 'pending', 'mutation'),
      publishSucceededCount: auditCount('execution_succeeded', 'succeeded'),
      publishFailedCount: auditRows
        .filter((row) => row.event_type === 'execution_failed' || row.outcome === 'failed')
        .reduce((sum, row) => sum + Number(row.count || 0), 0),
      centerStatus: center?.status ?? null,
      centerPrivateBoundary: Boolean(
        center &&
        center.status === 'draft' &&
        center.is_active === false &&
        center.is_featured === false &&
        metadata.visibility === 'private' &&
        metadata.publicRouteEnabled === false &&
        metadata.indexable === false &&
        metadata.sitemapEligible === false
      ),
      centerUpdatedAfterReservation: Boolean(
        center && reservation && new Date(center.updated_at).getTime() >= new Date(reservation.created_at).getTime()
      ),
    },
    auditSummary: auditRows.map((row) => ({
      eventType: row.event_type,
      outcome: row.outcome,
      phase: row.phase || null,
      count: Number(row.count || 0),
    })),
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report));
  await client.query('rollback');
} finally {
  await client.end();
}
