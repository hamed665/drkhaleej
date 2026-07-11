# DrKhaleej Internal Link Intelligence 2026

## Purpose

This contract upgrades the existing link-rule matrix, generator, cache, Page Value Gate, and public projection contracts into one fail-closed readiness decision for internal links.

Internal link readiness is not publish readiness.

Internal link readiness is not sitemap eligibility.

## Required conditions

A page is internal-link-ready only when:

- Page Value is ready;
- a route-aligned `internal_links` public projection is ready;
- active cache rows exist and are not expired;
- no row links an entity to itself;
- no target is repeated;
- English and Arabic anchor text are both present;
- every target has a ready public projection;
- every target meets the configured quality score;
- each link group stays within its configured capacity.

## Existing contracts remain authoritative

The link-rule matrix still owns domain separation and explicit allow/block decisions.

The generator still owns rule-based candidate scoring and selection.

The cache still owns generated version metadata, activation state, and expiry.

This contract does not replace those layers. It validates that their output is safe and useful enough to participate in a future public projection.

## Hard blockers

A high aggregate score cannot override stale cache data, self-links, duplicate targets, missing bilingual anchors, unavailable targets, or excessive link-group density. Search engines do not become impressed merely because a bad decision has decimals.

## Separate downstream states

The result exposes:

- `internalLinksReady`;
- `publishReady`;
- `sitemapEligible`.

Passing this contract does not publish a page, change indexability, or include anything in a sitemap.

## Scope

- No database writes.
- No migrations.
- No public routes.
- No sitemap XML.
- No sitemap eligibility changes.
- No Admin UI action.
- No publish mutation.
- No runtime link generation.
- No runtime public behavior.
