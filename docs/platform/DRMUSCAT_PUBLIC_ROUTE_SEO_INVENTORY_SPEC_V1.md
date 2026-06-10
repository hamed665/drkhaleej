# DrMuscat Public Route & SEO Inventory Spec V1

## Status and Authority

- Status: Documentation-only.
- Authority: Public route and SEO inventory planning only.
- This specification does not authorize route implementation.
- This specification does not authorize sitemap implementation.
- This specification does not authorize schema implementation.
- This specification does not authorize CMS, article, provider, doctor, or offer route creation.
- This specification does not authorize keyword-driven page generation.
- This specification must be read together with:
  - `docs/platform/DRMUSCAT_PLATFORM_ARCHITECTURE_V1.md`
  - `docs/platform/DRMUSCAT_PLATFORM_EXECUTION_ROADMAP_V1.md`
  - `docs/platform/DRMUSCAT_SEO_AI_CONTENT_OPERATING_SYSTEM_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_KEYWORD_UNIVERSE_CONTENT_INTELLIGENCE_SPEC_V1.md`
- Future implementation requires separate `PHASED_BUILD_ONLY` approval.

## Four-Axis Mapping

- Execution Phase: Phase 0 — Spec Freeze and Schema Patch / documentation alignment only.
- Lock Scope: Phase 0 — Repository Readiness.
- Product Module: Phase 0 — Setup Only / documentation alignment.
- Subphase ID: `ALIGN-PUBLIC-ROUTE-SEO-INVENTORY-V1`.

## 1. Purpose

This specification defines the future DrMuscat public route inventory and SEO governance rules before any route, CMS, article, category, area, provider, doctor, offer, sitemap, schema, canonical, hreflang, or keyword-driven page implementation begins. It establishes the planning rules future approved phases must use to decide whether a route family should exist, whether it may be indexed, whether it may enter a sitemap, and whether structured data is eligible.

This specification is intended to prevent:

- duplicate route patterns;
- deprecated route patterns;
- thin programmatic pages;
- indexable pages without enough provider or content supply;
- fake schema;
- incorrect canonical or hreflang behavior;
- sitemap pollution;
- route generation from every keyword row;
- public Persian or Hindi routes;
- search, filter, and pagination crawl traps.

## 2. Current Route Principles

- Public country and locale routing remains English and Arabic for the Oman-first launch.
- Canonical route patterns should remain locale-aware and country-aware.
- Persian and Hindi public routes are not allowed unless separately approved in a future `PHASED_BUILD_ONLY` phase.
- Search, filter, and pagination routes should be `noindex` or blocked unless separately approved.
- Deprecated route patterns must not be introduced.
- Every new public route must pass route readiness, SEO, content quality, and provider supply gates before it may be indexable or sitemap eligible.

## 3. Locale and Country Route Standard

Preferred route base:

- `/en/om`
- `/ar/om`

Rules:

- English and Arabic pages should map as hreflang alternates when both approved localized versions exist.
- `x-default` should point to the preferred default English Oman route unless a future approved strategy changes it.
- Every public route family must define both English and Arabic URL behavior before implementation.
- Arabic content must be real localized content, not empty translated placeholders.
- No route may use Persian or Hindi unless future approved.

## 4. Route Family Inventory

Future public route implementation must map each route to one of the route families below or propose a separate documentation-only inventory update before implementation. The examples below define planning patterns only; they do not create routes.

