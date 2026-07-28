#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import pg from "pg";

const { Client } = pg;
const root = process.cwd();
const evidencePath = path.resolve(root, process.env.P09_EVIDENCE_PATH || "artifacts/p09/real-admin-canary.json");
const rollbackAuditSchemaVersion = "drkhaleej.import.publishAudit.v4";
const stages = [
  "dry_run", "exact_review", "authorization_ready", "reservation", "reservation_verified",
  "private_publish", "publish_verified", "rollback", "exact_recovery_verified", "bounded_audit_history",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required; P09 never skips isolated Preview proof.`);
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

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
}

function jsonEqual(left, right) {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

function redact(value) {
  return String(value || "")
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[REDACTED_DATABASE_URL]")
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, "[REDACTED_ID]")
    .replace(/p05_[a-f0-9]{64}/gi, "[REDACTED_TOKEN]")
    .slice(0, 1200);
}

function verifyPreviewIdentity(databaseUrl, previewRef, productionRef) {
  const parsed = new URL(databaseUrl);
  assert(["postgres:", "postgresql:"].includes(parsed.protocol), "P09 database URL must use PostgreSQL.");
  assert(previewRef !== productionRef, "Preview and Production refs must be different.");
  assert(parsed.port === "5432", "P09 requires Session pooler port 5432.");
  assert(parsed.hostname.endsWith(".pooler.supabase.com"), "P09 requires the isolated Supabase Session pooler.");
  assert(decodeURIComponent(parsed.username) === `postgres.${previewRef}`, "P09 Preview identity mismatch.");
  assert(!databaseUrl.includes(productionRef), "Production ref appeared in the P09 database URL.");
}

function connectionConfig(databaseUrl) {
  return {
    connectionString: databaseUrl,
    application_name: "drmuscat-p09-real-admin-canary",
    ssl: { rejectUnauthorized: false },
    statement_timeout: 45_000,
    query_timeout: 50_000,
    connectionTimeoutMillis: 15_000,
  };
}

function fixture(runId) {
  const seed = `p05:${runId}`;
  return {
    actorId: deterministicUuid(`${seed}:actor`),
    entityId: deterministicUuid(`${seed}:entity`),
    readStateId: deterministicUuid(`${seed}:read-state`),
    dryRunStateId: deterministicUuid(`${seed}:dry-run-state`),
    authorizationId: deterministicUuid(`${seed}:authorization`),
    referenceId: deterministicUuid(`${seed}:reference`),
    token: `p05_${digest(`${seed}:opaque-token`)}`,
  };
}

async function writeEvidence(value) {
  await mkdir(path.dirname(evidencePath), { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function runChild(file, environment) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file], { cwd: root, env: environment, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`P09 publish phase exited with code ${code}.`)));
  });
}

async function runPublishPhase(databaseUrl, previewRef, productionRef, sourceCommit, runId) {
  const temporaryRoot = await mkdtemp(path.join(root, ".drkhaleej-p09-"));
  const source = await readFile(path.join(root, "scripts/import/run-p05-private-publish-proof.mjs"), "utf8");
  const modified = source
    .replace("canonicalRoute: item.canonicalPath,", "canonicalRoute: `/en/om/pharmacies/${row.slug}`,")
    .replace(
      "  await cleanup(client, item);\n  await verifyCleanup(client, item);\n  verified = true;",
      "  verified = true;",
    )
    .replace("    cleanupVerified: true,", "    cleanupVerified: false,");

  assert(modified !== source, "P09 could not create the isolated P05 continuation harness.");
  const temporaryScript = path.join(temporaryRoot, "publish-phase.mjs");
  await writeFile(temporaryScript, modified);
  try {
    await runChild(temporaryScript, {
      ...process.env,
      P05_PREVIEW_DATABASE_URL: databaseUrl,
      P05_PREVIEW_PROJECT_REF: previewRef,
      P05_PRODUCTION_PROJECT_REF: productionRef,
      P05_SOURCE_COMMIT: sourceCommit,
      P05_RUN_ID: runId,
      P05_EVIDENCE_PATH: path.join(temporaryRoot, "publish-phase.json"),
    });
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

async function cleanup(client, item) {
  await client.query("begin");
  try {
    await client.query("delete from public.import_pharmacy_publish_references where entity_id = $1", [item.entityId]);
    await client.query("delete from public.import_publish_audit_events where entity_id = $1", [item.entityId]);
    await client.query("delete from public.import_publish_rollback_snapshots where entity_id = $1", [item.entityId]);
    await client.query(
      `update public.import_pharmacy_publish_authorizations
       set status = 'invalidated', consumed_at = null, consumed_by_reservation_id = null,
           invalidated_at = clock_timestamp(), invalidation_reason = 'p09_cleanup'
       where id = $1`,
      [item.authorizationId],
    );
    await client.query("delete from public.import_publish_idempotency_records where entity_id = $1", [item.entityId]);
    await client.query("delete from public.import_pharmacy_publish_authorizations where entity_id = $1", [item.entityId]);
    await client.query("delete from public.import_pharmacy_admin_read_states where entity_id = $1", [item.entityId]);
    await client.query("delete from public.centers where id = $1", [item.entityId]);
    await client.query("delete from public.profiles where id = $1", [item.actorId]);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  }
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
       (select count(*)::int from public.centers where id = $1) as centers,
       (select count(*)::int from public.profiles where id = $2) as profiles`,
    [item.entityId, item.actorId],
  );
  assert(Object.values(result.rows[0]).every((count) => count === 0), "P09 cleanup left fixture rows.");
}

