# DATA-SEED-TEMPLATE-A — Blank MVP Provider Seed Template

## 1. Purpose

This document defines the controlled blank collection and import-template specification for future MVP public provider seed candidates under `PHASED_BUILD_ONLY`.

This PR is documentation/template-only. It does **not** approve inserting provider rows, publishing listings, creating seed SQL, creating import scripts, editing migrations, changing RLS, changing generated Supabase types, changing application behavior, or adding real provider data.

The template exists so future provider candidates can be collected in a consistent, conservative, manually reviewable, and auditable format before any separate seed/import PR is proposed.

## 2. Phase Control

- Task ID: `DATA-SEED-TEMPLATE-A`
- Mode: `PHASED_BUILD_ONLY`
- Task type: Documentation/template-only PR
- Execution Phase: Phase 3 — Public SEO Platform / public discovery completeness planning
- Lock Scope: Documentation-only project-state seed template
- Product Module: Public catalog data quality and discovery readiness
- Subphase ID: `DATA-SEED-TEMPLATE-A`

This template follows `docs/project-state/DATA_SEED_MVP_PLAN.md`. If this document conflicts with stricter repository, project-state, migration, RLS/security, SEO, validation, or future human instructions, the stricter guardrail wins.

## 3. Template Columns

Future MVP provider seed collection must use exactly these columns, in this order:

1. `internal_review_id`
2. `provider_name_en`
3. `provider_name_ar`
4. `provider_type`
5. `country_code`
6. `city`
7. `area`
8. `public_phone`
9. `public_whatsapp`
10. `public_email`
11. `public_website`
12. `public_address`
13. `map_url`
14. `latitude`
15. `longitude`
16. `short_description_en`
17. `short_description_ar`
18. `service_categories`
19. `source_type`
20. `source_url_or_reference`
21. `source_review_note`
22. `reviewed_by`
23. `reviewed_at`
24. `review_status`
25. `listing_status`
26. `claim_status`
27. `verification_status`
28. `sponsorship_status`
29. `review_rating_status`
30. `offers_status`
31. `import_ready`
32. `rejection_reason`

## 4. Allowed Enum Guidance

### `provider_type`

Allowed values:

- `clinic`
- `medical_center`
- `dental_clinic`
- `pharmacy`
- `lab`
- `hospital`
- `wellness`
- `beauty`
- `pet_clinic`
- `other`

### `country_code`

- MVP value must be `om`.

### `review_status`

Allowed values:

- `pending_review`
- `approved`
- `rejected`
- `needs_more_info`

### `listing_status`

Allowed values:

- `draft`
- `public_candidate`
- `do_not_publish`

### Conservative status fields

- `claim_status`: `unclaimed`
- `verification_status`: `unverified`
- `sponsorship_status`: `not_sponsored`
- `review_rating_status`: `no_reviews_no_ratings`
- `offers_status`: `no_offers`

### `import_ready`

Allowed values:

- `yes`
- `no`

`import_ready` must remain `no` until the row is manually reviewed, approved, and explicitly allowed for a future seed/import PR.

## 5. Required Default Values

Every future row must begin with these conservative defaults unless a later approved review step explicitly changes an allowed review/listing field:

| Field | Required default |
|---|---|
| `country_code` | `om` |
| `claim_status` | `unclaimed` |
| `verification_status` | `unverified` |
| `sponsorship_status` | `not_sponsored` |
| `review_rating_status` | `no_reviews_no_ratings` |
| `offers_status` | `no_offers` |
| `import_ready` | `no` until manually approved |

The default statuses must not imply provider ownership, DrMuscat verification, paid placement, reviews, ratings, offers, credentials, quality ranking, or endorsement.

## 6. Field Rules

### Required before any future import

A row must not be imported unless all of these fields are complete and reviewed:

- `internal_review_id`
- `provider_name_en` or `provider_name_ar` with at least one confirmed public provider name
- `provider_type`
- `country_code`
- `city`
- `area`
- At least one confirmation-safe public contact or location field from:
  - `public_phone`
  - `public_whatsapp`
  - `public_email`
  - `public_website`
  - `public_address`
  - `map_url`
  - both `latitude` and `longitude`
