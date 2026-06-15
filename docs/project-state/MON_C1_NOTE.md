# MON-C1 Admin Center Subscriptions Read-only View

Status: implemented in PR scope.

## Scope

MON-C1 adds a read-only platform-admin page for reviewing existing center subscription assignments.

Route:

- `/admin/center-subscriptions`

Data source:

- `center_subscriptions`
- `subscription_plans`
- `centers`
- `profiles` for optional sales profile labels

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
- No subscription create/update/cancel actions.
- No plan create/update actions.
- No add-on purchases.

## Behavior

- Platform admins can open `/admin/center-subscriptions`.
- The page lists up to 100 non-deleted center subscription rows.
- The page shows related center, plan, subscription status, price, dates, sales profile, notes preview, and update time when available.
- The page shows empty and unavailable states without exposing raw database errors.
- The page intentionally has no write buttons or forms.

## Future phase

MON-C2 may add admin-only plan assignment or update behavior after preview validation and explicit approval.
