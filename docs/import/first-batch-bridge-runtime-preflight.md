# First Batch Bridge Runtime Preflight

The first-batch fixture generator is currently fixture-only and guarded against the TypeScript dry-run bridge contract. The next migration is to execute the real bridge from CI, but that must not happen by guessing at a TypeScript runtime.

## Current state

- The real bridge lives at `src/server/admin/import-first-batch-dry-run-bridge.ts`.
- The fixture generator lives at `scripts/import/generate-first-batch-dry-run-fixture.mjs`.
- The generator exposes a `--bridge-contract` view that names the bridge builder and types it is expected to follow.
- The import readiness workflow runs the generated fixture check, bridge alignment check, public hold check, public release preflight check, and combined smoke.

## Blocked direct execution

Directly importing the TypeScript bridge from the `.mjs` fixture generator is blocked until the repository explicitly chooses one runtime path:

1. add a pinned TypeScript execution dependency such as `tsx`, then run the bridge through that dependency in CI;
2. compile the bridge to JavaScript before the fixture check, then run the compiled output;
3. move the reusable dry-run bridge logic into a plain JavaScript module, then import it from both TypeScript and Node scripts.

Until one of those paths is implemented, the generator must stay fixture-only and must not pretend to execute the TypeScript bridge. Pretending is for LinkedIn posts, not import safety.

## Promotion rule

A future PR may remove this preflight block only if it also:

- demonstrates the chosen runtime path in CI;
- keeps the generated fixture output stable;
- keeps imported hospitals blocked unless the public hospital hold contract is explicitly retired;
- keeps the public release preflight and combined smoke passing.