| Route family | Example pattern | Purpose | MVP status | Index rule | Sitemap rule | Schema eligibility | Required gates |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Home | `/en/om`, `/ar/om` | Oman-first public entry point for DrMuscat discovery. | Approved public baseline may exist; future changes require approval. | Index when localized content, metadata, canonical, hreflang, and public safety checks pass. | Yes when indexable and production-safe. | Organization, WebSite, and BreadcrumbList where appropriate. | Route readiness, metadata, canonical, hreflang, content quality, no private data. |
| Category listing hub | `/en/om/centers`, `/ar/om/centers` | Hub for approved category discovery and internal navigation. | Future expansion governed by approval. | Index only with useful content and category links. | Include only when indexable and not thin. | BreadcrumbList; ItemList only if visible list content supports it. | Category taxonomy approval, useful intro, internal links, bilingual behavior. |
| Category page | `/en/om/centers/[category]`, `/ar/om/centers/[category]` | Category-level provider discovery. | Future implementation only. | Index only if provider supply and unique intro content exist. | Include only when indexable and approved. | BreadcrumbList; MedicalOrganization or LocalBusiness-like schema only where safe and visible content supports it. | Provider supply, unique content, canonical slug, Arabic localization, no duplicate category patterns. |
| Area/category page | `/en/om/centers/[category]/[area]`, `/ar/om/centers/[category]/[area]` | Localized category discovery by Oman area. | Future implementation only. | Index only if enough provider supply and non-thin local content exist. | Include only when indexable, canonical, and supply thresholds pass. | BreadcrumbList; ItemList only if visible listing is useful. | Area taxonomy approval, provider supply, local intro, canonical hierarchy, no legacy area write dependency. |
| Provider profile | `/en/om/providers/[slug]`, `/ar/om/providers/[slug]` | Public profile for approved provider entities. | Future expansion only after profile/public-data approval. | Index only if profile is approved for public display and has enough useful fields. | Include only when approved, canonical, non-thin, and indexable. | MedicalClinic, MedicalOrganization, or LocalBusiness-like schema only for qualified visible profiles. | Provider approval, useful public fields, canonical slug, no private data, localized content. |
| Doctor profile | `/en/om/doctors/[slug]`, `/ar/om/doctors/[slug]` | Public profile for approved doctors. | Future implementation only. | Index only if approved and not thin. | Include only when approved, canonical, non-thin, and indexable. | Physician only for qualified visible doctor profiles. | Doctor identity approval, useful public fields, relationship clarity, no private data, localized content. |
| Offers hub | `/en/om/offers`, `/ar/om/offers` | Public discovery page for approved offers. | Future only. | Index only with approved public offers and useful hub content. | Include only when indexable and active. | BreadcrumbList; Offer only if visible offer list is qualified and safe. | Offer approval workflow, terms clarity, expiry policy, compliance review. |
| Offer detail | `/en/om/offers/[slug]`, `/ar/om/offers/[slug]` | Public detail page for an approved offer. | Future only. | Index or noindex depends on offer quality, expiry, terms, provider approval, and duplication risk. | Include only when indexable, active or policy-approved evergreen, and not duplicate. | Offer only for approved visible offers with clear terms. | Provider approval, offer terms, expiry handling, legal/compliance review, duplicate checks. |
| Article hub | `/en/om/articles`, `/ar/om/articles` | Public editorial/content hub. | Future only after CMS/content workflow exists. | Index only after CMS and content workflow exists. | Include only when indexable and populated with approved content. | BreadcrumbList; WebPage where appropriate. | CMS approval, editorial workflow, category taxonomy, internal links, localization. |
| Article detail | `/en/om/articles/[slug]`, `/ar/om/articles/[slug]` | Public editorial article page. | Future only. | Index only after approval and review workflow. | Include only when approved, indexable, canonical, and localized behavior is defined. | Article or BlogPosting only for approved reviewed articles; FAQPage only with visible real FAQ content. | Medical/legal review where required, author/reviewer policy, freshness, no unsafe advice. |
| List your center | `/en/om/list-your-center`, `/ar/om/list-your-center` | Public acquisition page for providers to start listing interest. | Future changes require approval. | Index if it is a useful public acquisition page. | Include when indexable and public. | Organization/WebPage/BreadcrumbList where appropriate. | Public content quality, CTA clarity, no private form-step indexing, localized content. |
| Claim center | `/en/om/claim`, `/ar/om/claim` | Public explanation of provider claim workflow. | Future changes require approval. | Index or noindex decision to be approved; likely index if useful public claim explanation, but private claim flow steps remain noindex. | Include only if indexable public explanation page is approved. | WebPage/BreadcrumbList where appropriate. | Claim privacy review, private-step exclusion, CTA clarity, localized content. |
| Search page | `/en/om/search`, `/ar/om/search` | User search entry point. | Future only unless separately approved. | Noindex by default unless separately approved. | Not sitemap eligible by default. | No schema by default. | Crawl-control policy, canonical/noindex policy, no arbitrary keyword indexation. |
| Filtered/search result pages | Any querystring or filter combinations. | Dynamic discovery and filtering. | Future behavior only. | Noindex by default. | Not sitemap eligible. | No schema by default. | Query parameter policy, robots/canonical/noindex policy, crawl trap prevention. |
| Admin/provider/auth/private routes | Admin, provider, auth, and private dashboards. | Private operations and protected workflows. | Existing and future private routes remain protected where required. | Noindex. | Not sitemap eligible. | No public schema. | Auth/protection, no private data exposure, no sitemap inclusion. |
| Provider stories/updates | Future provider updates and engagement content. | Engagement content, not SEO pages by default. | Future only. | Noindex by default. | Excluded by default. | No schema by default unless promoted to reviewed article in a future approved workflow. | Moderation, expiry/archive policy, review workflow, provider approval. |
| Sponsored landing pages | Future sponsored public pages. | Clearly labeled paid or sponsored campaign pages. | Future only. | Index only after sponsored label, content quality, review, and legal/SEO gates. | Include only when indexable and approved. | WebPage, BreadcrumbList, Offer, or other schema only if visible content supports it. | Sponsored label, legal/compliance review, content quality, canonical strategy, no hidden organic ranking boosts. |
| Legal/trust pages | `/en/om/privacy`, `/en/om/terms`, `/en/om/medical-disclaimer`, and Arabic equivalents. | Legal, trust, disclaimer, and policy information. | Future or existing pages governed by approval. | Index/noindex decision per page, but pages should generally be accessible and linked. | Include only if indexable and approved. | WebPage and BreadcrumbList where appropriate. | Legal approval, footer linking, localized versions, canonical and noindex decisions. |

