import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createPharmacyPrivateAdminPublishExecutor } from "./import-pharmacy-private-admin-publish-executor";
import type { ImportPharmacyPrivateMutationRequest } from "./import-pharmacy-private-mutation-adapter";
import type { PharmacyPrivatePublishReadbackEvidence } from "./import-pharmacy-private-publish-readback";

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value !== "object" || value === null) return value;
  const record = value as Record<string, unknown>;
  return Object.fromEntries(Object.keys(record).sort().map((key) => [key, canonicalize(record[key])]));
}

function sha256(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

function request(): ImportPharmacyPrivateMutationRequest {
  const rollbackState = {
    visibility: "private",
    indexPolicy: "noindex",
    sitemapPolicy: "excluded",
    publishStatus: "private_published",
    publicReady: false,
    projectionVersion: "projection-v1",
    canonicalRoute: "/en/om/pharmacies/exact-pharmacy",
    center: {
      metadata: {
        canonicalGeo: { country_code: "om", area_id: "bausher" },
        projectionVersion: "projection-v1",
      },
    },
  };

  return {
    family: "pharmacy",
    selectedFamily: "pharmacy",
    reservationResult: {
      kind: "reserved",
      reservationId: "reservation-1",
      rollbackSnapshotId: "snapshot-1",
      auditEventId: "reservation-audit-1",
    },
    draft: {
      draftId: "pharmacy-1",
      source: "manual",
      entityType: "pharmacy",
      name: "Exact Pharmacy",
      legalName: "Exact Pharmacy LLC",
      slugCandidate: "exact-pharmacy",
      description: "Exact reviewed description",
      services: [],
      specialties: [],
      contact: {
        phone: "+96824000000",
        whatsapp: "+96894000000",
        email: "exact@example.com",
        website: "https://example.com",
      },
      canonicalGeo: {
        country_code: "om",
        governorate_id: "muscat",
        city_id: "muscat",
        area_id: "bausher",
        latitude: 23.5,
        longitude: 58.4,
        geo_confidence_score: 100,
        geo_source: "manual_verified",
        geo_resolution_status: "manually_verified",
        geo_validated: true,
      },
      sourceEvidence: { sourceId: "source-1" },
      rawPayloadHash: null,
      duplicateCandidateIds: [],
      requiresManualReview: false,
    },
    actorId: "admin-1",
    idempotencyKey: "operation-1",
    expectedVersion: "version-1",
    rollbackState,
    executionEnabled: true,
    batchSize: 1,
  };
}

function readback(requestValue: ImportPharmacyPrivateMutationRequest): PharmacyPrivatePublishReadbackEvidence {
  return {
    reservation: {
      count: 1,
      actorId: requestValue.actorId,
      entityId: requestValue.draft.draftId,
      expectedVersion: requestValue.expectedVersion,
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
      snapshotHash: sha256(requestValue.rollbackState),
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
        sourceEvidence: {
          source: "manual",
          sourceId: "source-1",
          sourceName: null,
          importedBy: null,
          importedAt: null,
        },
        rawPayloadHash: null,
        visibility: "private",
        publicRouteEnabled: false,
        indexable: false,
        sitemapEligible: false,
      },
    },
  };
}

describe("Pharmacy private Admin publish executor", () => {
  it("returns the opaque reference only after mutation and exact readback", async () => {
    const requestValue = request();
    const mutationWriter = {
      mutateOne: vi.fn(async () => ({ kind: "mutated" as const, entityId: "pharmacy-1", actualVersion: "version-2" })),
      rollbackOne: vi.fn(async () => false),
    };
    const publishReferenceStore = {
      create: vi.fn(async () => "opaque-reference-1"),
      resolve: vi.fn(async () => null),
    };
    const readbackClient = {
      read: vi.fn(async () => ({ data: readback(requestValue), error: null })),
    };

    const executor = createPharmacyPrivateAdminPublishExecutor({
      mutationWriter,
      publishReferenceStore,
      readbackClient,
    });

    await expect(executor.acceptVerifiedReservation(requestValue)).resolves.toEqual({
      ok: true,
      reference: "opaque-reference-1",
    });
    expect(mutationWriter.mutateOne).toHaveBeenCalledTimes(1);
    expect(publishReferenceStore.create).toHaveBeenCalledTimes(1);
    expect(readbackClient.read).toHaveBeenCalledTimes(1);
  });

  it("fails closed and withholds the reference when readback detects exposure", async () => {
    const requestValue = request();
    const invalid = readback(requestValue);
    invalid.publicExposureCount = 1;

    const executor = createPharmacyPrivateAdminPublishExecutor({
      mutationWriter: {
        mutateOne: vi.fn(async () => ({ kind: "mutated" as const, entityId: "pharmacy-1", actualVersion: "version-2" })),
        rollbackOne: vi.fn(async () => false),
      },
      publishReferenceStore: {
        create: vi.fn(async () => "opaque-reference-1"),
        resolve: vi.fn(async () => null),
      },
      readbackClient: { read: vi.fn(async () => ({ data: invalid, error: null })) },
    });

    await expect(executor.acceptVerifiedReservation(requestValue)).resolves.toEqual({
      ok: false,
      reference: null,
    });
  });

  it("does not create a reference when mutation is not successful", async () => {
    const publishReferenceStore = {
      create: vi.fn(async () => "opaque-reference-1"),
      resolve: vi.fn(async () => null),
    };
    const executor = createPharmacyPrivateAdminPublishExecutor({
      mutationWriter: {
        mutateOne: vi.fn(async () => ({ kind: "conflict" as const, reason: "expected_version_mismatch" as const })),
        rollbackOne: vi.fn(async () => false),
      },
      publishReferenceStore,
      readbackClient: { read: vi.fn() },
    });

    await expect(executor.acceptVerifiedReservation(request())).resolves.toEqual({ ok: false, reference: null });
    expect(publishReferenceStore.create).not.toHaveBeenCalled();
  });

  it("does not mint a second durable reference when a concurrent call observes replay", async () => {
    const publishReferenceStore = {
      create: vi.fn(async () => "opaque-reference-2"),
      resolve: vi.fn(async () => null),
    };
    const readbackClient = { read: vi.fn() };
    const executor = createPharmacyPrivateAdminPublishExecutor({
      mutationWriter: {
        mutateOne: vi.fn(async () => ({ kind: "replayed" as const, entityId: "pharmacy-1", actualVersion: "version-2" })),
        rollbackOne: vi.fn(async () => false),
      },
      publishReferenceStore,
      readbackClient,
    });

    await expect(executor.acceptVerifiedReservation(request())).resolves.toEqual({ ok: false, reference: null });
    expect(publishReferenceStore.create).not.toHaveBeenCalled();
    expect(readbackClient.read).not.toHaveBeenCalled();
  });
});
