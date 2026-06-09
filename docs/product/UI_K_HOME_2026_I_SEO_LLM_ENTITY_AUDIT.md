# UI-K-HOME-2026-I — Homepage SEO/LLM Entity & Metadata Audit

## 1. Final scope

This PR is limited to homepage SEO/LLM entity clarity and localized metadata for the existing `/en/om` and `/ar/om` homepage routes.

Implemented scope:

- Updated localized homepage title and description copy.
- Aligned homepage Open Graph and Twitter/social title and description through the existing metadata helper.
- Added a compact visible homepage entity clarity strip.
- Audited canonical, hreflang, and index/noindex behavior for `/`, `/en/om`, and `/ar/om`.
- Documented structured data, Articles, OG image, route-generation, and infrastructure deferrals.

Out of scope:

- No route generation.
- No schema or JSON-LD.
- No sitemap, robots, or `llms.txt` changes.
- No database, Supabase, RLS, migration, API, package, seed, or runtime keyword ingestion changes.

## 2. Files changed

- `src/app/[locale]/[country]/page.tsx`
- `src/components/home/HomeEntityClarity2026.tsx`
- `src/components/home/HomePage2026HeaderHero.tsx`
- `src/styles/dm2026-home.css`
- `docs/product/UI_K_HOME_2026_I_SEO_LLM_ENTITY_AUDIT.md`

## 3. Spreadsheet note

No uploaded spreadsheet was required, imported, read, transformed, or committed. The approved SEO/LLM vocabulary and copy were embedded directly in the task prompt and used manually within the narrow homepage scope.

## 4. Homepage metadata decisions

The homepage metadata now uses the existing localized metadata helper so `/en/om` and `/ar/om` receive the established canonical, language alternate, Open Graph, and Twitter metadata structure.

The homepage remains server-rendered through the existing localized app route. The root `/` route remains a redirect to `/en/om` and does not require standalone homepage metadata in this PR.

## 5. English/Arabic title and description used

English homepage title:

`DrMuscat | Healthcare Discovery in Oman`

English homepage description:

`Explore doctors, clinics, labs, pharmacies, beauty centers, pet clinics, wellness providers and offers in Oman. Public discovery only, not medical advice.`

Arabic homepage title:

`DrMuscat | اكتشاف الرعاية الصحية في عُمان`

Arabic homepage description:

`استكشف الأطباء والعيادات والمختبرات والصيدليات ومراكز التجميل والعيادات البيطرية ومقدمي خدمات الرفاهية والعروض في عُمان. اكتشاف عام فقط، وليس نصيحة طبية.`

## 6. Open Graph / social metadata decisions

Open Graph title and description are aligned with safe homepage entity language.

English Open Graph title:

`DrMuscat | Healthcare Discovery in Oman`

English Open Graph description:

`Explore healthcare, beauty, wellness and pet care providers across Oman. Public discovery only, not medical advice.`

Arabic Open Graph title:

`DrMuscat | اكتشاف الرعاية الصحية في عُمان`

Arabic Open Graph description:

`استكشف مقدمي الرعاية الصحية والتجميل والرفاهية ورعاية الحيوانات الأليفة في عُمان. اكتشاف عام فقط، وليس نصيحة طبية.`

Twitter/social metadata is already supported by the existing metadata helper. This PR aligns Twitter title and description with the same safe homepage social metadata text.

## 7. OG image decision

No new OG image was created. No remote or local image asset was added. No existing homepage OG image was found in the localized homepage metadata path, so OG image creation is deferred to a dedicated brand/social preview PR.

## 8. Entity clarity strip summary

A compact homepage-visible entity clarity strip was added after the search/safety hero area and before the Featured Provider Board.

The strip uses three cards only:

1. Public discovery / اكتشاف عام
2. Provider information / معلومات مقدمي الخدمة
3. Safe boundaries / حدود آمنة

The component is server-rendered, CSS-only, mobile-friendly, RTL-safe, and does not use images, remote assets, heavy animation, fake statistics, ratings, provider counts, quality claims, or booking claims.

## 9. SEO/LLM entity vocabulary used

Safe concepts used in metadata and visible copy:

- healthcare discovery
- public discovery
- provider information
- doctors
- clinics
- labs
- pharmacies
- beauty centers
- pet clinics
- wellness providers
- services
- offers
- Oman
- not medical advice
- confirm details directly with providers
- contact actions when available
- safe boundaries

Safe Arabic concepts used:

