# First-batch source evidence contract

This document defines the minimum evidence contract for preparing the first real Oman provider CSV. It is documentation only. It does not add real provider data, import writes, public routes, sitemap output, schema markup, publish behavior, deployment behavior, or network fetching.

## Hard prerequisite

No real first-batch dry-run PR may be opened until every selected row has reviewed source evidence and a checked date.

Required evidence for every selected candidate row:

- `source_name` or `source_url`
- `last_checked_at`
- `contact_or_map_signal`
- reviewed `area`
- reviewed `governorate`
- reviewed `display_name`
- stable `candidate_key`
- public-safe `slug`

A row without a source anchor and checked date is not ready. It is a rumor with columns.

## Source anchor rules

A source anchor is one of:

- `source_name`: a human-readable label for a reviewed source
- `source_url`: a direct URL to a reviewed source

At least one must be present. Both are preferred.

Recommended `source_name` values:

- `Oman Ministry of Health directory`
- `Provider official website`
- `Provider official Instagram profile`
- `Google Business Profile`
- `Clinic official website`
- `Hospital official website`
- `Pharmacy official website`

Do not use vague labels such as `Google`, `web`, `internet`, `found online`, `search result`, or `notes`.

## Checked date rules

`last_checked_at` must be an ISO date in `YYYY-MM-DD` form.

Rules:

- the date must represent the day the reviewer checked the source
- future dates are forbidden
- empty dates are forbidden for selected rows
- social profile evidence without `last_checked_at` is not public-safe
- old dates may still be accepted only if the reviewer intentionally approves them in QA notes

## Candidate evidence rules

Every selected candidate row must prove the public listing is not invented.

Minimum candidate evidence:

- display name matches the reviewed source
- area and governorate are supported by source evidence or map evidence
- contact or map signal exists
- family is `doctor`, `pharmacy`, or `hospital`
- slug and canonical path are safe for public routing
- QA status is `selected`

Rows with `held` or `removed` status must not be imported or published.

## Local suggestion evidence rules

A public-visible local suggestion must have:

- source family/key present in selected candidates
- target family/key present in selected candidates
- source and target in the same area and governorate
- target display name
- source anchor
- `last_checked_at`
- confidence `high` or `medium`
- relation status empty, `active`, or `approved`
- `requires_review` not true

If any rule fails, set `public_visible` false or fix the row before dry-run. Public unsafe suggestions must keep the report `no_go`.

## Hospital relation evidence rules

A public-visible hospital relation must have:

- selected hospital key
- doctor display name
- verified branch relationship
- source URL
- `last_checked_at`
- confidence `high` or `medium`
- relation status empty, `active`, or `approved`
- `requires_review` not true

If any rule fails, keep it private review or out of the first real batch.

## QA owner responsibilities

The QA owner must verify:

- source labels are specific
- source URLs open to the intended provider or public profile
- checked dates are real review dates
- candidate keys are stable
- duplicate providers are not selected twice
- held or removed rows have a reason
- no private or sensitive note is placed in public fields
- no generated report or real CSV is committed

## Review evidence summary

A real dry-run PR must summarize evidence without pasting private CSV contents.

Required summary fields:

- total selected candidates by family
- count of selected rows with both `source_name` and `source_url`
- count of selected rows with only `source_name`
- count of selected rows with only `source_url`
- count of selected rows missing `last_checked_at`, which must be zero
- count of held or removed rows
- list of source labels used
- QA owner
- reviewer

## Merge rule

A real dry-run PR may advance only when:

- source evidence summary is complete
- rows missing `last_checked_at` are zero
- selected rows without source anchors are zero
- generated dry-run report validates with `--expect go`
- `Import Runner Checks` is green
- `DrKhaleej CI` is green

Anything else is not source evidence. It is confidence cosplay, and production systems do not need costumes.
