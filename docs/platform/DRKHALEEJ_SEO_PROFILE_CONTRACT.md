# DrKhaleej SEO Profile Contract

## Purpose

The SEO profile contract composes existing import-readiness contracts into one fail-closed decision for an imported entity's SEO profile. It does not rebuild draft, geo, duplicate, publication, projection, or performance logic.

SEO profile readiness depends on:

- Unified Draft Entity readiness;
- supported entity type and resolved entity domain;
- canonical geo readiness;
- source evidence readiness;
- duplicate guard readiness;
- SEO-relevant publication validation;
- ready entity, geo, and SEO public projections;
- public performance budget compatibility.

## Separate states

SEO profile readiness is not publish readiness.

SEO profile readiness is not sitemap eligibility.

The contract exposes `seoProfileReady`, `publishReady`, and `sitemapEligible` as separate values. A profile may be SEO-ready while still remaining private, unapproved, noindex, and excluded from sitemap output.

## Fail-closed behavior

Any missing required dependency blocks `seoProfileReady`. Manual intake has no bypass. AI-assisted intake remains subject to manual review through the Unified Draft Entity contract.

Only SEO-relevant publication blockers are composed here. Manual approval, schema generation, and internal-link generation remain downstream publish and sitemap concerns rather than being silently treated as SEO profile readiness.

## Projection boundary

The SEO profile requires ready `entity`, `geo`, and `seo` projection records for the same route. Public rendering must remain projection-based and must satisfy the existing performance guard.

## Scope

- No database writes.
- No migrations.
- No public routes.
- No sitemap XML.
- No Admin UI buttons.
- No publish mutation.
- No runtime public behavior.

Fixture coverage proves that `seoProfileReady` can be true while `publishReady` and `sitemapEligible` remain false.
