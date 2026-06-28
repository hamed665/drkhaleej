# DrKhaleej Location V2 Status

This document records the current Location V2 state for DrKhaleej. It is intended for future agents and maintainers so the geo/SEO system is not accidentally promoted before the required content, evidence, and review gates are complete.

## Current status

Location V2 is implemented as a noindex-first, fail-closed system.

The current public location scaffolds are limited to:

- `/{locale}/om/locations/{governorateSlug}`
- `/{locale}/om/locations/{governorateSlug}/{wilayatSlug}`
- `/{locale}/om/locations/{governorateSlug}/{wilayatSlug}/{areaSlug}`

These routes are not indexable yet. They must remain:

- `noindex`
- excluded from sitemap output
- without JSON-LD
- without internal SEO link equity
- blocked from index promotion

## Canonical hierarchy

The user-facing hierarchy can be simplified as:

- Oman -> City -> Neighborhood

The backend and canonical resolver must keep the official Oman structure:

- Country -> Governorate -> Wilayat / City-level -> Area / Neighborhood

Subareas, zones, landmarks, buildings, streets, and PO boxes are search/address/proximity data only. They must not become SEO route depth.

## Candidate route status

Candidate composite routes are still forbidden.

Do not add these route families until a separate explicit promotion PR approves them:

- governorate + category
- governorate + service
- governorate + specialty
- wilayat + category
- wilayat + service
- wilayat + specialty
- area + category
- area + service
- area + specialty

Examples that must not exist yet:

- `/en/om/locations/muscat/categories/pharmacies`
- `/en/om/locations/muscat/al-seeb/services/ivf`
- `/en/om/locations/muscat/al-seeb/al-khoud/specialties/dermatology`

## Candidate contracts currently merged

The following pieces are present and fail-closed:

- parent-aware candidate path builder
- candidate path integration guard
- location threshold policy
- blocked candidate runtime accessor
- candidate runtime tests
- candidate evidence snapshot contract
- disabled evidence snapshot runtime accessor
- evidence snapshot runtime tests
- evidence snapshot integration guard
- promotion checklist contract
- disabled promotion checklist runtime accessor
- promotion checklist runtime tests
- promotion checklist integration guard
- route readiness final gate
- final gate smoke test

## Required promotion sequence

A future candidate page may only move toward review after all of the following are true:

1. The full parent hierarchy is resolved.
2. The candidate path is built through the parent-aware path builder.
3. The threshold policy exists for the entity/dimension pair.
4. Published provider count meets the threshold.
5. Verified provider count meets the threshold.
6. Approved evidence entries meet the threshold.
7. Source references are present and auditable.
8. Editorial readiness is complete.
9. QA/evidence readiness is complete.
10. Human review is complete.
11. A promotion PR explicitly approves the page family.
12. The final gate is updated in the same PR that changes route/index behavior.

Until then, every candidate must remain blocked, non-indexable, non-sitemap, and non-JSON-LD.

## Files that protect this status

Key guard files include:

- `scripts/seo/check-location-category-candidate-gate.mjs`
- `scripts/seo/check-location-threshold-policy.mjs`
- `scripts/seo/check-location-candidate-runtime-accessor.mjs`
- `scripts/seo/check-location-candidate-path-builder.mjs`
- `scripts/seo/check-location-candidate-path-builder-integration.mjs`
- `scripts/seo/check-location-candidate-evidence-snapshot-contract.mjs`
- `scripts/seo/check-location-candidate-evidence-snapshot-runtime-accessor.mjs`
- `scripts/seo/check-location-candidate-evidence-snapshot-integration.mjs`
- `scripts/seo/check-location-candidate-promotion-checklist-contract.mjs`
- `scripts/seo/check-location-candidate-promotion-checklist-runtime-accessor.mjs`
- `scripts/seo/check-location-candidate-promotion-checklist-integration.mjs`
- `scripts/seo/check-location-candidate-route-readiness-final-gate.mjs`

All of these are wired through `seo:check`.

## Non-goals for the current phase

The current phase does not add:

- candidate route pages
- sitemap promotion
- JSON-LD output
- public index promotion
- internal SEO link equity
- database access for candidate generation
- review workflow activation
- runtime snapshot generation
- runtime promotion activation

## Promotion rule

Any PR that changes a candidate from blocked to reviewable or indexable must include:

- updated threshold policy evidence
- updated snapshot contract or runtime evidence
- updated promotion checklist state
- route-specific noindex/sitemap/JSON-LD review
- human review notes
- final gate update
- tests proving the intended promotion and preserving all remaining blocked states

If a PR cannot prove these items, it must not change indexability.
