# ADM-D2 Read-only Lead History UI

This PR adds a read-only lead history baseline for platform admins.

Scope:
- Adds a server-only helper to read `provider_onboarding_lead_events` by `lead_id`.
- Renders a private admin-only lead history card on the lead detail route.
- Shows an empty state when no events exist.

Guardrails:
- No migrations.
- No RLS changes.
- No generated type changes.
- No seed changes.
- No event writes.
- No note form.
- No public route changes.
- No provider dashboard, billing, article, AI, assignment, contact action, or conversion logic.

Preview is required before merge.
