# DrKhaleej LLM Answer Projection

## Purpose

This contract validates a precomputed, bilingual, citation-backed LLM answer projection for a DrKhaleej route.

LLM answer projection readiness is not publish readiness.

LLM answer projection readiness is not sitemap eligibility.

## Required conditions

A projection is ready only when:

- upstream SEO/GEO/LLM readiness is green;
- the route has a ready `llm_answer` projection record;
- the payload route matches the projection manifest route;
- English and Arabic answers are both present;
- at least one citation is present;
- every citation carries a source evidence ID and label;
- English and Arabic medical disclaimers are present;
- no unsafe medical claim is present;
- each locale stays within the configured character limit;
- source and projection versions are present.

## Runtime boundary

The public request path may read only the precomputed projection. It must not call a model, search raw import data, assemble citations, or generate a medical answer at request time.

## Evidence boundary

Citations must reference known source evidence IDs. A polished answer without traceable evidence remains blocked. Fluent text is not evidence, despite the internet's sustained campaign to pretend otherwise.

## Separate downstream states

The result exposes:

- `llmAnswerProjectionReady`;
- `publishReady`;
- `sitemapEligible`.

Passing this contract does not publish a page, enable indexing, or add a URL to a sitemap.

## Scope

- No runtime model generation.
- No external model API calls.
- No database writes.
- No migrations.
- No public routes.
- No sitemap XML.
- No Admin UI action.
- No publish mutation.
- No runtime public behavior.
