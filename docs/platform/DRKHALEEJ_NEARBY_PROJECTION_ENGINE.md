# DrKhaleej Nearby Projection Engine

## Purpose

The Nearby Projection Engine defines a fail-closed, precomputed contract for nearby provider suggestions. It composes the Oman Geo Authority Registry, Internal Link Intelligence, entity public projection readiness, candidate quality, bilingual labels, and precomputed distance data.

Nearby projection readiness is not publish readiness.

Nearby projection readiness is not sitemap eligibility.

## Required conditions

A nearby projection is ready only when:

- the Oman Geo Authority Registry is ready;
- the source has canonical area or city geo;
- Internal Link Intelligence is ready;
- the source route has a ready entity projection;
- at least one candidate exists;
- no candidate links to the source entity itself;
- candidates remain inside the source entity domain;
- the relation is proven by same-area, authoritative nearby-area, or same-city data;
- distance is precomputed and within the configured range;
- candidate quality meets the configured threshold;
- every candidate has a ready public projection;
- English and Arabic labels are both present;
- target entities are unique;
- the configured candidate limit is valid.

## Geo authority boundary

Nearby relationships must be derived from canonical geo IDs and the registry's `nearbyAreaIds`. Text aliases, user-entered area names, or runtime string matching are not authoritative inputs.

## No runtime distance calculation

This contract accepts only `precomputedDistanceKm`. Public rendering must not calculate geospatial distance, scan raw import tables, or generate nearby candidates on request. The future public page reads the prepared `public_nearby_entities_projection` only.

## Deterministic ordering

Accepted candidates are sorted by:

1. shortest precomputed distance;
2. highest quality score;
3. stable target entity ID.

The result is then capped by `maximumCandidates`. This prevents unstable page output and cache churn caused by whatever order a database happened to feel like returning that morning.

## Separate downstream states

The result exposes:

- `nearbyProjectionReady`;
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
- No runtime geospatial calculation.
- No runtime nearby generation.
- No runtime public behavior.
