# Canonical Pharmacy Reviewed Mutation Patch

The Pharmacy Admin review and the real private mutation writer must use one canonical patch authority.

## Invariants

- Every field sent to `import_publish_pharmacy_private` is represented in the Admin exact diff projection.
- The mutation writer does not maintain a second patch builder.
- Current-state projection and proposed mutation projection use the same field contract.
- Evidence objects are serialized canonically for deterministic review comparison.
- Private publish, reservation, rollback, public route, index, sitemap, and bulk execution remain disabled by this change.

## Follow-up boundary

This contract intentionally exposes the current metadata replacement and hard-coded locale behavior in exact review. The next focused phase will preserve protected metadata and reviewed locale without widening execution capability.
