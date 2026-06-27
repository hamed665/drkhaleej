# DrKhaleej Route Indexability Snapshot V1

## Purpose

This snapshot records the fast-launch route indexability state after `PROFILE-SMOKE-A public-import-profile-smoke-v1`.

It is documentation and validation support only. It does not approve new routes, database publishing, ads rendering, offers rendering, public comments, ratings, appointment workflows, payments, or provider dashboard work. Humanity has tried launching everything at once often enough; this project can suffer a smaller, more useful amount of chaos.

## Source of truth

| Surface | Source |
| --- | --- |
| Static SEO route registry | `src/lib/seo/page-registry.ts` |
| Static sitemap output | `src/app/sitemap.ts` via `listSitemapEligibleSeoPageDefinitions()` |
| Static metadata and robots | `src/lib/seo/metadata.ts` via `buildLocalizedMetadata()` |
| Public robots file | `src/app/robots.ts` |
| LLM route declaration | `public/llms.txt` |
| Import publish readiness audit | `src/server/admin/import-publish-readiness-audit.ts` |
| Imported doctor profile guard | `src/server/public/import-doctor-profile-guard.ts` |
| Imported pharmacy profile guard | `src/server/public/import-pharmacy-profile-guard.ts` |
| Imported hospital profile guard | `src/server/public/import-hospital-profile-guard.ts` |
| Imported profile sitemap guard | `src/server/public/import-sitemap.ts` |
| Imported profile smoke validator | `scripts/import/check-public-import-profile-smoke.mjs` |

## Static public route snapshot

Canonical and hreflang are generated through the shared localized metadata helper for every supported locale/country pair. Static routes that are not sitemap-ready receive `noindex, follow` metadata while remaining crawlable enough for internal navigation and future promotion.

| Route | Localized URLs | Index policy | Readiness | Sitemap | Robots | Snapshot decision | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | `/en/om`, `/ar/om` | `index` | `ready` | included | default indexable | index-ready | Keep as launch root. |
| `/doctors` | `/en/om/doctors`, `/ar/om/doctors` | `index` | `ready` | included | default indexable | index-ready | Bind reviewed public data and watch thin-listing signals. |
| `/centers` | `/en/om/centers`, `/ar/om/centers` | `index` | `ready` | included | default indexable | index-ready | Keep as trust directory. |
| `/labs` | `/en/om/labs`, `/ar/om/labs` | `index` | `ready` | included | default indexable | index-ready | Keep as trust directory while lab profile import remains blocked. |
| `/pharmacies` | `/en/om/pharmacies`, `/ar/om/pharmacies` | `index` | `ready` | included | default indexable | index-ready | Profile pages can index only through the reviewed import profile gates. |
| `/hospitals` | `/en/om/hospitals`, `/ar/om/hospitals` | `index` | `ready` | included | default indexable | index-ready | Profile pages can index only through the reviewed import profile gates. |
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
| Imported doctor profile | `/en/om/doctor/{slug}` and `/ar/om/doctor/{slug}` | route guard exists through `getPublicImportDoctorProfile()` | allowed only through guarded import sitemap rows | allowed only when queue metadata is `index`, `included`, exact canonical match, approved candidate exists, source evidence exists, contact/map evidence exists, and Oman geo evidence exists | guarded index path exists | Use for a small reviewed doctor batch only. |
| Imported pharmacy profile | `/en/om/pharmacies/{slug}` and `/ar/om/pharmacies/{slug}` | `PROFILE-GATE-B imported-pharmacy-profile-guard-v1` and `PROFILE-GATE-C public-pharmacy-profile-route-wrapper-v1` are active | allowed only through guarded import sitemap rows | allowed only when queue metadata is `index`, `included`, exact canonical match, approved candidate exists, source evidence exists, contact/map evidence exists, and Oman geo evidence exists | guarded index path exists | Use for a small reviewed pharmacy batch only. |
| Imported hospital profile | `/en/om/hospitals/{slug}` and `/ar/om/hospitals/{slug}` | `PROFILE-GATE-D imported-hospital-profile-guard-v1` and `PROFILE-GATE-E public-hospital-profile-route-wrapper-v1` are active | allowed only through guarded import sitemap rows | allowed only when queue metadata is `index`, `included`, exact canonical match, approved candidate exists, source evidence exists, contact/map evidence exists, and Oman geo evidence exists | guarded index path exists | Use for a small reviewed hospital batch only. |
| Imported lab profile | `/en/om/labs/{slug}` and `/ar/om/labs/{slug}` | not yet guarded | blocked | blocked | future | Build lab guard only after the first doctor/pharmacy/hospital batch passes QA. |
| Imported center profile | `/en/om/center/{slug}` and `/ar/om/center/{slug}` | existing center detail foundation only | not part of fast import sitemap expansion | gated by existing public data | partial | Do not expand imported center sitemap in the first clean launch batch. |

## Import sitemap caps and smoke gates

`SITEMAP-GUARD-B import-sitemap-family-caps-v1` is active in `src/server/public/import-sitemap.ts`.

Current caps:

- doctor cap: 3000
- pharmacy cap: 1500
- hospital cap: 500

`PROFILE-SMOKE-A public-import-profile-smoke-v1` is active through `scripts/import/check-public-import-profile-smoke.mjs` and `pnpm import:profile-smoke:validate` inside `seo:check`.

The smoke check keeps the doctor, pharmacy, and hospital guard/route/sitemap contracts aligned. This matters because route drift is the software version of leaving the clinic door open and hoping the spreadsheets behave themselves.

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
- guarded imported doctor profile URLs only when `import_publish_queue` says `index`, `included`, `sitemap_included: true`, `robots_policy: index`, the canonical path is exact, the candidate is approved, and required evidence exists.
- guarded imported pharmacy profile URLs only when `import_publish_queue` says `index`, `included`, `sitemap_included: true`, `robots_policy: index`, the canonical path is exact, the candidate is approved, and required evidence exists.
- guarded imported hospital profile URLs only when `import_publish_queue` says `index`, `included`, `sitemap_included: true`, `robots_policy: index`, the canonical path is exact, the candidate is approved, and required evidence exists.

## Blocked from first clean launch sitemap

The following are intentionally excluded until real data/content/claim gates exist:

- Dental and beauty money hubs.
- Offers route and offer cards.
- Search utility route.
- Pet clinic and pet shop legacy routes.
- Lab and imported center profile sitemap entries.
- Area/service/specialty programmatic pages.
- Article CMS and generated article pages.
- Public comments, ratings, appointment workflows, payment, and provider dashboard routes.

## First launch decision

The next implementation step should be a real import batch rehearsal using `IMPORT-QA-A`, `SITEMAP-GUARD-B`, and `PROFILE-SMOKE-A` together before any broad provider import goes public. In plainer terms: test the pipes before pouring the entire healthcare internet through them, a radical doctrine previously unknown to humanity.
