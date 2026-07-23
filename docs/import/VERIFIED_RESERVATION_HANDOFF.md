# P04-B Verified Reservation Handoff

## Mapping

- Execution Phase: `Phase 2`
- Lock Scope: `Phase 10`
- Product Module: `Phase 6`
- Subphase ID: `VERIFIED-RESERVATION-HANDOFF`

## Purpose

P04-B creates one server-only contract for handing the already verified Pharmacy Reservation to an injected executor port. It extends the existing Reservation, readback verifier, and Pharmacy private executor boundaries. It does not create a second Reservation authority.

## Authority boundary

The handoff accepts only evidence that is already bound to the persisted Review, Authorization, Reservation, rollback snapshot, and reservation audit. It verifies the exact:

- actor and entity;
- Review state and operation-attempt identity;
- idempotency key and request hash;
- patch hash;
- expected entity version;
- rollback snapshot hash;
- entity fingerprint;
- Pharmacy family and `reserve_private_publish` scope;
- Reservation, rollback snapshot, and audit identifiers;
- compatible reservation audit signature;
- expiry and integrity-zero readback.

A stale, foreign, incomplete, expired, unverified, duplicated, orphaned, audit-gap, or incompatible handoff fails closed before the executor port.

## No second Reservation

The private wiring no longer imports or invokes the real Reservation canary, the reservation transaction adapter, or the Reservation RPC. The handoff constructs the executor input only from the already verified server-side Reservation evidence. The returned bounded workflow result contains no raw Authorization, Reservation, rollback snapshot, or audit identifiers.

## Activation boundary

P04-B is refactor, contract, and injected-port proof only.

- `private_publish` remains absent from the enabled Admin operations.
- No real mutation writer is wired by this phase.
- The executor port is optional and the real wiring fails closed when it is absent.
- Tests use a controlled injected stub to prove one handoff invocation and zero Reservation invocations.
- Actual Private Publish mutation, terminal persistence, and post-mutation readback remain disabled until P05.

## Database, routes, and Production

- No migration is added or changed.
- No SQL, RLS, grant, RPC, route, index, sitemap, public visibility, or UI capability is added.
- No Production database is connected or changed.
- No hosted mutation is executed in this phase.

## Validation

- focused handoff unit tests;
- real-wiring injected-port integration tests;
- static no-second-Reservation and no-client-ID checks;
- `pnpm import:verified-reservation-handoff:validate`;
- `pnpm import:publish-readiness-audit:validate`;
- `pnpm typecheck`;
- `pnpm lint`;
- `pnpm build`;
- GitHub Actions and Vercel Preview.

## Rollback plan

Code rollback removes the handoff module and restores the previous dormant wiring. There is no data rollback because P04-B performs no database mutation or migration.

## Stop conditions

Stop before merge if the handoff requires a new Reservation, cannot prove complete binding, exposes raw identifiers to a client/action DTO, enables `private_publish`, invokes a real mutation, needs a Production connection, or weakens an existing validator.
