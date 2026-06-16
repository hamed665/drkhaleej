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
- Premium Partner

This initializer uses existing server-side admin write patterns and the existing `subscription_plans` table.

It is intentionally not a migration and not a seed file because the current migration and seed validators remain locked against product-catalog data rows.

When plans exist but centers do not, the admin UI shows the initialized plan catalog by name and status so the operator can verify that plan creation worked before moving on to center creation.

## CENTER-A draft center creation

This PR also adds an admin-only draft center creation control on provider onboarding lead detail pages.

The control creates one internal draft center from the lead and links the lead metadata back to the created draft center.

It does not publish the center, verify it, create a claim, assign a subscription, bill, invoice, activate ads, activate offers, or expose public badges.

## Write behavior

The admin assignment form can:

- initialize or sync the official base plan catalog
- create one internal draft center from a provider onboarding lead
- select a center
- select a subscription plan
- set subscription status
- use the selected plan interval as the subscription billing interval
- set optional agreed price amount
- set optional start, end, and trial end dates
- save optional private notes

If the selected center already has a non-deleted subscription assignment, the latest assignment row is updated.

If the selected center has no non-deleted subscription assignment, a new row is inserted.

The current platform admin profile is stored as `sales_profile_id`.

The selected plan currency is used as `currency_code`.

The selected plan interval is used as `billing_interval`; this prevents annual plan rows from being saved with a quarterly or monthly billing interval unless a future approved phase introduces explicit interval overrides.

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
- If plans exist but centers are missing, the admin sees the initialized plan catalog list and the remaining center prerequisite.
- The assignment form is visible when at least one center and one plan are available.
- The form explains that billing interval follows the selected plan.
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
