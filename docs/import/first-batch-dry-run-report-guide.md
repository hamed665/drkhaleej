# First Batch Dry-Run Report Readability Guide

## Purpose

This guide explains how to read the first-batch import dry-run report without guessing what each count means.

It is a reader guide only. The report schema and safety logic remain defined in code and in the local suggestion contracts.

## Decision

The top-level `decision` is the final publish gate.

- `go` means every required check passed and no unsafe public rows remain.
- `no_go` means at least one required check, cap, sitemap rule, family blocker, hospital relation blocker, or local suggestion blocker failed.

A `go` decision should not be inferred from high eligible counts alone. Humans do love optimism, which is adorable until it ships broken pages.

## Required checks

The `checks` array records required release checks.

Each check has:

- `key`
- `passed`
- `notes`

All required checks must be present and passed before the report can decide `go`.

Required check keys are:

- `ci_green`
- `seo_check_green`
- `readiness_audit_zero_blockers`
- `sitemap_diff_frozen`
- `representative_profile_smoke_passed`
- `blocked_route_classes_absent`

## Sitemap summary

The `sitemap` section answers whether import candidates would unexpectedly change public URLs.

| Field | Meaning |
| --- | --- |
| `beforeUrlCount` | Public sitemap URL count before import |
| `afterUrlCount` | Public sitemap URL count after import |
| `importedDeltaCount` | Expected URL delta from import candidates |
| `unexpectedUrlCount` | URLs that appeared but were not expected |
| `unexpectedUrls` | The unexpected URL list |

Any unexpected sitemap URL should be treated as a blocker.

## Family summaries

The `byFamily` section groups the main import families:

- `doctor`
- `pharmacy`
- `hospital`

Each family summary has:

| Field | Meaning |
| --- | --- |
| `selectedCount` | Number of selected import candidates |
| `eligibleCount` | Number of candidates eligible for publishing |
| `blockedCount` | Number of candidates blocked from publishing |
| `sitemapUrlCount` | Number of sitemap URLs produced for this family |
| `sampledUrlCount` | Number of representative URLs checked |
| `blockers` | Row-level blocker details |
| `samples` | Representative smoke-test samples |

A family is publish-safe only when:

- selected and sitemap counts stay within caps;
- `blockedCount` is zero;
- `blockers` is empty;
- every sample passed.

## Family blocker reasons

Main family blocker reasons include:

- `canonical_unsafe`
- `source_missing`
- `contact_or_map_missing`
- `geo_missing`
- `candidate_missing`
- `candidate_not_approved`
- `candidate_type_mismatch`
- `queue_not_index_eligible`
- `sitemap_not_included`
- `robots_not_index`
- `sitemap_cap_exceeded`
- `unexpected_route_class`
- `representative_smoke_failed`

Read the `notes` field first. It should explain the practical action required.

## Hospital relation summary

The `hospitalRelations` section covers public doctor-hospital suggestions.

| Field | Meaning |
| --- | --- |
| `totalRows` | Relation rows seen by dry-run |
| `candidateHospitalCount` | Hospitals with relation rows and matching candidate keys |
| `publicVisibleCount` | Rows explicitly public and safe |
| `blockedFromPublicCount` | Non-public rows that also have blockers |
| `privateReviewCount` | Non-public rows that would otherwise be safe |
| `hospitalSuggestionCount` | Hospitals with at least one safe public suggestion |
| `unsafePublicCount` | Rows marked public but blocked by safety rules |
| `unsafePublicBlockers` | Blockers for unsafe public rows |
| `blockedFromPublicReasons` | Blockers for non-public blocked rows |

`unsafePublicCount` must be zero before publish.

## Hospital relation blocker reasons

Hospital relation blocker reasons include:

- `branch_not_verified`
- `source_missing`
- `last_checked_missing`
- `confidence_unsupported`
- `doctor_name_missing`
- `hospital_mismatch`
- `ambiguous_review_required`

A public relation row may have multiple blockers. Fix all of them before public display.

## Local suggestion summary

The `localSuggestions` section covers local suggestions across current and future profile families.

| Field | Meaning |
| --- | --- |
| `totalRows` | Local suggestion rows seen by dry-run |
| `publicVisibleCount` | Rows explicitly public and safe |
| `blockedFromPublicCount` | Non-public rows that also have blockers |
| `privateReviewCount` | Non-public rows that would otherwise be safe |
| `sourceEntitySuggestionCount` | Source entities with at least one safe public suggestion |
| `locationClusterCount` | Area/governorate clusters with safe public suggestions |
| `unsafePublicCount` | Rows marked public but blocked by safety rules |
| `unsafePublicBlockers` | Blockers for unsafe public rows |
| `blockedFromPublicReasons` | Blockers for non-public blocked rows |

`privateReviewCount` is not a publish blocker by itself. It means the row is safe enough to review later but is not explicitly public.

`unsafePublicCount` is a publish blocker.

## Local suggestion blocker reasons

Local suggestion blocker reasons include:

- `unsupported_family`
- `source_candidate_missing`
- `target_candidate_missing`
- `target_name_missing`
- `location_mismatch`
- `source_missing`
- `last_checked_missing`
- `confidence_unsupported`
- `same_entity_self_link`
- `ambiguous_review_required`

A single row may produce multiple blockers. For triage, group blockers by `reason`, then fix the highest-count reasons first.

## Suggested triage order

When a report returns `no_go`, triage in this order:

1. Required checks that failed.
2. Unexpected sitemap URLs.
3. Main family blockers.
4. Unsafe public hospital relations.
5. Unsafe public local suggestions.
6. Non-public blocked rows.
7. Private review rows.

Private review rows can usually wait. Unsafe public rows cannot, because apparently publishing known-bad suggestions is still frowned upon by people with standards.

## Reading blocker rows

For each blocker row, read these fields first:

- `reason`
- entity keys such as `sourceKey`, `targetKey`, `hospitalKey`, or `doctorKey`
- location fields when the reason is location-related
- `sourceName` or `sourceUrl` when the reason is evidence-related
- `notes`

The `notes` field should be written for humans. If a future blocker has a cryptic note, fix the note before relying on it in import operations.

## Go / no-go checklist

Before merging or publishing import output, confirm:

- `decision` is `go`;
- all required checks are passed;
- `unexpectedUrlCount` is zero;
- all family `blockedCount` values are zero;
- all family `samples` passed;
- `hospitalRelations.unsafePublicCount` is zero;
- `localSuggestions.unsafePublicCount` is zero;
- publish caps are not exceeded.

If any of those fails, the correct answer is `no_go`. The report is not being dramatic; it is doing the job humans asked computers to do and then tried to ignore.

## Related contracts

- `docs/import/public-local-suggestion-payload-contract.md`
- `docs/import/public-local-suggestion-import-template-contract.md`