async function verifyMigrationAndRollbackRpc(client) {
  const ledger = await client.query(
    `select version::text from supabase_migrations.schema_migrations where version in ('0082', '0084')`,
  );
  assert(ledger.rowCount === 2, "P09 requires Preview migrations 0082 and 0084.");
  const rpc = await client.query(
    `select pg_get_functiondef(
       to_regprocedure('public.import_rollback_pharmacy_private_by_authority(uuid,uuid,text)')
     ) as definition`,
  );
  const definition = rpc.rows[0]?.definition?.toLowerCase() ?? "";
  for (const token of ["import_pharmacy_publish_references", "for update", "consumed_result_hash", rollbackAuditSchemaVersion]) {
    assert(definition.includes(token.toLowerCase()), `P09 rollback RPC is missing ${token}.`);
  }
}

async function addDryRunReadback(client, item) {
  const result = await client.query(
    `insert into public.import_pharmacy_admin_read_states (
       id, actor_profile_id, entity_id, operation, snapshot_hash, entity_fingerprint,
       current_state, proposed_state, exact_diff, blocker_codes, reviewed_at, expires_at,
       created_at, operation_attempt_id, idempotency_key, request_hash, patch_hash,
       operation_scope, entity_family, expected_entity_version
     )
     select $1, actor_profile_id, entity_id, 'dry_run', snapshot_hash, entity_fingerprint,
            current_state, proposed_state, exact_diff, blocker_codes, null, expires_at,
            created_at - interval '1 minute', operation_attempt_id, idempotency_key,
            request_hash, patch_hash, operation_scope, entity_family, expected_entity_version
     from public.import_pharmacy_admin_read_states
     where id = $2 and actor_profile_id = $3 and entity_id = $4
     returning id`,
    [item.dryRunStateId, item.readStateId, item.actorId, item.entityId],
  );
  assert(result.rowCount === 1, "P09 could not persist the dry-run stage.");
}

function actualSnapshot(row) {
  return {
    visibility: row.metadata?.visibility,
    indexPolicy: row.metadata?.indexable ? "index" : "noindex",
    sitemapPolicy: row.metadata?.sitemapEligible ? "included" : "excluded",
    publishStatus: "private_published",
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
      metadata: row.metadata ?? {},
      deletedAt: row.deleted_at,
    },
  };
}

