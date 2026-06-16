# PLAN-A Base Subscription Plan Catalog

Status: superseded before merge.

## Outcome

The initial PLAN-A migration approach must not be merged.

The repository's current migration validator is intentionally strict: it requires an exact SQL migration file list and forbids `INSERT INTO` in migrations. Because PLAN-A is official product catalog data rather than a schema change, the safer replacement path is an approved platform-admin initializer that writes the catalog through server-side admin code.

## Replacement path

Implement PLAN-A as an admin-only catalog initializer in a later PR or as part of the MON-C2 admin workflow.

This keeps:

- no schema changes
- no RLS changes
- no generated type changes
- no seed file changes
- no migration validator changes
- no fake provider, center, doctor, review, offer, or ranking data

## Intended plans

- Free Listing
- Verified Starter
- Growth Partner
- Premium / Ads Pro
