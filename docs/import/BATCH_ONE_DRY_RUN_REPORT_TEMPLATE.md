# DrKhaleej Batch One Dry-Run Report Template

## Purpose

This template defines the report that must be produced before batch one can move from reviewed selection to public sitemap review.

The report is a decision aid only. It does not import data, change queue state, change routes, change sitemap output, or publish provider profiles.

## Report metadata

| Field | Value |
| --- | --- |
| Report date |  |
| Commit SHA |  |
| Data source snapshot |  |
| Reviewer |  |
| Batch decision | `go`, `hold`, or `stop` |
| Rollback owner |  |

## Candidate counts

| Family | Candidate rows | Selected rows | Blocked rows | Removed rows |
| --- | ---: | ---: | ---: | ---: |
| doctor |  |  |  |  |
| pharmacy |  |  |  |  |
| hospital |  |  |  |  |
| total |  |  |  |  |

## Blocker summary

All blocker counts must be zero before a `go` decision.

| Blocker | Count | Notes |
| --- | ---: | --- |
| duplicate entity |  |  |
| slug collision |  |  |
| missing source |  |  |
| missing reviewed timestamp |  |  |
| missing location signal |  |  |
| missing contact or map signal |  |  |
| wrong country |  |  |
| unsupported family |  |  |
| unsafe canonical path |  |  |
| family cap exceeded |  |  |
| profile smoke failure |  |  |
| unexpected sitemap family |  |  |

## Expected sitemap rows

| Family | English URLs | Arabic URLs | Total URLs |
| --- | ---: | ---: | ---: |
| doctor |  |  |  |
| pharmacy |  |  |  |
| hospital |  |  |  |
| total |  |  |  |

## Sample smoke checks

| Sample | Family | URL | Status | Source shown | Last checked shown | Contact/map shown | Canonical verified outside UI | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | doctor |  |  |  |  |  |  |  |
| 2 | doctor |  |  |  |  |  |  |  |
| 3 | doctor |  |  |  |  |  |  |  |
| 4 | pharmacy |  |  |  |  |  |  |  |
| 5 | pharmacy |  |  |  |  |  |  |  |
| 6 | pharmacy |  |  |  |  |  |  |  |
| 7 | hospital |  |  |  |  |  |  |  |
| 8 | hospital |  |  |  |  |  |  |  |

## Decision rules

Use `go` only when:

- all blocker counts are zero
- selected rows stay within caps
- sample smoke checks pass
- expected sitemap URL count matches the dry-run output
- rollback owner is recorded
- no preview, location, article, search, lab, or center profile route appears in the expected sitemap rows

Use `hold` when:

- data looks mostly correct but manual review is still incomplete
- smoke checks are pending
- sitemap diff has not been reviewed
- reviewer notes are incomplete

Use `stop` when:

- any blocker count is non-zero
- wrong route family appears
- source or location evidence is unclear
- queue state is not reversible
- public profile body exposes implementation-only fields

## Rollback note

Rollback for batch one must remove the affected rows from sitemap eligibility while keeping candidate rows available for review.

## Final decision

Decision: `go`, `hold`, or `stop`

Reviewer note:

Follow-up PR:
