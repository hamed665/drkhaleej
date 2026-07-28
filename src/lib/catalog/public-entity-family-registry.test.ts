import { describe, expect, it } from "vitest";

import {
  getPublicEntityFamilyRegistryEntry,
  publicEntityFamilies,
} from "./public-entity-family-registry";

describe("public entity family registry", () => {
  it("resolves every registered family exactly", () => {
    for (const family of publicEntityFamilies) {
      expect(getPublicEntityFamilyRegistryEntry(family)?.family).toBe(family);
    }
  });

  it("fails closed instead of falling back to doctor", () => {
    expect(getPublicEntityFamilyRegistryEntry("unknown_family")).toBeNull();
  });
});
