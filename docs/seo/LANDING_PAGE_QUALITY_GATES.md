# Landing Page Quality Gates

## 1. Status and Authority

This document is documentation-only for SEO-D1. It does not authorize implementation, route creation, page generation, page scaffolds, sitemap inclusion, schema output, CMS publishing, keyword-driven page generation, database imports, seed rows, medical content publication, API handlers, UI changes, migrations, RLS changes, validators, analytics events, crawlers, background jobs, AI chat, provider dashboards, branded hospital pages, payment logic, monetization logic, sponsored placement, boosts, or ranking logic.

Future Service / Area / Specialty landing page route families remain `future_approval_required`. Keyword data is planning data only. Keyword `target_url_pattern` and `route_status` values do not authorize route or page generation.

If this document conflicts with V10.4 master-spec files, current repo state, route checks, SEO-A, SEO-B, SEO-C, or stricter guardrails, the stricter/canonical guardrail wins. Future implementation requires separate `PHASED_BUILD_ONLY` tasks with four-axis mapping, allowed files, forbidden scope, validation, and human approval.

Medical content requires human approval before publication. Persian and Hindi public SEO routes remain forbidden. Approved launch locales are `en` and `ar`. Approved launch country is `om`. The plural doctor detail route `/[locale]/[country]/doctors/[doctorSlug]` remains forbidden. The approved doctor detail route remains `/[locale]/[country]/doctor/[doctorSlug]`.

No hidden AI-only content is allowed. If schema output is ever approved later, schema must match visible user-facing content.

## 2. Four-Axis Mapping

- Execution Phase: Phase 3 — Public SEO Platform
- Lock Scope: Phase 4 — Public SEO Pages / documentation-only planning for SEO-D1
- Product Module: Phase 9 — SEO/CMS and Programmatic Pages
- Subphase ID: SEO-D1

## 3. Shared Minimum Quality Gates

Every future landing page family must satisfy these gates before it can become an indexable candidate. These gates do not authorize implementation; they define future minimum requirements.

### Provider Count

The page must have enough visible public providers/centers for the entity or entity combination. Counts must be based on approved public catalog data and public RLS-safe query helpers. Counts must not include private, unpublished, admin-only, provider-dashboard-only, fake, or seed-only data.

### Unique Visible Intro

Each page must include a unique, visible, localized introduction that matches the page entity and intent. Generic boilerplate, keyword stuffing, hidden text, or duplicated intros across many combinations fail this gate.

### Entity Clarity

The page must clearly identify the entity type and relationships: specialty, service, area, country, center, doctor, and DrMuscat platform context. It must not confuse doctors with centers, services with specialties, or areas with cities/countries.

### Local Relevance

The page must include Oman/Muscat/area relevance grounded in real public data. Local relevance must not be invented from keyword text alone.

### Language/Country Support

Only `en` and `ar` are approved launch locales. Only `om` is the approved launch country. Persian/Hindi public SEO routes and unsupported country routes remain forbidden unless explicitly approved later.

### No Duplicate Canonical

Each entity intent must have one canonical route family. Future pages must not compete with current approved routes, plural doctor detail routes, countryless localized routes, deprecated shortcuts, article routes, branded pages, or unsupported locale/country routes.

### Medical Safety Review

Medical content requires human approval before publication. Service, symptom, condition, emergency, cost, comparison, insurance, and commercial healthcare claims require stricter review and may require disclaimers or blocking.

### No Thin Page

A page fails if it is empty, near-empty, duplicated, boilerplate-only, keyword-generated, unsupported by visible data, missing localized content, missing provider density, medically unreviewed where review is required, or canonical/hreflang ambiguous.

## 4. Family-Specific Quality Gates

### Specialty Pages

Future specialty pages must have:

- a real approved specialty entity;
- sufficient visible public providers/centers tied to that specialty;
- a unique localized specialty intro;
- links only to approved canonical doctor/center routes and future approved related landing pages;
- no invented rankings, reviews, prices, availability, or verification claims;
- no medical explanations beyond approved reviewed content.

### Specialty + Area Pages

Future specialty + area pages must have:

- a real approved specialty entity;
- a real approved area entity;
- visible public providers/centers in the exact specialty-area combination;
- unique local context for the area;
- one canonical family only;
- no deprecated shortcut route usage.

### Area Pages

Future area pages must have:

- a real approved Oman area entity;
- enough public catalog density or category richness;
- visible local context;
- clear distinction between area, city, country, centers, doctors, services, and specialties;
- no invented facility counts, population facts, rankings, reviews, or availability claims.

### Service Pages

Future service pages must have:

- a real approved service entity;
- sufficient visible public providers/centers offering the service;
- human-reviewed service copy where medical claims appear;
- no diagnosis, prescription advice, treatment instructions, guaranteed outcomes, invented prices, or unsupported claims;
- no schema output unless schema is separately approved and matches visible content.

### Service + Area Pages

Future service + area pages must have:

- a real approved service entity;
- a real approved area entity;
- visible public providers/centers in the exact service-area combination;
- unique local intro and local relevance;
- human-reviewed service copy where medical claims appear;
- stricter no-thin-page handling due to high programmatic expansion risk.

## 5. Suggested Planning Thresholds

These are planning thresholds only. Future approved implementation may require stricter thresholds.

| Page family | Suggested threshold for indexable candidacy | Failure behavior |
| --- | --- | --- |
| Specialty | At least 3 visible public providers/centers or stricter future-approved threshold. | `noindex_required` or blocked until enough public data exists. |
| Specialty + area | At least 2 visible public providers/centers in the exact combination plus local relevance. | `noindex_required` or blocked for thin/ambiguous combinations. |
| Area | At least 3 visible public providers/centers or category-rich public catalog density. | `noindex_required` until density and unique local content pass. |
| Service | At least 3 visible public providers/centers plus human-reviewed service copy where medical claims appear. | `noindex_required` or blocked until review/content/data gates pass. |
| Service + area | At least 2 visible public providers/centers in the exact service-area combination plus unique local intro. | `noindex_required` or blocked due to high thin-page risk. |

