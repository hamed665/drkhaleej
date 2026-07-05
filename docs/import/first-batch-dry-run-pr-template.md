# First batch dry-run review template

Use this template for the first real dry-run review. This is a review aid, not a place to paste real private CSV contents. Humanity has made enough avoidable mistakes with copy and paste.

## Summary

- Rehearsal ID:
- Generated at:
- Transform commit SHA:
- QA owner:
- Reviewer:

## Required local validation commands

```bash
node scripts/import/check-first-batch-private-data-guard.mjs
node scripts/import/check-first-batch-source-evidence-contract.mjs
node scripts/import/check-first-batch-dry-run-runner.mjs
node scripts/import/check-first-batch-csv-transformer.mjs
node scripts/import/check-first-batch-dry-run-report-review.mjs
```

## Transform command used

```bash
node scripts/import/transform-first-batch-csv-to-dry-run-json.mjs \
  --input ./data/import/private/first-batch.csv \
  --output ./tmp/first-batch.dry-run-input.json \
  --checks failed \
  --rehearsal-id first-real-batch-YYYY-MM-DD \
  --generated-at YYYY-MM-DDT00:00:00.000Z \
  --commit-sha REVIEWED_COMMIT_SHA
```

## Runner command used

```bash
node scripts/import/run-first-batch-dry-run.mjs \
  --input ./tmp/first-batch.dry-run-input.json \
  --output ./tmp/first-batch.dry-run-report.json
```

## Report validation command used

```bash
node scripts/import/validate-first-batch-dry-run-report.mjs \
  --input ./tmp/first-batch.dry-run-report.json \
  --expect go
```

## Counts

| family | selected | eligible | blocked | sitemap URLs |
| --- | ---: | ---: | ---: | ---: |
| doctor |  |  |  |  |
| pharmacy |  |  |  |  |
| hospital |  |  |  |  |

## Go review checklist

- [ ] report decision is `go`
- [ ] required checks passed
- [ ] sitemap unexpected URL count is zero
- [ ] sitemap unexpected URL list is empty
- [ ] family caps are within limits
- [ ] family blockers are zero
- [ ] sampled profiles passed
- [ ] hospital relation unsafe public count is zero
- [ ] hospital relation unsafe public blockers are empty
- [ ] local suggestion unsafe public count is zero
- [ ] local suggestion unsafe public blockers are empty

## Source evidence summary

- Source labels used:
- Rows with `source_name` only:
- Rows with `source_url` only:
- Rows with both source name and URL:
- Rows missing `source_name` and `source_url`: must be zero
- Rows missing `last_checked_at`: must be zero
- Rows with vague source labels such as Google, web, internet, found online, search result, or notes: must be zero

## Held or removed rows

| row | family | candidate key | status | reason |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Safety confirmation

- [ ] No real provider CSV is committed.
- [ ] No generated dry-run input JSON is committed.
- [ ] No generated dry-run report JSON is committed.
- [ ] No database write behavior is introduced.
- [ ] No migration is introduced.
- [ ] No public route behavior is introduced.
- [ ] No sitemap promotion behavior is introduced.
- [ ] No schema output behavior is introduced.
- [ ] No public profile rendering behavior is introduced.
- [ ] Import write-path design remains blocked until the reviewed dry-run report is `go`.

## Notes

Add reviewer notes here.
