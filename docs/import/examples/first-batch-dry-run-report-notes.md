# First-batch dry-run report example notes

This example explains how to read `first-batch-dry-run-report.example.json` before any real import or publish step. The data is fictional and exists only to document the report contract.

## What the example represents

The example report is intentionally a `no_go` report. It shows a rehearsal where all top-level readiness checks pass, sitemap output stays frozen, and family caps are respected, but unsafe public local suggestions and one unsafe hospital relation remain.

That means the import batch is not ready to publish, even though the profile-level checks look clean. Tiny distinction, apparently too subtle for software that wants to turn every warning into confetti.

## Key fields

- `schemaVersion` identifies the dry-run report contract.
- `decision` is the final go/no-go result. A report with any unsafe public rows must remain `no_go`.
- `checks` records gate status for CI, SEO validation, readiness audit, sitemap freeze, representative smoke, and blocked route classes.
- `sitemap` must stay frozen during dry-run. Unexpected URLs are blockers.
- `byFamily` summarizes selected doctor, pharmacy, and hospital candidates.
- `hospitalRelations` summarizes hospital-to-doctor relation rows.
- `localSuggestions` summarizes cross-entity local suggestion rows.
- `notes` is for operator guidance, not public copy.

## Why this report is no_go

The example has:

- `localSuggestions.unsafePublicCount: 9`
- `hospitalRelations.unsafePublicCount: 1`

Unsafe public rows must be corrected, made private review rows, or removed before any import can become publish-safe.

## What this example does not allow

This file does not authorize:

- database writes
- public route creation
- sitemap changes
- schema markup changes
- public profile rendering
- future family public pages
- network fetching

It is an example contract only. The machine may parse it; humans should resist the ancestral urge to copy it into production and call it strategy.
