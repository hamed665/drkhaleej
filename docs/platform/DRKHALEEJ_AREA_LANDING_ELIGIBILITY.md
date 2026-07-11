# DrKhaleej Area Landing Page Eligibility

## Purpose

This contract decides whether a canonical Oman area has enough verified local value to justify a future area landing page. It composes existing geo seed, Page Value, Internal Link Intelligence, Nearby Projection, and public projection readiness rather than inventing a parallel area-page system.

Area landing eligibility requires:

- a ready Oman geo seed fixture;
- a canonical area ID and slug;
- a ready route-aligned `area_page` projection;
- Page Value readiness;
- Internal Link Intelligence readiness;
- Nearby Projection readiness;
- English and Arabic keyword targets;
- at least five verified providers;
- at least three distinct specialties;
- at least six unique local facts;
- no duplicate-area risk;
- completed manual review.

## Separate states

Area landing eligibility is not publish readiness.

Area landing eligibility is not sitemap eligibility.

The contract exposes `areaLandingEligible`, `publishReady`, and `sitemapEligible` separately. An area may satisfy content and coverage gates while remaining private, noindex, and absent from sitemap output.

## Fail-closed behavior

Missing canonical geo, thin provider density, weak specialty diversity, insufficient local facts, missing bilingual intent, duplicate-area risk, or missing review blocks eligibility.

No weighted score may override a hard blocker. A page with attractive typography and three clinics is still a thin page, merely wearing nicer shoes.

## Scope

- No database writes.
- No migrations.
- No public routes.
- No sitemap changes.
- No Admin UI actions.
- No publish mutation.
- No runtime area-page generation.

This contract only defines eligibility for a future projection-backed area page.
