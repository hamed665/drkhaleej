# First-batch publish-gate contract

This document defines the minimum contract for any future first-batch public publish gate. It is documentation only. It does not authorize public publication, add routes, alter sitemap output, emit schema markup, expose search/listings, deploy anything, or make imported rows public.

## Hard prerequisite

No publish-gate implementation PR may be opened until all of these are true:

- a reviewed real dry-run report has passed with `--expect go`
- the first-batch write path contract is still satisfied
- the draft/staging import implementation has merged
- the draft/staging import has run successfully in the intended non-public environment
- rollback has been tested for the draft/staging import run
- `Import Runner Checks` is green
- `DrKhaleej CI` is green

Until those prerequisites exist, public publishing is not a feature. It is a liability wearing a launch checklist.

## Allowed first publish-gate scope

The first publish-gate implementation may only promote already imported draft/staging records that have passed manual QA and automated guards.

Allowed behavior:

- read a completed import run summary
- verify the import run id and dry-run report id
- verify manual QA approval for every promoted row
- compute a planned public delta before applying it
- promote eligible records from draft/staging to public visibility
- produce a publish summary
- support rollback for the publish run

Forbidden behavior:

- importing new data during publish
- modifying source evidence during publish
- performing network fetches during publish
- publishing rows with unresolved QA status
- publishing rows with unsafe local suggestions
- publishing rows with unsafe hospital relations
- publishing rows without source evidence or checked dates
- changing unrelated routes, metadata, schema, or sitemap behavior
- auto-deploying or releasing without an explicit publish review

## Required command shape

The future publish gate must use explicit import run and report paths:

```bash
node scripts/import/run-first-batch-publish-gate.mjs \
  --import-run-id IMPORT_RUN_ID \
  --report ./tmp/first-batch.dry-run-report.json \
  --mode plan
```

The command name is reserved by this contract. It must not exist until the publish-gate implementation PR is ready and reviewed.

## Plan before apply

The publish gate must support a plan mode before any apply mode.

Plan mode must output:

- import run id
- dry-run rehearsal id
- candidate count by family
- planned public profile count by family
- planned sitemap delta by family
- planned schema output count by family
- local suggestion public count
- hospital relation public count
- blocked row count and reasons
- rollback summary

Plan mode must not write public visibility, sitemap, schema, route, or search/listing state.

## Required public safety checks

Before apply mode can exist, the implementation must enforce:

- every candidate has source evidence
- every candidate has `last_checked_at`
- every candidate has reviewed location evidence
- every candidate has contact or map evidence when required by the family contract
- every canonical path is public-safe
- every locale alternate is valid
- every local suggestion is public-safe
- every hospital relation is public-safe
- no unsupported family is published
- no row requiring review is published
- no held or removed row is published
- sitemap delta matches the planned public delta
- schema output is disabled unless separately approved for the family

## Public visibility defaults

Public visibility must remain false until apply mode passes all gates.

Required defaults before apply:

- public profile visible: false
- sitemap eligible: false
- schema eligible: false
- search/listing eligible: false
- index eligible: false

## Rollback requirements

A publish gate must define rollback before it defines apply.

Rollback must:

- target a single publish run id
- list all records promoted by the publish run id
- revert public visibility for promoted records
- revert sitemap eligibility for promoted records
- revert schema eligibility for promoted records
- revert search/listing eligibility for promoted records
- create audit entries for rollback actions
- avoid touching unrelated public records

## Audit log requirements

Every publish action must create internal audit entries.

Minimum audit fields:

- publish run id
- import run id
- dry-run rehearsal id
- family
- candidate key
- public path
- previous visibility state
- new visibility state
- operator id or system actor
- timestamp
- rollback reference when applicable

Audit output is internal only. It must not become public copy, schema metadata, or sitemap metadata.

## Required validation before publish-gate implementation merge

The publish-gate implementation PR must include static and runtime checks for:

- missing import run fails
- missing dry-run report fails
- `no_go` report fails
- report/import run mismatch fails
- missing manual QA approval fails
- unsafe local suggestion fails
- unsafe hospital relation fails
- unsupported family fails
- held or removed row fails
- plan mode has no public side effects
- apply mode is blocked unless plan mode passes
- rollback is documented and tested
- unrelated public routes remain unchanged

## Merge rule

A publish-gate implementation may merge only when:

- draft/staging import implementation has merged
- a reviewed import run summary exists
- a reviewed publish plan exists
- all publish-gate checks pass
- rollback is tested
- no unrelated public behavior is changed
- CI is green

Anything else is not a publish gate. It is production karaoke with healthcare data.
