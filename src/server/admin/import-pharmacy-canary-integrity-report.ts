import "server-only";

import type { PharmacyRealPreviewCanaryResult } from "./import-pharmacy-real-preview-canary";
import type { PharmacyRealRollbackCanaryResult } from "./import-pharmacy-real-rollback-canary";

export type PharmacyCanaryIntegrityReadback = {
  orphanAuthorizationCount: number;
  orphanReservationCount: number;
  orphanSnapshotCount: number;
  authorizationReservationMismatchCount: number;
  auditGapCount: number;
  duplicateReservationCount: number;
  duplicateExecutionCount: number;
  duplicateRollbackCount: number;
  publicRouteCount: number;
  searchExposureCount: number;
  sitemapExposureCount: number;
  secretLeakCount: number;
  entityMutationMismatchCount: number;
  publishDurationMs: number;
  rollbackDurationMs: number;
  totalDurationMs: number;
};

export type PharmacyCanaryIntegrityReadbackClient = {
  read(input: {
    actorId: string;
    entityId: string;
    publishReference: string;
  }): Promise<{ data: PharmacyCanaryIntegrityReadback | null; error: { message?: string } | null }>;
};

export type PharmacyCanaryIntegrityBlocker =
  | "publish_canary_not_verified"
  | "rollback_canary_not_verified"
  | "canary_identity_mismatch"
  | "publish_reference_mismatch"
  | "integrity_readback_failed"
  | "orphan_authorization_detected"
  | "orphan_reservation_detected"
  | "orphan_snapshot_detected"
  | "authorization_reservation_mismatch_detected"
  | "audit_gap_detected"
  | "duplicate_reservation_detected"
  | "duplicate_execution_detected"
  | "duplicate_rollback_detected"
  | "public_route_leak_detected"
  | "search_exposure_detected"
  | "sitemap_exposure_detected"
  | "secret_leak_detected"
  | "entity_mutation_mismatch_detected"
  | "invalid_publish_timing"
  | "invalid_rollback_timing"
  | "invalid_total_timing"
  | "timing_inconsistent";

export type PharmacyCanaryIntegrityReport = {
  verified: boolean;
  actorId: string | null;
  entityId: string | null;
  publishReference: string | null;
  readback: PharmacyCanaryIntegrityReadback | null;
  blockers: readonly PharmacyCanaryIntegrityBlocker[];
  publicVisibility: "private";
  indexEligible: false;
  sitemapEligible: false;
  routeEnabled: false;
};

const MAX_OPERATION_MS = 30_000;
const MAX_TOTAL_MS = 60_000;

function buildReport(
  input: Omit<PharmacyCanaryIntegrityReport, "publicVisibility" | "indexEligible" | "sitemapEligible" | "routeEnabled">,
): PharmacyCanaryIntegrityReport {
  return {
    ...input,
    publicVisibility: "private",
    indexEligible: false,
    sitemapEligible: false,
    routeEnabled: false,
  };
}

function isValidDuration(value: number, maximum: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= maximum;
}

export async function buildPharmacyCanaryIntegrityReport(input: {
  publishCanary: PharmacyRealPreviewCanaryResult;
  rollbackCanary: PharmacyRealRollbackCanaryResult;
  readbackClient: PharmacyCanaryIntegrityReadbackClient;
}): Promise<PharmacyCanaryIntegrityReport> {
  const publish = input.publishCanary;
  const rollback = input.rollbackCanary;

  if (!publish.verified || !publish.actorId || !publish.entityId || !publish.publishReference) {
    return buildReport({
      verified: false,
      actorId: publish.actorId,
      entityId: publish.entityId,
      publishReference: publish.publishReference,
      readback: null,
      blockers: ["publish_canary_not_verified"],
    });
  }

  if (!rollback.verified || !rollback.actorId || !rollback.entityId || !rollback.publishReference) {
    return buildReport({
      verified: false,
      actorId: publish.actorId,
      entityId: publish.entityId,
      publishReference: publish.publishReference,
      readback: null,
      blockers: ["rollback_canary_not_verified"],
    });
  }

  if (publish.actorId !== rollback.actorId || publish.entityId !== rollback.entityId) {
    return buildReport({
      verified: false,
      actorId: publish.actorId,
      entityId: publish.entityId,
      publishReference: publish.publishReference,
      readback: null,
      blockers: ["canary_identity_mismatch"],
    });
  }

  if (publish.publishReference !== rollback.publishReference) {
    return buildReport({
      verified: false,
      actorId: publish.actorId,
      entityId: publish.entityId,
      publishReference: publish.publishReference,
      readback: null,
      blockers: ["publish_reference_mismatch"],
    });
  }

  const read = await input.readbackClient.read({
    actorId: publish.actorId,
    entityId: publish.entityId,
    publishReference: publish.publishReference,
  });
  if (read.error || !read.data) {
    return buildReport({
      verified: false,
      actorId: publish.actorId,
      entityId: publish.entityId,
      publishReference: publish.publishReference,
      readback: null,
      blockers: ["integrity_readback_failed"],
    });
  }

  const data = read.data;
  const blockers: PharmacyCanaryIntegrityBlocker[] = [];
  if (data.orphanAuthorizationCount !== 0) blockers.push("orphan_authorization_detected");
  if (data.orphanReservationCount !== 0) blockers.push("orphan_reservation_detected");
  if (data.orphanSnapshotCount !== 0) blockers.push("orphan_snapshot_detected");
  if (data.authorizationReservationMismatchCount !== 0) {
    blockers.push("authorization_reservation_mismatch_detected");
  }
  if (data.auditGapCount !== 0) blockers.push("audit_gap_detected");
  if (data.duplicateReservationCount !== 0) blockers.push("duplicate_reservation_detected");
  if (data.duplicateExecutionCount !== 0) blockers.push("duplicate_execution_detected");
  if (data.duplicateRollbackCount !== 0) blockers.push("duplicate_rollback_detected");
  if (data.publicRouteCount !== 0) blockers.push("public_route_leak_detected");
  if (data.searchExposureCount !== 0) blockers.push("search_exposure_detected");
  if (data.sitemapExposureCount !== 0) blockers.push("sitemap_exposure_detected");
  if (data.secretLeakCount !== 0) blockers.push("secret_leak_detected");
  if (data.entityMutationMismatchCount !== 0) blockers.push("entity_mutation_mismatch_detected");
  if (!isValidDuration(data.publishDurationMs, MAX_OPERATION_MS)) blockers.push("invalid_publish_timing");
  if (!isValidDuration(data.rollbackDurationMs, MAX_OPERATION_MS)) blockers.push("invalid_rollback_timing");
  if (!isValidDuration(data.totalDurationMs, MAX_TOTAL_MS)) blockers.push("invalid_total_timing");
  if (data.totalDurationMs < data.publishDurationMs + data.rollbackDurationMs) blockers.push("timing_inconsistent");

  const uniqueBlockers = [...new Set(blockers)];
  return buildReport({
    verified: uniqueBlockers.length === 0,
    actorId: publish.actorId,
    entityId: publish.entityId,
    publishReference: publish.publishReference,
    readback: data,
    blockers: uniqueBlockers,
  });
}
