#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Client } = pg;
const root = process.cwd();
const evidencePath = path.resolve(
  root,
  process.env.P09_LITERAL_DIAGNOSTIC_PATH || "artifacts/p09/literal-ui-state-diagnostic.json",
);

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function sha256(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function verifyPreviewIdentity(databaseUrl, previewRef, productionRef) {
  const parsed = new URL(databaseUrl);
  assert(["postgres:", "postgresql:"].includes(parsed.protocol), "Literal diagnostic requires PostgreSQL.");
  assert(previewRef !== productionRef, "Preview and Production refs must differ.");
  assert(parsed.port === "5432", "Literal diagnostic requires Session pooler port 5432.");
  assert(parsed.hostname.endsWith(".pooler.supabase.com"), "Literal diagnostic requires Supabase Session pooler.");
  assert(decodeURIComponent(parsed.username) === `postgres.${previewRef}`, "Literal diagnostic Preview identity mismatch.");
  assert(!databaseUrl.includes(productionRef), "Production ref appeared in Preview database URL.");
}

function sameInstant(left, right) {
  if (!left || !right) return false;
  const leftTime = Date.parse(left);
  const rightTime = Date.parse(right);
  return Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime === rightTime;
}

function phase(row) {
  const payload = row?.event_payload;
  return payload && typeof payload === "object" && !Array.isArray(payload) && typeof payload.phase === "string"
    ? payload.phase
    : null;
}

async function writeEvidence(value) {
  await mkdir(path.dirname(evidencePath), { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify(value, null, 2)}\n`);
}

const databaseUrl = required("P09_PREVIEW_DATABASE_URL");
const previewRef = required("P09_PREVIEW_PROJECT_REF");
const productionRef = required("P09_PRODUCTION_PROJECT_REF");
const targetEntityHash = required("P09_LITERAL_ENTITY_SHA256");
const sourceCommit = required("P09_SOURCE_COMMIT");
verifyPreviewIdentity(databaseUrl, previewRef, productionRef);

const client = new Client({
  connectionString: databaseUrl,
  application_name: "drmuscat-p09-literal-ui-state-diagnostic",
  ssl: { rejectUnauthorized: false },
  statement_timeout: 45_000,
  query_timeout: 50_000,
  connectionTimeoutMillis: 15_000,
});

let evidence = {
  schemaVersion: "drkhaleej.import.p09LiteralUiDiagnostic.v1",
  sourceCommit,
  targetEntityHash,
  matched: false,
  diagnosis: "unavailable",
  productionConnected: false,
  mutationPerformed: false,
  rawIdentifiersExposed: false,
};

try {
  await client.connect();
  await client.query("set default_transaction_read_only = on");

  const candidates = await client.query(`
    select distinct entity_id::text
    from (
      select entity_id from public.import_pharmacy_admin_read_states
      union all
      select entity_id from public.import_pharmacy_publish_authorizations
      union all
      select entity_id from public.import_publish_idempotency_records
    ) candidates
    where entity_id is not null
  `);
  const target = candidates.rows.find((row) => sha256(row.entity_id) === targetEntityHash)?.entity_id ?? null;

  if (!target) {
    evidence = { ...evidence, diagnosis: "target_entity_not_found" };
  } else {
    const actorResult = await client.query(
      `select actor_profile_id::text
       from public.import_pharmacy_admin_read_states
       where entity_id = $1
       order by created_at desc, id desc
       limit 1`,
      [target],
    );
    const actorId = actorResult.rows[0]?.actor_profile_id ?? null;

    if (!actorId) {
      evidence = { ...evidence, matched: true, diagnosis: "actor_read_state_not_found" };
    } else {
      const [centerResult, readStatesResult, authorizationsResult, reservationsResult] = await Promise.all([
        client.query(
          `select status, is_active, is_featured, deleted_at, updated_at, default_locale, default_country,
                  metadata->>'visibility' as visibility,
                  metadata->>'publicRouteEnabled' as public_route_enabled,
                  metadata->>'indexable' as indexable,
                  metadata->>'sitemapEligible' as sitemap_eligible
           from public.centers
           where id = $1`,
          [target],
        ),
        client.query(
          `select id::text, operation, operation_attempt_id::text, snapshot_hash, entity_fingerprint,
                  expected_entity_version, idempotency_key, request_hash, patch_hash,
                  created_at, expires_at, reviewed_at
           from public.import_pharmacy_admin_read_states
           where actor_profile_id = $1 and entity_id = $2
           order by created_at desc, id desc
           limit 30`,
          [actorId, target],
        ),
        client.query(
          `select id::text, review_state_id::text, operation_attempt_id::text, status,
                  issued_at, expires_at, consumed_at, consumed_by_reservation_id::text
           from public.import_pharmacy_publish_authorizations
           where actor_profile_id = $1 and entity_id = $2
           order by issued_at desc, id desc
           limit 20`,
          [actorId, target],
        ),
        client.query(
          `select id::text, expected_version, status, expires_at, created_at,
                  pharmacy_authorization_id::text, terminal_result
           from public.import_publish_idempotency_records
           where actor_profile_id = $1 and entity_id = $2
           order by created_at desc, id desc
           limit 20`,
          [actorId, target],
        ),
      ]);

      const readStates = readStatesResult.rows;
      const authorizations = authorizationsResult.rows;
      const reservations = reservationsResult.rows;
      const review = readStates.find((row) => row.operation === "review") ?? null;
      const dryRun = readStates.find((row) => row.operation === "dry_run") ?? null;
      const authorization = authorizations[0] ?? null;
      const reservation = reservations[0] ?? null;

      let snapshots = [];
      let audits = [];
      let references = [];
      if (reservation) {
        const [snapshotsResult, auditsResult, referencesResult] = await Promise.all([
          client.query(
            `select id::text, idempotency_record_id::text, expected_version, snapshot_hash, restored_at, created_at
             from public.import_publish_rollback_snapshots
             where actor_profile_id = $1 and entity_id = $2 and idempotency_record_id = $3
             order by created_at asc, id asc`,
            [actorId, target, reservation.id],
          ),
          client.query(
            `select id::text, idempotency_record_id::text, rollback_snapshot_id::text,
                    event_type, outcome, schema_version, event_payload, created_at
             from public.import_publish_audit_events
             where actor_profile_id = $1 and entity_id = $2 and idempotency_record_id = $3
             order by created_at asc, id asc`,
            [actorId, target, reservation.id],
          ),
          client.query(
            `select id::text, idempotency_record_id::text, consumed_at, created_at
             from public.import_pharmacy_publish_references
             where actor_profile_id = $1 and entity_id = $2 and idempotency_record_id = $3
             order by created_at asc, id asc`,
            [actorId, target, reservation.id],
          ),
        ]);
        snapshots = snapshotsResult.rows;
        audits = auditsResult.rows;
        references = referencesResult.rows;
      }

      const snapshot = snapshots[0] ?? null;
      const compatibleReservationAudits = audits.filter((row) =>
        (row.event_type === "reservation_created" || row.event_type === "execution_started") &&
        row.outcome === "pending" &&
        phase(row) === "reservation" &&
        snapshot && row.rollback_snapshot_id === snapshot.id
      );
      const mutationStartedCount = audits.filter(
        (row) => row.event_type === "execution_started" && phase(row) === "mutation",
      ).length;
      const executionSucceededCount = audits.filter(
        (row) => row.event_type === "execution_succeeded" && row.outcome === "succeeded",
      ).length;

      const now = Date.now();
      const reservationExpired = reservation?.expires_at
        ? Date.parse(reservation.expires_at) <= now
        : null;
      const reviewExpired = review?.expires_at ? Date.parse(review.expires_at) <= now : null;
      const authExpired = authorization?.expires_at ? Date.parse(authorization.expires_at) <= now : null;
      const authorizationMatchesReview = Boolean(
        authorization && review &&
        authorization.review_state_id === review.id &&
        authorization.operation_attempt_id === review.operation_attempt_id,
      );
      const authorizationMatchesReservation = Boolean(
        authorization && reservation &&
        authorization.consumed_by_reservation_id === reservation.id &&
        reservation.pharmacy_authorization_id === authorization.id,
      );
      const reservationMatchesReview = Boolean(
        reservation && review && sameInstant(reservation.expected_version, review.expected_entity_version),
      );
      const snapshotMatchesReview = Boolean(
        snapshot && review &&
        sameInstant(snapshot.expected_version, review.expected_entity_version) &&
        snapshot.snapshot_hash === review.snapshot_hash,
      );

      let diagnosis = "verified_reservation_should_load";
      if (!review) diagnosis = "review_missing";
      else if (reviewExpired) diagnosis = "review_expired";
      else if (!authorization) diagnosis = "authorization_missing";
      else if (!authorizationMatchesReview) diagnosis = "authorization_review_identity_mismatch";
      else if (authorization.status !== "consumed") diagnosis = `authorization_${authorization.status}`;
      else if (authExpired && !authorization.consumed_at) diagnosis = "authorization_expired_unconsumed";
      else if (!reservation) diagnosis = "reservation_missing";
      else if (!authorizationMatchesReservation) diagnosis = "authorization_reservation_identity_mismatch";
      else if (reservation.status !== "reserved") diagnosis = `reservation_${reservation.status}`;
      else if (reservationExpired) diagnosis = "reservation_expired";
      else if (!reservationMatchesReview) diagnosis = "reservation_expected_version_mismatch";
      else if (snapshots.length !== 1) diagnosis = "rollback_snapshot_count_invalid";
      else if (!snapshotMatchesReview) diagnosis = "rollback_snapshot_identity_mismatch";
      else if (compatibleReservationAudits.length !== 1) diagnosis = "reservation_audit_count_invalid";
      else if (references.length > 0 || executionSucceededCount > 0) diagnosis = "publish_persisted_state_machine_mismatch";

      const center = centerResult.rows[0] ?? null;
      evidence = {
        ...evidence,
        matched: true,
        diagnosis,
        center: center ? {
          status: center.status,
          updatedAt: center.updated_at,
          privateBoundary: center.visibility === "private" &&
            center.public_route_enabled === "false" &&
            center.indexable === "false" &&
            center.sitemap_eligible === "false" &&
            center.is_active === false &&
            center.is_featured === false &&
            center.deleted_at === null,
          defaultLocale: center.default_locale,
          defaultCountry: center.default_country,
        } : null,
        readState: {
          count: readStates.length,
          dryRunPresent: Boolean(dryRun),
          latestReviewPresent: Boolean(review),
          latestReviewExpired: reviewExpired,
        },
        authorization: {
          count: authorizations.length,
          status: authorization?.status ?? null,
          expired: authExpired,
          matchesReview: authorizationMatchesReview,
          matchesReservation: authorizationMatchesReservation,
        },
        reservation: {
          count: reservations.length,
          status: reservation?.status ?? null,
          expired: reservationExpired,
          matchesReviewExpectedVersion: reservationMatchesReview,
        },
        rollbackSnapshot: {
          count: snapshots.length,
          matchesReview: snapshotMatchesReview,
          restored: snapshot?.restored_at !== null && snapshot?.restored_at !== undefined,
        },
        audit: {
          count: audits.length,
          compatibleReservationCount: compatibleReservationAudits.length,
          mutationStartedCount,
          executionSucceededCount,
        },
        publishReference: {
          count: references.length,
          consumedCount: references.filter((row) => row.consumed_at !== null).length,
        },
      };
    }
  }
} catch (error) {
  evidence = {
    ...evidence,
    diagnosis: "diagnostic_query_failed",
    errorName: error instanceof Error ? error.name : "UnknownError",
  };
  throw error;
} finally {
  await writeEvidence(evidence);
  await client.end().catch(() => {});
}

console.log(`P09 literal UI state diagnostic: ${evidence.diagnosis}`);
