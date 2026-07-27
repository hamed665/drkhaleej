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

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
}

function sha256(value) {
  const serialized = typeof value === "string" ? value : JSON.stringify(canonicalize(value));
  return createHash("sha256").update(serialized).digest("hex");
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

function wireString(value) {
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" ? value : value == null ? null : String(value);
}

function sameInstant(left, right) {
  const leftValue = wireString(left);
  const rightValue = wireString(right);
  if (!leftValue || !rightValue) return false;
  const leftTime = Date.parse(leftValue);
  const rightTime = Date.parse(rightValue);
  return Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime === rightTime;
}

function exact(left, right) {
  return wireString(left) === wireString(right);
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function payloadString(row, key) {
  return isObject(row?.event_payload) && typeof row.event_payload[key] === "string"
    ? row.event_payload[key]
    : null;
}

function phase(row) {
  return payloadString(row, "phase");
}

function buildCenterSnapshot(center) {
  return {
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
    deletedAt: center.deleted_at ? wireString(center.deleted_at) : null,
  };
}

function buildRollbackSnapshot(center) {
  const metadata = center.metadata ?? {};
  const canonicalRoute = `/${center.default_locale}/${center.default_country}/pharmacies/${center.slug ?? center.id}`;
  return {
    visibility: "private",
    indexPolicy: "noindex",
    sitemapPolicy: "excluded",
    publishStatus: "private_published",
    publicReady: false,
    projectionVersion: metadata.projectionVersion,
    canonicalRoute,
    center: buildCenterSnapshot(center),
  };
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
  schemaVersion: "drkhaleej.import.p09LiteralUiDiagnostic.v2",
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
      const [centerResult, readStatesResult] = await Promise.all([
        client.query(
          `select id::text, center_type::text, slug, name_en, name_ar, legal_name,
                  status::text, verification_status::text, primary_phone, secondary_phone,
                  whatsapp_phone, email, website_url, logo_url, cover_image_url,
                  short_description_en, short_description_ar, description_en, description_ar,
                  default_locale, default_country, is_active, is_claimable, is_featured,
                  sort_order, metadata, deleted_at, updated_at
           from public.centers
           where id = $1`,
          [target],
        ),
        client.query(
          `select id::text, operation, operation_attempt_id::text, snapshot_hash, entity_fingerprint,
                  expected_entity_version, idempotency_key, request_hash, patch_hash,
                  operation_scope, entity_family, created_at, expires_at, reviewed_at
           from public.import_pharmacy_admin_read_states
           where actor_profile_id = $1 and entity_id = $2
           order by created_at desc, id desc
           limit 30`,
          [actorId, target],
        ),
      ]);

      const center = centerResult.rows[0] ?? null;
      const readStates = readStatesResult.rows;
      const review = readStates.find((row) => row.operation === "review") ?? null;
      const dryRun = readStates.find((row) => row.operation === "dry_run") ?? null;

      let authorization = null;
      if (review) {
        const result = await client.query(
          `select id::text, review_state_id::text, actor_profile_id::text, entity_id::text,
                  review_snapshot_hash, entity_fingerprint, operation_attempt_id::text,
                  idempotency_key, request_hash, patch_hash, expected_entity_version,
                  entity_family, operation_scope, status, issued_at, expires_at, consumed_at,
                  consumed_by_reservation_id::text
           from public.import_pharmacy_publish_authorizations
           where actor_profile_id = $1 and entity_id = $2 and review_state_id = $3
           limit 2`,
          [actorId, target, review.id],
        );
        authorization = result.rows.length === 1 ? result.rows[0] : null;
      }

      let reservation = null;
      let snapshots = [];
      let audits = [];
      let references = [];
      if (authorization?.consumed_by_reservation_id) {
        const reservationResult = await client.query(
          `select id::text, entity_id::text, actor_profile_id::text, idempotency_key,
                  expected_version, request_hash, status, expires_at, created_at,
                  pharmacy_authorization_id::text, terminal_result
           from public.import_publish_idempotency_records
           where id = $1 and actor_profile_id = $2 and entity_id = $3
           limit 2`,
          [authorization.consumed_by_reservation_id, actorId, target],
        );
        reservation = reservationResult.rows.length === 1 ? reservationResult.rows[0] : null;
      }

      if (reservation) {
        const [snapshotsResult, auditsResult, referencesResult] = await Promise.all([
          client.query(
            `select id::text, idempotency_record_id::text, actor_profile_id::text, entity_id::text,
                    expected_version, snapshot_hash, restored_at, created_at
             from public.import_publish_rollback_snapshots
             where actor_profile_id = $1 and entity_id = $2 and idempotency_record_id = $3
             order by created_at asc, id asc
             limit 2`,
            [actorId, target, reservation.id],
          ),
          client.query(
            `select id::text, idempotency_record_id::text, rollback_snapshot_id::text,
                    actor_profile_id::text, entity_id::text, event_type, outcome,
                    schema_version, expected_version, event_payload, created_at
             from public.import_publish_audit_events
             where actor_profile_id = $1 and entity_id = $2 and idempotency_record_id = $3
               and event_type in ('execution_started','reservation_created')
             order by created_at asc, id asc
             limit 2`,
            [actorId, target, reservation.id],
          ),
          client.query(
            `select id::text, idempotency_record_id::text, consumed_at, created_at
             from public.import_pharmacy_publish_references
             where actor_profile_id = $1 and entity_id = $2 and idempotency_record_id = $3
             order by created_at asc, id asc
             limit 2`,
            [actorId, target, reservation.id],
          ),
        ]);
        snapshots = snapshotsResult.rows;
        audits = auditsResult.rows;
        references = referencesResult.rows;
      }

      const snapshot = snapshots[0] ?? null;
      const audit = audits[0] ?? null;
      const now = Date.now();
      const reviewExpired = review?.expires_at ? Date.parse(wireString(review.expires_at)) <= now : null;
      const authorizationExpired = authorization?.expires_at
        ? Date.parse(wireString(authorization.expires_at)) <= now
        : null;
      const reservationExpired = reservation?.expires_at
        ? Date.parse(wireString(reservation.expires_at)) <= now
        : null;

      const computedFingerprint = center ? sha256(buildCenterSnapshot(center)) : null;
      const computedSnapshotHash = center ? sha256(buildRollbackSnapshot(center)) : null;

      const versions = {
        authorizationExact: Boolean(authorization && review && exact(authorization.expected_entity_version, review.expected_entity_version)),
        authorizationTemporal: Boolean(authorization && review && sameInstant(authorization.expected_entity_version, review.expected_entity_version)),
        reservationExact: Boolean(reservation && review && exact(reservation.expected_version, review.expected_entity_version)),
        reservationTemporal: Boolean(reservation && review && sameInstant(reservation.expected_version, review.expected_entity_version)),
        snapshotExact: Boolean(snapshot && review && exact(snapshot.expected_version, review.expected_entity_version)),
        snapshotTemporal: Boolean(snapshot && review && sameInstant(snapshot.expected_version, review.expected_entity_version)),
        auditExact: Boolean(audit && review && exact(audit.expected_version, review.expected_entity_version)),
        auditTemporal: Boolean(audit && review && sameInstant(audit.expected_version, review.expected_entity_version)),
        entityExact: Boolean(center && review && exact(center.updated_at, review.expected_entity_version)),
        entityTemporal: Boolean(center && review && sameInstant(center.updated_at, review.expected_entity_version)),
      };

      const authorizationIdentity = Boolean(
        authorization && review &&
        authorization.review_state_id === review.id &&
        authorization.actor_profile_id === actorId &&
        authorization.entity_id === target &&
        authorization.review_snapshot_hash === review.snapshot_hash &&
        authorization.entity_fingerprint === review.entity_fingerprint &&
        authorization.operation_attempt_id === review.operation_attempt_id &&
        authorization.idempotency_key === review.idempotency_key &&
        authorization.request_hash === review.request_hash &&
        authorization.patch_hash === review.patch_hash &&
        authorization.entity_family === "pharmacy" &&
        authorization.operation_scope === "reserve_private_publish"
      );
      const authorizationReservationLink = Boolean(
        authorization && reservation &&
        authorization.status === "consumed" &&
        authorization.consumed_by_reservation_id === reservation.id &&
        reservation.pharmacy_authorization_id === authorization.id
      );
      const reservationIdentity = Boolean(
        reservation && review &&
        reservation.entity_id === target &&
        reservation.actor_profile_id === actorId &&
        reservation.idempotency_key === review.idempotency_key &&
        reservation.request_hash === review.request_hash &&
        reservation.status === "reserved"
      );
      const snapshotIdentity = Boolean(
        snapshot && review && reservation &&
        snapshot.entity_id === target &&
        snapshot.actor_profile_id === actorId &&
        snapshot.idempotency_record_id === reservation.id &&
        snapshot.snapshot_hash === review.snapshot_hash
      );
      const auditIdentity = Boolean(
        audit && review && reservation && snapshot && authorization &&
        audit.entity_id === target &&
        audit.actor_profile_id === actorId &&
        audit.idempotency_record_id === reservation.id &&
        audit.rollback_snapshot_id === snapshot.id &&
        audit.outcome === "pending" &&
        phase(audit) === "reservation" &&
        payloadString(audit, "requestHash") === review.request_hash &&
        payloadString(audit, "authorizationId") === authorization.id &&
        payloadString(audit, "reviewSnapshotHash") === review.snapshot_hash &&
        payloadString(audit, "entityFingerprint") === review.entity_fingerprint &&
        payloadString(audit, "operationAttemptId") === review.operation_attempt_id &&
        payloadString(audit, "patchHash") === review.patch_hash &&
        payloadString(audit, "entityFamily") === "pharmacy" &&
        payloadString(audit, "operationScope") === "reserve_private_publish"
      );
      const auditCompatible = Boolean(
        audit && (
          (audit.event_type === "reservation_created" && audit.schema_version === "drkhaleej.import.publishAudit.v2") ||
          (audit.event_type === "execution_started" && audit.schema_version !== "drkhaleej.import.publishAudit.v2")
        )
      );
      const fingerprintMatches = Boolean(review && computedFingerprint === review.entity_fingerprint);
      const snapshotHashMatches = Boolean(review && computedSnapshotHash === review.snapshot_hash);

      const verifierBlockers = [];
      if (!authorization) verifierBlockers.push("authorization_row_count_invalid");
      else {
        if (!authorizationIdentity || !versions.authorizationExact) verifierBlockers.push("authorization_identity_mismatch");
        if (authorization.status !== "consumed") verifierBlockers.push("authorization_not_consumed");
        if (!authorizationReservationLink) verifierBlockers.push("authorization_reservation_linkage_mismatch");
      }
      if (!reservation) verifierBlockers.push("idempotency_row_count_invalid");
      else {
        if (!reservationIdentity || !versions.reservationExact) verifierBlockers.push("idempotency_identity_mismatch");
        if (!authorizationReservationLink) verifierBlockers.push("authorization_reservation_linkage_mismatch");
      }
      if (snapshots.length !== 1) verifierBlockers.push("rollback_row_count_invalid");
      else if (!snapshotIdentity || !versions.snapshotExact) verifierBlockers.push("rollback_linkage_mismatch");
      if (audits.length !== 1) verifierBlockers.push("audit_row_count_invalid");
      else {
        if (!auditIdentity) verifierBlockers.push("audit_identity_mismatch");
        if (!versions.auditExact) verifierBlockers.push("audit_identity_mismatch");
        if (!auditCompatible) verifierBlockers.push("audit_schema_version_mismatch");
      }
      if (!center) verifierBlockers.push("entity_fingerprint_row_count_invalid");
      else if (!fingerprintMatches || !versions.entityExact) verifierBlockers.push("entity_changed");

      const uniqueVerifierBlockers = [...new Set(verifierBlockers)];
      let diagnosis = "verified_reservation_should_load";
      if (!review) diagnosis = "review_missing";
      else if (!center) diagnosis = "center_missing";
      else if (!fingerprintMatches) diagnosis = "context_fingerprint_mismatch";
      else if (!snapshotHashMatches) diagnosis = "context_snapshot_mismatch";
      else if (!versions.entityTemporal) diagnosis = "context_version_mismatch";
      else if (!authorization) diagnosis = "authorization_missing";
      else if (!authorizationIdentity) diagnosis = "authorization_identity_mismatch";
      else if (!versions.authorizationTemporal) diagnosis = "authorization_version_mismatch";
      else if (!reservation) diagnosis = "reservation_missing";
      else if (!authorizationReservationLink) diagnosis = "authorization_reservation_linkage_mismatch";
      else if (!reservationIdentity) diagnosis = "reservation_identity_mismatch";
      else if (reservationExpired) diagnosis = "reservation_expired";
      else if (!versions.reservationTemporal) diagnosis = "reservation_version_mismatch";
      else if (snapshots.length !== 1) diagnosis = "rollback_snapshot_count_invalid";
      else if (!snapshotIdentity) diagnosis = "rollback_snapshot_identity_mismatch";
      else if (!versions.snapshotTemporal) diagnosis = "rollback_snapshot_version_mismatch";
      else if (audits.length !== 1) diagnosis = "reservation_audit_count_invalid";
      else if (!auditIdentity) diagnosis = "reservation_audit_identity_mismatch";
      else if (!auditCompatible) diagnosis = "reservation_audit_schema_mismatch";
      else if (!versions.auditTemporal) diagnosis = "reservation_audit_version_mismatch";
      else if (uniqueVerifierBlockers.length > 0 && [
        versions.authorizationTemporal && !versions.authorizationExact,
        versions.reservationTemporal && !versions.reservationExact,
        versions.snapshotTemporal && !versions.snapshotExact,
        versions.auditTemporal && !versions.auditExact,
        versions.entityTemporal && !versions.entityExact,
      ].some(Boolean)) diagnosis = "readback_timestamp_wire_format_mismatch";
      else if (uniqueVerifierBlockers.length > 0) diagnosis = "persistence_readback_verifier_mismatch";
      else if (references.length > 0 || reservation?.terminal_result) diagnosis = "publish_already_persisted";

      evidence = {
        ...evidence,
        matched: true,
        diagnosis,
        center: center ? {
          status: center.status,
          privateBoundary: center.metadata?.visibility === "private" &&
            center.metadata?.publicRouteEnabled === false &&
            center.metadata?.indexable === false &&
            center.metadata?.sitemapEligible === false &&
            center.is_active === false &&
            center.is_featured === false &&
            center.deleted_at === null,
          defaultLocale: center.default_locale,
          defaultCountry: center.default_country,
          fingerprintMatchesReview: fingerprintMatches,
          snapshotHashMatchesReview: snapshotHashMatches,
        } : null,
        readState: {
          count: readStates.length,
          dryRunPresent: Boolean(dryRun),
          latestReviewPresent: Boolean(review),
          latestReviewExpired: reviewExpired,
        },
        authorization: {
          present: Boolean(authorization),
          status: authorization?.status ?? null,
          expired: authorizationExpired,
          identityMatchesReview: authorizationIdentity,
          matchesReservation: authorizationReservationLink,
        },
        reservation: {
          present: Boolean(reservation),
          status: reservation?.status ?? null,
          expired: reservationExpired,
          identityMatchesReview: reservationIdentity,
        },
        rollbackSnapshot: {
          count: snapshots.length,
          identityMatchesReview: snapshotIdentity,
          restored: snapshot?.restored_at !== null && snapshot?.restored_at !== undefined,
        },
        audit: {
          count: audits.length,
          identityMatchesReview: auditIdentity,
          compatible: auditCompatible,
        },
        versionComparisons: versions,
        verifier: {
          verified: uniqueVerifierBlockers.length === 0,
          blockers: uniqueVerifierBlockers,
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
