import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("one-click Preview canary static contract", () => {
  it("executes each bounded operation once with readback and no retry loop", () => {
    const source = readFileSync(
      new URL("./actions-complete-canary.ts", import.meta.url),
      "utf8",
    );

    expect(source).toContain("const MAX_ONE_CLICK_OPERATIONS = 5");
    expect(source).toContain("const executedOperations = new Set");
    expect(source).toContain("executedOperations.has(plan.operation)");
    expect(source).toContain('blocker: "complete_canary_no_progress"');
    expect(source).toContain("await stateReader({");
    expect(source).toContain('blocker: "complete_canary_post_step_readback_unavailable"');
    expect(source).toContain("runExpiredReservationRecoverySafeActionState");
    expect(source).toContain("runPharmacyPrivateAdminActionState");
    expect(source).toContain('process.env.VERCEL_ENV !== "preview"');
    expect(source).toContain("currentState.automaticMutationRetryAllowed !== false");
    expect(source).not.toMatch(/while\s*\(/);
    expect(source).not.toMatch(/setTimeout|setInterval/);
  });

  it("exposes one exact entity-bound confirmation and reloads only after completion", () => {
    const component = readFileSync(
      new URL("../../../../components/admin/import-pharmacy-complete-canary-panel.tsx", import.meta.url),
      "utf8",
    );
    const page = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

    expect(component).toContain("COMPLETE PRIVATE CANARY");
    expect(component).toContain('name="completeCanaryConfirmation"');
    expect(component).toContain("result.submitted || !result.completed");
    expect(component).toContain("window.location.reload()");
    expect(page).toContain("ImportPharmacyCompleteCanaryPanel");
    expect(page).toContain("unattended execution");
  });
});
