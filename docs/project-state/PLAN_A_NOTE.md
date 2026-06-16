# PLAN-A Base Subscription Plan Catalog

Status: superseded before merge.

## Outcome

The initial PLAN-A migration approach was not merged.

The repository's current migration validator requires an exact migration file list and forbids `INSERT INTO` in SQL migrations. Because PLAN-A is product catalog data rather than a schema change, the safer path is to avoid adding product catalog rows through a migration while this validator contract is still locked.

## Replacement path

PLAN-A should be implemented through an approved platform-admin initializer that writes the official base subscription plan catalog through existing application/admin server-side write patterns.

This keeps:

- no schema changes
- no RLS changes
- no generated type changes
- no seed file changes
- no migration validator changes
- no fake provider/center/review data

## Intended plans

- Free Listing
- Verified Starter
- Growth Partner
- Premium / Ads Pro
