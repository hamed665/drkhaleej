# DrMuscat Canonical URL and Geo Contract v1

Status: canonical product and engineering contract.
Last updated: 2026-06-25.
Scope: documentation and validation only.
Build mode: phased, fail-closed, Oman-first.

## 1. Purpose

This contract locks the public URL, canonical, geo hierarchy, slug, alias, redirect, and indexability rules before public noindex publishing, entity relation graph runtime, internal linking runtime, dynamic sitemap, schema mapping, and local SEO page generation.

The goal is to prevent route cannibalization, orphan pages, duplicate local pages, thin programmatic combinations, and future redirect debt.

## 2. Non-goals

This phase does not add or change:

- public routes
- dynamic route rendering
- sitemap output
- robots output
- `llms.txt`
- metadata runtime
- JSON-LD runtime
- database migrations
- import behavior
- public publishing
- index promotion
- ad rendering

## 3. Canonical locale and country base

DrMuscat public canonical routes must use:

```text
/{locale}/{country}/...
```

Allowed launch values:

```text
locale: en, ar
country: om
```

Canonical root examples:

```text
/en/om
/ar/om
```

No public Persian, Hindi, or non-Oman canonical routes are allowed until a separate market adapter and launch gate approve them.

## 4. Canonical geo hierarchy

The canonical geo model for Oman is:

```text
Country → Governorate → Wilayat → City or Settlement → Area or Neighborhood
```

Implementation notes:

- `governorate` and `wilayat` are required hierarchy levels for canonical local URLs once local pages are enabled.
- `area` and `neighborhood` must not be treated as globally unique.
- City-like labels such as Muscat, Salalah, Sohar, Seeb, and Barka may be governorate, wilayat, settlement, or area-like user labels depending on context.
- A display label can be user-friendly, but canonical storage must preserve hierarchy and type.
- Ambiguous geo slugs must not render indexable pages until a canonical parent path resolves the ambiguity.

## 5. Canonical URL families

### 5.1 Doctor profiles

Canonical route:

```text
/{locale}/{country}/doctors/{doctorSlug}
```

Rules:

- A doctor has one canonical profile per locale/country.
- A doctor working at multiple hospitals, clinics, or private practices must not automatically create multiple doctor-location pages.
- Practice locations are rendered as blocks inside the doctor canonical profile.
- A separate doctor-at-facility page is deferred until it has independent public value, source evidence, and index eligibility.

### 5.2 Facility profiles

Canonical routes:

```text
/{locale}/{country}/hospitals/{facilitySlug}
/{locale}/{country}/clinics/{facilitySlug}
/{locale}/{country}/pharmacies/{facilitySlug}
/{locale}/{country}/labs/{facilitySlug}
```

Rules:

- Facility type determines canonical family.
- Legacy `/center/{centerSlug}` routes may continue only as compatibility routes until migration/redirect policy is implemented.
- Facility profiles can contain multiple locations, departments, doctors, services, media, contact actions, trust/source blocks, ads/offers, and related blocks.

### 5.3 Geo pages

Canonical routes:

```text
/{locale}/{country}/locations/{governorateSlug}
/{locale}/{country}/locations/{governorateSlug}/{wilayatSlug}
/{locale}/{country}/areas/{governorateSlug}/{wilayatSlug}/{areaSlug}
```

Rules:

- `/areas/{areaSlug}` is not allowed as an indexable canonical route because area slugs are not globally unique.
- Short local aliases can redirect to canonical geo routes only after alias mapping is reviewed.
- Geo pages must remain noindex or not found until geo coverage and page readiness gates pass.

### 5.4 Specialty pages

Canonical routes:

```text
/{locale}/{country}/specialties/{specialtySlug}
/{locale}/{country}/specialties/{specialtySlug}/{governorateSlug}/{wilayatSlug}/{areaSlug}
```

Rules:

- Specialty pages require canonical specialty taxonomy.
- Specialty + area pages require exact relationship coverage, local relevance, unique intro content, internal links, and no private data leakage.
- Ambiguous specialty aliases must redirect to canonical specialty slugs before index eligibility.

### 5.5 Service pages

Canonical routes:

```text
/{locale}/{country}/services/{serviceSlug}
/{locale}/{country}/services/{serviceSlug}/{governorateSlug}/{wilayatSlug}/{areaSlug}
```

Rules:

- Service pages require canonical service taxonomy.
- Service slugs must be unique in the public route namespace or resolved through a canonical route map.
- Service + area pages require provider coverage, local relevance, unique visible intro, and review gates.

### 5.6 Articles and guides

Canonical routes:

```text
/{locale}/{country}/articles/{articleSlug}
/{locale}/{country}/guides/{guideSlug}
```

Rules:

- Medical or care-navigation content must include review status, source policy, disclaimer, related providers/services/areas, and freshness fields before index eligibility.
- Article and guide pages can participate in internal linking only after public CMS publish workflow is active.

### 5.7 Search, filters, and query routes

Canonical route:

```text
/{locale}/{country}/search
```

Rules:

- Search result URLs with query parameters are crawl-trap risks and must default to noindex.
- Filter combinations must not create indexable URLs unless promoted as explicit landing pages through page registry and readiness gates.
- Search should feed analytics and zero-result queues, not sitemap expansion.

