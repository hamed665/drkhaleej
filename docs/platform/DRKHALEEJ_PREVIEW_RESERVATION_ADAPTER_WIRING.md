# DrKhaleej Preview Reservation Adapter Wiring

## Purpose

This contract defines how a future server-only preview factory may inject a service-role RPC client into the private publish persistence adapter.

The wiring is intentionally disabled. It does not read environment variables, construct a Supabase client, or call an RPC in the current release.

## Required conditions

A future wiring attempt must satisfy all of the following:

- runtime environment is exactly `preview`
- service-role configuration has already been validated by an outer server-only boundary
- reservation-only mode is enabled by its own independent gate
- preview adapter wiring is explicitly enabled

Production and development are rejected.

## Dependency injection boundary

The contract accepts a `createRpcClient` callback instead of reading secrets or constructing a client itself. This keeps secret loading and transport configuration outside the readiness contract and allows the factory to remain testable.

While the hard flag is false, the callback is never invoked.

## Allowed RPC surface

The reservation-only wiring may expose only:

- `import_publish_reserve_snapshot_audit`

Terminal-result persistence remains forbidden in this mode.

## Hard disable

`IMPORT_PREVIEW_RESERVATION_ADAPTER_WIRING_ENABLED` is a compile-time `false` constant.

Even when every upstream condition is satisfied:

- `wiringReady = true`
- `clientConstructed = false`
- `adapter = null`
- `executionReady = false`
- `mutationEnabled = false`

## Safety invariants

- No environment-variable access.
- No Supabase client construction.
- No RPC attempt.
- No terminal-result persistence.
- No imported-entity mutation.
- No route, projection, visibility, index, or sitemap mutation.
- No Admin action or button.
- No bulk publish.
