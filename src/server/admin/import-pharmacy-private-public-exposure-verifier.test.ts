import { vi } from "vitest";

vi.mock("server-only", () => ({}));

import { describe, expect, it } from "vitest";
import { verifyImportPharmacyPrivatePublicExposure } from "./import-pharmacy-private-public-exposure-verifier";

function safeEvidence() {
  return {
    publicProfileResolved: false,
    routeStatus: 404,
    robotsIndex: false,
    canonicalHref: null,
    hreflangCount: 0,
    jsonLdCount: 0,
    queryCount: 1,
    listedInSearch: false,
    listedInSitemap: false,
    htmlBytes: 24000,
  };
}

describe("private pharmacy public exposure verifier", () => {
  it("accepts only a non-public 404 with no SEO or discovery leakage", () => {
    expect(verifyImportPharmacyPrivatePublicExposure(safeEvidence())).toEqual({
      verified: true,
      blockers: [],
      budgets: { maximumQueries: 2, maximumHtmlBytes: 120000 },
    });
  });

  it("fails closed on every public exposure signal", () => {
    const result = verifyImportPharmacyPrivatePublicExposure({
      publicProfileResolved: true,
      routeStatus: 200,
      robotsIndex: true,
      canonicalHref: "https://drkhaleej.com/en/om/pharmacies/private-canary",
      hreflangCount: 2,
      jsonLdCount: 1,
      queryCount: 3,
      listedInSearch: true,
      listedInSitemap: true,
      htmlBytes: 120001,
    });

    expect(result.verified).toBe(false);
    expect(result.blockers).toEqual([
      "public_profile_resolved",
      "route_not_not_found",
      "robots_index_enabled",
      "canonical_exposed",
      "hreflang_exposed",
      "json_ld_exposed",
      "query_budget_exceeded",
      "search_leak",
      "sitemap_leak",
      "html_budget_exceeded",
    ]);
  });

  it("allows robots to be absent on a true 404 but never index=true", () => {
    expect(
      verifyImportPharmacyPrivatePublicExposure({ ...safeEvidence(), robotsIndex: null }).verified,
    ).toBe(true);
  });
});
