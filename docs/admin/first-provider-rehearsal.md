# First Provider Rehearsal

This document defines a dry run for selecting and checking the first real provider candidate before any public state is changed.

It is not an activation instruction and it must not trigger database updates, route revalidation, sitemap changes, or public visibility changes.

## Rehearsal goal

The goal is to prove that the operator can identify a safe candidate and predict the expected admin, public, and audit outcomes before using the final gated control.

This rehearsal should be completed before the first provider is activated.

## Candidate selection

Choose one candidate only.

The candidate should have:

- status `pending_review`
- `is_active` false
- `is_claimable` false
- at least one active location
- approved primary taxonomy
- zero quality blockers
- readable English name
- safe Arabic name if available
- public copy with no unsupported medical claims
- contact values reviewed before visibility is enabled

Do not select a candidate with unclear location data, unclear taxonomy, unsupported public claims, missing provider name, or unresolved contact review state.

## Admin evidence rehearsal

Before using the final gated control, record the expected evidence shown in admin:

- draft center id
- slug
- workflow status
- verification status
- active location count
- taxonomy review state
- quality blocker count
- contact review state
- readiness blocker list
- readiness warning list

The operator must be able to explain why readiness should pass.

## Public route expectation

Before activation, the expected public result is:

- English public center route should not show the provider
- Arabic public center route should not show the provider
- public catalog listing should not show the provider
- public search should not show the provider

After activation, the expected public result is:

- English public center route may load through the eligibility wrapper
- Arabic public center route may load through the eligibility wrapper
- public listing may include the provider only if eligibility passes
- public search may include the provider only if eligibility passes
- missing public contact actions must show safe fallback copy

## Admin route expectation after activation

If activation later succeeds, the expected admin result is:

- provider no longer appears in `/admin/draft-centers`
- provider appears in `/admin/active-centers`
- active centers page remains read-only
- audit log at `/admin/audit-log` includes `draft_center.public_profile_activated`
- audit event references the center id
- audit metadata includes English and Arabic public paths
- audit metadata includes sitemap refresh evidence

## Public copy checks

The candidate must not expose public copy that implies:

- best or top provider
- rating or review score
- open-now availability
- booking availability
- insurance acceptance
- unsupported MOH approval
- guaranteed provider availability
- sponsored ranking
- medical advice, diagnosis, or emergency guidance

Public UI must keep the medical safety note visible.

## Rehearsal stop conditions

Stop the rehearsal if any of these are true:

- readiness evidence is unclear
- taxonomy review state is not approved
- no active location is present
- quality blockers are present
- contact visibility is not reviewable
- public copy makes unsupported claims
- expected public route is ambiguous
- expected audit evidence cannot be explained

Do not compensate for a failed rehearsal with manual database edits.

## Rehearsal pass criteria

The rehearsal passes only when:

- one safe candidate has been selected
- expected admin evidence is recorded
- expected public route behavior is recorded
- expected audit event is recorded
- no unsupported public claim is present
- operator knows that actual activation still requires the final gated control

Passing this rehearsal does not activate the provider. It only confirms that the first candidate is ready for a controlled activation step later.
