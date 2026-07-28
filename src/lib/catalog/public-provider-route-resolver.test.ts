import { describe, expect, it } from "vitest";

import { resolvePublicProviderCanonicalRoute } from "./public-provider-route-resolver";

describe("public provider route release", () => {
  it("releases the exact bilingual Pharmacy detail route", () => {
    expect(
      resolvePublicProviderCanonicalRoute({
        family: "pharmacy",
        slug: "reviewed-pharmacy",
        locale: "en",
        country: "om",
      }),
    ).toEqual({
      canonicalPath: "/en/om/pharmacies/reviewed-pharmacy",
      routeFamily: "pharmacy",
      publicRouteEnabled: true,
      reason: "enabled",
    });
    expect(
      resolvePublicProviderCanonicalRoute({
        family: "pharmacy",
        slug: "reviewed-pharmacy",
        locale: "ar",
        country: "om",
      }).canonicalPath,
    ).toBe("/ar/om/pharmacies/reviewed-pharmacy");
  });

  it("keeps Hospital and every later family disabled", () => {
    for (const family of ["hospital", "clinic", "lab", "pet_clinic"] as const) {
      expect(
        resolvePublicProviderCanonicalRoute({
          family,
          slug: "still-closed",
          locale: "en",
          country: "om",
        }),
      ).toMatchObject({
        canonicalPath: null,
        publicRouteEnabled: false,
        reason: "route_disabled",
      });
    }
  });

  it("rejects unsafe slugs and unsupported locale or country values", () => {
    for (const slug of ["nested/slug", "Uppercase", "../escape", "two--hyphens"]) {
      expect(
        resolvePublicProviderCanonicalRoute({
          family: "pharmacy",
          slug,
          locale: "en",
          country: "om",
        }).reason,
      ).toBe("missing_slug");
    }
    expect(
      resolvePublicProviderCanonicalRoute({
        family: "pharmacy",
        slug: "reviewed-pharmacy",
        locale: "fa",
        country: "om",
      }).reason,
    ).toBe("invalid_locale");
    expect(
      resolvePublicProviderCanonicalRoute({
        family: "pharmacy",
        slug: "reviewed-pharmacy",
        locale: "en",
        country: "ae",
      }).reason,
    ).toBe("invalid_country");
  });
});
