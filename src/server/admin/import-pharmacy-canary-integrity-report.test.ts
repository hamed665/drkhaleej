import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { buildPharmacyCanaryIntegrityReport } from "./import-pharmacy-canary-integrity-report";
import type { PharmacyRealPreviewCanaryResult } from "./import-pharmacy-real-preview-canary";
import type { PharmacyRealRollbackCanaryResult } from "./import-pharmacy-real-rollback-canary";

function publishCanary(overrides: Partial<PharmacyRealPreviewCanaryResult> = {}): PharmacyRealPreviewCanaryResult {
  return {
    verified: true,
    actorId: "actor-1",
    entityId: "pharmacy-1",
    publishReference: "rollback-authority-ready",
    readback: null,
    blockers: [],
    publicVisibility: "private",
    indexEligible: false,
    sitemapEligible: false,
    routeEnabled: false,
    rawReferenceExposed: false,
    ...overrides,
  };
}

function rollbackCanary(overrides: Partial<PharmacyRealRollbackCanaryResult> = {}): PharmacyRealRollbackCanaryResult {
  return {
    verified: true,
    actorId: "actor-1",
    entityId: "pharmacy-1",
    publishReference: "rollback-authority-ready",
    readback: null,
    blockers: [],
    publicVisibility: "private",
    indexEligible: false,
    sitemapEligible: false,
    routeEnabled: false,
    rawReferenceExposed: false,
    ...overrides,
  };
}

function healthyReadback() {
  return {
    orphanAuthorizationCount: 0,
    orphanReservationCount: 0,
    orphanSnapshotCount: 0,
    authorizationReservationMismatchCount: 0,
    auditGapCount: 0,
    duplicateReservationCount: 0,
    duplicateExecutionCount: 0,
    duplicateRollbackCount: 0,
    publicRouteCount: 0,
    searchExposureCount: 0,
    sitemapExposureCount: 0,
    secretLeakCount: 0,
    entityMutationMismatchCount: 0,
    publishDurationMs: 1_000,
    rollbackDurationMs: 800,
    totalDurationMs: 2_000,
  };
}

describe("buildPharmacyCanaryIntegrityReport", () => {
  it("verifies a clean publish and rollback integrity chain", async () => {
    const read = vi.fn().mockResolvedValue({ data: healthyReadback(), error: null });
    const report = await buildPharmacyCanaryIntegrityReport({
      publishCanary: publishCanary(),
      rollbackCanary: rollbackCanary(),
      readbackClient: { read },
    });

    expect(report.verified).toBe(true);
    expect(report.blockers).toEqual([]);
    expect(report.publicVisibility).toBe("private");
    expect(report.indexEligible).toBe(false);
    expect(report.sitemapEligible).toBe(false);
    expect(report.routeEnabled).toBe(false);
    expect(read).toHaveBeenCalledWith({
      actorId: "actor-1",
      entityId: "pharmacy-1",
      publishReference: "rollback-authority-ready",
    });
  });

  it("fails closed before readback when either canary is not verified", async () => {
    const read = vi.fn();
    const report = await buildPharmacyCanaryIntegrityReport({
      publishCanary: publishCanary({ verified: false }),
      rollbackCanary: rollbackCanary(),
      readbackClient: { read },
    });

    expect(report.verified).toBe(false);
    expect(report.blockers).toEqual(["publish_canary_not_verified"]);
    expect(read).not.toHaveBeenCalled();
  });

  it("reports every integrity leak and invalid timing", async () => {
    const data = {
      ...healthyReadback(),
      orphanAuthorizationCount: 1,
      orphanReservationCount: 1,
      orphanSnapshotCount: 1,
      authorizationReservationMismatchCount: 1,
      auditGapCount: 1,
      duplicateReservationCount: 1,
      duplicateExecutionCount: 1,
      duplicateRollbackCount: 1,
      publicRouteCount: 1,
      searchExposureCount: 1,
      sitemapExposureCount: 1,
      secretLeakCount: 1,
      entityMutationMismatchCount: 1,
      publishDurationMs: 31_000,
      rollbackDurationMs: -1,
      totalDurationMs: 100,
    };
    const report = await buildPharmacyCanaryIntegrityReport({
      publishCanary: publishCanary(),
      rollbackCanary: rollbackCanary(),
      readbackClient: { read: vi.fn().mockResolvedValue({ data, error: null }) },
    });

    expect(report.verified).toBe(false);
    expect(report.blockers).toEqual(expect.arrayContaining([
      "orphan_authorization_detected",
      "orphan_reservation_detected",
      "orphan_snapshot_detected",
      "authorization_reservation_mismatch_detected",
      "audit_gap_detected",
      "duplicate_reservation_detected",
      "duplicate_execution_detected",
      "duplicate_rollback_detected",
      "public_route_leak_detected",
      "search_exposure_detected",
      "sitemap_exposure_detected",
      "secret_leak_detected",
      "entity_mutation_mismatch_detected",
      "invalid_publish_timing",
      "invalid_rollback_timing",
      "timing_inconsistent",
    ]));
  });
});
