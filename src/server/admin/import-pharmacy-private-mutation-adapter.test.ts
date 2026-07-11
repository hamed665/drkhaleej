import { vi } from "vitest";

vi.mock("server-only", () => ({}));

import { describe, expect, it } from "vitest";

import {
  runImportPharmacyPrivateMutation,
  type ImportPharmacyPrivateMutationRequest,
  type ImportPharmacyPrivateMutationWriter,
} from "./import-pharmacy-private-mutation-adapter";

function request(): ImportPharmacyPrivateMutationRequest {
  return {
    family: "pharmacy",
    draft: {
      draftId: "draft-pharmacy-001",
      source: "excel",
      entityType: "pharmacy",
      name: "Controlled Pharmacy",
      canonicalGeo: {
        country_code: "om",
        governorate_id: "muscat",
        city_id: "muscat",
        area_id: "bausher",
        latitude: 23.565,
        longitude: 58.42,
        geo_confidence_score: 100,
        geo_source: "manual_verified",
        geo_resolution_status: "manually_verified",
        geo_validated: true,
      },
      sourceEvidence: {
        sourceId: "row-001",
        sourceName: "pharmacy-private-canary",
        importedBy: "actor-001",
        importedAt: "2026-07-11T18:00:00.000Z",
      },
      duplicateCandidateIds: [],
      requiresManualReview: false,
    },
    actorId: "actor-001",
    idempotencyKey: "pharmacy-private-001",
    expectedVersion: "1",
    rollbackState: { entityVersion: "0", visibility: "private" },
    executionEnabled: true,
    batchSize: 1,
  };
}

function writer(result: Awaited<ReturnType<ImportPharmacyPrivateMutationWriter["mutateOne"]>>, rollback = true) {
  const mutateOne = vi.fn().mockResolvedValue(result);
  const rollbackOne = vi.fn().mockResolvedValue(rollback);
  return { mutateOne, rollbackOne } satisfies ImportPharmacyPrivateMutationWriter;
}

describe("pharmacy private mutation adapter", () => {
  it("forces a successful mutation to remain private and undiscoverable", async () => {
    const mutationWriter = writer({ kind: "mutated", entityId: "pharmacy-001", actualVersion: "2" });
    const result = await runImportPharmacyPrivateMutation(request(), mutationWriter);

    expect(result).toEqual({
      kind: "mutated",
      entityId: "pharmacy-001",
      actualVersion: "2",
      visibility: "private",
    });
    expect(mutationWriter.mutateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        family: "pharmacy",
        visibility: "private",
        publicRouteEnabled: false,
        indexable: false,
        sitemapEligible: false,
      }),
    );
    expect(mutationWriter.rollbackOne).not.toHaveBeenCalled();
  });

  it("fails closed when execution is disabled or bulk is requested", async () => {
    const mutationWriter = writer({ kind: "failed" });
    const result = await runImportPharmacyPrivateMutation(
      { ...request(), executionEnabled: false, batchSize: 2 },
      mutationWriter,
    );

    expect(result.kind).toBe("blocked");
    if (result.kind === "blocked") {
      expect(result.blockers).toContain("execution_disabled");
      expect(result.blockers).toContain("bulk_not_allowed");
    }
    expect(mutationWriter.mutateOne).not.toHaveBeenCalled();
  });

  it("rolls back when the writer reports failure after a write", async () => {
    const mutationWriter = writer({ kind: "failed_after_write" }, true);
    const result = await runImportPharmacyPrivateMutation(request(), mutationWriter);

    expect(result).toEqual({ kind: "rolled_back", reason: "mutation_failed_after_write" });
    expect(mutationWriter.rollbackOne).toHaveBeenCalledTimes(1);
  });

  it("reports rollback failure instead of pretending recovery succeeded", async () => {
    const mutationWriter = writer({ kind: "failed_after_write" }, false);
    const result = await runImportPharmacyPrivateMutation(request(), mutationWriter);

    expect(result).toEqual({ kind: "failed", reason: "rollback_failed" });
  });
});
