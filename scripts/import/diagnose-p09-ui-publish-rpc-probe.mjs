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
const one = (rows) => rows.length === 1 ? rows[0] : null;

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
const outputPath = path.resolve(process.env.P09_UI_DIAGNOSTIC_PATH || 'artifacts/p09-ui-publish/rpc-probe.json');
verifyPreviewIdentity(databaseUrl, previewRef, productionRef);

const parsed = new URL(databaseUrl);
const client = new Client({
  connectionString: databaseUrl,
  ssl: ['localhost', '127.0.0.1'].includes(parsed.hostname) ? false : { rejectUnauthorized: false },
  application_name: 'drmuscat-p09-ui-publish-rpc-rollback-probe',
  statement_timeout: 30000,
  query_timeout: 35000,
  connectionTimeoutMillis: 15000,
});

let report = {
  schemaVersion: 'drkhaleej.p09UiPublishRpcProbe.v1',
  previewIdentityVerified: true,
  productionDisconnected: true,
  transactionRolledBack: false,
  rpcStatus: null,
  rpcReason: null,
  errorCode: null,
  errorClass: null,
};

await client.connect();
try {
  await client.query('begin');
  const review = one((await client.query(`
    select id, actor_profile_id, entity_id, expected_entity_version
      from public.import_pharmacy_admin_read_states
     where entity_id = $1::uuid and operation = 'review'
     order by created_at desc limit 1
  `, [entityId])).rows);
  const auth = review ? one((await client.query(`
    select id, consumed_by_reservation_id, status
      from public.import_pharmacy_publish_authorizations
     where review_state_id = $1::uuid limit 1
  `, [review.id])).rows) : null;
  const reservation = auth?.consumed_by_reservation_id ? one((await client.query(`
    select id, status from public.import_publish_idempotency_records where id = $1::uuid
  `, [auth.consumed_by_reservation_id])).rows) : null;
  const snapshot = reservation ? one((await client.query(`
    select id from public.import_publish_rollback_snapshots where idempotency_record_id = $1::uuid
  `, [reservation.id])).rows) : null;
  const audit = reservation ? one((await client.query(`
    select id from public.import_publish_audit_events
     where idempotency_record_id = $1::uuid
       and outcome = 'pending'
       and event_payload ->> 'phase' = 'reservation'
       and event_type in ('reservation_created','execution_started')
  `, [reservation.id])).rows) : null;
  const center = one((await client.query(`
    select name_en, legal_name, slug, description_en, primary_phone, whatsapp_phone,
           email, website_url, metadata
      from public.centers where id = $1::uuid
  `, [entityId])).rows);

  if (!review || !auth || auth.status !== 'consumed' || !reservation || reservation.status !== 'reserved' || !snapshot || !audit || !center) {
    report = { ...report, errorClass: 'probe_precondition_failed' };
  } else {
    const metadata = center.metadata ?? {};
    const patch = {
      name_en: center.name_en,
      legal_name: center.legal_name,
      slug: center.slug,
      description_en: center.description_en,
      primary_phone: center.primary_phone,
      whatsapp_phone: center.whatsapp_phone,
      email: center.email,
      website_url: center.website_url,
      metadata_patch: {
        source: typeof metadata.source === 'string' ? metadata.source : 'manual',
        sourceEvidence: metadata.sourceEvidence ?? null,
        rawPayloadHash: typeof metadata.rawPayloadHash === 'string' ? metadata.rawPayloadHash : null,
        visibility: 'private',
        publicRouteEnabled: false,
        indexable: false,
        sitemapEligible: false,
      },
    };
    try {
      const response = await client.query(`
        select public.import_publish_pharmacy_private(
          $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid,
          $6::text, $7::jsonb, $8::text
        ) as result
      `, [
        reservation.id,
        snapshot.id,
        audit.id,
        entityId,
        review.actor_profile_id,
        review.expected_entity_version,
        JSON.stringify(patch),
        'drkhaleej.import.publishAudit.v3',
      ]);
      const value = response.rows[0]?.result ?? null;
      report = {
        ...report,
        rpcStatus: typeof value?.status === 'string' ? value.status : null,
        rpcReason: typeof value?.reason === 'string' ? value.reason : null,
        errorClass: value ? null : 'rpc_empty_result',
      };
    } catch (error) {
      report = {
        ...report,
        errorCode: typeof error?.code === 'string' ? error.code : null,
        errorClass: typeof error?.message === 'string'
          ? error.message.replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, '[REDACTED_UUID]').slice(0, 160)
          : 'rpc_exception',
      };
    }
  }
  await client.query('rollback');
  report.transactionRolledBack = true;
} catch (error) {
  try { await client.query('rollback'); report.transactionRolledBack = true; } catch {}
  report = {
    ...report,
    errorCode: typeof error?.code === 'string' ? error.code : null,
    errorClass: typeof error?.message === 'string'
      ? error.message.replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, '[REDACTED_UUID]').slice(0, 160)
      : 'probe_exception',
  };
} finally {
  await client.end();
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report));
