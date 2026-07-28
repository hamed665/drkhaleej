import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { IMPORT_ENTITY_DOMAIN_BY_TYPE } from "./import-entity-domain";
import { resolveImportProviderAuthority } from "./import-provider-authority-adapter";

describe("import provider authority adapter", () => {
  it("resolves every canonical intake entity without guessing", () => {
    for (const entityType of Object.keys(IMPORT_ENTITY_DOMAIN_BY_TYPE)) {
      const result = resolveImportProviderAuthority(entityType);
      expect(result.ok, entityType).toBe(true);
      if (result.ok) {
        expect(result.authority.entityType).toBe(entityType);
      }
    }
  });

  it("normalizes the legacy staging vocabulary into canonical entity types", () => {
    expect(resolveImportProviderAuthority("laboratory")).toMatchObject({
      ok: true,
      authority: {
        entityType: "lab",
        publicFamily: "lab",
      },
    });
    expect(resolveImportProviderAuthority("medical_center")).toMatchObject({
      ok: true,
      authority: {
        entityType: "clinic",
        publicFamily: "clinic",
      },
    });
  });

  it("fails closed for unknown or ambiguous intake values", () => {
    expect(resolveImportProviderAuthority("center")).toEqual({
      ok: false,
      reason: "unsupported_entity_type",
      entityType: null,
    });
    expect(resolveImportProviderAuthority("human_pharmacy")).toEqual({
      ok: false,
      reason: "unsupported_entity_type",
      entityType: null,
    });
  });

  it("records the independently released Pharmacy route without implying discovery", () => {
    const pharmacy = resolveImportProviderAuthority("pharmacy");
    expect(pharmacy).toMatchObject({
      ok: true,
      authority: {
        publicFamily: "pharmacy",
        publicProjection: {
          entityType: "pharmacy",
          family: "pharmacies",
        },
        storageAuthority: "centers",
        potentialCapabilities: {
          detailPage: true,
          sitemapEntry: true,
        },
        routeRelease: {
          family: "pharmacy",
          status: "supported",
          publicRouteEnabled: true,
          reason: "enabled",
        },
      },
    });
  });

  it("preserves the existing doctor route and later disabled routes", () => {
    expect(resolveImportProviderAuthority("doctor")).toMatchObject({
      ok: true,
      authority: {
        routeRelease: {
          family: "doctor",
          status: "supported",
          publicRouteEnabled: true,
          reason: "enabled",
        },
      },
    });
    expect(resolveImportProviderAuthority("hospital")).toMatchObject({
      ok: true,
      authority: {
        routeRelease: {
          family: "hospital",
          status: "disabled",
          publicRouteEnabled: false,
        },
      },
    });
  });
});
