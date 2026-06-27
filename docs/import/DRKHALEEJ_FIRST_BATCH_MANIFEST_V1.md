# DrKhaleej First Batch Manifest V1

## Purpose

This manifest defines the smallest controlled import batch that can be considered after the dry-run report returns `go`.

It is a selection contract only. It does not change route behavior, database state, sitemap logic, or public visibility by itself.

## Batch caps

| Family | Maximum selected rows |
| --- | --- |
| doctor | 50 |
| pharmacy | 25 |
| hospital | 10 |

## Required family scope

The first batch may contain only these families:

- `doctor`
- `pharmacy`
- `hospital`

The first batch must not include labs, centers, dental hubs, beauty hubs, offers, search pages, article pages, area pages, service pages, specialty pages, public comments, ratings, appointment flows, payments, or provider dashboard routes.

## Required manifest columns

Each selected row must have these manifest fields:

| Field | Requirement |
| --- | --- |
| `family` | `doctor`, `pharmacy`, or `hospital` only |
| `queue_id` | non-empty import queue id |
| `candidate_id` | non-empty approved candidate id |
| `canonical_path` | exact canonical public path |
| `locale` | `en` or `ar` |
| `slug` | lowercase slug token |
| `display_name` | reviewed public name |
| `area` | local area evidence |
| `governorate` | Oman governorate evidence |
| `source_name` | reviewed source label |
| `source_url` | source URL when available |
| `last_checked_at` | source check date |
| `contact_or_map_signal` | phone, WhatsApp, email, website, map, or direction signal |
| `qa_owner` | reviewer name or role |
| `qa_status` | `selected`, `blocked`, or `removed` |
| `qa_notes` | short note |

## Canonical path rules

Allowed canonical path patterns:

- doctor: `/en/om/doctor/{slug}` or `/ar/om/doctor/{slug}`
- pharmacy: `/en/om/pharmacies/{slug}` or `/ar/om/pharmacies/{slug}`
- hospital: `/en/om/hospitals/{slug}` or `/ar/om/hospitals/{slug}`

## Selection rules

A row can be selected only when all of these are true:

- dry-run report decision is `go` for the frozen set;
- readiness audit blocker count is zero for the row;
- `publish_status` is `index_eligible`;
- `index_policy` is `index`;
- `sitemap_policy` is `included`;
- candidate status is `approved`;
- source evidence exists;
- contact or map evidence exists;
- Oman geo evidence exists;
- canonical path is safe for the family;
- selected counts stay within the family caps.

## QA sampling rule

Before a selected batch can move to public sitemap review, sample checks must include at least:

- 5 doctor profile URLs;
- 5 pharmacy profile URLs;
- 3 hospital profile URLs.

Each sampled URL must show name, location evidence, source label, last checked value, canonical output, and contact or direction signal.

## Stop rules

Stop the first batch review if any selected row has missing source evidence, missing contact or map evidence, missing Oman geo evidence, unsafe canonical path, wrong family, wrong country, wrong locale, or count above the family cap.

## Decision

The first batch can move forward only when the manifest, dry-run report, readiness audit, sampled profile checks, and sitemap diff all agree.
