# DrKhaleej Launch Rules

## Purpose

This document is the launch source of truth for DrKhaleej. It keeps the public surface small, reviewed, evidence-based, crawl-safe, and reversible while the product moves quickly toward soft launch and public launch.

The launch strategy is not to publish every possible provider, route, location, category, article, offer, or schema surface. The launch strategy is to publish only the surfaces that can be defended with reviewed data, clear user value, safe public-discovery copy, and explicit indexability gates.

## Current launch mode

The current launch mode is:

- `SOFT_LAUNCH_CONTROLLED`
- Oman-first
- English and Arabic public routes only
- noindex-first for preview and incomplete surfaces
- evidence-first for provider profile publication
- sitemap allowlist only
- no broad location/category index promotion
- no unsupported public claims

Soft launch on `2026-06-30` means the site may be publicly accessible for controlled QA, user testing, provider outreach, Search Console setup, and analytics baseline collection. It does not mean broad index promotion.

## Launch status definitions

| Status | Meaning | Public route allowed | Index allowed | Sitemap allowed |
| --- | --- | --- | --- | --- |
| `draft` | Internal planning or unfinished implementation. | No | No | No |
| `candidate` | A possible future public surface exists, but readiness is incomplete. | Only if explicitly noindex and safe for users | No | No |
| `reviewable` | Data or content exists and is ready for human QA, but not approved. | Optional, noindex only | No | No |
| `approved` | Human-reviewed and policy-compliant, but not necessarily indexable. | Yes | Not by default | Not by default |
| `indexable` | Approved and explicitly allowed to be indexed. | Yes | Yes | Not by default |
| `sitemap_eligible` | Indexable and explicitly allowed into sitemap output. | Yes | Yes | Yes |

A surface must never skip directly from `draft` or `candidate` to `indexable`.

## Non-negotiable launch rules

### Evidence and data

- No provider profile enters the public sitemap without reviewed evidence.
- No provider profile is indexable without a reviewed source reference and `last_checked_at` or equivalent reviewed timestamp.
- No provider profile is indexable without at least one safe public contact, website, map, or direction signal.
- No location/category page is indexable without threshold evidence and a promotion PR.
- No imported provider candidate is public unless the import guard, publish queue, candidate status, canonical path, source evidence, local Oman geo evidence, contact/map evidence, robots policy, sitemap policy, family cap, and smoke validation pass.

### Public safety

- DrKhaleej public pages must describe directory and discovery information only.
- Public pages must not present DrKhaleej as a provider, regulator, insurer, booking guarantee, ranking authority, or official verifier.
- Public pages must not claim license verification, official recommendation, emergency availability, insurance acceptance, opening hours, ratings, reviews, or ranking unless that exact fact is reviewed and supported by an approved public source.
- Public pages must tell users to confirm important details directly with the listed provider.

### SEO and crawl control

- Sitemap output is an allowlist, not an inventory dump.
- `noindex_until_ready` and blocked preview pages must remain excluded from sitemap output.
- Preview pages must not be blocked by `robots.txt` if their `noindex` directive is expected to be read by crawlers.
- Query/filter/search result URLs must not be indexable in the soft-launch phase.
- Location/category composite pages remain blocked until threshold, source, editorial, QA, and human-review gates pass.

### Structured data

- No JSON-LD is allowed on noindex preview routes.
- No provider, local business, FAQ, review, rating, hours, or aggregate schema may be emitted unless the page family is approved for that schema surface.
- No review or rating schema is allowed without reviewed real review/rating data and a dedicated moderation policy.
- No opening-hours schema is allowed unless opening hours are reviewed and source-backed.

### LLM and AI-facing policy

- `public/llms.txt` must match the launch-ready route registry and sitemap snapshot.
- No noindex, candidate, blocked, preview, or experimental route may appear under the index-ready section of `llms.txt`.
- LLM-facing text must not invite unsupported provider claims, public ranking claims, or public verification claims.

## Soft launch allowlist

The soft-launch static index-ready allowlist is limited to:

- `/en/om`
- `/ar/om`
- `/en/om/doctors`
- `/ar/om/doctors`
- `/en/om/centers`
- `/ar/om/centers`
- `/en/om/labs`
- `/ar/om/labs`
- `/en/om/pharmacies`
- `/ar/om/pharmacies`
- `/en/om/hospitals`
- `/ar/om/hospitals`
- `/en/om/services`
- `/ar/om/services`
- `/en/om/for-providers`
- `/ar/om/for-providers`

Guarded imported doctor, pharmacy, and hospital profile URLs may be public and sitemap-eligible only when every guard and queue requirement passes.

## Soft launch blocked from sitemap

The following surfaces must remain sitemap-excluded until separately promoted:

- `/search`
- `/dental`
- `/beauty`
- `/offers`
- `/pet-clinics`
- `/pet-shops`
- `/articles`
- article detail pages
- location pages
- location/category composite pages
- imported lab profiles
- imported center profiles
- reviews, ratings, comments, appointments, payments, insurance, offers, and provider dashboard surfaces

## Promotion requirements

A promotion PR that changes any surface from noindex/blocked to indexable must include:

1. Updated route registry or explicit launch policy change.
2. Updated route indexability snapshot.
3. Sitemap decision and family cap decision.
4. Robots/noindex review.
5. LLM exposure review.
6. Source/evidence reference review.
7. Public-claim safety review.
8. Structured-data review if JSON-LD is added.
9. Tests or static validators preserving all remaining blocked states.
10. Rollback instructions.

## Rollback rule

Any launch PR that can add public indexable URLs must also document how to revoke those URLs from sitemap/index eligibility without deleting user-facing safe pages.

For imported provider profiles, rollback must support reverting affected queue rows away from `index_eligible`, `index`, and `included` while keeping the underlying candidate data available for review.
