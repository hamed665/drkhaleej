import "server-only";

import { createHash } from "node:crypto";

import {
  comparePharmacyRollbackExactRecovery,
  type PharmacyRollbackExactRecoveryReport,
  type PharmacyRollbackLogicalSnapshot,
} from "./import-pharmacy-rollback-exact-recovery";

export const PHARMACY_ADMIN_STATE_MACHINE_STAGE_IDS = [
  "dry_run",
  "exact_review",
  "authorization_ready",
  "reservation",
  "reservation_verified",
  "private_publish",
  "publish_verified",
  "rollback",
  "exact_recovery_verified",
  "bounded_audit_history",
] as const;

export type PharmacyAdminStateMachineStageId =
  (typeof PHARMACY_ADMIN_STATE_MACHINE_STAGE_IDS)[number];
export type PharmacyAdminStateMachineStageStatus =
  | "complete"
  | "available"
  | "blocked"
  | "expired"
  | "stale";

export type PharmacyAdminStateMachineAuditEvent = Readonly<{
  eventType: string;
  outcome: string;
  schemaVersion: string;
  phase: string | null;
  createdAt: string;
}>;

export type PharmacyAdminStateMachineReadStateEvidence = Readonly<{
  operationAttemptId: string;
  snapshotHash: string;
  entityFingerprint: string;
  expectedEntityVersion: string;
  createdAt: string;
  expiresAt: string;
  reviewedAt: string | null;
}>;

export type PharmacyAdminStateMachineEvidence = Readonly<{
  entityId: string;
  generatedAt: string;
  dryRun: PharmacyAdminStateMachineReadStateEvidence | null;
  review: PharmacyAdminStateMachineReadStateEvidence | null;
  authorization: Readonly<{
    status: "issued" | "consumed" | "invalidated" | "expired";
    issuedAt: string;
    expiresAt: string;
    consumedAt: string | null;
  }> | null;
  reservation: Readonly<{
    status: string;
    expiresAt: string;
    terminalKind: string | null;
  }> | null;
  rollbackSnapshot: Readonly<{
    snapshotHash: string;
    snapshotPayload: PharmacyRollbackLogicalSnapshot;
    restoredAt: string | null;
  }> | null;
  publishReference: Readonly<{
    count: number;
    consumedAt: string | null;
  }> | null;
  reservationAuditCount: number;
  mutationStartedAuditCount: number;
  publishSucceededAuditCount: number;
  rollbackSucceededAuditCount: number;
  publicExposureCount: number;
  entity: Readonly<Record<string, unknown>> | null;
  auditHistory: readonly PharmacyAdminStateMachineAuditEvent[];
}>;

export type PharmacyAdminStateMachineStage = Readonly<{
  id: PharmacyAdminStateMachineStageId;
  label: string;
  status: PharmacyAdminStateMachineStageStatus;
  detail: string;
}>;

export type PharmacyAdminStateMachineSnapshot = Readonly<{
  schemaVersion: "drkhaleej.import.pharmacyAdminStateMachine.v1";
  entityId: string;
  generatedAt: string;
  revision: string;
  currentStage: PharmacyAdminStateMachineStageId;
  stages: readonly PharmacyAdminStateMachineStage[];
  nextExpiryAt: string | null;
  stale: boolean;
  exactRecovery: Readonly<{
    verified: boolean;
    expectedHash: string;
    actualHash: string;
    mismatchCount: number;
    mismatches: PharmacyRollbackExactRecoveryReport["mismatches"];
    diagnosticsTruncated: boolean;
    rawValuesExposed: false;
  }> | null;
  auditHistory: readonly PharmacyAdminStateMachineAuditEvent[];
  publicVisibility: "private";
  indexEligible: false;
  sitemapEligible: false;
  routeEnabled: false;
  bulkAllowed: false;
  automaticMutationRetryAllowed: false;
  rawIdentifiersExposed: false;
}>;

const labels: Record<PharmacyAdminStateMachineStageId, string> = {
  dry_run: "Dry run",
  exact_review: "Exact review",
  authorization_ready: "Authorization ready",
  reservation: "Reservation",
  reservation_verified: "Reservation verified",
  private_publish: "Private publish",
  publish_verified: "Publish verified",
  rollback: "Rollback",
  exact_recovery_verified: "Exact recovery verified",
  bounded_audit_history: "Bounded audit history",
};

