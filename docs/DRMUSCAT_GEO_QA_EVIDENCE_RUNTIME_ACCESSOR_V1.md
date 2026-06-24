# DrMuscat Geo QA Evidence Runtime Accessor V1

## Purpose

Add a safe runtime accessor layer for Oman geo QA evidence state.

The accessor reads only from the QA evidence contract. It does not modify metadata, remove noindex, allow sitemap inclusion, generate JSON-LD, or query provider/editorial data. It centralizes QA evidence state so future promotion gates can depend on one stable source instead of scattering checks across routes.

## Accessor source

```text
src/lib/geo/oman-qa-evidence.ts
```

## Validation command

```bash
pnpm geo:qa-evidence-runtime:validate
```

This command is included in:

```bash
pnpm geo:check:oman
```

and therefore runs in DrMuscat CI.

## Runtime helpers

```text
listOmanGeoQaEvidenceContracts()
getOmanGeoQaEvidenceContract(input)
getOmanGeoQaEvidenceRuntimeState()
```

## Current runtime state

```text
hasQaEvidence: false
noindexRemovalAllowed: false
sitemapPromotionAllowed: false
jsonLdAllowed: false
indexPromotionAllowed: false
canonicalReviewCompleteCount: 0
hreflangReviewCompleteCount: 0
thinPageReviewCompleteCount: 0
sitemapPolicyReviewCompleteCount: 0
promotionPrApprovedCount: 0
```

## Safety guarantees

- No noindex guardrail is removed
- No sitemap promotion is allowed
- No JSON-LD is generated
- No index promotion is allowed
- No provider query is added
- No editorial query is added
- Runtime state is derived from contract values only

## Explicit non-goals

- No QA evidence approval
- No noindex removal
- No route metadata promotion
- No sitemap inclusion
- No JSON-LD generation
- No runtime data source
- No generated JSON committed

## Future implementation gate

A later PR may add approved QA evidence only after canonical behavior, hreflang behavior, thin-page risk, sitemap policy, and promotion PR approval are actually reviewed and documented.
