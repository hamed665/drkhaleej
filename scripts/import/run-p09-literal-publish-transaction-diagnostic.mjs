#!/usr/bin/env node

import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Client } = pg;
const root = process.cwd();
const evidencePath = path.resolve(
  root,
  process.env.P09_LITERAL_PUBLISH_DIAGNOSTIC_PATH || "artifacts/p09/literal-publish-transaction-diagnostic.json",
);

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function hash(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function verifyPreviewIdentity(databaseUrl, previewRef, productionRef) {
  const parsed = new URL(databaseUrl);
  assert(["postgres:", "postgresql:"].includes(parsed.protocol), "Transactional diagnostic requires PostgreSQL.");
  assert(previewRef !== productionRef, "Preview and Production refs must differ.");
  assert(parsed.port === "5432", "Transactional diagnostic requires Session pooler port 5432.");
  assert(parsed.hostname.endsWith(".pooler.supabase.com"), "Transactional diagnostic requires Supabase Session pooler.");
  assert(decodeURIComponent(parsed.username) === `postgres.${previewRef}`, "Transactional diagnostic Preview identity mismatch.");
  assert(!databaseUrl.includes(productionRef), "Production ref appeared in Preview URL.");
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const databaseUrl = required("P09_PREVIEW_DATABASE_URL");
const previewRef = required("P09_PREVIEW_PROJECT_REF");
const productionRef = required("P09_PRODUCTION_PROJECT_REF");
const entityHash = required("P09_LITERAL_ENTITY_SHA256");
const sourceCommit = required("P09_SOURCE_COMMIT");
verifyPreviewIdentity(databaseUrl, previewRef, productionRef);

const client = new Client({
  connectionString: databaseUrl,
  application_name: "drmuscat-p09-literal-publish-transaction-diagnostic",
  ssl: { rejectUnauthorized: false },
  statement_timeout: 45_000,
  query_timeout: 50_000,
  connectionTimeoutMillis: 15_000,
});

let transactionOpen = false;
let evidence = {
  schemaVersion: "drkhaleej.import.p09LiteralPublishTransactionDiagnostic.v1",
  sourceCommit,
  matched: false,
  rpcStatus: "not_run",
  rpcReason: null,
  rollbackVerified: false,
  productionConnected: false,
  durableMutationPerformed: false,
  rawIdentifiersExposed: false,
};

try {
  await client.connect();
  const candidates = await client.query(`
    select distinct entity_id::text
    from public.import_pharmacy_admin_read_states
    where entity_id is not null
  `);
  const entityId = candidates.rows.find((row) => hash(row.entity_id) === entityHash)?.entity_id ?? null;
  if (!entityId) throw new Error("literal_entity_not_found");

  const state = await client.query(
    `select
       r.actor_profile_id::text,
       r.id::text as review_state_id,
       r.expected_entity_version,
       a.id::text as authorization_id,
       a.consumed_by_reservation_id::text as reservation_id,
       s.id::text as snapshot_id,
       e.id::text as reservation_audit_id,
       c.id::text as entity_id,
       c.name_en, c.legal_name, c.slug, c.description_en,
       c.primary_phone, c.whatsapp_phone, c.email, c.website_url, c.metadata
     from public.import_pharmacy_admin_read_states r
     join public.import_pharmacy_publish_authorizations a
       on a.review_state_id = r.id and a.status = 'consumed'
     join public.import_publish_idempotency_records i
       on i.id = a.consumed_by_reservation_id and i.status = 'reserved'
     join public.import_publish_rollback_snapshots s
       on s.idempotency_record_id = i.id
     join public.import_publish_audit_events e
       on e.idempotency_record_id = i.id
      and e.rollback_snapshot_id = s.id
      and e.outcome = 'pending'
      and e.event_payload ->> 'phase' = 'reservation'
      and e.event_type in ('reservation_created','execution_started')
     join public.centers c on c.id = r.entity_id
     where r.entity_id = $1 and r.operation = 'review'
     order by r.created_at desc, r.id desc
     limit 1`,
    [entityId],
  );
  const row = state.rows[0] ?? null;
  if (!row) throw new Error("literal_publish_state_not_found");

  const metadata = isObject(row.metadata) ? row.metadata : {};
  const patch = {
    name_en: row.name_en,
    legal_name: row.legal_name,
    slug: row.slug,
    description_en: row.description_en,
    primary_phone: row.primary_phone,
    whatsapp_phone: row.whatsapp_phone,
    email: row.email,
    website_url: row.website_url,
    metadata_patch: {
      source: typeof metadata.source === "string" ? metadata.source : "manual",
      sourceEvidence: metadata.sourceEvidence ?? {
        source: typeof metadata.source === "string" ? metadata.source : "manual",
        sourceId: null,
        sourceName: null,
        importedBy: null,
        importedAt: null,
      },
      rawPayloadHash: typeof metadata.rawPayloadHash === "string" ? metadata.rawPayloadHash : null,
      visibility: "private",
      publicRouteEnabled: false,
      indexable: false,
      sitemapEligible: false,
    },
  };

  const before = await client.query(
    `select
       (select count(*)::int from public.import_publish_audit_events
        where idempotency_record_id = $1 and event_type = 'execution_started'
          and event_payload ->> 'phase' = 'mutation') as mutation_audits,
       (select count(*)::int from public.import_pharmacy_publish_references
        where idempotency_record_id = $1) as publish_references`,
    [row.reservation_id],
  );

  await client.query("begin");
  transactionOpen = true;
  const rpc = await client.query(
    `select public.import_publish_pharmacy_private(
       $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid,
       $6::text, $7::jsonb, $8::text
     ) as result`,
    [
      row.reservation_id,
      row.snapshot_id,
      row.reservation_audit_id,
      row.entity_id,
      row.actor_profile_id,
      row.expected_entity_version,
      JSON.stringify(patch),
      "drkhaleej.import.publishAudit.v3",
    ],
  );
  const result = rpc.rows[0]?.result ?? null;
  await client.query("rollback");
  transactionOpen = false;

  const after = await client.query(
    `select
       (select count(*)::int from public.import_publish_audit_events
        where idempotency_record_id = $1 and event_type = 'execution_started'
          and event_payload ->> 'phase' = 'mutation') as mutation_audits,
       (select count(*)::int from public.import_pharmacy_publish_references
        where idempotency_record_id = $1) as publish_references`,
    [row.reservation_id],
  );
  const beforeCounts = before.rows[0] ?? {};
  const afterCounts = after.rows[0] ?? {};
  const rollbackVerified = beforeCounts.mutation_audits === afterCounts.mutation_audits &&
    beforeCounts.publish_references === afterCounts.publish_references;

  evidence = {
    ...evidence,
    matched: true,
    rpcStatus: isObject(result) && typeof result.status === "string" ? result.status : "invalid_result",
    rpcReason: isObject(result) && typeof result.reason === "string" ? result.reason : null,
    rollbackVerified,
  };
  assert(rollbackVerified, "Transactional diagnostic rollback was not exact.");
} finally {
  if (transactionOpen) await client.query("rollback").catch(() => {});
  await mkdir(path.dirname(evidencePath), { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  await client.end().catch(() => {});
}

console.log(`P09 literal publish transaction diagnostic: ${evidence.rpcStatus}${evidence.rpcReason ? `:${evidence.rpcReason}` : ""}`);
