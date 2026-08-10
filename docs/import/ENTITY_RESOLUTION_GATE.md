# ENTITY-RESOLUTION-GATE

This gate adds one private, additive Human Review decision authority on top of the immutable Entity Candidate persisted by `ENTITY-CANDIDATE-PIPELINE`. It implements the v1.2.2 `entity-review-decision` contract without changing Candidate, duplicate-candidate, geo-candidate, canonical entity, publish, Index, Sitemap, route, or UI state.

## Bound authority

- `import_entity_review_decisions` is RLS-enabled, has no public policy or direct table grant, and is append-only through a service-role RPC.
- One decision is bound to one immutable `needs_review` Candidate snapshot by Candidate id, draft version, canonical draft hash, policy version, real Evidence UUIDs, reviewer identity, reviewer role, reason, and decision time. A `collecting` Candidate fails closed.
- The only currently implemented reviewer role is the repository's real authorization primitive: `profiles.is_platform_admin = true`, represented in the contract as `platform_admin`. Documented roles that have no database authorization primitive fail closed.
- The contract reviewer id must equal the server-authenticated actor profile id. The raw session id is validated as server input, hashed, and never persisted or returned.
- A decision row is immutable. Exact idempotent replay returns the same bounded receipt; a changed request, payload, actor, or Candidate binding conflicts.

## Decision semantics

- `approve_for_exact_review` records that a Human Reviewer accepted the exact snapshot for the next reviewed operation. It is not entity approval, geo verification, canonical-write permission, publish permission, Index permission, Sitemap permission, or a reservation.
- `edit` records proposed scalar replacements only. Candidate remains immutable. Every field edit uses the version `drkhaleej.import.entityFieldValueJsonb.v1` and binds the persisted `normalized_value` through SHA-256 of PostgreSQL JSONB text for `{schemaVersion, path, value}`. Applying an edit requires a later, separately authorized Candidate snapshot operation.
- `confirmed_duplicate` binds exactly one persisted duplicate candidate, its matched entity UUID, and Evidence UUIDs already bound to that duplicate candidate. It records a Human Review conclusion but never merges records.
- `not_duplicate` is accepted only when the Candidate has exactly one duplicate candidate, because v1.2.2 supplies no duplicate id for that decision. The RPC resolves the sole binding server-side; ambiguity fails closed.
- `reject`, `request_refetch`, and `defer` are immutable review conclusions only.

## Exact-review preconditions

`approve_for_exact_review` requires a `needs_review` Candidate, full declared evidence coverage, at least one bound Evidence UUID, no open/requires-review field conflict, no duplicate candidate marked `requires_review`, and no geo candidate marked `requires_review`. Confidence or duplicate score never creates a decision automatically.

## Closed boundaries

The RPC inserts only `import_entity_review_decisions`. Candidate remains immutable; duplicate resolution columns stay pending; geo stays unverified; canonical entity tables and publish queues remain untouched. No Agent/Worker runtime, public route, admin UI, merge, geo verification, canonical mutation, publication, Index, or Sitemap authority is introduced. The legacy raw-row review helper is not equivalent to this contract-bound authority.

Production remains disconnected. Hosted proof is allowed only against the isolated Preview Session pooler after confirming Preview and Production project refs differ; its transaction always rolls back and emits bounded evidence without raw session material.

No subsequent implementation gate is opened by this document. The tracked roadmap must explicitly authorize the next gate before work continues beyond this boundary.
