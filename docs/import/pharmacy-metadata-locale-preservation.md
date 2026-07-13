# Pharmacy Metadata and Locale Preservation

The private Pharmacy mutation must not replace the complete metadata object or mutate locale and country implicitly.

## Invariants

- `default_locale` and `default_country` are not part of the canonical mutation patch.
- The mutation accepts a bounded `metadata_patch` only.
- Existing metadata is merged with the bounded patch rather than replaced.
- Protected keys such as `canonicalGeo` and `projectionVersion` are not accepted from the mutation patch and remain unchanged.
- Unknown top-level patch keys and unknown metadata patch keys fail closed in the database RPC.
- Status remains draft, and public route, index, sitemap, and activation remain disabled.
- The RPC remains service-role-only and security-invoker.

## Scope boundary

This phase does not enable reservation, private publish execution, rollback execution, public promotion, routes, sitemap entry, indexing, bulk import, Hospital, or Doctor mutation.
