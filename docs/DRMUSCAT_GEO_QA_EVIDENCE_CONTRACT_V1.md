# DrMuscat Geo QA Evidence Contract V1

## Purpose

Define the QA evidence required before any Oman geo route can be considered for index promotion.

This is a contract-only phase. It does not remove noindex, does not allow sitemap inclusion, does not generate JSON-LD, and does not add runtime queries. It only defines the review evidence future promotion work must prove.

## Contract source

```text
src/config/geo/qa-evidence-contract.ts
```

## Validation command

```bash
pnpm geo:qa-evidence:validate
```

This command is included in:

```bash
pnpm geo:check:oman
```

and therefore runs in DrMuscat CI.

## Entity coverage

```text
governorate
wilayat
area
```

## Required QA evidence

```text
canonical-review
hreflang-review
thin-page-review
sitemap-policy-review
promotion-pr-approval
```

## Current state

```text
status: contract-only
currentQaEvidenceAvailable: false
canonicalReviewComplete: false
hreflangReviewComplete: false
thinPageReviewComplete: false
sitemapPolicyReviewComplete: false
promotionPrApproved: false
```

## Promotion guardrails

```text
noindexRemovalAllowed: false
sitemapPromotionAllowed: false
jsonLdAllowed: false
indexPromotionAllowed: false
promotionRequiresApprovedPr: true
```

## Safety guarantees

- No noindex guardrail is removed
- No sitemap inclusion is allowed
- No JSON-LD is generated
- No geo route becomes indexable
- No runtime provider query is added
- No runtime editorial query is added
- No generated JSON is committed

## Explicit non-goals

- No index promotion
- No sitemap promotion
- No JSON-LD generation
- No noindex removal
- No provider query
- No editorial content creation
- No route metadata promotion

## Future implementation gate

A later PR may record actual QA evidence only after canonical behavior, hreflang behavior, thin-page risk, sitemap policy, and promotion PR approval are reviewed and documented.
