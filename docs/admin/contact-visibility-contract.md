# Contact Visibility Contract

This document defines the admin-only contract for preparing provider contact fields for later public display.

## Existing foundation

Contact visibility storage already exists on `centers` and `center_locations`.

The contract covers these review fields:

- `contact_review_status`
- `contact_reviewed_at`

The v1 contact visibility workflow may prepare only these visibility flags:

- `public_primary_phone_visible`
- `public_whatsapp_phone_visible`
- `public_email_visible`

`public_secondary_phone_visible` remains out of scope for this workflow until a separate contract approves it.

## Workflow boundary

Contact visibility must be a separate admin workflow from draft center create, draft center edit, location create, location edit, location primary selection, internal location review, quality review, provider publication, verification, claim, billing, and sponsorship.

Non-contact workflows may reset contact visibility flags to `false` for safety, but they must not set any contact visibility flag to `true` and must not set `contact_review_status` to `approved`.

Only the contact visibility workflow may set a v1 visibility flag to `true` or mark contact review as approved.

## Eligibility

A contact visibility workflow may only run for centers that are still in `draft` or `pending_review` workflow status.

Location-level public contact visibility may only be prepared for a `center_locations` row that:

- belongs to the selected center
- is not deleted
- is internally active for the admin quality workflow
- has the matching contact value present before its visibility flag can become `true`

Center-level public contact visibility may only be prepared after at least one internally active location exists for the center.

Prepared contact visibility does not make a provider public. Public rendering still requires the provider or center to pass the separate publication eligibility gate.

## Required data checks

The workflow must refuse to make a field visible when the underlying contact value is empty.

Required value checks:

- `public_primary_phone_visible` requires a non-empty primary phone
- `public_whatsapp_phone_visible` requires a non-empty WhatsApp phone
- `public_email_visible` requires a non-empty email

Email visibility may be reviewed as a flag in this workflow, but public email rendering or `mailto:` links require a later public-contact rendering contract.

## Side effects

The contact visibility workflow must not publish a provider, activate a center publicly, verify a center, claim a center, change billing, change sponsorship, change publication readiness, create public routes, or update sitemap eligibility.

The workflow must not revalidate public routes and must not revalidate sitemap.

The workflow may revalidate the admin draft center detail page only.

## Audit

Every successful contact visibility change must write an admin audit event.

The audit event must record:

- the center id
- the optional location id
- the approved or revoked fields
- the old visibility values when available
- the new visibility values
- the resulting `contact_review_status`

## Public display rule

A public UI must treat contact visibility as necessary but not sufficient.

A contact field may display publicly only when:

- the provider or center is public eligible
- the related location is active when location-level contact is used
- the contact visibility flag is `true`
- the contact value is non-empty
- `contact_review_status` is `approved`
- the row is not suspended, rejected, deleted, or otherwise blocked by the publication eligibility layer

## Guard requirement

The runtime guard must ensure create, edit, location review, quality review, verification, claim, billing, sponsorship, and provider publication flows do not approve contact visibility as a side effect.

The UI guard must keep safety copy near every contact visibility action and must not use public launch wording for prepared visibility flags.
