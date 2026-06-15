# ADM-E Lead History Event Writes

This branch updates the existing admin status and priority mutation so it writes private lead history rows when a platform admin changes a provider onboarding lead status or priority.

Scope:
- Status changes write `status_changed` events.
- Priority changes write `priority_changed` events.
- No-change submissions do not write events.
- Existing lead update behavior stays in place.

Guardrails:
- No migrations.
- No RLS changes.
- No generated type changes.
- No seed changes.
- No note form.
- No public route changes.
- No contact, assignment, conversion, billing, provider dashboard, article, or AI logic.

Preview is required before merge.
