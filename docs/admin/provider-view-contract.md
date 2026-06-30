# Provider View Contract

This contract defines the admin boundary after a draft center leaves the draft workflow and becomes a public provider record.

## Draft workflow boundary

The draft center workflow is only for records in these statuses:

- `draft`
- `pending_review`

After the final admin step, the provider record uses:

- `status` set to `active`
- `is_active` set to true
- `is_claimable` kept false

An active provider must not appear in the draft center list and must not load through the draft center detail helper.

## Current admin trace path

Until a dedicated active provider admin page exists, review after the final admin step is limited to:

- the admin audit event list helper
- the audit action `draft_center.public_profile_activated`
- the public English profile route
- the public Arabic profile route
- sitemap refresh evidence recorded in audit metadata

This path is intentionally read-only. Any future active provider editor must be a separate workflow with its own contract, permissions, audit actions, and validators.

## Audit requirements

The audit helper must remain gated by `admin.audit.read`.

The final admin step must continue writing:

- action: `draft_center.public_profile_activated`
- entity type: `center`
- target table: `centers`
- old values for status and public flags
- new values for status and public flags
- public paths in metadata
- sitemap refresh evidence in metadata

## Future active provider admin view

A future active provider admin view may be added later, but it must be read-only first.

The first active provider view should show:

- provider id
- slug
- status
- public flags
- verification status
- last audit event summary
- public English route
- public Arabic route

It must not reuse draft center edit forms.