## 6. Slug policy

All canonical slugs must be:

```text
lowercase
kebab-case
ASCII route-safe
stable after publish
unique inside their canonical namespace
```

Slug sources:

- Imported names can propose slug candidates.
- Admin review or canonical mapping must approve public slugs.
- Duplicate slugs require disambiguation by parent hierarchy, entity type, or reviewed suffix.
- Once a public URL exists, slug changes require redirect policy.

Forbidden slug behavior:

- No direct raw imported slug as public canonical without review.
- No localized Arabic slug as the first canonical implementation phase.
- No query-parameter canonical URLs for local SEO pages.
- No global area slug assumptions.

## 7. Alias and redirect policy

Aliases can exist for:

- alternate English spellings
- Arabic names
- common local names
- legacy route families
- imported external IDs
- provider-submitted names

Alias output options:

```text
not_found
redirect_to_canonical
noindex_preview
blocked
```

Redirect rules:

- Redirect only after the target canonical URL is public-safe and stable.
- Ambiguous aliases must not redirect automatically.
- Legacy center route redirects must be planned after canonical facility family migration.
- Redirects must preserve locale and country.

## 8. Indexability contract

A page cannot be `index_eligible` until all of these pass:

- canonical URL resolved
- duplicate status resolved
- public-safe projection exists
- page registry entry exists
- source or source name exists
- last checked date exists where required
- contact or directions exists for provider/facility pages
- internal link readiness passes
- breadcrumb readiness passes
- schema eligibility passes or is explicitly disabled
- no private/admin/raw payload fields are rendered
- page has enough visible content for its page family

Search/filter result pages, sensitive assessment result pages, admin pages, private previews, and unresolved aliases must stay noindex or not found.

## 9. Internal linking implications

Canonical URL decisions must feed the future internal linking engine.

Required future link families:

```text
doctor → practice locations
doctor → facility
doctor → specialty
doctor → services
doctor → area/wilayat
facility → doctors
facility → departments
facility → services
facility → area/wilayat
area → providers
area → nearby areas
specialty → providers
specialty → areas
service → providers
service → areas
article/guide → related providers/services/areas
```

Internal links must point to canonical URLs, not aliases or unresolved route families.

## 10. Breadcrumb contract

Breadcrumbs must use the canonical hierarchy for the current page family.

Examples:

```text
Home → Oman → Muscat Governorate → Bawshar → Al Khuwair → Clinics → Clinic Name
Home → Oman → Muscat Governorate → Al Seeb → Al Khoud → Dermatology → Doctor Name
Home → Oman → Dhofar Governorate → Salalah → Pharmacies
```

Rules:

- Breadcrumbs must be visible when route depth is greater than one content level.
- Breadcrumb JSON-LD must only represent visible breadcrumb content.
- A page may show related blocks for alternate paths, but canonical breadcrumb must remain singular.

## 11. Sitemap contract

Sitemap inclusion requires:

```text
page_status = index_eligible
robots_policy = index
sitemap_policy = include
canonical_url exists
internal_link_readiness passes
last_modified derived from entity/content update timestamp
```

Sitemap must not include:

- noindex pages
- search/filter URLs
- admin pages
- private preview URLs
- unresolved aliases
- duplicate-unresolved profiles
- low-quality local combinations
- sensitive assessment result pages

Large public inventory must use sitemap sharding and, if needed, sitemap indexes.

## 12. Robots and LLM contract

Robots and LLM-facing manifests must reflect public state.

Rules:

- `/admin`, `/auth`, private previews, and internal routes must be disallowed or blocked.
- Search/filter result pages must remain noindex and should be disallowed from crawl expansion where appropriate.
- `llms.txt` must not claim unavailable public data.
- `llms.txt` can list canonical public page families only after those families are live and safe.
- No raw import, admin notes, private metadata, or unapproved entity facts may appear in LLM-facing files.

## 13. Ad and UI slot compatibility

Canonical page families must expose stable placement zones for future ads and house campaigns.

Required stable zones:

```text
profile_after_trust
profile_middle
profile_before_related
area_after_provider_grid
search_after_result_group
article_after_section
home_after_hero
```

Rules:

- Ad slots must reserve layout space to prevent CLS.
- Sensitive pages can disable ads by policy.
- Direct campaigns take priority over AdSense fallback.
- Sponsored labels must be visible.

## 14. Implementation dependency order

After this contract, the safe implementation order is:

```text
1. Entity relation model gap review
2. Doctor multi-practice relation hardening
3. Relation candidate generator
4. Admin relation review
5. Nearby/proximity engine
6. Internal link candidate generator
7. Page registry and readiness v2
8. Public noindex publisher
9. Profile V2 pages
10. Breadcrumb and related blocks runtime
11. Dynamic sitemap
12. Schema mapping
```

## 15. Validation expectations

A static validator should ensure this contract keeps the following required concepts present:

```text
canonical URL
geo hierarchy
slug policy
alias and redirect policy
indexability contract
internal linking implications
breadcrumb contract
sitemap contract
robots and LLM contract
ad and UI slot compatibility
implementation dependency order
```
