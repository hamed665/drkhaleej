# Post Activation Verifier

This document defines the static verification chain after a draft center is activated for public use.

The goal is to confirm that a newly active profile is visible only through guarded public surfaces and that the old draft workflow no longer treats it as an editable draft candidate.

## Admin behavior after activation

After final activation:

- the provider status is `active`
- `is_active` is true
- `is_claimable` remains false
- the draft center list should not include the provider anymore
- the draft center detail helper should not return it anymore
- the final audit action remains traceable as `draft_center.public_profile_activated`

The draft center list and detail helpers must continue filtering by the draft workflow statuses only:

- `draft`
- `pending_review`

This prevents active public providers from staying in the draft editing workflow.

## Public behavior after activation

The public center listing, public center detail, and public search wrappers must continue requiring:

- `is_active` equals true
- `status` equals `active`
- `verification_status` is inside the approved safe public filter set
- `deleted_at` is null

The center detail route must continue using the public eligibility wrapper before loading the full ungated detail.

## Relation behavior after activation

Public center detail relations must continue filtering related data:

- active center locations only
- available center services only
- active doctor practice locations only
- active related doctors only
- active related services only

If relation eligibility fails, public detail must fail closed instead of leaking unfiltered relations.

## Sitemap behavior after activation

The final action may revalidate sitemap, but sitemap inclusion must remain guarded by existing sitemap validators and import validators.

The final action must not directly insert sitemap rows, bypass public route eligibility, or change import queue policies.

## Public UI behavior after activation

Public UI must stay launch-safe after activation:

- no fake rating copy
- no open-now copy
- no booking copy
- no insurance copy
- no unsupported MOH approval claim
- no best/top provider claims
- no guaranteed availability copy
- safe contact fallback remains available when public contact actions are absent
- medical safety disclaimer remains visible

## Required validators

The post-activation chain requires these validators inside `seo:check`:

- `admin:final-chain:validate`
- `admin:launch-checklist:validate`
- `admin:post-activation:validate`
- `seo:public-catalog-eligibility:validate`
- `seo:public-launch-safe-ui:validate`
- `import:sitemap-family-caps:validate`
- `import:profile-smoke:validate`

A verifier pass means the static chain still protects activated profiles. It does not mean any individual provider data is correct or ready for activation.
