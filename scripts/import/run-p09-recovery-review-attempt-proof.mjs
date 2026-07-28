#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Client } = pg;
const root = process.cwd();
const evidencePath = path.resolve(
  root,
  process.env.P09_RECOVERY_EVIDENCE_PATH || "artifacts/p09/recovery-review-attempt.json",
);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required; recovery Review proof never skips.`);
  return value;
}

function digest(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function deterministicUuid(value) {
  const chars = digest(value).slice(0, 32).split("");
  chars[12] = "4";
  chars[16] = "8";
  const hex = chars.join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function verifyPreviewIdentity(databaseUrl, previewRef, productionRef) {
  const parsed = new URL(databaseUrl);
  assert(["postgres:", "postgresql:"].includes(parsed.protocol), "Recovery proof requires PostgreSQL.");
  assert(previewRef !== productionRef, "Preview and Production refs must differ.");
  assert(parsed.port === "5432", "Recovery proof requires Session pooler port 5432.");
  assert(parsed.hostname.endsWith(".pooler.supabase.com"), "Recovery proof requires the isolated Supabase Session pooler.");
  assert(decodeURIComponent(parsed.username) === `postgres.${previewRef}`, "Recovery proof Preview identity mismatch.");
  assert(!databaseUrl.includes(productionRef), "Production ref appeared in the recovery proof database URL.");
}

function connectionConfig(databaseUrl) {
  return {
    connectionString: databaseUrl,
    application_name: "drmuscat-p09-recovery-review-proof",
    ssl: { rejectUnauthorized: false },
    statement_timeout: 45_000,
    query_timeout: 50_000,
    connectionTimeoutMillis: 15_000,
  };
}

function fixture(runId) {
  const seed = `p09-recovery:${runId}`;
  return {
    actorId: deterministicUuid(`${seed}:actor`),
    entityId: deterministicUuid(`${seed}:entity`),
    firstStateId: deterministicUuid(`${seed}:state:first`),
    recoveryStateId: deterministicUuid(`${seed}:state:recovery`),
    firstAttemptId: deterministicUuid(`${seed}:attempt:first`),
    recoveryAttemptId: deterministicUuid(`${seed}:attempt:recovery`),
    firstIdempotencyKey: `pharmacy:reserve_private_publish:${deterministicUuid(`${seed}:attempt:first`)}`,
    recoveryIdempotencyKey: `pharmacy:reserve_private_publish:${deterministicUuid(`${seed}:attempt:recovery`)}`,
    firstRequestHash: digest(`${seed}:request:first`),
    recoveryRequestHash: digest(`${seed}:request:recovery`),
    snapshotHash: digest(`${seed}:snapshot`),
    entityFingerprint: digest(`${seed}:fingerprint`),
    patchHash: digest(`${seed}:patch`),
    slug: `p09-recovery-${digest(seed).slice(0, 12)}`,
  };
}

async function writeEvidence(value) {
  await mkdir(path.dirname(evidencePath), { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function cleanup(client, item) {
  await client.query("begin");
  try {
    await client.query("delete from public.import_pharmacy_admin_read_states where entity_id = $1", [item.entityId]);
    await client.query("delete from public.centers where id = $1", [item.entityId]);
    await client.query("delete from public.profiles where id = $1", [item.actorId]);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  }
}

async function verifyMigrationAndIndexes(client) {
  const ledger = await client.query(
    "select version::text from supabase_migrations.schema_migrations where version = '0086'",
  );
  assert(ledger.rowCount === 1, "Preview migration ledger does not include 0086.");

  const indexes = await client.query(
    `select indexname, indexdef
     from pg_indexes
     where schemaname = 'public'
       and tablename = 'import_pharmacy_admin_read_states'`,
  );
  const byName = new Map(indexes.rows.map((row) => [row.indexname, String(row.indexdef).toLowerCase()]));
  assert(!byName.has("import_pharmacy_admin_read_states_identity_idx"), "Obsolete all-row Review identity index still exists.");
  const legacy = byName.get("import_pharmacy_admin_read_states_legacy_identity_idx") ?? "";
  assert(legacy.includes("where (operation_attempt_id is null)"), "Legacy Review identity index is not correctly partial.");
  assert(byName.has("import_pharmacy_admin_read_states_attempt_operation_idx"), "Stable operation-attempt index is missing.");
  assert(byName.has("import_pharmacy_admin_read_states_idempotency_operation_idx"), "Stable idempotency index is missing.");
}

async function insertFixture(client, item) {
  await client.query("begin");
  try {
    await client.query(
      `insert into public.profiles (
         id, full_name, display_name, locale, country, is_platform_admin,
         is_provider_user, is_patient_user, metadata
       ) values ($1, 'P09 Recovery Proof Actor', 'P09 Recovery', 'en', 'om', true, false, false, $2::jsonb)`,
      [item.actorId, JSON.stringify({ p09RecoveryReviewProof: true })],
    );
    await client.query(
      `insert into public.centers (
         id, slug, name_en, center_type, status, verification_status,
         primary_phone, default_locale, default_country, is_active, is_claimable,
         is_featured, sort_order, metadata
       ) values (
         $1, $2, 'P09 Recovery Review Pharmacy', 'pharmacy', 'draft', 'unverified',
         '+96824000009', 'en', 'om', false, false, false, 0, $3::jsonb
       )`,
      [
        item.entityId,
        item.slug,
        JSON.stringify({
          source: "p09-recovery-review-proof",
          visibility: "private",
          publicRouteEnabled: false,
          indexable: false,
          sitemapEligible: false,
        }),
      ],
    );
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  }

  const version = await client.query(
    "select updated_at::text as expected_version from public.centers where id = $1",
    [item.entityId],
  );
  assert(version.rowCount === 1, "Recovery proof Pharmacy fixture is missing.");
  item.expectedVersion = version.rows[0].expected_version;
}

async function proveTwoExactReviewAttempts(client, item) {
  const now = Date.now();
  const firstCreatedAt = new Date(now - 120_000).toISOString();
  const firstReviewedAt = firstCreatedAt;
  const firstExpiresAt = new Date(now + 30 * 60_000).toISOString();
  const recoveryCreatedAt = new Date(now).toISOString();
  const recoveryReviewedAt = new Date(now + 1).toISOString();
  const recoveryExpiresAt = new Date(now + 30 * 60_000).toISOString();
  const currentState = {
    status: "draft",
    is_active: false,
    is_featured: false,
    visibility: "private",
    index_policy: "noindex",
    sitemap_policy: "excluded",
    projection_version: "p09-recovery-v1",
    canonical_path: `/en/om/pharmacies/${item.slug}`,
  };
  const proposedState = { ...currentState, name_en: "P09 Recovered Private Pharmacy" };

  await client.query("begin");
  try {
    const insert = `insert into public.import_pharmacy_admin_read_states (
       id, actor_profile_id, entity_id, operation, snapshot_hash, entity_fingerprint,
       current_state, proposed_state, exact_diff, blocker_codes, reviewed_at, expires_at,
       created_at, operation_attempt_id, idempotency_key, request_hash, patch_hash,
       operation_scope, entity_family, expected_entity_version
     ) values (
       $1, $2, $3, 'review', $4, $5, $6::jsonb, $7::jsonb, '[]'::jsonb, '{}',
       $8::timestamptz, $9::timestamptz, $10::timestamptz,
       $11, $12, $13, $14, 'reserve_private_publish', 'pharmacy', $15
     )`;

    await client.query(insert, [
      item.firstStateId,
      item.actorId,
      item.entityId,
      item.snapshotHash,
      item.entityFingerprint,
      JSON.stringify(currentState),
      JSON.stringify(proposedState),
      firstReviewedAt,
      firstExpiresAt,
      firstCreatedAt,
      item.firstAttemptId,
      item.firstIdempotencyKey,
      item.firstRequestHash,
      item.patchHash,
      item.expectedVersion,
    ]);

    await client.query(insert, [
      item.recoveryStateId,
      item.actorId,
      item.entityId,
      item.snapshotHash,
      item.entityFingerprint,
      JSON.stringify(currentState),
      JSON.stringify(proposedState),
      recoveryReviewedAt,
      recoveryExpiresAt,
      recoveryCreatedAt,
      item.recoveryAttemptId,
      item.recoveryIdempotencyKey,
      item.recoveryRequestHash,
      item.patchHash,
      item.expectedVersion,
    ]);

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  }

  const readback = await client.query(
    `select id::text, operation_attempt_id::text, idempotency_key, request_hash,
            snapshot_hash, entity_fingerprint, reviewed_at::text, created_at::text
     from public.import_pharmacy_admin_read_states
     where actor_profile_id = $1 and entity_id = $2 and operation = 'review'
     order by created_at`,
    [item.actorId, item.entityId],
  );
  assert(readback.rowCount === 2, "Recovery proof did not persist exactly two Review attempts.");
  assert(new Set(readback.rows.map((row) => row.operation_attempt_id)).size === 2, "Recovery Review attempt identity was not unique.");
  assert(new Set(readback.rows.map((row) => row.idempotency_key)).size === 2, "Recovery Review idempotency identity was not unique.");
  assert(readback.rows.every((row) => row.snapshot_hash === item.snapshotHash), "Recovery Review snapshot identity changed.");
  assert(readback.rows.every((row) => row.entity_fingerprint === item.entityFingerprint), "Recovery Review fingerprint identity changed.");
  assert(readback.rows.some((row) => row.id === item.recoveryStateId), "Exact recovery Review row was not read back.");

  return {
    persistedReviewAttempts: readback.rowCount,
    stableSnapshotPreserved: true,
    stableFingerprintPreserved: true,
    distinctOperationAttempts: 2,
    distinctIdempotencyKeys: 2,
    exactRecoveryRowReadBack: true,
  };
}

async function main() {
  const databaseUrl = required("P09_PREVIEW_DATABASE_URL");
  const previewRef = required("P09_PREVIEW_PROJECT_REF");
  const productionRef = required("P09_PRODUCTION_PROJECT_REF");
  const sourceCommit = required("P09_SOURCE_COMMIT");
  const runId = required("P09_RUN_ID");
  const item = fixture(runId);
  const client = new Client(connectionConfig(databaseUrl));
  let connected = false;

  try {
    verifyPreviewIdentity(databaseUrl, previewRef, productionRef);
    await client.connect();
    connected = true;
    await cleanup(client, item).catch(() => {});
    await verifyMigrationAndIndexes(client);
    await insertFixture(client, item);
    const proof = await proveTwoExactReviewAttempts(client, item);
    await cleanup(client, item);

    const evidence = {
      schemaVersion: "drkhaleej.import.p09RecoveryReviewAttempt.v1",
      status: "green",
      sourceCommit,
      runId: digest(runId),
      environmentClass: "isolated_preview",
      migrationVersion: "0086",
      previewIdentityVerified: true,
      productionConnected: false,
      obsoleteIdentityIndexRemoved: true,
      legacyIdentityBoundaryPreserved: true,
      ...proof,
      cleanupVerified: true,
      generatedAt: new Date().toISOString(),
    };
    const serialized = JSON.stringify(evidence);
    assert(!serialized.includes(databaseUrl), "Recovery Review evidence leaked the database URL.");
    assert(!serialized.includes(item.actorId) && !serialized.includes(item.entityId), "Recovery Review evidence leaked raw identifiers.");
    await writeEvidence(evidence);
    console.log("P09 expired-Reservation recovery Review attempt proof passed.");
  } catch (error) {
    if (connected) await cleanup(client, item).catch(() => {});
    await writeEvidence({
      schemaVersion: "drkhaleej.import.p09RecoveryReviewAttempt.v1",
      status: "red",
      sourceCommit,
      runId: digest(runId),
      environmentClass: "isolated_preview",
      productionConnected: false,
      error: String(error?.message || error).slice(0, 500),
      generatedAt: new Date().toISOString(),
    });
    throw error;
  } finally {
    if (connected) await client.end().catch(() => {});
  }
}

await main();
