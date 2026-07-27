#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Client } = pg;
const root = process.cwd();
const evidencePath = path.resolve(
  root,
  process.env.P09_POSTGREST_VERSION_DIAGNOSTIC_PATH || "artifacts/p09/postgrest-version-diagnostic.json",
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

function sameInstant(left, right) {
  const leftMs = Date.parse(left);
  const rightMs = Date.parse(right);
  return Number.isFinite(leftMs) && Number.isFinite(rightMs) && leftMs === rightMs;
}

function verifyPreviewIdentity(databaseUrl, previewRef, productionRef) {
  const parsed = new URL(databaseUrl);
  assert(["postgres:", "postgresql:"].includes(parsed.protocol), "PostgREST diagnostic requires PostgreSQL.");
  assert(previewRef !== productionRef, "Preview and Production refs must differ.");
  assert(parsed.port === "5432", "PostgREST diagnostic requires Session pooler port 5432.");
  assert(parsed.hostname.endsWith(".pooler.supabase.com"), "PostgREST diagnostic requires Supabase Session pooler.");
  assert(decodeURIComponent(parsed.username) === `postgres.${previewRef}`, "PostgREST diagnostic Preview identity mismatch.");
  assert(!databaseUrl.includes(productionRef), "Production ref appeared in Preview URL.");
}

const databaseUrl = required("P09_PREVIEW_DATABASE_URL");
const previewRef = required("P09_PREVIEW_PROJECT_REF");
const productionRef = required("P09_PRODUCTION_PROJECT_REF");
const entityHash = required("P09_LITERAL_ENTITY_SHA256");
const sourceCommit = required("P09_SOURCE_COMMIT");
verifyPreviewIdentity(databaseUrl, previewRef, productionRef);

const client = new Client({
  connectionString: databaseUrl,
  application_name: "drmuscat-p09-postgrest-version-diagnostic",
  ssl: { rejectUnauthorized: false },
  statement_timeout: 30_000,
  query_timeout: 35_000,
  connectionTimeoutMillis: 15_000,
});

let evidence = {
  schemaVersion: "drkhaleej.import.p09PostgrestVersionDiagnostic.v1",
  sourceCommit,
  matched: false,
  postgrestExact: false,
  temporalExact: false,
  pgDisplayExact: false,
  productionConnected: false,
  mutationPerformed: false,
  rawValuesExposed: false,
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
  if (entityId) {
    const result = await client.query(
      `select
         r.expected_entity_version as review_version,
         to_jsonb(c.updated_at) #>> '{}' as postgrest_version,
         c.updated_at::text as pg_display_version
       from public.import_pharmacy_admin_read_states r
       join public.centers c on c.id = r.entity_id
       where r.entity_id = $1 and r.operation = 'review'
       order by r.created_at desc, r.id desc
       limit 1`,
      [entityId],
    );
    const row = result.rows[0] ?? null;
    if (row) {
      evidence = {
        ...evidence,
        matched: true,
        postgrestExact: row.postgrest_version === row.review_version,
        temporalExact: sameInstant(row.postgrest_version, row.review_version),
        pgDisplayExact: row.pg_display_version === row.review_version,
      };
    }
  }
} finally {
  await mkdir(path.dirname(evidencePath), { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  await client.end().catch(() => {});
}

console.log(`P09 PostgREST version diagnostic: matched=${evidence.matched} exact=${evidence.postgrestExact} temporal=${evidence.temporalExact}`);
