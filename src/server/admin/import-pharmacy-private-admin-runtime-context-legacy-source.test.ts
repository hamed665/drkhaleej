import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getImportPharmacyPrivateMutationBlockers } from "./import-pharmacy-private-mutation-adapter";
import {
  loadPharmacyPrivateAdminRuntimeContext,
  resolvePharmacyPrivateAdminDraftSource,
  type PharmacyPrivateAdminRuntimeCenter,
} from "./import-pharmacy-private-admin-runtime-context";

const canonicalGeo = {
  country_code: "om",
  governorate_id: "gov-1",
  city_id: "city-1",
  area_id: "area-1",
  latitude: 23.5,
  longitude: 58.4,
  geo_confidence_score: 100,
  geo_source: "manual",
  geo_resolution_status: "manually_verified",
  geo_validated: true,
};

function legacyCenter(): PharmacyPrivateAdminRuntimeCenter {
  return {
    id: "pharmacy-legacy-source",
    center_type: "pharmacy",
    slug: "legacy-source-pharmacy",
    name_en: "Legacy Source Pharmacy",
    name_ar: null,
    legal_name: null,
    status: "draft",
    verification_status: "verified",
    primary_phone: null,
    secondary_phone: null,
    whatsapp_phone: null,
    email: null,
    website_url: null,
    logo_url: null,
    cover_image_url: null,
    short_description_en: null,
    short_description_ar: null,
    description_en: null,
    description_ar: null,
    default_locale: "en",
    default_country: "om",
    is_active: false,
    is_claimable: true,
    is_featured: false,
    sort_order: 0,
    metadata: {
      source: "legacy_preview_fixture",
      projectionVersion: "projection-1",
      canonicalGeo,
      sourceEvidence: {
        source: "manual",
        sourceId: "fixture-1",
        sourceName: "Preview fixture",
        importedBy: "admin-1",
        importedAt: "2026-07-28T00:00:00.000Z",
      },
    },
    deleted_at: null,
    updated_at: "2026-07-28T00:00:00.000Z",
  };
}

describe("legacy Pharmacy source normalization", () => {
  it("prefers a canonical evidence source when metadata provenance is legacy", () => {
    expect(resolvePharmacyPrivateAdminDraftSource(
      { source: "legacy_preview_fixture" },
      { source: "manual" },
    )).toBe("manual");
  });

  it("falls back to manual only at the executable Draft boundary", () => {
    expect(resolvePharmacyPrivateAdminDraftSource(
      { source: "legacy_preview_fixture" },
      { source: "another_legacy_value" },
    )).toBe("manual");
  });

  it("produces a mutation-ready private Draft while retaining the original rollback snapshot", async () => {
    const center = legacyCenter();
    const result = await loadPharmacyPrivateAdminRuntimeContext(
      {
        executionEnabled: true,
        environment: "preview",
        actorId: "admin-1",
        entityId: center.id,
        allowedActorIds: ["admin-1"],
        allowedEntityIds: [center.id],
        approvalToken: "approved",
        expectedApprovalToken: "approved",
        now: new Date("2026-07-28T00:00:00.000Z"),
      },
      { readPharmacy: vi.fn(async () => ({ data: center, error: null })) },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.context.mutationRequest.draft.source).toBe("manual");
    expect(result.context.mutationRequest.rollbackState).toMatchObject({
      center: { metadata: { source: "legacy_preview_fixture" } },
    });
    expect(getImportPharmacyPrivateMutationBlockers({
      ...result.context.mutationRequest,
      reservationResult: {
        kind: "reserved",
        reservationId: "reservation-1",
        rollbackSnapshotId: "snapshot-1",
        auditEventId: "audit-1",
      },
    })).toEqual([]);
  });
});
