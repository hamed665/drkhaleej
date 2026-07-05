# First real batch operator guide

This guide defines the human-reviewed path from a real Oman provider spreadsheet to a dry-run report. It is documentation only. It does not add real provider data, database writes, public routes, sitemap output, schema markup, profile rendering, publishing, or deployment behavior.

## Current source of truth

The first real batch must pass through these local-only tools:

```bash
node scripts/import/check-first-batch-private-data-guard.mjs
node scripts/import/check-first-batch-source-evidence-contract.mjs
node scripts/import/check-first-batch-dry-run-runner.mjs
node scripts/import/check-first-batch-csv-transformer.mjs
node scripts/import/check-first-batch-dry-run-report-review.mjs
```

The CI workflow `Import Runner Checks` runs those guards for pull requests and pushes to `main`.

## Recommended real-batch size

Use a deliberately small first batch:

| family | first real batch target | hard cap |
| --- | ---: | ---: |
| doctor | 10 | 50 |
| pharmacy | 5 | 25 |
| hospital | 2 | 10 |

The hard caps are not a dare. A small first run is easier to audit, rollback, and explain to the poor future human reading the logs.

## Real CSV handling

Real first-batch CSV files should be kept out of git unless the data has been explicitly approved for repository storage.

Recommended local-only path:

```text
./data/import/private/first-batch.csv
```

Recommended generated dry-run input path:

```text
./tmp/first-batch.dry-run-input.json
```

Recommended generated report path:

```text
./tmp/first-batch.dry-run-report.json
```

## Required candidate fields

Each selected candidate row must include:

| field | rule |
| --- | --- |
| `row_type` | `candidate` |
| `family` | `doctor`, `pharmacy`, or `hospital` |
| `candidate_key` | stable, lowercase, slug-safe key |
| `display_name` | reviewed public display name |
| `area` | reviewed Oman area |
| `governorate` | reviewed Oman governorate |
| `source_name` or `source_url` | at least one source anchor |
| `last_checked_at` | ISO date when the source was checked |
| `contact_or_map_signal` | reviewed phone, map, or equivalent public signal |
| `qa_status` | `selected`, `held`, or `removed` |
| `locale` | `en` or `ar`; default should be `en` when absent |
| `slug` | public-safe slug matching the route family |

## Source evidence review

Before transform, review the real CSV against:

```text
docs/import/first-batch-source-evidence-contract.md
```

Selected rows must not have vague source labels such as `Google`, `web`, `internet`, `found online`, `search result`, or `notes`. Rows missing both `source_name` and `source_url` must be zero, and rows missing `last_checked_at` must be zero. Yes, this is tedious. So is cleaning up bad public healthcare data after search engines have cached it.

## Required local suggestion fields

A public-visible local suggestion must pass every one of these checks:

| field group | public-safe rule |
| --- | --- |
| source candidate | source family/key exists in the selected candidate map |
| target candidate | target family/key exists in the selected candidate map |
| target family | supported family only |
| target name | non-empty public display name |
| location | source and target share the same area and governorate |
| source evidence | `source_name` or `source_url` is present |
| checked date | `last_checked_at` is present |
| confidence | `high` or `medium` only |
| relation status | empty, `active`, or `approved` only |
| review flag | `requires_review` must not be true |
| self-link | source and target must not be the same entity |

If any of these fail, keep `public_visible` false or fix the row before using it in a real dry-run. Public unsafe rows correctly force `decision: no_go`.

## Transform command

Use the CSV transformer first:

```bash
node scripts/import/transform-first-batch-csv-to-dry-run-json.mjs \
  --input ./data/import/private/first-batch.csv \
  --output ./tmp/first-batch.dry-run-input.json \
  --checks failed \
  --rehearsal-id first-real-batch-YYYY-MM-DD \
  --generated-at YYYY-MM-DDT00:00:00.000Z \
  --commit-sha REVIEWED_COMMIT_SHA
```

Use `--checks failed` until the external checks have actually been verified. Setting checks to passed without running them is not confidence; it is theatre with JSON.

## Runner command

Then run the dry-run runner:

```bash
node scripts/import/run-first-batch-dry-run.mjs \
  --input ./tmp/first-batch.dry-run-input.json \
  --output ./tmp/first-batch.dry-run-report.json
```

## Report validation command

Before asking anyone to review the report, validate it explicitly:

```bash
node scripts/import/validate-first-batch-dry-run-report.mjs \
  --input ./tmp/first-batch.dry-run-report.json \
  --expect go
```

Use `--expect no_go` only when intentionally documenting blockers. Use `--expect any` only for diagnostic inspection. A real dry-run PR that wants to advance toward import write-path design must validate with `--expect go`.

## Go/no-go review

A report is not allowed to advance unless all are true:

- `decision` is `go`
- all required checks are passed
- `sitemap.unexpectedUrlCount` is `0`
- `sitemap.unexpectedUrls` is empty
- every family is within caps
- every family has `blockedCount: 0`
- every family has an empty `blockers` array
- every sampled profile has `passed: true`
- `hospitalRelations.unsafePublicCount` is `0`
- `hospitalRelations.unsafePublicBlockers` is empty
- `localSuggestions.unsafePublicCount` is `0`
- `localSuggestions.unsafePublicBlockers` is empty

## What must not happen yet

Do not add any of the following before a reviewed `go` report exists:

- database write path
- migration for real import writes
- public profile publish behavior
- sitemap promotion behavior
- schema markup output
- route generation from imported data
- automatic deployment or release

## PR evidence checklist

A real dry-run PR should include:

- the reviewed report JSON as an attached artifact or summarized evidence
- candidate counts by family
- local suggestion unsafe count
- hospital relation unsafe count
- source evidence summary
- reviewer name or QA owner
- exact command used to generate the dry-run input
- exact command used to generate the dry-run report
- exact command used to validate the dry-run report
- explanation for any held or removed rows

## Merge rule

The real dry-run PR may merge only when the report is `go`, report validation passes with `--expect go`, source evidence review is complete, and CI is green. The import write path must be a later PR with its own contract. Dry-run first, write path later; civilization depends on tiny acts of restraint like this.
