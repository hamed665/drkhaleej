# DrKhaleej Controlled Publish Orchestrator

## Purpose

This layer connects the controlled single-publish dry-run plan to the private persistence adapter while keeping execution disabled.

The current lifecycle is deliberately limited to:

1. Build and validate the dry-run plan.
2. Build the future reservation request.
3. Stop at the hard executor flag.

## Hard disable

`IMPORT_CONTROLLED_PUBLISH_EXECUTOR_ENABLED` is a compile-time `false` constant.

A valid dry-run plan can therefore report orchestration readiness, but it cannot reserve an idempotency key or write a rollback snapshot in the current release.

## Fail-closed blockers

- `dry_run_plan_not_ready`
- `reservation_expiry_missing`
- `rollback_expiry_missing`
- `executor_disabled`

## Safety invariants

- No imported-entity mutation.
- No terminal-result persistence.
- No route or projection mutation.
- No visibility, index, or sitemap mutation.
- No server action or Admin button.
- No automatic retry.
- No bulk publish.

Every result keeps:

- `executionReady = false`
- `mutationEnabled = false`
- `terminalPersistenceAllowed = false`
- `bulkAllowed = false`
- `entityOperations = []`

The adapter dependency is injected and restricted to the existing private persistence contract. The reservation call remains unreachable while the hard flag is false.
