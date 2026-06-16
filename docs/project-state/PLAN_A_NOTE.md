# PLAN-A Base Subscription Plan Catalog

Status: implemented in PR scope.

## Scope

PLAN-A adds the official DrMuscat base subscription plan catalog to the existing `subscription_plans` table.

Plans:

- Free Listing
- Verified Starter
- Growth Partner
- Premium / Ads Pro

## Why this is allowed

This is official DrMuscat product catalog data, not fake provider, doctor, center, review, offer, or ranking data.

The plan catalog is required before MON-C2 can assign subscription plans to center records.

## Guardrails

- No schema changes.
- No RLS changes.
- No generated Supabase type changes.
- No seed file changes.
- No public UI changes.
- No admin UI changes.
- No payment gateway.
- No invoices.
- No add-on purchases.
- No ads.
- No special offers.
- No provider dashboard.
- No center or provider records are created.

## Pricing status

- Free Listing is active with a final price of 0 OMR.
- Paid plans are inserted as draft with price 0 OMR while commercial pricing is pending final approval.
- Final paid pricing must be approved in a later commercial phase.

## Idempotency

The migration updates existing rows by `slug` and inserts missing rows when no matching slug exists.

This lets the migration be safely re-run without creating duplicate plan rows, assuming the existing database does not already contain duplicate slugs.

## Relationship to MON-C2

After PLAN-A is applied to the target database, `/admin/center-subscriptions` should show available plans in the MON-C2 assignment form.

MON-C2 still also requires at least one non-deleted `centers` row before a subscription can be assigned.
