import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn(),
}));

import {
  isPublicIndexPharmacyAuthorization,
  isPublicIndexPharmacyQueueRow,
  isPublicNoindexPharmacyAuthorization,
  isPublicNoindexPharmacyQueueRow,
  type PharmacyIndexAuthorizationRow,
  type PharmacyPublicNoindexAuthorizationRow,
  type PharmacyPublicNoindexQueueRow,
} from "./import-pharmacy-profile-guard";

const queue: PharmacyPublicNoindexQueueRow = {
  id: "queue-1",
  target_entity_type: "pharmacy",
  publish_status: "published_noindex",
  index_policy: "noindex",
  sitemap_policy: "excluded",
  quality_score: 88,
  metadata: {
    public_noindex_schema_version: "drkhaleej.import.pharmacyPublicNoindex.v1",
    import_entity_candidate_id: "candidate-1",
    canonical_path: "/en/om/pharmacies/reviewed-pharmacy",
    canonical_paths: {
      en: "/en/om/pharmacies/reviewed-pharmacy",
      ar: "/ar/om/pharmacies/reviewed-pharmacy",
    },
    robots_policy: "noindex",
    sitemap_included: false,
    index_promoted: false,
    public_route_enabled: false,
  },
};

const authorization: PharmacyPublicNoindexAuthorizationRow = {
  id: "public-authority-1",
  candidate_id: "candidate-1",
  status: "published",
  published_queue_id: "queue-1",
  canonical_path_en: "/en/om/pharmacies/reviewed-pharmacy",
  canonical_path_ar: "/ar/om/pharmacies/reviewed-pharmacy",
};

const indexQueue: PharmacyPublicNoindexQueueRow = {
  ...queue,
  publish_status: "index_eligible",
  index_policy: "index_eligible",
  metadata: {
    ...(queue.metadata as Record<string, unknown>),
    pharmacy_index_promotion_schema_version:
      "drkhaleej.import.pharmacyIndexPromotion.v1",
    pharmacy_index_authorization_id: "index-authority-1",
    robots_policy: "index",
    index_promoted: true,
  },
};

const indexAuthorization: PharmacyIndexAuthorizationRow = {
  id: "index-authority-1",
  public_noindex_authorization_id: authorization.id,
  candidate_id: authorization.candidate_id,
  queue_id: queue.id,
  status: "promoted",
  canonical_path_en: authorization.canonical_path_en,
  canonical_path_ar: authorization.canonical_path_ar,
};

describe("public Pharmacy noindex guard", () => {
  it("accepts both exact bilingual paths under one published authority", () => {
    for (const path of [
      "/en/om/pharmacies/reviewed-pharmacy",
      "/ar/om/pharmacies/reviewed-pharmacy",
    ]) {
      expect(isPublicNoindexPharmacyQueueRow(queue, path)).toBe(true);
      expect(
        isPublicNoindexPharmacyAuthorization(
          authorization,
          queue,
          "candidate-1",
          path,
        ),
      ).toBe(true);
    }
  });

  it("accepts exact independently authorized Index state while Sitemap stays excluded", () => {
    for (const path of [
      authorization.canonical_path_en,
      authorization.canonical_path_ar,
    ]) {
      expect(isPublicIndexPharmacyQueueRow(indexQueue, path)).toBe(true);
      expect(
        isPublicIndexPharmacyAuthorization(
          indexAuthorization,
          authorization,
          indexQueue,
          "candidate-1",
          path,
        ),
      ).toBe(true);
    }
    expect(isPublicNoindexPharmacyQueueRow(indexQueue, authorization.canonical_path_en)).toBe(
      false,
    );
  });

  it("rejects coupled Sitemap state and Index authority drift", () => {
    for (const driftedQueue of [
      { ...indexQueue, sitemap_policy: "included" },
      {
        ...indexQueue,
        metadata: {
          ...(indexQueue.metadata as Record<string, unknown>),
          sitemap_included: true,
        },
      },
      {
        ...indexQueue,
        metadata: {
          ...(indexQueue.metadata as Record<string, unknown>),
          pharmacy_index_promotion_schema_version: "wrong",
        },
      },
    ]) {
      expect(
        isPublicIndexPharmacyQueueRow(
          driftedQueue,
          authorization.canonical_path_en,
        ),
      ).toBe(false);
    }

    for (const driftedAuthorization of [
      { ...indexAuthorization, status: "rolled_back" },
      { ...indexAuthorization, queue_id: "other" },
      { ...indexAuthorization, public_noindex_authorization_id: "other" },
      { ...indexAuthorization, candidate_id: "other" },
    ]) {
      expect(
        isPublicIndexPharmacyAuthorization(
          driftedAuthorization,
          authorization,
          indexQueue,
          "candidate-1",
          authorization.canonical_path_en,
        ),
      ).toBe(false);
    }
  });

  it.each([
    ["publish_status", "index_eligible"],
    ["index_policy", "index"],
    ["sitemap_policy", "included"],
  ] as const)("rejects a queue that crosses the %s boundary", (key, value) => {
    expect(
      isPublicNoindexPharmacyQueueRow(
        { ...queue, [key]: value },
        authorization.canonical_path_en,
      ),
    ).toBe(false);
  });

  it("rejects Sitemap, Index, authority, candidate, and path drift", () => {
    for (const metadata of [
      { ...(queue.metadata as Record<string, unknown>), sitemap_included: true },
      { ...(queue.metadata as Record<string, unknown>), index_promoted: true },
      { ...(queue.metadata as Record<string, unknown>), public_route_enabled: true },
      { ...(queue.metadata as Record<string, unknown>), robots_policy: "index" },
    ]) {
      expect(
        isPublicNoindexPharmacyQueueRow(
          { ...queue, metadata },
          authorization.canonical_path_en,
        ),
      ).toBe(false);
    }
    expect(
      isPublicNoindexPharmacyAuthorization(
        { ...authorization, status: "rolled_back" },
        queue,
        "candidate-1",
        authorization.canonical_path_en,
      ),
    ).toBe(false);
    expect(
      isPublicNoindexPharmacyAuthorization(
        authorization,
        queue,
        "candidate-other",
        authorization.canonical_path_en,
      ),
    ).toBe(false);
    expect(
      isPublicNoindexPharmacyAuthorization(
        authorization,
        queue,
        "candidate-1",
        "/en/om/pharmacies/other",
      ),
    ).toBe(false);
    expect(
      isPublicNoindexPharmacyQueueRow(
        {
          ...queue,
          metadata: {
            ...(queue.metadata as Record<string, unknown>),
            canonical_paths: {
              en: authorization.canonical_path_en,
              ar: "/ar/om/pharmacies/other",
            },
          },
        },
        authorization.canonical_path_en,
      ),
    ).toBe(false);
    expect(
      isPublicNoindexPharmacyAuthorization(
        {
          ...authorization,
          canonical_path_ar: "/ar/om/pharmacies/other",
        },
        queue,
        "candidate-1",
        authorization.canonical_path_en,
      ),
    ).toBe(false);
  });
});
