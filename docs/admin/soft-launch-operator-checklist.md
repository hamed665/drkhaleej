# Soft Launch Operator Checklist

This checklist is the manual operating guide for activating the first small set of provider profiles.

It does not approve bulk activation, paid placement, claim workflows, booking claims, open-now claims, ratings, insurance claims, or provider editing after activation.

## Before activating a provider

Confirm all of the following in the admin draft center detail page:

- the provider is still in `pending_review`
- the provider is not active yet
- the provider is not claimable
- at least one active location exists
- taxonomy assignment exists
- taxonomy review is approved
- quality blockers are zero
- contact visibility has only approved public values
- readiness panel shows no blockers
- readiness evidence is understandable enough for audit review

Do not activate a provider only because the UI button is enabled. The operator must still check the evidence shown on the page.

## Data that must not be changed during soft launch

During soft launch, do not manually change:

- verification status
- claim state
- billing state
- subscription state
- commercial add-ons
- sponsorship or ranking controls
- taxonomy assignments after readiness review
- contact visibility after activation
- sitemap entries outside the guarded flow

If any of these must change, stop and create a separate contract and validator first.

## Activation step

Use only the final gated control in the publication readiness panel.

The server action must re-check readiness before changing public state. If the action fails, do not retry blindly. Re-check blockers, locations, taxonomy, contact visibility, and quality evidence.

## Immediately after activation

Check these admin routes:

- `/admin/draft-centers`
- `/admin/active-centers`
- `/admin/audit-log`

Expected results:

- the provider no longer appears in the draft center list
- the provider appears in the active centers read-only view
- the active centers view has no edit controls
- the audit log has `draft_center.public_profile_activated`
- the audit event references the center entity
- the audit metadata records public paths and sitemap refresh evidence

## Public route checks

Check both public profile routes recorded by the action:

- English public profile route
- Arabic public profile route

Expected public behavior:

- the profile loads only through the public eligibility wrapper
- contact actions only show approved public contact values
- safe fallback copy appears when contact actions are absent
- medical safety note is visible
- directions links are safe external links
- services and doctors are filtered through public eligibility

## Public claims that must not appear

The public profile and listing cards must not claim:

- best or top provider
- rating or review score
- open-now availability
- booking availability
- insurance acceptance
- unsupported MOH approval
- guaranteed provider availability
- sponsored ranking

Any copy that implies one of these claims must be removed before the profile is considered soft-launch safe.

## Sitemap and search checks

After activation:

- sitemap may be revalidated by the final action
- sitemap inclusion must remain guarded by the existing sitemap validators
- public route eligibility must remain the source of truth for public center detail
- import sitemap policies must not be bypassed manually

Do not manually insert public sitemap entries during soft launch.

## Rollback note

Soft launch activation is not a rollback workflow.

If a provider must be removed from public view, stop and use or create a separate deactivate or unpublish workflow with its own contract, audit event, route revalidation, and validator.

## Soft launch pass criteria

A provider passes the soft-launch operator check only when:

- readiness evidence was reviewed before activation
- final action succeeded without manual database edits
- admin active centers view shows the provider read-only
- audit log shows activation evidence
- English and Arabic public routes load safely
- public UI does not show unsupported claims
- sitemap behavior remains guarded

This checklist is intentionally strict. Soft launch is supposed to reduce risk, not decorate a rushed production mistake with a nicer name.