## 6. Indexability Model

### `indexable`

A future page may be `indexable` only after route implementation is separately approved and all quality gates pass: supported locale/country, canonical uniqueness, provider count, unique visible content, entity clarity, local relevance, medical review where needed, and no private/admin/provider-only data exposure.

### `noindex_required`

Use `noindex_required` when a page is allowed to render in a future approved scope but does not yet satisfy indexability gates. Reasons include low provider count, missing unique intro, pending medical review, temporary content, duplicate risk, or search/filter state.

### `blocked`

Use `blocked` for forbidden routes, duplicate canonical families, deprecated shortcut patterns, private-data exposure, unsupported implementation scope, unsafe medical content, unapproved schema/sitemap/CMS usage, or route ambiguity.

### `future_approval_required`

Use `future_approval_required` for all SEO-D landing page families until a later implementation task explicitly approves route/page creation.

### `unsupported_locale`

Use `unsupported_locale` for Persian, Hindi, or any locale outside `en` and `ar` unless a future approval changes the launch locale contract.

### `unsupported_country`

Use `unsupported_country` for any country outside `om` unless a future approval changes the launch country contract.

## 7. Sitemap Eligibility Model

A future landing page may be sitemap eligible only after:

- the route family is separately approved;
- the page is `indexable`;
- content quality gates pass;
- locale is `en` or `ar`;
- country is `om`;
- canonical URL is unique and stable;
- hreflang counterparts are valid and supported;
- medical/human approval is complete where required;
- the page is not admin, API, provider-private, noindex, blocked, duplicate, unsupported, thin, deprecated, or query/filter-only;
- sitemap changes are separately approved.

Sitemap eligibility must not be bundled into initial route scaffolds unless a future approved task explicitly authorizes it.

## 8. Canonical / Hreflang Model

Future canonical and hreflang rules must preserve the current route contract.

- Each indexable page must have one canonical URL.
- Canonicals must use approved route families only.
- Hreflang must link only valid `en` and `ar` counterparts for `om`.
- No Persian/Hindi/GCC hreflang targets are allowed without future explicit approval.
- No canonical or hreflang may point to plural doctor detail, deprecated shortcut, countryless localized, localized admin, article, branded, unsupported, blocked, or noindex routes.
- If a counterpart does not exist or does not pass quality gates, omit hreflang until valid.

## 9. Empty / Thin State Behavior

### Unknown Entity

If a specialty, service, or area slug is unknown, the future implementation should return not found or blocked behavior as approved later. It must not generate a thin placeholder page.

### Known Entity but Too Few Providers

If the entity exists but provider count fails, the page should be `noindex_required` or blocked. It must be excluded from sitemap and must not be linked for SEO purposes.

### Missing Localized Intro

If localized intro content is missing or duplicated, the page should be `noindex_required` until unique visible localized content is approved.

### Medical Review Pending

If medical review is required and incomplete, the page should be `noindex_required` or blocked. It must not include schema or sitemap entries.

### Unsupported Locale/Country

Unsupported locale or country requests should be blocked, not found, or otherwise fail closed according to a future approved implementation. They must not appear in sitemap, hreflang, or internal SEO links.

## 10. Medical Content and Human Approval Model

Future landing pages must distinguish directory facts from medical claims.

Directory facts may include approved public entity names, specialties, services, areas, centers, doctors, contact/location information, and public relationships when allowed by RLS and public catalog rules.

Medical claims include treatment explanations, procedure details, risks, preparation, recovery, eligibility, urgency, pricing, insurance, comparisons, and commercial claims. These require human approval before publication and may require disclaimers or blocking.

No keyword row, target URL, estimated volume, AI potential, or local SEO relevance value can substitute for medical review.

## 11. Admin / Provider / Private Exclusion Rules

Future landing pages must never expose admin, provider-private, CRM, billing, claim, moderation, unpublished, or private user data. Excluded data includes:

- admin notes;
- CRM notes;
- private reviews;
- payment logs;
- receipts;
- claim evidence;
- license files;
- unpublished provider data;
- provider dashboard/private data;
- internal onboarding lead data.

Admin routes remain root-level and not localized. API routes are non-SEO endpoints. Neither admin nor API surfaces are sitemap, canonical, hreflang, or landing-page targets.

## 12. Stop Conditions

Stop rather than guessing if any of these occur:

- route ambiguity or route-contract conflict;
- unsupported locale/country uncertainty;
- duplicate canonical or hreflang ambiguity;
- sitemap eligibility ambiguity;
- schema visibility ambiguity;
- medical content risk or missing human approval;
- branded/competitor query risk;
- private-data exposure concern;
- missing provider-count helper or unclear data source;
- RLS/security ambiguity;
- failed validation command;
- need to edit files outside approved scope.

## 13. Future Validation Expectations

Future documentation-only work should run:

```bash
git status --short
test -f docs/seo/LANDING_PAGE_STRATEGY.md && test -f docs/seo/LANDING_PAGE_QUALITY_GATES.md && test -f docs/seo/LANDING_PAGE_IMPLEMENTATION_PLAN.md && echo "SEO-D docs exist"
pnpm env:check
pnpm db:validate:migrations
pnpm test:db:rls
pnpm routes:check
pnpm typecheck
pnpm build
pnpm lint
```

Future route or sitemap/schema implementation tasks must add route-specific, indexability-specific, sitemap-specific, schema-specific, and medical-review validation only if those scopes are separately approved.
