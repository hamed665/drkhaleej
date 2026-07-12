import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { resolvePharmacyPreviewCanaryActivation } from "./import-pharmacy-preview-canary-activation";

const validEnvironment = {
  IMPORT_PHARMACY_PRIVATE_ADMIN_ACTION_ENABLED: "true",
  VERCEL_ENV: "preview",
  IMPORT_PREVIEW_ALLOWED_ACTOR_IDS: "actor-1",
  IMPORT_PREVIEW_CANARY_ENTITY_IDS: "pharmacy-1",
  IMPORT_PREVIEW_APPROVAL_TOKEN: "approved-token",
  IMPORT_PREVIEW_EXPECTED_APPROVAL_TOKEN: "approved-token",
};

describe("resolvePharmacyPreviewCanaryActivation", () => {
  it("enables exactly one preview actor and one Pharmacy", () => {
    expect(resolvePharmacyPreviewCanaryActivation(validEnvironment)).toEqual({
      enabled: true,
      actorId: "actor-1",
      entityId: "pharmacy-1",
      approvalToken: "approved-token",
      blockers: [],
    });
  });

  it("fails closed outside Preview", () => {
    const result = resolvePharmacyPreviewCanaryActivation({
      ...validEnvironment,
      VERCEL_ENV: "production",
    });
    expect(result.enabled).toBe(false);
    expect(result.blockers).toContain("environment_not_preview");
  });

  it("rejects multiple actors or entities", () => {
    const result = resolvePharmacyPreviewCanaryActivation({
      ...validEnvironment,
      IMPORT_PREVIEW_ALLOWED_ACTOR_IDS: "actor-1,actor-2",
      IMPORT_PREVIEW_CANARY_ENTITY_IDS: "pharmacy-1,pharmacy-2",
    });
    expect(result.enabled).toBe(false);
    expect(result.blockers).toContain("actor_allowlist_must_have_exactly_one_entry");
    expect(result.blockers).toContain("entity_allowlist_must_have_exactly_one_entry");
  });

  it("rejects a missing or mismatched approval token", () => {
    const missing = resolvePharmacyPreviewCanaryActivation({
      ...validEnvironment,
      IMPORT_PREVIEW_APPROVAL_TOKEN: "",
    });
    expect(missing.enabled).toBe(false);
    expect(missing.blockers).toContain("approval_token_missing");

    const mismatch = resolvePharmacyPreviewCanaryActivation({
      ...validEnvironment,
      IMPORT_PREVIEW_EXPECTED_APPROVAL_TOKEN: "different-token",
    });
    expect(mismatch.enabled).toBe(false);
    expect(mismatch.blockers).toContain("approval_token_mismatch");
  });

  it("requires the explicit true activation value", () => {
    const result = resolvePharmacyPreviewCanaryActivation({
      ...validEnvironment,
      IMPORT_PHARMACY_PRIVATE_ADMIN_ACTION_ENABLED: "1",
    });
    expect(result.enabled).toBe(false);
    expect(result.blockers).toContain("activation_flag_disabled");
  });
});
