# DrKhaleej Controlled Single Publish Contract

## Purpose

This contract defines the safety boundary that must exist before DrKhaleej implements a real single-entity publish mutation.

## Contract only

This phase does not execute a publish mutation. It evaluates whether the prerequisites for a future controlled mutation are present while keeping `executionReady` false.

## Required controls

- Exactly one entity must be targeted.
- Idempotency key must be present.
- Expected version must be present for optimistic concurrency control.
- Readiness and the existing manual publish flow must both pass.
- Sitemap Eligibility 2026 must pass.
- Audit trail storage must be available before execution.
- Rollback snapshot must exist before any state transition.
- Single transaction boundary must cover the future publish state change and its audit event.
- Dry-run review must be completed.

## Separate readiness states

`contractReady` means the request satisfies the contract except for the deliberately disabled mutation switch.

`executionReady` remains false in this phase. A contract-ready plan still includes `mutation_not_enabled` because no runtime mutation exists yet.

## Concurrency and retries

The future executor must compare `expectedVersion` before writing. Reusing the same idempotency key must return the original result rather than applying the state transition twice.

## Rollback boundary

The future executor must capture the prior visibility, index, sitemap, public-ready, publish-status, projection version, and canonical route state before mutation. Any failed transaction must restore the previous state and record the failure in the audit trail.

## Scope

- No mutation implementation.
- No database writes.
- No server action.
- No Admin button.
- No public route behavior change.
- No sitemap XML generation.
- No bulk publish.

The point is to make publishing one entity boring, deterministic, and reversible before anyone is allowed to make publishing hundreds of entities exciting, fast, and regrettable.
