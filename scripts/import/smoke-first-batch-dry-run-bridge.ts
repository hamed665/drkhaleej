// Intentionally inert until the tsx dependency and lockfile are added together.
// Keeping this file free of TypeScript imports prevents build/typecheck systems from
// compiling the future bridge smoke before the selected runtime exists.

export const firstBatchBridgeSmokeScaffold = {
  status: "pending_tsx_dependency",
  inputFixture: "fixtures/import/first-batch-dry-run.input.json",
  bridgeBuilder: "buildFirstBatchDryRunReport",
  expectedDecisionWhileHospitalHeld: "no_go",
} as const;
