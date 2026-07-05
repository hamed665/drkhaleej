# Import data workspace

This directory is reserved for import workflow documentation and safe placeholders. Do not commit real first-batch provider CSV files here unless they have been explicitly approved for repository storage.

## Local-only real data path

Use this untracked local path for reviewed real data:

```text
data/import/private/first-batch.csv
```

The `private/` directory should stay local. Real healthcare provider data needs source review, checked dates, QA ownership, and approval before it appears in repository history. Git history is not a whiteboard; it remembers things like a petty elephant.

## Generated local outputs

Use temporary outputs outside committed source files:

```text
tmp/first-batch.dry-run-input.json
tmp/first-batch.dry-run-report.json
```

## Required validation commands

Before any real dry-run PR is reviewed, run:

```bash
node scripts/import/check-first-batch-private-data-guard.mjs
node scripts/import/check-first-batch-dry-run-runner.mjs
node scripts/import/check-first-batch-csv-transformer.mjs
node scripts/import/check-first-batch-dry-run-report-review.mjs
```

Then transform and run the reviewed CSV:

```bash
node scripts/import/transform-first-batch-csv-to-dry-run-json.mjs \
  --input ./data/import/private/first-batch.csv \
  --output ./tmp/first-batch.dry-run-input.json \
  --checks failed

node scripts/import/run-first-batch-dry-run.mjs \
  --input ./tmp/first-batch.dry-run-input.json \
  --output ./tmp/first-batch.dry-run-report.json
```

Then validate the generated report before review:

```bash
node scripts/import/validate-first-batch-dry-run-report.mjs \
  --input ./tmp/first-batch.dry-run-report.json \
  --expect go
```

A real import write path must not be built until a reviewed dry-run report returns `decision: go` and passes the report validator with `--expect go`.
