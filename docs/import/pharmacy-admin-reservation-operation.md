# Pharmacy Admin Reservation Operation

The Admin readiness route may reserve one allowlisted Preview Pharmacy only after a fresh persisted Review and server-side authorization match.

## Invariants

- Confirmation is exactly `RESERVE PRIVATE PUBLISH <entity-id>`.
- The operation reuses the existing atomic reservation RPC and persistence adapter.
- Authorization remains server-side and is consumed inside the reservation transaction.
- The entity is not mutated.
- Visibility remains private, route disabled, robots noindex, and sitemap excluded.
- The browser receives only bounded reservation status and replay state.
- No raw authorization, snapshot, audit, or database identifiers are returned.
- Bulk, private mutation, rollback, and public promotion remain unavailable.