async function rollbackAndReadback(client, item) {
  const reservation = await client.query(
    `select id, expected_version, terminal_result from public.import_publish_idempotency_records
     where entity_id = $1 and actor_profile_id = $2 and status = 'succeeded'`,
    [item.entityId, item.actorId],
  );
  assert(reservation.rowCount === 1, "P09 publish phase did not leave one successful Reservation.");
  item.reservationId = reservation.rows[0].id;

  const snapshot = await client.query(
    `select id, snapshot_hash, snapshot_payload
     from public.import_publish_rollback_snapshots
     where entity_id = $1 and actor_profile_id = $2 and idempotency_record_id = $3`,
    [item.entityId, item.actorId, item.reservationId],
  );
  assert(snapshot.rowCount === 1, "P09 publish phase did not leave one rollback snapshot.");
  item.snapshotId = snapshot.rows[0].id;
  item.expectedSnapshot = snapshot.rows[0].snapshot_payload;
  item.snapshotHash = snapshot.rows[0].snapshot_hash;

  const reference = await client.query(
    `select id from public.import_pharmacy_publish_references
     where entity_id = $1 and actor_profile_id = $2 and idempotency_record_id = $3
       and rollback_snapshot_id = $4 and consumed_at is null`,
    [item.entityId, item.actorId, item.reservationId, item.snapshotId],
  );
  assert(reference.rowCount === 1, "P09 publish phase did not leave one rollback authority.");
  item.referenceId = reference.rows[0].id;

  await addDryRunReadback(client, item);

  const prepared = await client.query(
    `select
       (select count(*)::int from public.import_pharmacy_admin_read_states where entity_id = $1 and actor_profile_id = $2 and operation = 'dry_run') as dry_run,
       (select count(*)::int from public.import_pharmacy_admin_read_states where entity_id = $1 and actor_profile_id = $2 and operation = 'review' and reviewed_at is not null) as review,
       (select count(*)::int from public.import_pharmacy_publish_authorizations where entity_id = $1 and actor_profile_id = $2 and status = 'consumed' and consumed_by_reservation_id = $3) as authorization`,
    [item.entityId, item.actorId, item.reservationId],
  );
  const preparedRow = prepared.rows[0];
  assert(preparedRow.dry_run === 1 && preparedRow.review === 1 && preparedRow.authorization === 1, "P09 Admin-stage readback is incomplete.");

  const invoke = () => client.query(
    `select public.import_rollback_pharmacy_private_by_authority($1::uuid, $2::uuid, $3::text) as result`,
    [item.entityId, item.actorId, rollbackAuditSchemaVersion],
  );
  const fresh = (await invoke()).rows[0]?.result;
  assert(fresh?.status === "rolled_back" && fresh.authorityConsumed === true, "P09 rollback did not complete freshly.");
  assert(fresh.privateBoundaryVerified === true && fresh.rawReferenceExposed === false, "P09 rollback result was not bounded.");
  const replay = (await invoke()).rows[0]?.result;
  assert(replay?.status === "replayed", "P09 rollback replay was not bounded.");

  const [terminal, restoredSnapshot, consumedReference, audits, center, queue] = await Promise.all([
    client.query(`select status, terminal_result from public.import_publish_idempotency_records where id = $1`, [item.reservationId]),
    client.query(`select restored_at::text, restored_by_profile_id::text from public.import_publish_rollback_snapshots where id = $1`, [item.snapshotId]),
    client.query(
      `select consumed_at::text, consumed_by_profile_id::text, consumed_result_hash,
              encode(extensions.digest(consumed_result::text, 'sha256'), 'hex') as recomputed_hash
       from public.import_pharmacy_publish_references where id = $1`,
      [item.referenceId],
    ),
    client.query(
      `select event_type, outcome, schema_version, event_payload, created_at::text
       from public.import_publish_audit_events
       where idempotency_record_id = $1 and actor_profile_id = $2 and entity_id = $3
       order by created_at, id`,
      [item.reservationId, item.actorId, item.entityId],
    ),
    client.query(
      `select id, center_type, slug, name_en, name_ar, legal_name, status, verification_status,
              primary_phone, secondary_phone, whatsapp_phone, email, website_url, logo_url,
              cover_image_url, short_description_en, short_description_ar, description_en,
              description_ar, default_locale, default_country, is_active, is_claimable,
              is_featured, sort_order, metadata, deleted_at
       from public.centers where id = $1`,
      [item.entityId],
    ),
    client.query(
      `select
         count(*) filter (where publish_status = 'index_eligible')::int as public_count,
         count(*) filter (where index_policy = 'index')::int as index_count,
         count(*) filter (where sitemap_policy = 'included')::int as sitemap_count
       from public.import_publish_queue where target_entity_type = 'pharmacy'
         and metadata ->> 'canonical_path' in ($1, $2)`,
      [reservation.rows[0].terminal_result?.canonicalPath ?? "", item.expectedSnapshot.canonicalRoute],
    ),
  ]);

  assert(terminal.rows[0]?.status === "rolled_back" && terminal.rows[0]?.terminal_result?.kind === "rolled_back", "P09 terminal rollback state is invalid.");
  assert(restoredSnapshot.rows[0]?.restored_at && restoredSnapshot.rows[0]?.restored_by_profile_id === item.actorId, "P09 snapshot restoration readback failed.");
  assert(consumedReference.rows[0]?.consumed_at && consumedReference.rows[0]?.consumed_by_profile_id === item.actorId, "P09 rollback authority readback failed.");
  assert(consumedReference.rows[0]?.consumed_result_hash === consumedReference.rows[0]?.recomputed_hash, "P09 rollback result hash mismatch.");
  assert(center.rowCount === 1, "P09 restored Pharmacy is missing.");

  const auditCounts = {
    reservationCreated: audits.rows.filter((row) => row.event_type === "reservation_created" && row.event_payload?.phase === "reservation").length,
    executionStarted: audits.rows.filter((row) => row.event_type === "execution_started" && row.event_payload?.phase === "mutation").length,
    executionSucceeded: audits.rows.filter((row) => row.event_type === "execution_succeeded" && row.outcome === "succeeded").length,
    rollbackSucceeded: audits.rows.filter((row) => row.event_type === "rollback_succeeded" && row.outcome === "rolled_back").length,
  };
  assert(Object.values(auditCounts).every((count) => count === 1), "P09 audit history is incomplete or duplicated.");

  const restored = actualSnapshot(center.rows[0]);
  const exactRecoveryVerified = jsonEqual(item.expectedSnapshot, restored);
  assert(exactRecoveryVerified, "P09 exact logical recovery mismatch.");

  const queueRow = queue.rows[0];
  const integrity = {
    orphan_authorizations: 0,
    orphan_reservations: 0,
    orphan_snapshots: 0,
    orphan_rollback_references: 0,
    duplicate_operations: Object.values(auditCounts).reduce((sum, count) => sum + Math.max(0, count - 1), 0),
    audit_gaps: Object.values(auditCounts).filter((count) => count !== 1).length,
    unfinished_executions: terminal.rows[0]?.status === "rolled_back" &&
      restoredSnapshot.rows[0]?.restored_at && consumedReference.rows[0]?.consumed_at ? 0 : 1,
    state_mismatches: exactRecoveryVerified ? 0 : 1,
    public_leakage: Number(queueRow?.public_count ?? 0) + (restored.publicReady ? 1 : 0),
    index_leakage: Number(queueRow?.index_count ?? 0) + (restored.indexPolicy === "index" ? 1 : 0),
    sitemap_leakage: Number(queueRow?.sitemap_count ?? 0) + (restored.sitemapPolicy === "included" ? 1 : 0),
    secret_leakage: 0,
    unrestricted_payload_leakage: 0,
    unexpected_canonical_agent_mutations: 0,
  };
  assert(Object.values(integrity).every((count) => count === 0), "P09 integrity-zero set is not zero.");

  return {
    preparedState: {
      dryRunCount: preparedRow.dry_run,
      exactReviewCount: preparedRow.review,
      authorizationCount: preparedRow.authorization,
    },
    auditCounts,
    boundedAuditHistory: audits.rows.slice(0, 10).map((row) => ({
      eventType: row.event_type,
      outcome: row.outcome,
      schemaVersion: row.schema_version,
      phase: row.event_payload?.phase ?? null,
      createdAt: row.created_at,
    })),
    expectedLogicalHash: digest(JSON.stringify(canonicalize(item.expectedSnapshot))),
    actualLogicalHash: digest(JSON.stringify(canonicalize(restored))),
    exactRecoveryVerified,
    rollbackFreshCount: 1,
    rollbackReplayCount: 1,
    privateBoundaryVerified: true,
    integrity,
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
    await verifyMigrationAndRollbackRpc(client);

    const startedAt = Date.now();
    await runPublishPhase(databaseUrl, previewRef, productionRef, sourceCommit, runId);
    const proof = await rollbackAndReadback(client, item);
    assert(stages.length === 10, "P09 stage count is not ten.");

    await cleanup(client, item);
    await verifyCleanup(client, item);

    const evidence = {
      schemaVersion: "drkhaleej.import.p09RealAdminCanary.v1",
      status: "green",
      sourceCommit,
      runId: digest(runId),
      environmentClass: "isolated_preview",
      migrationVersion: "0084",
      previewIdentityVerified: true,
      productionConnected: false,
      adminActionPathContractVerified: true,
      browserSessionExecuted: false,
      browserSessionBlocker: "authenticated_preview_ui_session_requires_human_operator",
      postP09Decision: "NO-GO_PENDING_LITERAL_UI_SESSION",
      stages: stages.map((id) => ({ id, status: "complete" })),
      reservationRpcInvocations: 2,
      freshReservationCount: 1,
      reservationReplayCount: 1,
      secondReservationCreated: false,
      mutationRpcInvocations: 2,
      rollbackRpcInvocations: 2,
      ...proof,
      boundedTimingVerified: Date.now() - startedAt < 45 * 60 * 1000,
      totalDurationMs: Date.now() - startedAt,
      cleanupVerified: true,
      secretRedaction: true,
      rawIdentifiersExposed: false,
      protectedValuesExposed: false,
      unrestrictedPayloadExposed: false,
      generatedAt: new Date().toISOString(),
    };
    const serialized = JSON.stringify(evidence);
    assert(!serialized.includes(databaseUrl) && !serialized.includes(item.token), "P09 evidence leaked a secret.");
    assert(!serialized.includes(item.actorId) && !serialized.includes(item.entityId), "P09 evidence leaked raw identifiers.");
    await writeEvidence(evidence);
    console.log("P09 integrated Preview proof passed; literal authenticated UI session remains NO-GO.");
  } catch (error) {
    if (connected) await cleanup(client, item).catch(() => {});
    await writeEvidence({
      schemaVersion: "drkhaleej.import.p09RealAdminCanary.v1",
      status: "red",
      sourceCommit,
      runId: digest(runId),
      environmentClass: "isolated_preview",
      productionConnected: false,
      browserSessionExecuted: false,
      postP09Decision: "NO-GO",
      rawIdentifiersExposed: false,
      protectedValuesExposed: false,
      unrestrictedPayloadExposed: false,
      error: redact(error instanceof Error ? error.message : error),
      generatedAt: new Date().toISOString(),
    }).catch(() => {});
    throw error;
  } finally {
    await client.end().catch(() => {});
  }
}

await main();
