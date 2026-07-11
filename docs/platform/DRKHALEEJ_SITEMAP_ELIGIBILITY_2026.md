# DrKhaleej Sitemap Eligibility 2026

## Purpose

This contract replaces the old boolean-only sitemap authority with a fail-closed composition of the current DrKhaleej import-readiness layers.

The older `import-sitemap-eligibility-contract.ts` remains only as a compatibility contract for existing admin/read-model code. It is no longer the authoritative readiness model for new sitemap decisions.

## Required readiness

Sitemap eligibility requires all of the following:

- public visibility;
- index policy set to index;
- sitemap policy set to included;
- controlled publish readiness;
- SEO Profile readiness;
- Page Value readiness;
- Internal Link Intelligence readiness;
- route-aligned public projection;
- schema projection readiness;
- performance-budget compatibility;
- duplicate check passed;
- completed manual approval;
- canonical path present and exactly aligned with the route.

Area landing pages additionally require `areaLandingEligible = true`.

## Projection boundary

Sitemap generation must consume only the validated projection:

`public_indexable_entities`

It must not read raw import rows, draft entities, candidate payloads, or runtime generators directly.

## Separate states

`publishReady` and `sitemapEligible` remain separate states.

A page may be publish-ready while still excluded from the sitemap because it is noindex, private, thin, missing schema, missing internal-link value, over performance budget, lacking manual approval, or canonically misaligned.

## Safety boundary

- No sitemap XML is generated in this phase.
- No public route is added.
- No database write or migration is added.
- No publish mutation is added.
- No Admin UI action is added.
- No runtime sitemap inclusion is changed.

This is the authority contract only. Apparently even XML needs a constitutional court now, but at least it will not index unfinished pages by accident.
