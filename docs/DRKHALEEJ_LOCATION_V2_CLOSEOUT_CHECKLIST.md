# DrKhaleej Location V2 Closeout Checklist

This checklist closes the guardrail phase for Location V2. It defines what is done, what must stay blocked, and what must be prepared before any real location candidate data/import work begins.

## Phase status

The Location V2 guardrail phase is complete when all of the following remain true:

- Oman location hierarchy uses parent-aware canonical paths.
- Legacy `/oman/...` routes remain compatibility-only and noindex.
- Location scaffold routes remain noindex-first.
- Candidate composite routes do not exist.
- Candidate runtime stays blocked.
- Evidence snapshot runtime stays disabled.
- Promotion checklist runtime stays blocked.
- Data-readiness runtime stays disabled.
- Data-readiness integration guard is wired into `seo:check`.
- Source model runtime stays disabled.
- Source model integration guard is wired into `seo:check`.
- Manual gate contract remains contract-only.
- Route readiness final gate is wired into `seo:check`.
- Location V2 status documentation is wired into `seo:check`.

## Do not touch yet

Do not add or enable these in the current phase:

- candidate route files
- sitemap inclusion for location candidates
- JSON-LD for location candidates
- internal SEO links to candidate pages
- database access for candidate generation
- runtime evidence snapshot generation
- runtime promotion activation
- runtime data-readiness generation
- runtime source model collection
- manual gate runtime activation
- review workflow activation
- index promotion
- real data import
- source model import pipeline

## Required before data/import work

Before importing real candidate data or creating any promotion PR, prepare:

1. A reviewed provider source plan.
2. A verified provider-count method.
3. An approved evidence source reference model.
4. A reviewer identity/process for human review.
5. A location parent hierarchy resolver test plan.
6. A thin-content prevention policy.
7. A route-level noindex/sitemap/JSON-LD review checklist.
8. A rollback plan for accidental index promotion.

## Required before any candidate route PR

A candidate route PR must include:

- threshold evidence for the exact entity/dimension pair
- source references for provider and evidence counts
- a generated or reviewed evidence snapshot
- human review notes
- a promotion checklist update
- final gate update
- tests proving only the intended candidate family changes state
- tests proving all other candidate families remain blocked

## Safe next phase

The safe next phase is data-readiness work only:

- define import source contracts
- define provider/evidence count reporting
- define reviewer workflow shape
- define snapshot storage shape without runtime generation
- keep all public route/index behavior unchanged
- keep data-readiness runtime disabled until explicit promotion review
- keep source model runtime disabled until explicit promotion review
- keep manual gate runtime disabled until explicit promotion review

## Final rule

No candidate page becomes reviewable or indexable unless the PR proves the full chain from parent hierarchy to human review and updates the final gate in the same change.
