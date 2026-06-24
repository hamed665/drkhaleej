# DrMuscat Geo QA Evidence Index Eligibility Gate Integration V1

## Purpose

Integrate Oman geo QA evidence state into the central index promotion eligibility gate.

The eligibility gate now reads provider inventory state, editorial content state, and QA evidence state before reporting why a geo page remains blocked from index promotion. This is still a blocked phase. No route becomes indexable.

## Updated source

```text
src/lib/geo/oman-index-promotion-eligibility.ts
```

## QA accessor source

```text
src/lib/geo/oman-qa-evidence.ts
```

## Validation command

The existing gate validator has been strengthened:

```bash
pnpm geo:index-promotion-eligibility:validate
```

This command is included in:

```bash
pnpm geo:check:oman
```

and therefore runs in DrMuscat CI.

## Added eligibility fields

```text
qaEvidence
qaEvidenceComplete
canonicalReviewComplete
hreflangReviewComplete
thinPageReviewComplete
sitemapPolicyReviewComplete
promotionPrApproved
```

## Added block reasons

```text
missing-qa-evidence-contract
qa-evidence-runtime-unavailable
canonical-review-incomplete
hreflang-review-incomplete
thin-page-review-incomplete
sitemap-policy-review-incomplete
promotion-pr-approval-missing
```

## Current behavior

```text
eligibleForIndexPromotion: false
noindexRequired: true
sitemapAllowed: false
jsonLdAllowed: false
qaEvidenceComplete: false
```

## Safety guarantees

- No noindex guardrail is removed
- No sitemap promotion is allowed
- No JSON-LD is generated
- No index promotion is allowed
- No provider query is added
- No editorial query is added
- No QA evidence approval is added
- No generated JSON is committed

## Explicit non-goals

- No route metadata promotion
- No route becomes indexable
- No sitemap inclusion
- No JSON-LD generation
- No runtime data source
- No QA evidence approval

## Future implementation gate

A later PR may allow eligibility review only after provider inventory, localized editorial content, canonical review, hreflang review, thin-page review, sitemap policy review, and promotion PR approval are all proven.
