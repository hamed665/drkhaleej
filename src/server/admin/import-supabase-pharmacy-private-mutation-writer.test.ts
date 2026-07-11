import { vi } from "vitest";

vi.mock("server-only", () => ({}));

import { describe, expect, it } from "vitest";
import { createSupabasePharmacyPrivateMutationWriter } from "./import-supabase-pharmacy-private-mutation-writer";
import type { ImportPharmacyPrivateMutationPayload } from "./import-pharmacy-private-mutation-adapter";

function payload(): ImportPharmacyPrivateMutationPayload {
  return {
    family: "pharmacy",
    actorId: "actor-001",
    idempotencyKey: "pharmacy-private-001",
    expectedVersion: "2026-07-11 18:00:00+00",
    reservationId: "reservation-001",
    rollbackSnapshotId: "snapshot-001",
    auditEventId: "audit-001",
    draft: {
      draftId: "11111111-1111-4111-8111-111111111111",
      source: "excel",
      entityType: "pharmacy",
      name: "Controlled Pharmacy",
      slugCandidate: "controlled-pharmacy",
      contact: { phone: "+96824000000", whatsapp: null, email: null, website: null },
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
        sourceName: "canary",
        importedBy: "actor-001",
        importedAt: "2026-07-11T18:00:00.000Z",
      },
      duplicateCandidateIds: [],
      requiresManualReview: false,
    },
    visibility: "private",
    publicRouteEnabled: false,
    indexable: false,
    sitemapEligible: false,
    rollbackState: { status: "draft", is_active: false },
  };
}

describe("Supabase pharmacy private mutation writer", () => {
  it("calls only the atomic pharmacy RPC and preserves private flags", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        status: "mutated",
        entityId: "11111111-1111-4111-8111-111111111111",
        actualVersion: "2026-07-11 18:01:00+00",
      },
      error: null,
    });
    const writer = createSupabasePharmacyPrivateMutationWriter({ rpc });

    await expect(writer.mutateOne(payload())).resolves.toEqual({
      kind: "mutated",
      entityId: "11111111-1111-4111-8111-111111111111",
      actualVersion: "2026-07-11 18:01:00+00",
    });

    expect(rpc).toHaveBeenCalledWith(
      "import_publish_pharmacy_private",
      expect.objectContaining({
        p_idempotency_record_id: "reservation-001",
        p_rollback_snapshot_id: "snapshot-001",
        p_execution_started_audit_id: "audit-001",
        p_patch: expect.objectContaining({
          name_en: "Controlled Pharmacy",
        }),
      }),
    );

    const rpcArgs = rpc.mock.calls[0]?.[1] as { p_patch?: Record<string, unknown> } | undefined;
    expect(rpcArgs?.p_patch).not.toHaveProperty("status");
    expect(rpcArgs?.p_patch).not.toHaveProperty("is_active");
  });

  it("fails closed on malformed or errored RPC responses", async () => {
    const malformed = createSupabasePharmacyPrivateMutationWriter({
      rpc: vi.fn().mockResolvedValue({ data: { status: "mutated" }, error: null }),
    });
    await expect(malformed.mutateOne(payload())).resolves.toEqual({ kind: "failed" });

    const errored = createSupabasePharmacyPrivateMutationWriter({
      rpc: vi.fn().mockResolvedValue({ data: null, error: { message: "denied" } }),
    });
    await expect(errored.mutateOne(payload())).resolves.toEqual({ kind: "failed" });
  });

  it("does not claim rollback support before the rollback RPC exists", async () => {
    const writer = createSupabasePharmacyPrivateMutationWriter({
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
    await expect(writer.rollbackOne(payload())).resolves.toBe(false);
  });
});
