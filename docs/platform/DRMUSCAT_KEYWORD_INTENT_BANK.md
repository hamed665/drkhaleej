# DrMuscat Keyword + Intent Bank

## Purpose

The Keyword + Intent Bank converts the reviewed bilingual keyword workbook into a typed, fail-closed planning contract. It is not a page generator, route registry, sitemap source, or publishing authority.

Planning data only.

## Reviewed source

- File: `drmuscat-seo-keyword-universe-master-v1.2-completed.xlsx`
- SHA-256: `a98d6eb5eef6f83ee66ea091cc7b50d8945c5457d5cbba203ee4a830cd14cfff`
- Total rows: 1,532
- English rows: 766
- Arabic rows: 766
- Exact keyword-language duplicates: 0
- Missing EN/AR route parity: 0
- Persian-specific character hits: 0

English and Arabic only.

## Contract boundary

Every record must retain:

- language;
- keyword and Arabic pair;
- topic and subcluster;
- intent type;
- route family and planning URL candidate;
- priority and risk;
- medical, legal, and pharmacist review flags;
- safe title pattern and forbidden-use rule;
- fail-closed import decision;
- `planning_only` route status.

A keyword row cannot make an entity SEO-ready, publish-ready, sitemap-eligible, indexable, or publicly rendered. Those remain separate downstream contracts.

## Guardrails

- No database writes.
- No migrations.
- No public routes.
- No sitemap eligibility.
- No sitemap XML.
- No publish mutation.
- No Admin UI action.
- No runtime keyword expansion.
- No automatic page generation.

Rows marked `blocked` are safety policy records and must never produce pages. All other rows remain `DO_NOT_IMPORT_YET` until later readiness, page-value, geo, projection, and publication gates explicitly approve them.

## Future use

Later phases may consume this bank for:

- SEO/GEO/LLM readiness composition;
- page-value evaluation;
- internal-link planning;
- nearby and area eligibility;
- safe LLM answer targets;
- final sitemap eligibility.

The bank describes demand and intent. It does not confer permission. A spreadsheet with ambition is still just a spreadsheet, despite what quarterly planning meetings imply.
