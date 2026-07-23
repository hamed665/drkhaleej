import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  verifyPharmacyPrivatePublishReadback,
  type PharmacyPrivatePublishReadbackEvidence,
  type PharmacyPrivatePublishReadbackExpected,
} from "./import-pharmacy-private-publish-readback";

const SNAPSHOT_HASH = "a".repeat(64);

function expected(): PharmacyPrivatePublishReadbackExpected {
  return {
    actorId: "admin-1",
    entityId: "pharmacy-1",
    reservationId: "reservation-1",
    rollbackSnapshotId: "snapshot-1",
    reservationAuditId: "reservation-audit-1",
    expectedVersion: "version-1",
    expectedSnapshotHash: SNAPSHOT_HASH,
    actualVersion: "version-2",
    patch: {
      name_en: "Exact Pharmacy",
      legal_name: "Exact Pharmacy LLC",
      slug: "exact-pharmacy",
      description_en: "Exact reviewed description",
      primary_phone: "+96824000000",
      whatsapp_phone: "+96894000000",
      email: "exact@example.com",
      website_url: "https://example.com",
      metadata_patch: {
        source: "manual",
        sourceEvidence: { sourceId: "source-1" },
        rawPayloadHash: null,
        visibility: "private",
        publicRouteEnabled: false,
        indexable: false,
        sitemapEligible: false,
      },
    },
    protectedMetadata: {
      canonicalGeo: { country_code: "om", area_id: "bausher" },
      projectionVersion: "projection-v1",
    },
  };
}

function evidence(): PharmacyPrivatePublishReadbackEvidence {
  return {
    reservation: {
      count: 1,
      actorId: "admin-1",
      entityId: "pharmacy-1",
      expectedVersion: "version-1",
      status: "succeeded",
      terminalActualVersion: "version-2",
      terminalVisibility: "private",
      terminalPublicRouteEnabled: false,
      terminalIndexable: false,
      terminalSitemapEligible: false,
    },
    rollbackSnapshot: {
      count: 1,
      id: "snapshot-1",
      expectedVersion: "version-1",
      snapshotHash: SNAPSHOT_HASH,
    },
    reservationAudit: {
      count: 1,
      id: "reservation-audit-1",
      eventType: "reservation_created",
      phase: "reservation",
      schemaVersion: "drkhaleej.import.publishAudit.v2",
    },
    executionStarted: {
      count: 1,
      phase: "mutation",
      schemaVersion: "drkhaleej.import.publishAudit.v3",
    },
    executionSucceeded: {
      count: 1,
      schemaVersion: "drkhaleej.import.publishAudit.v3",
      actualVersion: "version-2",
    },
    publishReferenceCount: 1,
    duplicateExecutionCount: 0,
    publicExposureCount: 0,
    entity: {
      id: "pharmacy-1",
      centerType: "pharmacy",
      status: "draft",
      isActive: false,
      isFeatured: false,
      deletedAt: null,
      updatedAt: "version-2",
      nameEn: "Exact Pharmacy",
      legalName: "Exact Pharmacy LLC",
      slug: "exact-pharmacy",
      descriptionEn: "Exact reviewed description",
      primaryPhone: "+96824000000",
      whatsappPhone: "+96894000000",
      email: "exact@example.com",
      websiteUrl: "https://example.com",
      defaultLocale: "en",
      defaultCountry: "om",
      metadata: {
        canonicalGeo: { country_code: "om", area_id: "bausher" },
        projectionVersion: "projection-v1",
        source: "manual",
        sourceEvidence: { sourceId: "source-1" },
        rawPayloadHash: null,
        visibility: "private",
        publicRouteEnabled: false,
        indexable: false,
        sitemapEligible: false,
      },
    },
  };
}

describe("Pharmacy private publish readback", () => {
  it("verifies exact terminal persistence, patch, metadata, and private boundaries", () => {
    expect(verifyPharmacyPrivatePublishReadback({ expected: expected(), evidence: evidence() })).toEqual(
      expect.objectContaining({
        verified: true,
        blockers: [],
        actualVersion: "version-2",
        publicVisibility: "private",
        indexEligible: false,
        sitemapEligible: false,
        routeEnabled: false,
        rawIdentifiersExposed: false,
      }),
    );
  });

  it("fails closed on duplicate execution, patch drift, and public exposure", () => {
    const invalid = evidence();
    invalid.duplicateExecutionCount = 1;
    invalid.publicExposureCount = 1;
    invalid.entity!.nameEn = "Drifted Pharmacy";
    invalid.entity!.metadata!.indexable = true;

    const result = verifyPharmacyPrivatePublishReadback({ expected: expected(), evidence: invalid });
    expect(result.verified).toBe(false);
    expect(result.blockers).toEqual(expect.arrayContaining([
      "duplicate_execution_detected",
      "public_exposure_detected",
      "canonical_patch_mismatch",
      "private_boundary_invalid",
    ]));
  });

  it("accepts the legacy Reservation audit only with a non-v2 schema", () => {
    const legacy = evidence();
    legacy.reservationAudit.eventType = "execution_started";
    legacy.reservationAudit.schemaVersion = "1";
    expect(verifyPharmacyPrivatePublishReadback({ expected: expected(), evidence: legacy }).verified).toBe(true);

    legacy.reservationAudit.schemaVersion = "drkhaleej.import.publishAudit.v2";
    expect(verifyPharmacyPrivatePublishReadback({ expected: expected(), evidence: legacy }).blockers)
      .toContain("reservation_audit_mismatch");
  });
});
