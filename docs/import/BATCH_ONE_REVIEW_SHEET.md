# DrKhaleej Batch One Review Sheet

## Purpose

This sheet is used before the first reviewed provider set moves forward.

It is a review document only. It does not import data, change queue rows, change route behavior, change sitemap output, or publish URLs.

## Review metadata

| Field | Value |
| --- | --- |
| Review date |  |
| Commit SHA |  |
| Data snapshot |  |
| Reviewer |  |
| Decision | `go` or `hold` |
| Follow-up owner |  |

## Row counts

| Family | Candidate rows | Selected rows | Held rows | Removed rows |
| --- | ---: | ---: | ---: | ---: |
| doctor |  |  |  |  |
| pharmacy |  |  |  |  |
| hospital |  |  |  |  |
| total |  |  |  |  |

## Review counts

All issue counts should be zero before a `go` decision.

| Review item | Count | Notes |
| --- | ---: | --- |
| duplicate entry |  |  |
| slug conflict |  |  |
| missing source |  |  |
| missing review date |  |  |
| missing location signal |  |  |
| missing contact or map signal |  |  |
| country mismatch |  |  |
| unsupported family |  |  |
| path mismatch |  |  |
| family cap exceeded |  |  |
| sample page issue |  |  |
| sitemap family mismatch |  |  |

## Expected URL counts

| Family | English URLs | Arabic URLs | Total URLs |
| --- | ---: | ---: | ---: |
| doctor |  |  |  |
| pharmacy |  |  |  |
| hospital |  |  |  |
| total |  |  |  |

## Sample checks

| Sample | Family | URL | Status | Source visible | Review date visible | Contact/map visible | Metadata path verified | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | doctor |  |  |  |  |  |  |  |
| 2 | doctor |  |  |  |  |  |  |  |
| 3 | pharmacy |  |  |  |  |  |  |  |
| 4 | pharmacy |  |  |  |  |  |  |  |
| 5 | hospital |  |  |  |  |  |  |  |

## Decision rules

Use `go` only when:

- all review counts are zero
- selected rows stay within family caps
- sample checks pass
- expected URL counts match the reviewed set
- follow-up owner is recorded
- only doctor, pharmacy, and hospital families are selected

Use `hold` when:

- manual review is incomplete
- sample checks are pending
- URL counts have not been reviewed
- notes are incomplete

## Final decision

Decision: `go` or `hold`

Reviewer note:

Follow-up PR:
