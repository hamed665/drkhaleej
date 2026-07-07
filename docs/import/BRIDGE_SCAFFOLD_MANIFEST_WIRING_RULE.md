# Bridge Scaffold Manifest Wiring Rule

The bridge scaffold guard must be wired into the import-readiness manifest before the executable bridge smoke is wired.

## Current rule

Before the runtime dependency is implemented, the bridge scaffold must stay inert and the executable bridge smoke must not appear in the manifest.

Before the runtime implementation PR is accepted, the manifest must include the Node guard:

`scripts/import/check-first-batch-bridge-smoke-scaffold.mjs`

Only after `tsx` and the generated lockfile are added may the executable TypeScript smoke be wired into the manifest.

## Reason

This keeps deployment systems from compiling or executing the future TypeScript smoke before its runtime exists.
