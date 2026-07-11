# DrKhaleej Page Value Gate

## Purpose

The Page Value Gate prevents imported pages from becoming eligible merely because a route, keyword, or projection exists.

A page must provide verified, useful, non-duplicative value for users before downstream publication or sitemap decisions can consider it.

Page value readiness is not publish readiness.

Page value readiness is not sitemap eligibility.

## Inputs

The gate composes the existing SEO / GEO / LLM readiness result with a ready content projection and measurable page-value signals:

- verified unique facts;
- source evidence count;
- content completeness;
- duplicate similarity;
- geographic specificity;
- actionable contact data;
- useful internal links;
- templated-content ratio;
- verified provider coverage;
- thin-page risk.

## Hard thresholds

The initial contract requires at least:

- 6 verified unique facts;
- 2 independent source-evidence records;
- 70% content completeness;
- no more than 35% duplicate similarity;
- a geo-specificity score of 60;
- 1 actionable contact field;
- 3 useful internal links;
- no more than 65% templated content.

Provider coverage varies by page class:

- entity profile: 1 verified provider;
- specialty directory: 3 verified providers;
- service directory: 3 verified providers;
- area landing page: 5 verified providers;
- guide: 1 verified provider or reviewed referral target.

Thin-page risk is always a blocker.

## Score and blockers

The score is explanatory. It cannot override a hard blocker. A page with a high weighted score but missing evidence, excessive duplication, inadequate provider coverage, or a thin-page flag remains blocked.

This is deliberate. Averaging a serious failure into a pleasant-looking score is how dashboards learn to lie with professional typography.

## Separate downstream states

The result exposes these independently:

- `pageValueReady`;
- `publishReady`;
- `sitemapEligible`.

A page can pass the value gate while remaining private, unapproved, noindex, and excluded from sitemap output.

## Scope

- No database writes.
- No migrations.
- No public routes.
- No sitemap XML.
- No sitemap eligibility changes.
- No Admin UI actions.
- No publish mutation.
- No runtime content generation.
- No runtime public behavior.