const allowedRecoveryDifferences = [
  "operation.entityVersion",
  "operation.rollbackMetadata",
  "operation.authorityState",
  "operation.auditHistory",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(record: Readonly<Record<string, unknown>>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" ? value : null;
}

function booleanValue(record: Readonly<Record<string, unknown>>, key: string): boolean {
  return record[key] === true;
}

function nullableIso(value: unknown): string | null {
  return typeof value === "string" && Number.isFinite(Date.parse(value))
    ? new Date(value).toISOString()
    : null;
}

function isExpired(expiresAt: string, now: string): boolean {
  return Date.parse(expiresAt) <= Date.parse(now);
}

function actualLogicalSnapshotFromEntity(
  entity: Readonly<Record<string, unknown>>,
): PharmacyRollbackLogicalSnapshot | null {
  const metadata = isRecord(entity.metadata) ? entity.metadata : null;
  const defaultLocale = stringValue(entity, "default_locale");
  const defaultCountry = stringValue(entity, "default_country");
  const slug = stringValue(entity, "slug");
  if (!metadata || !defaultLocale || !defaultCountry || !slug) return null;

  return {
    schemaVersion: "drkhaleej.import.pharmacyRollbackSnapshot.v1",
    visibility: metadata.visibility,
    indexPolicy: metadata.indexable === true ? "index" : "noindex",
    sitemapPolicy: metadata.sitemapEligible === true ? "included" : "excluded",
    publishStatus: "private_published",
    publicReady: Boolean(
      booleanValue(entity, "is_active") ||
        booleanValue(entity, "is_featured") ||
        metadata.publicRouteEnabled === true,
    ),
    projectionVersion: metadata.projectionVersion,
    canonicalRoute: `/${defaultLocale}/${defaultCountry}/pharmacies/${slug}`,
    center: {
      id: entity.id,
      centerType: entity.center_type,
      slug: entity.slug,
      nameEn: entity.name_en,
      nameAr: entity.name_ar,
      legalName: entity.legal_name,
      status: entity.status,
      verificationStatus: entity.verification_status,
      primaryPhone: entity.primary_phone,
      secondaryPhone: entity.secondary_phone,
      whatsappPhone: entity.whatsapp_phone,
      email: entity.email,
      websiteUrl: entity.website_url,
      logoUrl: entity.logo_url,
      coverImageUrl: entity.cover_image_url,
      shortDescriptionEn: entity.short_description_en,
      shortDescriptionAr: entity.short_description_ar,
      descriptionEn: entity.description_en,
      descriptionAr: entity.description_ar,
      defaultLocale,
      defaultCountry,
      isActive: entity.is_active,
      isClaimable: entity.is_claimable,
      isFeatured: entity.is_featured,
      sortOrder: entity.sort_order,
      metadata,
      deletedAt: nullableIso(entity.deleted_at),
    },
    relations: [],
  };
}

function buildExactRecovery(
  evidence: PharmacyAdminStateMachineEvidence,
): PharmacyRollbackExactRecoveryReport | null {
  if (
    evidence.reservation?.status !== "rolled_back" ||
    evidence.reservation.terminalKind !== "rolled_back" ||
    !evidence.rollbackSnapshot?.restoredAt ||
    !evidence.publishReference?.consumedAt ||
    evidence.rollbackSucceededAuditCount !== 1 ||
    !evidence.entity
  ) return null;

  const actualLogical = actualLogicalSnapshotFromEntity(evidence.entity);
  if (!actualLogical) return null;

  return comparePharmacyRollbackExactRecovery({
    expected: {
      logical: evidence.rollbackSnapshot.snapshotPayload,
      operation: {
        entityVersion: null,
        rollbackMetadata: null,
        authorityState: "unconsumed",
        auditHistory: { rollbackSucceeded: 0 },
      },
    },
    actual: {
      logical: actualLogical,
      operation: {
        entityVersion: stringValue(evidence.entity, "updated_at"),
        rollbackMetadata: { restoredAt: evidence.rollbackSnapshot.restoredAt },
        authorityState: "consumed",
        auditHistory: { rollbackSucceeded: evidence.rollbackSucceededAuditCount },
      },
    },
    allowedDifferencePaths: allowedRecoveryDifferences,
  });
}

function stage(
  id: PharmacyAdminStateMachineStageId,
  status: PharmacyAdminStateMachineStageStatus,
  detail: string,
): PharmacyAdminStateMachineStage {
  return { id, label: labels[id], status, detail };
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

function revisionHash(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

export function buildPharmacyAdminStateMachineSnapshot(
  evidence: PharmacyAdminStateMachineEvidence,
): PharmacyAdminStateMachineSnapshot {
  const now = evidence.generatedAt;
  const dryRunExpired = evidence.dryRun ? isExpired(evidence.dryRun.expiresAt, now) : false;
  const reviewExpired = evidence.review ? isExpired(evidence.review.expiresAt, now) : false;
  const authorizationExpired = evidence.authorization
    ? evidence.authorization.status === "expired" ||
      (evidence.authorization.status === "issued" && isExpired(evidence.authorization.expiresAt, now))
    : false;
  const reservationExpired = evidence.reservation
    ? evidence.reservation.status === "reserved" && isExpired(evidence.reservation.expiresAt, now)
    : false;

  const reservationExists = evidence.reservation !== null;
  const reservationVerified =
    reservationExists &&
    evidence.rollbackSnapshot !== null &&
    evidence.reservationAuditCount === 1;
  const published =
    evidence.reservation?.status === "succeeded" || evidence.reservation?.status === "rolled_back";
  const privateEntityVerified = Boolean(
    evidence.entity &&
      stringValue(evidence.entity, "center_type") === "pharmacy" &&
      stringValue(evidence.entity, "status") === "draft" &&
      evidence.entity.is_active === false &&
      evidence.entity.is_featured === false &&
      isRecord(evidence.entity.metadata) &&
      evidence.entity.metadata.visibility === "private" &&
      evidence.entity.metadata.publicRouteEnabled === false &&
      evidence.entity.metadata.indexable === false &&
      evidence.entity.metadata.sitemapEligible === false,
  );
  const publishVerified =
    published &&
    reservationVerified &&
    evidence.mutationStartedAuditCount === 1 &&
    evidence.publishSucceededAuditCount === 1 &&
    evidence.publishReference?.count === 1 &&
    evidence.publicExposureCount === 0 &&
    privateEntityVerified;
  const rollbackCompleted =
    evidence.reservation?.status === "rolled_back" &&
    evidence.reservation.terminalKind === "rolled_back" &&
    Boolean(evidence.rollbackSnapshot?.restoredAt) &&
    Boolean(evidence.publishReference?.consumedAt) &&
    evidence.rollbackSucceededAuditCount === 1;
  const exactRecovery = buildExactRecovery(evidence);

  const reviewStale = Boolean(
    evidence.review &&
      !reservationExists &&
      evidence.entity &&
      stringValue(evidence.entity, "updated_at") !== evidence.review.expectedEntityVersion,
  );
  const stateStale = reviewStale || evidence.mutationStartedAuditCount > 1 || evidence.rollbackSucceededAuditCount > 1;

  const stages: PharmacyAdminStateMachineStage[] = [
    evidence.dryRun
      ? stage("dry_run", dryRunExpired ? "expired" : "complete", dryRunExpired ? "Dry-run state expired; generate a fresh plan." : "Persisted dry-run readback verified.")
      : stage("dry_run", "available", "Generate one bounded server-side dry-run."),
    evidence.review
      ? stage("exact_review", reviewStale ? "stale" : reviewExpired ? "expired" : "complete", reviewStale ? "Entity version changed; review must be regenerated." : reviewExpired ? "Exact review expired." : "Persisted exact review readback verified.")
      : stage("exact_review", evidence.dryRun && !dryRunExpired ? "available" : "blocked", "Requires a fresh dry-run."),
    evidence.authorization
      ? stage("authorization_ready", authorizationExpired ? "expired" : evidence.authorization.status === "invalidated" ? "stale" : "complete", authorizationExpired ? "Authorization expired." : evidence.authorization.status === "invalidated" ? "Authorization was invalidated by a newer review." : `Authorization is ${evidence.authorization.status}.`)
      : stage("authorization_ready", evidence.review && !reviewExpired && !reviewStale ? "available" : "blocked", "A verified exact review can issue authorization."),
    reservationExists
      ? stage("reservation", reservationExpired ? "expired" : "complete", reservationExpired ? "Reservation expired before mutation." : `Persisted Reservation status: ${evidence.reservation?.status ?? "unknown"}.`)
      : stage("reservation", evidence.authorization?.status === "issued" && !authorizationExpired ? "available" : "blocked", "Requires a live issued authorization."),
    reservationVerified
      ? stage("reservation_verified", "complete", "Reservation, snapshot, and reservation audit readback are exact.")
      : stage("reservation_verified", reservationExists ? "blocked" : "blocked", "Waiting for exact Reservation integrity readback."),
    published
      ? stage("private_publish", "complete", "Private mutation is persisted.")
      : stage("private_publish", reservationVerified && !reservationExpired ? "available" : "blocked", "Requires a verified live Reservation and exact confirmation."),
    publishVerified
      ? stage("publish_verified", "complete", "Terminal publish, durable authority, entity state, and exposure readback verified.")
      : stage("publish_verified", published ? "blocked" : "blocked", "Waiting for post-mutation readback."),
    rollbackCompleted
      ? stage("rollback", "complete", "Atomic rollback authority was consumed or replayed safely.")
      : stage("rollback", publishVerified && !evidence.publishReference?.consumedAt ? "available" : "blocked", "Requires verified private publish and exact confirmation."),
    exactRecovery
      ? stage("exact_recovery_verified", exactRecovery.verified ? "complete" : "blocked", exactRecovery.verified ? "Original logical Pharmacy state was restored exactly." : "Unexpected logical recovery mismatch detected.")
      : stage("exact_recovery_verified", rollbackCompleted ? "blocked" : "blocked", "Waiting for exact logical recovery readback."),
    exactRecovery?.verified && evidence.auditHistory.length > 0
      ? stage("bounded_audit_history", "complete", "Bounded server audit history is available.")
      : stage("bounded_audit_history", "blocked", "Available only after exact recovery is verified."),
  ];

  const currentStage = stages.find((item) => item.status !== "complete")?.id ?? "bounded_audit_history";
  const futureExpiries = [
    evidence.dryRun?.expiresAt,
    evidence.review?.expiresAt,
    evidence.authorization?.status === "issued" ? evidence.authorization.expiresAt : null,
    evidence.reservation?.status === "reserved" ? evidence.reservation.expiresAt : null,
  ]
    .filter((value): value is string => typeof value === "string" && Date.parse(value) > Date.parse(now))
    .sort((left, right) => Date.parse(left) - Date.parse(right));

  const boundedHistory = evidence.auditHistory.slice(-10).map((item) => ({
    eventType: item.eventType.slice(0, 80),
    outcome: item.outcome.slice(0, 80),
    schemaVersion: item.schemaVersion.slice(0, 120),
    phase: item.phase?.slice(0, 80) ?? null,
    createdAt: item.createdAt,
  }));
  const exactRecoveryOutput = exactRecovery
    ? {
        verified: exactRecovery.verified,
        expectedHash: exactRecovery.expectedHash,
        actualHash: exactRecovery.actualHash,
        mismatchCount: exactRecovery.mismatchCount,
        mismatches: exactRecovery.mismatches,
        diagnosticsTruncated: exactRecovery.diagnosticsTruncated,
        rawValuesExposed: false as const,
      }
    : null;
  const revision = revisionHash({
    entityId: evidence.entityId,
    stages: stages.map(({ id, status }) => ({ id, status })),
    nextExpiryAt: futureExpiries[0] ?? null,
    stale: stateStale,
    exactRecovery: exactRecoveryOutput,
    auditHistory: boundedHistory,
  });

  return {
    schemaVersion: "drkhaleej.import.pharmacyAdminStateMachine.v1",
    entityId: evidence.entityId,
    generatedAt: now,
    revision,
    currentStage,
    stages,
    nextExpiryAt: futureExpiries[0] ?? null,
    stale: stateStale,
    exactRecovery: exactRecoveryOutput,
    auditHistory: boundedHistory,
    publicVisibility: "private",
    indexEligible: false,
    sitemapEligible: false,
    routeEnabled: false,
    bulkAllowed: false,
    automaticMutationRetryAllowed: false,
    rawIdentifiersExposed: false,
  };
}
