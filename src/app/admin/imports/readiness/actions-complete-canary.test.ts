import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("one-click Preview canary static contract", () => {
  it("executes each bounded operation once and only polls persisted readback", () => {
    const source = readFileSync(
      new URL("./actions-complete-canary.ts", import.meta.url),
      "utf8",
    );
    const readback = readFileSync(
      new URL("../../../../server/admin/import-pharmacy-complete-canary-readback.ts", import.meta.url),
      "utf8",
    );

    expect(source).toContain("const MAX_ONE_CLICK_OPERATIONS = 5");
    expect(source).toContain("const executedOperations = new Set");
    expect(source).toContain("executedOperations.has(plan.operation)");
    expect(source).toContain('blocker: "complete_canary_no_progress"');
    expect(source).toContain("readPharmacyCompleteCanaryOperationReadback");
    expect(source).toContain("completedWithDeferredStateReadback");
    expect(source).toContain('blocker: "complete_canary_post_step_readback_unverified"');
    expect(source).toContain("runExpiredReservationRecoverySafeActionState");
    expect(source).toContain("runPharmacyPrivateAdminActionState");
    expect(source).toContain('process.env.VERCEL_ENV !== "preview"');
    expect(source).toContain("currentState.automaticMutationRetryAllowed !== false");
    expect(source).not.toMatch(/while\s*\(/);
    expect(source).not.toMatch(/setTimeout|setInterval/);

    expect(readback).toContain("DEFAULT_READBACK_ATTEMPTS = 6");
    expect(readback).toContain("MAX_READBACK_ATTEMPTS = 8");
    expect(readback).toContain('setTimeout as wait');
    expect(readback).toContain("await input.reader");
    expect(readback).toContain("isPharmacyCompleteCanaryOperationReadbackVerified");
    expect(readback).not.toContain("runPharmacyPrivateAdminActionState");
    expect(readback).not.toContain("runPharmacyPrivateAdminPublishOperation");
    expect(readback).not.toContain("runPharmacyPrivateAdminRollbackOperation");
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
