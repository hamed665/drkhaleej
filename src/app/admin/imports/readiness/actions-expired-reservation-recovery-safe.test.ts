import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("expired Reservation recovery stale-revision guard", () => {
  it("re-reads the exact persisted phase before rebasing the form revision", () => {
    const source = readFileSync(
      new URL("./actions-expired-reservation-recovery-safe.ts", import.meta.url),
      "utf8",
    );
    const readback = source.indexOf("await stateReader({ actorId: admin.id, entityId, now: new Date().toISOString() })");
    const phaseGate = source.indexOf("resolvePharmacyExpiredReservationRecoveryOperation(currentState)");
    const revisionRebase = source.indexOf('formData.set("stateRevision", currentState.revision)');
    const delegatedAction = source.indexOf("return runExpiredReservationRecoveryActionState(previousState, formData)");

    expect(readback).toBeGreaterThan(-1);
    expect(phaseGate).toBeGreaterThan(readback);
    expect(revisionRebase).toBeGreaterThan(phaseGate);
    expect(delegatedAction).toBeGreaterThan(revisionRebase);
    expect(source).toContain('blocker: "recovery_phase_changed"');
  });

  it("forces a new browser form for every persisted operation revision", () => {
    const source = readFileSync(
      new URL("../../../components/admin/import-pharmacy-expired-reservation-recovery-panel.tsx", import.meta.url),
      "utf8",
    );

    expect(source).toContain("runExpiredReservationRecoverySafeActionState");
    expect(source).toContain('key={`${definition.operation}:${stateMachine.revision}`}');
    expect(source).toContain('<input type="hidden" name="stateRevision" value={stateMachine.revision} />');
  });
});