## 5. Index/Noindex Rules

Indexing is allowed only if all applicable requirements are satisfied:

- public approved content;
- useful unique visible content;
- canonical defined;
- hreflang defined where applicable;
- metadata defined;
- no private or sensitive data;
- provider and/or content supply sufficient for the route family;
- schema, if emitted in a future phase, matches visible content;
- page is not a search, filter, or pagination trap;
- page is not duplicate or cannibalizing another page;
- medical/legal risk reviewed where required.

`noindex` is the default for:

- search result pages;
- filtered pages;
- pagination and filter combinations;
- thin pages;
- empty category or area pages;
- low provider supply pages;
- private dashboards;
- admin routes;
- auth routes;
- claim form steps with private data;
- provider stories or updates unless promoted to a reviewed article;
- expired offers where no durable value remains;
- internal planning pages;
- user-generated comments or reviews before moderation maturity.

## 6. Sitemap Eligibility

A page may be included in a sitemap only if it is:

- canonical;
- indexable;
- public;
- useful;
- not duplicate;
- approved;
- supplied with language alternates where applicable;
- not a search, filter, private, or admin page;
- not temporary or expired unless a future approved policy says otherwise.

Sitemaps must exclude:

- noindex pages;
- private pages;
- admin and provider dashboards;
- search and filter pages;
- querystring variants;
- expired low-value offers;
- stories and updates by default;
- draft, pending, or rejected content;
- unapproved providers, doctors, offers, or articles.

## 7. Canonical Rules

- Every indexable page requires a self-canonical URL.
- English and Arabic pages have separate canonical URLs.
- Canonical URLs must use a production-safe base URL.
- Query parameters should not create canonical variants unless separately approved.
- Filtered pages should canonical to a base or hub page, or remain `noindex`, depending on a future approved policy.
- Duplicate or cannibalizing content should be canonicalized, merged, or set to `noindex` as appropriate.
- Expired offers must follow a future approved policy: `noindex`, archive, redirect, or remain indexable only if evergreen value exists.

## 8. Hreflang Rules

- All bilingual public indexable pages require English and Arabic alternates when both approved language versions exist.
- Hreflang output must include self-referencing hreflang entries.
- Hreflang output must include `x-default`.
- Future implementation must not emit hreflang for missing or unapproved language versions.
- Future implementation must not emit Persian or Hindi hreflang.
- Arabic pages must have real localized content before hreflang inclusion.
- The hreflang map must follow the locale/country route base: `/en/om` and `/ar/om`.

## 9. Schema Eligibility Rules

Possible future schema types include:

- Organization;
- WebSite;
- BreadcrumbList;
- MedicalOrganization or LocalBusiness-like schema only where appropriate and safe;
- MedicalClinic only for qualified visible provider profiles;
- Physician only for qualified visible doctor profiles;
- Article or BlogPosting only for approved articles;
- FAQPage only for visible real FAQ content;
- Offer only for approved visible offers with clear terms;
- VideoObject only for visible video with metadata, transcript, and thumbnail where possible;
- Review or AggregateRating only after approved real review system maturity.

Rules:

