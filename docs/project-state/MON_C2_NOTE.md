# MON-C2 Admin Center Subscription Assignment

Status: implemented in PR scope.

## Scope

MON-C2 adds platform-admin-only create/update behavior for center subscription assignment rows.

Route:

- `/admin/center-subscriptions`

Data source:

- `center_subscriptions`
- `subscription_plans`
- `centers`
- `profiles`

## PLAN-A initializer

This PR also includes a platform-admin-only initializer for the official base subscription plan catalog:

- Free Listing
- Verified Starter
- Growth Partner
- Premium / Ads Pro

This initializer uses existing server-side admin write patterns and the existing `subscription_plans` table.

It is intentionally not a migration and not a seed file because the current migration and seed validators remain locked against product-catalog data rows.

## Write behavior

The admin assignment form can:

- initialize the official base plan catalog when no plans are available
- select a center
- select a subscription plan
- set subscription status
- set billing interval
- set optional agreed price amount
- set optional start, end, and trial end dates
- save optional private notes

If the selected center already has a non-deleted subscription assignment, the latest assignment row is updated.

If the selected center has no non-deleted subscription assignment, a new row is inserted.

The current platform admin profile is stored as `sales_profile_id`.

The selected plan currency is used as `currency_code`.

## Guardrails

- No migrations.
- No RLS changes.
- No generated Supabase type changes.
- No seed changes.
- No payment gateway.
- No billing checkout.
- No invoice system.
- No provider dashboard.
- No public UI changes.
- No public badge activation.
- No add-on purchases.
- No ads.
- No special offers.
- No media upload.
- No AI features.
- No center or provider records are created by the plan initializer.

## UI behavior

- The existing read-only list remains visible.
- If plans are missing, the admin sees an initializer button instead of dead dropdowns.
- The assignment form is visible when at least one center and one plan are available.
- The form explains that it does not charge, invoice, publish badges, activate ads, activate offers, enable add-ons, or unlock provider dashboard access.
- Save returns a safe success or failure message.
- Raw database errors are not exposed.

## Future phases

Later phases may add:

- richer plan assignment editing
- plan entitlement enforcement
- billing and invoice records
- paid add-on purchase records
- provider dashboard visibility
- public verified/featured display rules
