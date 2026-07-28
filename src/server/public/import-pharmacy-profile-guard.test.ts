import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn(),
}));

import {
  isPublicNoindexPharmacyAuthorization,
  isPublicNoindexPharmacyQueueRow,
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
  },
};

const authorization: PharmacyPublicNoindexAuthorizationRow = {
  candidate_id: "candidate-1",
  status: "published",
  published_queue_id: "queue-1",
  canonical_path_en: "/en/om/pharmacies/reviewed-pharmacy",
  canonical_path_ar: "/ar/om/pharmacies/reviewed-pharmacy",
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

  it.each([
    ["publish_status", "index_eligible"],
    ["index_policy", "index"],
    ["sitemap_policy", "included"],
  ] as const)("rejects a queue that crosses the %s boundary", (key, value) => {
    expect(
      isPublicNoindexPharmacyQueueRow({ ...queue, [key]: value }, authorization.canonical_path_en),
    ).toBe(false);
  });

  it("rejects sitemap, index, authority, candidate, and path drift", () => {
    expect(
      isPublicNoindexPharmacyQueueRow(
        {
          ...queue,
          metadata: { ...(queue.metadata as Record<string, unknown>), sitemap_included: true },
        },
        authorization.canonical_path_en,
      ),
    ).toBe(false);
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
  });
});
