# DrKhaleej Real Reservation Canary

This phase adds the executable server-only reservation canary boundary for Preview.

## Guarantees

- Preview environment only.
- One explicitly allowlisted actor.
- One explicitly allowlisted entity.
- Exact one-time approval token match.
- Reservation request identity must match the guarded actor and entity.
- The canary may only reserve an idempotency record, capture one rollback snapshot, and append one `execution_started` audit event.
- Persistence readback must verify exactly one linked row in each expected persistence table and prove the entity fingerprint did not change.

## Explicitly forbidden

- Terminal-result persistence.
- Entity mutation.
- Visibility, index, route, projection, or sitemap mutation.
- Admin or public endpoint exposure.
- Bulk execution.

The function is executable only when a trusted caller supplies real Preview persistence and readback clients together with the required guards. Repository CI uses injected fakes and does not claim that a Preview database write occurred.