- Schema must match visible content.
- No fake reviews or ratings are allowed.
- No fake FAQ is allowed.
- No hidden structured data is allowed.
- No unsupported medical claims are allowed.
- No schema should be emitted for thin pages.
- No schema should be emitted for unapproved provider data.
- No schema implementation is authorized in this PR.

## 10. Provider Supply Gates

For provider, category, and area route families:

- Minimum provider count thresholds must be defined before indexation.
- Provider profiles must have useful public fields.
- Provider cards must not be empty.
- Areas with weak supply should be held or set to `noindex`.
- Missing Arabic content should block Arabic indexability or require `noindex` until localized content is available.
- Low-quality or low-supply routes become sales acquisition targets, not indexable SEO pages.

## 11. Content Quality Gates

Before a page may be indexable, it must have:

- unique intro content;
- useful body or listing context;
- enough public data;
- relevant internal links;
- meaningful CTA;
- clear disclaimer where needed;
- no keyword stuffing;
- no duplicate content;
- no unsafe medical advice;
- no hallucinated provider facts;
- no fake service availability;
- no unsupported “best” claims unless editorial criteria are approved.

## 12. Internal Linking Rules

Future internal linking should follow these principles:

- Homepage links to primary category hubs.
- Category hubs link to category pages.
- Category pages link to area/category pages only when supply exists.
- Provider profiles link to services, doctors, offers, and articles where relevant.
- Articles link to useful category, area, and provider pages.
- Legal and trust pages are linked from the footer.
- Avoid footer spam.
- Avoid orphan articles.
- Avoid excessive exact-match anchors.
- Internal links should support users first and crawling second.

## 13. Search and Filter Crawl Control

- Search result pages are `noindex` by default.
- Query parameters should not enter sitemaps.
- Filter combinations are `noindex` by default.
- Pagination, filter, and crawl traps must be prevented.
- Future implementation must define robots, canonical, and `noindex` behavior before public launch.
- Arbitrary keyword search results must not become indexable pages.

## 14. Expired / Archived Content Rules

- Expired offers should be set to `noindex`, archived, redirected, or kept only if useful evergreen content remains.
- Outdated articles should be refreshed or marked reviewed/updated; they should be archived or set to `noindex` if unsafe or obsolete.
- Providers that are closed or permanently inactive require a future policy for archive, `noindex`, or redirect behavior.
- If a doctor leaves a center, future implementation should preserve the canonical doctor identity while updating relationship data.
- Stories and updates should expire or archive and remain `noindex` by default.

## 15. Route Readiness Checklist

Every future public route PR must answer:

1. What route family is this?
2. Is it English, Arabic, or both?
3. What is the canonical?
4. What is the hreflang map?
5. Is it index or `noindex`?
6. Is it sitemap eligible?
7. What schema is eligible?
8. What content supply is required?
9. What provider supply is required?
10. What internal links are required?
11. What empty state exists?
12. What `noindex` behavior exists for thin or empty pages?
13. What private data must be excluded?
14. What validation commands must pass?
15. What is explicitly out of scope?

## 16. Explicit Non-Implementation

This documentation-only phase includes:

- no routes created;
- no sitemap changes;
- no robots changes;
- no canonical implementation changes;
- no hreflang implementation changes;
- no schema changes;
- no CMS routes;
- no article routes;
- no provider or doctor route changes;
- no search route changes;
- no keyword route generation;
- no Excel import;
- no public Persian or Hindi routes;
- no migration;
- no RLS, API, or code changes.

## 17. Future PR Sequence

Recommended future sequence:

1. CMS Content Model Spec.
2. AI Brief/Draft Workflow Spec.
3. SEO Reporting & Analytics Spec.
4. Media SEO & Video/Image Performance Spec.
5. Provider Stories & Comments Spec.
6. Public Route Implementation Batch 1 only after approved route inventory.
7. Sitemap/robots implementation only after route inventory approval.
8. CMS database foundation only after CMS content model approval.

## 18. Completion Report Requirements

Final Codex reports for this phase must include:

- files created or changed;
- confirmation that the work is documentation-only;
- confirmation that no source code changed;
- confirmation that no routes changed;
- confirmation that no sitemap, robots, schema, canonical, or hreflang implementation changed;
- confirmation that no migrations, RLS policies, API handlers, or server actions changed;
- summary of route families documented;
- summary of index, noindex, sitemap, and schema rules;
- validation results;
- any blockers or conflicts.
