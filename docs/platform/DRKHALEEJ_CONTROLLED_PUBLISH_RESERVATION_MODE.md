# DrKhaleej Controlled Publish Reservation-Only Mode

## Purpose

This mode defines the narrowest possible write-capable preparation step before any imported-entity publish mutation exists.

The only future operations allowed by this contract are:

1. Reserve one idempotency key.
2. Capture one rollback snapshot.
3. Append one `execution_started` audit event.

All three operations must remain inside the existing atomic reservation RPC.

## Hard disable

`IMPORT_RESERVATION_ONLY_MODE_ENABLED` is a compile-time `false` constant.

The current release can validate readiness for a reservation-only canary run, but it cannot call the reservation RPC.

## Canary restrictions

A future reservation-only attempt must satisfy all of these conditions:

- Preview environment only.
- Exactly one explicitly configured canary entity.
- Actor ID must be present in the explicit allowlist.
- Approval token must match exactly.
- Upstream controlled-publish orchestration must be ready.

Production is not allowed.

## Safety boundaries

- No imported-entity mutation.
- No terminal-result persistence.
- No success or rollback outcome persistence.
- No route or projection mutation.
- No visibility, index, or sitemap mutation.
- No server action or Admin button.
- No automatic retry.
- No bulk publish.

Every result keeps:

- `executionReady = false`
- `mutationEnabled = false`
- `terminalPersistenceAllowed = false`
- `entityMutationAllowed = false`
- `routeMutationAllowed = false`
- `sitemapMutationAllowed = false`
- `bulkAllowed = false`

## Fail-closed blockers

- `orchestration_not_ready`
- `environment_not_allowed`
- `canary_entity_missing`
- `canary_entity_mismatch`
- `actor_not_allowed`
- `approval_token_missing`
- `reservation_only_mode_disabled`

This contract does not authorize a canary run. Enabling the mode requires a separate reviewed change with dedicated integration testing and explicit operational approval.
