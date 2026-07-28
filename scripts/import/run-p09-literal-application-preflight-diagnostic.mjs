#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Client } = pg;
const root = process.cwd();
const evidencePath = path.resolve(
  root,
  process.env.P09_LITERAL_APPLICATION_PREFLIGHT_PATH ||
    "artifacts/p09/literal-application-preflight-diagnostic.json",
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

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function verifyPreviewIdentity(databaseUrl, previewRef, productionRef) {
  const parsed = new URL(databaseUrl);
  assert(["postgres:", "postgresql:"].includes(parsed.protocol), "Application preflight requires PostgreSQL.");
  assert(previewRef !== productionRef, "Preview and Production refs must differ.");
  assert(parsed.port === "5432", "Application preflight requires Session pooler port 5432.");
  assert(parsed.hostname.endsWith(".pooler.supabase.com"), "Application preflight requires Supabase Session pooler.");
  assert(decodeURIComponent(parsed.username) === `postgres.${previewRef}`, "Application preflight Preview identity mismatch.");
  assert(!databaseUrl.includes(productionRef), "Production ref appeared in Preview database URL.");
}

const databaseUrl = required("P09_PREVIEW_DATABASE_URL");
const previewRef = required("P09_PREVIEW_PROJECT_REF");
const productionRef = required("P09_PRODUCTION_PROJECT_REF");
const entityHash = required("P09_LITERAL_ENTITY_SHA256");
const sourceCommit = required("P09_SOURCE_COMMIT");
verifyPreviewIdentity(databaseUrl, previewRef, productionRef);

const client = new Client({
  connectionString: databaseUrl,
  application_name: "drmuscat-p09-literal-application-preflight",
  ssl: { rejectUnauthorized: false },
  statement_timeout: 45_000,
  query_timeout: 50_000,
  connectionTimeoutMillis: 15_000,
});

let evidence = {
  schemaVersion: "drkhaleej.import.p09LiteralApplicationPreflight.v1",
  sourceCommit,
  matched: false,
  blockers: ["diagnostic_unavailable"],
  productionConnected: false,
  mutationPerformed: false,
  rawIdentifiersExposed: false,
};

try {
  await client.connect();
  await client.query("set default_transaction_read_only = on");

  const candidates = await client.query(`
    select distinct entity_id::text
    from public.import_pharmacy_admin_read_states
    where entity_id is not null
  `);
  const entityId = candidates.rows.find((row) => hash(row.entity_id) === entityHash)?.entity_id ?? null;
  if (!entityId) throw new Error("literal_entity_not_found");

  const result = await client.query(
    `select
       c.center_type::text,
       c.name_en,
       c.metadata,
       c.status::text,
       c.is_active,
       c.is_featured,
       c.deleted_at,
       r.expected_entity_version,
       r.snapshot_hash,
       r.entity_fingerprint,
       i.id is not null as reservation_exists,
       i.status as reservation_status,
       i.expires_at > now() as reservation_live,
       s.id is not null as snapshot_exists,
       s.snapshot_payload
     from public.import_pharmacy_admin_read_states r
     join public.import_pharmacy_publish_authorizations a
       on a.review_state_id = r.id and a.status = 'consumed'
     join public.import_publish_idempotency_records i
       on i.id = a.consumed_by_reservation_id
     join public.import_publish_rollback_snapshots s
       on s.idempotency_record_id = i.id
     join public.centers c on c.id = r.entity_id
     where r.entity_id = $1 and r.operation = 'review'
     order by r.created_at desc, r.id desc
     limit 1`,
    [entityId],
  );

  const row = result.rows[0] ?? null;
  if (!row) throw new Error("literal_application_state_not_found");

  const metadata = isObject(row.metadata) ? row.metadata : null;
  const snapshot = isObject(row.snapshot_payload) ? row.snapshot_payload : null;
  const snapshotCenter = snapshot && isObject(snapshot.center) ? snapshot.center : null;
  const snapshotMetadata = snapshotCenter && isObject(snapshotCenter.metadata) ? snapshotCenter.metadata : null;
  const source = metadata && typeof metadata.source === "string" ? metadata.source : "manual";
  const supportedSources = new Set(["manual", "csv", "excel", "api", "ai_assisted"]);
  const blockers = [];

  if (!supportedSources.has(source)) blockers.push("source_unsupported");
  if (row.center_type !== "pharmacy") blockers.push("entity_type_unsupported");
  if (typeof row.name_en !== "string" || row.name_en.trim().length === 0) blockers.push("name_missing");
  if (!metadata || !isObject(metadata.sourceEvidence)) blockers.push("source_evidence_missing");
  if (!metadata || !isObject(metadata.canonicalGeo)) blockers.push("canonical_geo_missing");
  if (!row.reservation_exists || row.reservation_status !== "reserved" || row.reservation_live !== true) {
    blockers.push("reservation_not_reserved");
  }
  if (!row.snapshot_exists || !snapshot || !snapshotCenter || !snapshotMetadata) blockers.push("rollback_state_missing");
  if (!snapshot || typeof snapshot.canonicalRoute !== "string" || snapshot.canonicalRoute.length === 0) {
    blockers.push("canonical_route_missing");
  }
  if (!snapshotMetadata || typeof snapshotMetadata.projectionVersion !== "string") {
    blockers.push("projection_version_missing");
  }
  if (!snapshotMetadata || !isObject(snapshotMetadata.canonicalGeo)) blockers.push("snapshot_canonical_geo_missing");
  if (row.status !== "draft" || row.is_active || row.is_featured || row.deleted_at !== null) {
    blockers.push("private_boundary_invalid");
  }

  evidence = {
    ...evidence,
    matched: true,
    blockers,
    draft: {
      sourceSupported: supportedSources.has(source),
      entityTypeSupported: row.center_type === "pharmacy",
      namePresent: typeof row.name_en === "string" && row.name_en.trim().length > 0,
      sourceEvidencePresent: Boolean(metadata && isObject(metadata.sourceEvidence)),
      canonicalGeoPresent: Boolean(metadata && isObject(metadata.canonicalGeo)),
    },
    executionBoundary: {
      reservationLive: row.reservation_live === true,
      snapshotPresent: Boolean(snapshot),
      canonicalRoutePresent: Boolean(snapshot && typeof snapshot.canonicalRoute === "string" && snapshot.canonicalRoute.length > 0),
      projectionVersionPresent: Boolean(snapshotMetadata && typeof snapshotMetadata.projectionVersion === "string"),
      canonicalGeoPresent: Boolean(snapshotMetadata && isObject(snapshotMetadata.canonicalGeo)),
      privateBoundary: row.status === "draft" && !row.is_active && !row.is_featured && row.deleted_at === null,
    },
  };
} finally {
  await mkdir(path.dirname(evidencePath), { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  await client.end().catch(() => {});
}

console.log(`P09 literal application preflight: ${evidence.blockers.length === 0 ? "clear" : evidence.blockers.join(",")}`);
