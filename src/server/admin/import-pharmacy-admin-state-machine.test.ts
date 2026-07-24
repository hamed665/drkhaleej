import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildPharmacyAdminStateMachineSnapshot,
  type PharmacyAdminStateMachineEvidence,
} from "./import-pharmacy-admin-state-machine";
import type { PharmacyRollbackLogicalSnapshot } from "./import-pharmacy-rollback-exact-recovery";

const NOW = "2026-07-24T01:00:00.000Z";
const FUTURE = "2026-07-24T01:15:00.000Z";
const VERSION = "2026-07-24T00:55:00.000Z";

function logicalSnapshot(): PharmacyRollbackLogicalSnapshot {
  return {
    schemaVersion: "drkhaleej.import.pharmacyRollbackSnapshot.v1",
    visibility: "private",
    indexPolicy: "noindex",
    sitemapPolicy: "excluded",
    publishStatus: "private_published",
    publicReady: false,
    projectionVersion: "p08-v1",
    canonicalRoute: "/en/om/pharmacies/p08-pharmacy",
    center: {
      id: "pharmacy-1",
      centerType: "pharmacy",
      slug: "p08-pharmacy",
      nameEn: "P08 Pharmacy",
      nameAr: "صيدلية P08",
      legalName: "P08 Pharmacy LLC",
      status: "draft",
      verificationStatus: "unverified",
      primaryPhone: "+96824000000",
      secondaryPhone: null,
      whatsappPhone: "+96894000000",
      email: "p08@example.invalid",
      websiteUrl: "https://example.invalid/p08",
      logoUrl: null,
      coverImageUrl: null,
      shortDescriptionEn: null,
      shortDescriptionAr: null,
      descriptionEn: "P08 exact state.",
      descriptionAr: null,
      defaultLocale: "en",
      defaultCountry: "om",
      isActive: false,
      isClaimable: false,
      isFeatured: false,
      sortOrder: 0,
      metadata: {
        projectionVersion: "p08-v1",
        visibility: "private",
        publicRouteEnabled: false,
        indexable: false,
        sitemapEligible: false,
        protected: { licenseNumber: "LICENSE-P08" },
      },
      deletedAt: null,
    },
    relations: [],
  };
}

function entityRow(): Record<string, unknown> {
  const snapshot = logicalSnapshot();
  const center = snapshot.center as Record<string, unknown>;
  return {
    id: center.id,
    center_type: center.centerType,
    slug: center.slug,
    name_en: center.nameEn,
    name_ar: center.nameAr,
    legal_name: center.legalName,
    status: center.status,
    verification_status: center.verificationStatus,
    primary_phone: center.primaryPhone,
    secondary_phone: center.secondaryPhone,
    whatsapp_phone: center.whatsappPhone,
    email: center.email,
    website_url: center.websiteUrl,
    logo_url: center.logoUrl,
    cover_image_url: center.coverImageUrl,
    short_description_en: center.shortDescriptionEn,
    short_description_ar: center.shortDescriptionAr,
    description_en: center.descriptionEn,
    description_ar: center.descriptionAr,
    default_locale: center.defaultLocale,
    default_country: center.defaultCountry,
    is_active: center.isActive,
    is_claimable: center.isClaimable,
    is_featured: center.isFeatured,
    sort_order: center.sortOrder,
    metadata: center.metadata,
    deleted_at: center.deletedAt,
    updated_at: NOW,
  };
}

function readState(reviewed = false) {
  return {
    operationAttemptId: "attempt-1",
    snapshotHash: "a".repeat(64),
    entityFingerprint: "b".repeat(64),
    expectedEntityVersion: VERSION,
    createdAt: "2026-07-24T00:50:00.000Z",
    expiresAt: FUTURE,
    reviewedAt: reviewed ? "2026-07-24T00:51:00.000Z" : null,
  };
}

function evidence(overrides: Partial<PharmacyAdminStateMachineEvidence> = {}): PharmacyAdminStateMachineEvidence {
  return {
    entityId: "pharmacy-1",
    generatedAt: NOW,
    dryRun: null,
    review: null,
    authorization: null,
    reservation: null,
    rollbackSnapshot: null,
    publishReference: null,
    reservationAuditCount: 0,
    mutationStartedAuditCount: 0,
    publishSucceededAuditCount: 0,
    rollbackSucceededAuditCount: 0,
    publicExposureCount: 0,
    entity: { ...entityRow(), updated_at: VERSION },
    auditHistory: [],
    ...overrides,
  };
}

