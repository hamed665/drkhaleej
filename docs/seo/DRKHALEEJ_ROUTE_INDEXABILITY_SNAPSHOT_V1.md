# DrKhaleej Route Indexability Snapshot V1

## Purpose

This snapshot records the fast-launch route indexability state after `SEO-LAUNCH-GATE-A`.

It is documentation and validation support only. It does not approve new routes, database publishing, imported provider activation, ads rendering, offers rendering, reviews, booking, payments, or provider dashboard work. Humanity has tried launching everything at once often enough; this project can suffer a smaller, more useful amount of chaos.

## Source of truth

| Surface | Source |
| --- | --- |
| Static SEO route registry | `src/lib/seo/page-registry.ts` |
| Static sitemap output | `src/app/sitemap.ts` via `listSitemapEligibleSeoPageDefinitions()` |
| Static metadata and robots | `src/lib/seo/metadata.ts` via `buildLocalizedMetadata()` |
| Public robots file | `src/app/robots.ts` |
| LLM route declaration | `public/llms.txt` |
| Imported doctor sitemap guard | `src/server/public/import-sitemap.ts` |
| Imported doctor profile guard | `src/server/public/import-doctor-profile-guard.ts` |

## Static public route snapshot

Canonical and hreflang are generated through the shared localized metadata helper for every supported locale/country pair. Static routes that are not sitemap-ready receive `noindex, follow` metadata while remaining crawlable enough for internal navigation and future promotion.

| Route | Localized URLs | Index policy | Readiness | Sitemap | Robots | Snapshot decision | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | `/en/om`, `/ar/om` | `index` | `ready` | included | default indexable | index-ready | Keep as launch root. |
| `/doctors` | `/en/om/doctors`, `/ar/om/doctors` | `index` | `ready` | included | default indexable | index-ready | Bind reviewed public data and watch thin-listing signals. |
| `/centers` | `/en/om/centers`, `/ar/om/centers` | `index` | `ready` | included | default indexable | index-ready | Keep as trust directory. |
| `/labs` | `/en/om/labs`, `/ar/om/labs` | `index` | `ready` | included | default indexable | index-ready | Keep as trust directory. |
| `/pharmacies` | `/en/om/pharmacies`, `/ar/om/pharmacies` | `index` | `ready` | included | default indexable | index-ready | Add imported pharmacy profile guard before profile sitemap expansion. |
| `/hospitals` | `/en/om/hospitals`, `/ar/om/hospitals` | `index` | `ready` | included | default indexable | index-ready | Add imported hospital profile guard before profile sitemap expansion. |
| `/services` | `/en/om/services`, `/ar/om/services` | `index` | `ready` | included | default indexable | index-ready | Keep as core service hub; money pages remain gated separately. |
| `/for-providers` | `/en/om/for-providers`, `/ar/om/for-providers` | `index` | `ready` | included | default indexable | index-ready | Keep as provider acquisition page. |
| `/dental` | `/en/om/dental`, `/ar/om/dental` | `noindex_until_ready` | `needs_content` | excluded | `noindex, follow` | sitemap-excluded | Promote only after real dentist/dental clinic data and local intro/FAQ/linking are ready. |
| `/beauty` | `/en/om/beauty`, `/ar/om/beauty` | `noindex_until_ready` | `needs_content` | excluded | `noindex, follow` | sitemap-excluded | Promote only after beauty/aesthetic provider data and safety copy are ready. |
| `/offers` | `/en/om/offers`, `/ar/om/offers` | `noindex_until_ready` | `blocked` | excluded | `noindex, follow` | sitemap-excluded | Keep blocked until the official offers engine and offer-claims gate exist. |
| `/pet-clinics` | `/en/om/pet-clinics`, `/ar/om/pet-clinics` | `noindex_until_ready` | `blocked` | excluded | `noindex, follow` | sitemap-excluded | Out of fast healthcare launch unless explicitly reapproved. |
| `/pet-shops` | `/en/om/pet-shops`, `/ar/om/pet-shops` | `noindex_until_ready` | `blocked` | excluded | `noindex, follow` | sitemap-excluded | Out of fast healthcare launch unless explicitly reapproved. |
| `/search` | `/en/om/search`, `/ar/om/search` | `noindex_until_ready` | `needs_content` | excluded | `noindex, follow` | sitemap-excluded | Keep as utility route until real result pages and no thin-search policy exist. |

## Dynamic imported provider route snapshot

| Route family | Example canonical pattern | Public route status | Sitemap status | Indexability status | Snapshot decision | Next action |
| --- | --- | --- | --- | --- | --- | --- |
| Imported doctor profile | `/en/om/doctor/{slug}` and `/ar/om/doctor/{slug}` | route guard exists | allowed only through guarded import sitemap rows | allowed only when queue metadata is `index`, `included`, exact canonical match, and approved candidate exists | guarded index path exists | Use for a small reviewed GP/doctor batch only. |
| Imported pharmacy profile | `/en/om/pharmacies/{slug}` and `/ar/om/pharmacies/{slug}` | not yet guarded | blocked | blocked | not launch-ready | Build `PROFILE-GATE-B imported-pharmacy-route-guard-v1`. |
| Imported hospital profile | `/en/om/hospitals/{slug}` and `/ar/om/hospitals/{slug}` | not yet guarded | blocked | blocked | not launch-ready | Build `PROFILE-GATE-C imported-hospital-route-guard-v1`. |
| Imported lab profile | `/en/om/labs/{slug}` and `/ar/om/labs/{slug}` | not yet guarded | blocked | blocked | future | Defer until pharmacy/hospital guards pass. |
| Imported center profile | `/en/om/center/{slug}` and `/ar/om/center/{slug}` | existing center detail foundation only | not part of fast import sitemap expansion | gated by existing public data | partial | Do not expand imported center sitemap in the first clean launch batch. |

## Launch sitemap allowlist

Fast-launch sitemap surfaces are limited to:

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
- guarded imported doctor profile URLs only when `import_publish_queue` says `index`, `included`, `sitemap_included: true`, `robots_policy: index`, and the canonical path is exact.

## Blocked from first clean launch sitemap

The following are intentionally excluded until real data/content/claim gates exist:

- Dental and beauty money hubs.
- Offers route and offer cards.
- Search utility route.
- Pet clinic and pet shop legacy routes.
- Pharmacy, hospital, lab, and imported center profile sitemap entries.
- Area/service/specialty programmatic pages.
- Article CMS and generated article pages.
- Review, booking, payment, and provider dashboard routes.

## First launch decision

The next implementation PR should be `SEO-LAUNCH-GATE-C template-import-contract-v1` unless a route snapshot discrepancy is found by CI. After that, imported pharmacy and hospital profile guards can be built without polluting the sitemap with half-born URLs, which is apparently a revolutionary idea on the modern web.
