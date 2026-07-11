# DrKhaleej SEO / GEO / LLM Readiness Composition

## Purpose

This contract composes existing SEO Profile, Keyword + Intent Bank, Oman Geo Authority, and Public Projection decisions without rebuilding their underlying logic.

SEO readiness is not GEO readiness.

GEO readiness is not LLM readiness.

Composition readiness is not publish readiness.

## SEO readiness

SEO readiness requires a ready SEO profile and a clean Keyword + Intent Bank contract. It does not grant indexing, sitemap inclusion, or publication.

## GEO readiness

GEO readiness requires an Oman Geo Authority registry with no blockers and a ready geo projection for the same route. A keyword mentioning a place is not geographic authority, despite the confidence with which spreadsheets sometimes behave.

## LLM readiness

LLM readiness requires:

- SEO readiness;
- GEO readiness;
- a ready `llm_answer` projection for the same route;
- English and Arabic answer targets;
- evidence citations;
- required medical safety review;
- no blocked or unsafe intent.

A missing citation, missing safety review, unsafe intent, or missing projection blocks LLM readiness.

## Separate downstream states

The result exposes these independently:

- `seoReady`;
- `geoReady`;
- `llmReady`;
- `compositionReady`;
- `publishReady`;
- `sitemapEligible`.

A record may pass all three readiness dimensions while remaining private and excluded from sitemap output.

## Scope

- No database writes.
- No migrations.
- No public routes.
- No sitemap XML.
- No sitemap eligibility changes.
- No Admin UI actions.
- No publish mutation.
- No runtime LLM generation.
- No runtime public behavior.