function completedEvidence(entity = entityRow()): PharmacyAdminStateMachineEvidence {
  return evidence({
    dryRun: readState(),
    review: readState(true),
    authorization: { status: "consumed", issuedAt: NOW, expiresAt: FUTURE, consumedAt: NOW },
    reservation: { status: "rolled_back", expiresAt: FUTURE, terminalKind: "rolled_back" },
    rollbackSnapshot: { snapshotHash: "c".repeat(64), snapshotPayload: logicalSnapshot(), restoredAt: NOW },
    publishReference: { count: 1, consumedAt: NOW },
    reservationAuditCount: 1,
    mutationStartedAuditCount: 1,
    publishSucceededAuditCount: 1,
    rollbackSucceededAuditCount: 1,
    entity,
    auditHistory: [
      { eventType: "reservation_created", outcome: "pending", schemaVersion: "v2", phase: "reservation", createdAt: NOW },
      { eventType: "rollback_succeeded", outcome: "rolled_back", schemaVersion: "v4", phase: "rollback", createdAt: NOW },
    ],
  });
}

function status(snapshot: ReturnType<typeof buildPharmacyAdminStateMachineSnapshot>, id: string) {
  return snapshot.stages.find((stage) => stage.id === id)?.status;
}

describe("buildPharmacyAdminStateMachineSnapshot", () => {
  it("starts read-only with all external boundaries closed", () => {
    const snapshot = buildPharmacyAdminStateMachineSnapshot(evidence());
    expect(snapshot.currentStage).toBe("dry_run");
    expect(status(snapshot, "dry_run")).toBe("available");
    expect(status(snapshot, "exact_review")).toBe("blocked");
    expect(snapshot).toMatchObject({
      publicVisibility: "private",
      indexEligible: false,
      sitemapEligible: false,
      routeEnabled: false,
      bulkAllowed: false,
      automaticMutationRetryAllowed: false,
      rawIdentifiersExposed: false,
    });
    expect(snapshot.revision).toMatch(/^[a-f0-9]{64}$/);
  });

  it("advances only from persisted evidence and detects stale or expired review", () => {
    const dryRun = buildPharmacyAdminStateMachineSnapshot(evidence({ dryRun: readState() }));
    expect(status(dryRun, "exact_review")).toBe("available");

    const stale = buildPharmacyAdminStateMachineSnapshot(evidence({
      dryRun: readState(),
      review: readState(true),
      entity: { ...entityRow(), updated_at: "2026-07-24T00:59:00.000Z" },
    }));
    expect(stale.stale).toBe(true);
    expect(status(stale, "exact_review")).toBe("stale");

    const expiredState = { ...readState(true), expiresAt: "2026-07-24T00:59:59.000Z" };
    const expired = buildPharmacyAdminStateMachineSnapshot(evidence({ dryRun: expiredState, review: expiredState }));
    expect(status(expired, "dry_run")).toBe("expired");
    expect(status(expired, "exact_review")).toBe("expired");
  });

  it("completes all ten stages after exact rollback recovery", () => {
    const snapshot = buildPharmacyAdminStateMachineSnapshot(completedEvidence());
    expect(snapshot.stages).toHaveLength(10);
    expect(snapshot.stages.every((stage) => stage.status === "complete")).toBe(true);
    expect(snapshot.exactRecovery?.verified).toBe(true);
    expect(snapshot.exactRecovery?.mismatchCount).toBe(0);
    expect(snapshot.exactRecovery?.expectedHash).toBe(snapshot.exactRecovery?.actualHash);
  });

  it("reports a protected mismatch only as bounded path and hashes", () => {
    const tampered = entityRow();
    const metadata = tampered.metadata as Record<string, unknown>;
    tampered.metadata = { ...metadata, protected: { licenseNumber: "TAMPERED" } };
    const snapshot = buildPharmacyAdminStateMachineSnapshot(completedEvidence(tampered));
    const mismatch = snapshot.exactRecovery?.mismatches[0];
    expect(snapshot.exactRecovery?.verified).toBe(false);
    expect(snapshot.exactRecovery?.mismatchCount).toBe(1);
    expect(mismatch?.path).toBe("logical.center.metadata.protected.licenseNumber");
    expect(mismatch?.expectedHash).toMatch(/^[a-f0-9]{64}$/);
    expect(mismatch?.actualHash).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(snapshot)).not.toContain("LICENSE-P08");
    expect(JSON.stringify(snapshot)).not.toContain("TAMPERED");
  });
});
