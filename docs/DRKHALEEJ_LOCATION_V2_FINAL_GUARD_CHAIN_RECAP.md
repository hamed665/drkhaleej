# DrKhaleej Location V2 Final Guard Chain Recap

This document summarizes the Location V2 guard chain before any data/import or candidate route promotion work starts.

## Current rule

Location V2 remains noindex-first and fail-closed. Candidate composite routes are not public, not in sitemap output, and not eligible for JSON-LD or index promotion during the current phase.

## Guard chain

The intended sequence is:

`threshold -> evidence -> promotion -> source model -> manual gate -> final gate`

Each step has a separate job:

1. `threshold` defines the minimum provider and evidence requirements for a candidate family.
2. `evidence` proves the candidate has enough approved support to avoid thin or invented pages.
3. `promotion` keeps every candidate blocked unless an explicit checklist moves it toward review.
4. `source model` defines auditable source references before import planning begins.
5. `manual gate` keeps human review and public-surface changes disabled by default.
6. `final gate` rechecks the chain before any route, sitemap, JSON-LD, or index behavior changes.

## Non-negotiable boundary

No step in this chain may create candidate route files, enable sitemap output, emit JSON-LD, add internal SEO links, generate runtime candidate data, or change indexability in the current phase.

A future promotion PR must update the relevant guard, tests, docs, and final gate in the same change.