- اكتشاف الرعاية الصحية
- اكتشاف عام
- الأطباء
- العيادات
- المختبرات
- الصيدليات
- مراكز التجميل
- العيادات البيطرية
- مقدمي خدمات الرفاهية
- العروض
- عُمان
- ليس نصيحة طبية
- تأكيد التفاصيل مباشرة مع مقدمي الخدمة
- طرق التواصل عند توفرها
- حدود آمنة

## 10. Medical-safe wording rules

This PR avoids unsafe or unsupported wording, including:

- best/top/cheapest ranking language
- guaranteed care or guaranteed offers
- verified medical quality claims
- official medical authority claims
- patient rating or review claims
- fake provider counts
- fake availability
- diagnosis, treatment recommendation, cure, or outcome guarantee language
- emergency care claims
- booking language not supported by the product scope

The copy stays within public discovery, provider information, safe boundaries, and direct-provider-confirmation language.

## 11. Canonical/hreflang/index audit notes

Audited routes:

- `/`
- `/en/om`
- `/ar/om`

Findings:

- `/` remains an existing permanent redirect to `/en/om`; no root redirect file was changed.
- `/en/om` and `/ar/om` are served by the localized homepage route.
- The existing localized metadata helper provides canonical URLs for the localized route and language alternates for English, Arabic, and `x-default`.
- No homepage noindex metadata was found or added.
- `/en/om` and `/ar/om` should remain indexable under the current app metadata behavior; no `robots` noindex metadata was emitted in the production HTML curl QA.

No broader canonical/hreflang infrastructure rewrite was required.

## 12. Structured data deferral decision

Structured data is intentionally deferred to a dedicated governance PR because DrMuscat is a healthcare discovery platform and schema must be handled carefully.

No structured data or JSON-LD was added in this PR, including no FAQPage, WebSite, Organization, MedicalOrganization, MedicalClinic, Physician, Hospital, Pharmacy, Review, AggregateRating, Offer, Article, or MedicalWebPage schema.

## 13. Articles deferral decision

Articles are intentionally deferred to a Medical Editorial Foundation PR covering author/reviewer policy, reviewed dates, source policy, medical disclaimer patterns, editorial workflow, schema governance, and Arabic/English content rules.

No Articles, Article routes, Article cards, Article metadata, or keyword-list content generation were added.

## 14. No runtime keyword/page/route generation confirmation

No runtime keyword ingestion, route generation, page generation, sitemap generation, CMS row creation, seed row creation, or spreadsheet import was performed.

## 15. No DB/API/Supabase/SEO infra/package changes confirmation

This PR does not change:

- database files
- Supabase files
- RLS policies
- migrations
- API routes
- sitemap files
- robots files
- `llms.txt`
- schema/JSON-LD files
- route generation scripts
- `package.json`
- `pnpm-lock.yaml`
- seed files
- generated DB types

## 16. Validation results

Validation commands run for this PR:

- `git status --short` showed only the intended scoped files as modified or untracked before staging.
- `pnpm lint` passed with pre-existing warnings in prototype/public detail files.
- `pnpm typecheck` passed.
- `pnpm build` passed.
- `pnpm routes:check` passed.
- `pnpm seo:check` passed.
- Production server curl QA confirmed `/` returns a `308 Permanent Redirect` to `/en/om`.
- Production server curl QA confirmed `/en/om` and `/ar/om` include the updated metadata, Open Graph/social copy, canonical links, language alternates, and entity clarity text.

## 17. Manual QA notes

Manual QA checklist:

- `/` still redirects to `/en/om` based on the existing `permanentRedirect('/en/om')` implementation.
- `/en/om` remains the English localized homepage route.
- `/ar/om` remains the Arabic localized homepage route.
- English metadata uses approved medical-safe copy.
- Arabic metadata uses approved medical-safe copy.
- Open Graph and Twitter/social title and description use safe homepage entity language.
- Entity clarity strip appears before Featured Provider Board.
- Entity clarity strip is compact, premium, responsive, and RTL-safe by design.
- FAQ and Trust/Safety components remain mounted after the existing homepage sections.
- Header/footer and root redirect implementation were not changed.
- No schema/JSON-LD was added.
- No Articles were added.
- No DB/API/Supabase/RLS/migration/sitemap/robots/llms/package changes were made.
- No XLSX file was committed.

## 18. Next PR recommendation

Recommended next PR:

`UI-K-SEO-2026-A — Structured Data Governance`

Alternative approved future candidate:

`UI-K-SUPPORT-2026-A — WhatsApp / Support Contact Foundation`
