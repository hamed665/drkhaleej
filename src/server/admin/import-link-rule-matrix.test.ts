import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getImportLinkRuleDecision } from "./import-link-rule-matrix";

describe("import link rule matrix", () => {
  it("blocks pet-clinic links to the canonical human pharmacy type explicitly", () => {
    expect(
      getImportLinkRuleDecision({
        source_type: "pet_clinic",
        target_type: "pharmacy",
        source_domain: "pet_healthcare",
        target_domain: "human_healthcare",
      }),
    ).toMatchObject({
      decision: "blocked",
      rule: {
        source_type: "pet_clinic",
        target_type: "pharmacy",
        allowed: false,
      },
      blockers: ["blocked_by_explicit_rule"],
    });
  });
});