- `source_type`
- `source_review_note`
- `reviewed_by`
- `reviewed_at`
- `review_status`
- `listing_status`
- `claim_status`
- `verification_status`
- `sponsorship_status`
- `review_rating_status`
- `offers_status`
- `import_ready`

### Optional collection fields

These fields may remain blank when not safely confirmed, not publicly available, or not appropriate for neutral directory listing use:

- `provider_name_en` when only Arabic is safely confirmed
- `provider_name_ar` when only English is safely confirmed
- `public_phone`
- `public_whatsapp`
- `public_email`
- `public_website`
- `public_address`
- `map_url`
- `latitude`
- `longitude`
- `short_description_en`
- `short_description_ar`
- `service_categories`
- `source_url_or_reference`
- `rejection_reason` unless `review_status` is `rejected` or `listing_status` is `do_not_publish`

Optional fields must be omitted rather than guessed when there is uncertainty.

### Internal-only fields

These fields are for review, audit, import governance, and operational control only. They must not be displayed on public provider pages unless a future approved implementation explicitly maps a safe public subset:

- `internal_review_id`
- `source_type`
- `source_url_or_reference`
- `source_review_note`
- `reviewed_by`
- `reviewed_at`
- `review_status`
- `listing_status`
- `import_ready`
- `rejection_reason`

### Fields that must never be public

These fields must never be exposed publicly:

- `internal_review_id`
- `source_review_note`
- `reviewed_by`
- `reviewed_at`
- `review_status`
- `import_ready`
- `rejection_reason`
- Any private reviewer note, private source note, patient data, private contact detail, credential evidence, secret, unpublished admin note, or non-public provider information that could be added during future review.

## 7. Validation Rules for Future Real Data

Future filled templates must satisfy all rules below before any separate seed/import PR is proposed:

- No row can be `import_ready=yes` unless `review_status=approved`.
- No row can contain review, rating, verified, claim, sponsored, offer, ranking, endorsement, credential, quality, or outcome claims.
- No row can contain private medical data or patient data.
- Every row must have `source_type` and `source_review_note`.
- Contact fields must be public and confirmation-safe.
- Contact fields must not route users to a private person, stale number, patient-only channel, private email, or unsupported destination.
- Arabic or English values must not be invented when they could imply legal, clinical, credential, licensing, or service claims.
- Uncertain, disputed, sensitive, unsupported, or reuse-restricted data must stay out of the template or be rejected.
- `claim_status` must remain `unclaimed`.
- `verification_status` must remain `unverified`.
- `sponsorship_status` must remain `not_sponsored`.
- `review_rating_status` must remain `no_reviews_no_ratings`.
- `offers_status` must remain `no_offers`.

## 8. Blank CSV Template

The blank CSV template is stored at:

```txt
docs/project-state/templates/mvp_provider_seed_template.csv
```

It contains only the header row and no provider data. The header row is:

```csv
internal_review_id,provider_name_en,provider_name_ar,provider_type,country_code,city,area,public_phone,public_whatsapp,public_email,public_website,public_address,map_url,latitude,longitude,short_description_en,short_description_ar,service_categories,source_type,source_url_or_reference,source_review_note,reviewed_by,reviewed_at,review_status,listing_status,claim_status,verification_status,sponsorship_status,review_rating_status,offers_status,import_ready,rejection_reason
```

## 9. Future Implementation Path

A future `DATA-SEED-MVP-A` PR may fill the template with approved rows only after explicit human approval. That future PR must remain conservative, reviewable, and limited to approved public provider seed candidates.

Any future import/database PR must remain separate from template collection work. If a future PR touches the database, RLS, application behavior, routes, generated types, package files, SEO behavior, or build behavior, it must run the required DB, RLS, build, route, and SEO validations for its approved scope.

This template does not authorize SQL seed files, import scripts, Supabase migrations, RLS changes, source-code changes, generated-type changes, package changes, app behavior changes, public listing publication, provider verification, provider claims, sponsorship, offers, reviews, ratings, credentials, or real provider data insertion.
