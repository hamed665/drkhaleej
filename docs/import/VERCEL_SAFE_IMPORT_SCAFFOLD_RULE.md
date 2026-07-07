# Vercel-Safe Import Scaffold Rule

Until the `tsx` dependency and lockfile are added together, import-readiness TypeScript bridge smoke files must stay inert.

## Rule

A scaffold file may document the future bridge smoke shape, but it must not import the TypeScript bridge or execute fixture IO before the selected runtime exists.

Blocked before `tsx` implementation:

- runtime imports from `src/server/admin/import-first-batch-dry-run-bridge`;
- top-level fixture reads in the smoke scaffold;
- bridge execution from the scaffold;
- wiring the scaffold file into the import-readiness manifest.

Allowed before `tsx` implementation:

- inert constants describing the future smoke;
- Node-based guards that inspect the scaffold text;
- docs that define the implementation requirements.

## Reason

Build and deployment systems may typecheck files that are not part of the import-readiness manifest. Keeping the scaffold inert prevents a future smoke from breaking deployment before its runtime dependency exists.

## Retirement

This rule can be retired only in the same PR that adds the pinned `tsx` dependency, updates `pnpm-lock.yaml`, and wires a real bridge smoke into the import-readiness manifest.
